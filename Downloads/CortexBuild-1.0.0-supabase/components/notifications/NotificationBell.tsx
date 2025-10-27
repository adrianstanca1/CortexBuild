import React, { useState, useEffect } from 'react';
import { Bell, BellRing } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import type { NotificationBellProps } from '../../types/notifications';

export const NotificationBell: React.FC<NotificationBellProps> = ({ 
  userId, 
  onOpenNotifications, 
  showUnreadCount = true, 
  maxCount = 99, 
  className = '' 
}) => {
  const { unreadCount, loading, error, isSubscribed } = useNotifications();
  const [isHovered, setIsHovered] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [previousUnreadCount, setPreviousUnreadCount] = useState(0);

  // Track new notifications for animation
  useEffect(() => {
    if (unreadCount > previousUnreadCount && previousUnreadCount > 0) {
      setHasNewNotification(true);
      const timer = setTimeout(() => setHasNewNotification(false), 3000);
      return () => clearTimeout(timer);
    }
    setPreviousUnreadCount(unreadCount);
  }, [unreadCount, previousUnreadCount]);

  // Handle click
  const handleClick = () => {
    onOpenNotifications();
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  // Determine bell icon
  const BellIcon = unreadCount > 0 ? BellRing : Bell;
  
  // Determine badge content
  const badgeContent = unreadCount > maxCount ? `${maxCount}+` : unreadCount.toString();
  
  // Determine badge color based on priority
  const getBadgeColor = () => {
    if (unreadCount === 0) return 'bg-gray-500';
    // Could be enhanced to show different colors based on highest priority notification
    return 'bg-red-500';
  };

  // Animation classes
  const bellClasses = `
    relative p-2 text-gray-600 hover:text-gray-900 transition-all duration-200
    ${hasNewNotification ? 'animate-bounce' : ''}
    ${loading ? 'opacity-50' : ''}
    ${error ? 'text-red-500' : ''}
    ${className}
  `;

  const badgeClasses = `
    absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center 
    rounded-full text-xs font-bold text-white transition-all duration-200
    ${getBadgeColor()}
    ${hasNewNotification ? 'animate-pulse scale-110' : ''}
    ${!showUnreadCount || unreadCount === 0 ? 'hidden' : ''}
  `;

  const dotClasses = `
    absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500
    ${isSubscribed ? 'animate-pulse' : ''}
    ${unreadCount > 0 ? 'hidden' : ''}
  `;

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={handleKeyDown}
      className={bellClasses}
      aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : '(no unread)'}`}
      aria-expanded={false}
      role="button"
      tabIndex={0}
    >
      {/* Bell Icon */}
      <BellIcon 
        className={`h-6 w-6 transition-colors duration-200 ${
          isHovered ? 'text-blue-600' : ''
        }`}
      />
      
      {/* Connection Status Dot */}
      <div className={dotClasses} title={isSubscribed ? 'Connected' : 'Disconnected'} />
      
      {/* Unread Count Badge */}
      {showUnreadCount && unreadCount > 0 && (
        <span className={badgeClasses}>
          {badgeContent}
        </span>
      )}
      
      {/* Tooltip */}
      {isHovered && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50">
          {loading ? 'Loading...' : error ? 'Error loading notifications' : `${unreadCount} unread notifications`}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </button>
  );
};

// Enhanced version with dropdown preview
export const NotificationBellWithPreview: React.FC<NotificationBellProps & { 
  previewCount?: number; 
}> = ({ 
  userId, 
  onOpenNotifications, 
  showUnreadCount = true, 
  maxCount = 99, 
  className = '',
  previewCount = 3 
}) => {
  const { notifications, unreadCount, loading } = useNotifications();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const recentUnreadNotifications = notifications
    .filter(n => !n.read)
    .slice(0, previewCount);

  const handleBellClick = () => {
    if (isDropdownOpen) {
      setIsDropdownOpen(false);
      onOpenNotifications();
    } else {
      setIsDropdownOpen(true);
    }
  };

  const handleNotificationClick = (notificationId: string) => {
    // Mark as read and navigate
    setIsDropdownOpen(false);
    onOpenNotifications();
  };

  return (
    <div className="relative">
      <NotificationBell
        userId={userId}
        onOpenNotifications={handleBellClick}
        showUnreadCount={showUnreadCount}
        maxCount={maxCount}
        className={className}
      />
      
      {/* Dropdown Preview */}
      {isDropdownOpen && recentUnreadNotifications.length > 0 && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Recent Notifications</h3>
              <button 
                onClick={() => setIsDropdownOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {recentUnreadNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          notification.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          notification.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {notification.priority}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatTimeAgo(notification.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-200">
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  onOpenNotifications();
                }}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View all notifications
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Backdrop */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};

// Utility function for time formatting
function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
