// @ts-nocheck - Test file with type issues
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../analyticsService', () => ({
    analytics: {
        track: vi.fn(),
        identify: vi.fn(),
        flush: vi.fn(),
    },
}));

vi.mock('../authClient', () => {
    const subscribers = new Set<() => void>();
    return {
        getAuthConnectionInfo: () => ({
            mode: 'mock' as const,
            baseUrl: null,
            baseHost: null,
            allowMockFallback: true,
        }),
        subscribeToAuthClientChanges: (listener: () => void) => {
            subscribers.add(listener);
            return () => subscribers.delete(listener);
        },
    };
});

import { backendGateway } from '../backendGateway';
import { apiCache } from '../cacheService';

describe('backendGateway', () => {
    beforeEach(() => {
        apiCache.clear();
        backendGateway.clearInteractionQueue();
    });

    it('returns a dashboard snapshot using local mock data when backend is unavailable', async () => {
        const snapshot = await backendGateway.getDashboardSnapshot({
            userId: '1',
            companyId: '1',
        });

        expect(Array.isArray(snapshot.projects)).toBe(true);
        expect(snapshot.metadata.source).toBe('mock');
        expect(snapshot.metadata.usedFallback).toBe(true);
         expect(snapshot.metadata.fallbackReason).toBe('No backend connection configured.');
 
     });

    it('queues interactions when backend is unavailable', async () => {
        const initialState = backendGateway.getState();

        await backendGateway.recordInteraction({
            type: 'test-event',
            userId: '1',
            companyId: '1',
        });

        const nextState = backendGateway.getState();
        expect(nextState.pendingMutations).toBe(initialState.pendingMutations + 1);
    });
});
