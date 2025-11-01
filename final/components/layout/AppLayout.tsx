// 🏗️ Main Application Layout Component
// Complete layout with sidebar, header, and routing

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Building2, Home, FolderOpen, CheckSquare, Users, 
  DollarSign, Clock, Settings, Menu, X, Bell, Search,
  Command, LogOut, User
} from 'lucide-react';
import { useUnifiedAuth } from '../../hooks/useUnifiedAuth';
import toast from 'react-hot-toast';

interface AppLayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, signOut } = useUnifiedAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home className="h-5 w-5" />, path: '/dashboard' },
    { id: 'projects', label: 'Projects', icon: <FolderOpen className="h-5 w-5" />, path: '/projects' },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare className="h-5 w-5" />, path: '/tasks' },
    { id: 'team', label: 'Team', icon: <Users className="h-5 w-5" />, path: '/team' },
    { id: 'safety', label: 'Safety', icon: <Building2 className="h-5 w-5" />, path: '/safety' },
    { id: 'equipment', label: 'Equipment', icon: <Building2 className="h-5 w-5" />, path: '/equipment' },
    { id: 'financials', label: 'Financials', icon: <DollarSign className="h-5 w-5" />, path: '/financials' },
    { id: 'timesheets', label: 'Timesheets', icon: <Clock className="h-5 w-5" />, path: '/timesheets' },
    { id: 'settings', label: 'Settings', icon: <Settings className="h-5 w-5" />, path: '/settings' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  const getUserDisplayName = () => {
    if (!user) return 'User';
    
    if (user.name) return user.name;
    if (user.email) return user.email.split('@')[0];
    return 'User';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:inset-0`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">ASAgents</h1>
              <p className="text-xs text-gray-500">Construction Management</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActiveRoute(item.path)
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {getUserDisplayName()}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-6">
          {/* Left side - Menu button for mobile */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            {/* Page Title */}
            <h2 className="text-lg font-semibold text-gray-900 capitalize">
              {location.pathname.replace('/', '') || 'Dashboard'}
            </h2>
          </div>

          {/* Right side - Actions and user menu */}
          <div className="flex items-center space-x-4">
            {/* Search Button */}
            <button className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100">
              <Search className="h-5 w-5" />
            </button>

            {/* Command Palette */}
            <button className="hidden md:flex items-center space-x-1 px-3 py-1.5 text-xs text-gray-500 bg-gray-100 rounded-md hover:bg-gray-200">
              <Command className="h-3 w-3" />
              <span>K</span>
            </button>

            {/* Notifications */}
            <button className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400"></span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-md text-gray-700 hover:bg-gray-100"
              >
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
                <span className="hidden md:block text-sm font-medium">
                  {getUserDisplayName()}
                </span>
              </button>

              {/* User Dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      handleNavigation('/settings');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>

      {/* Sidebar Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};
