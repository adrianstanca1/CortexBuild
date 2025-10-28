export type UserRole = 'admin' | 'project_manager' | 'foreman' | 'worker' | 'client';

export type Permission =
  | 'view_all_projects'
  | 'create_project'
  | 'edit_project'
  | 'delete_project'
  | 'manage_users'
  | 'view_financials'
  | 'edit_financials'
  | 'view_tasks'
  | 'create_task'
  | 'edit_task'
  | 'delete_task'
  | 'assign_task'
  | 'view_reports'
  | 'view_team'
  | 'manage_team'
  | 'view_materials'
  | 'manage_materials'
  | 'view_timesheets'
  | 'edit_timesheets'
  | 'approve_timesheets'
  | 'view_own_project'
  | 'view_own_tasks';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoleConfig {
  role: UserRole;
  displayName: string;
  permissions: Permission[];
  description: string;
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'view_all_projects',
    'create_project',
    'edit_project',
    'delete_project',
    'manage_users',
    'view_financials',
    'edit_financials',
    'view_tasks',
    'create_task',
    'edit_task',
    'delete_task',
    'assign_task',
    'view_reports',
    'view_team',
    'manage_team',
    'view_materials',
    'manage_materials',
    'view_timesheets',
    'edit_timesheets',
    'approve_timesheets',
  ],
  project_manager: [
    'view_all_projects',
    'create_project',
    'edit_project',
    'view_financials',
    'view_tasks',
    'create_task',
    'edit_task',
    'assign_task',
    'view_reports',
    'view_team',
    'view_materials',
    'manage_materials',
    'view_timesheets',
    'approve_timesheets',
  ],
  foreman: [
    'view_all_projects',
    'view_tasks',
    'create_task',
    'edit_task',
    'assign_task',
    'view_team',
    'view_materials',
    'view_timesheets',
    'edit_timesheets',
  ],
  worker: [
    'view_own_tasks',
    'view_own_project',
    'view_materials',
    'view_timesheets',
  ],
  client: [
    'view_own_project',
    'view_reports',
  ],
};

export const ROLE_CONFIG: Record<UserRole, RoleConfig> = {
  admin: {
    role: 'admin',
    displayName: 'Administrator',
    permissions: ROLE_PERMISSIONS.admin,
    description: 'Full system access with all permissions',
  },
  project_manager: {
    role: 'project_manager',
    displayName: 'Project Manager',
    permissions: ROLE_PERMISSIONS.project_manager,
    description: 'Manage projects, teams, and budgets',
  },
  foreman: {
    role: 'foreman',
    displayName: 'Foreman',
    permissions: ROLE_PERMISSIONS.foreman,
    description: 'Oversee daily operations and workers',
  },
  worker: {
    role: 'worker',
    displayName: 'Worker',
    permissions: ROLE_PERMISSIONS.worker,
    description: 'View assigned tasks and log work',
  },
  client: {
    role: 'client',
    displayName: 'Client',
    permissions: ROLE_PERMISSIONS.client,
    description: 'View project progress and reports',
  },
};
