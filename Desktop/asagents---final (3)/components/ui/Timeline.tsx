import React from 'react';

interface TimelineItem {
  id: string | number;
  title: string;
  description?: string;
  timestamp: Date;
  type?: 'success' | 'warning' | 'error' | 'info';
  icon?: React.ReactNode;
  user?: string;
}

interface TimelineProps {
  items: TimelineItem[];
  compact?: boolean;
}

export const Timeline: React.FC<TimelineProps> = ({ items, compact = false }) => {
  const typeStyles = {
    success: {
      dot: 'bg-green-500',
      line: 'bg-green-200',
      text: 'text-green-700'
    },
    warning: {
      dot: 'bg-yellow-500',
      line: 'bg-yellow-200',
      text: 'text-yellow-700'
    },
    error: {
      dot: 'bg-red-500',
      line: 'bg-red-200',
      text: 'text-red-700'
    },
    info: {
      dot: 'bg-blue-500',
      line: 'bg-blue-200',
      text: 'text-blue-700'
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="relative">
      {items.map((item, index) => {
        const style = typeStyles[item.type || 'info'];
        const isLast = index === items.length - 1;

        return (
          <div key={item.id} className="relative pb-6">
            {!isLast && (
              <div className={`absolute left-3 top-6 w-0.5 h-full ${style.line}`} />
            )}
            <div className="relative flex items-start gap-4">
              <div className={`${style.dot} w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 shadow-md relative z-10`}>
                {item.icon ? (
                  <div className="text-white text-xs">{item.icon}</div>
                ) : (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className={`font-semibold text-sm ${style.text}`}>{item.title}</h4>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {formatTime(item.timestamp)}
                  </span>
                </div>
                {item.description && (
                  <p className="text-sm text-gray-600 mb-1">{item.description}</p>
                )}
                {item.user && !compact && (
                  <p className="text-xs text-gray-400">by {item.user}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

interface ActivityItem {
  id: string | number;
  user: string;
  action: string;
  target?: string;
  timestamp: Date;
  avatar?: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {activity.avatar || activity.user.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">{activity.user}</span> {activity.action}
              {activity.target && (
                <span className="font-semibold text-blue-600"> {activity.target}</span>
              )}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{formatTime(activity.timestamp)}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
