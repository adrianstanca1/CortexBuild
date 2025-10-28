/**
 * Notification Center Component
 * Displays real-time notifications and alerts
 */

import React, { useState } from 'react';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'warning',
      title: 'Pending Approval',
      message: '3 RFIs require your approval',
      timestamp: new Date(Date.now() - 10 * 60000),
      read: false,
      actionLabel: 'Review',
      onAction: () => console.log('Review RFIs')
    },
    {
      id: '2',
      type: 'success',
      title: 'Task Completed',
      message: 'Foundation inspection has been completed',
      timestamp: new Date(Date.now() - 30 * 60000),
      read: false
    },
    {
      id: '3',
      type: 'info',
      title: 'New Document',
      message: 'Updated floor plans uploaded to Level 3',
      timestamp: new Date(Date.now() - 60 * 60000),
      read: true,
      actionLabel: 'View',
      onAction: () => console.log('View document')
    },
    {
      id: '4',
      type: 'error',
      title: 'Overdue Task',
      message: 'Electrical inspection is 2 days overdue',
      timestamp: new Date(Date.now() - 120 * 60000),
      read: false,
      actionLabel: 'Update',
      onAction: () => console.log('Update task')
    }
  ]);

  const [showAll, setShowAll] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  const displayedNotifications = showAll ? notifications : notifications.slice(0, 3);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getTypeStyles = (type: Notification['type']) => {
    const styles = {
      info: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: 'ℹ️',
        iconBg: 'bg-blue-100',
        iconText: 'text-blue-600'
      },
      success: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        icon: '✅',
        iconBg: 'bg-green-100',
        iconText: 'text-green-600'
      },
      warning: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        icon: '⚠️',
        iconBg: 'bg-yellow-100',
        iconText: 'text-yellow-600'
      },
      error: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: '❌',
        iconBg: 'bg-red-100',
        iconText: 'text-red-600'
      }
    };
    return styles[type];
  };

  const getTimeAgo = (date: Date): string => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Mark all read
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-gray-600 hover:text-gray-700 font-medium"
          >
            {showAll ? 'Show less' : 'View all'}
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {displayedNotifications.map((notification) => {
          const styles = getTypeStyles(notification.type);
          return (
            <div
              key={notification.id}
              className={`${styles.bg} ${styles.border} border rounded-lg p-4 transition-all ${
                !notification.read ? 'shadow-sm' : 'opacity-75'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`${styles.iconBg} w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0`}>
                  <span className="text-lg">{styles.icon}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {getTimeAgo(notification.timestamp)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3">
                    {notification.actionLabel && notification.onAction && (
                      <button
                        type="button"
                        onClick={notification.onAction}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        {notification.actionLabel}
                      </button>
                    )}
                    {!notification.read && (
                      <button
                        type="button"
                        onClick={() => markAsRead(notification.id)}
                        className="text-sm font-medium text-gray-600 hover:text-gray-700"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {notifications.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔔</div>
          <p className="text-gray-500">No notifications</p>
          <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
        </div>
      )}
    </div>
  );
};

