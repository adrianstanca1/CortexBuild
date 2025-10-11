import React, { useState, useEffect } from 'react';
import { User, Screen, Company, Project } from '../../../types';
import * as api from '../../../api';
import GlobalStatsWidget from '../../widgets/GlobalStatsWidget';
import { BuildingOfficeIcon, UsersIcon } from '../../Icons';
import {
    TrendingUp,
    TrendingDown,
    Users,
    Building2,
    FolderKanban,
    Activity,
    DollarSign,
    AlertCircle,
    CheckCircle,
    Clock
} from 'lucide-react';

interface SuperAdminDashboardProps {
    currentUser: User;
    selectProject: (projectId: string) => void;
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ currentUser, selectProject }) => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const [fetchedCompanies, fetchedUsers, fetchedProjects] = await Promise.all([
                api.fetchCompanies(currentUser),
                api.fetchUsers(),
                api.fetchAllProjects(currentUser)
            ]);
            setCompanies(fetchedCompanies);
            setUsers(fetchedUsers);
            setProjects(fetchedProjects);
            setIsLoading(false);
        };
        loadData();
    }, [currentUser]);

    // Mock analytics data
    const analyticsData = {
        totalRevenue: 1250000,
        revenueGrowth: 12.5,
        activeProjects: projects.length,
        projectsGrowth: 8.3,
        totalUsers: users.length,
        usersGrowth: 15.2,
        activeCompanies: companies.length,
        companiesGrowth: 5.7
    };

    const recentActivity = [
        { id: 1, type: 'user', message: 'New user registered: John Doe', time: '5 min ago', icon: Users, color: 'text-blue-500' },
        { id: 2, type: 'project', message: 'Project "Downtown Tower" completed', time: '1 hour ago', icon: CheckCircle, color: 'text-green-500' },
        { id: 3, type: 'company', message: 'New company added: BuildCo Inc', time: '2 hours ago', icon: Building2, color: 'text-purple-500' },
        { id: 4, type: 'alert', message: 'System maintenance scheduled', time: '3 hours ago', icon: AlertCircle, color: 'text-yellow-500' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            {/* Modern Header */}
            <header className="mb-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 mb-2">Super Admin Dashboard</h1>
                        <p className="text-lg text-gray-600">Platform-wide overview and analytics</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">{currentUser.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{currentUser.role.replace('_', ' ')}</p>
                        </div>
                        <img src={currentUser.avatar} alt="User Avatar" className="w-14 h-14 rounded-full ring-4 ring-purple-500/20" />
                    </div>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Revenue Card */}
                <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <DollarSign className="h-10 w-10 opacity-80" />
                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 text-sm font-semibold`}>
                            <TrendingUp className="h-4 w-4" />
                            {analyticsData.revenueGrowth}%
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold mb-1">${(analyticsData.totalRevenue / 1000000).toFixed(2)}M</h3>
                    <p className="text-white/80 text-sm">Total Revenue</p>
                </div>

                {/* Projects Card */}
                <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <FolderKanban className="h-10 w-10 opacity-80" />
                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 text-sm font-semibold`}>
                            <TrendingUp className="h-4 w-4" />
                            {analyticsData.projectsGrowth}%
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold mb-1">{analyticsData.activeProjects}</h3>
                    <p className="text-white/80 text-sm">Active Projects</p>
                </div>

                {/* Users Card */}
                <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <Users className="h-10 w-10 opacity-80" />
                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 text-sm font-semibold`}>
                            <TrendingUp className="h-4 w-4" />
                            {analyticsData.usersGrowth}%
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold mb-1">{analyticsData.totalUsers}</h3>
                    <p className="text-white/80 text-sm">Total Users</p>
                </div>

                {/* Companies Card */}
                <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <Building2 className="h-10 w-10 opacity-80" />
                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 text-sm font-semibold`}>
                            <TrendingUp className="h-4 w-4" />
                            {analyticsData.companiesGrowth}%
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold mb-1">{analyticsData.activeCompanies}</h3>
                    <p className="text-white/80 text-sm">Active Companies</p>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Activity className="h-6 w-6 text-purple-600" />
                            Recent Activity
                        </h2>
                        <button type="button" className="text-sm text-purple-600 hover:text-purple-700 font-semibold">
                            View All
                        </button>
                    </div>
                    <div className="space-y-4">
                        {recentActivity.map((activity) => {
                            const Icon = activity.icon;
                            return (
                                <div key={activity.id} className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                                    <div className={`p-3 rounded-full bg-gray-100 ${activity.color}`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-gray-900 font-medium">{activity.message}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Clock className="h-3 w-3 text-gray-400" />
                                            <span className="text-sm text-gray-500">{activity.time}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="space-y-6">
                    {/* Companies */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-orange-600" />
                            Companies ({companies.length})
                        </h3>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                            </div>
                        ) : (
                            <ul className="space-y-2 max-h-48 overflow-y-auto">
                                {companies.slice(0, 5).map(company => (
                                    <li key={company.id} className="px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                                        <span className="font-semibold text-gray-900">{company.name}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Users */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Users className="h-5 w-5 text-green-600" />
                            Users ({users.length})
                        </h3>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                            </div>
                        ) : (
                            <ul className="space-y-2 max-h-48 overflow-y-auto">
                                {users.slice(0, 5).map(user => (
                                    <li key={user.id} className="px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors flex justify-between items-center">
                                        <span className="font-medium text-gray-900">{user.name}</span>
                                        <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 capitalize">
                                            {user.role.replace('_', ' ')}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {/* Projects Section */}
            <div className="mt-6 bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <FolderKanban className="h-6 w-6 text-blue-600" />
                    All Projects ({projects.length})
                </h2>
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {projects.map(project => (
                            <button
                                key={project.id}
                                type="button"
                                onClick={() => selectProject(project.id)}
                                className="p-4 rounded-xl border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all text-left group"
                            >
                                <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                                    {project.name}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">Click to view details</p>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuperAdminDashboard;