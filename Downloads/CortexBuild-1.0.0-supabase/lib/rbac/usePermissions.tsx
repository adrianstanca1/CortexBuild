/**
 * React Hook for RBAC Permissions
 * Provides easy access to permission checks in components
 */

import { useMemo } from 'react';
import { User } from '../../types';
import {
    hasPermission,
    canAccessDashboard,
    canAccessFeature,
    getRolePermissions,
    getAccessibleDashboards,
    UserRole
} from './permissions';

export interface UsePermissionsReturn {
    // Permission checks
    can: (resource: string, action: 'create' | 'read' | 'update' | 'delete' | 'manage') => boolean;
    canAccess: (dashboard: string) => boolean;
    canUse: (feature: string) => boolean;
    
    // Role checks
    isSuperAdmin: boolean;
    isCompanyAdmin: boolean;
    isDeveloper: boolean;
    isSupervisor: boolean;
    isWorker: boolean;
    
    // Scope checks
    hasPlatformScope: boolean;
    hasCompanyScope: boolean;
    hasOwnScope: boolean;
    
    // Feature groups
    canManageUsers: boolean;
    canManageCompanies: boolean;
    canManageProjects: boolean;
    canAccessOfficeOps: boolean;
    canAccessFieldOps: boolean;
    canAccessDevTools: boolean;
    
    // Utility
    role: UserRole;
    permissions: ReturnType<typeof getRolePermissions>;
    accessibleDashboards: string[];
}

/**
 * Hook to check user permissions
 */
export function usePermissions(user: User | null): UsePermissionsReturn {
    const role = (user?.role || 'worker') as UserRole;

    return useMemo(() => {
        // Permission check functions
        const can = (resource: string, action: 'create' | 'read' | 'update' | 'delete' | 'manage') => {
            return hasPermission(role, resource, action);
        };

        const canAccess = (dashboard: string) => {
            return canAccessDashboard(role, dashboard);
        };

        const canUse = (feature: string) => {
            return canAccessFeature(role, feature);
        };

        // Role checks
        const isSuperAdmin = role === 'super_admin';
        const isCompanyAdmin = role === 'company_admin';
        const isDeveloper = role === 'developer';
        const isSupervisor = role === 'supervisor';
        const isWorker = role === 'worker';

        // Scope checks
        const hasPlatformScope = isSuperAdmin;
        const hasCompanyScope = isSuperAdmin || isCompanyAdmin || isSupervisor;
        const hasOwnScope = true; // Everyone has access to their own data

        // Feature group checks
        const canManageUsers = can('users', 'manage') || can('users', 'create');
        const canManageCompanies = can('companies', 'manage') || can('companies', 'create');
        const canManageProjects = can('projects', 'manage') || can('projects', 'create');
        const canAccessOfficeOps = canUse('project-management') || canUse('team-management');
        const canAccessFieldOps = canUse('daily-logs') || canUse('safety-reports');
        const canAccessDevTools = canUse('code-editor') || canUse('terminal');

        return {
            can,
            canAccess,
            canUse,
            isSuperAdmin,
            isCompanyAdmin,
            isDeveloper,
            isSupervisor,
            isWorker,
            hasPlatformScope,
            hasCompanyScope,
            hasOwnScope,
            canManageUsers,
            canManageCompanies,
            canManageProjects,
            canAccessOfficeOps,
            canAccessFieldOps,
            canAccessDevTools,
            role,
            permissions: getRolePermissions(role),
            accessibleDashboards: getAccessibleDashboards(role)
        };
    }, [role]);
}

/**
 * Higher-order component to protect routes with permissions
 */
export function withPermission<P extends object>(
    Component: React.ComponentType<P>,
    requiredPermission: {
        resource: string;
        action: 'create' | 'read' | 'update' | 'delete' | 'manage';
    }
) {
    return function ProtectedComponent(props: P & { currentUser: User | null }) {
        const { can } = usePermissions(props.currentUser);

        if (!can(requiredPermission.resource, requiredPermission.action)) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Access Denied</h1>
                        <p className="text-gray-600 mb-8">
                            You don't have permission to access this resource.
                        </p>
                        <button
                            onClick={() => window.history.back()}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            );
        }

        return <Component {...props} />;
    };
}

/**
 * Higher-order component to protect dashboards
 */
export function withDashboardAccess<P extends object>(
    Component: React.ComponentType<P>,
    dashboardName: string
) {
    return function ProtectedDashboard(props: P & { currentUser: User | null }) {
        const { canAccess } = usePermissions(props.currentUser);

        if (!canAccess(dashboardName)) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Access Denied</h1>
                        <p className="text-gray-600 mb-8">
                            You don't have permission to access this dashboard.
                        </p>
                        <button
                            onClick={() => window.history.back()}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            );
        }

        return <Component {...props} />;
    };
}

/**
 * Higher-order component to protect features
 */
export function withFeatureAccess<P extends object>(
    Component: React.ComponentType<P>,
    featureName: string
) {
    return function ProtectedFeature(props: P & { currentUser: User | null }) {
        const { canUse } = usePermissions(props.currentUser);

        if (!canUse(featureName)) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Feature Not Available</h1>
                        <p className="text-gray-600 mb-8">
                            This feature is not available for your account type.
                        </p>
                        <button
                            onClick={() => window.history.back()}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            );
        }

        return <Component {...props} />;
    };
}

/**
 * Component to conditionally render based on permissions
 */
export function PermissionGate({
    children,
    resource,
    action,
    fallback = null,
    currentUser
}: {
    children: React.ReactNode;
    resource: string;
    action: 'create' | 'read' | 'update' | 'delete' | 'manage';
    fallback?: React.ReactNode;
    currentUser: User | null;
}) {
    const { can } = usePermissions(currentUser);

    if (!can(resource, action)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}

/**
 * Component to conditionally render based on dashboard access
 */
export function DashboardGate({
    children,
    dashboard,
    fallback = null,
    currentUser
}: {
    children: React.ReactNode;
    dashboard: string;
    fallback?: React.ReactNode;
    currentUser: User | null;
}) {
    const { canAccess } = usePermissions(currentUser);

    if (!canAccess(dashboard)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}

/**
 * Component to conditionally render based on feature access
 */
export function FeatureGate({
    children,
    feature,
    fallback = null,
    currentUser
}: {
    children: React.ReactNode;
    feature: string;
    fallback?: React.ReactNode;
    currentUser: User | null;
}) {
    const { canUse } = usePermissions(currentUser);

    if (!canUse(feature)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}

/**
 * Component to conditionally render based on role
 */
export function RoleGate({
    children,
    roles,
    fallback = null,
    currentUser
}: {
    children: React.ReactNode;
    roles: UserRole[];
    fallback?: React.ReactNode;
    currentUser: User | null;
}) {
    const { role } = usePermissions(currentUser);

    if (!roles.includes(role)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}

