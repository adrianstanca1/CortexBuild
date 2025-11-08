import React from 'react';
import { User } from '../types';

interface ClientManagementProps {
  user: User;
  onLogout: () => void;
}

const ClientManagement: React.FC<ClientManagementProps> = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
      <p className="text-gray-600 mt-2">Manage your clients and relationships.</p>
      {/* Placeholder content */}
    </div>
  );
};

export default ClientManagement;