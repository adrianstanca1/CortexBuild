import React, { useState } from 'react';
import { User } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';

interface CostEstimatorProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
}

interface Estimate {
    lowEstimate: number;
    highEstimate: number;
    contingencyPercentage: number;
    summary: string;
    currency: string;
}

const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
};

export const CostEstimator: React.FC<CostEstimatorProps> = ({ user, addToast }) => {
    const [description, setDescription] = useState('');
    const [estimate, setEstimate] = useState<Estimate | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleEstimate = async () => {
        if (!description.trim()) return;
        setIsLoading(true);
        setEstimate(null);
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            const response: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Generate a high-level construction cost estimate in GBP for the following project scope: ${description}. Provide a low and high range, a recommended contingency percentage, and a brief summary.`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            lowEstimate: { type: Type.NUMBER, description: 'The low-end of the estimated cost range.' },
                            highEstimate: { type: Type.NUMBER, description: 'The high-end of the estimated cost range.' },
                            contingencyPercentage: { type: Type.NUMBER, description: 'A recommended contingency percentage.' },
                            summary: { type: Type.STRING, description: 'A brief summary of the estimate basis.' },
                            currency: { type: Type.STRING, description: 'The currency of the estimate, e.g. GBP.' }
                        },
                        required: ['lowEstimate', 'highEstimate', 'contingencyPercentage', 'summary', 'currency']
                    }
                }
            });

            const jsonStr = response.text;
            const parsedEstimate = JSON.parse(jsonStr) as Estimate;
            setEstimate(parsedEstimate);
            addToast("Cost estimate generated!", "success");

        } catch (error) {
            console.error(error);
            addToast("Failed to generate estimate.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <h3 className="text-xl font-semibold mb-4">AI Cost Estimator</h3>
            <div className="space-y-4">
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                    className="w-full p-2 border rounded-md"
                    placeholder="Describe the project scope, e.g., '10-story office building, 50,000 sq ft, steel frame, central London'..."
                    disabled={isLoading}
                />
                <Button onClick={handleEstimate} isLoading={isLoading} disabled={!description.trim()}>Generate Estimate</Button>
            </div>
            
            {isLoading && (
                <div className="text-center py-10">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
                    <p className="mt-2 text-slate-600">AI is calculating your estimate...</p>
                </div>
            )}

            {estimate && (
                <div className="mt-6 pt-4 border-t animate-card-enter">
                    <h4 className="font-semibold text-lg">AI-Generated Estimate:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-center">
                        <div className="bg-slate-50 p-4 rounded-lg">
                            <p className="text-sm text-slate-500">Low Estimate</p>
                            <p className="text-2xl font-bold">{formatCurrency(estimate.lowEstimate, estimate.currency)}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg">
                            <p className="text-sm text-slate-500">High Estimate</p>
                            <p className="text-2xl font-bold">{formatCurrency(estimate.highEstimate, estimate.currency)}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg">
                            <p className="text-sm text-slate-500">Contingency</p>
                            <p className="text-2xl font-bold">{estimate.contingencyPercentage}%</p>
                        </div>
                    </div>
                    <div className="mt-4 p-3 bg-sky-50 border-l-4 border-sky-500 rounded-r-md">
                        <p className="font-semibold text-sm">Summary:</p>
                        <p className="text-slate-700 text-sm">{estimate.summary}</p>
                    </div>
                </div>
            )}
        </Card>
    );
};