import React from 'react';
import { User } from '../types';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      <p className="text-gray-600 mt-2">Administrative controls and system management.</p>
      {/* Placeholder content */}
    </div>
  );
};

export default AdminDashboard;