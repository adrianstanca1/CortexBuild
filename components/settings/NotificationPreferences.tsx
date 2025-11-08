/**
 * Notification Preferences Component
 * Allows users to manage their notification settings
 * Features: Toggle notification types, email/push options, quiet hours
 */

import React, { useState, useEffect } from 'react';
import { Bell, Mail, Smartphone, Clock, Save, AlertCircle } from 'lucide-react';
import { notificationService, NotificationPreferences as NotificationPreferencesType } from '../../lib/services/notificationService';
import toast from 'react-hot-toast';

interface NotificationPreferencesProps {
  userId: string;
  isDarkMode?: boolean;
}

export const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({
  userId,
  isDarkMode = false
}) => {
  const [preferences, setPreferences] = useState<NotificationPreferencesType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, [userId]);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getPreferences(userId);
      setPreferences(data);
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast.error('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof NotificationPreferencesType) => {
    if (!preferences) return;

    setPreferences({
      ...preferences,
      [key]: !preferences[key]
    });
    setHasChanges(true);
  };

  const handleTimeChange = (key: 'quiet_hours_start' | 'quiet_hours_end', value: string) => {
    if (!preferences) return;

    setPreferences({
      ...preferences,
      [key]: value
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!preferences || !hasChanges) return;

    try {
      setSaving(true);
      await notificationService.updatePreferences(userId, preferences);
      setHasChanges(false);
      toast.success('Notification preferences saved');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="animate-pulse space-y-4">
          <div className={`h-4 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          <div className={`h-4 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          <div className={`h-4 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
        </div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-2 text-yellow-600">
          <AlertCircle className="w-5 h-5" />
          <p>Failed to load notification preferences</p>
        </div>
      </div>
    );
  }

  const notificationTypes = [
    { key: 'task_update_enabled', label: 'Task Updates', icon: '✓', description: 'Get notified when tasks are updated' },
    { key: 'mention_enabled', label: 'Mentions', icon: '@', description: 'Get notified when someone mentions you' },
    { key: 'system_alert_enabled', label: 'System Alerts', icon: '⚠️', description: 'Important system notifications' },
    { key: 'comment_enabled', label: 'Comments', icon: '💬', description: 'Get notified on new comments' },
    { key: 'project_update_enabled', label: 'Project Updates', icon: '📋', description: 'Project-related notifications' },
    { key: 'team_update_enabled', label: 'Team Updates', icon: '👥', description: 'Team activity notifications' },
    { key: 'document_update_enabled', label: 'Document Updates', icon: '📄', description: 'Document change notifications' },
    { key: 'payment_update_enabled', label: 'Payment Updates', icon: '💳', description: 'Payment-related notifications' }
  ];

  return (
    <div className={`rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      {/* Header */}
      <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center gap-3 mb-2">
          <Bell className="w-6 h-6 text-blue-500" />
          <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Notification Preferences
          </h2>
        </div>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Manage how and when you receive notifications
        </p>
      </div>

      {/* Content */}
      <div className="p-6 space-y-8">
        {/* Notification Types */}
        <div>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Notification Types
          </h3>
          <div className="space-y-3">
            {notificationTypes.map(({ key, label, icon, description }) => (
              <div
                key={key}
                className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${isDarkMode
                  ? 'border-gray-700 hover:bg-gray-700/50'
                  : 'border-gray-200 hover:bg-gray-50'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{icon}</span>
                  <div>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {label}
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {description}
                    </p>
                  </div>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences[key as keyof NotificationPreferencesType] as boolean}
                    onChange={() => handleToggle(key as keyof NotificationPreferencesType)}
                    className="w-5 h-5 rounded"
                    aria-label={`Toggle ${key.replace(/_/g, ' ')}`}
                    title={`Toggle ${key.replace(/_/g, ' ')}`}
                  />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Methods */}
        <div>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Delivery Methods
          </h3>
          <div className="space-y-3">
            {/* Email Notifications */}
            <div
              className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${isDarkMode
                ? 'border-gray-700 hover:bg-gray-700/50'
                : 'border-gray-200 hover:bg-gray-50'
                }`}
            >
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-500" />
                <div>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Email Notifications
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Receive notifications via email
                  </p>
                </div>
              </div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.email_notifications_enabled}
                  onChange={() => handleToggle('email_notifications_enabled')}
                  className="w-5 h-5 rounded"
                  aria-label="Toggle email notifications"
                  title="Toggle email notifications"
                />
              </label>
            </div>

            {/* Push Notifications */}
            <div
              className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${isDarkMode
                ? 'border-gray-700 hover:bg-gray-700/50'
                : 'border-gray-200 hover:bg-gray-50'
                }`}
            >
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-green-500" />
                <div>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Push Notifications
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Receive browser push notifications
                  </p>
                </div>
              </div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.push_notifications_enabled}
                  onChange={() => handleToggle('push_notifications_enabled')}
                  className="w-5 h-5 rounded"
                  aria-label="Toggle push notifications"
                  title="Toggle push notifications"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Quiet Hours */}
        <div>
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <Clock className="w-5 h-5" />
            Quiet Hours
          </h3>
          <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Don't send notifications during these hours
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Start Time
              </label>
              <input
                type="time"
                value={preferences.quiet_hours_start || '22:00'}
                onChange={(e) => handleTimeChange('quiet_hours_start', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
                  }`}
                aria-label="Quiet hours start time"
                title="Quiet hours start time"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                End Time
              </label>
              <input
                type="time"
                value={preferences.quiet_hours_end || '08:00'}
                onChange={(e) => handleTimeChange('quiet_hours_end', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
                  }`}
                aria-label="Quiet hours end time"
                title="Quiet hours end time"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={`p-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-end gap-3`}>
        <button
          type="button"
          onClick={() => {
            loadPreferences();
            setHasChanges(false);
          }}
          disabled={!hasChanges || saving}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${isDarkMode
            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50'
            }`}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${hasChanges && !saving
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-400 text-gray-600 cursor-not-allowed'
            }`}
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

