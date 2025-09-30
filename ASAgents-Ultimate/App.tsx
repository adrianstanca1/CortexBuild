import React, { useState, Suspense, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ConnectivityMonitor } from './components/monitoring/ConnectivityMonitor';
import { EnhancedDashboard } from './components/dashboard/EnhancedDashboard';
import { connectivityService } from './services/connectivityService';

// Enhanced view types
type View = 'dashboard' | 'projects' | 'invoices' | 'team' | 'analytics' | 'tools' | 'settings';

// Loading component with enhanced UI
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-32">
    <div className="relative">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <div className="animate-pulse absolute inset-0 rounded-full border-2 border-blue-200"></div>
    </div>
  </div>
);

// Enhanced Navigation Component
const Navigation: React.FC<{ activeView: View; onViewChange: (view: View) => void }> = ({ 
  activeView, 
  onViewChange 
}) => {
  const navigationItems = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'projects', name: 'Projects', icon: '🏗️' },
    { id: 'invoices', name: 'Invoices', icon: '💰' },
    { id: 'team', name: 'Team', icon: '👥' },
    { id: 'analytics', name: 'Analytics', icon: '📈' },
    { id: 'tools', name: 'Tools', icon: '🛠️' },
    { id: 'settings', name: 'Settings', icon: '⚙️' }
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as View)}
              className={`flex items-center space-x-2 py-4 px-3 border-b-2 font-medium text-sm transition-colors ${
                activeView === item.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

// Main App Content with Enhanced Features
const AppContent: React.FC = () => {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [systemStatus, setSystemStatus] = useState('initializing');

  useEffect(() => {
    // Initialize connectivity monitoring
    connectivityService.initializeHealthChecks()
      .then(() => setSystemStatus('ready'))
      .catch(() => setSystemStatus('error'));
  }, []);

  // Show loading spinner while authentication is loading
  if (loading || systemStatus === 'initializing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Initializing ASAgents Platform...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
          <div className="text-center">
            <div className="text-4xl mb-4">🏗️</div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              ASAgents Ultimate
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Advanced Construction Management Platform
            </p>
          </div>
          
          <div className="space-y-4">
            <button className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
              Sign in with Google
            </button>
            <button className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
              Sign in with GitHub
            </button>
            <button className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
              Continue with Demo
            </button>
          </div>

          <div className="text-center text-xs text-gray-500">
            <p>Enterprise-grade security with OAuth2 integration</p>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced main application layout
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="text-2xl">🏗️</div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ASAgents Ultimate</h1>
                <p className="text-sm text-gray-500">Construction Management Platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, {user?.firstName || user?.email}
              </div>
              <button
                onClick={logout}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <Navigation activeView={activeView} onViewChange={setActiveView} />

      {/* Main Content */}
      <main className="py-8">
        <Suspense fallback={<LoadingSpinner />}>
          {activeView === 'dashboard' && <EnhancedDashboard />}
          {activeView === 'projects' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Projects</h2>
                <p className="text-gray-600">Enhanced project management interface coming soon...</p>
              </div>
            </div>
          )}
          {activeView === 'invoices' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Invoices</h2>
                <p className="text-gray-600">Advanced financial management interface coming soon...</p>
              </div>
            </div>
          )}
          {activeView === 'team' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Team</h2>
                <p className="text-gray-600">Team management and performance tracking coming soon...</p>
              </div>
            </div>
          )}
          {activeView === 'analytics' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Analytics</h2>
                <p className="text-gray-600">Advanced analytics and reporting coming soon...</p>
              </div>
            </div>
          )}
          {activeView === 'tools' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Tools</h2>
                <p className="text-gray-600">Construction tools and utilities coming soon...</p>
              </div>
            </div>
          )}
          {activeView === 'settings' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
                <p className="text-gray-600">System configuration and preferences coming soon...</p>
              </div>
            </div>
          )}
        </Suspense>
      </main>

      {/* Connectivity Monitor */}
      <ConnectivityMonitor />
    </div>
  );
};

// Main App Component with Enhanced Error Handling
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;