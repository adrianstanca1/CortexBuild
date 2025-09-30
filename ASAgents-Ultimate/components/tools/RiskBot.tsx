// @ts-nocheck


import React, { useState } from 'react';
// FIX: Corrected import paths to be relative.
import { User, RiskAnalysis } from '../../types';
import { api } from '../../services/apiService';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Tag } from '../ui/Tag';

interface RiskBotProps {
    user: User;
    addToast: (message: string, type: 'success' | 'error') => void;
    onBack: () => void;
}

export const RiskBot: React.FC<RiskBotProps> = ({ user, addToast, onBack }) => {
    const [textToAnalyze, setTextToAnalyze] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [analysis, setAnalysis] = useState<RiskAnalysis | null>(null);

    const handleAnalyze = async () => {
        if (!textToAnalyze.trim()) {
            addToast('Please paste some text to analyze.', 'error');
            return;
        }
        setIsLoading(true);
        setAnalysis(null);
        try {
            const result = await api.analyzeForRisks(textToAnalyze);
            setAnalysis(result);
            addToast('Risk analysis complete.', 'success');
        } catch (error) {
            addToast('Failed to perform risk analysis.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">RiskBot</h3>
            <p className="text-sm text-slate-500 mb-4">Analyze text for compliance and financial risks.</p>

            <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
                <div>
                    <label htmlFor="text-to-analyze" className="block text-sm font-medium text-gray-700 mb-1">Text to Analyze</label>
                    <textarea
                        id="text-to-analyze"
                        value={textToAnalyze}
                        onChange={e => setTextToAnalyze(e.target.value)}
                        rows={8}
                        placeholder="Paste a quote, invoice, or project notes to analyze risks..."
                        className="w-full p-2 border border-gray-300 rounded-md"
                    />
                </div>
                <Button onClick={handleAnalyze} isLoading={isLoading}>Analyze</Button>
            </div>

            <div className="mt-6">
                {analysis === null && !isLoading && (
                    <p className="text-center text-slate-500 py-4">No analysis yet.</p>
                )}
                {analysis && (
                    <div className="space-y-4">
                        <h4 className="font-semibold text-lg">Analysis Result:</h4>
                        <div className="p-4 bg-slate-100 rounded-lg">
                            <p className="font-semibold">Summary:</p>
                            <p className="text-slate-700">{analysis.summary}</p>
                        </div>
                        <div>
                            <h5 className="font-medium mb-2">Identified Risks:</h5>
                            <div className="space-y-3">
                                {analysis.identifiedRisks.map((risk, index) => (
                                    <div key={index} className="p-3 border rounded-md">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold">{risk.severity} Risk:</span>
                                            <p>{risk.description}</p>
                                        </div>
                                        <p className="text-sm text-green-700"><span className="font-medium">Recommendation:</span> {risk.recommendation}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};
