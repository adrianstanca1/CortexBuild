/**
 * Daily Focus Widget
 * 
 * Simplified widget for operative users showing their daily focus:
 * - Today's priority task
 * - Quick stats
 * - Simple performance metrics
 */

import React from 'react';
import { Task } from '../../types';
import { DashboardMetrics } from '../../utils/dashboardLogic';

interface DailyFocusWidgetProps {
    firstTask: Task | null;
    metrics: DashboardMetrics;
    userName: string;
}

const DailyFocusWidget: React.FC<DailyFocusWidgetProps> = ({ firstTask, metrics, userName }) => {
    const getTimeOfDay = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const getTaskPriorityColor = (task: Task | null) => {
        if (!task) return 'bg-gray-100 border-gray-300';
        
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilDue < 0) return 'bg-red-50 border-red-300';
        if (daysUntilDue <= 1) return 'bg-orange-50 border-orange-300';
        if (daysUntilDue <= 3) return 'bg-yellow-50 border-yellow-300';
        return 'bg-green-50 border-green-300';
    };

    const getTaskUrgencyLabel = (task: Task | null) => {
        if (!task) return 'No tasks';
        
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilDue < 0) return '🚨 Overdue';
        if (daysUntilDue === 0) return '⚡ Due Today';
        if (daysUntilDue === 1) return '⏰ Due Tomorrow';
        if (daysUntilDue <= 3) return '📅 Due This Week';
        return '✅ On Track';
    };

    const completionRate = metrics.totalTasks > 0 
        ? (metrics.completedTasks / metrics.totalTasks) * 100 
        : 0;

    return (
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-2xl p-8 text-white">
            {/* Greeting */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">
                    {getTimeOfDay()}, {userName.split(' ')[0]}! 👋
                </h1>
                <p className="text-blue-100 text-lg">
                    Let's make today productive
                </p>
            </div>

            {/* Today's Priority Task */}
            <div className={`rounded-lg p-6 mb-6 border-2 ${getTaskPriorityColor(firstTask)} bg-white bg-opacity-95`}>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold text-gray-900">Today's Priority</h2>
                    {firstTask && (
                        <span className="text-sm font-semibold text-gray-700">
                            {getTaskUrgencyLabel(firstTask)}
                        </span>
                    )}
                </div>
                
                {firstTask ? (
                    <div className="space-y-3">
                        <h3 className="text-xl font-bold text-gray-900">{firstTask.title}</h3>
                        {firstTask.description && (
                            <p className="text-gray-700 text-sm">{firstTask.description}</p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                                <span>📍</span>
                                <span>{firstTask.projectName || 'Project'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <span>📅</span>
                                <span>Due: {new Date(firstTask.dueDate).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <span className="text-4xl mb-2 block">🎉</span>
                        <p className="text-gray-700 font-semibold">All caught up!</p>
                        <p className="text-gray-600 text-sm">No urgent tasks for today</p>
                    </div>
                )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
                {/* Tasks Today */}
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold mb-1">{metrics.upcomingTasks}</div>
                    <div className="text-xs text-blue-100">Tasks This Week</div>
                </div>

                {/* Completion Rate */}
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold mb-1">{completionRate.toFixed(0)}%</div>
                    <div className="text-xs text-blue-100">Completion Rate</div>
                </div>

                {/* Overdue */}
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold mb-1">{metrics.overdueTasks}</div>
                    <div className="text-xs text-blue-100">Overdue Tasks</div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">Today's Progress</span>
                    <span className="text-sm">{metrics.completedTasks} / {metrics.totalTasks}</span>
                </div>
                <div className="w-full bg-white bg-opacity-30 rounded-full h-3">
                    <div
                        className="bg-white rounded-full h-3 transition-all duration-500"
                        style={{ width: `${completionRate}%` }}
                    />
                </div>
            </div>

            {/* Motivational Message */}
            <div className="mt-6 text-center">
                {completionRate >= 80 && (
                    <p className="text-sm font-semibold">🌟 Excellent work! Keep it up!</p>
                )}
                {completionRate >= 50 && completionRate < 80 && (
                    <p className="text-sm font-semibold">💪 Great progress! You're doing well!</p>
                )}
                {completionRate < 50 && metrics.totalTasks > 0 && (
                    <p className="text-sm font-semibold">🚀 Let's get started! You've got this!</p>
                )}
                {metrics.totalTasks === 0 && (
                    <p className="text-sm font-semibold">✨ Ready for new challenges!</p>
                )}
            </div>
        </div>
    );
};

export default DailyFocusWidget;

