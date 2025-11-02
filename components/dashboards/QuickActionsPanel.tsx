/**
 * Quick Actions Panel
 * Unified quick actions component for all dashboards
 */

import React from 'react';
import { User } from '../../types';
import {
  Plus,
  FileText,
  Users,
  Calendar,
  DollarSign,
  Settings,
  Zap,
  Code,
  Grid,
  Workflow
} from 'lucide-react';
import { featureFlags } from '../../lib/config/database';

interface QuickActionsPanelProps {
  user: User;
  onNavigate: (screen: string) => void;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
  requiredRole?: string[];
  featureFlag?: keyof typeof featureFlags;
}

export const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({ user, onNavigate }) => {
  const allActions: QuickAction[] = [
    {
      id: 'new-project',
      label: 'New Project',
      icon: Plus,
      description: 'Create a new construction project',
      color: 'blue',
      requiredRole: ['super_admin', 'company_admin', 'Project Manager'],
    },
    {
      id: 'daily-log',
      label: 'Daily Log',
      icon: FileText,
      description: 'Add today\'s site activities',
      color: 'green',
    },
    {
      id: 'team',
      label: 'Team',
      icon: Users,
      description: 'Manage team members',
      color: 'purple',
      requiredRole: ['super_admin', 'company_admin', 'supervisor'],
    },
    {
      id: 'schedule',
      label: 'Schedule',
      icon: Calendar,
      description: 'View project timeline',
      color: 'orange',
    },
    {
      id: 'invoices',
      label: 'Invoices',
      icon: DollarSign,
      description: 'Manage billing and payments',
      color: 'emerald',
      requiredRole: ['super_admin', 'company_admin', 'Accounting Clerk'],
    },
    {
      id: 'workflows',
      label: 'Workflows',
      icon: Workflow,
      description: 'Build automation workflows',
      color: 'indigo',
      featureFlag: 'workflows',
    },
    {
      id: 'marketplace',
      label: 'Marketplace',
      icon: Grid,
      description: 'Browse and install apps',
      color: 'pink',
      featureFlag: 'marketplace',
    },
    {
      id: 'sdk',
      label: 'SDK',
      icon: Code,
      description: 'Developer tools and SDK',
      color: 'cyan',
      requiredRole: ['developer', 'super_admin'],
    },
    {
      id: 'ai-tools',
      label: 'AI Tools',
      icon: Zap,
      description: 'AI-powered features',
      color: 'violet',
      featureFlag: 'aiFeatures',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'Configure your workspace',
      color: 'gray',
    },
  ];

  // Filter actions based on user role and feature flags
  const availableActions = allActions.filter(action => {
    // Check role requirement
    if (action.requiredRole && !action.requiredRole.includes(user.role)) {
      return false;
    }

    // Check feature flag
    if (action.featureFlag && !featureFlags[action.featureFlag]) {
      return false;
    }

    return true;
  });

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; hover: string }> = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-600', hover: 'hover:bg-blue-100' },
      green: { bg: 'bg-green-50', text: 'text-green-600', hover: 'hover:bg-green-100' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-600', hover: 'hover:bg-purple-100' },
      orange: { bg: 'bg-orange-50', text: 'text-orange-600', hover: 'hover:bg-orange-100' },
      emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', hover: 'hover:bg-emerald-100' },
      indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', hover: 'hover:bg-indigo-100' },
      pink: { bg: 'bg-pink-50', text: 'text-pink-600', hover: 'hover:bg-pink-100' },
      cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', hover: 'hover:bg-cyan-100' },
      violet: { bg: 'bg-violet-50', text: 'text-violet-600', hover: 'hover:bg-violet-100' },
      gray: { bg: 'bg-gray-50', text: 'text-gray-600', hover: 'hover:bg-gray-100' },
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {availableActions.map((action) => {
          const Icon = action.icon;
          const colors = getColorClasses(action.color);

          return (
            <button
              key={action.id}
              onClick={() => onNavigate(action.id)}
              className={`
                flex flex-col items-center gap-2 p-4 rounded-lg transition-all
                ${colors.bg} ${colors.hover} border border-transparent hover:border-gray-200
              `}
              title={action.description}
            >
              <div className={`p-2 rounded-lg ${colors.bg}`}>
                <Icon className={`w-6 h-6 ${colors.text}`} />
              </div>
              <span className="text-sm font-medium text-gray-900 text-center">
                {action.label}
              </span>
              <span className="text-xs text-gray-500 text-center line-clamp-2">
                {action.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

