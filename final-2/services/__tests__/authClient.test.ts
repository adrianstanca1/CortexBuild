import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { webcrypto } from 'node:crypto';
import {
    authClient,
    configureAuthClient,
    getAuthConnectionInfo,
    resetAuthClient,
    subscribeToAuthClientChanges,
} from '../authClient';
import { resetMockApi } from '../mockApi';
import { resetInMemoryStorage } from '../../utils/storage';

if (!globalThis.crypto) {
    Object.defineProperty(globalThis, 'crypto', {
        value: webcrypto,
        configurable: true,
    });
}

describe('authClient', () => {
    beforeEach(() => {
        resetInMemoryStorage();
        resetMockApi();
        resetAuthClient();
    });

    afterEach(() => {
        resetAuthClient();
        vi.restoreAllMocks();
    });

    it('uses the local mock implementation when no backend is configured', async () => {
        const connection = getAuthConnectionInfo();
        expect(connection.mode).toBe('mock');

        const payload = {
            firstName: 'Casey',
            lastName: 'Jordan',
            email: 'casey@demo.dev',
            password: 'Password!1',
            companySelection: 'create' as const,
            companyName: 'Demo Builders',
            companyType: 'GENERAL_CONTRACTOR' as const,
            termsAccepted: true,
        };

        const registration = await authClient.register(payload);
        expect(registration.user.email).toBe(payload.email);

        const login = await authClient.login({ email: payload.email, password: payload.password });
        if ('mfaRequired' in login && login.mfaRequired) {
            expect(login.userId).toBeTruthy();
        } else {
            expect(login.token).toBeTruthy();
        }
    });

    it('falls back to the mock implementation when the backend is unreachable and fallback is enabled', async () => {
        const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('connect ECONNREFUSED'));
        configureAuthClient({ baseUrl: 'https://api.example.test', allowMockFallback: true });

        const payload = {
            firstName: 'Morgan',
            lastName: 'Reid',
            email: 'morgan@fallback.dev',
            password: 'Password!1',
            companySelection: 'create' as const,
            companyName: 'Fallback Works',
            companyType: 'CONSULTANT' as const,
            termsAccepted: true,
        };

        const registration = await authClient.register(payload);
        expect(registration.user.email).toBe(payload.email);
        expect(fetchSpy).toHaveBeenCalled();
    });

    it('surfaces an error when the backend is unreachable and fallback is disabled', async () => {
        const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('connect ECONNREFUSED'));
        configureAuthClient({ baseUrl: 'https://api.example.test', allowMockFallback: false });

        await expect(authClient.login({ email: 'someone@example.com', password: 'Password!1' })).rejects.toThrow(
            /authentication service is currently unavailable/i
        );
        expect(fetchSpy).toHaveBeenCalled();
    });

    it('supports social login via the mock fallback when backend is unavailable', async () => {
        const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('connect ECONNREFUSED'));
        configureAuthClient({ baseUrl: 'https://api.example.test', allowMockFallback: true });

        const session = await authClient.socialLogin('google', {
            email: 'social@loginflow.test',
            name: 'Jamie Social',
        });

        expect(session.user.email).toBe('social@loginflow.test');
        expect(session.user.role).toBeDefined();
        expect(fetchSpy).toHaveBeenCalled();
    });

    it('notifies subscribers when connection details change', () => {
        const listener = vi.fn();
        const unsubscribe = subscribeToAuthClientChanges(listener);

        configureAuthClient({ baseUrl: 'https://api.example.test', allowMockFallback: false });
        expect(listener).toHaveBeenCalledTimes(1);

        configureAuthClient({ allowMockFallback: true });
        expect(listener).toHaveBeenCalledTimes(2);

        resetAuthClient();
        expect(listener).toHaveBeenCalledTimes(3);

        unsubscribe();
        configureAuthClient({ baseUrl: null });
        expect(listener).toHaveBeenCalledTimes(3);
    });
});

