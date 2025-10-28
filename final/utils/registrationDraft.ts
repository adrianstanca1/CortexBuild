import { CompanyType, Role } from '../types';
import { getStorage } from './storage';

export type RegistrationStep = 'account' | 'workspace' | 'confirm';

export interface RegistrationDraft {
    step: RegistrationStep;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    companySelection: '' | 'create' | 'join';
    companyName: string;
    companyType: CompanyType | '';
    companyEmail: string;
    companyPhone: string;
    companyWebsite: string;
    inviteToken: string;
    role: Role | '';
    updatesOptIn: boolean;
    termsAccepted: boolean;
}

type PersistedDraft = {
    version: 1;
    savedAt: number;
    expiresAt: number;
    data: RegistrationDraft;
};

const REGISTRATION_DRAFT_KEY = 'asagents_registration_draft_v1';

const COMPANY_TYPES: CompanyType[] = [
    'GENERAL_CONTRACTOR',
    'SUBCONTRACTOR',
    'SUPPLIER',
    'CONSULTANT',
    'CLIENT',
];

const ROLE_VALUES = new Set(Object.values(Role));

const storage = getStorage();

export const REGISTRATION_DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const EMPTY_REGISTRATION_DRAFT: RegistrationDraft = {
    step: 'account',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companySelection: '',
    companyName: '',
    companyType: '',
    companyEmail: '',
    companyPhone: '',
    companyWebsite: '',
    inviteToken: '',
    role: '',
    updatesOptIn: true,
    termsAccepted: false,
};

const sanitizeStep = (value: unknown): RegistrationStep => {
    if (value === 'workspace' || value === 'confirm') {
        return value;
    }
    return 'account';
};

const sanitizeString = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

const sanitizeCompanySelection = (value: unknown): RegistrationDraft['companySelection'] => {
    if (value === 'create' || value === 'join') {
        return value;
    }
    return '';
};

const sanitizeCompanyType = (value: unknown): RegistrationDraft['companyType'] => {
    if (typeof value === 'string' && (COMPANY_TYPES as string[]).includes(value)) {
        return value as CompanyType;
    }
    return '';
};

const sanitizeRole = (value: unknown): RegistrationDraft['role'] => {
    if (typeof value === 'string' && ROLE_VALUES.has(value as Role)) {
        return value as Role;
    }
    return '';
};

const sanitizeBoolean = (value: unknown, fallback: boolean) => (typeof value === 'boolean' ? value : fallback);

const sanitizeDraft = (draft: Partial<RegistrationDraft>): RegistrationDraft => ({
    step: sanitizeStep(draft.step),
    firstName: sanitizeString(draft.firstName),
    lastName: sanitizeString(draft.lastName),
    email: sanitizeString(draft.email),
    phone: sanitizeString(draft.phone),
    companySelection: sanitizeCompanySelection(draft.companySelection),
    companyName: sanitizeString(draft.companyName),
    companyType: sanitizeCompanyType(draft.companyType),
    companyEmail: sanitizeString(draft.companyEmail),
    companyPhone: sanitizeString(draft.companyPhone),
    companyWebsite: sanitizeString(draft.companyWebsite),
    inviteToken: sanitizeString(draft.inviteToken),
    role: sanitizeRole(draft.role),
    updatesOptIn: sanitizeBoolean(draft.updatesOptIn, true),
    termsAccepted: sanitizeBoolean(draft.termsAccepted, false),
});

const draftsDiffer = (a: RegistrationDraft, b: RegistrationDraft) =>
    a.step !== b.step ||
    a.firstName !== b.firstName ||
    a.lastName !== b.lastName ||
    a.email !== b.email ||
    a.phone !== b.phone ||
    a.companySelection !== b.companySelection ||
    a.companyName !== b.companyName ||
    a.companyType !== b.companyType ||
    a.companyEmail !== b.companyEmail ||
    a.companyPhone !== b.companyPhone ||
    a.companyWebsite !== b.companyWebsite ||
    a.inviteToken !== b.inviteToken ||
    a.role !== b.role ||
    a.updatesOptIn !== b.updatesOptIn ||
    a.termsAccepted !== b.termsAccepted;

export const registrationDraftHasContent = (draft: RegistrationDraft): boolean =>
    draftsDiffer(draft, EMPTY_REGISTRATION_DRAFT);

export const saveRegistrationDraft = (input: Partial<RegistrationDraft>) => {
    const sanitized = sanitizeDraft(input);
    if (!registrationDraftHasContent(sanitized)) {
        clearRegistrationDraft();
        return;
    }

    const payload: PersistedDraft = {
        version: 1,
        savedAt: Date.now(),
        expiresAt: Date.now() + REGISTRATION_DRAFT_TTL_MS,
        data: sanitized,
    };

    try {
        storage.setItem(REGISTRATION_DRAFT_KEY, JSON.stringify(payload));
    } catch (error) {
        console.warn('Unable to persist registration draft', error);
    }
};

export const loadRegistrationDraft = (): RegistrationDraft | null => {
    try {
        const raw = storage.getItem(REGISTRATION_DRAFT_KEY);
        if (!raw) {
            return null;
        }
        const parsed = JSON.parse(raw) as PersistedDraft | undefined;
        if (!parsed || typeof parsed !== 'object' || parsed.version !== 1) {
            clearRegistrationDraft();
            return null;
        }
        if (typeof parsed.expiresAt === 'number' && parsed.expiresAt < Date.now()) {
            clearRegistrationDraft();
            return null;
        }
        return sanitizeDraft(parsed.data);
    } catch (error) {
        console.warn('Unable to read registration draft', error);
        clearRegistrationDraft();
        return null;
    }
};

export const clearRegistrationDraft = () => {
    try {
        storage.removeItem(REGISTRATION_DRAFT_KEY);
    } catch (error) {
        console.warn('Unable to clear registration draft', error);
    }
};

