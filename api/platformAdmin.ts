// Platform Admin API
export interface PlatformStats {
  totalUsers: number;
  totalCompanies: number;
  totalProjects: number;
  activeUsers: number;
  systemHealth: 'healthy' | 'degraded' | 'down';
  uptime: number;
}

export interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  responseTime: number;
  errorRate: number;
}

export interface UserActivity {
  userId: string;
  userName: string;
  lastActive: string;
  actionsToday: number;
  currentSession: boolean;
}

// Import PlatformStats and PlatformMetrics from types
import type { PlatformStats as PlatformStatsType, PlatformMetrics as PlatformMetricsType, CompanyDetails, AgentStats, ActivityItem, SystemHealth, RevenueBreakdown, ChartData } from '../types/platformAdmin';

// Mock platform admin functions
export const getPlatformStats = async (): Promise<PlatformStatsType> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    active_companies: 89,
    total_companies: 89,
    total_users: 1247,
    total_projects: 456,
    total_tasks: 2340,
    active_subscriptions: 89,
    monthly_revenue: 125000
  };
};

export const getPlatformMetrics = async (): Promise<PlatformMetricsType> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    new_companies_this_month: 5,
    new_users_this_month: 87,
    new_projects_this_month: 23,
    mrr: 125000,
    arr: 1500000,
    revenue_growth: 12.5,
    active_users_today: 234,
    active_users_this_week: 567,
    active_users_this_month: 890,
    free_plan_count: 25,
    professional_plan_count: 45,
    enterprise_plan_count: 19,
    most_popular_agent: 'safety-inspector',
    total_agent_subscriptions: 156,
    agent_revenue: 45000
  };
};

// Keep SystemMetrics for backward compatibility (might be used elsewhere)
export const getSystemMetrics = async (): Promise<SystemMetrics> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    cpu: Math.random() * 80 + 10,
    memory: Math.random() * 70 + 20,
    disk: Math.random() * 60 + 30,
    network: Math.random() * 50 + 10,
    responseTime: Math.random() * 100 + 50,
    errorRate: Math.random() * 2
  };
};

export const getUserActivity = async (): Promise<UserActivity[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));

  return [
    {
      userId: 'user-1',
      userName: 'John Manager',
      lastActive: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      actionsToday: 45,
      currentSession: true
    },
    {
      userId: 'user-2',
      userName: 'Adrian ASC',
      lastActive: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      actionsToday: 32,
      currentSession: true
    },
    {
      userId: 'user-3',
      userName: 'Sarah Supervisor',
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      actionsToday: 28,
      currentSession: false
    }
  ];
};

// AIAgent API functions
import type { AIAgent } from '../types';

export const getAIAgents = async (): Promise<AIAgent[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  // TODO: Implement actual API call
  return [];
};

export const fetchAvailableAIAgents = async (): Promise<AIAgent[]> => {
  return getAIAgents();
};

export const createAIAgent = async (formData: Partial<AIAgent>): Promise<AIAgent> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  // TODO: Implement actual API call
  return {
    id: `agent-${Date.now()}`,
    name: formData.name || '',
    description: formData.description || '',
    category: formData.category || 'safety',
    priceMonthly: formData.priceMonthly || 0,
    priceYearly: formData.priceYearly || 0,
    features: formData.features || [],
    capabilities: formData.capabilities || [],
    iconUrl: formData.iconUrl,
    bannerUrl: formData.bannerUrl,
    isActive: formData.isActive ?? true,
    isFeatured: formData.isFeatured ?? false,
    minPlan: formData.minPlan || 'basic'
  };
};

export const updateAIAgent = async (agentId: string, formData: Partial<AIAgent>): Promise<AIAgent> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  // TODO: Implement actual API call
  return {
    id: agentId,
    name: formData.name || '',
    description: formData.description || '',
    category: formData.category || 'safety',
    priceMonthly: formData.priceMonthly || 0,
    priceYearly: formData.priceYearly || 0,
    features: formData.features || [],
    capabilities: formData.capabilities || [],
    iconUrl: formData.iconUrl,
    bannerUrl: formData.bannerUrl,
    isActive: formData.isActive ?? true,
    isFeatured: formData.isFeatured ?? false,
    minPlan: formData.minPlan || 'basic'
  };
};

export const toggleAIAgentStatus = async (agentId: string, isActive: boolean): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  // TODO: Implement actual API call
  console.info('Mock toggleAIAgentStatus', { agentId, isActive });
};

export const deleteAIAgent = async (agentId: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  // TODO: Implement actual API call
  console.info('Mock deleteAIAgent', { agentId });
};

// Audit Log API functions
export interface AuditLogEntry {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string;
  userId: string;
  userName: string;
  timestamp: string;
  createdAt?: string;
  ipAddress?: string;
  userAgent?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  metadata?: Record<string, any>;
}

export const getPlatformAuditLogs = async (offset: number = 0, limit: number = 50): Promise<AuditLogEntry[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  // TODO: Implement actual API call
  console.info('Mock getPlatformAuditLogs', { offset, limit });
  return [];
};

// Company Management API functions
export interface CompanyPlan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  limits?: {
    users: number;
    projects: number;
    storage: number;
  };
  maxUsers?: number;
  maxProjects?: number;
  aiAgentsIncluded?: string[];
  aiAgentsLimit?: number;
  storageGb?: number;
  sortOrder?: number;
  isActive: boolean;
  isFeatured?: boolean;
}

export const getAllCompanies = async (): Promise<any[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  // TODO: Implement actual API call
  return [];
};

export const getAllCompanyPlans = async (): Promise<CompanyPlan[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  // TODO: Implement actual API call
  return [];
};

