/**
 * Company Admin Dashboard
 * Level 3 - Company-wide management and control
 * 15 dashboard tabs
 */

import React, { useState } from 'react';
import { BarChart3, Users, FolderOpen, Settings, TrendingUp, FileText, Zap, Bell, DollarSign, Activity, Shield, Code, Calendar, Target, MoreVertical, Download, Filter } from 'lucide-react';

interface TabConfig {
    id: string;
    name: string;
    icon: React.ReactNode;
    component: string;
}

const TABS: TabConfig[] = [
    { id: 'overview', name: 'Overview', icon: <BarChart3 size={18} />, component: 'OverviewTab' },
    { id: 'teams', name: 'Teams', icon: <Users size={18} />, component: 'TeamsTab' },
    { id: 'projects', name: 'Projects', icon: <FolderOpen size={18} />, component: 'ProjectsTab' },
    { id: 'members', name: 'Members', icon: <Users size={18} />, component: 'MembersTab' },
    { id: 'analytics', name: 'Analytics', icon: <TrendingUp size={18} />, component: 'AnalyticsTab' },
    { id: 'billing', name: 'Billing', icon: <DollarSign size={18} />, component: 'BillingTab' },
    { id: 'marketplace', name: 'Marketplace', icon: <Zap size={18} />, component: 'MarketplaceTab' },
    { id: 'integrations', name: 'Integrations', icon: <Code size={18} />, component: 'IntegrationsTab' },
    { id: 'activity', name: 'Activity', icon: <Activity size={18} />, component: 'ActivityTab' },
    { id: 'calendar', name: 'Calendar', icon: <Calendar size={18} />, component: 'CalendarTab' },
    { id: 'reports', name: 'Reports', icon: <FileText size={18} />, component: 'ReportsTab' },
    { id: 'settings', name: 'Settings', icon: <Settings size={18} />, component: 'SettingsTab' },
    { id: 'security', name: 'Security', icon: <Shield size={18} />, component: 'SecurityTab' },
    { id: 'notifications', name: 'Notifications', icon: <Bell size={18} />, component: 'NotificationsTab' },
    { id: 'goals', name: 'Goals', icon: <Target size={18} />, component: 'GoalsTab' }
];

export const CompanyAdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats] = useState({
        totalTeams: 12,
        activeProjects: 28,
        teamMembers: 156,
        completionRate: '87%',
        monthlyBudget: '$45,000',
        spentBudget: '$32,500'
    });

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return <OverviewTab stats={stats} />;
            case 'teams':
                return <TeamsTab />;
            case 'projects':
                return <ProjectsTab />;
            case 'members':
                return <MembersTab />;
            case 'analytics':
                return <AnalyticsTab />;
            case 'billing':
                return <BillingTab stats={stats} />;
            case 'marketplace':
                return <MarketplaceTab />;
            case 'integrations':
                return <IntegrationsTab />;
            case 'activity':
                return <ActivityTab />;
            case 'calendar':
                return <CalendarTab />;
            case 'reports':
                return <ReportsTab />;
            case 'settings':
                return <SettingsTab />;
            case 'security':
                return <SecurityTab />;
            case 'notifications':
                return <NotificationsTab />;
            case 'goals':
                return <GoalsTab />;
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
                        <h1 className="text-3xl font-bold text-white">Company Admin Dashboard</h1>
                        <p className="text-gray-400 mt-1">Company-wide management and control</p>
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
                <StatCard label="Teams" value={stats.totalTeams} icon={<Users size={20} />} />
                <StatCard label="Projects" value={stats.activeProjects} icon={<FolderOpen size={20} />} />
                <StatCard label="Members" value={stats.teamMembers} icon={<Users size={20} />} />
                <StatCard label="Completion" value={stats.completionRate} icon={<TrendingUp size={20} />} />
                <StatCard label="Budget" value={stats.monthlyBudget} icon={<DollarSign size={20} />} />
                <StatCard label="Spent" value={stats.spentBudget} icon={<Activity size={20} />} />
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
                                        ? 'border-purple-500 text-purple-400 bg-slate-700/50'
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
            <div className="text-purple-400">{icon}</div>
        </div>
        <p className="text-2xl font-bold text-white">{value}</p>
    </div>
);

