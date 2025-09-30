import { useState, useEffect, useCallback } from 'react';
import { EnhancedDashboardService } from '../services/enhancedDashboardService';
import { AnalyticsService } from '../services/analyticsService';
import { websocketService } from '../services/websocketService';

const enhancedDashboardService = new EnhancedDashboardService();
const analyticsService = new AnalyticsService();

export const useDashboardData = (dateRange: string = 'last30days') => {
  const [data, setData] = useState({
    projects: [],
    financials: null,
    team: null,
    analytics: null,
    risks: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        projectsData,
        financialsData,
        teamData,
        analyticsData,
        risksData
      ] = await Promise.all([
        enhancedDashboardService.getProjects(dateRange),
        enhancedDashboardService.getFinancials(dateRange),
        enhancedDashboardService.getTeamData(dateRange),
        analyticsService.getDashboardAnalytics(dateRange),
        enhancedDashboardService.getRiskAssessment(dateRange)
      ]);

      setData({
        projects: projectsData,
        financials: financialsData,
        team: teamData,
        analytics: analyticsData,
        risks: risksData
      });
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...data,
    loading,
    error,
    refreshData: fetchData
  };
};

export const useRealTimeUpdates = (
  channels: string[], 
  onUpdate: () => void
) => {
  useEffect(() => {
    // Subscribe to real-time updates
    channels.forEach(channel => {
      websocketService.subscribe(channel, onUpdate);
    });

    return () => {
      // Cleanup subscriptions
      channels.forEach(channel => {
        websocketService.unsubscribe(channel, onUpdate);
      });
    };
  }, [channels, onUpdate]);
};