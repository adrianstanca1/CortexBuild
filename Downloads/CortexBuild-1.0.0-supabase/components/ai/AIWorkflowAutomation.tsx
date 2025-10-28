// components/ai/AIWorkflowAutomation.tsx
import React, { useState, useEffect } from 'react';
import {
    Zap,
    Play,
    Pause,
    Settings,
    Plus,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    Clock,
    CheckCircle,
    AlertTriangle,
    Activity,
    Target,
    Brain,
    Workflow,
    ArrowRight,
    Filter,
    Calendar,
    User,
    Bell
} from 'lucide-react';

export interface WorkflowTrigger {
    id: string;
    name: string;
    type: 'event' | 'schedule' | 'condition' | 'ai_prediction';
    description: string;
    conditions: {
        field: string;
        operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'exists';
        value: any;
    }[];
    isActive: boolean;
    lastTriggered?: string;
    triggerCount: number;
}

export interface WorkflowAction {
    id: string;
    name: string;
    type: 'notification' | 'task_creation' | 'status_update' | 'email' | 'ai_analysis' | 'data_export';
    description: string;
    parameters: Record<string, any>;
    isActive: boolean;
    executionCount: number;
    successRate: number;
}

export interface AIWorkflow {
    id: string;
    name: string;
    description: string;
    category: 'project_management' | 'safety' | 'quality' | 'communication' | 'reporting' | 'ai_insights';
    triggers: WorkflowTrigger[];
    actions: WorkflowAction[];
    isActive: boolean;
    isAIEnhanced: boolean;
    aiInsights: {
        optimizationSuggestions: string[];
        performanceMetrics: {
            efficiency: number;
            accuracy: number;
            timeSaved: number;
        };
        predictedOutcomes: string[];
    };
    createdAt: string;
    lastModified: string;
    executionHistory: Array<{
        id: string;
        timestamp: string;
        status: 'success' | 'failed' | 'partial';
        details: string;
        duration: number;
    }>;
}

interface AIWorkflowAutomationProps {
    projectId?: string;
    onWorkflowSelect: (workflow: AIWorkflow) => void;
    onWorkflowExecute: (workflowId: string) => void;
    className?: string;
}

