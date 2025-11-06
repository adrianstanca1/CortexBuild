/**
 * Tenant Context Provider
 * 
 * React Context for managing multi-tenant state across the application.
 * Provides tenant information, subscriptions, and feature flags.
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { TenantContext as TenantContextType, getTenantContext } from '../utils/tenantContext';

// ============================================================================
// CONTEXT DEFINITION
// ============================================================================

interface TenantContextProviderProps {
    children: ReactNode;
}

const TenantContextInstance = createContext<TenantContextType | null>(null);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export const TenantProvider: React.FC<TenantContextProviderProps> = ({ children }) => {
    const [tenantContext, setTenantContext] = useState<TenantContextType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadTenantContext();
    }, []);

    const loadTenantContext = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const context = await getTenantContext();
            
            if (!context) {
                setError('Failed to load tenant context');
                setTenantContext(null);
            } else {
                setTenantContext(context);
            }
        } catch (err: any) {
            console.error('❌ Error loading tenant context:', err);
            setError(err.message || 'Unknown error');
            setTenantContext(null);
        } finally {
            setLoading(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-gray-900">Loading ConstructAI...</h2>
                    <p className="text-gray-600 mt-2">Setting up your workspace</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !tenantContext) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Workspace</h2>
                    <p className="text-gray-600 mb-6">
                        {error || 'Please make sure you are logged in and have access to a company workspace.'}
                    </p>
                    <button
                        onClick={loadTenantContext}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Success state - render children with context
    return (
        <TenantContextInstance.Provider value={tenantContext}>
            {/* Company Banner (optional) */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 text-sm">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <span className="font-semibold">🏢 {tenantContext.companyName}</span>
                        <span className="text-blue-200">•</span>
                        <span className="text-blue-200">
                            Plan: {tenantContext.companyPlan.charAt(0).toUpperCase() + tenantContext.companyPlan.slice(1)}
                        </span>
                        {tenantContext.subscriptions.length > 0 && (
                            <>
                                <span className="text-blue-200">•</span>
                                <span className="text-blue-200">
                                    {tenantContext.subscriptions.length} AI Agent{tenantContext.subscriptions.length !== 1 ? 's' : ''} Active
                                </span>
                            </>
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-blue-200">👤 {tenantContext.user.name}</span>
                    </div>
                </div>
            </div>
            
            {children}
        </TenantContextInstance.Provider>
    );
};

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to access tenant context
 * 
 * @throws Error if used outside TenantProvider
 */
export const useTenant = (): TenantContextType => {
    const context = useContext(TenantContextInstance);
    
    if (!context) {
        throw new Error('useTenant must be used within TenantProvider');
    }
    
    return context;
};

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook to check if a feature is available
 */
export const useFeature = (feature: string): boolean => {
    const tenant = useTenant();
    return tenant.hasFeature(feature);
};

/**
 * Hook to check if an agent is subscribed
 */
export const useAgent = (agentSlug: string): boolean => {
    const tenant = useTenant();
    return tenant.hasAgent(agentSlug);
};

/**
 * Hook to get all active subscriptions
 */
export const useSubscriptions = () => {
    const tenant = useTenant();
    return tenant.subscriptions;
};

/**
 * Hook to check user role
 */
export const useRole = () => {
    const tenant = useTenant();
    return {
        role: tenant.user.role,
        isSuperAdmin: tenant.user.role === 'super_admin',
        isCompanyAdmin: tenant.user.role === 'company_admin',
        isProjectManager: tenant.user.role === 'Project Manager',
        isOperative: tenant.user.role === 'operative',
    };
};

// ============================================================================
// FEATURE GATE COMPONENT
// ============================================================================

interface FeatureGateProps {
    feature: string;
    children: ReactNode;
    fallback?: ReactNode;
}

/**
 * Component to conditionally render based on feature availability
 */
export const FeatureGate: React.FC<FeatureGateProps> = ({ feature, children, fallback = null }) => {
    const hasFeature = useFeature(feature);
    
    if (!hasFeature) {
        return <>{fallback}</>;
    }
    
    return <>{children}</>;
};

// ============================================================================
// AGENT GATE COMPONENT
// ============================================================================

interface AgentGateProps {
    agentSlug: string;
    children: ReactNode;
    fallback?: ReactNode;
}

/**
 * Component to conditionally render based on agent subscription
 */
export const AgentGate: React.FC<AgentGateProps> = ({ agentSlug, children, fallback = null }) => {
    const hasAgent = useAgent(agentSlug);
    
    if (!hasAgent) {
        return <>{fallback}</>;
    }
    
    return <>{children}</>;
};

// ============================================================================
// ROLE GATE COMPONENT
// ============================================================================

interface RoleGateProps {
    allowedRoles: string[];
    children: ReactNode;
    fallback?: ReactNode;
}

/**
 * Component to conditionally render based on user role
 */
export const RoleGate: React.FC<RoleGateProps> = ({ allowedRoles, children, fallback = null }) => {
    const { role } = useRole();
    
    if (!allowedRoles.includes(role)) {
        return <>{fallback}</>;
    }
    
    return <>{children}</>;
};

// ============================================================================
// PLAN UPGRADE PROMPT
// ============================================================================

interface PlanUpgradePromptProps {
    feature: string;
    requiredPlan: 'professional' | 'enterprise';
}

export const PlanUpgradePrompt: React.FC<PlanUpgradePromptProps> = ({ feature, requiredPlan }) => {
    const tenant = useTenant();
    
    return (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 text-center">
            <div className="text-4xl mb-3">🚀</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
                Upgrade to {requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)}
            </h3>
            <p className="text-gray-600 mb-4">
                The <strong>{feature}</strong> feature is available on the {requiredPlan} plan.
            </p>
            <p className="text-sm text-gray-500 mb-4">
                Current plan: <strong>{tenant.companyPlan}</strong>
            </p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Upgrade Now
            </button>
        </div>
    );
};

export default TenantProvider;

