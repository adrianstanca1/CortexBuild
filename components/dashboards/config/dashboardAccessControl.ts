/**
 * Dashboard Access Control System
 * Defines role-based access to different dashboard types and their features
 */

import { User, UserRole } from '../../../types';

// ==================== DASHBOARD TYPES ====================

export type DashboardType =
  | 'project_management'      // Regular project management features
  | 'company_admin'          // Company administration features
  | 'platform_admin'         // Super admin platform features
  | 'developer_tools'        // SDK and development tools
  | 'sdk_workspace'          // SDK workspace environment
  | 'developer_dashboard'    // Developer dashboard with analytics
  | 'ai_marketplace'         // AI agents marketplace
  | 'automation_studio';     // Workflow automation tools

export type DashboardCategory =
  | 'core'                   // Core project management
  | 'admin'                  // Administrative functions
  | 'development'            // Development and SDK tools
  | 'marketplace';           // Marketplace and community features

// ==================== DASHBOARD DEFINITIONS ====================

export interface DashboardDefinition {
  id: DashboardType;
  name: string;
  description: string;
  category: DashboardCategory;
  icon: string;
  roles: UserRole[];
  features: string[];
  navigationGroup: string;
  priority: number; // For ordering in navigation
}

export interface NavigationGroup {
  id: string;
  name: string;
  description: string;
  dashboards: DashboardType[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

// ==================== DASHBOARD CONFIGURATION ====================

export const DASHBOARD_DEFINITIONS: Record<DashboardType, DashboardDefinition> = {
  project_management: {
    id: 'project_management',
    name: 'Project Management',
    description: 'Core project management features and daily operations',
    category: 'core',
    icon: 'BuildingOfficeIcon',
    roles: ['super_admin', 'company_admin', 'project_manager', 'supervisor', 'field_worker'],
    features: [
      'tasks',
      'daily_logs',
      'photos',
      'rfis',
      'punch_lists',
      'drawings',
      'documents',
      'time_tracking'
    ],
    navigationGroup: 'projects',
    priority: 1
  },

  company_admin: {
    id: 'company_admin',
    name: 'Company Administration',
    description: 'Company-wide administration and management tools',
    category: 'admin',
    icon: 'BuildingOfficeIcon',
    roles: ['super_admin', 'company_admin'],
    features: [
      'user_management',
      'team_collaboration',
      'billing_payments',
      'company_analytics',
      'project_templates',
      'company_settings'
    ],
    navigationGroup: 'administration',
    priority: 2
  },

  platform_admin: {
    id: 'platform_admin',
    name: 'Platform Administration',
    description: 'Super admin platform management and oversight',
    category: 'admin',
    icon: 'ShieldCheckIcon',
    roles: ['super_admin'],
    features: [
      'platform_analytics',
      'user_audit',
      'system_settings',
      'tenant_management',
      'global_reports',
      'security_monitoring'
    ],
    navigationGroup: 'platform',
    priority: 3
  },

  developer_tools: {
    id: 'developer_tools',
    name: 'Developer Tools',
    description: 'SDK tools and development environment',
    category: 'development',
    icon: 'CodeBracketIcon',
    roles: ['super_admin', 'developer'],
    features: [
      'code_generator',
      'api_testing',
      'debug_tools',
      'documentation',
      'sample_projects',
      'integration_testing'
    ],
    navigationGroup: 'development',
    priority: 4
  },

  sdk_workspace: {
    id: 'sdk_workspace',
    name: 'SDK Workspace',
    description: 'Complete development environment and workspace',
    category: 'development',
    icon: 'RectangleStackIcon',
    roles: ['super_admin', 'developer'],
    features: [
      'ai_builder',
      'workflow_designer',
      'agent_orchestration',
      'sandbox_environment',
      'version_control',
      'deployment_tools'
    ],
    navigationGroup: 'development',
    priority: 5
  },

  developer_dashboard: {
    id: 'developer_dashboard',
    name: 'Developer Dashboard',
    description: 'Developer analytics and performance monitoring',
    category: 'development',
    icon: 'ChartBarIcon',
    roles: ['super_admin', 'developer'],
    features: [
      'usage_analytics',
      'cost_monitoring',
      'performance_metrics',
      'api_usage',
      'error_tracking',
      'optimization_insights'
    ],
    navigationGroup: 'development',
    priority: 6
  },

  ai_marketplace: {
    id: 'ai_marketplace',
    name: 'AI Marketplace',
    description: 'AI agents and automation marketplace',
    category: 'marketplace',
    icon: 'ShoppingBagIcon',
    roles: ['super_admin', 'company_admin', 'developer', 'project_manager'],
    features: [
      'agent_browse',
      'template_library',
      'community_agents',
      'custom_agents',
      'reviews_ratings',
      'installation_tools'
    ],
    navigationGroup: 'marketplace',
    priority: 7
  },

  automation_studio: {
    id: 'automation_studio',
    name: 'Automation Studio',
    description: 'Workflow automation and integration tools',
    category: 'development',
    icon: 'ArrowPathIcon',
    roles: ['super_admin', 'company_admin', 'developer'],
    features: [
      'workflow_builder',
      'integration_hub',
      'webhook_manager',
      'automation_templates',
      'testing_tools',
      'deployment_manager'
    ],
    navigationGroup: 'development',
    priority: 8
  }
};

// ==================== NAVIGATION GROUPS ====================

export const NAVIGATION_GROUPS: Record<string, NavigationGroup> = {
  projects: {
    id: 'projects',
    name: 'Project Management',
    description: 'Core project operations and daily workflows',
    dashboards: ['project_management'],
    collapsible: false
  },

  administration: {
    id: 'administration',
    name: 'Administration',
    description: 'Company and platform administration tools',
    dashboards: ['company_admin', 'platform_admin'],
    collapsible: true,
    defaultCollapsed: true
  },

  development: {
    id: 'development',
    name: 'Development & SDK',
    description: 'Developer tools, SDK workspace, and automation',
    dashboards: ['developer_tools', 'sdk_workspace', 'developer_dashboard', 'automation_studio'],
    collapsible: true,
    defaultCollapsed: false
  },

  marketplace: {
    id: 'marketplace',
    name: 'Marketplace',
    description: 'AI agents and automation marketplace',
    dashboards: ['ai_marketplace'],
    collapsible: false
  }
};

// ==================== ROLE-BASED ACCESS ====================

export const getAccessibleDashboards = (userRole: UserRole): DashboardType[] => {
  return Object.values(DASHBOARD_DEFINITIONS)
    .filter(dashboard => dashboard.roles.includes(userRole))
    .sort((a, b) => a.priority - b.priority)
    .map(dashboard => dashboard.id);
};

export const getDashboardsByCategory = (category: DashboardCategory, userRole: UserRole): DashboardDefinition[] => {
  return Object.values(DASHBOARD_DEFINITIONS)
    .filter(dashboard => dashboard.category === category && dashboard.roles.includes(userRole))
    .sort((a, b) => a.priority - b.priority);
};

export const getNavigationGroupsForUser = (userRole: UserRole): NavigationGroup[] => {
  const accessibleDashboards = getAccessibleDashboards(userRole);
  const groupsWithAccess = Object.values(NAVIGATION_GROUPS)
    .filter(group => group.dashboards.some(dashboard => accessibleDashboards.includes(dashboard)))
    .map(group => ({
      ...group,
      dashboards: group.dashboards.filter(dashboard => accessibleDashboards.includes(dashboard))
    }));

  return groupsWithAccess;
};

// ==================== FEATURE ACCESS CONTROL ====================

export const canAccessFeature = (userRole: UserRole, feature: string): boolean => {
  const accessibleDashboards = getAccessibleDashboards(userRole);

  return Object.values(DASHBOARD_DEFINITIONS)
    .some(dashboard =>
      accessibleDashboards.includes(dashboard.id) &&
      dashboard.features.includes(feature)
    );
};

export const getAccessibleFeatures = (userRole: UserRole): string[] => {
  const accessibleDashboards = getAccessibleDashboards(userRole);

  const features = new Set<string>();
  Object.values(DASHBOARD_DEFINITIONS)
    .filter(dashboard => accessibleDashboards.includes(dashboard.id))
    .forEach(dashboard => {
      dashboard.features.forEach(feature => features.add(feature));
    });

  return Array.from(features).sort();
};

// ==================== DASHBOARD ROUTING ====================

export const getDashboardRoute = (dashboardType: DashboardType): string => {
  const routeMap: Record<DashboardType, string> = {
    project_management: '/dashboard',
    company_admin: '/company-admin-dashboard',
    platform_admin: '/platform-admin',
    developer_tools: '/developer-console',
    sdk_workspace: '/sdk-developer',
    developer_dashboard: '/developer-dashboard',
    ai_marketplace: '/ai-agents-marketplace',
    automation_studio: '/automation-studio'
  };

  return routeMap[dashboardType] || '/dashboard';
};

// ==================== UTILITY FUNCTIONS ====================

export const isDevelopmentRole = (role: UserRole): boolean => {
  return ['super_admin', 'developer'].includes(role);
};

export const isAdminRole = (role: UserRole): boolean => {
  return ['super_admin', 'company_admin'].includes(role);
};

export const getDashboardInfo = (dashboardType: DashboardType): DashboardDefinition => {
  return DASHBOARD_DEFINITIONS[dashboardType];
};

export const getNavigationGroupInfo = (groupId: string): NavigationGroup => {
  return NAVIGATION_GROUPS[groupId];
};