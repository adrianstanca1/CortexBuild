/**
 * Role-Based Access Control (RBAC) System
 * Defines permissions for each user role
 */

export type UserRole = 'super_admin' | 'company_admin' | 'developer' | 'supervisor' | 'worker';

export interface Permission {
    resource: string;
    actions: ('create' | 'read' | 'update' | 'delete' | 'manage')[];
    scope: 'platform' | 'company' | 'own' | 'none';
}

/**
 * Permission definitions for each role
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    // SUPER ADMIN - Full platform access
    super_admin: [
        { resource: 'users', actions: ['create', 'read', 'update', 'delete', 'manage'], scope: 'platform' },
        { resource: 'companies', actions: ['create', 'read', 'update', 'delete', 'manage'], scope: 'platform' },
        { resource: 'projects', actions: ['create', 'read', 'update', 'delete', 'manage'], scope: 'platform' },
        { resource: 'billing', actions: ['create', 'read', 'update', 'delete', 'manage'], scope: 'platform' },
        { resource: 'settings', actions: ['create', 'read', 'update', 'delete', 'manage'], scope: 'platform' },
        { resource: 'database', actions: ['create', 'read', 'update', 'delete', 'manage'], scope: 'platform' },
        { resource: 'analytics', actions: ['read', 'manage'], scope: 'platform' },
        { resource: 'security', actions: ['read', 'manage'], scope: 'platform' },
        { resource: 'integrations', actions: ['create', 'read', 'update', 'delete', 'manage'], scope: 'platform' },
        { resource: 'notifications', actions: ['create', 'read', 'update', 'delete', 'manage'], scope: 'platform' },
        { resource: 'permissions', actions: ['create', 'read', 'update', 'delete', 'manage'], scope: 'platform' },
        { resource: 'content', actions: ['create', 'read', 'update', 'delete', 'manage'], scope: 'platform' },
        { resource: 'developer_tools', actions: ['read', 'manage'], scope: 'platform' },
        { resource: 'field_operations', actions: ['read', 'manage'], scope: 'platform' },
        { resource: 'office_operations', actions: ['read', 'manage'], scope: 'platform' }
    ],

    // COMPANY ADMIN - Full company access
    company_admin: [
        { resource: 'users', actions: ['create', 'read', 'update', 'delete', 'manage'], scope: 'company' },
        { resource: 'companies', actions: ['read', 'update'], scope: 'own' },
        { resource: 'projects', actions: ['create', 'read', 'update', 'delete', 'manage'], scope: 'company' },
        { resource: 'teams', actions: ['create', 'read', 'update', 'delete', 'manage'], scope: 'company' },
        { resource: 'billing', actions: ['read', 'update'], scope: 'company' },
        { resource: 'settings', actions: ['read', 'update'], scope: 'company' },
        { resource: 'analytics', actions: ['read'], scope: 'company' },
        { resource: 'documents', actions: ['create', 'read', 'update', 'delete', 'manage'], scope: 'company' },
        { resource: 'field_operations', actions: ['create', 'read', 'update', 'delete', 'manage'], scope: 'company' },
        { resource: 'office_operations', actions: ['create', 'read', 'update', 'delete', 'manage'], scope: 'company' },
        { resource: 'daily_logs', actions: ['create', 'read', 'update', 'delete', 'manage'], scope: 'company' },
        { resource: 'safety_reports', actions: ['create', 'read', 'update', 'delete', 'manage'], scope: 'company' },
        { resource: 'quality_control', actions: ['create', 'read', 'update', 'delete', 'manage'], scope: 'company' },
        { resource: 'time_tracking', actions: ['create', 'read', 'update', 'delete', 'manage'], scope: 'company' },
        { resource: 'equipment', actions: ['create', 'read', 'update', 'delete', 'manage'], scope: 'company' },
        { resource: 'procurement', actions: ['create', 'read', 'update', 'delete', 'manage'], scope: 'company' },
        { resource: 'database', actions: ['read'], scope: 'company' },
        { resource: 'developer_tools', actions: [], scope: 'none' },
        { resource: 'platform_settings', actions: [], scope: 'none' }
    ],

    // DEVELOPER - Development tools only
    developer: [
        { resource: 'code_editor', actions: ['create', 'read', 'update', 'delete'], scope: 'own' },
        { resource: 'terminal', actions: ['read', 'manage'], scope: 'own' },
        { resource: 'git', actions: ['create', 'read', 'update', 'delete', 'manage'], scope: 'own' },
        { resource: 'api_builder', actions: ['create', 'read', 'update', 'delete', 'manage'], scope: 'own' },
        { resource: 'database', actions: ['read'], scope: 'own' },
        { resource: 'testing', actions: ['create', 'read', 'update', 'delete', 'manage'], scope: 'own' },
        { resource: 'packages', actions: ['create', 'read', 'update', 'delete'], scope: 'own' },
        { resource: 'documentation', actions: ['read'], scope: 'platform' },
        { resource: 'users', actions: [], scope: 'none' },
        { resource: 'companies', actions: [], scope: 'none' },
        { resource: 'projects', actions: [], scope: 'none' },
        { resource: 'billing', actions: [], scope: 'none' },
        { resource: 'settings', actions: [], scope: 'none' },
        { resource: 'field_operations', actions: [], scope: 'none' },
        { resource: 'office_operations', actions: [], scope: 'none' }
    ],

    // SUPERVISOR - Field operations management
    supervisor: [
        { resource: 'projects', actions: ['read', 'update'], scope: 'company' },
        { resource: 'teams', actions: ['read', 'update'], scope: 'company' },
        { resource: 'daily_logs', actions: ['create', 'read', 'update', 'delete'], scope: 'company' },
        { resource: 'safety_reports', actions: ['create', 'read', 'update', 'delete'], scope: 'company' },
        { resource: 'quality_control', actions: ['create', 'read', 'update', 'delete'], scope: 'company' },
        { resource: 'time_tracking', actions: ['create', 'read', 'update'], scope: 'company' },
        { resource: 'equipment', actions: ['read', 'update'], scope: 'company' },
        { resource: 'procurement', actions: ['create', 'read', 'update'], scope: 'company' },
        { resource: 'users', actions: ['read'], scope: 'company' },
        { resource: 'analytics', actions: ['read'], scope: 'company' },
        { resource: 'billing', actions: [], scope: 'none' },
        { resource: 'settings', actions: [], scope: 'none' },
        { resource: 'developer_tools', actions: [], scope: 'none' }
    ],

    // WORKER - Field operations only
    worker: [
        { resource: 'projects', actions: ['read'], scope: 'company' },
        { resource: 'daily_logs', actions: ['create', 'read'], scope: 'own' },
        { resource: 'safety_reports', actions: ['create', 'read'], scope: 'own' },
        { resource: 'quality_control', actions: ['read'], scope: 'company' },
        { resource: 'time_tracking', actions: ['create', 'read'], scope: 'own' },
        { resource: 'equipment', actions: ['read'], scope: 'company' },
        { resource: 'users', actions: [], scope: 'none' },
        { resource: 'teams', actions: [], scope: 'none' },
        { resource: 'billing', actions: [], scope: 'none' },
        { resource: 'settings', actions: [], scope: 'none' },
        { resource: 'analytics', actions: [], scope: 'none' },
        { resource: 'developer_tools', actions: [], scope: 'none' }
    ]
};

/**
 * Check if user has permission to perform action on resource
 */
