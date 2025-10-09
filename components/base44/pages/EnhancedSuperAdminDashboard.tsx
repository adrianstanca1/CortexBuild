import React, { useState, useEffect } from 'react';
import {
  Users, Building2, TrendingUp, DollarSign, Activity, Shield, Database,
  Settings, Zap, Code, BarChart3, AlertCircle, CheckCircle, Clock,
  Package, Cpu, HardDrive, Globe, Lock, UserPlus, RefreshCw, Download
} from 'lucide-react';
import { AddUserModal } from '../../admin/AddUserModal';
import { AddCompanyModal } from '../../admin/AddCompanyModal';
import { AddProjectModal } from '../../admin/AddProjectModal';
import { FullUsersManagement } from '../../admin/FullUsersManagement';
import { FullCompaniesManagement } from '../../admin/FullCompaniesManagement';

interface DashboardStats {
  users: { total: number; active: number; new: number };
  companies: { total: number; active: number };
  projects: { total: number; active: number };
  revenue: { total: number; monthly: number; growth: number };
  sdk: { developers: number; requests: number; cost: number };
  system: { uptime: number; cpu: number; memory: number; storage: number };
}

export const EnhancedSuperAdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'overview' | 'users' | 'companies' | 'sdk' | 'system'>('overview');
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem('token');

      // Fetch all stats in parallel
      const [usersRes, companiesRes, projectsRes, sdkRes] = await Promise.all([
        fetch('http://localhost:3001/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3001/api/admin/companies', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3001/api/projects', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3001/api/admin/sdk/usage', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const users = await usersRes.json();
      const companies = await companiesRes.json();
      const projects = await projectsRes.json();
      const sdk = await sdkRes.json();

      setStats({
        users: {
          total: users.data?.length || 0,
          active: users.data?.filter((u: any) => u.last_login).length || 0,
          new: users.data?.filter((u: any) => {
            const created = new Date(u.created_at);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return created > weekAgo;
          }).length || 0
        },
        companies: {
          total: companies.data?.length || 0,
          active: companies.data?.length || 0
        },
        projects: {
          total: projects.data?.length || 0,
          active: projects.data?.filter((p: any) => p.status === 'active').length || 0
        },
        revenue: {
          total: 125000,
          monthly: 15000,
          growth: 12.5
        },
        sdk: {
          developers: sdk.data?.totalDevelopers || 0,
          requests: sdk.data?.totalRequests || 0,
          cost: sdk.data?.totalCost || 0
        },
        system: {
          uptime: 99.9,
          cpu: 45,
          memory: 62,
          storage: 38
        }
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    icon: any;
    color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'teal';
    trend?: number;
    onClick?: () => void;
  }> = ({ title, value, subtitle, icon: Icon, color, trend, onClick }) => {
    const colorClasses = {
      blue: 'bg-blue-500 text-blue-600 bg-blue-50',
      green: 'bg-green-500 text-green-600 bg-green-50',
      purple: 'bg-purple-500 text-purple-600 bg-purple-50',
      orange: 'bg-orange-500 text-orange-600 bg-orange-50',
      red: 'bg-red-500 text-red-600 bg-red-50',
      teal: 'bg-teal-500 text-teal-600 bg-teal-50'
    };

    return (
      <div
        onClick={onClick}
        className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${colorClasses[color].split(' ')[2]}`}>
            <Icon className={`w-6 h-6 ${colorClasses[color].split(' ')[1]}`} />
          </div>
          {trend !== undefined && (
            <div className={`flex items-center space-x-1 text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className={`w-4 h-4 ${trend < 0 ? 'rotate-180' : ''}`} />
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
    );
  };

  const QuickAction: React.FC<{
    icon: any;
    label: string;
    onClick: () => void;
    color: string;
  }> = ({ icon: Icon, label, onClick, color }) => (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed ${color} hover:bg-opacity-10 transition-all`}
    >
      <Icon className="w-6 h-6 mb-2" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Super Admin Dashboard</h1>
              <p className="text-gray-600">Complete platform control and management</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={fetchDashboardStats}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                type="button"
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'companies', label: 'Companies', icon: Building2 },
              { id: 'sdk', label: 'SDK Platform', icon: Code },
              { id: 'system', label: 'System', icon: Database }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id as any)}
                className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${activeSection === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeSection === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Users"
                value={stats?.users.total || 0}
                subtitle={`${stats?.users.active || 0} active • ${stats?.users.new || 0} new this week`}
                icon={Users}
                color="blue"
                trend={8.2}
                onClick={() => setActiveSection('users')}
              />
              <StatCard
                title="Companies"
                value={stats?.companies.total || 0}
                subtitle={`${stats?.companies.active || 0} active companies`}
                icon={Building2}
                color="green"
                trend={5.1}
                onClick={() => setActiveSection('companies')}
              />
              <StatCard
                title="Active Projects"
                value={stats?.projects.active || 0}
                subtitle={`${stats?.projects.total || 0} total projects`}
                icon={Package}
                color="purple"
                trend={12.3}
              />
              <StatCard
                title="Monthly Revenue"
                value={`$${(stats?.revenue.monthly || 0).toLocaleString()}`}
                subtitle={`$${(stats?.revenue.total || 0).toLocaleString()} total`}
                icon={DollarSign}
                color="orange"
                trend={stats?.revenue.growth || 0}
              />
            </div>

            {/* SDK Platform Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Code className="w-6 h-6 mr-2 text-blue-600" />
                  SDK Developer Platform
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveSection('sdk')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View Details →
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {stats?.sdk.developers || 0}
                  </div>
                  <div className="text-sm text-gray-600">SDK Developers</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    {(stats?.sdk.requests || 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">API Requests</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    ${(stats?.sdk.cost || 0).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Total Cost</div>
                </div>
              </div>
            </div>

            {/* System Health */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Activity className="w-6 h-6 mr-2 text-green-600" />
                System Health
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Uptime</span>
                    <span className="text-sm font-bold text-green-600">{stats?.system.uptime}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${stats?.system.uptime}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">CPU Usage</span>
                    <span className="text-sm font-bold text-blue-600">{stats?.system.cpu}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${stats?.system.cpu}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Memory</span>
                    <span className="text-sm font-bold text-purple-600">{stats?.system.memory}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${stats?.system.memory}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Storage</span>
                    <span className="text-sm font-bold text-orange-600">{stats?.system.storage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${stats?.system.storage}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Zap className="w-6 h-6 mr-2 text-yellow-600" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <QuickAction icon={UserPlus} label="Add User" onClick={() => setShowAddUserModal(true)} color="border-blue-300 text-blue-600" />
                <QuickAction icon={Building2} label="Add Company" onClick={() => setShowAddCompanyModal(true)} color="border-green-300 text-green-600" />
                <QuickAction icon={Package} label="New Project" onClick={() => setShowAddProjectModal(true)} color="border-purple-300 text-purple-600" />
                <QuickAction icon={Code} label="SDK Access" onClick={() => setActiveSection('sdk')} color="border-orange-300 text-orange-600" />
                <QuickAction icon={Shield} label="Security" onClick={() => alert('Security settings coming soon!')} color="border-red-300 text-red-600" />
                <QuickAction icon={Settings} label="Settings" onClick={() => setActiveSection('system')} color="border-gray-300 text-gray-600" />
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeSection === 'users' && (
          <FullUsersManagement />
        )}

        {/* Companies Tab */}
        {activeSection === 'companies' && (
          <FullCompaniesManagement />
        )}

        {/* SDK Tab */}
        {activeSection === 'sdk' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">SDK Platform Management</h2>
            <p className="text-gray-600">SDK management interface coming soon...</p>
          </div>
        )}

        {/* System Tab */}
        {activeSection === 'system' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">System Monitoring</h2>
            <p className="text-gray-600">Advanced system monitoring coming soon...</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddUserModal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onSuccess={fetchDashboardStats}
      />
      <AddCompanyModal
        isOpen={showAddCompanyModal}
        onClose={() => setShowAddCompanyModal(false)}
        onSuccess={fetchDashboardStats}
      />
      <AddProjectModal
        isOpen={showAddProjectModal}
        onClose={() => setShowAddProjectModal(false)}
        onSuccess={fetchDashboardStats}
      />
    </div>
  );
};

