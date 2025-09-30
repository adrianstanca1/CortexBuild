import React from 'react';

interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  user: string;
}

interface RecentActivityProps {
  activities: Activity[] | undefined;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ 
  activities = [] 
}) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project': return '🏗️';
      case 'invoice': return '💰';
      case 'task': return '✅';
      case 'user': return '👤';
      default: return '📝';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
      
      <div className="space-y-3">
        {activities.slice(0, 8).map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded">
            <span className="text-lg">{getActivityIcon(activity.type)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">{activity.description}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-gray-500">{activity.user}</span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</span>
              </div>
            </div>
          </div>
        ))}

        {activities.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
};