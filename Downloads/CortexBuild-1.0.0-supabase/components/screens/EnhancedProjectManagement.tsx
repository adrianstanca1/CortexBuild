/**
 * Enhanced Project Management - Buildr-Inspired Features
 * Advanced project tracking, team collaboration, and financial management
 */

import React, { useState, useEffect } from 'react';
import {
    Calendar, Clock, Users, DollarSign, MapPin, Camera, FileText,
    AlertTriangle, CheckCircle, XCircle, Play, Pause, RotateCcw,
    Edit, Trash2, Plus, Search, Filter, Download, Upload,
    Share2, Star, Heart, MessageSquare, Bell, Eye, Lock,
    Unlock, ArrowUpRight, ArrowDownRight, TrendingUp, BarChart3,
    PieChart, Target, Award, Zap, Activity, Settings, MoreHorizontal
} from 'lucide-react';
import { User, Project } from '../../types';

interface EnhancedProjectManagementProps {
    currentUser: User;
    navigateTo: (screen: string, params?: any) => void;
    project?: Project;
    isDarkMode?: boolean;
}

interface ProjectPhase {
    id: string;
    name: string;
    status: 'completed' | 'active' | 'upcoming' | 'delayed';
    startDate: string;
    endDate: string;
    progress: number;
    budget: number;
    spent: number;
    teamMembers: string[];
    deliverables: string[];
}

interface TaskItem {
    id: string;
    title: string;
    description: string;
    status: 'todo' | 'in-progress' | 'review' | 'completed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    assignee: string;
    dueDate: string;
    estimatedHours: number;
    actualHours: number;
    tags: string[];
    attachments: number;
    comments: number;
}

interface FinancialMetric {
    category: string;
    budgeted: number;
    actual: number;
    variance: number;
    percentage: number;
}

interface TeamMember {
    id: string;
    name: string;
    role: string;
    avatar: string;
    status: 'online' | 'offline' | 'busy';
    currentTask?: string;
    hoursWorked: number;
    efficiency: number;
}

