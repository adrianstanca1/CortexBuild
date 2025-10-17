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
