
import React, { useState, useEffect } from 'react';
import * as authService from '../../auth/authService';

interface Module {
  id: number;
  name: string;
  slug: string;
  description: string;
  version: string;
  status: string;
  repository_url: string;
}

interface ApiKey {
  id: number;
  name: string;
  key_prefix: string;
  last_used_at: string;
  is_active: boolean;
}

interface Webhook {
  id: number;
  url: string;
  events: string;
  is_active: boolean;
}

export const DeveloperDashboard: React.FC = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [modulesResponse, apiKeysResponse, webhooksResponse] = await Promise.all([
          authService.getDeveloperModules(),
          authService.getApiKeys(),
          authService.getWebhooks(),
        ]);
        setModules(modulesResponse.modules || []);
        setApiKeys(apiKeysResponse.apiKeys || []);
        setWebhooks(webhooksResponse.webhooks || []);
      } catch (error) {
        console.error('Failed to fetch developer data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold">Developer Dashboard</h1>
        <p className="mt-2 text-indigo-100">
          Welcome to your developer hub. Manage your modules, API keys, and webhooks.
        </p>
      </div>

      {/* My Modules Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">My Modules</h2>
        {loading ? (
          <p>Loading modules...</p>
        ) : modules.length === 0 ? (
          <p className="text-gray-600">You have not created any modules yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {modules.map((module) => (
              <li key={module.id} className="py-4 flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-gray-800">{module.name}</p>
                  <p className="text-sm text-gray-500">{module.description}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded">v{module.version}</span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${module.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {module.status}
                    </span>
                  </div>
                </div>
                <a href={module.repository_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  View Repository
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* API Keys Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">API Keys</h2>
        {loading ? (
          <p>Loading API keys...</p>
        ) : apiKeys.length === 0 ? (
          <p className="text-gray-600">You have not created any API keys yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {apiKeys.map((apiKey) => (
              <li key={apiKey.id} className="py-4 flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-gray-800">{apiKey.name}</p>
                  <p className="text-sm text-gray-500">Prefix: {apiKey.key_prefix}</p>
                  <p className="text-sm text-gray-500">Last used: {apiKey.last_used_at ? new Date(apiKey.last_used_at).toLocaleString() : 'Never'}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${apiKey.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {apiKey.is_active ? 'Active' : 'Inactive'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Webhooks Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Webhooks</h2>
        {loading ? (
          <p>Loading webhooks...</p>
        ) : webhooks.length === 0 ? (
          <p className="text-gray-600">You have not created any webhooks yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {webhooks.map((webhook) => (
              <li key={webhook.id} className="py-4 flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-gray-800">{webhook.url}</p>
                  <p className="text-sm text-gray-500">Events: {webhook.events}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${webhook.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {webhook.is_active ? 'Active' : 'Inactive'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
