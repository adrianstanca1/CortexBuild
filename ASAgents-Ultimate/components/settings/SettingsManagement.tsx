import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { GeneralSettings } from './GeneralSettings';
import { UserPreferences } from './UserPreferences';
import { TenantSettings } from './TenantSettings';
import { SecuritySettings } from './SecuritySettings';
import { IntegrationSettings } from './IntegrationSettings';
import { NotificationSettings } from './NotificationSettings';
import { useRealTimeEvent } from '../../hooks/useRealTime';
import { 
  Settings, 
  User as UserIcon, 
  Building, 
  Shield, 
  Plug, 
  Bell,
  Palette,
  Database,
  Globe,
  Save,
  RotateCcw
} from 'lucide-react';

interface SettingsManagementProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  onNavigate?: (view: string) => void;
}

type SettingsView = 'general' | 'preferences' | 'tenant' | 'security' | 'integrations' | 'notifications';

interface SettingsData {
  general: {
    companyName: string;
    companyEmail: string;
    companyPhone: string;
    companyAddress: string;
    timezone: string;
    dateFormat: string;
    currency: string;
    language: string;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    notifications: boolean;
    emailUpdates: boolean;
    dashboardLayout: string;
    defaultView: string;
  };
  tenant: {
    maxUsers: number;
    maxProjects: number;
    storageLimit: number;
    features: string[];
    customDomain: string;
    branding: {
      logo: string;
      primaryColor: string;
      secondaryColor: string;
    };
  };
  security: {
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireNumbers: boolean;
      requireSymbols: boolean;
    };
    sessionTimeout: number;
    twoFactorRequired: boolean;
    ipWhitelist: string[];
  };
  integrations: {
    slack: { enabled: boolean; webhook: string };
    email: { enabled: boolean; smtp: any };
    calendar: { enabled: boolean; provider: string };
    storage: { enabled: boolean; provider: string };
  };
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    projectUpdates: boolean;
    systemAlerts: boolean;
    weeklyReports: boolean;
  };
}

