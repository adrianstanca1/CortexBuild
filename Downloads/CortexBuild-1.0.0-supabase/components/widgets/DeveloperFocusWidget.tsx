/**
 * Developer Focus Widget
 * 
 * Simplified widget for developers showing their daily focus:
 * - Today's priority tasks
 * - Active modules status
 * - Pending reviews
 * - Motivational coding metrics
 */

import React from 'react';
import { Code, GitBranch, CheckCircle, Clock, Zap, TrendingUp } from 'lucide-react';

export interface DeveloperTask {
    id: string;
    title: string;
    type: 'module' | 'review' | 'bug' | 'feature' | 'optimization';
    priority: 'high' | 'medium' | 'low';
    dueDate?: string;
    status: 'pending' | 'in_progress' | 'completed';
}

export interface DeveloperFocusMetrics {
    tasksThisWeek: number;
    completedTasks: number;
    pendingReviews: number;
    activeModules: number;
    codeQualityScore: number;
    productivityScore: number;
}

interface DeveloperFocusWidgetProps {
    priorityTask: DeveloperTask | null;
    metrics: DeveloperFocusMetrics;
    userName: string;
}

const DeveloperFocusWidget: React.FC<DeveloperFocusWidgetProps> = ({ 
    priorityTask, 
    metrics, 
    userName 
}) => {
    const getTimeOfDay = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const getTaskTypeIcon = (type: DeveloperTask['type']) => {
        switch (type) {
            case 'module':
                return <Code className="h-5 w-5" />;
            case 'review':
                return <GitBranch className="h-5 w-5" />;
            case 'bug':
                return <Zap className="h-5 w-5" />;
            case 'feature':
                return <TrendingUp className="h-5 w-5" />;
            case 'optimization':
                return <CheckCircle className="h-5 w-5" />;
        }
    };

    const getTaskPriorityColor = (priority: DeveloperTask['priority']) => {
        switch (priority) {
            case 'high':
                return 'bg-red-50 border-red-300 text-red-900';
            case 'medium':
                return 'bg-yellow-50 border-yellow-300 text-yellow-900';
            case 'low':
                return 'bg-green-50 border-green-300 text-green-900';
        }
    };

    const getTaskUrgencyLabel = (task: DeveloperTask | null) => {
        if (!task || !task.dueDate) return '';
        
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilDue < 0) return '🚨 Overdue';
        if (daysUntilDue === 0) return '⚡ Due Today';
        if (daysUntilDue === 1) return '📅 Due Tomorrow';
        if (daysUntilDue <= 3) return `📆 Due in ${daysUntilDue} days`;
        return `📋 Due ${dueDate.toLocaleDateString()}`;
    };

    const completionRate = metrics.tasksThisWeek > 0 
        ? (metrics.completedTasks / metrics.tasksThisWeek) * 100 
        : 0;

    const getMotivationalMessage = () => {
        if (completionRate >= 80) {
            return { emoji: '🌟', message: 'Outstanding work! You\'re crushing it!' };
        }
        if (completionRate >= 60) {
            return { emoji: '💪', message: 'Great progress! Keep the momentum going!' };
        }
        if (completionRate >= 40) {
            return { emoji: '🚀', message: 'You\'re on track! Let\'s finish strong!' };
        }
        if (metrics.tasksThisWeek > 0) {
            return { emoji: '⚡', message: 'Let\'s get started! You\'ve got this!' };
        }
        return { emoji: '✨', message: 'Ready for new challenges!' };
    };

    const motivation = getMotivationalMessage();

    return (
        <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 rounded-xl shadow-2xl p-8 text-white">
            {/* Greeting */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">
                    {getTimeOfDay()}, {userName.split(' ')[0]}! 👨‍💻
                </h1>
                <p className="text-emerald-100 text-lg">
                    Let's build something amazing today
                </p>
            </div>

            {/* Today's Priority Task */}
            <div className={`rounded-lg p-6 mb-6 border-2 ${
                priorityTask 
                    ? getTaskPriorityColor(priorityTask.priority) 
                    : 'bg-white border-gray-300 text-gray-900'
            } bg-white bg-opacity-95`}>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold">Today's Priority</h2>
                    {priorityTask && (
                        <span className="text-sm font-semibold">
                            {getTaskUrgencyLabel(priorityTask)}
                        </span>
                    )}
                </div>

                {priorityTask ? (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            {getTaskTypeIcon(priorityTask.type)}
                            <h3 className="font-semibold text-base">{priorityTask.title}</h3>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-700 font-medium capitalize">
                                {priorityTask.type}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-700 font-medium capitalize">
                                {priorityTask.priority} priority
                            </span>
                            {priorityTask.status === 'in_progress' && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                                    <Clock className="h-3 w-3" />
                                    In Progress
                                </span>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">No priority tasks for today</p>
                        <p className="text-xs text-gray-500 mt-1">You're all caught up! 🎉</p>
                    </div>
                )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {/* Tasks This Week */}
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold mb-1">{metrics.tasksThisWeek}</div>
                    <div className="text-xs text-emerald-100">Tasks This Week</div>
                </div>

                {/* Completion Rate */}
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold mb-1">{completionRate.toFixed(0)}%</div>
                    <div className="text-xs text-emerald-100">Completion Rate</div>
                </div>

                {/* Pending Reviews */}
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold mb-1">{metrics.pendingReviews}</div>
                    <div className="text-xs text-emerald-100">Pending Reviews</div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2 text-sm">
                    <span className="text-emerald-100">Weekly Progress</span>
                    <span className="font-semibold">{metrics.completedTasks} / {metrics.tasksThisWeek}</span>
                </div>
                <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
                    <div
                        className="bg-white rounded-full h-3 transition-all duration-500 shadow-lg"
                        style={{ width: `${completionRate}%` }}
                    />
                </div>
            </div>

            {/* Developer Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Code Quality Score */}
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-emerald-100">Code Quality</span>
                        <Code className="h-4 w-4 text-emerald-200" />
                    </div>
                    <div className="text-2xl font-bold">{metrics.codeQualityScore}%</div>
                    <div className="text-xs text-emerald-100 mt-1">
                        {metrics.codeQualityScore >= 90 ? 'Excellent' :
                         metrics.codeQualityScore >= 75 ? 'Good' :
                         metrics.codeQualityScore >= 60 ? 'Fair' :
                         'Needs improvement'}
                    </div>
                </div>

                {/* Productivity Score */}
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-emerald-100">Productivity</span>
                        <TrendingUp className="h-4 w-4 text-emerald-200" />
                    </div>
                    <div className="text-2xl font-bold">{metrics.productivityScore}%</div>
                    <div className="text-xs text-emerald-100 mt-1">
                        {metrics.productivityScore >= 90 ? 'Outstanding' :
                         metrics.productivityScore >= 75 ? 'Strong' :
                         metrics.productivityScore >= 60 ? 'Steady' :
                         'Building momentum'}
                    </div>
                </div>
            </div>

            {/* Active Modules Badge */}
            {metrics.activeModules > 0 && (
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-yellow-300" />
                            <span className="text-sm font-semibold">Active Modules</span>
                        </div>
                        <span className="text-2xl font-bold">{metrics.activeModules}</span>
                    </div>
                </div>
            )}

            {/* Motivational Message */}
            <div className="text-center">
                <p className="text-sm font-semibold">
                    {motivation.emoji} {motivation.message}
                </p>
            </div>
        </div>
    );
};

export default DeveloperFocusWidget;

