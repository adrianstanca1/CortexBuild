/**
 * Developer Insights Widget
 * 
 * Displays AI-powered insights with actionable recommendations for developers,
 * including code quality suggestions, performance bottlenecks, security alerts,
 * and optimization opportunities.
 */

import React, { useState } from 'react';
import { 
    AlertTriangle, 
    CheckCircle, 
    Info, 
    XCircle, 
    ChevronDown, 
    ChevronUp,
    Code,
    Zap,
    Shield,
    TrendingUp,
    DollarSign,
    Activity
} from 'lucide-react';

export type InsightType = 'danger' | 'warning' | 'success' | 'info';
export type InsightPriority = 'high' | 'medium' | 'low';
export type InsightCategory = 'performance' | 'cost' | 'security' | 'quality' | 'optimization' | 'usage';

export interface DeveloperInsight {
    id: string;
    title: string;
    message: string;
    type: InsightType;
    priority: InsightPriority;
    category: InsightCategory;
    details?: string;
    recommendation?: string;
    mlPrediction?: {
        confidence: number;
        impact: 'high' | 'medium' | 'low';
        timeframe: string;
    };
    action?: {
        label: string;
        callback?: () => void;
    };
}

interface DeveloperInsightsWidgetProps {
    insights: DeveloperInsight[];
    onAction?: (insightId: string) => void;
}

