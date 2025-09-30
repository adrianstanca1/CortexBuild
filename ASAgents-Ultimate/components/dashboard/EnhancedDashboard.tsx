import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ChartBarIcon, 
  BuildingOfficeIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ChartPieIcon,
  CalendarIcon,
  BellIcon,
  DocumentTextIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

// Enhanced Dashboard Service Hook
import { useDashboardData } from '../../hooks/useDashboardData';
import { useRealTimeUpdates } from '../../hooks/useRealTimeUpdates';
import { StatsCard } from '../ui/StatsCard';
import { ProjectsOverview } from './ProjectsOverview';
import { FinancialSummary } from './FinancialSummary';
import { TeamPerformance } from './TeamPerformance';
import { RiskAssessment } from './RiskAssessment';
import { RecentActivity } from './RecentActivity';
import { WeatherWidget } from '../tools/WeatherWidget';
import { AIInsights } from '../ai/AIInsights';

export const EnhancedDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('last30days');

  // Enhanced data fetching with real-time updates
  const { 
    projects, 
    financials, 
    team, 
    analytics, 
    risks,
    loading, 
    error,
    refreshData 
  } = useDashboardData(dateRange);

  // Real-time updates
  useRealTimeUpdates(['projects', 'invoices', 'tasks'], refreshData);

  // Computed metrics
  const dashboardMetrics = useMemo(() => {
    if (!projects || !financials) return null;

    return {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'active').length,
      totalRevenue: financials.totalRevenue || 0,
      profitMargin: financials.profitMargin || 0,
      completionRate: projects.reduce((acc, p) => acc + p.progress, 0) / projects.length,
      riskScore: risks?.averageRiskScore || 0,
      teamUtilization: team?.utilizationRate || 0,
      overdueInvoices: financials.overdueCount || 0
    };
  }, [projects, financials, team, risks]);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'projects', name: 'Projects', icon: BuildingOfficeIcon },
    { id: 'financials', name: 'Financials', icon: CurrencyDollarIcon },
    { id: 'team', name: 'Team', icon: UserGroupIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartPieIcon },
    { id: 'risks', name: 'Risk Management', icon: ExclamationTriangleIcon }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-center">
          <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4" />
          <p>Error loading dashboard: {error.message}</p>
          <button 
            onClick={refreshData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.firstName || 'User'}
              </h1>
              <p className="text-gray-600">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Date Range Selector */}
              <select 
                value={dateRange} 
                onChange={(e) => setDateRange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="last90days">Last 90 Days</option>
                <option value="lastyear">Last Year</option>
              </select>

              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <BellIcon className="h-6 w-6" />
                {risks?.highPriorityCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {risks.highPriorityCount}
                  </span>
                )}
              </button>

              {/* Refresh Button */}
              <button 
                onClick={refreshData}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            {dashboardMetrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                  title="Active Projects"
                  value={dashboardMetrics.activeProjects}
                  total={dashboardMetrics.totalProjects}
                  icon={BuildingOfficeIcon}
                  trend="+12%"
                  trendDirection="up"
                />
                <StatsCard
                  title="Total Revenue"
                  value={`$${(dashboardMetrics.totalRevenue / 1000000).toFixed(1)}M`}
                  icon={CurrencyDollarIcon}
                  trend="+8.2%"
                  trendDirection="up"
                />
                <StatsCard
                  title="Team Utilization"
                  value={`${dashboardMetrics.teamUtilization.toFixed(1)}%`}
                  icon={UserGroupIcon}
                  trend="-2.1%"
                  trendDirection="down"
                />
                <StatsCard
                  title="Risk Score"
                  value={dashboardMetrics.riskScore.toFixed(1)}
                  icon={ExclamationTriangleIcon}
                  trend="Low"
                  trendDirection={dashboardMetrics.riskScore < 3 ? 'up' : 'down'}
                />
              </div>
            )}

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-8">
                <ProjectsOverview projects={projects} />
                <FinancialSummary financials={financials} />
                <TeamPerformance team={team} />
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                <AIInsights data={{ projects, financials, team }} />
                <WeatherWidget />
                <RiskAssessment risks={risks} />
                <RecentActivity activities={analytics?.recentActivities} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <ProjectsOverview projects={projects} detailed={true} />
        )}

        {activeTab === 'financials' && (
          <FinancialSummary financials={financials} detailed={true} />
        )}

        {activeTab === 'team' && (
          <TeamPerformance team={team} detailed={true} />
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Advanced Analytics
              </h3>
              {/* Analytics charts and insights */}
            </div>
          </div>
        )}

        {activeTab === 'risks' && (
          <RiskAssessment risks={risks} detailed={true} />
        )}
      </div>
    </div>
  );
};