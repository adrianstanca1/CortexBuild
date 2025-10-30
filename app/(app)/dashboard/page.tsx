'use client';

/**
 * Dashboard Page - Role-Based Views
 * Complete dashboard with cards, metrics, and role-specific features
 */

import {
  Activity, BarChart3,
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
  Users,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user from localStorage or cookies
    const userData = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const userName = user?.name || user?.email || 'Guest';
  const userRole = user?.role || 'operative';

  // Role-based dashboard content
  const getDashboardContent = () => {
    switch (userRole) {
      case 'super_admin':
        return <SuperAdminDashboard user={user} />;
      case 'company_admin':
        return <CompanyAdminDashboard user={user} />;
      case 'developer':
        return <DeveloperDashboard user={user} />;
      case 'supervisor':
        return <SupervisorDashboard user={user} />;
      default:
        return <OperativeDashboard user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Building2 className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">CortexBuild</h1>
                <p className="text-sm text-gray-500">
                  {userRole.replace('_', ' ').toUpperCase()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5" />
              </button>
              <Link
                href="/settings"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <Settings className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700">{userName}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {getDashboardContent()}
      </main>
    </div>
  );
}

// Super Admin Dashboard
function SuperAdminDashboard({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h2>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          New Action
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Companies', value: '247', change: '+12%', icon: Building2, color: 'blue' },
          { label: 'Active Users', value: '15,489', change: '+8%', icon: Users, color: 'green' },
          { label: 'Active Projects', value: '1,234', change: '+23%', icon: FolderKanban, color: 'purple' },
          { label: 'Revenue (MTD)', value: '$124K', change: '+15%', icon: DollarSign, color: 'orange' }
        ].map((metric, i) => {
          const Icon = metric.icon;
          return (
            <MetricCard key={i} {...metric} Icon={Icon} />
          );
        })}
      </div>

      {/* Charts and Tables */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ActivityCard title="Recent System Activity" />
        <ActivityCard title="User Growth" />
      </div>

      {/* Quick Actions */}
      <QuickActions role="super_admin" />
    </div>
  );
}

// Company Admin Dashboard
function CompanyAdminDashboard({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Company Dashboard</h2>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Projects', value: '24', change: '+3', icon: FolderKanban, color: 'blue' },
          { label: 'Team Members', value: '156', change: '+12', icon: Users, color: 'green' },
          { label: 'Tasks This Week', value: '89', change: '+15', icon: CheckCircle2, color: 'purple' },
          { label: 'Budget Used', value: '67%', change: '-5%', icon: DollarSign, color: 'orange' }
        ].map((metric, i) => {
          const Icon = metric.icon;
          return (
            <MetricCard key={i} {...metric} Icon={Icon} />
          );
        })}
      </div>

      {/* Projects Overview */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProjectsTable />
        </div>
        <div>
          <UpcomingTasks />
        </div>
      </div>

      <QuickActions role="company_admin" />
    </div>
  );
}

// Developer Dashboard
function DeveloperDashboard({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Developer Dashboard</h2>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          New App
        </button>
      </div>

      {/* Dev Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'My Apps', value: '12', change: '+2', icon: Zap, color: 'blue' },
          { label: 'API Calls', value: '24.5K', change: '+18%', icon: Activity, color: 'green' },
          { label: 'Active Users', value: '1,234', change: '+45', icon: Users, color: 'purple' },
          { label: 'Revenue', value: '$2.4K', change: '+12%', icon: DollarSign, color: 'orange' }
        ].map((metric, i) => {
          const Icon = metric.icon;
          return (
            <MetricCard key={i} {...metric} Icon={Icon} />
          );
        })}
      </div>

      {/* Dev Tools */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ActivityCard title="Recent Deployments" />
        <ActivityCard title="API Usage" />
      </div>

      <QuickActions role="developer" />
    </div>
  );
}

// Supervisor Dashboard
function SupervisorDashboard({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Supervisor Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'My Team', value: '12', change: '+1', icon: Users, color: 'blue' },
          { label: 'Tasks Today', value: '24', change: '+5', icon: CheckCircle2, color: 'green' },
          { label: 'Pending Reviews', value: '8', change: '-2', icon: FileText, color: 'purple' },
          { label: 'Hours Logged', value: '156', change: '+12', icon: Clock, color: 'orange' }
        ].map((metric, i) => {
          const Icon = metric.icon;
          return (
            <MetricCard key={i} {...metric} Icon={Icon} />
          );
        })}
      </div>
      <QuickActions role="supervisor" />
    </div>
  );
}

