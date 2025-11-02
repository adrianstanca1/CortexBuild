/**
 * Performance Monitor Component
 * Real-time performance monitoring
 */

import React from 'react';
import { Activity } from 'lucide-react';

interface PerformanceMonitorProps {
  user: any;
  company?: any;
  selectedWorkspace: any;
  onWorkspaceSelect: (workspace: any) => void;
  workspaces: any[];
  debugSessions: any[];
  analytics: any;
  refreshData: () => void;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = (props) => {
  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center mb-6">
        <Activity className="h-6 w-6 mr-3 text-green-500" />
        <div>
          <h2 className="text-xl font-semibold text-white">Performance Monitor</h2>
          <p className="text-sm text-gray-400">Real-time performance monitoring</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Performance Monitor Coming Soon</h3>
          <p className="text-gray-400 max-w-md">
            Real-time performance monitoring with metrics and alerting.
          </p>
        </div>
      </div>
    </div>
  );
};