import { useCallback, useRef } from 'react';
import { User, PermissionAction, PermissionSubject } from '../types.ts';
import { can as canCheck } from '../permissions.ts';

/**
 * Custom hook to provide a convenient 'can' function for the current user.
 * Uses a ref pattern to prevent infinite loops when currentUser object changes.
 * @param currentUser The currently logged-in user object.
 * @returns An object with a 'can' function.
 */
export const usePermissions = (currentUser: User) => {
    // Use ref to hold the latest currentUser without creating dependencies
    const currentUserRef = useRef(currentUser);
    currentUserRef.current = currentUser;

    // Create a stable 'can' function with empty dependencies
    // This prevents infinite loops by never recreating the function
    const can = useCallback((action: PermissionAction, subject: PermissionSubject): boolean => {
        const user = currentUserRef.current;
        if (!user) return false;
        return canCheck(user.role, action, subject);
    }, []); // Empty deps - completely stable function

    return { can };
};