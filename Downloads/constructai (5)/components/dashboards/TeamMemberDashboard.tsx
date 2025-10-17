/**
 * Team Member Dashboard
 * Level 1 - Individual task execution and collaboration
 * 8 dashboard tabs
 */

import React, { useState } from 'react';
import { CheckSquare, Calendar, FileText, Users, Clock, MessageSquare, Settings, MoreVertical, Download, Filter } from 'lucide-react';

interface TabConfig {
    id: string;
    name: string;
    icon: React.ReactNode;
    component: string;
}

const TABS: TabConfig[] = [
    { id: 'my-tasks', name: 'My Tasks', icon: <CheckSquare size={18} />, component: 'MyTasksTab' },
    { id: 'calendar', name: 'Calendar', icon: <Calendar size={18} />, component: 'CalendarTab' },
    { id: 'time-tracking', name: 'Time Tracking', icon: <Clock size={18} />, component: 'TimeTrackingTab' },
    { id: 'documents', name: 'Documents', icon: <FileText size={18} />, component: 'DocumentsTab' },
    { id: 'team', name: 'Team', icon: <Users size={18} />, component: 'TeamTab' },
    { id: 'messages', name: 'Messages', icon: <MessageSquare size={18} />, component: 'MessagesTab' },
    { id: 'profile', name: 'Profile', icon: <Users size={18} />, component: 'ProfileTab' },
    { id: 'settings', name: 'Settings', icon: <Settings size={18} />, component: 'SettingsTab' }
];

export const TeamMemberDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('my-tasks');
    const [stats] = useState({
        assignedTasks: 12,
        completedToday: 3,
        hoursLogged: '7.5',
        teamMessages: 24,
        upcomingDeadlines: 2,
        documentsShared: 8
    });

    const renderTabContent = () => {
        switch (activeTab) {
            case 'my-tasks':
                return <MyTasksTab stats={stats} />;
            case 'calendar':
                return <CalendarTab />;
            case 'time-tracking':
                return <TimeTrackingTab stats={stats} />;
            case 'documents':
                return <DocumentsTab />;
            case 'team':
                return <TeamTab />;
            case 'messages':
                return <MessagesTab />;
            case 'profile':
                return <ProfileTab />;
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
                        <h1 className="text-3xl font-bold text-white">My Dashboard</h1>
                        <p className="text-gray-400 mt-1">Individual task execution and collaboration</p>
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
                <StatCard label="Assigned" value={stats.assignedTasks} icon={<CheckSquare size={20} />} />
                <StatCard label="Completed Today" value={stats.completedToday} icon={<CheckSquare size={20} />} />
                <StatCard label="Hours Logged" value={stats.hoursLogged} icon={<Clock size={20} />} />
                <StatCard label="Messages" value={stats.teamMessages} icon={<MessageSquare size={20} />} />
                <StatCard label="Deadlines" value={stats.upcomingDeadlines} icon={<Calendar size={20} />} />
                <StatCard label="Documents" value={stats.documentsShared} icon={<FileText size={20} />} />
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
                                        ? 'border-cyan-500 text-cyan-400 bg-slate-700/50'
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
            <div className="text-cyan-400">{icon}</div>
        </div>
        <p className="text-2xl font-bold text-white">{value}</p>
    </div>
);

// Tab Components
const MyTasksTab: React.FC<{ stats: any }> = ({ stats }) => (
    <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-700/50 rounded p-4">
                <p className="text-gray-400 text-sm mb-2">Today's Progress</p>
                <div className="w-full bg-slate-600 rounded-full h-2">
                    <div className="bg-cyan-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                </div>
                <p className="text-white font-semibold mt-2">{stats.completedToday} of {stats.assignedTasks} tasks</p>
            </div>
            <div className="bg-slate-700/50 rounded p-4">
                <p className="text-gray-400 text-sm mb-2">Priority Tasks</p>
                <p className="text-white font-semibold">{stats.upcomingDeadlines} due soon</p>
            </div>
        </div>
        <p className="text-gray-400">Your assigned tasks and progress displayed here.</p>
    </div>
);

const CalendarTab: React.FC = () => (
    <div className="space-y-4">
        <p className="text-gray-400">Your calendar and schedule</p>
        <div className="bg-slate-700/50 rounded p-4 text-gray-400">Calendar view</div>
    </div>
);

const TimeTrackingTab: React.FC<{ stats: any }> = ({ stats }) => (
    <div className="space-y-4">
        <p className="text-gray-400">Track your time</p>
        <div className="bg-slate-700/50 rounded p-4">
            <p className="text-gray-400 text-sm mb-2">Hours Logged Today: {stats.hoursLogged}h</p>
            <p className="text-gray-400 text-sm">Target: 8h</p>
        </div>
    </div>
);

const DocumentsTab: React.FC = () => (
    <div className="space-y-4">
        <p className="text-gray-400">Your documents and files</p>
        <div className="bg-slate-700/50 rounded p-4 text-gray-400">Documents interface</div>
    </div>
);

const TeamTab: React.FC = () => (
    <div className="space-y-4">
        <p className="text-gray-400">Your team members</p>
        <div className="bg-slate-700/50 rounded p-4 text-gray-400">Team members list</div>
    </div>
);

const MessagesTab: React.FC = () => (
    <div className="space-y-4">
        <p className="text-gray-400">Team messages and chat</p>
        <div className="bg-slate-700/50 rounded p-4 text-gray-400">Messages interface</div>
    </div>
);

const ProfileTab: React.FC = () => (
    <div className="space-y-4">
        <p className="text-gray-400">Your profile information</p>
        <div className="bg-slate-700/50 rounded p-4 text-gray-400">Profile details</div>
    </div>
);

const SettingsTab: React.FC = () => (
    <div className="space-y-4">
        <p className="text-gray-400">Your settings and preferences</p>
        <div className="bg-slate-700/50 rounded p-4 text-gray-400">Settings interface</div>
    </div>
);

export default TeamMemberDashboard;

