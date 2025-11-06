import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { aiMLService, MLModel, AIInsight, SmartRecommendation, Prediction } from '../../services/aiMLService';

interface AIInsightsScreenProps {
  currentUser: User;
  onNavigate: (screen: string, params?: any) => void;
}

const AIInsightsScreen: React.FC<AIInsightsScreenProps> = ({ currentUser, onNavigate }) => {
  const [models, setModels] = useState<MLModel[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'insights' | 'models' | 'recommendations' | 'predictions'>('insights');
  const [selectedModel, setSelectedModel] = useState<string>('');

  useEffect(() => {
    loadAIData();
  }, [currentUser]);

  const loadAIData = async () => {
    try {
      setLoading(true);
      
      // Load ML models
      const modelsData = await aiMLService.getModels();
      setModels(modelsData);

      // Load AI insights
      const insightsData = await aiMLService.getInsights();
      setInsights(insightsData);

      // Load recommendations
      const recommendationsData = await aiMLService.generateRecommendations();
      setRecommendations(recommendationsData);

      // Load prediction history
      const predictionsData = await aiMLService.getPredictionHistory();
      setPredictions(predictionsData.slice(0, 10)); // Show last 10 predictions
    } catch (error) {
      console.error('Error loading AI data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'risk':
        return (
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
      case 'opportunity':
        return (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        );
      case 'optimization':
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getModelStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800';
      case 'training': return 'bg-yellow-100 text-yellow-800';
      case 'updating': return 'bg-blue-100 text-blue-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const formatConfidence = (confidence: number) => {
    return `${Math.round(confidence * 100)}%`;
  };

  const handleAcceptRecommendation = async (recommendationId: string) => {
    // Update recommendation status
    const updatedRecommendations = recommendations.map(rec => 
      rec.id === recommendationId ? { ...rec, status: 'accepted' as const } : rec
    );
    setRecommendations(updatedRecommendations);
  };

  const handleRejectRecommendation = async (recommendationId: string) => {
    // Update recommendation status
    const updatedRecommendations = recommendations.map(rec => 
      rec.id === recommendationId ? { ...rec, status: 'rejected' as const } : rec
    );
    setRecommendations(updatedRecommendations);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Insights & Machine Learning</h1>
          <p className="text-gray-600 mt-1">Advanced AI-powered insights and predictive analytics</p>
        </div>
        
        <button
          onClick={loadAIData}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Refresh AI Data
        </button>
      </div>

      {/* AI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="text-2xl font-bold text-blue-600">{models.filter(m => m.status === 'ready').length}</div>
          <div className="text-sm text-gray-600">Active Models</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="text-2xl font-bold text-red-600">{insights.filter(i => i.impact === 'high' || i.impact === 'critical').length}</div>
          <div className="text-sm text-gray-600">High Impact Insights</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="text-2xl font-bold text-green-600">{recommendations.filter(r => r.status === 'pending').length}</div>
          <div className="text-sm text-gray-600">Pending Recommendations</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="text-2xl font-bold text-purple-600">{predictions.length}</div>
          <div className="text-sm text-gray-600">Recent Predictions</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'insights', name: 'AI Insights', icon: '🧠' },
            { id: 'models', name: 'ML Models', icon: '🤖' },
            { id: 'recommendations', name: 'Smart Recommendations', icon: '💡' },
            { id: 'predictions', name: 'Predictions', icon: '🔮' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon} {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* AI Insights Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          {insights.length === 0 ? (
            <div className="bg-white rounded-lg shadow border p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No AI Insights Available</h3>
              <p className="text-gray-500">AI is analyzing your data to generate insights</p>
            </div>
          ) : (
            <div className="space-y-4">
              {insights.map(insight => (
                <div key={insight.id} className="bg-white rounded-lg shadow border p-6">
                  <div className="flex items-start gap-4">
                    {getInsightIcon(insight.type)}
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{insight.title}</h3>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            insight.urgency === 'immediate' ? 'bg-red-100 text-red-800' :
                            insight.urgency === 'high' ? 'bg-orange-100 text-orange-800' :
                            insight.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {insight.urgency} urgency
                          </span>
                          <span className={`font-medium ${getImpactColor(insight.impact)}`}>
                            {insight.impact} impact
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-4">{insight.description}</p>
                      
                      <div className="flex items-center gap-4 mb-4">
                        <div className="text-sm">
                          <span className="text-gray-600">Confidence:</span>
                          <span className="font-medium ml-1">{formatConfidence(insight.confidence)}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600">Category:</span>
                          <span className="font-medium ml-1 capitalize">{insight.category}</span>
                        </div>
                      </div>
                      
                      {insight.recommendations.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Recommended Actions:</h4>
                          <div className="space-y-2">
                            {insight.recommendations.map((rec, index) => (
                              <div key={index} className="bg-gray-50 rounded p-3">
                                <div className="font-medium text-gray-900">{rec.action}</div>
                                <div className="text-sm text-gray-600 mt-1">
                                  Impact: {rec.estimatedImpact} • Effort: {rec.effort}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ML Models Tab */}
      {activeTab === 'models' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {models.map(model => (
            <div key={model.id} className="bg-white rounded-lg shadow border p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{model.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{model.description}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getModelStatusColor(model.status)}`}>
                  {model.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-600">Accuracy</div>
                  <div className="text-lg font-bold text-green-600">{model.accuracy.toFixed(1)}%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Version</div>
                  <div className="text-lg font-bold text-blue-600">{model.version}</div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">Performance Metrics</div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Precision:</span>
                    <span className="font-medium ml-1">{(model.metrics.precision * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Recall:</span>
                    <span className="font-medium ml-1">{(model.metrics.recall * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500">F1:</span>
                    <span className="font-medium ml-1">{(model.metrics.f1Score * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedModel(model.id)}
                  className="flex-1 px-3 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 text-sm"
                >
                  View Details
                </button>
                <button
                  onClick={() => aiMLService.trainModel(model.id, [])}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  disabled={model.status === 'training'}
                >
                  {model.status === 'training' ? 'Training...' : 'Retrain'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Smart Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          {recommendations.map(rec => (
            <div key={rec.id} className="bg-white rounded-lg shadow border p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{rec.title}</h3>
                  <p className="text-gray-600 mt-1">{rec.description}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  rec.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  rec.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  rec.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {rec.status}
                </span>
              </div>
              
              <div className="bg-blue-50 rounded p-4 mb-4">
                <h4 className="font-medium text-blue-900 mb-2">AI Rationale</h4>
                <p className="text-blue-800 text-sm">{rec.rationale}</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className={`text-lg font-bold ${rec.potentialImpact.timeline < 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {rec.potentialImpact.timeline > 0 ? '+' : ''}{rec.potentialImpact.timeline}d
                  </div>
                  <div className="text-xs text-gray-500">Timeline Impact</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold ${rec.potentialImpact.cost < 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {rec.potentialImpact.cost < 0 ? '-' : '+'}£{Math.abs(rec.potentialImpact.cost)}
                  </div>
                  <div className="text-xs text-gray-500">Cost Impact</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold ${rec.potentialImpact.quality > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {rec.potentialImpact.quality > 0 ? '+' : ''}{rec.potentialImpact.quality}%
                  </div>
                  <div className="text-xs text-gray-500">Quality Impact</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{formatConfidence(rec.confidence)}</div>
                  <div className="text-xs text-gray-500">Confidence</div>
                </div>
              </div>
              
              {rec.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAcceptRecommendation(rec.id)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Accept Recommendation
                  </button>
                  <button
                    onClick={() => handleRejectRecommendation(rec.id)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Predictions Tab */}
      {activeTab === 'predictions' && (
        <div className="bg-white rounded-lg shadow border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-bold text-gray-900">Recent AI Predictions</h2>
          </div>
          
          <div className="p-6">
            {predictions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-lg mb-2">No predictions available</div>
                <div className="text-sm">AI predictions will appear here as they are generated</div>
              </div>
            ) : (
              <div className="space-y-4">
                {predictions.map(prediction => (
                  <div key={prediction.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Model: {models.find(m => m.id === prediction.modelId)?.name || 'Unknown'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(prediction.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">
                          {formatConfidence(prediction.confidence)}
                        </div>
                        <div className="text-xs text-gray-500">Confidence</div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded p-3 mb-3">
                      <div className="text-sm font-medium text-gray-900 mb-1">Prediction:</div>
                      <div className="text-sm text-gray-700">{JSON.stringify(prediction.prediction)}</div>
                    </div>
                    
                    <div className="text-xs text-gray-600">
                      <strong>Explanation:</strong> {prediction.explanation.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIInsightsScreen;
