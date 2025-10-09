/**
 * Full Dashboard with All Features
 * Simple implementation with tabs navigation
 */

import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { RealtimeStats } from '../dashboard/RealtimeStats';
import { RecentActivity } from '../dashboard/RecentActivity';
import { NotificationCenter } from '../dashboard/NotificationCenter';
import { PerformanceCharts } from '../dashboard/PerformanceCharts';

interface FullDashboardProps {
    user: User;
    onLogout: () => void;
}

type TabType = 'dashboard' | 'projects' | 'tasks' | 'team' | 'settings';

export const FullDashboard: React.FC<FullDashboardProps> = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = useState<TabType>('dashboard');

    const tabs = [
        { id: 'dashboard' as TabType, name: 'Dashboard', icon: '📊' },
        { id: 'projects' as TabType, name: 'Projects', icon: '🏗️' },
        { id: 'tasks' as TabType, name: 'Tasks', icon: '✅' },
        { id: 'team' as TabType, name: 'Team', icon: '👥' },
        { id: 'settings' as TabType, name: 'Settings', icon: '⚙️' }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">ConstructAI</h1>
                            <p className="text-sm text-gray-600">Welcome back, {user.name}</p>
                        </div>
                        <button
                            type="button"
                            onClick={onLogout}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Logout
                        </button>
                    </div>

                    {/* Navigation Tabs */}
                    <nav className="flex space-x-1 border-t border-gray-200 pt-2">
                        {tabs.map((tab) => (
                            <button
                                type="button"
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                                    activeTab === tab.id
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'dashboard' && <DashboardTab user={user} />}
                {activeTab === 'projects' && <ProjectsTab />}
                {activeTab === 'tasks' && <TasksTab />}
                {activeTab === 'team' && <TeamTab />}
                {activeTab === 'settings' && <SettingsTab user={user} />}
            </main>
        </div>
    );
};

// Dashboard Tab Component
const DashboardTab: React.FC<{ user: User }> = ({ user }) => {
    return (
        <div className="space-y-6">
            {/* Welcome Card */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-8 text-white">
                <h2 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h2>
                <p className="text-blue-100 text-lg">{user.email}</p>
                <p className="text-blue-200 mt-2">Role: {user.role}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Projects"
                    value="12"
                    icon="🏗️"
                    color="blue"
                />
                <StatCard
                    title="Active Tasks"
                    value="47"
                    icon="✅"
                    color="green"
                />
                <StatCard
                    title="Team Members"
                    value="8"
                    icon="👥"
                    color="purple"
                />
                <StatCard
                    title="Completion Rate"
                    value="87%"
                    icon="📈"
                    color="yellow"
                />
            </div>

            {/* Real-time Stats */}
            <RealtimeStats />

            {/* Performance Charts */}
            <PerformanceCharts />

            {/* Activity and Notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecentActivity />
                <NotificationCenter />
            </div>
        </div>
    );
};

// Projects Tab Component
const ProjectsTab: React.FC = () => {
    const projects = [
        { id: 1, name: 'Downtown Office Building', status: 'In Progress', progress: 65, team: 12 },
        { id: 2, name: 'Residential Complex Phase 2', status: 'Planning', progress: 25, team: 8 },
        { id: 3, name: 'Shopping Mall Renovation', status: 'In Progress', progress: 80, team: 15 },
        { id: 4, name: 'Industrial Warehouse', status: 'Completed', progress: 100, team: 10 }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
                <button
                    type="button"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    + New Project
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project) => (
                    <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                                <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-2 ${
                                    project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                    project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                    'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {project.status}
                                </span>
                            </div>
                            <button type="button" className="text-gray-400 hover:text-gray-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <div className="flex items-center justify-between text-sm mb-1">
                                    <span className="text-gray-600">Progress</span>
                                    <span className="font-semibold text-gray-900">{project.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all"
                                        style={{ width: `${project.progress}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Team Members</span>
                                <span className="font-semibold text-gray-900">{project.team}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Tasks Tab Component
const TasksTab: React.FC = () => {
    const tasks = [
        { id: 1, title: 'Foundation inspection', project: 'Downtown Office', priority: 'High', status: 'In Progress', dueDate: '2025-10-10' },
        { id: 2, title: 'Electrical wiring review', project: 'Residential Complex', priority: 'Medium', status: 'Pending', dueDate: '2025-10-12' },
        { id: 3, title: 'HVAC installation', project: 'Shopping Mall', priority: 'High', status: 'In Progress', dueDate: '2025-10-09' },
        { id: 4, title: 'Final walkthrough', project: 'Industrial Warehouse', priority: 'Low', status: 'Completed', dueDate: '2025-10-05' }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
                <button
                    type="button"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    + New Task
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {tasks.map((task) => (
                            <tr key={task.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{task.title}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-600">{task.project}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        task.priority === 'High' ? 'bg-red-100 text-red-800' :
                                        task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-green-100 text-green-800'
                                    }`}>
                                        {task.priority}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                        task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {task.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {task.dueDate}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Team Tab Component  
const TeamTab: React.FC = () => {
    const team = [
        { id: 1, name: 'Adrian Stanca', role: 'Company Admin', email: 'adrian.stanca1@gmail.com', avatar: '👨‍💼', status: 'Active' },
        { id: 2, name: 'John Smith', role: 'Project Manager', email: 'john.smith@example.com', avatar: '👨‍🔧', status: 'Active' },
        { id: 3, name: 'Sarah Johnson', role: 'Supervisor', email: 'sarah.j@example.com', avatar: '👩‍💼', status: 'Active' },
        { id: 4, name: 'Mike Davis', role: 'Operative', email: 'mike.d@example.com', avatar: '👷', status: 'Away' }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Team Members</h2>
                <button
                    type="button"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    + Invite Member
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {team.map((member) => (
                    <div key={member.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center space-x-4">
                            <div className="text-4xl">{member.avatar}</div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                                <p className="text-sm text-gray-600">{member.role}</p>
                                <p className="text-xs text-gray-500 mt-1">{member.email}</p>
                                <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-2 ${
                                    member.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {member.status}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Settings Tab Component
const SettingsTab: React.FC<{ user: User }> = ({ user }) => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Settings</h2>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                        <input
                            type="text"
                            defaultValue={user.name}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                            type="email"
                            defaultValue={user.email}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                        <input
                            type="text"
                            defaultValue={user.role}
                            disabled
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                        />
                    </div>
                    <button
                        type="button"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

// Stat Card Component
const StatCard: React.FC<{ title: string; value: string; icon: string; color: string }> = ({ title, value, icon, color }) => {
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        purple: 'bg-purple-100 text-purple-600',
        yellow: 'bg-yellow-100 text-yellow-600'
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${colorClasses[color as keyof typeof colorClasses]}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
};

