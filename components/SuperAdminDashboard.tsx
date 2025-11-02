import React from 'react';
import { User } from '../types';

interface SuperAdminDashboardProps {
  user: User;
  onLogout: () => void;
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
      <p className="text-gray-600 mt-2">Full system administration and multi-tenant management.</p>
      {/* Placeholder content */}
    </div>
  );
};

export default SuperAdminDashboard;