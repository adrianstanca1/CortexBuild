import React from 'react';
import { User } from '../../types';

interface SmartInsightsWidgetProps {
  currentUser: User;
}

const SmartInsightsWidget: React.FC<SmartInsightsWidgetProps> = ({ currentUser }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Smart Insights</h3>
      <p className="text-gray-600">AI-powered insights coming soon...</p>
    </div>
  );
};

export default SmartInsightsWidget;
