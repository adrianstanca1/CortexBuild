import React from 'react';
import { User, View, Project, Role } from '../../../types';
import { Button } from '../../ui/Button';
import { 
  Plus, 
  Users, 
  FileText, 
  DollarSign, 
  Calendar, 
  Settings, 
  BarChart3,
  MessageSquare,
  Upload,
  Download
} from 'lucide-react';

interface QuickActionsProps {
  user: User;
  onNavigate: (view: View) => void;
  onSelectProject?: (project: Project) => void;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray';
  action: () => void;
  shortcut?: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  user,
  onNavigate,
  onSelectProject,
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100',
    green: 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100',
    red: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100',
    gray: 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100',
  };

  const quickActions: QuickAction[] = [
    {
      id: 'new-project',
      title: 'New Project',
      description: 'Create a new project',
      icon: <Plus size={20} />,
      color: 'blue',
      action: () => onNavigate('projects'),
      shortcut: 'Ctrl+N',
    },
    {
      id: 'add-task',
      title: 'Add Task',
      description: 'Create a new task',
      icon: <FileText size={20} />,
      color: 'green',
      action: () => onNavigate("todo" as View),
      shortcut: 'Ctrl+T',
    },
    {
      id: 'add-expense',
      title: 'Add Expense',
      description: 'Record new expense',
      icon: <DollarSign size={20} />,
      color: 'orange',
      action: () => onNavigate("financials" as View),
      shortcut: 'Ctrl+E',
    },
    {
      id: 'team-management',
      title: 'Manage Team',
      description: 'View and manage team',
      icon: <Users size={20} />,
      color: 'purple',
      action: () => onNavigate("personnel" as View),
    },
    {
      id: 'schedule',
      title: 'Schedule',
      description: 'View project timeline',
      icon: <Calendar size={20} />,
      color: 'blue',
      action: () => onNavigate("timeline" as View),
    },
    {
      id: 'reports',
      title: 'Reports',
      description: 'Generate reports',
      icon: <BarChart3 size={20} />,
      color: 'gray',
      action: () => onNavigate("reports" as View),
    },
    {
      id: 'messages',
      title: 'Messages',
      description: 'View messages',
      icon: <MessageSquare size={20} />,
      color: 'green',
      action: () => onNavigate("chat" as View),
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'App preferences',
      icon: <Settings size={20} />,
      color: 'gray',
      action: () => onNavigate('settings'),
    },
  ];

  // Filter actions based on user role
  const getAvailableActions = () => {
    const baseActions = quickActions;
    
    // Add role-specific actions
    if (user.role === Role.ADMIN || user.role === Role.OWNER) {
      return baseActions;
    } else if (user.role === Role.PROJECT_MANAGER) {
      return baseActions.filter(action => 
        !['settings', 'team-management'].includes(action.id)
      );
    } else {
      return baseActions.filter(action => 
        ['add-task', 'add-expense', 'schedule', 'messages'].includes(action.id)
      );
    }
  };

  const availableActions = getAvailableActions();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
        <span className="text-sm text-muted-foreground">
          {availableActions.length} available
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {availableActions.map((action) => (
          <button
            key={action.id}
            onClick={action.action}
            className={`
              relative p-4 rounded-lg border transition-all duration-200 
              ${colorClasses[action.color]}
              hover:scale-105 hover:shadow-md
              focus:outline-none focus:ring-2 focus:ring-primary/20
              group
            `}
            title={action.description}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="flex-shrink-0">
                {action.icon}
              </div>
              <div className="text-center">
                <div className="text-sm font-medium">{action.title}</div>
                {action.shortcut && (
                  <div className="text-xs opacity-60 mt-1">
                    {action.shortcut}
                  </div>
                )}
              </div>
            </div>

            {/* Hover tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              {action.description}
            </div>
          </button>
        ))}
      </div>

      {/* Recent Actions */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Actions</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
            <FileText size={16} className="text-gray-400" />
            <div className="flex-grow">
              <div className="text-sm text-gray-900">Created task "Foundation Review"</div>
              <div className="text-xs text-gray-500">2 minutes ago</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
            <DollarSign size={16} className="text-gray-400" />
            <div className="flex-grow">
              <div className="text-sm text-gray-900">Added expense for materials</div>
              <div className="text-xs text-gray-500">15 minutes ago</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
            <Users size={16} className="text-gray-400" />
            <div className="flex-grow">
              <div className="text-sm text-gray-900">Assigned team member to project</div>
              <div className="text-xs text-gray-500">1 hour ago</div>
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-blue-600">⌨️</div>
          <h4 className="text-sm font-medium text-blue-900">Keyboard Shortcuts</h4>
        </div>
        <div className="text-xs text-blue-700 space-y-1">
          <div>Press <kbd className="px-1 py-0.5 bg-blue-100 rounded">Ctrl+N</kbd> for new project</div>
          <div>Press <kbd className="px-1 py-0.5 bg-blue-100 rounded">Ctrl+T</kbd> for new task</div>
          <div>Press <kbd className="px-1 py-0.5 bg-blue-100 rounded">Ctrl+E</kbd> for new expense</div>
        </div>
      </div>
    </div>
  );
};
