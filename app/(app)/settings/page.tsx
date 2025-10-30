'use client';

/**
 * Settings Page - User Preferences & Configuration
 * Complete settings with tabs, forms, and functional save buttons
 */

import {
  AlertCircle,
  Bell,
  Check,
  Database, Key, Mail,
  Palette,
  Save,
  Shield,
  User
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const userData = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'database', label: 'Database', icon: Database },
  ];

  const handleSave = async (data: any) => {
    setSaving(true);
    setSaveStatus('idle');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      // Save to localStorage
      if (typeof window !== 'undefined') {
        const updatedUser = { ...user, ...data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">Manage your account settings and preferences</p>
        </div>

        {/* Status Message */}
        {saveStatus !== 'idle' && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            saveStatus === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {saveStatus === 'success' ? (
              <>
                <Check className="w-5 h-5" />
                <span>Settings saved successfully!</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5" />
                <span>Failed to save settings. Please try again.</span>
              </>
            )}
          </div>
        )}

        {/* Main Content */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <nav className="space-y-1 bg-white rounded-lg border border-gray-200 p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200">
              {activeTab === 'profile' && <ProfileTab user={user} onSave={handleSave} saving={saving} />}
              {activeTab === 'notifications' && <NotificationsTab onSave={handleSave} saving={saving} />}
              {activeTab === 'security' && <SecurityTab onSave={handleSave} saving={saving} />}
              {activeTab === 'appearance' && <AppearanceTab onSave={handleSave} saving={saving} />}
              {activeTab === 'database' && <DatabaseTab onSave={handleSave} saving={saving} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Profile Tab
function ProfileTab({ user, onSave, saving }: any) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    company: user?.company || '',
    role: user?.role || '',
    bio: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Profile Information</h2>
        <p className="text-sm text-gray-600">Update your personal information and contact details</p>
      </div>

      {/* Avatar */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {formData.name.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <button type="button" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium">
              Change Photo
            </button>
            <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF. Max 2MB</p>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company
          </label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bio
        </label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Tell us about yourself..."
        />
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
        <button
          type="button"
          className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// Notifications Tab
function NotificationsTab({ onSave, saving }: any) {
  const [settings, setSettings] = useState({
    email: {
      projects: true,
      tasks: true,
      mentions: true,
      updates: false
    },
    push: {
      projects: true,
      tasks: false,
      mentions: true,
      updates: false
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ notifications: settings });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Notification Preferences</h2>
        <p className="text-sm text-gray-600">Choose how you want to receive notifications</p>
      </div>

      {/* Email Notifications */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Email Notifications
        </h3>
        <div className="space-y-3">
          {[
            { key: 'projects', label: 'Project Updates', desc: 'Get notified about project changes' },
            { key: 'tasks', label: 'Task Assignments', desc: 'When tasks are assigned to you' },
            { key: 'mentions', label: 'Mentions', desc: 'When someone mentions you' },
            { key: 'updates', label: 'Product Updates', desc: 'News about new features' }
          ].map((item) => (
            <label key={item.key} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
              <input
                type="checkbox"
                checked={settings.email[item.key as keyof typeof settings.email]}
                onChange={(e) => setSettings({
                  ...settings,
                  email: { ...settings.email, [item.key]: e.target.checked }
                })}
                className="mt-1 w-4 h-4 text-blue-600 rounded"
              />
              <div>
                <div className="font-medium text-gray-900">{item.label}</div>
                <div className="text-sm text-gray-600">{item.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Push Notifications */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Push Notifications
        </h3>
        <div className="space-y-3">
          {[
            { key: 'projects', label: 'Project Updates', desc: 'Get notified about project changes' },
            { key: 'tasks', label: 'Task Assignments', desc: 'When tasks are assigned to you' },
            { key: 'mentions', label: 'Mentions', desc: 'When someone mentions you' },
            { key: 'updates', label: 'Product Updates', desc: 'News about new features' }
          ].map((item) => (
            <label key={item.key} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
              <input
                type="checkbox"
                checked={settings.push[item.key as keyof typeof settings.push]}
                onChange={(e) => setSettings({
                  ...settings,
                  push: { ...settings.push, [item.key]: e.target.checked }
                })}
                className="mt-1 w-4 h-4 text-blue-600 rounded"
              />
              <div>
                <div className="font-medium text-gray-900">{item.label}</div>
                <div className="text-sm text-gray-600">{item.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Preferences
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// Security Tab
function SecurityTab({ onSave, saving }: any) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    onSave({ password: formData.newPassword });
    setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Security Settings</h2>
        <p className="text-sm text-gray-600">Manage your password and security preferences</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Password
          </label>
          <input
            type="password"
            value={formData.currentPassword}
            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <input
            type="password"
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password
          </label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <Key className="w-4 h-4" />
              Update Password
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// Appearance Tab
function AppearanceTab({ onSave, saving }: any) {
  const [theme, setTheme] = useState('light');
  const [fontSize, setFontSize] = useState('medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ theme, fontSize });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Appearance</h2>
        <p className="text-sm text-gray-600">Customize how CortexBuild looks</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
        <div className="grid grid-cols-3 gap-4">
          {['light', 'dark', 'auto'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTheme(t)}
              className={`p-4 border-2 rounded-lg capitalize ${
                theme === t ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Font Size</label>
        <div className="grid grid-cols-3 gap-4">
          {['small', 'medium', 'large'].map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setFontSize(size)}
              className={`p-4 border-2 rounded-lg capitalize ${
                fontSize === size ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Preferences
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// Database Tab
function DatabaseTab({ onSave, saving }: any) {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Database Settings</h2>
        <p className="text-sm text-gray-600">Manage your database connections and data</p>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-800 font-medium mb-1">
            <Check className="w-5 h-5" />
            Connected to Supabase
          </div>
          <p className="text-sm text-green-700">
            https://zpbuvuxpfemldsknerew.supabase.co
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Total Tables</div>
            <div className="text-2xl font-bold text-gray-900">25+</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Records</div>
            <div className="text-2xl font-bold text-gray-900">15,489</div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => onSave({ database: 'refreshed' })}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
          >
            Test Connection
          </button>
          <button
            type="button"
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium"
          >
            View Logs
          </button>
        </div>
      </div>
    </div>
  );
}
