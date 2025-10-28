// components/screens/AIRecommendationsScreen.tsx
import React, { useState } from 'react';
import { AIRecommendations, ProjectContext } from '../ai/AIRecommendations';

interface AIRecommendationsScreenProps {
    currentUser: any;
    projectId?: string;
}

export const AIRecommendationsScreen: React.FC<AIRecommendationsScreenProps> = ({
    currentUser,
    projectId
}) => {
    const [selectedRecommendation, setSelectedRecommendation] = useState<any>(null);

    // Mock project context - replace with actual data
    const projectContext: ProjectContext = {
        id: projectId || '1',
        name: 'Office Building Construction',
        status: 'active',
        budget: 2500000,
        spent: 1800000,
        progress: 72,
        teamSize: 15,
        timeline: {
            start: '2024-01-01',
            end: '2024-06-30',
            milestones: [
                { name: 'Foundation Complete', date: '2024-02-15', status: 'completed' },
                { name: 'Frame Complete', date: '2024-04-15', status: 'completed' },
                { name: 'Interior Work', date: '2024-05-30', status: 'in-progress' },
                { name: 'Final Inspection', date: '2024-06-25', status: 'pending' }
            ]
        },
        risks: [
            { type: 'Budget Overrun', level: 'medium', description: 'Material costs increasing' },
            { type: 'Timeline Delay', level: 'low', description: 'Weather delays possible' },
            { type: 'Safety Incident', level: 'low', description: 'Standard safety protocols' }
        ],
        performance: {
            productivity: 87,
            quality: 92,
            efficiency: 85
        }
    };

    const handleRecommendationSelect = (recommendation: any) => {
        setSelectedRecommendation(recommendation);
        console.log('Selected recommendation:', recommendation);
    };

    const handleImplementRecommendation = (recommendationId: string) => {
        console.log('Implementing recommendation:', recommendationId);
        // Implement recommendation logic here
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Recommendations</h1>
                <p className="text-gray-600">AI-powered insights and recommendations for your project optimization</p>
            </div>

            <AIRecommendations
                projectContext={projectContext}
                onRecommendationSelect={handleRecommendationSelect}
                onImplementRecommendation={handleImplementRecommendation}
                className="mb-6"
            />

            {selectedRecommendation && (
                <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">Selected Recommendation Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-medium text-blue-900 mb-2">Implementation Steps</h4>
                            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                                {selectedRecommendation.implementationSteps.map((step: string, index: number) => (
                                    <li key={index}>{step}</li>
                                ))}
                            </ol>
                        </div>
                        <div>
                            <h4 className="font-medium text-blue-900 mb-2">Prerequisites</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                                {selectedRecommendation.prerequisites.map((prereq: string, index: number) => (
                                    <li key={index}>{prereq}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
