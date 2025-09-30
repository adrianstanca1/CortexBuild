import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Tag } from '../ui/Tag';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'task' | 'project' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  isStarred?: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: {
    projectId?: string;
    taskId?: string;
    userId?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    category?: string;
  };
  sender?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface NotificationCenterProps {
  user: User;
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (notificationId: string) => void;
  onStarNotification: (notificationId: string, starred: boolean) => void;
  onNotificationAction: (notification: Notification) => void;
  isOpen: boolean;
  onToggle: () => void;
  unreadCount: number;
}

const NotificationItem: React.FC<{
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onStar: (id: string, starred: boolean) => void;
  onAction: (notification: Notification) => void;
}> = ({ notification, onMarkAsRead, onDelete, onStar, onAction }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return (
          <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="h-4 w-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case 'task':
        return (
          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        );
      case 'project':
        return (
          <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
            <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      className={`p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors ${
        !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
      }`}
    >
      <div className="flex items-start space-x-3">
        {/* Icon or Avatar */}
        {notification.sender ? (
          <Avatar
            name={notification.sender.name}
            imageUrl={notification.sender.avatar}
            className="h-8 w-8"
          />
        ) : (
          getTypeIcon(notification.type)
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                {notification.title}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {notification.message}
              </p>
              
              {/* Metadata */}
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-xs text-gray-500">
                  {formatTimestamp(notification.timestamp)}
                </span>
                {notification.metadata?.priority && (
                  <Tag
                    variant={
                      notification.metadata.priority === 'urgent' ? 'destructive' :
                      notification.metadata.priority === 'high' ? 'warning' :
                      notification.metadata.priority === 'medium' ? 'secondary' : 'default'
                    }
                    size="sm"
                  >
                    {notification.metadata.priority}
                  </Tag>
                )}
                {notification.metadata?.category && (
                  <Tag variant="outline" size="sm">
                    {notification.metadata.category}
                  </Tag>
                )}
              </div>

              {/* Action Button */}
              {notification.actionUrl && notification.actionLabel && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-2"
                  onClick={() => onAction(notification)}
                >
                  {notification.actionLabel}
                </Button>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-1 ml-2">
              <button
                type="button"
                onClick={() => onStar(notification.id, !notification.isStarred)}
                className={`p-1 rounded hover:bg-gray-200 ${
                  notification.isStarred ? 'text-yellow-500' : 'text-gray-400'
                }`}
              >
                <svg className="h-4 w-4" fill={notification.isStarred ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </button>
              
              {!notification.isRead && (
                <button
                  type="button"
                  onClick={() => onMarkAsRead(notification.id)}
                  className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600"
                  title="Mark as read"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              )}
              
              <button
                type="button"
                onClick={() => onDelete(notification.id)}
                className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-red-600"
                title="Delete"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  user,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onStarNotification,
  onNotificationAction,
  isOpen,
  onToggle,
  unreadCount
}) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Apply read/starred filter
    switch (filter) {
      case 'unread':
        filtered = filtered.filter(n => !n.isRead);
        break;
      case 'starred':
        filtered = filtered.filter(n => n.isStarred);
        break;
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(n => n.type === typeFilter);
    }

    // Sort by timestamp (newest first)
    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [notifications, filter, typeFilter]);

  const notificationTypes = useMemo(() => {
    const types = new Set(notifications.map(n => n.type));
    return Array.from(types);
  }, [notifications]);

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        onClick={onToggle}
        className="relative p-2"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM11 19H6a2 2 0 01-2-2V7a2 2 0 012-2h5m5 0v5" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>
    );
  }

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl border-l border-gray-200 z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={onMarkAllAsRead}>
                Mark all read
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onToggle}>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 space-y-3">
          <div className="flex space-x-2">
            {['all', 'unread', 'starred'].map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f as any)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  filter === f
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f === 'unread' && unreadCount > 0 && (
                  <span className="ml-1 text-xs">({unreadCount})</span>
                )}
              </button>
            ))}
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All types</option>
            {notificationTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM11 19H6a2 2 0 01-2-2V7a2 2 0 012-2h5m5 0v5" />
            </svg>
            <h3 className="text-sm font-medium text-gray-900 mb-1">No notifications</h3>
            <p className="text-sm text-gray-500">
              {filter === 'unread' ? "You're all caught up!" : 
               filter === 'starred' ? "No starred notifications" :
               "No notifications to show"}
            </p>
          </div>
        ) : (
          <div>
            {filteredNotifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={onMarkAsRead}
                onDelete={onDeleteNotification}
                onStar={onStarNotification}
                onAction={onNotificationAction}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
