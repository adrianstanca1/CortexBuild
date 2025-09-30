// React Hook for Enhanced Dual Backend Authentication
import { useState, useEffect, useCallback, useContext, createContext } from 'react';
import React from 'react';
import { enhancedAuthService, type AuthState, type AuthContextType } from '../services/enhancedAuthService';
import type { LoginCredentials } from '../types';

// Create React Context
const EnhancedAuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Component
export function EnhancedAuthProvider({ children }: { children: React.ReactNode }) {
    const [authState, setAuthState] = useState<AuthState>(enhancedAuthService.getAuthState());

    useEffect(() => {
        // Subscribe to auth state changes
        const unsubscribe = enhancedAuthService.subscribe((state: AuthState) => {
            setAuthState(state);
        });

        // Auto-refresh auth status periodically
        const refreshInterval = setInterval(() => {
            if (authState.isAuthenticated) {
                enhancedAuthService.refreshAuth();
            }
        }, 5 * 60 * 1000); // Refresh every 5 minutes

        return () => {
            unsubscribe();
            clearInterval(refreshInterval);
        };
    }, [authState.isAuthenticated]);

    const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
        return enhancedAuthService.login(credentials);
    }, []);

    const logout = useCallback(() => {
        enhancedAuthService.logout();
    }, []);

    const refreshAuth = useCallback(async () => {
        await enhancedAuthService.refreshAuth();
    }, []);

    const hasPermission = useCallback((permission: string): boolean => {
        return enhancedAuthService.hasPermission(permission);
    }, []);

    const hasRole = useCallback((role: string): boolean => {
        return enhancedAuthService.hasRole(role);
    }, []);

    const getBackendStatus = useCallback(() => {
        return enhancedAuthService.getBackendStatus();
    }, []);

    const contextValue: AuthContextType = {
        ...authState,
        login,
        logout,
        refreshAuth,
        hasPermission,
        hasRole,
        getBackendStatus
    };

    return (
        <EnhancedAuthContext.Provider value={contextValue}>
            {children}
        </EnhancedAuthContext.Provider>
    );
}

// Hook to use the enhanced auth context
export function useEnhancedAuth(): AuthContextType {
    const context = useContext(EnhancedAuthContext);
    if (context === undefined) {
        throw new Error('useEnhancedAuth must be used within an EnhancedAuthProvider');
    }
    return context;
}

// Additional custom hooks for specific use cases

/**
 * Hook for backend status monitoring
 */
export function useBackendStatus() {
    const { getBackendStatus } = useEnhancedAuth();
    const [status, setStatus] = useState(getBackendStatus());

    useEffect(() => {
        const interval = setInterval(() => {
            setStatus(getBackendStatus());
        }, 30000); // Check every 30 seconds

        return () => clearInterval(interval);
    }, [getBackendStatus]);

    return {
        ...status,
        isNodeJsAvailable: status.nodejs,
        isJavaAvailable: status.java,
        isAnyBackendAvailable: status.overall,
        isBothBackendsAvailable: status.nodejs && status.java
    };
}

/**
 * Hook for feature availability
 */
