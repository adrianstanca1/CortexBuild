// components/ai/AIRecommendations.tsx
import React, { useState, useEffect } from 'react';
import {
    Brain,
    Lightbulb,
    TrendingUp,
    Target,
    Clock,
    Users,
    DollarSign,
    AlertTriangle,
    CheckCircle,
    ArrowRight,
    RefreshCw,
    Star,
    Zap
} from 'lucide-react';

export interface AIRecommendation {
    id: string;
    type: 'optimization' | 'risk_mitigation' | 'resource_allocation' | 'timeline_adjustment' | 'cost_saving';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    confidence: number; // 0-100
    effort: 'low' | 'medium' | 'high';
    estimatedSavings?: number;
    estimatedTimeReduction?: number;
    riskReduction?: number;
    category: string;
    tags: string[];
    implementationSteps: string[];
    prerequisites: string[];
    relatedProjects?: string[];
    aiInsights: {
        reasoning: string;
        dataPoints: string[];
        alternatives: string[];
    };
}

export interface ProjectContext {
    id: string;
    name: string;
    status: string;
    budget: number;
    spent: number;
    progress: number;
    teamSize: number;
    timeline: {
        start: string;
        end: string;
        milestones: Array<{
            name: string;
            date: string;
            status: string;
        }>;
    };
    risks: Array<{
        type: string;
        level: 'low' | 'medium' | 'high';
        description: string;
    }>;
    performance: {
        productivity: number;
        quality: number;
        efficiency: number;
    };
}

interface AIRecommendationsProps {
    projectContext: ProjectContext;
    onRecommendationSelect: (recommendation: AIRecommendation) => void;
    onImplementRecommendation: (recommendationId: string) => void;
    className?: string;
}

