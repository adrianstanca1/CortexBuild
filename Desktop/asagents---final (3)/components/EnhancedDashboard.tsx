import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Project, Todo, Permission, View, Timesheet, TimesheetStatus, SafetyIncident, IncidentStatus, AuditLog, TodoStatus } from '../types';
import { api } from '../services/apiService';
import { hasPermission } from '../services/auth';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { ProgressRing, ProgressBar } from './ui/ProgressIndicators';

// Enhanced KPI Card with trend indicators
const EnhancedKpiCard: React.FC<{ 
  title: string; 
  value: string | number; 
  icon: React.ReactNode; 
  color: string;
  trend?: { value: number; label: string };
  subtitle?: string;
}> = ({ title, value, icon, color, trend, subtitle }) => (
  <Card className="relative overflow-hidden p-6 hover:shadow-lg transition-shadow">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
        <p className={`text-4xl font-bold ${color} mb-2`}>{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <span className={`text-xs font-semibold ${trend.value > 0 ? 'text-green-600' : trend.value < 0 ? 'text-red-600' : 'text-gray-500'}`}>
              {trend.value > 0 ? '↑' : trend.value < 0 ? '↓' : '→'} {Math.abs(trend.value)}%
            </span>
            <span className="text-xs text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color.replace('text-', 'bg-').replace('600', '100')}`}>
        {icon}
      </div>
    </div>
  </Card>
);

// Progress Metrics Card
const ProgressMetricsCard: React.FC<{
  title: string;
  metrics: Array<{ label: string; value: number; color: string; }>;
}> = ({ title, metrics }) => (
  <Card className="p-6">
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <div className="space-y-4">
      {metrics.map((metric, idx) => (
        <div key={idx}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{metric.label}</span>
            <span className={`text-sm font-bold ${metric.color}`}>{metric.value}%</span>
          </div>
          <ProgressBar value={metric.value} className="h-2" color={metric.color} />
        </div>
      ))}
    </div>
  </Card>
);

// Activity Timeline with better visuals
const ActivityTimelineItem: React.FC<{ log: AuditLog; users: Map<number, User> }> = ({ log, users }) => {
  const actorName = users.get(log.actorId)?.name || 'Unknown User';
  const formattedAction = log.action.replace(/_/g, ' ');
  
  const getActivityColor = (action: string) => {
    if (action.includes('completed')) return 'bg-green-500';
    if (action.includes('approved')) return 'bg-blue-500';
    if (action.includes('incident')) return 'bg-red-500';
    if (action.includes('created')) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  return (
    <div className="flex gap-4 items-start">
      <div className={`w-2 h-2 rounded-full mt-2 ${getActivityColor(log.action)}`}></div>
      <div className="flex-1 pb-4">
        <p className="text-sm">
          <span className="font-semibold">{actorName}</span> {formattedAction}
          {log.target && <span className="text-primary"> "{log.target.name}"</span>}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(log.timestamp).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

// Project Health Card
const ProjectHealthCard: React.FC<{ project: Project; todos: Todo[] }> = ({ project, todos }) => {
  const completedTasks = todos.filter(t => t.status === TodoStatus.DONE).length;
  const taskProgress = todos.length > 0 ? Math.round((completedTasks / todos.length) * 100) : 0;
  const budgetUsed = project.budget > 0 ? Math.round((project.actualCost / project.budget) * 100) : 0;
  
  const getHealthStatus = () => {
    if (taskProgress >= 80 && budgetUsed <= 100) return { label: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (taskProgress >= 50 && budgetUsed <= 120) return { label: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (taskProgress >= 30) return { label: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { label: 'Needs Attention', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const health = getHealthStatus();

  return (
    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-lg">{project.name}</h4>
          <p className="text-sm text-muted-foreground">{project.location}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${health.bgColor} ${health.color}`}>
          {health.label}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Task Progress</p>
          <div className="flex items-center gap-2">
            <ProgressRing progress={taskProgress} size={60} strokeWidth={6} showLabel={false} />
            <span className="text-sm font-semibold">{taskProgress}%</span>
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Budget</p>
          <p className={`text-sm font-semibold ${budgetUsed > 100 ? 'text-red-600' : 'text-green-600'}`}>
            ${project.actualCost.toLocaleString()} / ${project.budget.toLocaleString()}
          </p>
        </div>
      </div>
    </Card>
  );
};

// Main Enhanced Dashboard Component
export const EnhancedDashboard: React.FC<{
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
  activeView: View;
  setActiveView: (view: View) => void;
  onSelectProject: (project: Project) => void;
}> = ({ user, addToast, setActiveView, onSelectProject }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [incidents, setIncidents] = useState<SafetyIncident[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<Map<number, User>>(new Map());
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (!user.companyId) return;

      // Fetch all data in parallel
      const [fetchedProjects, fetchedUsers] = await Promise.all([
        hasPermission(user, Permission.VIEW_ALL_PROJECTS)
          ? api.getProjectsByCompany(user.companyId)
          : api.getProjectsByUser(user.id),
        api.getUsersByCompany(user.companyId)
      ]);

      setProjects(fetchedProjects);
      setUsers(new Map(fetchedUsers.map(u => [u.id, u])));

      if (fetchedProjects.length > 0) {
        const projectIds = fetchedProjects.map(p => p.id);
        const [fetchedTodos, fetchedTimesheets, fetchedIncidents, fetchedLogs] = await Promise.all([
          api.getTodosByProjectIds(projectIds),
          api.getTimesheetsByProjectIds(projectIds),
          api.getSafetyIncidentsByProjectIds(projectIds),
          api.getAuditLogsByCompany(user.companyId, 20)
        ]);

        setTodos(fetchedTodos);
        setTimesheets(fetchedTimesheets);
        setIncidents(fetchedIncidents);
        setAuditLogs(fetchedLogs);
      }
    } catch (error) {
      addToast("Failed to load dashboard data.", "error");
    } finally {
      setLoading(false);
    }
  }, [user, addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const activeProjects = projects.filter(p => p.status === 'Active');
    const completedTasks = todos.filter(t => t.status === TodoStatus.DONE);
    const overdueTasks = todos.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== TodoStatus.DONE);
    const pendingTimesheets = timesheets.filter(t => t.status === TimesheetStatus.PENDING);
    const openIncidents = incidents.filter(i => i.status === IncidentStatus.OPEN);
    
    const totalBudget = activeProjects.reduce((sum, p) => sum + p.budget, 0);
    const totalSpent = activeProjects.reduce((sum, p) => sum + p.actualCost, 0);
    const budgetUtilization = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
    
    const overallProgress = activeProjects.length > 0 
      ? Math.round(activeProjects.reduce((sum, p) => {
          const projectTodos = todos.filter(t => t.projectId === p.id);
          const completed = projectTodos.filter(t => t.status === TodoStatus.DONE).length;
          return sum + (projectTodos.length > 0 ? (completed / projectTodos.length) * 100 : 0);
        }, 0) / activeProjects.length)
      : 0;

    return {
      activeProjects: activeProjects.length,
      completedTasks: completedTasks.length,
      totalTasks: todos.length,
      overdueTasks: overdueTasks.length,
      pendingTimesheets: pendingTimesheets.length,
      openIncidents: openIncidents.length,
      budgetUtilization,
      overallProgress,
      totalBudget,
      totalSpent
    };
  }, [projects, todos, timesheets, incidents]);

  // Progress metrics by category
  const progressMetrics = useMemo(() => {
    return projects
      .filter(p => p.status === 'Active')
      .slice(0, 5)
      .map(project => {
        const projectTodos = todos.filter(t => t.projectId === project.id);
        const completed = projectTodos.filter(t => t.status === TodoStatus.DONE).length;
        const progress = projectTodos.length > 0 ? Math.round((completed / projectTodos.length) * 100) : 0;
        
        return {
          label: project.name,
          value: progress,
          color: progress >= 80 ? 'text-green-600' : progress >= 50 ? 'text-blue-600' : 'text-yellow-600'
        };
      });
  }, [projects, todos]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user.name.split(' ')[0]}!</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening across your projects</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={timeRange === 'day' ? 'primary' : 'outline'} 
            size="sm"
            onClick={() => setTimeRange('day')}
          >
            Today
          </Button>
          <Button 
            variant={timeRange === 'week' ? 'primary' : 'outline'} 
            size="sm"
            onClick={() => setTimeRange('week')}
          >
            Week
          </Button>
          <Button 
            variant={timeRange === 'month' ? 'primary' : 'outline'} 
            size="sm"
            onClick={() => setTimeRange('month')}
          >
            Month
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <EnhancedKpiCard 
          title="Active Projects" 
          value={kpis.activeProjects} 
          color="text-blue-600"
          subtitle={`${kpis.overallProgress}% avg completion`}
          trend={{ value: 12, label: 'vs last month' }}
          icon={
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        />
        
        <EnhancedKpiCard 
          title="Tasks Completed" 
          value={`${kpis.completedTasks}/${kpis.totalTasks}`}
          color="text-green-600"
          subtitle={`${Math.round((kpis.completedTasks / kpis.totalTasks) * 100) || 0}% completion rate`}
          trend={{ value: 8, label: 'vs last week' }}
          icon={
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        
        <EnhancedKpiCard 
          title="Budget Health" 
          value={`${kpis.budgetUtilization}%`}
          color={kpis.budgetUtilization > 100 ? 'text-red-600' : kpis.budgetUtilization > 85 ? 'text-yellow-600' : 'text-green-600'}
          subtitle={`$${kpis.totalSpent.toLocaleString()} of $${kpis.totalBudget.toLocaleString()}`}
          trend={{ value: kpis.budgetUtilization > 100 ? 5 : -3, label: 'utilization' }}
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        
        <EnhancedKpiCard 
          title="Overdue Tasks" 
          value={kpis.overdueTasks}
          color="text-red-600"
          subtitle={kpis.overdueTasks > 0 ? 'Needs attention' : 'All on track'}
          trend={{ value: -15, label: 'improvement' }}
          icon={
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Progress Metrics and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Progress */}
        <ProgressMetricsCard 
          title="Project Progress Overview" 
          metrics={progressMetrics}
        />

        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {auditLogs.length > 0 ? (
              auditLogs.map(log => (
                <ActivityTimelineItem key={log.id} log={log} users={users} />
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No recent activity</p>
            )}
          </div>
        </Card>
      </div>

      {/* Project Health Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Active Projects</h2>
          <Button onClick={() => setActiveView('projects')}>View All</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects
            .filter(p => p.status === 'Active')
            .slice(0, 6)
            .map(project => (
              <div key={project.id} onClick={() => onSelectProject(project)}>
                <ProjectHealthCard 
                  project={project} 
                  todos={todos.filter(t => t.projectId === project.id)} 
                />
              </div>
            ))}
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            variant="outline" 
            className="h-auto py-4 flex flex-col items-center gap-2"
            onClick={() => setActiveView('projects')}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Project</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto py-4 flex flex-col items-center gap-2"
            onClick={() => setActiveView('tasks')}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>Add Task</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto py-4 flex flex-col items-center gap-2"
            onClick={() => setActiveView('timesheets')}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Submit Timesheet</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto py-4 flex flex-col items-center gap-2"
            onClick={() => setActiveView('safety')}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Safety Report</span>
          </Button>
        </div>
      </Card>

      {/* Alerts and Notifications */}
      {(kpis.overdueTasks > 0 || kpis.openIncidents > 0 || kpis.pendingTimesheets > 5) && (
        <Card className="p-6 bg-yellow-50 border-yellow-200">
          <h3 className="text-lg font-semibold mb-3 text-yellow-800">⚠️ Items Requiring Attention</h3>
          <div className="space-y-2">
            {kpis.overdueTasks > 0 && (
              <p className="text-sm text-yellow-700">
                • {kpis.overdueTasks} task{kpis.overdueTasks > 1 ? 's' : ''} overdue
              </p>
            )}
            {kpis.openIncidents > 0 && (
              <p className="text-sm text-yellow-700">
                • {kpis.openIncidents} open safety incident{kpis.openIncidents > 1 ? 's' : ''}
              </p>
            )}
            {kpis.pendingTimesheets > 5 && (
              <p className="text-sm text-yellow-700">
                • {kpis.pendingTimesheets} timesheets pending approval
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
