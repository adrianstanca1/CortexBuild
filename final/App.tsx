import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { Card } from './components/ui/Card';
import { Sidebar as SidebarLite } from './components/layout/SidebarLite';
import { ToolsView } from './components/ToolsView';
import FieldManagementDashboard from './components/FieldManagementDashboard';
import DocumentManagementDashboard from './components/DocumentManagementDashboard';
import ProjectAnalyticsDashboard from './components/ProjectAnalyticsDashboard';
import AdvancedReportingDashboard from './components/AdvancedReportingDashboard';
import CollaborationDashboard from './components/CollaborationDashboard';
import QualityControlDashboard from './components/QualityControlDashboard';
import SafetyDashboard from './components/SafetyDashboard';
import EquipmentDashboard from './components/EquipmentDashboard';
import UserManagementDashboard from './components/UserManagementDashboard';
import SettingsDashboard from './components/SettingsDashboard';
import TemplatesDashboard from './components/TemplatesDashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import type { View } from './types';

const AppInner: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset'>('login');
  const [activeView, setActiveView] = useState<View>('tools');
  const addToast = (message: string, type: 'success' | 'error') => {
    if (type === 'error') console.error(message);
    else console.log(message);
  };

  // Show loading state while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated: render login/registration flows
  if (!user) {
    if (mode === 'register') {
      return (
        <div className="min-h-screen grid place-items-center p-6">
          <div className="w-full max-w-lg">
            <Card className="p-6">
              <h2 className="text-lg font-semibold">Registration temporarily unavailable</h2>
              <p className="text-sm text-muted-foreground mt-1">Please contact support or use an existing account.</p>
              <div className="mt-4">
                <button type="button" className="text-primary hover:underline" onClick={() => setMode('login')}>Back to login</button>
              </div>
            </Card>
          </div>
        </div>
      );
    }

    try {
      return (
        <div className="min-h-screen grid place-items-center p-6">
          <div className="w-full max-w-md">
            <Card className="mb-6">
              <div className="p-4">
                <h1 className="text-xl font-bold">AS Agents CMS</h1>
                <p className="text-sm text-muted-foreground mt-1">Sign in to continue</p>
              </div>
            </Card>
            <Login
              onSwitchToRegister={() => setMode('register')}
              onSwitchToForgotPassword={() => setMode('forgot')}
            />
          </div>
        </div>
      );
    } catch (error) {
      console.error('Login component error:', error);
      return (
        <div className="min-h-screen grid place-items-center p-6">
          <Card className="p-6 border-destructive">
            <h2 className="text-lg font-semibold text-destructive">Login Error</h2>
            <p className="text-sm text-muted-foreground mt-1">There was an error loading the login form.</p>
            <button
              type="button"
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
          </Card>
        </div>
      );
    }
  }

  // Authenticated: render app shell with sidebar and main content
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6 text-primary" aria-hidden>
            <path fill="currentColor" d="M12 2l9.196 5.31a1 1 0 01.5.866v10.648a1 1 0 01-.5.866L12 24l-9.196-4.31a1 1 0 01-.5.866V8.176a1 1 0 01.5-.866L12 2z" opacity={0.12} />
            <path fill="currentColor" d="M12 4.5l-6.5 3.752v7.496L12 19.5l6.5-3.752V8.252L12 4.5zm0 1.732l5 2.886v5.764l-5 2.886-5-2.886V9.118l5-2.886z" />
          </svg>
          <h1 className="text-lg font-semibold">AS Agents</h1>
        </div>
        <button type="button" onClick={logout} className="text-sm text-red-600 hover:underline">Logout</button>
      </div>

      <div className="flex flex-1 min-h-0">
        <SidebarLite
          user={user}
          activeView={activeView}
          setActiveView={setActiveView}
          onLogout={logout}
          pendingTimesheetCount={0}
          openIncidentCount={0}
          unreadMessageCount={0}
          companyName={undefined}
        />
        <main className="flex-1 p-4 overflow-auto">
          {activeView === 'tools' ? (
            <ToolsView user={user} addToast={addToast} setActiveView={setActiveView} />
          ) : activeView === 'field' ? (
            <FieldManagementDashboard
              projectId="demo-project-1"
              userId={user.id}
              isOnline={navigator.onLine}
            />
          ) : activeView === 'document-management' ? (
            <DocumentManagementDashboard
              projectId="demo-project-1"
              userId={user.id}
            />
          ) : activeView === 'project-analytics' ? (
            <ProjectAnalyticsDashboard
              projectId="demo-project-1"
              userId={user.id}
            />
          ) : activeView === 'advanced-reporting' ? (
            <AdvancedReportingDashboard
              projectId="demo-project-1"
              userId={user.id}
            />
          ) : activeView === 'collaboration' ? (
            <CollaborationDashboard
              projectId="demo-project-1"
              userId={user.id}
            />
          ) : activeView === 'quality-control' ? (
            <QualityControlDashboard
              projectId="demo-project-1"
              userId={user.id}
            />
          ) : activeView === 'safety-dashboard' ? (
            <SafetyDashboard
              projectId="demo-project-1"
              userId={user.id}
            />
          ) : activeView === 'equipment-dashboard' ? (
            <EquipmentDashboard
              projectId="demo-project-1"
              userId={user.id}
            />
          ) : activeView === 'user-management' ? (
            <UserManagementDashboard
              projectId="demo-project-1"
              userId={user.id}
            />
          ) : activeView === 'settings-dashboard' ? (
            <SettingsDashboard
              projectId="demo-project-1"
              userId={user.id}
            />
          ) : activeView === 'templates-dashboard' ? (
            <TemplatesDashboard
              projectId="demo-project-1"
              userId={user.id}
            />
          ) : (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground">Coming soon</h2>
              <p className="text-sm text-muted-foreground mt-1">The "{activeView}" view will be restored next.</p>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => (
  <ErrorBoundary>
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  </ErrorBoundary>
);

export default App;

