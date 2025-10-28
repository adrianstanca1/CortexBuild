import React, { useState, useEffect } from 'react';
import { ShieldCheckIcon, ExclamationTriangleIcon, CheckCircleIcon, ClockIcon, CurrencyPoundIcon } from '../Icons';

interface RiskAssessmentAIAppProps {
  userId: string;
  companyId: string;
  projectId?: string;
}

interface RiskFactor {
  category: 'schedule' | 'budget' | 'quality' | 'safety' | 'compliance' | 'resources';
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number; // 0-1
  impact: number; // 0-1
  description: string;
  indicators: string[];
  mitigations: string[];
  trend: 'improving' | 'stable' | 'worsening';
}

interface RiskAssessment {
  overallRiskScore: number; // 0-100
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  riskFactors: RiskFactor[];
  predictions: {
    scheduleDelay: { days: number; confidence: number };
    budgetOverrun: { percentage: number; confidence: number };
    safetyIncidents: { probability: number; confidence: number };
  };
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    action: string;
    expectedImpact: string;
  }>;
  timeline: Array<{
    date: string;
    riskScore: number;
    events: string[];
  }>;
}

const RiskAssessmentAIApp: React.FC<RiskAssessmentAIAppProps> = ({
  userId,
  companyId,
  projectId
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [selectedProject, setSelectedProject] = useState(projectId || 'all');

  useEffect(() => {
    // Auto-analyze on mount
    analyzeRisks();
  }, [selectedProject]);

  const analyzeRisks = async () => {
    setIsAnalyzing(true);

    try {
      // Simulate AI analysis delay
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Mock ML-generated risk assessment
      const mockAssessment: RiskAssessment = {
        overallRiskScore: 67,
        riskLevel: 'moderate',
        riskFactors: [
          {
            category: 'schedule',
            title: 'Critical Path Delay Risk',
            severity: 'high',
            probability: 0.75,
            impact: 0.80,
            description: 'Foundation work is tracking 12 days behind schedule, creating cascade risk for subsequent trades',
            indicators: [
              'Weather delays: 8 days lost to rain',
              'Material delivery delays: 4 days',
              'Crew availability issues: 2 instances',
              'Critical path tasks at 68% completion vs 85% planned'
            ],
            mitigations: [
              'Add weekend crew for foundation completion',
              'Fast-track steel delivery approval',
              'Parallel framing prep work where possible',
              'Daily progress meetings with trade partners'
            ],
            trend: 'worsening'
          },
          {
            category: 'budget',
            title: 'Material Cost Escalation',
            severity: 'medium',
            probability: 0.60,
            impact: 0.65,
            description: 'Steel and lumber prices have increased 8% since project estimate, threatening budget overrun',
            indicators: [
              'Steel prices up 12% YoY',
              'Lumber futures trending upward',
              '15% of materials not yet purchased',
              'Current spend at 102% of forecast'
            ],
            mitigations: [
              'Lock in pricing for remaining materials now',
              'Value engineer non-critical specifications',
              'Negotiate bulk discounts with suppliers',
              'Review contingency allocation'
            ],
            trend: 'stable'
          },
          {
            category: 'safety',
            title: 'Fall Protection Compliance Gap',
            severity: 'high',
            probability: 0.45,
            impact: 0.95,
            description: 'Recent site inspection identified inadequate fall protection on upper floors',
            indicators: [
              'Last safety audit: 3 citations',
              'New workers lack fall protection training',
              'Guardrail installation incomplete',
              'Near-miss reported last week'
            ],
            mitigations: [
              'Immediate fall protection training for all workers',
              'Complete guardrail installation by Friday',
              'Daily toolbox talks on fall hazards',
              'Assign dedicated safety monitor for high work'
            ],
            trend: 'improving'
          },
          {
            category: 'quality',
            title: 'Concrete Quality Control Issues',
            severity: 'medium',
            probability: 0.40,
            impact: 0.60,
            description: 'Two recent concrete pours failed compressive strength tests',
            indicators: [
              'Cylinder test results: 2/5 failed',
              'Mix design verification pending',
              'Curing procedures not consistently followed',
              'Temperature monitoring gaps'
            ],
            mitigations: [
              'Re-test failed areas with cores',
              'Verify ready-mix supplier QC procedures',
              'Implement mandatory curing checklist',
              'Install temperature monitoring sensors'
            ],
            trend: 'stable'
          },
          {
            category: 'resources',
            title: 'Skilled Labor Shortage',
            severity: 'medium',
            probability: 0.55,
            impact: 0.50,
            description: 'Difficulty securing qualified electricians and HVAC technicians for upcoming phases',
            indicators: [
              'Current electrician crew at 60% required capacity',
              'HVAC subcontractor 3 weeks behind on other projects',
              'Local labor market tight for skilled trades',
              'Overtime costs increasing'
            ],
            mitigations: [
              'Pre-qualify additional electrical subcontractors',
              'Offer premium rates for qualified trades',
              'Adjust schedule to optimize crew utilization',
              'Cross-train existing workers where possible'
            ],
            trend: 'worsening'
          },
          {
            category: 'compliance',
            title: 'Building Permit Extension Required',
            severity: 'low',
            probability: 0.80,
            impact: 0.30,
            description: 'Current building permit expires in 45 days, extension application needed',
            indicators: [
              'Permit expiry date: Dec 10, 2024',
              'Project completion forecast: Feb 15, 2025',
              'Extension requires 30-day lead time',
              'No major compliance issues to date'
            ],
            mitigations: [
              'Submit permit extension this week',
              'Prepare supporting documentation',
              'Schedule pre-extension inspection',
              'Maintain compliance documentation current'
            ],
            trend: 'improving'
          }
        ],
        predictions: {
          scheduleDelay: { days: 15, confidence: 0.82 },
          budgetOverrun: { percentage: 8.3, confidence: 0.76 },
          safetyIncidents: { probability: 0.35, confidence: 0.68 }
        },
        recommendations: [
          {
            priority: 'high',
            action: 'Accelerate critical path activities',
            expectedImpact: 'Reduce schedule delay risk from 15 days to 7 days'
          },
          {
            priority: 'high',
            action: 'Complete fall protection compliance immediately',
            expectedImpact: 'Eliminate critical safety risk, avoid potential shutdown'
          },
          {
            priority: 'medium',
            action: 'Lock in material pricing for remaining purchases',
            expectedImpact: 'Cap budget overrun at current 8.3% level'
          },
          {
            priority: 'medium',
            action: 'Secure additional skilled labor resources',
            expectedImpact: 'Prevent future schedule delays and quality issues'
          },
          {
            priority: 'low',
            action: 'Submit building permit extension',
            expectedImpact: 'Maintain regulatory compliance, avoid work stoppage'
          }
        ],
        timeline: [
          { date: '2024-09-15', riskScore: 45, events: ['Project kickoff', 'Initial planning'] },
          { date: '2024-09-30', riskScore: 52, events: ['Weather delays begin', 'Material shortages identified'] },
          { date: '2024-10-15', riskScore: 61, events: ['Safety audit citations', 'Budget concerns raised'] },
          { date: '2024-10-26', riskScore: 67, events: ['Current assessment', 'Critical path delays accumulating'] },
          { date: '2024-11-10', riskScore: 72, events: ['Projected if no action taken'] },
          { date: '2024-11-25', riskScore: 78, events: ['High risk scenario'] }
        ]
      };

      setAssessment(mockAssessment);

    } catch (error) {
      console.error('Risk analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'moderate': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'schedule': return <ClockIcon className="w-5 h-5" />;
      case 'budget': return <CurrencyPoundIcon className="w-5 h-5" />;
      case 'safety': return <ShieldCheckIcon className="w-5 h-5" />;
      default: return <ExclamationTriangleIcon className="w-5 h-5" />;
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 75) return 'text-red-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ShieldCheckIcon className="w-8 h-8 text-orange-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Risk Assessment AI</h1>
              <p className="text-sm text-gray-500">Predictive analytics for project risk management</p>
            </div>
          </div>
          <button
            onClick={analyzeRisks}
            disabled={isAnalyzing}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isAnalyzing ? 'Analyzing...' : 'Refresh Analysis'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        {isAnalyzing && !assessment && (
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-gray-700 font-medium">Analyzing project risks with AI...</p>
              <p className="text-sm text-gray-500 mt-2">Evaluating schedule, budget, safety, quality, and resources</p>
            </div>
          </div>
        )}

        {assessment && (
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Overall Risk Score */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg shadow-sm border border-orange-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Overall Risk Score</h2>
                  <p className={`text-5xl font-bold ${getRiskScoreColor(assessment.overallRiskScore)}`}>
                    {assessment.overallRiskScore}/100
                  </p>
                  <p className={`text-sm font-medium mt-1 ${getRiskLevelColor(assessment.riskLevel)}`}>
                    {assessment.riskLevel.toUpperCase()} RISK
                  </p>
                </div>
                <div className="text-right">
                  <div className="bg-white rounded-lg p-4 shadow-sm mb-3">
                    <p className="text-xs text-gray-600 mb-1">Schedule Impact</p>
                    <p className="text-lg font-bold text-gray-900">+{assessment.predictions.scheduleDelay.days} days</p>
                    <p className="text-xs text-gray-500">{Math.round(assessment.predictions.scheduleDelay.confidence * 100)}% confidence</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-xs text-gray-600 mb-1">Budget Impact</p>
                    <p className="text-lg font-bold text-gray-900">+{assessment.predictions.budgetOverrun.percentage.toFixed(1)}%</p>
                    <p className="text-xs text-gray-500">{Math.round(assessment.predictions.budgetOverrun.confidence * 100)}% confidence</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Recommendations */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">AI-Generated Recommendations</h2>
              <div className="space-y-3">
                {assessment.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                      rec.priority === 'high' ? 'bg-red-600' :
                      rec.priority === 'medium' ? 'bg-yellow-600' :
                      'bg-green-600'
                    }`}>
                      <span className="text-white text-xs font-bold">{idx + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-medium text-gray-900">{rec.action}</p>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                          rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                          rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {rec.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">Expected impact: {rec.expectedImpact}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Factors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {assessment.riskFactors.map((risk, idx) => (
                <div key={idx} className={`bg-white rounded-lg shadow-sm border-2 p-6 ${
                  risk.severity === 'critical' ? 'border-red-200' :
                  risk.severity === 'high' ? 'border-orange-200' :
                  risk.severity === 'medium' ? 'border-yellow-200' :
                  'border-green-200'
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(risk.category)}
                      <h3 className="font-semibold text-gray-900">{risk.title}</h3>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded border ${getSeverityColor(risk.severity)}`}>
                      {risk.severity.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 mb-3">{risk.description}</p>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-gray-50 rounded p-2">
                      <p className="text-xs text-gray-600">Probability</p>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-orange-600 h-2 rounded-full"
                            style={{ width: `${risk.probability * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{Math.round(risk.probability * 100)}%</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded p-2">
                      <p className="text-xs text-gray-600">Impact</p>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-600 h-2 rounded-full"
                            style={{ width: `${risk.impact * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{Math.round(risk.impact * 100)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-700 mb-1">Risk Indicators:</p>
                    <ul className="space-y-1">
                      {risk.indicators.slice(0, 3).map((indicator, indIdx) => (
                        <li key={indIdx} className="text-xs text-gray-600 flex items-start">
                          <span className="mr-1">•</span>
                          <span>{indicator}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-blue-50 rounded p-3">
                    <p className="text-xs font-medium text-blue-900 mb-1">Mitigations:</p>
                    <ul className="space-y-1">
                      {risk.mitigations.slice(0, 2).map((mitigation, mitIdx) => (
                        <li key={mitIdx} className="text-xs text-blue-800 flex items-start">
                          <span className="mr-1">✓</span>
                          <span>{mitigation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-gray-500 uppercase">{risk.category}</span>
                    <span className={`font-medium ${
                      risk.trend === 'improving' ? 'text-green-600' :
                      risk.trend === 'worsening' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {risk.trend === 'improving' ? '↓ Improving' :
                       risk.trend === 'worsening' ? '↑ Worsening' :
                       '→ Stable'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Risk Timeline */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Risk Score Timeline</h2>
              <div className="relative">
                <div className="flex items-end justify-between space-x-2 h-48">
                  {assessment.timeline.map((point, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-gradient-to-t from-orange-600 to-red-600 rounded-t transition-all hover:opacity-80"
                        style={{ height: `${(point.riskScore / 100) * 100}%` }}
                      />
                      <div className="mt-2 text-center">
                        <p className="text-xs font-medium text-gray-900">{point.riskScore}</p>
                        <p className="text-xs text-gray-500">{new Date(point.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                <p>Current risk trajectory shows increasing trend. Implement recommended actions to reverse this trend.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskAssessmentAIApp;
