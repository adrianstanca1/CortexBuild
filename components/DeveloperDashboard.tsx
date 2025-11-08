import React from 'react';
import { User } from '../types';

interface DeveloperDashboardProps {
  user: User;
  onLogout: () => void;
}

const DeveloperDashboard: React.FC<DeveloperDashboardProps> = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold text-gray-900">Developer Dashboard</h1>
      <p className="text-gray-600 mt-2">Developer tools and API management.</p>
      {/* Placeholder content */}
    </div>
  );
};

export default DeveloperDashboard;