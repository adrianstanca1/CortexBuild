/**
 * Multi-Tenant Service
 * Handles tenant management, isolation, and subscription features
 */

export interface Tenant {
  id: string;
  name: string;
  domain?: string;
  subscriptionType: 'basic' | 'professional' | 'enterprise';
  maxUsers: number;
  maxProjects: number;
  storageLimit: number;
  features: Record<string, boolean>;
  status: 'active' | 'suspended' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantFeatures {
  advancedReporting: boolean;
  documentWorkflows: boolean;
  apiAccess: boolean;
  customFields: boolean;
  bulkOperations: boolean;
  auditLogs: boolean;
  ssoIntegration: boolean;
  whiteLabeling: boolean;
}

export interface TenantUsage {
  userCount: number;
  projectCount: number;
  storageUsed: number;
  apiCallsThisMonth: number;
  lastActivity: Date;
}

export class MultiTenantService {
  private readonly db: any;

  constructor(database: any) {
    this.db = database;
  }

  /**
   * Create new tenant with subscription plan
   */
  async createTenant(tenantData: Partial<Tenant>): Promise<Tenant> {
    const tenant: Tenant = {
      id: this.generateId(),
      name: tenantData.name!,
      domain: tenantData.domain,
      subscriptionType: tenantData.subscriptionType || 'basic',
      maxUsers: this.getSubscriptionLimits(tenantData.subscriptionType || 'basic').maxUsers,
      maxProjects: this.getSubscriptionLimits(tenantData.subscriptionType || 'basic').maxProjects,
      storageLimit: this.getSubscriptionLimits(tenantData.subscriptionType || 'basic').storageLimit,
      features: this.getSubscriptionFeatures(tenantData.subscriptionType || 'basic'),
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Create tenant in database
    await this.db.run(`
      INSERT INTO tenants (id, name, domain, subscription_type, max_users, max_projects, storage_limit_gb, features, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      tenant.id,
      tenant.name,
      tenant.domain,
      tenant.subscriptionType,
      tenant.maxUsers,
      tenant.maxProjects,
      tenant.storageLimit,
      JSON.stringify(tenant.features),
      tenant.status,
      tenant.createdAt.toISOString(),
      tenant.updatedAt.toISOString()
    ]);

    // Create default roles for tenant
    await this.createDefaultRoles(tenant.id);

    return tenant;
  }

  /**
   * Get tenant by ID with usage statistics
   */
  async getTenant(tenantId: string): Promise<Tenant & { usage: TenantUsage }> {
    const tenant = await this.db.get(`
      SELECT * FROM tenants WHERE id = ?
    `, [tenantId]);

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const usage = await this.getTenantUsage(tenantId);

    return {
      ...tenant,
      features: JSON.parse(tenant.features || '{}'),
      createdAt: new Date(tenant.created_at),
      updatedAt: new Date(tenant.updated_at),
      usage
    };
  }

  /**
   * Update tenant subscription
   */
  async updateSubscription(tenantId: string, subscriptionType: 'basic' | 'professional' | 'enterprise'): Promise<void> {
    const limits = this.getSubscriptionLimits(subscriptionType);
    const features = this.getSubscriptionFeatures(subscriptionType);

    await this.db.run(`
      UPDATE tenants 
      SET subscription_type = ?, max_users = ?, max_projects = ?, storage_limit_gb = ?, features = ?, updated_at = ?
      WHERE id = ?
    `, [
      subscriptionType,
      limits.maxUsers,
      limits.maxProjects,
      limits.storageLimit,
      JSON.stringify(features),
      new Date().toISOString(),
      tenantId
    ]);
  }

  /**
   * Check if tenant can perform action based on limits
   */
  async canPerformAction(tenantId: string, action: 'createUser' | 'createProject' | 'uploadFile', size?: number): Promise<boolean> {
    const tenant = await this.getTenant(tenantId);

    switch (action) {
      case 'createUser':
        return tenant.usage.userCount < tenant.maxUsers;
      
      case 'createProject':
        return tenant.usage.projectCount < tenant.maxProjects;
      
      case 'uploadFile':
        if (!size) return false;
        return (tenant.usage.storageUsed + size) <= (tenant.storageLimit * 1024 * 1024 * 1024); // Convert GB to bytes
      
      default:
        return false;
    }
  }

  /**
   * Get tenant usage statistics
   */
  private async getTenantUsage(tenantId: string): Promise<TenantUsage> {
    const [userCount, projectCount, storageUsed, lastActivity] = await Promise.all([
      this.db.get('SELECT COUNT(*) as count FROM users WHERE tenant_id = ?', [tenantId]),
      this.db.get('SELECT COUNT(*) as count FROM projects WHERE tenant_id = ?', [tenantId]),
      this.db.get('SELECT COALESCE(SUM(file_size), 0) as size FROM documents WHERE tenant_id = ?', [tenantId]),
      this.db.get('SELECT MAX(last_login) as last_login FROM users WHERE tenant_id = ?', [tenantId])
    ]);

    return {
      userCount: userCount.count,
      projectCount: projectCount.count,
      storageUsed: storageUsed.size,
      apiCallsThisMonth: 0, // TODO: Implement API call tracking
      lastActivity: lastActivity.last_login ? new Date(lastActivity.last_login) : new Date()
    };
  }

  /**
   * Get subscription limits
   */
  private getSubscriptionLimits(subscriptionType: string) {
    const limits = {
      basic: { maxUsers: 5, maxProjects: 10, storageLimit: 1 },
      professional: { maxUsers: 25, maxProjects: 100, storageLimit: 10 },
      enterprise: { maxUsers: -1, maxProjects: -1, storageLimit: 100 }
    };

    return limits[subscriptionType as keyof typeof limits] || limits.basic;
  }

  /**
   * Get subscription features
   */
  private getSubscriptionFeatures(subscriptionType: string): TenantFeatures {
    const featureMatrix = {
      basic: {
        advancedReporting: false,
        documentWorkflows: false,
        apiAccess: false,
        customFields: false,
        bulkOperations: false,
        auditLogs: false,
        ssoIntegration: false,
        whiteLabeling: false
      },
      professional: {
        advancedReporting: true,
        documentWorkflows: true,
        apiAccess: true,
        customFields: true,
        bulkOperations: true,
        auditLogs: false,
        ssoIntegration: false,
        whiteLabeling: false
      },
      enterprise: {
        advancedReporting: true,
        documentWorkflows: true,
        apiAccess: true,
        customFields: true,
        bulkOperations: true,
        auditLogs: true,
        ssoIntegration: true,
        whiteLabeling: true
      }
    };

    return featureMatrix[subscriptionType as keyof typeof featureMatrix] || featureMatrix.basic;
  }

  /**
   * Create default roles for new tenant
   */
  private async createDefaultRoles(tenantId: string): Promise<void> {
    const defaultRoles = [
      {
        name: 'Admin',
        permissions: ['*'], // Full access
        description: 'Full system administrator'
      },
      {
        name: 'Project Manager',
        permissions: [
          'projects:read', 'projects:write', 'projects:delete',
          'tasks:read', 'tasks:write', 'tasks:delete',
          'users:read', 'reports:read'
        ],
        description: 'Project management and team oversight'
      },
      {
        name: 'Team Member',
        permissions: [
          'projects:read', 'tasks:read', 'tasks:write',
          'documents:read', 'time:read', 'time:write'
        ],
        description: 'Standard team member access'
      },
      {
        name: 'Client',
        permissions: [
          'projects:read', 'documents:read', 'reports:read'
        ],
        description: 'Client access to project information'
      }
    ];

    for (const role of defaultRoles) {
      await this.db.run(`
        INSERT INTO roles (id, tenant_id, name, description, permissions, is_system_role, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        this.generateId(),
        tenantId,
        role.name,
        role.description,
        JSON.stringify(role.permissions),
        1,
        new Date().toISOString(),
        new Date().toISOString()
      ]);
    }
  }

  private generateId(): string {
    return 'tenant_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
  }
}