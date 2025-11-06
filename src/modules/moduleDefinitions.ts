/**
 * CortexBuild Module Definitions
 * All application modules registered here
 */

import { ModuleConfig, createModule, createRoleModule, createPublicModule } from './ModuleRegistry';

// ============================================
// CORE MODULES
// ============================================

export const coreModules: ModuleConfig[] = [
    createPublicModule(
        'global-dashboard',
        {
            id: 'core.dashboard',
            name: 'Dashboard',
            description: 'Unified dashboard with project overview',
            version: '2.0.0',
            category: 'core'
        },
        () => import('../../components/screens/UnifiedDashboardScreen')
    ),

    createPublicModule(
        'projects',
        {
            id: 'core.projects',
            name: 'Projects',
            description: 'Project list and management',
            version: '2.0.0',
            category: 'core'
        },
        () => import('../../components/screens/ProjectsListScreen')
    ),

    createPublicModule(
        'project-home',
        {
            id: 'core.project-home',
            name: 'Project Home',
            description: 'Project dashboard and overview',
            version: '2.0.0',
            category: 'project'
        },
        () => import('../../components/screens/ProjectHomeScreen')
    ),

    createPublicModule(
        'my-day',
        {
            id: 'core.my-day',
            name: 'My Day',
            description: 'Daily tasks and activities',
            version: '2.0.0',
            category: 'core'
        },
        () => import('../../components/screens/MyDayScreen')
    ),

    createPublicModule(
        'tasks',
        {
            id: 'core.tasks',
            name: 'Tasks',
            description: 'Task management',
            version: '2.0.0',
            category: 'project'
        },
        () => import('../../components/screens/TasksScreen')
    ),

    createPublicModule(
        'my-tasks',
        {
            id: 'core.my-tasks',
            name: 'My Tasks',
            description: 'Personal task list',
            version: '2.0.0',
            category: 'core'
        },
        () => import('../../components/screens/MyTasksScreen')
    ),
];

// ============================================
// AI & AUTOMATION MODULES
// ============================================

export const aiModules: ModuleConfig[] = [
    createPublicModule(
        'ai-tools',
        {
            id: 'ai.tools',
            name: 'AI Tools Suite',
            description: 'AI-powered construction tools',
            version: '2.0.0',
            category: 'ai',
            tags: ['ai', 'automation', 'ml']
        },
        () => import('../../components/screens/modules/AIToolsScreen')
    ),

    createPublicModule(
        'construction-oracle',
        {
            id: 'ai.oracle',
            name: 'Construction Oracle',
            description: 'AI assistant for construction insights',
            version: '2.0.0',
            category: 'ai',
            tags: ['ai', 'assistant', 'insights']
        },
        () => import('../../components/ai/ConstructionOracle')
    ),

    createPublicModule(
        'ai-agents-marketplace',
        {
            id: 'ai.marketplace',
            name: 'AI Agents Marketplace',
            description: 'Browse and install AI agents',
            version: '2.0.0',
            category: 'marketplace',
            tags: ['ai', 'marketplace', 'agents']
        },
        () => import('../../components/screens/modules/AIAgentsMarketplaceScreen')
    ),
];

// ============================================
// DEVELOPER MODULES
// ============================================