export const SettingsManagement: React.FC<SettingsManagementProps> = ({
  user,
  addToast,
  onNavigate,
}) => {
  const [activeView, setActiveView] = useState<SettingsView>('general');
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  // Real-time settings updates
  useRealTimeEvent('settings_updated', (event) => {
    if (event.data) {
      setSettings(prev => prev ? { ...prev, ...event.data } : null);
      addToast('Settings updated by another user', 'info');
    }
  });

  // Load settings
  const loadSettings = useCallback(async () => {
    try {
      // Simulate API call - replace with actual API
      const mockSettings: SettingsData = {
        general: {
          companyName: 'ASAgents Construction',
          companyEmail: 'contact@asagents.com',
          companyPhone: '+1 (555) 123-4567',
          companyAddress: '123 Construction Ave, Builder City, BC 12345',
          timezone: 'America/New_York',
          dateFormat: 'MM/DD/YYYY',
          currency: 'USD',
          language: 'en',
        },
        preferences: {
          theme: 'light',
          notifications: true,
          emailUpdates: true,
          dashboardLayout: 'grid',
          defaultView: 'dashboard',
        },
        tenant: {
          maxUsers: 50,
          maxProjects: 100,
          storageLimit: 1000, // GB
          features: ['projects', 'financials', 'users', 'reports'],
          customDomain: '',
          branding: {
            logo: '',
            primaryColor: '#3B82F6',
            secondaryColor: '#10B981',
          },
        },
        security: {
          passwordPolicy: {
            minLength: 8,
            requireUppercase: true,
            requireNumbers: true,
            requireSymbols: false,
          },
          sessionTimeout: 480, // minutes
          twoFactorRequired: false,
          ipWhitelist: [],
        },
        integrations: {
          slack: { enabled: false, webhook: '' },
          email: { enabled: true, smtp: {} },
          calendar: { enabled: false, provider: 'google' },
          storage: { enabled: false, provider: 'aws' },
        },
        notifications: {
          email: true,
          push: true,
          sms: false,
          projectUpdates: true,
          systemAlerts: true,
          weeklyReports: false,
        },
      };
      setSettings(mockSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
      addToast('Failed to load settings', 'error');
    }
  }, [addToast]);

  // Initialize
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await loadSettings();
      setLoading(false);
    };
    loadData();
  }, [loadSettings]);

  const handleSettingsUpdate = (section: keyof SettingsData, data: any) => {
    if (!settings) return;
    
    const updatedSettings = {
      ...settings,
      [section]: { ...settings[section], ...data }
    };
    setSettings(updatedSettings);
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    try {
      // Simulate API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHasChanges(false);
      addToast('Settings saved successfully', 'success');
    } catch (error) {
      console.error('Failed to save settings:', error);
      addToast('Failed to save settings', 'error');
    }
  };

  const handleResetSettings = async () => {
    try {
      await loadSettings();
      setHasChanges(false);
      addToast('Settings reset to defaults', 'success');
    } catch (error) {
      console.error('Failed to reset settings:', error);
      addToast('Failed to reset settings', 'error');
    }
  };

  const views = [
    { id: 'general', label: 'General', icon: <Settings size={16} />, description: 'Company information and basic settings' },
    { id: 'preferences', label: 'Preferences', icon: <UserIcon size={16} />, description: 'Personal preferences and UI settings' },
    { id: 'tenant', label: 'Organization', icon: <Building size={16} />, description: 'Tenant settings and branding' },
    { id: 'security', label: 'Security', icon: <Shield size={16} />, description: 'Security policies and access control' },
    { id: 'integrations', label: 'Integrations', icon: <Plug size={16} />, description: 'Third-party integrations and APIs' },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={16} />, description: 'Notification preferences and alerts' },
  ];

  const renderView = () => {
    if (!settings) return null;

    switch (activeView) {
      case 'general':
        return (
          <GeneralSettings
            settings={settings.general}
            onUpdate={(data) => handleSettingsUpdate('general', data)}
            user={user}
          />
        );
      case 'preferences':
        return (
          <UserPreferences
            settings={settings.preferences}
            onUpdate={(data) => handleSettingsUpdate('preferences', data)}
            user={user}
          />
        );
      case 'tenant':
        return (
          <TenantSettings
            settings={settings.tenant}
            onUpdate={(data) => handleSettingsUpdate('tenant', data)}
            user={user}
          />
        );
      case 'security':
        return (
          <SecuritySettings
            settings={settings.security}
            onUpdate={(data) => handleSettingsUpdate('security', data)}
            user={user}
          />
        );
      case 'integrations':
        return (
          <IntegrationSettings
            settings={settings.integrations}
            onUpdate={(data) => handleSettingsUpdate('integrations', data)}
            user={user}
          />
        );
      case 'notifications':
        return (
          <NotificationSettings
            settings={settings.notifications}
            onUpdate={(data) => handleSettingsUpdate('notifications', data)}
            user={user}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">
            Configure system settings, preferences, and integrations
          </p>
        </div>
        
        {hasChanges && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleResetSettings}>
              <RotateCcw size={16} className="mr-2" />
              Reset
            </Button>
            <Button onClick={handleSaveSettings}>
              <Save size={16} className="mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Settings Categories</h3>
            <div className="space-y-2">
              {views.map(view => (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id as SettingsView)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    activeView === view.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-1">
                    {view.icon}
                    <span className="font-medium">{view.label}</span>
                  </div>
                  <p className="text-xs opacity-80">{view.description}</p>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          {renderView()}
        </div>
      </div>

      {/* Unsaved Changes Warning */}
      {hasChanges && (
        <div className="fixed bottom-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-yellow-800">
              You have unsaved changes
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleResetSettings}>
                Discard
              </Button>
              <Button size="sm" onClick={handleSaveSettings}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
