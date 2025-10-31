// 🏗️ Settings Dashboard
// Comprehensive system configuration and preferences management

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Palette, 
  Database, 
  Mail, 
  Smartphone, 
  Key, 
  Lock, 
  Eye, 
  EyeOff, 
  Save, 
  RefreshCw, 
  Download, 
  Upload, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Moon, 
  Sun, 
  Monitor,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Calendar,
  Clock,
  MapPin,
  Languages,
  Zap,
  HardDrive,
  Server,
  Cloud,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Sliders,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

interface SettingsDashboardProps {
  projectId: string;
  userId: string;
}

interface UserSettings {
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatar?: string;
    title: string;
    department: string;
    timezone: string;
    language: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    density: 'comfortable' | 'compact' | 'spacious';
    sidebarCollapsed: boolean;
    showAvatars: boolean;
    showNotificationBadges: boolean;
    autoSave: boolean;
    confirmDeletions: boolean;
  };
  notifications: {
    email: {
      enabled: boolean;
      frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
      types: {
        mentions: boolean;
        assignments: boolean;
        deadlines: boolean;
        updates: boolean;
        security: boolean;
      };
    };
    push: {
      enabled: boolean;
      sound: boolean;
      vibration: boolean;
      types: {
        mentions: boolean;
        assignments: boolean;
        deadlines: boolean;
        updates: boolean;
        security: boolean;
      };
    };
    desktop: {
      enabled: boolean;
      sound: boolean;
      position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    };
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number; // minutes
    passwordExpiry: number; // days
    loginNotifications: boolean;
    deviceTracking: boolean;
    ipWhitelist: string[];
  };
  privacy: {
    profileVisibility: 'public' | 'team' | 'private';
    activityTracking: boolean;
    dataCollection: boolean;
    thirdPartyIntegrations: boolean;
  };
}

interface SystemSettings {
  general: {
    siteName: string;
    siteUrl: string;
    adminEmail: string;
    timezone: string;
    language: string;
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    guestAccess: boolean;
  };
  storage: {
    maxFileSize: number; // MB
    allowedFileTypes: string[];
    storageQuota: number; // GB
    autoCleanup: boolean;
    cleanupDays: number;
    compressionEnabled: boolean;
  };
  security: {
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSymbols: boolean;
      preventReuse: number;
    };
    sessionSettings: {
      timeout: number; // minutes
      maxConcurrentSessions: number;
      rememberMeDuration: number; // days
    };
    rateLimiting: {
      enabled: boolean;
      maxRequests: number;
      windowMinutes: number;
    };
  };
  integrations: {
    email: {
      provider: 'smtp' | 'sendgrid' | 'mailgun' | 'ses';
      host?: string;
      port?: number;
      username?: string;
      password?: string;
      encryption?: 'tls' | 'ssl' | 'none';
    };
    storage: {
      provider: 'local' | 's3' | 'azure' | 'gcp';
      bucket?: string;
      region?: string;
      accessKey?: string;
      secretKey?: string;
    };
    analytics: {
      enabled: boolean;
      provider?: 'google' | 'mixpanel' | 'amplitude';
      trackingId?: string;
    };
  };
}

