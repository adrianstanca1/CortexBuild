// 🏗️ Advanced Project Management Dashboard
// Comprehensive project management interface inspired by Procore and Fieldwire

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  FileText,
  BarChart3,
  Settings,
  Plus,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { projectManagementService } from '../services/projectManagementService';
import { ProjectBudget, ProjectSchedule, ProjectRisk, ProjectIssue, ProjectMetrics } from '../types/project-management';

interface ProjectManagementDashboardProps {
  projectId: string;
}

export const ProjectManagementDashboard: React.FC<ProjectManagementDashboardProps> = ({ projectId }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [projectData, setProjectData] = useState<{
    budget: ProjectBudget | null;
    schedule: ProjectSchedule | null;
    risks: ProjectRisk[];
    issues: ProjectIssue[];
    metrics: ProjectMetrics[];
  }>({
    budget: null,
    schedule: null,
    risks: [],
    issues: [],
    metrics: []
  });

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const loadProjectData = async () => {
    setLoading(true);
    try {
      const [budget, schedule, risks, issues, metrics] = await Promise.all([
        projectManagementService.getProjectBudget(projectId),
        projectManagementService.getProjectSchedule(projectId),
        projectManagementService.getProjectRisks(projectId),
        projectManagementService.getProjectIssues(projectId),
        projectManagementService.getProjectMetrics(projectId)
      ]);

      setProjectData({ budget, schedule, risks, issues, metrics });
    } catch (error) {
      console.error('Error loading project data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'budget', label: 'Budget', icon: DollarSign },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'risks', label: 'Risks', icon: AlertTriangle },
    { id: 'issues', label: 'Issues', icon: FileText },
    { id: 'quality', label: 'Quality', icon: CheckCircle },
    { id: 'team', label: 'Team', icon: Users }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading project data...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Project Management</h1>
            <p className="text-gray-600">Comprehensive project oversight and control</p>
          </div>
          <div className="flex space-x-2">
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Item
            </button>
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Settings className="w-4 h-4 mr-2" />
              Settings
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
        {activeTab === 'overview' && <OverviewTab projectData={projectData} />}
        {activeTab === 'budget' && <BudgetTab budget={projectData.budget} />}
        {activeTab === 'schedule' && <ScheduleTab schedule={projectData.schedule} />}
        {activeTab === 'risks' && <RisksTab risks={projectData.risks} />}
        {activeTab === 'issues' && <IssuesTab issues={projectData.issues} />}
        {activeTab === 'quality' && <QualityTab />}
        {activeTab === 'team' && <TeamTab />}
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab: React.FC<{ projectData: any }> = ({ projectData }) => {
  const { budget, schedule, risks, issues, metrics } = projectData;
  const currentMetrics = metrics[0];

  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">Budget Status</p>
              <p className="text-2xl font-bold text-gray-900">
                {budget ? `${((budget.actualCost / budget.currentBudget) * 100).toFixed(1)}%` : 'N/A'}
              </p>
              <p className="text-sm text-gray-600">
                ${budget ? (budget.actualCost / 1000).toFixed(0) : 0}K of ${budget ? (budget.currentBudget / 1000).toFixed(0) : 0}K
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-lg">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">Schedule Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {currentMetrics ? `${currentMetrics.schedule.actualProgress}%` : 'N/A'}
              </p>
              <p className="text-sm text-gray-600">
                {currentMetrics ? `${currentMetrics.schedule.activitiesCompleted} activities completed` : 'No data'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 p-6 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-yellow-600">Active Risks</p>
              <p className="text-2xl font-bold text-gray-900">{risks.length}</p>
              <p className="text-sm text-gray-600">
                {risks.filter(r => r.riskScore >= 9).length} high priority
              </p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 p-6 rounded-lg">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-red-600">Open Issues</p>
              <p className="text-2xl font-bold text-gray-900">{issues.length}</p>
              <p className="text-sm text-gray-600">
                {issues.filter(i => i.priority === 'high').length} high priority
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Performance</h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <BarChart3 className="w-16 h-16" />
            <span className="ml-2">Cost performance chart will be displayed here</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule Performance</h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <Calendar className="w-16 h-16" />
            <span className="ml-2">Schedule performance chart will be displayed here</span>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
        <div className="space-y-4">
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Foundation inspection completed</p>
              <p className="text-xs text-gray-600">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Weather delay risk identified</p>
              <p className="text-xs text-gray-600">4 hours ago</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Change order CO-001 approved</p>
              <p className="text-xs text-gray-600">1 day ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Budget Tab Component
const BudgetTab: React.FC<{ budget: ProjectBudget | null }> = ({ budget }) => {
  if (!budget) {
    return <div className="text-center text-gray-500">No budget data available</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900">Original Budget</h3>
          <p className="text-3xl font-bold text-blue-600">${(budget.originalBudget / 1000).toFixed(0)}K</p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900">Current Budget</h3>
          <p className="text-3xl font-bold text-green-600">${(budget.currentBudget / 1000).toFixed(0)}K</p>
        </div>
        <div className="bg-orange-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-orange-900">Actual Cost</h3>
          <p className="text-3xl font-bold text-orange-600">${(budget.actualCost / 1000).toFixed(0)}K</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Codes</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% Complete</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {budget.costCodes.map((costCode) => (
                <tr key={costCode.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{costCode.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{costCode.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${costCode.budgetAmount.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${costCode.actualCost.toLocaleString()}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${costCode.variance < 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${Math.abs(costCode.variance).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{costCode.percentComplete}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Schedule Tab Component
const ScheduleTab: React.FC<{ schedule: ProjectSchedule | null }> = ({ schedule }) => {
  if (!schedule) {
    return <div className="text-center text-gray-500">No schedule data available</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900">Start Date</h3>
          <p className="text-xl font-bold text-blue-600">{schedule.startDate.toLocaleDateString()}</p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900">End Date</h3>
          <p className="text-xl font-bold text-green-600">{schedule.endDate.toLocaleDateString()}</p>
        </div>
        <div className="bg-yellow-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-900">Activities</h3>
          <p className="text-xl font-bold text-yellow-600">{schedule.activities.length}</p>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-900">Milestones</h3>
          <p className="text-xl font-bold text-purple-600">{schedule.milestones.length}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule Activities</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">WBS</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% Complete</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {schedule.activities.map((activity) => (
                <tr key={activity.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{activity.wbsCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{activity.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{activity.duration} days</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{activity.startDate.toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{activity.endDate.toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{activity.percentComplete}%</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                      activity.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {activity.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Risks Tab Component
const RisksTab: React.FC<{ risks: ProjectRisk[] }> = ({ risks }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Project Risks</h3>
        <button className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Risk
        </button>
      </div>

      <div className="grid gap-4">
        {risks.map((risk) => (
          <div key={risk.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center">
                  <h4 className="text-lg font-semibold text-gray-900">{risk.title}</h4>
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    risk.riskScore >= 15 ? 'bg-red-100 text-red-800' :
                    risk.riskScore >= 9 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    Risk Score: {risk.riskScore}
                  </span>
                </div>
                <p className="text-gray-600 mt-2">{risk.description}</p>
                <div className="flex items-center mt-4 space-x-4">
                  <span className="text-sm text-gray-500">Category: {risk.category}</span>
                  <span className="text-sm text-gray-500">Probability: {risk.probability}/5</span>
                  <span className="text-sm text-gray-500">Impact: {risk.impact}/5</span>
                  <span className="text-sm text-gray-500">Owner: {risk.owner}</span>
                </div>
              </div>
              <div className="ml-4">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  risk.status === 'mitigated' ? 'bg-green-100 text-green-800' :
                  risk.status === 'assessed' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {risk.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Issues Tab Component
const IssuesTab: React.FC<{ issues: ProjectIssue[] }> = ({ issues }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Project Issues</h3>
        <button className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
          <Plus className="w-4 h-4 mr-2" />
          Report Issue
        </button>
      </div>

      <div className="grid gap-4">
        {issues.map((issue) => (
          <div key={issue.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center">
                  <h4 className="text-lg font-semibold text-gray-900">{issue.title}</h4>
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    issue.priority === 'high' ? 'bg-red-100 text-red-800' :
                    issue.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {issue.priority} priority
                  </span>
                </div>
                <p className="text-gray-600 mt-2">{issue.description}</p>
                <div className="flex items-center mt-4 space-x-4">
                  <span className="text-sm text-gray-500">Category: {issue.category}</span>
                  <span className="text-sm text-gray-500">Severity: {issue.severity}</span>
                  <span className="text-sm text-gray-500">Assigned to: {issue.assignedTo}</span>
                  <span className="text-sm text-gray-500">Due: {issue.dueDate.toLocaleDateString()}</span>
                </div>
              </div>
              <div className="ml-4">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  issue.status === 'resolved' ? 'bg-green-100 text-green-800' :
                  issue.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {issue.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Quality Tab Component
const QualityTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center text-gray-500">
        <CheckCircle className="w-16 h-16 mx-auto mb-4" />
        <h3 className="text-lg font-semibold">Quality Control</h3>
        <p>Quality control features will be implemented here</p>
      </div>
    </div>
  );
};

// Team Tab Component
const TeamTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center text-gray-500">
        <Users className="w-16 h-16 mx-auto mb-4" />
        <h3 className="text-lg font-semibold">Team Management</h3>
        <p>Team management features will be implemented here</p>
      </div>
    </div>
  );
};

export default ProjectManagementDashboard;
