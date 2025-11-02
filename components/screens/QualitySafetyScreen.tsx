import React, { useState, useEffect } from 'react';
import { User, Project } from '../../types';
import { qualitySafetyService, QualityInspection, SafetyIncident, QualityMetrics } from '../../services/qualitySafetyService';
import { dataService } from '../../services/dataService';

interface QualitySafetyScreenProps {
  currentUser: User;
  onNavigate: (screen: string, params?: any) => void;
}

const QualitySafetyScreen: React.FC<QualitySafetyScreenProps> = ({ currentUser, onNavigate }) => {
  const [inspections, setInspections] = useState<QualityInspection[]>([]);
  const [incidents, setIncidents] = useState<SafetyIncident[]>([]);
  const [metrics, setMetrics] = useState<QualityMetrics | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'inspections' | 'incidents' | 'metrics'>('overview');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadProjects();
  }, [currentUser]);

  useEffect(() => {
    loadData();
  }, [selectedProject, dateRange]);

  const loadProjects = async () => {
    try {
      const projectsData = await dataService.getProjects(
        currentUser.role === 'super_admin' ? undefined : currentUser.companyId
      );
      setProjects(projectsData);
      
      if (!selectedProject && projectsData.length > 0) {
        setSelectedProject(projectsData[0].id);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load inspections
      const inspectionsData = await qualitySafetyService.getInspections({
        projectId: selectedProject || undefined,
        dateRange: { start: dateRange.start, end: dateRange.end }
      });
      setInspections(inspectionsData);

      // Load incidents
      const incidentsData = await qualitySafetyService.getIncidents({
        projectId: selectedProject || undefined,
        dateRange: { start: dateRange.start, end: dateRange.end }
      });
      setIncidents(incidentsData);

      // Load metrics
      const metricsData = await qualitySafetyService.getQualityMetrics(
        selectedProject || undefined,
        { start: dateRange.start, end: dateRange.end }
      );
      setMetrics(metricsData);
    } catch (error) {
      console.error('Error loading quality & safety data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'resolved':
      case 'closed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
      case 'investigating':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'scheduled':
      case 'reported':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'catastrophic':
        return 'text-red-600';
      case 'high':
      case 'major':
        return 'text-orange-600';
      case 'medium':
      case 'moderate':
        return 'text-yellow-600';
      case 'low':
      case 'minor':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Quality & Safety Management</h1>
          <p className="text-gray-600 mt-1">Monitor quality inspections, safety incidents, and compliance</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Projects</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
          
          <button
            onClick={() => onNavigate('new-inspection')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            New Inspection
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={loadData}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Apply Filter
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-blue-600">{metrics.inspections.total}</div>
            <div className="text-sm text-gray-600">Total Inspections</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-green-600">{metrics.inspections.passed}</div>
            <div className="text-sm text-gray-600">Passed</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-red-600">{metrics.inspections.failed}</div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-purple-600">{metrics.inspections.averageScore.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Avg Score</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-orange-600">{metrics.incidents.total}</div>
            <div className="text-sm text-gray-600">Incidents</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-gray-600">{metrics.trends.complianceRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Compliance</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: '📊' },
            { id: 'inspections', name: 'Inspections', icon: '🔍', badge: inspections.length },
            { id: 'incidents', name: 'Safety Incidents', icon: '⚠️', badge: incidents.length },
            { id: 'metrics', name: 'Analytics', icon: '📈' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon} {tab.name}
              {tab.badge && tab.badge > 0 && (
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && metrics && (
        <div className="space-y-6">
          {/* Quality Trend */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quality Trend</h3>
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${
                  metrics.trends.qualityTrend === 'improving' ? 'bg-green-500' :
                  metrics.trends.qualityTrend === 'stable' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <span className="font-medium capitalize">{metrics.trends.qualityTrend}</span>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-gray-900">{metrics.inspections.averageScore.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Average Quality Score</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Safety Trend</h3>
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${
                  metrics.trends.safetyTrend === 'improving' ? 'bg-green-500' :
                  metrics.trends.safetyTrend === 'stable' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <span className="font-medium capitalize">{metrics.trends.safetyTrend}</span>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-gray-900">{metrics.incidents.total}</div>
                <div className="text-sm text-gray-600">Total Incidents</div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-bold text-gray-900">Recent Inspections</h3>
              </div>
              <div className="p-6">
                {inspections.slice(0, 5).map(inspection => (
                  <div key={inspection.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                    <div>
                      <div className="font-medium text-gray-900">{inspection.title}</div>
                      <div className="text-sm text-gray-600">{formatDate(inspection.scheduledDate)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(inspection.status)}`}>
                        {inspection.status}
                      </span>
                      {inspection.status === 'completed' && (
                        <span className="text-sm font-medium">{inspection.overallScore}/100</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-bold text-gray-900">Recent Incidents</h3>
              </div>
              <div className="p-6">
                {incidents.slice(0, 5).map(incident => (
                  <div key={incident.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                    <div>
                      <div className="font-medium text-gray-900">{incident.title}</div>
                      <div className="text-sm text-gray-600">{formatDate(incident.dateOccurred)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                        {incident.status}
                      </span>
                      <span className={`text-sm font-medium ${getSeverityColor(incident.severity)}`}>
                        {incident.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inspections Tab */}
      {activeTab === 'inspections' && (
        <div className="bg-white rounded-lg shadow border">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Quality Inspections</h2>
              <button
                onClick={() => onNavigate('new-inspection')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Schedule Inspection
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {inspections.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-lg mb-2">No inspections found</div>
                <div className="text-sm">Schedule your first inspection to get started</div>
              </div>
            ) : (
              <div className="space-y-4">
                {inspections.map(inspection => (
                  <div key={inspection.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{inspection.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{inspection.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>Inspector: {inspection.inspectorName}</span>
                          <span>Location: {inspection.location}</span>
                          <span>Date: {formatDate(inspection.scheduledDate)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(inspection.status)}`}>
                          {inspection.status}
                        </span>
                        {inspection.status === 'completed' && (
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">{inspection.overallScore}/100</div>
                            <div className={`w-3 h-3 rounded-full ${getRiskLevelColor(inspection.riskLevel)}`}></div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {inspection.findings.length > 0 && (
                      <div className="bg-gray-50 rounded p-3">
                        <div className="text-sm font-medium text-gray-900 mb-2">
                          Findings ({inspection.findings.length})
                        </div>
                        <div className="space-y-1">
                          {inspection.findings.slice(0, 2).map(finding => (
                            <div key={finding.id} className="text-sm text-gray-700">
                              <span className={`font-medium ${getSeverityColor(finding.severity)}`}>
                                {finding.severity}:
                              </span>
                              {' '}{finding.title}
                            </div>
                          ))}
                          {inspection.findings.length > 2 && (
                            <div className="text-sm text-gray-500">
                              +{inspection.findings.length - 2} more findings
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => onNavigate('inspection-detail', { inspectionId: inspection.id })}
                        className="px-3 py-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Details
                      </button>
                      {inspection.status === 'scheduled' && (
                        <button
                          onClick={() => onNavigate('conduct-inspection', { inspectionId: inspection.id })}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          Start Inspection
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Incidents Tab */}
      {activeTab === 'incidents' && (
        <div className="bg-white rounded-lg shadow border">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Safety Incidents</h2>
              <button
                onClick={() => onNavigate('report-incident')}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Report Incident
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {incidents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="text-lg mb-2">No incidents reported</div>
                <div className="text-sm">Great! Keep up the excellent safety record</div>
              </div>
            ) : (
              <div className="space-y-4">
                {incidents.map(incident => (
                  <div key={incident.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{incident.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{incident.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>Type: {incident.incidentType}</span>
                          <span>Location: {incident.location}</span>
                          <span>Date: {formatDate(incident.dateOccurred)}</span>
                          <span>Reported by: {incident.reportedBy}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                          {incident.status}
                        </span>
                        <span className={`text-sm font-medium ${getSeverityColor(incident.severity)}`}>
                          {incident.severity}
                        </span>
                      </div>
                    </div>
                    
                    {incident.correctiveActions.length > 0 && (
                      <div className="bg-yellow-50 rounded p-3 mb-3">
                        <div className="text-sm font-medium text-yellow-900 mb-2">
                          Corrective Actions ({incident.correctiveActions.length})
                        </div>
                        <div className="space-y-1">
                          {incident.correctiveActions.slice(0, 2).map(action => (
                            <div key={action.id} className="text-sm text-yellow-800">
                              <span className={`px-2 py-1 rounded text-xs ${getStatusColor(action.status)}`}>
                                {action.status}
                              </span>
                              {' '}{action.description}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => onNavigate('incident-detail', { incidentId: incident.id })}
                        className="px-3 py-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Details
                      </button>
                      {incident.status === 'reported' && (
                        <button
                          onClick={() => onNavigate('investigate-incident', { incidentId: incident.id })}
                          className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
                        >
                          Start Investigation
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Metrics Tab */}
      {activeTab === 'metrics' && metrics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Findings by Type */}
            <div className="bg-white rounded-lg shadow border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Findings by Type</h3>
              <div className="space-y-3">
                {Object.entries(metrics.findings.byType).map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center">
                    <span className="capitalize text-gray-700">{type.replace('-', ' ')}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Incidents by Severity */}
            <div className="bg-white rounded-lg shadow border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Incidents by Severity</h3>
              <div className="space-y-3">
                {Object.entries(metrics.incidents.bySeverity).map(([severity, count]) => (
                  <div key={severity} className="flex justify-between items-center">
                    <span className={`capitalize ${getSeverityColor(severity)}`}>{severity}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Compliance Rate */}
          <div className="bg-white rounded-lg shadow border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Compliance Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{metrics.trends.complianceRate.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Overall Compliance Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{metrics.inspections.passed}</div>
                <div className="text-sm text-gray-600">Passed Inspections</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{metrics.findings.open}</div>
                <div className="text-sm text-gray-600">Open Findings</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QualitySafetyScreen;
