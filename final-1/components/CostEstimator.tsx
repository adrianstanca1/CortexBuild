// full contents of components/CostEstimator.tsx

import React, { useState } from 'react';
import { User } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
// FIX: Corrected API import
import { api } from '../services/mockApi';
import { GoogleGenAI, Type } from "@google/genai";

interface CostEstimatorProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
  onBack: () => void;
}

interface Estimate {
    totalEstimate: number;
    breakdown: {
        category: string;
        cost: number;
        details: string;
    }[];
    contingency: number;
    summary: string;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 0 }).format(amount);

export const CostEstimator: React.FC<CostEstimatorProps> = ({ user, addToast, onBack }) => {
    const [description, setDescription] = useState('');
    const [sqft, setSqft] = useState<number | ''>('');
    const [quality, setQuality] = useState('standard');
    const [estimate, setEstimate] = useState<Estimate | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleEstimate = async () => {
        if (!description.trim() || !sqft) {
            addToast('Please provide a description and square footage.', 'error');
            return;
        }
        setIsLoading(true);
        setEstimate(null);

        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
            const result = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `Provide a UK-based construction cost estimate for the following project: "${description}". Square footage: ${sqft} sq ft. Quality: ${quality}. Provide a JSON object with keys: "totalEstimate" (number), "breakdown" (array of objects with "category", "cost", "details"), "contingency" (number), "summary" (string).`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            totalEstimate: { type: Type.NUMBER },
                            breakdown: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        category: { type: Type.STRING },
                                        cost: { type: Type.NUMBER },
                                        details: { type: Type.STRING },
                                    },
                                    // FIX: Added required property to satisfy schema
                                    required: ['category', 'cost', 'details'],
                                }
                            },
                            contingency: { type: Type.NUMBER },
                            summary: { type: Type.STRING },
                        },
                         // FIX: Added required property to satisfy schema
                        required: ['totalEstimate', 'breakdown', 'contingency', 'summary'],
                    }
                }
            });

            const jsonText = result.text.trim();
            setEstimate(JSON.parse(jsonText));
            addToast("Cost estimate generated!", "success");
        } catch (error) {
            console.error(error);
            addToast("Failed to generate cost estimate.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">AI Cost Estimator</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
                    <div>
                        <label className="block text-sm font-medium">Project Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={5} className="w-full p-2 border rounded" placeholder="e.g., Two-story office building with open-plan interior and glass facade."/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Square Footage</label>
                        <input type="number" value={sqft} onChange={e => setSqft(e.target.value === '' ? '' : parseInt(e.target.value))} className="w-full p-2 border rounded" placeholder="5000" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Finish Quality</label>
                        <select value={quality} onChange={e => setQuality(e.target.value)} className="w-full p-2 border rounded bg-white">
                            <option value="basic">Basic</option>
                            <option value="standard">Standard</option>
                            <option value="high-end">High-End</option>
                        </select>
                    </div>
                    <Button onClick={handleEstimate} isLoading={isLoading}>Estimate Costs</Button>
                </div>
                <div>
                    {isLoading && <p>AI is calculating...</p>}
                    {estimate && (
                        <div className="space-y-4">
                            <div className="p-4 bg-sky-100 rounded-lg text-center">
                                <p className="text-sky-800 font-semibold">Total Estimated Cost</p>
                                <p className="text-4xl font-bold text-sky-900">{formatCurrency(estimate.totalEstimate)}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold">Breakdown:</h4>
                                <ul className="list-disc list-inside">
                                    {estimate.breakdown.map((item, i) => <li key={i}>{item.category}: {formatCurrency(item.cost)}</li>)}
                                </ul>
                                <p className="mt-2 text-sm">Contingency: {formatCurrency(estimate.contingency)}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold">Summary:</h4>
                                <p className="text-sm text-slate-600">{estimate.summary}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};