export function useFeatureAvailability() {
    const auth = useEnhancedAuth();

    const getFeatureReason = (available: boolean, ...conditions: Array<{ check: boolean; reason: string }>) => {
        if (available) return undefined;
        for (const condition of conditions) {
            if (!condition.check) return condition.reason;
        }
        return 'Unknown reason';
    };

    return {
        aiProcessing: {
            available: auth.backendCapabilities.aiFeatures && auth.isAuthenticated,
            reason: getFeatureReason(
                auth.backendCapabilities.aiFeatures && auth.isAuthenticated,
                { check: auth.backendCapabilities.aiFeatures, reason: 'AI backend unavailable' },
                { check: auth.isAuthenticated, reason: 'Not authenticated' }
            )
        },
        enterpriseAnalytics: {
            available: auth.backendCapabilities.enterpriseFeatures && (auth.hasPermission('canViewAnalytics') || auth.hasRole('ADMIN')),
            reason: getFeatureReason(
                auth.backendCapabilities.enterpriseFeatures && (auth.hasPermission('canViewAnalytics') || auth.hasRole('ADMIN')),
                { check: auth.backendCapabilities.enterpriseFeatures, reason: 'Enterprise backend unavailable' },
                { check: auth.hasPermission('canViewAnalytics') || auth.hasRole('ADMIN'), reason: 'Insufficient permissions' }
            )
        },
        enhancedFeatures: {
            available: auth.backendCapabilities.multiBackend,
            reason: getFeatureReason(
                auth.backendCapabilities.multiBackend,
                { check: auth.backendCapabilities.multiBackend, reason: 'Multi-backend not enabled' }
            )
        },
        reports: {
            available: auth.backendCapabilities.enterpriseFeatures && (auth.hasPermission('canExportReports') || auth.hasRole('ADMIN')),
            reason: getFeatureReason(
                auth.backendCapabilities.enterpriseFeatures && (auth.hasPermission('canExportReports') || auth.hasRole('ADMIN')),
                { check: auth.backendCapabilities.enterpriseFeatures, reason: 'Enterprise backend unavailable' },
                { check: auth.hasPermission('canExportReports') || auth.hasRole('ADMIN'), reason: 'Cannot export reports' }
            )
        }
    };
}

/**
 * Hook for authentication actions with loading states
 */
export function useAuthActions() {
    const { login, logout } = useEnhancedAuth();
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);

    const handleLogin = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
        setIsLoggingIn(true);
        setLoginError(null);

        try {
            const success = await login(credentials);
            if (!success) {
                setLoginError('Login failed. Please check your credentials.');
            }
            return success;
        } catch (error) {
            setLoginError(`Login error: ${error}`);
            return false;
        } finally {
            setIsLoggingIn(false);
        }
    }, [login]);

    const handleLogout = useCallback(() => {
        logout();
        setLoginError(null);
    }, [logout]);

    return {
        login: handleLogin,
        logout: handleLogout,
        isLoggingIn,
        loginError,
        clearError: () => setLoginError(null)
    };
}

/**
 * Hook for user profile information
 */
export function useUserProfile() {
    const { user, isAuthenticated } = useEnhancedAuth();

    const displayInfo = enhancedAuthService.getUserDisplayInfo();

    return {
        user,
        isAuthenticated,
        displayName: displayInfo?.name || 'User',
        email: displayInfo?.email || '',
        avatar: displayInfo?.avatar,
        hasProfile: !!displayInfo
    };
}

/**
 * Hook for role-based component rendering
 */
export function useRoleAccess() {
    const { hasRole, hasPermission, roles, permissions } = useEnhancedAuth();

    const canAccess = useCallback((requirement: {
        roles?: string[];
        permissions?: string[];
        requireAll?: boolean;
    }): boolean => {
        const { roles: requiredRoles = [], permissions: requiredPermissions = [], requireAll = false } = requirement;

        const hasRequiredRoles = requireAll
            ? requiredRoles.every(role => hasRole(role))
            : requiredRoles.some(role => hasRole(role)) || requiredRoles.length === 0;

        const hasRequiredPermissions = requireAll
            ? requiredPermissions.every(permission => hasPermission(permission))
            : requiredPermissions.some(permission => hasPermission(permission)) || requiredPermissions.length === 0;

        return requireAll ? (hasRequiredRoles && hasRequiredPermissions) : (hasRequiredRoles || hasRequiredPermissions);
    }, [hasRole, hasPermission]);

    return {
        canAccess,
        hasRole,
        hasPermission,
        roles,
        permissions,
        isAdmin: hasRole('ADMIN'),
        isUser: hasRole('USER'),
        canManageProjects: hasPermission('canManageProjects'),
        canViewAnalytics: hasPermission('canViewAnalytics'),
        canExportReports: hasPermission('canExportReports')
    };
}

export default useEnhancedAuth;