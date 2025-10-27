import React from 'react';
import { Screen, PermissionSubject, PermissionAction } from './types';
import {
    BanknotesIcon,
    CalculatorIcon,
    ScaleIcon,
    ShieldCheckIcon,
    BriefcaseIcon,
    DocumentMagnifyingGlassIcon,
    IdentificationIcon,
    DocumentDuplicateIcon,
    CameraIcon,
    DocumentIcon,
    ClockIcon,
    PresentationChartLineIcon,
    CircleStackIcon,
    CurrencyPoundIcon,
    UsersIcon
} from './components/Icons';

export interface ToolDefinition {
    title: string;
    description: string;
    icon: React.FC<{ className?: string }>;
    screen: Screen;
    permission: {
        subject: PermissionSubject;
        action: PermissionAction;
    };
    requiresProjectContext?: boolean;
}

export const ACCOUNTING_TOOLS: ToolDefinition[] = [
    { title: 'Invoicing', description: 'Create and manage client invoices.', icon: BanknotesIcon, screen: 'placeholder-tool', permission: { subject: 'accounting', action: 'create' } },
    { title: 'Chart of Accounts', description: 'Manage your company\'s financial accounts.', icon: ScaleIcon, screen: 'placeholder-tool', permission: { subject: 'accounting', action: 'read' } },
    { title: 'Tax Preparation', description: 'AI-assisted tax document preparation.', icon: CalculatorIcon, screen: 'placeholder-tool', permission: { subject: 'accounting', action: 'read' } },
];

export const AI_TOOLS: ToolDefinition[] = [
    { title: 'Quality Control Vision', description: 'AI-powered image analysis for construction quality assessment', icon: CameraIcon, screen: 'quality-control-vision', permission: { subject: 'document', action: 'read' } },
    { title: 'Document Intelligence', description: 'Extract insights from construction documents and blueprints', icon: DocumentIcon, screen: 'document-intelligence', permission: { subject: 'document', action: 'read' } },
    { title: 'Risk Assessment AI', description: 'Predictive analytics for project risk management', icon: ShieldCheckIcon, screen: 'risk-assessment-ai', permission: { subject: 'task', action: 'read' } },
    { title: 'Cost Optimization', description: 'AI-driven cost analysis and budget optimization', icon: CurrencyPoundIcon, screen: 'cost-optimization', permission: { subject: 'accounting', action: 'read' } },
];

export const DOCUMENT_MANAGEMENT_TOOLS: ToolDefinition[] = [
    { title: 'Drawing Sets', description: 'View and manage all project drawings.', icon: DocumentDuplicateIcon, screen: 'drawings', permission: { subject: 'drawing', action: 'read' }, requiresProjectContext: true },
    { title: 'Photo Galleries', description: 'Browse and upload site photos.', icon: CameraIcon, screen: 'photos', permission: { subject: 'photo', action: 'read' }, requiresProjectContext: true },
    { title: 'Official Documents', description: 'Store contracts, permits, and reports.', icon: DocumentIcon, screen: 'documents', permission: { subject: 'document', action: 'read' }, requiresProjectContext: true },
];

export const TIME_TRACKING_TOOLS: ToolDefinition[] = [
    { title: 'Live Time Entry', description: 'Clock in and out for tasks.', icon: ClockIcon, screen: 'placeholder-tool', permission: { subject: 'timeEntry', action: 'create' } },
    { title: 'Timesheet Reports', description: 'Generate and review timesheets.', icon: PresentationChartLineIcon, screen: 'placeholder-tool', permission: { subject: 'timeEntry', action: 'read' } },
];

export const PROJECT_OPERATIONS_TOOLS: ToolDefinition[] = [
    { title: 'Risk Assessments (RAMS)', description: 'Create and manage Risk Assessment Method Statements.', icon: ShieldCheckIcon, screen: 'placeholder-tool', permission: { subject: 'document', action: 'create' } },
    { title: 'Training Matrix', description: 'Track employee qualifications and training.', icon: IdentificationIcon, screen: 'placeholder-tool', permission: { subject: 'user', action: 'read' } },
];

export const FINANCIAL_MANAGEMENT_TOOLS: ToolDefinition[] = [
    { title: 'Company Payroll', description: 'Process payroll for all employees.', icon: CurrencyPoundIcon, screen: 'placeholder-tool', permission: { subject: 'accounting', action: 'create' } },
    { title: 'Project Budgets', description: 'Track budgets and spending per project.', icon: CircleStackIcon, screen: 'placeholder-tool', permission: { subject: 'accounting', action: 'read' } },
];

export const BUSINESS_DEVELOPMENT_TOOLS: ToolDefinition[] = [
    { title: 'CRM', description: 'Manage client relationships and leads.', icon: UsersIcon, screen: 'placeholder-tool', permission: { subject: 'user', action: 'read' } },
    { title: 'Procurement Hub', description: 'Manage suppliers and procurement processes.', icon: BriefcaseIcon, screen: 'placeholder-tool', permission: { subject: 'document', action: 'read' } },
];