import { Screen, PermissionSubject, PermissionAction } from './types';

export interface MenuItem {
    label: string;
    screen?: Screen;
    permission?: {
        subject: PermissionSubject;
        action: PermissionAction;
    };
    children?: MenuItem[];
    requiresProjectContext?: boolean;
}

export const MENU_ITEMS: MenuItem[] = [
    {
        label: 'My Applications',
        screen: 'my-apps-desktop',
        permission: { subject: 'user', action: 'read' },
    },
    {
        label: 'Accounting',
        screen: 'accounting',
        permission: { subject: 'accounting', action: 'read' },
    },
    {
        label: 'AI Features',
        children: [
            { label: 'AI Recommendations', screen: 'ai-recommendations', permission: { subject: 'user', action: 'read' } },
            { label: 'AI Workflow Automation', screen: 'ai-workflow', permission: { subject: 'user', action: 'read' } },
            { label: 'Smart Task Assignment', screen: 'smart-task-assignment', permission: { subject: 'task', action: 'update' } },
        ]
    },
    {
        label: 'Mobile & Integration',
        children: [
            { label: 'Mobile Tools', screen: 'mobile-tools', permission: { subject: 'user', action: 'read' } },
            { label: 'Third-Party Integrations', screen: 'integrations', permission: { subject: 'user', action: 'read' } },
        ]
    },
    {
        label: 'Advanced Features',
        children: [
            { label: 'Advanced Search', screen: 'advanced-search', permission: { subject: 'user', action: 'read' } },
            { label: 'Bulk Operations', screen: 'bulk-operations', permission: { subject: 'task', action: 'update' } },
            { label: 'Collaboration Hub', screen: 'collaboration-hub', permission: { subject: 'user', action: 'read' } },
            { label: 'Advanced Analytics', screen: 'advanced-analytics', permission: { subject: 'user', action: 'read' } },
        ]
    },
    {
        label: 'Buildr-Inspired Features',
        children: [
            { label: 'Enhanced Dashboard', screen: 'buildr-dashboard', permission: { subject: 'user', action: 'read' } },
            { label: 'Enhanced Project Management', screen: 'enhanced-project-management', permission: { subject: 'task', action: 'read' } },
            { label: 'Enhanced Team Collaboration', screen: 'enhanced-team-collaboration', permission: { subject: 'user', action: 'read' } },
            { label: 'Enhanced Financial Tracking', screen: 'enhanced-financial-tracking', permission: { subject: 'accounting', action: 'read' } },
            { label: 'Enhanced Mobile Experience', screen: 'enhanced-mobile-experience', permission: { subject: 'user', action: 'read' } },
        ]
    },
    {
        label: 'AI Tools',
        children: [
            { label: 'AI Agents Marketplace', screen: 'ai-agents-marketplace', permission: { subject: 'user', action: 'read' } },
            { label: 'AI Tools Suite', screen: 'ai-tools', permission: { subject: 'task', action: 'read' } },
            { label: 'My Application Desktop', screen: 'myapplicationdesktop', permission: { subject: 'user', action: 'read' } },
        ]
    },
    {
        label: 'Document Management',
        children: [
            { label: 'All Documents', screen: 'document-management', permission: { subject: 'document', action: 'read' } },
            { label: 'Drawings', screen: 'drawings', permission: { subject: 'drawing', action: 'read' }, requiresProjectContext: true },
            { label: 'Photo Gallery', screen: 'photos', permission: { subject: 'photo', action: 'read' }, requiresProjectContext: true },
            { label: 'Reports', screen: 'documents', permission: { subject: 'document', action: 'read' }, requiresProjectContext: true },
        ]
    },
    {
        label: 'Time Tracking',
        screen: 'time-tracking',
        permission: { subject: 'timeEntry', action: 'read' },
    },
    {
        label: 'Project Operations',
        screen: 'project-operations',
        // No specific permission, acts as a container for tools
    },
    {
        label: 'Financial Management',
        screen: 'financial-management',
        permission: { subject: 'accounting', action: 'read' },
    },
    {
        label: 'Business Development',
        screen: 'business-development',
        // No specific permission
    },
    {
        label: 'Platform Admin',
        screen: 'platform-admin',
        permission: { subject: 'user', action: 'read' }, // Only super admins can access
    }
];