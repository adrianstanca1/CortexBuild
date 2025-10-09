/**
 * React Hook for Real-time Subscriptions
 */

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
    subscribeToMultiple,
    unsubscribeFromMultiple,
    type RealtimePayload,
} from '../supabase/realtime';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { toast } from 'react-hot-toast';

export function useRealtime(companyId: string, userId: string) {
    const queryClient = useQueryClient();
    const channelsRef = useRef<RealtimeChannel[]>([]);

    useEffect(() => {
        if (!companyId || !userId) return;

        // Subscribe to all channels
        const channels = subscribeToMultiple(companyId, userId, {
            onProject: (payload: RealtimePayload) => {
                console.log('[Realtime] Project update:', payload);
                
                // Invalidate projects queries
                queryClient.invalidateQueries({ queryKey: ['projects'] });
                
                if (payload.eventType === 'INSERT') {
                    toast.success('New project created');
                } else if (payload.eventType === 'UPDATE') {
                    toast('Project updated', { icon: '🔄' });
                }
            },

            onNotification: (payload: RealtimePayload) => {
                console.log('[Realtime] Notification:', payload);
                
                const notification = payload.new;
                
                // Show toast notification
                if (notification.priority === 'critical') {
                    toast.error(notification.message, { duration: 10000 });
                } else if (notification.priority === 'high') {
                    toast(notification.message, { icon: '⚠️', duration: 5000 });
                } else {
                    toast(notification.message, { icon: '📢' });
                }

                // Invalidate notifications query
                queryClient.invalidateQueries({ queryKey: ['notifications'] });
            },

            onCognitive: (payload: RealtimePayload) => {
                console.log('[Realtime] Cognitive response:', payload);
                
                const response = payload.new;
                
                // Show AI insight notification
                toast(
                    `🧠 AI Insight: ${response.summary || 'New pattern detected'}`,
                    {
                        duration: 8000,
                        icon: '🤖',
                    }
                );

                // Invalidate cognitive queries
                queryClient.invalidateQueries({ queryKey: ['cognitive'] });
            },

            onAction: (payload: RealtimePayload) => {
                console.log('[Realtime] Action update:', payload);
                
                const action = payload.new;
                
                if (payload.eventType === 'INSERT') {
                    toast(`New action: ${action.title}`, { icon: '📋' });
                } else if (payload.eventType === 'UPDATE' && action.status === 'completed') {
                    toast.success(`Action completed: ${action.title}`);
                }

                // Invalidate actions query
                queryClient.invalidateQueries({ queryKey: ['actions'] });
            },

            onInvoice: (payload: RealtimePayload) => {
                console.log('[Realtime] Invoice update:', payload);
                
                const invoice = payload.new;
                
                if (payload.eventType === 'INSERT') {
                    toast(`New invoice: ${invoice.invoice_number}`, { icon: '💰' });
                } else if (payload.eventType === 'UPDATE' && invoice.status === 'paid') {
                    toast.success(`Invoice paid: ${invoice.invoice_number}`);
                }

                // Invalidate invoices query
                queryClient.invalidateQueries({ queryKey: ['invoices'] });
            },
        });

        channelsRef.current = channels;

        // Cleanup on unmount
        return () => {
            unsubscribeFromMultiple(channelsRef.current);
        };
    }, [companyId, userId, queryClient]);

    return {
        isConnected: channelsRef.current.length > 0,
        channels: channelsRef.current,
    };
}

