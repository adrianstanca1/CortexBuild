import React, { useState, useEffect } from 'react';
import { CurrencyPoundIcon, TrendingDownIcon, TrendingUpIcon, LightBulbIcon, CheckCircleIcon } from '../Icons';

interface CostOptimizationAppProps {
  userId: string;
  companyId: string;
  projectId?: string;
}

interface CostAnalysis {
  budgetHealth: {
    totalBudget: number;
    currentSpend: number;
    committed: number;
    forecast: number;
    variance: number;
    variancePercentage: number;
    status: 'under_budget' | 'on_budget' | 'over_budget' | 'at_risk';
  };
  costBreakdown: Array<{
    category: string;
    budgeted: number;
    actual: number;
    variance: number;
    percentComplete: number;
  }>;
  predictions: {
    finalCost: number;
    confidence: number;
    completionCost: number;
    savingsOpportunities: number;
  };
  optimizations: Array<{
    id: string;
    category: 'labor' | 'materials' | 'equipment' | 'overhead' | 'schedule';
    title: string;
    description: string;
    potentialSavings: number;
    effort: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
    priority: 'low' | 'medium' | 'high' | 'critical';
    implementation: string[];
    roi: number; // Return on investment percentage
  }>;
  costTrends: Array<{
    month: string;
    budget: number;
    actual: number;
    forecast: number;
  }>;
  benchmarks: {
    costPerSqFt: number;
    industryAverage: number;
    performancePctl: number; // Percentile vs industry
  };
}

