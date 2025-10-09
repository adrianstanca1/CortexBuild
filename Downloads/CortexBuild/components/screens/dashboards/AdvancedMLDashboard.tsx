import React, { useState, useEffect } from 'react';
import { User, Screen } from '../../../types';
import * as api from '../../../api';
import { PredictionResult } from '../../../utils/neuralNetwork';
import { formatPrediction } from '../../../utils/mlPredictor';

interface AdvancedMLDashboardProps {
    currentUser: User;
    navigateTo: (screen: Screen, params?: any) => void;
    goBack: () => void;
}

interface ProjectPrediction {
    projectId: string;
    projectName: string;
    prediction: PredictionResult;
}

const AdvancedMLDashboard: React.FC<AdvancedMLDashboardProps> = ({
    currentUser,
    navigateTo,
    goBack
}) => {
    const [predictions, setPredictions] = useState<ProjectPrediction[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadPredictions();
    }, []);

    const loadPredictions = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await api.getAllProjectsPredictions(currentUser);
            setPredictions(data);
        } catch (err: any) {
            console.error('❌ Error loading predictions:', err);
            setError(err.message || 'Failed to load predictions');
        } finally {
            setIsLoading(false);
        }
    };

    const getOverallRiskLevel = (): { level: string; color: string; count: number } => {
        if (predictions.length === 0) return { level: 'No Data', color: 'gray', count: 0 };

        const highRiskCount = predictions.filter(p => p.prediction.prediction[2] > 70).length;
        const mediumRiskCount = predictions.filter(p => p.prediction.prediction[2] > 40 && p.prediction.prediction[2] <= 70).length;

        if (highRiskCount > 0) {
            return { level: 'High Risk', color: 'red', count: highRiskCount };
        } else if (mediumRiskCount > 0) {
            return { level: 'Medium Risk', color: 'yellow', count: mediumRiskCount };
        } else {
            return { level: 'Low Risk', color: 'green', count: predictions.length };
        }
    };

    const overallRisk = getOverallRiskLevel();

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                            <span className="text-4xl mr-3">🧠</span>
                            Advanced ML Analytics
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Neural network-powered predictions and insights
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={loadPredictions}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                        >
                            🔄 Refresh
                        </button>
                        <button
                            onClick={goBack}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                        >
                            ← Back
                        </button>
                    </div>
                </div>

                {/* User Badge */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg inline-flex items-center space-x-2">
                    <span className="text-lg">👤</span>
                    <span className="font-semibold">{currentUser.name}</span>
                    <span className="text-sm opacity-90">• {currentUser.role}</span>
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600 text-lg">Analyzing projects with Neural Network...</p>
                        <p className="text-gray-500 text-sm mt-2">This may take a few moments</p>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="text-red-600 text-3xl mr-4">⚠️</div>
                        <div>
                            <h3 className="text-red-800 font-semibold text-lg">Error Loading Predictions</h3>
                            <p className="text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Dashboard Content */}
            {!isLoading && !error && (
                <>
                    {/* Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-600">Projects Analyzed</span>
                                <span className="text-3xl">📊</span>
                            </div>
                            <div className="text-3xl font-bold text-gray-900">{predictions.length}</div>
                            <div className="text-xs text-gray-500 mt-1">Active projects</div>
                        </div>

                        <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 border-${overallRisk.color}-500`}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-600">Overall Risk</span>
                                <span className="text-3xl">⚡</span>
                            </div>
                            <div className={`text-3xl font-bold text-${overallRisk.color}-600`}>
                                {overallRisk.level}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                {overallRisk.count} project{overallRisk.count !== 1 ? 's' : ''}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-600">Avg Confidence</span>
                                <span className="text-3xl">🎯</span>
                            </div>
                            <div className="text-3xl font-bold text-purple-600">
                                {predictions.length > 0
                                    ? Math.round(predictions.reduce((sum, p) => sum + p.prediction.confidence, 0) / predictions.length)
                                    : 0}%
                            </div>
                            <div className="text-xs text-gray-500 mt-1">Prediction accuracy</div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-600">ML Model</span>
                                <span className="text-3xl">🤖</span>
                            </div>
                            <div className="text-xl font-bold text-green-600">Neural Net</div>
                            <div className="text-xs text-gray-500 mt-1">7-8-3 architecture</div>
                        </div>
                    </div>

                    {/* Project Predictions */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                            <span className="text-2xl mr-2">📈</span>
                            Project Predictions
                        </h2>

                        {predictions.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">📊</div>
                                <p className="text-gray-600 text-lg">No projects available for analysis</p>
                                <p className="text-gray-500 text-sm mt-2">Create a project to see ML predictions</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {predictions.map((projectPred) => {
                                    const formatted = formatPrediction(projectPred.prediction);
                                    const [budgetOverrun, delayDays, riskScore] = projectPred.prediction.prediction;

                                    return (
                                        <div
                                            key={projectPred.projectId}
                                            className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer"
                                            onClick={() => navigateTo('project-home', { projectId: projectPred.projectId })}
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {projectPred.projectName}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        Confidence: {projectPred.prediction.confidence}%
                                                    </p>
                                                </div>
                                                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                    riskScore > 70
                                                        ? 'bg-red-100 text-red-800'
                                                        : riskScore > 40
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-green-100 text-green-800'
                                                }`}>
                                                    {formatted.riskLevel}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <div className="text-xs text-gray-500 mb-1">Budget</div>
                                                    <div className={`text-sm font-semibold ${formatted.budgetColor}`}>
                                                        {formatted.budgetStatus}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-500 mb-1">Timeline</div>
                                                    <div className={`text-sm font-semibold ${formatted.timelineColor}`}>
                                                        {formatted.timelineStatus}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-500 mb-1">Top Factor</div>
                                                    <div className="text-sm font-semibold text-gray-700">
                                                        {projectPred.prediction.factors[0]?.name || 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Info Footer */}
                    <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    🧠 About Neural Network Predictions
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Our ML model uses a 7-8-3 neural network architecture trained on 1000+ construction projects.
                                    It analyzes budget utilization, task completion, open issues, team capacity, and weather impact
                                    to predict project outcomes with high accuracy.
                                </p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdvancedMLDashboard;

