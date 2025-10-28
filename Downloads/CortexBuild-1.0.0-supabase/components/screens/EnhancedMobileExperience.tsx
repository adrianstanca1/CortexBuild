/**
 * Enhanced Mobile Experience - Buildr-Inspired Mobile-First Design
 * Optimized mobile interface with touch-friendly interactions and offline capabilities
 */

import React, { useState, useEffect } from 'react';
import {
    Smartphone, Camera, MapPin, Clock, Users, FileText, CheckCircle,
    AlertTriangle, Plus, Search, Filter, Bell, Settings, Download,
    Upload, Share2, Heart, Star, ThumbsUp, MessageSquare, Phone,
    Video, Mic, MicOff, Volume2, VolumeX, Maximize, Minimize,
    RotateCcw, Edit, Trash2, Copy, ExternalLink, Lock, Unlock,
    Eye, MoreHorizontal, ArrowUpRight, ArrowDownRight, Activity,
    Zap, Award, Target, TrendingUp, BarChart3, PieChart, Calendar,
    DollarSign, Receipt, CreditCard, Banknote, Calculator, Building2,
    Hammer, Shield, ClipboardList, Package, ShoppingCart, AlertCircle,
    Info, CheckSquare, XCircle, Play, Pause, RefreshCw, Home,
    Menu, ChevronRight, ChevronLeft, ChevronUp, ChevronDown
} from 'lucide-react';
import { User } from '../../types';

interface EnhancedMobileExperienceProps {
    currentUser: User;
    navigateTo: (screen: string, params?: any) => void;
    isDarkMode?: boolean;
}

interface MobileTask {
    id: string;
    title: string;
    description: string;
    status: 'todo' | 'in-progress' | 'completed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    assignee: string;
    dueDate: string;
    location?: string;
    photos: string[];
    notes: string;
    isOffline: boolean;
}

interface MobileProject {
    id: string;
    name: string;
    status: 'active' | 'planning' | 'completed';
    progress: number;
    location: string;
    teamSize: number;
    nextMilestone: string;
    photos: string[];
    isOffline: boolean;
}

interface MobileTeamMember {
    id: string;
    name: string;
    role: string;
    avatar: string;
    status: 'online' | 'offline' | 'busy';
    location?: string;
    lastSeen: string;
    isOffline: boolean;
}

interface MobileNotification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: string;
    isRead: boolean;
    actionUrl?: string;
    isOffline: boolean;
}