export const developerModules: ModuleConfig[] = [
    createRoleModule(
        'developer-dashboard',
        {
            id: 'dev.dashboard',
            name: 'Developer Dashboard',
            description: 'Developer tools and analytics',
            version: '2.0.0',
            category: 'developer',
            tags: ['developer', 'dashboard']
        },
        () => import('../../components/screens/developer/DeveloperDashboardV2'),
        ['developer', 'super_admin']
    ),

    createRoleModule(
        'developer-console',
        {
            id: 'dev.console',
            name: 'Developer Console',
            description: 'Advanced developer console',
            version: '2.0.0',
            category: 'developer',
            tags: ['developer', 'console', 'debug']
        },
        () => import('../../components/screens/developer/EnhancedDeveloperConsole'),
        ['developer', 'super_admin']
    ),

    createRoleModule(
        'automation-studio',
        {
            id: 'dev.automation',
            name: 'Automation Studio',
            description: 'Build and manage automations',
            version: '2.0.0',
            category: 'developer',
            tags: ['developer', 'automation', 'workflows']
        },
        () => import('../../components/screens/developer/ConstructionAutomationStudio'),
        ['developer', 'super_admin', 'company_admin']
    ),

    createRoleModule(
        'sdk-developer',
        {
            id: 'dev.sdk',
            name: 'SDK Workspace',
            description: 'SDK development environment',
            version: '2.0.0',
            category: 'developer',
            tags: ['developer', 'sdk', 'api']
        },
        () => import('../../components/sdk/ProductionSDKDeveloperView').then(module => ({
            default: module.ProductionSDKDeveloperView
        })),
        ['developer', 'super_admin']
    ),

    createRoleModule(
        'developer-workspace',
        {
            id: 'dev.workspace',
            name: 'Developer Workspace',
            description: 'Integrated development workspace',
            version: '2.0.0',
            category: 'developer',
            tags: ['developer', 'workspace', 'ide']
        },
        () => import('../../components/screens/developer/DeveloperWorkspaceScreen'),
        ['developer', 'super_admin']
    ),

    createRoleModule(
        'n8n-procore-builder',
        {
            id: 'dev.n8n',
            name: 'N8N Workflow Builder',
            description: 'Build Procore integrations with N8N',
            version: '2.0.0',
            category: 'developer',
            tags: ['developer', 'n8n', 'workflows', 'procore']
        },
        () => import('../../components/sdk/N8nProcoreWorkflowBuilder'),
        ['developer', 'super_admin', 'company_admin']
    ),
];

// ============================================
// ADMIN MODULES
// ============================================

export const adminModules: ModuleConfig[] = [
    createRoleModule(
        'super-admin-dashboard',
        {
            id: 'admin.super',
            name: 'Super Admin Dashboard',
            description: 'Platform administration',
            version: '2.0.0',
            category: 'admin',
            tags: ['admin', 'platform']
        },
        () => import('../../components/screens/admin/SuperAdminDashboardScreen'),
        ['super_admin']
    ),

    createRoleModule(
        'platform-admin',
        {
            id: 'admin.platform',
            name: 'Platform Admin',
            description: 'Platform configuration and management',
            version: '2.0.0',
            category: 'admin',
            tags: ['admin', 'platform', 'config']
        },
        () => import('../../components/screens/admin/PlatformAdminScreen'),
        ['super_admin']
    ),

    createRoleModule(
        'admin-control-panel',
        {
            id: 'admin.control',
            name: 'Admin Control Panel',
            description: 'System control and monitoring',
            version: '2.0.0',
            category: 'admin',
            tags: ['admin', 'control', 'monitoring']
        },
        () => import('../../components/admin/AdminControlPanel'),
        ['super_admin']
    ),

    createRoleModule(
        'company-admin-dashboard',
        {
            id: 'admin.company',
            name: 'Company Admin Dashboard',
            description: 'Company administration',
            version: '2.0.0',
            category: 'company',
            tags: ['admin', 'company']
        },
        () => import('../../components/screens/company/CompanyAdminDashboardV2'),
        ['company_admin', 'super_admin']
    ),
];

// ============================================
// BUSINESS MODULES
// ============================================

export const businessModules: ModuleConfig[] = [
    createPublicModule(
        'accounting',
        {
            id: 'business.accounting',
            name: 'Accounting',
            description: 'Financial accounting and reporting',
            version: '2.0.0',
            category: 'financial',
            tags: ['accounting', 'finance']
        },
        () => import('../../components/screens/modules/AccountingScreen')
    ),

    createPublicModule(
        'financial-management',
        {
            id: 'business.financial',
            name: 'Financial Management',
            description: 'Budget and cost management',
            version: '2.0.0',
            category: 'financial',
            tags: ['finance', 'budget', 'cost']
        },
        () => import('../../components/screens/modules/FinancialManagementScreen')
    ),

    createPublicModule(
        'business-development',
        {
            id: 'business.development',
            name: 'Business Development',
            description: 'Sales and business growth',
            version: '2.0.0',
            category: 'operations',
            tags: ['business', 'sales', 'growth']
        },
        () => import('../../components/screens/modules/BusinessDevelopmentScreen')
    ),
];

// ============================================
// PROJECT MODULES
// ============================================

