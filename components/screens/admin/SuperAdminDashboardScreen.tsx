import React from 'react';
import { User } from '../../../types';
import { LogOut } from 'lucide-react';
import EnhancedSuperAdminDashboard from '../../base44/pages/EnhancedSuperAdminDashboard';

interface SuperAdminDashboardScreenProps {
  currentUser?: User;
  onLogout?: () => void;
}

const SuperAdminDashboardScreen: React.FC<SuperAdminDashboardScreenProps> = ({ currentUser, onLogout }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar with Logout */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">CB</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">CortexBuild Super Admin</h1>
                <p className="text-xs text-gray-500">Platform Administration</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {currentUser && (
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                  <p className="text-xs text-gray-500">{currentUser.email}</p>
                </div>
              )}
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <EnhancedSuperAdminDashboard />
    </div>
  );
};

export default SuperAdminDashboardScreen;