// Operative Dashboard
function OperativeDashboard({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">My Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'My Tasks', value: '8', change: '+2', icon: Target, color: 'blue' },
          { label: 'Completed', value: '45', change: '+12', icon: CheckCircle2, color: 'green' },
          { label: 'Hours Today', value: '6.5', change: '+1.5', icon: Clock, color: 'purple' },
          { label: 'This Week', value: '32', change: '+8', icon: Calendar, color: 'orange' }
        ].map((metric, i) => {
          const Icon = metric.icon;
          return (
            <MetricCard key={i} {...metric} Icon={Icon} />
          );
        })}
      </div>
      <QuickActions role="operative" />
    </div>
  );
}

// Reusable Components
function MetricCard({ label, value, change, Icon, color }: any) {
  const colorClasses: any = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
        <span className={`text-sm font-semibold ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </span>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}

function ActivityCard({ title }: { title: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Activity className="w-4 h-4 text-gray-400" />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">Activity {i}</div>
              <div className="text-xs text-gray-500">{i} minutes ago</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectsTable() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Projects</h3>
      <div className="space-y-2">
        {[
          { name: 'Office Building Alpha', progress: 75, status: 'On Track' },
          { name: 'Residential Complex B', progress: 45, status: 'At Risk' },
          { name: 'Shopping Mall Center', progress: 90, status: 'Ahead' }
        ].map((project, i) => (
          <div key={i} className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-900">{project.name}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                project.status === 'On Track' ? 'bg-green-100 text-green-700' :
                project.status === 'At Risk' ? 'bg-red-100 text-red-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {project.status}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${project.progress}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">{project.progress}% complete</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UpcomingTasks() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Tasks</h3>
      <div className="space-y-3">
        {[
          { task: 'Review blueprints', due: 'Today' },
          { task: 'Team meeting', due: 'Tomorrow' },
          { task: 'Site inspection', due: 'This week' },
          { task: 'Budget review', due: 'Next week' }
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">{item.task}</div>
              <div className="text-xs text-gray-500">{item.due}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickActions({ role }: { role: string }) {
  const actions: any = {
    super_admin: [
      { label: 'Manage Users', icon: Users, href: '/admin/users' },
      { label: 'System Settings', icon: Settings, href: '/admin/settings' },
      { label: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
      { label: 'Platform Logs', icon: FileText, href: '/admin/logs' }
    ],
    company_admin: [
      { label: 'New Project', icon: Plus, href: '/projects/new' },
      { label: 'Team Management', icon: Users, href: '/team' },
      { label: 'Reports', icon: BarChart3, href: '/reports' },
      { label: 'Billing', icon: DollarSign, href: '/billing' }
    ],
    developer: [
      { label: 'New App', icon: Plus, href: '/developer/new' },
      { label: 'API Docs', icon: FileText, href: '/developer/docs' },
      { label: 'SDK Manager', icon: Zap, href: '/developer/sdk' },
      { label: 'Testing', icon: Activity, href: '/developer/test' }
    ],
    supervisor: [
      { label: 'Assign Tasks', icon: Target, href: '/tasks/assign' },
      { label: 'Team Status', icon: Users, href: '/team/status' },
      { label: 'Time Sheets', icon: Clock, href: '/timesheets' },
      { label: 'Reports', icon: FileText, href: '/reports' }
    ],
    operative: [
      { label: 'My Tasks', icon: Target, href: '/tasks' },
      { label: 'Log Time', icon: Clock, href: '/time' },
      { label: 'Submit Report', icon: FileText, href: '/reports/new' },
      { label: 'Calendar', icon: Calendar, href: '/calendar' }
    ]
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
              className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
            >
              <Icon className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-700 text-center">{action.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
