import React, { useState, useMemo } from 'react';
import { 
  X, Check, Trash2, BellOff, Filter, Search, 
  CheckCheck, Archive, Settings, MoreVertical,
  AlertCircle, Info, CheckCircle, XCircle
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import type { 
  NotificationCenterProps, 
  NotificationFilters,
  NotificationPriority,
  NotificationType,
  NotificationCategory 
} from '../../types/notifications';

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  userId, 
  isOpen, 
  onClose,
  filters: initialFilters
}) => {
  const { 
    notifications, 
    loading, 
    error, 
    summary,
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    dismissNotification 
  } = useNotifications();
  
  const [filters, setFilters] = useState<NotificationFilters>(initialFilters || {});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'all' | 'unread' | 'priority'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filter and search notifications
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Apply view mode filter
    if (viewMode === 'unread') {
      filtered = filtered.filter(n => !n.read);
    } else if (viewMode === 'priority') {
      filtered = filtered.filter(n => n.priority === 'high' || n.priority === 'urgent');
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(query) || 
        n.message.toLowerCase().includes(query)
      );
    }

    // Apply custom filters
    if (filters.type && filters.type.length > 0) {
      filtered = filtered.filter(n => filters.type!.includes(n.type));
    }
    if (filters.category && filters.category.length > 0) {
      filtered = filtered.filter(n => filters.category!.includes(n.category));
    }
    if (filters.priority && filters.priority.length > 0) {
      filtered = filtered.filter(n => filters.priority!.includes(n.priority));
    }
    if (filters.read !== undefined) {
      filtered = filtered.filter(n => n.read === filters.read);
    }

    return filtered;
  }, [notifications, filters, searchQuery, viewMode]);

  // Group notifications by date
  const groupedNotifications = useMemo(() => {
    const groups: Record<string, typeof filteredNotifications> = {};
    
    filteredNotifications.forEach(notification => {
      const date = new Date(notification.created_at);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let groupKey: string;
      if (date.toDateString() === today.toDateString()) {
        groupKey = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = 'Yesterday';
      } else {
        groupKey = date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'short', 
          day: 'numeric' 
        });
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(notification);
    });

    return groups;
  }, [filteredNotifications]);

  // Handle notification actions
  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  const handleDelete = async (notificationId: string) => {
    await deleteNotification(notificationId);
  };

  const handleDismiss = async (notificationId: string) => {
    await dismissNotification(notificationId);
  };

  const handleSelectAll = () => {
    if (selectedNotifications.size === filteredNotifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(filteredNotifications.map(n => n.id)));
    }
  };

  const handleBulkMarkAsRead = async () => {
    const promises = Array.from(selectedNotifications).map(id => markAsRead(id));
    await Promise.all(promises);
    setSelectedNotifications(new Set());
  };

  const handleBulkDelete = async () => {
    const promises = Array.from(selectedNotifications).map(id => deleteNotification(id));
    await Promise.all(promises);
    setSelectedNotifications(new Set());
  };

  // Get icon for notification type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" onClick={onClose}>
      <div className="absolute inset-0 bg-black bg-opacity-25" />
      
      <div
        className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl transform transition-transform duration-300 ease-in-out"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{filteredNotifications.filter(n => !n.read).length} unread</span>
                  <span>{filteredNotifications.length} total</span>
                  {summary && (
                    <>
                      <span>•</span>
                      <span>{summary.high_priority} high priority</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Bulk Actions */}
              {selectedNotifications.size > 0 && (
                <div className="flex items-center gap-1 mr-2">
                  <button
                    onClick={handleBulkMarkAsRead}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Mark selected as read"
                  >
                    <CheckCheck className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete selected"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'unread', label: 'Unread' },
                  { key: 'priority', label: 'Priority' }
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setViewMode(key as any)}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      viewMode === key 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${
                  showFilters ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                }`}
                title="Toggle filters"
              >
                <Filter className="h-4 w-4" />
              </button>

              {/* Settings */}
              <button
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                title="Notification settings"
              >
                <Settings className="h-4 w-4" />
              </button>

              {/* Close */}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="border-b border-gray-200 p-4 bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search notifications..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <select
                    value={filters.read || ''}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      read: e.target.value ? e.target.value === 'true' : undefined 
                    }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Status</option>
                    <option value="true">Read</option>
                    <option value="false">Unread</option>
                  </select>

                  <select
                    value={filters.priority?.[0] || ''}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      priority: e.target.value ? [e.target.value as NotificationPriority] : undefined 
                    }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Priorities</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                  <span className="text-gray-500">Loading notifications...</span>
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <XCircle className="mb-4 h-12 w-12 text-red-300" />
                <p className="text-sm font-medium text-red-900">Error loading notifications</p>
                <p className="text-sm text-red-500 mt-1">{error}</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BellOff className="mb-4 h-12 w-12 text-gray-300" />
                <p className="text-sm font-medium text-gray-900">
                  {searchQuery || Object.keys(filters).length > 0 ? 'No notifications match your filters' : 'No notifications'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {searchQuery || Object.keys(filters).length > 0 
                    ? 'Try adjusting your search or filters' 
                    : 'Notifications will appear here when you receive them'
                  }
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {/* Bulk Select Header */}
                {filteredNotifications.length > 0 && (
                  <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedNotifications.size === filteredNotifications.length}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">
                          {selectedNotifications.size > 0 
                            ? `${selectedNotifications.size} selected` 
                            : 'Select all'
                          }
                        </span>
                      </div>
                      
                      {selectedNotifications.size > 0 && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleBulkMarkAsRead}
                            className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                          >
                            Mark as read
                          </button>
                          <button
                            onClick={handleBulkDelete}
                            className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notification Groups */}
                {Object.entries(groupedNotifications).map(([groupName, groupNotifications]) => (
                  <div key={groupName}>
                    <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                      <h3 className="text-sm font-medium text-gray-900">{groupName}</h3>
                      <p className="text-xs text-gray-500">{groupNotifications.length} notifications</p>
                    </div>
                    
                    <div className="divide-y divide-gray-100">
                      {groupNotifications.map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          isSelected={selectedNotifications.has(notification.id)}
                          onSelect={(id) => {
                            const newSelected = new Set(selectedNotifications);
                            if (newSelected.has(id)) {
                              newSelected.delete(id);
                            } else {
                              newSelected.add(id);
                            }
                            setSelectedNotifications(newSelected);
                          }}
                          onMarkAsRead={handleMarkAsRead}
                          onDelete={handleDelete}
                          onDismiss={handleDismiss}
                          onClick={() => {
                            if (!notification.read) {
                              handleMarkAsRead(notification.id);
                            }
                            // Navigate to action_url if available
                            if (notification.action_url) {
                              window.location.href = notification.action_url;
                            }
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {filteredNotifications.length > 0 && (
            <div className="border-t border-gray-200 px-6 py-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Mark all as read
                </button>
                
                <div className="text-xs text-gray-500">
                  {summary && (
                    <>
                      {summary.by_priority.urgent > 0 && (
                        <span className="text-red-600 font-medium mr-2">
                          {summary.by_priority.urgent} urgent
                        </span>
                      )}
                      {summary.by_priority.high > 0 && (
                        <span className="text-orange-600 font-medium mr-2">
                          {summary.by_priority.high} high
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Individual Notification Item Component
interface NotificationItemProps {
  notification: any;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onDismiss: (id: string) => void;
  onClick: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  isSelected,
  onSelect,
  onMarkAsRead,
  onDelete,
  onDismiss,
  onClick
}) => {
  const [showActions, setShowActions] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <div
      className={`relative px-6 py-4 transition-all duration-200 cursor-pointer group ${
        !notification.read 
          ? 'bg-blue-50 hover:bg-blue-100' 
          : 'hover:bg-gray-50'
      } ${isSelected ? 'ring-2 ring-blue-500 ring-inset' : ''}`}
      onClick={handleClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Selection Checkbox */}
      <div className="absolute left-3 top-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(notification.id)}
          onClick={(e) => e.stopPropagation()}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-start gap-3 ml-6">
        {/* Notification Icon */}
        <div className="flex-shrink-0 mt-1">
          <div className={`h-2 w-2 rounded-full ${!notification.read ? 'bg-blue-600' : 'bg-transparent'}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className={`text-sm font-medium truncate ${
                !notification.read ? 'text-gray-900' : 'text-gray-700'
              }`}>
                {notification.title}
              </p>
              <p className={`mt-1 text-sm line-clamp-2 ${
                !notification.read ? 'text-gray-700' : 'text-gray-500'
              }`}>
                {notification.message}
              </p>
              
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(notification.priority)}`}>
                  {notification.priority}
                </span>
                
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                  {notification.category}
                </span>
                
                <span className="text-xs text-gray-400">
                  {formatTimestamp(notification.created_at)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className={`flex items-center gap-1 transition-opacity ${
              showActions ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}>
              {!notification.read && (
                <button
                  onClick={(e) => handleActionClick(e, () => onMarkAsRead(notification.id))}
                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Mark as read"
                >
                  <Check className="h-4 w-4" />
                </button>
              )}
              
              <button
                onClick={(e) => handleActionClick(e, () => onDismiss(notification.id))}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                title="Dismiss"
              >
                <Archive className="h-4 w-4" />
              </button>
              
              <button
                onClick={(e) => handleActionClick(e, () => onDelete(notification.id))}
                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              
              <button
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                title="More options"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Utility functions
function getPriorityColor(priority: NotificationPriority): string {
  switch (priority) {
    case 'urgent':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'high':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
