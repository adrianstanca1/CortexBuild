import { Request, Response } from 'express';
import { Database } from '../database.js';
import { QueryResult } from 'mysql2';

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'approval' | 'notification' | 'automation' | 'condition';
  config: any;
  assignee?: string;
  conditions?: any;
  nextSteps: string[];
  timeoutMinutes?: number;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  triggerType: string;
  steps: WorkflowStep[];
  isActive: boolean;
  tenantId: string;
}

export interface WorkflowInstance {
  id: string;
  templateId: string;
  entityType: string;
  entityId: string;
  currentStep: string;
  status: 'pending' | 'active' | 'completed' | 'failed' | 'paused';
  context: any;
  assignedTo?: string;
  startedAt: Date;
  completedAt?: Date;
  tenantId: string;
}

export class WorkflowEngine {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  /**
   * Create a new workflow template
   */
  async createTemplate(template: Omit<WorkflowTemplate, 'id'>): Promise<string> {
    const id = crypto.randomUUID();

    await this.db.executeQuery(`
      INSERT INTO workflow_templates 
      (id, name, description, trigger_type, steps, is_active, tenant_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      id,
      template.name,
      template.description,
      template.triggerType,
      JSON.stringify(template.steps),
      template.isActive,
      template.tenantId
    ]);

    return id;
  }

  /**
   * Start a workflow instance
   */
  async startWorkflow(
    templateId: string,
    entityType: string,
    entityId: string,
    tenantId: string,
    context: any = {}
  ): Promise<string> {
    const template = await this.getTemplate(templateId, tenantId);
    if (!template || !template.isActive) {
      throw new Error('Workflow template not found or inactive');
    }

    const instanceId = crypto.randomUUID();
    const firstStep = template.steps[0];

    await this.db.executeQuery(`
      INSERT INTO workflow_instances
      (id, template_id, entity_type, entity_id, current_step, status, context, assigned_to, started_at, tenant_id)
      VALUES (?, ?, ?, ?, ?, 'active', ?, ?, NOW(), ?)
    `, [
      instanceId,
      templateId,
      entityType,
      entityId,
      firstStep.id,
      JSON.stringify(context),
      firstStep.assignee,
      tenantId
    ]);

    // Log workflow start
    await this.logWorkflowEvent(instanceId, 'started', `Workflow started: ${template.name}`, tenantId);

    // Execute first step
    await this.executeStep(instanceId, firstStep, tenantId);

    return instanceId;
  }

  /**
   * Execute a workflow step
   */
  async executeStep(instanceId: string, step: WorkflowStep, tenantId: string): Promise<void> {
    const instance = await this.getInstance(instanceId, tenantId);
    if (!instance) {
      throw new Error('Workflow instance not found');
    }

    switch (step.type) {
      case 'approval':
        await this.handleApprovalStep(instance, step, tenantId);
        break;
      case 'notification':
        await this.handleNotificationStep(instance, step, tenantId);
        break;
      case 'automation':
        await this.handleAutomationStep(instance, step, tenantId);
        break;
      case 'condition':
        await this.handleConditionStep(instance, step, tenantId);
        break;
      default:
        throw new Error(`Unknown step type: ${step.type}`);
    }

    await this.logWorkflowEvent(instanceId, 'step_executed', `Step executed: ${step.name}`, tenantId);
  }

  /**
   * Handle approval steps
   */
  private async handleApprovalStep(instance: WorkflowInstance, step: WorkflowStep, tenantId: string): Promise<void> {
    // Create approval request
    await this.db.executeQuery(`
      INSERT INTO workflow_approvals
      (id, workflow_instance_id, step_id, assignee, status, created_at, tenant_id)
      VALUES (?, ?, ?, ?, 'pending', NOW(), ?)
    `, [
      crypto.randomUUID(),
      instance.id,
      step.id,
      step.assignee,
      tenantId
    ]);

    // Set timeout if specified
    if (step.timeoutMinutes) {
      setTimeout(async () => {
        await this.handleStepTimeout(instance.id, step.id, tenantId);
      }, step.timeoutMinutes * 60 * 1000);
    }
  }

  /**
   * Handle notification steps
   */
  private async handleNotificationStep(instance: WorkflowInstance, step: WorkflowStep, tenantId: string): Promise<void> {
    const notification = {
      id: crypto.randomUUID(),
      type: step.config.notificationType || 'workflow',
      title: step.config.title || 'Workflow Notification',
      message: this.processTemplate(step.config.message, instance.context),
      recipient: step.assignee,
      workflowInstanceId: instance.id,
      tenantId
    };

    await this.db.executeQuery(`
      INSERT INTO notifications
      (id, type, title, message, recipient_id, metadata, created_at, tenant_id)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)
    `, [
      notification.id,
      notification.type,
      notification.title,
      notification.message,
      notification.recipient,
      JSON.stringify({ workflowInstanceId: instance.id }),
      tenantId
    ]);

    // Move to next step immediately
    await this.moveToNextStep(instance.id, step, tenantId);
  }

  /**
   * Handle automation steps
   */
  private async handleAutomationStep(instance: WorkflowInstance, step: WorkflowStep, tenantId: string): Promise<void> {
    try {
      // Execute automation based on configuration
      switch (step.config.action) {
        case 'update_status':
          await this.updateEntityStatus(
            instance.entityType,
            instance.entityId,
            step.config.newStatus,
            tenantId
          );
          break;
        case 'send_email':
          await this.sendEmailNotification(step.config, instance.context, tenantId);
          break;
        case 'create_task':
          await this.createTask(step.config, instance.context, tenantId);
          break;
        default:
          console.warn(`Unknown automation action: ${step.config.action}`);
      }

      // Move to next step
      await this.moveToNextStep(instance.id, step, tenantId);
    } catch (error) {
      console.error('Automation step failed:', error);
      await this.logWorkflowEvent(instance.id, 'step_failed', `Automation step failed: ${error}`, tenantId);
      await this.failWorkflow(instance.id, `Automation step failed: ${error}`, tenantId);
    }
  }

  /**
   * Handle condition steps
   */
  private async handleConditionStep(instance: WorkflowInstance, step: WorkflowStep, tenantId: string): Promise<void> {
    const condition = step.conditions;
    const context = instance.context;
    
    let conditionMet = false;

    // Evaluate condition
    switch (condition.operator) {
      case 'equals':
        conditionMet = context[condition.field] === condition.value;
        break;
      case 'greater_than':
        conditionMet = parseFloat(context[condition.field]) > parseFloat(condition.value);
        break;
      case 'less_than':
        conditionMet = parseFloat(context[condition.field]) < parseFloat(condition.value);
        break;
      case 'contains':
        conditionMet = context[condition.field]?.includes(condition.value);
        break;
      default:
        break;
    }

    // Determine next steps based on condition
    const nextStepId = conditionMet ? condition.trueStep : condition.falseStep;
    if (nextStepId) {
      const template = await this.getTemplate(instance.templateId, tenantId);
      const nextStep = template?.steps.find(s => s.id === nextStepId);
      if (nextStep) {
        await this.updateCurrentStep(instance.id, nextStep.id, tenantId);
        await this.executeStep(instance.id, nextStep, tenantId);
      }
    } else {
      await this.completeWorkflow(instance.id, tenantId);
    }
  }

  /**
   * Approve a workflow step
   */
  async approveStep(instanceId: string, stepId: string, approverId: string, comments?: string, tenantId?: string): Promise<void> {
    await this.db.executeQuery(`
      UPDATE workflow_approvals
      SET status = 'approved', approved_by = ?, approved_at = NOW(), comments = ?
      WHERE workflow_instance_id = ? AND step_id = ? AND tenant_id = ?
    `, [approverId, comments, instanceId, stepId, tenantId]);

    const instance = await this.getInstance(instanceId, tenantId!);
    const template = await this.getTemplate(instance!.templateId, tenantId!);
    const currentStep = template?.steps.find(s => s.id === stepId);

    if (currentStep) {
      await this.moveToNextStep(instanceId, currentStep, tenantId!);
    }

    await this.logWorkflowEvent(instanceId, 'approved', `Step approved by ${approverId}`, tenantId!);
  }

  /**
   * Reject a workflow step
   */
  async rejectStep(instanceId: string, stepId: string, rejectedBy: string, reason: string, tenantId: string): Promise<void> {
    await this.db.executeQuery(`
      UPDATE workflow_approvals
      SET status = 'rejected', rejected_by = ?, rejected_at = NOW(), comments = ?
      WHERE workflow_instance_id = ? AND step_id = ? AND tenant_id = ?
    `, [rejectedBy, reason, instanceId, stepId, tenantId]);

    await this.logWorkflowEvent(instanceId, 'rejected', `Step rejected by ${rejectedBy}: ${reason}`, tenantId);
    await this.failWorkflow(instanceId, `Workflow rejected: ${reason}`, tenantId);
  }

  /**
   * Move to next step in workflow
   */
  private async moveToNextStep(instanceId: string, currentStep: WorkflowStep, tenantId: string): Promise<void> {
    if (currentStep.nextSteps.length === 0) {
      await this.completeWorkflow(instanceId, tenantId);
      return;
    }

    const nextStepId = currentStep.nextSteps[0]; // For now, take first next step
    const instance = await this.getInstance(instanceId, tenantId);
    const template = await this.getTemplate(instance!.templateId, tenantId);
    const nextStep = template?.steps.find(s => s.id === nextStepId);

    if (nextStep) {
      await this.updateCurrentStep(instanceId, nextStep.id, tenantId);
      await this.executeStep(instanceId, nextStep, tenantId);
    } else {
      await this.completeWorkflow(instanceId, tenantId);
    }
  }

  /**
   * Complete workflow
   */
  private async completeWorkflow(instanceId: string, tenantId: string): Promise<void> {
    await this.db.executeQuery(`
      UPDATE workflow_instances
      SET status = 'completed', completed_at = NOW()
      WHERE id = ? AND tenant_id = ?
    `, [instanceId, tenantId]);

    await this.logWorkflowEvent(instanceId, 'completed', 'Workflow completed successfully', tenantId);
  }

  /**
   * Fail workflow
   */
  private async failWorkflow(instanceId: string, reason: string, tenantId: string): Promise<void> {
    await this.db.executeQuery(`
      UPDATE workflow_instances
      SET status = 'failed'
      WHERE id = ? AND tenant_id = ?
    `, [instanceId, tenantId]);

    await this.logWorkflowEvent(instanceId, 'failed', reason, tenantId);
  }

  /**
   * Handle step timeout
   */
  private async handleStepTimeout(instanceId: string, stepId: string, tenantId: string): Promise<void> {
    const result = await this.db.executeQuery(`
      SELECT status FROM workflow_approvals
      WHERE workflow_instance_id = ? AND step_id = ? AND tenant_id = ?
    `, [instanceId, stepId, tenantId]) as QueryResult;

    if (result.length > 0 && (result as any)[0].status === 'pending') {
      await this.failWorkflow(instanceId, 'Step timeout exceeded', tenantId);
    }
  }

  /**
   * Get workflow template
   */
  private async getTemplate(templateId: string, tenantId: string): Promise<WorkflowTemplate | null> {
    const result = await this.db.executeQuery(`
      SELECT * FROM workflow_templates
      WHERE id = ? AND tenant_id = ?
    `, [templateId, tenantId]) as QueryResult;

    if (result.length === 0) return null;

    const row = (result as any)[0];
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      triggerType: row.trigger_type,
      steps: JSON.parse(row.steps),
      isActive: row.is_active,
      tenantId: row.tenant_id
    };
  }

  /**
   * Get workflow instance
   */
  private async getInstance(instanceId: string, tenantId: string): Promise<WorkflowInstance | null> {
    const result = await this.db.executeQuery(`
      SELECT * FROM workflow_instances
      WHERE id = ? AND tenant_id = ?
    `, [instanceId, tenantId]) as QueryResult;

    if (result.length === 0) return null;

    const row = (result as any)[0];
    return {
      id: row.id,
      templateId: row.template_id,
      entityType: row.entity_type,
      entityId: row.entity_id,
      currentStep: row.current_step,
      status: row.status,
      context: JSON.parse(row.context),
      assignedTo: row.assigned_to,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      tenantId: row.tenant_id
    };
  }

  /**
   * Update current step
   */
  private async updateCurrentStep(instanceId: string, stepId: string, tenantId: string): Promise<void> {
    await this.db.executeQuery(`
      UPDATE workflow_instances
      SET current_step = ?
      WHERE id = ? AND tenant_id = ?
    `, [stepId, instanceId, tenantId]);
  }

  /**
   * Log workflow event
   */
  private async logWorkflowEvent(instanceId: string, eventType: string, description: string, tenantId: string): Promise<void> {
    await this.db.executeQuery(`
      INSERT INTO workflow_events
      (id, workflow_instance_id, event_type, description, created_at, tenant_id)
      VALUES (?, ?, ?, ?, NOW(), ?)
    `, [crypto.randomUUID(), instanceId, eventType, description, tenantId]);
  }

  /**
   * Process template variables
   */
  private processTemplate(template: string, context: any): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return context[key] || match;
    });
  }

  /**
   * Update entity status
   */
  private async updateEntityStatus(entityType: string, entityId: string, newStatus: string, tenantId: string): Promise<void> {
    let table: string | null = null;
    
    if (entityType === 'project') {
      table = 'projects';
    } else if (entityType === 'task') {
      table = 'tasks';
    } else if (entityType === 'expense') {
      table = 'expenses';
    }

    if (table) {
      await this.db.executeQuery(`
        UPDATE ${table}
        SET status = ?, updated_at = NOW()
        WHERE id = ? AND tenant_id = ?
      `, [newStatus, entityId, tenantId]);
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(config: any, context: any, tenantId: string): Promise<void> {
    // Implementation would integrate with email service
    console.log('Sending email notification:', {
      to: config.recipient,
      subject: this.processTemplate(config.subject, context),
      body: this.processTemplate(config.body, context),
      tenantId
    });
  }

  /**
   * Create task from workflow
   */
  private async createTask(config: any, context: any, tenantId: string): Promise<void> {
    await this.db.executeQuery(`
      INSERT INTO tasks
      (id, title, description, project_id, assigned_to, priority, due_date, status, created_at, tenant_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), ?)
    `, [
      crypto.randomUUID(),
      this.processTemplate(config.title, context),
      this.processTemplate(config.description, context),
      context.projectId,
      config.assignee,
      config.priority || 'medium',
      config.dueDate,
      tenantId
    ]);
  }

  /**
   * Get workflow instances for tenant
   */
  async getWorkflowInstances(tenantId: string, filters: any = {}): Promise<WorkflowInstance[]> {
    let query = `
      SELECT wi.*, wt.name as template_name
      FROM workflow_instances wi
      JOIN workflow_templates wt ON wi.template_id = wt.id
      WHERE wi.tenant_id = ?
    `;
    const params: any[] = [tenantId];

    if (filters.status) {
      query += ' AND wi.status = ?';
      params.push(filters.status);
    }

    if (filters.entityType) {
      query += ' AND wi.entity_type = ?';
      params.push(filters.entityType);
    }

    query += ' ORDER BY wi.started_at DESC';

    const result = await this.db.executeQuery(query, params) as QueryResult;
    
    return (result as any[]).map(row => ({
      id: row.id,
      templateId: row.template_id,
      entityType: row.entity_type,
      entityId: row.entity_id,
      currentStep: row.current_step,
      status: row.status,
      context: JSON.parse(row.context),
      assignedTo: row.assigned_to,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      tenantId: row.tenant_id
    }));
  }

  /**
   * Express middleware for workflow operations
   */
  middleware() {
    return {
      /**
       * Start workflow middleware
       */
      startWorkflow: async (req: Request, res: Response) => {
        try {
          const { templateId, entityType, entityId, context } = req.body;
          const tenantId = (req as any).tenantId;

          const instanceId = await this.startWorkflow(templateId, entityType, entityId, tenantId, context);

          res.json({
            success: true,
            instanceId,
            message: 'Workflow started successfully'
          });
        } catch (error) {
          console.error('Start workflow error:', error);
          res.status(500).json({ error: 'Failed to start workflow' });
        }
      },

      /**
       * Approve step middleware
       */
      approveStep: async (req: Request, res: Response) => {
        try {
          const { instanceId, stepId } = req.params;
          const { comments } = req.body;
          const userId = (req as any).user.id;
          const tenantId = (req as any).tenantId;

          await this.approveStep(instanceId, stepId, userId, comments, tenantId);

          res.json({
            success: true,
            message: 'Step approved successfully'
          });
        } catch (error) {
          console.error('Approve step error:', error);
          res.status(500).json({ error: 'Failed to approve step' });
        }
      },

      /**
       * Reject step middleware
       */
      rejectStep: async (req: Request, res: Response) => {
        try {
          const { instanceId, stepId } = req.params;
          const { reason } = req.body;
          const userId = (req as any).user.id;
          const tenantId = (req as any).tenantId;

          await this.rejectStep(instanceId, stepId, userId, reason, tenantId);

          res.json({
            success: true,
            message: 'Step rejected successfully'
          });
        } catch (error) {
          console.error('Reject step error:', error);
          res.status(500).json({ error: 'Failed to reject step' });
        }
      }
    };
  }
}