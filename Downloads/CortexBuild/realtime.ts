/**
 * Realtime API
 * 
 * Real-time subscriptions and notifications using Supabase Realtime
 */

import { supabase } from '../supabaseClient';
import { RealtimeChannel } from '@supabase/supabase-js';

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE';

export interface RealtimeSubscription {
    channel: RealtimeChannel;
    unsubscribe: () => void;
}

export interface NotificationPayload {
    id: string;
    user_id: string;
    company_id: string;
    type: string;
    title: string;
    message: string;
    data?: any;
    read: boolean;
    created_at: string;
}

export interface ActivityPayload {
    id: string;
    user_id: string;
    company_id: string;
    action: string;
    resource_type: string;
    resource_id: string;
    metadata?: any;
    created_at: string;
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

/**
 * Subscribe to user notifications
 */
export const subscribeToNotifications = (
    userId: string,
    callback: (payload: NotificationPayload) => void
): RealtimeSubscription => {
    const channel = supabase
        .channel(`notifications:${userId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${userId}`,
            },
            (payload) => {
                console.log('📬 New notification:', payload);
                callback(payload.new as NotificationPayload);
            }
        )
        .subscribe();

    return {
        channel,
        unsubscribe: () => {
            channel.unsubscribe();
        },
    };
};

/**
 * Subscribe to notification updates (read status changes)
 */
export const subscribeToNotificationUpdates = (
    userId: string,
    callback: (payload: NotificationPayload) => void
): RealtimeSubscription => {
    const channel = supabase
        .channel(`notification-updates:${userId}`)
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${userId}`,
            },
            (payload) => {
                console.log('📝 Notification updated:', payload);
                callback(payload.new as NotificationPayload);
            }
        )
        .subscribe();

    return {
        channel,
        unsubscribe: () => {
            channel.unsubscribe();
        },
    };
};

// ============================================================================
// ACTIVITY FEED
// ============================================================================

/**
 * Subscribe to company activity
 */
export const subscribeToCompanyActivity = (
    companyId: string,
    callback: (payload: ActivityPayload) => void
): RealtimeSubscription => {
    const channel = supabase
        .channel(`activity:${companyId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'audit_logs',
                filter: `company_id=eq.${companyId}`,
            },
            (payload) => {
                console.log('📊 New activity:', payload);
                callback(payload.new as ActivityPayload);
            }
        )
        .subscribe();

    return {
        channel,
        unsubscribe: () => {
            channel.unsubscribe();
        },
    };
};

/**
 * Subscribe to platform-wide activity (super admin only)
 */
export const subscribeToPlatformActivity = (
    callback: (payload: ActivityPayload) => void
): RealtimeSubscription => {
    const channel = supabase
        .channel('platform-activity')
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'audit_logs',
            },
            (payload) => {
                console.log('🌐 Platform activity:', payload);
                callback(payload.new as ActivityPayload);
            }
        )
        .subscribe();

    return {
        channel,
        unsubscribe: () => {
            channel.unsubscribe();
        },
    };
};

// ============================================================================
// TASKS & PROJECTS
// ============================================================================

/**
 * Subscribe to task changes
 */
export const subscribeToTasks = (
    companyId: string,
    event: RealtimeEvent | '*',
    callback: (payload: any) => void
): RealtimeSubscription => {
    const channel = supabase
        .channel(`tasks:${companyId}`)
        .on(
            'postgres_changes',
            {
                event: event === '*' ? '*' : event,
                schema: 'public',
                table: 'tasks',
                filter: `company_id=eq.${companyId}`,
            },
            (payload) => {
                console.log('📋 Task change:', payload);
                callback(payload);
            }
        )
        .subscribe();

    return {
        channel,
        unsubscribe: () => {
            channel.unsubscribe();
        },
    };
};

/**
 * Subscribe to project changes
 */
export const subscribeToProjects = (
    companyId: string,
    event: RealtimeEvent | '*',
    callback: (payload: any) => void
): RealtimeSubscription => {
    const channel = supabase
        .channel(`projects:${companyId}`)
        .on(
            'postgres_changes',
            {
                event: event === '*' ? '*' : event,
                schema: 'public',
                table: 'projects',
                filter: `company_id=eq.${companyId}`,
            },
            (payload) => {
                console.log('🏗️ Project change:', payload);
                callback(payload);
            }
        )
        .subscribe();

    return {
        channel,
        unsubscribe: () => {
            channel.unsubscribe();
        },
    };
};

// ============================================================================
// PRESENCE (Online Users)
// ============================================================================

export interface PresenceState {
    user_id: string;
    user_name: string;
    online_at: string;
}

/**
 * Track user presence
 */
export const trackPresence = (
    companyId: string,
    userId: string,
    userName: string
): RealtimeSubscription => {
    const channel = supabase.channel(`presence:${companyId}`, {
        config: {
            presence: {
                key: userId,
            },
        },
    });

    channel
        .on('presence', { event: 'sync' }, () => {
            const state = channel.presenceState();
            console.log('👥 Presence sync:', state);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
            console.log('👋 User joined:', key, newPresences);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
            console.log('👋 User left:', key, leftPresences);
        })
        .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                await channel.track({
                    user_id: userId,
                    user_name: userName,
                    online_at: new Date().toISOString(),
                });
            }
        });

    return {
        channel,
        unsubscribe: () => {
            channel.unsubscribe();
        },
    };
};

/**
 * Get online users
 */
export const getOnlineUsers = (companyId: string): PresenceState[] => {
    const channel = supabase.channel(`presence:${companyId}`);
    const state = channel.presenceState();
    
    const users: PresenceState[] = [];
    Object.values(state).forEach((presences: any) => {
        presences.forEach((presence: PresenceState) => {
            users.push(presence);
        });
    });
    
    return users;
};

// ============================================================================
// BROADCAST (Real-time Messages)
// ============================================================================

export interface BroadcastMessage {
    type: string;
    payload: any;
    sender_id: string;
    timestamp: string;
}

/**
 * Subscribe to broadcast messages
 */
export const subscribeToBroadcast = (
    channelName: string,
    callback: (message: BroadcastMessage) => void
): RealtimeSubscription => {
    const channel = supabase
        .channel(channelName)
        .on('broadcast', { event: 'message' }, (payload) => {
            console.log('📡 Broadcast message:', payload);
            callback(payload.payload as BroadcastMessage);
        })
        .subscribe();

    return {
        channel,
        unsubscribe: () => {
            channel.unsubscribe();
        },
    };
};

/**
 * Send broadcast message
 */
export const sendBroadcast = async (
    channelName: string,
    message: Omit<BroadcastMessage, 'timestamp'>
): Promise<void> => {
    const channel = supabase.channel(channelName);
    
    await channel.send({
        type: 'broadcast',
        event: 'message',
        payload: {
            ...message,
            timestamp: new Date().toISOString(),
        },
    });
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Unsubscribe from all channels
 */
export const unsubscribeAll = async (): Promise<void> => {
    await supabase.removeAllChannels();
};

/**
 * Get all active channels
 */
export const getActiveChannels = (): RealtimeChannel[] => {
    return supabase.getChannels();
};

