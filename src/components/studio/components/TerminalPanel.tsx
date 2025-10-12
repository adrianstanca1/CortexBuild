/**
 * Terminal Panel Component
 * Integrated terminal for development
 */

import React from 'react';
import { Terminal, Command } from 'lucide-react';

interface TerminalPanelProps {
  user: any;
  company?: any;
  selectedProject: any;
  onProjectSelect: (project: any) => void;
  onProjectCreate: (project: any) => void;
  projects: any[];
  workspaces: any[];
  refreshData: () => void;
}

export const TerminalPanel: React.FC<TerminalPanelProps> = (props) => {
  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center mb-6">
        <Terminal className="h-6 w-6 mr-3 text-gray-600" />
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Terminal</h2>
          <p className="text-sm text-gray-600">Integrated development terminal</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Command className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Terminal Coming Soon</h3>
          <p className="text-gray-600 max-w-md">
            Integrated terminal with project-specific commands and development tools.
          </p>
        </div>
      </div>
    </div>
  );
};