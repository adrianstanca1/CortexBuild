/**
 * Role-Based Access Control Service
 * Manages permissions, roles, and access control for multi-tenant platform
 */

export interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface Role {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  permissions: string[];
  isSystemRole: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPermissions {
  userId: string;
  tenantId: string;
  roles: Role[];
  effectivePermissions: Set<string>;
}

export class RBACService {
  private readonly db: any;
  private readonly permissionCache = new Map<string, UserPermissions>();
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor(database: any) {
    this.db = database;
  }

  /**
   * Create a new role
   */
  async createRole(roleData: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role> {
    const role: Role = {
      id: this.generateId('role'),
      ...roleData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.db.run(`
      INSERT INTO roles (id, tenant_id, name, description, permissions, is_system_role, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      role.id,
      role.tenantId,
      role.name,
      role.description || null,
      JSON.stringify(role.permissions),
      role.isSystemRole ? 1 : 0,
      role.createdAt.toISOString(),
      role.updatedAt.toISOString()
    ]);

    return role;
  }

  /**
   * Assign role to user
   */
  async assignRole(userId: string, roleId: string, assignedBy: string, expiresAt?: Date): Promise<void> {
    await this.db.run(`
      INSERT OR REPLACE INTO user_roles (id, user_id, role_id, assigned_by, assigned_at, expires_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      this.generateId('user_role'),
      userId,
      roleId,
      assignedBy,
      new Date().toISOString(),
      expiresAt?.toISOString() || null
    ]);

    // Clear user permission cache
    this.clearUserPermissionCache(userId);
  }

  /**
   * Remove role from user
   */
  async revokeRole(userId: string, roleId: string): Promise<void> {
    await this.db.run(`
      DELETE FROM user_roles WHERE user_id = ? AND role_id = ?
    `, [userId, roleId]);

    // Clear user permission cache
    this.clearUserPermissionCache(userId);
  }

  /**
   * Get user permissions with caching
   */
  async getUserPermissions(userId: string, tenantId: string): Promise<UserPermissions> {
    const cacheKey = `${userId}:${tenantId}`;
    
    // Check cache first
    const cached = this.permissionCache.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      return cached;
    }

    // Load from database
    const userRoles = await this.db.all(`
      SELECT r.* FROM roles r
      INNER JOIN user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = ? AND r.tenant_id = ? 
      AND (ur.expires_at IS NULL OR ur.expires_at > datetime('now'))
    `, [userId, tenantId]);

    const roles: Role[] = userRoles.map((r: any) => ({
      id: r.id,
      tenantId: r.tenant_id,
      name: r.name,
      description: r.description,
      permissions: JSON.parse(r.permissions || '[]'),
      isSystemRole: Boolean(r.is_system_role),
      createdAt: new Date(r.created_at),
      updatedAt: new Date(r.updated_at)
    }));

    // Calculate effective permissions
    const effectivePermissions = new Set<string>();
    
    for (const role of roles) {
      if (role.permissions.includes('*')) {
        // Super admin - all permissions
        effectivePermissions.add('*');
        break;
      }
      
      role.permissions.forEach(permission => {
        effectivePermissions.add(permission);
      });
    }

    const userPermissions: UserPermissions = {
      userId,
      tenantId,
      roles,
      effectivePermissions
    };

    // Cache the result
    this.permissionCache.set(cacheKey, userPermissions);
    
    return userPermissions;
  }

  /**
   * Check if user has specific permission
   */
  async hasPermission(userId: string, tenantId: string, permission: string, context?: Record<string, any>): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId, tenantId);

    // Super admin check
    if (userPermissions.effectivePermissions.has('*')) {
      return true;
    }

    // Direct permission check
    if (userPermissions.effectivePermissions.has(permission)) {
      return true;
    }

    // Wildcard permission check (e.g., 'projects:*' matches 'projects:read')
    const [resource] = permission.split(':');
    const wildcardPermission = `${resource}:*`;
    
    if (userPermissions.effectivePermissions.has(wildcardPermission)) {
      return true;
    }

    // Context-based permission check
    if (context) {
      return this.checkContextualPermissions(userPermissions, permission, context);
    }

    return false;
  }

  /**
   * Get all permissions for a tenant
   */
  async getTenantRoles(tenantId: string): Promise<Role[]> {
    const roles = await this.db.all(`
      SELECT * FROM roles WHERE tenant_id = ? ORDER BY name
    `, [tenantId]);

    return roles.map((r: any) => ({
      id: r.id,
      tenantId: r.tenant_id,
      name: r.name,
      description: r.description,
      permissions: JSON.parse(r.permissions || '[]'),
      isSystemRole: Boolean(r.is_system_role),
      createdAt: new Date(r.created_at),
      updatedAt: new Date(r.updated_at)
    }));
  }

  /**
   * Update role permissions
   */
  async updateRole(roleId: string, updates: Partial<Pick<Role, 'name' | 'description' | 'permissions'>>): Promise<void> {
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (updates.name) {
      updateFields.push('name = ?');
      updateValues.push(updates.name);
    }

    if (updates.description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(updates.description);
    }

    if (updates.permissions) {
      updateFields.push('permissions = ?');
      updateValues.push(JSON.stringify(updates.permissions));
    }

    updateFields.push('updated_at = ?');
    updateValues.push(new Date().toISOString());

    updateValues.push(roleId);

    await this.db.run(`
      UPDATE roles SET ${updateFields.join(', ')} WHERE id = ?
    `, updateValues);

    // Clear all permission caches since role changed
    this.clearAllPermissionCaches();
  }

  /**
   * Delete role
   */
  async deleteRole(roleId: string): Promise<void> {
    // Check if role is in use
    const usageCount = await this.db.get(`
      SELECT COUNT(*) as count FROM user_roles WHERE role_id = ?
    `, [roleId]);

    if (usageCount.count > 0) {
      throw new Error('Cannot delete role that is assigned to users');
    }

    await this.db.run(`DELETE FROM roles WHERE id = ?`, [roleId]);
  }

  /**
   * Get user's roles
   */
  async getUserRoles(userId: string, tenantId: string): Promise<Role[]> {
    const userPermissions = await this.getUserPermissions(userId, tenantId);
    return userPermissions.roles;
  }

  /**
   * Validate permission format
   */
  validatePermission(permission: string): boolean {
    const permissionRegex = /^([a-zA-Z_]+):([a-zA-Z_*]+)$/;
    return permission === '*' || permissionRegex.test(permission);
  }

  /**
   * Get available permissions for the system
   */
  getAvailablePermissions(): Record<string, string[]> {
    return {
      users: ['read', 'write', 'delete', 'manage_roles'],
      projects: ['read', 'write', 'delete', 'manage'],
      tasks: ['read', 'write', 'delete', 'assign'],
      documents: ['read', 'write', 'delete', 'approve', 'upload'],
      expenses: ['read', 'write', 'delete', 'approve'],
      equipment: ['read', 'write', 'delete', 'assign'],
      safety: ['read', 'write', 'delete', 'investigate'],
      reports: ['read', 'generate', 'export'],
      settings: ['read', 'write'],
      audit: ['read'],
      api: ['access', 'manage']
    };
  }

  /**
   * Check contextual permissions (e.g., project ownership)
   */
  private async checkContextualPermissions(
    userPermissions: UserPermissions,
    permission: string,
    context: Record<string, any>
  ): Promise<boolean> {
    const [resource, action] = permission.split(':');

    // Project-based permissions
    if (resource === 'projects' && context.projectId) {
      // Check if user is project manager
      const project = await this.db.get(`
        SELECT manager_id FROM projects WHERE id = ? AND tenant_id = ?
      `, [context.projectId, userPermissions.tenantId]);

      if (project && project.manager_id === userPermissions.userId) {
        return true;
      }

      // Check if user is project member
      const membership = await this.db.get(`
        SELECT id FROM project_members WHERE project_id = ? AND user_id = ?
      `, [context.projectId, userPermissions.userId]);

      if (membership && ['read', 'write'].includes(action)) {
        return true;
      }
    }

    // Owner-based permissions
    if (context.ownerId && context.ownerId === userPermissions.userId) {
      return ['read', 'write', 'delete'].includes(action);
    }

    return false;
  }

  /**
   * Clear user permission cache
   */
  private clearUserPermissionCache(userId: string): void {
    const keysToDelete = Array.from(this.permissionCache.keys())
      .filter(key => key.startsWith(`${userId}:`));
    
    keysToDelete.forEach(key => this.permissionCache.delete(key));
  }

  /**
   * Clear all permission caches
   */
  private clearAllPermissionCaches(): void {
    this.permissionCache.clear();
  }

  /**
   * Check if cache is valid
   */
  private isCacheValid(userPermissions: UserPermissions): boolean {
    // Simple time-based cache validation
    // In production, you might want more sophisticated cache invalidation
    return true; // For now, assume cache is always valid within timeout
  }

  /**
   * Generate unique ID
   */
  private generateId(prefix: string): string {
    return `${prefix}_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
  }
}

/**
 * Permission middleware for Express routes
 */
export const requirePermission = (permission: string, contextExtractor?: (req: any) => Record<string, any>) => {
  return async (req: any, res: any, next: any) => {
    try {
      const { user } = req;
      if (!user?.id || !user?.tenant_id) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const rbac = req.app.get('rbacService');
      if (!rbac) {
        return res.status(500).json({ error: 'RBAC service not available' });
      }

      const context = contextExtractor ? contextExtractor(req) : {};
      const hasPermission = await rbac.hasPermission(user.id, user.tenant_id, permission, context);

      if (!hasPermission) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          required: permission 
        });
      }

      next();
    } catch (error) {
      console.error('Permission check failed:', error);
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
};