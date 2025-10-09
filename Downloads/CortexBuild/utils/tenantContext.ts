/**
 * Tenant Context Management
 * 
 * Manages multi-tenant context including company identification,
 * user permissions, and active subscriptions.
 */

import { supabase } from '../supabaseClient';
import { User } from '../types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Company {
    id: string;
    name: string;
    slug: string;
    plan: 'free' | 'professional' | 'enterprise';
    status: 'active' | 'suspended' | 'cancelled';
    settings: {
        timezone?: string;
        currency?: string;
        features?: string[];
    };
    created_at: string;
    updated_at: string;
}

export interface Agent {
    id: string;
    name: string;
    slug: string;
    description: string;
    category: string;
    price_monthly: number;
    features: string[];
    is_active: boolean;
}

export interface Subscription {
    id: string;
    company_id: string;
    agent_id: string;
    status: 'active' | 'cancelled' | 'expired';
    started_at: string;
    expires_at?: string;
    agent?: Agent;
}

export interface TenantContext {
    user: User;
    companyId: string;
    companyName: string;
    companySlug: string;
    companyPlan: 'free' | 'professional' | 'enterprise';
    companyStatus: 'active' | 'suspended' | 'cancelled';
    subscriptions: Subscription[];
    hasFeature: (feature: string) => boolean;
    hasAgent: (agentSlug: string) => boolean;
}

// ============================================================================
// TENANT CONTEXT RETRIEVAL
// ============================================================================

/**
 * Get complete tenant context for the authenticated user
 */
export const getTenantContext = async (): Promise<TenantContext | null> => {
    try {
        // 1. Get authenticated user from Supabase Auth
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authUser) {
            console.error('❌ Auth error:', authError);
            return null;
        }

        // 2. Get user profile with company info
        // Note: In current implementation, we use mock data
        // In production, this would query Supabase tables
        const userProfile = await getUserProfile(authUser.id);
        
        if (!userProfile) {
            console.error('❌ User profile not found');
            return null;
        }

        // 3. Get company details
        const company = await getCompany(userProfile.companyId);
        
        if (!company) {
            console.error('❌ Company not found');
            return null;
        }

        // 4. Get active subscriptions
        const subscriptions = await getActiveSubscriptions(company.id);

        // 5. Build tenant context
        const tenantContext: TenantContext = {
            user: userProfile,
            companyId: company.id,
            companyName: company.name,
            companySlug: company.slug,
            companyPlan: company.plan,
            companyStatus: company.status,
            subscriptions,
            hasFeature: (feature: string) => {
                return company.settings.features?.includes(feature) || false;
            },
            hasAgent: (agentSlug: string) => {
                return subscriptions.some(sub => 
                    sub.agent?.slug === agentSlug && sub.status === 'active'
                );
            },
        };

        console.log('✅ Tenant context loaded:', {
            user: tenantContext.user.name,
            company: tenantContext.companyName,
            plan: tenantContext.companyPlan,
            subscriptions: tenantContext.subscriptions.length,
        });

        return tenantContext;
    } catch (error) {
        console.error('❌ Error getting tenant context:', error);
        return null;
    }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get user profile by auth ID
 */
const getUserProfile = async (authId: string): Promise<User | null> => {
    if (!supabase) {
        console.warn('⚠️ Supabase not available, using mock data');
        return {
            id: authId,
            email: 'casey@constructco.com',
            name: 'Casey Jordan',
            role: 'company_admin',
            companyId: 'comp_constructco',
            avatar: 'https://i.pravatar.cc/150?img=1',
        } as User;
    }

    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', authId)
            .single();

        if (error) {
            console.error('❌ Error fetching user profile:', error);
            return null;
        }

        if (!data) {
            console.error('❌ User profile not found');
            return null;
        }

        return {
            id: data.id,
            email: data.email,
            name: data.name,
            role: data.role,
            companyId: data.company_id,
            avatar: data.avatar,
        } as User;
    } catch (error) {
        console.error('❌ Error in getUserProfile:', error);
        return null;
    }
};

/**
 * Get company details by ID
 */
