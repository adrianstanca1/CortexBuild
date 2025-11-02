import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  CodeBracketIcon,
  RectangleStackIcon,
  ShoppingBagIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import {
  getNavigationGroupsForUser,
  getAccessibleDashboards,
  getDashboardInfo,
  getNavigationGroupInfo,
  DashboardType,
  NavigationGroup
} from '../dashboards/config/dashboardAccessControl';

interface RoleBasedNavigationProps {
  user: User;
  currentPath: string;
  onNavigate: (path: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavigationItemProps {
  dashboard: DashboardType;
  isActive: boolean;
  onClick: () => void;
  level?: number;
}

interface NavigationGroupProps {
  group: NavigationGroup;
  userRole: UserRole;
  currentPath: string;
  onNavigate: (path: string) => void;
  level?: number;
}

const NavigationItem: React.FC<NavigationItemProps> = ({
  dashboard,
  isActive,
  onClick,
  level = 0
}) => {
  const dashboardInfo = getDashboardInfo(dashboard);
  const IconComponent = getIconComponent(dashboardInfo.icon);

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
        isActive
          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
          : 'text-gray-700 hover:bg-gray-50'
      } ${level > 0 ? 'ml-4' : ''}`}
    >
      {IconComponent && <IconComponent className="w-5 h-5" />}
      <span className="flex-1 text-left">{dashboardInfo.name}</span>
      {dashboardInfo.category === 'development' && (
        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
          DEV
        </span>
      )}
    </button>
  );
};

const NavigationGroupComponent: React.FC<NavigationGroupProps> = ({
  group,
  userRole,
  currentPath,
  onNavigate,
  level = 0
}) => {
  const [isExpanded, setIsExpanded] = useState(!group.defaultCollapsed);

  const toggleExpanded = () => {
    if (group.collapsible) {
      setIsExpanded(!isExpanded);
    }
  };

  const getGroupIcon = (groupId: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      projects: BuildingOfficeIcon,
      administration: ShieldCheckIcon,
      development: CodeBracketIcon,
      marketplace: ShoppingBagIcon
    };
    return iconMap[groupId] || BuildingOfficeIcon;
  };

  const GroupIcon = getGroupIcon(group.id);

  return (
    <div className={`${level > 0 ? 'ml-4' : ''}`}>
      <button
        onClick={toggleExpanded}
        className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
          group.collapsible
            ? 'text-gray-900 hover:bg-gray-50'
            : 'text-gray-700'
        }`}
      >
        <GroupIcon className="w-5 h-5" />
        <span className="flex-1 text-left">{group.name}</span>
        {group.collapsible && (
          isExpanded ?
            <ChevronDownIcon className="w-4 h-4" /> :
            <ChevronRightIcon className="w-4 h-4" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-1 space-y-1">
          {group.dashboards.map(dashboardId => {
            const dashboardInfo = getDashboardInfo(dashboardId);
            const isActive = currentPath === getDashboardRoute(dashboardId);

            return (
              <NavigationItem
                key={dashboardId}
                dashboard={dashboardId}
                isActive={isActive}
                onClick={() => onNavigate(getDashboardRoute(dashboardId))}
                level={level + 1}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

// Helper function to get icon component from string
const getIconComponent = (iconName: string): React.ComponentType<any> | null => {
  const iconMap: Record<string, React.ComponentType<any>> = {
    BuildingOfficeIcon,
    UserGroupIcon,
    ChartBarIcon,
    CogIcon,
    CodeBracketIcon,
    RectangleStackIcon,
    ShoppingBagIcon,
    ArrowPathIcon,
    ShieldCheckIcon,
    DocumentTextIcon
  };

  return iconMap[iconName] || null;
};

// Helper function to get dashboard route
const getDashboardRoute = (dashboardType: DashboardType): string => {
  const routeMap: Record<DashboardType, string> = {
    project_management: '/dashboard',
    company_admin: '/company-admin-dashboard',
    platform_admin: '/platform-admin',
    developer_tools: '/developer-console',
    sdk_workspace: '/sdk-developer',
    developer_dashboard: '/developer-dashboard',
    ai_marketplace: '/ai-agents-marketplace',
    automation_studio: '/automation-studio'
  };

  return routeMap[dashboardType] || '/dashboard';
};

export const RoleBasedNavigation: React.FC<RoleBasedNavigationProps> = ({
  user,
  currentPath,
  onNavigate,
  collapsed = false,
  onToggleCollapse
}) => {
  const userRole = user.role as UserRole;
  const navigationGroups = getNavigationGroupsForUser(userRole);

  const getRoleDisplayInfo = (role: UserRole) => {
    const roleDisplayMap: Record<UserRole, { name: string; description: string }> = {
      super_admin: {
        name: 'Super Administrator',
        description: 'Full platform access'
      },
      company_admin: {
        name: 'Company Administrator',
        description: 'Company management'
      },
      developer: {
        name: 'SDK Developer',
        description: 'Development tools access'
      },
      'Project Manager': {
        name: 'Project Manager',
        description: 'Project oversight'
      },
      project_manager: {
        name: 'Project Manager',
        description: 'Project oversight'
      },
      Foreman: {
        name: 'Foreman',
        description: 'Site management'
      },
      supervisor: {
        name: 'Supervisor',
        description: 'Site supervision'
      },
      'Safety Officer': {
        name: 'Safety Officer',
        description: 'Safety compliance'
      },
      'Accounting Clerk': {
        name: 'Accounting Clerk',
        description: 'Financial management'
      },
      operative: {
        name: 'Operative',
        description: 'Field operations'
      },
      field_worker: {
        name: 'Field Worker',
        description: 'On-site operations'
      }
    };

    return roleDisplayMap[role] || { name: role, description: '' };
  };

  const roleInfo = getRoleDisplayInfo(userRole);

  return (
    <div className={`flex flex-col h-full bg-white border-r border-gray-200 ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">🏗️</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-900">ConstructAI</h2>
              <p className="text-xs text-gray-500">AI-Powered Platform</p>
            </div>
          )}
        </div>
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 truncate">{roleInfo.name}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        {!collapsed && (
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Navigation
          </p>
        )}

        <div className="space-y-2">
          {navigationGroups.map(group => (
            <NavigationGroupComponent
              key={group.id}
              group={group}
              userRole={userRole}
              currentPath={currentPath}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        {!collapsed && (
          <div className="text-center">
            <p className="text-xs text-gray-500">
              {roleInfo.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};