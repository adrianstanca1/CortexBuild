import { beforeEach, describe, expect, it } from 'vitest';
import { webcrypto } from 'node:crypto';
import { api, authApi, resetMockApi } from '../mockApi';
import { resetInMemoryStorage } from '../../utils/storage';

if (!globalThis.crypto) {
    Object.defineProperty(globalThis, 'crypto', {
        value: webcrypto,
        configurable: true,
    });
}

describe('mock api company settings integration', () => {
    beforeEach(() => {
        resetInMemoryStorage();
        resetMockApi();
    });

    it('returns persisted company settings and saves updates', async () => {
        const baseline = await api.getCompanySettings('1');
        expect(baseline).toMatchObject({
            theme: 'light',
            accessibility: { highContrast: false },
        });

        const updated = await api.updateCompanySettings('1', {
            theme: 'dark',
            workingHours: { start: '07:30' },
        });

        expect(updated.theme).toBe('dark');
        expect(updated.workingHours.start).toBe('07:30');
        expect(updated.accessibility.highContrast).toBe(false);

        // Mutating the returned object should not affect the stored settings.
        updated.theme = 'light';

        const roundTrip = await api.getCompanySettings('1');
        expect(roundTrip.theme).toBe('dark');
        expect(roundTrip.workingHours.start).toBe('07:30');
    });

    it('merges nested updates and records audit log entries', async () => {
        const uniqueSuffix = Date.now();
        const registration = await authApi.register({
            firstName: 'Casey',
            lastName: 'Stone',
            email: `casey-${uniqueSuffix}@newco.com`,
            password: 'Password!1',
            companySelection: 'create',
            companyName: `New Co ${uniqueSuffix}`,
            companyType: 'GENERAL_CONTRACTOR',
            termsAccepted: true,
        });

        const companyId = registration.company.id;
        const actorId = registration.user.id;

        const toggled = await api.updateCompanySettings(
            companyId,
            { features: { reporting: false } },
            actorId
        );
        expect(toggled.features.reporting).toBe(false);
        expect(toggled.features.projectManagement).toBe(true);

        const merged = await api.updateCompanySettings(
            companyId,
            {
                accessibility: { highContrast: true },
                workingHours: { workDays: [1, 2, 3, 4] },
            },
            actorId
        );

        expect(merged.accessibility.highContrast).toBe(true);
        expect(merged.workingHours.workDays).toEqual([1, 2, 3, 4]);

        const finalSettings = await api.getCompanySettings(companyId);
        expect(finalSettings.features.projectManagement).toBe(true);
        expect(finalSettings.features.reporting).toBe(false);
        expect(finalSettings.accessibility.highContrast).toBe(true);
        expect(finalSettings.workingHours.workDays).toEqual([1, 2, 3, 4]);

        const auditLogs = await api.getAuditLogsByCompany(companyId);
        expect(auditLogs.some(log => log.action === 'COMPANY_SETTINGS_UPDATED')).toBe(true);
    });
});