const DeveloperInsightsWidget: React.FC<DeveloperInsightsWidgetProps> = ({ insights, onAction }) => {
    const [expandedInsight, setExpandedInsight] = useState<string | null>(null);

    const toggleExpand = (id: string) => {
        setExpandedInsight(expandedInsight === id ? null : id);
    };

    const getTypeIcon = (type: InsightType) => {
        switch (type) {
            case 'danger':
                return <XCircle className="h-5 w-5" />;
            case 'warning':
                return <AlertTriangle className="h-5 w-5" />;
            case 'success':
                return <CheckCircle className="h-5 w-5" />;
            case 'info':
                return <Info className="h-5 w-5" />;
        }
    };

    const getCategoryIcon = (category: InsightCategory) => {
        switch (category) {
            case 'performance':
                return <Zap className="h-4 w-4" />;
            case 'cost':
                return <DollarSign className="h-4 w-4" />;
            case 'security':
                return <Shield className="h-4 w-4" />;
            case 'quality':
                return <Code className="h-4 w-4" />;
            case 'optimization':
                return <TrendingUp className="h-4 w-4" />;
            case 'usage':
                return <Activity className="h-4 w-4" />;
        }
    };

    const getTypeColor = (type: InsightType) => {
        switch (type) {
            case 'danger':
                return 'bg-red-50 border-red-200 text-red-800';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            case 'success':
                return 'bg-green-50 border-green-200 text-green-800';
            case 'info':
                return 'bg-blue-50 border-blue-200 text-blue-800';
        }
    };

    const getTypeIconColor = (type: InsightType) => {
        switch (type) {
            case 'danger':
                return 'text-red-600';
            case 'warning':
                return 'text-yellow-600';
            case 'success':
                return 'text-green-600';
            case 'info':
                return 'text-blue-600';
        }
    };

    const getPriorityBadge = (priority: InsightPriority) => {
        const colors = {
            high: 'bg-red-100 text-red-700 border-red-300',
            medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
            low: 'bg-blue-100 text-blue-700 border-blue-300'
        };

        return (
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${colors[priority]}`}>
                {priority.toUpperCase()}
            </span>
        );
    };

    const getCategoryBadge = (category: InsightCategory) => {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                {getCategoryIcon(category)}
                <span className="capitalize">{category}</span>
            </span>
        );
    };

    // Group insights by priority
    const highPriorityInsights = insights.filter(i => i.priority === 'high');
    const mediumPriorityInsights = insights.filter(i => i.priority === 'medium');
    const lowPriorityInsights = insights.filter(i => i.priority === 'low');

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Smart Insights</h2>
                    <p className="text-sm text-gray-600">AI-powered recommendations for developers</p>
                </div>
                <span className="text-2xl">🧠</span>
            </div>

            {/* Priority Summary */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                    <div className="text-2xl font-bold text-red-700">{highPriorityInsights.length}</div>
                    <div className="text-xs text-red-600">High Priority</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-100">
                    <div className="text-2xl font-bold text-yellow-700">{mediumPriorityInsights.length}</div>
                    <div className="text-xs text-yellow-600">Medium Priority</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                    <div className="text-2xl font-bold text-blue-700">{lowPriorityInsights.length}</div>
                    <div className="text-xs text-blue-600">Low Priority</div>
                </div>
            </div>

            {/* Insights List */}
            <div className="space-y-3">
                {insights.length === 0 ? (
                    <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                        <p className="text-sm text-gray-600">All systems running smoothly!</p>
                        <p className="text-xs text-gray-500 mt-1">No critical insights at this time</p>
                    </div>
                ) : (
                    insights.map((insight) => {
                        const isExpanded = expandedInsight === insight.id;

                        return (
                            <div
                                key={insight.id}
                                className={`border rounded-lg p-4 transition-all duration-200 ${getTypeColor(insight.type)} hover:shadow-md cursor-pointer`}
                                onClick={() => toggleExpand(insight.id)}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-3 flex-1">
                                        <span className={`flex-shrink-0 ${getTypeIconColor(insight.type)}`}>
                                            {getTypeIcon(insight.type)}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <h3 className="font-semibold text-sm">{insight.title}</h3>
                                                {getPriorityBadge(insight.priority)}
                                                {getCategoryBadge(insight.category)}
                                            </div>
                                            <p className="text-sm">{insight.message}</p>
                                        </div>
                                    </div>
                                    <button
                                        className="flex-shrink-0 ml-2 text-gray-500 hover:text-gray-700"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleExpand(insight.id);
                                        }}
                                    >
                                        {isExpanded ? (
                                            <ChevronUp className="h-5 w-5" />
                                        ) : (
                                            <ChevronDown className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div className="mt-4 pt-4 border-t border-current border-opacity-20 space-y-3">
                                        {insight.details && (
                                            <div>
                                                <h4 className="text-xs font-semibold text-gray-700 mb-1">Details</h4>
                                                <p className="text-xs text-gray-600">{insight.details}</p>
                                            </div>
                                        )}

                                        {insight.recommendation && (
                                            <div>
                                                <h4 className="text-xs font-semibold text-gray-700 mb-1">Recommendation</h4>
                                                <p className="text-xs text-gray-600">{insight.recommendation}</p>
                                            </div>
                                        )}

                                        {insight.mlPrediction && (
                                            <div className="bg-white bg-opacity-50 rounded p-3">
                                                <h4 className="text-xs font-semibold text-gray-700 mb-2">ML Prediction</h4>
                                                <div className="grid grid-cols-3 gap-2 text-xs">
                                                    <div>
                                                        <span className="text-gray-600">Confidence:</span>
                                                        <div className="font-semibold text-gray-900">
                                                            {(insight.mlPrediction.confidence * 100).toFixed(0)}%
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">Impact:</span>
                                                        <div className="font-semibold text-gray-900 capitalize">
                                                            {insight.mlPrediction.impact}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">Timeframe:</span>
                                                        <div className="font-semibold text-gray-900">
                                                            {insight.mlPrediction.timeframe}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {insight.action && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (insight.action?.callback) {
                                                        insight.action.callback();
                                                    } else if (onAction) {
                                                        onAction(insight.id);
                                                    }
                                                }}
                                                className="w-full mt-2 px-4 py-2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-900 text-sm font-semibold rounded-lg border border-gray-300 transition-all"
                                            >
                                                {insight.action.label}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer Stats */}
            {insights.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>Total Insights: {insights.length}</span>
                        <span>Last updated: {new Date().toLocaleTimeString()}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeveloperInsightsWidget;

