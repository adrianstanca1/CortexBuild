/**
 * Platform Admin Types
 * 
 * Type definitions for platform-wide administration features
 */

import { Company, Agent, Subscription } from '../types';

// ============================================================================
// PLATFORM STATISTICS
// ============================================================================

export interface PlatformStats {
    active_companies: number;
    total_companies: number;
    total_users: number;
    total_projects: number;
    total_tasks: number;
    active_subscriptions: number;
    monthly_revenue: number;
}

// ============================================================================
// COMPANY DETAILS
// ============================================================================

export interface CompanyDetails extends Company {
    plan: string;
    user_count: number;
    project_count: number;
    task_count: number;
    subscription_count: number;
    monthly_spend: number;
}

// ============================================================================
// AGENT STATISTICS
// ============================================================================

export interface AgentStats extends Agent {
    subscription_count: number;
    monthly_revenue: number;
}

// ============================================================================
// AUDIT LOG
// ============================================================================

export interface AuditLog {
    id: string;
    user_id: string;
    company_id: string;
    action: string;
    resource_type?: string;
    resource_id?: string;
    details: Record<string, any>;
    ip_address?: string;
    user_agent?: string;
    created_at: string;
    
    // Joined data
    user_name?: string;
    company_name?: string;
}

// ============================================================================
// PLATFORM METRICS
// ============================================================================

export interface PlatformMetrics {
    // Growth metrics
    new_companies_this_month: number;
    new_users_this_month: number;
    new_projects_this_month: number;
    
    // Revenue metrics
    mrr: number; // Monthly Recurring Revenue
    arr: number; // Annual Recurring Revenue
    revenue_growth: number; // Percentage
    
    // Engagement metrics
    active_users_today: number;
    active_users_this_week: number;
    active_users_this_month: number;
    
    // Plan distribution
    free_plan_count: number;
    professional_plan_count: number;
    enterprise_plan_count: number;
    
    // Agent metrics
    most_popular_agent: string;
    total_agent_subscriptions: number;
    agent_revenue: number;
}

// ============================================================================
// ACTIVITY FEED
// ============================================================================

export interface ActivityItem {
    id: string;
    type: 'company_created' | 'user_registered' | 'project_created' | 'subscription_created' | 'subscription_cancelled';
    title: string;
    description: string;
    company_id?: string;
    company_name?: string;
    user_id?: string;
    user_name?: string;
    timestamp: string;
    icon: string;
    color: string;
}

// ============================================================================
// REVENUE BREAKDOWN
// ============================================================================

export interface RevenueBreakdown {
    plan_revenue: {
        free: number;
        professional: number;
        enterprise: number;
    };
    agent_revenue: {
        [agentSlug: string]: number;
    };
    total_revenue: number;
}

// ============================================================================
// COMPANY MANAGEMENT
// ============================================================================

export interface CompanyManagementAction {
    type: 'activate' | 'suspend' | 'cancel' | 'upgrade' | 'downgrade';
    company_id: string;
    reason?: string;
    new_plan?: 'free' | 'professional' | 'enterprise';
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

export interface PlatformUser {
    id: string;
    email: string;
    name: string;
    role: string;
    company_id: string;
    company_name: string;
    company_plan: string;
    created_at: string;
    last_login?: string;
}

// ============================================================================
// SYSTEM HEALTH
// ============================================================================

export interface SystemHealth {
    status: 'healthy' | 'degraded' | 'down';
    database: {
        status: 'connected' | 'disconnected';
        response_time_ms: number;
    };
    api: {
        status: 'operational' | 'slow' | 'down';
        response_time_ms: number;
    };
    storage: {
        used_gb: number;
        total_gb: number;
        percentage: number;
    };
    uptime_percentage: number;
}

// ============================================================================
// CHART DATA
// ============================================================================

export interface ChartDataPoint {
    date: string;
    value: number;
    label?: string;
}

export interface ChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor?: string;
        borderColor?: string;
    }[];
}

// ============================================================================
// PLATFORM DASHBOARD DATA
// ============================================================================

export interface PlatformDashboardData {
    stats: PlatformStats;
    metrics: PlatformMetrics;
    companies: CompanyDetails[];
    agents: AgentStats[];
    recentActivity: ActivityItem[];
    revenueBreakdown: RevenueBreakdown;
    systemHealth: SystemHealth;
    
    // Chart data
    companiesGrowthChart: ChartData;
    revenueGrowthChart: ChartData;
    planDistributionChart: ChartData;
    agentPopularityChart: ChartData;
}

// ============================================================================
// FILTERS & SORTING
// ============================================================================

export interface CompanyFilter {
    status?: 'active' | 'suspended' | 'cancelled';
    plan?: 'free' | 'professional' | 'enterprise';
    search?: string;
    sortBy?: 'name' | 'created_at' | 'user_count' | 'project_count' | 'monthly_spend';
    sortOrder?: 'asc' | 'desc';
}

export interface UserFilter {
    role?: string;
    company_id?: string;
    search?: string;
    sortBy?: 'name' | 'email' | 'created_at';
    sortOrder?: 'asc' | 'desc';
}

export interface AuditLogFilter {
    user_id?: string;
    company_id?: string;
    action?: string;
    resource_type?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
}