const EnhancedProjectManagement: React.FC<EnhancedProjectManagementProps> = ({
    currentUser,
    navigateTo,
    project,
    isDarkMode = true
}) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'team' | 'financial' | 'timeline'>('overview');
    const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Mock data - in real app, this would come from API
    const [phases] = useState<ProjectPhase[]>([
        {
            id: '1',
            name: 'Planning & Design',
            status: 'completed',
            startDate: '2024-01-15',
            endDate: '2024-02-15',
            progress: 100,
            budget: 150000,
            spent: 145000,
            teamMembers: ['Sarah Johnson', 'Mike Chen'],
            deliverables: ['Architectural Plans', 'Permits', 'Budget Approval']
        },
        {
            id: '2',
            name: 'Foundation & Structure',
            status: 'active',
            startDate: '2024-02-16',
            endDate: '2024-04-15',
            progress: 75,
            budget: 500000,
            spent: 375000,
            teamMembers: ['Mike Chen', 'Emily Rodriguez', 'David Kim'],
            deliverables: ['Foundation Complete', 'Structural Framework', 'Safety Inspections']
        },
        {
            id: '3',
            name: 'Interior & Finishing',
            status: 'upcoming',
            startDate: '2024-04-16',
            endDate: '2024-07-15',
            progress: 0,
            budget: 300000,
            spent: 0,
            teamMembers: ['Sarah Johnson', 'Lisa Wang', 'Tom Wilson'],
            deliverables: ['Interior Design', 'Final Inspections', 'Handover']
        }
    ]);

    const [tasks] = useState<TaskItem[]>([
        {
            id: '1',
            title: 'Foundation Inspection',
            description: 'Complete quality inspection of foundation work',
            status: 'completed',
            priority: 'high',
            assignee: 'Emily Rodriguez',
            dueDate: '2024-03-15',
            estimatedHours: 8,
            actualHours: 7,
            tags: ['quality', 'inspection'],
            attachments: 3,
            comments: 5
        },
        {
            id: '2',
            title: 'Structural Steel Installation',
            description: 'Install structural steel framework for building',
            status: 'in-progress',
            priority: 'urgent',
            assignee: 'Mike Chen',
            dueDate: '2024-03-20',
            estimatedHours: 40,
            actualHours: 25,
            tags: ['construction', 'steel'],
            attachments: 1,
            comments: 8
        },
        {
            id: '3',
            title: 'Safety Protocol Review',
            description: 'Review and update safety protocols for next phase',
            status: 'review',
            priority: 'medium',
            assignee: 'Sarah Johnson',
            dueDate: '2024-03-18',
            estimatedHours: 4,
            actualHours: 4,
            tags: ['safety', 'compliance'],
            attachments: 2,
            comments: 3
        }
    ]);

    const [financialMetrics] = useState<FinancialMetric[]>([
        { category: 'Labor', budgeted: 200000, actual: 185000, variance: -15000, percentage: 92.5 },
        { category: 'Materials', budgeted: 300000, actual: 320000, variance: 20000, percentage: 106.7 },
        { category: 'Equipment', budgeted: 150000, actual: 140000, variance: -10000, percentage: 93.3 },
        { category: 'Subcontractors', budgeted: 200000, actual: 195000, variance: -5000, percentage: 97.5 }
    ]);

    const [teamMembers] = useState<TeamMember[]>([
        {
            id: '1',
            name: 'Sarah Johnson',
            role: 'Project Manager',
            avatar: '/avatars/sarah.jpg',
            status: 'online',
            currentTask: 'Safety Protocol Review',
            hoursWorked: 45,
            efficiency: 95
        },
        {
            id: '2',
            name: 'Mike Chen',
            role: 'Site Supervisor',
            avatar: '/avatars/mike.jpg',
            status: 'busy',
            currentTask: 'Structural Steel Installation',
            hoursWorked: 38,
            efficiency: 88
        },
        {
            id: '3',
            name: 'Emily Rodriguez',
            role: 'Safety Officer',
            avatar: '/avatars/emily.jpg',
            status: 'online',
            currentTask: 'Foundation Inspection',
            hoursWorked: 42,
            efficiency: 92
        }
    ]);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    const getStatusColor = (status: string) => {
        const colors = {
            completed: 'bg-green-500',
            active: 'bg-blue-500',
            upcoming: 'bg-gray-500',
            delayed: 'bg-red-500',
            todo: 'bg-gray-500',
            'in-progress': 'bg-blue-500',
            review: 'bg-yellow-500',
            online: 'bg-green-500',
            offline: 'bg-gray-500',
            busy: 'bg-yellow-500'
        };
        return colors[status as keyof typeof colors] || 'bg-gray-500';
    };

    const getPriorityColor = (priority: string) => {
        const colors = {
            low: 'text-green-500',
            medium: 'text-yellow-500',
            high: 'text-orange-500',
            urgent: 'text-red-500'
        };
        return colors[priority as keyof typeof colors] || 'text-gray-500';
    };

    const renderPhaseCard = (phase: ProjectPhase) => {
        const remainingBudget = phase.budget - phase.spent;
        const budgetPercentage = (phase.spent / phase.budget) * 100;

        return (
            <div
                key={phase.id}
                className={`group relative overflow-hidden rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer`}
                onClick={() => setSelectedPhase(phase.id)}
            >
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(phase.status)}`} />
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {phase.status.toUpperCase()}
                        </span>
                    </div>
                    <MoreHorizontal className="w-5 h-5 text-gray-400 group-hover:text-gray-300" />
                </div>

                <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {phase.name}
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                    {phase.startDate} - {phase.endDate}
                </p>

                <div className="space-y-3">
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Progress</span>
                            <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{phase.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${phase.progress}%` }}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Budget</span>
                            <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                                ${(phase.spent / 1000).toFixed(0)}K / ${(phase.budget / 1000).toFixed(0)}K
                            </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full transition-all duration-500 ${budgetPercentage > 100 ? 'bg-red-500' : 'bg-gradient-to-r from-green-500 to-emerald-500'}`}
                                style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                    <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {phase.teamMembers.length} members
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {phase.deliverables.length} deliverables
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    const renderTaskCard = (task: TaskItem) => {
        const hoursVariance = task.actualHours - task.estimatedHours;
        const hoursPercentage = (task.actualHours / task.estimatedHours) * 100;

        return (
            <div
                key={task.id}
                className={`group relative overflow-hidden rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer`}
                onClick={() => navigateTo('task-detail', { taskId: task.id })}
            >
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(task.status)}`} />
                        <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority.toUpperCase()}
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        {task.attachments > 0 && (
                            <div className="flex items-center space-x-1 text-gray-400">
                                <FileText className="w-4 h-4" />
                                <span className="text-xs">{task.attachments}</span>
                            </div>
                        )}
                        {task.comments > 0 && (
                            <div className="flex items-center space-x-1 text-gray-400">
                                <MessageSquare className="w-4 h-4" />
                                <span className="text-xs">{task.comments}</span>
                            </div>
                        )}
                    </div>
                </div>

                <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {task.title}
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                    {task.description}
                </p>

                <div className="space-y-3">
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

                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Hours</span>
                            <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                                {task.actualHours}h / {task.estimatedHours}h
                            </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full transition-all duration-500 ${hoursPercentage > 100 ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`}
                                style={{ width: `${Math.min(hoursPercentage, 100)}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                    <div className="flex flex-wrap gap-1">
                        {task.tags.map(tag => (
                            <span
                                key={tag}
                                className="px-2 py-1 bg-purple-500/10 text-purple-400 text-xs rounded-full"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            type="button"
                            className="p-1 hover:bg-gray-700 rounded"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigateTo('task-detail', { taskId: task.id });
                            }}
                        >
                            <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                            type="button"
                            className="p-1 hover:bg-gray-700 rounded"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigateTo('edit-task', { taskId: task.id });
                            }}
                        >
                            <Edit className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderTeamMember = (member: TeamMember) => {
        return (
            <div
                key={member.id}
                className={`group relative overflow-hidden rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
            >
                <div className="flex items-start justify-between mb-4">
                    <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 ${isDarkMode ? 'border-gray-800' : 'border-white'} ${getStatusColor(member.status)}`} />
                    </div>
                    <div className="text-right">
                        <div className={`text-sm font-medium ${member.efficiency >= 90 ? 'text-green-400' : member.efficiency >= 80 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {member.efficiency}% efficiency
                        </div>
                    </div>
                </div>

                <h3 className={`text-lg font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {member.name}
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                    {member.role}
                </p>

                <div className="space-y-3">
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Hours Worked</span>
                            <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{member.hoursWorked}h</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${(member.hoursWorked / 50) * 100}%` }}
                            />
                        </div>
                    </div>

                    {member.currentTask && (
                        <div className="p-3 bg-gray-700 rounded-lg">
                            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Current Task:
                            </p>
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {member.currentTask}
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                    <div className="flex items-center space-x-2">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {member.status}
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            type="button"
                            className="p-1 hover:bg-gray-700 rounded"
                            onClick={() => navigateTo('team-member-detail', { memberId: member.id })}
                        >
                            <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                            type="button"
                            className="p-1 hover:bg-gray-700 rounded"
                            onClick={() => navigateTo('message-member', { memberId: member.id })}
                        >
                            <MessageSquare className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderFinancialMetric = (metric: FinancialMetric) => {
        const isOverBudget = metric.actual > metric.budgeted;
        const varianceColor = isOverBudget ? 'text-red-400' : 'text-green-400';
        const barColor = isOverBudget ? 'bg-red-500' : 'bg-green-500';

        return (
            <div
                key={metric.category}
                className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {metric.category}
                    </h3>
                    <div className={`text-sm font-medium ${varianceColor}`}>
                        {isOverBudget ? '+' : ''}${(metric.variance / 1000).toFixed(0)}K
                    </div>
                </div>

                <div className="space-y-3">
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Budgeted</span>
                            <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                                ${(metric.budgeted / 1000).toFixed(0)}K
                            </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-gray-500 h-2 rounded-full"
                                style={{ width: '100%' }}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Actual</span>
                            <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                                ${(metric.actual / 1000).toFixed(0)}K
                            </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full transition-all duration-500 ${barColor}`}
                                style={{ width: `${Math.min(metric.percentage, 120)}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="flex items-center justify-between">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Variance
                        </span>
                        <span className={`text-sm font-medium ${varianceColor}`}>
                            {metric.percentage.toFixed(1)}%
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
                        Loading Project Management...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center space-x-3 mb-2">
                                <FolderKanban className="w-8 h-8 text-white" />
                                <h1 className="text-3xl font-bold text-white">
                                    {project?.name || 'Project Management'}
                                </h1>
                            </div>
                            <p className="text-blue-100">Advanced project tracking and team collaboration</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                type="button"
                                onClick={() => navigateTo('project-settings')}
                                className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all backdrop-blur-sm"
                            >
                                <Settings className="w-5 h-5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => navigateTo('project-analytics')}
                                className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all backdrop-blur-sm"
                            >
                                <BarChart3 className="w-5 h-5" />
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
                        { id: 'tasks', label: 'Tasks', icon: CheckCircle },
                        { id: 'team', label: 'Team', icon: Users },
                        { id: 'financial', label: 'Financial', icon: DollarSign },
                        { id: 'timeline', label: 'Timeline', icon: Calendar }
                    ].map((tab) => {
                        const TabIcon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${activeTab === tab.id
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

                {/* Content based on active tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Project Phases */}
                        <div>
                            <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Project Phases
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {phases.map(renderPhaseCard)}
                            </div>
                        </div>

                        {/* Recent Tasks */}
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Recent Tasks
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('tasks')}
                                    className="text-purple-400 hover:text-purple-300 flex items-center space-x-1"
                                >
                                    <span>View All</span>
                                    <ArrowUpRight className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {tasks.slice(0, 3).map(renderTaskCard)}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'tasks' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                All Tasks
                            </h2>
                            <div className="flex items-center space-x-3">
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center space-x-2"
                                >
                                    <Filter className="w-5 h-5" />
                                    <span>Filter</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigateTo('new-task')}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span>New Task</span>
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {tasks.map(renderTaskCard)}
                        </div>
                    </div>
                )}

                {activeTab === 'team' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Team Members
                            </h2>
                            <button
                                type="button"
                                onClick={() => navigateTo('add-team-member')}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Add Member</span>
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {teamMembers.map(renderTeamMember)}
                        </div>
                    </div>
                )}

                {activeTab === 'financial' && (
                    <div>
                        <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Financial Overview
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {financialMetrics.map(renderFinancialMetric)}
                        </div>
                    </div>
                )}

                {activeTab === 'timeline' && (
                    <div>
                        <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Project Timeline
                        </h2>
                        <div className="space-y-6">
                            {phases.map((phase, index) => (
                                <div
                                    key={phase.id}
                                    className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-shrink-0">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(phase.status)}`}>
                                                <span className="text-white font-bold">{index + 1}</span>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {phase.name}
                                            </h3>
                                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {phase.startDate} - {phase.endDate}
                                            </p>
                                            <div className="mt-2">
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Progress</span>
                                                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{phase.progress}%</span>
                                                </div>
                                                <div className="w-full bg-gray-700 rounded-full h-2">
                                                    <div
                                                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                                                        style={{ width: `${phase.progress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                ${(phase.budget / 1000).toFixed(0)}K
                                            </div>
                                            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                Budget
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EnhancedProjectManagement;
