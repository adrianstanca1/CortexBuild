import { useMemo } from 'react';
import { User, PermissionAction, PermissionSubject } from '../types';
import { can as canCheck } from '../permissions';

/**
 * Custom hook to provide a convenient 'can' function for the current user.
 * @param currentUser The currently logged-in user object.
 * @returns An object with a 'can' function.
 */
export const usePermissions = (currentUser: User) => {
    const permissions = useMemo(() => {
        /**
         * Checks if the current user can perform a given action on a subject.
         * @example const { can } = usePermissions(currentUser);
         * if (can('create', 'task')) { ... }
         */
        const can = (action: PermissionAction, subject: PermissionSubject): boolean => {
            if (!currentUser) return false;
            return canCheck(currentUser.role, action, subject);
        };

        return { can };
    }, [currentUser]);

    return permissions;
};