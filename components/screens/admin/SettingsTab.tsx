import React, { useState, useEffect } from 'react';
import {
    Settings, Shield, Mail, Key, Bell, Lock, Globe,
    Save, RefreshCw, Eye, EyeOff, Copy, Check, Trash2,
    Plus, Edit2, AlertCircle, CheckCircle
} from 'lucide-react';
import { supabase } from '../../../lib/supabase/client';
import toast from 'react-hot-toast';

interface PlatformConfig {
    siteName: string;
    siteUrl: string;
    supportEmail: string;
    maxUsersPerCompany: number;
    enableRegistration: boolean;
    enableEmailVerification: boolean;
    sessionTimeout: number;
    maintenanceMode: boolean;
}

interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
    type: 'welcome' | 'password_reset' | 'invoice' | 'notification';
}

interface ApiKey {
    id: string;
    name: string;
    key: string;
    created_at: string;
    last_used?: string;
    permissions: string[];
}

interface NotificationRule {
    id: string;
    name: string;
    event: string;
    channels: ('email' | 'sms' | 'push')[];
    enabled: boolean;
}

export const SettingsTab: React.FC = () => {
    const [activeSection, setActiveSection] = useState<'platform' | 'email' | 'security' | 'api' | 'notifications'>('platform');
    const [saving, setSaving] = useState(false);

    // Platform Configuration
    const [platformConfig, setPlatformConfig] = useState<PlatformConfig>({
        siteName: 'CortexBuild',
        siteUrl: 'https://cortexbuild.com',
        supportEmail: 'support@cortexbuild.com',
        maxUsersPerCompany: 50,
        enableRegistration: true,
        enableEmailVerification: true,
        sessionTimeout: 30,
        maintenanceMode: false
    });

    // Email Templates
    const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([
        {
            id: '1',
            name: 'Welcome Email',
            subject: 'Welcome to {{siteName}}!',
            body: 'Hi {{userName}},\n\nWelcome to {{siteName}}! We\'re excited to have you on board.',
            type: 'welcome'
        },
        {
            id: '2',
            name: 'Password Reset',
            subject: 'Reset Your Password',
            body: 'Hi {{userName}},\n\nClick the link below to reset your password:\n{{resetLink}}',
            type: 'password_reset'
        }
    ]);

    // API Keys
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [showApiKey, setShowApiKey] = useState<string | null>(null);

    // Notification Rules
    const [notificationRules, setNotificationRules] = useState<NotificationRule[]>([
        {
            id: '1',
            name: 'Critical System Alerts',
            event: 'system.critical',
            channels: ['email', 'sms'],
            enabled: true
        },
        {
            id: '2',
            name: 'New User Registration',
            event: 'user.created',
            channels: ['email'],
            enabled: true
        },
        {
            id: '3',
            name: 'Payment Received',
            event: 'payment.received',
            channels: ['email'],
            enabled: true
        }
    ]);

    // Load API Keys
    useEffect(() => {
        loadApiKeys();
    }, []);

    const loadApiKeys = async () => {
        try {
            const { data, error } = await supabase
                .from('api_keys')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setApiKeys(data);
        } catch (error) {
            console.error('Error loading API keys:', error);
        }
    };

    const savePlatformConfig = async () => {
        setSaving(true);
        try {
            // Save to Supabase or localStorage
            localStorage.setItem('platformConfig', JSON.stringify(platformConfig));
            toast.success('Platform configuration saved');
        } catch (error) {
            toast.error('Failed to save configuration');
        } finally {
            setSaving(false);
        }
    };

    const generateApiKey = async () => {
        const newKey = {
            id: Date.now().toString(),
            name: `API Key ${apiKeys.length + 1}`,
            key: `sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
            created_at: new Date().toISOString(),
            permissions: ['read', 'write']
        };

        try {
            const { error } = await supabase
                .from('api_keys')
                .insert([newKey]);

            if (error) throw error;

            setApiKeys([newKey, ...apiKeys]);
            toast.success('API key generated');
        } catch (error) {
            console.error('Error generating API key:', error);
            toast.error('Failed to generate API key');
        }
    };

    const deleteApiKey = async (id: string) => {
        if (!confirm('Are you sure you want to delete this API key?')) return;

        try {
            const { error } = await supabase
                .from('api_keys')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setApiKeys(apiKeys.filter(k => k.id !== id));
            toast.success('API key deleted');
        } catch (error) {
            console.error('Error deleting API key:', error);
            toast.error('Failed to delete API key');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    const toggleNotificationRule = (id: string) => {
        setNotificationRules(rules =>
            rules.map(rule =>
                rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
            )
        );
        toast.success('Notification rule updated');
    };

    return (
        <div className="space-y-6">
            {/* Section Navigation */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-2">
                <div className="flex gap-2 overflow-x-auto">
                    <button
                        type="button"
                        onClick={() => setActiveSection('platform')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeSection === 'platform'
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <Globe className="w-4 h-4 inline mr-2" />
                        Platform
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveSection('email')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeSection === 'email'
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <Mail className="w-4 h-4 inline mr-2" />
                        Email Templates
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveSection('security')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeSection === 'security'
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <Shield className="w-4 h-4 inline mr-2" />
                        Security
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveSection('api')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeSection === 'api'
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <Key className="w-4 h-4 inline mr-2" />
                        API Keys
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveSection('notifications')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeSection === 'notifications'
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <Bell className="w-4 h-4 inline mr-2" />
                        Notifications
                    </button>
                </div>
            </div>

            {/* Platform Configuration */}
            {activeSection === 'platform' && (
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Platform Configuration</h3>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Site Name
                                </label>
                                <input
                                    type="text"
                                    value={platformConfig.siteName}
                                    onChange={(e) => setPlatformConfig({ ...platformConfig, siteName: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    aria-label="Site name"
                                    title="Site name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Site URL
                                </label>
                                <input
                                    type="url"
                                    value={platformConfig.siteUrl}
                                    onChange={(e) => setPlatformConfig({ ...platformConfig, siteUrl: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    aria-label="Site URL"
                                    title="Site URL"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Support Email
                                </label>
                                <input
                                    type="email"
                                    value={platformConfig.supportEmail}
                                    onChange={(e) => setPlatformConfig({ ...platformConfig, supportEmail: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    aria-label="Support email"
                                    title="Support email"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Max Users Per Company
                                </label>
                                <input
                                    type="number"
                                    value={platformConfig.maxUsersPerCompany}
                                    onChange={(e) => setPlatformConfig({ ...platformConfig, maxUsersPerCompany: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    aria-label="Max users per company"
                                    title="Max users per company"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Session Timeout (minutes)
                                </label>
                                <input
                                    type="number"
                                    value={platformConfig.sessionTimeout}
                                    onChange={(e) => setPlatformConfig({ ...platformConfig, sessionTimeout: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    aria-label="Session timeout"
                                    title="Session timeout in minutes"
                                />
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-gray-200">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={platformConfig.enableRegistration}
                                    onChange={(e) => setPlatformConfig({ ...platformConfig, enableRegistration: e.target.checked })}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <div>
                                    <div className="text-sm font-medium text-gray-900">Enable Registration</div>
                                    <div className="text-xs text-gray-500">Allow new users to register</div>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={platformConfig.enableEmailVerification}
                                    onChange={(e) => setPlatformConfig({ ...platformConfig, enableEmailVerification: e.target.checked })}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <div>
                                    <div className="text-sm font-medium text-gray-900">Email Verification</div>
                                    <div className="text-xs text-gray-500">Require email verification for new users</div>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={platformConfig.maintenanceMode}
                                    onChange={(e) => setPlatformConfig({ ...platformConfig, maintenanceMode: e.target.checked })}
                                    className="w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500"
                                />
                                <div>
                                    <div className="text-sm font-medium text-gray-900">Maintenance Mode</div>
                                    <div className="text-xs text-gray-500">Put the platform in maintenance mode</div>
                                </div>
                            </label>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="button"
                                onClick={savePlatformConfig}
                                disabled={saving}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Configuration
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Email Templates */}
            {activeSection === 'email' && (
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Email Templates</h3>
                        <button
                            type="button"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            New Template
                        </button>
                    </div>

                    <div className="space-y-4">
                        {emailTemplates.map((template) => (
                            <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{template.name}</h4>
                                        <p className="text-sm text-gray-500 mt-1">Type: {template.type}</p>
                                    </div>
                                    <button
                                        type="button"
                                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                                        aria-label="Edit template"
                                        title="Edit template"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <div>
                                        <label className="text-xs text-gray-500">Subject</label>
                                        <p className="text-sm text-gray-900">{template.subject}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Body Preview</label>
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-3">{template.body}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* API Keys */}
            {activeSection === 'api' && (
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">API Keys</h3>
                        <button
                            type="button"
                            onClick={generateApiKey}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Generate New Key
                        </button>
                    </div>

                    <div className="space-y-3">
                        {apiKeys.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <Key className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p className="text-sm">No API keys generated yet</p>
                            </div>
                        ) : (
                            apiKeys.map((apiKey) => (
                                <div key={apiKey.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900">{apiKey.name}</h4>
                                            <div className="flex items-center gap-2 mt-2">
                                                <code className="text-sm bg-gray-100 px-3 py-1 rounded font-mono">
                                                    {showApiKey === apiKey.id ? apiKey.key : '••••••••••••••••'}
                                                </code>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowApiKey(showApiKey === apiKey.id ? null : apiKey.id)}
                                                    className="p-1 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showApiKey === apiKey.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => copyToClipboard(apiKey.key)}
                                                    className="p-1 text-gray-400 hover:text-blue-600"
                                                    aria-label="Copy API key"
                                                    title="Copy API key"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                <span>Created: {new Date(apiKey.created_at).toLocaleDateString()}</span>
                                                {apiKey.last_used && <span>Last used: {new Date(apiKey.last_used).toLocaleDateString()}</span>}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => deleteApiKey(apiKey.id)}
                                            className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                                            aria-label="Delete API key"
                                            title="Delete API key"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Notification Rules */}
            {activeSection === 'notifications' && (
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Notification Rules</h3>
                        <button
                            type="button"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            New Rule
                        </button>
                    </div>

                    <div className="space-y-3">
                        {notificationRules.map((rule) => (
                            <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <h4 className="font-semibold text-gray-900">{rule.name}</h4>
                                            {rule.enabled ? (
                                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                                                    <CheckCircle className="w-3 h-3" />
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                    Inactive
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">Event: {rule.event}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            {rule.channels.map((channel) => (
                                                <span key={channel} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                                                    {channel}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={rule.enabled}
                                            onChange={() => toggleNotificationRule(rule.id)}
                                            className="sr-only peer"
                                            aria-label="Toggle notification rule"
                                            title="Toggle notification rule"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Security Settings */}
            {activeSection === 'security' && (
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Security Settings</h3>

                    <div className="space-y-6">
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-4">Password Policy</h4>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3">
                                    <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                                    <span className="text-sm text-gray-700">Require minimum 8 characters</span>
                                </label>
                                <label className="flex items-center gap-3">
                                    <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                                    <span className="text-sm text-gray-700">Require uppercase letters</span>
                                </label>
                                <label className="flex items-center gap-3">
                                    <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                                    <span className="text-sm text-gray-700">Require numbers</span>
                                </label>
                                <label className="flex items-center gap-3">
                                    <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                                    <span className="text-sm text-gray-700">Require special characters</span>
                                </label>
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-4">Two-Factor Authentication</h4>
                            <label className="flex items-center gap-3">
                                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                                <span className="text-sm text-gray-700">Require 2FA for all admin users</span>
                            </label>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-4">IP Whitelist</h4>
                            <p className="text-sm text-gray-500 mb-3">Restrict admin access to specific IP addresses</p>
                            <textarea
                                placeholder="Enter IP addresses (one per line)"
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="button"
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                Save Security Settings
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsTab;

