import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import './UserRegistration.css';
import { authClient, type InvitePreview } from '../../services/authClient';
import { CompanyType, type RegistrationPayload, Role, type SocialProvider } from '../../types';
import { AuthEnvironmentNotice } from './AuthEnvironmentNotice';
import {
    clearRegistrationDraft,
    loadRegistrationDraft,
    registrationDraftHasContent,
    saveRegistrationDraft,
    type RegistrationStep,
} from '../../utils/registrationDraft';
import { persistRememberedEmail } from '../../utils/authRememberMe';

interface UserRegistrationProps {
    onSwitchToLogin: () => void;
}

interface RegistrationState {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    phone: string;
    password: string;
    confirmPassword: string;
    companySelection: 'create' | 'join' | '';
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

type FormErrors = Partial<Record<keyof RegistrationState, string>>;

const INITIAL_STATE: RegistrationState = {
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    phone: '',
    password: '',
    confirmPassword: '',
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

const STEP_SEQUENCE: Array<{ id: RegistrationStep; title: string; description: string }> = [
    { id: 'account', title: 'Account', description: 'Introduce yourself and secure access.' },
    { id: 'workspace', title: 'Workspace', description: 'Create a company or join an existing team.' },
    { id: 'confirm', title: 'Confirm', description: 'Review details and accept the terms.' },
];

const COMPANY_TYPES: Array<{ value: CompanyType; label: string }> = [
    { value: 'GENERAL_CONTRACTOR', label: 'General contractor' },
    { value: 'SUBCONTRACTOR', label: 'Subcontractor' },
    { value: 'SUPPLIER', label: 'Supplier' },
    { value: 'CONSULTANT', label: 'Consultant' },
    { value: 'CLIENT', label: 'Client / Asset owner' },
];

const ROLE_DETAILS: Record<Role, { label: string; description: string }> = {
    [Role.OWNER]: {
        label: 'Owner',
        description: 'Full tenant administration, billing and security authority.',
    },
    [Role.ADMIN]: {
        label: 'Administrator',
        description: 'Manage people, approvals, permissions and commercial workflows.',
    },
    [Role.PROJECT_MANAGER]: {
        label: 'Project manager',
        description: 'Coordinate schedules, tasks, stakeholders and reporting.',
    },
    [Role.FOREMAN]: {
        label: 'Foreman',
        description: 'Lead on-site crews and escalate safety issues instantly.',
    },
    [Role.OPERATIVE]: {
        label: 'Operative',
        description: 'Log time, update tasks and collaborate with the site team.',
    },
    [Role.CLIENT]: {
        label: 'Client',
        description: 'Follow milestones, approve changes and review documentation.',
    },
    [Role.PRINCIPAL_ADMIN]: {
        label: 'Platform principal admin',
        description: 'Reserved for AS Agents core administration team.',
    },
};

const BENEFITS: string[] = [
    'Multitenant oversight lets you spin up dedicated workspaces in minutes.',
    'AI copilots accelerate bid writing, forecasting and daily progress analysis.',
    'Field-friendly tools capture safety, timesheets and site evidence offline.',
    'Granular permissions align office, site and partner access in one hub.',
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^https?:\/\/\S+$/i;
const PASSWORD_MIN_LENGTH = 8;

type PasswordRule = (password: string) => boolean;

const DEFAULT_PASSWORD_RULES: PasswordRule[] = [
    value => value.length >= PASSWORD_MIN_LENGTH,
    value => /[A-Z]/.test(value),
    value => /[a-z]/.test(value),
    value => /\d/.test(value),
    value => /[^A-Za-z0-9]/.test(value),
];

const PasswordStrengthMeter: React.FC<{ password: string; rules?: PasswordRule[] }> = ({ password, rules }) => {
    const evaluators = rules && rules.length > 0 ? rules : DEFAULT_PASSWORD_RULES;
    const evaluations = evaluators.map(rule => {
        try {
            return rule(password);
        } catch (error) {
            console.error('[PasswordStrengthMeter] rule evaluation failed', error);
            return false;
        }
    });

    const getPasswordStrengthColor = (score: number, totalRules: number): string => {
        if (score <= 2) return 'bg-destructive';
        if (score < totalRules) return 'bg-amber-500';
        return 'bg-emerald-500';
    };

    const totalRules = evaluations.length || 1;
    const score = evaluations.filter(Boolean).length;
    const width = Math.min(100, Math.max(0, (score / totalRules) * 100));
    const color = getPasswordStrengthColor(score, totalRules);
    const labels = ['Very weak', 'Weak', 'Fair', 'Strong', 'Excellent'];
    const labelIndex = Math.min(labels.length - 1, Math.max(score - 1, 0));

    return (
        <div className="space-y-1">
            <div className="h-1.5 w-full rounded-full bg-muted">
                <div
                    className={`password-strength-bar ${color}`}
                    data-width={width}
                />
            </div>
            <p className="text-xs text-muted-foreground">
                Password strength: <span className="font-medium text-foreground">{labels[labelIndex]}</span>
            </p>
        </div>
    );
};

const StepIndicator: React.FC<{ currentStep: RegistrationStep }> = ({ currentStep }) => (
    <ol className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {STEP_SEQUENCE.map((step, index) => {
            const isActive = step.id === currentStep;
            const isComplete = STEP_SEQUENCE.findIndex(item => item.id === currentStep) > index;
            const getStepClass = (isActive: boolean, isComplete: boolean): string => {
                if (isActive) return 'border-primary bg-primary/5 text-primary';
                if (isComplete) return 'border-emerald-400 bg-emerald-50 text-emerald-600';
                return 'border-border bg-muted/40 text-muted-foreground';
            };

            return (
                <li
                    key={step.id}
                    className={`flex-1 rounded-lg border px-4 py-3 text-left transition ${getStepClass(isActive, isComplete)}`}
                >
                    <div className="text-xs font-semibold uppercase tracking-wide">Step {index + 1}</div>
                    <div className="text-sm font-semibold text-foreground">{step.title}</div>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                </li>
            );
        })}
    </ol>
);

const SocialAuthButtons: React.FC<{ onSocial: (provider: SocialProvider) => void; loading: boolean }> = ({
    onSocial,
    loading,
}) => (
    <div className="space-y-3">
        <Button
            type="button"
            variant="secondary"
            className="flex w-full items-center justify-center gap-2"
            onClick={() => onSocial('google')}
            isLoading={loading}
        >
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.09-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 24c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.05-3.71 1.05-2.85 0-5.26-1.92-6.13-4.49H2.18v2.82C3.99 21.53 7.68 24 12 24z" />
                <path fill="#FBBC05" d="M5.87 15.13c-.22-.66-.35-1.36-.35-2.13s.13-1.47.35-2.13V8.05H2.18A11.99 11.99 0 000 12.99c0 1.9.45 3.69 1.18 4.94l4.69-2.8z" />
                <path fill="#EA4335" d="M12 4.75c1.62 0 3.07.56 4.21 1.64l3.16-3.16C17.46 1.16 14.97 0 12 0 7.68 0 3.99 2.47 2.08 6.05l3.69 2.82C6.74 6.67 9.15 4.75 12 4.75z" />
                <path fill="none" d="M0 0h24v24H0z" />
            </svg>
            Continue with Google
        </Button>
        <Button
            type="button"
            variant="secondary"
            className="flex w-full items-center justify-center gap-2"
            onClick={() => onSocial('facebook')}
            isLoading={loading}
        >
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#1877F2" d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.09 4.388 23.093 10.125 24v-8.437H7.078V12.07h3.047V9.412c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.513c-1.492 0-1.955.931-1.955 1.887v2.252h3.328l-.532 3.493h-2.796V24C19.612 23.093 24 18.09 24 12.073z" />
            </svg>
            Continue with Facebook
        </Button>
    </div>
);

export const UserRegistration: React.FC<UserRegistrationProps> = ({ onSwitchToLogin }) => {
    const { register, socialLogin, error: authError, loading: isSubmitting } = useAuth();

    const [step, setStep] = useState<RegistrationStep>('account');
    const [form, setForm] = useState<RegistrationState>(INITIAL_STATE);
    const [errors, setErrors] = useState<FormErrors>({});
    const [generalError, setGeneralError] = useState<string | null>(null);
    const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
    const [invitePreview, setInvitePreview] = useState<InvitePreview | null>(null);
    const [inviteError, setInviteError] = useState<string | null>(null);
    const [isCheckingInvite, setIsCheckingInvite] = useState(false);
    const [draftRestored, setDraftRestored] = useState(false);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        setGeneralError(authError);
    }, [authError]);

    useEffect(() => {
        const draft = loadRegistrationDraft();
        if (draft) {
            setStep(draft.step);
            setForm(prev => ({
                ...prev,
                firstName: draft.firstName,
                lastName: draft.lastName,
                email: draft.email,
                phone: draft.phone,
                companySelection: draft.companySelection,
                companyName: draft.companyName,
                companyType: draft.companyType,
                companyEmail: draft.companyEmail,
                companyPhone: draft.companyPhone,
                companyWebsite: draft.companyWebsite,
                inviteToken: draft.inviteToken,
                role: draft.role,
                updatesOptIn: draft.updatesOptIn,
                termsAccepted: draft.termsAccepted,
            }));
            setDraftRestored(registrationDraftHasContent(draft));
        }
        setInitialized(true);
    }, []);

    useEffect(() => {
        if (!initialized) {
            return;
        }
        saveRegistrationDraft({
            step,
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            phone: form.phone,
            companySelection: form.companySelection,
            companyName: form.companyName,
            companyType: form.companyType || undefined,
            companyEmail: form.companyEmail,
            companyPhone: form.companyPhone,
            companyWebsite: form.companyWebsite,
            inviteToken: form.inviteToken,
            role: form.role || undefined,
            updatesOptIn: form.updatesOptIn,
            termsAccepted: form.termsAccepted,
        });
    }, [form, step, initialized]);

    const allowedRoles = useMemo(() => {
        if (form.companySelection === 'create') {
            return [Role.OWNER];
        }
        if (form.companySelection === 'join' && invitePreview) {
            return invitePreview.allowedRoles;
        }
        if (form.companySelection === 'join') {
            return [];
        }
        return [Role.ADMIN, Role.PROJECT_MANAGER, Role.FOREMAN, Role.OPERATIVE, Role.CLIENT];
    }, [form.companySelection, invitePreview]);

    const updateField = <K extends keyof RegistrationState>(field: K, value: RegistrationState[K]) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setErrors(prev => {
            if (!prev[field]) {
                return prev;
            }
            const next = { ...prev };
            delete next[field];
            return next;
        });
        setGeneralError(null);
        if (draftRestored) {
            setDraftRestored(false);
        }
        if (field === 'email') {
            setEmailStatus('idle');
        }
        if (field === 'inviteToken') {
            setInvitePreview(null);
            setInviteError(null);
        }
    };

