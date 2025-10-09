/**
 * Smart Metrics Widget
 * 
 * Displays intelligent metrics with ML-powered insights,
 * trend indicators, and actionable recommendations.
 */

import React from 'react';
import { DashboardMetrics } from '../../utils/dashboardLogic';

interface SmartMetricsWidgetProps {
    metrics: DashboardMetrics;
    trends: {
        budgetTrend: 'improving' | 'stable' | 'declining';
        timelineTrend: 'improving' | 'stable' | 'declining';
        riskTrend: 'improving' | 'stable' | 'declining';
    };
}

const SmartMetricsWidget: React.FC<SmartMetricsWidgetProps> = ({ metrics, trends }) => {
    const getTrendIcon = (trend: 'improving' | 'stable' | 'declining') => {
        switch (trend) {
            case 'improving':
                return '📈';
            case 'declining':
                return '📉';
            default:
                return '➡️';
        }
    };

    const getTrendColor = (trend: 'improving' | 'stable' | 'declining') => {
        switch (trend) {
            case 'improving':
                return 'text-green-600';
            case 'declining':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    const getRiskColor = (score: number) => {
        if (score > 70) return 'text-red-600 bg-red-50 border-red-200';
        if (score > 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-green-600 bg-green-50 border-green-200';
    };

    const getRiskLabel = (score: number) => {
        if (score > 70) return 'High Risk';
        if (score > 40) return 'Medium Risk';
        return 'Low Risk';
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Smart Metrics</h2>
                <span className="text-2xl">🎯</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Projects Overview */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-700">Active Projects</span>
                        <span className="text-2xl">🏗️</span>
                    </div>
                    <div className="text-3xl font-bold text-blue-900">{metrics.activeProjects}</div>
                    <div className="text-xs text-blue-600 mt-1">
                        {metrics.completedProjects} completed • {metrics.delayedProjects} delayed
                    </div>
                </div>

                {/* Budget Health */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-green-700">Budget Health</span>
                        <span className={`text-xl ${getTrendColor(trends.budgetTrend)}`}>
                            {getTrendIcon(trends.budgetTrend)}
                        </span>
                    </div>
                    <div className="text-3xl font-bold text-green-900">
                        {metrics.budgetUtilization.toFixed(0)}%
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                        ${(metrics.remainingBudget / 1000000).toFixed(1)}M remaining
                    </div>
                </div>

                {/* Task Performance */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-purple-700">Task Completion</span>
                        <span className="text-2xl">✅</span>
                    </div>
                    <div className="text-3xl font-bold text-purple-900">
                        {metrics.taskCompletionRate.toFixed(0)}%
                    </div>
                    <div className="text-xs text-purple-600 mt-1">
                        {metrics.completedTasks} of {metrics.totalTasks} tasks
                    </div>
                </div>

                {/* Risk Score */}
                <div className={`rounded-lg p-4 border ${getRiskColor(metrics.overallRiskScore)}`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Overall Risk</span>
                        <span className={`text-xl ${getTrendColor(trends.riskTrend)}`}>
                            {getTrendIcon(trends.riskTrend)}
                        </span>
                    </div>
                    <div className="text-3xl font-bold">
                        {metrics.overallRiskScore.toFixed(0)}
                    </div>
                    <div className="text-xs mt-1">
                        {getRiskLabel(metrics.overallRiskScore)}
                    </div>
                </div>
            </div>

            {/* Performance Indicators */}
            <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Performance Indicators</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* On-Time Delivery */}
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-xl">⏱️</span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="text-xs text-gray-600">On-Time Delivery</div>
                            <div className="text-lg font-bold text-gray-900">
                                {metrics.onTimeDeliveryRate.toFixed(0)}%
                            </div>
                        </div>
                    </div>

                    {/* Budget Compliance */}
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                <span className="text-xl">💰</span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="text-xs text-gray-600">Budget Compliance</div>
                            <div className="text-lg font-bold text-gray-900">
                                {metrics.budgetComplianceRate.toFixed(0)}%
                            </div>
                        </div>
                    </div>

                    {/* Team Productivity */}
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                                <span className="text-xl">🚀</span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="text-xs text-gray-600">Team Productivity</div>
                            <div className="text-lg font-bold text-gray-900">
                                {metrics.teamProductivity.toFixed(0)}%
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Risk Breakdown */}
            <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Risk Distribution</h3>
                <div className="flex items-center space-x-2">
                    {/* High Risk */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">High Risk</span>
                            <span className="text-xs font-semibold text-red-600">
                                {metrics.highRiskProjects}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                                style={{
                                    width: `${metrics.totalProjects > 0 ? (metrics.highRiskProjects / metrics.totalProjects) * 100 : 0}%`
                                }}
                            />
                        </div>
                    </div>

                    {/* Medium Risk */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">Medium Risk</span>
                            <span className="text-xs font-semibold text-yellow-600">
                                {metrics.mediumRiskProjects}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                                style={{
                                    width: `${metrics.totalProjects > 0 ? (metrics.mediumRiskProjects / metrics.totalProjects) * 100 : 0}%`
                                }}
                            />
                        </div>
                    </div>

                    {/* Low Risk */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">Low Risk</span>
                            <span className="text-xs font-semibold text-green-600">
                                {metrics.lowRiskProjects}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                style={{
                                    width: `${metrics.totalProjects > 0 ? (metrics.lowRiskProjects / metrics.totalProjects) * 100 : 0}%`
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                        <div className="text-2xl font-bold text-gray-900">{metrics.overdueTasks}</div>
                        <div className="text-xs text-gray-600">Overdue Tasks</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900">{metrics.upcomingTasks}</div>
                        <div className="text-xs text-gray-600">Due This Week</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900">
                            ${(metrics.totalBudget / 1000000).toFixed(1)}M
                        </div>
                        <div className="text-xs text-gray-600">Total Budget</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900">
                            ${(metrics.spentBudget / 1000000).toFixed(1)}M
                        </div>
                        <div className="text-xs text-gray-600">Spent</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SmartMetricsWidget;