export const updateCompanyPlan = async (companyId: string, planId: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  // TODO: Implement actual API call
  console.info('Mock updateCompanyPlan', { companyId, planId });
  return true;
};

export const toggleCompanyPlanStatus = async (planId: string, isActive: boolean): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  // TODO: Implement actual API call
  console.info('Mock toggleCompanyPlanStatus', { planId, isActive });
};

// Platform Invitations API functions
export interface PlatformInvitation {
  id: string;
  email: string;
  companyName?: string;
  invitationType: 'company_admin' | 'super_admin' | 'platform_partner';
  status: 'pending' | 'accepted' | 'expired';
  sentAt: string;
  expiresAt: string;
  acceptedAt?: string;
  createdAt?: string;
}

export const getPlatformInvitations = async (): Promise<PlatformInvitation[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  // TODO: Implement actual API call
  return [];
};

export const sendPlatformInvitation = async (email: string, invitationType: 'company_admin' | 'super_admin' | 'platform_partner', companyName?: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  // TODO: Implement actual API call
  console.info('Mock sendPlatformInvitation', { email, invitationType, companyName });
};

// Helper functions for dashboard data
export const getCompanies = async (): Promise<CompanyDetails[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  // TODO: Implement actual API call
  return [
    {
      id: 'company-1',
      name: 'BuildCo Inc',
      plan: 'enterprise',
      user_count: 45,
      project_count: 12,
      task_count: 234,
      subscription_count: 3,
      monthly_spend: 1500,
      status: 'active',
      created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
    } as CompanyDetails
  ];
};

export const getAgents = async (): Promise<AgentStats[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  // TODO: Implement actual API call
  return [
    {
      id: 'agent-safety-inspector',
      name: 'Safety Inspector',
      description: 'Automated safety compliance checking',
      category: 'safety',
      status: 'active',
      icon: '🦺',
      subscription_count: 45,
      monthly_revenue: 2250
    },
    {
      id: 'agent-quality-assurance',
      name: 'Quality Assurance',
      description: 'Quality control and inspection automation',
      category: 'quality',
      status: 'active',
      icon: '✅',
      subscription_count: 32,
      monthly_revenue: 1600
    }
  ];
};

export const getSystemHealth = async (): Promise<SystemHealth> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return {
    status: 'healthy',
    database: {
      status: 'connected',
      response_time_ms: 25
    },
    api: {
      status: 'operational',
      response_time_ms: 150
    },
    storage: {
      used_gb: 245,
      total_gb: 500,
      percentage: 49
    },
    uptime_percentage: 99.8
  };
};

export const getRevenueBreakdown = async (): Promise<RevenueBreakdown> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return {
    plan_revenue: {
      free: 0,
      professional: 67500,
      enterprise: 57000
    },
    agent_revenue: {
      'safety-inspector': 22500,
      'quality-assurance': 16000,
      'project-manager': 6500
    },
    total_revenue: 125000
  };
};

export const getRecentActivity = async (): Promise<ActivityItem[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return [
    {
      id: 'activity-1',
      type: 'user_registered',
      title: 'New User Registered',
      description: 'John Smith registered to BuildCo Inc',
      user_id: 'user-123',
      user_name: 'John Smith',
      company_id: 'company-1',
      company_name: 'BuildCo Inc',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      icon: '👤',
      color: 'text-blue-500'
    },
    {
      id: 'activity-2',
      type: 'company_created',
      title: 'New Company Created',
      description: 'New company "TechBuild Ltd" was created',
      company_id: 'company-2',
      company_name: 'TechBuild Ltd',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      icon: '🏢',
      color: 'text-purple-500'
    },
    {
      id: 'activity-3',
      type: 'subscription_created',
      title: 'Subscription Created',
      description: 'Safety Inspector subscription activated for BuildCo Inc',
      company_id: 'company-1',
      company_name: 'BuildCo Inc',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      icon: '💰',
      color: 'text-green-500'
    }
  ];
};

export const getChartData = async (): Promise<{
  companiesGrowthChart: ChartData;
  revenueGrowthChart: ChartData;
  planDistributionChart: ChartData;
  agentPopularityChart: ChartData;
}> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Generate chart data for the last 12 months
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return {
    companiesGrowthChart: {
      labels: months,
      datasets: [{
        label: 'Companies',
        data: [65, 70, 75, 80, 82, 85, 87, 88, 89, 89, 89, 89]
      }]
    },
    revenueGrowthChart: {
      labels: months,
      datasets: [{
        label: 'Revenue ($)',
        data: [95000, 100000, 105000, 110000, 115000, 118000, 120000, 122000, 123000, 124000, 125000, 125000]
      }]
    },
    planDistributionChart: {
      labels: ['Free', 'Professional', 'Enterprise'],
      datasets: [{
        label: 'Companies',
        data: [25, 45, 19]
      }]
    },
    agentPopularityChart: {
      labels: ['Safety Inspector', 'Quality Assurance', 'Project Manager', 'Cost Tracker'],
      datasets: [{
        label: 'Subscriptions',
        data: [45, 32, 28, 15]
      }]
    }
  };
};

export const getPlatformDashboardData = async (): Promise<import('../types/platformAdmin').PlatformDashboardData> => {
  await new Promise(resolve => setTimeout(resolve, 500));

  const [stats, metrics, companies, agents, recentActivity, systemHealth, revenueBreakdown, chartData] = await Promise.all([
    getPlatformStats(),
    getPlatformMetrics(),
    getCompanies(),
    getAgents(),
    getRecentActivity(),
    getSystemHealth(),
    getRevenueBreakdown(),
    getChartData()
  ]);

  return {
    stats,
    metrics,
    companies,
    agents,
    recentActivity,
    systemHealth,
    revenueBreakdown,
    ...chartData
  };
};
