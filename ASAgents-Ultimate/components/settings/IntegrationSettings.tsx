import React, { useState } from 'react';
import { User } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Plug, MessageSquare, Mail, Calendar, Database, Key } from 'lucide-react';

interface IntegrationSettingsProps {
  settings: {
    slack: { enabled: boolean; webhook: string };
    email: { enabled: boolean; smtp: any };
    calendar: { enabled: boolean; provider: string };
    storage: { enabled: boolean; provider: string };
  };
  onUpdate: (settings: any) => void;
  user: User;
}

export const IntegrationSettings: React.FC<IntegrationSettingsProps> = ({
  settings,
  onUpdate,
  user,
}) => {
  const [formData, setFormData] = useState(settings);

  const handleIntegrationToggle = (integration: string, enabled: boolean) => {
    const updatedData = {
      ...formData,
      [integration]: { ...formData[integration as keyof typeof formData], enabled }
    };
    setFormData(updatedData);
    onUpdate(updatedData);
  };

  const handleIntegrationUpdate = (integration: string, field: string, value: any) => {
    const updatedData = {
      ...formData,
      [integration]: { ...formData[integration as keyof typeof formData], [field]: value }
    };
    setFormData(updatedData);
    onUpdate(updatedData);
  };

  return (
    <div className="space-y-6">
      {/* Slack Integration */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <MessageSquare className="text-primary" size={24} />
            <div>
              <h2 className="text-xl font-semibold">Slack Integration</h2>
              <p className="text-sm text-muted-foreground">Send notifications to Slack channels</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.slack.enabled}
              onChange={(e) => handleIntegrationToggle('slack', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        {formData.slack.enabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Webhook URL
              </label>
              <input
                type="url"
                value={formData.slack.webhook}
                onChange={(e) => handleIntegrationUpdate('slack', 'webhook', e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2"
                placeholder="https://hooks.slack.com/services/..."
              />
            </div>
            <Button variant="outline">Test Connection</Button>
          </div>
        )}
      </Card>

      {/* Email Integration */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Mail className="text-primary" size={24} />
            <div>
              <h2 className="text-xl font-semibold">Email Integration</h2>
              <p className="text-sm text-muted-foreground">Configure SMTP settings for email notifications</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.email.enabled}
              onChange={(e) => handleIntegrationToggle('email', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        {formData.email.enabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="SMTP Host"
              className="border border-border rounded-lg px-3 py-2"
            />
            <input
              type="number"
              placeholder="Port"
              className="border border-border rounded-lg px-3 py-2"
            />
            <input
              type="text"
              placeholder="Username"
              className="border border-border rounded-lg px-3 py-2"
            />
            <input
              type="password"
              placeholder="Password"
              className="border border-border rounded-lg px-3 py-2"
            />
          </div>
        )}
      </Card>

      {/* Calendar Integration */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="text-primary" size={24} />
            <div>
              <h2 className="text-xl font-semibold">Calendar Integration</h2>
              <p className="text-sm text-muted-foreground">Sync project deadlines with calendar</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.calendar.enabled}
              onChange={(e) => handleIntegrationToggle('calendar', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        {formData.calendar.enabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Calendar Provider
              </label>
              <select
                value={formData.calendar.provider}
                onChange={(e) => handleIntegrationUpdate('calendar', 'provider', e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2"
              >
                <option value="google">Google Calendar</option>
                <option value="outlook">Microsoft Outlook</option>
                <option value="apple">Apple Calendar</option>
              </select>
            </div>
            <Button variant="outline">Connect Calendar</Button>
          </div>
        )}
      </Card>

      {/* Storage Integration */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Database className="text-primary" size={24} />
            <div>
              <h2 className="text-xl font-semibold">Cloud Storage</h2>
              <p className="text-sm text-muted-foreground">Connect external storage for file backups</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.storage.enabled}
              onChange={(e) => handleIntegrationToggle('storage', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        {formData.storage.enabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Storage Provider
              </label>
              <select
                value={formData.storage.provider}
                onChange={(e) => handleIntegrationUpdate('storage', 'provider', e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2"
              >
                <option value="aws">Amazon S3</option>
                <option value="google">Google Cloud Storage</option>
                <option value="azure">Azure Blob Storage</option>
                <option value="dropbox">Dropbox</option>
              </select>
            </div>
            <Button variant="outline">Configure Storage</Button>
          </div>
        )}
      </Card>

      {/* API Access */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Key className="text-primary" size={24} />
          <h2 className="text-xl font-semibold">API Access</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              API Key
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value="sk-1234567890abcdef..."
                readOnly
                className="flex-1 border border-border rounded-lg px-3 py-2 bg-gray-50"
              />
              <Button variant="outline">Copy</Button>
              <Button variant="outline">Regenerate</Button>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">API Documentation</h3>
            <p className="text-sm text-blue-800 mb-2">
              Use this API key to access the ASAgents REST API for custom integrations.
            </p>
            <Button variant="outline" size="sm">
              View API Docs
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