export const SettingsDashboard: React.FC<SettingsDashboardProps> = ({ 
  projectId, 
  userId 
}) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [projectId, userId]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // Load mock settings
      const mockUserSettings = getMockUserSettings();
      const mockSystemSettings = getMockSystemSettings();

      setUserSettings(mockUserSettings);
      setSystemSettings(mockSystemSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMockUserSettings = (): UserSettings => {
    return {
      profile: {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@construction.com',
        phone: '+1-555-0101',
        title: 'Project Manager',
        department: 'Construction',
        timezone: 'America/New_York',
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h'
      },
      preferences: {
        theme: 'light',
        density: 'comfortable',
        sidebarCollapsed: false,
        showAvatars: true,
        showNotificationBadges: true,
        autoSave: true,
        confirmDeletions: true
      },
      notifications: {
        email: {
          enabled: true,
          frequency: 'immediate',
          types: {
            mentions: true,
            assignments: true,
            deadlines: true,
            updates: false,
            security: true
          }
        },
        push: {
          enabled: true,
          sound: true,
          vibration: false,
          types: {
            mentions: true,
            assignments: true,
            deadlines: true,
            updates: false,
            security: true
          }
        },
        desktop: {
          enabled: true,
          sound: false,
          position: 'top-right'
        }
      },
      security: {
        twoFactorEnabled: true,
        sessionTimeout: 480, // 8 hours
        passwordExpiry: 90,
        loginNotifications: true,
        deviceTracking: true,
        ipWhitelist: []
      },
      privacy: {
        profileVisibility: 'team',
        activityTracking: true,
        dataCollection: true,
        thirdPartyIntegrations: true
      }
    };
  };

  const getMockSystemSettings = (): SystemSettings => {
    return {
      general: {
        siteName: 'ASAgents Construction Management',
        siteUrl: 'https://asagents.construction.com',
        adminEmail: 'admin@construction.com',
        timezone: 'America/New_York',
        language: 'en',
        maintenanceMode: false,
        registrationEnabled: true,
        guestAccess: false
      },
      storage: {
        maxFileSize: 100, // MB
        allowedFileTypes: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.png', '.gif', '.mp4', '.zip'],
        storageQuota: 1000, // GB
        autoCleanup: true,
        cleanupDays: 90,
        compressionEnabled: true
      },
      security: {
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSymbols: false,
          preventReuse: 5
        },
        sessionSettings: {
          timeout: 480, // 8 hours
          maxConcurrentSessions: 3,
          rememberMeDuration: 30 // days
        },
        rateLimiting: {
          enabled: true,
          maxRequests: 100,
          windowMinutes: 15
        }
      },
      integrations: {
        email: {
          provider: 'smtp',
          host: 'smtp.gmail.com',
          port: 587,
          username: 'noreply@construction.com',
          encryption: 'tls'
        },
        storage: {
          provider: 'local'
        },
        analytics: {
          enabled: false
        }
      }
    };
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHasChanges(false);
      // Show success message
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateUserSettings = (path: string, value: any) => {
    if (!userSettings) return;
    
    const keys = path.split('.');
    const newSettings = { ...userSettings };
    let current: any = newSettings;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    setUserSettings(newSettings);
    setHasChanges(true);
  };

  const updateSystemSettings = (path: string, value: any) => {
    if (!systemSettings) return;
    
    const keys = path.split('.');
    const newSettings = { ...systemSettings };
    let current: any = newSettings;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    setSystemSettings(newSettings);
    setHasChanges(true);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Sliders },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'privacy', label: 'Privacy', icon: Eye },
    { id: 'system', label: 'System', icon: Server },
    { id: 'integrations', label: 'Integrations', icon: Zap }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Manage your account and system preferences</p>
          </div>
          <div className="flex items-center space-x-3">
            {hasChanges && (
              <div className="flex items-center text-orange-600 text-sm">
                <AlertTriangle className="w-4 h-4 mr-1" />
                Unsaved changes
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'profile' && userSettings && (
          <ProfileTab 
            settings={userSettings.profile}
            onUpdate={(path, value) => updateUserSettings(`profile.${path}`, value)}
          />
        )}
        {activeTab === 'preferences' && userSettings && (
          <PreferencesTab 
            settings={userSettings.preferences}
            onUpdate={(path, value) => updateUserSettings(`preferences.${path}`, value)}
          />
        )}
        {activeTab === 'notifications' && userSettings && (
          <NotificationsTab 
            settings={userSettings.notifications}
            onUpdate={(path, value) => updateUserSettings(`notifications.${path}`, value)}
          />
        )}
        {activeTab === 'security' && userSettings && (
          <SecurityTab 
            settings={userSettings.security}
            onUpdate={(path, value) => updateUserSettings(`security.${path}`, value)}
          />
        )}
        {activeTab === 'privacy' && userSettings && (
          <PrivacyTab 
            settings={userSettings.privacy}
            onUpdate={(path, value) => updateUserSettings(`privacy.${path}`, value)}
          />
        )}
        {activeTab === 'system' && systemSettings && (
          <SystemTab 
            settings={systemSettings}
            onUpdate={(path, value) => updateSystemSettings(path, value)}
          />
        )}
        {activeTab === 'integrations' && systemSettings && (
          <IntegrationsTab 
            settings={systemSettings.integrations}
            onUpdate={(path, value) => updateSystemSettings(`integrations.${path}`, value)}
          />
        )}
      </div>
    </div>
  );
};

