/**
 * Role-Based Access Control (RBAC) System
 * 
 * Defines permissions for each role and provides utility functions
 * to check user permissions throughout the application.
 */

import { User } from '../types';
import { TenantContext } from './tenantContext';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type Permission =
    // Company Management
    | 'company:read'
    | 'company:update'
    | 'company:delete'
    | 'company:manage_users'
    | 'company:manage_billing'
    
    // Project Management
    | 'project:create'
    | 'project:read'
    | 'project:update'
    | 'project:delete'
    | 'project:manage_team'
    
    // Task Management
    | 'task:create'
    | 'task:read'
    | 'task:update'
    | 'task:delete'
    | 'task:assign'
    
    // User Management
    | 'user:create'
    | 'user:read'
    | 'user:update'
    | 'user:delete'
    | 'user:invite'
    
    // Agent Management
    | 'agent:subscribe'
    | 'agent:unsubscribe'
    | 'agent:configure'
    
    // Reports & Analytics
    | 'report:view'
    | 'report:export'
    | 'analytics:view'
    | 'analytics:advanced'
    
    // Platform Admin
    | 'platform:view_all_companies'
    | 'platform:manage_companies'
    | 'platform:view_analytics'
    | 'platform:manage_agents'
    | 'platform:manage_plans';

export type Role = 'super_admin' | 'company_admin' | 'supervisor' | 'operative' | 'Project Manager';

// ============================================================================
// PERMISSIONS MATRIX
// ============================================================================

/**
 * Defines which permissions each role has
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    super_admin: [
        // All permissions
        'company:read',
        'company:update',
        'company:delete',
        'company:manage_users',
        'company:manage_billing',
        'project:create',
        'project:read',
        'project:update',
        'project:delete',
        'project:manage_team',
        'task:create',
        'task:read',
        'task:update',
        'task:delete',
        'task:assign',
        'user:create',
        'user:read',
        'user:update',
        'user:delete',
        'user:invite',
        'agent:subscribe',
        'agent:unsubscribe',
        'agent:configure',
        'report:view',
        'report:export',
        'analytics:view',
        'analytics:advanced',
        'platform:view_all_companies',
        'platform:manage_companies',
        'platform:view_analytics',
        'platform:manage_agents',
        'platform:manage_plans',
    ],
    
    company_admin: [
        // Company management
        'company:read',
        'company:update',
        'company:manage_users',
        'company:manage_billing',
        
        // Full project management
        'project:create',
        'project:read',
        'project:update',
        'project:delete',
        'project:manage_team',
        
        // Full task management
        'task:create',
        'task:read',
        'task:update',
        'task:delete',
        'task:assign',
        
        // User management
        'user:create',
        'user:read',
        'user:update',
        'user:delete',
        'user:invite',
        
        // Agent management
        'agent:subscribe',
        'agent:unsubscribe',
        'agent:configure',
        
        // Reports
        'report:view',
        'report:export',
        'analytics:view',
        'analytics:advanced',
    ],
    
    supervisor: [
        // Limited company access
        'company:read',
        
        // Project management
        'project:create',
        'project:read',
        'project:update',
        'project:manage_team',
        
        // Full task management
        'task:create',
        'task:read',
        'task:update',
        'task:delete',
        'task:assign',
        
        // Limited user access
        'user:read',
        
        // Agent usage
        'agent:configure',
        
        // Reports
        'report:view',
        'report:export',
        'analytics:view',
    ],
    
    'Project Manager': [
        // Read company info
        'company:read',
        
        // Project management
        'project:create',
        'project:read',
        'project:update',
        'project:manage_team',
        
        // Task management
        'task:create',
        'task:read',
        'task:update',
        'task:assign',
        
        // User read
        'user:read',
        
        // Reports
        'report:view',
        'analytics:view',
    ],
    
    operative: [
        // Read-only company
        'company:read',
        
        // Read projects
        'project:read',
        
        // Limited task access
        'task:read',
        'task:update', // Can update own tasks
        
        // Read users
        'user:read',
        
        // View reports
        'report:view',
    ],
};

// ============================================================================
// PERMISSION CHECKING FUNCTIONS
// ============================================================================

/**
 * Check if a user has a specific permission
 */
export const hasPermission = (user: User, permission: Permission): boolean => {
    const role = user.role as Role;
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
};

/**
 * Check if a user has any of the specified permissions
 */
export const hasAnyPermission = (user: User, permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(user, permission));
};

/**
 * Check if a user has all of the specified permissions
 */
export const hasAllPermissions = (user: User, permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(user, permission));
};

/**
 * Get all permissions for a user
 */
export const getUserPermissions = (user: User): Permission[] => {
    const role = user.role as Role;
    return ROLE_PERMISSIONS[role] || [];
};

