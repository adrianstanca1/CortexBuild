/**
 * Enterprise Services Index
 * ASAgents Construction Management Platform
 * 
 * This file exports all enterprise-grade services with proper initialization
 * and dependency injection for the multi-tenant construction management platform.
 */

// Core Database
import { Database } from '../database.js';

// Enterprise Services
import { MultiTenantService } from './MultiTenantService.js';
import { RBACService } from './RBACService.js';
import { DocumentService } from './DocumentService.js';
import { SecurityManager } from './SecurityManager.js';
import { WorkflowEngine } from './WorkflowEngine.js';
import { ReportingService } from './ReportingService.js';
import { IntegrationService } from './IntegrationService.js';

// Service Types
export {
  MultiTenantService,
  RBACService,
  DocumentService,
  SecurityManager,
  WorkflowEngine,
  ReportingService,
  IntegrationService
};

// Service Configuration Interface
export interface EnterpriseServicesConfig {
  database: Database;
  uploadPath?: string;
  maxFileSize?: number;
  encryptionKey?: string;
  jwtSecret?: string;
  webhookSecret?: string;
}

/**
 * Enterprise Services Container
 * Manages all enterprise services with proper dependency injection
 */
export class EnterpriseServices {
  private readonly db: Database;
  private readonly config: EnterpriseServicesConfig;

  // Service instances
  public multiTenant: MultiTenantService;
  public rbac: RBACService;
  public document: DocumentService;
  public security: SecurityManager;
  public workflow: WorkflowEngine;
  public reporting: ReportingService;
  public integration: IntegrationService;

  constructor(config: EnterpriseServicesConfig) {
    this.db = config.database;
    this.config = config;

    // Initialize services in dependency order
    this.initializeServices();
  }

  /**
   * Initialize all enterprise services
   */
  private initializeServices(): void {
    // Core multi-tenant service (no dependencies)
    this.multiTenant = new MultiTenantService(this.db);

    // RBAC service (depends on multi-tenant)
    this.rbac = new RBACService(this.db);

    // Security manager (independent core service)
    this.security = new SecurityManager(
      this.config.encryptionKey,
      this.config.jwtSecret
    );

    // Document service (depends on RBAC and multi-tenant)
    this.document = new DocumentService(
      this.db,
      this.config.uploadPath || './uploads',
      this.config.maxFileSize || 10485760 // 10MB default
    );

    // Workflow engine (depends on multi-tenant)
    this.workflow = new WorkflowEngine(this.db);

    // Reporting service (depends on multi-tenant)
    this.reporting = new ReportingService(this.db);

    // Integration service (independent)
    this.integration = new IntegrationService(this.db);
  }

  /**
   * Get all middleware functions for Express routing
   */
  getMiddleware() {
    return {
      // Security middleware
      authenticate: this.security.middleware().authenticate,
      authorize: (permission: string) => this.rbac.middleware().checkPermission(permission),
      
      // Multi-tenant middleware
      tenantContext: this.multiTenant.middleware().tenantContext,
      subscriptionCheck: this.multiTenant.middleware().checkSubscription,
      
      // Document middleware
      uploadDocument: this.document.middleware().uploadDocument,
      downloadDocument: this.document.middleware().downloadDocument,
      
      // Workflow middleware
      startWorkflow: this.workflow.middleware().startWorkflow,
      approveStep: this.workflow.middleware().approveStep,
      rejectStep: this.workflow.middleware().rejectStep,
      
      // Reporting middleware
      getAnalytics: this.reporting.middleware().getAnalytics,
      getExecutiveDashboard: this.reporting.middleware().getExecutiveDashboard,
      executeReport: this.reporting.middleware().executeReport,
      
      // Integration middleware
      testConnection: this.integration.middleware().testConnection,
      syncData: this.integration.middleware().syncData,
      handleWebhook: this.integration.middleware().handleWebhook
    };
  }

  /**
   * Initialize tenant with default data
   */
  async initializeTenant(
    tenantName: string,
    adminUser: any,
    subscriptionTier: 'basic' | 'professional' | 'enterprise' = 'basic'
  ): Promise<{ tenantId: string; userId: string }> {
    // Create tenant with subscription
    const tenantId = await this.multiTenant.createTenant(
      tenantName,
      subscriptionTier,
      adminUser.email
    );

    // Create admin user
    const userId = await this.multiTenant.createUser(
      {
        ...adminUser,
        role: 'admin',
        tenantId
      },
      'admin' // Default role
    );

    // Initialize default workflows
    await this.initializeDefaultWorkflows(tenantId);

    // Initialize default reports
    await this.initializeDefaultReports(tenantId, userId);

    return { tenantId, userId };
  }

  /**
   * Initialize default workflows for tenant
   */
  private async initializeDefaultWorkflows(tenantId: string): Promise<void> {
    const defaultWorkflows = [
      {
        name: 'Project Approval Workflow',
        description: 'Standard approval process for new projects',
        triggerType: 'project_created',
        steps: [
          {
            id: 'review',
            name: 'Initial Review',
            type: 'approval' as const,
            config: { requiresApproval: true },
            assignee: 'project_manager',
            nextSteps: ['budget_review']
          },
          {
            id: 'budget_review',
            name: 'Budget Review',
            type: 'approval' as const,
            config: { requiresApproval: true },
            assignee: 'finance_manager',
            nextSteps: ['final_approval']
          },
          {
            id: 'final_approval',
            name: 'Final Approval',
            type: 'approval' as const,
            config: { requiresApproval: true },
            assignee: 'admin',
            nextSteps: []
          }
        ],
        isActive: true,
        tenantId
      },
      {
        name: 'Safety Incident Response',
        description: 'Automated response to safety incidents',
        triggerType: 'safety_incident_created',
        steps: [
          {
            id: 'notify_safety',
            name: 'Notify Safety Team',
            type: 'notification' as const,
            config: {
              title: 'Safety Incident Reported',
              message: 'A safety incident has been reported: {{description}}',
              notificationType: 'urgent'
            },
            assignee: 'safety_manager',
            nextSteps: ['investigate']
          },
          {
            id: 'investigate',
            name: 'Investigation Required',
            type: 'approval' as const,
            config: { requiresApproval: true },
            assignee: 'safety_manager',
            timeoutMinutes: 24 * 60, // 24 hours
            nextSteps: []
          }
        ],
        isActive: true,
        tenantId
      }
    ];

    for (const workflow of defaultWorkflows) {
      await this.workflow.createTemplate(workflow);
    }
  }

