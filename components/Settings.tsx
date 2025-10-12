import React from 'react';
import { User } from '../types';

interface SettingsProps {
  user: User;
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      <p className="text-gray-600 mt-2">Manage your account settings and preferences.</p>
      {/* Placeholder content */}
    </div>
  );
};

export default Settings;