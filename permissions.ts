import { UserRole, PermissionAction, PermissionSubject } from './types';

// Define what actions are permitted for each role on each subject.
// 'all' means all actions (create, read, update, delete).
// An array means only those specific actions are allowed.
const ROLES: Record<UserRole, { can: Partial<Record<PermissionSubject, PermissionAction[] | 'all'>> }> = {
    super_admin: {
        can: { /* Super admin can do everything, checked separately */ },
    },
    company_admin: {
        can: {
            task: 'all',
            rfi: 'all',
            punchListItem: 'all',
            dayworkSheet: 'all',
            drawing: 'all',
            document: 'all',
            dailyLog: 'all',
            photo: 'all',
            timeEntry: ['read'],
            accounting: 'all',
            user: ['create', 'read', 'update'],
        },
    },
    'Project Manager': {
        can: {
            task: 'all',
            rfi: 'all',
            punchListItem: 'all',
            dayworkSheet: ['create', 'read', 'update', 'approve'],
            drawing: ['create', 'read'],
            document: ['create', 'read'],
            dailyLog: ['create', 'read'],
            photo: 'all',
            timeEntry: ['read'],
            accounting: ['read'],
        },
    },
    'Foreman': {
        can: {
            task: ['read', 'update'], // Can only update status, not reassign etc. (logic in component)
            rfi: ['read'],
            punchListItem: ['create', 'read', 'update'],
            drawing: ['read'],
            dailyLog: ['create', 'read'],
            photo: ['create', 'read'],
            timeEntry: ['create', 'read'],
        },
    },
    'Safety Officer': {
        can: {
            task: ['read'],
            punchListItem: ['create', 'read'],
            dailyLog: ['read'],
            photo: ['create', 'read'],
            document: ['create', 'read'], // For safety docs
        },
    },
    'Accounting Clerk': {
        can: {
            dayworkSheet: ['read'],
            accounting: 'all',
            timeEntry: ['read'],
        },
    },
    operative: {
        can: {
            task: ['read', 'update'],
            dailyLog: ['create', 'read'],
            photo: ['create', 'read'],
            timeEntry: ['create', 'read'],
        },
    },
    developer: {
        can: {
            task: ['read'],
            document: ['read'],
            user: ['read'],
        },
    },
};

/**
 * Checks if a user role has permission to perform an action on a subject.
 * @param role The user's role.
 * @param action The action being attempted (e.g., 'create').
 * @param subject The subject of the action (e.g., 'task').
 * @returns {boolean} True if permitted, false otherwise.
 */
export const can = (role: UserRole, action: PermissionAction, subject: PermissionSubject): boolean => {
    // Super Admins can do anything.
    if (role === 'super_admin') {
        return true;
    }

    const rolePermissions = ROLES[role]?.can;
    if (!rolePermissions) {
        return false;
    }

    const subjectPermissions = rolePermissions[subject];
    if (!subjectPermissions) {
        return false;
    }

    if (subjectPermissions === 'all') {
        return true;
    }

    return subjectPermissions.includes(action);
};
