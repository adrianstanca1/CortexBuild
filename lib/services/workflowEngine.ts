/**
 * Workflow Engine
 * Executes workflow automations with webhooks, scheduling, and error handling
 */

import axios from 'axios';

export interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'ai' | 'procore' | 'integration';
  label: string;
  config: Record<string, any>;
  position?: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  condition?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  status: 'active' | 'paused' | 'draft';
  schedule?: string; // Cron expression
  webhookUrl?: string;
  createdBy: string;
  companyId: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  error?: string;
  logs: WorkflowLog[];
  context: Record<string, any>;
}

export interface WorkflowLog {
  timestamp: Date;
  nodeId: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  data?: any;
}

class WorkflowEngine {
  private executions: Map<string, WorkflowExecution> = new Map();
  private scheduledWorkflows: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Execute a workflow
   */
  async executeWorkflow(
    workflow: Workflow,
    initialContext: Record<string, any> = {}
  ): Promise<WorkflowExecution> {
    const execution: WorkflowExecution = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      workflowId: workflow.id,
      status: 'running',
      startedAt: new Date(),
      logs: [],
      context: { ...initialContext },
    };

    this.executions.set(execution.id, execution);

    try {
      // Find trigger node
      const triggerNode = workflow.nodes.find(n => n.type === 'trigger');
      if (!triggerNode) {
        throw new Error('No trigger node found in workflow');
      }

      // Execute workflow from trigger
      await this.executeNode(triggerNode, workflow, execution);

      execution.status = 'completed';
      execution.completedAt = new Date();

      this.log(execution, triggerNode.id, 'info', 'Workflow completed successfully');
    } catch (error) {
      execution.status = 'failed';
      execution.completedAt = new Date();
      execution.error = error instanceof Error ? error.message : 'Unknown error';

      this.log(execution, 'system', 'error', 'Workflow failed', { error });
    }

