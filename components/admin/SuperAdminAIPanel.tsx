import React, { useState, useEffect } from 'react';
import { Shield, Database, Code, Zap, Activity, Lock, Key, Terminal, Users, Building2, Package, TrendingUp, AlertCircle, Cpu, Server } from 'lucide-react';

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalCompanies: number;
  totalProjects: number;
  apiCalls24h: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

export const SuperAdminAIPanel: React.FC = () => {
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalCompanies: 0,
    totalProjects: 0,
    apiCalls24h: 0,
    systemHealth: 'healthy'
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'ai' | 'sdk' | 'monitoring'>('overview');

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setStats({
          totalUsers: data.totalUsers?.count || 0,
          activeUsers: data.activeUsers?.count || 0,
          totalCompanies: data.totalCompanies?.count || 0,
          totalProjects: data.totalProjects?.count || 0,
          apiCalls24h: data.apiCalls24h || 0,
          systemHealth: data.systemHealth || 'healthy'
        });
      }
    } catch (error) {
      console.error('Failed to fetch system stats:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Super Admin Header */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">Super Admin Control Panel</h2>
            <p className="text-red-100">Full system access and AI platform management</p>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <Users className="w-6 h-6 mb-2" />
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <div className="text-sm text-red-100">Total Users</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <Building2 className="w-6 h-6 mb-2" />
            <div className="text-2xl font-bold">{stats.totalCompanies}</div>
            <div className="text-sm text-red-100">Companies</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <Package className="w-6 h-6 mb-2" />
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <div className="text-sm text-red-100">Projects</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <Activity className="w-6 h-6 mb-2" />
            <div className="text-2xl font-bold">{stats.apiCalls24h}</div>
            <div className="text-sm text-red-100">API Calls (24h)</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'System Overview', icon: TrendingUp },
              { id: 'ai', label: 'AI Platform', icon: Cpu },
              { id: 'sdk', label: 'SDK & Developer', icon: Code },
              { id: 'monitoring', label: 'Real-time Monitoring', icon: Activity }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">System Health & Performance</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-800">System Status</span>
                    <Server className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-900">Healthy</div>
                  <div className="text-xs text-green-600 mt-1">All systems operational</div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-800">Database</span>
                    <Database className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-900">Online</div>
                  <div className="text-xs text-blue-600 mt-1">SQLite connected</div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-purple-800">AI Services</span>
                    <Cpu className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-purple-900">Active</div>
                  <div className="text-xs text-purple-600 mt-1">GPT-4 Turbo ready</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Recent System Events</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">System started successfully</span>
                    <span className="text-gray-400 ml-auto">2 hours ago</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600">Database backup completed</span>
                    <span className="text-gray-400 ml-auto">5 hours ago</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-600">AI model updated</span>
                    <span className="text-gray-400 ml-auto">1 day ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">AI Platform Management</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Cpu className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">AI Models</h4>
                      <p className="text-sm text-gray-600">Manage AI capabilities</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">GPT-4 Turbo</span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Active</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Gemini Pro</span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Active</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Claude 3</span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Active</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                      <Key className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">API Keys</h4>
                      <p className="text-sm text-gray-600">Multi-key load balancing</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Primary Key</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">In Use</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Legacy Key</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">Backup</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">SDK User Key</span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Active</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-800 mb-1">AI Usage Monitoring</h4>
                    <p className="text-sm text-yellow-700">Track token usage, costs, and performance across all AI models. Set limits and alerts for budget control.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sdk' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">SDK & Developer Platform</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-teal-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                      <Code className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">SDK Environment</h4>
                      <p className="text-sm text-gray-600">Developer sandbox</p>
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Live code editor with syntax highlighting</li>
                    <li>• Real-time API testing</li>
                    <li>• Module development tools</li>
                    <li>• Deployment pipeline</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                      <Terminal className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">API Documentation</h4>
                      <p className="text-sm text-gray-600">Complete API reference</p>
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• 70+ REST API endpoints</li>
                    <li>• WebSocket real-time API</li>
                    <li>• AI integration endpoints</li>
                    <li>• Authentication & security</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'monitoring' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Real-time System Monitoring</h3>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-800">Active Users</h4>
                  <span className="text-2xl font-bold text-blue-600">{stats.activeUsers}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                    style={{ width: `${(stats.activeUsers / stats.totalUsers) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {stats.activeUsers} of {stats.totalUsers} users currently active
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">WebSocket</span>
                    <Activity className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="text-xl font-bold text-gray-900">Connected</div>
                  <div className="text-xs text-gray-500 mt-1">Real-time sync active</div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">API Health</span>
                    <Zap className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div className="text-xl font-bold text-gray-900">99.9%</div>
                  <div className="text-xs text-gray-500 mt-1">Uptime last 30 days</div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Response Time</span>
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="text-xl font-bold text-gray-900">45ms</div>
                  <div className="text-xs text-gray-500 mt-1">Average response</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

