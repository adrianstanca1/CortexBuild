/**
 * Admin Control Panel - Complete admin interface with all management functions
 */

import React, { useState } from 'react';
import {
    LayoutDashboard,
    Users,
    Package,
    Database,
    BarChart3,
    Settings,
    Shield,
    CreditCard,
    FileText,
    Bell,
    Lock,
    Globe,
    Zap
} from 'lucide-react';

// Import all admin components
import SuperAdminDashboard from './SuperAdminDashboard';
import EnhancedSuperAdminDashboard from './EnhancedSuperAdminDashboard';
import UserRolesPermissions from '../user-management/UserRolesPermissions';
import TeamCollaboration from '../user-management/TeamCollaboration';
import AppSharingReviews from '../user-management/AppSharingReviews';
import BillingPayments from '../user-management/BillingPayments';
import AdvancedCodeEditor from '../development/AdvancedCodeEditor';
import GitIntegration from '../development/GitIntegration';
import APIBuilder from '../development/APIBuilder';
import TestingFramework from '../development/TestingFramework';
import AnalyticsDashboard from '../development/AnalyticsDashboard';
import DatabaseViewer from '../developer/DatabaseViewer';
import Marketplace from '../apps/Marketplace';
import { APP_REGISTRY } from '../apps/appRegistry';
import SystemSettingsManager from './SystemSettingsManager';

interface AdminControlPanelProps {
    isDarkMode?: boolean;
    onLogout?: () => void;
}

type AdminTab =
    | 'dashboard'
    | 'users'
    | 'teams'
    | 'apps'
    | 'database'
    | 'analytics'
    | 'billing'
    | 'code-editor'
    | 'git'
    | 'api'
    | 'testing'
    | 'marketplace'
    | 'settings';

const AdminControlPanel: React.FC<AdminControlPanelProps> = ({ isDarkMode = true, onLogout }) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
    const [apps] = useState(APP_REGISTRY);

    const tabs = [
        { id: 'dashboard' as AdminTab, name: 'Dashboard', icon: LayoutDashboard, color: 'from-purple-600 to-indigo-600' },
        { id: 'users' as AdminTab, name: 'Users & Roles', icon: Users, color: 'from-blue-600 to-cyan-600' },
        { id: 'teams' as AdminTab, name: 'Teams', icon: Shield, color: 'from-green-600 to-emerald-600' },
        { id: 'apps' as AdminTab, name: 'App Sharing', icon: Package, color: 'from-orange-600 to-red-600' },
        { id: 'marketplace' as AdminTab, name: 'Marketplace', icon: Globe, color: 'from-pink-600 to-rose-600' },
        { id: 'database' as AdminTab, name: 'Database', icon: Database, color: 'from-teal-600 to-cyan-600' },
        { id: 'analytics' as AdminTab, name: 'Analytics', icon: BarChart3, color: 'from-yellow-600 to-orange-600' },
        { id: 'billing' as AdminTab, name: 'Billing', icon: CreditCard, color: 'from-indigo-600 to-purple-600' },
        { id: 'code-editor' as AdminTab, name: 'Code Editor', icon: FileText, color: 'from-red-600 to-pink-600' },
        { id: 'git' as AdminTab, name: 'Git', icon: Zap, color: 'from-cyan-600 to-blue-600' },
        { id: 'api' as AdminTab, name: 'API Builder', icon: Globe, color: 'from-emerald-600 to-green-600' },
        { id: 'testing' as AdminTab, name: 'Testing', icon: Bell, color: 'from-purple-600 to-pink-600' },
        { id: 'settings' as AdminTab, name: 'Settings', icon: Settings, color: 'from-gray-600 to-slate-600' }
    ];

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Top Navigation */}
            <div className={`sticky top-0 z-50 ${isDarkMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-white border-b border-gray-200'}`}>
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                                <Shield className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Super Admin Panel
                                </h1>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Full system control
                                </p>
                            </div>
                        </div>
                        {onLogout && (
                            <button
                                type="button"
                                onClick={onLogout}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold"
                            >
                                Logout
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className={`sticky top-[73px] z-40 ${isDarkMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-white border-b border-gray-200'}`}>
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center gap-2 overflow-x-auto py-4">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${activeTab === tab.id
                                        ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                                        : isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {tab.name}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-7xl mx-auto">
                {activeTab === 'dashboard' && (
                    <EnhancedSuperAdminDashboard
                        isDarkMode={isDarkMode}
                        onNavigate={(section) => {
                            // Map sections to tabs
                            const sectionToTab: Record<string, AdminTab> = {
                                'user-management': 'users',
                                'company-management': 'teams',
                                'billing-payments': 'billing',
                                'analytics-reports': 'analytics',
                                'system-settings': 'settings',
                                'database-management': 'database',
                                'content-management': 'apps'
                            };
                            const tab = sectionToTab[section];
                            if (tab) setActiveTab(tab);
                        }}
                    />
                )}

                {activeTab === 'users' && (
                    <div className="p-8">
                        <UserRolesPermissions isDarkMode={isDarkMode} />
                    </div>
                )}

                {activeTab === 'teams' && (
                    <div className="p-8">
                        <TeamCollaboration isDarkMode={isDarkMode} />
                    </div>
                )}

                {activeTab === 'apps' && (
                    <div className="p-8">
                        <AppSharingReviews isDarkMode={isDarkMode} />
                    </div>
                )}

                {activeTab === 'marketplace' && (
                    <div className="p-8">
                        <Marketplace
                            apps={apps}
                            onInstall={(appId) => console.log('Install app:', appId)}
                            onLaunch={(appId) => console.log('Launch app:', appId)}
                            isDarkMode={isDarkMode}
                        />
                    </div>
                )}

                {activeTab === 'database' && (
                    <div className="p-8">
                        <DatabaseViewer isDarkMode={isDarkMode} />
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className="p-8">
                        <AnalyticsDashboard isDarkMode={isDarkMode} />
                    </div>
                )}

                {activeTab === 'billing' && (
                    <div className="p-8">
                        <BillingPayments isDarkMode={isDarkMode} />
                    </div>
                )}

                {activeTab === 'code-editor' && (
                    <div className="p-8">
                        <AdvancedCodeEditor isDarkMode={isDarkMode} />
                    </div>
                )}

                {activeTab === 'git' && (
                    <div className="p-8">
                        <GitIntegration isDarkMode={isDarkMode} />
                    </div>
                )}

                {activeTab === 'api' && (
                    <div className="p-8">
                        <APIBuilder isDarkMode={isDarkMode} />
                    </div>
                )}

                {activeTab === 'testing' && (
                    <div className="p-8">
                        <TestingFramework isDarkMode={isDarkMode} />
                    </div>
                )}

                {activeTab === 'settings' && (
                    <SystemSettingsManager isDarkMode={isDarkMode} />
                )}
            </div>
        </div>
    );
};

export default AdminControlPanel;

