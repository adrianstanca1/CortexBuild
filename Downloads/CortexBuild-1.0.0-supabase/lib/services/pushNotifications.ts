/**
 * Push Notification Service
 * Handles browser push notifications with permission management and user preferences
 */

import { supabase } from '../supabase/client';
import type { Notification, NotificationPreferences, PushNotificationPayload } from '../../types/notifications';

export interface PushNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  silent?: boolean;
  tag?: string;
  timestamp?: number;
}

export interface NotificationPermissionState {
  granted: boolean;
  denied: boolean;
  default: boolean;
  state: NotificationPermission;
}

class PushNotificationService {
  private permission: NotificationPermission = 'default';
  private swRegistration: ServiceWorkerRegistration | null = null;
  private vapidPublicKey: string | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.warn('Push notifications not supported in this browser');
      return;
    }

    // Get current permission state
    this.permission = Notification.permission;

    // Listen for permission changes
    if ('permissions' in navigator) {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'notifications' });
        permissionStatus.onchange = () => {
          this.permission = Notification.permission;
          console.log('Notification permission changed:', this.permission);
        };
      } catch (error) {
        console.warn('Could not query notification permissions:', error);
      }
    }

    // Register service worker for background notifications (if available)
    this.registerServiceWorker();
  }

  private async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        this.swRegistration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered for push notifications');
      } catch (error) {
        console.warn('Service Worker registration failed:', error);
      }
    }
  }

  // Request notification permission
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    if (this.permission === 'denied') {
      console.warn('Notification permission denied');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      
      if (permission === 'granted') {
        console.log('Notification permission granted');
        // Update user preferences in database
        await this.updatePushEnabled(true);
        return true;
      } else {
        console.log('Notification permission denied');
        await this.updatePushEnabled(false);
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Check if notifications are supported and permitted
  isSupported(): boolean {
    return 'Notification' in window;
  }

  getPermissionState(): NotificationPermissionState {
    return {
      granted: this.permission === 'granted',
      denied: this.permission === 'denied',
      default: this.permission === 'default',
      state: this.permission
    };
  }

  // Show a notification
  async show(options: PushNotificationOptions): Promise<string | null> {
    if (this.permission !== 'granted') {
      console.warn('Cannot show notification: permission not granted');
      return null;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/logo.png',
        badge: options.badge || '/badge.png',
        image: options.image,
        data: options.data,
        actions: options.actions,
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
        tag: options.tag || 'cortexbuild-notification',
        timestamp: options.timestamp || Date.now(),
        renotify: true
      });

      // Handle notification click
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        
        // Handle action if data contains action info
        if (options.data?.action_url) {
          window.location.href = options.data.action_url;
        } else if (options.data?.notification_id) {
          // Mark notification as read if it's from our system
          this.markNotificationAsRead(options.data.notification_id);
        }
        
        notification.close();
      };

      // Handle notification close
      notification.onclose = () => {
        if (options.data?.notification_id) {
          this.markNotificationAsDismissed(options.data.notification_id);
        }
      };

      // Auto-close after 5 seconds unless requireInteraction is true
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

      console.log('Notification shown:', options.title);
      return notification.tag || 'notification';

    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  }

  // Show notification from our notification system
  async showFromNotification(notification: Notification): Promise<string | null> {
    // Check user preferences
    const preferences = await this.getUserPreferences();
    if (!preferences?.push_enabled) {
      return null;
    }

    // Check if this category/channel is enabled
    const categoryPrefs = preferences.categories?.[notification.category];
    if (!categoryPrefs?.push) {
      return null;
    }

    // Check quiet hours
    if (preferences.quiet_hours_enabled && this.isInQuietHours(preferences)) {
      console.log('Notification blocked: quiet hours active');
      return null;
    }

    // Check rate limiting
    if (await this.isRateLimited(preferences)) {
      console.log('Notification blocked: rate limit exceeded');
      return null;
    }

    const options: PushNotificationOptions = {
      title: notification.title,
      body: notification.message,
      icon: '/logo.png',
      badge: '/badge.png',
      data: {
        notification_id: notification.id,
        action_url: notification.action_url,
        category: notification.category,
        priority: notification.priority
      },
      tag: `notification-${notification.id}`,
      requireInteraction: notification.priority === 'urgent' || notification.priority === 'high',
      timestamp: new Date(notification.created_at).getTime()
    };

    // Add priority-specific styling
    if (notification.priority === 'urgent') {
      options.silent = false;
      options.requireInteraction = true;
    }

    return this.show(options);
  }

  // Update push notification enabled status in database
  private async updatePushEnabled(enabled: boolean) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          push_enabled: enabled,
          updated_at: new Date().toISOString()
        });

    } catch (error) {
      console.error('Error updating push preferences:', error);
    }
  }

  // Get user preferences
  private async getUserPreferences(): Promise<NotificationPreferences | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;

    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return null;
    }
  }

  // Check if current time is in quiet hours
  private isInQuietHours(preferences: NotificationPreferences): boolean {
    if (!preferences.quiet_hours_enabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const startTime = parseInt(preferences.quiet_hours_start.replace(':', ''));
    const endTime = parseInt(preferences.quiet_hours_end.replace(':', ''));

    if (startTime <= endTime) {
      // Same day range (e.g., 08:00 to 22:00)
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Overnight range (e.g., 22:00 to 08:00)
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  // Check rate limiting
  private async isRateLimited(preferences: NotificationPreferences): Promise<boolean> {
    if (!preferences.max_notifications_per_hour) return false;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Get notifications from the last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

      const { count, error } = await supabase
        .from('notification_channels')
        .select('*', { count: 'exact', head: true })
        .eq('channel', 'push')
        .eq('status', 'sent')
        .gte('sent_at', oneHourAgo);

      if (error) {
        console.error('Error checking rate limit:', error);
        return false;
      }

      return (count || 0) >= preferences.max_notifications_per_hour;

    } catch (error) {
      console.error('Error checking rate limit:', error);
      return false;
    }
  }

  // Mark notification as read when clicked
  private async markNotificationAsRead(notificationId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('notifications')
        .update({
          read: true,
          clicked_at: new Date().toISOString()
        })
        .eq('id', notificationId)
        .eq('user_id', user.id);

    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // Mark notification as dismissed when closed
  private async markNotificationAsDismissed(notificationId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('notifications')
        .update({
          dismissed_at: new Date().toISOString()
        })
        .eq('id', notificationId)
        .eq('user_id', user.id);

    } catch (error) {
      console.error('Error marking notification as dismissed:', error);
    }
  }

  // Update notification channel delivery status
  async updateDeliveryStatus(
    notificationId: string,
    status: 'sent' | 'delivered' | 'failed',
    errorMessage?: string
  ) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'sent') {
        updateData.sent_at = new Date().toISOString();
      } else if (status === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      } else if (status === 'failed') {
        updateData.failed_at = new Date().toISOString();
        if (errorMessage) {
          updateData.error_message = errorMessage;
        }
      }

      await supabase
        .from('notification_channels')
        .update(updateData)
        .eq('notification_id', notificationId)
        .eq('channel', 'push');

    } catch (error) {
      console.error('Error updating delivery status:', error);
    }
  }

  // Get notification history
  async getNotificationHistory(limit: number = 50): Promise<Notification[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];

    } catch (error) {
      console.error('Error fetching notification history:', error);
      return [];
    }
  }

  // Clear all notifications
  async clearAll() {
    if (this.permission !== 'granted') return;

    // Close any open notifications
    // Note: This is limited by browser API - we can't programmatically close notifications
    console.log('Clearing all notifications (browser limitations apply)');
  }

  // Test notification
  async test(): Promise<boolean> {
    const permission = await this.requestPermission();
    if (!permission) return false;

    return !!(await this.show({
      title: 'Test Notification',
      body: 'This is a test notification from CortexBuild',
      icon: '/logo.png',
      tag: 'test-notification'
    }));
  }

  // Setup VAPID keys for web push (for service worker)
  setupVAPID(vapidPublicKey: string) {
    this.vapidPublicKey = vapidPublicKey;
  }

  // Subscribe to web push notifications (for service worker)
  async subscribeToWebPush(): Promise<PushSubscription | null> {
    if (!this.swRegistration || !this.vapidPublicKey) {
      console.warn('Service worker or VAPID key not available');
      return null;
    }

    try {
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.vapidPublicKey
      });

      console.log('Web push subscription created:', subscription);
      return subscription;

    } catch (error) {
      console.error('Error subscribing to web push:', error);
      return null;
    }
  }

  // Unsubscribe from web push notifications
  async unsubscribeFromWebPush() {
    if (!this.swRegistration) return;

    try {
      const subscription = await this.swRegistration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        console.log('Web push subscription removed');
      }
    } catch (error) {
      console.error('Error unsubscribing from web push:', error);
    }
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();

// Convenience functions
export async function requestNotificationPermission(): Promise<boolean> {
  return pushNotificationService.requestPermission();
}

export async function showNotification(options: PushNotificationOptions): Promise<string | null> {
  return pushNotificationService.show(options);
}

export async function showNotificationFromSystem(notification: Notification): Promise<string | null> {
  return pushNotificationService.showFromNotification(notification);
}

export function isNotificationSupported(): boolean {
  return pushNotificationService.isSupported();
}

export function getNotificationPermission(): NotificationPermissionState {
  return pushNotificationService.getPermissionState();
}

export async function testNotification(): Promise<boolean> {
  return pushNotificationService.test();
}
