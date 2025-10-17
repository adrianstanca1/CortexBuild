/**
 * Team Lead Dashboard
 * Level 2 - Team oversight and project management
 * 12 dashboard tabs
 */

import React, { useState } from 'react';
import { BarChart3, Users, FolderOpen, CheckSquare, TrendingUp, FileText, Zap, Bell, Activity, Calendar, Settings, MoreVertical, Download, Filter } from 'lucide-react';

interface TabConfig {
    id: string;
    name: string;
    icon: React.ReactNode;
    component: string;
}

const TABS: TabConfig[] = [
    { id: 'overview', name: 'Overview', icon: <BarChart3 size={18} />, component: 'OverviewTab' },
    { id: 'team', name: 'Team', icon: <Users size={18} />, component: 'TeamTab' },
    { id: 'projects', name: 'Projects', icon: <FolderOpen size={18} />, component: 'ProjectsTab' },
    { id: 'tasks', name: 'Tasks', icon: <CheckSquare size={18} />, component: 'TasksTab' },
    { id: 'analytics', name: 'Analytics', icon: <TrendingUp size={18} />, component: 'AnalyticsTab' },
    { id: 'calendar', name: 'Calendar', icon: <Calendar size={18} />, component: 'CalendarTab' },
    { id: 'reports', name: 'Reports', icon: <FileText size={18} />, component: 'ReportsTab' },
    { id: 'marketplace', name: 'Marketplace', icon: <Zap size={18} />, component: 'MarketplaceTab' },
    { id: 'activity', name: 'Activity', icon: <Activity size={18} />, component: 'ActivityTab' },
    { id: 'notifications', name: 'Notifications', icon: <Bell size={18} />, component: 'NotificationsTab' },
    { id: 'workflows', name: 'Workflows', icon: <BarChart3 size={18} />, component: 'WorkflowsTab' },
    { id: 'settings', name: 'Settings', icon: <Settings size={18} />, component: 'SettingsTab' }
];

export const TeamLeadDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats] = useState({
        teamMembers: 8,
        activeProjects: 5,
        completedTasks: 142,
        pendingTasks: 23,
        teamCapacity: '85%',
        projectHealth: 'Good'
    });

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return <OverviewTab stats={stats} />;
            case 'team':
                return <TeamTab />;
            case 'projects':
                return <ProjectsTab />;
            case 'tasks':
                return <TasksTab />;
            case 'analytics':
                return <AnalyticsTab />;
            case 'calendar':
                return <CalendarTab />;
            case 'reports':
                return <ReportsTab />;
            case 'marketplace':
                return <MarketplaceTab />;
            case 'activity':
                return <ActivityTab />;
            case 'notifications':
                return <NotificationsTab />;
            case 'workflows':
                return <WorkflowsTab />;
            case 'settings':
                return <SettingsTab />;
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
                        <h1 className="text-3xl font-bold text-white">Team Lead Dashboard</h1>
                        <p className="text-gray-400 mt-1">Team oversight and project management</p>
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
                <StatCard label="Team Members" value={stats.teamMembers} icon={<Users size={20} />} />
                <StatCard label="Projects" value={stats.activeProjects} icon={<FolderOpen size={20} />} />
                <StatCard label="Completed" value={stats.completedTasks} icon={<CheckSquare size={20} />} />
                <StatCard label="Pending" value={stats.pendingTasks} icon={<Activity size={20} />} />
                <StatCard label="Capacity" value={stats.teamCapacity} icon={<TrendingUp size={20} />} />
                <StatCard label="Health" value={stats.projectHealth} icon={<BarChart3 size={20} />} />
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
                                        ? 'border-green-500 text-green-400 bg-slate-700/50'
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
            <div className="text-green-400">{icon}</div>
        </div>
        <p className="text-2xl font-bold text-white">{value}</p>
    </div>
);

// Tab Components
const OverviewTab: React.FC<{ stats: any }> = ({ stats }) => (
    <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-700/50 rounded p-4">
                <p className="text-gray-400 text-sm mb-2">Team Status</p>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <p className="text-white font-semibold">All On Track</p>
                </div>
            </div>
            <div className="bg-slate-700/50 rounded p-4">
                <p className="text-gray-400 text-sm mb-2">This Week</p>
                <p className="text-white font-semibold">5 tasks completed</p>
            </div>
        </div>
        <p className="text-gray-400">Team overview and key metrics displayed here.</p>
    </div>
);

const TeamTab: React.FC = () => (
    <div className="space-y-4">
        <p className="text-gray-400">Manage team members</p>
        <div className="bg-slate-700/50 rounded p-4 text-gray-400">Team management interface</div>
    </div>
);

const ProjectsTab: React.FC = () => (
    <div className="space-y-4">
        <p className="text-gray-400">Manage team projects</p>
        <div className="bg-slate-700/50 rounded p-4 text-gray-400">Projects management interface</div>
    </div>
);

const TasksTab: React.FC = () => (
    <div className="space-y-4">
        <p className="text-gray-400">Manage team tasks</p>
        <div className="bg-slate-700/50 rounded p-4 text-gray-400">Tasks management interface</div>
    </div>
);

const AnalyticsTab: React.FC = () => (
    <div className="space-y-4">
        <p className="text-gray-400">Team analytics and insights</p>
        <div className="bg-slate-700/50 rounded p-4 text-gray-400">Analytics dashboard</div>
    </div>
);

const CalendarTab: React.FC = () => (
    <div className="space-y-4">
        <p className="text-gray-400">Team calendar and events</p>
        <div className="bg-slate-700/50 rounded p-4 text-gray-400">Calendar view</div>
    </div>
);

const ReportsTab: React.FC = () => (
    <div className="space-y-4">
        <p className="text-gray-400">Generate team reports</p>
        <div className="bg-slate-700/50 rounded p-4 text-gray-400">Reports interface</div>
    </div>
);

const MarketplaceTab: React.FC = () => (
    <div className="space-y-4">
        <p className="text-gray-400">Browse marketplace apps</p>
        <div className="bg-slate-700/50 rounded p-4 text-gray-400">Marketplace interface</div>
    </div>
);

const ActivityTab: React.FC = () => (
    <div className="space-y-4">
        <p className="text-gray-400">View team activity</p>
        <div className="bg-slate-700/50 rounded p-4 text-gray-400">Activity log</div>
    </div>
);

const NotificationsTab: React.FC = () => (
    <div className="space-y-4">
        <p className="text-gray-400">Manage notifications</p>
        <div className="bg-slate-700/50 rounded p-4 text-gray-400">Notifications settings</div>
    </div>
);

const WorkflowsTab: React.FC = () => (
    <div className="space-y-4">
        <p className="text-gray-400">Manage team workflows</p>
        <div className="bg-slate-700/50 rounded p-4 text-gray-400">Workflows management</div>
    </div>
);

const SettingsTab: React.FC = () => (
    <div className="space-y-4">
        <p className="text-gray-400">Team settings</p>
        <div className="bg-slate-700/50 rounded p-4 text-gray-400">Settings interface</div>
    </div>
);

export default TeamLeadDashboard;

