/**
 * Supabase Real-time Subscriptions
 * Real-time updates for projects, notifications, and cognitive responses
 */

import { supabase } from './client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE';

export interface RealtimePayload<T = any> {
    eventType: RealtimeEvent;
    new: T;
    old: T;
    table: string;
}

/**
 * Subscribe to project updates
 */
export function subscribeToProjects(
    companyId: string,
    callback: (payload: RealtimePayload) => void
): RealtimeChannel {
    return supabase
        .channel(`projects:${companyId}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'projects',
                filter: `company_id=eq.${companyId}`,
            },
            (payload) => {
                callback({
                    eventType: payload.eventType as RealtimeEvent,
                    new: payload.new,
                    old: payload.old,
                    table: 'projects',
                });
            }
        )
        .subscribe();
}

/**
 * Subscribe to notifications
 */
export function subscribeToNotifications(
    userId: string,
    callback: (payload: RealtimePayload) => void
): RealtimeChannel {
    return supabase
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
                callback({
                    eventType: 'INSERT',
                    new: payload.new,
                    old: payload.old,
                    table: 'notifications',
                });
            }
        )
        .subscribe();
}

/**
 * Subscribe to cognitive responses (AI insights)
 */
export function subscribeToCognitiveResponses(
    companyId: string,
    callback: (payload: RealtimePayload) => void
): RealtimeChannel {
    return supabase
        .channel(`cognitive:${companyId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'cognitive_responses',
                filter: `company_id=eq.${companyId}`,
            },
            (payload) => {
                callback({
                    eventType: 'INSERT',
                    new: payload.new,
                    old: payload.old,
                    table: 'cognitive_responses',
                });
            }
        )
        .subscribe();
}

/**
 * Subscribe to strategic actions
 */
export function subscribeToStrategicActions(
    companyId: string,
    callback: (payload: RealtimePayload) => void
): RealtimeChannel {
    return supabase
        .channel(`actions:${companyId}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'strategic_actions',
                filter: `company_id=eq.${companyId}`,
            },
            (payload) => {
                callback({
                    eventType: payload.eventType as RealtimeEvent,
                    new: payload.new,
                    old: payload.old,
                    table: 'strategic_actions',
                });
            }
        )
        .subscribe();
}

/**
 * Subscribe to time entries (for live time tracking)
 */
export function subscribeToTimeEntries(
    projectId: string,
    callback: (payload: RealtimePayload) => void
): RealtimeChannel {
    return supabase
        .channel(`time_entries:${projectId}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'time_entries',
                filter: `project_id=eq.${projectId}`,
            },
            (payload) => {
                callback({
                    eventType: payload.eventType as RealtimeEvent,
                    new: payload.new,
                    old: payload.old,
                    table: 'time_entries',
                });
            }
        )
        .subscribe();
}

/**
 * Subscribe to invoices
 */
export function subscribeToInvoices(
    companyId: string,
    callback: (payload: RealtimePayload) => void
): RealtimeChannel {
    return supabase
        .channel(`invoices:${companyId}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'invoices',
                filter: `company_id=eq.${companyId}`,
            },
            (payload) => {
                callback({
                    eventType: payload.eventType as RealtimeEvent,
                    new: payload.new,
                    old: payload.old,
                    table: 'invoices',
                });
            }
        )
        .subscribe();
}

/**
 * Unsubscribe from a channel
 */
export async function unsubscribe(channel: RealtimeChannel): Promise<void> {
    await supabase.removeChannel(channel);
}

/**
 * Subscribe to multiple channels at once
 */
export function subscribeToMultiple(
    companyId: string,
    userId: string,
    callbacks: {
        onProject?: (payload: RealtimePayload) => void;
        onNotification?: (payload: RealtimePayload) => void;
        onCognitive?: (payload: RealtimePayload) => void;
        onAction?: (payload: RealtimePayload) => void;
        onInvoice?: (payload: RealtimePayload) => void;
    }
): RealtimeChannel[] {
    const channels: RealtimeChannel[] = [];

    if (callbacks.onProject) {
        channels.push(subscribeToProjects(companyId, callbacks.onProject));
    }

    if (callbacks.onNotification) {
        channels.push(subscribeToNotifications(userId, callbacks.onNotification));
    }

    if (callbacks.onCognitive) {
        channels.push(subscribeToCognitiveResponses(companyId, callbacks.onCognitive));
    }

    if (callbacks.onAction) {
        channels.push(subscribeToStrategicActions(companyId, callbacks.onAction));
    }

    if (callbacks.onInvoice) {
        channels.push(subscribeToInvoices(companyId, callbacks.onInvoice));
    }

    return channels;
}

/**
 * Unsubscribe from multiple channels
 */
export async function unsubscribeFromMultiple(channels: RealtimeChannel[]): Promise<void> {
    await Promise.all(channels.map(channel => unsubscribe(channel)));
}

