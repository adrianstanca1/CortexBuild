/**
 * User Account Settings Page
 * Manages user profile, preferences, and account security
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  User,
  Mail,
  Lock,
  Bell,
  Moon,
  Sun,
  Save,
  Check,
  X,
  AlertCircle
} from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  companyId: string | null;
  avatar?: string;
  bio?: string;
  createdAt: string;
  lastLogin?: string;
  preferences?: {
    theme: 'light' | 'dark';
    emailNotifications: boolean;
    twoFactorEnabled: boolean;
  };
}

interface UserAccountSettingsProps {
  userId?: string;
  onClose?: () => void;
}

export const UserAccountSettings: React.FC<UserAccountSettingsProps> = ({
  userId,
  onClose
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security'>('profile');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    avatar: '',
    theme: 'dark' as 'light' | 'dark',
    emailNotifications: true,
    twoFactorEnabled: false
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('constructai_token');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      const response = await axios.get('/api/user/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success && response.data.profile) {
        setProfile(response.data.profile);
        setFormData({
          name: response.data.profile.name || '',
          bio: response.data.profile.bio || '',
          avatar: response.data.profile.avatar || '',
          theme: response.data.profile.preferences?.theme || 'dark',
          emailNotifications: response.data.profile.preferences?.emailNotifications ?? true,
          twoFactorEnabled: response.data.profile.preferences?.twoFactorEnabled ?? false
        });
      }
    } catch (err: any) {
      console.error('Failed to fetch profile:', err);
      setError(err.response?.data?.error || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleThemeChange = (theme: 'light' | 'dark') => {
    setFormData(prev => ({
      ...prev,
      theme
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const token = localStorage.getItem('constructai_token');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      const response = await axios.put('/api/user/profile', {
        name: formData.name,
        bio: formData.bio,
        avatar: formData.avatar,
        preferences: {
          theme: formData.theme,
          emailNotifications: formData.emailNotifications,
          twoFactorEnabled: formData.twoFactorEnabled
        }
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setProfile(response.data.profile);
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setError(err.response?.data?.error || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alert Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-green-800">{success}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'profile'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`flex-1 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'preferences'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              <Bell className="w-4 h-4 inline mr-2" />
              Preferences
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex-1 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'security'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              <Lock className="w-4 h-4 inline mr-2" />
              Security
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tell us about yourself"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    value={profile?.role || 'developer'}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Theme Preference
                  </label>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleThemeChange('light')}
                      className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                        formData.theme === 'light'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 bg-white hover:border-gray-400'
                      }`}
                    >
                      <Sun className="w-5 h-5 mx-auto mb-2" />
                      <span className="text-sm font-medium">Light</span>
                    </button>
                    <button
                      onClick={() => handleThemeChange('dark')}
                      className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                        formData.theme === 'dark'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 bg-white hover:border-gray-400'
                      }`}
                    >
                      <Moon className="w-5 h-5 mx-auto mb-2" />
                      <span className="text-sm font-medium">Dark</span>
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="emailNotifications"
                      checked={formData.emailNotifications}
                      onChange={handleCheckboxChange}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Email Notifications
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-7">
                    Receive email updates about your account activity
                  </p>
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
                </button>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Account Security:</strong> Your account is protected with JWT-based authentication.
                  </p>
                </div>

                <div>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="twoFactorEnabled"
                      checked={formData.twoFactorEnabled}
                      onChange={handleCheckboxChange}
                      disabled
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Two-Factor Authentication (Coming Soon)
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-7">
                    Add an extra layer of security to your account
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Connected Sessions
                  </h3>
                  <div className="p-3 bg-gray-50 rounded border border-gray-200">
                    <p className="text-sm text-gray-700">
                      Current Session
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <button
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
                  onClick={() => {
                    localStorage.removeItem('constructai_token');
                    window.location.href = '/';
                  }}
                >
                  <LogOut className="w-4 h-4 inline mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAccountSettings;