    const handleEmailBlur = async () => {
        const trimmed = form.email.trim();
        if (!trimmed || !EMAIL_REGEX.test(trimmed)) {
            return;
        }
        setEmailStatus('checking');
        try {
            const { available } = await authClient.checkEmailAvailability(trimmed);
            setEmailStatus(available ? 'available' : 'unavailable');
            if (!available) {
                setErrors(prev => ({
                    ...prev,
                    email: 'An account with this email already exists. Try signing in instead.',
                }));
            }
        } catch (error: any) {
            setEmailStatus('idle');
            setGeneralError(error?.message || 'Unable to verify email availability right now.');
        }
    };

    const handleInviteLookup = async () => {
        const token = form.inviteToken.trim();
        if (!token) {
            setErrors(prev => ({ ...prev, inviteToken: 'Enter the invite token supplied by your administrator.' }));
            return;
        }
        setIsCheckingInvite(true);
        try {
            const preview = await authClient.lookupInviteToken(token);
            setInvitePreview(preview);
            setInviteError(null);
            if (preview.suggestedRole && preview.allowedRoles.includes(preview.suggestedRole)) {
                updateField('role', preview.suggestedRole);
            }
        } catch (error: any) {
            const message = error?.message || 'Invite token could not be validated.';
            setInviteError(message);
            setErrors(prev => ({ ...prev, inviteToken: message }));
            setInvitePreview(null);
        } finally {
            setIsCheckingInvite(false);
        }
    };

