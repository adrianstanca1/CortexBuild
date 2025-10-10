/**
 * Real-time Sync Service
 * Handles real-time updates for admin dashboard using Supabase Realtime
 */

import { supabase } from '../../supabaseClient';
import { RealtimeChannel } from '@supabase/supabase-js';

// ============================================
// TYPES
// ============================================

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE';

export interface RealtimePayload<T = any> {
    eventType: RealtimeEvent;
    new: T;
    old: T;
    table: string;
}

export type RealtimeCallback<T = any> = (payload: RealtimePayload<T>) => void;

// ============================================
// USER SUBSCRIPTIONS
// ============================================

export function subscribeToUsers(
    companyId: string,
    callback: RealtimeCallback
): RealtimeChannel | null {
    if (!supabase) {
        console.warn('Supabase not initialized, skipping real-time subscription');
        return null;
    }

    return supabase
        .channel(`users:${companyId}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'users',
                filter: `company_id=eq.${companyId}`,
            },
            (payload) => {
                callback({
                    eventType: payload.eventType as RealtimeEvent,
                    new: payload.new,
                    old: payload.old,
                    table: 'users',
                });
            }
        )
        .subscribe();
}

// ============================================
// TEAM SUBSCRIPTIONS
// ============================================

export function subscribeToTeams(
    companyId: string,
    callback: RealtimeCallback
): RealtimeChannel | null {
    if (!supabase) {
        console.warn('Supabase not initialized, skipping real-time subscription');
        return null;
    }

    return supabase
        .channel(`teams:${companyId}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'teams',
                filter: `company_id=eq.${companyId}`,
            },
            (payload) => {
                callback({
                    eventType: payload.eventType as RealtimeEvent,
                    new: payload.new,
                    old: payload.old,
                    table: 'teams',
                });
            }
        )
        .subscribe();
}

// ============================================
// APP SUBSCRIPTIONS
// ============================================

export function subscribeToApps(
    companyId: string,
    callback: RealtimeCallback
): RealtimeChannel | null {
    if (!supabase) {
        console.warn('Supabase not initialized, skipping real-time subscription');
        return null;
    }

    return supabase
        .channel(`apps:${companyId}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'apps',
                filter: `company_id=eq.${companyId}`,
            },
            (payload) => {
                callback({
                    eventType: payload.eventType as RealtimeEvent,
                    new: payload.new,
                    old: payload.old,
                    table: 'apps',
                });
            }
        )
        .subscribe();
}

// ============================================
// ACTIVITY LOG SUBSCRIPTIONS
// ============================================

export function subscribeToActivityLog(
    companyId: string,
    callback: RealtimeCallback
): RealtimeChannel | null {
    if (!supabase) {
        console.warn('Supabase not initialized, skipping real-time subscription');
        return null;
    }

    return supabase
        .channel(`activity_log:${companyId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'activity_log',
                filter: `company_id=eq.${companyId}`,
            },
            (payload) => {
                callback({
                    eventType: 'INSERT',
                    new: payload.new,
                    old: payload.old,
                    table: 'activity_log',
                });
            }
        )
        .subscribe();
}

// ============================================
// METRICS SUBSCRIPTIONS
// ============================================

export function subscribeToMetrics(
    companyId: string,
    callback: RealtimeCallback
): RealtimeChannel | null {
    if (!supabase) {
        console.warn('Supabase not initialized, skipping real-time subscription');
        return null;
    }

    return supabase
        .channel(`system_metrics:${companyId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'system_metrics',
                filter: `company_id=eq.${companyId}`,
            },
            (payload) => {
                callback({
                    eventType: 'INSERT',
                    new: payload.new,
                    old: payload.old,
                    table: 'system_metrics',
                });
            }
        )
        .subscribe();
}

// ============================================
// SUBSCRIPTION MANAGEMENT
// ============================================

export function unsubscribe(channel: RealtimeChannel | null): void {
    if (channel && supabase) {
        supabase.removeChannel(channel);
    }
}

export function unsubscribeAll(): void {
    if (supabase) {
        supabase.removeAllChannels();
    }
}

// ============================================
// PRESENCE (Online Users)
// ============================================

export interface PresenceState {
    user_id: string;
    user_name: string;
    online_at: string;
}

export function subscribeToPresence(
    companyId: string,
    userId: string,
    userName: string,
    onJoin: (state: PresenceState) => void,
    onLeave: (state: PresenceState) => void
): RealtimeChannel | null {
    if (!supabase) {
        console.warn('Supabase not initialized, skipping presence subscription');
        return null;
    }

    const channel = supabase.channel(`presence:${companyId}`, {
        config: {
            presence: {
                key: userId,
            },
        },
    });

    channel
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
            newPresences.forEach((presence: PresenceState) => {
                onJoin(presence);
            });
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
            leftPresences.forEach((presence: PresenceState) => {
                onLeave(presence);
            });
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

    return channel;
}

// ============================================
// BROADCAST (Real-time Messages)
// ============================================

export interface BroadcastMessage {
    type: string;
    payload: any;
    sender_id: string;
    timestamp: string;
}

export function subscribeToBroadcast(
    companyId: string,
    onMessage: (message: BroadcastMessage) => void
): RealtimeChannel | null {
    if (!supabase) {
        console.warn('Supabase not initialized, skipping broadcast subscription');
        return null;
    }

    return supabase
        .channel(`broadcast:${companyId}`)
        .on('broadcast', { event: 'message' }, ({ payload }) => {
            onMessage(payload as BroadcastMessage);
        })
        .subscribe();
}

export async function sendBroadcast(
    companyId: string,
    type: string,
    payload: any,
    senderId: string
): Promise<void> {
    if (!supabase) {
        console.warn('Supabase not initialized, cannot send broadcast');
        return;
    }

    const channel = supabase.channel(`broadcast:${companyId}`);
    
    await channel.send({
        type: 'broadcast',
        event: 'message',
        payload: {
            type,
            payload,
            sender_id: senderId,
            timestamp: new Date().toISOString(),
        },
    });
}

