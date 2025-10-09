import { useState, useEffect, useCallback } from 'react';
import { User, AIAgent, CompanySubscription, TenantContext } from '../types';
import * as api from '../api';

interface UseAIAgentsReturn {
    // State
    availableAgents: AIAgent[];
    companySubscriptions: CompanySubscription[];
    isLoading: boolean;
    error: string | null;
    
    // Multi-tenant context
    tenantContext: TenantContext | null;
    
    // Actions
    refreshAgents: () => Promise<void>;
    refreshSubscriptions: () => Promise<void>;
    subscribeToAgent: (agentId: string, billingCycle: 'monthly' | 'yearly') => Promise<boolean>;
    hasAgentAccess: (agentId: string) => boolean;
    getAgentById: (agentId: string) => AIAgent | undefined;
    getSubscriptionByAgentId: (agentId: string) => CompanySubscription | undefined;
}

/**
 * Hook for managing AI Agents in a multi-tenant environment
 * Provides access to available agents, company subscriptions, and tenant context
 */
export const useAIAgents = (currentUser: User | null): UseAIAgentsReturn => {
    const [availableAgents, setAvailableAgents] = useState<AIAgent[]>([]);
    const [companySubscriptions, setCompanySubscriptions] = useState<CompanySubscription[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load available agents from marketplace
    const refreshAgents = useCallback(async () => {
        if (!currentUser) return;
        
        setIsLoading(true);
        setError(null);
        
        try {
            console.log('🤖 Loading available AI agents...');
            const agents = await api.fetchAvailableAIAgents();
            setAvailableAgents(agents);
            console.log('✅ Loaded', agents.length, 'AI agents');
        } catch (err: any) {
            console.error('❌ Error loading AI agents:', err);
            setError(err.message || 'Failed to load AI agents');
        } finally {
            setIsLoading(false);
        }
    }, [currentUser]);

    // Load company's active subscriptions
    const refreshSubscriptions = useCallback(async () => {
        if (!currentUser) return;
        
        setIsLoading(true);
        setError(null);
        
        try {
            console.log('📋 Loading company subscriptions...');
            const subscriptions = await api.fetchCompanySubscriptions(currentUser);
            setCompanySubscriptions(subscriptions);
            console.log('✅ Loaded', subscriptions.length, 'active subscriptions');
        } catch (err: any) {
            console.error('❌ Error loading subscriptions:', err);
            setError(err.message || 'Failed to load subscriptions');
        } finally {
            setIsLoading(false);
        }
    }, [currentUser]);

    // Subscribe to a new agent
    const subscribeToAgent = useCallback(async (
        agentId: string, 
        billingCycle: 'monthly' | 'yearly'
    ): Promise<boolean> => {
        if (!currentUser) return false;
        
        setIsLoading(true);
        setError(null);
        
        try {
            console.log('💳 Subscribing to agent:', agentId);
            const subscription = await api.subscribeToAgent(currentUser, agentId, billingCycle);
            
            if (subscription) {
                // Refresh subscriptions to get the latest data
                await refreshSubscriptions();
                console.log('✅ Successfully subscribed to agent');
                return true;
            }
            
            return false;
        } catch (err: any) {
            console.error('❌ Error subscribing to agent:', err);
            setError(err.message || 'Failed to subscribe to agent');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [currentUser, refreshSubscriptions]);

    // Check if company has access to a specific agent
    const hasAgentAccess = useCallback((agentId: string): boolean => {
        return companySubscriptions.some(
            sub => sub.agentId === agentId && sub.status === 'active'
        );
    }, [companySubscriptions]);

    // Get agent by ID
    const getAgentById = useCallback((agentId: string): AIAgent | undefined => {
        return availableAgents.find(agent => agent.id === agentId);
    }, [availableAgents]);

    // Get subscription by agent ID
    const getSubscriptionByAgentId = useCallback((agentId: string): CompanySubscription | undefined => {
        return companySubscriptions.find(sub => sub.agentId === agentId && sub.status === 'active');
    }, [companySubscriptions]);

    // Create tenant context
    const tenantContext: TenantContext | null = currentUser ? {
        user: currentUser,
        company: { id: currentUser.companyId, name: 'Current Company' }, // Would be loaded from API
        subscriptions: companySubscriptions,
        availableAgents,
        hasAgentAccess
    } : null;

    // Load data when user changes
    useEffect(() => {
        if (currentUser) {
            console.log('👤 User changed, loading AI agents data for:', currentUser.email);
            refreshAgents();
            refreshSubscriptions();
        } else {
            // Clear data when user logs out
            setAvailableAgents([]);
            setCompanySubscriptions([]);
            setError(null);
        }
    }, [currentUser, refreshAgents, refreshSubscriptions]);

    return {
        // State
        availableAgents,
        companySubscriptions,
        isLoading,
        error,
        
        // Multi-tenant context
        tenantContext,
        
        // Actions
        refreshAgents,
        refreshSubscriptions,
        subscribeToAgent,
        hasAgentAccess,
        getAgentById,
        getSubscriptionByAgentId
    };
};

export default useAIAgents;
