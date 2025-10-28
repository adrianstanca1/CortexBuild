import React from 'react';
import { User, Notification, NotificationType } from '../../types';
import { Button } from '../ui/Button';

interface NotificationDropdownProps {
  user: User;
  notifications: Notification[];
  onClose: () => void;
  addToast: (message: string, type: 'success' | 'error') => void;
  onNotificationClick: (notification: Notification) => Promise<void> | void;
  onMarkAllAsRead: () => Promise<void> | void;
}

const formatDistanceToNow = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return `${Math.floor(interval)}y`;
    interval = seconds / 2592000;
    if (interval > 1) return `${Math.floor(interval)}mo`;
    interval = seconds / 86400;
    if (interval > 1) return `${Math.floor(interval)}d`;
    interval = seconds / 3600;
    if (interval > 1) return `${Math.floor(interval)}h`;
    interval = seconds / 60;
    if (interval > 1) return `${Math.floor(interval)}m`;
    return `${Math.floor(seconds)}s ago`;
const NotificationIcon: React.FC<{ type: NotificationType }> = ({ type }) => {
    const wrapper = (content: React.ReactNode, className: string) => (
        <span className={`flex h-8 w-8 items-center justify-center rounded-full ${className}`}>
            {content}
        </span>
    );

    switch (type) {
        case NotificationType.INFO:
            return wrapper(
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>,
                'bg-sky-100 text-sky-600'
            );
        case NotificationType.SUCCESS:
            return wrapper(
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>,
                'bg-emerald-100 text-emerald-600'
            );
        case NotificationType.WARNING:
            return wrapper(
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-5a1 1 0 112 0v1a1 1 0 11-2 0V8z" clipRule="evenodd" />
                </svg>,
                'bg-amber-100 text-amber-600'
            );
        case NotificationType.ERROR:
            return wrapper(
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>,
                'bg-red-100 text-red-600'
            );
        case NotificationType.APPROVAL_REQUEST:
            return wrapper(
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm10 4a1 1 0 10-2 0v.01a1 1 0 102 0V9zm-4 0a1 1 0 10-2 0v.01a1 1 0 102 0V9zm2 2a1 1 0 100 2h.01a1 1 0 100-2H12zm-4 0a1 1 0 100 2h.01a1 1 0 100-2H8z" clipRule="evenodd" />
                </svg>,
                'bg-sky-100 text-sky-600'
            );
        case NotificationType.TASK_ASSIGNED:
            return wrapper(
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 5a1 1 0 00-1 1v1H4a1 1 0 00-1 1v4a1 1 0 001 1h1v1a1 1 0 001 1h10a1 1 0 001-1v-1h1a1 1 0 001-1V8a1 1 0 00-1-1h-4V6a1 1 0 00-1-1H9z" />
                </svg>,
                'bg-emerald-100 text-emerald-600'
            );
        case NotificationType.NEW_MESSAGE:
            return wrapper(
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.083-3.25A8.84 8.84 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM4.832 14.168L5.92 11.25A6.983 6.983 0 004 10c0-2.651 2.46-5 6-5s6 2.349 6 5-2.46 5-6 5a7.03 7.03 0 00-2.25-.332z" clipRule="evenodd" />
                </svg>,
                'bg-indigo-100 text-indigo-600'
            );
        case NotificationType.DOCUMENT_COMMENT:
            return wrapper(
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2-2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>,
                'bg-slate-100 text-slate-600'
            );
        case NotificationType.SAFETY_ALERT:
            return wrapper(
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>,
                'bg-red-100 text-red-600'
            );
        default:
            return wrapper(
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>,
                'bg-slate-100 text-slate-600'
            );
    }
export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ user: _user, notifications, onClose, addToast, onNotificationClick, onMarkAllAsRead }) => {
    const [isMarkingAll, setIsMarkingAll] = React.useState(false);
    const hasUnread = notifications.some(n => !(n.isRead ?? n.read));

    const handleNotificationSelect = async (notification: Notification) => {
        try {
            await onNotificationClick(notification);
        } catch (error) {
            console.error('Failed to open notification', error);
            addToast('Unable to open that notification. Please try again.', 'error');
            return;
        }
        onClose();
    };

    const handleMarkAllClick = async () => {
        if (!hasUnread || isMarkingAll) return;
        try {
            setIsMarkingAll(true);
            await onMarkAllAsRead();
            addToast('All notifications marked as read.', 'success');
        } catch (error) {
            console.error('Failed to mark notifications as read', error);
            addToast('Unable to mark notifications as read. Please try again.', 'error');
        } finally {
            setIsMarkingAll(false);
        }
    };

    return (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-card rounded-md shadow-lg border border-border z-20 flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-border flex justify-between items-center">
                <h3 className="font-semibold text-lg text-card-foreground">Notifications</h3>
                <Button variant="ghost" size="sm" onClick={handleMarkAllClick} disabled={!hasUnread || isMarkingAll}>
                    {isMarkingAll ? 'Marking...' : 'Mark all as read'}
                </Button>
            </div>
            <div className="overflow-y-auto">
                {notifications.length === 0 ? (
                    <p className="p-8 text-center text-muted-foreground">You have no notifications.</p>
                ) : (
                    notifications.map(n => (
                        <div
                            key={n.id}
                            onClick={() => {
                                onNotificationClick(n);
                                onClose();
                            }}
                            className={`flex items-start gap-3 p-4 border-b border-border hover:bg-accent cursor-pointer ${!n.read ? 'bg-primary/10' : ''}`}
                        >
                            {!n.read && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>}
                            <div className={`flex-shrink-0 ${n.read ? 'ml-4' : ''}`}>
                                <NotificationIcon type={n.type} />
                            </div>
                            <div className="flex-grow">
                                <p className="text-sm text-card-foreground">{n.message}</p>
                                <p className="text-xs text-muted-foreground mt-1">{formatDistanceToNow(new Date(n.createdAt))} ago</p>

                    notifications.map(n => {
                        const isRead = n.isRead ?? n.read;
                        return (
                            <div
                                key={n.id}
                                onClick={() => handleNotificationSelect(n)}
                                className={`flex items-start gap-3 p-4 border-b border-border hover:bg-accent cursor-pointer ${!isRead ? 'bg-primary/10' : ''}`}
                            >
                                {!isRead && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>}
                                <div className={`flex-shrink-0 ${isRead ? 'ml-4' : ''}`}>
                                    <NotificationIcon type={n.type} />
                                </div>
                                <div className="flex-grow">
                                    <p className="text-sm text-card-foreground">{n.message}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{formatDistanceToNow(new Date(n.createdAt))} ago</p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};