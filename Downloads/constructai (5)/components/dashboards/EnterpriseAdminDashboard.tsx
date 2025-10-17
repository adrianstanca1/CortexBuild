/**
 * Enterprise Admin Dashboard
 * Level 4 - Full platform access and control
 * 18 dashboard tabs
 */

import React, { useState } from 'react';
import { BarChart3, Users, Building2, Settings, TrendingUp, AlertCircle, Zap, Lock, FileText, DollarSign, Activity, Shield, Database, Code, Bell, MoreVertical, Download, Filter } from 'lucide-react';

interface TabConfig {
    id: string;
    name: string;
    icon: React.ReactNode;
    component: string;
}

const TABS: TabConfig[] = [
    { id: 'overview', name: 'Overview', icon: <BarChart3 size={18} />, component: 'OverviewTab' },
    { id: 'companies', name: 'Companies', icon: <Building2 size={18} />, component: 'CompaniesTab' },
    { id: 'users', name: 'Users', icon: <Users size={18} />, component: 'UsersTab' },
    { id: 'subscriptions', name: 'Subscriptions', icon: <DollarSign size={18} />, component: 'SubscriptionsTab' },
    { id: 'analytics', name: 'Analytics', icon: <TrendingUp size={18} />, component: 'AnalyticsTab' },
    { id: 'audit-logs', name: 'Audit Logs', icon: <FileText size={18} />, component: 'AuditLogsTab' },
    { id: 'security', name: 'Security', icon: <Shield size={18} />, component: 'SecurityTab' },
    { id: 'api-keys', name: 'API Keys', icon: <Code size={18} />, component: 'APIKeysTab' },
    { id: 'integrations', name: 'Integrations', icon: <Zap size={18} />, component: 'IntegrationsTab' },
    { id: 'marketplace', name: 'Marketplace', icon: <BarChart3 size={18} />, component: 'MarketplaceTab' },
    { id: 'developer-console', name: 'Developer Console', icon: <Code size={18} />, component: 'DeveloperConsoleTab' },
    { id: 'system-health', name: 'System Health', icon: <Activity size={18} />, component: 'SystemHealthTab' },
    { id: 'notifications', name: 'Notifications', icon: <Bell size={18} />, component: 'NotificationsTab' },
    { id: 'settings', name: 'Settings', icon: <Settings size={18} />, component: 'SettingsTab' },
    { id: 'database', name: 'Database', icon: <Database size={18} />, component: 'DatabaseTab' },
    { id: 'reports', name: 'Reports', icon: <FileText size={18} />, component: 'ReportsTab' },
    { id: 'alerts', name: 'Alerts', icon: <AlertCircle size={18} />, component: 'AlertsTab' },
    { id: 'access-control', name: 'Access Control', icon: <Lock size={18} />, component: 'AccessControlTab' }
];