    useEffect(() => {
        if (form.companySelection === 'create') {
            setForm(prev => ({ ...prev, role: Role.OWNER, inviteToken: '' }));
            setErrors(prev => {
                const next = { ...prev };
                delete next.role;
                delete next.inviteToken;
                return next;
            });
            setInvitePreview(null);
            setInviteError(null);
        } else if (form.companySelection === 'join') {
            setForm(prev => ({
                ...prev,
                role: prev.role && prev.role !== Role.OWNER ? prev.role : '',
            }));
        }
    }, [form.companySelection]);

    const validateStep = (currentStep: RegistrationStep): boolean => {
        const nextErrors: FormErrors = {};
        if (currentStep === 'account') {
            if (!form.firstName.trim()) nextErrors.firstName = 'Enter your first name.';
            if (!form.lastName.trim()) nextErrors.lastName = 'Enter your last name.';
            if (!EMAIL_REGEX.test(form.email.trim())) nextErrors.email = 'Provide a valid email address.';
            if (form.username && form.username.trim().length < 3) {
                nextErrors.username = 'Username must be at least 3 characters.';
            }
            if (form.password.length < PASSWORD_MIN_LENGTH) {
                nextErrors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
            }
            if (form.confirmPassword !== form.password) {
                nextErrors.confirmPassword = 'Passwords do not match.';
            }
        }
        if (currentStep === 'workspace') {
            if (!form.companySelection) {
                nextErrors.companySelection = 'Select whether you are creating or joining a workspace.';
            }
            if (form.companySelection === 'create') {
                if (!form.companyName.trim()) nextErrors.companyName = 'Provide the company or workspace name.';
                if (!form.companyType) nextErrors.companyType = 'Select a company type.';
                if (form.companyEmail && !EMAIL_REGEX.test(form.companyEmail.trim())) {
                    nextErrors.companyEmail = 'Company email must be valid.';
                }
                if (form.companyWebsite && !URL_REGEX.test(form.companyWebsite.trim())) {
                    nextErrors.companyWebsite = 'Enter a full URL starting with http or https.';
                }
            }
            if (form.companySelection === 'join') {
                if (!form.inviteToken.trim()) {
                    nextErrors.inviteToken = 'Invite token is required to join an existing tenant.';
                }
                if (allowedRoles.length > 0 && !form.role) {
                    nextErrors.role = 'Choose the role granted by your invite.';
                }
            }
        }
        if (currentStep === 'confirm') {
            if (!form.termsAccepted) {
                nextErrors.termsAccepted = 'You must accept the AS Agents terms and policies to continue.';
            }
        }
        setErrors(prev => ({ ...prev, ...nextErrors }));
        if (Object.keys(nextErrors).length > 0) {
            setGeneralError('Please review the highlighted fields.');
            return false;
        }
        return true;
    };

