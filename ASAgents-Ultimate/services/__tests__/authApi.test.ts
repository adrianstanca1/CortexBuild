// @ts-nocheck - Test file with type issues
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
});
