/**
 * Enhanced Unified Dashboard
 * Universal dashboard component that adapts to user role with Base44Clone integration
 */

import React, { Suspense } from 'react';
import { User } from '../../types';
import { DesktopModeWrapper } from '../layout/DesktopModeWrapper';
import { UnifiedNavigation } from '../layout/UnifiedNavigation';

// Lazy load dashboards
const UnifiedAdminDashboard = React.lazy(() => import('./admin/UnifiedAdminDashboard'));
const CompanyAdminDashboardV2 = React.lazy(() => import('./company/CompanyAdminDashboardV2'));
const DeveloperWorkspaceScreen = React.lazy(() => import('./developer/DeveloperWorkspaceScreen'));
const SupervisorDashboard = React.lazy(() => import('./dashboards/SupervisorDashboard'));
const OperativeDashboard = React.lazy(() => import('./dashboards/OperativeDashboard'));
const Base44Clone = React.lazy(() => import('../base44/Base44Clone').then(module => ({
  default: module.Base44Clone
})));

interface EnhancedUnifiedDashboardProps {
  currentUser: User;
  navigateTo: (screen: string) => void;
  onLogout: () => void;
  isDarkMode?: boolean;
}

const LoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="text-center">
      <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-600">Loading dashboard...</p>
    </div>
  </div>
);

export const EnhancedUnifiedDashboard: React.FC<EnhancedUnifiedDashboardProps> = ({
  currentUser,
  navigateTo,
  onLogout,
  isDarkMode = false,
}) => {
  // Get the appropriate dashboard based on user role
  const getDashboardComponent = () => {
    switch (currentUser.role) {
      case 'super_admin':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <UnifiedAdminDashboard currentUser={currentUser} />
          </Suspense>
        );

      case 'company_admin':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <CompanyAdminDashboardV2
              currentUser={currentUser}
              navigateTo={navigateTo}
              isDarkMode={isDarkMode}
            />
          </Suspense>
        );

      case 'developer':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <DeveloperWorkspaceScreen
              currentUser={currentUser}
              navigateTo={navigateTo}
            />
          </Suspense>
        );

      case 'Foreman':
      case 'Safety Officer':
      case 'supervisor':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <SupervisorDashboard
              currentUser={currentUser}
              navigateTo={navigateTo}
              goBack={() => navigateTo('dashboard')}
            />
          </Suspense>
        );

      case 'operative':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <OperativeDashboard
              currentUser={currentUser}
              navigateTo={navigateTo}
              goBack={() => navigateTo('dashboard')}
            />
          </Suspense>
        );

      default:
        return (
          <Suspense fallback={<LoadingFallback />}>
            <CompanyAdminDashboardV2
              currentUser={currentUser}
              navigateTo={navigateTo}
              isDarkMode={isDarkMode}
            />
          </Suspense>
        );
    }
  };

  // Get Base44Clone desktop component
  const getDesktopComponent = () => {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <Base44Clone user={currentUser} onLogout={onLogout} />
      </Suspense>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Unified Navigation */}
      <UnifiedNavigation
        user={currentUser}
        currentScreen="dashboard"
        onNavigate={navigateTo}
        onLogout={onLogout}
        showDesktopToggle={true}
      />

      {/* Desktop Mode Wrapper with toggle */}
      <div className="flex-1 overflow-hidden">
        <DesktopModeWrapper
          user={currentUser}
          desktopComponent={getDesktopComponent()}
          standardComponent={getDashboardComponent()}
          initialMode="standard"
          onModeChange={(mode) => {
            console.log(`View mode changed to: ${mode}`);
          }}
        />
      </div>
    </div>
  );
};

export default EnhancedUnifiedDashboard;

