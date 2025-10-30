import { can } from '../../permissions';
import type { UserRole, PermissionAction, PermissionSubject } from '../../types';

export function canUser(role: UserRole, action: PermissionAction, subject: PermissionSubject): boolean {
  return can(role, action, subject);
}


