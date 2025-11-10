/**
 * ============================================
 * DEVELOPER DASHBOARD - Rebuilt Version
 * ============================================
 * Dashboard dedicat pentru utilizatori cu rol "developer"
 * Funcționalități: SDK Tools, AI Agents, Sandbox, Code Builder, Analytics
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Code,
  Zap,
  Bot,
  Terminal,
  BarChart3,
  Rocket,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Package,
  Workflow,
  Webhook,
  Play,
  Settings,
  LogOut
} from 'lucide-react';
import { Card } from '../../ui/Card';
import { User } from '../../../types';

interface DeveloperDashboardScreenProps {
  currentUser?: User;
  onLogout?: () => void;
}

interface DeveloperStats {
  totalApps: number;
  activeApps: number;
  pendingApps: number;
  totalWorkflows: number;
  activeWorkflows: number;
  totalWebhooks: number;
  totalAgents: number;
  runningAgents: number;
  totalRequestsThisMonth: number;
  totalCostThisMonth: number;
  totalTokensThisMonth: number;
}

interface DashboardData {
  success: boolean;
  tenant: {
    userId: string;
    companyId: string | null;
  };
  profile: {
    subscriptionTier: string;
    apiRequestsUsed: number;
    apiRequestsLimit: number;
  };
  stats: DeveloperStats;
  apps: any[];
  workflows: any[];
  webhooks: any[];
  agents: any[];
  sandboxRuns: any[];
  builderModules: any[];
  usageSummary: any[];
  capabilities: any;
}

export const DeveloperDashboardScreen: React.FC<DeveloperDashboardScreenProps> = ({ currentUser, onLogout }) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'sdk' | 'agents' | 'sandbox' | 'analytics'>('overview');

  useEffect(() => {
    console.log('🎯 DeveloperDashboardScreen mounted');
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('📊 Fetching developer dashboard data...');
      setLoading(true);
      const response = await axios.get('/api/developer/dashboard/summary');
      console.log('✅ Developer dashboard data received:', response.data);

      // Validate response structure
      if (response.data && typeof response.data === 'object' && response.data.stats) {
        setData(response.data);
      } else {
        console.error('❌ Invalid response structure:', response.data);
        setData(null);
      }
    } catch (error: any) {
      console.error('❌ Failed to fetch developer dashboard:', error);
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!data || !data.stats) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Failed to load developer dashboard</p>
          {data && !data.stats && (
            <p className="text-red-700 text-sm mt-2">Dashboard data is incomplete. Please refresh the page.</p>
          )}
        </div>
      </div>
    );
  }

  const stats = data.stats;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
      {/* Top Navigation Bar with Logout */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">CortexBuild Developer</h1>
                <p className="text-xs text-gray-500">SDK Platform & Tools</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {currentUser && (
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                  <p className="text-xs text-gray-500">{currentUser.email}</p>
                </div>
              )}
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white py-8 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Code className="w-8 h-8" />
            <h1 className="text-3xl font-bold">👨‍💻 Developer Dashboard</h1>
          </div>
          <p className="text-purple-100 text-lg">
            SDK Platform · AI Agents · Code Builder · Sandbox · Analytics
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-6 overflow-x-auto">
            <TabButton
              active={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
              icon={<BarChart3 className="w-5 h-5" />}
              label="Overview"
            />
            <TabButton
              active={activeTab === 'sdk'}
              onClick={() => setActiveTab('sdk')}
              icon={<Package className="w-5 h-5" />}
              label="SDK Tools"
            />
            <TabButton
              active={activeTab === 'agents'}
              onClick={() => setActiveTab('agents')}
              icon={<Bot className="w-5 h-5" />}
              label="AI Agents"
            />
            <TabButton
              active={activeTab === 'sandbox'}
              onClick={() => setActiveTab('sandbox')}
              icon={<Terminal className="w-5 h-5" />}
              label="Sandbox"
            />
            <TabButton
              active={activeTab === 'analytics'}
              onClick={() => setActiveTab('analytics')}
              icon={<TrendingUp className="w-5 h-5" />}
              label="Analytics"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && <OverviewTab data={data} stats={stats} />}
        {activeTab === 'sdk' && <SDKToolsTab data={data} stats={stats} />}
        {activeTab === 'agents' && <AIAgentsTab data={data} stats={stats} />}
        {activeTab === 'sandbox' && <SandboxTab data={data} stats={stats} />}
        {activeTab === 'analytics' && <AnalyticsTab data={data} stats={stats} />}
      </div>
    </div>
  );
};