// Tab Components
const OverviewTab: React.FC<{ stats: any }> = ({ stats }) => (
    <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-700/50 rounded p-4">
                <p className="text-gray-400 text-sm mb-2">Company Status</p>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <p className="text-white font-semibold">Active</p>
                </div>
            </div>
            <div className="bg-slate-700/50 rounded p-4">
                <p className="text-gray-400 text-sm mb-2">Budget Usage</p>
                <p className="text-white font-semibold">72% of monthly budget</p>
            </div>
        </div>
        <p className="text-gray-400">Company overview and key metrics displayed here.</p>
    </div>
);

const TeamsTab: React.FC = () => (
    <div className="space-y-4">
        <p className="text-gray-400">Manage company teams</p>
        <div className="bg-slate-700/50 rounded p-4 text-gray-400">Teams management interface</div>
    </div>
);

const ProjectsTab: React.FC = () => (
    <div className="space-y-4">
        <p className="text-gray-400">Manage company projects</p>
        <div className="bg-slate-700/50 rounded p-4 text-gray-400">Projects management interface</div>
    </div>
);

const MembersTab: React.FC = () => (
    <div className="space-y-4">
        <p className="text-gray-400">Manage team members</p>
        <div className="bg-slate-700/50 rounded p-4 text-gray-400">Members management interface</div>
    </div>
);

const AnalyticsTab: React.FC = () => (
    <div className="space-y-4">
        <p className="text-gray-400">Company analytics and insights</p>
        <div className="bg-slate-700/50 rounded p-4 text-gray-400">Analytics dashboard</div>
    </div>
);

const BillingTab: React.FC<{ stats: any }> = ({ stats }) => (
    <div className="space-y-4">
        <p className="text-gray-400">Manage billing and subscriptions</p>
        <div className="bg-slate-700/50 rounded p-4">
            <p className="text-gray-400 text-sm mb-2">Monthly Budget: {stats.monthlyBudget}</p>
            <p className="text-gray-400 text-sm">Spent: {stats.spentBudget}</p>
        </div>
    </div>
);

const MarketplaceTab: React.FC = () => (
    <div className="space-y-4">
        <p className="text-gray-400">Browse and install marketplace apps</p>
        <div className="bg-slate-700/50 rounded p-4 text-gray-400">Marketplace interface</div>
    </div>
);

const IntegrationsTab: React.FC = () => (
    <div className="space-y-4">
        <p className="text-gray-400">Manage integrations</p>
        <div className="bg-slate-700/50 rounded p-4 text-gray-400">Integrations management</div>
    </div>
);

const ActivityTab: React.FC = () => (
    <div className="space-y-4">
        <p className="text-gray-400">View company activity</p>
        <div className="bg-slate-700/50 rounded p-4 text-gray-400">Activity log</div>
    </div>
);

const CalendarTab: React.FC = () => (
    <div className="space-y-4">
        <p className="text-gray-400">Company calendar and events</p>
        <div className="bg-slate-700/50 rounded p-4 text-gray-400">Calendar view</div>
    </div>
);

const ReportsTab: React.FC = () => (
    <div className="space-y-4">
        <p className="text-gray-400">Generate and view reports</p>
        <div className="bg-slate-700/50 rounded p-4 text-gray-400">Reports interface</div>
    </div>
);

const SettingsTab: React.FC = () => (
    <div className="space-y-4">
        <p className="text-gray-400">Company settings</p>
        <div className="bg-slate-700/50 rounded p-4 text-gray-400">Settings interface</div>
    </div>
);

const SecurityTab: React.FC = () => (
    <div className="space-y-4">
        <p className="text-gray-400">Security settings and controls</p>
        <div className="bg-slate-700/50 rounded p-4 text-gray-400">Security management</div>
    </div>
);

const NotificationsTab: React.FC = () => (
    <div className="space-y-4">
        <p className="text-gray-400">Manage notifications</p>
        <div className="bg-slate-700/50 rounded p-4 text-gray-400">Notifications settings</div>
    </div>
);

const GoalsTab: React.FC = () => (
    <div className="space-y-4">
        <p className="text-gray-400">Set and track company goals</p>
        <div className="bg-slate-700/50 rounded p-4 text-gray-400">Goals management</div>
    </div>
);

export default CompanyAdminDashboard;

