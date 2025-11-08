import React, { useState, useEffect, useMemo } from 'react';
import {
    Bell, Check, CheckCheck, Trash2, Filter, Search, X,
    AlertCircle, Info, CheckCircle, XCircle, MessageSquare,
    Calendar, FileText, Users, Package, DollarSign, TrendingUp,
    Clock, Eye, EyeOff, Archive, Star, Zap
} from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import toast from 'react-hot-toast';

interface Notification {
    id: string;
    user_id: string;
    type: string;
    title: string;
    message: string;
    priority: string;
    read: boolean;
    archived: boolean;
    action_url?: string;
    metadata?: any;
    created_at: string;
}

interface NotificationsCenterProps {
    currentUser?: any;
}

const NotificationsCenter: React.FC<NotificationsCenterProps> = ({ currentUser }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedPriority, setSelectedPriority] = useState('all');
    const [showUnreadOnly, setShowUnreadOnly] = useState(false);
    const [showArchived, setShowArchived] = useState(false);

    const types = [
        { value: 'all', label: 'All Types', icon: Bell },
        { value: 'task', label: 'Tasks', icon: CheckCircle },
        { value: 'project', label: 'Projects', icon: Package },
        { value: 'message', label: 'Messages', icon: MessageSquare },
        { value: 'meeting', label: 'Meetings', icon: Calendar },
        { value: 'document', label: 'Documents', icon: FileText },
        { value: 'team', label: 'Team', icon: Users },
        { value: 'payment', label: 'Payments', icon: DollarSign },
        { value: 'system', label: 'System', icon: Info }
    ];

    const priorities = [
        { value: 'all', label: 'All Priorities' },
        { value: 'urgent', label: 'Urgent' },
        { value: 'high', label: 'High' },
        { value: 'normal', label: 'Normal' },
        { value: 'low', label: 'Low' }
    ];

    useEffect(() => {
        loadNotifications();

        // Set up real-time subscription
        const channel = supabase
            .channel('notifications')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${currentUser?.id}`
            }, (payload) => {
                console.log('Notification change:', payload);
                loadNotifications();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUser?.id]);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', currentUser?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            setNotifications(data || []);
        } catch (error: any) {
            console.error('Error loading notifications:', error);
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('id', notificationId);

            if (error) throw error;

            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
            );
        } catch (error: any) {
            console.error('Error marking as read:', error);
            toast.error('Failed to mark as read');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const unreadIds = notifications.filter(n => !n.read).map(n => n.id);

            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .in('id', unreadIds);

            if (error) throw error;

            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            toast.success('All notifications marked as read');
        } catch (error: any) {
            console.error('Error marking all as read:', error);
            toast.error('Failed to mark all as read');
        }
    };

    const handleArchive = async (notificationId: string) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ archived: true })
                .eq('id', notificationId);

            if (error) throw error;

            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, archived: true } : n)
            );
            toast.success('Notification archived');
        } catch (error: any) {
            console.error('Error archiving:', error);
            toast.error('Failed to archive notification');
        }
    };

    const handleDelete = async (notificationId: string) => {
        if (!confirm('Are you sure you want to delete this notification?')) return;

        try {
            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('id', notificationId);

            if (error) throw error;

            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            toast.success('Notification deleted');
        } catch (error: any) {
            console.error('Error deleting:', error);
            toast.error('Failed to delete notification');
        }
    };

    const filteredNotifications = useMemo(() => {
        return notifications.filter(notification => {
            const matchesSearch = !searchQuery ||
                notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                notification.message.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesType = selectedType === 'all' || notification.type === selectedType;
            const matchesPriority = selectedPriority === 'all' || notification.priority === selectedPriority;
            const matchesUnread = !showUnreadOnly || !notification.read;
            const matchesArchived = showArchived ? notification.archived : !notification.archived;

            return matchesSearch && matchesType && matchesPriority && matchesUnread && matchesArchived;
        });
    }, [notifications, searchQuery, selectedType, selectedPriority, showUnreadOnly, showArchived]);

    const stats = useMemo(() => {
        return {
            total: notifications.length,
            unread: notifications.filter(n => !n.read && !n.archived).length,
            urgent: notifications.filter(n => n.priority === 'urgent' && !n.read && !n.archived).length,
            archived: notifications.filter(n => n.archived).length
        };
    }, [notifications]);

    const getTypeIcon = (type: string) => {
        const typeConfig = types.find(t => t.value === type);
        const Icon = typeConfig?.icon || Bell;
        return <Icon className="w-5 h-5" />;
    };

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            task: 'bg-blue-100 text-blue-800',
            project: 'bg-purple-100 text-purple-800',
            message: 'bg-green-100 text-green-800',
            meeting: 'bg-yellow-100 text-yellow-800',
            document: 'bg-pink-100 text-pink-800',
            team: 'bg-indigo-100 text-indigo-800',
            payment: 'bg-emerald-100 text-emerald-800',
            system: 'bg-gray-100 text-gray-800'
        };
        return colors[type] || colors.system;
    };

    const getPriorityColor = (priority: string) => {
        const colors: Record<string, string> = {
            urgent: 'bg-red-100 text-red-800 border-red-300',
            high: 'bg-orange-100 text-orange-800 border-orange-300',
            normal: 'bg-blue-100 text-blue-800 border-blue-300',
            low: 'bg-gray-100 text-gray-800 border-gray-300'
        };
        return colors[priority] || colors.normal;
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return <Zap className="w-4 h-4" />;
            case 'high':
                return <AlertCircle className="w-4 h-4" />;
            case 'normal':
                return <Info className="w-4 h-4" />;
            case 'low':
                return <Clock className="w-4 h-4" />;
            default:
                return null;
        }
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                        <Bell className="w-10 h-10 text-blue-600" />
                        Notifications Center
                    </h1>
                    <p className="text-gray-600">Stay updated with real-time notifications</p>
                </div>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => setShowArchived(!showArchived)}
                        className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${showArchived ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <Archive className="w-5 h-5" />
                        {showArchived ? 'Hide Archived' : 'Show Archived'}
                    </button>
                    <button
                        type="button"
                        onClick={handleMarkAllAsRead}
                        disabled={stats.unread === 0}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        <CheckCheck className="w-5 h-5" />
                        Mark All Read
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Total</p>
                        <Bell className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Unread</p>
                        <Eye className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-3xl font-bold text-green-600">{stats.unread}</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Urgent</p>
                        <Zap className="w-5 h-5 text-red-600" />
                    </div>
                    <p className="text-3xl font-bold text-red-600">{stats.urgent}</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Archived</p>
                        <Archive className="w-5 h-5 text-gray-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-600">{stats.archived}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100 mb-6">
                <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search notifications..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        aria-label="Filter by type"
                    >
                        {types.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                    </select>

                    <select
                        value={selectedPriority}
                        onChange={(e) => setSelectedPriority(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        aria-label="Filter by priority"
                    >
                        {priorities.map(priority => (
                            <option key={priority.value} value={priority.value}>{priority.label}</option>
                        ))}
                    </select>

                    <button
                        type="button"
                        onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                        className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${showUnreadOnly ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {showUnreadOnly ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                        Unread Only
                    </button>
                </div>
            </div>

            {/* Notifications List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : filteredNotifications.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center shadow-md">
                    <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No notifications</h3>
                    <p className="text-gray-600">You're all caught up!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredNotifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`bg-white rounded-xl p-6 shadow-md border transition-all hover:shadow-lg ${!notification.read ? 'border-blue-300 bg-blue-50/30' : 'border-gray-100'
                                } ${notification.priority === 'urgent' ? 'ring-2 ring-red-300' : ''}`}
                        >
                            <div className="flex items-start gap-4">
                                {/* Icon */}
                                <div className={`p-3 rounded-lg ${getTypeColor(notification.type)}`}>
                                    {getTypeIcon(notification.type)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4 mb-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                                                {!notification.read && (
                                                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600">{notification.message}</p>
                                        </div>

                                        {/* Priority Badge */}
                                        <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 border ${getPriorityColor(notification.priority)}`}>
                                            {getPriorityIcon(notification.priority)}
                                            {notification.priority}
                                        </div>
                                    </div>

                                    {/* Metadata */}
                                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {formatTimeAgo(notification.created_at)}
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full ${getTypeColor(notification.type)}`}>
                                            {notification.type}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        {!notification.read && (
                                            <button
                                                type="button"
                                                onClick={() => handleMarkAsRead(notification.id)}
                                                className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                                            >
                                                <Check className="w-4 h-4" />
                                                Mark as read
                                            </button>
                                        )}
                                        {!notification.archived && (
                                            <button
                                                type="button"
                                                onClick={() => handleArchive(notification.id)}
                                                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
                                            >
                                                <Archive className="w-4 h-4" />
                                                Archive
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(notification.id)}
                                            className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NotificationsCenter;
