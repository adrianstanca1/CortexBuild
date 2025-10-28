/**
 * System Settings Manager - Advanced system configuration
 */

import React, { useState } from 'react';
import {
    Settings,
    Shield,
    Mail,
    Globe,
    Database,
    Key,
    Bell,
    Lock,
    Server,
    Zap,
    Save,
    RefreshCw,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SystemSettingsManagerProps {
    isDarkMode?: boolean;
}

interface SystemSettings {
    // General
    siteName: string;
    siteUrl: string;
    maintenanceMode: boolean;
    
    // Security
    twoFactorRequired: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordMinLength: number;
    
    // Email
    emailProvider: 'smtp' | 'sendgrid' | 'mailgun';
    emailFrom: string;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    
    // API
    apiRateLimit: number;
    apiTimeout: number;
    corsEnabled: boolean;
    corsOrigins: string;
    
    // Storage
    maxFileSize: number;
    allowedFileTypes: string;
    storageProvider: 'local' | 'supabase' | 's3';
    
    // Notifications
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
}

const SystemSettingsManager: React.FC<SystemSettingsManagerProps> = ({ isDarkMode = true }) => {
    const [settings, setSettings] = useState<SystemSettings>({
        siteName: 'CortexBuild',
        siteUrl: 'https://cortexbuild.com',
        maintenanceMode: false,
        twoFactorRequired: false,
        sessionTimeout: 3600,
        maxLoginAttempts: 5,
        passwordMinLength: 8,
        emailProvider: 'smtp',
        emailFrom: 'noreply@cortexbuild.com',
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        smtpUser: '',
        smtpPassword: '',
        apiRateLimit: 1000,
        apiTimeout: 30,
        corsEnabled: true,
        corsOrigins: '*',
        maxFileSize: 10,
        allowedFileTypes: '.jpg,.png,.pdf,.doc,.docx',
        storageProvider: 'supabase',
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true
    });

    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        toast.loading('Saving settings...');
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setIsSaving(false);
        toast.dismiss();
        toast.success('Settings saved successfully!');
    };

    const handleReset = () => {
        toast.success('Settings reset to defaults');
    };

    const textClass = isDarkMode ? 'text-white' : 'text-gray-900';
    const mutedClass = isDarkMode ? 'text-gray-400' : 'text-gray-600';
    const bgClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
    const inputClass = isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900';

    return (
        <div className={`p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className={`text-4xl font-black mb-2 ${textClass}`}>
                        ⚙️ System Settings
                    </h1>
                    <p className={`text-lg ${mutedClass}`}>
                        Configure system-wide settings and preferences
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mb-8">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold disabled:opacity-50"
                    >
                        <Save className="h-5 w-5" />
                        Save Changes
                    </button>
                    <button
                        type="button"
                        onClick={handleReset}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl font-semibold"
                    >
                        <RefreshCw className="h-5 w-5" />
                        Reset to Defaults
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* General Settings */}
                    <div className={`p-6 rounded-2xl border ${bgClass}`}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                <Settings className="h-5 w-5 text-blue-500" />
                            </div>
                            <h2 className={`text-xl font-bold ${textClass}`}>General Settings</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className={`block text-sm font-semibold mb-2 ${textClass}`}>
                                    Site Name
                                </label>
                                <input
                                    type="text"
                                    value={settings.siteName}
                                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                                    className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-semibold mb-2 ${textClass}`}>
                                    Site URL
                                </label>
                                <input
                                    type="url"
                                    value={settings.siteUrl}
                                    onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
                                    className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className={`font-semibold ${textClass}`}>Maintenance Mode</div>
                                    <div className={`text-sm ${mutedClass}`}>Disable public access</div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${
                                        settings.maintenanceMode ? 'bg-green-500' : 'bg-gray-600'
                                    }`}
                                >
                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                        settings.maintenanceMode ? 'transform translate-x-6' : ''
                                    }`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Security Settings */}
                    <div className={`p-6 rounded-2xl border ${bgClass}`}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                                <Shield className="h-5 w-5 text-red-500" />
                            </div>
                            <h2 className={`text-xl font-bold ${textClass}`}>Security Settings</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className={`font-semibold ${textClass}`}>Require 2FA</div>
                                    <div className={`text-sm ${mutedClass}`}>Two-factor authentication</div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSettings({ ...settings, twoFactorRequired: !settings.twoFactorRequired })}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${
                                        settings.twoFactorRequired ? 'bg-green-500' : 'bg-gray-600'
                                    }`}
                                >
                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                        settings.twoFactorRequired ? 'transform translate-x-6' : ''
                                    }`} />
                                </button>
                            </div>
                            <div>
                                <label className={`block text-sm font-semibold mb-2 ${textClass}`}>
                                    Session Timeout (seconds)
                                </label>
                                <input
                                    type="number"
                                    value={settings.sessionTimeout}
                                    onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                                    className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-semibold mb-2 ${textClass}`}>
                                    Max Login Attempts
                                </label>
                                <input
                                    type="number"
                                    value={settings.maxLoginAttempts}
                                    onChange={(e) => setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) })}
                                    className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Email Settings */}
                    <div className={`p-6 rounded-2xl border ${bgClass}`}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                <Mail className="h-5 w-5 text-purple-500" />
                            </div>
                            <h2 className={`text-xl font-bold ${textClass}`}>Email Settings</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className={`block text-sm font-semibold mb-2 ${textClass}`}>
                                    Email Provider
                                </label>
                                <select
                                    value={settings.emailProvider}
                                    onChange={(e) => setSettings({ ...settings, emailProvider: e.target.value as any })}
                                    className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                                >
                                    <option value="smtp">SMTP</option>
                                    <option value="sendgrid">SendGrid</option>
                                    <option value="mailgun">Mailgun</option>
                                </select>
                            </div>
                            <div>
                                <label className={`block text-sm font-semibold mb-2 ${textClass}`}>
                                    From Email
                                </label>
                                <input
                                    type="email"
                                    value={settings.emailFrom}
                                    onChange={(e) => setSettings({ ...settings, emailFrom: e.target.value })}
                                    className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* API Settings */}
                    <div className={`p-6 rounded-2xl border ${bgClass}`}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                <Globe className="h-5 w-5 text-green-500" />
                            </div>
                            <h2 className={`text-xl font-bold ${textClass}`}>API Settings</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className={`block text-sm font-semibold mb-2 ${textClass}`}>
                                    Rate Limit (requests/hour)
                                </label>
                                <input
                                    type="number"
                                    value={settings.apiRateLimit}
                                    onChange={(e) => setSettings({ ...settings, apiRateLimit: parseInt(e.target.value) })}
                                    className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className={`font-semibold ${textClass}`}>CORS Enabled</div>
                                    <div className={`text-sm ${mutedClass}`}>Cross-origin requests</div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSettings({ ...settings, corsEnabled: !settings.corsEnabled })}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${
                                        settings.corsEnabled ? 'bg-green-500' : 'bg-gray-600'
                                    }`}
                                >
                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                        settings.corsEnabled ? 'transform translate-x-6' : ''
                                    }`} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemSettingsManager;

