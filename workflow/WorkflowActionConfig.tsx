import React, { useState } from 'react';
import {
  Mail, Zap, Database, Building2, CheckCircle, MessageSquare,
  FileText, Code, Settings, Plus, Trash2, Eye, EyeOff, Copy,
  Smartphone, Globe, HardDrive, Users, Calendar
} from 'lucide-react';

interface ActionConfig {
  id: string;
  type: 'email' | 'sms' | 'api_call' | 'database' | 'slack' | 'create_project' | 'assign_task' | 'webhook' | 'file_operation';
  name: string;
  description: string;
  config: Record<string, any>;
  isActive: boolean;
  retryConfig?: {
    maxRetries: number;
    retryDelay: number;
    backoffMultiplier: number;
  };
}

interface WorkflowActionConfigProps {
  action?: ActionConfig;
  onSave: (config: ActionConfig) => void;
  onCancel: () => void;
  availableVariables?: string[];
}

export const WorkflowActionConfig: React.FC<WorkflowActionConfigProps> = ({
  action,
  onSave,
  onCancel,
  availableVariables = []
}) => {
  const [config, setConfig] = useState<ActionConfig>(action || {
    id: `action-${Date.now()}`,
    type: 'email',
    name: 'New Action',
    description: '',
    config: {},
    isActive: true,
    retryConfig: {
      maxRetries: 3,
      retryDelay: 5,
      backoffMultiplier: 2
    }
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showVariables, setShowVariables] = useState(false);

  const updateConfig = (field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [field]: value
      }
    }));
  };

  const addHeader = () => {
    const headers = config.config.headers || {};
    const newKey = `header-${Object.keys(headers).length + 1}`;
    updateConfig('headers', { ...headers, [newKey]: '' });
  };

  const removeHeader = (key: string) => {
    const headers = { ...config.config.headers };
    delete headers[key];
    updateConfig('headers', headers);
  };

  const renderEmailAction = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">To (Email Address)</label>
        <input
          type="email"
          value={config.config.to || ''}
          onChange={(e) => updateConfig('to', e.target.value)}
          placeholder="recipient@example.com or {{user.email}}"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
        <input
          type="text"
          value={config.config.subject || ''}
          onChange={(e) => updateConfig('subject', e.target.value)}
          placeholder="Email subject"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="emailTemplate">
          Email Template
        </label>
        <select
          id="emailTemplate"
          value={config.config.template || 'default'}
          onChange={(e) => updateConfig('template', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="default">Default Template</option>
          <option value="notification">Notification Template</option>
          <option value="welcome">Welcome Template</option>
          <option value="reminder">Reminder Template</option>
          <option value="custom">Custom HTML</option>
        </select>
      </div>

      {config.config.template === 'custom' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">HTML Content</label>
          <textarea
            value={config.config.htmlContent || ''}
            onChange={(e) => updateConfig('htmlContent', e.target.value)}
            rows={6}
            placeholder="<html><body>Your email content here</body></html>"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Message Body</label>
        <textarea
          value={config.config.body || ''}
          onChange={(e) => updateConfig('body', e.target.value)}
          rows={4}
          placeholder="Email message content. Use {{variable}} for dynamic content."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );

  const renderApiCallAction = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="httpMethod">
          HTTP Method
        </label>
        <select
          id="httpMethod"
          value={config.config.method || 'GET'}
          onChange={(e) => updateConfig('method', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="PATCH">PATCH</option>
          <option value="DELETE">DELETE</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
        <input
          type="url"
          value={config.config.url || ''}
          onChange={(e) => updateConfig('url', e.target.value)}
          placeholder="https://api.example.com/endpoint"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Headers</label>
        <div className="space-y-2">
          {Object.entries(config.config.headers || {}).map(([key, value]) => (
            <div key={key} className="flex space-x-2">
              <input
                type="text"
                value={key}
                onChange={(e) => {
                  const headers = { ...config.config.headers };
                  delete headers[key];
                  headers[e.target.value] = value;
                  updateConfig('headers', headers);
                }}
                placeholder="Header name"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={value as string}
                onChange={(e) => {
                  const headers = { ...config.config.headers };
                  headers[key] = e.target.value;
                  updateConfig('headers', headers);
                }}
                placeholder="Header value"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => removeHeader(key)}
                aria-label={`Remove header ${key}`}
                className="px-3 py-2 text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            onClick={addHeader}
            className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:text-blue-800"
          >
            <Plus className="w-4 h-4" />
            <span>Add Header</span>
          </button>
        </div>
      </div>

      {['POST', 'PUT', 'PATCH'].includes(config.config.method) && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Request Body</label>
          <textarea
            value={config.config.body || ''}
            onChange={(e) => updateConfig('body', e.target.value)}
            rows={4}
            placeholder='{"key": "value"} or use {{variables}}'
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Timeout (seconds)</label>
        <input
          type="number"
          min="1"
          max="300"
          value={config.config.timeout || 30}
          onChange={(e) => updateConfig('timeout', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );

  const renderDatabaseAction = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="tableSelect">
          Table
        </label>
        <select
          id="tableSelect"
          value={config.config.table || ''}
          onChange={(e) => updateConfig('table', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select table...</option>
          <option value="projects">Projects</option>
          <option value="tasks">Tasks</option>
          <option value="users">Users</option>
          <option value="companies">Companies</option>
          <option value="clients">Clients</option>
          <option value="documents">Documents</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="dbAction">
          Action
        </label>
        <select
          id="dbAction"
          value={config.config.action || 'insert'}
          onChange={(e) => updateConfig('action', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="insert">Insert Record</option>
          <option value="update">Update Record</option>
          <option value="delete">Delete Record</option>
          <option value="upsert">Insert or Update</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Data (JSON)</label>
        <textarea
          value={config.config.data || ''}
          onChange={(e) => updateConfig('data', e.target.value)}
          rows={4}
          placeholder='{"name": "{{project.name}}", "status": "active"}'
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
        />
      </div>

      {['update', 'delete'].includes(config.config.action) && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Where Conditions</label>
          <textarea
            value={config.config.conditions || ''}
            onChange={(e) => updateConfig('conditions', e.target.value)}
            rows={2}
            placeholder='{"id": "{{record.id}}"}'
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
        </div>
      )}
    </div>
  );

  const renderSlackAction = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Slack Channel</label>
        <input
          type="text"
          value={config.config.channel || ''}
          onChange={(e) => updateConfig('channel', e.target.value)}
          placeholder="#general or @username"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
        <textarea
          value={config.config.message || ''}
          onChange={(e) => updateConfig('message', e.target.value)}
          rows={3}
          placeholder="Your Slack message here. Use {{variables}} for dynamic content."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
        <input
          type="url"
          value={config.config.webhookUrl || ''}
          onChange={(e) => updateConfig('webhookUrl', e.target.value)}
          placeholder="https://hooks.slack.com/services/..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="slackMentions"
          checked={config.config.allowMentions || false}
          onChange={(e) => updateConfig('allowMentions', e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="slackMentions" className="text-sm text-gray-700">
          Allow @mentions in message
        </label>
      </div>
    </div>
  );

  const renderCreateProjectAction = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
        <input
          type="text"
          value={config.config.name || ''}
          onChange={(e) => updateConfig('name', e.target.value)}
          placeholder="Project name or {{variable}}"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          value={config.config.description || ''}
          onChange={(e) => updateConfig('description', e.target.value)}
          rows={3}
          placeholder="Project description"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Client ID</label>
        <input
          type="text"
          value={config.config.clientId || ''}
          onChange={(e) => updateConfig('clientId', e.target.value)}
          placeholder="Client ID or {{client.id}}"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="projectTemplate">
          Project Template
        </label>
        <select
          id="projectTemplate"
          value={config.config.template || 'default'}
          onChange={(e) => updateConfig('template', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="default">Default Project</option>
          <option value="residential">Residential Construction</option>
          <option value="commercial">Commercial Construction</option>
          <option value="renovation">Renovation Project</option>
          <option value="infrastructure">Infrastructure Project</option>
        </select>
      </div>
    </div>
  );

  const getActionIcon = () => {
    switch (config.type) {
      case 'email': return Mail;
      case 'sms': return Smartphone;
      case 'api_call': return Zap;
      case 'database': return Database;
      case 'slack': return MessageSquare;
      case 'create_project': return Building2;
      case 'assign_task': return CheckCircle;
      case 'webhook': return Globe;
      case 'file_operation': return FileText;
      default: return Settings;
    }
  };

  const ActionIcon = getActionIcon();

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-2xl mx-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <ActionIcon className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Configure Action</h3>
            <p className="text-sm text-gray-500">Set up what this workflow should do</p>
          </div>
        </div>

        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="actionType">
              Action Type
            </label>
            <select
              id="actionType"
              value={config.type}
              onChange={(e) => setConfig(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="email">Send Email</option>
              <option value="sms">Send SMS</option>
              <option value="api_call">API Call</option>
              <option value="database">Database Action</option>
              <option value="slack">Slack Notification</option>
              <option value="create_project">Create Project</option>
              <option value="assign_task">Assign Task</option>
              <option value="webhook">Webhook</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={config.name}
              onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter action name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={config.description}
              onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Describe what this action does"
            />
          </div>
        </div>
      </div>

      {/* Configuration */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-medium text-gray-900">Action Configuration</h4>
          {availableVariables.length > 0 && (
            <button
              onClick={() => setShowVariables(!showVariables)}
              className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800"
            >
              <Code className="w-4 h-4" />
              <span>Variables</span>
            </button>
          )}
        </div>

        {showVariables && availableVariables.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-2">Available Variables:</p>
            <div className="flex flex-wrap gap-2">
              {availableVariables.map(variable => (
                <span
                  key={variable}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded cursor-pointer hover:bg-blue-200"
                  onClick={() => navigator.clipboard.writeText(`{{${variable}}}`)}
                >
                  {`{{${variable}}}`}
                </span>
              ))}
            </div>
          </div>
        )}

        {config.type === 'email' && renderEmailAction()}
        {config.type === 'api_call' && renderApiCallAction()}
        {config.type === 'database' && renderDatabaseAction()}
        {config.type === 'slack' && renderSlackAction()}
        {config.type === 'create_project' && renderCreateProjectAction()}

        {/* Retry Configuration */}
        <div className="mt-6">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800"
          >
            {showAdvanced ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Settings</span>
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={config.isActive}
                  onChange={(e) => setConfig(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="mr-2"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Action is active
                </label>
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-2"
                  htmlFor="retryConfigMaxRetries"
                >
                  Max Retries
                </label>
                <input
                  id="retryConfigMaxRetries"
                  type="number"
                  min="0"
                  max="10"
                  value={config.retryConfig?.maxRetries || 3}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    retryConfig: {
                      ...prev.retryConfig!,
                      maxRetries: parseInt(e.target.value)
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-2"
                  htmlFor="retryConfigDelay"
                >
                  Retry Delay (seconds)
                </label>
                <input
                  id="retryConfigDelay"
                  type="number"
                  min="1"
                  max="300"
                  value={config.retryConfig?.retryDelay || 5}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    retryConfig: {
                      ...prev.retryConfig!,
                      retryDelay: parseInt(e.target.value)
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(config)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Save Action
        </button>
      </div>
    </div>
  );
};