export const EnterpriseAdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats] = useState({
        totalCompanies: 156,
        activeUsers: 2847,
        totalRevenue: '$1.2M',
        systemUptime: '99.98%',
        apiRequests: '2.3M',
        activeSubscriptions: 1203
    });

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return <OverviewTab stats={stats} />;
            case 'companies':
                return <CompaniesTab />;
            case 'users':
                return <UsersTab />;
            case 'subscriptions':
                return <SubscriptionsTab />;
            case 'analytics':
                return <AnalyticsTab />;
            case 'audit-logs':
                return <AuditLogsTab />;
            case 'security':
                return <SecurityTab />;
            case 'api-keys':
                return <APIKeysTab />;
            case 'system-health':
                return <SystemHealthTab />;
            default:
                return <div className="p-6 text-gray-500">Tab content coming soon...</div>;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <div className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Enterprise Admin Dashboard</h1>
                        <p className="text-gray-400 mt-1">Full platform access and control</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-gray-400 hover:text-white">
                            <Download size={20} />
                        </button>
                        <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-gray-400 hover:text-white">
                            <Filter size={20} />
                        </button>
                        <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-gray-400 hover:text-white">
                            <MoreVertical size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 p-6">
                <StatCard label="Companies" value={stats.totalCompanies} icon={<Building2 size={20} />} />
                <StatCard label="Active Users" value={stats.activeUsers} icon={<Users size={20} />} />
                <StatCard label="Revenue" value={stats.totalRevenue} icon={<DollarSign size={20} />} />
                <StatCard label="Uptime" value={stats.systemUptime} icon={<Activity size={20} />} />
                <StatCard label="API Requests" value={stats.apiRequests} icon={<Code size={20} />} />
                <StatCard label="Subscriptions" value={stats.activeSubscriptions} icon={<TrendingUp size={20} />} />
            </div>

            {/* Tabs */}
            <div className="px-6">
                <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
                    {/* Tab Navigation */}
                    <div className="flex overflow-x-auto border-b border-slate-700 bg-slate-800/30">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 whitespace-nowrap transition-colors border-b-2 ${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-400 bg-slate-700/50'
                                        : 'border-transparent text-gray-400 hover:text-gray-300'
                                }`}
                            >
                                {tab.icon}
                                <span className="text-sm font-medium">{tab.name}</span>
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {renderTabContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Stat Card Component
const StatCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode }> = ({ label, value, icon }) => (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors">
        <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">{label}</p>
            <div className="text-blue-400">{icon}</div>
        </div>
        <p className="text-2xl font-bold text-white">{value}</p>
    </div>
);

// Tab Components
const OverviewTab: React.FC<{ stats: any }> = ({ stats }) => (
    <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-700/50 rounded p-4">
                <p className="text-gray-400 text-sm mb-2">Platform Status</p>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <p className="text-white font-semibold">All Systems Operational</p>
                </div>
            </div>
            <div className="bg-slate-700/50 rounded p-4">
                <p className="text-gray-400 text-sm mb-2">Last Updated</p>
                <p className="text-white font-semibold">2 minutes ago</p>
            </div>
        </div>
        <p className="text-gray-400">Platform overview and key metrics displayed here.</p>
    </div>
);

const CompaniesTab: React.FC = () => (
    <div className="space-y-4">
        <p className="text-gray-400">Manage all companies on the platform</p>
        <div className="bg-slate-700/50 rounded p-4 text-gray-400">Company management interface</div>
    </div>
);

const UsersTab: React.FC = () => (
    <div className="space-y-4">
        <p className="text-gray-400">Manage all users across the platform</p>
        <div className="bg-slate-700/50 rounded p-4 text-gray-400">User management interface</div>
    </div>
);

const SubscriptionsTab: React.FC = () => (
    <div className="space-y-4">
        <p className="text-gray-400">Manage subscriptions and billing</p>
        <div className="bg-slate-700/50 rounded p-4 text-gray-400">Subscription management interface</div>
    </div>
);

const AnalyticsTab: React.FC = () => (
    <div className="space-y-4">
        <p className="text-gray-400">Platform analytics and insights</p>
        <div className="bg-slate-700/50 rounded p-4 text-gray-400">Analytics dashboard</div>
    </div>
);

const AuditLogsTab: React.FC = () => (
    <div className="space-y-4">
        <p className="text-gray-400">View all system audit logs</p>
        <div className="bg-slate-700/50 rounded p-4 text-gray-400">Audit logs viewer</div>
    </div>
);

const SecurityTab: React.FC = () => (
    <div className="space-y-4">
        <p className="text-gray-400">Security settings and controls</p>
        <div className="bg-slate-700/50 rounded p-4 text-gray-400">Security management interface</div>
    </div>
);

const APIKeysTab: React.FC = () => (
    <div className="space-y-4">
        <p className="text-gray-400">Manage API keys and access tokens</p>
        <div className="bg-slate-700/50 rounded p-4 text-gray-400">API key management interface</div>
    </div>
);

const SystemHealthTab: React.FC = () => (
    <div className="space-y-4">
        <p className="text-gray-400">Monitor system health and performance</p>
        <div className="bg-slate-700/50 rounded p-4 text-gray-400">System health monitoring</div>
    </div>
);

export default EnterpriseAdminDashboard;

