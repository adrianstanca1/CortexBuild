/**
 * User Classes and Permissions
 * 4 distinct user classes with different capabilities
 */

export type UserClass = 'enterprise_admin' | 'company_admin' | 'team_lead' | 'team_member';

export interface UserClassDefinition {
    id: UserClass;
    name: string;
    level: number;
    description: string;
    permissions: Permission[];
    dashboardTabs: DashboardTab[];
    maxTeams?: number;
    maxProjects?: number;
    maxUsers?: number;
}

export type Permission = 
    // Company Management
    | 'company:read'
    | 'company:update'
    | 'company:delete'
    | 'company:manage_users'
    | 'company:manage_billing'
    | 'company:manage_subscriptions'
    
    // Team Management
    | 'team:create'
    | 'team:read'
    | 'team:update'
    | 'team:delete'
    | 'team:manage_members'
    
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
    
    // Developer Platform
    | 'developer:access'
    | 'developer:create_app'
    | 'developer:publish_app'
    | 'developer:manage_api_keys'
    
    // Marketplace
    | 'marketplace:browse'
    | 'marketplace:install_app'
    | 'marketplace:manage_apps'
    
    // Analytics & Reporting
    | 'analytics:view'
    | 'analytics:export'
    | 'reports:create'
    | 'reports:view'
    
    // Admin Functions
    | 'admin:access'
    | 'admin:manage_users'
    | 'admin:manage_companies'
    | 'admin:view_audit_logs'
    | 'admin:manage_subscriptions';

export interface DashboardTab {
    id: string;
    name: string;
    icon: string;
    component: string;
    order: number;
    visible: boolean;
}

export interface UserClassPermissions {
    enterprise_admin: Permission[];
    company_admin: Permission[];
    team_lead: Permission[];
    team_member: Permission[];
}

