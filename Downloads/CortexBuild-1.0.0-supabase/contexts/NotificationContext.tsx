import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase/client';
import { subscribeToNotifications, subscribeToMultiple, unsubscribeFromMultiple } from '../lib/supabase/realtime';
import { showNotificationFromSystem, requestNotificationPermission } from '../lib/services/pushNotifications';
import type {
  Notification,
  NotificationPreferences,
  NotificationSummary,
  NotificationFilters,
  NotificationContextValue,
  CreateNotificationRequest,
  UpdateNotificationRequest,
  NotificationChannel,
  NotificationPriority,
  NotificationType,
  NotificationCategory
} from '../types/notifications';

// Action types for the reducer
type NotificationAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'UPDATE_NOTIFICATION'; payload: { id: string; updates: Partial<Notification> } }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'SET_UNREAD_COUNT'; payload: number }
  | { type: 'SET_PREFERENCES'; payload: NotificationPreferences | null }
  | { type: 'SET_SUMMARY'; payload: NotificationSummary | null }
  | { type: 'SET_SUBSCRIBED'; payload: boolean };

// State interface
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  preferences: NotificationPreferences | null;
  summary: NotificationSummary | null;
  isSubscribed: boolean;
}

// Initial state
const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  preferences: null,
  summary: null,
  isSubscribed: false,
};

// Reducer function
function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload,
        unreadCount: action.payload.filter(n => !n.read).length,
        loading: false,
        error: null,
      };

    case 'ADD_NOTIFICATION':
      const newNotifications = [action.payload, ...state.notifications];
      return {
        ...state,
        notifications: newNotifications,
        unreadCount: newNotifications.filter(n => !n.read).length,
      };

    case 'UPDATE_NOTIFICATION':
      const updatedNotifications = state.notifications.map(n =>
        n.id === action.payload.id ? { ...n, ...action.payload.updates } : n
      );
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.read).length,
      };

    case 'REMOVE_NOTIFICATION':
      const filteredNotifications = state.notifications.filter(n => n.id !== action.payload);
      return {
        ...state,
        notifications: filteredNotifications,
        unreadCount: filteredNotifications.filter(n => !n.read).length,
      };

    case 'SET_UNREAD_COUNT':
      return { ...state, unreadCount: action.payload };

    case 'SET_PREFERENCES':
      return { ...state, preferences: action.payload };

    case 'SET_SUMMARY':
      return { ...state, summary: action.payload };

    case 'SET_SUBSCRIBED':
      return { ...state, isSubscribed: action.payload };

    default:
      return state;
  }
}

// Create context
const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

// Provider component props
interface NotificationProviderProps {
  children: React.ReactNode;
  userId: string;
  companyId?: string;
}

