import React, { useState, useEffect } from 'react';
import { Code, Package, Zap, Book, Settings, Play, CheckCircle, XCircle } from 'lucide-react';

interface InstalledModule {
  id: number;
  module_id: number;
  name: string;
  description: string;
  version: string;
  category: string;
  is_active: boolean;
  config: string;
  installed_at: string;
}

export const DeveloperPlatform: React.FC = () => {
  const [installedModules, setInstalledModules] = useState<InstalledModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'modules' | 'api' | 'webhooks'>('overview');

  useEffect(() => {
    fetchInstalledModules();
  }, []);

  const fetchInstalledModules = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/marketplace/installed', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setInstalledModules(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch installed modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleModuleStatus = async (moduleId: number, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/marketplace/configure/${moduleId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ config: { is_active: !currentStatus } })
      });

      if (response.ok) {
        fetchInstalledModules();
      }
    } catch (error) {
      console.error('Failed to toggle module status:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Developer Platform</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Code className="w-4 h-4" />
          <span>Module Management & API Tools</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Package },
            { id: 'modules', label: 'Installed Modules', icon: Zap },
            { id: 'api', label: 'API Documentation', icon: Book },
            { id: 'webhooks', label: 'Webhooks', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
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

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Installed Modules</h3>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{installedModules.length}</p>
            <p className="text-sm text-gray-500 mt-2">
              {installedModules.filter(m => m.is_active).length} active
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">API Endpoints</h3>
              <Code className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">13</p>
            <p className="text-sm text-gray-500 mt-2">Core + Module APIs</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Webhooks</h3>
              <Zap className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-500 mt-2">No webhooks configured</p>
          </div>
        </div>
      )}

      {/* Installed Modules Tab */}
      {activeTab === 'modules' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Installed Modules</h3>
            <p className="text-sm text-gray-600 mt-1">Manage and configure your installed modules</p>
          </div>
          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading modules...</div>
            ) : installedModules.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No modules installed yet. Visit the Marketplace to install modules.
              </div>
            ) : (
              installedModules.map(module => (
                <div key={module.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">{module.name}</h4>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          module.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {module.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{module.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Version: {module.version}</span>
                        <span>•</span>
                        <span>Category: {module.category}</span>
                        <span>•</span>
                        <span>Installed: {new Date(module.installed_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => toggleModuleStatus(module.module_id, module.is_active)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          module.is_active
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {module.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Configure
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* API Documentation Tab */}
      {activeTab === 'api' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">API Documentation</h3>
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Marketplace API</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 font-mono text-xs rounded">GET</span>
                  <code className="text-gray-700">/api/marketplace/modules</code>
                  <span className="text-gray-500">- Browse available modules</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 font-mono text-xs rounded">POST</span>
                  <code className="text-gray-700">/api/marketplace/install</code>
                  <span className="text-gray-500">- Install a module</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-red-100 text-red-800 font-mono text-xs rounded">DELETE</span>
                  <code className="text-gray-700">/api/marketplace/uninstall/:id</code>
                  <span className="text-gray-500">- Uninstall a module</span>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Widgets API</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 font-mono text-xs rounded">GET</span>
                  <code className="text-gray-700">/api/widgets/dashboards</code>
                  <span className="text-gray-500">- Get user dashboards</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 font-mono text-xs rounded">POST</span>
                  <code className="text-gray-700">/api/widgets/add</code>
                  <span className="text-gray-500">- Add widget to dashboard</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 font-mono text-xs rounded">PUT</span>
                  <code className="text-gray-700">/api/widgets/:id</code>
                  <span className="text-gray-500">- Update widget configuration</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Webhooks Tab */}
      {activeTab === 'webhooks' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Webhooks</h3>
              <p className="text-sm text-gray-600 mt-1">Configure webhooks to receive real-time events</p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Create Webhook
            </button>
          </div>
          <div className="text-center py-12 text-gray-500">
            <Zap className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No webhooks configured yet</p>
            <p className="text-sm mt-2">Create your first webhook to start receiving events</p>
          </div>
        </div>
      )}
    </div>
  );
};

