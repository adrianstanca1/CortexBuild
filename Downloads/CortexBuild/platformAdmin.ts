/**
 * Platform Admin API
 * 
 * API functions for platform-wide administration
 * Only accessible by super_admin role
 */

import { supabase } from '../supabaseClient';
import {
    PlatformStats,
    CompanyDetails,
    AgentStats,
    AuditLog,
    PlatformMetrics,
    ActivityItem,
    RevenueBreakdown,
    SystemHealth,
    PlatformDashboardData,
    CompanyFilter,
    UserFilter,
    AuditLogFilter,
    PlatformUser,
    CompanyManagementAction,
} from '../types/platformAdmin';

// ============================================================================
// PLATFORM STATISTICS
// ============================================================================

/**
 * Get platform-wide statistics
 */
export const getPlatformStats = async (): Promise<PlatformStats> => {
    const { data, error } = await supabase
        .from('platform_stats')
        .select('*')
        .single();

    if (error) {
        console.error('Error fetching platform stats:', error);
        throw error;
    }

    return data;
};

/**
 * Get all companies with details
 */
export const getAllCompanies = async (filter?: CompanyFilter): Promise<CompanyDetails[]> => {
    let query = supabase
        .from('company_details')
        .select('*');

    // Apply filters
    if (filter?.status) {
        query = query.eq('status', filter.status);
    }
    if (filter?.plan) {
        query = query.eq('plan', filter.plan);
    }
    if (filter?.search) {
        query = query.ilike('name', `%${filter.search}%`);
    }

    // Apply sorting
    if (filter?.sortBy) {
        query = query.order(filter.sortBy, { ascending: filter.sortOrder === 'asc' });
    } else {
        query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching companies:', error);
        throw error;
    }

    return data || [];
};

/**
 * Get agent statistics
 */
export const getAgentStats = async (): Promise<AgentStats[]> => {
    const { data, error } = await supabase
        .from('agent_stats')
        .select('*')
        .order('subscription_count', { ascending: false });

    if (error) {
        console.error('Error fetching agent stats:', error);
        throw error;
    }

    return data || [];
};

// ============================================================================
// PLATFORM METRICS
// ============================================================================

/**
 * Calculate platform metrics
 */
export const getPlatformMetrics = async (): Promise<PlatformMetrics> => {
    // Get current date ranges
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfYear = new Date(now.getFullYear(), 0, 1);

    // Fetch data in parallel
    const [
        companiesThisMonth,
        usersThisMonth,
        projectsThisMonth,
        planDistribution,
        agentStats,
    ] = await Promise.all([
        supabase.from('companies').select('id', { count: 'exact' }).gte('created_at', firstDayOfMonth.toISOString()),
        supabase.from('users').select('id', { count: 'exact' }).gte('created_at', firstDayOfMonth.toISOString()),
        supabase.from('projects').select('id', { count: 'exact' }).gte('created_at', firstDayOfMonth.toISOString()),
        supabase.from('companies').select('plan'),
        getAgentStats(),
    ]);

    // Calculate plan distribution
    const plans = planDistribution.data || [];
    const free_plan_count = plans.filter(p => p.plan === 'free').length;
    const professional_plan_count = plans.filter(p => p.plan === 'professional').length;
    const enterprise_plan_count = plans.filter(p => p.plan === 'enterprise').length;

    // Calculate revenue
    const mrr = agentStats.reduce((sum, agent) => sum + agent.monthly_revenue, 0);
    const arr = mrr * 12;

    // Find most popular agent
    const mostPopularAgent = agentStats.length > 0 ? agentStats[0].name : 'None';

    // Calculate revenue growth from last month
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const { data: lastMonthSubs } = await supabase
        .from('subscriptions')
        .select('*, agents(price_monthly)')
        .eq('status', 'active')
        .lte('created_at', lastMonthEnd.toISOString());

    const lastMonthMrr = (lastMonthSubs || []).reduce((sum, sub: any) =>
        sum + (sub.agents?.price_monthly || 0), 0);

    const revenue_growth = lastMonthMrr > 0
        ? ((mrr - lastMonthMrr) / lastMonthMrr) * 100
        : 0;

    // Get active users (users who logged in or performed actions)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);

    // Count users with recent activity (using last_sign_in_at from auth.users)
    const { count: activeToday } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .gte('last_sign_in_at', today.toISOString());

    const { count: activeWeek } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .gte('last_sign_in_at', weekAgo.toISOString());

    const { count: activeMonth } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .gte('last_sign_in_at', monthAgo.toISOString());

    return {
        new_companies_this_month: companiesThisMonth.count || 0,
        new_users_this_month: usersThisMonth.count || 0,
        new_projects_this_month: projectsThisMonth.count || 0,
        mrr,
        arr,
        revenue_growth: Math.round(revenue_growth * 100) / 100,
        active_users_today: activeToday || 0,
        active_users_this_week: activeWeek || 0,
        active_users_this_month: activeMonth || 0,
        free_plan_count,
        professional_plan_count,
        enterprise_plan_count,
        most_popular_agent: mostPopularAgent,
        total_agent_subscriptions: agentStats.reduce((sum, agent) => sum + agent.subscription_count, 0),
        agent_revenue: mrr,
    };
};