// Profile Tab Component
const ProfileTab: React.FC<{
  settings: UserSettings['profile'];
  onUpdate: (path: string, value: any) => void;
}> = ({ settings, onUpdate }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              type="text"
              value={settings.firstName}
              onChange={(e) => onUpdate('firstName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              value={settings.lastName}
              onChange={(e) => onUpdate('lastName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => onUpdate('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={settings.phone}
              onChange={(e) => onUpdate('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
            <input
              type="text"
              value={settings.title}
              onChange={(e) => onUpdate('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <input
              type="text"
              value={settings.department}
              onChange={(e) => onUpdate('department', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
            <select
              value={settings.timezone}
              onChange={(e) => onUpdate('timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
            <select
              value={settings.language}
              onChange={(e) => onUpdate('language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
            <select
              value={settings.dateFormat}
              onChange={(e) => onUpdate('dateFormat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Format</label>
            <select
              value={settings.timeFormat}
              onChange={(e) => onUpdate('timeFormat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="12h">12 Hour (AM/PM)</option>
              <option value="24h">24 Hour</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

// Preferences Tab Component
const PreferencesTab: React.FC<{
  settings: UserSettings['preferences'];
  onUpdate: (path: string, value: any) => void;
}> = ({ settings, onUpdate }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Appearance</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
            <div className="flex space-x-4">
              {[
                { value: 'light', label: 'Light', icon: Sun },
                { value: 'dark', label: 'Dark', icon: Moon },
                { value: 'auto', label: 'Auto', icon: Monitor }
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => onUpdate('theme', value)}
                  className={`flex items-center space-x-2 px-4 py-2 border rounded-lg ${
                    settings.theme === value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Density</label>
            <select
              value={settings.density}
              onChange={(e) => onUpdate('density', e.target.value)}
              className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="compact">Compact</option>
              <option value="comfortable">Comfortable</option>
              <option value="spacious">Spacious</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Interface Options</h3>
        <div className="space-y-4">
          {[
            { key: 'sidebarCollapsed', label: 'Collapse sidebar by default', description: 'Start with a collapsed sidebar for more workspace' },
            { key: 'showAvatars', label: 'Show user avatars', description: 'Display profile pictures throughout the interface' },
            { key: 'showNotificationBadges', label: 'Show notification badges', description: 'Display unread counts on navigation items' },
            { key: 'autoSave', label: 'Auto-save changes', description: 'Automatically save form changes as you type' },
            { key: 'confirmDeletions', label: 'Confirm deletions', description: 'Show confirmation dialogs before deleting items' }
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-start space-x-3">
              <button
                onClick={() => onUpdate(key, !settings[key as keyof typeof settings])}
                className="mt-1"
              >
                {settings[key as keyof typeof settings] ? (
                  <ToggleRight className="w-6 h-6 text-blue-600" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-gray-400" />
                )}
              </button>
              <div>
                <p className="font-medium text-gray-900">{label}</p>
                <p className="text-sm text-gray-600">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Notifications Tab Component
const NotificationsTab: React.FC<{
  settings: UserSettings['notifications'];
  onUpdate: (path: string, value: any) => void;
}> = ({ settings, onUpdate }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Enable email notifications</p>
              <p className="text-sm text-gray-600">Receive notifications via email</p>
            </div>
            <button
              onClick={() => onUpdate('email.enabled', !settings.email.enabled)}
            >
              {settings.email.enabled ? (
                <ToggleRight className="w-6 h-6 text-blue-600" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-gray-400" />
              )}
            </button>
          </div>

          {settings.email.enabled && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                <select
                  value={settings.email.frequency}
                  onChange={(e) => onUpdate('email.frequency', e.target.value)}
                  className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="immediate">Immediate</option>
                  <option value="hourly">Hourly digest</option>
                  <option value="daily">Daily digest</option>
                  <option value="weekly">Weekly digest</option>
                </select>
              </div>

              <div>
                <p className="font-medium text-gray-900 mb-3">Email notification types</p>
                <div className="space-y-2">
                  {Object.entries(settings.email.types).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <button
                        onClick={() => onUpdate(`email.types.${key}`, !value)}
                      >
                        {value ? (
                          <ToggleRight className="w-5 h-5 text-blue-600" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Push Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Enable push notifications</p>
              <p className="text-sm text-gray-600">Receive notifications on your device</p>
            </div>
            <button
              onClick={() => onUpdate('push.enabled', !settings.push.enabled)}
            >
              {settings.push.enabled ? (
                <ToggleRight className="w-6 h-6 text-blue-600" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-gray-400" />
              )}
            </button>
          </div>

          {settings.push.enabled && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Sound</span>
                <button
                  onClick={() => onUpdate('push.sound', !settings.push.sound)}
                >
                  {settings.push.sound ? (
                    <Volume2 className="w-5 h-5 text-blue-600" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Vibration</span>
                <button
                  onClick={() => onUpdate('push.vibration', !settings.push.vibration)}
                >
                  {settings.push.vibration ? (
                    <Smartphone className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Smartphone className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>

              <div>
                <p className="font-medium text-gray-900 mb-3">Push notification types</p>
                <div className="space-y-2">
                  {Object.entries(settings.push.types).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <button
                        onClick={() => onUpdate(`push.types.${key}`, !value)}
                      >
                        {value ? (
                          <ToggleRight className="w-5 h-5 text-blue-600" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Security Tab Component
const SecurityTab: React.FC<{
  settings: UserSettings['security'];
  onUpdate: (path: string, value: any) => void;
}> = ({ settings, onUpdate }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Authentication</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Two-Factor Authentication</p>
              <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
            </div>
            <button
              onClick={() => onUpdate('twoFactorEnabled', !settings.twoFactorEnabled)}
            >
              {settings.twoFactorEnabled ? (
                <ToggleRight className="w-6 h-6 text-green-600" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-gray-400" />
              )}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
            <input
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => onUpdate('sessionTimeout', parseInt(e.target.value))}
              className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              min="15"
              max="1440"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password Expiry (days)</label>
            <input
              type="number"
              value={settings.passwordExpiry}
              onChange={(e) => onUpdate('passwordExpiry', parseInt(e.target.value))}
              className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              min="30"
              max="365"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Monitoring</h3>
        <div className="space-y-4">
          {[
            { key: 'loginNotifications', label: 'Login notifications', description: 'Get notified when someone logs into your account' },
            { key: 'deviceTracking', label: 'Device tracking', description: 'Track devices that access your account' }
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-start space-x-3">
              <button
                onClick={() => onUpdate(key, !settings[key as keyof typeof settings])}
                className="mt-1"
              >
                {settings[key as keyof typeof settings] ? (
                  <ToggleRight className="w-6 h-6 text-blue-600" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-gray-400" />
                )}
              </button>
              <div>
                <p className="font-medium text-gray-900">{label}</p>
                <p className="text-sm text-gray-600">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Privacy Tab Component
const PrivacyTab: React.FC<{
  settings: UserSettings['privacy'];
  onUpdate: (path: string, value: any) => void;
}> = ({ settings, onUpdate }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Privacy</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Visibility</label>
            <select
              value={settings.profileVisibility}
              onChange={(e) => onUpdate('profileVisibility', e.target.value)}
              className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="public">Public</option>
              <option value="team">Team Only</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data & Analytics</h3>
        <div className="space-y-4">
          {[
            { key: 'activityTracking', label: 'Activity tracking', description: 'Allow tracking of your activity for analytics' },
            { key: 'dataCollection', label: 'Data collection', description: 'Allow collection of usage data to improve the service' },
            { key: 'thirdPartyIntegrations', label: 'Third-party integrations', description: 'Allow data sharing with integrated third-party services' }
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-start space-x-3">
              <button
                onClick={() => onUpdate(key, !settings[key as keyof typeof settings])}
                className="mt-1"
              >
                {settings[key as keyof typeof settings] ? (
                  <ToggleRight className="w-6 h-6 text-blue-600" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-gray-400" />
                )}
              </button>
              <div>
                <p className="font-medium text-gray-900">{label}</p>
                <p className="text-sm text-gray-600">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// System Tab Component
const SystemTab: React.FC<{
  settings: SystemSettings;
  onUpdate: (path: string, value: any) => void;
}> = ({ settings, onUpdate }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
            <input
              type="text"
              value={settings.general.siteName}
              onChange={(e) => onUpdate('general.siteName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site URL</label>
            <input
              type="url"
              value={settings.general.siteUrl}
              onChange={(e) => onUpdate('general.siteUrl', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
            <input
              type="email"
              value={settings.general.adminEmail}
              onChange={(e) => onUpdate('general.adminEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Timezone</label>
            <select
              value={settings.general.timezone}
              onChange={(e) => onUpdate('general.timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {[
            { key: 'maintenanceMode', label: 'Maintenance mode', description: 'Put the system in maintenance mode' },
            { key: 'registrationEnabled', label: 'User registration', description: 'Allow new users to register' },
            { key: 'guestAccess', label: 'Guest access', description: 'Allow guest users to view public content' }
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-start space-x-3">
              <button
                onClick={() => onUpdate(`general.${key}`, !settings.general[key as keyof typeof settings.general])}
                className="mt-1"
              >
                {settings.general[key as keyof typeof settings.general] ? (
                  <ToggleRight className="w-6 h-6 text-blue-600" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-gray-400" />
                )}
              </button>
              <div>
                <p className="font-medium text-gray-900">{label}</p>
                <p className="text-sm text-gray-600">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Storage Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max File Size (MB)</label>
            <input
              type="number"
              value={settings.storage.maxFileSize}
              onChange={(e) => onUpdate('storage.maxFileSize', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              min="1"
              max="1000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Storage Quota (GB)</label>
            <input
              type="number"
              value={settings.storage.storageQuota}
              onChange={(e) => onUpdate('storage.storageQuota', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              min="1"
              max="10000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Auto-cleanup Days</label>
            <input
              type="number"
              value={settings.storage.cleanupDays}
              onChange={(e) => onUpdate('storage.cleanupDays', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              min="1"
              max="365"
            />
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {[
            { key: 'autoCleanup', label: 'Auto cleanup', description: 'Automatically delete old files' },
            { key: 'compressionEnabled', label: 'File compression', description: 'Compress uploaded files to save space' }
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-start space-x-3">
              <button
                onClick={() => onUpdate(`storage.${key}`, !settings.storage[key as keyof typeof settings.storage])}
                className="mt-1"
              >
                {settings.storage[key as keyof typeof settings.storage] ? (
                  <ToggleRight className="w-6 h-6 text-blue-600" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-gray-400" />
                )}
              </button>
              <div>
                <p className="font-medium text-gray-900">{label}</p>
                <p className="text-sm text-gray-600">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Integrations Tab Component
const IntegrationsTab: React.FC<{
  settings: SystemSettings['integrations'];
  onUpdate: (path: string, value: any) => void;
}> = ({ settings, onUpdate }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
            <select
              value={settings.email.provider}
              onChange={(e) => onUpdate('email.provider', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="smtp">SMTP</option>
              <option value="sendgrid">SendGrid</option>
              <option value="mailgun">Mailgun</option>
              <option value="ses">Amazon SES</option>
            </select>
          </div>
          {settings.email.provider === 'smtp' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
                <input
                  type="text"
                  value={settings.email.host || ''}
                  onChange={(e) => onUpdate('email.host', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
                <input
                  type="number"
                  value={settings.email.port || 587}
                  onChange={(e) => onUpdate('email.port', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={settings.email.username || ''}
                  onChange={(e) => onUpdate('email.username', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Encryption</label>
                <select
                  value={settings.email.encryption || 'tls'}
                  onChange={(e) => onUpdate('email.encryption', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="none">None</option>
                  <option value="tls">TLS</option>
                  <option value="ssl">SSL</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Storage Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Storage Provider</label>
            <select
              value={settings.storage.provider}
              onChange={(e) => onUpdate('storage.provider', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="local">Local Storage</option>
              <option value="s3">Amazon S3</option>
              <option value="azure">Azure Blob</option>
              <option value="gcp">Google Cloud</option>
            </select>
          </div>
          {settings.storage.provider !== 'local' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bucket/Container</label>
                <input
                  type="text"
                  value={settings.storage.bucket || ''}
                  onChange={(e) => onUpdate('storage.bucket', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                <input
                  type="text"
                  value={settings.storage.region || ''}
                  onChange={(e) => onUpdate('storage.region', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Enable Analytics</p>
              <p className="text-sm text-gray-600">Track usage and performance metrics</p>
            </div>
            <button
              onClick={() => onUpdate('analytics.enabled', !settings.analytics.enabled)}
            >
              {settings.analytics.enabled ? (
                <ToggleRight className="w-6 h-6 text-blue-600" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-gray-400" />
              )}
            </button>
          </div>

          {settings.analytics.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Analytics Provider</label>
                <select
                  value={settings.analytics.provider || 'google'}
                  onChange={(e) => onUpdate('analytics.provider', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="google">Google Analytics</option>
                  <option value="mixpanel">Mixpanel</option>
                  <option value="amplitude">Amplitude</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tracking ID</label>
                <input
                  type="text"
                  value={settings.analytics.trackingId || ''}
                  onChange={(e) => onUpdate('analytics.trackingId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="GA-XXXXXXXXX-X"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsDashboard;