const getCompany = async (companyId: string): Promise<Company | null> => {
    if (!supabase) {
        console.warn('⚠️ Supabase not available, using mock data');
        return {
            id: companyId,
            name: 'ConstructCo',
            slug: 'constructco',
            plan: 'professional',
            status: 'active',
            settings: {
                timezone: 'America/New_York',
                currency: 'USD',
                features: ['ml_analytics', 'ai_agents', 'advanced_reporting'],
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
    }

    try {
        const { data, error } = await supabase
            .from('companies')
            .select('*')
            .eq('id', companyId)
            .single();

        if (error) {
            console.error('❌ Error fetching company:', error);
            return null;
        }

        if (!data) {
            console.error('❌ Company not found');
            return null;
        }

        return {
            id: data.id,
            name: data.name,
            slug: data.slug,
            plan: data.plan,
            status: data.status,
            settings: data.settings || {},
            created_at: data.created_at,
            updated_at: data.updated_at,
        };
    } catch (error) {
        console.error('❌ Error in getCompany:', error);
        return null;
    }
};

/**
 * Get active subscriptions for a company
 */
const getActiveSubscriptions = async (companyId: string): Promise<Subscription[]> => {
    if (!supabase) {
        console.warn('⚠️ Supabase not available, using mock data');
        return [
            {
                id: 'sub_1',
                company_id: companyId,
                agent_id: 'agent_hse_sentinel',
                status: 'active',
                started_at: new Date().toISOString(),
                agent: {
                    id: 'agent_hse_sentinel',
                    name: 'HSE Sentinel AI',
                    slug: 'hse-sentinel-ai',
                    description: 'AI-powered safety monitoring and compliance',
                    category: 'safety',
                    price_monthly: 49.99,
                    features: [
                        'Real-time safety monitoring',
                        'Automated incident reporting',
                        'Compliance tracking',
                    ],
                    is_active: true,
                },
            },
        ];
    }

    try {
        const { data, error } = await supabase
            .from('subscriptions')
            .select(`
                *,
                agent:agents(*)
            `)
            .eq('company_id', companyId)
            .eq('status', 'active');

        if (error) {
            console.error('❌ Error fetching subscriptions:', error);
            return [];
        }

        return (data || []).map((sub: any) => ({
            id: sub.id,
            company_id: sub.company_id,
            agent_id: sub.agent_id,
            status: sub.status,
            started_at: sub.started_at,
            expires_at: sub.expires_at,
            agent: sub.agent ? {
                id: sub.agent.id,
                name: sub.agent.name,
                slug: sub.agent.slug,
                description: sub.agent.description,
                category: sub.agent.category,
                price_monthly: sub.agent.price_monthly,
                features: sub.agent.features || [],
                is_active: sub.agent.is_active,
            } : undefined,
        }));
    } catch (error) {
        console.error('❌ Error in getActiveSubscriptions:', error);
        return [];
    }
};

// ============================================================================
// TENANT VALIDATION
// ============================================================================

/**
 * Validate that a resource belongs to the current tenant
 */
export const validateTenantAccess = (
    resourceCompanyId: string,
    tenantContext: TenantContext
): boolean => {
    if (resourceCompanyId !== tenantContext.companyId) {
        console.error('❌ Tenant access violation:', {
            resource: resourceCompanyId,
            tenant: tenantContext.companyId,
        });
        return false;
    }
    return true;
};

/**
 * Check if user has permission for an action
 */
export const hasPermission = (
    tenantContext: TenantContext,
    action: string,
    resource: string
): boolean => {
    // Super admins have all permissions
    if (tenantContext.user.role === 'super_admin') {
        return true;
    }

    // Company admins have most permissions
    if (tenantContext.user.role === 'company_admin') {
        return true;
    }

    // Project managers can manage projects and tasks
    if (tenantContext.user.role === 'Project Manager') {
        return ['read', 'create', 'update'].includes(action);
    }

    // Operatives can only read
    if (tenantContext.user.role === 'operative') {
        return action === 'read';
    }

    return false;
};

// ============================================================================
// FEATURE FLAGS
// ============================================================================

/**
 * Check if a feature is available for the tenant's plan
 */
export const isFeatureAvailable = (
    feature: string,
    plan: Company['plan']
): boolean => {
    const featuresByPlan: Record<Company['plan'], string[]> = {
        free: ['basic_projects', 'basic_tasks'],
        professional: [
            'basic_projects',
            'basic_tasks',
            'ml_analytics',
            'ai_agents',
            'advanced_reporting',
        ],
        enterprise: [
            'basic_projects',
            'basic_tasks',
            'ml_analytics',
            'ai_agents',
            'advanced_reporting',
            'custom_integrations',
            'dedicated_support',
            'sso',
        ],
    };

    return featuresByPlan[plan]?.includes(feature) || false;
};