export function hasPermission(
    userRole: UserRole,
    resource: string,
    action: 'create' | 'read' | 'update' | 'delete' | 'manage',
    scope?: 'platform' | 'company' | 'own'
): boolean {
    const permissions = ROLE_PERMISSIONS[userRole];
    const permission = permissions.find(p => p.resource === resource);

    if (!permission) return false;
    if (!permission.actions.includes(action)) return false;
    if (scope && permission.scope !== scope && permission.scope !== 'platform') return false;

    return true;
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(userRole: UserRole): Permission[] {
    return ROLE_PERMISSIONS[userRole];
}

/**
 * Check if user can access dashboard
 */
export function canAccessDashboard(userRole: UserRole, dashboard: string): boolean {
    const dashboardAccess: Record<string, UserRole[]> = {
        'super-admin-dashboard': ['super_admin'],
        'company-admin-dashboard': ['super_admin', 'company_admin'],
        'developer-dashboard': ['super_admin', 'developer'],
        'supervisor-dashboard': ['super_admin', 'company_admin', 'supervisor'],
        'worker-dashboard': ['super_admin', 'company_admin', 'supervisor', 'worker']
    };

    return dashboardAccess[dashboard]?.includes(userRole) || false;
}

/**
 * Get accessible dashboards for role
 */
export function getAccessibleDashboards(userRole: UserRole): string[] {
    const allDashboards = [
        'super-admin-dashboard',
        'company-admin-dashboard',
        'developer-dashboard',
        'supervisor-dashboard',
        'worker-dashboard'
    ];

    return allDashboards.filter(dashboard => canAccessDashboard(userRole, dashboard));
}

/**
 * Check if user can access feature
 */
export function canAccessFeature(userRole: UserRole, feature: string): boolean {
    const featureAccess: Record<string, UserRole[]> = {
        // Platform features
        'platform-settings': ['super_admin'],
        'platform-billing': ['super_admin'],
        'platform-analytics': ['super_admin'],
        'platform-users': ['super_admin'],
        'platform-companies': ['super_admin'],

        // Company features
        'company-settings': ['super_admin', 'company_admin'],
        'company-billing': ['super_admin', 'company_admin'],
        'company-analytics': ['super_admin', 'company_admin'],
        'company-users': ['super_admin', 'company_admin'],
        'company-projects': ['super_admin', 'company_admin', 'supervisor'],

        // Development features
        'code-editor': ['super_admin', 'developer'],
        'terminal': ['super_admin', 'developer'],
        'git-integration': ['super_admin', 'developer'],
        'api-builder': ['super_admin', 'developer'],
        'testing-framework': ['super_admin', 'developer'],

        // Field operations
        'daily-logs': ['super_admin', 'company_admin', 'supervisor', 'worker'],
        'safety-reports': ['super_admin', 'company_admin', 'supervisor', 'worker'],
        'quality-control': ['super_admin', 'company_admin', 'supervisor', 'worker'],
        'time-tracking': ['super_admin', 'company_admin', 'supervisor', 'worker'],
        'equipment-tracking': ['super_admin', 'company_admin', 'supervisor', 'worker'],

        // Office operations
        'project-management': ['super_admin', 'company_admin', 'supervisor'],
        'team-management': ['super_admin', 'company_admin', 'supervisor'],
        'document-management': ['super_admin', 'company_admin', 'supervisor'],
        'procurement': ['super_admin', 'company_admin', 'supervisor']
    };

    return featureAccess[feature]?.includes(userRole) || false;
}

/**
 * Get user role display name
 */
export function getRoleDisplayName(role: UserRole): string {
    const displayNames: Record<UserRole, string> = {
        super_admin: 'Super Admin',
        company_admin: 'Company Admin',
        developer: 'Developer',
        supervisor: 'Supervisor',
        worker: 'Worker'
    };

    return displayNames[role] || role;
}

/**
 * Get user role description
 */
export function getRoleDescription(role: UserRole): string {
    const descriptions: Record<UserRole, string> = {
        super_admin: 'Platform administrator with full system control',
        company_admin: 'Company owner with complete control over company operations',
        developer: 'Development-focused user with technical tools access',
        supervisor: 'Field supervisor managing on-site operations',
        worker: 'Field worker with access to daily operations'
    };

    return descriptions[role] || '';
}

