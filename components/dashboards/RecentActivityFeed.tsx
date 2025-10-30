/**
 * Recent Activity Feed
 * Unified activity feed component for all dashboards
 */

import React, { useEffect, useState } from 'react';
import { User } from '../../types';
import {
  Activity,
  FileText,
  Users,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  type: 'project' | 'task' | 'team' | 'document' | 'milestone' | 'alert';
  title: string;
  description: string;
  timestamp: Date;
  user?: string;
  metadata?: Record<string, any>;
}

interface RecentActivityFeedProps {
  user: User;
  limit?: number;
  showFilters?: boolean;
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  user,
  limit = 10,
  showFilters = true
}) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading activities
    // In production, this would fetch from the database
    const mockActivities: ActivityItem[] = [
      {
        id: '1',
        type: 'project',
        title: 'New project created',
        description: 'Metropolis Tower project has been created',
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
        user: 'John Doe',
      },
      {
        id: '2',
        type: 'task',
        title: 'Task completed',
        description: 'Foundation inspection completed',
        timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
        user: 'Jane Smith',
      },
      {
        id: '3',
        type: 'team',
        title: 'Team member added',
        description: 'Mike Johnson joined the team',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        user: 'Admin',
      },
      {
        id: '4',
        type: 'document',
        title: 'Document uploaded',
        description: 'Safety plan v2.pdf uploaded',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
        user: 'Sarah Williams',
      },
      {
        id: '5',
        type: 'milestone',
        title: 'Milestone reached',
        description: 'Phase 1 completion milestone achieved',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        user: 'System',
      },
      {
        id: '6',
        type: 'alert',
        title: 'Budget alert',
        description: 'Project approaching budget limit (85%)',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
        user: 'System',
      },
    ];

    setTimeout(() => {
      setActivities(mockActivities);
      setLoading(false);
    }, 500);
  }, [user]);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'project':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'task':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'team':
        return <Users className="w-5 h-5 text-purple-600" />;
      case 'document':
        return <FileText className="w-5 h-5 text-orange-600" />;
      case 'milestone':
        return <TrendingUp className="w-5 h-5 text-emerald-600" />;
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const filteredActivities = filter === 'all'
    ? activities
    : activities.filter(a => a.type === filter);

  const displayActivities = filteredActivities.slice(0, limit);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Recent Activity
        </h2>
        {showFilters && (
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All</option>
            <option value="project">Projects</option>
            <option value="task">Tasks</option>
            <option value="team">Team</option>
            <option value="document">Documents</option>
            <option value="milestone">Milestones</option>
            <option value="alert">Alerts</option>
          </select>
        )}
      </div>

      <div className="space-y-3">
        {displayActivities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No recent activity</p>
          </div>
        ) : (
          displayActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex-shrink-0 mt-0.5">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {activity.title}
                </p>
                <p className="text-sm text-gray-600 line-clamp-1">
                  {activity.description}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  {activity.user && (
                    <span className="text-xs text-gray-500">
                      by {activity.user}
                    </span>
                  )}
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {filteredActivities.length > limit && (
        <div className="mt-4 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View all activity →
          </button>
        </div>
      )}
    </div>
  );
};

