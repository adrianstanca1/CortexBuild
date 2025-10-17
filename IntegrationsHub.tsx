import React, { useState, useEffect } from 'react';
import { Zap, Plus, Settings, Check, X, ExternalLink, Key, Webhook, Database, Mail, MessageSquare, Calendar, FileText, DollarSign, Users, Building } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  category: 'accounting' | 'communication' | 'storage' | 'crm' | 'other';
  description: string;
  icon: string;
  status: 'connected' | 'disconnected' | 'error';
  config?: any;
  connectedAt?: string;
  lastSync?: string;
}

const AVAILABLE_INTEGRATIONS = [
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    category: 'accounting',
    description: 'Sync invoices, expenses, and financial data',
    icon: '📊',
    color: 'green',
    features: ['Invoice sync', 'Expense tracking', 'Financial reports', 'Tax calculations']
  },
  {
    id: 'xero',
    name: 'Xero',
    category: 'accounting',
    description: 'Cloud accounting software integration',
    icon: '💰',
    color: 'blue',
    features: ['Real-time sync', 'Bank reconciliation', 'Invoicing', 'Payroll']
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'communication',
    description: 'Send notifications and updates to Slack channels',
    icon: '💬',
    color: 'purple',
    features: ['Channel notifications', 'Direct messages', 'File sharing', 'Bot commands']
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    category: 'communication',
    description: 'Integrate with Microsoft Teams workspace',
    icon: '🎯',
    color: 'blue',
    features: ['Team notifications', 'Chat integration', 'Meeting scheduling', 'File sync']
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    category: 'storage',
    description: 'Store and sync files with Google Drive',
    icon: '📁',
    color: 'yellow',
    features: ['File storage', 'Document sync', 'Shared folders', 'Real-time collaboration']
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    category: 'storage',
    description: 'Cloud file storage and sharing',
    icon: '📦',
    color: 'blue',
    features: ['File backup', 'Team folders', 'Version history', 'File requests']
  },
  {
    id: 'gmail',
    name: 'Gmail',
    category: 'communication',
    description: 'Send emails and manage communications',
    icon: '📧',
    color: 'red',
    features: ['Email sending', 'Template management', 'Automated replies', 'Contact sync']
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    category: 'communication',
    description: 'Email marketing and automation',
    icon: '🐵',
    color: 'yellow',
    features: ['Email campaigns', 'List management', 'Analytics', 'Automation']
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    category: 'crm',
    description: 'CRM and customer relationship management',
    icon: '☁️',
    color: 'blue',
    features: ['Contact management', 'Lead tracking', 'Opportunity pipeline', 'Reports']
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    category: 'crm',
    description: 'Marketing, sales, and service platform',
    icon: '🎪',
    color: 'orange',
    features: ['CRM', 'Marketing automation', 'Sales tools', 'Customer service']
  },
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'accounting',
    description: 'Payment processing and billing',
    icon: '💳',
    color: 'purple',
    features: ['Payment processing', 'Subscription billing', 'Invoicing', 'Analytics']
  },
  {
    id: 'zapier',
    name: 'Zapier',
    category: 'other',
    description: 'Connect with 5000+ apps via Zapier',
    icon: '⚡',
    color: 'orange',
    features: ['Workflow automation', 'Multi-app integration', 'Custom triggers', 'Data transformation']
  }
];

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret?: string;
  active: boolean;
  createdAt: string;
  lastTriggered?: string;
}

