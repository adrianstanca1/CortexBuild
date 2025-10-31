// 🏗️ Project Analytics Dashboard
// Comprehensive analytics interface with real-time metrics and visualizations

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  Users, 
  Shield, 
  Target, 
  AlertTriangle,
  CheckCircle,
  Activity,
  Calendar,
  Settings,
  Download,
  RefreshCw,
  Filter,
  Eye,
  PieChart,
  LineChart
} from 'lucide-react';
import { projectAnalyticsService } from '../services/projectAnalyticsService';
import { 
  BudgetMetrics, 
  ScheduleMetrics, 
  QualityMetrics, 
  SafetyMetrics, 
  ProductivityMetrics, 
  RiskMetrics, 
  TeamMetrics,
  DashboardWidget
} from '../services/projectAnalyticsService';

interface ProjectAnalyticsDashboardProps {
  projectId: string;
  userId: string;
}

export const ProjectAnalyticsDashboard: React.FC<ProjectAnalyticsDashboardProps> = ({ 
  projectId, 
  userId 
}) => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date()
  });

  const [metrics, setMetrics] = useState<{
    budget: BudgetMetrics | null;
    schedule: ScheduleMetrics | null;
    quality: QualityMetrics | null;
    safety: SafetyMetrics | null;
    productivity: ProductivityMetrics | null;
    risks: RiskMetrics | null;
    team: TeamMetrics | null;
  }>({
    budget: null,
    schedule: null,
    quality: null,
    safety: null,
    productivity: null,
    risks: null,
    team: null
  });

  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);

  useEffect(() => {
    loadAnalyticsData();
  }, [projectId, dateRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const [budget, schedule, quality, safety, productivity, risks, team, dashboardWidgets] = await Promise.all([
        projectAnalyticsService.getBudgetAnalysis(projectId),
        projectAnalyticsService.getScheduleAnalysis(projectId),
        projectAnalyticsService.getQualityMetrics(projectId),
        projectAnalyticsService.getSafetyMetrics(projectId),
        projectAnalyticsService.getProductivityMetrics(projectId),
        projectAnalyticsService.getRiskAnalysis(projectId),
        projectAnalyticsService.getTeamMetrics(projectId),
        projectAnalyticsService.getDashboardWidgets(projectId)
      ]);

      setMetrics({ budget, schedule, quality, safety, productivity, risks, team });
      setWidgets(dashboardWidgets);
    } catch (error) {
      console.error('Error loading analytics data:', error);
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

  const getHealthColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return 'text-green-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'budget', label: 'Budget', icon: DollarSign },
    { id: 'schedule', label: 'Schedule', icon: Clock },
    { id: 'quality', label: 'Quality', icon: Target },
    { id: 'safety', label: 'Safety', icon: Shield },
    { id: 'productivity', label: 'Productivity', icon: Activity },
    { id: 'risks', label: 'Risks', icon: AlertTriangle },
    { id: 'team', label: 'Team', icon: Users }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Project Analytics</h1>
            <p className="text-gray-600">Real-time insights and performance metrics</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">From:</label>
              <input
                type="date"
                value={dateRange.start.toISOString().split('T')[0]}
                onChange={(e) => setDateRange({ ...dateRange, start: new Date(e.target.value) })}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              />
              <label className="text-sm text-gray-600">To:</label>
              <input
                type="date"
                value={dateRange.end.toISOString().split('T')[0]}
                onChange={(e) => setDateRange({ ...dateRange, end: new Date(e.target.value) })}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
            <button
              onClick={loadAnalyticsData}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
            <button className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <OverviewTab 
            metrics={metrics} 
            formatCurrency={formatCurrency}
            formatPercentage={formatPercentage}
            getHealthColor={getHealthColor}
          />
        )}
        {activeTab === 'budget' && metrics.budget && (
          <BudgetTab 
            budget={metrics.budget} 
            formatCurrency={formatCurrency}
            getHealthColor={getHealthColor}
          />
        )}
        {activeTab === 'schedule' && metrics.schedule && (
          <ScheduleTab 
            schedule={metrics.schedule} 
            formatPercentage={formatPercentage}
            getHealthColor={getHealthColor}
          />
        )}
        {activeTab === 'quality' && metrics.quality && (
          <QualityTab 
            quality={metrics.quality} 
            formatPercentage={formatPercentage}
            getHealthColor={getHealthColor}
          />
        )}
        {activeTab === 'safety' && metrics.safety && (
          <SafetyTab 
            safety={metrics.safety} 
            formatPercentage={formatPercentage}
            getHealthColor={getHealthColor}
          />
        )}
        {activeTab === 'productivity' && metrics.productivity && (
          <ProductivityTab 
            productivity={metrics.productivity} 
            formatPercentage={formatPercentage}
            getHealthColor={getHealthColor}
          />
        )}
        {activeTab === 'risks' && metrics.risks && (
          <RisksTab 
            risks={metrics.risks} 
            getHealthColor={getHealthColor}
          />
        )}
        {activeTab === 'team' && metrics.team && (
          <TeamTab 
            team={metrics.team} 
            formatPercentage={formatPercentage}
            getHealthColor={getHealthColor}
          />
        )}
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab: React.FC<{
  metrics: any;
  formatCurrency: (amount: number) => string;
  formatPercentage: (value: number) => string;
  getHealthColor: (value: number, thresholds: any) => string;
}> = ({ metrics, formatCurrency, formatPercentage, getHealthColor }) => {
  const kpis = [
    {
      title: 'Budget Performance',
      value: metrics.budget ? formatPercentage((metrics.budget.earnedValue / metrics.budget.actualCost) * 100) : 'N/A',
      trend: metrics.budget ? (metrics.budget.costPerformanceIndex > 1 ? 'up' : 'down') : 'neutral',
      color: metrics.budget ? getHealthColor(metrics.budget.costPerformanceIndex * 100, { good: 100, warning: 95 }) : 'text-gray-600',
      icon: DollarSign,
      subtitle: metrics.budget ? `CPI: ${metrics.budget.costPerformanceIndex.toFixed(2)}` : ''
    },
    {
      title: 'Schedule Progress',
      value: metrics.schedule ? formatPercentage(metrics.schedule.percentComplete) : 'N/A',
      trend: metrics.schedule ? (metrics.schedule.schedulePerformanceIndex > 1 ? 'up' : 'down') : 'neutral',
      color: metrics.schedule ? getHealthColor(metrics.schedule.schedulePerformanceIndex * 100, { good: 100, warning: 95 }) : 'text-gray-600',
      icon: Clock,
      subtitle: metrics.schedule ? `SPI: ${metrics.schedule.schedulePerformanceIndex.toFixed(2)}` : ''
    },
    {
      title: 'Quality Score',
      value: metrics.quality ? `${metrics.quality.qualityScore}/100` : 'N/A',
      trend: 'up',
      color: metrics.quality ? getHealthColor(metrics.quality.qualityScore, { good: 90, warning: 80 }) : 'text-gray-600',
      icon: Target,
      subtitle: metrics.quality ? `${formatPercentage((metrics.quality.inspectionsPassed / metrics.quality.inspectionsTotal) * 100)} pass rate` : ''
    },
    {
      title: 'Safety Score',
      value: metrics.safety ? `${metrics.safety.safetyScore}/100` : 'N/A',
      trend: 'up',
      color: metrics.safety ? getHealthColor(metrics.safety.safetyScore, { good: 95, warning: 90 }) : 'text-gray-600',
      icon: Shield,
      subtitle: metrics.safety ? `${metrics.safety.daysWithoutIncident} days incident-free` : ''
    },
    {
      title: 'Team Productivity',
      value: metrics.productivity ? formatPercentage(metrics.productivity.laborEfficiency) : 'N/A',
      trend: metrics.productivity ? (metrics.productivity.laborEfficiency > 100 ? 'up' : 'down') : 'neutral',
      color: metrics.productivity ? getHealthColor(metrics.productivity.laborEfficiency, { good: 100, warning: 95 }) : 'text-gray-600',
      icon: Activity,
      subtitle: metrics.team ? `${metrics.team.activeMembers}/${metrics.team.totalMembers} active` : ''
    },
    {
      title: 'Risk Level',
      value: metrics.risks ? `${metrics.risks.riskScore}/100` : 'N/A',
      trend: 'down',
      color: metrics.risks ? getHealthColor(100 - metrics.risks.riskScore, { good: 80, warning: 60 }) : 'text-gray-600',
      icon: AlertTriangle,
      subtitle: metrics.risks ? `${metrics.risks.highRisks} high risks` : ''
    }
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          const TrendIcon = kpi.trend === 'up' ? TrendingUp : kpi.trend === 'down' ? TrendingDown : Activity;
          
          return (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="ml-3 text-sm font-medium text-gray-900">{kpi.title}</h3>
                </div>
                <TrendIcon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <div className="space-y-1">
                <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                {kpi.subtitle && <p className="text-sm text-gray-600">{kpi.subtitle}</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Health Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Overall Health</span>
              <span className="text-sm font-medium text-green-600">Good</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Budget Variance</span>
              <span className="text-sm font-medium text-green-600">
                {metrics.budget ? formatCurrency(metrics.budget.varianceAtCompletion) : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Schedule Variance</span>
              <span className="text-sm font-medium text-red-600">
                {metrics.schedule ? `${metrics.schedule.scheduleVariance} days` : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Open Issues</span>
              <span className="text-sm font-medium text-yellow-600">
                {metrics.quality ? metrics.quality.punchListItems : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-600 mr-3" />
              <span className="text-sm text-gray-900">Foundation inspection passed</span>
              <span className="text-xs text-gray-500 ml-auto">2 hours ago</span>
            </div>
            <div className="flex items-center">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mr-3" />
              <span className="text-sm text-gray-900">Material delivery delayed</span>
              <span className="text-xs text-gray-500 ml-auto">4 hours ago</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-600 mr-3" />
              <span className="text-sm text-gray-900">Safety training completed</span>
              <span className="text-xs text-gray-500 ml-auto">1 day ago</span>
            </div>
            <div className="flex items-center">
              <Activity className="w-4 h-4 text-blue-600 mr-3" />
              <span className="text-sm text-gray-900">Weekly progress report generated</span>
              <span className="text-xs text-gray-500 ml-auto">2 days ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Placeholder components for other tabs (will be implemented next)
const BudgetTab: React.FC<{ budget: BudgetMetrics; formatCurrency: any; getHealthColor: any }> = ({ budget }) => (
  <div className="text-center py-8">
    <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900">Budget Analytics</h3>
    <p className="text-gray-600">Detailed budget analysis will be implemented next</p>
    <p className="text-sm text-gray-500 mt-2">Total Budget: {budget ? `$${budget.totalBudget.toLocaleString()}` : 'N/A'}</p>
  </div>
);

const ScheduleTab: React.FC<{ schedule: ScheduleMetrics; formatPercentage: any; getHealthColor: any }> = ({ schedule }) => (
  <div className="text-center py-8">
    <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900">Schedule Analytics</h3>
    <p className="text-gray-600">Detailed schedule analysis will be implemented next</p>
    <p className="text-sm text-gray-500 mt-2">Progress: {schedule ? `${schedule.percentComplete}%` : 'N/A'}</p>
  </div>
);

const QualityTab: React.FC<{ quality: QualityMetrics; formatPercentage: any; getHealthColor: any }> = ({ quality }) => (
  <div className="text-center py-8">
    <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900">Quality Analytics</h3>
    <p className="text-gray-600">Detailed quality analysis will be implemented next</p>
    <p className="text-sm text-gray-500 mt-2">Quality Score: {quality ? `${quality.qualityScore}/100` : 'N/A'}</p>
  </div>
);

const SafetyTab: React.FC<{ safety: SafetyMetrics; formatPercentage: any; getHealthColor: any }> = ({ safety }) => (
  <div className="text-center py-8">
    <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900">Safety Analytics</h3>
    <p className="text-gray-600">Detailed safety analysis will be implemented next</p>
    <p className="text-sm text-gray-500 mt-2">Safety Score: {safety ? `${safety.safetyScore}/100` : 'N/A'}</p>
  </div>
);

const ProductivityTab: React.FC<{ productivity: ProductivityMetrics; formatPercentage: any; getHealthColor: any }> = ({ productivity }) => (
  <div className="text-center py-8">
    <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900">Productivity Analytics</h3>
    <p className="text-gray-600">Detailed productivity analysis will be implemented next</p>
    <p className="text-sm text-gray-500 mt-2">Efficiency: {productivity ? `${productivity.laborEfficiency}%` : 'N/A'}</p>
  </div>
);

const RisksTab: React.FC<{ risks: RiskMetrics; getHealthColor: any }> = ({ risks }) => (
  <div className="text-center py-8">
    <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900">Risk Analytics</h3>
    <p className="text-gray-600">Detailed risk analysis will be implemented next</p>
    <p className="text-sm text-gray-500 mt-2">Total Risks: {risks ? risks.totalRisks : 'N/A'}</p>
  </div>
);

const TeamTab: React.FC<{ team: TeamMetrics; formatPercentage: any; getHealthColor: any }> = ({ team }) => (
  <div className="text-center py-8">
    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900">Team Analytics</h3>
    <p className="text-gray-600">Detailed team analysis will be implemented next</p>
    <p className="text-sm text-gray-500 mt-2">Team Members: {team ? `${team.activeMembers}/${team.totalMembers}` : 'N/A'}</p>
  </div>
);

export default ProjectAnalyticsDashboard;