const CostOptimizationApp: React.FC<CostOptimizationAppProps> = ({
  userId,
  companyId,
  projectId
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<CostAnalysis | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    // Auto-analyze on mount
    analyzeCosts();
  }, [projectId]);

  const analyzeCosts = async () => {
    setIsAnalyzing(true);

    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock comprehensive cost analysis
      const mockAnalysis: CostAnalysis = {
        budgetHealth: {
          totalBudget: 485000,
          currentSpend: 298450,
          committed: 125600,
          forecast: 524935,
          variance: 39935,
          variancePercentage: 8.24,
          status: 'at_risk'
        },
        costBreakdown: [
          { category: 'Labor', budgeted: 195000, actual: 142850, variance: -52150, percentComplete: 58 },
          { category: 'Materials', budgeted: 185000, actual: 112400, variance: -72600, percentComplete: 65 },
          { category: 'Equipment', budgeted: 45000, actual: 28950, variance: -16050, percentComplete: 62 },
          { category: 'Subcontractors', budgeted: 35000, actual: 11250, variance: -23750, percentComplete: 25 },
          { category: 'Overhead', budgeted: 25000, actual: 3000, variance: -22000, percentComplete: 10 }
        ],
        predictions: {
          finalCost: 524935,
          confidence: 0.84,
          completionCost: 226485,
          savingsOpportunities: 42800
        },
        optimizations: [
          {
            id: 'opt1',
            category: 'materials',
            title: 'Bulk Purchase Discount Opportunity',
            description: 'Consolidating remaining material orders with preferred supplier can secure 12-15% volume discount',
            potentialSavings: 18500,
            effort: 'low',
            impact: 'high',
            priority: 'high',
            implementation: [
              'Review remaining material requirements across all trades',
              'Negotiate bulk pricing with primary supplier',
              'Accelerate material procurement timeline',
              'Coordinate delivery schedule to minimize storage costs'
            ],
            roi: 850
          },
          {
            id: 'opt2',
            category: 'labor',
            title: 'Optimize Crew Scheduling',
            description: 'AI analysis shows 15% reduction in overtime possible through better task sequencing and crew allocation',
            potentialSavings: 12300,
            effort: 'medium',
            impact: 'medium',
            priority: 'high',
            implementation: [
              'Implement AI-optimized crew scheduling',
              'Reduce weekend and overtime hours',
              'Better coordination between trades',
              'Level resource loading across project phases'
            ],
            roi: 420
          },
          {
            id: 'opt3',
            category: 'equipment',
            title: 'Equipment Rental vs Purchase Analysis',
            description: 'Switching from daily rental to monthly rental for excavator and lift equipment',
            potentialSavings: 6800,
            effort: 'low',
            impact: 'medium',
            priority: 'medium',
            implementation: [
              'Renegotiate equipment rental contracts',
              'Switch to monthly rates for long-term needs',
              'Return equipment not actively in use',
              'Coordinate equipment sharing with nearby projects'
            ],
            roi: 680
          },
          {
            id: 'opt4',
            category: 'schedule',
            title: 'Fast-Track Non-Critical Activities',
            description: 'Accelerating project completion by 2 weeks reduces overhead and financing costs',
            potentialSavings: 8200,
            effort: 'high',
            impact: 'medium',
            priority: 'medium',
            implementation: [
              'Identify activities that can be fast-tracked',
              'Allocate additional resources to critical path',
              'Increase crew sizes for parallel work',
              'Reduce project duration by 2 weeks'
            ],
            roi: 175
          },
          {
            id: 'opt5',
            category: 'materials',
            title: 'Value Engineering Opportunities',
            description: 'Alternative materials and specifications that meet requirements at lower cost',
            potentialSavings: 15600,
            effort: 'medium',
            impact: 'high',
            priority: 'high',
            implementation: [
              'Review specifications for cost-effective alternatives',
              'Obtain client approval for value engineering changes',
              'Update shop drawings and submittals',
              'Coordinate with design team and suppliers'
            ],
            roi: 560
          },
          {
            id: 'opt6',
            category: 'overhead',
            title: 'Reduce Site Office Costs',
            description: 'Optimize site facilities and reduce unnecessary overhead expenses',
            potentialSavings: 3200,
            effort: 'low',
            impact: 'low',
            priority: 'low',
            implementation: [
              'Reduce temporary facility footprint',
              'Negotiate better rates for utilities and services',
              'Implement energy-saving measures',
              'Review and eliminate redundant services'
            ],
            roi: 320
          }
        ],
        costTrends: [
          { month: 'Aug 2024', budget: 85000, actual: 78450, forecast: 78450 },
          { month: 'Sep 2024', budget: 165000, actual: 158900, forecast: 158900 },
          { month: 'Oct 2024', budget: 235000, actual: 298450, forecast: 298450 },
          { month: 'Nov 2024', budget: 320000, actual: 298450, forecast: 378600 },
          { month: 'Dec 2024', budget: 405000, actual: 298450, forecast: 458200 },
          { month: 'Jan 2025', budget: 485000, actual: 298450, forecast: 524935 }
        ],
        benchmarks: {
          costPerSqFt: 142.50,
          industryAverage: 155.00,
          performancePctl: 68
        }
      };

      setAnalysis(mockAnalysis);

    } catch (error) {
      console.error('Cost analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getBudgetStatusColor = (status: string) => {
    switch (status) {
      case 'under_budget': return 'text-green-600 bg-green-50';
      case 'on_budget': return 'text-blue-600 bg-blue-50';
      case 'at_risk': return 'text-yellow-600 bg-yellow-50';
      case 'over_budget': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return `£${amount.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CurrencyPoundIcon className="w-8 h-8 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Cost Optimization AI</h1>
              <p className="text-sm text-gray-500">AI-driven cost analysis and budget optimization</p>
            </div>
          </div>
          <button
            onClick={analyzeCosts}
            disabled={isAnalyzing}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isAnalyzing ? 'Analyzing...' : 'Refresh Analysis'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        {isAnalyzing && !analysis && (
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-700 font-medium">Analyzing costs with AI...</p>
              <p className="text-sm text-gray-500 mt-2">Identifying optimization opportunities and cost savings</p>
            </div>
          </div>
        )}

        {analysis && (
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Budget Health Overview */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg shadow-sm border border-green-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget Health Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-xs text-gray-600 mb-1">Total Budget</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(analysis.budgetHealth.totalBudget)}</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-xs text-gray-600 mb-1">Current Spend</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(analysis.budgetHealth.currentSpend)}</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-xs text-gray-600 mb-1">Forecast at Completion</p>
                  <p className="text-2xl font-bold text-orange-600">{formatCurrency(analysis.budgetHealth.forecast)}</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-xs text-gray-600 mb-1">Variance</p>
                  <p className={`text-2xl font-bold ${analysis.budgetHealth.variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {analysis.budgetHealth.variance > 0 && '+'}
                    {formatCurrency(analysis.budgetHealth.variance)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    ({analysis.budgetHealth.variancePercentage > 0 && '+'}{analysis.budgetHealth.variancePercentage.toFixed(1)}%)
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Budget Utilization</span>
                  <span className={`font-medium ${getBudgetStatusColor(analysis.budgetHealth.status)}`}>
                    {analysis.budgetHealth.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
                      analysis.budgetHealth.status === 'over_budget' ? 'bg-red-600' :
                      analysis.budgetHealth.status === 'at_risk' ? 'bg-yellow-600' :
                      'bg-green-600'
                    }`}
                    style={{ width: `${Math.min((analysis.budgetHealth.currentSpend / analysis.budgetHealth.totalBudget) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* AI Predictions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Cost Predictions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <p className="text-sm text-purple-900 font-medium mb-2">Predicted Final Cost</p>
                  <p className="text-3xl font-bold text-purple-600">{formatCurrency(analysis.predictions.finalCost)}</p>
                  <p className="text-xs text-purple-700 mt-1">{Math.round(analysis.predictions.confidence * 100)}% confidence</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-blue-900 font-medium mb-2">Cost to Complete</p>
                  <p className="text-3xl font-bold text-blue-600">{formatCurrency(analysis.predictions.completionCost)}</p>
                  <p className="text-xs text-blue-700 mt-1">Remaining work</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="text-sm text-green-900 font-medium mb-2">Potential Savings</p>
                  <p className="text-3xl font-bold text-green-600">{formatCurrency(analysis.predictions.savingsOpportunities)}</p>
                  <p className="text-xs text-green-700 mt-1">Identified by AI</p>
                </div>
              </div>
            </div>

            {/* Cost Optimization Opportunities */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <LightBulbIcon className="w-6 h-6 text-yellow-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Optimization Opportunities</h2>
                </div>
                <span className="text-sm text-gray-600">
                  {analysis.optimizations.length} opportunities • {formatCurrency(analysis.predictions.savingsOpportunities)} total savings
                </span>
              </div>

              <div className="space-y-4">
                {analysis.optimizations
                  .sort((a, b) => b.potentialSavings - a.potentialSavings)
                  .map((opt, idx) => (
                    <div key={opt.id} className={`border-2 rounded-lg p-5 hover:shadow-md transition-shadow ${
                      opt.priority === 'high' || opt.priority === 'critical' ? 'border-orange-200 bg-orange-50' : 'border-gray-200'
                    }`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-lg font-semibold text-gray-900">{opt.title}</span>
                            <span className={`px-2 py-1 text-xs font-medium rounded border ${getPriorityColor(opt.priority)}`}>
                              {opt.priority.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-3">{opt.description}</p>
                        </div>
                        <div className="ml-4 text-right">
                          <p className="text-2xl font-bold text-green-600">{formatCurrency(opt.potentialSavings)}</p>
                          <p className="text-xs text-gray-500">savings</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div className="bg-white rounded p-2">
                          <p className="text-xs text-gray-600 mb-1">Effort</p>
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3].map((level) => (
                              <div
                                key={level}
                                className={`h-2 w-full rounded ${
                                  (opt.effort === 'low' && level <= 1) ||
                                  (opt.effort === 'medium' && level <= 2) ||
                                  (opt.effort === 'high' && level <= 3)
                                    ? 'bg-blue-600'
                                    : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="bg-white rounded p-2">
                          <p className="text-xs text-gray-600 mb-1">Impact</p>
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3].map((level) => (
                              <div
                                key={level}
                                className={`h-2 w-full rounded ${
                                  (opt.impact === 'low' && level <= 1) ||
                                  (opt.impact === 'medium' && level <= 2) ||
                                  (opt.impact === 'high' && level <= 3)
                                    ? 'bg-green-600'
                                    : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="bg-white rounded p-2">
                          <p className="text-xs text-gray-600 mb-1">ROI</p>
                          <p className="text-sm font-bold text-gray-900">{opt.roi}%</p>
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded p-3">
                        <p className="text-xs font-medium text-blue-900 mb-2">Implementation Steps:</p>
                        <ul className="space-y-1">
                          {opt.implementation.map((step, stepIdx) => (
                            <li key={stepIdx} className="text-xs text-blue-800 flex items-start">
                              <span className="mr-2">{stepIdx + 1}.</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Cost Breakdown by Category */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown by Category</h2>
              <div className="space-y-3">
                {analysis.costBreakdown.map((item, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{item.category}</span>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{formatCurrency(item.actual)} / {formatCurrency(item.budgeted)}</p>
                        <p className={`text-xs ${item.variance < 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.variance < 0 ? '' : '+'}{formatCurrency(item.variance)} variance
                        </p>
                      </div>
                    </div>
                    <div className="relative w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`absolute top-0 left-0 h-3 rounded-full ${
                          (item.actual / item.budgeted) > 0.9 ? 'bg-red-600' :
                          (item.actual / item.budgeted) > 0.7 ? 'bg-yellow-600' :
                          'bg-green-600'
                        }`}
                        style={{ width: `${Math.min((item.actual / item.budgeted) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-600">{item.percentComplete}% complete</span>
                      <span className="text-xs text-gray-600">
                        {Math.round((item.actual / item.budgeted) * 100)}% of budget used
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Trends Chart */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Cost Trends & Forecast</h2>
              <div className="relative h-64">
                <div className="flex items-end justify-between h-full space-x-3">
                  {analysis.costTrends.map((trend, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end">
                      <div className="w-full relative" style={{ height: `${(trend.forecast / 600000) * 100}%` }}>
                        <div
                          className="absolute bottom-0 w-full bg-blue-200 rounded-t"
                          style={{ height: `${(trend.budget / trend.forecast) * 100}%` }}
                        />
                        <div
                          className="absolute bottom-0 w-full bg-green-600 rounded-t"
                          style={{ height: `${(trend.actual / trend.forecast) * 100}%` }}
                        />
                        {idx >= 3 && (
                          <div
                            className="absolute bottom-0 w-full bg-orange-500 rounded-t opacity-50"
                            style={{ height: '100%' }}
                          />
                        )}
                      </div>
                      <div className="mt-2 text-center">
                        <p className="text-xs font-medium text-gray-900">{trend.month.split(' ')[0]}</p>
                        <p className="text-xs text-gray-500">{formatCurrency(Math.max(trend.actual, trend.forecast))}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-center space-x-6 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-200 rounded"></div>
                  <span className="text-gray-600">Budget</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-600 rounded"></div>
                  <span className="text-gray-600">Actual</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-orange-500 rounded opacity-50"></div>
                  <span className="text-gray-600">Forecast</span>
                </div>
              </div>
            </div>

            {/* Industry Benchmarks */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Industry Benchmarks</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Your Cost/sq ft</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(analysis.benchmarks.costPerSqFt)}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Industry Average</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(analysis.benchmarks.industryAverage)}</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-900 mb-1">Performance Percentile</p>
                  <p className="text-2xl font-bold text-green-600">{analysis.benchmarks.performancePctl}th</p>
                  <p className="text-xs text-green-700 mt-1">Better than {analysis.benchmarks.performancePctl}% of projects</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CostOptimizationApp;
