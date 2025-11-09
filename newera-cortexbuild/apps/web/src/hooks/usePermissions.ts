import { useCallback, useRef } from 'react';
import type { PermissionAction, PermissionSubject, User } from '@newera/types';
import { can as canCheck } from '../lib/permissions';

export function usePermissions(currentUser?: User) {
  const ref = useRef(currentUser);
  ref.current = currentUser;

  const can = useCallback((action: PermissionAction, subject: PermissionSubject) => {
    const user = ref.current;
    if (!user) return false;
    return canCheck(user.role, action, subject);
  }, []);

  return { can };
}
