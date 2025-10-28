/**
 * Developer Metrics Widget
 * 
 * Displays intelligent developer-specific metrics with ML-powered insights,
 * trend indicators, and actionable recommendations for API usage, sandbox runs,
 * module performance, and cost analytics.
 */

import React from 'react';
import { Code, Zap, DollarSign, Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface DeveloperMetrics {
    // API Usage
    totalApiRequests: number;
    apiRequestsLimit: number;
    apiRequestsUsed: number;
    apiCostThisMonth: number;
    activeProviders: number;

    // Sandbox & Modules
    sandboxRunsToday: number;
    sandboxRunsLimit: number;
    totalModules: number;
    activeModules: number;
    pendingModules: number;

    // Workflows & Integrations
    totalWorkflows: number;
    activeWorkflows: number;
    totalWebhooks: number;
    activeWebhooks: number;

    // Performance
    avgResponseTime: number;
    successRate: number;
    errorRate: number;
}

export interface DeveloperTrends {
    apiUsageTrend: 'improving' | 'stable' | 'declining';
    costTrend: 'improving' | 'stable' | 'declining';
    performanceTrend: 'improving' | 'stable' | 'declining';
    moduleTrend: 'improving' | 'stable' | 'declining';
}

interface DeveloperMetricsWidgetProps {
    metrics: DeveloperMetrics;
    trends: DeveloperTrends;
}

const DeveloperMetricsWidget: React.FC<DeveloperMetricsWidgetProps> = ({ metrics, trends }) => {
    const getTrendIcon = (trend: 'improving' | 'stable' | 'declining') => {
        switch (trend) {
            case 'improving':
                return <TrendingUp className="h-4 w-4" />;
            case 'declining':
                return <TrendingDown className="h-4 w-4" />;
            default:
                return <Minus className="h-4 w-4" />;
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

    const getUsageColor = (used: number, limit: number) => {
        if (limit === -1) return 'text-green-600 bg-green-50 border-green-200';
        const percentage = (used / limit) * 100;
        if (percentage > 90) return 'text-red-600 bg-red-50 border-red-200';
        if (percentage > 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-green-600 bg-green-50 border-green-200';
    };

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

    const usagePercentage = metrics.apiRequestsLimit === -1
        ? 0
        : Math.min((metrics.apiRequestsUsed / metrics.apiRequestsLimit) * 100, 100);

    const sandboxPercentage = metrics.sandboxRunsLimit === -1
        ? 0
        : Math.min((metrics.sandboxRunsToday / metrics.sandboxRunsLimit) * 100, 100);

    const PROGRESS_WIDTH_CLASSES = [
        'w-[0%]', 'w-[5%]', 'w-[10%]', 'w-[15%]', 'w-[20%]', 'w-[25%]', 'w-[30%]', 'w-[35%]', 'w-[40%]', 'w-[45%]',
        'w-[50%]', 'w-[55%]', 'w-[60%]', 'w-[65%]', 'w-[70%]', 'w-[75%]', 'w-[80%]', 'w-[85%]', 'w-[90%]', 'w-[95%]', 'w-[100%]'
    ] as const;

    const getProgressWidthClass = (percentage: number) => {
        const clamped = Math.max(0, Math.min(percentage, 100));
        const index = Math.round(clamped / 5);
        return PROGRESS_WIDTH_CLASSES[index] ?? PROGRESS_WIDTH_CLASSES[0];
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Developer Metrics</h2>
                    <p className="text-sm text-gray-600">ML-powered insights & predictions</p>
                </div>
                <span className="text-2xl">📊</span>
            </div>

            {/* Primary Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* API Usage */}
                <div className={`rounded-lg p-4 border ${getUsageColor(metrics.apiRequestsUsed, metrics.apiRequestsLimit)}`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">API Usage</span>
                        <Code className="h-5 w-5" />
                    </div>
                    <div className="text-3xl font-bold mb-1">
                        {metrics.apiRequestsUsed.toLocaleString()}
                    </div>
                    <div className="text-xs mb-2">
                        {metrics.apiRequestsLimit === -1
                            ? 'Unlimited'
                            : `of ${metrics.apiRequestsLimit.toLocaleString()} requests`}
                    </div>
                    {metrics.apiRequestsLimit !== -1 && (
                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <div
                                className={`bg-current rounded-full h-full transition-all ${getProgressWidthClass(usagePercentage)}`}
                            />
                        </div>
                    )}
                    <div className={`flex items-center gap-1 mt-2 text-xs ${getTrendColor(trends.apiUsageTrend)}`}>
                        {getTrendIcon(trends.apiUsageTrend)}
                        <span className="capitalize">{trends.apiUsageTrend}</span>
                    </div>
                </div>

                {/* Cost Analytics */}
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4 border border-emerald-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-emerald-700">Monthly Cost</span>
                        <DollarSign className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="text-3xl font-bold text-emerald-900 mb-1">
                        {formatCurrency(metrics.apiCostThisMonth)}
                    </div>
                    <div className="text-xs text-emerald-600 mb-2">
                        {metrics.activeProviders} provider{metrics.activeProviders !== 1 ? 's' : ''} active
                    </div>
                    <div className={`flex items-center gap-1 text-xs ${getTrendColor(trends.costTrend)}`}>
                        {getTrendIcon(trends.costTrend)}
                        <span className="capitalize">{trends.costTrend}</span>
                    </div>
                </div>

                {/* Sandbox Runs */}
                <div className={`rounded-lg p-4 border ${getUsageColor(metrics.sandboxRunsToday, metrics.sandboxRunsLimit)}`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Sandbox Runs</span>
                        <Zap className="h-5 w-5" />
                    </div>
                    <div className="text-3xl font-bold mb-1">
                        {metrics.sandboxRunsToday}
                    </div>
                    <div className="text-xs mb-2">
                        {metrics.sandboxRunsLimit === -1
                            ? 'Unlimited today'
                            : `of ${metrics.sandboxRunsLimit} today`}
                    </div>
                    {metrics.sandboxRunsLimit !== -1 && (
                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <div
                                className={`bg-current rounded-full h-full transition-all ${getProgressWidthClass(sandboxPercentage)}`}
                            />
                        </div>
                    )}
                    <div className="text-xs text-gray-600 mt-2">
                        Resets daily
                    </div>
                </div>

                {/* Module Performance */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-purple-700">Modules</span>
                        <Activity className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="text-3xl font-bold text-purple-900 mb-1">
                        {metrics.totalModules}
                    </div>
                    <div className="text-xs text-purple-600 mb-2">
                        {metrics.activeModules} active • {metrics.pendingModules} pending
                    </div>
                    <div className={`flex items-center gap-1 text-xs ${getTrendColor(trends.moduleTrend)}`}>
                        {getTrendIcon(trends.moduleTrend)}
                        <span className="capitalize">{trends.moduleTrend}</span>
                    </div>
                </div>
            </div>

            {/* Performance Indicators */}
            <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Performance Indicators</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Success Rate */}
                    <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-600">Success Rate</span>
                            <span className={`text-xs font-semibold ${metrics.successRate >= 95 ? 'text-green-600' :
                                    metrics.successRate >= 85 ? 'text-yellow-600' :
                                        'text-red-600'
                                }`}>
                                {metrics.successRate.toFixed(1)}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                                className={`rounded-full h-full transition-all ${metrics.successRate >= 95 ? 'bg-green-500' :
                                        metrics.successRate >= 85 ? 'bg-yellow-500' :
                                            'bg-red-500'
                                    } ${getProgressWidthClass(metrics.successRate)}`}
                            />
                        </div>
                    </div>

                    {/* Avg Response Time */}
                    <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-600">Avg Response</span>
                            <span className={`text-xs font-semibold ${metrics.avgResponseTime < 200 ? 'text-green-600' :
                                    metrics.avgResponseTime < 500 ? 'text-yellow-600' :
                                        'text-red-600'
                                }`}>
                                {metrics.avgResponseTime}ms
                            </span>
                        </div>
                        <div className={`flex items-center gap-1 text-xs ${getTrendColor(trends.performanceTrend)}`}>
                            {getTrendIcon(trends.performanceTrend)}
                            <span className="capitalize">{trends.performanceTrend}</span>
                        </div>
                    </div>

                    {/* Error Rate */}
                    <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-600">Error Rate</span>
                            <span className={`text-xs font-semibold ${metrics.errorRate < 1 ? 'text-green-600' :
                                    metrics.errorRate < 5 ? 'text-yellow-600' :
                                        'text-red-600'
                                }`}>
                                {metrics.errorRate.toFixed(2)}%
                            </span>
                        </div>
                        <div className="text-xs text-gray-500">
                            {metrics.errorRate < 1 ? 'Excellent' :
                                metrics.errorRate < 5 ? 'Good' :
                                    'Needs attention'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                        <div className="text-2xl font-bold text-gray-900">{metrics.totalWorkflows}</div>
                        <div className="text-xs text-gray-600">Workflows</div>
                        <div className="text-xs text-emerald-600">{metrics.activeWorkflows} active</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900">{metrics.totalWebhooks}</div>
                        <div className="text-xs text-gray-600">Webhooks</div>
                        <div className="text-xs text-emerald-600">{metrics.activeWebhooks} active</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900">
                            {((metrics.apiRequestsUsed / (metrics.apiRequestsLimit || 1)) * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-600">Quota Used</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900">
                            {formatCurrency(metrics.apiCostThisMonth / Math.max(metrics.apiRequestsUsed, 1))}
                        </div>
                        <div className="text-xs text-gray-600">Cost per Request</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeveloperMetricsWidget;

