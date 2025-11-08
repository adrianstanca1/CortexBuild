import React from 'react';
import { User, UserRole } from '../../types';
import { CompanyAdminDashboard } from './CompanyAdminDashboard';
import GlobalMarketplace from '../marketplace/GlobalMarketplace';
import { SDKWorkspace } from './SDKWorkspace';
import {
  getAccessibleDashboards,
  getDashboardRoute,
  getDashboardInfo,
  DashboardType,
  isDevelopmentRole,
  isAdminRole
} from './config/dashboardAccessControl';

interface DashboardRouterProps {
  user: User;
  currentRoute: string;
  onNavigate: (route: string) => void;
  onScreenChange?: (screen: string) => void;
}

/**
 * Dashboard Router Component
 * Handles routing between different dashboard types with proper access control
 */
export const DashboardRouter: React.FC<DashboardRouterProps> = ({
  user,
  currentRoute,
  onNavigate,
  onScreenChange
}) => {
  const userRole = user.role as UserRole;
  const accessibleDashboards = getAccessibleDashboards(userRole);

  /**
   * Check if user can access the current dashboard
   */
  const canAccessCurrentDashboard = (): boolean => {
    // Map routes to dashboard types
    const routeToDashboardMap: Record<string, DashboardType> = {
      '/dashboard': 'project_management',
      '/company-admin-dashboard': 'company_admin',
      '/platform-admin': 'platform_admin',
      '/developer-console': 'developer_tools',
      '/sdk-developer': 'sdk_workspace',
      '/developer-dashboard': 'developer_dashboard',
      '/ai-agents-marketplace': 'ai_marketplace',
      '/automation-studio': 'automation_studio',
      '/marketplace': 'marketplace' // Added marketplace route
    };

    const dashboardType = routeToDashboardMap[currentRoute];
    if (!dashboardType) return true; // Allow access to unmapped routes

    return accessibleDashboards.includes(dashboardType);
  };

  /**
   * Get the appropriate dashboard component for the current route
   */
  const getDashboardComponent = () => {
    // Map routes to dashboard types and their components
    const routeComponentMap: Record<string, React.ComponentType<any>> = {
      '/company-admin-dashboard': CompanyAdminDashboard,
      '/sdk-developer': SDKWorkspace,
      '/marketplace': GlobalMarketplace, // Added marketplace component
    };

    const Component = routeComponentMap[currentRoute];
    if (Component) {
      return (
        <Component
          user={user}
          onNavigate={onNavigate}
        />
      );
    }

    return null;
  };

  /**
   * Handle access denied scenarios
   */
  if (!canAccessCurrentDashboard()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this dashboard. Please contact your administrator if you need access.
          </p>
          <button
            onClick={() => onNavigate('/dashboard')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const DashboardComponent = getDashboardComponent();

  if (DashboardComponent) {
    return DashboardComponent;
  }

  /**
   * Default fallback for unmapped routes
   */
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Not Found</h2>
        <p className="text-gray-600 mb-6">
          The requested dashboard is not available or is still under development.
        </p>
        <button
          onClick={() => onNavigate('/dashboard')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Main Dashboard
        </button>
      </div>
    </div>
  );
};

/**
 * Hook for dashboard routing logic
 */
export const useDashboardRouting = (user: User | null) => {
  const getDefaultRoute = (): string => {
    if (!user) return '/dashboard';

    const userRole = user.role as UserRole;
    const accessibleDashboards = getAccessibleDashboards(userRole);

    // Return the highest priority accessible dashboard
    if (accessibleDashboards.length > 0) {
      return getDashboardRoute(accessibleDashboards[0]);
    }

    return '/dashboard';
  };

  const getAvailableRoutes = (): Array<{ path: string; label: string; category: string }> => {
    if (!user) return [];

    const userRole = user.role as UserRole;
    const accessibleDashboards = getAccessibleDashboards(userRole);

    const routes = accessibleDashboards.map(dashboardType => {
      const dashboardInfo = getDashboardInfo(dashboardType);
      return {
        path: getDashboardRoute(dashboardType),
        label: dashboardInfo.name,
        category: dashboardInfo.category
      };
    });

    // Ensure Marketplace is always available if not already included by role
    if (!routes.some(r => r.path === '/marketplace')) {
      routes.push({
        path: '/marketplace',
        label: 'Marketplace',
        category: 'General'
      });
    }
    return routes;
  };

  const canAccessRoute = (route: string): boolean => {
    if (!user) return false;

    const userRole = user.role as UserRole;
    const accessibleDashboards = getAccessibleDashboards(userRole);

    // Map routes to dashboard types
    const routeToDashboardMap: Record<string, DashboardType> = {
      '/dashboard': 'project_management',
      '/company-admin-dashboard': 'company_admin',
      '/platform-admin': 'platform_admin',
      '/developer-console': 'developer_tools',
      '/sdk-developer': 'sdk_workspace',
      '/developer-dashboard': 'developer_dashboard',
      '/ai-agents-marketplace': 'ai_marketplace',
      '/automation-studio': 'automation_studio',
      '/marketplace': 'marketplace' // Added marketplace route
    };

    const dashboardType = routeToDashboardMap[route];
    if (!dashboardType) return true; // Allow access to unmapped routes

    return accessibleDashboards.includes(dashboardType);
  };

  return {
    getDefaultRoute,
    getAvailableRoutes,
    canAccessRoute
  };
};