// Custom hook to use the notification context
export function useNotifications(): NotificationContextValue {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

// Provider component
export function NotificationProvider({ children, userId, companyId }: NotificationProviderProps) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const unsubscribersRef = useRef<(() => void)[]>([]);

  // Fetch notifications with optional filters
  const fetchNotifications = useCallback(async (filters?: NotificationFilters) => {
    if (!userId) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters) {
        if (filters.read !== undefined) {
          query = query.eq('read', filters.read);
        }
        if (filters.type && filters.type.length > 0) {
          query = query.in('type', filters.type);
        }
        if (filters.category && filters.category.length > 0) {
          query = query.in('category', filters.category);
        }
        if (filters.priority && filters.priority.length > 0) {
          query = query.in('priority', filters.priority);
        }
        if (filters.date_from) {
          query = query.gte('created_at', filters.date_from);
        }
        if (filters.date_to) {
          query = query.lte('created_at', filters.date_to);
        }
        if (filters.limit) {
          query = query.limit(filters.limit);
        }
        if (filters.offset) {
          query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
        }
      } else {
        // Default: fetch latest 50 notifications
        query = query.limit(50);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      dispatch({ type: 'SET_NOTIFICATIONS', payload: data || [] });

      // Fetch summary
      await fetchSummary();

    } catch (error) {
      console.error('Error fetching notifications:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch notifications' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [userId]);

  // Fetch notification summary
  const fetchSummary = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('type, category, priority, read')
        .eq('user_id', userId);

      if (error) throw error;

      const summary: NotificationSummary = {
        total: data.length,
        unread: data.filter(n => !n.read).length,
        high_priority: data.filter(n => n.priority === 'high' || n.priority === 'urgent').length,
        by_type: {} as Record<string, number>,
        by_category: {} as Record<NotificationCategory, number>,
        by_priority: {} as Record<NotificationPriority, number>,
      };

      // Count by type
      const typeCounts: Record<string, number> = {};
      data.forEach(n => {
        typeCounts[n.type] = (typeCounts[n.type] || 0) + 1;
      });
      summary.by_type = typeCounts;

      // Count by category
      const categoryCounts: Record<NotificationCategory, number> = {
        project: 0, task: 0, invoice: 0, system: 0, chat: 0, comment: 0, file: 0, milestone: 0, deadline: 0, integration: 0
      };
      data.forEach(n => {
        if (n.category in categoryCounts) {
          categoryCounts[n.category as NotificationCategory]++;
        }
      });
      summary.by_category = categoryCounts;

      // Count by priority
      const priorityCounts: Record<NotificationPriority, number> = {
        low: 0, medium: 0, high: 0, urgent: 0
      };
      data.forEach(n => {
        priorityCounts[n.priority as NotificationPriority]++;
      });
      summary.by_priority = priorityCounts;

      dispatch({ type: 'SET_SUMMARY', payload: summary });

    } catch (error) {
      console.error('Error fetching notification summary:', error);
    }
  }, [userId]);

  // Fetch user preferences
  const fetchPreferences = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error
        throw error;
      }

      dispatch({ type: 'SET_PREFERENCES', payload: data });

    } catch (error) {
      console.error('Error fetching notification preferences:', error);
    }
  }, [userId]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          read: true,
          clicked_at: new Date().toISOString()
        })
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) throw error;

      dispatch({
        type: 'UPDATE_NOTIFICATION',
        payload: { id: notificationId, updates: { read: true, clicked_at: new Date().toISOString() } }
      });

    } catch (error) {
      console.error('Error marking notification as read:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to mark notification as read' });
    }
  }, [userId]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;

      dispatch({
        type: 'SET_NOTIFICATIONS',
        payload: state.notifications.map(n => ({ ...n, read: true }))
      });

    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to mark all notifications as read' });
    }
  }, [userId, state.notifications]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) throw error;

      dispatch({ type: 'REMOVE_NOTIFICATION', payload: notificationId });

    } catch (error) {
      console.error('Error deleting notification:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete notification' });
    }
  }, [userId]);

  // Dismiss notification
  const dismissNotification = useCallback(async (notificationId: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ dismissed_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) throw error;

      dispatch({
        type: 'UPDATE_NOTIFICATION',
        payload: { id: notificationId, updates: { dismissed_at: new Date().toISOString() } }
      });

    } catch (error) {
      console.error('Error dismissing notification:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to dismiss notification' });
    }
  }, [userId]);

  // Update preferences
  const updatePreferences = useCallback(async (preferences: Partial<NotificationPreferences>) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      await fetchPreferences();

    } catch (error) {
      console.error('Error updating notification preferences:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update preferences' });
    }
  }, [userId, fetchPreferences]);

  // Refresh notifications
  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
    await fetchSummary();
    await fetchPreferences();
  }, [fetchNotifications, fetchSummary, fetchPreferences]);

  // Handle real-time notification received
  const handleRealtimeNotification = useCallback(async (payload: any) => {
    console.log('📨 Real-time notification received:', payload);

    switch (payload.eventType) {
      case 'INSERT':
        const newNotification = payload.new as Notification;
        dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });
        
        // Show push notification if enabled
        try {
          await showNotificationFromSystem(newNotification);
        } catch (error) {
          console.error('Error showing push notification:', error);
        }
        break;
      case 'UPDATE':
        dispatch({
          type: 'UPDATE_NOTIFICATION',
          payload: {
            id: payload.new.id,
            updates: payload.new as Partial<Notification>
          }
        });
        break;
      case 'DELETE':
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: payload.old.id });
        break;
    }
  }, []);

  // Subscribe to real-time notifications
  const subscribeToNotifications = useCallback(() => {
    if (!userId) return () => {};

    // Clean up existing subscriptions
    unsubscribersRef.current.forEach(unsubscribe => unsubscribe());
    unsubscribersRef.current = [];

    dispatch({ type: 'SET_SUBSCRIBED', payload: true });

    // Subscribe to notifications with real-time handlers
    const unsubscribeNotifications = subscribeToNotifications(userId, {
      onNotification: handleRealtimeNotification,
      onError: (error) => {
        console.error('Real-time notification error:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Real-time connection lost' });
        dispatch({ type: 'SET_SUBSCRIBED', payload: false });
      }
    });

    unsubscribersRef.current.push(unsubscribeNotifications);

    // Return unsubscribe function
    return () => {
      unsubscribersRef.current.forEach(unsubscribe => unsubscribe());
      unsubscribersRef.current = [];
      dispatch({ type: 'SET_SUBSCRIBED', payload: false });
    };
  }, [userId, handleRealtimeNotification]);

  // Request push notification permission
  const requestPushPermission = useCallback(async () => {
    try {
      const granted = await requestNotificationPermission();
      if (granted) {
        // Update preferences to enable push notifications
        await updatePreferences({ push_enabled: true });
      }
      return granted;
    } catch (error) {
      console.error('Error requesting push permission:', error);
      return false;
    }
  }, [updatePreferences]);

  // Initialize on mount
  useEffect(() => {
    if (userId) {
      refreshNotifications();
      const unsubscribe = subscribeToNotifications();

      return () => {
        unsubscribe();
      };
    }
  }, [userId, refreshNotifications, subscribeToNotifications]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unsubscribersRef.current.forEach(unsubscribe => unsubscribe());
    };
  }, []);

  // Context value
  const contextValue: NotificationContextValue = {
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    loading: state.loading,
    error: state.error,
    preferences: state.preferences,
    summary: state.summary,

    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    dismissNotification,
    updatePreferences,
    refreshNotifications,

    subscribeToNotifications,
    isSubscribed: state.isSubscribed,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}
