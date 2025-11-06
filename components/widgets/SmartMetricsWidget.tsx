import React from 'react';
import { User } from '../../types';

interface SmartMetricsWidgetProps {
  currentUser: User;
}

const SmartMetricsWidget: React.FC<SmartMetricsWidgetProps> = ({ currentUser }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Smart Metrics</h3>
      <p className="text-gray-600">Advanced metrics coming soon...</p>
    </div>
  );
};

export default SmartMetricsWidget;
