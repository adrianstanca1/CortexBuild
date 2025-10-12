import React, { useState, useEffect } from 'react';
// Fix: Corrected import paths to include file extensions.
import { Notification, Screen, User } from '../../types';
// Fix: Corrected import paths to include file extensions.
// Fix: Corrected the import path for the 'api' module.
import * as api from '../../api';
// Fix: Corrected icon import to use CheckCircleIcon and remove unused CheckIcon.
import { BellIcon, CheckCircleIcon } from '../Icons';

interface NotificationsWidgetProps {
    onDeepLink: (projectId: string, screen: Screen, params: any) => void;
    currentUser: User;
}

const NotificationsWidget: React.FC<NotificationsWidgetProps> = ({ onDeepLink, currentUser }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadNotifications = async () => {
        setIsLoading(true);
        const fetchedNotifications = await api.fetchNotificationsForUser(currentUser);
        setNotifications(fetchedNotifications);
        setIsLoading(false);
    };

    useEffect(() => {
        loadNotifications();
    }, [currentUser]);
    
    const handleMarkAsRead = async (id: string) => {
        const notif = notifications.find(n => n.id === id);
        if (notif && !notif.read) {
            // Fix: Pass currentUser to the markNotificationsAsRead API call.
            await api.markNotificationsAsRead([id], currentUser);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        }
    };
    
    const handleMarkAllAsRead = async () => {
        const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
        if (unreadIds.length > 0) {
            // Fix: Pass currentUser to the markNotificationsAsRead API call.
            await api.markNotificationsAsRead(unreadIds, currentUser);
            setNotifications(prev => prev.map(n => ({...n, read: true})));
        }
    };
    
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 h-full flex flex-col transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <BellIcon className="w-6 h-6 text-gray-500" />
                    My Inbox
                 </h2>
                {unreadCount > 0 && 
                    <button onClick={handleMarkAllAsRead} className="text-xs font-semibold text-blue-600 hover:underline">
                        Mark all as read
                    </button>
                }
            </div>
            {isLoading ? (
                <p className="text-gray-500 text-center py-4 flex-grow flex items-center justify-center">Loading notifications...</p>
            ) : notifications.length === 0 ? (
                <p className="text-gray-500 text-center py-4 flex-grow flex items-center justify-center">You're all caught up!</p>
            ) : (
                <ul className="space-y-2">
                    {notifications.map(notif => (
                        <li 
                            key={notif.id}
                            className={`flex items-start gap-4 p-3 rounded-lg transition-colors ${notif.read ? '' : 'bg-blue-50'}`}
                        >
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${notif.read ? 'bg-gray-100' : 'bg-blue-100'}`}>
                                <BellIcon className={`w-6 h-6 ${notif.read ? 'text-gray-400' : 'text-blue-600'}`} />
                            </div>
                            <div className="flex-grow cursor-pointer" onClick={() => notif.link.projectId && onDeepLink(notif.link.projectId, notif.link.screen, notif.link.params)}>
                                <p className={`text-sm ${!notif.read ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>{notif.message}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{new Date(notif.timestamp).toLocaleString()}</p>
                            </div>
                            {!notif.read && (
                                <button onClick={() => handleMarkAsRead(notif.id)} title="Mark as read" className="p-2 -mr-1 rounded-full hover:bg-green-100 flex-shrink-0">
                                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default NotificationsWidget;