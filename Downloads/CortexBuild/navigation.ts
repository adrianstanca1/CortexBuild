import { Screen, PermissionSubject, PermissionAction } from './types.ts';

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
        label: 'Accounting',
        screen: 'accounting',
        permission: { subject: 'accounting', action: 'read' },
    },
    {
        label: 'AI Tools',
        children: [
            { label: 'AI Agents Marketplace', screen: 'ai-agents-marketplace', permission: { subject: 'user', action: 'read' } },
            { label: 'AI Tools Suite', screen: 'ai-tools', permission: { subject: 'task', action: 'read' } },
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