// ============================================================================
// RESOURCE-SPECIFIC PERMISSION CHECKS
// ============================================================================

/**
 * Check if user can access a specific company
 */
export const canAccessCompany = (
    user: User,
    companyId: string
): boolean => {
    // Super admins can access all companies
    if (user.role === 'super_admin') {
        return true;
    }
    
    // Users can only access their own company
    return user.companyId === companyId;
};

/**
 * Check if user can modify a specific project
 */
export const canModifyProject = (
    user: User,
    projectCompanyId: string
): boolean => {
    // Must have permission and belong to same company
    return (
        hasPermission(user, 'project:update') &&
        canAccessCompany(user, projectCompanyId)
    );
};

/**
 * Check if user can delete a specific project
 */
export const canDeleteProject = (
    user: User,
    projectCompanyId: string
): boolean => {
    return (
        hasPermission(user, 'project:delete') &&
        canAccessCompany(user, projectCompanyId)
    );
};

/**
 * Check if user can modify a specific task
 */
export const canModifyTask = (
    user: User,
    taskCompanyId: string,
    taskAssignedTo?: string
): boolean => {
    // Must belong to same company
    if (!canAccessCompany(user, taskCompanyId)) {
        return false;
    }
    
    // Has general update permission
    if (hasPermission(user, 'task:update')) {
        return true;
    }
    
    // Operatives can only update their own tasks
    if (user.role === 'operative' && taskAssignedTo === user.id) {
        return true;
    }
    
    return false;
};

/**
 * Check if user can assign tasks
 */
export const canAssignTask = (
    user: User,
    taskCompanyId: string
): boolean => {
    return (
        hasPermission(user, 'task:assign') &&
        canAccessCompany(user, taskCompanyId)
    );
};

/**
 * Check if user can invite other users
 */
export const canInviteUsers = (
    user: User,
    targetCompanyId: string
): boolean => {
    return (
        hasPermission(user, 'user:invite') &&
        canAccessCompany(user, targetCompanyId)
    );
};

/**
 * Check if user can manage company billing
 */
export const canManageBilling = (
    user: User,
    companyId: string
): boolean => {
    return (
        hasPermission(user, 'company:manage_billing') &&
        canAccessCompany(user, companyId)
    );
};

/**
 * Check if user can subscribe to agents
 */
export const canSubscribeToAgents = (
    user: User,
    companyId: string
): boolean => {
    return (
        hasPermission(user, 'agent:subscribe') &&
        canAccessCompany(user, companyId)
    );
};

// ============================================================================
// TENANT CONTEXT PERMISSION CHECKS
// ============================================================================

/**
 * Check permission using tenant context
 */
export const checkPermission = (
    tenantContext: TenantContext,
    permission: Permission
): boolean => {
    return hasPermission(tenantContext.user, permission);
};

/**
 * Require permission or throw error
 */
export const requirePermission = (
    tenantContext: TenantContext,
    permission: Permission,
    errorMessage?: string
): void => {
    if (!checkPermission(tenantContext, permission)) {
        throw new Error(
            errorMessage || `Permission denied: ${permission} required`
        );
    }
};

/**
 * Require any of the permissions or throw error
 */
export const requireAnyPermission = (
    tenantContext: TenantContext,
    permissions: Permission[],
    errorMessage?: string
): void => {
    if (!hasAnyPermission(tenantContext.user, permissions)) {
        throw new Error(
            errorMessage || `Permission denied: One of [${permissions.join(', ')}] required`
        );
    }
};

// ============================================================================
// ROLE HIERARCHY
// ============================================================================

/**
 * Role hierarchy (higher number = more permissions)
 */
export const ROLE_HIERARCHY: Record<Role, number> = {
    super_admin: 100,
    company_admin: 80,
    supervisor: 60,
    'Project Manager': 40,
    operative: 20,
};

/**
 * Check if user's role is higher than or equal to required role
 */
export const hasRoleLevel = (user: User, requiredRole: Role): boolean => {
    const userLevel = ROLE_HIERARCHY[user.role as Role] || 0;
    const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
    return userLevel >= requiredLevel;
};

/**
 * Check if user can manage another user (based on role hierarchy)
 */
export const canManageUser = (
    manager: User,
    targetUser: User
): boolean => {
    // Must be in same company (unless super admin)
    if (manager.role !== 'super_admin' && manager.companyId !== targetUser.companyId) {
        return false;
    }
    
    // Must have user management permission
    if (!hasPermission(manager, 'user:update')) {
        return false;
    }
    
    // Can't manage users with higher or equal role
    const managerLevel = ROLE_HIERARCHY[manager.role as Role] || 0;
    const targetLevel = ROLE_HIERARCHY[targetUser.role as Role] || 0;
    
    return managerLevel > targetLevel;
};

