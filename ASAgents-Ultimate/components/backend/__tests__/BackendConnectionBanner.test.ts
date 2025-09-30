// @ts-nocheck - Test file with type issues
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { deriveConnectionBanner } from '../BackendConnectionBanner';
import type { BackendConnectionState, DashboardSnapshotMetadata } from '../../../types';

const baseConnection: BackendConnectionState = {
    mode: 'backend',
    baseUrl: 'https://api.example.com',
    online: true,
    pendingMutations: 0,
    lastSync: null,
};

const makeMetadata = (overrides: Partial<DashboardSnapshotMetadata> = {}): DashboardSnapshotMetadata => ({
    source: 'backend',
    generatedAt: '2024-01-01T00:00:00.000Z',
    usedFallback: false,
    ...overrides,
});

beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-02T00:00:00.000Z'));
});

afterEach(() => {
    vi.useRealTimers();
});

describe('deriveConnectionBanner', () => {
    it('highlights mock mode when no backend is configured', () => {
        const descriptor = deriveConnectionBanner({
            ...baseConnection,
            mode: 'mock',
            baseUrl: null,
        });

        expect(descriptor.show).toBe(true);
        expect(descriptor.tone).toBe('info');
        expect(descriptor.title).toMatch(/demo workspace/i);
        expect(descriptor.message).toMatch(/local browser sandbox/i);
    });

    it('warns when operating offline and queues changes', () => {
        const descriptor = deriveConnectionBanner(
            {
                ...baseConnection,
                online: false,
                pendingMutations: 3,
                lastSync: '2024-01-01T12:00:00.000Z',
            },
            makeMetadata(),
        );

        expect(descriptor.tone).toBe('warning');
        expect(descriptor.message).toContain('3 changes');
        expect(descriptor.detail).toMatch(/^Last sync/);
    });

    it('surfaces fallback reasons when cached data is shown', () => {
        const descriptor = deriveConnectionBanner(
            baseConnection,
            makeMetadata({ usedFallback: true, fallbackReason: 'Backend request failed: timeout.' }),
        );

        expect(descriptor.show).toBe(true);
        expect(descriptor.tone).toBe('warning');
        expect(descriptor.message).toContain('Backend request failed: timeout.');
    });

    it('notes when updates are queued for sync', () => {
        const descriptor = deriveConnectionBanner({
            ...baseConnection,
            pendingMutations: 2,
            lastSync: '2024-01-01T10:00:00.000Z',
        });

        expect(descriptor.show).toBe(true);
        expect(descriptor.tone).toBe('info');
        expect(descriptor.message).toContain('api.example.com');
    });

    it('flags incomplete configuration when base URL is missing', () => {
        const descriptor = deriveConnectionBanner({
            ...baseConnection,
            baseUrl: null,
        });

        expect(descriptor.show).toBe(true);
        expect(descriptor.title).toMatch(/configuration incomplete/i);
    });
});
