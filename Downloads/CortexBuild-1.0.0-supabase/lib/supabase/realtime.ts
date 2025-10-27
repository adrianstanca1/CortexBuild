// Enhanced Supabase Realtime integration for notifications and other features

import { supabase } from './client';
import type { RealtimeEvent, RealtimePayload } from './types';

export interface RealtimeNotificationPayload extends RealtimePayload {
  new: {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: string;
    category: string;
    priority: string;
    read: boolean;
    created_at: string;
    [key: string]: any;
  };
  old: {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: string;
    category: string;
    priority: string;
    read: boolean;
    created_at: string;
    [key: string]: any;
  };
}

export interface RealtimeTaskPayload extends RealtimePayload {
  new: {
    id: string;
    title: string;
    status: string;
    assignee_id?: string;
    project_id?: string;
    due_date?: string;
    created_at: string;
    updated_at: string;
    [key: string]: any;
  };
}

export interface RealtimeProjectPayload extends RealtimePayload {
  new: {
    id: string;
    name: string;
    status: string;
    manager_id?: string;
    start_date?: string;
    end_date?: string;
    created_at: string;
    updated_at: string;
    [key: string]: any;
  };
}

type NotificationHandlers = {
  onNotification?: (payload: RealtimeNotificationPayload) => void;
  onTask?: (payload: RealtimeTaskPayload) => void;
  onProject?: (payload: RealtimeProjectPayload) => void;
  onError?: (error: Error) => void;
};

type RealtimeChannel = ReturnType<typeof supabase.channel>;

class RealtimeManager {
  private channels: Map<string, RealtimeChannel> = new Map();
  private handlers: Map<string, NotificationHandlers> = new Map();
  private reconnectAttempts: Map<string, number> = new Map();
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second

  // Subscribe to notifications for a specific user
  subscribeToNotifications(userId: string, handlers: NotificationHandlers): () => void {
    const channelName = `notifications:${userId}`;
    
    // Clean up existing subscription
    this.unsubscribe(channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('📨 Real-time notification:', payload);
          
          if (handlers.onNotification) {
            handlers.onNotification(payload as RealtimeNotificationPayload);
          }
        }
      )
      .subscribe((status) => {
        console.log(`📡 Notification subscription status for ${userId}:`, status);

        if (status === 'SUBSCRIBED') {
          this.reconnectAttempts.set(channelName, 0);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          this.handleReconnection(channelName, userId, handlers);
        } else if (status === 'CLOSED') {
          console.log(`🔌 Notification channel closed for ${userId}`);
        }
      });

    this.channels.set(channelName, channel);
    this.handlers.set(channelName, handlers);