    const goToNextStep = () => {
        if (!validateStep(step)) {
            return;
        }
        if (step === 'account') {
            setStep('workspace');
        } else if (step === 'workspace') {
            setStep('confirm');
        }
    };

    const goToPreviousStep = () => {
        if (step === 'workspace') {
            setStep('account');
        } else if (step === 'confirm') {
            setStep('workspace');
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!validateStep('confirm')) {
            return;
        }
        setGeneralError(null);
        try {
            const payload: RegistrationPayload = {
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                email: form.email.trim(),
                username: form.username.trim() || undefined,
                phone: form.phone.trim() || undefined,
                password: form.password,
                confirmPassword: form.confirmPassword,
                companySelection: form.companySelection || undefined,
                companyName: form.companySelection === 'create' ? form.companyName.trim() : undefined,
                companyType: form.companySelection === 'create' ? (form.companyType || undefined) : undefined,
                companyEmail: form.companySelection === 'create' ? form.companyEmail.trim() || undefined : undefined,
                companyPhone: form.companySelection === 'create' ? form.companyPhone.trim() || undefined : undefined,
                companyWebsite: form.companySelection === 'create' ? form.companyWebsite.trim() || undefined : undefined,
                inviteToken: form.companySelection === 'join' ? form.inviteToken.trim() : undefined,
                role: form.companySelection === 'join' ? (form.role || undefined) : Role.OWNER,
                updatesOptIn: form.updatesOptIn,
                termsAccepted: form.termsAccepted,
            };
            const session = await register(payload);
            persistRememberedEmail(true, form.email.trim().toLowerCase());
            clearRegistrationDraft();
            if (session?.user?.email) {
                console.info('Registration completed for', session.user.email);
            }
        } catch (error: any) {
            setGeneralError(error?.message || 'Registration failed. Please try again.');
        }
    };

