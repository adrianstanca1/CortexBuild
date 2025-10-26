// components/ai/SmartTaskAssignment.tsx
import React, { useState, useEffect } from 'react';
import {
    Users,
    Target,
    Brain,
    Clock,
    TrendingUp,
    CheckCircle,
    AlertTriangle,
    Star,
    Zap,
    Filter,
    Search,
    ArrowRight,
    RefreshCw,
    Settings,
    BarChart3,
    User,
    Calendar,
    MapPin,
    Award
} from 'lucide-react';

export interface TeamMember {
    id: string;
    name: string;
    role: string;
    skills: string[];
    experience: number; // years
    currentWorkload: number; // 0-100%
    availability: 'available' | 'busy' | 'unavailable';
    performanceScore: number; // 0-100
    location: string;
    preferences: {
        taskTypes: string[];
        workingHours: string;
        maxWorkload: number;
    };
    aiProfile: {
        strengths: string[];
        learningAreas: string[];
        collaborationStyle: 'independent' | 'collaborative' | 'mixed';
        workPace: 'fast' | 'moderate' | 'thorough';
    };
}

export interface Task {
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    complexity: 'simple' | 'moderate' | 'complex' | 'expert';
    estimatedHours: number;
    requiredSkills: string[];
    deadline: string;
    location?: string;
    dependencies: string[];
    category: string;
    aiAnalysis: {
        difficultyScore: number; // 0-100
        timeEstimate: number; // hours
        skillRequirements: string[];
        riskFactors: string[];
        optimalTeamSize: number;
    };
}

export interface AIAssignment {
    id: string;
    taskId: string;
    assigneeId: string;
    confidence: number; // 0-100
    reasoning: string;
    alternatives: Array<{
        assigneeId: string;
        confidence: number;
        reasoning: string;
    }>;
    predictedOutcome: {
        completionTime: number;
        qualityScore: number;
        satisfactionScore: number;
    };
    aiInsights: {
        skillMatch: number;
        workloadBalance: number;
        learningOpportunity: boolean;
        riskMitigation: string[];
    };
}

interface SmartTaskAssignmentProps {
    tasks: Task[];
    teamMembers: TeamMember[];
    onAssignmentConfirm: (assignment: AIAssignment) => void;
    onAssignmentReject: (assignmentId: string) => void;
    className?: string;
}

