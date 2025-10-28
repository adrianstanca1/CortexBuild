// FIX: Corrected import paths to be relative.
import { User, Permission, RolePermissions, Role } from '../types';

/**
 * Checks if a user has a specific permission based on their role.
 * This is the central function for all access control in the application.
 * @param user The user object.
 * @param permission The permission to check for.
 * @returns True if the user has the permission, false otherwise.
 */
export const hasPermission = (user: User | null, permission: Permission): boolean => {
    if (!user) {
        return false;
    }
    // Principal admin has all permissions.
    if (user.role === Role.PRINCIPAL_ADMIN) {
        return true;
    }
    const userPermissions = RolePermissions[user.role];
    if (!userPermissions) {
        return false; // Role has no permissions defined
    }
    return userPermissions.has(permission);
};
