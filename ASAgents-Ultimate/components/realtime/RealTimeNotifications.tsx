import React, { useState } from 'react';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import { useRealTimeNotifications } from '../../hooks/useRealTime';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface RealTimeNotificationsProps {
  className?: string;
}

export const RealTimeNotifications: React.FC<RealTimeNotificationsProps> = ({ 
  className = '' 
}) => {
  const { notifications, unreadCount, markAsRead, clearAll } = useRealTimeNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task_updated':
        return '📋';
      case 'project_updated':
        return '🏗️';
      case 'expense_created':
        return '💰';
      case 'user_activity':
        return '👤';
      case 'system_alert':
        return '⚠️';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'task_updated':
        return 'border-l-blue-500';
      case 'project_updated':
        return 'border-l-green-500';
      case 'expense_created':
        return 'border-l-yellow-500';
      case 'user_activity':
        return 'border-l-purple-500';
      case 'system_alert':
        return 'border-l-red-500';
      default:
        return 'border-l-gray-500';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 z-50">
          <Card className="shadow-lg border-0 ring-1 ring-black ring-opacity-5">
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Notifications
                </h3>
                <div className="flex items-center space-x-2">
                  {notifications.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAll}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <CheckCheck size={16} />
                    </Button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Bell size={32} className="mx-auto mb-2 opacity-50" />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-lg border-l-4 ${getNotificationColor(notification.type)} ${
                          notification.read ? 'bg-gray-50' : 'bg-blue-50'
                        } hover:bg-gray-100 transition-colors cursor-pointer`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <span className="text-lg">
                            {getNotificationIcon(notification.type)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className={`text-sm font-medium ${
                                notification.read ? 'text-gray-700' : 'text-gray-900'
                              }`}>
                                {notification.title || 'Notification'}
                              </p>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                              )}
                            </div>
                            <p className={`text-sm mt-1 ${
                              notification.read ? 'text-gray-500' : 'text-gray-700'
                            }`}>
                              {notification.message || 'No message'}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatTimestamp(notification.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View all notifications
                  </button>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default RealTimeNotifications;
