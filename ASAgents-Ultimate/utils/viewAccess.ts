import { Permission, Role, User, View } from '../types';
import { hasPermission } from '../services/auth';

export interface ViewMetadata {
  title: string;
  description: string;
}

export interface ViewAccessRule {
  anyPermissions?: Permission[];
  allPermissions?: Permission[];
  allowedRoles?: Role[];
  description?: string;
  fallbackView?: View;
}

export interface ViewAccessEvaluation {
  view: View;
  allowed: boolean;
  missingPermissions: Permission[];
  missingAnyPermissionGroups: Permission[][];
  allowedRoles?: Role[];
  reason?: string;
  fallbackView?: View;
}

const projectVisibilityRule: ViewAccessRule = {
  anyPermissions: [Permission.VIEW_ALL_PROJECTS, Permission.VIEW_ASSIGNED_PROJECTS],
  description: 'Project visibility is required to review portfolio information.',
};

const documentVisibilityRule: ViewAccessRule = {
  anyPermissions: [Permission.VIEW_DOCUMENTS, Permission.UPLOAD_DOCUMENTS],
  description: 'Document access is needed to browse project files and upload content.',
};

const safetyRule: ViewAccessRule = {
  anyPermissions: [Permission.VIEW_SAFETY_REPORTS, Permission.SUBMIT_SAFETY_REPORT],
  description: 'Safety permissions ensure only authorised crew can view and log incidents.',
};

const financialRule: ViewAccessRule = {
  anyPermissions: [Permission.VIEW_FINANCES, Permission.MANAGE_FINANCES],
  description: 'Financial permissions allow visibility into invoices, payments and cost tracking.',
};

export const viewMetadata: Record<View, ViewMetadata> = {
  dashboard: {
    title: 'Operations Overview',
    description: 'High-level summary of current projects, teams and resources.',
  },
  'my-day': {
    title: 'My Day',
    description: 'Personalised task list and checkpoints for field teams.',
  },
  'foreman-dashboard': {
    title: 'Field Operations',
    description: 'Site level insights and crew coordination tools.',
  },
  'principal-dashboard': {
    title: 'Platform Administration',
    description: 'Portfolio-wide analytics and partner performance.',
  },
  projects: {
    title: 'Projects',
    description: 'Monitor schedules, risk and budget performance across every job.',
  },
  'project-detail': {
    title: 'Project Detail',
    description: 'Deep dive into milestones, tasks and resourcing for a single project.',
  },
  'all-tasks': {
    title: 'Work Coordination',
    description: 'Aggregate kanban to review task status and unblock teams quickly.',
  },
  map: {
    title: 'Project Map',
    description: 'Geospatial view of active sites and crews.',
  },
  time: {
    title: 'Time Clock',
    description: 'Log hours worked and review current shifts.',
  },
  timesheets: {
    title: 'Timesheets',
    description: 'Approve or reconcile submitted timesheets and labour entries.',
  },
  documents: {
    title: 'Documents',
    description: 'Organise drawings, RFIs and project artefacts.',
  },
  safety: {
    title: 'Safety',
    description: 'Capture incidents, toolbox talks and compliance checks.',
  },
  financials: {
    title: 'Financials',
    description: 'Budget consumption, forecasts and commercial analytics.',
  },
  users: {
    title: 'Teams',
    description: 'Manage workforce availability and role assignments.',
  },
  equipment: {
    title: 'Equipment',
    description: 'Asset readiness, maintenance and utilisation.',
  },
  templates: {
    title: 'Templates',
    description: 'Reusable project schedules, workflows and document sets.',
  },
  tools: {
    title: 'Toolbox',
    description: 'Access to AI copilots and productivity extensions.',
  },
  'audit-log': {
    title: 'Audit Log',
    description: 'System activity trail for compliance and investigations.',
  },
  settings: {
    title: 'Workspace Settings',
    description: 'Company preferences, billing and platform configuration.',
  },
  chat: {
    title: 'Messages',
    description: 'Direct and group messaging across crews and partners.',
  },
  clients: {
    title: 'Clients',
    description: 'CRM overview of customer accounts and health.',
  },
  invoices: {
    title: 'Invoices',
    description: 'Billing pipeline, receivables and payment status.',
  },
};