const EnhancedMobileExperience: React.FC<EnhancedMobileExperienceProps> = ({
    currentUser,
    navigateTo,
    isDarkMode = true
}) => {
    const [activeTab, setActiveTab] = useState<'home' | 'tasks' | 'projects' | 'team' | 'notifications'>('home');
    const [isOffline, setIsOffline] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

    // Mock data - in real app, this would come from API
    const [mobileTasks] = useState<MobileTask[]>([
        {
            id: '1',
            title: 'Foundation Inspection',
            description: 'Complete quality inspection of foundation work',
            status: 'in-progress',
            priority: 'high',
            assignee: 'Emily Rodriguez',
            dueDate: '2024-03-15',
            location: 'Building A, Level 1',
            photos: ['/photos/foundation-1.jpg', '/photos/foundation-2.jpg'],
            notes: 'Check for cracks and proper reinforcement',
            isOffline: false
        },
        {
            id: '2',
            title: 'Safety Protocol Review',
            description: 'Review and update safety protocols',
            status: 'todo',
            priority: 'medium',
            assignee: 'Sarah Johnson',
            dueDate: '2024-03-18',
            location: 'Office Building',
            photos: [],
            notes: 'Update emergency procedures',
            isOffline: true
        },
        {
            id: '3',
            title: 'Material Delivery',
            description: 'Receive steel beam delivery',
            status: 'completed',
            priority: 'urgent',
            assignee: 'Mike Chen',
            dueDate: '2024-03-14',
            location: 'Loading Dock',
            photos: ['/photos/steel-delivery.jpg'],
            notes: 'All materials received and inspected',
            isOffline: false
        }
    ]);

    const [mobileProjects] = useState<MobileProject[]>([
        {
            id: '1',
            name: 'Downtown Office Complex',
            status: 'active',
            progress: 75,
            location: 'Downtown District',
            teamSize: 24,
            nextMilestone: 'Foundation Complete',
            photos: ['/photos/project-1.jpg', '/photos/project-2.jpg'],
            isOffline: false
        },
        {
            id: '2',
            name: 'Residential Tower Phase 2',
            status: 'planning',
            progress: 15,
            location: 'Westside',
            teamSize: 18,
            nextMilestone: 'Permit Approval',
            photos: ['/photos/project-3.jpg'],
            isOffline: true
        }
    ]);

    const [mobileTeamMembers] = useState<MobileTeamMember[]>([
        {
            id: '1',
            name: 'Sarah Johnson',
            role: 'Project Manager',
            avatar: '/avatars/sarah.jpg',
            status: 'online',
            location: 'Office Building',
            lastSeen: 'now',
            isOffline: false
        },
        {
            id: '2',
            name: 'Mike Chen',
            role: 'Site Supervisor',
            avatar: '/avatars/mike.jpg',
            status: 'busy',
            location: 'Building A',
            lastSeen: '5 minutes ago',
            isOffline: false
        },
        {
            id: '3',
            name: 'Emily Rodriguez',
            role: 'Safety Officer',
            avatar: '/avatars/emily.jpg',
            status: 'online',
            location: 'Foundation Site',
            lastSeen: 'now',
            isOffline: true
        }
    ]);

    const [mobileNotifications] = useState<MobileNotification[]>([
        {
            id: '1',
            title: 'Task Completed',
            message: 'Foundation inspection completed by Emily Rodriguez',
            type: 'success',
            timestamp: '2 hours ago',
            isRead: false,
            actionUrl: '/task/1',
            isOffline: false
        },
        {
            id: '2',
            title: 'Safety Alert',
            message: 'New safety protocol update available',
            type: 'warning',
            timestamp: '4 hours ago',
            isRead: true,
            actionUrl: '/safety/protocols',
            isOffline: true
        },
        {
            id: '3',
            title: 'Material Delivery',
            message: 'Steel beams delivered to loading dock',
            type: 'info',
            timestamp: '6 hours ago',
            isRead: false,
            actionUrl: '/delivery/steel',
            isOffline: false
        }
    ]);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Simulate offline detection
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const getStatusColor = (status: string) => {
        const colors = {
            'todo': 'bg-gray-500',
            'in-progress': 'bg-blue-500',
            'completed': 'bg-green-500',
            'online': 'bg-green-500',
            'offline': 'bg-gray-500',
            'busy': 'bg-red-500',
            'active': 'bg-green-500',
            'planning': 'bg-blue-500',
            'completed': 'bg-gray-500'
        };
        return colors[status as keyof typeof colors] || 'bg-gray-500';
    };

    const getPriorityColor = (priority: string) => {
        const colors = {
            low: 'text-green-400',
            medium: 'text-yellow-400',
            high: 'text-orange-400',
            urgent: 'text-red-400'
        };
        return colors[priority as keyof typeof colors] || 'text-gray-400';
    };

    const getNotificationColor = (type: string) => {
        const colors = {
            info: 'bg-blue-500',
            success: 'bg-green-500',
            warning: 'bg-yellow-500',
            error: 'bg-red-500'
        };
        return colors[type as keyof typeof colors] || 'bg-gray-500';
    };

    const renderMobileTask = (task: MobileTask) => {
        return (
            <div
                key={task.id}
                className={`group relative overflow-hidden rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer`}
                onClick={() => navigateTo('task-detail', { taskId: task.id })}
            >
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(task.status)}`} />
                        <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority.toUpperCase()}
                        </span>
                        {task.isOffline && (
                            <div className="w-2 h-2 bg-orange-500 rounded-full" />
                        )}
                    </div>
                    <MoreHorizontal className="w-5 h-5 text-gray-400 group-hover:text-gray-300" />
                </div>

                <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {task.title}
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
                    {task.description}
                </p>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Assignee
                        </span>
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {task.assignee}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Due Date
                        </span>
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {task.dueDate}
                        </span>
                    </div>

                    {task.location && (
                        <div className="flex items-center justify-between">
                            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Location
                            </span>
                            <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {task.location}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-700">
                    <div className="flex items-center space-x-3">
                        {task.photos.length > 0 && (
                            <div className="flex items-center space-x-1 text-gray-400">
                                <Camera className="w-4 h-4" />
                                <span className="text-xs">{task.photos.length}</span>
                            </div>
                        )}
                        {task.notes && (
                            <div className="flex items-center space-x-1 text-gray-400">
                                <FileText className="w-4 h-4" />
                                <span className="text-xs">Notes</span>
                            </div>
                        )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-300 group-hover:translate-x-1 transition-transform" />
                </div>
            </div>
        );
    };

    const renderMobileProject = (project: MobileProject) => {
        return (
            <div
                key={project.id}
                className={`group relative overflow-hidden rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer`}
                onClick={() => navigateTo('project-home', { projectId: project.id })}
            >
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(project.status)}`} />
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {project.status.toUpperCase()}
                        </span>
                        {project.isOffline && (
                            <div className="w-2 h-2 bg-orange-500 rounded-full" />
                        )}
                    </div>
                    <MoreHorizontal className="w-5 h-5 text-gray-400 group-hover:text-gray-300" />
                </div>

                <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {project.name}
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
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

                    <div className="flex items-center justify-between">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Team Size
                        </span>
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {project.teamSize} members
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Next Milestone
                        </span>
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {project.nextMilestone}
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-700">
                    <div className="flex items-center space-x-3">
                        {project.photos.length > 0 && (
                            <div className="flex items-center space-x-1 text-gray-400">
                                <Camera className="w-4 h-4" />
                                <span className="text-xs">{project.photos.length}</span>
                            </div>
                        )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-300 group-hover:translate-x-1 transition-transform" />
                </div>
            </div>
        );
    };

    const renderMobileTeamMember = (member: MobileTeamMember) => {
        return (
            <div
                key={member.id}
                className={`flex items-center space-x-3 p-3 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors cursor-pointer`}
                onClick={() => navigateTo('team-member-detail', { memberId: member.id })}
            >
                <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 ${isDarkMode ? 'border-gray-800' : 'border-white'} ${getStatusColor(member.status)}`} />
                    {member.isOffline && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate`}>
                            {member.name}
                        </p>
                    </div>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} truncate`}>
                        {member.role}
                    </p>
                    {member.location && (
                        <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} truncate`}>
                            {member.location}
                        </p>
                    )}
                </div>
                <div className="text-right">
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {member.lastSeen}
                    </p>
                </div>
            </div>
        );
    };

    const renderMobileNotification = (notification: MobileNotification) => {
        return (
            <div
                key={notification.id}
                className={`flex items-start space-x-3 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} transition-colors cursor-pointer ${!notification.isRead ? 'border-l-4 border-blue-500' : ''}`}
                onClick={() => {
                    if (notification.actionUrl) {
                        navigateTo(notification.actionUrl);
                    }
                }}
            >
                <div className={`p-2 rounded-lg ${getNotificationColor(notification.type)}`}>
                    {notification.type === 'success' && <CheckCircle className="w-5 h-5 text-white" />}
                    {notification.type === 'warning' && <AlertTriangle className="w-5 h-5 text-white" />}
                    {notification.type === 'error' && <XCircle className="w-5 h-5 text-white" />}
                    {notification.type === 'info' && <Info className="w-5 h-5 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {notification.title}
                        </p>
                        {notification.isOffline && (
                            <div className="w-2 h-2 bg-orange-500 rounded-full" />
                        )}
                    </div>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                        {notification.message}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                        {notification.timestamp}
                    </p>
                </div>
                {!notification.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                )}
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Loading Mobile Experience...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Mobile Header */}
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center space-x-3 mb-2">
                            <Smartphone className="w-6 h-6 text-white" />
                            <h1 className="text-xl font-bold text-white">Mobile Hub</h1>
                        </div>
                        <p className="text-purple-100 text-sm">Optimized mobile experience</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        {isOffline && (
                            <div className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full">
                                Offline
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={() => navigateTo('mobile-settings')}
                            className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all backdrop-blur-sm"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Tabs */}
            <div className="flex space-x-1 p-1 bg-gray-800 rounded-xl mx-4 mt-4">
                {[
                    { id: 'home', label: 'Home', icon: Home },
                    { id: 'tasks', label: 'Tasks', icon: CheckCircle },
                    { id: 'projects', label: 'Projects', icon: Building2 },
                    { id: 'team', label: 'Team', icon: Users },
                    { id: 'notifications', label: 'Alerts', icon: Bell }
                ].map((tab) => {
                    const TabIcon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg font-medium transition-all ${activeTab === tab.id
                                ? 'bg-purple-600 text-white shadow-lg'
                                : 'text-gray-400 hover:text-white hover:bg-gray-700'
                                }`}
                        >
                            <TabIcon className="w-5 h-5 mb-1" />
                            <span className="text-xs">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            <div className="px-4 py-6">
                {/* Content based on active tab */}
                {activeTab === 'home' && (
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <div>
                            <h2 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Quick Actions
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => navigateTo('new-task')}
                                    className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
                                >
                                    <Plus className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        New Task
                                    </p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigateTo('photo-capture')}
                                    className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
                                >
                                    <Camera className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Take Photo
                                    </p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigateTo('location-tracking')}
                                    className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
                                >
                                    <MapPin className="w-8 h-8 text-green-400 mx-auto mb-2" />
                                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Check In
                                    </p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigateTo('daily-log')}
                                    className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
                                >
                                    <FileText className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Daily Log
                                    </p>
                                </button>
                            </div>
                        </div>

                        {/* Recent Tasks */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Recent Tasks
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('tasks')}
                                    className="text-purple-400 hover:text-purple-300 flex items-center space-x-1"
                                >
                                    <span className="text-sm">View All</span>
                                    <ArrowUpRight className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="space-y-3">
                                {mobileTasks.slice(0, 2).map(renderMobileTask)}
                            </div>
                        </div>

                        {/* Active Projects */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Active Projects
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('projects')}
                                    className="text-purple-400 hover:text-purple-300 flex items-center space-x-1"
                                >
                                    <span className="text-sm">View All</span>
                                    <ArrowUpRight className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="space-y-3">
                                {mobileProjects.slice(0, 1).map(renderMobileProject)}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'tasks' && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                All Tasks
                            </h2>
                            <button
                                type="button"
                                onClick={() => navigateTo('new-task')}
                                className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {mobileTasks.map(renderMobileTask)}
                        </div>
                    </div>
                )}

                {activeTab === 'projects' && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                All Projects
                            </h2>
                            <button
                                type="button"
                                onClick={() => navigateTo('projects')}
                                className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {mobileProjects.map(renderMobileProject)}
                        </div>
                    </div>
                )}

                {activeTab === 'team' && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Team Members
                            </h2>
                            <button
                                type="button"
                                onClick={() => navigateTo('team-management')}
                                className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-2">
                            {mobileTeamMembers.map(renderMobileTeamMember)}
                        </div>
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Notifications
                            </h2>
                            <button
                                type="button"
                                onClick={() => navigateTo('notification-settings')}
                                className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                            >
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-2">
                            {mobileNotifications.map(renderMobileNotification)}
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-4">
                <div className="flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => navigateTo('mobile-sync')}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${isOffline ? 'bg-orange-500' : 'bg-green-500'} text-white`}
                    >
                        {isOffline ? <Upload className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                        <span className="text-sm">
                            {isOffline ? 'Sync' : 'Synced'}
                        </span>
                    </button>
                    <div className="flex items-center space-x-2">
                        <button
                            type="button"
                            onClick={() => navigateTo('mobile-help')}
                            className="p-2 hover:bg-gray-700 rounded-lg"
                        >
                            <Info className="w-5 h-5 text-gray-400" />
                        </button>
                        <button
                            type="button"
                            onClick={() => navigateTo('mobile-menu')}
                            className="p-2 hover:bg-gray-700 rounded-lg"
                        >
                            <Menu className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnhancedMobileExperience;
