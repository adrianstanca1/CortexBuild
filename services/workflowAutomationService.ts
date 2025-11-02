// CortexBuild Advanced Workflow Automation Service
import { User, Project, Task } from '../types';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'project' | 'task' | 'quality' | 'safety' | 'approval' | 'notification' | 'custom';
  version: string;
  isActive: boolean;
  triggers: WorkflowTrigger[];
  steps: WorkflowStep[];
  conditions: WorkflowCondition[];
  variables: WorkflowVariable[];
  permissions: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  successRate: number;
}

export interface WorkflowTrigger {
  id: string;
  type: 'manual' | 'schedule' | 'event' | 'webhook' | 'condition';
  name: string;
  configuration: {
    event?: string;
    schedule?: string; // cron expression
    webhook?: { url: string; method: string; headers: any };
    condition?: { field: string; operator: string; value: any };
  };
  enabled: boolean;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'action' | 'approval' | 'notification' | 'delay' | 'condition' | 'loop' | 'parallel';
  order: number;
  configuration: any;
  nextSteps: string[];
  errorHandling: {
    onError: 'stop' | 'continue' | 'retry' | 'escalate';
    retryCount?: number;
    retryDelay?: number; // seconds
    escalateTo?: string;
  };
  timeout?: number; // seconds
  assignedTo?: string;
  requiredApprovals?: number;
}

export interface WorkflowCondition {
  id: string;
  name: string;
  expression: string;
  description: string;
}

export interface WorkflowVariable {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
  defaultValue: any;
  description: string;
  required: boolean;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  triggeredBy: string;
  triggerType: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';
  startedAt: string;
  completedAt?: string;
  currentStep: string;
  executedSteps: ExecutedStep[];
  variables: { [key: string]: any };
  logs: WorkflowLog[];
  error?: string;
  duration?: number; // seconds
}

export interface ExecutedStep {
  stepId: string;
  stepName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startedAt: string;
  completedAt?: string;
  duration?: number;
  output?: any;
  error?: string;
  assignedTo?: string;
  approvals?: StepApproval[];
}

export interface StepApproval {
  id: string;
  userId: string;
  userName: string;
  decision: 'approved' | 'rejected' | 'pending';
  comments?: string;
  timestamp: string;
}

export interface WorkflowLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  stepId?: string;
  data?: any;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: number;
  conditions: RuleCondition[];
  actions: RuleAction[];
  schedule?: {
    type: 'immediate' | 'delayed' | 'scheduled';
    delay?: number; // minutes
    cron?: string;
  };
  lastExecuted?: string;
  executionCount: number;
  successCount: number;
  failureCount: number;
}

export interface RuleCondition {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'greater' | 'less' | 'contains' | 'starts_with' | 'ends_with' | 'in' | 'not_in';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface RuleAction {
  id: string;
  type: 'create_task' | 'send_notification' | 'update_status' | 'assign_user' | 'create_rfi' | 'schedule_inspection' | 'send_email' | 'webhook';
  configuration: any;
  order: number;
}

export interface WorkflowMetrics {
  totalWorkflows: number;
  activeWorkflows: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  topWorkflows: { id: string; name: string; executions: number; successRate: number }[];
  recentExecutions: WorkflowExecution[];
  performanceByCategory: { [category: string]: { executions: number; successRate: number } };
}

class WorkflowAutomationService {
  private workflows: WorkflowTemplate[] = [];
  private executions: WorkflowExecution[] = [];
  private automationRules: AutomationRule[] = [];

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    const now = new Date();

