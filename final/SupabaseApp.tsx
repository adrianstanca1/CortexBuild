// 🚀 ASAgents-Ultimate with Complete Supabase Integration
// Main application with real authentication and database

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useUnifiedAuth } from './hooks/useUnifiedAuth';
import { isSupabaseConfigured } from './lib/supabase';

// Authentication Components
import RobustAuthFlow from './components/RobustAuthFlow';

// Dashboard Components
import SupabaseDashboard from './components/SupabaseDashboard';
import RealTimeTaskBoard from './components/RealTimeTaskBoard';
import RealTimeProjectDashboard from './components/RealTimeProjectDashboard';
import RealTimeNotifications from './components/RealTimeNotifications';

// Layout Components
import { AppLayout } from './components/layout/AppLayout';

// View Components
import Dashboard from './components/Dashboard';
import ProjectsView from './components/ProjectsView';
import TasksView from './components/TasksView';
import {
  TeamView, SafetyView, EquipmentView, SettingsView,
  TemplatesView, FinancialsView, TimesheetsView
} from './components/SimpleViews';

// Layout Component with Unified Authentication
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <AppLayout>{children}</AppLayout>;
};

// Main App Component
const SupabaseApp: React.FC = () => {
  const { user, loading, isAuthenticated, isDemoMode, error } = useUnifiedAuth();
  const [isConfigured] = useState(isSupabaseConfigured());

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading ASAgents-Ultimate...</p>
        </div>
      </div>
    );
  }

  // Show configuration status
  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-yellow-600 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Supabase Not Configured</h2>
          <p className="text-gray-600 mb-4">
            Supabase database is not configured. The app will run in demo mode with mock data.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show authentication flow if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <RobustAuthFlow />
        <Toaster position="top-right" />
      </>
    );
  }

  // Show main application
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<SupabaseDashboard />} />
          <Route path="/projects" element={<ProjectsView />} />
          <Route path="/tasks" element={<TasksView />} />
          <Route path="/team" element={<TeamView />} />
          <Route path="/safety" element={<SafetyView />} />
          <Route path="/equipment" element={<EquipmentView />} />
          <Route path="/financials" element={<FinancialsView />} />
          <Route path="/timesheets" element={<TimesheetsView />} />
          <Route path="/settings" element={<SettingsView />} />
          <Route path="/templates" element={<TemplatesView />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
      <Toaster position="top-right" />
    </Router>
  );
};

// App Wrapper with Error Boundary
const AppWrapper: React.FC = () => {
  return (
    <div className="App">
      <SupabaseApp />
    </div>
  );
};

export default AppWrapper;
