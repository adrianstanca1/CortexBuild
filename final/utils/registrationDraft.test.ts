import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    loadRegistrationDraft,
    saveRegistrationDraft,
    clearRegistrationDraft,
    registrationDraftHasContent,
    EMPTY_REGISTRATION_DRAFT,
    REGISTRATION_DRAFT_TTL_MS,
} from './registrationDraft';
import { resetInMemoryStorage } from './storage';
import { Role } from '../types';

describe('registrationDraft storage helpers', () => {
    beforeEach(() => {
        resetInMemoryStorage();
        clearRegistrationDraft();
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2024-01-01T08:00:00Z'));
    });

    afterEach(() => {
        clearRegistrationDraft();
        vi.useRealTimers();
    });

    it('persists sanitized values and restores them', () => {
        saveRegistrationDraft({
            step: 'workspace',
            firstName: '  Ada  ',
            lastName: ' Lovelace ',
            email: ' ada@example.com ',
            phone: ' +44 123 456 789 ',
            companySelection: 'join',
            companyName: ' Example Builders ',
            companyType: 'GENERAL_CONTRACTOR',
            companyEmail: ' TEAM@example.com ',
            companyPhone: '0200 000 000',
            companyWebsite: ' https://example.com ',
            inviteToken: ' join-code ',
            role: Role.PROJECT_MANAGER,
            updatesOptIn: false,
            termsAccepted: true,
        });

        const draft = loadRegistrationDraft();
        expect(draft).toEqual({
            step: 'workspace',
            firstName: 'Ada',
            lastName: 'Lovelace',
            email: 'ada@example.com',
            phone: '+44 123 456 789',
            companySelection: 'join',
            companyName: 'Example Builders',
            companyType: 'GENERAL_CONTRACTOR',
            companyEmail: 'TEAM@example.com',
            companyPhone: '0200 000 000',
            companyWebsite: 'https://example.com',
            inviteToken: 'join-code',
            role: Role.PROJECT_MANAGER,
            updatesOptIn: false,
            termsAccepted: true,
        });
    });

    it('does not persist drafts without meaningful content', () => {
        expect(registrationDraftHasContent(EMPTY_REGISTRATION_DRAFT)).toBe(false);
        saveRegistrationDraft({});
        expect(loadRegistrationDraft()).toBeNull();
    });

    it('expires drafts after the configured TTL', () => {
        saveRegistrationDraft({
            step: 'confirm',
            firstName: 'Nora',
            lastName: 'Stone',
            email: 'nora@example.com',
            companySelection: 'create',
            companyName: 'Stoneworks',
            companyType: 'SUPPLIER',
            termsAccepted: true,
        });

        vi.setSystemTime(Date.now() + REGISTRATION_DRAFT_TTL_MS + 1000);
        expect(loadRegistrationDraft()).toBeNull();
    });

    it('sanitizes invalid values on save', () => {
        saveRegistrationDraft({
            step: 'unknown' as any,
            companySelection: 'invalid' as any,
            companyType: 'NOT_A_TYPE' as any,
            role: 'NOT_A_ROLE' as any,
            termsAccepted: 'yes' as any,
        });

        expect(loadRegistrationDraft()).toBeNull();
    });
});

