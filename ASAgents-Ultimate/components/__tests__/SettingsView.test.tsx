// @ts-nocheck - Test file with type issues
import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { SettingsView } from '../SettingsView';

const initialEnvironment = {
    apiBaseUrl: 'https://api.initial.example.com',
    analyticsWriteKey: 'ANALYTICSKEY1234',
    geminiApiKey: 'GEMINIKEY5678',
    mapboxToken: 'MAPBOXPK9999',
    supabaseUrl: null,
    supabaseAnonKey: null,
    featureFlags: {
        useSupabaseAuth: false,
        allowMockFallback: true,
    },
};

const refreshedEnvironment = {
    apiBaseUrl: 'https://api.refreshed.example.com',
    analyticsWriteKey: 'REFRESHEDKEY9999',
    geminiApiKey: 'REFRESHEDGEMINI8888',
    mapboxToken: 'MAPBOXPK0000',
    supabaseUrl: 'https://supabase.example.com',
    supabaseAnonKey: 'SUPABASEANON9999',
    featureFlags: {
        useSupabaseAuth: true,
        allowMockFallback: false,
    },
};

const mockConnectionState = {
    mode: 'backend' as const,
    baseUrl: 'https://api.initial.example.com',
    online: true,
    pendingMutations: 3,
    lastSync: '2024-01-01T12:00:00.000Z',
};

const refreshEnvironmentMock = vi.fn(() => refreshedEnvironment);
const clearQueueMock = vi.fn();

vi.mock('../../config/environment', () => ({
    getEnvironmentSnapshot: vi.fn(() => initialEnvironment),
    refreshEnvironment: (...args: unknown[]) => refreshEnvironmentMock(...args),
}));

vi.mock('../../hooks/useBackendConnectionState', () => ({
    useBackendConnectionState: () => mockConnectionState,
}));

vi.mock('../../services/backendGateway', () => ({
    backendGateway: {
        clearInteractionQueue: (...args: unknown[]) => clearQueueMock(...args),
    },
}));

describe('SettingsView', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
        refreshEnvironmentMock.mockClear();
        clearQueueMock.mockClear();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders environment snapshot and secret status', () => {
        render(<SettingsView />);

        expect(screen.getByText('Platform settings')).toBeInTheDocument();
        expect(screen.getByText('https://api.initial.example.com')).toBeInTheDocument();
        expect(screen.getByText('ANAL…1234')).toBeInTheDocument();
        expect(screen.getByText('GEMI…5678')).toBeInTheDocument();
        expect(screen.getByText(/Mapbox token/i)).toBeInTheDocument();
        expect(screen.getAllByText('Configured')).toHaveLength(3);
        expect(screen.getAllByText('Missing')).toHaveLength(2);
        expect(screen.getByText(/Last refreshed 2024-01-01T00:00:00.000Z/)).toBeInTheDocument();
    });

    it('refreshes the environment snapshot when requested', () => {
        render(<SettingsView />);

        vi.setSystemTime(new Date('2024-01-02T00:00:00.000Z'));
        fireEvent.click(screen.getByRole('button', { name: /refresh snapshot/i }));

        expect(refreshEnvironmentMock).toHaveBeenCalled();
        expect(screen.getByText('https://api.refreshed.example.com')).toBeInTheDocument();
        expect(screen.getByText(/Last refreshed 2024-01-02T00:00:00.000Z/)).toBeInTheDocument();
        expect(screen.getByText('REFR…8888')).toBeInTheDocument();
    });

    it('clears the queued interactions when requested', () => {
        render(<SettingsView />);

        fireEvent.click(screen.getByRole('button', { name: /clear queue/i }));

        expect(clearQueueMock).toHaveBeenCalled();
        expect(screen.getByText(/Cleared at 2024-01-01T00:00:00.000Z/)).toBeInTheDocument();
    });
});
