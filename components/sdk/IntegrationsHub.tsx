import React from 'react';
import { Puzzle } from 'lucide-react';

export const IntegrationsHub: React.FC<{ subscriptionTier: string }> = ({ subscriptionTier }) => {
  return (
    <div className="bg-white rounded-lg shadow p-12 text-center">
      <Puzzle className="w-16 h-16 mx-auto mb-4 text-green-600" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Integrations Hub</h2>
      <p className="text-gray-600 mb-4">
        Connect to QuickBooks, Slack, Google Drive, and more - Coming Soon
      </p>
      <p className="text-sm text-gray-500">
        AI-powered data mapping and cross-platform automation
      </p>
    </div>
  );
};
