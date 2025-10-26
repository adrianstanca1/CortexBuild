import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import {
  Code,
  Users,
  Activity,
  DollarSign,
  TrendingUp,
  Package,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  Database,
  Server,
  GitBranch,
  Terminal,
  FileCode,
  BarChart3,
  Settings
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface DeveloperStats {
  totalDevelopers: number;
  activeDevelopers: number;
  totalApps: number;
  totalWorkflows: number;
  totalAgents: number;
  apiRequestsToday: number;
  apiRequestsMonth: number;
  totalCost: number;
  avgResponseTime: number;
}

interface DeveloperProfile {
  id: string;
  user_id: string;
  userName: string;
  userEmail: string;
  subscription_tier: string;
  api_requests_used: number;
  api_requests_limit: number;
  created_at: string;
}

interface ApiUsageLog {
  id: string;
  user_id: string;
  userName: string;
  provider: string;
  model: string;
  total_tokens: number;
  cost: number;
  created_at: string;
}

interface SdkApp {
  id: string;
  name: string;
  developer_name: string;
  status: string;
  version: string;
  created_at: string;
}

const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('constructai_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const DeveloperDashboard: React.FC = () => {
  const [stats, setStats] = useState<DeveloperStats | null>(null);
  const [developers, setDevelopers] = useState<DeveloperProfile[]>([]);
  const [recentUsage, setRecentUsage] = useState<ApiUsageLog[]>([]);
  const [recentApps, setRecentApps] = useState<SdkApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'developers' | 'usage' | 'apps'>('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, devsRes, usageRes, appsRes] = await Promise.all([
        api.get('/admin/sdk/stats'),
        api.get('/admin/sdk/developers'),
        api.get('/admin/sdk/usage-logs'),
        api.get('/admin/sdk/apps')
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (devsRes.data.success) setDevelopers(devsRes.data.developers);
      if (usageRes.data.success) setRecentUsage(usageRes.data.logs);
      if (appsRes.data.success) setRecentApps(appsRes.data.apps);
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load developer dashboard');
    } finally {
      setLoading(false);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Developers</p>
              <p className="text-3xl font-bold text-slate-900">{stats?.totalDevelopers || 0}</p>
              <p className="text-xs text-emerald-600 mt-1">
                {stats?.activeDevelopers || 0} active
              </p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <Users className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Apps</p>
              <p className="text-3xl font-bold text-slate-900">{stats?.totalApps || 0}</p>
              <p className="text-xs text-blue-600 mt-1">
                {stats?.totalWorkflows || 0} workflows
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">API Requests</p>
              <p className="text-3xl font-bold text-slate-900">{stats?.apiRequestsMonth || 0}</p>
              <p className="text-xs text-purple-600 mt-1">
                {stats?.apiRequestsToday || 0} today
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Cost</p>
              <p className="text-3xl font-bold text-slate-900">
                ${(stats?.totalCost || 0).toFixed(2)}
              </p>
              <p className="text-xs text-orange-600 mt-1">
                This month
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-emerald-600" />
            Recent API Usage
          </h3>
          <div className="space-y-3">
            {recentUsage.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{log.userName}</p>
                  <p className="text-xs text-slate-500">
                    {log.provider} • {log.model} • {log.total_tokens} tokens
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">${log.cost.toFixed(4)}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2 text-blue-600" />
            Recent Apps
          </h3>
          <div className="space-y-3">
            {recentApps.slice(0, 5).map((app) => (
              <div key={app.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{app.name}</p>
                  <p className="text-xs text-slate-500">
                    by {app.developer_name} • v{app.version}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs rounded-full ${app.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                    app.status === 'pending_review' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                    {app.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderDevelopers = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Developer Profiles</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Developer</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Tier</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Usage</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Joined</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {developers.map((dev) => (
              <tr key={dev.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{dev.userName}</p>
                    <p className="text-xs text-slate-500">{dev.userEmail}</p>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${dev.subscription_tier === 'enterprise' ? 'bg-purple-100 text-purple-700' :
                    dev.subscription_tier === 'pro' ? 'bg-blue-100 text-blue-700' :
                      dev.subscription_tier === 'starter' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-slate-100 text-slate-700'
                    }`}>
                    {dev.subscription_tier}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: `${Math.min((dev.api_requests_used / dev.api_requests_limit) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-600">
                      {dev.api_requests_used}/{dev.api_requests_limit}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  {new Date(dev.created_at).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <button
                    type="button"
                    className="px-3 py-1 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading developer dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Developer Dashboard</h2>
          <p className="text-slate-600 mt-1">Monitor SDK usage, developers, and applications</p>
        </div>
        <button
          type="button"
          onClick={loadDashboardData}
          className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Activity className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'developers', label: 'Developers', icon: Users },
            { id: 'usage', label: 'API Usage', icon: Activity },
            { id: 'apps', label: 'Applications', icon: Package }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'developers' && renderDevelopers()}
      {activeTab === 'usage' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">API Usage Logs</h3>
          <p className="text-slate-600">Detailed usage logs coming soon...</p>
        </Card>
      )}
      {activeTab === 'apps' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Applications</h3>
          <p className="text-slate-600">Application management coming soon...</p>
        </Card>
      )}
    </div>
  );
};

