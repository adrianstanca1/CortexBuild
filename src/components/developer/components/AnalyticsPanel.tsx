/**
 * Analytics Panel Component
 * Performance and usage analytics
 */

import React from 'react';
import { BarChart3 } from 'lucide-react';

interface AnalyticsPanelProps {
  user: any;
  company?: any;
  selectedWorkspace: any;
  onWorkspaceSelect: (workspace: any) => void;
  workspaces: any[];
  debugSessions: any[];
  analytics: any;
  refreshData: () => void;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = (props) => {
  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center mb-6">
        <BarChart3 className="h-6 w-6 mr-3 text-blue-500" />
        <div>
          <h2 className="text-xl font-semibold text-white">Analytics Panel</h2>
          <p className="text-sm text-gray-400">Performance and usage analytics</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Analytics Panel Coming Soon</h3>
          <p className="text-gray-400 max-w-md">
            Comprehensive analytics and performance monitoring for your workspaces.
          </p>
        </div>
      </div>
    </div>
  );
};