import React from 'react';
import { User } from '../../types';

interface AIAgentsWidgetProps {
  currentUser: User;
  navigateTo: (screen: any) => void;
}

const AIAgentsWidget: React.FC<AIAgentsWidgetProps> = ({ currentUser, navigateTo }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">AI Agents</h3>
      <p className="text-gray-600">AI agent management coming soon...</p>
    </div>
  );
};

export default AIAgentsWidget;
