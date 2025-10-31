// 🏗️ Advanced Reporting Dashboard
// Comprehensive reporting system with charts, export capabilities, and custom reports

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  Download, 
  Calendar, 
  Filter, 
  Settings, 
  Share2, 
  FileText, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Users, 
  Target, 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Eye,
  Edit,
  Plus,
  Trash2
} from 'lucide-react';
import { projectAnalyticsService } from '../services/projectAnalyticsService';

interface AdvancedReportingDashboardProps {
  projectId: string;
  userId: string;
}

interface Report {
  id: string;
  name: string;
  description: string;
  type: 'budget' | 'schedule' | 'quality' | 'safety' | 'productivity' | 'custom';
  chartType: 'bar' | 'line' | 'pie' | 'area' | 'table';
  dateRange: {
    start: Date;
    end: Date;
  };
  filters: any;
  data: any;
  createdBy: string;
  createdAt: Date;
  lastRun: Date;
  isScheduled: boolean;
  scheduleFrequency?: 'daily' | 'weekly' | 'monthly';
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
    borderWidth?: number;
  }[];
}

export const AdvancedReportingDashboard: React.FC<AdvancedReportingDashboardProps> = ({ 
  projectId, 
  userId 
}) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date()
  });

  const [dashboardData, setDashboardData] = useState<{
    budgetChart: ChartData;
    scheduleChart: ChartData;
    qualityChart: ChartData;
    safetyChart: ChartData;
    productivityChart: ChartData;
    summaryMetrics: any;
  } | null>(null);

  useEffect(() => {
    loadReportingData();
  }, [projectId, dateRange]);

  const loadReportingData = async () => {
    setLoading(true);
    try {
      // Load analytics data for charts
      const [budget, schedule, quality, safety, productivity] = await Promise.all([
        projectAnalyticsService.getBudgetAnalysis(projectId),
        projectAnalyticsService.getScheduleAnalysis(projectId),
        projectAnalyticsService.getQualityMetrics(projectId),
        projectAnalyticsService.getSafetyMetrics(projectId),
        projectAnalyticsService.getProductivityMetrics(projectId)
      ]);

      // Create chart data
      const budgetChart: ChartData = {
        labels: ['Planned', 'Actual', 'Forecast'],
        datasets: [{
          label: 'Budget ($)',
          data: [budget.plannedValue, budget.actualCost, budget.forecastAtCompletion],
          backgroundColor: ['#3B82F6', '#EF4444', '#F59E0B'],
          borderWidth: 1
        }]
      };

      const scheduleChart: ChartData = {
        labels: ['Completed', 'In Progress', 'Not Started', 'Overdue'],
        datasets: [{
          label: 'Tasks',
          data: [schedule.tasksCompleted, schedule.tasksInProgress, 
                 schedule.tasksTotal - schedule.tasksCompleted - schedule.tasksInProgress, 
                 schedule.tasksOverdue],
          backgroundColor: ['#10B981', '#3B82F6', '#6B7280', '#EF4444']
        }]
      };

      const qualityChart: ChartData = {
        labels: ['Passed', 'Failed'],
        datasets: [{
          label: 'Inspections',
          data: [quality.inspectionsPassed, quality.inspectionsFailed],
          backgroundColor: ['#10B981', '#EF4444']
        }]
      };

      const safetyChart: ChartData = {
        labels: ['Safety Score', 'PPE Compliance', 'Training Completion'],
        datasets: [{
          label: 'Safety Metrics (%)',
          data: [safety.safetyScore, safety.ppeComplianceRate, 85], // Mock training completion
          backgroundColor: ['#10B981', '#3B82F6', '#F59E0B']
        }]
      };

      const productivityChart: ChartData = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [{
          label: 'Labor Efficiency (%)',
          data: [98, 102, 105, productivity.laborEfficiency],
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2
        }]
      };

      setDashboardData({
        budgetChart,
        scheduleChart,
        qualityChart,
        safetyChart,
        productivityChart,
        summaryMetrics: {
          totalBudget: budget.totalBudget,
          budgetVariance: budget.varianceAtCompletion,
          scheduleProgress: schedule.percentComplete,
          qualityScore: quality.qualityScore,
          safetyScore: safety.safetyScore,
          productivity: productivity.laborEfficiency
        }
      });

      // Load saved reports
      setReports(getMockReports());
    } catch (error) {
      console.error('Error loading reporting data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMockReports = (): Report[] => {
    return [
      {
        id: 'report-1',
        name: 'Weekly Progress Report',
        description: 'Comprehensive weekly project progress summary',
        type: 'custom',
        chartType: 'bar',
        dateRange: { start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), end: new Date() },
        filters: {},
        data: {},
        createdBy: userId,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        lastRun: new Date(),
        isScheduled: true,
        scheduleFrequency: 'weekly'
      },
      {
        id: 'report-2',
        name: 'Budget Variance Analysis',
        description: 'Detailed budget performance and variance analysis',
        type: 'budget',
        chartType: 'line',
        dateRange: { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() },
        filters: {},
        data: {},
        createdBy: userId,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        lastRun: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        isScheduled: false
      },
      {
        id: 'report-3',
        name: 'Safety Performance Dashboard',
        description: 'Safety metrics and incident tracking report',
        type: 'safety',
        chartType: 'pie',
        dateRange: { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() },
        filters: {},
        data: {},
        createdBy: userId,
        createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
        lastRun: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        isScheduled: true,
        scheduleFrequency: 'monthly'
      }
    ];
  };

  const handleExportReport = (format: 'pdf' | 'excel' | 'csv') => {
    // Mock export functionality
    const reportData = selectedReport || { name: 'Dashboard Report' };
    console.log(`Exporting ${reportData.name} as ${format.toUpperCase()}`);
    
    // Create mock download
    const element = document.createElement('a');
    const file = new Blob([`Mock ${format.toUpperCase()} export data for ${reportData.name}`], 
      { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${reportData.name.replace(/\s+/g, '_')}.${format}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'custom', label: 'Custom Reports', icon: Settings },
    { id: 'scheduled', label: 'Scheduled', icon: Calendar }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading reports...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Advanced Reporting</h1>
            <p className="text-gray-600">Comprehensive analytics and custom reports</p>
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
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Report
            </button>
            <div className="relative">
              <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 hidden group-hover:block">
                <button
                  onClick={() => handleExportReport('pdf')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50"
                >
                  Export as PDF
                </button>
                <button
                  onClick={() => handleExportReport('excel')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50"
                >
                  Export as Excel
                </button>
                <button
                  onClick={() => handleExportReport('csv')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50"
                >
                  Export as CSV
                </button>
              </div>
            </div>
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
        {activeTab === 'dashboard' && dashboardData && (
          <DashboardTab 
            data={dashboardData}
            onExport={handleExportReport}
          />
        )}
        {activeTab === 'reports' && (
          <ReportsTab 
            reports={reports}
            onSelectReport={setSelectedReport}
            onExport={handleExportReport}
          />
        )}
        {activeTab === 'custom' && (
          <CustomReportsTab 
            onCreateReport={() => setShowCreateModal(true)}
          />
        )}
        {activeTab === 'scheduled' && (
          <ScheduledReportsTab 
            reports={reports.filter(r => r.isScheduled)}
          />
        )}
      </div>

      {/* Create Report Modal */}
      {showCreateModal && (
        <CreateReportModal
          projectId={projectId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={(newReport) => {
            setReports([...reports, newReport]);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
};

// Dashboard Tab Component
const DashboardTab: React.FC<{
  data: any;
  onExport: (format: 'pdf' | 'excel' | 'csv') => void;
}> = ({ data, onExport }) => {
  return (
    <div className="space-y-6">
      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Total Budget"
          value={`$${data.summaryMetrics.totalBudget.toLocaleString()}`}
          change={data.summaryMetrics.budgetVariance}
          icon={DollarSign}
          color="blue"
        />
        <MetricCard
          title="Schedule Progress"
          value={`${data.summaryMetrics.scheduleProgress}%`}
          change={2.5}
          icon={Clock}
          color="green"
        />
        <MetricCard
          title="Quality Score"
          value={`${data.summaryMetrics.qualityScore}/100`}
          change={1.2}
          icon={Target}
          color="purple"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Budget Performance"
          chartType="bar"
          data={data.budgetChart}
        />
        <ChartCard
          title="Schedule Status"
          chartType="pie"
          data={data.scheduleChart}
        />
        <ChartCard
          title="Quality Metrics"
          chartType="pie"
          data={data.qualityChart}
        />
        <ChartCard
          title="Productivity Trend"
          chartType="line"
          data={data.productivityChart}
        />
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard: React.FC<{
  title: string;
  value: string;
  change: number;
  icon: any;
  color: string;
}> = ({ title, value, change, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600'
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className={`flex items-center text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingUp className="w-4 h-4 mr-1 rotate-180" />}
          {Math.abs(change)}%
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  );
};

// Chart Card Component
const ChartCard: React.FC<{
  title: string;
  chartType: 'bar' | 'line' | 'pie';
  data: ChartData;
}> = ({ title, chartType, data }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          {chartType === 'bar' && <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-2" />}
          {chartType === 'line' && <LineChart className="w-16 h-16 text-gray-400 mx-auto mb-2" />}
          {chartType === 'pie' && <PieChart className="w-16 h-16 text-gray-400 mx-auto mb-2" />}
          <p className="text-gray-600">{title} Chart</p>
          <p className="text-sm text-gray-500 mt-1">
            {data.datasets[0]?.data.length || 0} data points
          </p>
        </div>
      </div>
    </div>
  );
};

// Reports Tab Component
const ReportsTab: React.FC<{
  reports: Report[];
  onSelectReport: (report: Report) => void;
  onExport: (format: 'pdf' | 'excel' | 'csv') => void;
}> = ({ reports, onSelectReport, onExport }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Saved Reports</h3>
        <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </button>
      </div>

      <div className="grid gap-4">
        {reports.map((report) => (
          <div key={report.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-lg font-medium text-gray-900">{report.name}</h4>
                <p className="text-gray-600 mt-1">{report.description}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <span>Type: {report.type}</span>
                  <span>Chart: {report.chartType}</span>
                  <span>Last run: {report.lastRun.toLocaleDateString()}</span>
                  {report.isScheduled && (
                    <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      <Calendar className="w-3 h-3 mr-1" />
                      {report.scheduleFrequency}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onSelectReport(report)}
                  className="p-2 text-blue-600 hover:text-blue-800"
                  title="View Report"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-800" title="Edit Report">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 text-green-600 hover:text-green-800" title="Share Report">
                  <Share2 className="w-4 h-4" />
                </button>
                <button className="p-2 text-red-600 hover:text-red-800" title="Delete Report">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Custom Reports Tab Component
const CustomReportsTab: React.FC<{
  onCreateReport: () => void;
}> = ({ onCreateReport }) => {
  return (
    <div className="text-center py-12">
      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Custom Report Builder</h3>
      <p className="text-gray-600 mb-6">Create custom reports with your own metrics and visualizations</p>
      <button
        onClick={onCreateReport}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        <Plus className="w-4 h-4 mr-2" />
        Create Custom Report
      </button>
    </div>
  );
};

// Scheduled Reports Tab Component
const ScheduledReportsTab: React.FC<{
  reports: Report[];
}> = ({ reports }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Scheduled Reports</h3>
      
      {reports.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Scheduled Reports</h3>
          <p className="text-gray-600">Set up automatic report generation and delivery</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <div key={report.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{report.name}</h4>
                  <p className="text-sm text-gray-600">
                    Runs {report.scheduleFrequency} • Last run: {report.lastRun.toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    Active
                  </span>
                  <button className="p-1 text-gray-600 hover:text-gray-800">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Create Report Modal Component
const CreateReportModal: React.FC<{
  projectId: string;
  onClose: () => void;
  onSuccess: (report: Report) => void;
}> = ({ projectId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'custom' as Report['type'],
    chartType: 'bar' as Report['chartType'],
    isScheduled: false,
    scheduleFrequency: 'weekly' as Report['scheduleFrequency']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newReport: Report = {
      id: `report-${Date.now()}`,
      ...formData,
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date()
      },
      filters: {},
      data: {},
      createdBy: 'current-user',
      createdAt: new Date(),
      lastRun: new Date(),
      scheduleFrequency: formData.isScheduled ? formData.scheduleFrequency : undefined
    };

    onSuccess(newReport);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Create New Report</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter report name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Describe what this report shows"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Report['type'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="budget">Budget</option>
                <option value="schedule">Schedule</option>
                <option value="quality">Quality</option>
                <option value="safety">Safety</option>
                <option value="productivity">Productivity</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chart Type</label>
              <select
                value={formData.chartType}
                onChange={(e) => setFormData({ ...formData, chartType: e.target.value as Report['chartType'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="bar">Bar Chart</option>
                <option value="line">Line Chart</option>
                <option value="pie">Pie Chart</option>
                <option value="area">Area Chart</option>
                <option value="table">Table</option>
              </select>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isScheduled"
              checked={formData.isScheduled}
              onChange={(e) => setFormData({ ...formData, isScheduled: e.target.checked })}
              className="rounded border-gray-300"
            />
            <label htmlFor="isScheduled" className="ml-2 text-sm text-gray-700">
              Schedule automatic generation
            </label>
          </div>

          {formData.isScheduled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
              <select
                value={formData.scheduleFrequency}
                onChange={(e) => setFormData({ ...formData, scheduleFrequency: e.target.value as Report['scheduleFrequency'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdvancedReportingDashboard;