export const viewAccessRules: Partial<Record<View, ViewAccessRule>> = {
  projects: projectVisibilityRule,
  map: projectVisibilityRule,
  'project-detail': projectVisibilityRule,
  'all-tasks': {
    anyPermissions: [Permission.VIEW_ALL_TASKS, Permission.MANAGE_ALL_TASKS],
    description: 'Task visibility is required to review and manage work packages.',
  },
  time: {
    anyPermissions: [Permission.SUBMIT_TIMESHEET, Permission.MANAGE_TIMESHEETS],
    description: 'Only authorised crew can log or manage time entries.',
  },
  timesheets: {
    anyPermissions: [Permission.VIEW_ALL_TIMESHEETS, Permission.MANAGE_TIMESHEETS],
    description: 'Timesheet approval rights are needed to review labour history.',
  },
  documents: documentVisibilityRule,
  safety: safetyRule,
  financials: financialRule,
  invoices: financialRule,
  users: {
    anyPermissions: [Permission.VIEW_TEAM, Permission.MANAGE_TEAM],
    description: 'Team administration requires workforce visibility permissions.',
  },
  equipment: {
    anyPermissions: [Permission.MANAGE_EQUIPMENT],
    description: 'Equipment control ensures assets are managed by the operations team.',
  },
  templates: {
    anyPermissions: [Permission.MANAGE_PROJECT_TEMPLATES],
    description: 'Template library is reserved for portfolio leads.',
  },
  tools: {
    anyPermissions: [Permission.ACCESS_ALL_TOOLS],
    description: 'Toolbox modules are restricted to teams with platform extensions.',
  },
  'audit-log': {
    anyPermissions: [Permission.VIEW_AUDIT_LOG],
    description: 'Audit information is available to compliance and admin roles.',
  },
  chat: {
    anyPermissions: [Permission.SEND_DIRECT_MESSAGE],
    description: 'Messaging requires communication privileges.',
  },
  clients: {
    anyPermissions: [Permission.VIEW_ALL_PROJECTS, Permission.MANAGE_FINANCES],
    description: 'Client records are tied to portfolio or commercial permissions.',
  },
  'foreman-dashboard': {
    allowedRoles: [Role.FOREMAN, Role.PROJECT_MANAGER, Role.ADMIN, Role.OWNER],
    description: 'Field dashboards are tailored for operations leadership.',
    fallbackView: 'dashboard',
  },
  'principal-dashboard': {
    allowedRoles: [Role.PRINCIPAL_ADMIN],
    description: 'Only platform administrators can access the principal dashboard.',
    fallbackView: 'dashboard',
  },
};

export const getDefaultViewForUser = (user: User): View => {
  switch (user.role) {
    case Role.OPERATIVE:
      return 'my-day';
    case Role.FOREMAN:
      return 'foreman-dashboard';
    case Role.PRINCIPAL_ADMIN:
      return 'principal-dashboard';
    default:
      return 'dashboard';
  }
};

export const getViewDisplayName = (view: View): string => viewMetadata[view]?.title ?? view;

export const evaluateViewAccess = (user: User, view: View): ViewAccessEvaluation => {
  const rule = viewAccessRules[view];

  if (!rule) {
    return {
      view,
      allowed: true,
      missingPermissions: [],
      missingAnyPermissionGroups: [],
    };
  }

  if (rule.allowedRoles && !rule.allowedRoles.includes(user.role)) {
    return {
      view,
      allowed: false,
      missingPermissions: [],
      missingAnyPermissionGroups: [],
      allowedRoles: rule.allowedRoles,
      reason: rule.description,
      fallbackView: rule.fallbackView,
    };
  }

  const missingPermissions: Permission[] = [];
  const missingAnyGroups: Permission[][] = [];

  if (rule.anyPermissions) {
    const hasAny = rule.anyPermissions.some(permission => hasPermission(user, permission));
    if (!hasAny) {
      missingAnyGroups.push(rule.anyPermissions);
      missingPermissions.push(...rule.anyPermissions);
    }
  }

  if (rule.allPermissions) {
    const missing = rule.allPermissions.filter(permission => !hasPermission(user, permission));
    missingPermissions.push(...missing);
  }

  if (missingPermissions.length > 0 || missingAnyGroups.length > 0) {
    return {
      view,
      allowed: false,
      missingPermissions,
      missingAnyPermissionGroups: missingAnyGroups,
      reason: rule.description,
      fallbackView: rule.fallbackView,
    };
  }

  return {
    view,
    allowed: true,
    missingPermissions: [],
    missingAnyPermissionGroups: [],
  };
};

export const canAccessView = (user: User, view: View): boolean => evaluateViewAccess(user, view).allowed;

