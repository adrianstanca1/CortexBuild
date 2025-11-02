import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  BellIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

// Simple Card Component
const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div
    className={`bg-white rounded-xl shadow-sm border border-gray-200 ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''} ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);

const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <p className={`text-sm text-gray-600 ${className}`}>
    {children}
  </p>
);

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

// Simple Dashboard Header Component
const DashboardHeader: React.FC<{
  title: string;
  subtitle: string;
  icon: React.ComponentType<any>;
  gradient: string;
  actions?: React.ReactNode;
}> = ({ title, subtitle, icon: Icon, gradient, actions }) => (
  <div className={`bg-gradient-to-r ${gradient} rounded-xl p-8 text-white mb-8`}>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-white/80">{subtitle}</p>
        </div>
      </div>
      {actions && (
        <div className="flex gap-3">
          {actions}
        </div>
      )}
    </div>
  </div>
);

// Simple Quick Stats Component
const QuickStats: React.FC<{
  stats: Array<{
    title: string;
    value: string;
    change: string;
    trend: 'up' | 'down';
    icon: React.ComponentType<any>;
    color: string;
    bgGradient: string;
  }>;
  columns?: number;
}> = ({ stats, columns = 4 }) => (
  <div className={`grid gap-6 ${columns === 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : columns === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
    {stats.map((stat, index) => (
      <Card key={index} className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{stat.title}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className={`text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {stat.change}
            </p>
          </div>
          <div className={`w-12 h-12 bg-gradient-to-br ${stat.bgGradient} rounded-lg flex items-center justify-center`}>
            <stat.icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </Card>
    ))}
  </div>
);

// Simple Section Grid Component
const SectionGrid: React.FC<{
  sections: Array<{
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<any>;
    color: string;
    count?: number;
    action?: () => void;
  }>;
  onSectionClick: (id: string) => void;
  columns?: number;
}> = ({ sections, onSectionClick, columns = 3 }) => (
  <div className={`grid gap-6 ${columns === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : columns === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
    {sections.map((section, index) => (
      <Card key={section.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onSectionClick(section.id)}>
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 bg-${section.color}-100 rounded-lg flex items-center justify-center`}>
            <section.icon className={`w-6 h-6 text-${section.color}-600`} />
          </div>
          {section.count !== undefined && (
            <span className="text-2xl font-bold text-gray-900">{section.count}</span>
          )}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{section.title}</h3>
        <p className="text-sm text-gray-600">{section.description}</p>
      </Card>
    ))}
  </div>
);

interface CompanyAdminDashboardProps {
  user: User;
  onNavigate?: (section: string) => void;
}

interface CompanyStats {
  totalUsers: number;
  activeProjects: number;
  monthlyRevenue: number;
  pendingApprovals: number;
}

interface AdminSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  count?: number;
  action?: () => void;
}

export const CompanyAdminDashboard: React.FC<CompanyAdminDashboardProps> = ({
  user,
  onNavigate
}) => {
  const [stats, setStats] = useState<CompanyStats>({
    totalUsers: 0,
    activeProjects: 0,
    monthlyRevenue: 0,
    pendingApprovals: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load company statistics
    const loadCompanyStats = async () => {
      try {
        // Mock data - replace with actual API calls
        setStats({
          totalUsers: 24,
          activeProjects: 8,
          monthlyRevenue: 15600,
          pendingApprovals: 3
        });
      } catch (error) {
        console.error('Failed to load company stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCompanyStats();
  }, [user.companyId]);

  const adminSections: AdminSection[] = [
    {
      id: 'user-management',
      title: 'User Management',
      description: 'Manage team members, roles, and permissions',
      icon: UserGroupIcon,
      color: 'blue',
      count: stats.totalUsers,
      action: () => onNavigate?.('user-management')
    },
    {
      id: 'team-collaboration',
      title: 'Team Collaboration',
      description: 'Configure team settings and collaboration tools',
      icon: BuildingOfficeIcon,
      color: 'green',
      action: () => onNavigate?.('team-collaboration')
    },
    {
      id: 'billing-payments',
      title: 'Billing & Payments',
      description: 'Manage subscriptions, invoices, and payments',
      icon: CurrencyDollarIcon,
      color: 'purple',
      count: stats.monthlyRevenue,
      action: () => onNavigate?.('billing-payments')
    },
    {
      id: 'company-analytics',
      title: 'Company Analytics',
      description: 'View company-wide performance and insights',
      icon: ChartBarIcon,
      color: 'orange',
      action: () => onNavigate?.('company-analytics')
    },
    {
      id: 'project-templates',
      title: 'Project Templates',
      description: 'Create and manage project templates',
      icon: DocumentTextIcon,
      color: 'cyan',
      action: () => onNavigate?.('project-templates')
    },
    {
      id: 'company-settings',
      title: 'Company Settings',
      description: 'Configure company preferences and integrations',
      icon: CogIcon,
      color: 'gray',
      action: () => onNavigate?.('company-settings')
    }
  ];

  const quickStats = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toString(),
      change: '+2',
      trend: 'up' as const,
      icon: UserGroupIcon,
      color: 'blue',
      bgGradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Active Projects',
      value: stats.activeProjects.toString(),
      change: '+1',
      trend: 'up' as const,
      icon: BuildingOfficeIcon,
      color: 'green',
      bgGradient: 'from-green-500 to-green-600'
    },
    {
      title: 'Monthly Revenue',
      value: `$${stats.monthlyRevenue.toLocaleString()}`,
      change: '+12%',
      trend: 'up' as const,
      icon: CurrencyDollarIcon,
      color: 'purple',
      bgGradient: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals.toString(),
      change: '-1',
      trend: 'down' as const,
      icon: BellIcon,
      color: 'orange',
      bgGradient: 'from-orange-500 to-orange-600'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <DashboardHeader
          title="Company Administration"
          subtitle={`Manage your company's operations, team, and settings`}
          icon={BuildingOfficeIcon}
          gradient="from-blue-600 via-purple-600 to-pink-600"
          actions={
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
                Export Report
              </button>
              <button className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-50 transition-colors">
                Settings
              </button>
            </div>
          }
        />

        {/* Quick Stats */}
        <div className="mb-8">
          <QuickStats stats={quickStats} columns={4} />
        </div>

        {/* Admin Sections Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Administration Tools</h2>
          <SectionGrid
            sections={adminSections}
            onSectionClick={(id) => {
              const section = adminSections.find(s => s.id === id);
              section?.action?.();
            }}
            columns={3}
          />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BellIcon className="w-5 h-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest company activities and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: 'New user joined', user: 'John Smith', time: '2 hours ago' },
                  { action: 'Project completed', user: 'Sarah Johnson', time: '4 hours ago' },
                  { action: 'Payment received', user: 'Finance Team', time: '1 day ago' },
                  { action: 'New project started', user: 'Mike Davis', time: '2 days ago' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500">by {activity.user}</p>
                    </div>
                    <span className="text-xs text-gray-400">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheckIcon className="w-5 h-5" />
                System Health
              </CardTitle>
              <CardDescription>
                Current system status and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { metric: 'API Response Time', value: '120ms', status: 'good' },
                  { metric: 'Database Performance', value: '98%', status: 'excellent' },
                  { metric: 'Storage Usage', value: '45%', status: 'good' },
                  { metric: 'Active Sessions', value: '23', status: 'normal' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{item.metric}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${
                        item.status === 'excellent' ? 'text-green-600' :
                        item.status === 'good' ? 'text-blue-600' :
                        'text-gray-600'
                      }`}>
                        {item.value}
                      </span>
                      <div className={`w-2 h-2 rounded-full ${
                        item.status === 'excellent' ? 'bg-green-500' :
                        item.status === 'good' ? 'bg-blue-500' :
                        'bg-gray-400'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};