export const SmartTaskAssignment: React.FC<SmartTaskAssignmentProps> = ({
    tasks,
    teamMembers,
    onAssignmentConfirm,
    onAssignmentReject,
    className = ""
}) => {
    const [assignments, setAssignments] = useState<AIAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [filterSkill, setFilterSkill] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'confidence' | 'workload' | 'performance'>('confidence');

    // Mock AI assignments - replace with actual AI service
    const mockAssignments: AIAssignment[] = [
        {
            id: '1',
            taskId: 't1',
            assigneeId: 'u1',
            confidence: 94,
            reasoning: 'John has 8 years of experience in structural engineering and is currently 60% utilized. His expertise in concrete analysis matches perfectly with this foundation inspection task.',
            alternatives: [
                {
                    assigneeId: 'u2',
                    confidence: 87,
                    reasoning: 'Sarah is highly skilled but currently at 85% capacity. She could handle this task but might be stretched thin.'
                },
                {
                    assigneeId: 'u3',
                    confidence: 78,
                    reasoning: 'Mike has the required skills but less experience with this specific type of inspection.'
                }
            ],
            predictedOutcome: {
                completionTime: 6,
                qualityScore: 95,
                satisfactionScore: 88
            },
            aiInsights: {
                skillMatch: 98,
                workloadBalance: 85,
                learningOpportunity: false,
                riskMitigation: ['High confidence due to experience match', 'Optimal workload distribution']
            }
        },
        {
            id: '2',
            taskId: 't2',
            assigneeId: 'u2',
            confidence: 89,
            reasoning: 'Sarah excels at safety protocols and has completed similar safety training tasks with high success rates. Her collaborative style is perfect for team coordination.',
            alternatives: [
                {
                    assigneeId: 'u4',
                    confidence: 82,
                    reasoning: 'David has safety experience but is currently unavailable due to other commitments.'
                }
            ],
            predictedOutcome: {
                completionTime: 4,
                qualityScore: 92,
                satisfactionScore: 91
            },
            aiInsights: {
                skillMatch: 95,
                workloadBalance: 75,
                learningOpportunity: true,
                riskMitigation: ['Strong track record in safety tasks', 'Good team collaboration skills']
            }
        },
        {
            id: '3',
            taskId: 't3',
            assigneeId: 'u3',
            confidence: 76,
            reasoning: 'Mike has the technical skills for material procurement but limited experience with AI systems. This assignment provides a learning opportunity while leveraging his procurement expertise.',
            alternatives: [
                {
                    assigneeId: 'u1',
                    confidence: 68,
                    reasoning: 'John could handle this but it would stretch his current workload and doesn\'t align with his core strengths.'
                }
            ],
            predictedOutcome: {
                completionTime: 8,
                qualityScore: 85,
                satisfactionScore: 82
            },
            aiInsights: {
                skillMatch: 80,
                workloadBalance: 90,
                learningOpportunity: true,
                riskMitigation: ['Pair with experienced team member', 'Provide additional training resources']
            }
        }
    ];

    useEffect(() => {
        const loadAssignments = async () => {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 1200));
            setAssignments(mockAssignments);
            setLoading(false);
        };

        loadAssignments();
    }, [tasks, teamMembers]);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
            case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'low': return 'text-green-600 bg-green-50 border-green-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getComplexityColor = (complexity: string) => {
        switch (complexity) {
            case 'expert': return 'text-purple-600 bg-purple-50';
            case 'complex': return 'text-red-600 bg-red-50';
            case 'moderate': return 'text-yellow-600 bg-yellow-50';
            case 'simple': return 'text-green-600 bg-green-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 90) return 'text-green-600';
        if (confidence >= 80) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getAvailabilityColor = (availability: string) => {
        switch (availability) {
            case 'available': return 'text-green-600 bg-green-50';
            case 'busy': return 'text-yellow-600 bg-yellow-50';
            case 'unavailable': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getWorkloadColor = (workload: number) => {
        if (workload >= 90) return 'text-red-600';
        if (workload >= 70) return 'text-yellow-600';
        return 'text-green-600';
    };

    const getTaskById = (taskId: string) => tasks.find(t => t.id === taskId);
    const getMemberById = (memberId: string) => teamMembers.find(m => m.id === memberId);

    const filteredAssignments = assignments.filter(assignment => {
        const task = getTaskById(assignment.taskId);
        const member = getMemberById(assignment.assigneeId);

        if (!task || !member) return false;

        if (filterSkill !== 'all') {
            return member.skills.includes(filterSkill) || task.requiredSkills.includes(filterSkill);
        }

        return true;
    });

    const sortedAssignments = [...filteredAssignments].sort((a, b) => {
        switch (sortBy) {
            case 'confidence':
                return b.confidence - a.confidence;
            case 'workload':
                const aMember = getMemberById(a.assigneeId);
                const bMember = getMemberById(b.assigneeId);
                return (aMember?.currentWorkload || 0) - (bMember?.currentWorkload || 0);
            case 'performance':
                const aPerf = getMemberById(a.assigneeId);
                const bPerf = getMemberById(b.assigneeId);
                return (bPerf?.performanceScore || 0) - (aPerf?.performanceScore || 0);
            default:
                return 0;
        }
    });

    const skills = Array.from(new Set([
        ...teamMembers.flatMap(m => m.skills),
        ...tasks.flatMap(t => t.requiredSkills)
    ]));

    if (loading) {
        return (
            <div className={`smart-task-assignment ${className}`}>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">AI is analyzing tasks and team members...</p>
                            <p className="text-sm text-gray-500 mt-2">Generating optimal assignments</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`smart-task-assignment ${className}`}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Header */}
                <div className="border-b border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Brain className="w-6 h-6 text-blue-600" />
                            <h2 className="text-xl font-semibold text-gray-900">Smart Task Assignment</h2>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                {assignments.length} assignments
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
                                <RefreshCw className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600">Skill:</label>
                            <select
                                value={filterSkill}
                                onChange={(e) => setFilterSkill(e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="all">All Skills</option>
                                {skills.map(skill => (
                                    <option key={skill} value={skill}>{skill}</option>
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
                                <option value="confidence">Confidence</option>
                                <option value="workload">Workload</option>
                                <option value="performance">Performance</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Assignments */}
                <div className="p-6">
                    <div className="space-y-6">
                        {sortedAssignments.map(assignment => {
                            const task = getTaskById(assignment.taskId);
                            const member = getMemberById(assignment.assigneeId);

                            if (!task || !member) return null;

                            return (
                                <div
                                    key={assignment.id}
                                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start gap-6">
                                        {/* Task Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-3">
                                                <Target className="w-5 h-5 text-blue-600" />
                                                <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                                                    {task.priority}
                                                </span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getComplexityColor(task.complexity)}`}>
                                                    {task.complexity}
                                                </span>
                                            </div>

                                            <p className="text-gray-600 mb-4">{task.description}</p>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                <div className="text-center p-2 bg-gray-50 rounded">
                                                    <Clock className="w-4 h-4 text-gray-600 mx-auto mb-1" />
                                                    <p className="text-sm font-medium text-gray-900">{task.estimatedHours}h</p>
                                                    <p className="text-xs text-gray-500">Estimated</p>
                                                </div>
                                                <div className="text-center p-2 bg-gray-50 rounded">
                                                    <Calendar className="w-4 h-4 text-gray-600 mx-auto mb-1" />
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {new Date(task.deadline).toLocaleDateString()}
                                                    </p>
                                                    <p className="text-xs text-gray-500">Deadline</p>
                                                </div>
                                                <div className="text-center p-2 bg-gray-50 rounded">
                                                    <MapPin className="w-4 h-4 text-gray-600 mx-auto mb-1" />
                                                    <p className="text-sm font-medium text-gray-900">{task.location || 'Remote'}</p>
                                                    <p className="text-xs text-gray-500">Location</p>
                                                </div>
                                                <div className="text-center p-2 bg-gray-50 rounded">
                                                    <Award className="w-4 h-4 text-gray-600 mx-auto mb-1" />
                                                    <p className="text-sm font-medium text-gray-900">{task.aiAnalysis.difficultyScore}</p>
                                                    <p className="text-xs text-gray-500">Difficulty</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {task.requiredSkills.map(skill => (
                                                    <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Assignment Arrow */}
                                        <div className="flex-shrink-0 flex items-center">
                                            <ArrowRight className="w-6 h-6 text-gray-400" />
                                        </div>

                                        {/* Member Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-3">
                                                <User className="w-5 h-5 text-green-600" />
                                                <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                                                <span className="text-sm text-gray-600">{member.role}</span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(member.availability)}`}>
                                                    {member.availability}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div className="text-center p-2 bg-gray-50 rounded">
                                                    <TrendingUp className="w-4 h-4 text-gray-600 mx-auto mb-1" />
                                                    <p className="text-sm font-medium text-gray-900">{member.performanceScore}%</p>
                                                    <p className="text-xs text-gray-500">Performance</p>
                                                </div>
                                                <div className="text-center p-2 bg-gray-50 rounded">
                                                    <BarChart3 className="w-4 h-4 text-gray-600 mx-auto mb-1" />
                                                    <p className={`text-sm font-medium ${getWorkloadColor(member.currentWorkload)}`}>
                                                        {member.currentWorkload}%
                                                    </p>
                                                    <p className="text-xs text-gray-500">Workload</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {member.skills.slice(0, 5).map(skill => (
                                                    <span key={skill} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                                                        {skill}
                                                    </span>
                                                ))}
                                                {member.skills.length > 5 && (
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                                        +{member.skills.length - 5} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* AI Analysis */}
                                        <div className="flex-shrink-0 w-80">
                                            <div className="bg-blue-50 rounded-lg p-4">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Brain className="w-5 h-5 text-blue-600" />
                                                    <span className="text-sm font-medium text-blue-900">AI Analysis</span>
                                                    <span className={`text-sm font-medium ${getConfidenceColor(assignment.confidence)}`}>
                                                        {assignment.confidence}% confidence
                                                    </span>
                                                </div>

                                                <p className="text-sm text-blue-800 mb-3">{assignment.reasoning}</p>

                                                <div className="space-y-2 mb-4">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-blue-700">Skill Match</span>
                                                        <span className="text-blue-900">{assignment.aiInsights.skillMatch}%</span>
                                                    </div>
                                                    <div className="w-full bg-blue-200 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-600 h-2 rounded-full"
                                                            style={{ width: `${assignment.aiInsights.skillMatch}%` }}
                                                        ></div>
                                                    </div>
                                                </div>

                                                <div className="space-y-2 mb-4">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-blue-700">Workload Balance</span>
                                                        <span className="text-blue-900">{assignment.aiInsights.workloadBalance}%</span>
                                                    </div>
                                                    <div className="w-full bg-blue-200 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-600 h-2 rounded-full"
                                                            style={{ width: `${assignment.aiInsights.workloadBalance}%` }}
                                                        ></div>
                                                    </div>
                                                </div>

                                                {assignment.aiInsights.learningOpportunity && (
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Star className="w-4 h-4 text-yellow-600" />
                                                        <span className="text-xs text-yellow-800">Learning Opportunity</span>
                                                    </div>
                                                )}

                                                <div className="space-y-1 mb-4">
                                                    {assignment.aiInsights.riskMitigation.map((risk, index) => (
                                                        <div key={index} className="flex items-center gap-2">
                                                            <CheckCircle className="w-3 h-3 text-green-600" />
                                                            <span className="text-xs text-green-800">{risk}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Predicted Outcome */}
                                                <div className="border-t border-blue-200 pt-3">
                                                    <h4 className="text-xs font-medium text-blue-900 mb-2">Predicted Outcome</h4>
                                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                                        <div className="text-center">
                                                            <p className="font-medium text-blue-900">{assignment.predictedOutcome.completionTime}h</p>
                                                            <p className="text-blue-600">Time</p>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="font-medium text-blue-900">{assignment.predictedOutcome.qualityScore}%</p>
                                                            <p className="text-blue-600">Quality</p>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="font-medium text-blue-900">{assignment.predictedOutcome.satisfactionScore}%</p>
                                                            <p className="text-blue-600">Satisfaction</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2 mt-4">
                                                <button
                                                    onClick={() => onAssignmentConfirm(assignment)}
                                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => onAssignmentReject(assignment.id)}
                                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <AlertTriangle className="w-4 h-4" />
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Alternatives */}
                                    {assignment.alternatives.length > 0 && (
                                        <div className="mt-6 border-t border-gray-200 pt-4">
                                            <h4 className="text-sm font-medium text-gray-900 mb-3">Alternative Assignments</h4>
                                            <div className="space-y-2">
                                                {assignment.alternatives.map((alt, index) => {
                                                    const altMember = getMemberById(alt.assigneeId);
                                                    if (!altMember) return null;

                                                    return (
                                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                            <div className="flex items-center gap-3">
                                                                <User className="w-4 h-4 text-gray-600" />
                                                                <span className="text-sm font-medium text-gray-900">{altMember.name}</span>
                                                                <span className="text-xs text-gray-500">{altMember.role}</span>
                                                                <span className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(alt.confidence)}`}>
                                                                    {alt.confidence}% confidence
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-gray-600 max-w-md">{alt.reasoning}</p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {sortedAssignments.length === 0 && (
                        <div className="text-center py-12">
                            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
                            <p className="text-gray-600">Try adjusting your filters or add more tasks and team members.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
