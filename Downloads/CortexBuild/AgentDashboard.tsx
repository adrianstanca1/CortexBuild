import React from 'react';
import { Bot } from 'lucide-react';

export const AgentDashboard: React.FC<{ subscriptionTier: string }> = ({ subscriptionTier }) => {
  return (
    <div className="bg-white rounded-lg shadow p-12 text-center">
      <Bot className="w-16 h-16 mx-auto mb-4 text-purple-600" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Agents Dashboard</h2>
      <p className="text-gray-600 mb-4">
        Manage autonomous AI agents for invoice processing, monitoring, and more - Coming Soon
      </p>
      <p className="text-sm text-gray-500">
        AI agents will automate complex multi-step tasks
      </p>
    </div>
  );
};
