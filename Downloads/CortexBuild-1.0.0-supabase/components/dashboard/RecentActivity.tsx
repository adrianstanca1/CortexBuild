/**
 * Recent Activity Component
 * Displays recent user and system activities
 */

import React from 'react';

interface Activity {
  id: string;
  type: 'task' | 'rfi' | 'punch' | 'document' | 'user' | 'system';
  title: string;
  description: string;
  user: string;
  timestamp: Date;
  icon: string;
  color: string;
}

export const RecentActivity: React.FC = () => {
  const activities: Activity[] = [
    {
      id: '1',
      type: 'task',
      title: 'Task Completed',
      description: 'Foundation inspection completed',
      user: 'Mike Johnson',
      timestamp: new Date(Date.now() - 5 * 60000),
      icon: '✅',
      color: 'green'
    },
    {
      id: '2',
      type: 'rfi',
      title: 'New RFI Submitted',
      description: 'Electrical panel location clarification',
      user: 'Sarah Williams',
      timestamp: new Date(Date.now() - 15 * 60000),
      icon: '❓',
      color: 'yellow'
    },
    {
      id: '3',
      type: 'punch',
      title: 'Punch Item Created',
      description: 'Paint touch-up required in lobby',
      user: 'Casey Martinez',
      timestamp: new Date(Date.now() - 30 * 60000),
      icon: '📋',
      color: 'red'
    },
    {
      id: '4',
      type: 'document',
      title: 'Document Uploaded',
      description: 'Updated floor plans - Level 3',
      user: 'Adrian Stanca',
      timestamp: new Date(Date.now() - 45 * 60000),
      icon: '📄',
      color: 'blue'
    },
    {
      id: '5',
      type: 'user',
      title: 'New Team Member',
      description: 'John Doe joined the project',
      user: 'System',
      timestamp: new Date(Date.now() - 60 * 60000),
      icon: '👤',
      color: 'purple'
    },
    {
      id: '6',
      type: 'system',
      title: 'System Update',
      description: 'Enhanced dashboard deployed',
      user: 'System',
      timestamp: new Date(Date.now() - 90 * 60000),
      icon: '🚀',
      color: 'indigo'
    }
  ];

  const getTimeAgo = (date: Date): string => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      green: { bg: 'bg-green-100', text: 'text-green-700' },
      yellow: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
      red: { bg: 'bg-red-100', text: 'text-red-700' },
      blue: { bg: 'bg-blue-100', text: 'text-blue-700' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-700' },
      indigo: { bg: 'bg-indigo-100', text: 'text-indigo-700' }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <button
          type="button"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View All
        </button>
      </div>

      {/* Activity List */}
      <div className="space-y-4">
        {activities.map((activity) => {
          const colors = getColorClasses(activity.color);
          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              {/* Icon */}
              <div className={`${colors.bg} w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0`}>
                <span className="text-lg">{activity.icon}</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-500">
                        by {activity.user}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        {getTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State (if no activities) */}
      {activities.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📭</div>
          <p className="text-gray-500">No recent activity</p>
        </div>
      )}
    </div>
  );
};

