import React, { useState, useEffect } from 'react';
import { Project, Task, RFI, PunchListItem } from '../../types';
import { getMLPredictor, formatPrediction } from '../../utils/mlPredictor';
import { PredictionResult } from '../../utils/neuralNetwork';

interface MLPredictionDashboardProps {
    project: Project;
    tasks: Task[];
    rfis: RFI[];
    punchItems: PunchListItem[];
}

const MLPredictionDashboard: React.FC<MLPredictionDashboardProps> = ({
    project,
    tasks,
    rfis,
    punchItems
}) => {
    const [prediction, setPrediction] = useState<PredictionResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadPrediction();
    }, [project.id]);

    const loadPrediction = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const predictor = getMLPredictor();
            const result = await predictor.predictProjectOutcome(
                project,
                tasks,
                rfis,
                punchItems
            );
            setPrediction(result);
        } catch (err: any) {
            console.error('❌ ML Prediction error:', err);
            setError(err.message || 'Failed to generate predictions');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Analyzing project data with Neural Network...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <div className="text-red-600 text-2xl mr-3">⚠️</div>
                        <div>
                            <h3 className="text-red-800 font-semibold">Prediction Error</h3>
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!prediction) {
        return null;
    }

    const formatted = formatPrediction(prediction);
    const [budgetOverrun, delayDays, riskScore] = prediction.prediction;

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                        <span className="text-3xl mr-3">🧠</span>
                        AI-Powered Predictions
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Neural network analysis • {prediction.confidence}% confidence
                    </p>
                </div>
                <button
                    onClick={loadPrediction}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                    🔄 Refresh
                </button>
            </div>

            {/* Prediction Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Budget Prediction */}
                <div className="bg-white rounded-lg p-5 shadow-md border-l-4 border-blue-500">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Budget Forecast</span>
                        <span className="text-2xl">💰</span>
                    </div>
                    <div className={`text-2xl font-bold ${formatted.budgetColor} mb-1`}>
                        {formatted.budgetStatus}
                    </div>
                    <div className="text-xs text-gray-500">
                        {budgetOverrun > 0 ? '+' : ''}{budgetOverrun.toFixed(1)}% variance
                    </div>
                </div>

                {/* Timeline Prediction */}
                <div className="bg-white rounded-lg p-5 shadow-md border-l-4 border-purple-500">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Timeline Forecast</span>
                        <span className="text-2xl">📅</span>
                    </div>
                    <div className={`text-2xl font-bold ${formatted.timelineColor} mb-1`}>
                        {formatted.timelineStatus}
                    </div>
                    <div className="text-xs text-gray-500">
                        {delayDays > 0 ? '+' : ''}{Math.floor(delayDays)} days variance
                    </div>
                </div>

                {/* Risk Assessment */}
                <div className="bg-white rounded-lg p-5 shadow-md border-l-4 border-orange-500">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Risk Assessment</span>
                        <span className="text-2xl">⚡</span>
                    </div>
                    <div className={`text-2xl font-bold ${formatted.riskColor} mb-1`}>
                        {formatted.riskLevel}
                    </div>
                    <div className="text-xs text-gray-500">
                        {riskScore.toFixed(0)}/100 risk score
                    </div>
                </div>
            </div>

            {/* Key Factors */}
            <div className="bg-white rounded-lg p-5 shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="text-xl mr-2">📊</span>
                    Key Impact Factors
                </h3>
                <div className="space-y-3">
                    {prediction.factors.slice(0, 5).map((factor, index) => (
                        <div key={index} className="flex items-center">
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-gray-700">
                                        {factor.name}
                                    </span>
                                    <span className="text-sm text-gray-600">
                                        {factor.impact.toFixed(1)}% impact
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${
                                            factor.impact > 70
                                                ? 'bg-red-500'
                                                : factor.impact > 40
                                                ? 'bg-yellow-500'
                                                : 'bg-green-500'
                                        }`}
                                        style={{ width: `${Math.min(100, factor.impact)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Confidence Indicator */}
            <div className="mt-6 bg-white rounded-lg p-4 shadow-md">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <span className="text-lg mr-2">🎯</span>
                        <div>
                            <div className="text-sm font-medium text-gray-700">
                                Prediction Confidence
                            </div>
                            <div className="text-xs text-gray-500">
                                Based on data quality and project maturity
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                            {prediction.confidence}%
                        </div>
                        <div className="text-xs text-gray-500">
                            {prediction.confidence > 80
                                ? 'High confidence'
                                : prediction.confidence > 60
                                ? 'Medium confidence'
                                : 'Low confidence'}
                        </div>
                    </div>
                </div>
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full ${
                            prediction.confidence > 80
                                ? 'bg-green-500'
                                : prediction.confidence > 60
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                        }`}
                        style={{ width: `${prediction.confidence}%` }}
                    ></div>
                </div>
            </div>

            {/* Info Footer */}
            <div className="mt-4 text-center text-xs text-gray-500">
                <p>
                    🤖 Powered by Neural Network • Trained on 1000+ construction projects
                </p>
            </div>
        </div>
    );
};

export default MLPredictionDashboard;

