import type { PermissionAction, PermissionSubject, UserRole } from '@newera/types';

type RoleMatrix = Record<UserRole, Partial<Record<PermissionSubject, PermissionAction[] | 'all'>>>;

const ROLE_PERMISSIONS: RoleMatrix = {
  super_admin: {
    projects: 'all',
    rfis: 'all',
    finance: 'all',
    automation: 'all',
    copilot: 'all'
  },
  admin: {
    projects: 'all',
    rfis: 'all',
    finance: 'all',
    automation: ['view', 'create', 'update'],
    copilot: 'all'
  },
  project_manager: {
    projects: ['view', 'create', 'update'],
    rfis: ['view', 'create', 'update'],
    finance: ['view', 'create', 'update'],
    automation: ['view', 'create'],
    copilot: 'all'
  },
  field: {
    projects: ['view'],
    rfis: ['view', 'create'],
    finance: ['view'],
    automation: ['view'],
    copilot: ['view']
  },
  viewer: {
    projects: ['view'],
    rfis: ['view'],
    finance: ['view'],
    automation: ['view'],
    copilot: ['view']
  }
};

export function can(role: UserRole, action: PermissionAction, subject: PermissionSubject) {
  const rules = ROLE_PERMISSIONS[role];
  const subjectRules = rules?.[subject];
  if (!subjectRules) return false;
  if (subjectRules === 'all') return true;
  return subjectRules.includes(action);
}