// User Class Definitions
export const USER_CLASSES: Record<UserClass, UserClassDefinition> = {
    enterprise_admin: {
        id: 'enterprise_admin',
        name: 'Enterprise Admin',
        level: 4,
        description: 'Full platform access and control',
        permissions: [
            // Company Management
            'company:read', 'company:update', 'company:delete',
            'company:manage_users', 'company:manage_billing', 'company:manage_subscriptions',
            // Team Management
            'team:create', 'team:read', 'team:update', 'team:delete', 'team:manage_members',
            // Project Management
            'project:create', 'project:read', 'project:update', 'project:delete', 'project:manage_team',
            // Task Management
            'task:create', 'task:read', 'task:update', 'task:delete', 'task:assign',
            // User Management
            'user:create', 'user:read', 'user:update', 'user:delete', 'user:invite',
            // Developer Platform
            'developer:access', 'developer:create_app', 'developer:publish_app', 'developer:manage_api_keys',
            // Marketplace
            'marketplace:browse', 'marketplace:install_app', 'marketplace:manage_apps',
            // Analytics
            'analytics:view', 'analytics:export', 'reports:create', 'reports:view',
            // Admin
            'admin:access', 'admin:manage_users', 'admin:manage_companies', 'admin:view_audit_logs', 'admin:manage_subscriptions'
        ],
        dashboardTabs: [
            { id: 'overview', name: 'Overview', icon: 'BarChart3', component: 'OverviewTab', order: 1, visible: true },
            { id: 'companies', name: 'Companies', icon: 'Building2', component: 'CompaniesTab', order: 2, visible: true },
            { id: 'users', name: 'Users', icon: 'Users', component: 'UsersTab', order: 3, visible: true },
            { id: 'subscriptions', name: 'Subscriptions', icon: 'CreditCard', component: 'SubscriptionsTab', order: 4, visible: true },
            { id: 'analytics', name: 'Analytics', icon: 'TrendingUp', component: 'AnalyticsTab', order: 5, visible: true },
            { id: 'audit_logs', name: 'Audit Logs', icon: 'FileText', component: 'AuditLogsTab', order: 6, visible: true },
            { id: 'developer', name: 'Developer', icon: 'Code', component: 'DeveloperTab', order: 7, visible: true },
            { id: 'marketplace', name: 'Marketplace', icon: 'Store', component: 'MarketplaceTab', order: 8, visible: true },
            { id: 'settings', name: 'Settings', icon: 'Settings', component: 'SettingsTab', order: 9, visible: true },
            { id: 'api_keys', name: 'API Keys', icon: 'Key', component: 'ApiKeysTab', order: 10, visible: true },
            { id: 'webhooks', name: 'Webhooks', icon: 'Webhook', component: 'WebhooksTab', order: 11, visible: true },
            { id: 'workflows', name: 'Workflows', icon: 'Workflow', component: 'WorkflowsTab', order: 12, visible: true },
            { id: 'integrations', name: 'Integrations', icon: 'Zap', component: 'IntegrationsTab', order: 13, visible: true },
            { id: 'reports', name: 'Reports', icon: 'FileBarChart', component: 'ReportsTab', order: 14, visible: true },
            { id: 'billing', name: 'Billing', icon: 'DollarSign', component: 'BillingTab', order: 15, visible: true },
            { id: 'security', name: 'Security', icon: 'Shield', component: 'SecurityTab', order: 16, visible: true },
            { id: 'support', name: 'Support', icon: 'HelpCircle', component: 'SupportTab', order: 17, visible: true },
            { id: 'system', name: 'System', icon: 'Server', component: 'SystemTab', order: 18, visible: true }
        ],
        maxTeams: undefined,
        maxProjects: undefined,
        maxUsers: undefined
    },
    
    company_admin: {
        id: 'company_admin',
        name: 'Company Admin',
        level: 3,
        description: 'Company-wide management and control',
        permissions: [
            'company:read', 'company:update', 'company:manage_users', 'company:manage_billing',
            'team:create', 'team:read', 'team:update', 'team:delete', 'team:manage_members',
            'project:create', 'project:read', 'project:update', 'project:delete', 'project:manage_team',
            'task:create', 'task:read', 'task:update', 'task:delete', 'task:assign',
            'user:create', 'user:read', 'user:update', 'user:delete', 'user:invite',
            'developer:access', 'developer:create_app', 'developer:manage_api_keys',
            'marketplace:browse', 'marketplace:install_app',
            'analytics:view', 'analytics:export', 'reports:create', 'reports:view'
        ],
        dashboardTabs: [
            { id: 'overview', name: 'Overview', icon: 'BarChart3', component: 'OverviewTab', order: 1, visible: true },
            { id: 'teams', name: 'Teams', icon: 'Users', component: 'TeamsTab', order: 2, visible: true },
            { id: 'projects', name: 'Projects', icon: 'Briefcase', component: 'ProjectsTab', order: 3, visible: true },
            { id: 'users', name: 'Users', icon: 'Users', component: 'UsersTab', order: 4, visible: true },
            { id: 'analytics', name: 'Analytics', icon: 'TrendingUp', component: 'AnalyticsTab', order: 5, visible: true },
            { id: 'marketplace', name: 'Marketplace', icon: 'Store', component: 'MarketplaceTab', order: 6, visible: true },
            { id: 'developer', name: 'Developer', icon: 'Code', component: 'DeveloperTab', order: 7, visible: true },
            { id: 'api_keys', name: 'API Keys', icon: 'Key', component: 'ApiKeysTab', order: 8, visible: true },
            { id: 'workflows', name: 'Workflows', icon: 'Workflow', component: 'WorkflowsTab', order: 9, visible: true },
            { id: 'reports', name: 'Reports', icon: 'FileBarChart', component: 'ReportsTab', order: 10, visible: true },
            { id: 'billing', name: 'Billing', icon: 'DollarSign', component: 'BillingTab', order: 11, visible: true },
            { id: 'settings', name: 'Settings', icon: 'Settings', component: 'SettingsTab', order: 12, visible: true },
            { id: 'security', name: 'Security', icon: 'Shield', component: 'SecurityTab', order: 13, visible: true },
            { id: 'support', name: 'Support', icon: 'HelpCircle', component: 'SupportTab', order: 14, visible: true },
            { id: 'integrations', name: 'Integrations', icon: 'Zap', component: 'IntegrationsTab', order: 15, visible: true }
        ],
        maxTeams: 100,
        maxProjects: 1000,
        maxUsers: 500
    },
    
    team_lead: {
        id: 'team_lead',
        name: 'Team Lead',
        level: 2,
        description: 'Team oversight and project management',
        permissions: [
            'company:read', 'team:read', 'team:manage_members',
            'project:create', 'project:read', 'project:update', 'project:manage_team',
            'task:create', 'task:read', 'task:update', 'task:assign',
            'user:read', 'user:invite',
            'developer:access',
            'marketplace:browse', 'marketplace:install_app',
            'analytics:view', 'reports:view'
        ],
        dashboardTabs: [
            { id: 'overview', name: 'Overview', icon: 'BarChart3', component: 'OverviewTab', order: 1, visible: true },
            { id: 'team', name: 'Team', icon: 'Users', component: 'TeamTab', order: 2, visible: true },
            { id: 'projects', name: 'Projects', icon: 'Briefcase', component: 'ProjectsTab', order: 3, visible: true },
            { id: 'tasks', name: 'Tasks', icon: 'CheckSquare', component: 'TasksTab', order: 4, visible: true },
            { id: 'analytics', name: 'Analytics', icon: 'TrendingUp', component: 'AnalyticsTab', order: 5, visible: true },
            { id: 'marketplace', name: 'Marketplace', icon: 'Store', component: 'MarketplaceTab', order: 6, visible: true },
            { id: 'reports', name: 'Reports', icon: 'FileBarChart', component: 'ReportsTab', order: 7, visible: true },
            { id: 'settings', name: 'Settings', icon: 'Settings', component: 'SettingsTab', order: 8, visible: true },
            { id: 'support', name: 'Support', icon: 'HelpCircle', component: 'SupportTab', order: 9, visible: true },
            { id: 'integrations', name: 'Integrations', icon: 'Zap', component: 'IntegrationsTab', order: 10, visible: true },
            { id: 'workflows', name: 'Workflows', icon: 'Workflow', component: 'WorkflowsTab', order: 11, visible: true },
            { id: 'calendar', name: 'Calendar', icon: 'Calendar', component: 'CalendarTab', order: 12, visible: true }
        ],
        maxTeams: 1,
        maxProjects: 50,
        maxUsers: 50
    },
    
    team_member: {
        id: 'team_member',
        name: 'Team Member',
        level: 1,
        description: 'Individual task execution and collaboration',
        permissions: [
            'company:read', 'team:read',
            'project:read',
            'task:read', 'task:update',
            'user:read',
            'marketplace:browse',
            'analytics:view', 'reports:view'
        ],
        dashboardTabs: [
            { id: 'overview', name: 'Overview', icon: 'BarChart3', component: 'OverviewTab', order: 1, visible: true },
            { id: 'my_tasks', name: 'My Tasks', icon: 'CheckSquare', component: 'MyTasksTab', order: 2, visible: true },
            { id: 'projects', name: 'Projects', icon: 'Briefcase', component: 'ProjectsTab', order: 3, visible: true },
            { id: 'team', name: 'Team', icon: 'Users', component: 'TeamTab', order: 4, visible: true },
            { id: 'calendar', name: 'Calendar', icon: 'Calendar', component: 'CalendarTab', order: 5, visible: true },
            { id: 'time_tracking', name: 'Time Tracking', icon: 'Clock', component: 'TimeTrackingTab', order: 6, visible: true },
            { id: 'documents', name: 'Documents', icon: 'FileText', component: 'DocumentsTab', order: 7, visible: true },
            { id: 'profile', name: 'Profile', icon: 'User', component: 'ProfileTab', order: 8, visible: true }
        ],
        maxTeams: 0,
        maxProjects: 0,
        maxUsers: 0
    }
};

// Helper function to check permission
export function hasPermission(userClass: UserClass, permission: Permission): boolean {
    const classDefinition = USER_CLASSES[userClass];
    return classDefinition.permissions.includes(permission);
}

// Helper function to get user class level
export function getUserClassLevel(userClass: UserClass): number {
    return USER_CLASSES[userClass].level;
}

// Helper function to check if user can manage another user
export function canManageUser(managerClass: UserClass, targetClass: UserClass): boolean {
    const managerLevel = getUserClassLevel(managerClass);
    const targetLevel = getUserClassLevel(targetClass);
    return managerLevel > targetLevel;
}

