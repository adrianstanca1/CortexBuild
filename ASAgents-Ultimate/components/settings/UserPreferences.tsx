import React, { useState } from 'react';
import { User } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  User as UserIcon, 
  Palette, 
  Bell, 
  Mail, 
  Layout,
  Eye,
  Monitor,
  Sun,
  Moon
} from 'lucide-react';

interface UserPreferencesProps {
  settings: {
    theme: 'light' | 'dark' | 'auto';
    notifications: boolean;
    emailUpdates: boolean;
    dashboardLayout: string;
    defaultView: string;
  };
  onUpdate: (settings: any) => void;
  user: User;
}

export const UserPreferences: React.FC<UserPreferencesProps> = ({
  settings,
  onUpdate,
  user,
}) => {
  const [formData, setFormData] = useState(settings);

  const themes = [
    { id: 'light', name: 'Light', icon: <Sun size={16} />, description: 'Light theme for daytime use' },
    { id: 'dark', name: 'Dark', icon: <Moon size={16} />, description: 'Dark theme for low-light environments' },
    { id: 'auto', name: 'Auto', icon: <Monitor size={16} />, description: 'Automatically switch based on system preference' },
  ];

  const dashboardLayouts = [
    { id: 'grid', name: 'Grid Layout', description: 'Cards arranged in a grid' },
    { id: 'list', name: 'List Layout', description: 'Items displayed in a vertical list' },
    { id: 'compact', name: 'Compact Layout', description: 'Dense layout with more information' },
  ];

  const defaultViews = [
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'projects', name: 'Projects' },
    { id: 'financials', name: 'Financials' },
    { id: 'users', name: 'Users' },
  ];

  const handleChange = (field: string, value: any) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    onUpdate(updatedData);
  };

  return (
    <div className="space-y-6">
      {/* Appearance */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Palette className="text-primary" size={24} />
          <h2 className="text-xl font-semibold">Appearance</h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-3">
              Theme
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {themes.map(theme => (
                <div
                  key={theme.id}
                  onClick={() => handleChange('theme', theme.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    formData.theme === theme.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-accent'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {theme.icon}
                    <span className="font-medium">{theme.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{theme.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">
              Dashboard Layout
            </label>
            <div className="space-y-3">
              {dashboardLayouts.map(layout => (
                <div
                  key={layout.id}
                  onClick={() => handleChange('dashboardLayout', layout.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    formData.dashboardLayout === layout.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-accent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{layout.name}</div>
                      <div className="text-sm text-muted-foreground">{layout.description}</div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      formData.dashboardLayout === layout.id
                        ? 'border-primary bg-primary'
                        : 'border-border'
                    }`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Default View
            </label>
            <select
              value={formData.defaultView}
              onChange={(e) => handleChange('defaultView', e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2"
            >
              {defaultViews.map(view => (
                <option key={view.id} value={view.id}>
                  {view.name}
                </option>
              ))}
            </select>
            <p className="text-sm text-muted-foreground mt-1">
              The page you'll see when you first log in
            </p>
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="text-primary" size={24} />
          <h2 className="text-xl font-semibold">Notifications</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <h3 className="font-medium">Browser Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Show notifications in your browser for real-time updates
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notifications}
                onChange={(e) => handleChange('notifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <h3 className="font-medium">Email Updates</h3>
              <p className="text-sm text-muted-foreground">
                Receive email notifications for important updates and changes
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.emailUpdates}
                onChange={(e) => handleChange('emailUpdates', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </Card>

      {/* Privacy */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Eye className="text-primary" size={24} />
          <h2 className="text-xl font-semibold">Privacy</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <h3 className="font-medium">Activity Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Allow the system to track your activity for analytics and improvements
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                defaultChecked={true}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <h3 className="font-medium">Usage Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Share anonymous usage data to help improve the platform
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                defaultChecked={false}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </Card>

      {/* Account */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <UserIcon className="text-primary" size={24} />
          <h2 className="text-xl font-semibold">Account</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <h3 className="font-medium">Change Password</h3>
              <p className="text-sm text-muted-foreground">
                Update your account password for security
              </p>
            </div>
            <Button variant="outline">
              Change Password
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <h3 className="font-medium">Two-Factor Authentication</h3>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Button variant="outline">
              Setup 2FA
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <h3 className="font-medium">Download Data</h3>
              <p className="text-sm text-muted-foreground">
                Download a copy of your personal data
              </p>
            </div>
            <Button variant="outline">
              Download
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
            <div>
              <h3 className="font-medium text-red-900">Delete Account</h3>
              <p className="text-sm text-red-700">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-100">
              Delete Account
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
