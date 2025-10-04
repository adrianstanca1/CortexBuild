import React from 'react';
import { User, View } from '../../types';
import { Button } from '../ui/Button';

interface SidebarProps {
  user: User;
  activeView: View;
  setActiveView: (view: View) => void;
  onLogout: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  activeView,
  setActiveView,
  onLogout,
  isOpen,
  onToggle
}) => {
  const menuItems = [
    { view: 'dashboard' as View, label: 'Dashboard', icon: '🏠' },
    { view: 'projects' as View, label: 'Projects', icon: '🏗️' },
    { view: 'tasks' as View, label: 'Tasks', icon: '📋' },
    { view: 'team' as View, label: 'Team', icon: '👥' },
    { view: 'financials' as View, label: 'Financials', icon: '💰' },
    { view: 'ai-assistant' as View, label: 'AI Assistant', icon: '🤖' }
  ];

  return (
    <div className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-50 ${
      isOpen ? 'w-64' : 'w-16'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            AS
          </div>
          {isOpen && (
            <div>
              <h2 className="font-semibold text-gray-900">ASAgents</h2>
              <p className="text-xs text-gray-600">Construction Management</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6">
        {menuItems.map((item) => (
          <button
            key={item.view}
            onClick={() => setActiveView(item.view)}
            className={`w-full flex items-center px-4 py-3 text-left transition-colors ${
              activeView === item.view
                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            {isOpen && (
              <span className="ml-3 font-medium">{item.label}</span>
            )}
          </button>
        ))}
      </nav>

      {/* User Profile */}
      {isOpen && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user.email}
              </p>
            </div>
          </div>
          <Button
            onClick={onLogout}
            variant="ghost"
            size="sm"
            className="w-full justify-start"
          >
            🚪 Logout
          </Button>
        </div>
      )}
    </div>
  );
};