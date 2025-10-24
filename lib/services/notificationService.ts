/**
 * Notification Service
 * Handles real-time notifications using Supabase subscriptions
 * Features: CRUD operations, real-time updates, preferences management
 */

import { supabase } from '../supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

export interface Notification {
  id: string;
  user_id: string;
  message: string;
  read?: boolean;
  link?: Record<string, any>;
  timestamp?: string;
  created_at?: string;
  updated_at?: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  task_update_enabled: boolean;
  mention_enabled: boolean;
  system_alert_enabled: boolean;
  comment_enabled: boolean;
  project_update_enabled: boolean;
  team_update_enabled: boolean;
  document_update_enabled: boolean;
  payment_update_enabled: boolean;
  email_notifications_enabled: boolean;
  push_notifications_enabled: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  created_at: string;
  updated_at: string;
}

export class NotificationService {
  private channel: RealtimeChannel | null = null;
  private callbacks: Map<string, (notification: Notification) => void> = new Map();

  /**
   * Subscribe to real-time notifications for a user
   */
  subscribeToNotifications(
    userId: string,
    callback: (notification: Notification) => void
  ): () => void {
    // Store callback
    this.callbacks.set(userId, callback);

    // Create channel for this user
    this.channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const notification = payload.new as Notification;
          callback(notification);
          console.log('✅ New notification received:', notification.message);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Subscribed to notifications for user:', userId);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Channel error:', status);
        }
      });

    // Return unsubscribe function
    return () => this.unsubscribe();
  }

  /**
   * Fetch notifications for a user
   */
  async getNotifications(
    userId: string,
    limit = 50,
    offset = 0
  ): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('archived', false)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false)
        .eq('archived', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;
      console.log('✅ Notification marked as read:', notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;
      console.log('✅ All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      throw error;
    }
  }

  /**
   * Archive a notification
   */
  async archiveNotification(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ archived: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;
      console.log('✅ Notification archived:', notificationId);
    } catch (error) {
      console.error('Error archiving notification:', error);
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      console.log('✅ Notification deleted:', notificationId);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Get user notification preferences
   */
  async getPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
      return data || null;
    } catch (error) {
      console.error('Error fetching preferences:', error);
      return null;
    }
  }

  /**
   * Update user notification preferences
   */
  async updatePreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .update({
          ...preferences,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;
      console.log('✅ Preferences updated');
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }

  /**
   * Create a new notification (admin/system use)
   */
  async createNotification(
    userId: string,
    message: string,
    link?: Record<string, any>
  ): Promise<Notification | null> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([
          {
            user_id: userId,
            message,
            link: link || {},
            timestamp: new Date().toISOString(),
            read: false
          }
        ])
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Notification created:', message);
      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from notifications
   */
  unsubscribe(): void {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
      console.log('✅ Unsubscribed from notifications');
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

