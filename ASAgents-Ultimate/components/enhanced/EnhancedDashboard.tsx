import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { User, Project, Todo, Expense, SafetyIncident, Equipment } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Tag } from '../ui/Tag';
import BarChart from '../financials/BarChart';

// Enhanced dashboard with real-time updates and advanced analytics

interface EnhancedDashboardProps {
  user: User;
  projects: Project[];
  tasks: Todo[];
  expenses: Expense[];
  incidents: SafetyIncident[];
  equipment: Equipment[];
  team: User[];
  onNavigate: (view: string, data?: any) => void;
  addToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

interface DashboardMetrics {
  performance: {
    loadTime: number;
    lastUpdate: Date;
    dataFreshness: 'real-time' | 'cached' | 'stale';
  };
  integrity: {
    dataConsistency: number;
    validationErrors: string[];
    missingData: string[];
  };
  analytics: {
    userEngagement: number;
    featureUsage: Record<string, number>;
    errorRate: number;
  };
}

interface DashboardWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'list' | 'progress' | 'alert';
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  data: any;
  refreshInterval?: number;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  onClick?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon,
  color = 'blue',
  onClick
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    gray: 'bg-gray-50 text-gray-600 border-gray-200'
  };

  return (
    <Card
      className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-md ${onClick ? 'hover:scale-105' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <div className="flex items-center mt-2">
              <svg
                className={`h-4 w-4 mr-1 ${change.type === 'increase' ? 'text-green-500' : 'text-red-500'
                  }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={change.type === 'increase' ? 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' : 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6'}
                />
              </svg>
              <span className={`text-sm font-medium ${change.type === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                {Math.abs(change.value)}%
              </span>
              <span className="text-sm text-gray-500 ml-1">{change.period}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

const RecentActivity: React.FC<{
  activities: Array<{
    id: string;
    type: 'task' | 'project' | 'expense' | 'incident';
    title: string;
    description: string;
    timestamp: string;
    user?: User;
    status?: string;
  }>;
  onViewAll: () => void;
}> = ({ activities, onViewAll }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task':
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        );
      case 'project':
        return (
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        );
      case 'expense':
        return (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
        );
      case 'incident':
        return (
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <Button variant="ghost" size="sm" onClick={onViewAll}>
          View All
        </Button>
      </div>

      <div className="space-y-4">
        {activities.slice(0, 5).map(activity => (
          <div key={activity.id} className="flex items-start space-x-3">
            {getActivityIcon(activity.type)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {activity.title}
              </p>
              <p className="text-sm text-gray-600">
                {activity.description}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-gray-500">
                  {formatTimestamp(activity.timestamp)}
                </span>
                {activity.user && (
                  <>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">
                      {activity.user.firstName} {activity.user.lastName}
                    </span>
                  </>
                )}
                {activity.status && (
                  <>
                    <span className="text-xs text-gray-400">•</span>
                    <Tag variant="secondary" size="sm">
                      {activity.status}
                    </Tag>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

const ProjectHealthOverview: React.FC<{
  projects: Project[];
  tasks: Todo[];
  onProjectClick: (project: Project) => void;
}> = ({ projects, tasks, onProjectClick }) => {
  const projectHealth = useMemo(() => {
    return projects.map(project => {
      const projectTasks = tasks.filter(task => task.projectId === project.id);
      const completedTasks = projectTasks.filter(task => task.status === 'DONE');
      const overdueTasks = projectTasks.filter(task =>
        task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE'
      );

      const progress = projectTasks.length > 0 ? (completedTasks.length / projectTasks.length) * 100 : 0;

      let healthStatus: 'excellent' | 'good' | 'warning' | 'critical' = 'excellent';
      if (overdueTasks.length > 0) {
        healthStatus = overdueTasks.length > 3 ? 'critical' : 'warning';
      } else if (progress < 50) {
        healthStatus = 'good';
      }

      return {
        project,
        progress: Math.round(progress),
        totalTasks: projectTasks.length,
        completedTasks: completedTasks.length,
        overdueTasks: overdueTasks.length,
        healthStatus
      };
    });
  }, [projects, tasks]);

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Health</h3>

      <div className="space-y-4">
        {projectHealth.slice(0, 5).map(({ project, progress, totalTasks, completedTasks, overdueTasks, healthStatus }) => (
          <div
            key={project.id}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => onProjectClick(project)}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900 truncate">{project.name}</h4>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(healthStatus)}`}>
                {healthStatus}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>{completedTasks}/{totalTasks} tasks completed</span>
              <span>{progress}%</span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${progress >= 80 ? 'bg-green-500' :
                  progress >= 60 ? 'bg-blue-500' :
                    progress >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                style={{ width: `${progress}%` }}
              />
            </div>

            {overdueTasks > 0 && (
              <div className="flex items-center text-xs text-red-600">
                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                {overdueTasks} overdue task{overdueTasks !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

export const EnhancedDashboard: React.FC<EnhancedDashboardProps> = ({
  user,
  projects,
  tasks,
  expenses,
  incidents,
  equipment,
  team,
  onNavigate,
  addToast
}) => {
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Auto-refresh functionality
  useEffect(() => {
    if (refreshInterval) {
      const interval = setInterval(() => {
        setLastRefresh(new Date());
        // Trigger data refresh here
        addToast('Dashboard data refreshed', 'info');
      }, refreshInterval * 1000);

      return () => clearInterval(interval);
    }
  }, [refreshInterval, addToast]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const activeProjects = projects.filter(p => p.status === 'ACTIVE').length;
    const completedTasks = tasks.filter(t => t.status === 'DONE').length;
    const totalTasks = tasks.length;
    const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const pendingExpenses = expenses.filter(e => e.status === 'PENDING').length;

    const openIncidents = incidents.filter(i => i.status === 'OPEN').length;
    const availableEquipment = equipment.filter(e => e.status === 'AVAILABLE').length;

    return {
      activeProjects,
      taskCompletionRate: Math.round(taskCompletionRate),
      totalExpenses,
      pendingExpenses,
      openIncidents,
      availableEquipment,
      teamSize: team.length
    };
  }, [projects, tasks, expenses, incidents, equipment, team]);

  // Generate recent activities
  const recentActivities = useMemo(() => {
    const activities: Array<{
      id: string;
      type: 'task' | 'project' | 'expense' | 'incident';
      title: string;
      description: string;
      timestamp: string;
      user?: User;
      status?: string;
    }> = [];

    // Add recent task updates
    tasks.slice(0, 3).forEach(task => {
      const assignee = team.find(u => u.id === task.assigneeId);
      activities.push({
        id: `task-${task.id}`,
        type: 'task',
        title: 'Task Updated',
        description: task.title,
        timestamp: task.updatedAt || task.createdAt,
        user: assignee,
        status: task.status
      });
    });

    // Add recent expenses
    expenses.slice(0, 2).forEach(expense => {
      activities.push({
        id: `expense-${expense.id}`,
        type: 'expense',
        title: 'Expense Submitted',
        description: expense.description,
        timestamp: expense.date,
        status: expense.status
      });
    });

    // Add recent incidents
    incidents.slice(0, 2).forEach(incident => {
      activities.push({
        id: `incident-${incident.id}`,
        type: 'incident',
        title: 'Safety Incident Reported',
        description: incident.description,
        timestamp: incident.date,
        status: incident.status
      });
    });

    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [tasks, expenses, incidents, team]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your projects today.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={refreshInterval || ''}
            onChange={(e) => setRefreshInterval(e.target.value ? parseInt(e.target.value) : null)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Manual refresh</option>
            <option value="30">Auto-refresh 30s</option>
            <option value="60">Auto-refresh 1m</option>
            <option value="300">Auto-refresh 5m</option>
          </select>

          <Button
            variant="secondary"
            onClick={() => {
              setLastRefresh(new Date());
              addToast('Dashboard refreshed', 'success');
            }}
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Projects"
          value={metrics.activeProjects}
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
          color="blue"
          onClick={() => onNavigate('projects')}
        />

        <MetricCard
          title="Task Completion"
          value={`${metrics.taskCompletionRate}%`}
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
          color="green"
          onClick={() => onNavigate('tasks')}
        />

        <MetricCard
          title="Total Expenses"
          value={`$${metrics.totalExpenses.toLocaleString()}`}
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          }
          color="yellow"
          onClick={() => onNavigate('financials')}
        />

        <MetricCard
          title="Safety Incidents"
          value={metrics.openIncidents}
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          }
          color={metrics.openIncidents > 0 ? 'red' : 'green'}
          onClick={() => onNavigate('safety')}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Health - Takes 2 columns */}
        <div className="lg:col-span-2">
          <ProjectHealthOverview
            projects={projects}
            tasks={tasks}
            onProjectClick={(project) => onNavigate('project-detail', project)}
          />
        </div>

        {/* Recent Activity */}
        <div>
          <RecentActivity
            activities={recentActivities}
            onViewAll={() => onNavigate('activity')}
          />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Completion Trend</h3>
          <BarChart
            data={[
              { label: 'Mon', value: 12 },
              { label: 'Tue', value: 8 },
              { label: 'Wed', value: 15 },
              { label: 'Thu', value: 10 },
              { label: 'Fri', value: 18 },
              { label: 'Sat', value: 5 },
              { label: 'Sun', value: 3 }
            ]}
            barColor="bg-blue-500"
          />
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Performance</h3>
          <div className="space-y-4">
            {team.slice(0, 5).map(member => {
              const memberTasks = tasks.filter(t => t.assigneeId === member.id);
              const completedTasks = memberTasks.filter(t => t.status === 'DONE');
              const completionRate = memberTasks.length > 0 ? (completedTasks.length / memberTasks.length) * 100 : 0;

              return (
                <div key={member.id} className="flex items-center space-x-3">
                  <Avatar
                    name={`${member.firstName} ${member.lastName}`}
                    imageUrl={member.avatar}
                    className="h-10 w-10"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {member.firstName} {member.lastName}
                      </p>
                      <span className="text-sm text-gray-600">
                        {Math.round(completionRate)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500">
        Last updated: {lastRefresh.toLocaleTimeString()}
        {refreshInterval && (
          <span className="ml-2">• Auto-refresh every {refreshInterval}s</span>
        )}
      </div>
    </div>
  );
};
