import React from 'react';

interface RiskData {
  averageRiskScore: number;
  highPriorityCount: number;
  risks: Array<{
    id: string;
    title: string;
    description: string;
    severity: number;
    priority: string;
    category: string;
  }>;
}

interface RiskAssessmentProps {
  risks: RiskData | null;
  detailed?: boolean;
}

export const RiskAssessment: React.FC<RiskAssessmentProps> = ({ 
  risks, 
  detailed = false 
}) => {
  if (!risks) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Risk Assessment</h3>
        <div className="text-center py-8 text-gray-500">
          <p>No risk data available</p>
        </div>
      </div>
    );
  }

  const getRiskColor = (severity: number) => {
    if (severity >= 7) return 'bg-red-100 text-red-800 border-red-200';
    if (severity >= 4) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getRiskLevel = (score: number) => {
    if (score >= 7) return 'High';
    if (score >= 4) return 'Medium';
    return 'Low';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Risk Assessment</h3>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(risks.averageRiskScore)}`}>
          {getRiskLevel(risks.averageRiskScore)} Risk
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-50 rounded">
          <p className="text-xl font-bold text-gray-900">
            {risks.averageRiskScore.toFixed(1)}
          </p>
          <p className="text-xs text-gray-600">Average Risk Score</p>
        </div>
        <div className="text-center p-3 bg-red-50 rounded">
          <p className="text-xl font-bold text-red-600">
            {risks.highPriorityCount}
          </p>
          <p className="text-xs text-gray-600">High Priority Risks</p>
        </div>
      </div>

      {detailed && risks.risks && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Active Risks</h4>
          {risks.risks.slice(0, 5).map((risk) => (
            <div key={risk.id} className={`p-3 border rounded ${getRiskColor(risk.severity)}`}>
              <div className="flex items-center justify-between mb-1">
                <h5 className="text-sm font-medium">{risk.title}</h5>
                <span className="text-xs font-medium">{risk.severity}/10</span>
              </div>
              <p className="text-xs opacity-80">{risk.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};