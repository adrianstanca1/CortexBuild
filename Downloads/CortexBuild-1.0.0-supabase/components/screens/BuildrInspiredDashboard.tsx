/**
 * Buildr-Inspired Dashboard - Modern Construction Management Interface
 * Enhanced with modern design patterns and comprehensive functionality
 */

import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard, Users, FolderKanban, FileText, BarChart3,
    CreditCard, Settings, Briefcase, ClipboardList, Shield,
    Clock, Camera, MapPin, Package, ShoppingCart, AlertTriangle,
    CheckSquare, TrendingUp, Building2, Hammer, ArrowUpRight,
    ArrowDownRight, Sparkles, Target, Award, ChevronRight,
    Zap, Activity, Calendar, DollarSign, PieChart, Globe,
    MessageSquare, Bell, Search, Filter, Plus, Eye,
    Download, Upload, Share2, Star, Heart, ThumbsUp,
    AlertCircle, CheckCircle, XCircle, Info, Play, Pause,
    RefreshCw, MoreHorizontal, Edit, Trash2, Copy,
    ExternalLink, Lock, Unlock, UserPlus, UserMinus
} from 'lucide-react';
import { User } from '../../types';

interface BuildrInspiredDashboardProps {
    currentUser: User;
    navigateTo: (screen: string, params?: any) => void;
    isDarkMode?: boolean;
}

interface ProjectCard {
    id: string;
    name: string;
    status: 'active' | 'planning' | 'completed' | 'on-hold';
    progress: number;
    budget: number;
    spent: number;
    teamSize: number;
    location: string;
    startDate: string;
    endDate: string;
    priority: 'high' | 'medium' | 'low';
    image?: string;
}

interface TeamMember {
    id: string;
    name: string;
    role: string;
    avatar: string;
    status: 'online' | 'offline' | 'busy';
    lastActive: string;
    currentProject?: string;
}

interface RecentActivity {
    id: string;
    type: 'task_completed' | 'photo_uploaded' | 'rfi_submitted' | 'safety_alert' | 'budget_update';
    title: string;
    description: string;
    timestamp: string;
    user: string;
    project: string;
    priority: 'high' | 'medium' | 'low';
}

