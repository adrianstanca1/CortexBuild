import React, { useState, useEffect } from 'react';
import { User } from '../../../types';
import { supabase } from '../../../lib/supabase/client';
import toast from 'react-hot-toast';
import { Settings, Save, Lock, Bell, Key, Webhook } from 'lucide-react';

interface CompanySettingsData {
    theme_color: string;
    logo_url: string;
    email_template: string;
    notifications_enabled: boolean;
    two_factor_required: boolean;
    ip_whitelist: string;
    api_keys: Array<{ id: string; name: string; created_at: string }>;
    webhooks: Array<{ id: string; url: string; events: string[] }>;
}

interface CompanySettingsProps {
    currentUser: User;
}

const CompanySettings: React.FC<CompanySettingsProps> = ({ currentUser }) => {
    const [settings, setSettings] = useState<Partial<CompanySettingsData>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'branding' | 'email' | 'security' | 'api' | 'webhooks'>('branding');
    const [newApiKeyName, setNewApiKeyName] = useState('');
    const [newWebhookUrl, setNewWebhookUrl] = useState('');

    useEffect(() => {
        loadSettings();
    }, [currentUser]);

    const loadSettings = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('company_settings')
                .select('*')
                .eq('company_id', currentUser.companyId)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            setSettings(data || {});
        } catch (error) {
            console.error('Error loading settings:', error);
            toast.error('Failed to load settings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const { error } = await supabase
                .from('company_settings')
                .upsert({
                    company_id: currentUser.companyId,
                    ...settings
                });

            if (error) throw error;
            toast.success('Settings saved successfully');
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as any;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const generateApiKey = async () => {
        if (!newApiKeyName.trim()) {
            toast.error('API key name is required');
            return;
        }

        try {
            const apiKey = `sk_${Math.random().toString(36).substr(2, 32)}`;
            const { error } = await supabase.rpc('create_api_key', {
                company_id: currentUser.companyId,
                key_name: newApiKeyName,
                key_value: apiKey
            });

            if (error) throw error;
            toast.success('API key created successfully');
            setNewApiKeyName('');
            loadSettings();
        } catch (error) {
            console.error('Error creating API key:', error);
            toast.error('Failed to create API key');
        }
    };

    const addWebhook = async () => {
        if (!newWebhookUrl.trim()) {
            toast.error('Webhook URL is required');
            return;
        }

        try {
            const { error } = await supabase.rpc('create_webhook', {
                company_id: currentUser.companyId,
                webhook_url: newWebhookUrl,
                events: ['project.created', 'project.updated', 'project.completed']
            });

            if (error) throw error;
            toast.success('Webhook added successfully');
            setNewWebhookUrl('');
            loadSettings();
        } catch (error) {
            console.error('Error adding webhook:', error);
            toast.error('Failed to add webhook');
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center gap-3 mb-6">
                <Settings className="w-8 h-8 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Company Settings</h2>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-200 overflow-x-auto">
                {(['branding', 'email', 'security', 'api', 'webhooks'] as const).map(tab => (
                    <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 font-medium transition-colors capitalize whitespace-nowrap ${activeTab === tab
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Branding Tab */}
            {activeTab === 'branding' && (
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Theme Color</label>
                        <input
                            type="color"
                            name="theme_color"
                            value={settings.theme_color || '#3B82F6'}
                            onChange={handleInputChange}
                            className="w-20 h-10 rounded cursor-pointer"
                            aria-label="Theme color"
                            title="Select theme color"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
                        <input
                            type="url"
                            name="logo_url"
                            placeholder="https://example.com/logo.png"
                            value={settings.logo_url || ''}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            )}

            {/* Email Tab */}
            {activeTab === 'email' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Template</label>
                    <textarea
                        name="email_template"
                        placeholder="Enter email template HTML..."
                        value={settings.email_template || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        rows={8}
                    />
                </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                            <Lock className="w-5 h-5 text-blue-600" />
                            <div>
                                <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                                <p className="text-sm text-gray-600">Require 2FA for all team members</p>
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            name="two_factor_required"
                            checked={settings.two_factor_required || false}
                            onChange={handleInputChange}
                            className="w-5 h-5 rounded"
                            aria-label="Two-factor authentication"
                            title="Require 2FA for all team members"
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                            <Bell className="w-5 h-5 text-blue-600" />
                            <div>
                                <p className="font-medium text-gray-900">Notifications</p>
                                <p className="text-sm text-gray-600">Enable email notifications</p>
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            name="notifications_enabled"
                            checked={settings.notifications_enabled || false}
                            onChange={handleInputChange}
                            className="w-5 h-5 rounded"
                            aria-label="Email notifications"
                            title="Enable email notifications"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">IP Whitelist</label>
                        <textarea
                            name="ip_whitelist"
                            placeholder="Enter IP addresses (one per line)"
                            value={settings.ip_whitelist || ''}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            rows={4}
                        />
                    </div>
                </div>
            )}

            {/* API Tab */}
            {activeTab === 'api' && (
                <div className="space-y-6">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="API key name"
                            value={newApiKeyName}
                            onChange={(e) => setNewApiKeyName(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="button"
                            onClick={generateApiKey}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Generate
                        </button>
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Active API Keys</h3>
                        <div className="space-y-2">
                            {settings.api_keys?.map(key => (
                                <div key={key.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <Key className="w-4 h-4 text-gray-600" />
                                        <div>
                                            <p className="font-medium text-gray-900">{key.name}</p>
                                            <p className="text-xs text-gray-600">Created {new Date(key.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Webhooks Tab */}
            {activeTab === 'webhooks' && (
                <div className="space-y-6">
                    <div className="flex gap-3">
                        <input
                            type="url"
                            placeholder="Webhook URL"
                            value={newWebhookUrl}
                            onChange={(e) => setNewWebhookUrl(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="button"
                            onClick={addWebhook}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Add
                        </button>
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Active Webhooks</h3>
                        <div className="space-y-2">
                            {settings.webhooks?.map(webhook => (
                                <div key={webhook.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Webhook className="w-4 h-4 text-gray-600" />
                                        <p className="font-medium text-gray-900">{webhook.url}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {webhook.events.map(event => (
                                            <span key={event} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                                {event}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Save Button */}
            <div className="mt-8 flex gap-3">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>
        </div>
    );
};

export default CompanySettings;

