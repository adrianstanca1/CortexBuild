import React, { useState, useEffect } from 'react';
import { Webhook, Plus, Trash2, Copy, CheckCircle, XCircle, Activity } from 'lucide-react';

interface WebhookConfig {
  id: number;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  secret: string;
  created_at: string;
  last_triggered_at: string;
}

interface WebhookLog {
  id: number;
  webhook_id: number;
  event_type: string;
  status: string;
  response_code: number;
  created_at: string;
}

export const WebhookManager: React.FC = () => {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchWebhooks();
    fetchLogs();
  }, []);

  const fetchWebhooks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/webhooks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setWebhooks(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch webhooks:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/webhooks/logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setLogs(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  };

  const createWebhook = async (webhookData: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/webhooks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(webhookData)
      });
      const data = await response.json();
      if (data.success) {
        fetchWebhooks();
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Failed to create webhook:', error);
    }
  };

  const deleteWebhook = async (webhookId: number) => {
    if (!confirm('Delete this webhook?')) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3001/api/webhooks/${webhookId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchWebhooks();
    } catch (error) {
      console.error('Failed to delete webhook:', error);
    }
  };

  const copySecret = (secret: string) => {
    navigator.clipboard.writeText(secret);
    alert('Secret copied to clipboard!');
  };

  const testWebhook = async (webhookId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/webhooks/${webhookId}/test`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        alert('Test webhook sent successfully!');
        fetchLogs();
      }
    } catch (error) {
      console.error('Failed to test webhook:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Webhook Management</h2>
          <p className="text-gray-600">Configure webhooks to receive real-time event notifications</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 inline mr-2" />
          Create Webhook
        </button>
      </div>

      {/* Webhooks List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Active Webhooks</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {webhooks.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Webhook className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No webhooks configured yet</p>
              <p className="text-sm mt-2">Create your first webhook to start receiving events</p>
            </div>
          ) : (
            webhooks.map(webhook => (
              <div key={webhook.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Webhook className="w-5 h-5 text-blue-600" />
                      <h4 className="text-lg font-semibold text-gray-900">{webhook.name}</h4>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        webhook.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {webhook.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">URL: {webhook.url}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Events: {webhook.events.join(', ')}</span>
                      {webhook.last_triggered_at && (
                        <span>Last triggered: {new Date(webhook.last_triggered_at).toLocaleString()}</span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center space-x-2">
                      <code className="px-2 py-1 bg-gray-100 text-xs rounded">
                        Secret: {webhook.secret.substring(0, 20)}...
                      </code>
                      <button
                        onClick={() => copySecret(webhook.secret)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => testWebhook(webhook.id)}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-sm"
                    >
                      Test
                    </button>
                    <button
                      onClick={() => deleteWebhook(webhook.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Webhook Logs */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Webhook Calls</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Webhook</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Response</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No webhook calls yet
                  </td>
                </tr>
              ) : (
                logs.map(log => {
                  const webhook = webhooks.find(w => w.id === log.webhook_id);
                  return (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {webhook?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.event_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {log.status === 'success' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.response_code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Webhook Modal */}
      {showCreateModal && (
        <CreateWebhookModal
          onClose={() => setShowCreateModal(false)}
          onCreate={createWebhook}
        />
      )}
    </div>
  );
};

// Create Webhook Modal
const CreateWebhookModal: React.FC<{ onClose: () => void; onCreate: (data: any) => void }> = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    events: [] as string[],
  });

  const availableEvents = [
    'project.created', 'project.updated', 'project.deleted',
    'invoice.created', 'invoice.paid', 'invoice.overdue',
    'client.created', 'client.updated',
    'task.created', 'task.completed'
  ];

  const toggleEvent = (event: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Webhook</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="https://your-domain.com/webhook"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Events to Subscribe</label>
            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {availableEvents.map(event => (
                <label key={event} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.events.includes(event)}
                    onChange={() => toggleEvent(event)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{event}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Webhook
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