export const AIRecommendations: React.FC<AIRecommendationsProps> = ({
    projectContext,
    onRecommendationSelect,
    onImplementRecommendation,
    className = ""
}) => {
    const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'impact' | 'confidence' | 'effort'>('impact');

    // Mock AI recommendations - replace with actual AI service
    const mockRecommendations: AIRecommendation[] = [
        {
            id: '1',
            type: 'optimization',
            title: 'Optimize Resource Allocation',
            description: 'Reallocate 2 team members from low-priority tasks to critical path activities to improve project timeline by 15%.',
            impact: 'high',
            confidence: 92,
            effort: 'medium',
            estimatedSavings: 25000,
            estimatedTimeReduction: 15,
            category: 'Resource Management',
            tags: ['resource', 'timeline', 'optimization'],
            implementationSteps: [
                'Analyze current task priorities',
                'Identify low-priority activities',
                'Reassign team members to critical tasks',
                'Monitor progress and adjust as needed'
            ],
            prerequisites: ['Project manager approval', 'Team availability'],
            aiInsights: {
                reasoning: 'Based on project timeline analysis, 23% of team capacity is allocated to non-critical tasks while critical path activities are under-resourced.',
                dataPoints: ['Task priority analysis', 'Resource utilization metrics', 'Timeline variance data'],
                alternatives: ['Hire additional resources', 'Extend project timeline', 'Reduce scope']
            }
        },
        {
            id: '2',
            type: 'risk_mitigation',
            title: 'Implement Safety Protocol Enhancement',
            description: 'Deploy AI-powered safety monitoring system to reduce incident risk by 40% and improve compliance scores.',
            impact: 'high',
            confidence: 88,
            effort: 'low',
            riskReduction: 40,
            category: 'Safety & Compliance',
            tags: ['safety', 'compliance', 'monitoring'],
            implementationSteps: [
                'Install AI monitoring cameras',
                'Configure safety detection algorithms',
                'Train team on new protocols',
                'Monitor and adjust system settings'
            ],
            prerequisites: ['Safety officer approval', 'Budget allocation'],
            aiInsights: {
                reasoning: 'Historical data shows 60% of safety incidents occur in areas with limited monitoring. AI detection can identify risks 3x faster than manual inspection.',
                dataPoints: ['Incident history', 'Monitoring coverage gaps', 'Compliance metrics'],
                alternatives: ['Increase manual inspections', 'Install basic monitoring', 'Implement training programs']
            }
        },
        {
            id: '3',
            type: 'cost_saving',
            title: 'Smart Material Procurement',
            description: 'Use AI-driven demand forecasting to optimize material ordering, reducing waste by 25% and saving $15,000.',
            impact: 'medium',
            confidence: 85,
            effort: 'low',
            estimatedSavings: 15000,
            category: 'Cost Optimization',
            tags: ['procurement', 'materials', 'waste reduction'],
            implementationSteps: [
                'Integrate AI forecasting system',
                'Analyze historical usage patterns',
                'Set up automated ordering rules',
                'Monitor and adjust predictions'
            ],
            prerequisites: ['Procurement system integration', 'Historical data access'],
            aiInsights: {
                reasoning: 'Current material waste is 18% above industry average. AI forecasting can predict demand with 94% accuracy, reducing over-ordering.',
                dataPoints: ['Material usage history', 'Waste metrics', 'Industry benchmarks'],
                alternatives: ['Manual demand planning', 'Fixed ordering schedules', 'Just-in-time delivery']
            }
        },
        {
            id: '4',
            type: 'timeline_adjustment',
            title: 'Dynamic Schedule Optimization',
            description: 'Implement AI-powered schedule optimization to identify and resolve bottlenecks, improving delivery time by 20%.',
            impact: 'high',
            confidence: 90,
            effort: 'medium',
            estimatedTimeReduction: 20,
            category: 'Project Management',
            tags: ['scheduling', 'optimization', 'bottlenecks'],
            implementationSteps: [
                'Deploy AI scheduling system',
                'Input project dependencies',
                'Run optimization algorithms',
                'Implement recommended changes'
            ],
            prerequisites: ['Project data integration', 'Team coordination'],
            aiInsights: {
                reasoning: 'Analysis shows 3 critical bottlenecks causing 20% delay. AI can optimize task sequencing and resource allocation to eliminate these bottlenecks.',
                dataPoints: ['Task dependencies', 'Resource constraints', 'Historical delays'],
                alternatives: ['Manual schedule review', 'Add more resources', 'Extend deadlines']
            }
        },
        {
            id: '5',
            type: 'resource_allocation',
            title: 'Predictive Team Scaling',
            description: 'Use AI to predict optimal team size for upcoming phases, ensuring right-sized teams and avoiding over/under-staffing.',
            impact: 'medium',
            confidence: 82,
            effort: 'low',
            estimatedSavings: 12000,
            category: 'Team Management',
            tags: ['team', 'scaling', 'prediction'],
            implementationSteps: [
                'Analyze workload patterns',
                'Predict upcoming requirements',
                'Optimize team composition',
                'Implement scaling plan'
            ],
            prerequisites: ['Workload data', 'Team availability'],
            aiInsights: {
                reasoning: 'Current team scaling is reactive, leading to 15% efficiency loss. Predictive scaling can maintain optimal productivity levels.',
                dataPoints: ['Workload forecasts', 'Team productivity metrics', 'Historical scaling data'],
                alternatives: ['Fixed team sizes', 'Reactive scaling', 'Over-staffing approach']
            }
        }
    ];

    useEffect(() => {
        const loadRecommendations = async () => {
            setLoading(true);
            // Simulate AI processing time
            await new Promise(resolve => setTimeout(resolve, 1500));
            setRecommendations(mockRecommendations);
            setLoading(false);
        };

        loadRecommendations();
    }, [projectContext]);

    const getTypeIcon = (type: AIRecommendation['type']) => {
        switch (type) {
            case 'optimization': return <TrendingUp className="w-5 h-5 text-blue-600" />;
            case 'risk_mitigation': return <AlertTriangle className="w-5 h-5 text-red-600" />;
            case 'resource_allocation': return <Users className="w-5 h-5 text-green-600" />;
            case 'timeline_adjustment': return <Clock className="w-5 h-5 text-purple-600" />;
            case 'cost_saving': return <DollarSign className="w-5 h-5 text-orange-600" />;
            default: return <Lightbulb className="w-5 h-5 text-gray-600" />;
        }
    };

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case 'high': return 'text-red-600 bg-red-50 border-red-200';
            case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'low': return 'text-green-600 bg-green-50 border-green-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getEffortColor = (effort: string) => {
        switch (effort) {
            case 'high': return 'text-red-600 bg-red-50';
            case 'medium': return 'text-yellow-600 bg-yellow-50';
            case 'low': return 'text-green-600 bg-green-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 90) return 'text-green-600';
        if (confidence >= 80) return 'text-yellow-600';
        return 'text-red-600';
    };

    const filteredRecommendations = recommendations.filter(rec =>
        selectedCategory === 'all' || rec.category === selectedCategory
    );

    const sortedRecommendations = [...filteredRecommendations].sort((a, b) => {
        switch (sortBy) {
            case 'impact':
                const impactOrder = { high: 3, medium: 2, low: 1 };
                return impactOrder[b.impact] - impactOrder[a.impact];
            case 'confidence':
                return b.confidence - a.confidence;
            case 'effort':
                const effortOrder = { low: 3, medium: 2, high: 1 };
                return effortOrder[b.effort] - effortOrder[a.effort];
            default:
                return 0;
        }
    });

    const categories = ['all', ...Array.from(new Set(recommendations.map(r => r.category)))];

    if (loading) {
        return (
            <div className={`ai-recommendations ${className}`}>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">AI is analyzing your project...</p>
                            <p className="text-sm text-gray-500 mt-2">Generating personalized recommendations</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`ai-recommendations ${className}`}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Header */}
                <div className="border-b border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Brain className="w-6 h-6 text-blue-600" />
                            <h2 className="text-xl font-semibold text-gray-900">AI Recommendations</h2>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                {recommendations.length} suggestions
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
                                <RefreshCw className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
                                <Zap className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600">Category:</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                {categories.map(category => (
                                    <option key={category} value={category}>
                                        {category === 'all' ? 'All Categories' : category}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600">Sort by:</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="impact">Impact</option>
                                <option value="confidence">Confidence</option>
                                <option value="effort">Effort</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Recommendations */}
                <div className="p-6">
                    <div className="space-y-4">
                        {sortedRecommendations.map(recommendation => (
                            <div
                                key={recommendation.id}
                                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => onRecommendationSelect(recommendation)}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 mt-1">
                                        {getTypeIcon(recommendation.type)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-3">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                    {recommendation.title}
                                                </h3>
                                                <p className="text-gray-600 mb-2">{recommendation.description}</p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getImpactColor(recommendation.impact)}`}>
                                                    {recommendation.impact} impact
                                                </span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEffortColor(recommendation.effort)}`}>
                                                    {recommendation.effort} effort
                                                </span>
                                                <span className={`text-sm font-medium ${getConfidenceColor(recommendation.confidence)}`}>
                                                    {recommendation.confidence}% confidence
                                                </span>
                                            </div>
                                        </div>

                                        {/* Metrics */}
                                        <div className="grid grid-cols-3 gap-4 mb-4">
                                            {recommendation.estimatedSavings && (
                                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                                    <DollarSign className="w-5 h-5 text-green-600 mx-auto mb-1" />
                                                    <p className="text-sm font-medium text-green-900">
                                                        ${recommendation.estimatedSavings.toLocaleString()}
                                                    </p>
                                                    <p className="text-xs text-green-600">Potential Savings</p>
                                                </div>
                                            )}
                                            {recommendation.estimatedTimeReduction && (
                                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                                    <Clock className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                                                    <p className="text-sm font-medium text-blue-900">
                                                        {recommendation.estimatedTimeReduction}%
                                                    </p>
                                                    <p className="text-xs text-blue-600">Time Reduction</p>
                                                </div>
                                            )}
                                            {recommendation.riskReduction && (
                                                <div className="text-center p-3 bg-red-50 rounded-lg">
                                                    <AlertTriangle className="w-5 h-5 text-red-600 mx-auto mb-1" />
                                                    <p className="text-sm font-medium text-red-900">
                                                        {recommendation.riskReduction}%
                                                    </p>
                                                    <p className="text-xs text-red-600">Risk Reduction</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* AI Insights */}
                                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                            <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                                                <Brain className="w-4 h-4 text-blue-600" />
                                                AI Reasoning
                                            </h4>
                                            <p className="text-sm text-gray-700 mb-2">{recommendation.aiInsights.reasoning}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {recommendation.aiInsights.dataPoints.map((point, index) => (
                                                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                                        {point}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {recommendation.tags.map(tag => (
                                                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-500">Category: {recommendation.category}</span>
                                                <span className="text-sm text-gray-500">•</span>
                                                <span className="text-sm text-gray-500">{recommendation.prerequisites.length} prerequisites</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onRecommendationSelect(recommendation);
                                                    }}
                                                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                                                >
                                                    View Details
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onImplementRecommendation(recommendation.id);
                                                    }}
                                                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    Implement
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {sortedRecommendations.length === 0 && (
                        <div className="text-center py-12">
                            <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations found</h3>
                            <p className="text-gray-600">Try adjusting your filters or check back later for new suggestions.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