export const AIWorkflowAutomation: React.FC<AIWorkflowAutomationProps> = ({
    projectId,
    onWorkflowSelect,
    onWorkflowExecute,
    className = ""
}) => {
    const [workflows, setWorkflows] = useState<AIWorkflow[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [showInactive, setShowInactive] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Mock AI workflows - replace with actual AI service
    const mockWorkflows: AIWorkflow[] = [
        {
            id: '1',
            name: 'Smart Safety Incident Response',
            description: 'Automatically creates incident reports, notifies safety team, and schedules follow-up actions when safety incidents are detected.',
            category: 'safety',
            triggers: [
                {
                    id: 't1',
                    name: 'Safety Incident Detected',
                    type: 'event',
                    description: 'Triggers when a safety incident is reported',
                    conditions: [
                        { field: 'incident_type', operator: 'exists', value: null },
                        { field: 'severity', operator: 'greater_than', value: 'low' }
                    ],
                    isActive: true,
                    triggerCount: 12,
                    lastTriggered: '2024-01-20T10:30:00Z'
                }
            ],
            actions: [
                {
                    id: 'a1',
                    name: 'Create Incident Report',
                    type: 'task_creation',
                    description: 'Automatically generates incident report task',
                    parameters: { taskType: 'incident_report', priority: 'high' },
                    isActive: true,
                    executionCount: 12,
                    successRate: 100
                },
                {
                    id: 'a2',
                    name: 'Notify Safety Team',
                    type: 'notification',
                    description: 'Sends immediate notification to safety officers',
                    parameters: { recipients: ['safety_team'], urgency: 'high' },
                    isActive: true,
                    executionCount: 12,
                    successRate: 100
                }
            ],
            isActive: true,
            isAIEnhanced: true,
            aiInsights: {
                optimizationSuggestions: [
                    'Consider adding severity-based routing to different safety teams',
                    'Implement predictive analysis for high-risk areas'
                ],
                performanceMetrics: {
                    efficiency: 95,
                    accuracy: 98,
                    timeSaved: 45 // minutes per incident
                },
                predictedOutcomes: [
                    'Reduced incident response time by 60%',
                    'Improved safety compliance scores',
                    'Enhanced team coordination'
                ]
            },
            createdAt: '2024-01-15T09:00:00Z',
            lastModified: '2024-01-18T14:30:00Z',
            executionHistory: [
                {
                    id: 'h1',
                    timestamp: '2024-01-20T10:30:00Z',
                    status: 'success',
                    details: 'Incident report created and team notified',
                    duration: 120
                }
            ]
        },
        {
            id: '2',
            name: 'AI-Powered Project Health Monitoring',
            description: 'Continuously monitors project metrics and automatically generates insights and recommendations using AI analysis.',
            category: 'ai_insights',
            triggers: [
                {
                    id: 't2',
                    name: 'Daily Health Check',
                    type: 'schedule',
                    description: 'Runs every day at 9 AM',
                    conditions: [
                        { field: 'time', operator: 'equals', value: '09:00' }
                    ],
                    isActive: true,
                    triggerCount: 15,
                    lastTriggered: '2024-01-20T09:00:00Z'
                },
                {
                    id: 't3',
                    name: 'Risk Threshold Exceeded',
                    type: 'condition',
                    description: 'Triggers when project risk score exceeds threshold',
                    conditions: [
                        { field: 'risk_score', operator: 'greater_than', value: 75 }
                    ],
                    isActive: true,
                    triggerCount: 3,
                    lastTriggered: '2024-01-19T16:45:00Z'
                }
            ],
            actions: [
                {
                    id: 'a3',
                    name: 'Generate Health Report',
                    type: 'ai_analysis',
                    description: 'AI analyzes project data and generates insights',
                    parameters: { analysisType: 'comprehensive', includeRecommendations: true },
                    isActive: true,
                    executionCount: 18,
                    successRate: 94
                },
                {
                    id: 'a4',
                    name: 'Send Alert to PM',
                    type: 'notification',
                    description: 'Notifies project manager of critical issues',
                    parameters: { recipients: ['project_manager'], urgency: 'medium' },
                    isActive: true,
                    executionCount: 3,
                    successRate: 100
                }
            ],
            isActive: true,
            isAIEnhanced: true,
            aiInsights: {
                optimizationSuggestions: [
                    'Add more granular risk indicators',
                    'Implement predictive timeline analysis'
                ],
                performanceMetrics: {
                    efficiency: 88,
                    accuracy: 92,
                    timeSaved: 120 // minutes per day
                },
                predictedOutcomes: [
                    'Proactive risk identification',
                    'Improved project success rates',
                    'Reduced manual monitoring effort'
                ]
            },
            createdAt: '2024-01-10T08:00:00Z',
            lastModified: '2024-01-19T11:20:00Z',
            executionHistory: [
                {
                    id: 'h2',
                    timestamp: '2024-01-20T09:00:00Z',
                    status: 'success',
                    details: 'Health report generated successfully',
                    duration: 45
                }
            ]
        },
        {
            id: '3',
            name: 'Automated Quality Control',
            description: 'Monitors quality metrics and automatically creates corrective action tasks when quality standards are not met.',
            category: 'quality',
            triggers: [
                {
                    id: 't4',
                    name: 'Quality Check Failed',
                    type: 'event',
                    description: 'Triggers when quality inspection fails',
                    conditions: [
                        { field: 'quality_score', operator: 'less_than', value: 85 }
                    ],
                    isActive: true,
                    triggerCount: 7,
                    lastTriggered: '2024-01-19T14:20:00Z'
                }
            ],
            actions: [
                {
                    id: 'a5',
                    name: 'Create Corrective Action',
                    type: 'task_creation',
                    description: 'Creates corrective action task',
                    parameters: { taskType: 'corrective_action', priority: 'medium' },
                    isActive: true,
                    executionCount: 7,
                    successRate: 100
                },
                {
                    id: 'a6',
                    name: 'Notify Quality Team',
                    type: 'email',
                    description: 'Sends email to quality assurance team',
                    parameters: { template: 'quality_alert', recipients: ['qa_team'] },
                    isActive: true,
                    executionCount: 7,
                    successRate: 100
                }
            ],
            isActive: true,
            isAIEnhanced: false,
            aiInsights: {
                optimizationSuggestions: [
                    'Add AI-powered root cause analysis',
                    'Implement predictive quality modeling'
                ],
                performanceMetrics: {
                    efficiency: 78,
                    accuracy: 85,
                    timeSaved: 30
                },
                predictedOutcomes: [
                    'Faster quality issue resolution',
                    'Improved quality standards',
                    'Reduced rework costs'
                ]
            },
            createdAt: '2024-01-12T10:30:00Z',
            lastModified: '2024-01-17T09:15:00Z',
            executionHistory: [
                {
                    id: 'h3',
                    timestamp: '2024-01-19T14:20:00Z',
                    status: 'success',
                    details: 'Corrective action created and team notified',
                    duration: 90
                }
            ]
        }
    ];

    useEffect(() => {
        const loadWorkflows = async () => {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 1000));
            setWorkflows(mockWorkflows);
            setLoading(false);
        };

        loadWorkflows();
    }, [projectId]);

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'project_management': return <Target className="w-5 h-5 text-blue-600" />;
            case 'safety': return <AlertTriangle className="w-5 h-5 text-red-600" />;
            case 'quality': return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'communication': return <Bell className="w-5 h-5 text-purple-600" />;
            case 'reporting': return <Activity className="w-5 h-5 text-orange-600" />;
            case 'ai_insights': return <Brain className="w-5 h-5 text-indigo-600" />;
            default: return <Workflow className="w-5 h-5 text-gray-600" />;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'project_management': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'safety': return 'bg-red-50 text-red-700 border-red-200';
            case 'quality': return 'bg-green-50 text-green-700 border-green-200';
            case 'communication': return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'reporting': return 'bg-orange-50 text-orange-700 border-orange-200';
            case 'ai_insights': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success': return 'text-green-600 bg-green-50';
            case 'failed': return 'text-red-600 bg-red-50';
            case 'partial': return 'text-yellow-600 bg-yellow-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const filteredWorkflows = workflows.filter(workflow => {
        const categoryMatch = selectedCategory === 'all' || workflow.category === selectedCategory;
        const activeMatch = showInactive || workflow.isActive;
        return categoryMatch && activeMatch;
    });

    const categories = ['all', ...Array.from(new Set(workflows.map(w => w.category)))];

    if (loading) {
        return (
            <div className={`ai-workflow-automation ${className}`}>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading AI workflows...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`ai-workflow-automation ${className}`}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Header */}
                <div className="border-b border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Zap className="w-6 h-6 text-blue-600" />
                            <h2 className="text-xl font-semibold text-gray-900">AI Workflow Automation</h2>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                {workflows.filter(w => w.isActive).length} active
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Create Workflow
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
                                        {category === 'all' ? 'All Categories' : category.replace('_', ' ')}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="flex items-center gap-2 text-sm text-gray-600">
                                <input
                                    type="checkbox"
                                    checked={showInactive}
                                    onChange={(e) => setShowInactive(e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                Show inactive
                            </label>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                            >
                                {viewMode === 'grid' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Workflows */}
                <div className="p-6">
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredWorkflows.map(workflow => (
                                <div
                                    key={workflow.id}
                                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => onWorkflowSelect(workflow)}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            {getCategoryIcon(workflow.category)}
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(workflow.category)}`}>
                                                {workflow.category.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {workflow.isAIEnhanced && (
                                                <Brain className="w-4 h-4 text-indigo-600" title="AI Enhanced" />
                                            )}
                                            <div className={`w-3 h-3 rounded-full ${workflow.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{workflow.name}</h3>
                                    <p className="text-gray-600 text-sm mb-4">{workflow.description}</p>

                                    {/* Metrics */}
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="text-center p-2 bg-gray-50 rounded">
                                            <p className="text-sm font-medium text-gray-900">{workflow.triggers.length}</p>
                                            <p className="text-xs text-gray-500">Triggers</p>
                                        </div>
                                        <div className="text-center p-2 bg-gray-50 rounded">
                                            <p className="text-sm font-medium text-gray-900">{workflow.actions.length}</p>
                                            <p className="text-xs text-gray-500">Actions</p>
                                        </div>
                                    </div>

                                    {/* AI Insights */}
                                    {workflow.isAIEnhanced && (
                                        <div className="bg-indigo-50 rounded-lg p-3 mb-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Brain className="w-4 h-4 text-indigo-600" />
                                                <span className="text-sm font-medium text-indigo-900">AI Performance</span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 text-xs">
                                                <div className="text-center">
                                                    <p className="font-medium text-indigo-900">{workflow.aiInsights.performanceMetrics.efficiency}%</p>
                                                    <p className="text-indigo-600">Efficiency</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="font-medium text-indigo-900">{workflow.aiInsights.performanceMetrics.accuracy}%</p>
                                                    <p className="text-indigo-600">Accuracy</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="font-medium text-indigo-900">{workflow.aiInsights.performanceMetrics.timeSaved}m</p>
                                                    <p className="text-indigo-600">Time Saved</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Clock className="w-4 h-4" />
                                            <span>Last run: {new Date(workflow.executionHistory[0]?.timestamp || workflow.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onWorkflowExecute(workflow.id);
                                                }}
                                                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors flex items-center gap-1"
                                            >
                                                <Play className="w-3 h-3" />
                                                Run
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredWorkflows.map(workflow => (
                                <div
                                    key={workflow.id}
                                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => onWorkflowSelect(workflow)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                {getCategoryIcon(workflow.category)}
                                                <h3 className="text-lg font-semibold text-gray-900">{workflow.name}</h3>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(workflow.category)}`}>
                                                    {workflow.category.replace('_', ' ')}
                                                </span>
                                                {workflow.isAIEnhanced && (
                                                    <Brain className="w-4 h-4 text-indigo-600" title="AI Enhanced" />
                                                )}
                                                <div className={`w-3 h-3 rounded-full ${workflow.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                            </div>
                                            <p className="text-gray-600 mb-3">{workflow.description}</p>

                                            <div className="flex items-center gap-6 text-sm text-gray-500">
                                                <span>{workflow.triggers.length} triggers</span>
                                                <span>{workflow.actions.length} actions</span>
                                                <span>Last run: {new Date(workflow.executionHistory[0]?.timestamp || workflow.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onWorkflowExecute(workflow.id);
                                                }}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                                            >
                                                <Play className="w-4 h-4" />
                                                Run Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {filteredWorkflows.length === 0 && (
                        <div className="text-center py-12">
                            <Workflow className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows found</h3>
                            <p className="text-gray-600">Create your first AI-powered workflow to automate your processes.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
