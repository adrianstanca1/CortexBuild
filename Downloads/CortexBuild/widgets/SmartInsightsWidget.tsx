/**
 * Smart Insights Widget
 * 
 * Displays AI-powered insights with actionable recommendations,
 * priority indicators, and quick actions.
 */

import React, { useState } from 'react';
import { ProjectInsight } from '../../utils/dashboardLogic';
import { Screen } from '../../types';

interface SmartInsightsWidgetProps {
    insights: ProjectInsight[];
    onNavigate?: (projectId: string) => void;
}

const SmartInsightsWidget: React.FC<SmartInsightsWidgetProps> = ({ insights, onNavigate }) => {
    const [expandedInsight, setExpandedInsight] = useState<string | null>(null);

    const getTypeIcon = (type: ProjectInsight['type']) => {
        switch (type) {
            case 'danger':
                return '🚨';
            case 'warning':
                return '⚠️';
            case 'success':
                return '✅';
            case 'info':
                return 'ℹ️';
        }
    };

    const getTypeColor = (type: ProjectInsight['type']) => {
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

    const getPriorityBadge = (priority: ProjectInsight['priority']) => {
        const colors = {
            high: 'bg-red-100 text-red-800 border-red-300',
            medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            low: 'bg-green-100 text-green-800 border-green-300',
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${colors[priority]}`}>
                {priority.toUpperCase()}
            </span>
        );
    };

    const toggleExpand = (projectId: string) => {
        setExpandedInsight(expandedInsight === projectId ? null : projectId);
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
                    <p className="text-sm text-gray-600">AI-powered recommendations</p>
                </div>
                <span className="text-2xl">🧠</span>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-2xl font-bold text-red-600">{highPriorityInsights.length}</div>
                    <div className="text-xs text-red-700">High Priority</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="text-2xl font-bold text-yellow-600">{mediumPriorityInsights.length}</div>
                    <div className="text-xs text-yellow-700">Medium Priority</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-600">{lowPriorityInsights.length}</div>
                    <div className="text-xs text-green-700">Low Priority</div>
                </div>
            </div>

            {/* Insights List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
                {insights.length === 0 ? (
                    <div className="text-center py-8">
                        <span className="text-4xl mb-2 block">🎉</span>
                        <p className="text-gray-600">No critical insights at the moment!</p>
                        <p className="text-sm text-gray-500 mt-1">All projects are performing well.</p>
                    </div>
                ) : (
                    insights.map((insight) => {
                        const isExpanded = expandedInsight === insight.projectId;
                        
                        return (
                            <div
                                key={insight.projectId}
                                className={`border rounded-lg p-4 transition-all duration-200 ${getTypeColor(insight.type)} hover:shadow-md cursor-pointer`}
                                onClick={() => toggleExpand(insight.projectId)}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-3 flex-1">
                                        <span className="text-2xl flex-shrink-0">
                                            {getTypeIcon(insight.type)}
                                        </span>
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <h3 className="font-semibold text-sm">{insight.title}</h3>
                                                {getPriorityBadge(insight.priority)}
                                            </div>
                                            <p className="text-xs font-medium mb-1">{insight.projectName}</p>
                                            <p className="text-sm">{insight.message}</p>
                                        </div>
                                    </div>
                                    <button
                                        className="ml-2 text-gray-500 hover:text-gray-700 transition-transform duration-200"
                                        style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                                    >
                                        ▼
                                    </button>
                                </div>

                                {/* Expanded Content */}
                                {isExpanded && (
                                    <div className="mt-4 pt-4 border-t border-current border-opacity-20 animate-fadeIn">
                                        {/* ML Prediction Details */}
                                        {insight.prediction && (
                                            <div className="mb-4 space-y-2">
                                                <h4 className="text-xs font-semibold uppercase tracking-wide opacity-75">
                                                    ML Prediction
                                                </h4>
                                                <div className="grid grid-cols-3 gap-2 text-xs">
                                                    <div className="bg-white bg-opacity-50 rounded p-2">
                                                        <div className="font-semibold">Budget</div>
                                                        <div className="text-lg font-bold">
                                                            {insight.prediction.prediction[0].toFixed(1)}%
                                                        </div>
                                                        <div className="opacity-75">overrun</div>
                                                    </div>
                                                    <div className="bg-white bg-opacity-50 rounded p-2">
                                                        <div className="font-semibold">Timeline</div>
                                                        <div className="text-lg font-bold">
                                                            {insight.prediction.prediction[1].toFixed(0)}
                                                        </div>
                                                        <div className="opacity-75">days delay</div>
                                                    </div>
                                                    <div className="bg-white bg-opacity-50 rounded p-2">
                                                        <div className="font-semibold">Risk</div>
                                                        <div className="text-lg font-bold">
                                                            {insight.prediction.prediction[2].toFixed(0)}
                                                        </div>
                                                        <div className="opacity-75">score</div>
                                                    </div>
                                                </div>
                                                <div className="text-xs opacity-75">
                                                    Confidence: {insight.prediction.confidence.toFixed(0)}%
                                                </div>
                                            </div>
                                        )}

                                        {/* Suggested Action */}
                                        {insight.actionable && insight.suggestedAction && (
                                            <div className="mb-3">
                                                <h4 className="text-xs font-semibold uppercase tracking-wide opacity-75 mb-2">
                                                    Recommended Action
                                                </h4>
                                                <div className="bg-white bg-opacity-50 rounded p-3 text-sm">
                                                    💡 {insight.suggestedAction}
                                                </div>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex space-x-2">
                                            {onNavigate && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onNavigate(insight.projectId);
                                                    }}
                                                    className="flex-1 bg-white bg-opacity-80 hover:bg-opacity-100 text-current font-semibold py-2 px-4 rounded transition-all duration-200 text-sm"
                                                >
                                                    View Project →
                                                </button>
                                            )}
                                            {insight.actionable && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        // Handle action
                                                    }}
                                                    className="flex-1 bg-white bg-opacity-80 hover:bg-opacity-100 text-current font-semibold py-2 px-4 rounded transition-all duration-200 text-sm"
                                                >
                                                    Take Action
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer */}
            {insights.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                    <p className="text-xs text-gray-600">
                        Showing {insights.length} insight{insights.length !== 1 ? 's' : ''} • 
                        Updated in real-time with ML predictions
                    </p>
                </div>
            )}
        </div>
    );
};

export default SmartInsightsWidget;

