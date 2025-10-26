import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, BellOff } from 'lucide-react';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: string;
    read: boolean;
    link?: string;
}

interface NotificationCenterProps {
    userId: string;
    isOpen: boolean;
    onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ userId, isOpen, onClose }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            loadNotifications();
        }
    }, [isOpen, userId]);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/notifications?userId=${userId}`);
            const data = await response.json();

            if (data.success) {
                setNotifications(data.notifications);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId: string) => {
        try {
            const response = await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'POST',
            });

            if (response.ok) {
                setNotifications(prev =>
                    prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
                );
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const response = await fetch(`/api/notifications/read-all`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });

            if (response.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const deleteNotification = async (notificationId: string) => {
        try {
            const response = await fetch(`/api/notifications/${notificationId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setNotifications(prev => prev.filter(n => n.id !== notificationId));
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden" onClick={onClose}>
            <div className="absolute inset-0 bg-black bg-opacity-25" />
            <div
                className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Notificări</h2>
                            <p className="text-sm text-gray-500">
                                {notifications.filter(n => !n.read).length} necitite
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={markAllAsRead}
                                className="rounded-lg px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50"
                            >
                                Marchează toate ca citite
                            </button>
                            <button
                                onClick={onClose}
                                className="rounded-lg p-1 hover:bg-gray-100"
                                aria-label="Închide"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <BellOff className="mb-4 h-12 w-12 text-gray-300" />
                                <p className="text-sm font-medium text-gray-900">Nu ai notificări</p>
                                <p className="text-sm text-gray-500">
                                    Notificările tale vor apărea aici
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`relative px-6 py-4 transition-colors ${!notification.read ? 'bg-blue-50' : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 mt-1">
                                                <div
                                                    className={`h-2 w-2 rounded-full ${!notification.read
                                                        ? 'bg-blue-600'
                                                        : 'bg-transparent'
                                                        }`}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {notification.title}
                                                </p>
                                                <p className="mt-1 text-sm text-gray-600">
                                                    {notification.message}
                                                </p>
                                                <p className="mt-1 text-xs text-gray-400">
                                                    {formatTimestamp(notification.timestamp)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {!notification.read && (
                                                    <button
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                                        title="Marchează ca citită"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteNotification(notification.id)}
                                                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                                                    title="Șterge"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'acum';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}z`;

    return date.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' });
};
