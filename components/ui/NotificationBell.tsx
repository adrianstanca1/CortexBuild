/**
 * Notification Bell Component
 * Displays notification bell icon with unread count badge and dropdown menu
 * Features: Real-time updates, mark as read, archive, delete
 */

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Trash2, Archive, Check, Clock } from 'lucide-react';
import { notificationService, Notification } from '../../lib/services/notificationService';
import toast from 'react-hot-toast';

interface NotificationBellProps {
  userId: string;
  onNotificationClick?: (notification: Notification) => void;
  isDarkMode?: boolean;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  userId,
  onNotificationClick,
  isDarkMode = false
}) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load initial notifications and subscribe to real-time updates
  useEffect(() => {
    loadNotifications();

    // Subscribe to real-time notifications
    const unsubscribe = notificationService.subscribeToNotifications(userId, (newNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);

      // Show toast notification
      toast.success(newNotification.title, {
        icon: '🔔',
        duration: 4000
      });
    });

    return unsubscribe;
  }, [userId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications(userId, 10);
      setNotifications(data);

      // Count unread
      const unread = data.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notification: Notification, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(notification.id);
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      onNotificationClick?.(notification);
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Failed to mark as read');
    }
  };

  const handleArchive = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.archiveNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success('Notification archived');
    } catch (error) {
      console.error('Error archiving:', error);
      toast.error('Failed to archive notification');
    }
  };

  const handleDelete = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Failed to delete notification');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-4 border-red-500 bg-red-50';
      case 'high':
        return 'border-l-4 border-orange-500 bg-orange-50';
      case 'normal':
        return 'border-l-4 border-blue-500 bg-blue-50';
      case 'low':
        return 'border-l-4 border-gray-500 bg-gray-50';
      default:
        return 'border-l-4 border-gray-500 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'task_update':
        return '✓';
      case 'mention':
        return '@';
      case 'system_alert':
        return '⚠️';
      case 'comment':
        return '💬';
      case 'project_update':
        return '📋';
      case 'team_update':
        return '👥';
      case 'document_update':
        return '📄';
      case 'payment_update':
        return '💳';
      default:
        return '🔔';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className={`relative p-2 rounded-lg transition-colors ${isDarkMode
          ? 'text-gray-400 hover:text-white hover:bg-gray-700'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell className="w-6 h-6" />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div
          className={`absolute right-0 mt-2 w-96 rounded-lg shadow-xl border z-50 ${isDarkMode
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200'
            }`}
        >
          {/* Header */}
          <div
            className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}
          >
            <div className="flex items-center justify-between">
              <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${isDarkMode
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-red-100 text-red-700'
                  }`}>
                  {unreadCount} unread
                </span>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className={`p-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No notifications</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b transition-colors cursor-pointer hover:bg-opacity-50 ${getPriorityColor(notification.priority)
                    } ${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'}`}
                  onClick={() => !notification.read && handleMarkAsRead(notification, {} as any)}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="text-xl flex-shrink-0 mt-1">
                      {getTypeIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {notification.title}
                          </p>
                          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Clock className="w-3 h-3" />
                            <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                              {formatTimeAgo(notification.created_at)}
                            </p>
                          </div>
                        </div>

                        {/* Unread Indicator */}
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-3">
                        {!notification.read && (
                          <button
                            type="button"
                            onClick={(e) => handleMarkAsRead(notification, e)}
                            className={`text-xs font-medium px-2 py-1 rounded transition-colors flex items-center gap-1 ${isDarkMode
                              ? 'text-blue-400 hover:bg-blue-500/20'
                              : 'text-blue-600 hover:bg-blue-50'
                              }`}
                          >
                            <Check className="w-3 h-3" />
                            Mark read
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => handleArchive(notification.id, e)}
                          className={`text-xs font-medium px-2 py-1 rounded transition-colors flex items-center gap-1 ${isDarkMode
                            ? 'text-gray-400 hover:bg-gray-700'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                          <Archive className="w-3 h-3" />
                          Archive
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(notification.id, e)}
                          className={`text-xs font-medium px-2 py-1 rounded transition-colors flex items-center gap-1 ${isDarkMode
                            ? 'text-red-400 hover:bg-red-500/20'
                            : 'text-red-600 hover:bg-red-50'
                            }`}
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div
              className={`p-3 border-t text-center ${isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}
            >
              <button
                type="button"
                onClick={() => setShowDropdown(false)}
                className={`text-sm font-medium ${isDarkMode
                  ? 'text-blue-400 hover:text-blue-300'
                  : 'text-blue-600 hover:text-blue-700'
                  }`}
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

