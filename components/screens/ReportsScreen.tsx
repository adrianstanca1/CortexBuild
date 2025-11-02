import React, { useState, useEffect } from 'react';
import { User, Project } from '../../types';
import { analyticsService, PerformanceReport } from '../../services/analyticsService';
import { dataService } from '../../services/dataService';

interface ReportsScreenProps {
  currentUser: User;
  onNavigate: (screen: string, params?: any) => void;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'project' | 'financial' | 'productivity' | 'quality' | 'custom';
  icon: string;
  color: string;
  parameters: string[];
}

const ReportsScreen: React.FC<ReportsScreenProps> = ({ currentUser, onNavigate }) => {
  const [reports, setReports] = useState<PerformanceReport[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [generatingReport, setGeneratingReport] = useState(false);

  const reportTemplates: ReportTemplate[] = [
    {
      id: 'project-performance',
      name: 'Project Performance Report',
      description: 'Comprehensive analysis of project health, timeline, and budget performance',
      type: 'project',
      icon: '📊',
      color: 'blue',
      parameters: ['projectId', 'dateRange']
    },
    {
      id: 'financial-summary',
      name: 'Financial Summary Report',
      description: 'Budget analysis, cost tracking, and financial projections',
      type: 'financial',
      icon: '💰',
      color: 'green',
      parameters: ['dateRange', 'projectId']
    },
    {
      id: 'productivity-analysis',
      name: 'Team Productivity Analysis',
      description: 'Task completion rates, efficiency metrics, and team performance',
      type: 'productivity',
      icon: '⚡',
      color: 'purple',
      parameters: ['dateRange', 'teamId']
    },
    {
      id: 'quality-metrics',
      name: 'Quality Metrics Report',
      description: 'RFI rates, rework analysis, and quality control metrics',
      type: 'quality',
      icon: '🎯',
      color: 'orange',
      parameters: ['dateRange', 'projectId']
    },
    {
      id: 'executive-dashboard',
      name: 'Executive Dashboard',
      description: 'High-level overview for leadership with key performance indicators',
      type: 'custom',
      icon: '👔',
      color: 'indigo',
      parameters: ['dateRange']
    },
    {
      id: 'risk-assessment',
      name: 'Risk Assessment Report',
      description: 'Project risks, mitigation strategies, and early warning indicators',
      type: 'project',
      icon: '⚠️',
      color: 'red',
      parameters: ['projectId', 'riskLevel']
    }
  ];

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load projects
      const projectsData = await dataService.getProjects(
        currentUser.role === 'super_admin' ? undefined : currentUser.companyId
      );
      setProjects(projectsData);

      // Load recent reports (mock data for now)
      const mockReports: PerformanceReport[] = [];
      setReports(mockReports);
    } catch (error) {
      console.error('Error loading reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    if (!selectedTemplate) {
      alert('Please select a report template');
      return;
    }

    try {
      setGeneratingReport(true);

      const template = reportTemplates.find(t => t.id === selectedTemplate);
      if (!template) return;

      // Generate report based on template
      let report: PerformanceReport;

      if (template.type === 'project' && selectedProject) {
        report = await analyticsService.generatePerformanceReport(selectedProject);
      } else {
        // Generate company-wide report
        const analytics = await analyticsService.generateAnalytics(
          currentUser.role === 'super_admin' ? undefined : currentUser.companyId
        );
        
        report = {
          projectId: 'company-wide',
          projectName: 'Company-Wide Analysis',
          metrics: analytics,
          trends: {
            productivity: await analyticsService.generateTrendData('productivity'),
            budget: await analyticsService.generateTrendData('budget'),
            timeline: await analyticsService.generateTrendData('timeline'),
            quality: await analyticsService.generateTrendData('quality')
          },
          recommendations: [
            {
              priority: 'high',
              category: 'Productivity',
              title: 'Optimize Task Assignment',
              description: 'Implement AI-powered task assignment to improve efficiency',
              impact: 'Could improve productivity by 15-20%',
              effort: 'Medium - Requires process changes'
            }
          ],
          benchmarks: {
            industryAverage: 75,
            companyAverage: 82,
            bestInClass: 95,
            currentValue: analytics.productivity.taskCompletionRate
          }
        };
      }

      setReports(prev => [report, ...prev]);
      
      // Reset form
      setSelectedTemplate('');
      setSelectedProject('');
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setGeneratingReport(false);
    }
  };

  const exportReport = (report: PerformanceReport, format: 'pdf' | 'excel' | 'csv') => {
    // Mock export functionality
    const data = {
      reportName: `${report.projectName} - Performance Report`,
      generatedAt: new Date().toISOString(),
      format,
      data: report
    };

    // In a real implementation, this would generate and download the file
    console.log('Exporting report:', data);
    alert(`Report exported as ${format.toUpperCase()}. Check your downloads folder.`);
  };

  const getTemplateIcon = (template: ReportTemplate) => (
    <div className={`w-12 h-12 bg-${template.color}-100 rounded-lg flex items-center justify-center text-2xl`}>
      {template.icon}
    </div>
  );

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
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Generate comprehensive business intelligence reports</p>
        </div>
        
        <button
          onClick={() => onNavigate('analytics')}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          View Analytics Dashboard
        </button>
      </div>

      {/* Report Generator */}
      <div className="bg-white rounded-lg shadow border p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Generate New Report</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Template</label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a template</option>
              {reportTemplates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.icon} {template.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project (Optional)</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Projects</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={generateReport}
              disabled={!selectedTemplate || generatingReport}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {generatingReport ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>

        {/* Template Description */}
        {selectedTemplate && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            {(() => {
              const template = reportTemplates.find(t => t.id === selectedTemplate);
              return template ? (
                <div className="flex items-start gap-3">
                  {getTemplateIcon(template)}
                  <div>
                    <h3 className="font-medium text-blue-900">{template.name}</h3>
                    <p className="text-sm text-blue-700 mt-1">{template.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-blue-600">Parameters:</span>
                      {template.parameters.map(param => (
                        <span key={param} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {param}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        )}
      </div>

      {/* Report Templates Grid */}
      <div className="bg-white rounded-lg shadow border p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Available Report Templates</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTemplates.map(template => (
            <div
              key={template.id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedTemplate === template.id 
                  ? `border-${template.color}-500 bg-${template.color}-50` 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <div className="flex items-start gap-3">
                {getTemplateIcon(template)}
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{template.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${template.color}-100 text-${template.color}-800`}>
                      {template.type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {template.parameters.length} parameters
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Generated Reports */}
      {reports.length > 0 && (
        <div className="bg-white rounded-lg shadow border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-bold text-gray-900">Generated Reports</h2>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {reports.map((report, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{report.projectName} - Performance Report</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Generated on {new Date().toLocaleDateString()} • 
                        {report.recommendations.length} recommendations
                      </p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">
                            {report.metrics.productivity.taskCompletionRate.toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-500">Task Completion</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">
                            {report.metrics.financial.budgetVariance.toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-500">Budget Variance</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">
                            {report.metrics.quality.qualityScore.toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-500">Quality Score</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-orange-600">
                            {report.metrics.team.activeUsers}
                          </div>
                          <div className="text-xs text-gray-500">Active Users</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => onNavigate('report-detail', { reportId: index })}
                        className="px-3 py-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Details
                      </button>
                      <div className="relative">
                        <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                          Export ▼
                        </button>
                        <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10 hidden group-hover:block">
                          <button
                            onClick={() => exportReport(report, 'pdf')}
                            className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                          >
                            Export PDF
                          </button>
                          <button
                            onClick={() => exportReport(report, 'excel')}
                            className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                          >
                            Export Excel
                          </button>
                          <button
                            onClick={() => exportReport(report, 'csv')}
                            className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                          >
                            Export CSV
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow border p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate('analytics')}
            className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-left"
          >
            <div className="font-medium text-gray-900">Analytics Dashboard</div>
            <div className="text-sm text-gray-500">View real-time analytics and metrics</div>
          </button>
          <button
            onClick={() => onNavigate('time-reports')}
            className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-left"
          >
            <div className="font-medium text-gray-900">Time Reports</div>
            <div className="text-sm text-gray-500">Generate time tracking reports</div>
          </button>
          <button
            onClick={() => onNavigate('financial-reports')}
            className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-left"
          >
            <div className="font-medium text-gray-900">Financial Reports</div>
            <div className="text-sm text-gray-500">Budget and cost analysis reports</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportsScreen;
