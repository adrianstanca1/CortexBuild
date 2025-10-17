import React, { useState } from 'react';
import { Clock, Webhook, Database, Users, Calendar, Globe, Settings, Code, Copy, Eye, EyeOff } from 'lucide-react';

interface TriggerConfig {
  id: string;
  type: 'schedule' | 'webhook' | 'database' | 'user_action' | 'api' | 'manual';
  name: string;
  description: string;
  config: Record<string, any>;
  isActive: boolean;
}

interface WorkflowTriggerConfigProps {
  trigger?: TriggerConfig;
  onSave: (config: TriggerConfig) => void;
  onCancel: () => void;
}

export const WorkflowTriggerConfig: React.FC<WorkflowTriggerConfigProps> = ({
  trigger,
  onSave,
  onCancel
}) => {
  const [config, setConfig] = useState<TriggerConfig>(trigger || {
    id: `trigger-${Date.now()}`,
    type: 'schedule',
    name: 'New Trigger',
    description: '',
    config: {},
    isActive: true
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const fieldId = (suffix: string) => `${config.id}-${suffix}`;

  const updateConfig = (field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [field]: value
      }
    }));
  };

  const renderScheduleTrigger = () => (
    <div className="space-y-4">
      <div>
        <label htmlFor={fieldId('scheduleType')} className="block text-sm font-medium text-gray-700 mb-2">Schedule Type</label>
        <select
          id={fieldId('scheduleType')}
          value={config.config.schedule || 'daily'}
          onChange={(e) => updateConfig('schedule', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          aria-label="Schedule type"
          title="Schedule type"
        >
          <option value="once">Run Once</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="custom">Custom Cron</option>
        </select>
      </div>

      {config.config.schedule !== 'custom' && (
        <div>
          <label htmlFor={fieldId('scheduleTime')} className="block text-sm font-medium text-gray-700 mb-2">Time</label>
          <input
            id={fieldId('scheduleTime')}
            type="time"
            value={config.config.time || '09:00'}
            onChange={(e) => updateConfig('time', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            aria-label="Trigger time"
            title="Trigger time"
          />
        </div>
      )}

      {config.config.schedule === 'weekly' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Days of Week</label>
          <div className="grid grid-cols-7 gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
              <label key={day} className="flex items-center">
                <input
                  type="checkbox"
                  checked={(config.config.days || []).includes(index)}
                  onChange={(e) => {
                    const days = config.config.days || [];
                    if (e.target.checked) {
                      updateConfig('days', [...days, index]);
                    } else {
                      updateConfig('days', days.filter((d: number) => d !== index));
                    }
                  }}
                  className="mr-1"
                />
                <span className="text-sm">{day}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {config.config.schedule === 'monthly' && (
        <div>
          <label htmlFor={fieldId('monthlyDay')} className="block text-sm font-medium text-gray-700 mb-2">Day of Month</label>
          <input
            id={fieldId('monthlyDay')}
            type="number"
            min="1"
            max="31"
            value={config.config.dayOfMonth || 1}
            onChange={(e) => updateConfig('dayOfMonth', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {config.config.schedule === 'custom' && (
        <div>
          <label htmlFor={fieldId('cronExpression')} className="block text-sm font-medium text-gray-700 mb-2">Cron Expression</label>
          <input
            id={fieldId('cronExpression')}
            type="text"
            placeholder="0 9 * * 1-5"
            value={config.config.cronExpression || ''}
            onChange={(e) => updateConfig('cronExpression', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-sm text-gray-500 mt-1">
            Format: minute hour day month day-of-week
          </p>
        </div>
      )}

      <div>
        <label htmlFor={fieldId('timezone')} className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
        <select
          id={fieldId('timezone')}
          value={config.config.timezone || 'UTC'}
          onChange={(e) => updateConfig('timezone', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="UTC">UTC</option>
          <option value="America/New_York">Eastern Time</option>
          <option value="America/Chicago">Central Time</option>
          <option value="America/Denver">Mountain Time</option>
          <option value="America/Los_Angeles">Pacific Time</option>
          <option value="Europe/London">London</option>
          <option value="Europe/Paris">Paris</option>
          <option value="Asia/Tokyo">Tokyo</option>
        </select>
      </div>
    </div>
  );

  const renderWebhookTrigger = () => (
    <div className="space-y-4">
      <div>
        <label htmlFor={fieldId('httpMethod')} className="block text-sm font-medium text-gray-700 mb-2">HTTP Method</label>
        <select
          id={fieldId('httpMethod')}
          value={config.config.method || 'POST'}
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
        <label htmlFor={fieldId('webhookPath')} className="block text-sm font-medium text-gray-700 mb-2">Webhook Path</label>
        <div className="flex">
          <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-lg">
            /webhook/
          </span>
          <input
            id={fieldId('webhookPath')}
            type="text"
            placeholder="my-trigger"
            value={config.config.path || ''}
            onChange={(e) => updateConfig('path', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Full URL: https://api.cortexbuild.com/webhook/{config.config.path || 'my-trigger'}
        </p>
      </div>

      <div>
        <label htmlFor={fieldId('authentication')} className="block text-sm font-medium text-gray-700 mb-2">Authentication</label>
        <select
          id={fieldId('authentication')}
          value={config.config.authentication || 'none'}
          onChange={(e) => updateConfig('authentication', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="none">None</option>
          <option value="api_key">API Key</option>
          <option value="bearer_token">Bearer Token</option>
          <option value="basic_auth">Basic Auth</option>
        </select>
      </div>

      {config.config.authentication === 'api_key' && (
        <div>
          <label htmlFor={fieldId('apiKeyHeader')} className="block text-sm font-medium text-gray-700 mb-2">API Key Header</label>
          <input
            id={fieldId('apiKeyHeader')}
            type="text"
            placeholder="X-API-Key"
            value={config.config.apiKeyHeader || 'X-API-Key'}
            onChange={(e) => updateConfig('apiKeyHeader', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      <div>
        <label htmlFor={fieldId('contentType')} className="block text-sm font-medium text-gray-700 mb-2">Expected Content Type</label>
        <select
          id={fieldId('contentType')}
          value={config.config.contentType || 'application/json'}
          onChange={(e) => updateConfig('contentType', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="application/json">JSON</option>
          <option value="application/x-www-form-urlencoded">Form Data</option>
          <option value="text/plain">Plain Text</option>
          <option value="application/xml">XML</option>
        </select>
      </div>
    </div>
  );

  const renderDatabaseTrigger = () => (
    <div className="space-y-4">
      <div>
        <label htmlFor={fieldId('table')} className="block text-sm font-medium text-gray-700 mb-2">Table</label>
        <select
          id={fieldId('table')}
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
        <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
        <div className="space-y-2">
          {['insert', 'update', 'delete'].map(event => (
            <label key={event} className="flex items-center">
              <input
                type="checkbox"
                checked={(config.config.events || []).includes(event)}
                onChange={(e) => {
                  const events = config.config.events || [];
                  if (e.target.checked) {
                    updateConfig('events', [...events, event]);
                  } else {
                    updateConfig('events', events.filter((ev: string) => ev !== event));
                  }
                }}
                className="mr-2"
              />
              <span className="capitalize">{event}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor={fieldId('conditions')} className="block text-sm font-medium text-gray-700 mb-2">Conditions (Optional)</label>
        <textarea
          id={fieldId('conditions')}
          placeholder="WHERE status = 'active' AND priority = 'high'"
          value={config.config.conditions || ''}
          onChange={(e) => updateConfig('conditions', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-sm text-gray-500 mt-1">
          SQL WHERE clause conditions (without WHERE keyword)
        </p>
      </div>
    </div>
  );

  const renderUserActionTrigger = () => (
    <div className="space-y-4">
      <div>
        <label htmlFor={fieldId('actionType')} className="block text-sm font-medium text-gray-700 mb-2">Action Type</label>
        <select
          id={fieldId('actionType')}
          value={config.config.action || 'login'}
          onChange={(e) => updateConfig('action', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="login">User Login</option>
          <option value="logout">User Logout</option>
          <option value="register">User Registration</option>
          <option value="project_create">Project Created</option>
          <option value="task_complete">Task Completed</option>
          <option value="document_upload">Document Uploaded</option>
          <option value="payment_received">Payment Received</option>
        </select>
      </div>

      <div>
        <label htmlFor={fieldId('userRole')} className="block text-sm font-medium text-gray-700 mb-2">User Role Filter</label>
        <select
          id={fieldId('userRole')}
          value={config.config.userRole || 'any'}
          onChange={(e) => updateConfig('userRole', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="any">Any Role</option>
          <option value="super_admin">Super Admin</option>
          <option value="company_admin">Company Admin</option>
          <option value="project_manager">Project Manager</option>
          <option value="supervisor">Supervisor</option>
          <option value="operative">Operative</option>
        </select>
      </div>

      <div>
        <label htmlFor={fieldId('companyFilter')} className="block text-sm font-medium text-gray-700 mb-2">Company Filter (Optional)</label>
        <input
          id={fieldId('companyFilter')}
          type="text"
          placeholder="Leave empty for all companies"
          value={config.config.companyId || ''}
          onChange={(e) => updateConfig('companyId', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );

  const getTriggerIcon = () => {
    switch (config.type) {
      case 'schedule': return Clock;
      case 'webhook': return Webhook;
      case 'database': return Database;
      case 'user_action': return Users;
      case 'api': return Globe;
      default: return Settings;
    }
  };

  const TriggerIcon = getTriggerIcon();

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-2xl mx-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TriggerIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Configure Trigger</h3>
            <p className="text-sm text-gray-500">Set up when this workflow should run</p>
          </div>
        </div>

        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trigger Type</label>
            <select
              value={config.type}
              onChange={(e) => setConfig(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="schedule">Schedule</option>
              <option value="webhook">Webhook</option>
              <option value="database">Database Event</option>
              <option value="user_action">User Action</option>
              <option value="manual">Manual</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={config.name}
              onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter trigger name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={config.description}
              onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Describe what this trigger does"
            />
          </div>
        </div>
      </div>

      {/* Configuration */}
      <div className="p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Trigger Configuration</h4>

        {config.type === 'schedule' && renderScheduleTrigger()}
        {config.type === 'webhook' && renderWebhookTrigger()}
        {config.type === 'database' && renderDatabaseTrigger()}
        {config.type === 'user_action' && renderUserActionTrigger()}
        {config.type === 'manual' && (
          <div className="text-center py-8">
            <Settings className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Manual triggers require no configuration</p>
            <p className="text-sm text-gray-400 mt-1">This workflow will only run when manually triggered</p>
          </div>
        )}

        {/* Advanced Settings */}
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
                  Trigger is active
                </label>
              </div>

              <div>
                <label htmlFor={fieldId('maxExecutions')} className="block text-sm font-medium text-gray-700 mb-2">Max Executions per Hour</label>
                <input
                  id={fieldId('maxExecutions')}
                  type="number"
                  min="1"
                  max="1000"
                  value={config.config.maxExecutionsPerHour || 60}
                  onChange={(e) => updateConfig('maxExecutionsPerHour', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor={fieldId('timeout')} className="block text-sm font-medium text-gray-700 mb-2">Timeout (seconds)</label>
                <input
                  id={fieldId('timeout')}
                  type="number"
                  min="1"
                  max="3600"
                  value={config.config.timeout || 300}
                  onChange={(e) => updateConfig('timeout', parseInt(e.target.value))}
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
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Save Trigger
        </button>
      </div>
    </div>
  );
};