    return execution;
  }

  /**
   * Execute a single node
   */
  private async executeNode(
    node: WorkflowNode,
    workflow: Workflow,
    execution: WorkflowExecution
  ): Promise<any> {
    this.log(execution, node.id, 'info', `Executing ${node.type} node: ${node.label}`);

    let result: any;

    try {
      switch (node.type) {
        case 'trigger':
          result = await this.executeTrigger(node, execution);
          break;
        case 'action':
          result = await this.executeAction(node, execution);
          break;
        case 'condition':
          result = await this.executeCondition(node, execution);
          break;
        case 'ai':
          result = await this.executeAI(node, execution);
          break;
        case 'procore':
          result = await this.executeProcore(node, execution);
          break;
        case 'integration':
          result = await this.executeIntegration(node, execution);
          break;
        default:
          throw new Error(`Unknown node type: ${node.type}`);
      }

      // Update context with result
      if (result !== undefined) {
        execution.context[node.id] = result;
      }

      // Find and execute next nodes
      const nextEdges = workflow.edges.filter(e => e.source === node.id);

      for (const edge of nextEdges) {
        // Check condition if present
        if (edge.condition) {
          const conditionMet = this.evaluateCondition(edge.condition, execution.context);
          if (!conditionMet) {
            this.log(execution, node.id, 'info', `Skipping edge due to condition: ${edge.condition}`);
            continue;
          }
        }

        const nextNode = workflow.nodes.find(n => n.id === edge.target);
        if (nextNode) {
          await this.executeNode(nextNode, workflow, execution);
        }
      }

      return result;
    } catch (error) {
      this.log(execution, node.id, 'error', `Node execution failed`, { error });
      throw error;
    }
  }

  /**
   * Execute trigger node
   */
  private async executeTrigger(node: WorkflowNode, execution: WorkflowExecution): Promise<any> {
    const { config } = node;

    switch (config.triggerType) {
      case 'manual':
        return execution.context.triggerData || {};

      case 'schedule':
        return { triggeredAt: new Date(), type: 'schedule' };

      case 'webhook':
        return execution.context.webhookPayload || {};

      case 'event':
        return execution.context.eventData || {};

      default:
        return {};
    }
  }

  /**
   * Execute action node
   */
  private async executeAction(node: WorkflowNode, execution: WorkflowExecution): Promise<any> {
    const { config } = node;

    switch (config.actionType) {
      case 'email':
        return this.sendEmail(config, execution.context);

      case 'notification':
        return this.sendNotification(config, execution.context);

      case 'http':
        return this.makeHttpRequest(config, execution.context);

      case 'database':
        return this.executeDatabaseAction(config, execution.context);

      case 'delay':
        await new Promise(resolve => setTimeout(resolve, config.duration || 1000));
        return { delayed: true };

      default:
        this.log(execution, node.id, 'warning', `Unknown action type: ${config.actionType}`);
        return {};
    }
  }

  /**
   * Execute condition node
   */
  private async executeCondition(node: WorkflowNode, execution: WorkflowExecution): Promise<boolean> {
    const { config } = node;
    return this.evaluateCondition(config.condition, execution.context);
  }

  /**
   * Execute AI node
   */
  private async executeAI(node: WorkflowNode, execution: WorkflowExecution): Promise<any> {
    const { config } = node;

    // Integrate with AI services (OpenAI, Gemini, Claude)
    try {
      const response = await axios.post('/api/ai/generate', {
        provider: config.provider || 'openai',
        prompt: this.interpolate(config.prompt, execution.context),
        model: config.model,
      });

      return response.data;
    } catch (error) {
      this.log(execution, node.id, 'error', 'AI execution failed', { error });
      throw error;
    }
  }

  /**
   * Execute Procore integration node
   */
  private async executeProcore(node: WorkflowNode, execution: WorkflowExecution): Promise<any> {
    const { config } = node;

    try {
      // Make Procore API request
      const response = await axios({
        method: config.method || 'GET',
        url: `https://api.procore.com${config.endpoint}`,
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json',
        },
        data: config.data,
      });

      return response.data;
    } catch (error) {
      this.log(execution, node.id, 'error', 'Procore API call failed', { error });
      throw error;
    }
  }

  /**
   * Execute integration node (Zapier, Make, etc.)
   */
  private async executeIntegration(node: WorkflowNode, execution: WorkflowExecution): Promise<any> {
    const { config } = node;

    try {
      const response = await axios.post(config.webhookUrl, {
        ...execution.context,
        nodeConfig: config,
      });

      return response.data;
    } catch (error) {
      this.log(execution, node.id, 'error', 'Integration call failed', { error });
      throw error;
    }
  }

  /**
   * Helper: Send email
   */
  private async sendEmail(config: any, context: Record<string, any>): Promise<any> {
    // In production, integrate with email service (SendGrid, AWS SES, etc.)
    console.log('Sending email:', {
      to: this.interpolate(config.to, context),
      subject: this.interpolate(config.subject, context),
      body: this.interpolate(config.body, context),
    });
    return { sent: true };
  }

  /**
   * Helper: Send notification
   */
  private async sendNotification(config: any, context: Record<string, any>): Promise<any> {
    // In production, integrate with notification service
    console.log('Sending notification:', {
      type: config.notificationType,
      message: this.interpolate(config.message, context),
      recipients: config.recipients,
    });
    return { sent: true };
  }

  /**
   * Helper: Make HTTP request
   */
  private async makeHttpRequest(config: any, context: Record<string, any>): Promise<any> {
    const response = await axios({
      method: config.method || 'GET',
      url: this.interpolate(config.url, context),
      headers: config.headers,
      data: config.body,
    });
    return response.data;
  }

  /**
   * Helper: Execute database action
   */
  private async executeDatabaseAction(config: any, context: Record<string, any>): Promise<any> {
    // In production, use the database adapter
    console.log('Database action:', {
      operation: config.operation,
      table: config.table,
      data: config.data,
    });
    return { success: true };
  }

  /**
   * Helper: Evaluate condition
   */
  private evaluateCondition(condition: string, context: Record<string, any>): boolean {
    try {
      // Simple condition evaluation (in production, use a proper expression parser)
      const interpolated = this.interpolate(condition, context);
      return eval(interpolated);
    } catch (error) {
      console.error('Condition evaluation failed:', error);
      return false;
    }
  }

  /**
   * Helper: Interpolate variables in string
   */
  private interpolate(template: string, context: Record<string, any>): string {
    if (!template) return '';

    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return context[key] !== undefined ? String(context[key]) : match;
    });
  }

  /**
   * Helper: Log execution event
   */
  private log(
    execution: WorkflowExecution,
    nodeId: string,
    level: 'info' | 'warning' | 'error',
    message: string,
    data?: any
  ): void {
    execution.logs.push({
      timestamp: new Date(),
      nodeId,
      level,
      message,
      data,
    });
  }

  /**
   * Schedule a workflow
   */
  scheduleWorkflow(workflow: Workflow): void {
    if (!workflow.schedule) {
      throw new Error('Workflow does not have a schedule');
    }

    // Parse cron expression and schedule workflow
    // In production, use a proper cron library (node-cron, etc.)
    console.log(`Scheduling workflow ${workflow.id} with schedule: ${workflow.schedule}`);

    // For demo purposes, we'll just log
    // const job = cron.schedule(workflow.schedule, () => {
    //   this.executeWorkflow(workflow);
    // });
    //
    // this.scheduledWorkflows.set(workflow.id, job);
  }

  /**
   * Register webhook for workflow
   */
  registerWebhook(workflow: Workflow, webhookUrl: string): string {
    // In production, register webhook with webhook service
    const webhookId = `webhook_${workflow.id}`;
    console.log(`Registered webhook for workflow ${workflow.id}: ${webhookUrl}`);
    return webhookId;
  }

  /**
   * Handle incoming webhook
   */
  async handleWebhook(workflowId: string, payload: any): Promise<WorkflowExecution> {
    // Find workflow and execute with webhook payload
    console.log(`Handling webhook for workflow ${workflowId}`);

    // In production, fetch workflow from database
    const workflow: Workflow = {
      id: workflowId,
      name: 'Webhook Workflow',
      nodes: [],
      edges: [],
      status: 'active',
      createdBy: 'system',
      companyId: 'company-1',
    };

    return this.executeWorkflow(workflow, { webhookPayload: payload });
  }

  /**
   * Get execution status
   */
  getExecution(executionId: string): WorkflowExecution | undefined {
    return this.executions.get(executionId);
  }

  /**
   * Get all executions for a workflow
   */
  getWorkflowExecutions(workflowId: string): WorkflowExecution[] {
    return Array.from(this.executions.values())
      .filter(e => e.workflowId === workflowId)
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  }

  /**
   * Retry failed execution
   */
  async retryExecution(executionId: string): Promise<WorkflowExecution> {
    const oldExecution = this.executions.get(executionId);
    if (!oldExecution) {
      throw new Error('Execution not found');
    }

    // In production, fetch workflow from database
    const workflow: Workflow = {
      id: oldExecution.workflowId,
      name: 'Retry Workflow',
      nodes: [],
      edges: [],
      status: 'active',
      createdBy: 'system',
      companyId: 'company-1',
    };

    return this.executeWorkflow(workflow, oldExecution.context);
  }
}

// Export singleton instance
export const workflowEngine = new WorkflowEngine();