    // Initialize sample workflows
    this.workflows = [
      {
        id: 'workflow-project-approval',
        name: 'Project Approval Workflow',
        description: 'Multi-stage approval process for new construction projects',
        category: 'approval',
        version: '1.2.0',
        isActive: true,
        triggers: [
          {
            id: 'trigger-1',
            type: 'event',
            name: 'Project Created',
            configuration: { event: 'project.created' },
            enabled: true
          }
        ],
        steps: [
          {
            id: 'step-1',
            name: 'Initial Review',
            type: 'approval',
            order: 1,
            configuration: {
              approvers: ['project-manager'],
              description: 'Review project scope and requirements'
            },
            nextSteps: ['step-2'],
            errorHandling: { onError: 'stop' },
            timeout: 86400, // 24 hours
            requiredApprovals: 1
          },
          {
            id: 'step-2',
            name: 'Budget Approval',
            type: 'approval',
            order: 2,
            configuration: {
              approvers: ['finance-manager'],
              description: 'Approve project budget and financial plan'
            },
            nextSteps: ['step-3'],
            errorHandling: { onError: 'escalate', escalateTo: 'finance-director' },
            timeout: 172800, // 48 hours
            requiredApprovals: 1
          },
          {
            id: 'step-3',
            name: 'Final Approval',
            type: 'approval',
            order: 3,
            configuration: {
              approvers: ['executive-director'],
              description: 'Final executive approval for project initiation'
            },
            nextSteps: [],
            errorHandling: { onError: 'stop' },
            timeout: 259200, // 72 hours
            requiredApprovals: 1
          }
        ],
        conditions: [],
        variables: [
          {
            id: 'var-1',
            name: 'project_budget',
            type: 'number',
            defaultValue: 0,
            description: 'Total project budget',
            required: true
          }
        ],
        permissions: ['workflow.execute', 'project.approve'],
        createdBy: 'user-1',
        createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        usageCount: 15,
        successRate: 93.3
      },
      {
        id: 'workflow-quality-inspection',
        name: 'Automated Quality Inspection',
        description: 'Scheduled quality inspections with automated reporting',
        category: 'quality',
        version: '2.0.1',
        isActive: true,
        triggers: [
          {
            id: 'trigger-2',
            type: 'schedule',
            name: 'Weekly Inspection',
            configuration: { schedule: '0 9 * * 1' }, // Every Monday at 9 AM
            enabled: true
          }
        ],
        steps: [
          {
            id: 'step-q1',
            name: 'Schedule Inspection',
            type: 'action',
            order: 1,
            configuration: {
              action: 'create_inspection',
              inspector: 'auto-assign',
              type: 'quality'
            },
            nextSteps: ['step-q2'],
            errorHandling: { onError: 'retry', retryCount: 3 }
          },
          {
            id: 'step-q2',
            name: 'Send Notification',
            type: 'notification',
            order: 2,
            configuration: {
              recipients: ['project-team'],
              template: 'inspection-scheduled',
              channels: ['email', 'app']
            },
            nextSteps: [],
            errorHandling: { onError: 'continue' }
          }
        ],
        conditions: [],
        variables: [],
        permissions: ['workflow.execute', 'inspection.create'],
        createdBy: 'user-2',
        createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        usageCount: 8,
        successRate: 100
      }
    ];

    // Initialize sample executions
    this.executions = [
      {
        id: 'exec-1',
        workflowId: 'workflow-project-approval',
        workflowName: 'Project Approval Workflow',
        triggeredBy: 'user-1',
        triggerType: 'manual',
        status: 'completed',
        startedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        currentStep: 'step-3',
        executedSteps: [
          {
            stepId: 'step-1',
            stepName: 'Initial Review',
            status: 'completed',
            startedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            completedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
            duration: 7200,
            approvals: [
              {
                id: 'approval-1',
                userId: 'user-2',
                userName: 'Adrian ASC',
                decision: 'approved',
                comments: 'Project scope looks good',
                timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString()
              }
            ]
          }
        ],
        variables: { project_budget: 500000 },
        logs: [
          {
            id: 'log-1',
            timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            level: 'info',
            message: 'Workflow execution started',
            stepId: 'step-1'
          }
        ],
        duration: 86400
      }
    ];

    // Initialize automation rules
    this.automationRules = [
      {
        id: 'rule-1',
        name: 'Auto-assign High Priority Tasks',
        description: 'Automatically assign high priority tasks to available team members',
        enabled: true,
        priority: 1,
        conditions: [
          {
            id: 'cond-1',
            field: 'task.priority',
            operator: 'equals',
            value: 'high'
          },
          {
            id: 'cond-2',
            field: 'task.assignedToId',
            operator: 'equals',
            value: null,
            logicalOperator: 'AND'
          }
        ],
        actions: [
          {
            id: 'action-1',
            type: 'assign_user',
            configuration: { method: 'auto_assign', criteria: 'availability_and_skills' },
            order: 1
          },
          {
            id: 'action-2',
            type: 'send_notification',
            configuration: { template: 'task_assigned', recipient: 'assignee' },
            order: 2
          }
        ],
        schedule: { type: 'immediate' },
        executionCount: 23,
        successCount: 22,
        failureCount: 1,
        lastExecuted: new Date(now.getTime() - 60 * 60 * 1000).toISOString()
      }
    ];
  }