// ============================================================================
// ACTIVITY FEED
// ============================================================================

/**
 * Get recent platform activity
 */
export const getRecentActivity = async (limit: number = 20): Promise<ActivityItem[]> => {
    // Fetch recent audit logs
    const { data: logs, error } = await supabase
        .from('audit_logs')
        .select(`
            *,
            user:users(name),
            company:companies(name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching activity:', error);
        return [];
    }

    // Transform to activity items
    return (logs || []).map(log => ({
        id: log.id,
        type: log.action as any,
        title: formatActivityTitle(log.action),
        description: formatActivityDescription(log),
        company_id: log.company_id,
        company_name: log.company?.name,
        user_id: log.user_id,
        user_name: log.user?.name,
        timestamp: log.created_at,
        icon: getActivityIcon(log.action),
        color: getActivityColor(log.action),
    }));
};

/**
 * Helper functions for activity formatting
 */
function formatActivityTitle(action: string): string {
    const titles: Record<string, string> = {
        'company_created': 'New Company',
        'company_updated': 'Company Updated',
        'company_suspended': 'Company Suspended',
        'company_activated': 'Company Activated',
        'user_created': 'New User',
        'user_updated': 'User Updated',
        'user_deleted': 'User Deleted',
        'subscription_created': 'New Subscription',
        'subscription_cancelled': 'Subscription Cancelled',
        'project_created': 'New Project',
        'project_completed': 'Project Completed',
        'plan_upgraded': 'Plan Upgraded',
        'plan_downgraded': 'Plan Downgraded',
    };
    return titles[action] || action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatActivityDescription(log: any): string {
    const user = log.user?.name || 'Unknown user';
    const company = log.company?.name || 'Unknown company';

    const descriptions: Record<string, string> = {
        'company_created': `${company} joined the platform`,
        'company_updated': `${company} updated their settings`,
        'company_suspended': `${company} was suspended`,
        'company_activated': `${company} was activated`,
        'user_created': `${user} joined ${company}`,
        'user_updated': `${user} updated their profile`,
        'user_deleted': `${user} was removed from ${company}`,
        'subscription_created': `${company} subscribed to a new agent`,
        'subscription_cancelled': `${company} cancelled a subscription`,
        'project_created': `${user} created a new project in ${company}`,
        'project_completed': `${user} completed a project in ${company}`,
        'plan_upgraded': `${company} upgraded their plan`,
        'plan_downgraded': `${company} downgraded their plan`,
    };

    return descriptions[log.action] || `${user} performed ${log.action} in ${company}`;
}

function getActivityIcon(action: string): string {
    const icons: Record<string, string> = {
        'company_created': '🏢',
        'company_updated': '✏️',
        'company_suspended': '⏸️',
        'company_activated': '✅',
        'user_created': '👤',
        'user_updated': '✏️',
        'user_deleted': '🗑️',
        'subscription_created': '🤖',
        'subscription_cancelled': '❌',
        'project_created': '🏗️',
        'project_completed': '🎉',
        'plan_upgraded': '⬆️',
        'plan_downgraded': '⬇️',
    };
    return icons[action] || '📝';
}

function getActivityColor(action: string): string {
    const colors: Record<string, string> = {
        'company_created': 'blue',
        'company_updated': 'gray',
        'company_suspended': 'red',
        'company_activated': 'green',
        'user_created': 'blue',
        'user_updated': 'gray',
        'user_deleted': 'red',
        'subscription_created': 'purple',
        'subscription_cancelled': 'red',
        'project_created': 'blue',
        'project_completed': 'green',
        'plan_upgraded': 'green',
        'plan_downgraded': 'yellow',
    };
    return colors[action] || 'gray';
}

// ============================================================================
// REVENUE BREAKDOWN
// ============================================================================

/**
 * Get revenue breakdown by plan and agent
 */
export const getRevenueBreakdown = async (): Promise<RevenueBreakdown> => {
    const agentStats = await getAgentStats();

    // Calculate agent revenue
    const agent_revenue: Record<string, number> = {};
    agentStats.forEach(agent => {
        agent_revenue[agent.slug] = agent.monthly_revenue;
    });

    // Plan revenue (simplified - in production, would be from billing data)
    const plan_revenue = {
        free: 0,
        professional: 0, // Would calculate from company count * plan price
        enterprise: 0,
    };

    const total_revenue = Object.values(agent_revenue).reduce((sum, rev) => sum + rev, 0);

    return {
        plan_revenue,
        agent_revenue,
        total_revenue,
    };
};

// ============================================================================
// SYSTEM HEALTH
// ============================================================================

/**
 * Get system health status
 */
export const getSystemHealth = async (): Promise<SystemHealth> => {
    const startTime = Date.now();

    try {
        // Test database connection
        await supabase.from('companies').select('id').limit(1);
        const dbResponseTime = Date.now() - startTime;

        // Get storage usage from Supabase
        let storageUsedGb = 0;
        let storageTotalGb = 100; // Default limit

        try {
            // List all buckets and calculate total size
            const { data: buckets } = await supabase.storage.listBuckets();

            if (buckets) {
                for (const bucket of buckets) {
                    const { data: files } = await supabase.storage
                        .from(bucket.name)
                        .list();

                    if (files) {
                        const bucketSize = files.reduce((sum, file: any) =>
                            sum + (file.metadata?.size || 0), 0);
                        storageUsedGb += bucketSize / (1024 * 1024 * 1024); // Convert to GB
                    }
                }
            }
        } catch (storageError) {
            console.warn('Could not fetch storage usage:', storageError);
            // Continue with default values
        }

        const storagePercentage = (storageUsedGb / storageTotalGb) * 100;

        return {
            status: 'healthy',
            database: {
                status: 'connected',
                response_time_ms: dbResponseTime,
            },
            api: {
                status: 'operational',
                response_time_ms: dbResponseTime,
            },
            storage: {
                used_gb: Math.round(storageUsedGb * 100) / 100,
                total_gb: storageTotalGb,
                percentage: Math.round(storagePercentage * 100) / 100,
            },
            uptime_percentage: 99.9,
        };
    } catch (error) {
        return {
            status: 'down',
            database: {
                status: 'disconnected',
                response_time_ms: 0,
            },
            api: {
                status: 'down',
                response_time_ms: 0,
            },
            storage: {
                used_gb: 0,
                total_gb: 100,
                percentage: 0,
            },
            uptime_percentage: 0,
        };
    }
};

// ============================================================================
// COMPLETE DASHBOARD DATA
// ============================================================================

/**
 * Get all platform dashboard data in one call
 */
export const getPlatformDashboardData = async (): Promise<PlatformDashboardData> => {
    const [
        stats,
        metrics,
        companies,
        agents,
        recentActivity,
        revenueBreakdown,
        systemHealth,
    ] = await Promise.all([
        getPlatformStats(),
        getPlatformMetrics(),
        getAllCompanies(),
        getAgentStats(),
        getRecentActivity(10),
        getRevenueBreakdown(),
        getSystemHealth(),
    ]);

    // Generate chart data
    const companiesGrowthChart = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Companies',
            data: [5, 8, 12, 15, 18, stats.total_companies],
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgb(59, 130, 246)',
        }],
    };

    const revenueGrowthChart = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Revenue ($)',
            data: [1000, 1500, 2200, 3000, 3800, metrics.mrr],
            backgroundColor: 'rgba(34, 197, 94, 0.5)',
            borderColor: 'rgb(34, 197, 94)',
        }],
    };

    const planDistributionChart = {
        labels: ['Free', 'Professional', 'Enterprise'],
        datasets: [{
            label: 'Companies',
            data: [metrics.free_plan_count, metrics.professional_plan_count, metrics.enterprise_plan_count],
            backgroundColor: ['rgba(156, 163, 175, 0.5)', 'rgba(59, 130, 246, 0.5)', 'rgba(139, 92, 246, 0.5)'],
            borderColor: ['rgb(156, 163, 175)', 'rgb(59, 130, 246)', 'rgb(139, 92, 246)'],
        }],
    };

    const agentPopularityChart = {
        labels: agents.map(a => a.name),
        datasets: [{
            label: 'Subscriptions',
            data: agents.map(a => a.subscription_count),
            backgroundColor: 'rgba(168, 85, 247, 0.5)',
            borderColor: 'rgb(168, 85, 247)',
        }],
    };

    return {
        stats,
        metrics,
        companies,
        agents,
        recentActivity,
        revenueBreakdown,
        systemHealth,
        companiesGrowthChart,
        revenueGrowthChart,
        planDistributionChart,
        agentPopularityChart,
    };
};

// ============================================================================
// COMPANY MANAGEMENT
// ============================================================================

/**
 * Perform company management action
 */
export const manageCompany = async (action: CompanyManagementAction): Promise<void> => {
    const updates: any = {};

    switch (action.type) {
        case 'activate':
            updates.status = 'active';
            break;
        case 'suspend':
            updates.status = 'suspended';
            break;
        case 'cancel':
            updates.status = 'cancelled';
            break;
        case 'upgrade':
        case 'downgrade':
            if (action.new_plan) {
                updates.plan = action.new_plan;
            }
            break;
    }

    const { error } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', action.company_id);

    if (error) {
        console.error('Error managing company:', error);
        throw error;
    }

    // Log the action
    await logAuditAction({
        action: `company_${action.type}`,
        resource_type: 'company',
        resource_id: action.company_id,
        details: { reason: action.reason, ...updates },
    });
};

/**
 * Log audit action
 */
export const logAuditAction = async (params: {
    action: string;
    resource_type?: string;
    resource_id?: string;
    details?: Record<string, any>;
}): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const { data: userProfile } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single();

    await supabase.from('audit_logs').insert({
        user_id: user.id,
        company_id: userProfile?.company_id,
        ...params,
    });
};

