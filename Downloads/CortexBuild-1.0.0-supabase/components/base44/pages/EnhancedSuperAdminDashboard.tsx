import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle,
  Code,
  Cpu,
  Database,
  DollarSign,
  Download,
  Globe,
  HardDrive,
  Layers,
  Lock,
  Package,
  RefreshCw,
  Settings,
  Shield,
  UserPlus,
  Users,
  Zap
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AddUserModal } from '../../admin/AddUserModal';
import { AddCompanyModal } from '../../admin/AddCompanyModal';
import { AddProjectModal } from '../../admin/AddProjectModal';
import { FullUsersManagement } from '../../admin/FullUsersManagement';
import { FullCompaniesManagement } from '../../admin/FullCompaniesManagement';

interface ProviderUsage {
  provider: string;
  requests: number;
  cost: number;
  tokens: number;
}

interface TenantUsage {
  companyId: string;
  companyName: string;
  projects: number;
  users: number;
  apiCost: number;
  tokens: number;
}

interface ActivityEntry {
  id: string;
  action: string;
  description: string;
  createdAt: string;
  userName?: string;
  companyName?: string;
}

interface PendingApproval {
  id: string;
  name: string;
  status: string;
  updatedAt: string;
  developerName?: string;
  companyName?: string;
}

interface AppSummary {
  id: string;
  name: string;
  status: string;
  updatedAt: string;
  developerName?: string;
  companyName?: string;
}

interface DashboardData {
  totals: {
    users: number;
    companies: number;
    projects: number;
    clients: number;
  };
  userStats: {
    total: number;
    active: number;
    newThisWeek: number;
    superAdmins: number;
    developers: number;
  };
  companyStats: {
    total: number;
    active: number;
    newThisMonth: number;
  };
  projectStats: {
    total: number;
    active: number;
    byStatus: Array<{ status: string; count: number }>;
  };
  sdkStats: {
    developers: number;
    requestsThisMonth: number;
    costThisMonth: number;
    tokensThisMonth: number;
    topProviders: ProviderUsage[];
  };
  systemStats: {
    uptime: number;
    cpu: number;
    memory: number;
    storage: number;
  };
  tenantUsage: TenantUsage[];
  recentActivity: ActivityEntry[];
  pendingApprovals: PendingApproval[];
  recentApps: AppSummary[];
}

type Section = 'overview' | 'users' | 'companies' | 'sdk' | 'system';

