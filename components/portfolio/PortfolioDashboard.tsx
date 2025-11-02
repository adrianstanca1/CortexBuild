/**
 * Portfolio Dashboard
 * Multi-project overview with health indicators and resource allocation
 */

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Users, DollarSign, Calendar, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { projectsAPI } from '../../lib/api-client';
import { formatDistance } from 'date-fns';

interface PortfolioMetrics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  delayedProjects: number;
  totalBudget: number;
  spentBudget: number;
  revenueForecast: number;
  teamUtilization: number;
  averageHealth: 'excellent' | 'good' | 'fair' | 'poor';
}

interface ProjectSummary {
  id: string | number;
  name: string;
  status: string;
  health: 'excellent' | 'good' | 'fair' | 'poor';
  budget: number;
  spent: number;
  progress: number;
  endDate: string;
  riskLevel: 'high' | 'medium' | 'low';
}

const PortfolioDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    loadPortfolioData();
  }, []);

  const loadPortfolioData = async () => {
    try {
      setLoading(true);
      const response = await projectsAPI.getAll();
      const allProjects = response.data.data || [];
      
      // Calculate portfolio metrics
      const active = allProjects.filter(p => p.status === 'active').length;
      const completed = allProjects.filter(p => p.status === 'completed').length;
      const delayed = allProjects.filter(p => p.status === 'delayed').length;
      
      const totalBudget = allProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
      const spent = allProjects.reduce((sum, p) => sum + (p.actual_cost || 0), 0);
      
      const avgHealth = calculateAverageHealth(allProjects);
      
      setMetrics({
        totalProjects: allProjects.length,
        activeProjects: active,
        completedProjects: completed,
        delayedProjects: delayed,
        totalBudget,
        spentBudget: spent,
        revenueForecast: totalBudget * 0.9, // Simplified
        teamUtilization: 85, // Simplified
        averageHealth: avgHealth
      });

      // Project summaries
      const summaries: ProjectSummary[] = allProjects.map(p => ({
        id: p.id,
        name: p.name,
        status: p.status,
        health: calculateHealth(p),
        budget: p.budget || 0,
        spent: p.actual_cost || 0,
        progress: p.progress || 0,
        endDate: p.end_date || '',
        riskLevel: p.risk_level || 'medium'
      }));

      setProjects(summaries);
    } catch (error: any) {
      console.error('Failed to load portfolio data:', error);
      toast.error('Failed to load portfolio data');
    } finally {
      setLoading(false);
    }
  };

  const calculateHealth = (project: any): 'excellent' | 'good' | 'fair' | 'poor' => {
    const progress = project.progress || 0;
    const budget = project.budget || 0;
    const spent = project.actual_cost || 0;
    const budgetVariance = budget > 0 ? ((spent / budget) * 100) : 0;
    
    if (progress >= 80 && budgetVariance <= 90) return 'excellent';
    if (progress >= 60 && budgetVariance <= 100) return 'good';
    if (progress >= 40 && budgetVariance <= 110) return 'fair';
    return 'poor';
  };

  const calculateAverageHealth = (projects: any[]): 'excellent' | 'good' | 'fair' | 'poor' => {
    const healthScores = projects.map(p => {
      const h = calculateHealth(p);
      return h === 'excellent' ? 4 : h === 'good' ? 3 : h === 'fair' ? 2 : 1;
    });
    const avg = healthScores.reduce((a, b) => a + b, 0) / healthScores.length;
    
    if (avg >= 3.5) return 'excellent';
    if (avg >= 2.5) return 'good';
    if (avg >= 1.5) return 'fair';
    return 'poor';
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'bg-green-100 text-green-700 border-green-300';
      case 'good': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'fair': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'poor': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredProjects = timeframe === 'all' 
    ? projects 
    : projects.filter(p => p.status === timeframe);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No portfolio data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Projects</span>
            <BarChart3 className="w-5 h-5 text-gray-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{metrics.totalProjects}</div>
          <div className="flex items-center gap-2 text-sm mt-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-gray-600">{metrics.completedProjects} completed</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Active</span>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-blue-600">{metrics.activeProjects}</div>
          <div className="flex items-center gap-2 text-sm mt-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-gray-600">{metrics.delayedProjects} delayed</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Budget</span>
            <DollarSign className="w-5 h-5 text-gray-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            ${(metrics.totalBudget / 1000).toFixed(0)}k
          </div>
          <div className="flex items-center gap-2 text-sm mt-2">
            <TrendingDown className="w-4 h-4 text-red-600" />
            <span className="text-gray-600">
              ${(metrics.spentBudget / 1000).toFixed(0)}k spent
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Portfolio Health</span>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900 capitalize">
            {metrics.averageHealth}
          </div>
          <div className="flex items-center gap-2 text-sm mt-2">
            <span className="text-gray-600">85% team utilization</span>
          </div>
        </div>
      </div>

      {/* Portfolio Health */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Portfolio Health Overview</h3>
        <div className="grid grid-cols-4 gap-4">
          {['excellent', 'good', 'fair', 'poor'].map(health => {
            const count = projects.filter(p => p.health === health).length;
            return (
              <div key={health} className="text-center">
                <div className={`px-4 py-3 rounded-lg border ${getHealthColor(health)}`}>
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-xs font-medium capitalize mt-1">{health}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Projects */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Projects</h3>
            <div className="flex items-center gap-2">
              {['all', 'active', 'completed'].map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf as any)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    timeframe === tf
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tf.charAt(0).toUpperCase() + tf.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Project</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Health</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Budget</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Spent</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Progress</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">End Date</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProjects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{project.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium capitalize">
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium capitalize ${getHealthColor(project.health)}`}>
                      <CheckCircle className="w-3 h-3" />
                      {project.health}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">
                    ${(project.budget / 1000).toFixed(0)}k
                  </td>
                  <td className="px-6 py-4 text-right text-gray-600">
                    ${(project.spent / 1000).toFixed(0)}k
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            project.progress >= 80 ? 'bg-green-500' :
                            project.progress >= 60 ? 'bg-blue-500' :
                            project.progress >= 40 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600 w-12">{project.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(project.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center justify-center px-2 py-1 rounded text-xs font-medium capitalize ${getRiskColor(project.riskLevel)}`}>
                      {project.riskLevel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PortfolioDashboard;