    return () => this.unsubscribe(channelName);
  }

  // Subscribe to task updates for a specific user or company
  subscribeToTasks(userId: string, companyId: string, handlers: NotificationHandlers): () => void {
    const channelName = `tasks:${userId}:${companyId}`;
    
    // Clean up existing subscription
    this.unsubscribe(channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `assignee_id=eq.${userId}`,
        },
        (payload) => {
          console.log('📋 Real-time task update:', payload);
          
          if (handlers.onTask) {
            handlers.onTask(payload as RealtimeTaskPayload);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `company_id=eq.${companyId}`,
        },
        (payload) => {
          console.log('📋 Real-time company task update:', payload);
          
          if (handlers.onTask) {
            handlers.onTask(payload as RealtimeTaskPayload);
          }
        }
      )
      .subscribe((status) => {
        console.log(`📡 Task subscription status for ${userId}:`, status);

        if (status === 'SUBSCRIBED') {
          this.reconnectAttempts.set(channelName, 0);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          this.handleReconnection(channelName, userId, handlers);
        }
      });

    this.channels.set(channelName, channel);
    this.handlers.set(channelName, handlers);

    return () => this.unsubscribe(channelName);
  }

  // Subscribe to project updates for a specific user or company
  subscribeToProjects(userId: string, companyId: string, handlers: NotificationHandlers): () => void {
    const channelName = `projects:${userId}:${companyId}`;
    
    // Clean up existing subscription
    this.unsubscribe(channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `manager_id=eq.${userId}`,
        },
        (payload) => {
          console.log('🏗️ Real-time project update:', payload);
          
          if (handlers.onProject) {
            handlers.onProject(payload as RealtimeProjectPayload);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `company_id=eq.${companyId}`,
        },
        (payload) => {
          console.log('🏗️ Real-time company project update:', payload);
          
          if (handlers.onProject) {
            handlers.onProject(payload as RealtimeProjectPayload);
          }
        }
      )
      .subscribe((status) => {
        console.log(`📡 Project subscription status for ${userId}:`, status);

        if (status === 'SUBSCRIBED') {
          this.reconnectAttempts.set(channelName, 0);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          this.handleReconnection(channelName, userId, handlers);
        }
      });

    this.channels.set(channelName, channel);
    this.handlers.set(channelName, handlers);

    return () => this.unsubscribe(channelName);
  }

  // Subscribe to multiple channels at once
  subscribeToMultiple(
    userId: string,
    companyId: string,
    handlers: NotificationHandlers
  ): (() => void)[] {
    const unsubscribers: (() => void)[] = [];

    // Subscribe to notifications
    if (handlers.onNotification) {
      unsubscribers.push(this.subscribeToNotifications(userId, handlers));
    }

    // Subscribe to tasks
    if (handlers.onTask) {
      unsubscribers.push(this.subscribeToTasks(userId, companyId, handlers));
    }

    // Subscribe to projects
    if (handlers.onProject) {
      unsubscribers.push(this.subscribeToProjects(userId, companyId, handlers));
    }

    return unsubscribers;
  }

  // Handle reconnection with exponential backoff
  private handleReconnection(channelName: string, userId: string, handlers: NotificationHandlers) {
    const attempts = this.reconnectAttempts.get(channelName) || 0;
    
    if (attempts >= this.maxReconnectAttempts) {
      console.error(`❌ Max reconnection attempts reached for ${channelName}`);
      if (handlers.onError) {
        handlers.onError(new Error(`Failed to reconnect to ${channelName} after ${this.maxReconnectAttempts} attempts`));
      }
      return;
    }

    this.reconnectAttempts.set(channelName, attempts + 1);
    const delay = this.reconnectDelay * Math.pow(2, attempts); // Exponential backoff

    console.log(`🔄 Attempting to reconnect ${channelName} in ${delay}ms (attempt ${attempts + 1})`);

    setTimeout(() => {
      // Determine which type of subscription to recreate based on channel name
      if (channelName.startsWith('notifications:')) {
        this.subscribeToNotifications(userId, handlers);
      } else if (channelName.startsWith('tasks:')) {
        const [, , , companyId] = channelName.split(':');
        this.subscribeToTasks(userId, companyId, handlers);
      } else if (channelName.startsWith('projects:')) {
        const [, , , companyId] = channelName.split(':');
        this.subscribeToProjects(userId, companyId, handlers);
      }
    }, delay);
  }

  // Unsubscribe from a specific channel
  private unsubscribe(channelName: string) {
    const channel = this.channels.get(channelName);
    if (channel) {
      channel.unsubscribe();
      this.channels.delete(channelName);
      this.handlers.delete(channelName);
      this.reconnectAttempts.delete(channelName);
      console.log(`🔌 Unsubscribed from ${channelName}`);
    }
  }

  // Unsubscribe from all channels
  unsubscribeFromAll() {
    this.channels.forEach((channel, channelName) => {
      this.unsubscribe(channelName);
    });
  }

  // Get connection status
  getConnectionStatus(): { [channelName: string]: string } {
    const status: { [channelName: string]: string } = {};
    
    this.channels.forEach((channel, channelName) => {
      // Note: Supabase doesn't expose connection status directly
      // This is a placeholder - in a real implementation you'd track this
      status[channelName] = 'connected';
    });
    
    return status;
  }

  // Force reconnection for all channels
  forceReconnect() {
    console.log('🔄 Forcing reconnection for all channels...');
    this.unsubscribeFromAll();
    
    // Re-subscribe to all channels with their handlers
    this.handlers.forEach((handlers, channelName) => {
      const parts = channelName.split(':');
      const type = parts[0];
      const userId = parts[1];
      
      if (type === 'notifications') {
        this.subscribeToNotifications(userId, handlers);
      } else if (type === 'tasks' && parts[2]) {
        this.subscribeToTasks(userId, parts[2], handlers);
      } else if (type === 'projects' && parts[2]) {
        this.subscribeToProjects(userId, parts[2], handlers);
      }
    });
  }
}

// Export singleton instance
export const realtimeManager = new RealtimeManager();

// Convenience functions
export function subscribeToNotifications(userId: string, handlers: NotificationHandlers): () => void {
  return realtimeManager.subscribeToNotifications(userId, handlers);
}

export function subscribeToTasks(userId: string, companyId: string, handlers: NotificationHandlers): () => void {
  return realtimeManager.subscribeToTasks(userId, companyId, handlers);
}

export function subscribeToProjects(userId: string, companyId: string, handlers: NotificationHandlers): () => void {
  return realtimeManager.subscribeToProjects(userId, companyId, handlers);
}

export function subscribeToMultiple(
  userId: string,
  companyId: string,
  handlers: NotificationHandlers
): (() => void)[] {
  return realtimeManager.subscribeToMultiple(userId, companyId, handlers);
}

export function unsubscribeFromMultiple(unsubscribers: (() => void)[]): void {
  unsubscribers.forEach(unsubscribe => unsubscribe());
}

// Export the manager for advanced usage
export { RealtimeManager };
