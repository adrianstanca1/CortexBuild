/**
 * Collaboration Hub Component
 * Real-time collaboration features
 */

import React from 'react';
import { Users, MessageCircle } from 'lucide-react';

interface CollaborationHubProps {
  user: any;
  company?: any;
  selectedProject: any;
  onProjectSelect: (project: any) => void;
  onProjectCreate: (project: any) => void;
  projects: any[];
  workspaces: any[];
  refreshData: () => void;
}

export const CollaborationHub: React.FC<CollaborationHubProps> = (props) => {
  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center mb-6">
        <Users className="h-6 w-6 mr-3 text-green-600" />
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Collaboration Hub</h2>
          <p className="text-sm text-gray-600">Real-time collaboration and communication</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Collaboration Hub Coming Soon</h3>
          <p className="text-gray-600 max-w-md">
            Real-time collaboration with live cursors, code comments, and team chat.
          </p>
        </div>
      </div>
    </div>
  );
};