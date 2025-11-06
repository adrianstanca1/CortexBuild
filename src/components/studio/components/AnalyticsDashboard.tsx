/**
 * Analytics Dashboard Component
 * Performance monitoring and analytics
 */

import React from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';

interface AnalyticsDashboardProps {
  user: any;
  company?: any;
  selectedProject: any;
  onProjectSelect: (project: any) => void;
  onProjectCreate: (project: any) => void;
  projects: any[];
  workspaces: any[];
  refreshData: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = (props) => {
  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center mb-6">
        <BarChart3 className="h-6 w-6 mr-3 text-purple-600" />
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Analytics Dashboard</h2>
          <p className="text-sm text-gray-600">Performance monitoring and insights</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard Coming Soon</h3>
          <p className="text-gray-600 max-w-md">
            Comprehensive analytics and performance monitoring for your projects.
          </p>
        </div>
      </div>
    </div>
  );
};