/**
 * Route Guard Component
 * Protects routes based on user permissions and roles
 */

import React from 'react';
import { User } from '../../types';
import { usePermissions } from './usePermissions';
import { UserRole } from './permissions';
import { Shield, Lock, AlertTriangle } from 'lucide-react';

interface RouteGuardProps {
    children: React.ReactNode;
    currentUser: User | null;
    requiredRole?: UserRole | UserRole[];
    requiredPermission?: {
        resource: string;
        action: 'create' | 'read' | 'update' | 'delete' | 'manage';
    };
    requiredFeature?: string;
    requireCompanyScope?: boolean;
    fallback?: React.ReactNode;
    onUnauthorized?: () => void;
}

/**
 * Route Guard Component
 * Protects routes and shows appropriate error messages
 */
export const RouteGuard: React.FC<RouteGuardProps> = ({
    children,
    currentUser,
    requiredRole,
    requiredPermission,
    requiredFeature,
    requireCompanyScope = false,
    fallback,
    onUnauthorized
}) => {
    const permissions = usePermissions(currentUser);

    // Check if user is authenticated
    if (!currentUser) {
        if (onUnauthorized) onUnauthorized();
        return fallback || <UnauthorizedScreen message="Please log in to access this page" />;
    }

    // Check role requirement
    if (requiredRole) {
        const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        if (!roles.includes(permissions.role)) {
            return fallback || (
                <UnauthorizedScreen 
                    message="You don't have the required role to access this page"
                    requiredRole={roles}
                    currentRole={permissions.role}
                />
            );
        }
    }

    // Check permission requirement
    if (requiredPermission) {
        if (!permissions.can(requiredPermission.resource, requiredPermission.action)) {
            return fallback || (
                <UnauthorizedScreen 
                    message="You don't have permission to access this resource"
                    requiredPermission={requiredPermission}
                />
            );
        }
    }

    // Check feature requirement
    if (requiredFeature) {
        if (!permissions.canUse(requiredFeature)) {
            return fallback || (
                <UnauthorizedScreen 
                    message="This feature is not available for your account type"
                    requiredFeature={requiredFeature}
                />
            );
        }
    }

    // Check company scope requirement
    if (requireCompanyScope && !currentUser.company_id) {
        return fallback || (
            <UnauthorizedScreen 
                message="You must be associated with a company to access this page"
            />
        );
    }

    // All checks passed, render children
    return <>{children}</>;
};

/**
 * Unauthorized Screen Component
 */
const UnauthorizedScreen: React.FC<{
    message: string;
    requiredRole?: UserRole[];
    currentRole?: UserRole;
    requiredPermission?: {
        resource: string;
        action: string;
    };
    requiredFeature?: string;
}> = ({ message, requiredRole, currentRole, requiredPermission, requiredFeature }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-md w-full mx-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    {/* Icon */}
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Shield className="w-10 h-10 text-red-600" />
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Access Denied
                    </h1>

                    {/* Message */}
                    <p className="text-gray-600 mb-6">
                        {message}
                    </p>

                    {/* Details */}
                    {requiredRole && currentRole && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                            <div className="flex items-start space-x-3">
                                <Lock className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900 mb-1">
                                        Role Requirement
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Required: <span className="font-semibold">{requiredRole.join(' or ')}</span>
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Your role: <span className="font-semibold">{currentRole}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {requiredPermission && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                            <div className="flex items-start space-x-3">
                                <Lock className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900 mb-1">
                                        Permission Requirement
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Resource: <span className="font-semibold">{requiredPermission.resource}</span>
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Action: <span className="font-semibold">{requiredPermission.action}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {requiredFeature && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                            <div className="flex items-start space-x-3">
                                <AlertTriangle className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900 mb-1">
                                        Feature Requirement
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Required feature: <span className="font-semibold">{requiredFeature}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col space-y-3">
                        <button
                            onClick={() => window.history.back()}
                            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Go Back
                        </button>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        >
                            Go to Dashboard
                        </button>
                    </div>

                    {/* Help Text */}
                    <p className="text-sm text-gray-500 mt-6">
                        If you believe this is an error, please contact your administrator.
                    </p>
                </div>
            </div>
        </div>
    );
};

/**
 * Dashboard Route Guard
 * Specifically for protecting dashboard routes
 */
export const DashboardGuard: React.FC<{
    children: React.ReactNode;
    currentUser: User | null;
    dashboardName: string;
    fallback?: React.ReactNode;
}> = ({ children, currentUser, dashboardName, fallback }) => {
    const permissions = usePermissions(currentUser);

    if (!currentUser) {
        return fallback || <UnauthorizedScreen message="Please log in to access this dashboard" />;
    }

    if (!permissions.canAccess(dashboardName)) {
        return fallback || (
            <UnauthorizedScreen 
                message="You don't have permission to access this dashboard"
                currentRole={permissions.role}
            />
        );
    }

    return <>{children}</>;
};

/**
 * Feature Route Guard
 * Specifically for protecting feature routes
 */
export const FeatureGuard: React.FC<{
    children: React.ReactNode;
    currentUser: User | null;
    featureName: string;
    fallback?: React.ReactNode;
}> = ({ children, currentUser, featureName, fallback }) => {
    const permissions = usePermissions(currentUser);

    if (!currentUser) {
        return fallback || <UnauthorizedScreen message="Please log in to access this feature" />;
    }

    if (!permissions.canUse(featureName)) {
        return fallback || (
            <UnauthorizedScreen 
                message="This feature is not available for your account type"
                requiredFeature={featureName}
                currentRole={permissions.role}
            />
        );
    }

    return <>{children}</>;
};

/**
 * Company Scope Guard
 * Ensures user has company association
 */
export const CompanyScopeGuard: React.FC<{
    children: React.ReactNode;
    currentUser: User | null;
    fallback?: React.ReactNode;
}> = ({ children, currentUser, fallback }) => {
    if (!currentUser) {
        return fallback || <UnauthorizedScreen message="Please log in to continue" />;
    }

    if (!currentUser.company_id && currentUser.role !== 'super_admin') {
        return fallback || (
            <UnauthorizedScreen 
                message="You must be associated with a company to access this page"
            />
        );
    }

    return <>{children}</>;
};

export default RouteGuard;

