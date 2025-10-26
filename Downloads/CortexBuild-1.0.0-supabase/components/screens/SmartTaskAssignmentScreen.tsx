// components/screens/SmartTaskAssignmentScreen.tsx
import React, { useState } from 'react';
import { SmartTaskAssignment, Task, TeamMember } from '../ai/SmartTaskAssignment';

interface SmartTaskAssignmentScreenProps {
    currentUser: any;
    projectId?: string;
}

export const SmartTaskAssignmentScreen: React.FC<SmartTaskAssignmentScreenProps> = ({
    currentUser,
    projectId
}) => {
    const [assignments, setAssignments] = useState<any[]>([]);

    // Mock data - replace with actual data
    const mockTasks: Task[] = [
        {
            id: 't1',
            title: 'Foundation Inspection',
            description: 'Comprehensive inspection of foundation work including concrete quality, reinforcement placement, and structural integrity.',
            priority: 'high',
            complexity: 'moderate',
            estimatedHours: 6,
            requiredSkills: ['structural_engineering', 'concrete_analysis', 'safety_protocols'],
            deadline: '2024-01-25',
            location: 'Site A',
            dependencies: [],
            category: 'Quality Control',
            aiAnalysis: {
                difficultyScore: 75,
                timeEstimate: 6,
                skillRequirements: ['structural_engineering', 'concrete_analysis'],
                riskFactors: ['Weather conditions', 'Access limitations'],
                optimalTeamSize: 2
            }
        },
        {
            id: 't2',
            title: 'Safety Training Session',
            description: 'Conduct safety training for new team members covering site safety protocols, emergency procedures, and equipment usage.',
            priority: 'medium',
            complexity: 'simple',
            estimatedHours: 4,
            requiredSkills: ['safety_training', 'communication', 'team_management'],
            deadline: '2024-01-22',
            location: 'Main Office',
            dependencies: [],
            category: 'Training',
            aiAnalysis: {
                difficultyScore: 45,
                timeEstimate: 4,
                skillRequirements: ['safety_training', 'communication'],
                riskFactors: ['Scheduling conflicts'],
                optimalTeamSize: 1
            }
        },
        {
            id: 't3',
            title: 'Material Procurement Optimization',
            description: 'Implement AI-driven material ordering system to optimize inventory levels and reduce waste.',
            priority: 'medium',
            complexity: 'complex',
            estimatedHours: 8,
            requiredSkills: ['procurement', 'data_analysis', 'ai_systems'],
            deadline: '2024-01-30',
            location: 'Remote',
            dependencies: [],
            category: 'Process Improvement',
            aiAnalysis: {
                difficultyScore: 85,
                timeEstimate: 8,
                skillRequirements: ['procurement', 'data_analysis', 'ai_systems'],
                riskFactors: ['System integration complexity', 'Data quality issues'],
                optimalTeamSize: 2
            }
        }
    ];

    const mockTeamMembers: TeamMember[] = [
        {
            id: 'u1',
            name: 'John Smith',
            role: 'Senior Structural Engineer',
            skills: ['structural_engineering', 'concrete_analysis', 'project_management', 'safety_protocols'],
            experience: 8,
            currentWorkload: 60,
            availability: 'available',
            performanceScore: 95,
            location: 'Site A',
            preferences: {
                taskTypes: ['structural_analysis', 'quality_control'],
                workingHours: '8:00-17:00',
                maxWorkload: 80
            },
            aiProfile: {
                strengths: ['Technical expertise', 'Problem solving', 'Leadership'],
                learningAreas: ['AI systems', 'Digital tools'],
                collaborationStyle: 'collaborative',
                workPace: 'thorough'
            }
        },
        {
            id: 'u2',
            name: 'Sarah Johnson',
            role: 'Safety Coordinator',
            skills: ['safety_training', 'communication', 'team_management', 'compliance'],
            experience: 5,
            currentWorkload: 85,
            availability: 'busy',
            performanceScore: 92,
            location: 'Main Office',
            preferences: {
                taskTypes: ['safety_training', 'compliance'],
                workingHours: '9:00-18:00',
                maxWorkload: 90
            },
            aiProfile: {
                strengths: ['Communication', 'Training delivery', 'Compliance knowledge'],
                learningAreas: ['Technical skills', 'Data analysis'],
                collaborationStyle: 'collaborative',
                workPace: 'moderate'
            }
        },
        {
            id: 'u3',
            name: 'Mike Wilson',
            role: 'Procurement Specialist',
            skills: ['procurement', 'supply_chain', 'negotiation', 'data_analysis'],
            experience: 6,
            currentWorkload: 45,
            availability: 'available',
            performanceScore: 88,
            location: 'Remote',
            preferences: {
                taskTypes: ['procurement', 'supply_chain'],
                workingHours: '8:30-17:30',
                maxWorkload: 75
            },
            aiProfile: {
                strengths: ['Negotiation', 'Cost optimization', 'Supplier relations'],
                learningAreas: ['AI systems', 'Advanced analytics'],
                collaborationStyle: 'independent',
                workPace: 'fast'
            }
        },
        {
            id: 'u4',
            name: 'David Chen',
            role: 'Project Manager',
            skills: ['project_management', 'team_leadership', 'budget_management', 'communication'],
            experience: 10,
            currentWorkload: 90,
            availability: 'unavailable',
            performanceScore: 96,
            location: 'Main Office',
            preferences: {
                taskTypes: ['project_management', 'strategic_planning'],
                workingHours: '7:00-19:00',
                maxWorkload: 95
            },
            aiProfile: {
                strengths: ['Leadership', 'Strategic thinking', 'Risk management'],
                learningAreas: ['Technical skills', 'AI applications'],
                collaborationStyle: 'collaborative',
                workPace: 'moderate'
            }
        }
    ];

    const handleAssignmentConfirm = (assignment: any) => {
        console.log('Confirming assignment:', assignment);
        setAssignments(prev => [...prev, assignment]);
    };

    const handleAssignmentReject = (assignmentId: string) => {
        console.log('Rejecting assignment:', assignmentId);
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Smart Task Assignment</h1>
                <p className="text-gray-600">AI-powered task assignment based on skills, workload, and performance analysis</p>
            </div>

            <SmartTaskAssignment
                tasks={mockTasks}
                teamMembers={mockTeamMembers}
                onAssignmentConfirm={handleAssignmentConfirm}
                onAssignmentReject={handleAssignmentReject}
                className="mb-6"
            />

            {assignments.length > 0 && (
                <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-900 mb-4">Confirmed Assignments</h3>
                    <div className="space-y-3">
                        {assignments.map((assignment, index) => (
                            <div key={index} className="p-3 bg-white rounded border">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">{assignment.taskId}</p>
                                        <p className="text-sm text-gray-600">Assigned to: {assignment.assigneeId}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-green-900">{assignment.confidence}% confidence</p>
                                        <p className="text-xs text-gray-500">Predicted completion: {assignment.predictedOutcome.completionTime}h</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