export const IntegrationsHub: React.FC<{ subscriptionTier: string }> = ({ subscriptionTier }) => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'integrations' | 'webhooks' | 'api-keys'>('integrations');
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // New webhook form
  const [newWebhook, setNewWebhook] = useState({
    name: '',
    url: '',
    events: [] as string[],
    secret: ''
  });

  // Integration config form
  const [integrationConfig, setIntegrationConfig] = useState<any>({});

  useEffect(() => {
    loadIntegrations();
    loadWebhooks();
    loadApiKeys();
  }, []);

  const loadIntegrations = async () => {
    try {
      const response = await fetch('/api/sdk/integrations', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setIntegrations(data);
      }
    } catch (error) {
      console.error('Failed to load integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWebhooks = async () => {
    try {
      const response = await fetch('/api/sdk/webhooks', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setWebhooks(data);
      }
    } catch (error) {
      console.error('Failed to load webhooks:', error);
    }
  };

  const loadApiKeys = async () => {
    try {
      const response = await fetch('/api/sdk/api-keys', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setApiKeys(data);
      }
    } catch (error) {
      console.error('Failed to load API keys:', error);
    }
  };

  const connectIntegration = async () => {
    try {
      const response = await fetch('/api/sdk/integrations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          integrationId: selectedIntegration.id,
          config: integrationConfig
        })
      });

      if (response.ok) {
        const integration = await response.json();
        setIntegrations([...integrations, integration]);
        setShowConnectModal(false);
        setSelectedIntegration(null);
        setIntegrationConfig({});
        alert('Integration connected successfully!');
      }
    } catch (error) {
      console.error('Failed to connect integration:', error);
      alert('Failed to connect integration');
    }
  };

  const disconnectIntegration = async (integrationId: string) => {
    if (!confirm('Are you sure you want to disconnect this integration?')) return;

    try {
      const response = await fetch(`/api/sdk/integrations/${integrationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        setIntegrations(integrations.filter(i => i.id !== integrationId));
      }
    } catch (error) {
      console.error('Failed to disconnect integration:', error);
    }
  };

  const createWebhook = async () => {
    try {
      const response = await fetch('/api/sdk/webhooks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newWebhook)
      });

      if (response.ok) {
        const webhook = await response.json();
        setWebhooks([...webhooks, webhook]);
        setShowWebhookModal(false);
        setNewWebhook({ name: '', url: '', events: [], secret: '' });
      }
    } catch (error) {
      console.error('Failed to create webhook:', error);
    }
  };

  const deleteWebhook = async (webhookId: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;

    try {
      const response = await fetch(`/api/sdk/webhooks/${webhookId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        setWebhooks(webhooks.filter(w => w.id !== webhookId));
      }
    } catch (error) {
      console.error('Failed to delete webhook:', error);
    }
  };

  const toggleWebhook = async (webhookId: string, active: boolean) => {
    try {
      const response = await fetch(`/api/sdk/webhooks/${webhookId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ active: !active })
      });

      if (response.ok) {
        setWebhooks(webhooks.map(w => w.id === webhookId ? { ...w, active: !active } : w));
      }
    } catch (error) {
      console.error('Failed to toggle webhook:', error);
    }
  };

  const createApiKey = async () => {
    try {
      const response = await fetch('/api/sdk/api-keys', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const apiKey = await response.json();
        setApiKeys([...apiKeys, apiKey]);
        setShowApiKeyModal(false);
        // Show the API key once (it won't be shown again)
        alert(`Your API Key: ${apiKey.key}\n\nPlease save this key securely. You won't be able to see it again!`);
      }
    } catch (error) {
      console.error('Failed to create API key:', error);
    }
  };

  const revokeApiKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This cannot be undone.')) return;

    try {
      const response = await fetch(`/api/sdk/api-keys/${keyId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        setApiKeys(apiKeys.filter(k => k.id !== keyId));
      }
    } catch (error) {
      console.error('Failed to revoke API key:', error);
    }
  };

  const categories = [
    { id: 'all', name: 'All', icon: Zap },
    { id: 'accounting', name: 'Accounting', icon: DollarSign },
    { id: 'communication', name: 'Communication', icon: MessageSquare },
    { id: 'storage', name: 'Storage', icon: Database },
    { id: 'crm', name: 'CRM', icon: Users },
    { id: 'other', name: 'Other', icon: Building }
  ];

  const filteredIntegrations = selectedCategory === 'all'
    ? AVAILABLE_INTEGRATIONS
    : AVAILABLE_INTEGRATIONS.filter(i => i.category === selectedCategory);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'disconnected': return 'text-gray-600 bg-gray-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const isConnected = (integrationId: string) => {
    return integrations.some(i => i.name.toLowerCase() === integrationId && i.status === 'connected');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Zap className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading integrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Zap className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold">Integrations Hub</h1>
              <p className="text-sm text-gray-600">{integrations.filter(i => i.status === 'connected').length} connected • {webhooks.length} webhooks</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mt-4">
          <button
            onClick={() => setActiveTab('integrations')}
            className={`pb-2 px-1 border-b-2 font-medium ${activeTab === 'integrations' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
          >
            Integrations
          </button>
          <button
            onClick={() => setActiveTab('webhooks')}
            className={`pb-2 px-1 border-b-2 font-medium ${activeTab === 'webhooks' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
          >
            Webhooks
          </button>
          <button
            onClick={() => setActiveTab('api-keys')}
            className={`pb-2 px-1 border-b-2 font-medium ${activeTab === 'api-keys' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
          >
            API Keys
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'integrations' && (
          <div className="space-y-6">
            {/* Category Filter */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {categories.map(cat => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap ${selectedCategory === cat.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Integrations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredIntegrations.map(integration => {
                const connected = isConnected(integration.id);
                return (
                  <div key={integration.id} className="bg-white rounded-xl p-6 border hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-4xl">{integration.icon}</div>
                        <div>
                          <h3 className="font-semibold">{integration.name}</h3>
                          <p className="text-xs text-gray-600 capitalize">{integration.category}</p>
                        </div>
                      </div>
                      {connected && (
                        <div className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium flex items-center space-x-1">
                          <Check className="w-3 h-3" />
                          <span>Connected</span>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-4">{integration.description}</p>

                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-700 mb-2">Features:</p>
                      <ul className="space-y-1">
                        {integration.features.slice(0, 3).map((feature, idx) => (
                          <li key={idx} className="text-xs text-gray-600 flex items-center space-x-1">
                            <Check className="w-3 h-3 text-green-600" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex space-x-2">
                      {connected ? (
                        <>
                          <button
                            onClick={() => {
                              const int = integrations.find(i => i.name.toLowerCase() === integration.id);
                              if (int) disconnectIntegration(int.id);
                            }}
                            className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium text-sm"
                          >
                            Disconnect
                          </button>
                          <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                            <Settings className="w-4 h-4" />
                            <span className="sr-only">Manage {integration.name} settings</span>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedIntegration(integration);
                            setShowConnectModal(true);
                          }}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'webhooks' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Webhooks</h2>
              <button
                onClick={() => setShowWebhookModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                <Plus className="w-5 h-5" />
                <span>Create Webhook</span>
              </button>
            </div>

            {webhooks.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center">
                <Webhook className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No webhooks configured</h3>
                <p className="text-gray-600 mb-6">Create webhooks to receive real-time notifications</p>
                <button
                  onClick={() => setShowWebhookModal(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Create Your First Webhook
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Events</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Triggered</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {webhooks.map(webhook => (
                      <tr key={webhook.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">{webhook.name}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">{webhook.url}</code>
                            <a href={webhook.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {webhook.events.slice(0, 2).map(event => (
                              <span key={event} className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs">
                                {event}
                              </span>
                            ))}
                            {webhook.events.length > 2 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                +{webhook.events.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${webhook.active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                            {webhook.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {webhook.lastTriggered ? new Date(webhook.lastTriggered).toLocaleString() : 'Never'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => toggleWebhook(webhook.id, webhook.active)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              {webhook.active ? 'Disable' : 'Enable'}
                            </button>
                            <button
                              onClick={() => deleteWebhook(webhook.id)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'api-keys' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">API Keys</h2>
              <button
                onClick={() => setShowApiKeyModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                <Plus className="w-5 h-5" />
                <span>Generate API Key</span>
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <Key className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">API Key Security</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Your API keys are encrypted and stored securely. Never share your API keys publicly.
                    If a key is compromised, revoke it immediately and generate a new one.
                  </p>
                </div>
              </div>
            </div>

            {apiKeys.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center">
                <Key className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No API keys generated</h3>
                <p className="text-gray-600 mb-6">Generate API keys to access the SDK programmatically</p>
                <button
                  onClick={() => setShowApiKeyModal(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Generate Your First API Key
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Used</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requests</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {apiKeys.map(key => (
                      <tr key={key.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {key.prefix}{'*'.repeat(32)}
                          </code>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(key.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {key.lastUsed ? new Date(key.lastUsed).toLocaleString() : 'Never'}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          {key.requestCount?.toLocaleString() || 0}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => revokeApiKey(key.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Revoke
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Connect Integration Modal */}
      {showConnectModal && selectedIntegration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">Connect {selectedIntegration.name}</h2>
              <p className="text-sm text-gray-600 mt-1">{selectedIntegration.description}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">API Key / Client ID</label>
                <input
                  type="password"
                  value={integrationConfig.apiKey || ''}
                  onChange={(e) => setIntegrationConfig({ ...integrationConfig, apiKey: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your API key or Client ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">API Secret (if required)</label>
                <input
                  type="password"
                  value={integrationConfig.apiSecret || ''}
                  onChange={(e) => setIntegrationConfig({ ...integrationConfig, apiSecret: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your API secret"
                />
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-600">
                  <strong>Need help?</strong> Visit the{' '}
                  <a href="#" className="text-blue-600 hover:underline">integration docs</a>
                  {' '}to learn how to get your API credentials.
                </p>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end space-x-3">
              <button
                onClick={() => { setShowConnectModal(false); setSelectedIntegration(null); setIntegrationConfig({}); }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={connectIntegration}
                disabled={!integrationConfig.apiKey}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Connect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Webhook Modal */}
      {showWebhookModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">Create Webhook</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Webhook Name</label>
                <input
                  type="text"
                  value={newWebhook.name}
                  onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Production Webhook"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Webhook URL</label>
                <input
                  type="url"
                  value={newWebhook.url}
                  onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://api.example.com/webhook"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Events</label>
                <div className="space-y-2">
                  {['agent.created', 'agent.executed', 'workflow.completed', 'integration.connected'].map(event => (
                    <label key={event} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newWebhook.events.includes(event)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewWebhook({ ...newWebhook, events: [...newWebhook.events, event] });
                          } else {
                            setNewWebhook({ ...newWebhook, events: newWebhook.events.filter(ev => ev !== event) });
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{event}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Secret (optional)</label>
                <input
                  type="text"
                  value={newWebhook.secret}
                  onChange={(e) => setNewWebhook({ ...newWebhook, secret: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="webhook_secret_key"
                />
                <p className="text-xs text-gray-600 mt-1">Used to sign webhook payloads for verification</p>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end space-x-3">
              <button
                onClick={() => { setShowWebhookModal(false); setNewWebhook({ name: '', url: '', events: [], secret: '' }); }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={createWebhook}
                disabled={!newWebhook.name || !newWebhook.url || newWebhook.events.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Create Webhook
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">Generate API Key</h2>
            </div>
            <div className="p-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <Key className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">Important</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Your API key will only be shown once. Make sure to copy and save it securely.
                      You won't be able to see it again!
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                This API key will have full access to your SDK resources. Use it to authenticate API requests.
              </p>
            </div>
            <div className="p-6 border-t flex justify-end space-x-3">
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={createApiKey}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Generate API Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
