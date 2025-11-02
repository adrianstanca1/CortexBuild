// Real-time Project Health Dashboard with AI Insights
import React, { useState, useEffect } from 'react';
import { User, Project } from '../../types';

interface HealthMetric {
  id: string;
  name: string;
  value: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  description: string;
}

interface AIInsight {
  id: string;
  type: 'risk' | 'opportunity' | 'recommendation';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionRequired: boolean;
}

interface ProjectHealthDashboardProps {
  currentUser: User;
  project?: Project;
  navigateTo: (screen: string, params?: any) => void;
}

const ProjectHealthDashboard: React.FC<ProjectHealthDashboardProps> = ({
  currentUser,
  project,
  navigateTo
}) => {
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading health metrics and AI insights
    const loadHealthData = async () => {
      setIsLoading(true);
      
      // Mock health metrics
      const mockMetrics: HealthMetric[] = [
        {
          id: '1',
          name: 'Schedule Performance',
          value: 87,
          status: 'good',
          trend: 'up',
          description: 'Project is 87% on schedule with recent improvements'
        },
        {
          id: '2',
          name: 'Budget Health',
          value: 92,
          status: 'excellent',
          trend: 'stable',
          description: 'Budget utilization is optimal at 92%'
        },
        {
          id: '3',
          name: 'Safety Score',
          value: 78,
          status: 'warning',
          trend: 'down',
          description: 'Safety incidents have increased, attention needed'
        },
        {
          id: '4',
          name: 'Quality Index',
          value: 95,
          status: 'excellent',
          trend: 'up',
          description: 'Quality standards consistently exceeded'
        },
        {
          id: '5',
          name: 'Team Productivity',
          value: 83,
          status: 'good',
          trend: 'stable',
          description: 'Team performance is steady and reliable'
        }
      ];

      // Mock AI insights
      const mockInsights: AIInsight[] = [
        {
          id: '1',
          type: 'risk',
          title: 'Weather Impact Risk',
          description: 'Upcoming weather patterns may delay outdoor work by 2-3 days',
          priority: 'medium',
          actionRequired: true
        },
        {
          id: '2',
          type: 'opportunity',
          title: 'Resource Optimization',
          description: 'Current team efficiency allows for accelerating Phase 2 by 1 week',
          priority: 'high',
          actionRequired: false
        },
        {
          id: '3',
          type: 'recommendation',
          title: 'Safety Training',
          description: 'Schedule additional safety training to improve safety scores',
          priority: 'high',
          actionRequired: true
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHealthMetrics(mockMetrics);
      setAiInsights(mockInsights);
      setIsLoading(false);
    };

    loadHealthData();
  }, [project]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-green-500 bg-green-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Project Health Dashboard
        </h1>
        <div className="text-sm text-gray-500">
          {project ? `Project: ${project.name}` : 'All Projects'}
        </div>
      </div>

      {/* Health Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {healthMetrics.map(metric => (
          <div key={metric.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{metric.name}</h3>
              <span className="text-2xl">{getTrendIcon(metric.trend)}</span>
            </div>
            <div className="flex items-center mb-2">
              <span className="text-3xl font-bold text-gray-900">{metric.value}%</span>
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                {metric.status}
              </span>
            </div>
            <p className="text-sm text-gray-600">{metric.description}</p>
          </div>
        ))}
      </div>

      {/* AI Insights Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">🤖 AI Insights & Recommendations</h2>
        <div className="space-y-4">
          {aiInsights.map(insight => (
            <div key={insight.id} className={`border-l-4 p-4 rounded ${getPriorityColor(insight.priority)}`}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium text-gray-500 uppercase">{insight.type}</span>
                  {insight.actionRequired && (
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Action Required</span>
                  )}
                </div>
              </div>
              <p className="text-gray-700">{insight.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectHealthDashboard;
