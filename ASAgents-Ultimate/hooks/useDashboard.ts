/**
 * React Hook for Dashboard Data
 */

import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../services/integratedApiService';

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalRevenue: number;
  totalExpenses: number;
  activeTasks: number;
  completedTasks: number;
}

interface UseDashboardReturn {
  stats: DashboardStats;
  overview: any;
  recent: any[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const defaultStats: DashboardStats = {
  totalProjects: 0,
  activeProjects: 0,
  completedProjects: 0,
  totalRevenue: 0,
  totalExpenses: 0,
  activeTasks: 0,
  completedTasks: 0,
};

export const useDashboard = (): UseDashboardReturn => {
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [overview, setOverview] = useState<any>(null);
  const [recent, setRecent] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [statsResponse, overviewResponse, recentResponse] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getOverview(),
        dashboardService.getRecent(),
      ]);

      setStats(statsResponse || defaultStats);
      
      if (overviewResponse.success) {
        setOverview(overviewResponse.data);
      }

      if (recentResponse.success && Array.isArray(recentResponse.data)) {
        setRecent(recentResponse.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return {
    stats,
    overview,
    recent,
    isLoading,
    error,
    refresh: loadDashboardData,
  };
};
