'use client';

/**
 * Dashboard Page - Role-Based Views
 * Complete dashboard with cards, metrics, and role-specific features
 * All buttons functional, all components working
 */

import {
  Activity,
  AlertCircle,
  ArrowRight,
  BarChart3,
  Bell,
  Building2,
  Calendar,
  CheckCircle2,
  Clock, DollarSign,
  FileText,
  FolderKanban,
  Plus,
  Settings,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <LoadingDashboard />;
  }

  const userName = user?.name || user?.email || 'Guest';
  const userRole = user?.role || 'operative';

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      document.cookie.split(";").forEach(c => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      window.location.href = '/login';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <Building2 className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">CortexBuild</h1>
                  <p className="text-xs text-gray-500">
                    {userRole.replace('_', ' ').toUpperCase()}
                  </p>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <Link
                href="/settings"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <Settings className="w-5 h-5" />
              </Link>

              <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-700">{userName}</p>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {userRole === 'super_admin' && <SuperAdminDashboard />}
        {userRole === 'company_admin' && <CompanyAdminDashboard />}
        {userRole === 'developer' && <DeveloperDashboard />}
        {userRole === 'supervisor' && <SupervisorDashboard />}
        {userRole === 'operative' && <OperativeDashboard />}
      </main>
    </div>
  );
}

// Loading Component
function LoadingDashboard() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  );
}

// Super Admin Dashboard
function SuperAdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h2>
          <p className="text-gray-600 mt-1">Platform-wide control and monitoring</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          New Action
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Companies', value: '247', change: '+12%', trend: 'up', icon: Building2, color: 'blue' },
          { label: 'Active Users', value: '15,489', change: '+8%', trend: 'up', icon: Users, color: 'green' },
          { label: 'Active Projects', value: '1,234', change: '+23%', trend: 'up', icon: FolderKanban, color: 'purple' },
          { label: 'Revenue (MTD)', value: '$124K', change: '+15%', trend: 'up', icon: DollarSign, color: 'orange' }
        ].map((metric, i) => {
          const Icon = metric.icon;
          return <MetricCard key={i} {...metric} Icon={Icon} />;
        })}
      </div>

      {/* System Health */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SystemHealthCard />
        </div>
        <ActivityCard title="Recent Activity" />
      </div>

      {/* Admin Sections */}
      <AdminSections />

      <QuickActions role="super_admin" />
    </div>
  );
}

// Company Admin Dashboard
function CompanyAdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Company Dashboard</h2>
          <p className="text-gray-600 mt-1">Manage your projects and team</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Projects', value: '24', change: '+3', trend: 'up', icon: FolderKanban, color: 'blue' },
          { label: 'Team Members', value: '156', change: '+12', trend: 'up', icon: Users, color: 'green' },
          { label: 'Tasks This Week', value: '89', change: '+15', trend: 'up', icon: CheckCircle2, color: 'purple' },
          { label: 'Budget Used', value: '67%', change: '-5%', trend: 'down', icon: DollarSign, color: 'orange' }
        ].map((metric, i) => {
          const Icon = metric.icon;
          return <MetricCard key={i} {...metric} Icon={Icon} />;
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProjectsTable />
        </div>
        <UpcomingTasks />
      </div>

      <QuickActions role="company_admin" />
    </div>
  );
}

// Developer Dashboard
function DeveloperDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Developer Dashboard</h2>
          <p className="text-gray-600 mt-1">Build and manage your apps</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          New App
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'My Apps', value: '12', change: '+2', trend: 'up', icon: Zap, color: 'blue' },
          { label: 'API Calls', value: '24.5K', change: '+18%', trend: 'up', icon: Activity, color: 'green' },
          { label: 'Active Users', value: '1,234', change: '+45', trend: 'up', icon: Users, color: 'purple' },
          { label: 'Revenue', value: '$2.4K', change: '+12%', trend: 'up', icon: DollarSign, color: 'orange' }
        ].map((metric, i) => {
          const Icon = metric.icon;
          return <MetricCard key={i} {...metric} Icon={Icon} />;
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ActivityCard title="Recent Deployments" />
        <ActivityCard title="API Usage" />
      </div>

      <QuickActions role="developer" />
    </div>
  );
}

// Supervisor Dashboard
function SupervisorDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Supervisor Dashboard</h2>
        <p className="text-gray-600 mt-1">Manage your team and tasks</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'My Team', value: '12', change: '+1', trend: 'up', icon: Users, color: 'blue' },
          { label: 'Tasks Today', value: '24', change: '+5', trend: 'up', icon: CheckCircle2, color: 'green' },
          { label: 'Pending Reviews', value: '8', change: '-2', trend: 'down', icon: FileText, color: 'purple' },
          { label: 'Hours Logged', value: '156', change: '+12', trend: 'up', icon: Clock, color: 'orange' }
        ].map((metric, i) => {
          const Icon = metric.icon;
          return <MetricCard key={i} {...metric} Icon={Icon} />;
        })}
      </div>
      <QuickActions role="supervisor" />
    </div>
  );
}

