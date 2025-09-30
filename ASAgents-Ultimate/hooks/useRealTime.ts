import { useEffect, useState, useCallback, useRef } from 'react';
import { realTimeClient, RealTimeEvent, EventCallback } from '../services/realTimeClient';
import { useAuth } from '../contexts/AuthContext';

export interface UseRealTimeOptions {
  autoConnect?: boolean;
  subscriptions?: string[];
}

export interface UseRealTimeReturn {
  isConnected: boolean;
  subscribe: (eventType: string, callback: EventCallback) => () => void;
  unsubscribe: (eventType: string) => void;
  requestData: (dataType: string, filters?: any) => Promise<any>;
  connect: () => void;
  disconnect: () => void;
}

/**
 * Hook for managing real-time WebSocket connections and subscriptions
 */
export const useRealTime = (options: UseRealTimeOptions = {}): UseRealTimeReturn => {
  const { autoConnect = true, subscriptions = [] } = options;
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const subscriptionsRef = useRef<Map<string, () => void>>(new Map());
  const connectionUnsubscribeRef = useRef<(() => void) | null>(null);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (user && user.companyId) {
      // Extract tenant ID from user context (assuming it's stored in companyId for now)
      const tenantId = parseInt(user.companyId) || 1;
      realTimeClient.connect(user, tenantId);
    }
  }, [user]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    realTimeClient.disconnect();
  }, []);

  // Subscribe to event type
  const subscribe = useCallback((eventType: string, callback: EventCallback): (() => void) => {
    const unsubscribe = realTimeClient.subscribe(eventType, callback);
    subscriptionsRef.current.set(eventType, unsubscribe);
    return unsubscribe;
  }, []);

  // Unsubscribe from event type
  const unsubscribe = useCallback((eventType: string) => {
    const unsubscribeFn = subscriptionsRef.current.get(eventType);
    if (unsubscribeFn) {
      unsubscribeFn();
      subscriptionsRef.current.delete(eventType);
    }
  }, []);

  // Request data from server
  const requestData = useCallback((dataType: string, filters?: any): Promise<any> => {
    return realTimeClient.requestData(dataType, filters);
  }, []);

  // Set up connection status monitoring
  useEffect(() => {
    connectionUnsubscribeRef.current = realTimeClient.onConnectionChange(setIsConnected);

    return () => {
      if (connectionUnsubscribeRef.current) {
        connectionUnsubscribeRef.current();
      }
    };
  }, []);

  // Auto-connect when user is available
  useEffect(() => {
    if (autoConnect && user) {
      connect();
    }

    return () => {
      if (autoConnect) {
        disconnect();
      }
    };
  }, [autoConnect, user, connect, disconnect]);

  // Set up initial subscriptions
  useEffect(() => {
    subscriptions.forEach(eventType => {
      if (!subscriptionsRef.current.has(eventType)) {
        const unsubscribe = realTimeClient.subscribe(eventType, (event) => {
          console.log(`Received ${eventType} event:`, event);
        });
        subscriptionsRef.current.set(eventType, unsubscribe);
      }
    });

    // Cleanup function to unsubscribe from all
    return () => {
      subscriptionsRef.current.forEach(unsubscribeFn => unsubscribeFn());
      subscriptionsRef.current.clear();
    };
  }, [subscriptions]);

  return {
    isConnected,
    subscribe,
    unsubscribe,
    requestData,
    connect,
    disconnect
  };
};

/**
 * Hook for subscribing to specific real-time events
 */
export const useRealTimeEvent = (
  eventType: string,
  callback: EventCallback,
  dependencies: any[] = []
): boolean => {
  const { isConnected, subscribe } = useRealTime({ autoConnect: true });

  useEffect(() => {
    if (isConnected) {
      const unsubscribe = subscribe(eventType, callback);
      return unsubscribe;
    }
  }, [isConnected, eventType, subscribe, ...dependencies]);

  return isConnected;
};

/**
 * Hook for real-time dashboard data
 */
export const useRealTimeDashboard = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { requestData } = useRealTime({ autoConnect: true });

  // Subscribe to dashboard-related events
  useRealTimeEvent('project_updated', (event) => {
    console.log('Project updated:', event);
    // Refresh dashboard data
    refreshDashboard();
  });

  useRealTimeEvent('task_updated', (event) => {
    console.log('Task updated:', event);
    // Refresh dashboard data
    refreshDashboard();
  });

  useRealTimeEvent('expense_created', (event) => {
    console.log('Expense created:', event);
    // Refresh dashboard data
    refreshDashboard();
  });

  const refreshDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const data = await requestData('dashboard_metrics');
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to refresh dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [requestData]);

  // Initial data load
  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  return {
    dashboardData,
    loading,
    refreshDashboard
  };
};

/**
 * Hook for real-time notifications
 */
export const useRealTimeNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const { requestData } = useRealTime({ autoConnect: true });

  // Subscribe to notification events
  useRealTimeEvent('notification_created', (event) => {
    setNotifications(prev => [event.data, ...prev]);
  });

  // Load initial notifications
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await requestData('notifications');
        setNotifications(data || []);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    };

    loadNotifications();
  }, [requestData]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    unreadCount: notifications.filter(n => !n.read).length,
    markAsRead,
    clearAll
  };
};
