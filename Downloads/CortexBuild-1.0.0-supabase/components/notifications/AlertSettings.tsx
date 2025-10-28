import React, { useState, useEffect } from 'react';
import { 
  X, Save, Bell, Mail, MessageSquare, Smartphone,
  Clock, Volume2, VolumeX, AlertTriangle, Info,
  CheckCircle, Settings, RotateCcw
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import type { AlertSettingsProps, NotificationPreferences } from '../../types/notifications';

export const AlertSettings: React.FC<AlertSettingsProps> = ({ 
  userId, 
  isOpen, 
  onClose 
}) => {
  const { preferences, updatePreferences, loading } = useNotifications();
  const [localPreferences, setLocalPreferences] = useState<Partial<NotificationPreferences>>({});
  const [activeTab, setActiveTab] = useState<'general' | 'categories' | 'schedule' | 'advanced'>('general');
  const [saving, setSaving] = useState(false);

  // Initialize local preferences when preferences load
  useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences);
    }
  }, [preferences]);

  // Handle save
  const handleSave = async () => {
    if (!localPreferences) return;
    
    setSaving(true);
    try {
      await updatePreferences(localPreferences);
      onClose();
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  // Handle reset to defaults
  const handleReset = () => {
    setLocalPreferences({
      email_enabled: true,
      push_enabled: true,
      sms_enabled: false,
      categories: {
        project: { email: true, push: true, sms: false },
        task: { email: true, push: true, sms: false },
        invoice: { email: true, push: false, sms: false },
        system: { email: false, push: true, sms: false },
        chat: { email: false, push: true, sms: false },
        comment: { email: true, push: true, sms: false },
        file: { email: false, push: false, sms: false },
        milestone: { email: true, push: true, sms: false },
        deadline: { email: true, push: true, sms: true },
        integration: { email: true, push: false, sms: false }
      },
      priority_filter: ['low', 'medium', 'high', 'urgent'],
      quiet_hours_enabled: true,
      quiet_hours_start: '22:00:00',
      quiet_hours_end: '08:00:00',
      max_notifications_per_hour: 10,
      digest_enabled: false,
      digest_frequency: 'daily'
    });
  };

  // Update category preferences
  const updateCategoryPreference = (
    category: keyof NotificationPreferences['categories'],
    channel: 'email' | 'push' | 'sms',
    enabled: boolean
  ) => {
    setLocalPreferences(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: {
          ...prev.categories?.[category],
          [channel]: enabled
        }
      }
    }));
  };

  // Update general preference
  const updateGeneralPreference = (key: string, value: any) => {
    setLocalPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'categories', label: 'Categories', icon: Bell },
    { id: 'schedule', label: 'Schedule', icon: Clock },
    { id: 'advanced', label: 'Advanced', icon: AlertTriangle }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" onClick={onClose}>
      <div className="absolute inset-0 bg-black bg-opacity-25" />
      
      <div
        className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl transform transition-transform duration-300 ease-in-out"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-50">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Notification Settings</h2>
              <p className="text-sm text-gray-500">Customize how and when you receive notifications</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                title="Reset to defaults"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 bg-white">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'general' && (
              <GeneralSettings 
                preferences={localPreferences} 
                onUpdate={updateGeneralPreference} 
              />
            )}
            
            {activeTab === 'categories' && (
              <CategorySettings 
                preferences={localPreferences} 
                onUpdate={updateCategoryPreference} 
              />
            )}
            
            {activeTab === 'schedule' && (
              <ScheduleSettings 
                preferences={localPreferences} 
                onUpdate={updateGeneralPreference} 
              />
            )}
            
            {activeTab === 'advanced' && (
              <AdvancedSettings 
                preferences={localPreferences} 
                onUpdate={updateGeneralPreference} 
              />
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Changes will be saved automatically
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleSave}
                  disabled={saving || loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// General Settings Tab
interface GeneralSettingsProps {
  preferences: Partial<NotificationPreferences>;
  onUpdate: (key: string, value: any) => void;
}

const GeneralSettings: React.FC<GeneralSettingsProps> = ({ preferences, onUpdate }) => {
  const channels = [
    { key: 'email_enabled', label: 'Email Notifications', icon: Mail, description: 'Receive notifications via email' },
    { key: 'push_enabled', label: 'Push Notifications', icon: Bell, description: 'Browser push notifications' },
    { key: 'sms_enabled', label: 'SMS Notifications', icon: MessageSquare, description: 'Text message notifications' }
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Channels</h3>
        <div className="space-y-4">
          {channels.map(({ key, label, icon: Icon, description }) => (
            <div key={key} className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg">
              <div className="flex-shrink-0 mt-1">
                <Icon className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{label}</h4>
                    <p className="text-sm text-gray-500">{description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences[key as keyof NotificationPreferences] as boolean || false}
                      onChange={(e) => onUpdate(key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Priority Filter</h3>
        <p className="text-sm text-gray-500 mb-4">Only receive notifications for selected priority levels</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
            { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
            { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
            { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
          ].map(({ value, label, color }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.priority_filter?.includes(value as any) || false}
                onChange={(e) => {
                  const current = preferences.priority_filter || [];
                  const updated = e.target.checked
                    ? [...current, value]
                    : current.filter(p => p !== value);
                  onUpdate('priority_filter', updated);
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

// Category Settings Tab
interface CategorySettingsProps {
  preferences: Partial<NotificationPreferences>;
  onUpdate: (category: keyof NotificationPreferences['categories'], channel: 'email' | 'push' | 'sms', enabled: boolean) => void;
}

const CategorySettings: React.FC<CategorySettingsProps> = ({ preferences, onUpdate }) => {
  const categories = [
    { key: 'project', label: 'Project Updates', description: 'Milestones, deadlines, and project changes' },
    { key: 'task', label: 'Task Notifications', description: 'Task assignments, updates, and deadlines' },
    { key: 'invoice', label: 'Invoice Alerts', description: 'Invoice status changes and payments' },
    { key: 'system', label: 'System Notifications', description: 'Maintenance, updates, and system alerts' },
    { key: 'chat', label: 'Chat Messages', description: 'Direct messages and mentions' },
    { key: 'comment', label: 'Comments', description: 'Comments on tasks, projects, and files' },
    { key: 'file', label: 'File Sharing', description: 'File uploads, downloads, and sharing' },
    { key: 'milestone', label: 'Milestones', description: 'Project milestone achievements' },
    { key: 'deadline', label: 'Deadlines', description: 'Approaching and overdue deadlines' },
    { key: 'integration', label: 'Integrations', description: 'Third-party app notifications' }
  ];

  const channels = [
    { key: 'email', label: 'Email', icon: Mail },
    { key: 'push', label: 'Push', icon: Bell },
    { key: 'sms', label: 'SMS', icon: MessageSquare }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Notification Categories</h3>
        <p className="text-sm text-gray-500">Choose which types of notifications you want to receive and through which channels</p>
      </div>

      <div className="space-y-6">
        {categories.map(({ key, label, description }) => (
          <div key={key} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-sm font-medium text-gray-900">{label}</h4>
                <p className="text-sm text-gray-500">{description}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {channels.map(({ key: channelKey, label: channelLabel, icon: Icon }) => (
                <label key={channelKey} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.categories?.[key as keyof NotificationPreferences['categories']]?.[channelKey as keyof any] || false}
                    onChange={(e) => onUpdate(key as keyof NotificationPreferences['categories'], channelKey as any, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Icon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{channelLabel}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Schedule Settings Tab
interface ScheduleSettingsProps {
  preferences: Partial<NotificationPreferences>;
  onUpdate: (key: string, value: any) => void;
}

const ScheduleSettings: React.FC<ScheduleSettingsProps> = ({ preferences, onUpdate }) => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quiet Hours</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-gray-400" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Enable Quiet Hours</h4>
                <p className="text-sm text-gray-500">Pause notifications during specified hours</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.quiet_hours_enabled || false}
                onChange={(e) => onUpdate('quiet_hours_enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {preferences.quiet_hours_enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                <input
                  type="time"
                  value={preferences.quiet_hours_start || '22:00:00'}
                  onChange={(e) => onUpdate('quiet_hours_start', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                <input
                  type="time"
                  value={preferences.quiet_hours_end || '08:00:00'}
                  onChange={(e) => onUpdate('quiet_hours_end', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Rate Limiting</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Notifications Per Hour
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={preferences.max_notifications_per_hour || 10}
              onChange={(e) => onUpdate('max_notifications_per_hour', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">Maximum number of notifications to receive per hour</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Advanced Settings Tab
interface AdvancedSettingsProps {
  preferences: Partial<NotificationPreferences>;
  onUpdate: (key: string, value: any) => void;
}

const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({ preferences, onUpdate }) => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Digest Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5 text-gray-400" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Daily Digest</h4>
                <p className="text-sm text-gray-500">Receive a daily summary of missed notifications</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.digest_enabled || false}
                onChange={(e) => onUpdate('digest_enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {preferences.digest_enabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Digest Frequency</label>
              <select
                value={preferences.digest_frequency || 'daily'}
                onChange={(e) => onUpdate('digest_frequency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Danger Zone</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <h4 className="text-sm font-medium text-red-900">Disable All Notifications</h4>
                <p className="text-sm text-red-700">Stop receiving all notifications across all channels</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={!preferences.email_enabled && !preferences.push_enabled && !preferences.sms_enabled}
                onChange={(e) => {
                  const disabled = e.target.checked;
                  onUpdate('email_enabled', !disabled);
                  onUpdate('push_enabled', !disabled);
                  onUpdate('sms_enabled', !disabled);
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-red-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
