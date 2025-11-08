import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { businessIntelligenceService, KPI, Dashboard, AdvancedReport } from '../../services/businessIntelligenceService';

interface BusinessIntelligenceScreenProps {
  currentUser: User;
  onNavigate: (screen: string, params?: any) => void;
}

const BusinessIntelligenceScreen: React.FC<BusinessIntelligenceScreenProps> = ({ currentUser, onNavigate }) => {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [reports, setReports] = useState<AdvancedReport[]>([]);
  const [businessInsights, setBusinessInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'kpis' | 'dashboards' | 'reports' | 'insights'>('overview');
  const [selectedKpiCategory, setSelectedKpiCategory] = useState<string>('all');

  useEffect(() => {
    loadBusinessIntelligenceData();
  }, [currentUser]);

  const loadBusinessIntelligenceData = async () => {
    try {
      setLoading(true);
      
      // Load KPIs
      const kpisData = await businessIntelligenceService.getKPIs();
      setKpis(kpisData);

      // Load dashboards
      const dashboardsData = await businessIntelligenceService.getDashboards(currentUser.id);
      setDashboards(dashboardsData);

      // Load reports
      const reportsData = await businessIntelligenceService.getReports();
      setReports(reportsData);

      // Load business insights
      const insights = await businessIntelligenceService.getBusinessInsights();
      setBusinessInsights(insights);
    } catch (error) {
      console.error('Error loading business intelligence data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getKpiStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800 border-green-200';
      case 'good': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string, trendPercentage: number) => {
    const color = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';
    
    if (trend === 'up') {
      return (
        <div className={`flex items-center ${color}`}>
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7m0 0H7" />
          </svg>
          <span className="text-sm font-medium">+{trendPercentage.toFixed(1)}%</span>
        </div>
      );
    } else if (trend === 'down') {
      return (
        <div className={`flex items-center ${color}`}>
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10m0 0h10" />
          </svg>
          <span className="text-sm font-medium">-{trendPercentage.toFixed(1)}%</span>
        </div>
      );
    } else {
      return (
        <div className={`flex items-center ${color}`}>
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
          <span className="text-sm font-medium">{trendPercentage.toFixed(1)}%</span>
        </div>
      );
    }
  };

  const formatKpiValue = (kpi: KPI) => {
    if (kpi.unit === '£') {
      return `£${(kpi.value / 1000000).toFixed(1)}M`;
    } else if (kpi.unit === '%') {
      return `${kpi.value.toFixed(1)}%`;
    } else if (kpi.unit === '/5') {
      return `${kpi.value.toFixed(1)}/5`;
    } else if (kpi.unit === '/100') {
      return `${kpi.value.toFixed(1)}/100`;
    } else {
      return `${kpi.value.toFixed(1)} ${kpi.unit}`;
    }
  };

  const getProgressPercentage = (kpi: KPI) => {
    return Math.min(100, (kpi.value / kpi.target) * 100);
  };

  const filteredKpis = selectedKpiCategory === 'all' 
    ? kpis 
    : kpis.filter(kpi => kpi.category === selectedKpiCategory);

  const kpiCategories = ['all', ...Array.from(new Set(kpis.map(kpi => kpi.category)))];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Intelligence</h1>
          <p className="text-gray-600 mt-1">Advanced analytics, KPIs, and business insights</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onNavigate('create-dashboard')}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Create Dashboard
          </button>
          <button
            onClick={loadBusinessIntelligenceData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-blue-600">{kpis.length}</div>
          <div className="text-sm text-gray-600">Active KPIs</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-green-600">{dashboards.length}</div>
          <div className="text-sm text-gray-600">Dashboards</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-purple-600">{reports.length}</div>
          <div className="text-sm text-gray-600">Reports</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-orange-600">{kpis.filter(k => k.status === 'excellent').length}</div>
          <div className="text-sm text-gray-600">Excellent KPIs</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: '📊' },
            { id: 'kpis', name: 'KPIs', icon: '🎯' },
            { id: 'dashboards', name: 'Dashboards', icon: '📈' },
            { id: 'reports', name: 'Reports', icon: '📋' },
            { id: 'insights', name: 'Business Insights', icon: '💡' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon} {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top KPIs */}
          <div className="bg-white rounded-lg shadow border p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Key Performance Indicators</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {kpis.slice(0, 6).map(kpi => (
                <div key={kpi.id} className={`border rounded-lg p-4 ${getKpiStatusColor(kpi.status)}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">{kpi.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getKpiStatusColor(kpi.status)}`}>
                      {kpi.status}
                    </span>
                  </div>
                  
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {formatKpiValue(kpi)}
                  </div>
                  
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Target: {formatKpiValue({...kpi, value: kpi.target})}</span>
                    {getTrendIcon(kpi.trend, kpi.trendPercentage)}
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        kpi.status === 'excellent' ? 'bg-green-500' :
                        kpi.status === 'good' ? 'bg-blue-500' :
                        kpi.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${getProgressPercentage(kpi)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Dashboards</h3>
              {dashboards.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No dashboards created yet</p>
              ) : (
                <div className="space-y-3">
                  {dashboards.map(dashboard => (
                    <div key={dashboard.id} className="flex justify-between items-center p-3 border border-gray-200 rounded">
                      <div>
                        <div className="font-medium text-gray-900">{dashboard.name}</div>
                        <div className="text-sm text-gray-600">{dashboard.widgets.length} widgets</div>
                      </div>
                      <button
                        onClick={() => onNavigate('dashboard-view', { dashboardId: dashboard.id })}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Scheduled Reports</h3>
              {reports.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No reports configured</p>
              ) : (
                <div className="space-y-3">
                  {reports.filter(r => r.schedule.enabled).map(report => (
                    <div key={report.id} className="flex justify-between items-center p-3 border border-gray-200 rounded">
                      <div>
                        <div className="font-medium text-gray-900">{report.name}</div>
                        <div className="text-sm text-gray-600">
                          {report.schedule.frequency} • Next: {report.nextGeneration ? new Date(report.nextGeneration).toLocaleDateString() : 'Not scheduled'}
                        </div>
                      </div>
                      <button
                        onClick={() => onNavigate('report-detail', { reportId: report.id })}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* KPIs Tab */}
      {activeTab === 'kpis' && (
        <div className="space-y-6">
          {/* KPI Category Filter */}
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Category:</label>
              <select
                value={selectedKpiCategory}
                onChange={(e) => setSelectedKpiCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {kpiCategories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* KPIs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredKpis.map(kpi => (
              <div key={kpi.id} className="bg-white rounded-lg shadow border p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900">{kpi.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{kpi.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getKpiStatusColor(kpi.status)}`}>
                    {kpi.status}
                  </span>
                </div>
                
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {formatKpiValue(kpi)}
                </div>
                
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-600">
                    Target: {formatKpiValue({...kpi, value: kpi.target})}
                  </span>
                  {getTrendIcon(kpi.trend, kpi.trendPercentage)}
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{getProgressPercentage(kpi).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        kpi.status === 'excellent' ? 'bg-green-500' :
                        kpi.status === 'good' ? 'bg-blue-500' :
                        kpi.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${getProgressPercentage(kpi)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500">
                  Last updated: {new Date(kpi.lastUpdated).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dashboards Tab */}
      {activeTab === 'dashboards' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow border">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">Custom Dashboards</h2>
                <button
                  onClick={() => onNavigate('create-dashboard')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Dashboard
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {dashboards.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No dashboards created</h3>
                  <p className="text-gray-500 mb-6">Create custom dashboards to visualize your data</p>
                  <button
                    onClick={() => onNavigate('create-dashboard')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create Your First Dashboard
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dashboards.map(dashboard => (
                    <div key={dashboard.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-gray-900">{dashboard.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{dashboard.description}</p>
                        </div>
                        {dashboard.isDefault && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            Default
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Widgets:</span>
                          <span className="font-medium">{dashboard.widgets.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Refresh:</span>
                          <span className="font-medium">{dashboard.refreshInterval}min</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Updated:</span>
                          <span className="font-medium">{new Date(dashboard.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => onNavigate('dashboard-view', { dashboardId: dashboard.id })}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                        >
                          View Dashboard
                        </button>
                        <button
                          onClick={() => onNavigate('dashboard-edit', { dashboardId: dashboard.id })}
                          className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow border">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">Advanced Reports</h2>
                <button
                  onClick={() => onNavigate('create-report')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Report
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {reports.map(report => (
                  <div key={report.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900">{report.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          report.status === 'active' ? 'bg-green-100 text-green-800' :
                          report.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {report.status}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {report.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-600">Format</div>
                        <div className="font-medium uppercase">{report.format}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Frequency</div>
                        <div className="font-medium capitalize">{report.schedule.frequency}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Last Generated</div>
                        <div className="font-medium">
                          {report.lastGenerated ? new Date(report.lastGenerated).toLocaleDateString() : 'Never'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Next Generation</div>
                        <div className="font-medium">
                          {report.nextGeneration ? new Date(report.nextGeneration).toLocaleDateString() : 'Not scheduled'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => onNavigate('report-detail', { reportId: report.id })}
                        className="px-3 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 text-sm"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => businessIntelligenceService.generateReport(report.id, {})}
                        className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                      >
                        Generate Now
                      </button>
                      <button
                        onClick={() => onNavigate('report-edit', { reportId: report.id })}
                        className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Business Insights Tab */}
      {activeTab === 'insights' && businessInsights && (
        <div className="space-y-6">
          {/* Executive Summary */}
          <div className="bg-white rounded-lg shadow border p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Executive Summary</h2>
            <p className="text-gray-700 leading-relaxed">{businessInsights.summary}</p>
          </div>

          {/* Key Findings */}
          <div className="bg-white rounded-lg shadow border p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Key Findings</h2>
            <ul className="space-y-2">
              {businessInsights.keyFindings.map((finding: string, index: number) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">{finding}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommendations & Risks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recommendations</h3>
              <ul className="space-y-3">
                {businessInsights.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700 text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Risk Factors</h3>
              <ul className="space-y-3">
                {businessInsights.riskFactors.map((risk: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <span className="text-gray-700 text-sm">{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Opportunities */}
          <div className="bg-white rounded-lg shadow border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Growth Opportunities</h3>
            <ul className="space-y-3">
              {businessInsights.opportunities.map((opp: string, index: number) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="text-gray-700 text-sm">{opp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessIntelligenceScreen;