export const projectModules: ModuleConfig[] = [
    createPublicModule(
        'rfis',
        {
            id: 'project.rfis',
            name: 'RFIs',
            description: 'Request for Information management',
            version: '2.0.0',
            category: 'project',
            tags: ['rfi', 'communication']
        },
        () => import('../../components/screens/RFIsScreen')
    ),

    createPublicModule(
        'documents',
        {
            id: 'project.documents',
            name: 'Documents',
            description: 'Document management',
            version: '2.0.0',
            category: 'project',
            tags: ['documents', 'files']
        },
        () => import('../../components/screens/DocumentsScreen')
    ),

    createPublicModule(
        'document-management',
        {
            id: 'project.doc-mgmt',
            name: 'Document Management',
            description: 'Advanced document management',
            version: '2.0.0',
            category: 'project',
            tags: ['documents', 'management']
        },
        () => import('../../components/screens/modules/DocumentManagementScreen')
    ),

    createPublicModule(
        'time-tracking',
        {
            id: 'project.time',
            name: 'Time Tracking',
            description: 'Time and attendance tracking',
            version: '2.0.0',
            category: 'operations',
            tags: ['time', 'tracking', 'attendance']
        },
        () => import('../../components/screens/modules/TimeTrackingScreen')
    ),

    createPublicModule(
        'project-operations',
        {
            id: 'project.operations',
            name: 'Project Operations',
            description: 'Project operations and management',
            version: '2.0.0',
            category: 'operations',
            tags: ['operations', 'management']
        },
        () => import('../../components/screens/modules/ProjectOperationsScreen')
    ),
];

// ============================================
// MARKETPLACE MODULES
// ============================================

export const marketplaceModules: ModuleConfig[] = [
    createPublicModule(
        'marketplace',
        {
            id: 'marketplace.global',
            name: 'Global Marketplace',
            description: 'Browse and install modules',
            version: '2.0.0',
            category: 'marketplace',
            tags: ['marketplace', 'modules']
        },
        () => import('../../components/marketplace/GlobalMarketplace')
    ),

    createPublicModule(
        'my-applications',
        {
            id: 'marketplace.my-apps',
            name: 'My Applications',
            description: 'Manage installed applications',
            version: '2.0.0',
            category: 'marketplace',
            tags: ['applications', 'installed']
        },
        () => import('../../components/applications/MyApplications')
    ),

    createPublicModule(
        'my-apps-desktop',
        {
            id: 'marketplace.desktop',
            name: 'Application Desktop',
            description: 'Application launcher desktop',
            version: '2.0.0',
            category: 'marketplace',
            tags: ['desktop', 'launcher']
        },
        () => import('../../components/base44/Base44Clone').then(module => ({
            default: module.Base44Clone
        }))
    ),

    createRoleModule(
        'admin-review',
        {
            id: 'marketplace.admin-review',
            name: 'Admin Review',
            description: 'Review marketplace submissions',
            version: '2.0.0',
            category: 'marketplace',
            tags: ['admin', 'review']
        },
        () => import('../../components/marketplace/AdminReviewInterface'),
        ['super_admin', 'company_admin']
    ),

    createRoleModule(
        'developer-submissions',
        {
            id: 'marketplace.dev-submit',
            name: 'Developer Submissions',
            description: 'Submit modules to marketplace',
            version: '2.0.0',
            category: 'marketplace',
            tags: ['developer', 'submit']
        },
        () => import('../../components/marketplace/DeveloperSubmissionInterface'),
        ['developer', 'super_admin']
    ),
];

// ============================================
// TOOLS MODULES
// ============================================

export const toolsModules: ModuleConfig[] = [
    createPublicModule(
        'placeholder-tool',
        {
            id: 'tools.placeholder',
            name: 'Placeholder Tool',
            description: 'Placeholder for future tools',
            version: '2.0.0',
            category: 'tools',
            tags: ['placeholder']
        },
        () => import('../../components/screens/tools/PlaceholderToolScreen')
    ),

    createPublicModule(
        'ml-analytics',
        {
            id: 'tools.ml-analytics',
            name: 'ML Analytics',
            description: 'Machine learning analytics dashboard',
            version: '2.0.0',
            category: 'ai',
            tags: ['ml', 'analytics', 'ai']
        },
        () => import('../../components/screens/dashboards/AdvancedMLDashboard')
    ),
];

// ============================================
// ALL MODULES EXPORT
// ============================================

export const allModules: ModuleConfig[] = [
    ...coreModules,
    ...aiModules,
    ...developerModules,
    ...adminModules,
    ...businessModules,
    ...projectModules,
    ...marketplaceModules,
    ...toolsModules,
];