const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('constructai_token') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const StatCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<any>;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'teal';
  onClick?: () => void;
}> = ({ title, value, subtitle, icon: Icon, color, onClick }) => {
  const palette = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600' },
    green: { bg: 'bg-green-50', icon: 'text-green-600' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600' },
    orange: { bg: 'bg-orange-50', icon: 'text-orange-600' },
    red: { bg: 'bg-red-50', icon: 'text-red-600' },
    teal: { bg: 'bg-teal-50', icon: 'text-teal-600' }
  }[color];

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${palette.bg}`}>
          <Icon className={`w-6 h-6 ${palette.icon}`} />
        </div>
      </div>
      <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
};

const QuickAction: React.FC<{
  icon: React.ComponentType<any>;
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

export const EnhancedSuperAdminDashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>('overview');

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);

  const fetchDashboard = async () => {
    setRefreshing(true);
    try {
      const response = await api.get('/admin/dashboard');
      if (response.data?.success) {
        setSummary(response.data.data);
      } else {
        toast.error('Unable to load super admin dashboard data');
      }
    } catch (error) {
      console.error('Failed to load dashboard summary', error);
      toast.error('Failed to load dashboard summary');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const statusBreakdown = useMemo(() => summary?.projectStats.byStatus ?? [], [summary]);

  const topProviders = useMemo(() => summary?.sdkStats.topProviders ?? [], [summary]);

  const tenantUsage = useMemo(() => summary?.tenantUsage ?? [], [summary]);

  const pendingApprovals = useMemo(() => summary?.pendingApprovals ?? [], [summary]);

  const recentActivity = useMemo(() => summary?.recentActivity ?? [], [summary]);

  const recentApps = useMemo(() => summary?.recentApps ?? [], [summary]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Preparing super admin console…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 uppercase tracking-wide">
                <Shield className="h-4 w-4" />
                Platform Oversight
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Unified control over tenants, usage, and system health.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={fetchDashboard}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
              >
                <Download className="h-4 w-4" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Overview */}
        <div className="grid gap-6 lg:grid-cols-4">
          <StatCard
            title="Total Users"
            value={formatNumber(summary?.userStats.total ?? 0)}
            subtitle={`${formatNumber(summary?.userStats.newThisWeek ?? 0)} joined this week`}
            icon={Users}
            color="blue"
            onClick={() => setActiveSection('users')}
          />
          <StatCard
            title="Active Tenants"
            value={formatNumber(summary?.companyStats.active ?? 0)}
            subtitle={`${formatNumber(summary?.companyStats.newThisMonth ?? 0)} new this month`}
            icon={Building2}
            color="green"
            onClick={() => setActiveSection('companies')}
          />
          <StatCard
            title="Live Projects"
            value={formatNumber(summary?.projectStats.active ?? 0)}
            subtitle={`${formatNumber(summary?.projectStats.total ?? 0)} total projects`}
            icon={Layers}
            color="purple"
            onClick={() => setActiveSection('overview')}
          />
          <StatCard
            title="SDK Requests"
            value={formatNumber(summary?.sdkStats.requestsThisMonth ?? 0)}
            subtitle={formatCurrency(summary?.sdkStats.costThisMonth ?? 0) + ' spend this month'}
            icon={Code}
            color="orange"
            onClick={() => setActiveSection('sdk')}
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            <p className="text-sm text-gray-500">Manage global resources across tenants.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <QuickAction icon={UserPlus} label="Invite User" onClick={() => setShowAddUserModal(true)} color="border-blue-300 text-blue-600" />
            <QuickAction icon={Building2} label="Add Company" onClick={() => setShowAddCompanyModal(true)} color="border-green-300 text-green-600" />
            <QuickAction icon={Package} label="Create Project" onClick={() => setShowAddProjectModal(true)} color="border-purple-300 text-purple-600" />
            <QuickAction icon={Settings} label="Platform Admin" onClick={() => setActiveSection('system')} color="border-gray-300 text-gray-600" />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 text-sm font-semibold">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'companies', label: 'Companies', icon: Building2 },
            { id: 'sdk', label: 'SDK Platform', icon: Code },
            { id: 'system', label: 'System Health', icon: Shield }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as Section)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${activeSection === tab.id ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Section Content */}
        {activeSection === 'overview' && (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Tenant Breakdown</h3>
                    <p className="text-sm text-gray-500">Top tenants by usage this month.</p>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                    onClick={() => setActiveSection('companies')}
                  >
                    Manage Tenants <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase text-gray-500 border-b">
                        <th className="py-2">Company</th>
                        <th className="py-2">Projects</th>
                        <th className="py-2">Users</th>
                        <th className="py-2">Tokens</th>
                        <th className="py-2 text-right">API Spend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenantUsage.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-gray-500">
                            No tenant usage recorded yet.
                          </td>
                        </tr>
                      ) : (
                        tenantUsage.map((tenant) => (
                          <tr key={tenant.companyId} className="border-b last:border-none">
                            <td className="py-3 font-medium text-gray-900">{tenant.companyName}</td>
                            <td className="py-3 text-gray-600">{formatNumber(tenant.projects)}</td>
                            <td className="py-3 text-gray-600">{formatNumber(tenant.users)}</td>
                            <td className="py-3 text-gray-600">{formatNumber(tenant.tokens)}</td>
                            <td className="py-3 text-right text-gray-900 font-semibold">{formatCurrency(tenant.apiCost)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Project Status</h3>
                    <p className="text-sm text-gray-500">Current pipeline across all tenants.</p>
                  </div>
                  <Layers className="h-5 w-5 text-purple-500" />
                </div>
                <div className="space-y-3">
                  {statusBreakdown.length === 0 ? (
                    <p className="text-sm text-gray-500">No projects found.</p>
                  ) : (
                    statusBreakdown.map((status) => (
                      <div key={status.status} className="flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-700 capitalize">{status.status || 'unspecified'}</div>
                        <div className="text-sm font-semibold text-gray-900">{formatNumber(status.count)}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Pending SDK Approvals</h3>
                    <p className="text-sm text-gray-500">Modules awaiting review before tenant release.</p>
                  </div>
                  <Package className="h-5 w-5 text-amber-500" />
                </div>
                <div className="space-y-3">
                  {pendingApprovals.length === 0 ? (
                    <p className="text-sm text-gray-500">No modules awaiting approval.</p>
                  ) : (
                    pendingApprovals.map((item) => (
                      <div key={item.id} className="flex items-start justify-between border border-gray-100 rounded-lg p-3">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{item.name}</div>
                          <div className="text-xs text-gray-500">
                            {item.companyName || 'Unassigned'} • {item.developerName || 'Unknown developer'}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">Updated {formatDateTime(item.updatedAt)}</div>
                        </div>
                        <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full capitalize">
                          {item.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Recent Platform Activity</h3>
                    <p className="text-sm text-gray-500">Key changes performed by administrators.</p>
                  </div>
                  <Activity className="h-5 w-5 text-green-500" />
                </div>
                <div className="space-y-3">
                  {recentActivity.length === 0 ? (
                    <p className="text-sm text-gray-500">No activity recorded.</p>
                  ) : (
                    recentActivity.map((event) => (
                      <div key={event.id} className="border border-gray-100 rounded-lg p-3">
                        <div className="text-sm font-semibold text-gray-900">{event.action}</div>
                        <div className="text-xs text-gray-500">
                          {event.description || 'No description'}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {event.userName ? `${event.userName} • ` : ''}
                          {formatDateTime(event.createdAt)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'users' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <FullUsersManagement />
          </div>
        )}

        {activeSection === 'companies' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <FullCompaniesManagement />
          </div>
        )}

        {activeSection === 'sdk' && (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-4">
              <StatCard
                title="SDK Developers"
                value={formatNumber(summary?.sdkStats.developers ?? 0)}
                subtitle={`${formatNumber(summary?.userStats.developers ?? 0)} active developer accounts`}
                icon={Users}
                color="purple"
              />
              <StatCard
                title="Requests This Month"
                value={formatNumber(summary?.sdkStats.requestsThisMonth ?? 0)}
                subtitle={`${formatNumber(summary?.sdkStats.tokensThisMonth ?? 0)} tokens processed`}
                icon={Zap}
                color="orange"
              />
              <StatCard
                title="API Spend"
                value={formatCurrency(summary?.sdkStats.costThisMonth ?? 0)}
                subtitle="Tracked across all tenants"
                icon={DollarSign}
                color="teal"
              />
              <StatCard
                title="Pending Reviews"
                value={formatNumber(pendingApprovals.length)}
                subtitle="Modules awaiting approval"
                icon={AlertCircle}
                color="red"
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Top Providers</h3>
                    <p className="text-sm text-gray-500">Usage split by AI provider this month.</p>
                  </div>
                  <Code className="h-5 w-5 text-indigo-500" />
                </div>
                <div className="space-y-3">
                  {topProviders.length === 0 ? (
                    <p className="text-sm text-gray-500">No provider usage recorded.</p>
                  ) : (
                    topProviders.map((provider) => (
                      <div key={provider.provider} className="border border-gray-100 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold text-gray-900 capitalize">{provider.provider}</div>
                          <div className="text-sm font-semibold text-gray-700">{formatNumber(provider.requests)} calls</div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                          <span>{formatNumber(provider.tokens)} tokens</span>
                          <span>{formatCurrency(provider.cost)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Latest Releases</h3>
                    <p className="text-sm text-gray-500">Recently updated modules across tenants.</p>
                  </div>
                  <Package className="h-5 w-5 text-blue-500" />
                </div>
                <div className="space-y-3">
                  {recentApps.length === 0 ? (
                    <p className="text-sm text-gray-500">No recent module activity.</p>
                  ) : (
                    recentApps.slice(0, 6).map((app) => (
                      <div key={app.id} className="border border-gray-100 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold text-gray-900">{app.name}</div>
                          <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full capitalize">
                            {app.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {app.companyName || 'Unassigned'} • {app.developerName || 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">Updated {formatDateTime(app.updatedAt)}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'system' && (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-4">
              <StatCard title="Platform Uptime" value={`${summary?.systemStats.uptime ?? 0}%`} icon={Shield} color="green" subtitle="Trailing 30 days" />
              <StatCard title="CPU Utilisation" value={`${summary?.systemStats.cpu ?? 0}%`} icon={Cpu} color="orange" subtitle="Platform services" />
              <StatCard title="Memory Usage" value={`${summary?.systemStats.memory ?? 0}%`} icon={Database} color="purple" subtitle="Aggregate usage" />
              <StatCard title="Storage Utilisation" value={`${summary?.systemStats.storage ?? 0}%`} icon={HardDrive} color="blue" subtitle="Object store" />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                  <p className="text-sm text-gray-500">Audit trail of administrative operations.</p>
                </div>
                <Lock className="h-5 w-5 text-gray-500" />
              </div>
              <div className="space-y-3">
                {recentActivity.length === 0 ? (
                  <p className="text-sm text-gray-500">No logged activity yet.</p>
                ) : (
                  recentActivity.map((event) => (
                    <div key={event.id} className="flex items-start gap-3 border border-gray-100 rounded-lg p-3">
                      <div className="mt-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{event.action}</div>
                        <div className="text-xs text-gray-500">{event.description || 'No description provided.'}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {event.userName ? `${event.userName} • ` : ''}
                          {formatDateTime(event.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <AddUserModal isOpen={showAddUserModal} onClose={() => setShowAddUserModal(false)} onSuccess={fetchDashboard} />
      <AddCompanyModal isOpen={showAddCompanyModal} onClose={() => setShowAddCompanyModal(false)} onSuccess={fetchDashboard} />
      <AddProjectModal isOpen={showAddProjectModal} onClose={() => setShowAddProjectModal(false)} onSuccess={fetchDashboard} />
    </div>
  );
};

export default EnhancedSuperAdminDashboard;
