import React, { useState, useEffect } from 'react';
import { DashboardWidget } from './DashboardWidget';
import { useRealTimeEvent } from '../../../hooks/useRealTime';
import { formatDistanceToNow } from 'date-fns';
import { 
  CheckCircle, 
  AlertCircle, 
  User, 
  FileText, 
  DollarSign, 
  Calendar,
  MessageSquare,
  Settings,
  TrendingUp
} from 'lucide-react';

interface ActivityFeedProps {
  title: string;
  size: 'small' | 'medium' | 'large' | 'full';
  editMode: boolean;
  limit?: number;
  config: any;
  onConfigChange: (config: any) => void;
  onToggleVisibility: () => void;
}

interface ActivityItem {
  id: string;
  type: 'task_updated' | 'project_updated' | 'expense_created' | 'notification_created' | 'user_activity' | 'system_alert';
  title: string;
  description: string;
  timestamp: Date;
  user?: {
    name: string;
    avatar?: string;
  };
  metadata?: {
    projectName?: string;
    taskName?: string;
    amount?: number;
    status?: string;
  };
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'task_updated':
      return <CheckCircle size={16} className="text-green-500" />;
    case 'project_updated':
      return <FileText size={16} className="text-blue-500" />;
    case 'expense_created':
      return <DollarSign size={16} className="text-yellow-500" />;
    case 'notification_created':
      return <MessageSquare size={16} className="text-purple-500" />;
    case 'user_activity':
      return <User size={16} className="text-gray-500" />;
    case 'system_alert':
      return <AlertCircle size={16} className="text-red-500" />;
    default:
      return <Calendar size={16} className="text-gray-400" />;
  }
};

const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case 'critical':
      return 'border-l-red-500 bg-red-50';
    case 'high':
      return 'border-l-orange-500 bg-orange-50';
    case 'medium':
      return 'border-l-yellow-500 bg-yellow-50';
    case 'low':
      return 'border-l-green-500 bg-green-50';
    default:
      return 'border-l-gray-300 bg-gray-50';
  }
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  title,
  size,
  editMode,
  limit = 10,
  config,
  onConfigChange,
  onToggleVisibility,
}) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Listen for real-time events
  useRealTimeEvent('task_updated', (event) => {
    const newActivity: ActivityItem = {
      id: `task_${Date.now()}`,
      type: 'task_updated',
      title: 'Task Updated',
      description: `Task "${event.data?.title || 'Unknown'}" status changed to ${event.data?.status || 'unknown'}`,
      timestamp: new Date(),
      user: {
        name: event.data?.assignee || 'System',
      },
      metadata: {
        taskName: event.data?.title,
        status: event.data?.status,
      },
      priority: event.data?.priority || 'medium',
    };
    
    setActivities(prev => [newActivity, ...prev.slice(0, limit - 1)]);
  });

  useRealTimeEvent('project_updated', (event) => {
    const newActivity: ActivityItem = {
      id: `project_${Date.now()}`,
      type: 'project_updated',
      title: 'Project Updated',
      description: `Project "${event.data?.name || 'Unknown'}" progress updated to ${event.data?.progress || 0}%`,
      timestamp: new Date(),
      metadata: {
        projectName: event.data?.name,
        status: event.data?.status,
      },
      priority: 'medium',
    };
    
    setActivities(prev => [newActivity, ...prev.slice(0, limit - 1)]);
  });

  useRealTimeEvent('expense_created', (event) => {
    const newActivity: ActivityItem = {
      id: `expense_${Date.now()}`,
      type: 'expense_created',
      title: 'New Expense',
      description: `Expense of $${event.data?.amount || 0} created for ${event.data?.description || 'unknown item'}`,
      timestamp: new Date(),
      metadata: {
        amount: event.data?.amount,
      },
      priority: 'low',
    };
    
    setActivities(prev => [newActivity, ...prev.slice(0, limit - 1)]);
  });

  useRealTimeEvent('notification_created', (event) => {
    const newActivity: ActivityItem = {
      id: `notification_${Date.now()}`,
      type: 'notification_created',
      title: event.data?.title || 'New Notification',
      description: event.data?.message || 'A new notification was created',
      timestamp: new Date(),
      priority: event.data?.priority || 'medium',
    };
    
    setActivities(prev => [newActivity, ...prev.slice(0, limit - 1)]);
  });

  // Load initial activities
  useEffect(() => {
    const loadInitialActivities = async () => {
      try {
        setLoading(true);
        
        // Simulate loading initial activities
        const initialActivities: ActivityItem[] = [
          {
            id: '1',
            type: 'task_updated',
            title: 'Task Completed',
            description: 'Foundation inspection task marked as completed',
            timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
            user: { name: 'John Smith' },
            metadata: { taskName: 'Foundation Inspection', status: 'completed' },
            priority: 'high',
          },
          {
            id: '2',
            type: 'project_updated',
            title: 'Project Progress',
            description: 'Residential Complex A reached 75% completion',
            timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
            metadata: { projectName: 'Residential Complex A', status: 'active' },
            priority: 'medium',
          },
          {
            id: '3',
            type: 'expense_created',
            title: 'New Expense',
            description: 'Material purchase expense of $2,500 added',
            timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
            metadata: { amount: 2500 },
            priority: 'low',
          },
          {
            id: '4',
            type: 'user_activity',
            title: 'User Login',
            description: 'Sarah Johnson logged into the system',
            timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
            user: { name: 'Sarah Johnson' },
            priority: 'low',
          },
          {
            id: '5',
            type: 'system_alert',
            title: 'System Maintenance',
            description: 'Scheduled maintenance completed successfully',
            timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
            priority: 'medium',
          },
        ];

        setActivities(initialActivities);
      } catch (error) {
        console.error('Failed to load activities:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialActivities();
  }, []);

  const filteredActivities = activities.slice(0, limit);

  return (
    <DashboardWidget
      title={title}
      size={size}
      editMode={editMode}
      loading={loading}
      onConfigChange={onConfigChange}
      onToggleVisibility={onToggleVisibility}
    >
      <div className="space-y-4">
        {/* Filter Controls (in edit mode) */}
        {editMode && (
          <div className="flex gap-2 p-2 bg-gray-50 rounded">
            <select
              className="text-xs border rounded px-2 py-1"
              value={limit}
              onChange={(e) => onConfigChange({ limit: parseInt(e.target.value) })}
            >
              <option value={5}>5 items</option>
              <option value={10}>10 items</option>
              <option value={20}>20 items</option>
              <option value={50}>50 items</option>
            </select>
          </div>
        )}

        {/* Activity List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar size={24} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
            </div>
          ) : (
            filteredActivities.map((activity) => (
              <div
                key={activity.id}
                className={`border-l-4 pl-4 py-3 rounded-r ${getPriorityColor(activity.priority)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {activity.title}
                      </h4>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {activity.description}
                    </p>
                    
                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {activity.user && (
                        <span className="flex items-center gap-1">
                          <User size={12} />
                          {activity.user.name}
                        </span>
                      )}
                      
                      {activity.metadata?.amount && (
                        <span className="flex items-center gap-1">
                          <DollarSign size={12} />
                          ${activity.metadata.amount.toLocaleString()}
                        </span>
                      )}
                      
                      {activity.metadata?.status && (
                        <span className="px-2 py-1 bg-gray-200 rounded text-xs">
                          {activity.metadata.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Activity Summary */}
        <div className="border-t pt-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Showing {filteredActivities.length} recent activities</span>
            <button className="text-primary hover:text-primary/80 text-xs">
              View All
            </button>
          </div>
        </div>
      </div>
    </DashboardWidget>
  );
};
