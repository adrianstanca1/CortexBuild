import React, { useState } from 'react';
import { User } from '../types';
import { api } from '../services/apiService';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface CostEstimatorProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
  onBack: () => void;
}

export const CostEstimator: React.FC<CostEstimatorProps> = ({ user, addToast, onBack }) => {
    const [projectDescription, setProjectDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [estimate, setEstimate] = useState<string | null>(null);

    const handleEstimate = async () => {
        if (!projectDescription.trim()) {
            addToast('Please provide a project description.', 'error');
            return;
        }
        setIsLoading(true);
        setEstimate(null);
        try {
            const result = await api.generateCostEstimate(projectDescription, user.id);
            setEstimate(result);
            addToast('Cost estimate generated.', 'success');
        } catch (error) {
            addToast('Failed to generate estimate.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">AI Cost Estimator</h3>
            <p className="text-sm text-slate-500 mb-4">Get a high-level cost estimate for a project based on a brief description.</p>
            
            <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
                <div>
                    <label htmlFor="project-description" className="block text-sm font-medium text-gray-700 mb-1">Project Description</label>
                    <textarea
                        id="project-description"
                        value={projectDescription}
                        onChange={e => setProjectDescription(e.target.value)}
                        rows={5}
                        placeholder="e.g., 'A two-story, 2000 sq ft office renovation with an open-plan layout and new HVAC system...'"
                        className="w-full p-2 border border-gray-300 rounded-md"
                    />
                </div>
                <Button onClick={handleEstimate} isLoading={isLoading}>Generate Estimate</Button>
            </div>
            
            <div className="mt-6">
                {isLoading && (
                    <div className="text-center py-10">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
                        <p className="mt-2 text-slate-600">AI is calculating your estimate...</p>
                    </div>
                )}
                {estimate && (
                    <div>
                        <h4 className="font-semibold text-lg mb-2">Generated Estimate:</h4>
                        <div className="p-4 border rounded-md bg-white whitespace-pre-wrap">
                            {estimate.split('**').map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};
