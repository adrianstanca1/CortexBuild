import { useMemo } from 'react';
import { User, UserRole } from '../types';
import {
  canAccessFeature,
  getAccessibleFeatures,
  isDevelopmentRole,
  isAdminRole,
  getAccessibleDashboards,
  DashboardType
} from '../components/dashboards/config/dashboardAccessControl';

/**
 * Custom hook for managing development tools and SDK access control
 * @param user The current user object
 * @returns Access control functions and state for development features
 */
export const useDevelopmentAccess = (user: User | null) => {
  const userRole = user?.role as UserRole;

  const accessControl = useMemo(() => {
    if (!user || !userRole) {
      return {
        hasAnyDevAccess: false,
        hasFullDevAccess: false,
        hasSDKAccess: false,
        hasAdminAccess: false,
        accessibleFeatures: [],
        accessibleDashboards: [],
        canAccessSDK: false,
        canAccessDeveloperTools: false,
        canAccessCompanyAdmin: false,
        canAccessPlatformAdmin: false
      };
    }

    const hasAnyDevAccess = isDevelopmentRole(userRole);
    const hasFullDevAccess = userRole === 'super_admin' || userRole === 'developer';
    const hasSDKAccess = userRole === 'super_admin' || userRole === 'developer';
    const hasAdminAccess = isAdminRole(userRole);

    const accessibleFeatures = getAccessibleFeatures(userRole);
    const accessibleDashboards = getAccessibleDashboards(userRole);

    // Specific feature access checks
    const canAccessSDK = canAccessFeature(userRole, 'ai_builder') ||
                        canAccessFeature(userRole, 'workflow_designer') ||
                        canAccessFeature(userRole, 'agent_orchestration');

    const canAccessDeveloperTools = canAccessFeature(userRole, 'code_generator') ||
                                   canAccessFeature(userRole, 'api_testing') ||
                                   canAccessFeature(userRole, 'debug_tools');

    const canAccessCompanyAdmin = accessibleDashboards.includes('company_admin');
    const canAccessPlatformAdmin = accessibleDashboards.includes('platform_admin');

    return {
      hasAnyDevAccess,
      hasFullDevAccess,
      hasSDKAccess,
      hasAdminAccess,
      accessibleFeatures,
      accessibleDashboards,
      canAccessSDK,
      canAccessDeveloperTools,
      canAccessCompanyAdmin,
      canAccessPlatformAdmin
    };
  }, [user, userRole]);

  /**
   * Check if user can access a specific development feature
   */
  const canAccessDevFeature = (feature: string): boolean => {
    if (!userRole) return false;
    return canAccessFeature(userRole, feature);
  };

  /**
   * Check if user can access a specific dashboard
   */
  const canAccessDashboard = (dashboardType: DashboardType): boolean => {
    if (!userRole) return false;
    const accessibleDashboards = getAccessibleDashboards(userRole);
    return accessibleDashboards.includes(dashboardType);
  };

  /**
   * Get development mode status for the user
   */
  const getDevelopmentMode = () => {
    if (!userRole) return 'none';

    if (userRole === 'super_admin') return 'full';
    if (userRole === 'developer') return 'sdk';
    if (userRole === 'company_admin') return 'limited';

    return 'none';
  };

  /**
   * Check if user needs to upgrade for certain features
   */
  const requiresUpgrade = (feature: string): boolean => {
    if (!userRole || accessControl.hasFullDevAccess) return false;

    // Define features that require specific roles
    const upgradeRequiredFeatures: Record<string, UserRole[]> = {
      'ai_builder': ['super_admin', 'developer'],
      'workflow_designer': ['super_admin', 'developer'],
      'agent_orchestration': ['super_admin', 'developer'],
      'platform_analytics': ['super_admin'],
      'user_audit': ['super_admin'],
      'system_settings': ['super_admin']
    };

    const requiredRoles = upgradeRequiredFeatures[feature];
    if (!requiredRoles) return false;

    return !requiredRoles.includes(userRole);
  };

  /**
   * Get upgrade message for restricted features
   */
  const getUpgradeMessage = (feature: string): string => {
    if (!userRole) return 'Login required';

    const featureNames: Record<string, string> = {
      'ai_builder': 'AI Code Builder',
      'workflow_designer': 'Workflow Designer',
      'agent_orchestration': 'Agent Orchestration',
      'platform_analytics': 'Platform Analytics',
      'user_audit': 'User Audit Logs',
      'system_settings': 'System Settings'
    };

    const featureName = featureNames[feature] || feature;

    if (userRole === 'company_admin') {
      return `${featureName} requires Developer or Super Admin access. Contact your administrator for access.`;
    }

    return `${featureName} requires a Developer subscription. Upgrade your plan to access this feature.`;
  };

  return {
    ...accessControl,
    canAccessDevFeature,
    canAccessDashboard,
    getDevelopmentMode,
    requiresUpgrade,
    getUpgradeMessage,
    userRole
  };
};