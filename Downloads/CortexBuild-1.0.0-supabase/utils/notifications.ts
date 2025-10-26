// utils/notifications.ts
import { supabase } from './supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'system' | 'project' | 'task' | 'safety' | 'time' | 'expense';
  is_read: boolean;
  action_url?: string;
  action_text?: string;
  metadata: Record<string, any>;
  created_at: string;
  read_at?: string;
}

let notificationChannel: RealtimeChannel | null = null;

export const subscribeToNotifications = (
  userId: string,
  onNotification: (notification: Notification) => void
) => {
  if (notificationChannel) {
    notificationChannel.unsubscribe();
  }

  notificationChannel = supabase
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
        onNotification(payload.new as Notification);
      }
    )
    .subscribe();

  return () => {
    if (notificationChannel) {
      notificationChannel.unsubscribe();
      notificationChannel = null;
    }
  };
};

export const fetchNotifications = async (
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<Notification[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data;
};

export const markNotificationAsRead = async (notificationId: string) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', notificationId);

  if (error) throw error;
};

export const markAllNotificationsAsRead = async (userId: string) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) throw error;
};

export const deleteNotification = async (notificationId: string) => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);

  if (error) throw error;
};

export const getUnreadCount = async (userId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) throw error;
  return count || 0;
};

export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: Notification['type'] = 'info',
  category: Notification['category'] = 'system',
  actionUrl?: string,
  actionText?: string,
  metadata: Record<string, any> = {}
) => {
  const { data, error } = await supabase
    .from('notifications')
    .insert([{
      user_id: userId,
      title,
      message,
      type,
      category,
      action_url: actionUrl,
      action_text: actionText,
      metadata
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};
