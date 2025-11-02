import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { analyticsService, AnalyticsMetrics, TrendData } from '../../services/analyticsService';

interface AnalyticsScreenProps {
  currentUser: User;
  onNavigate: (screen: string, params?: any) => void;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill?: boolean;
  }[];
}

const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({ currentUser, onNavigate }) => {
  const [analytics, setAnalytics] = useState<AnalyticsMetrics | null>(null);
  const [trends, setTrends] = useState<{ [key: string]: TrendData[] }>({});
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedMetric, setSelectedMetric] = useState<'productivity' | 'financial' | 'timeline' | 'quality'>('productivity');

  useEffect(() => {
    loadAnalytics();
  }, [currentUser, selectedTimeframe]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const companyId = currentUser.role === 'super_admin' ? undefined : currentUser.companyId;
      
      const analyticsData = await analyticsService.generateAnalytics(companyId, selectedTimeframe);
      setAnalytics(analyticsData);

      // Load trend data
      const productivityTrends = await analyticsService.generateTrendData('productivity', companyId);
      const financialTrends = await analyticsService.generateTrendData('financial', companyId);
      const timelineTrends = await analyticsService.generateTrendData('timeline', companyId);
      const qualityTrends = await analyticsService.generateTrendData('quality', companyId);

      setTrends({
        productivity: productivityTrends,
        financial: financialTrends,
        timeline: timelineTrends,
        quality: qualityTrends
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getMetricColor = (value: number, threshold: { good: number; warning: number }) => {
    if (value >= threshold.good) return 'text-green-600';
    if (value >= threshold.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) {
      return (
        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
    } else if (change < 0) {
      return (
        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      );
    }
  };

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: number;
    color?: string;
    icon?: React.ReactNode;
  }> = ({ title, value, subtitle, trend, color = 'text-gray-900', icon }) => (
    <div className="bg-white p-6 rounded-lg shadow border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      {trend !== undefined && (
        <div className="mt-4 flex items-center">
          {getTrendIcon(trend)}
          <span className={`ml-2 text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
          </span>
          <span className="ml-1 text-sm text-gray-500">vs last period</span>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</div>
          <div className="text-gray-500">Unable to load analytics data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            {currentUser.role === 'super_admin' ? 'Platform-wide' : 'Company'} performance insights
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
          
          <button
            onClick={loadAnalytics}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Productivity Metrics */}
        <MetricCard
          title="Tasks Completed/Day"
          value={analytics.productivity.tasksCompletedPerDay.toFixed(1)}
          color={getMetricColor(analytics.productivity.tasksCompletedPerDay, { good: 5, warning: 3 })}
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
        />

        <MetricCard
          title="Task Completion Rate"
          value={formatPercentage(analytics.productivity.taskCompletionRate)}
          subtitle={`${analytics.productivity.overdueTasks} overdue`}
          color={getMetricColor(analytics.productivity.taskCompletionRate, { good: 90, warning: 75 })}
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />

        <MetricCard
          title="Budget Variance"
          value={formatPercentage(Math.abs(analytics.financial.budgetVariance))}
          subtitle={analytics.financial.budgetVariance > 0 ? 'Over budget' : 'Under budget'}
          color={getMetricColor(-Math.abs(analytics.financial.budgetVariance), { good: -5, warning: -10 })}
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          }
        />

        <MetricCard
          title="Quality Score"
          value={formatPercentage(analytics.quality.qualityScore)}
          subtitle={`${analytics.quality.reworkTasks} rework tasks`}
          color={getMetricColor(analytics.quality.qualityScore, { good: 85, warning: 70 })}
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Overview */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Financial Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Budget</span>
              <span className="font-semibold">{formatCurrency(analytics.financial.totalBudget)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Spent</span>
              <span className="font-semibold">{formatCurrency(analytics.financial.totalSpent)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cost per Task</span>
              <span className="font-semibold">{formatCurrency(analytics.financial.costPerTask)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Projected Overrun</span>
              <span className={`font-semibold ${analytics.financial.projectedOverrun > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(analytics.financial.projectedOverrun)}
              </span>
            </div>
          </div>
        </div>

        {/* Timeline Overview */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Timeline Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Projects On Time</span>
              <span className="font-semibold text-green-600">{analytics.timeline.projectsOnTime}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Projects Delayed</span>
              <span className="font-semibold text-red-600">{analytics.timeline.projectsDelayed}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Delay</span>
              <span className="font-semibold">{analytics.timeline.averageDelay.toFixed(1)} days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Critical Path Tasks</span>
              <span className="font-semibold text-orange-600">{analytics.timeline.criticalPathTasks}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Team Performance */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Team Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{analytics.team.activeUsers}</div>
            <div className="text-sm text-gray-500">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{analytics.team.collaborationIndex.toFixed(1)}%</div>
            <div className="text-sm text-gray-500">Collaboration Index</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Object.values(analytics.team.performanceScores).length > 0 
                ? (Object.values(analytics.team.performanceScores).reduce((a, b) => a + b, 0) / Object.values(analytics.team.performanceScores).length).toFixed(1)
                : '0'
              }%
            </div>
            <div className="text-sm text-gray-500">Avg Performance</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate('reports')}
            className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-left"
          >
            <div className="font-medium text-gray-900">Generate Report</div>
            <div className="text-sm text-gray-500">Create detailed analytics report</div>
          </button>
          <button
            onClick={() => onNavigate('projects')}
            className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-left"
          >
            <div className="font-medium text-gray-900">View Projects</div>
            <div className="text-sm text-gray-500">Analyze individual project performance</div>
          </button>
          <button
            onClick={() => onNavigate('team-performance')}
            className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-left"
          >
            <div className="font-medium text-gray-900">Team Analysis</div>
            <div className="text-sm text-gray-500">Deep dive into team metrics</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsScreen;