  // Get all workflow templates
  async getWorkflows(category?: string): Promise<WorkflowTemplate[]> {
    let workflows = [...this.workflows];
    
    if (category) {
      workflows = workflows.filter(w => w.category === category);
    }

    return workflows.sort((a, b) => b.usageCount - a.usageCount);
  }

  // Get workflow by ID
  async getWorkflow(id: string): Promise<WorkflowTemplate | null> {
    return this.workflows.find(w => w.id === id) || null;
  }

  // Create new workflow
  async createWorkflow(workflow: Omit<WorkflowTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount' | 'successRate'>): Promise<WorkflowTemplate> {
    const now = new Date().toISOString();
    const newWorkflow: WorkflowTemplate = {
      ...workflow,
      id: `workflow-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      usageCount: 0,
      successRate: 0
    };

    this.workflows.push(newWorkflow);
    return newWorkflow;
  }

  // Execute workflow
  async executeWorkflow(workflowId: string, triggeredBy: string, variables: any = {}): Promise<WorkflowExecution> {
    const workflow = await this.getWorkflow(workflowId);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    const execution: WorkflowExecution = {
      id: `exec-${Date.now()}`,
      workflowId,
      workflowName: workflow.name,
      triggeredBy,
      triggerType: 'manual',
      status: 'running',
      startedAt: new Date().toISOString(),
      currentStep: workflow.steps[0]?.id || '',
      executedSteps: [],
      variables: { ...workflow.variables.reduce((acc, v) => ({ ...acc, [v.name]: v.defaultValue }), {}), ...variables },
      logs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          level: 'info',
          message: `Workflow execution started by ${triggeredBy}`,
          data: { workflowId, variables }
        }
      ]
    };

    this.executions.push(execution);

    // Update workflow usage count
    workflow.usageCount++;

    // Simulate workflow execution (in real implementation, this would be handled by a workflow engine)
    setTimeout(() => {
      this.simulateWorkflowExecution(execution.id);
    }, 1000);

    return execution;
  }

  // Get workflow executions
  async getExecutions(filters: {
    workflowId?: string;
    status?: string;
    triggeredBy?: string;
    dateRange?: { start: string; end: string };
  } = {}): Promise<WorkflowExecution[]> {
    let executions = [...this.executions];

    if (filters.workflowId) {
      executions = executions.filter(e => e.workflowId === filters.workflowId);
    }

    if (filters.status) {
      executions = executions.filter(e => e.status === filters.status);
    }

    if (filters.triggeredBy) {
      executions = executions.filter(e => e.triggeredBy === filters.triggeredBy);
    }

    if (filters.dateRange) {
      const start = new Date(filters.dateRange.start);
      const end = new Date(filters.dateRange.end);
      executions = executions.filter(e => {
        const date = new Date(e.startedAt);
        return date >= start && date <= end;
      });
    }

    return executions.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }

  // Get automation rules
  async getAutomationRules(): Promise<AutomationRule[]> {
    return this.automationRules.sort((a, b) => a.priority - b.priority);
  }

  // Create automation rule
  async createAutomationRule(rule: Omit<AutomationRule, 'id' | 'executionCount' | 'successCount' | 'failureCount'>): Promise<AutomationRule> {
    const newRule: AutomationRule = {
      ...rule,
      id: `rule-${Date.now()}`,
      executionCount: 0,
      successCount: 0,
      failureCount: 0
    };

    this.automationRules.push(newRule);
    return newRule;
  }

  // Execute automation rule
  async executeAutomationRule(ruleId: string, context: any): Promise<boolean> {
    const rule = this.automationRules.find(r => r.id === ruleId);
    if (!rule || !rule.enabled) return false;

    // Check conditions
    const conditionsMet = this.evaluateConditions(rule.conditions, context);
    if (!conditionsMet) return false;

    // Execute actions
    try {
      for (const action of rule.actions.sort((a, b) => a.order - b.order)) {
        await this.executeAction(action, context);
      }

      rule.executionCount++;
      rule.successCount++;
      rule.lastExecuted = new Date().toISOString();
      return true;
    } catch (error) {
      rule.executionCount++;
      rule.failureCount++;
      rule.lastExecuted = new Date().toISOString();
      return false;
    }
  }

  // Get workflow metrics
  async getWorkflowMetrics(): Promise<WorkflowMetrics> {
    const totalWorkflows = this.workflows.length;
    const activeWorkflows = this.workflows.filter(w => w.isActive).length;
    const totalExecutions = this.executions.length;
    const successfulExecutions = this.executions.filter(e => e.status === 'completed').length;
    const failedExecutions = this.executions.filter(e => e.status === 'failed').length;

    const completedExecutions = this.executions.filter(e => e.duration);
    const averageExecutionTime = completedExecutions.length > 0
      ? completedExecutions.reduce((sum, e) => sum + (e.duration || 0), 0) / completedExecutions.length
      : 0;

    const topWorkflows = this.workflows
      .map(w => ({
        id: w.id,
        name: w.name,
        executions: w.usageCount,
        successRate: w.successRate
      }))
      .sort((a, b) => b.executions - a.executions)
      .slice(0, 5);

    const recentExecutions = this.executions
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      .slice(0, 10);

    const performanceByCategory: { [category: string]: { executions: number; successRate: number } } = {};
    this.workflows.forEach(w => {
      if (!performanceByCategory[w.category]) {
        performanceByCategory[w.category] = { executions: 0, successRate: 0 };
      }
      performanceByCategory[w.category].executions += w.usageCount;
      performanceByCategory[w.category].successRate += w.successRate;
    });

    // Calculate average success rates
    Object.keys(performanceByCategory).forEach(category => {
      const categoryWorkflows = this.workflows.filter(w => w.category === category);
      if (categoryWorkflows.length > 0) {
        performanceByCategory[category].successRate /= categoryWorkflows.length;
      }
    });

    return {
      totalWorkflows,
      activeWorkflows,
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      averageExecutionTime,
      topWorkflows,
      recentExecutions,
      performanceByCategory
    };
  }

  // Private helper methods
  private evaluateConditions(conditions: RuleCondition[], context: any): boolean {
    if (conditions.length === 0) return true;

    let result = true;
    let currentOperator = 'AND';

    for (const condition of conditions) {
      const value = this.getValueFromContext(context, condition.field);
      const conditionResult = this.evaluateCondition(value, condition.operator, condition.value);

      if (currentOperator === 'AND') {
        result = result && conditionResult;
      } else {
        result = result || conditionResult;
      }

      currentOperator = condition.logicalOperator || 'AND';
    }

    return result;
  }

  private evaluateCondition(value: any, operator: string, expected: any): boolean {
    switch (operator) {
      case 'equals': return value === expected;
      case 'not_equals': return value !== expected;
      case 'greater': return value > expected;
      case 'less': return value < expected;
      case 'contains': return String(value).includes(String(expected));
      case 'starts_with': return String(value).startsWith(String(expected));
      case 'ends_with': return String(value).endsWith(String(expected));
      case 'in': return Array.isArray(expected) && expected.includes(value);
      case 'not_in': return Array.isArray(expected) && !expected.includes(value);
      default: return false;
    }
  }

  private getValueFromContext(context: any, field: string): any {
    const parts = field.split('.');
    let value = context;
    
    for (const part of parts) {
      value = value?.[part];
    }
    
    return value;
  }

  private async executeAction(action: RuleAction, context: any): Promise<void> {
    // Simulate action execution
    console.log(`Executing action: ${action.type}`, action.configuration, context);
    
    // In a real implementation, this would execute the actual action
    switch (action.type) {
      case 'create_task':
        // Create a new task
        break;
      case 'send_notification':
        // Send notification
        break;
      case 'update_status':
        // Update entity status
        break;
      // ... other actions
    }
  }

  private async simulateWorkflowExecution(executionId: string): Promise<void> {
    const execution = this.executions.find(e => e.id === executionId);
    if (!execution) return;

    // Simulate workflow completion
    setTimeout(() => {
      execution.status = 'completed';
      execution.completedAt = new Date().toISOString();
      execution.duration = Math.floor((new Date().getTime() - new Date(execution.startedAt).getTime()) / 1000);
      
      execution.logs.push({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'Workflow execution completed successfully'
      });
    }, 5000);
  }
}

export const workflowAutomationService = new WorkflowAutomationService();
export default workflowAutomationService;
