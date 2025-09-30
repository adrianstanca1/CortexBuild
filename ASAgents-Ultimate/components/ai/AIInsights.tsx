import React, { useState, useEffect } from 'react';
import { geminiService } from '../../services/geminiService';
import { 
  LightBulbIcon, 
  ChartBarIcon, 
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon 
} from '@heroicons/react/24/outline';

interface AIInsightsProps {
  data: {
    projects?: any[];
    financials?: any;
    team?: any;
  };
}

export const AIInsights: React.FC<AIInsightsProps> = ({ data }) => {
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data.projects && data.financials && data.team) {
      generateInsights();
    }
  }, [data]);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const prompt = `
        Analyze this construction company data and provide actionable insights:
        
        Projects: ${JSON.stringify(data.projects?.slice(0, 5))}
        Financials: ${JSON.stringify(data.financials)}
        Team: ${JSON.stringify(data.team)}
        
        Please provide:
        1. 3 key performance insights
        2. 2 potential risks or concerns
        3. 2 opportunities for improvement
        4. 1 strategic recommendation
        
        Format as JSON with: { type, title, description, priority, action }
      `;

      const response = await geminiService.generateContent(prompt);
      
      // Parse AI response and extract insights
      const parsedInsights = parseAIResponse(response);
      setInsights(parsedInsights);
      
    } catch (error) {
      console.error('Error generating AI insights:', error);
      // Fallback to rule-based insights
      setInsights(generateFallbackInsights());
    } finally {
      setLoading(false);
    }
  };

  const parseAIResponse = (response: string) => {
    try {
      // Extract JSON from AI response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Error parsing AI response:', error);
    }
    return generateFallbackInsights();
  };

  const generateFallbackInsights = () => {
    const insights = [];

    // Performance insights
    if (data.projects) {
      const avgProgress = data.projects.reduce((sum, p) => sum + (p.progress || 0), 0) / data.projects.length;
      if (avgProgress > 80) {
        insights.push({
          type: 'performance',
          title: 'Strong Project Execution',
          description: `Average project completion at ${avgProgress.toFixed(1)}%`,
          priority: 'low',
          action: 'Continue current practices'
        });
      }
    }

    // Financial insights
    if (data.financials?.profitMargin) {
      if (data.financials.profitMargin < 10) {
        insights.push({
          type: 'risk',
          title: 'Low Profit Margins',
          description: `Current margin at ${data.financials.profitMargin.toFixed(1)}%`,
          priority: 'high',
          action: 'Review cost structure and pricing'
        });
      }
    }

    // Team insights
    if (data.team?.utilizationRate) {
      if (data.team.utilizationRate > 90) {
        insights.push({
          type: 'risk',
          title: 'High Team Utilization',
          description: `Team at ${data.team.utilizationRate.toFixed(1)}% capacity`,
          priority: 'medium',
          action: 'Consider hiring additional resources'
        });
      }
    }

    return insights;
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'performance': return ArrowTrendingUpIcon;
      case 'risk': return ExclamationTriangleIcon;
      case 'opportunity': return LightBulbIcon;
      default: return ChartBarIcon;
    }
  };

  const getInsightColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <LightBulbIcon className="h-5 w-5 mr-2" />
          AI Insights
        </h3>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <LightBulbIcon className="h-5 w-5 mr-2" />
          AI Insights
        </h3>
        <button
          onClick={generateInsights}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => {
          const Icon = getInsightIcon(insight.type);
          return (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getInsightColor(insight.priority)}`}
            >
              <div className="flex items-start space-x-3">
                <Icon className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">
                    {insight.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {insight.description}
                  </p>
                  {insight.action && (
                    <p className="text-xs text-gray-500 mt-2 italic">
                      Action: {insight.action}
                    </p>
                  )}
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  insight.priority === 'high' ? 'bg-red-100 text-red-800' :
                  insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {insight.priority}
                </span>
              </div>
            </div>
          );
        })}

        {insights.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <LightBulbIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No insights available yet.</p>
            <p className="text-sm">Data analysis in progress...</p>
          </div>
        )}
      </div>
    </div>
  );
};