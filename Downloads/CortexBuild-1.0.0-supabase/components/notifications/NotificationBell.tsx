import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: string;
    read: boolean;
    link?: string;
}

interface NotificationBellProps {
    userId: string;
    onOpenNotifications: () => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ userId, onOpenNotifications }) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        // Load notifications from API
        loadNotifications();

        // Subscribe to real-time updates
        const subscription = subscribeToNotifications(userId);

        return () => {
            subscription.unsubscribe();
        };
    }, [userId]);

    const loadNotifications = async () => {
        try {
            const response = await fetch(`/api/notifications?userId=${userId}&unreadOnly=true`);
            const data = await response.json();

            if (data.success) {
                setNotifications(data.notifications);
                setUnreadCount(data.notifications.filter((n: Notification) => !n.read).length);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    };

    const subscribeToNotifications = (userId: string) => {
        // This would connect to Supabase realtime or WebSocket
        // For now, polling every 10 seconds
        const interval = setInterval(loadNotifications, 10000);

        return {
            unsubscribe: () => clearInterval(interval)
        };
    };

    return (
        <button
            onClick={onOpenNotifications}
            className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Notifications"
        >
            <Bell className="h-6 w-6" />
            {unreadCount > 0 && (
                <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            )}
        </button>
    );
};
