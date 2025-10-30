/**
 * Unified Navigation Component
 * Provides consistent navigation across all dashboards with desktop mode toggle
 */

import React, { useState } from 'react';
import { User } from '../../types';
import { 
  LayoutDashboard, 
  FolderOpen, 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  Command,
  Search,
  Bell,
  Grid,
  Menu,
  X
} from 'lucide-react';
import { featureFlags } from '../../lib/config/database';

interface UnifiedNavigationProps {
  user: User;
  currentScreen: string;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
  showDesktopToggle?: boolean;
}

export const UnifiedNavigation: React.FC<UnifiedNavigationProps> = ({
  user,
  currentScreen,
  onNavigate,
  onLogout,
  showDesktopToggle = true,
}) => {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'projects', label: 'Projects', icon: FolderOpen },
      { id: 'team', label: 'Team', icon: Users },
      { id: 'documents', label: 'Documents', icon: FileText },
    ];

    // Add role-specific items
    if (user.role === 'super_admin') {
      return [
        ...baseItems,
        { id: 'admin-panel', label: 'Admin Panel', icon: Settings },
        { id: 'marketplace', label: 'Marketplace', icon: Grid },
      ];
    }

    if (user.role === 'developer') {
      return [
        { id: 'developer-dashboard', label: 'Dev Dashboard', icon: LayoutDashboard },
        { id: 'sdk', label: 'SDK', icon: Grid },
        { id: 'workflows', label: 'Workflows', icon: FileText },
        { id: 'marketplace', label: 'Marketplace', icon: Grid },
      ];
    }

    return baseItems;
  };

  const navItems = getNavigationItems();

  const handleDesktopModeToggle = () => {
    onNavigate('base44-desktop');
  };

  const handleCommandPalette = () => {
    setIsCommandPaletteOpen(true);
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-500 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    CortexBuild
                  </h1>
                  <p className="text-xs text-gray-500">{user.role.replace('_', ' ')}</p>
                </div>
              </div>
            </div>

            {/* Center Section - Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-600 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Command Palette */}
              <button
                onClick={handleCommandPalette}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50"
                title="Command Palette (Cmd+K)"
              >
                <Search className="w-4 h-4" />
                <span className="hidden md:inline">Search...</span>
                <kbd className="hidden md:inline-block px-1.5 py-0.5 text-xs bg-gray-100 border border-gray-300 rounded">
                  ⌘K
                </kbd>
              </button>

              {/* Desktop Mode Toggle */}
              {showDesktopToggle && featureFlags.desktopMode && (
                <button
                  onClick={handleDesktopModeToggle}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  title="Desktop Mode"
                >
                  <Grid className="w-5 h-5" />
                </button>
              )}

              {/* Notifications */}
              <button
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Menu */}
              <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Command Palette Modal */}
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl mx-4">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for anything..."
                  className="flex-1 outline-none text-lg"
                  autoFocus
                />
                <button
                  onClick={() => setIsCommandPaletteOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-500">Start typing to search...</p>
            </div>
          </div>
        </div>
      )}

      {/* Global Keyboard Shortcuts */}
      {typeof window !== 'undefined' && (
        <div className="hidden">
          {/* Command+K for command palette */}
          <input
            type="text"
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                handleCommandPalette();
              }
            }}
          />
        </div>
      )}
    </>
  );
};


