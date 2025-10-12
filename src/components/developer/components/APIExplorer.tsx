/**
 * API Explorer Component
 * API testing and exploration
 */

import React from 'react';
import { Globe } from 'lucide-react';

interface APIExplorerProps {
  user: any;
  company?: any;
  selectedWorkspace: any;
  onWorkspaceSelect: (workspace: any) => void;
  workspaces: any[];
  debugSessions: any[];
  analytics: any;
  refreshData: () => void;
}

export const APIExplorer: React.FC<APIExplorerProps> = (props) => {
  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center mb-6">
        <Globe className="h-6 w-6 mr-3 text-blue-500" />
        <div>
          <h2 className="text-xl font-semibold text-white">API Explorer</h2>
          <p className="text-sm text-gray-400">API testing and exploration</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Globe className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">API Explorer Coming Soon</h3>
          <p className="text-gray-400 max-w-md">
            Interactive API testing and documentation explorer.
          </p>
        </div>
      </div>
    </div>
  );
};