  /**
   * Initialize default reports for tenant
   */
  private async initializeDefaultReports(tenantId: string, createdBy: string): Promise<void> {
    const defaultReports = [
      {
        name: 'Project Status Dashboard',
        description: 'Overview of all project statuses and timelines',
        type: 'dashboard' as const,
        category: 'projects',
        query: `
          SELECT 
            id, name, status, start_date, end_date, budget,
            DATEDIFF(COALESCE(end_date, NOW()), start_date) as duration_days,
            (CASE WHEN end_date < NOW() AND status != 'completed' THEN 'overdue' ELSE 'on_track' END) as health
          FROM projects 
          WHERE tenant_id = ?
          ORDER BY created_at DESC
        `,
        parameters: [],
        visualizations: [
          {
            id: 'status_chart',
            type: 'pie-chart',
            title: 'Projects by Status',
            config: { dataField: 'status' },
            position: { x: 0, y: 0, width: 6, height: 4 }
          },
          {
            id: 'timeline',
            type: 'table',
            title: 'Project Timeline',
            config: { columns: ['name', 'status', 'start_date', 'end_date', 'health'] },
            position: { x: 6, y: 0, width: 6, height: 4 }
          }
        ],
        accessRoles: ['admin', 'project_manager', 'user'],
        isPublic: false,
        tenantId,
        createdBy
      },
      {
        name: 'Financial Summary',
        description: 'Financial overview including budgets and expenses',
        type: 'dashboard' as const,
        category: 'financial',
        query: `
          SELECT 
            'Projects' as category,
            SUM(budget) as total_budget,
            COUNT(*) as count
          FROM projects 
          WHERE tenant_id = ?
          UNION ALL
          SELECT 
            category,
            SUM(amount) as total_amount,
            COUNT(*) as count
          FROM expenses 
          WHERE tenant_id = ?
          GROUP BY category
        `,
        parameters: [],
        visualizations: [
          {
            id: 'budget_chart',
            type: 'bar-chart',
            title: 'Budget vs Expenses',
            config: { xField: 'category', yField: 'total_budget' },
            position: { x: 0, y: 0, width: 12, height: 6 }
          }
        ],
        accessRoles: ['admin', 'finance_manager'],
        isPublic: false,
        tenantId,
        createdBy
      }
    ];

    for (const report of defaultReports) {
      await this.reporting.createReport(report);
    }
  }

  /**
   * Health check for all services
   */
  async healthCheck(): Promise<{ [service: string]: boolean }> {
    const health: { [service: string]: boolean } = {};

    try {
      // Test database connection
      await this.db.executeQuery('SELECT 1');
      health.database = true;
    } catch {
      health.database = false;
    }

    // Test each service
    health.multiTenant = !!this.multiTenant;
    health.rbac = !!this.rbac;
    health.document = !!this.document;
    health.security = !!this.security;
    health.workflow = !!this.workflow;
    health.reporting = !!this.reporting;
    health.integration = !!this.integration;

    return health;
  }

  /**
   * Get service statistics
   */
  async getStatistics(): Promise<any> {
    try {
      const [tenants, users, projects, tasks] = await Promise.all([
        this.db.executeQuery('SELECT COUNT(*) as count FROM tenants'),
        this.db.executeQuery('SELECT COUNT(*) as count FROM users'),
        this.db.executeQuery('SELECT COUNT(*) as count FROM projects'),
        this.db.executeQuery('SELECT COUNT(*) as count FROM tasks')
      ]);

      return {
        tenants: (tenants as any[])[0]?.count || 0,
        users: (users as any[])[0]?.count || 0,
        projects: (projects as any[])[0]?.count || 0,
        tasks: (tasks as any[])[0]?.count || 0,
        services: {
          multiTenant: !!this.multiTenant,
          rbac: !!this.rbac,
          document: !!this.document,
          security: !!this.security,
          workflow: !!this.workflow,
          reporting: !!this.reporting,
          integration: !!this.integration
        }
      };
    } catch (error) {
      console.error('Failed to get statistics:', error);
      return {
        error: 'Failed to retrieve statistics'
      };
    }
  }
}

/**
 * Factory function to create enterprise services
 */
export function createEnterpriseServices(config: EnterpriseServicesConfig): EnterpriseServices {
  return new EnterpriseServices(config);
}

/**
 * Default configuration
 */
export const defaultConfig: Partial<EnterpriseServicesConfig> = {
  uploadPath: './uploads',
  maxFileSize: 10485760, // 10MB
  encryptionKey: process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production',
  jwtSecret: process.env.JWT_SECRET || 'default-jwt-secret-change-in-production',
  webhookSecret: process.env.WEBHOOK_SECRET || 'default-webhook-secret-change-in-production'
};

// Export all service types and interfaces
export * from './MultiTenantService.js';
export * from './RBACService.js';
export * from './DocumentService.js';
export * from './SecurityManager.js';
export * from './WorkflowEngine.js';
export * from './ReportingService.js';
export * from './IntegrationService.js';