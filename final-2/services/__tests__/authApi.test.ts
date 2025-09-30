import { beforeEach, describe, expect, it } from 'vitest';
import { webcrypto } from 'node:crypto';
import { authApi, resetMockApi } from '../mockApi';
import { resetInMemoryStorage } from '../../utils/storage';
import { Role } from '../../types';

if (!globalThis.crypto) {
    Object.defineProperty(globalThis, 'crypto', {
        value: webcrypto,
        configurable: true,
    });
}

describe('authApi', () => {
    beforeEach(() => {
        resetInMemoryStorage();
        resetMockApi();
    });

    it('registers a new workspace owner and allows login', async () => {
        const payload = {
            firstName: 'Taylor',
            lastName: 'Reed',
            email: 'taylor@buildright.com',
            password: 'Password!1',
            companySelection: 'create' as const,
            companyName: 'Build Right Ltd',
            companyType: 'GENERAL_CONTRACTOR' as const,
            termsAccepted: true,
        };

        const response = await authApi.register(payload);

        expect(response.user.email).toBe(payload.email);
        expect(response.user.role).toBe(Role.OWNER);
        expect(response.company.name).toBe(payload.companyName);
        expect(response.token).toBeTruthy();

        const loginResponse = await authApi.login({ email: payload.email, password: payload.password });
        expect(loginResponse.user.id).toBe(response.user.id);
    });

    it('prevents duplicate email registration', async () => {
        const payload = {
            firstName: 'Jordan',
            lastName: 'Quinn',
            email: 'duplicate@workspace.com',
            password: 'Password!1',
            companySelection: 'create' as const,
            companyName: 'Duplicate Co',
            companyType: 'CONSULTANT' as const,
            termsAccepted: true,
        };

        await authApi.register(payload);
        await expect(authApi.register(payload)).rejects.toThrow(/already exists/i);
    });

    it('registers a user against an invite token', async () => {
        const invite = await authApi.lookupInviteToken('JOIN-CONSTRUCTCO');
        expect(invite.companyId).toBe('1');

        const joinResponse = await authApi.register({
            firstName: 'Jamie',
            lastName: 'Lopez',
            email: 'jamie@invite.com',
            password: 'Password!1',
            companySelection: 'join',
            inviteToken: 'JOIN-CONSTRUCTCO',
            role: invite.allowedRoles[0],
            termsAccepted: true,
        });

        expect(joinResponse.user.companyId).toBe(invite.companyId);
        expect(invite.allowedRoles).toContain(joinResponse.user.role);
    });

    it('rejects invalid login attempts', async () => {
        await expect(authApi.login({ email: 'sam@constructco.com', password: 'wrongpass' })).rejects.toThrow(/invalid email or password/i);
    });

    it('generates unique usernames when the preferred handle is taken', async () => {
        const first = await authApi.register({
            firstName: 'Avery',
            lastName: 'Stone',
            email: 'avery@uniquehandle.dev',
            username: 'site.owner',
            password: 'Password!1',
            companySelection: 'create',
            companyName: 'Unique Handle Works',
            companyType: 'CONSULTANT',
            termsAccepted: true,
        });

        const second = await authApi.register({
            firstName: 'River',
            lastName: 'Stone',
            email: 'river@uniquehandle.dev',
            username: 'site.owner',
            password: 'Password!1',
            companySelection: 'create',
            companyName: 'Unique Handle Works 2',
            companyType: 'GENERAL_CONTRACTOR',
            termsAccepted: true,
        });

        expect(first.user.username).toBe('site.owner');
        expect(second.user.username).not.toBe('site.owner');
        expect(second.user.username).not.toBe(first.user.username);
        expect(second.user.username).toBeTruthy();
        expect(second.user.username?.includes('river')).toBe(true);
    });

    it('provisions a dedicated tenant on social login and reuses existing accounts', async () => {
        const session = await authApi.socialLogin({
            provider: 'google',
            email: 'owner@socialprovision.dev',
            name: 'Morgan Admin',
        });

        expect(session.user.role).toBe(Role.OWNER);
        expect(session.company.id).toMatch(/^social-/);
        expect(session.user.username).toBeTruthy();

        const invite = await authApi.lookupInviteToken(`JOIN-${session.company.id}`);
        expect(invite.companyId).toBe(session.company.id);
        expect(invite.allowedRoles).toContain(Role.ADMIN);

        const secondSession = await authApi.socialLogin({
            provider: 'google',
            email: 'owner@socialprovision.dev',
            name: 'Morgan Admin',
        });

        expect(secondSession.user.id).toBe(session.user.id);
        expect(secondSession.company.id).toBe(session.company.id);
    });
});