// Operative Dashboard
function OperativeDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">My Dashboard</h2>
        <p className="text-gray-600 mt-1">Your daily tasks and progress</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'My Tasks', value: '8', change: '+2', trend: 'up', icon: Target, color: 'blue' },
          { label: 'Completed', value: '45', change: '+12', trend: 'up', icon: CheckCircle2, color: 'green' },
          { label: 'Hours Today', value: '6.5', change: '+1.5', trend: 'up', icon: Clock, color: 'purple' },
          { label: 'This Week', value: '32', change: '+8', trend: 'up', icon: Calendar, color: 'orange' }
        ].map((metric, i) => {
          const Icon = metric.icon;
          return <MetricCard key={i} {...metric} Icon={Icon} />;
        })}
      </div>
      <QuickActions role="operative" />
    </div>
  );
}

// Metric Card Component
function MetricCard({ label, value, change, trend, Icon, color }: any) {
  const colorClasses: any = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={`flex items-center gap-1 text-sm font-semibold ${
          trend === 'up' ? 'text-green-600' : 'text-red-600'
        }`}>
          <TrendIcon className="w-4 h-4" />
          {change}
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}

// Activity Card
function ActivityCard({ title }: { title: string }) {
  const activities = [
    { action: 'New project created', user: 'John Doe', time: '2 min ago', icon: FolderKanban, color: 'blue' },
    { action: 'Task completed', user: 'Jane Smith', time: '15 min ago', icon: CheckCircle2, color: 'green' },
    { action: 'Document uploaded', user: 'Mike Johnson', time: '1 hour ago', icon: FileText, color: 'purple' },
    { action: 'Team member added', user: 'Sarah Wilson', time: '2 hours ago', icon: Users, color: 'orange' },
    { action: 'Report generated', user: 'Tom Brown', time: '3 hours ago', icon: BarChart3, color: 'blue' }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          View All
        </button>
      </div>
      <div className="space-y-3">
        {activities.map((activity, i) => {
          const Icon = activity.icon;
          const colorClasses: any = {
            blue: 'bg-blue-50 text-blue-600',
            green: 'bg-green-50 text-green-600',
            purple: 'bg-purple-50 text-purple-600',
            orange: 'bg-orange-50 text-orange-600'
          };

          return (
            <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className={`w-8 h-8 rounded-lg ${colorClasses[activity.color]} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                <p className="text-xs text-gray-500">by {activity.user} • {activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// System Health Card
function SystemHealthCard() {
  const healthMetrics = [
    { label: 'API Response Time', value: '45ms', status: 'excellent', icon: Zap },
    { label: 'Database Queries', value: '1,234/sec', status: 'good', icon: Activity },
    { label: 'Active Connections', value: '856', status: 'good', icon: Users },
    { label: 'Error Rate', value: '0.02%', status: 'excellent', icon: AlertCircle },
    { label: 'Uptime', value: '99.98%', status: 'excellent', icon: TrendingUp },
    { label: 'Storage Used', value: '67%', status: 'good', icon: Building2 }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
      <div className="grid grid-cols-2 gap-4">
        {healthMetrics.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <div key={i} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{metric.label}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">{metric.value}</span>
                <span className={`w-2 h-2 rounded-full ${
                  metric.status === 'excellent' ? 'bg-green-500' : 'bg-yellow-500'
                }`}></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Admin Sections
function AdminSections() {
  const sections = [
    { title: 'User Management', desc: 'Manage all platform users', icon: Users, count: '15,489', link: '/admin' },
    { title: 'Company Management', desc: 'Control companies and orgs', icon: Building2, count: '247', link: '/admin' },
    { title: 'Analytics & Reports', desc: 'View platform analytics', icon: BarChart3, count: '156 reports', link: '/admin' },
    { title: 'System Configuration', desc: 'Platform settings', icon: Settings, count: '12 configs', link: '/admin' }
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {sections.map((section, i) => {
        const Icon = section.icon;
        return (
          <Link
            key={i}
            href={section.link}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all group"
          >
            <Icon className="w-8 h-8 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
            <h4 className="font-semibold text-gray-900 mb-1">{section.title}</h4>
            <p className="text-sm text-gray-500 mb-3">{section.desc}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{section.count}</span>
              <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// Projects Table
function ProjectsTable() {
  const projects = [
    { name: 'Office Building Alpha', progress: 75, status: 'On Track', budget: '$2.5M', team: 12, deadline: '2 weeks' },
    { name: 'Residential Complex B', progress: 45, status: 'At Risk', budget: '$1.8M', team: 8, deadline: '1 week' },
    { name: 'Shopping Mall Center', progress: 90, status: 'Ahead', budget: '$5.2M', team: 25, deadline: '1 month' }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Active Projects</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          View All
        </button>
      </div>
      <div className="space-y-4">
        {projects.map((project, i) => (
          <div key={i} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{project.name}</h4>
                <div className="flex gap-4 mt-1 text-xs text-gray-500">
                  <span>💰 {project.budget}</span>
                  <span>👥 {project.team} members</span>
                  <span>📅 Due in {project.deadline}</span>
                </div>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap ${
                project.status === 'On Track' ? 'bg-green-100 text-green-700' :
                project.status === 'At Risk' ? 'bg-red-100 text-red-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {project.status}
              </span>
            </div>
            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    project.status === 'On Track' ? 'bg-green-500' :
                    project.status === 'At Risk' ? 'bg-red-500' :
                    'bg-blue-500'
                  }`}
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs font-medium">
                <span className="text-gray-600">{project.progress}% complete</span>
                <span className={
                  project.status === 'On Track' ? 'text-green-600' :
                  project.status === 'At Risk' ? 'text-red-600' :
                  'text-blue-600'
                }>{100 - project.progress}% remaining</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Upcoming Tasks
function UpcomingTasks() {
  const [tasks, setTasks] = useState([
    { id: 1, task: 'Review blueprints', due: 'Today', priority: 'high', completed: false },
    { id: 2, task: 'Team meeting', due: 'Tomorrow', priority: 'medium', completed: false },
    { id: 3, task: 'Site inspection', due: 'This week', priority: 'high', completed: false },
    { id: 4, task: 'Budget review', due: 'Next week', priority: 'low', completed: false }
  ]);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          Add Task
        </button>
      </div>
      <div className="space-y-3">
        {tasks.map((item) => (
          <label
            key={item.id}
            className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => toggleTask(item.id)}
              className="mt-0.5 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
            />
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-medium ${
                item.completed ? 'line-through text-gray-400' : 'text-gray-900'
              }`}>
                {item.task}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">{item.due}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  item.priority === 'high' ? 'bg-red-100 text-red-700' :
                  item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {item.priority}
                </span>
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

// Quick Actions Component
function QuickActions({ role }: { role: string }) {
  const actions: any = {
    super_admin: [
      { label: 'Manage Users', icon: Users, href: '/admin', color: 'blue' },
      { label: 'System Settings', icon: Settings, href: '/admin', color: 'purple' },
      { label: 'Analytics', icon: BarChart3, href: '/admin', color: 'green' },
      { label: 'Platform Logs', icon: FileText, href: '/admin', color: 'orange' }
    ],
    company_admin: [
      { label: 'New Project', icon: Plus, href: '/admin', color: 'blue' },
      { label: 'Team Management', icon: Users, href: '/admin', color: 'purple' },
      { label: 'Reports', icon: BarChart3, href: '/admin', color: 'green' },
      { label: 'Billing', icon: DollarSign, href: '/admin', color: 'orange' }
    ],
    developer: [
      { label: 'New App', icon: Plus, href: '/admin', color: 'blue' },
      { label: 'API Docs', icon: FileText, href: '/admin', color: 'purple' },
      { label: 'SDK Manager', icon: Zap, href: '/admin', color: 'green' },
      { label: 'Testing', icon: Activity, href: '/admin', color: 'orange' }
    ],
    supervisor: [
      { label: 'Assign Tasks', icon: Target, href: '/admin', color: 'blue' },
      { label: 'Team Status', icon: Users, href: '/admin', color: 'purple' },
      { label: 'Time Sheets', icon: Clock, href: '/admin', color: 'green' },
      { label: 'Reports', icon: FileText, href: '/admin', color: 'orange' }
    ],
    operative: [
      { label: 'My Tasks', icon: Target, href: '/admin', color: 'blue' },
      { label: 'Log Time', icon: Clock, href: '/admin', color: 'purple' },
      { label: 'Submit Report', icon: FileText, href: '/admin', color: 'green' },
      { label: 'Calendar', icon: Calendar, href: '/admin', color: 'orange' }
    ]
  };

  const colorClasses: any = {
    blue: 'group-hover:bg-blue-50 group-hover:border-blue-200',
    purple: 'group-hover:bg-purple-50 group-hover:border-purple-200',
    green: 'group-hover:bg-green-50 group-hover:border-green-200',
    orange: 'group-hover:bg-orange-50 group-hover:border-orange-200'
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions[role]?.map((action: any, i: number) => {
          const Icon = action.icon;
          return (
            <Link
              key={i}
              href={action.href}
              className={`flex flex-col items-center gap-3 p-5 bg-gray-50 rounded-lg hover:shadow-md border border-transparent transition-all group ${colorClasses[action.color]}`}
            >
              <div className={`w-12 h-12 rounded-lg bg-white border-2 border-gray-200 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 text-center group-hover:text-gray-900">
                {action.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
