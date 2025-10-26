// components/screens/AIWorkflowScreen.tsx
import React, { useState } from 'react';
import { AIWorkflowAutomation } from '../ai/AIWorkflowAutomation';

interface AIWorkflowScreenProps {
    currentUser: any;
    projectId?: string;
}

export const AIWorkflowScreen: React.FC<AIWorkflowScreenProps> = ({
    currentUser,
    projectId
}) => {
    const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);

    const handleWorkflowSelect = (workflow: any) => {
        setSelectedWorkflow(workflow);
        console.log('Selected workflow:', workflow);
    };

    const handleWorkflowExecute = (workflowId: string) => {
        console.log('Executing workflow:', workflowId);
        // Execute workflow logic here
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Workflow Automation</h1>
                <p className="text-gray-600">Automate your processes with AI-powered workflows and triggers</p>
            </div>

            <AIWorkflowAutomation
                projectId={projectId}
                onWorkflowSelect={handleWorkflowSelect}
                onWorkflowExecute={handleWorkflowExecute}
                className="mb-6"
            />

            {selectedWorkflow && (
                <div className="mt-6 p-6 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-indigo-900 mb-4">Workflow Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-medium text-indigo-900 mb-2">Triggers</h4>
                            <div className="space-y-2">
                                {selectedWorkflow.triggers.map((trigger: any, index: number) => (
                                    <div key={index} className="p-3 bg-white rounded border">
                                        <p className="font-medium text-gray-900">{trigger.name}</p>
                                        <p className="text-sm text-gray-600">{trigger.description}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Triggered {trigger.triggerCount} times
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-medium text-indigo-900 mb-2">Actions</h4>
                            <div className="space-y-2">
                                {selectedWorkflow.actions.map((action: any, index: number) => (
                                    <div key={index} className="p-3 bg-white rounded border">
                                        <p className="font-medium text-gray-900">{action.name}</p>
                                        <p className="text-sm text-gray-600">{action.description}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {action.successRate}% success rate
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