    const handleSocial = async (provider: SocialProvider) => {
        setGeneralError(null);
        try {
            await socialLogin(provider);
            clearRegistrationDraft();
        } catch (error: any) {
            setGeneralError(error?.message || `Unable to continue with ${provider}.`);
        }
    };

    return (
        <div className="min-h-screen bg-background py-10">
            <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row">
                <Card className="flex-1 space-y-8 p-6 sm:p-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Create your AS Agents workspace</h1>
                            <p className="text-sm text-muted-foreground">
                                Guided onboarding ensures multi-tenant governance and rapid platform rollout.
                            </p>
                        </div>
                        {draftRestored && (
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                                Draft restored
                            </span>
                        )}
                    </div>
                    <StepIndicator currentStep={step} />
                    <div className="border border-dashed border-border/60 bg-muted/40">
                        <AuthEnvironmentNotice />
                    </div>
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {generalError && (
                            <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                {generalError}
                            </div>
                        )}
                        {step === 'account' && (
                            <div className="grid gap-4 lg:grid-cols-2">
                                <label className="space-y-1 text-sm">
                                    <span className="font-medium text-foreground">First name</span>
                                    <input
                                        type="text"
                                        value={form.firstName}
                                        onChange={event => updateField('firstName', event.target.value)}
                                        className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${errors.firstName ? 'border-destructive' : 'border-border'
                                            }`}
                                    />
                                    {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
                                </label>
                                <label className="space-y-1 text-sm">
                                    <span className="font-medium text-foreground">Last name</span>
                                    <input
                                        type="text"
                                        value={form.lastName}
                                        onChange={event => updateField('lastName', event.target.value)}
                                        className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${errors.lastName ? 'border-destructive' : 'border-border'
                                            }`}
                                    />
                                    {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
                                </label>
                                <label className="space-y-1 text-sm lg:col-span-2">
                                    <span className="font-medium text-foreground">Business email</span>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={event => updateField('email', event.target.value)}
                                        onBlur={handleEmailBlur}
                                        className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${errors.email ? 'border-destructive' : 'border-border'
                                            }`}
                                    />
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>
                                            {emailStatus === 'available' && 'Email is available.'}
                                            {emailStatus === 'unavailable' && 'This email already has an account.'}
                                            {emailStatus === 'checking' && 'Checking availability…'}
                                        </span>
                                        <span>We will use this to send critical updates.</span>
                                    </div>
                                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                                </label>
                                <label className="space-y-1 text-sm">
                                    <span className="font-medium text-foreground">Preferred username</span>
                                    <input
                                        type="text"
                                        value={form.username}
                                        onChange={event => updateField('username', event.target.value)}
                                        placeholder="e.g. omnitenant.builder"
                                        className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${errors.username ? 'border-destructive' : 'border-border'
                                            }`}
                                    />
                                    <p className="text-xs text-muted-foreground">Unique handle for cross-tenant visibility.</p>
                                    {errors.username && <p className="text-xs text-destructive">{errors.username}</p>}
                                </label>
                                <label className="space-y-1 text-sm">
                                    <span className="font-medium text-foreground">Phone (optional)</span>
                                    <input
                                        type="tel"
                                        value={form.phone}
                                        onChange={event => updateField('phone', event.target.value)}
                                        className="w-full rounded-md border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </label>
                                <label className="space-y-1 text-sm">
                                    <span className="font-medium text-foreground">Password</span>
                                    <input
                                        type="password"
                                        value={form.password}
                                        onChange={event => updateField('password', event.target.value)}
                                        className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${errors.password ? 'border-destructive' : 'border-border'
                                            }`}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Use at least {PASSWORD_MIN_LENGTH} characters with numbers and symbols.
                                    </p>
                                    <PasswordStrengthMeter password={form.password} rules={[
                                        // Example rules, adjust as needed
                                        password => password.length >= PASSWORD_MIN_LENGTH,
                                        password => /\d/.test(password),
                                        password => /[!@#$%^&*]/.test(password)
                                    ]} />
                                    {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                                </label>
                                <label className="space-y-1 text-sm">
                                    <span className="font-medium text-foreground">Confirm password</span>
                                    <input
                                        type="password"
                                        value={form.confirmPassword}
                                        onChange={event => updateField('confirmPassword', event.target.value)}
                                        className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${errors.confirmPassword ? 'border-destructive' : 'border-border'
                                            }`}
                                    />
                                    {errors.confirmPassword && (
                                        <p className="text-xs text-destructive">{errors.confirmPassword}</p>
                                    )}
                                </label>
                            </div>
                        )}
                        {step === 'workspace' && (
                            <div className="space-y-6">
                                <div>
                                    <span className="text-sm font-medium text-foreground">Workspace goal</span>
                                    <div className="mt-2 grid gap-3 sm:grid-cols-2">
                                        <button
                                            type="button"
                                            onClick={() => updateField('companySelection', 'create')}
                                            className={`rounded-lg border px-4 py-3 text-left transition ${form.companySelection === 'create'
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-border hover:border-primary'
                                                }`}
                                        >
                                            <span className="block text-sm font-semibold">Create a new tenant</span>
                                            <span className="text-xs text-muted-foreground">
                                                Ideal for platform owners and new partner companies.
                                            </span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => updateField('companySelection', 'join')}
                                            className={`rounded-lg border px-4 py-3 text-left transition ${form.companySelection === 'join'
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-border hover:border-primary'
                                                }`}
                                        >
                                            <span className="block text-sm font-semibold">Join an existing tenant</span>
                                            <span className="text-xs text-muted-foreground">
                                                Use an invite token supplied by your administrator.
                                            </span>
                                        </button>
                                    </div>
                                    {errors.companySelection && (
                                        <p className="mt-2 text-xs text-destructive">{errors.companySelection}</p>
                                    )}
                                </div>
                                {form.companySelection === 'create' && (
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <label className="space-y-1 text-sm sm:col-span-2">
                                            <span className="font-medium text-foreground">Company or workspace name</span>
                                            <input
                                                type="text"
                                                value={form.companyName}
                                                onChange={event => updateField('companyName', event.target.value)}
                                                className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${errors.companyName ? 'border-destructive' : 'border-border'
                                                    }`}
                                            />
                                            {errors.companyName && (
                                                <p className="text-xs text-destructive">{errors.companyName}</p>
                                            )}
                                        </label>
                                        <label className="space-y-1 text-sm">
                                            <span className="font-medium text-foreground">Company type</span>
                                            <select
                                                value={form.companyType}
                                                onChange={event => updateField('companyType', event.target.value as CompanyType)}
                                                className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${errors.companyType ? 'border-destructive' : 'border-border'
                                                    }`}
                                            >
                                                <option value="">Select type</option>
                                                {COMPANY_TYPES.map(type => (
                                                    <option key={type.value} value={type.value}>
                                                        {type.label}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.companyType && (
                                                <p className="text-xs text-destructive">{errors.companyType}</p>
                                            )}
                                        </label>
                                        <label className="space-y-1 text-sm">
                                            <span className="font-medium text-foreground">Company email (optional)</span>
                                            <input
                                                type="email"
                                                value={form.companyEmail}
                                                onChange={event => updateField('companyEmail', event.target.value)}
                                                className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${errors.companyEmail ? 'border-destructive' : 'border-border'
                                                    }`}
                                            />
                                            {errors.companyEmail && (
                                                <p className="text-xs text-destructive">{errors.companyEmail}</p>
                                            )}
                                        </label>
                                        <label className="space-y-1 text-sm">
                                            <span className="font-medium text-foreground">Company phone (optional)</span>
                                            <input
                                                type="tel"
                                                value={form.companyPhone}
                                                onChange={event => updateField('companyPhone', event.target.value)}
                                                className="w-full rounded-md border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                        </label>
                                        <label className="space-y-1 text-sm sm:col-span-2">
                                            <span className="font-medium text-foreground">Website (optional)</span>
                                            <input
                                                type="url"
                                                value={form.companyWebsite}
                                                onChange={event => updateField('companyWebsite', event.target.value)}
                                                placeholder="https://"
                                                className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${errors.companyWebsite ? 'border-destructive' : 'border-border'
                                                    }`}
                                            />
                                            {errors.companyWebsite && (
                                                <p className="text-xs text-destructive">{errors.companyWebsite}</p>
                                            )}
                                        </label>
                                    </div>
                                )}
                                {form.companySelection === 'join' && (
                                    <div className="space-y-4">
                                        <label className="space-y-1 text-sm">
                                            <span className="font-medium text-foreground">Invite token</span>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={form.inviteToken}
                                                    onChange={event => updateField('inviteToken', event.target.value.toUpperCase())}
                                                    className={`flex-1 rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${errors.inviteToken ? 'border-destructive' : 'border-border'
                                                        }`}
                                                />
                                                <Button type="button" variant="secondary" onClick={handleInviteLookup} isLoading={isCheckingInvite}>
                                                    Verify invite
                                                </Button>
                                            </div>
                                            {invitePreview && (
                                                <p className="text-xs text-emerald-600">
                                                    Invite for {invitePreview.companyName} ({invitePreview.companyType || 'General'})
                                                </p>
                                            )}
                                            {(errors.inviteToken || inviteError) && (
                                                <p className="text-xs text-destructive">{errors.inviteToken || inviteError}</p>
                                            )}
                                        </label>
                                        <div className="space-y-2">
                                            <span className="text-sm font-medium text-foreground">Role within the tenant</span>
                                            <div className="grid gap-3 md:grid-cols-2">
                                                {allowedRoles.map(role => (
                                                    <button
                                                        type="button"
                                                        key={role}
                                                        onClick={() => updateField('role', role)}
                                                        className={`rounded-lg border px-4 py-3 text-left text-sm transition ${form.role === role
                                                            ? 'border-primary bg-primary/5 text-primary'
                                                            : 'border-border hover:border-primary'
                                                            }`}
                                                    >
                                                        <span className="block font-semibold">{ROLE_DETAILS[role].label}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {ROLE_DETAILS[role].description}
                                                        </span>
                                                    </button>
                                                ))}
                                                {allowedRoles.length === 0 && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Enter your invite token to view permitted roles.
                                                    </p>
                                                )}
                                            </div>
                                            {errors.role && <p className="text-xs text-destructive">{errors.role}</p>}
                                        </div>
                                    </div>
                                )}
                                <label className="flex items-start gap-3 text-sm text-muted-foreground">
                                    <input
                                        type="checkbox"
                                        checked={form.updatesOptIn}
                                        onChange={event => updateField('updatesOptIn', event.target.checked)}
                                        className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                                    />
                                    <span>Send me platform roadmap and tenant enablement tips.</span>
                                </label>
                            </div>
                        )}
                        {step === 'confirm' && (
                            <div className="space-y-6">
                                <Card className="border border-dashed border-border bg-muted/40 p-4">
                                    <h3 className="text-sm font-semibold text-foreground">Tenant summary</h3>
                                    <dl className="mt-3 grid gap-3 text-xs text-muted-foreground sm:grid-cols-2">
                                        <div>
                                            <dt className="font-semibold text-foreground">Owner</dt>
                                            <dd>
                                                {form.firstName} {form.lastName}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="font-semibold text-foreground">Email</dt>
                                            <dd>{form.email}</dd>
                                        </div>
                                        <div>
                                            <dt className="font-semibold text-foreground">Workspace mode</dt>
                                            <dd>{form.companySelection === 'create' ? 'Creating new tenant' : 'Joining existing tenant'}</dd>
                                        </div>
                                        {form.companySelection === 'create' && (
                                            <div>
                                                <dt className="font-semibold text-foreground">Company</dt>
                                                <dd>
                                                    {form.companyName} ({form.companyType || 'Type pending'})
                                                </dd>
                                            </div>
                                        )}
                                        {form.companySelection === 'join' && invitePreview && (
                                            <div>
                                                <dt className="font-semibold text-foreground">Joining</dt>
                                                <dd>{invitePreview.companyName}</dd>
                                            </div>
                                        )}
                                        <div>
                                            <dt className="font-semibold text-foreground">Role</dt>
                                            <dd>{ROLE_DETAILS[form.role || Role.OWNER]?.label ?? 'Owner'}</dd>
                                        </div>
                                    </dl>
                                </Card>
                                <label className="flex items-start gap-3 text-sm text-muted-foreground">
                                    <input
                                        type="checkbox"
                                        checked={form.termsAccepted}
                                        onChange={event => updateField('termsAccepted', event.target.checked)}
                                        className={`mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary ${errors.termsAccepted ? 'border-destructive' : ''
                                            }`}
                                    />
                                    <span>
                                        I agree to the{' '}
                                        <a
                                            href="https://asagents.co.uk/terms"
                                            className="text-primary underline"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            AS Agents Terms, Security & Data Processing policies
                                        </a>.
                                    </span>
                                </label>
                                {errors.termsAccepted && (
                                    <p className="text-xs text-destructive">{errors.termsAccepted}</p>
                                )}
                            </div>
                        )}
                        <div className="flex flex-col-reverse items-start gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex gap-3">
                                {step !== 'account' && (
                                    <Button type="button" variant="ghost" onClick={goToPreviousStep}>
                                        Back
                                    </Button>
                                )}
                                {step !== 'confirm' && (
                                    <Button type="button" onClick={goToNextStep}>
                                        Continue
                                    </Button>
                                )}
                                {step === 'confirm' && (
                                    <Button type="submit" isLoading={isSubmitting}>
                                        Launch workspace
                                    </Button>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Need help? Contact{' '}
                                <a className="text-primary underline" href="mailto:platform@asagents.co.uk">
                                    platform@asagents.co.uk
                                </a>
                            </p>
                        </div>
                    </form>
                </Card>
                <div className="w-full max-w-xl space-y-6">
                    <Card className="space-y-4 p-6">
                        <h2 className="text-xl font-semibold text-foreground">Prefer instant access?</h2>
                        <p className="text-sm text-muted-foreground">
                            Connect a trusted identity provider to create a fully managed tenant with best-practice controls
                            pre-configured for you.
                        </p>
                        <SocialAuthButtons onSocial={handleSocial} loading={isSubmitting} />
                        <p className="text-xs text-muted-foreground">
                            We will provision a dedicated tenant, assign you the owner role and email the audit trail instantly.
                        </p>
                    </Card>
                    <Card className="space-y-4 p-6">
                        <h2 className="text-xl font-semibold text-foreground">Why leaders choose AS Agents</h2>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            {BENEFITS.map(benefit => (
                                <li key={benefit} className="flex items-start gap-3">
                                    <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        ✓
                                    </span>
                                    <span>{benefit}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                    <Card className="space-y-3 p-6">
                        <h2 className="text-xl font-semibold text-foreground">Platform governance</h2>
                        <p className="text-sm text-muted-foreground">
                            Our principal admin <span className="font-semibold text-foreground">omnitenant.root</span> oversees tenant health,
                            multitenant access policies and proactive security automation.
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Dedicated dashboards surface tenant storage, adoption and anomaly alerts for transparent operations.
                        </p>
                    </Card>
                </div>
            </div>
            <div className="mt-10 text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <button type="button" onClick={onSwitchToLogin} className="font-semibold text-primary hover:text-primary/80">
                    Sign in
                </button>
            </div>
        </div>
    );
};
