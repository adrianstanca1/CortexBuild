/**
 * Cognitive Insights Dashboard
 * Displays AI-generated insights, patterns, and strategic actions
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

export const CognitiveInsights: React.FC<{ projectId?: string }> = ({ projectId }) => {
    const [selectedPattern, setSelectedPattern] = useState<any>(null);

    const { data: insightsData, isLoading } = useQuery({
        queryKey: ['cognitive', 'insights', projectId],
        queryFn: () => apiClient.getCognitiveInsights(projectId || 'all'),
        refetchInterval: 30000, // Refresh every 30 seconds
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    const insights = insightsData?.data || {
        activePatterns: [],
        activeHypotheses: [],
        riskSummary: { systemic: 0, critical: 0, high: 0, medium: 0, low: 0 },
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-4xl">🧠</span>
                    <h2 className="text-2xl font-bold">Cognitive Intelligence</h2>
                </div>
                <p className="text-white/90">
                    AI-powered pattern detection, root cause analysis, and strategic recommendations
                </p>
            </div>

            {/* Risk Summary */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <RiskCard level="systemic" count={insights.riskSummary.systemic} />
                <RiskCard level="critical" count={insights.riskSummary.critical} />
                <RiskCard level="high" count={insights.riskSummary.high} />
                <RiskCard level="medium" count={insights.riskSummary.medium} />
                <RiskCard level="low" count={insights.riskSummary.low} />
            </div>

            {/* Active Patterns */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                    🔍 Detected Patterns ({insights.activePatterns.length})
                </h3>

                {insights.activePatterns.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p className="text-lg">✅ No concerning patterns detected</p>
                        <p className="text-sm mt-2">All systems operating normally</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {insights.activePatterns.map((pattern: any) => (
                            <PatternCard
                                key={pattern.id}
                                pattern={pattern}
                                onClick={() => setSelectedPattern(pattern)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Active Hypotheses */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                    💡 Root Cause Analysis ({insights.activeHypotheses.length})
                </h3>

                {insights.activeHypotheses.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p className="text-lg">No active investigations</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {insights.activeHypotheses.map((hypothesis: any) => (
                            <HypothesisCard key={hypothesis.id} hypothesis={hypothesis} />
                        ))}
                    </div>
                )}
            </div>

            {/* Pattern Detail Modal */}
            {selectedPattern && (
                <PatternDetailModal
                    pattern={selectedPattern}
                    onClose={() => setSelectedPattern(null)}
                />
            )}
        </div>
    );
};

const RiskCard: React.FC<{ level: string; count: number }> = ({ level, count }) => {
    const config = {
        systemic: { color: 'bg-red-600', icon: '🚨', label: 'Systemic' },
        critical: { color: 'bg-orange-600', icon: '⚠️', label: 'Critical' },
        high: { color: 'bg-yellow-600', icon: '⚡', label: 'High' },
        medium: { color: 'bg-blue-600', icon: '📊', label: 'Medium' },
        low: { color: 'bg-green-600', icon: '✅', label: 'Low' },
    }[level] || { color: 'bg-gray-600', icon: '❓', label: level };

    return (
        <div className={`${config.color} rounded-lg p-4 text-white`}>
            <div className="text-2xl mb-2">{config.icon}</div>
            <div className="text-3xl font-bold mb-1">{count}</div>
            <div className="text-sm opacity-90">{config.label}</div>
        </div>
    );
};

const PatternCard: React.FC<{ pattern: any; onClick: () => void }> = ({ pattern, onClick }) => {
    const riskColors = {
        systemic: 'border-red-500 bg-red-50',
        critical: 'border-orange-500 bg-orange-50',
        high: 'border-yellow-500 bg-yellow-50',
        medium: 'border-blue-500 bg-blue-50',
        low: 'border-green-500 bg-green-50',
    };

    return (
        <div
            className={`border-l-4 ${riskColors[pattern.riskLevel as keyof typeof riskColors]} p-4 rounded-r-lg cursor-pointer hover:shadow-md transition-shadow`}
            onClick={onClick}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-semibold text-gray-900">
                            {pattern.patternType.replace(/_/g, ' ').toUpperCase()}
                        </span>
                        <span className="px-2 py-1 bg-white rounded text-xs font-medium">
                            {pattern.frequency} occurrences
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                        Confidence: {Math.round(pattern.confidence * 100)}%
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {pattern.affectedEntities.map((entity: any, i: number) => (
                            <span
                                key={i}
                                className="px-2 py-1 bg-white rounded-full text-xs text-gray-700"
                            >
                                {entity.name}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">Risk Level</div>
                    <div className="text-lg font-bold text-gray-900">
                        {pattern.riskLevel.toUpperCase()}
                    </div>
                </div>
            </div>
        </div>
    );
};

const HypothesisCard: React.FC<{ hypothesis: any }> = ({ hypothesis }) => {
    return (
        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
                <div className="text-3xl">💡</div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900">Root Cause Hypothesis</span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                            {Math.round(hypothesis.confidence * 100)}% confidence
                        </span>
                    </div>
                    <p className="text-gray-700 mb-3">{hypothesis.hypothesis}</p>
                    <div className="space-y-2">
                        <div>
                            <span className="text-sm font-medium text-gray-600">Impact Areas:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {hypothesis.impactAreas.map((area: string, i: number) => (
                                    <span
                                        key={i}
                                        className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700"
                                    >
                                        {area}
                                    </span>
                                ))}
                            </div>
                        </div>
                        {hypothesis.financialImpact && (
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">Financial Impact:</span>{' '}
                                {hypothesis.financialImpact.currency}{' '}
                                {hypothesis.financialImpact.min.toLocaleString()} -{' '}
                                {hypothesis.financialImpact.max.toLocaleString()}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const PatternDetailModal: React.FC<{ pattern: any; onClose: () => void }> = ({
    pattern,
    onClose,
}) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <h3 className="text-2xl font-bold text-gray-900">Pattern Details</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-2xl"
                        >
                            ×
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <span className="text-sm font-medium text-gray-600">Pattern Type:</span>
                            <p className="text-lg font-semibold text-gray-900">
                                {pattern.patternType.replace(/_/g, ' ').toUpperCase()}
                            </p>
                        </div>

                        <div>
                            <span className="text-sm font-medium text-gray-600">Frequency:</span>
                            <p className="text-lg text-gray-900">{pattern.frequency} occurrences</p>
                        </div>

                        <div>
                            <span className="text-sm font-medium text-gray-600">Confidence:</span>
                            <p className="text-lg text-gray-900">
                                {Math.round(pattern.confidence * 100)}%
                            </p>
                        </div>

                        <div>
                            <span className="text-sm font-medium text-gray-600">Risk Level:</span>
                            <p className="text-lg font-bold text-red-600">
                                {pattern.riskLevel.toUpperCase()}
                            </p>
                        </div>

                        <div>
                            <span className="text-sm font-medium text-gray-600">
                                Affected Entities:
                            </span>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {pattern.affectedEntities.map((entity: any, i: number) => (
                                    <span
                                        key={i}
                                        className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                                    >
                                        {entity.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

