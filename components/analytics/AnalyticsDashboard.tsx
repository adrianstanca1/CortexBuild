/**
 * AnalyticsDashboard Component
 * Main analytics dashboard with metrics cards, charts, and event timeline
 */

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Clock, DollarSign, CheckCircle } from 'lucide-react';
import { MetricsCard } from './MetricsCard';
import { EventTimeline } from './EventTimeline';
import { analyticsService } from '../../lib/services/analyticsService';

export interface AnalyticsDashboardProps {
  projectId: string;
  isDarkMode?: boolean;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  projectId,
  isDarkMode = false
}) => {
  const [summary, setSummary] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'events'>('overview');

  useEffect(() => {
    loadSummary();
  }, [projectId]);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getProjectSummary(projectId);
      setSummary(data);
      setError(null);
    } catch (err) {
      console.error('Error loading summary:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
  const textClass = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const borderClass = isDarkMode ? 'border-gray-700' : 'border-gray-200';

  if (loading) {
    return (
      <div className={`${bgClass} rounded-lg p-8`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${bgClass} rounded-lg p-8`}>
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className={`${bgClass} rounded-lg p-6 space-y-6`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className={`w-8 h-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          <h2 className={`${textClass} text-2xl font-bold`}>
            Analytics Dashboard
          </h2>
        </div>
        <button
          type="button"
          onClick={loadSummary}
          className={`
            px-4 py-2 rounded-lg
            ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-100' : 'bg-white hover:bg-gray-100 text-gray-900'}
            border ${borderClass}
            transition-colors duration-200 font-medium
          `}
        >
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`
            px-4 py-2 font-medium transition-colors duration-200
            ${activeTab === 'overview'
              ? `${isDarkMode ? 'text-blue-400 border-b-2 border-blue-400' : 'text-blue-600 border-b-2 border-blue-600'}`
              : `${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'}`
            }
          `}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('events')}
          className={`
            px-4 py-2 font-medium transition-colors duration-200
            ${activeTab === 'events'
              ? `${isDarkMode ? 'text-blue-400 border-b-2 border-blue-400' : 'text-blue-600 border-b-2 border-blue-600'}`
              : `${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'}`
            }
          `}
        >
          Events
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && summary && (
        <div className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricsCard
              title="Tasks Completed"
              value={summary.tasksCompleted}
              icon={<CheckCircle className="w-6 h-6" />}
              trend={12}
              trendLabel="vs yesterday"
              isDarkMode={isDarkMode}
            />
            <MetricsCard
              title="Tasks Pending"
              value={summary.tasksPending}
              icon={<Clock className="w-6 h-6" />}
              trend={-5}
              trendLabel="vs yesterday"
              isDarkMode={isDarkMode}
            />
            <MetricsCard
              title="Tasks Overdue"
              value={summary.tasksOverdue}
              icon={<TrendingUp className="w-6 h-6" />}
              trend={0}
              trendLabel="vs yesterday"
              isDarkMode={isDarkMode}
            />
            <MetricsCard
              title="Project Progress"
              value={summary.progress}
              unit="%"
              icon={<BarChart3 className="w-6 h-6" />}
              trend={3}
              trendLabel="vs yesterday"
              isDarkMode={isDarkMode}
            />
            <MetricsCard
              title="Budget Spent"
              value={`$${summary.budgetSpent.toLocaleString()}`}
              icon={<DollarSign className="w-6 h-6" />}
              trend={8}
              trendLabel="vs yesterday"
              isDarkMode={isDarkMode}
            />
            <MetricsCard
              title="Team Members"
              value={summary.totalEvents}
              icon={<Users className="w-6 h-6" />}
              trend={0}
              trendLabel="vs yesterday"
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Summary Stats */}
          <div className={`
            ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
            rounded-lg border p-6
          `}>
            <h3 className={`${textClass} text-lg font-semibold mb-4`}>
              Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                  Budget Remaining
                </p>
                <p className={`${textClass} text-2xl font-bold mt-1`}>
                  ${summary.budgetRemaining.toLocaleString()}
                </p>
              </div>
              <div>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                  Total Events
                </p>
                <p className={`${textClass} text-2xl font-bold mt-1`}>
                  {summary.totalEvents}
                </p>
              </div>
              <div>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                  Completion Rate
                </p>
                <p className={`${textClass} text-2xl font-bold mt-1`}>
                  {summary.tasksCompleted + summary.tasksPending > 0
                    ? Math.round((summary.tasksCompleted / (summary.tasksCompleted + summary.tasksPending)) * 100)
                    : 0}%
                </p>
              </div>
              <div>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                  Overdue Tasks
                </p>
                <p className={`${textClass} text-2xl font-bold mt-1`}>
                  {summary.tasksOverdue}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <EventTimeline projectId={projectId} isDarkMode={isDarkMode} />
      )}
    </div>
  );
};

export default AnalyticsDashboard;

