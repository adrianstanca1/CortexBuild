/**
 * ============================================
 * COMPLETE DEVELOPER DASHBOARD
 * ============================================
 * Full-featured developer platform with:
 * - SDK Tools & Marketplace
 * - AI Agents Management
 * - Sandbox Console
 * - Code Builder
 * - Analytics & Monitoring
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
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Activity,
  Cpu,
  Database,
  Globe,
  Shield,
  Users,
  DollarSign
} from 'lucide-react';

// Types
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

interface App {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'active' | 'pending' | 'inactive';
  downloads: number;
  rating: number;
  createdAt: string;
}

interface Agent {
  id: string;
  name: string;
  type: string;
  status: 'running' | 'stopped' | 'error';
  lastRun: string;
  successRate: number;
}

interface SandboxRun {
  id: string;
  name: string;
  status: 'success' | 'failed' | 'running';
  duration: number;
  timestamp: string;
  output?: string;
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
  apps: App[];
  workflows: any[];
  webhooks: any[];
  agents: Agent[];
  sandboxRuns: SandboxRun[];
  builderModules: any[];
  usageSummary: any[];
  capabilities: any;
}

// Tab Button Component
const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}> = ({ active, onClick, icon, label, badge }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
      active
        ? 'border-purple-600 text-purple-600 font-semibold'
        : 'border-transparent text-gray-600 hover:text-purple-600 hover:border-purple-300'
    }`}
  >
    {icon}
    <span>{label}</span>
    {badge !== undefined && badge > 0 && (
      <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
        {badge}
      </span>
    )}
  </button>
);

// Stat Card Component
const StatCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  color?: 'purple' | 'blue' | 'green' | 'orange';
}> = ({ icon, title, value, subtitle, trend, color = 'purple' }) => {
  const colorClasses = {
    purple: 'bg-purple-100 text-purple-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`w-4 h-4 ${trend < 0 ? 'rotate-180' : ''}`} />
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
      </div>
    </div>
  );
};

// Main Component
export const CompleteDeveloperDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'sdk' | 'agents' | 'sandbox' | 'marketplace' | 'analytics'>('overview');
  const [sandboxCode, setSandboxCode] = useState('// Write your code here\nconsole.log("Hello from Sandbox!");');
  const [sandboxOutput, setSandboxOutput] = useState('');
  const [sandboxRunning, setSandboxRunning] = useState(false);

  useEffect(() => {
    console.log('🎯 CompleteDeveloperDashboard mounted');
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('📊 Fetching developer dashboard data...');
      setLoading(true);
      const response = await axios.get('/api/developer/dashboard/summary');
      console.log('✅ Developer dashboard data received:', response.data);
      setData(response.data);
    } catch (error) {
      console.error('❌ Failed to fetch developer dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const runSandboxCode = async () => {
    try {
      setSandboxRunning(true);
      setSandboxOutput('Running...\n');
      
      const response = await axios.post('/api/developer/sandbox/run', {
        code: sandboxCode,
        language: 'javascript'
      });

      setSandboxOutput(response.data.output || 'Code executed successfully');
    } catch (error: any) {
      setSandboxOutput(`Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setSandboxRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Developer Platform...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-red-900">Failed to Load Dashboard</h3>
            </div>
            <p className="text-red-700">Unable to fetch developer dashboard data. Please try again.</p>
            <button
              onClick={fetchDashboardData}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stats = data.stats;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Code className="w-10 h-10" />
                <h1 className="text-4xl font-bold">Developer Platform</h1>
              </div>
              <p className="text-purple-100 text-lg">
                Build · Deploy · Monitor · Scale
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-purple-200">Subscription</p>
                <p className="text-lg font-semibold">{data.profile.subscriptionTier}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-purple-200">API Requests</p>
                <p className="text-lg font-semibold">
                  {data.profile.apiRequestsUsed.toLocaleString()} / {data.profile.apiRequestsLimit.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
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
              badge={stats.activeApps}
            />
            <TabButton
              active={activeTab === 'agents'}
              onClick={() => setActiveTab('agents')}
              icon={<Bot className="w-5 h-5" />}
              label="AI Agents"
              badge={stats.runningAgents}
            />
            <TabButton
              active={activeTab === 'sandbox'}
              onClick={() => setActiveTab('sandbox')}
              icon={<Terminal className="w-5 h-5" />}
              label="Sandbox"
            />
            <TabButton
              active={activeTab === 'marketplace'}
              onClick={() => setActiveTab('marketplace')}
              icon={<Globe className="w-5 h-5" />}
              label="Marketplace"
            />
            <TabButton
              active={activeTab === 'analytics'}
              onClick={() => setActiveTab('analytics')}
              icon={<Activity className="w-5 h-5" />}
              label="Analytics"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={<Package className="w-6 h-6" />}
                title="SDK Apps"
                value={stats.totalApps}
                subtitle={`${stats.activeApps} active`}
                trend={12}
                color="purple"
              />
              <StatCard
                icon={<Bot className="w-6 h-6" />}
                title="AI Agents"
                value={stats.totalAgents}
                subtitle={`${stats.runningAgents} running`}
                trend={8}
                color="blue"
              />
              <StatCard
                icon={<Workflow className="w-6 h-6" />}
                title="Workflows"
                value={stats.totalWorkflows}
                subtitle={`${stats.activeWorkflows} active`}
                trend={5}
                color="green"
              />
              <StatCard
                icon={<Webhook className="w-6 h-6" />}
                title="Webhooks"
                value={stats.totalWebhooks}
                subtitle="Active listeners"
                color="orange"
              />
            </div>

            {/* Usage Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                icon={<Activity className="w-6 h-6" />}
                title="API Requests"
                value={stats.totalRequestsThisMonth.toLocaleString()}
                subtitle="This month"
                color="blue"
              />
              <StatCard
                icon={<Cpu className="w-6 h-6" />}
                title="Tokens Used"
                value={stats.totalTokensThisMonth.toLocaleString()}
                subtitle="This month"
                color="purple"
              />
              <StatCard
                icon={<DollarSign className="w-6 h-6" />}
                title="Total Cost"
                value={`$${stats.totalCostThisMonth.toFixed(2)}`}
                subtitle="This month"
                color="green"
              />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition-all">
                  <Plus className="w-6 h-6 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">New App</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all">
                  <Bot className="w-6 h-6 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Deploy Agent</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-green-500 hover:bg-green-50 transition-all">
                  <Terminal className="w-6 h-6 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Open Sandbox</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-orange-500 hover:bg-orange-50 transition-all">
                  <Settings className="w-6 h-6 text-orange-600" />
                  <span className="text-sm font-medium text-gray-700">Settings</span>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Sandbox Runs</h3>
                <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                  View All →
                </button>
              </div>
              <div className="space-y-3">
                {data.sandboxRuns.slice(0, 5).map((run) => (
                  <div key={run.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        run.status === 'success' ? 'bg-green-500' :
                        run.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                      <div>
                        <p className="font-medium text-gray-900">{run.name}</p>
                        <p className="text-sm text-gray-500">{new Date(run.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">{run.duration}ms</span>
                      <button className="text-purple-600 hover:text-purple-700">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SDK Tools Tab */}
        {activeTab === 'sdk' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">SDK Applications</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <Plus className="w-5 h-5" />
                New App
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.apps.map((app) => (
                <div key={app.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{app.name}</h3>
                        <p className="text-sm text-gray-500">v{app.version}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      app.status === 'active' ? 'bg-green-100 text-green-700' :
                      app.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">{app.description}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        {app.downloads}
                      </span>
                      <span>⭐ {app.rating}/5</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Agents Tab */}
        {activeTab === 'agents' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">AI Agents</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-5 h-5" />
                Deploy Agent
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.agents.map((agent) => (
                <div key={agent.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        agent.status === 'running' ? 'bg-green-100' :
                        agent.status === 'stopped' ? 'bg-gray-100' : 'bg-red-100'
                      }`}>
                        <Bot className={`w-6 h-6 ${
                          agent.status === 'running' ? 'text-green-600' :
                          agent.status === 'stopped' ? 'text-gray-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                        <p className="text-sm text-gray-500">{agent.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {agent.status === 'running' ? (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-sm text-green-600 font-medium">Running</span>
                        </div>
                      ) : agent.status === 'stopped' ? (
                        <span className="text-sm text-gray-600 font-medium">Stopped</span>
                      ) : (
                        <span className="text-sm text-red-600 font-medium">Error</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Success Rate</span>
                      <span className="font-medium text-gray-900">{agent.successRate}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Last Run</span>
                      <span className="font-medium text-gray-900">
                        {new Date(agent.lastRun).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                    <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                      View Logs
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                      {agent.status === 'running' ? 'Stop' : 'Start'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sandbox Tab */}
        {activeTab === 'sandbox' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Code Sandbox</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={runSandboxCode}
                  disabled={sandboxRunning}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sandboxRunning ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Run Code
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Code Editor */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5" />
                    <span className="font-medium">Code Editor</span>
                  </div>
                  <select className="bg-gray-700 text-white px-3 py-1 rounded text-sm">
                    <option>JavaScript</option>
                    <option>Python</option>
                    <option>TypeScript</option>
                  </select>
                </div>
                <textarea
                  value={sandboxCode}
                  onChange={(e) => setSandboxCode(e.target.value)}
                  className="w-full h-96 p-4 font-mono text-sm bg-gray-50 border-none focus:outline-none resize-none"
                  placeholder="Write your code here..."
                />
              </div>

              {/* Output Console */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    <span className="font-medium">Output Console</span>
                  </div>
                  <button
                    onClick={() => setSandboxOutput('')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Clear
                  </button>
                </div>
                <div className="h-96 p-4 font-mono text-sm bg-gray-900 text-green-400 overflow-auto">
                  {sandboxOutput || 'No output yet. Run your code to see results.'}
                </div>
              </div>
            </div>

            {/* Recent Sandbox Runs */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Runs</h3>
              <div className="space-y-2">
                {data.sandboxRuns.slice(0, 10).map((run) => (
                  <div key={run.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        run.status === 'success' ? 'bg-green-500' :
                        run.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                      <span className="font-medium text-gray-900">{run.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{run.duration}ms</span>
                      <span>{new Date(run.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Marketplace Tab */}
        {activeTab === 'marketplace' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Developer Marketplace</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search marketplace..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Filter className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg" />
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      Premium
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2">Module {i + 1}</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Professional module for advanced functionality
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-purple-600">$49</span>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                      Install
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Analytics & Monitoring</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={<Activity className="w-6 h-6" />}
                title="Total Requests"
                value={stats.totalRequestsThisMonth.toLocaleString()}
                subtitle="This month"
                trend={15}
                color="blue"
              />
              <StatCard
                icon={<Cpu className="w-6 h-6" />}
                title="Tokens"
                value={stats.totalTokensThisMonth.toLocaleString()}
                subtitle="Consumed"
                trend={-5}
                color="purple"
              />
              <StatCard
                icon={<DollarSign className="w-6 h-6" />}
                title="Cost"
                value={`$${stats.totalCostThisMonth.toFixed(2)}`}
                subtitle="This month"
                trend={8}
                color="green"
              />
              <StatCard
                icon={<Clock className="w-6 h-6" />}
                title="Avg Response"
                value="245ms"
                subtitle="Response time"
                trend={-12}
                color="orange"
              />
            </div>

            {/* Usage Chart Placeholder */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">API Usage Over Time</h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">Chart visualization would go here</p>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Endpoints</h3>
                <div className="space-y-3">
                  {['/api/chat', '/api/completions', '/api/embeddings', '/api/search'].map((endpoint, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-gray-700">{endpoint}</span>
                      <span className="font-semibold text-gray-900">{Math.floor(Math.random() * 1000)}k</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Error Rate</h3>
                <div className="space-y-3">
                  {['200 OK', '400 Bad Request', '401 Unauthorized', '500 Server Error'].map((status, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-gray-700">{status}</span>
                      <span className="font-semibold text-gray-900">{i === 0 ? '99.8%' : '0.05%'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompleteDeveloperDashboard;