// Tab Button Component
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-2 px-4 py-3 font-medium transition-all border-b-2
      ${active
        ? 'border-purple-600 text-purple-600'
        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
      }
    `}
  >
    {icon}
    <span>{label}</span>
  </button>
);

// Overview Tab
const OverviewTab: React.FC<{ data: DashboardData; stats: DeveloperStats }> = ({ data, stats }) => (
  <div className="space-y-6">
    {/* Quick Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="SDK Apps"
        value={stats.totalApps}
        subtitle={`${stats.activeApps} active`}
        icon={<Package className="w-6 h-6 text-purple-600" />}
        color="purple"
      />
      <StatCard
        title="AI Agents"
        value={stats.totalAgents}
        subtitle={`${stats.runningAgents} running`}
        icon={<Bot className="w-6 h-6 text-blue-600" />}
        color="blue"
      />
      <StatCard
        title="Workflows"
        value={stats.totalWorkflows}
        subtitle={`${stats.activeWorkflows} active`}
        icon={<Workflow className="w-6 h-6 text-indigo-600" />}
        color="indigo"
      />
      <StatCard
        title="API Calls"
        value={stats.totalRequestsThisMonth}
        subtitle="This month"
        icon={<Zap className="w-6 h-6 text-yellow-600" />}
        color="yellow"
      />
    </div>

    {/* Usage Summary */}
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Monthly Usage Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <UsageMetric
            label="API Requests"
            value={stats.totalRequestsThisMonth.toLocaleString()}
            limit={data.profile.apiRequestsLimit.toLocaleString()}
            used={data.profile.apiRequestsUsed}
            max={data.profile.apiRequestsLimit}
          />
          <UsageMetric
            label="AI Tokens"
            value={stats.totalTokensThisMonth.toLocaleString()}
            limit="∞"
            used={stats.totalTokensThisMonth}
            max={1000000}
          />
          <UsageMetric
            label="Cost"
            value={`$${stats.totalCostThisMonth.toFixed(2)}`}
            limit="$50.00"
            used={stats.totalCostThisMonth}
            max={50}
          />
        </div>
      </div>
    </Card>

    {/* Recent Activity */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Sandbox Runs</h3>
          <div className="space-y-3">
            {data.sandboxRuns.slice(0, 5).map((run) => (
              <div key={run.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Play className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="font-medium text-sm">{run.name || 'Unnamed Run'}</p>
                    <p className="text-xs text-gray-500">{run.durationMs}ms</p>
                  </div>
                </div>
                <StatusBadge status={run.status} />
              </div>
            ))}
            {data.sandboxRuns.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">No sandbox runs yet</p>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Active Webhooks</h3>
          <div className="space-y-3">
            {data.webhooks.slice(0, 5).map((webhook: any) => (
              <div key={webhook.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Webhook className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="font-medium text-sm">{webhook.url}</p>
                    <p className="text-xs text-gray-500">
                      {JSON.parse(webhook.events || '[]').join(', ')}
                    </p>
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full ${webhook.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>
            ))}
            {data.webhooks.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">No webhooks configured</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  </div>
);

// SDK Tools Tab
const SDKToolsTab: React.FC<{ data: DashboardData; stats: DeveloperStats }> = ({ data, stats }) => (
  <div className="space-y-6">
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">SDK Applications</h3>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            + New App
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.apps.map((app) => (
            <div key={app.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold">{app.name}</h4>
                  <p className="text-sm text-gray-500">v{app.version}</p>
                </div>
                <StatusBadge status={app.status} />
              </div>
              <p className="text-sm text-gray-600 mb-3">{app.description}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{app.installCount || 0} installs</span>
                <span>★ {app.rating?.toFixed(1) || '0.0'}</span>
              </div>
            </div>
          ))}
        </div>
        {data.apps.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No SDK apps yet</p>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              Create Your First App
            </button>
          </div>
        )}
      </div>
    </Card>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Workflows</h3>
          <p className="text-sm text-gray-600 mb-4">
            Total: {stats.totalWorkflows} | Active: {stats.activeWorkflows}
          </p>
          <div className="space-y-2">
            {data.workflows.slice(0, 5).map((wf) => (
              <div key={wf.id} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{wf.name}</p>
                  <p className="text-xs text-gray-500">{wf.triggers?.length || 0} triggers</p>
                </div>
                <div className={`w-2 h-2 rounded-full ${wf.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Builder Modules</h3>
          <p className="text-sm text-gray-600 mb-4">
            Total: {data.builderModules.length} modules
          </p>
          <div className="space-y-2">
            {data.builderModules.slice(0, 5).map((module) => (
              <div key={module.id} className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-sm">{module.name}</p>
                <p className="text-xs text-gray-500">{module.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  </div>
);

// AI Agents Tab  
const AIAgentsTab: React.FC<{ data: DashboardData; stats: DeveloperStats }> = ({ data, stats }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        title="Total Agents"
        value={stats.totalAgents}
        subtitle="Created"
        icon={<Bot className="w-6 h-6 text-blue-600" />}
        color="blue"
      />
      <StatCard
        title="Running"
        value={stats.runningAgents}
        subtitle="Active now"
        icon={<Play className="w-6 h-6 text-green-600" />}
        color="green"
      />
      <StatCard
        title="Deployments"
        value={data.agents.filter((a) => a.status === 'deployed').length}
        subtitle="Production"
        icon={<Rocket className="w-6 h-6 text-purple-600" />}
        color="purple"
      />
    </div>

    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">AI Agents</h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            + New Agent
          </button>
        </div>
        <div className="space-y-4">
          {data.agents.map((agent) => (
            <div key={agent.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold">{agent.name}</h4>
                    <StatusBadge status={agent.status} />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{agent.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Model: {agent.model}</span>
                    <span>Temp: {agent.temperature}</span>
                    {agent.tools && <span>{JSON.parse(agent.tools).length} tools</span>}
                  </div>
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {data.agents.length === 0 && (
            <div className="text-center py-12">
              <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No AI agents yet</p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Create Your First Agent
              </button>
            </div>
          )}
        </div>
      </div>
    </Card>
  </div>
);

// Sandbox Tab
const SandboxTab: React.FC<{ data: DashboardData; stats: DeveloperStats }> = ({ data }) => (
  <div className="space-y-6">
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Sandbox Executions</h3>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            + New Sandbox
          </button>
        </div>
        <div className="space-y-3">
          {data.sandboxRuns.map((run) => (
            <div key={run.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Terminal className="w-4 h-4 text-purple-600" />
                    <h4 className="font-semibold">{run.name || 'Unnamed Run'}</h4>
                    <StatusBadge status={run.status} />
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {run.durationMs}ms
                    </span>
                    <span>{new Date(run.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              {run.result && (
                <div className="mt-3 p-3 bg-gray-50 rounded text-xs font-mono">
                  <pre>{JSON.stringify(run.result, null, 2)}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  </div>
);

// Analytics Tab
const AnalyticsTab: React.FC<{ data: DashboardData; stats: DeveloperStats }> = ({ data, stats }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="API Calls"
        value={stats.totalRequestsThisMonth}
        subtitle="This month"
        icon={<Zap className="w-6 h-6 text-yellow-600" />}
        color="yellow"
      />
      <StatCard
        title="Tokens Used"
        value={stats.totalTokensThisMonth.toLocaleString()}
        subtitle="Total"
        icon={<TrendingUp className="w-6 h-6 text-green-600" />}
        color="green"
      />
      <StatCard
        title="Total Cost"
        value={`$${stats.totalCostThisMonth.toFixed(2)}`}
        subtitle="This month"
        icon={<BarChart3 className="w-6 h-6 text-blue-600" />}
        color="blue"
      />
      <StatCard
        title="Avg Response"
        value="142ms"
        subtitle="API latency"
        icon={<Clock className="w-6 h-6 text-purple-600" />}
        color="purple"
      />
    </div>

    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Usage by Provider</h3>
        <div className="space-y-4">
          {data.usageSummary.map((summary) => (
            <div key={summary.provider} className="border-b border-gray-100 pb-4 last:border-0">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{summary.provider}</h4>
                <span className="text-sm text-gray-500">
                  ${summary.monthToDateCost.toFixed(2)}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Requests</p>
                  <p className="font-semibold">{summary.requestsThisMonth.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Tokens</p>
                  <p className="font-semibold">{summary.totalTokens.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Avg Cost/Request</p>
                  <p className="font-semibold">
                    ${(summary.monthToDateCost / Math.max(1, summary.requestsThisMonth)).toFixed(4)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  </div>
);

// Helper Components
const StatCard: React.FC<{
  title: string;
  value: number | string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, subtitle, icon, color }) => (
  <Card>
    <div className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 bg-${color}-100 rounded-lg`}>{icon}</div>
      </div>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  </Card>
);

const UsageMetric: React.FC<{
  label: string;
  value: string;
  limit: string;
  used: number;
  max: number;
}> = ({ label, value, limit, used, max }) => {
  const percentage = Math.min(100, (used / max) * 100);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-500">
          {value} / {limit}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${percentage > 80 ? 'bg-red-500' : percentage > 50 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'active':
      case 'running':
      case 'completed':
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'pending_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
      case 'stopped':
        return 'bg-gray-100 text-gray-800';
      case 'failed':
      case 'error':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {status}
    </span>
  );
};
