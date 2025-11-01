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

// Mock platform admin functions
export const getPlatformStats = async (): Promise<PlatformStats> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    totalUsers: 1247,
    totalCompanies: 89,
    totalProjects: 456,
    activeUsers: 234,
    systemHealth: 'healthy',
    uptime: 99.8
  };
};

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
import type { AIAgent, User } from '../types';

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
};

export const deleteAIAgent = async (agentId: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  // TODO: Implement actual API call
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
  return true;
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
};

export const getPlatformDashboardData = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    stats: await getPlatformStats(),
    metrics: await getSystemMetrics(),
    userActivity: await getUserActivity(),
    recentEvents: [
      {
        id: 'event-1',
        type: 'user_registration',
        description: 'New user registered: John Smith',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        severity: 'info'
      },
      {
        id: 'event-2',
        type: 'system_update',
        description: 'System updated to version 2.0.1',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        severity: 'info'
      },
      {
        id: 'event-3',
        type: 'security_alert',
        description: 'Failed login attempts detected',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        severity: 'warning'
      }
    ]
  };
};