const BuildrInspiredDashboard: React.FC<BuildrInspiredDashboardProps> = ({
    currentUser,
    navigateTo,
    isDarkMode = true
}) => {
    const [activeView, setActiveView] = useState<'overview' | 'projects' | 'team' | 'analytics'>('overview');
    const [selectedProject, setSelectedProject] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Mock data - in real app, this would come from API
    const [projects] = useState<ProjectCard[]>([
        {
            id: '1',
            name: 'Downtown Office Complex',
            status: 'active',
            progress: 75,
            budget: 2500000,
            spent: 1875000,
            teamSize: 24,
            location: 'Downtown District',
            startDate: '2024-01-15',
            endDate: '2024-08-30',
            priority: 'high'
        },
        {
            id: '2',
            name: 'Residential Tower Phase 2',
            status: 'planning',
            progress: 15,
            budget: 1800000,
            spent: 270000,
            teamSize: 18,
            location: 'Westside',
            startDate: '2024-03-01',
            endDate: '2024-12-15',
            priority: 'medium'
        },
        {
            id: '3',
            name: 'Shopping Center Renovation',
            status: 'active',
            progress: 45,
            budget: 950000,
            spent: 427500,
            teamSize: 12,
            location: 'Mall District',
            startDate: '2024-02-10',
            endDate: '2024-07-20',
            priority: 'high'
        }
    ]);

    const [teamMembers] = useState<TeamMember[]>([
        {
            id: '1',
            name: 'Sarah Johnson',
            role: 'Project Manager',
            avatar: '/avatars/sarah.jpg',
            status: 'online',
            lastActive: '2 minutes ago',
            currentProject: 'Downtown Office Complex'
        },
        {
            id: '2',
            name: 'Mike Chen',
            role: 'Site Supervisor',
            avatar: '/avatars/mike.jpg',
            status: 'busy',
            lastActive: '5 minutes ago',
            currentProject: 'Residential Tower Phase 2'
        },
        {
            id: '3',
            name: 'Emily Rodriguez',
            role: 'Safety Officer',
            avatar: '/avatars/emily.jpg',
            status: 'online',
            lastActive: '1 minute ago',
            currentProject: 'Shopping Center Renovation'
        }
    ]);

    const [recentActivities] = useState<RecentActivity[]>([
        {
            id: '1',
            type: 'task_completed',
            title: 'Foundation Inspection Completed',
            description: 'Quality check passed for Building A foundation',
            timestamp: '2 hours ago',
            user: 'Sarah Johnson',
            project: 'Downtown Office Complex',
            priority: 'high'
        },
        {
            id: '2',
            type: 'photo_uploaded',
            title: 'Progress Photos Uploaded',
            description: '15 new photos added to project gallery',
            timestamp: '4 hours ago',
            user: 'Mike Chen',
            project: 'Residential Tower Phase 2',
            priority: 'medium'
        },
        {
            id: '3',
            type: 'safety_alert',
            title: 'Safety Protocol Updated',
            description: 'New safety guidelines implemented',
            timestamp: '6 hours ago',
            user: 'Emily Rodriguez',
            project: 'Shopping Center Renovation',
            priority: 'high'
        }
    ]);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    const getStatusColor = (status: string) => {
        const colors = {
            active: 'bg-green-500',
            planning: 'bg-blue-500',
            completed: 'bg-gray-500',
            'on-hold': 'bg-yellow-500'
        };
        return colors[status as keyof typeof colors] || 'bg-gray-500';
    };

    const getPriorityColor = (priority: string) => {
        const colors = {
            high: 'text-red-500',
            medium: 'text-yellow-500',
            low: 'text-green-500'
        };
        return colors[priority as keyof typeof colors] || 'text-gray-500';
    };

    const getActivityIcon = (type: string) => {
        const icons = {
            task_completed: CheckCircle,
            photo_uploaded: Camera,
            rfi_submitted: FileText,
            safety_alert: Shield,
            budget_update: DollarSign
        };
        return icons[type as keyof typeof icons] || Activity;
    };

    const renderProjectCard = (project: ProjectCard) => {
        const remainingBudget = project.budget - project.spent;
        const budgetPercentage = (project.spent / project.budget) * 100;

        return (
            <div
                key={project.id}
                className={`group relative overflow-hidden rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer`}
                onClick={() => {
                    setSelectedProject(project.id);
                    navigateTo('project-home', { projectId: project.id });
                }}
            >
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(project.status)}`} />
                        <span className={`text-sm font-medium ${getPriorityColor(project.priority)}`}>
                            {project.priority.toUpperCase()}
                        </span>
                    </div>
                    <MoreHorizontal className="w-5 h-5 text-gray-400 group-hover:text-gray-300" />
                </div>

                <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {project.name}
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                    {project.location}
                </p>

                <div className="space-y-3">
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Progress</span>
                            <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${project.progress}%` }}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Budget</span>
                            <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                                ${(project.spent / 1000).toFixed(0)}K / ${(project.budget / 1000).toFixed(0)}K
                            </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${budgetPercentage}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                    <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {project.teamSize} members
                        </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-300 group-hover:translate-x-1 transition-transform" />
                </div>
            </div>
        );
    };

    const renderTeamMember = (member: TeamMember) => {
        const getStatusColor = (status: string) => {
            const colors = {
                online: 'bg-green-500',
                offline: 'bg-gray-500',
                busy: 'bg-yellow-500'
            };
            return colors[status as keyof typeof colors] || 'bg-gray-500';
        };

        return (
            <div
                key={member.id}
                className={`flex items-center space-x-3 p-3 rounded-lg ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} transition-colors cursor-pointer`}
            >
                <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 ${isDarkMode ? 'border-gray-800' : 'border-white'} ${getStatusColor(member.status)}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate`}>
                        {member.name}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} truncate`}>
                        {member.role}
                    </p>
                </div>
                <div className="text-right">
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {member.lastActive}
                    </p>
                </div>
            </div>
        );
    };

    const renderActivityItem = (activity: RecentActivity) => {
        const Icon = getActivityIcon(activity.type);

        return (
            <div
                key={activity.id}
                className={`flex items-start space-x-3 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} transition-colors cursor-pointer`}
            >
                <div className={`p-2 rounded-lg ${getPriorityColor(activity.priority)} bg-opacity-10`}>
                    <Icon className={`w-5 h-5 ${getPriorityColor(activity.priority)}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {activity.title}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                        {activity.description}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                        <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            {activity.user} • {activity.project}
                        </span>
                        <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            {activity.timestamp}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Loading Dashboard...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center space-x-3 mb-2">
                                <Building2 className="w-8 h-8 text-white" />
                                <h1 className="text-3xl font-bold text-white">CortexBuild Dashboard</h1>
                            </div>
                            <p className="text-purple-100">Welcome back, {currentUser.name}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                type="button"
                                onClick={() => navigateTo('notifications')}
                                className="relative p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all backdrop-blur-sm"
                            >
                                <Bell className="w-5 h-5" />
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                            </button>
                            <button
                                type="button"
                                onClick={() => navigateTo('advanced-search')}
                                className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all backdrop-blur-sm"
                            >
                                <Search className="w-5 h-5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => navigateTo('new-task')}
                                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all backdrop-blur-sm flex items-center space-x-2"
                            >
                                <Plus className="w-5 h-5" />
                                <span>New Task</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-8">
                {/* Navigation Tabs */}
                <div className="flex space-x-2 mb-8 p-1 bg-gray-800 rounded-xl">
                    {[
                        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                        { id: 'projects', label: 'Projects', icon: FolderKanban },
                        { id: 'team', label: 'Team', icon: Users },
                        { id: 'analytics', label: 'Analytics', icon: BarChart3 }
                    ].map((tab) => {
                        const TabIcon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveView(tab.id as any)}
                                className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${activeView === tab.id
                                    ? 'bg-purple-600 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                                    }`}
                            >
                                <TabIcon className="w-5 h-5" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Content based on active view */}
                {activeView === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Projects Overview */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Active Projects
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setActiveView('projects')}
                                    className="text-purple-400 hover:text-purple-300 flex items-center space-x-1"
                                >
                                    <span>View All</span>
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {projects.slice(0, 2).map(renderProjectCard)}
                            </div>
                        </div>

                        {/* Team & Activity */}
                        <div className="space-y-8">
                            {/* Team Status */}
                            <div>
                                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Team Status
                                </h3>
                                <div className="space-y-2">
                                    {teamMembers.map(renderTeamMember)}
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div>
                                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Recent Activity
                                </h3>
                                <div className="space-y-2">
                                    {recentActivities.map(renderActivityItem)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeView === 'projects' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                All Projects
                            </h2>
                            <button
                                type="button"
                                onClick={() => navigateTo('projects')}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                            >
                                <Plus className="w-5 h-5" />
                                <span>New Project</span>
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.map(renderProjectCard)}
                        </div>
                    </div>
                )}

                {activeView === 'team' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Team Members
                            </h2>
                            <button
                                type="button"
                                onClick={() => navigateTo('team-management')}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                            >
                                <UserPlus className="w-5 h-5" />
                                <span>Add Member</span>
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {teamMembers.map(member => (
                                <div
                                    key={member.id}
                                    className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
                                >
                                    {renderTeamMember(member)}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeView === 'analytics' && (
                    <div>
                        <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Analytics & Reports
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-blue-500/10 rounded-xl">
                                        <DollarSign className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <span className="text-2xl font-bold text-green-400">+12.5%</span>
                                </div>
                                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Revenue
                                </h3>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    $2.4M this month
                                </p>
                            </div>
                            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-green-500/10 rounded-xl">
                                        <TrendingUp className="w-6 h-6 text-green-400" />
                                    </div>
                                    <span className="text-2xl font-bold text-green-400">+8.2%</span>
                                </div>
                                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Productivity
                                </h3>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    94% efficiency
                                </p>
                            </div>
                            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-yellow-500/10 rounded-xl">
                                        <Clock className="w-6 h-6 text-yellow-400" />
                                    </div>
                                    <span className="text-2xl font-bold text-yellow-400">-15%</span>
                                </div>
                                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Delays
                                </h3>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    3 projects ahead
                                </p>
                            </div>
                            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-purple-500/10 rounded-xl">
                                        <Award className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <span className="text-2xl font-bold text-purple-400">98%</span>
                                </div>
                                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Quality Score
                                </h3>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Excellent rating
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BuildrInspiredDashboard;
