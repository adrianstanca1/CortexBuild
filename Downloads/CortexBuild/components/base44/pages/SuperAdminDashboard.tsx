import React, { useState, useEffect } from 'react';
import { Users, Building2, Activity, Database, TrendingUp, AlertCircle, FileText, BarChart3, Code, Package, Zap, Webhook, Grid, Star, Cpu, Shield, HardDrive } from 'lucide-react';
import { EnhancedSuperAdminDashboard } from './EnhancedSuperAdminDashboard';
import { UserManagement } from '../admin/UserManagement';
import { CompanyManagement } from '../admin/CompanyManagement';
import { SystemMonitoring } from '../admin/SystemMonitoring';
import { ActivityLogs } from '../admin/ActivityLogs';
import { PlatformAnalytics } from '../admin/PlatformAnalytics';
import { DeveloperPlatform } from '../admin/DeveloperPlatform';
import { MarketplacePage } from './MarketplacePage';
import { DashboardBuilder } from './DashboardBuilder';
import { ModuleDevelopmentSDK } from '../admin/ModuleDevelopmentSDK';
import { SmartToolsManager } from '../admin/SmartToolsManager';
import { WebhookManager } from '../admin/WebhookManager';
import { ModuleReviews } from './ModuleReviews';
import { SDKDeveloperEnvironment } from '../../sdk/SDKDeveloperEnvironment';
import { UserAccessControl } from '../../admin/UserAccessControl';
import { UsageMonitoringDashboard } from '../../admin/UsageMonitoringDashboard';
import { DatabaseCapabilityManager } from '../../admin/DatabaseCapabilityManager';

interface DashboardStats {
  totalUsers: { count: number };
  totalCompanies: { count: number };
  totalProjects: { count: number };
  totalClients: { count: number };
  activeUsers: { count: number };
  recentActivity: any[];
}

export const SuperAdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'companies' | 'system' | 'analytics' | 'logs' | 'developer' | 'marketplace' | 'dashboards' | 'sdk' | 'automation' | 'webhooks' | 'reviews' | 'sdk-env' | 'access-control' | 'usage-monitoring' | 'database-manager'>('overview');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Get current user for SDK environment
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3001/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          setCurrentUser(data.user);
        }
      } catch (error) {
        console.error('Failed to fetch current user:', error);
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading Super Admin Dashboard...</div>
      </div>
    );
  }

  // Use enhanced dashboard for overview
  if (activeTab === 'overview') {
    return <EnhancedSuperAdminDashboard />;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Complete platform control and management</p>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'companies', label: 'Company Management', icon: Building2 },
            { id: 'marketplace', label: 'Marketplace', icon: Package },
            { id: 'sdk-env', label: 'SDK Developer', icon: Cpu },
            { id: 'access-control', label: 'Access Control', icon: Shield },
            { id: 'usage-monitoring', label: 'Usage Monitoring', icon: Activity },
            { id: 'database-manager', label: 'Database Manager', icon: HardDrive },
            { id: 'developer', label: 'Developer Platform', icon: Code },
            { id: 'dashboards', label: 'Dashboard Builder', icon: Grid },
            { id: 'sdk', label: 'Module SDK', icon: Code },
            { id: 'automation', label: 'Smart Tools', icon: Zap },
            { id: 'webhooks', label: 'Webhooks', icon: Webhook },
            { id: 'reviews', label: 'Reviews', icon: Star },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'logs', label: 'Activity Logs', icon: FileText },
            { id: 'system', label: 'System Monitoring', icon: Database }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content Tabs */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Users"
              value={stats?.totalUsers?.count || 0}
              icon={Users}
              color="blue"
              subtitle={`${stats?.activeUsers?.count || 0} active`}
            />
            <StatCard
              title="Total Companies"
              value={stats?.totalCompanies?.count || 0}
              icon={Building2}
              color="green"
            />
            <StatCard
              title="Total Projects"
              value={stats?.totalProjects?.count || 0}
              icon={Activity}
              color="purple"
            />
            <StatCard
              title="Total Clients"
              value={stats?.totalClients?.count || 0}
              icon={Database}
              color="orange"
            />
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center space-x-3">
                      <Activity className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-700">{activity.description || 'Activity'}</span>
                    </div>
                    <span className="text-xs text-gray-500">{activity.created_at}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && <UserManagement />}

      {/* Companies Tab */}
      {activeTab === 'companies' && <CompanyManagement />}

      {/* Marketplace Tab */}
      {activeTab === 'marketplace' && <MarketplacePage />}

      {/* SDK Developer Environment Tab */}
      {activeTab === 'sdk-env' && currentUser && <SDKDeveloperEnvironment user={currentUser} />}

      {/* Access Control Tab */}
      {activeTab === 'access-control' && <UserAccessControl />}

      {/* Usage Monitoring Tab */}
      {activeTab === 'usage-monitoring' && <UsageMonitoringDashboard />}

      {/* Database Manager Tab */}
      {activeTab === 'database-manager' && <DatabaseCapabilityManager />}

      {/* Developer Platform Tab */}
      {activeTab === 'developer' && <DeveloperPlatform />}

      {/* Dashboard Builder Tab */}
      {activeTab === 'dashboards' && <DashboardBuilder />}

      {/* Module SDK Tab */}
      {activeTab === 'sdk' && <ModuleDevelopmentSDK />}

      {/* Smart Tools Tab */}
      {activeTab === 'automation' && <SmartToolsManager />}

      {/* Webhooks Tab */}
      {activeTab === 'webhooks' && <WebhookManager />}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && <ModuleReviews />}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && <PlatformAnalytics />}

      {/* Activity Logs Tab */}
      {activeTab === 'logs' && <ActivityLogs />}

      {/* System Tab */}
      {activeTab === 'system' && <SystemMonitoring />}
    </div>
  );
};

// Stat Card Component
const StatCard: React.FC<{
  title: string;
  value: number;
  icon: any;
  color: string;
  subtitle?: string;
}> = ({ title, value, icon: Icon, color, subtitle }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};



