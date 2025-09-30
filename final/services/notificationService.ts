/**
 * Real-time notification service with WebSocket support and offline queuing
 */

import type { Notification, User } from '../types';
import { NotificationType } from '../types';


// Local action type for Web Notification buttons
export type NotificationAction = { action: string; title: string; icon?: string };

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: NotificationAction[];
  data?: any;
}

export interface NotificationSubscription {
  userId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export class NotificationService {
  private static instance: NotificationService;
  private websocket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private subscriptions = new Set<(notification: Notification) => void>();
  private offlineQueue: Notification[] = [];
  private isOnline = navigator.onLine;

  private constructor() {
    this.setupEventListeners();
    this.requestPermission();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // WebSocket connection management
  connect(userId: string): void {
    if (this.websocket?.readyState === WebSocket.OPEN) {
      return;
    }

    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/notifications/${userId}`;

    try {
      this.websocket = new WebSocket(wsUrl);

      this.websocket.onopen = () => {
        console.log('Notification WebSocket connected');
        this.reconnectAttempts = 0;
        this.processOfflineQueue();
      };

      this.websocket.onmessage = (event) => {
        try {
          const notification: Notification = JSON.parse(event.data);
          this.handleIncomingNotification(notification);
        } catch (error) {
          console.error('Failed to parse notification:', error);
        }
      };

      this.websocket.onclose = () => {
        console.log('Notification WebSocket disconnected');
        this.scheduleReconnect(userId);
      };

      this.websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.scheduleReconnect(userId);
    }
  }

  disconnect(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }

  // Subscription management
  subscribe(callback: (notification: Notification) => void): () => void {
    this.subscriptions.add(callback);

    return () => {
      this.subscriptions.delete(callback);
    };
  }

  // Send notification
  async sendNotification(notification: Partial<Notification>): Promise<void> {
    const fullNotification: Notification = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification,
    } as Notification;

    if (this.isOnline && this.websocket?.readyState === WebSocket.OPEN) {
      try {
        this.websocket.send(JSON.stringify({
          type: 'send_notification',
          notification: fullNotification,
        }));
      } catch (error) {
        console.error('Failed to send notification via WebSocket:', error);
        this.queueOfflineNotification(fullNotification);
      }
    } else {
      this.queueOfflineNotification(fullNotification);
    }
  }

  // Browser notification
  async showBrowserNotification(options: NotificationOptions): Promise<void> {
    if (!('Notification' in window)) {
      console.warn('Browser notifications not supported');
      return;
    }

    if (Notification.permission !== 'granted') {
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        return;
      }
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        badge: options.badge,
        tag: options.tag,
        requireInteraction: options.requireInteraction,
        data: options.data,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();

        // Handle notification click based on data
        if (options.data?.url) {
          window.location.href = options.data.url;
        }
      };

      // Auto-close after 5 seconds unless requireInteraction is true
      if (!options.requireInteraction) {
        setTimeout(() => notification.close(), 5000);
      }
    } catch (error) {
      console.error('Failed to show browser notification:', error);
    }
  }

  // Push notification subscription
  async subscribeToPush(): Promise<NotificationSubscription | null> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(process.env.VAPID_PUBLIC_KEY || ''),
      });

      const subscriptionData: NotificationSubscription = {
        userId: '', // Will be set by caller
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: this.arrayBufferToBase64(subscription.getKey('auth')!),
        },
      };

      return subscriptionData;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  // Notification templates
  createTaskNotification(taskTitle: string, projectName: string, assigneeId: string): Partial<Notification> {
    return {
      type: NotificationType.TASK_ASSIGNED,
      title: 'New Task Assigned',
      message: `You have been assigned to "${taskTitle}" in ${projectName}`,
      userId: assigneeId,
      metadata: {
        taskTitle,
        projectName,
        view: 'all-tasks',
      },
    };
  }

  createSafetyAlertNotification(incidentType: string, location: string, companyId: string): Partial<Notification> {
    return {
      type: NotificationType.SAFETY_ALERT,
      title: 'Safety Alert',
      message: `${incidentType} reported at ${location}`,
      metadata: {
        incidentType,
        location,
        view: 'safety',
        priority: 'high',
      },
    };
  }

  createApprovalNotification(itemType: string, itemName: string, approverId: string): Partial<Notification> {
    return {
      type: NotificationType.APPROVAL_REQUEST,
      title: 'Approval Required',
      message: `${itemType} "${itemName}" requires your approval`,
      userId: approverId,
      metadata: {
        itemType,
        itemName,
        view: 'approvals',
      },
    };
  }

  // Private methods
  private async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'default') {
      return await Notification.requestPermission();
    }

    return Notification.permission;
  }

  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processOfflineQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private scheduleReconnect(userId: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.connect(userId);
    }, delay);
  }

  private handleIncomingNotification(notification: Notification): void {
    // Notify all subscribers
    this.subscriptions.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error in notification callback:', error);
      }
    });

    // Show browser notification if appropriate
    if (this.shouldShowBrowserNotification(notification)) {
      this.showBrowserNotification({
        title: notification.title,
        body: notification.message,
        data: { notificationId: notification.id, ...notification.metadata },
      });
    }
  }

  private shouldShowBrowserNotification(notification: Notification): boolean {
    // Don't show if document is visible and user is active
    if (!document.hidden) {
      return false;
    }

    // Show for high-priority notifications
    if (notification.metadata?.priority === 'high') {
      return true;
    }

    // Show for safety alerts
    if (notification.type === NotificationType.SAFETY_ALERT) {
      return true;
    }

    return false;
  }

  private queueOfflineNotification(notification: Notification): void {
    this.offlineQueue.push(notification);

    // Limit queue size
    if (this.offlineQueue.length > 100) {
      this.offlineQueue.shift();
    }
  }

  private processOfflineQueue(): void {
    if (this.offlineQueue.length === 0) return;

    const queue = [...this.offlineQueue];
    this.offlineQueue = [];

    queue.forEach(notification => {
      this.sendNotification(notification);
    });
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';

    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    return window.btoa(binary);
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
