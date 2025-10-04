import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { authClient, InvitePreview } from '../services/authClient';
import { CompanyType, RegistrationPayload, Role } from '../types';
import { AuthEnvironmentNotice } from './auth/AuthEnvironmentNotice';
import {
    clearRegistrationDraft,
    loadRegistrationDraft,
    saveRegistrationDraft,
    type RegistrationStep,
    registrationDraftHasContent,
} from '../utils/registrationDraft';
import { persistRememberedEmail } from '../utils/authRememberMe';

export const UserRegistration: React.FC<{ onSwitchToLogin: () => void }> = ({ onSwitchToLogin }) => (
    <Card className="p-6">
        <h2 className="text-lg font-semibold">Registration temporarily unavailable</h2>
        <p className="text-sm text-muted-foreground mt-1">Please contact support or use an existing account.</p>
        <div className="mt-4">
            <Button type="button" onClick={onSwitchToLogin}>Back to login</Button>
        </div>
    </Card>
);

/* BEGIN legacy implementation (temporarily disabled to stabilize build)

interface UserRegistrationProps {
  onSwitchToLogin: () => void;
type Step = 'personal' | 'company' | 'role' | 'verify' | 'terms';

}

const STEPS: { id: Step; name: string }[] = [
    { id: 'personal', name: 'Personal Info' },
    { id: 'company', name: 'Company' },
    { id: 'role', name: 'Your Role' },
    { id: 'verify', name: 'Verification' },
    { id: 'terms', name: 'Finish' },
];

const PasswordStrengthIndicator: React.FC<{ password?: string }> = ({ password = '' }) => {
    const getStrength = () => {
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        // FIX: Corrected regex to check for digits.
        if (/\d/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        return score;
    };
    const strength = getStrength();
    const width = (strength / 5) * 100;
    const color = strength < 3 ? 'bg-destructive' : strength < 5 ? 'bg-yellow-500' : 'bg-green-500';

    return (
        <div className="w-full bg-muted rounded-full h-1.5 mt-1">
            <div className={`h-1.5 rounded-full transition-all duration-300 ${color}`} style={{ width: `${width}%` }}></div>
        </div>
    );
const CreateCompanyModal: React.FC<{
    onClose: () => void;
    onSave: (data: { name: string; type: CompanyType; email: string; phone: string; website: string; }) => void;
    initialData: { name?: string; type?: CompanyType; email?: string; phone?: string; website?: string; };
}> = ({ onClose, onSave, initialData }) => {
    const [name, setName] = useState(initialData.name || '');
    const [type, setType] = useState<CompanyType | ''>(initialData.type || '');
    const [email, setEmail] = useState(initialData.email || '');
    const [phone, setPhone] = useState(initialData.phone || '');
    const [website, setWebsite] = useState(initialData.website || '');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const companyTypeOptions = [
        { value: 'GENERAL_CONTRACTOR', label: 'General Contractor' },
        { value: 'SUBCONTRACTOR', label: 'Subcontractor' },
        { value: 'SUPPLIER', label: 'Supplier' },
        { value: 'CONSULTANT', label: 'Consultant' },
        { value: 'CLIENT', label: 'Client' },
const STEP_FIELDS: Record<RegistrationStep, Array<keyof RegistrationState>> = {
    account: ['firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword'],
    workspace: ['companySelection', 'companyName', 'companyType', 'companyEmail', 'companyPhone', 'companyWebsite', 'inviteToken', 'role'],
    confirm: ['termsAccepted'],
};

const COMPANY_TYPES: { value: CompanyType; label: string }[] = [
    { value: 'GENERAL_CONTRACTOR', label: 'General Contractor' },
    { value: 'SUBCONTRACTOR', label: 'Subcontractor' },
    { value: 'SUPPLIER', label: 'Supplier' },
    { value: 'CONSULTANT', label: 'Consultant' },
    { value: 'CLIENT', label: 'Client' },
];

const ROLE_DETAILS: Record<Role, { label: string; description: string }> = {
    [Role.OWNER]: {
        label: 'Owner',
        description: 'Full administrative access, billing controls, and user management.',
    },
    [Role.ADMIN]: {
        label: 'Administrator',
        description: 'Manage people, approvals, projects, and financial workflows.',
    },
    [Role.PROJECT_MANAGER]: {
        label: 'Project Manager',
        description: 'Coordinate schedules, tasks, stakeholders, and progress reporting.',
    },
    [Role.FOREMAN]: {
        label: 'Foreman',
        description: 'Lead on-site crews, raise safety issues, and track daily activity.',
    },
    [Role.OPERATIVE]: {
        label: 'Operative',
        description: 'Log time, update task progress, and collaborate with field teams.',
    },
    [Role.CLIENT]: {
        label: 'Client',
        description: 'Review milestones, approve work, and stay informed on delivery.',
    },
    [Role.PRINCIPAL_ADMIN]: {
        label: 'Principal Admin',
        description: 'Reserved for AS Agents platform administrators.',
    },
};

const BENEFITS = [
    'AI-assisted scheduling, forecasting, and risk insights for every project.',
    'Role-based controls keep office teams and field crews perfectly aligned.',
    'Secure document sharing, timesheets, and financial dashboards in one hub.',
    'Offline-ready syncing so work continues even without a network connection.',
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+()\d\s-]{6,}$/;
const URL_REGEX = /^https?:\/\/\S+$/i;

const PasswordStrengthMeter: React.FC<{ password: string }> = ({ password }) => {
    const rules = [
        password.length >= 8,
        /[A-Z]/.test(password),
        /[a-z]/.test(password),
        /\d/.test(password),
        /[^A-Za-z0-9]/.test(password),
    ];
    const score = rules.filter(Boolean).length;
    const width = (score / rules.length) * 100;
    const color = score <= 2 ? 'bg-destructive' : score < 5 ? 'bg-amber-500' : 'bg-emerald-500';
    const labels = ['Very weak', 'Weak', 'Fair', 'Strong', 'Excellent'];

    return (
        <div className="space-y-1">
            <div className="w-full h-1.5 rounded-full bg-muted">
                <div className={`h-1.5 rounded-full transition-all duration-300 ${color}`} style={{ width: `${width}%` }} />
            </div>
            <p className="text-xs text-muted-foreground">
                Password strength: <span className="font-medium text-foreground">{labels[Math.max(score - 1, 0)]}</span>
            </p>
        </div>
    );
        </div>
    );
};

const StepIndicator: React.FC<{ currentStep: RegistrationStep }> = ({ currentStep }) => (
    <ol className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {STEP_SEQUENCE.map((step, index) => {
            const isCompleted = STEP_SEQUENCE.findIndex(s => s.id === currentStep) > index;
            const isActive = step.id === currentStep;
            return (
                <li key={step.id} className="flex flex-1 items-center gap-3">
                    <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition-colors ${
                            isCompleted
                                ? 'border-primary bg-primary text-primary-foreground'
                                : isActive
                                    ? 'border-primary text-primary'
                                    : 'border-border text-muted-foreground'
                        }`}
                    >
                        {isCompleted ? '✓' : index + 1}
                    </div>
                    <div>
                        <p className={`text-sm font-semibold ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>{step.title}</p>
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                </li>
            );
        })}
    </ol>
);

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    hint?: string;
}

const TextField: React.FC<TextFieldProps> = ({ label, error, hint, className, id, ...props }) => (
    <div className="space-y-1">
        <label htmlFor={id} className="block text-sm font-medium text-muted-foreground">
            {label}
        </label>
        <input
            id={id}
            className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary ${
                error ? 'border-destructive' : 'border-border'
            } ${className ?? ''}`}
            {...props}
        />
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
);

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    options: { value: string; label: string }[];
    error?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({ label, options, error, id, className, ...props }) => (
    <div className="space-y-1">
        <label htmlFor={id} className="block text-sm font-medium text-muted-foreground">
            {label}
        </label>
        <select
            id={id}
            className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary ${
                error ? 'border-destructive' : 'border-border'
            } ${className ?? ''}`}
            {...props}
        >
            <option value="">Select…</option>
            {options.map(option => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
        {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
);

interface CheckboxFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: React.ReactNode;
    description?: string;
    error?: string;
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({ label, description, error, ...props }) => (
    <div className="space-y-1">
        <label className="flex items-start gap-3 text-sm text-muted-foreground">
            <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary" {...props} />
            <span>
                <span className="font-medium text-foreground">{label}</span>
                {description && <span className="block text-xs text-muted-foreground">{description}</span>}
            </span>
        </label>
        {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
);

interface SelectionCardProps {
    title: string;
    description: string;
    isSelected: boolean;
    onSelect: () => void;
}

const SelectionCard: React.FC<SelectionCardProps> = ({ title, description, isSelected, onSelect }) => (
    <button
        type="button"
        onClick={onSelect}
        className={`rounded-lg border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-primary sm:p-5 ${
            isSelected ? 'border-primary bg-primary/5 text-foreground shadow-sm' : 'border-border hover:border-primary'
        }`}
    >
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </button>
);

export const UserRegistration: React.FC<UserRegistrationProps> = ({ onSwitchToLogin }) => {
    const { register, error: authError, loading: isSubmitting } = useAuth();

    const [step, setStep] = useState<RegistrationStep>('account');
    const [form, setForm] = useState<RegistrationState>(INITIAL_STATE);
    const [errors, setErrors] = useState<FormErrors>({});
    const [generalError, setGeneralError] = useState<string | null>(null);

    const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
    const [invitePreview, setInvitePreview] = useState<InvitePreview | null>(null);
    const [inviteError, setInviteError] = useState<string | null>(null);
    const [isCheckingInvite, setIsCheckingInvite] = useState(false);
    const [draftRestored, setDraftRestored] = useState(false);

    const hasHydratedDraftRef = useRef(false);

    useEffect(() => {
        setGeneralError(authError);
    }, [authError]);

    useEffect(() => {
        if (emailStatus === 'available') {
            setErrors(prev => {
                if (!prev.email) {
                    return prev;
                }
                const next = { ...prev };
                delete next.email;
                return next;
            });
        }
    }, [emailStatus]);

    useEffect(() => {
        if (hasHydratedDraftRef.current) {
            return;
        }

        let isMounted = true;
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
            setInviteError(null);
            setEmailStatus('idle');

            if (draft.companySelection === 'join' && draft.inviteToken) {
                setIsCheckingInvite(true);
                authClient
                    .lookupInviteToken(draft.inviteToken)
                    .then(preview => {
                        if (!isMounted) return;
                        setInvitePreview(preview);
                        setErrors(prev => {
                            const next = { ...prev };
                            delete next.inviteToken;
                            delete next.role;
                            return next;
                        });
                        if (!preview.allowedRoles.includes(draft.role as Role)) {
                            setForm(prev => ({
                                ...prev,
                                role: preview.suggestedRole || preview.allowedRoles[0] || '',
                            }));
                        }
                    })
                    .catch(error => {
                        if (!isMounted) return;
                        setInvitePreview(null);
                        const message = error?.message || 'We could not validate that invite token. Please double-check and try again.';
                        setInviteError(message);
                        setErrors(prev => ({ ...prev, inviteToken: message }));
                    })
                    .finally(() => {
                        if (!isMounted) return;
                        setIsCheckingInvite(false);
                    });
            }
        }

        hasHydratedDraftRef.current = true;
        return () => {
            isMounted = false;
        };
    }, []);

    const companySelection = form.companySelection;

    useEffect(() => {
        if (companySelection === 'create') {
            setForm(prev => ({
                ...prev,
                role: Role.OWNER,
                inviteToken: '',
            }));
            setInvitePreview(null);
            setInviteError(null);
            setErrors(prev => {
                const next = { ...prev };
                delete next.inviteToken;
                delete next.role;
                return next;
            });
        } else if (companySelection === 'join') {
            setForm(prev => ({
                ...prev,
                role: prev.role && prev.role !== Role.OWNER ? prev.role : '',
            }));
        }
    }, [companySelection]);

    const allowedRoles = useMemo(() => {
        if (companySelection === 'create') {
            return [Role.OWNER];
        }
        if (companySelection === 'join' && invitePreview) {
            return invitePreview.allowedRoles;
        }
        if (companySelection === 'join') {
            return [];
        }
        return [Role.ADMIN, Role.PROJECT_MANAGER, Role.FOREMAN, Role.OPERATIVE];
    }, [companySelection, invitePreview]);

    const handleFieldChange = <K extends keyof RegistrationState>(field: K, value: RegistrationState[K]) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setGeneralError(null);
        setErrors(prev => {
            if (!prev[field]) {
                return prev;
            }
            const next = { ...prev };
            delete next[field];
            return next;
        });

        if (field === 'email') {
            setEmailStatus('idle');
        }
        if (field === 'inviteToken') {
            setInvitePreview(null);
            setInviteError(null);
        }
        if (draftRestored) {
            setDraftRestored(false);
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
                setErrors(prev => ({ ...prev, email: 'An account with this email already exists. Try signing in instead.' }));
            }
        } catch (error: any) {
            setEmailStatus('idle');
            setGeneralError(error?.message || 'Unable to verify email right now. Please try again later.');
        }
    };

    const handleInviteLookup = async () => {
        const token = form.inviteToken.trim();
        if (!token) {
            setErrors(prev => ({ ...prev, inviteToken: 'Enter the invite token provided to you.' }));
            setInviteError('Invite token is required.');
            return;
        }
        setIsCheckingInvite(true);
        setInviteError(null);
        try {
            const preview = await authClient.lookupInviteToken(token);
            setInvitePreview(preview);
            setErrors(prev => {
                const next = { ...prev };
                delete next.inviteToken;
                delete next.role;
                return next;
            });
            if (!preview.allowedRoles.includes(form.role as Role)) {
                handleFieldChange('role', preview.suggestedRole || preview.allowedRoles[0]);
            }
        } catch (error: any) {
            setInvitePreview(null);
            const message = error?.message || 'We could not validate that invite token. Please double-check and try again.';
            setInviteError(message);
            setErrors(prev => ({ ...prev, inviteToken: message }));
        } finally {
            setIsCheckingInvite(false);
        }
    };

    useEffect(() => {
        if (!hasHydratedDraftRef.current) {
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
            companyType: form.companyType,
            companyEmail: form.companyEmail,
            companyPhone: form.companyPhone,
            companyWebsite: form.companyWebsite,
            inviteToken: form.inviteToken,
            role: form.role,
            updatesOptIn: form.updatesOptIn,
            termsAccepted: form.termsAccepted,
        });
    }, [
        step,
        form.firstName,
        form.lastName,
        form.email,
        form.phone,
        form.companySelection,
        form.companyName,
        form.companyType,
        form.companyEmail,
        form.companyPhone,
        form.companyWebsite,
        form.inviteToken,
        form.role,
        form.updatesOptIn,
        form.termsAccepted,
    ]);

    const validateStep = (currentStep: RegistrationStep): boolean => {
        const nextErrors: FormErrors = {};
        const clearTargets = STEP_FIELDS[currentStep];

        switch (currentStep) {
            case 'account': {
                if (!form.firstName.trim()) nextErrors.firstName = 'Enter your first name.';
                if (!form.lastName.trim()) nextErrors.lastName = 'Enter your last name.';
                if (!form.email.trim() || !EMAIL_REGEX.test(form.email)) {
                    nextErrors.email = 'Provide a valid work email address.';
                } else if (emailStatus === 'unavailable') {
                    nextErrors.email = 'This email is already registered. Sign in instead.';
                } else if (emailStatus === 'checking') {
                    nextErrors.email = 'Hold on while we finish checking this email address.';
                }
                if (form.phone && !PHONE_REGEX.test(form.phone)) {
                    nextErrors.phone = 'Enter a valid phone number or leave this blank.';
                }
                const password = form.password;
                const requirements = [
                    password.length >= 8,
                    /[A-Z]/.test(password),
                    /[a-z]/.test(password),
                    /\d/.test(password),
                    /[^A-Za-z0-9]/.test(password),
                ];
                if (!requirements.every(Boolean)) {
                    nextErrors.password = 'Use at least 8 characters with upper/lower case letters, a number, and a symbol.';
                }
                if (password !== form.confirmPassword) {
                    nextErrors.confirmPassword = 'Passwords must match exactly.';
                }
                break;
            }
            case 'workspace': {
                if (!form.companySelection) {
                    nextErrors.companySelection = 'Choose whether to create a workspace or join an existing one.';
                } else if (form.companySelection === 'create') {
                    if (!form.companyName.trim()) nextErrors.companyName = 'Provide a company name.';
                    if (!form.companyType) nextErrors.companyType = 'Select a company type.';
                    if (form.companyEmail && !EMAIL_REGEX.test(form.companyEmail)) {
                        nextErrors.companyEmail = 'Enter a valid email address or leave it blank.';
                    }
                    if (form.companyPhone && !PHONE_REGEX.test(form.companyPhone)) {
                        nextErrors.companyPhone = 'Use digits and country code or leave this field empty.';
                    }
                    if (form.companyWebsite && !URL_REGEX.test(form.companyWebsite)) {
                        nextErrors.companyWebsite = 'Include https:// in the company website URL.';
                    }
                } else if (form.companySelection === 'join') {
                    if (!form.inviteToken.trim()) {
                        nextErrors.inviteToken = 'Enter the invite token provided by your administrator.';
                    } else if (!invitePreview) {
                        nextErrors.inviteToken = 'Verify the invite token before continuing.';
                    }
                    if (!form.role) {
                        nextErrors.role = 'Select the role you will assume in this workspace.';
                    }
                }
                break;
            }
            case 'confirm': {
                if (!form.termsAccepted) {
                    nextErrors.termsAccepted = 'You must accept the terms of service to continue.';
                }
                break;
            }
        }

        setErrors(prev => {
            const cleaned = { ...prev };
            clearTargets.forEach(field => {
                delete cleaned[field];
            });
            return { ...cleaned, ...nextErrors };
        });

        return Object.keys(nextErrors).length === 0;
    };

    const ensureAllStepsValid = (): boolean => {
        for (const { id } of STEP_SEQUENCE) {
            if (!validateStep(id)) {
                setStep(id);
                return false;
            }
        }
        return true;
    };

    const goToNextStep = () => {
        const currentIndex = STEP_SEQUENCE.findIndex(s => s.id === step);
        if (validateStep(step) && currentIndex < STEP_SEQUENCE.length - 1) {
            setStep(STEP_SEQUENCE[currentIndex + 1].id);
        }
    };

    const goToPreviousStep = () => {
        const currentIndex = STEP_SEQUENCE.findIndex(s => s.id === step);
        if (currentIndex > 0) {
            setStep(STEP_SEQUENCE[currentIndex - 1].id);
        }
    };

    const handleSubmit = async () => {
        if (!ensureAllStepsValid()) {
            return;
        }
        setGeneralError(null);

        const payload: RegistrationPayload = {
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            email: form.email.trim().toLowerCase(),
            password: form.password,
            phone: form.phone.trim() || undefined,
            companySelection: form.companySelection || undefined,
            companyName: form.companySelection === 'create' ? form.companyName.trim() : undefined,
            companyType: form.companySelection === 'create' ? (form.companyType || undefined) : undefined,
            companyEmail: form.companySelection === 'create' ? form.companyEmail.trim().toLowerCase() || undefined : undefined,
            companyPhone: form.companySelection === 'create' ? form.companyPhone.trim() || undefined : undefined,
            companyWebsite: form.companySelection === 'create' ? form.companyWebsite.trim() || undefined : undefined,
            inviteToken: form.companySelection === 'join' ? form.inviteToken.trim() : undefined,
            role: form.role || undefined,
            updatesOptIn: form.updatesOptIn,
            termsAccepted: form.termsAccepted,
        };

        try {
            await register(payload);
            clearRegistrationDraft();
            persistRememberedEmail(true, payload.email);
        } catch (error) {
            // Errors are surfaced through auth context
        }
    };

    const handleResetDraft = () => {
        clearRegistrationDraft();
        setForm(() => ({ ...INITIAL_STATE }));
        setStep('account');
        setErrors({});
        setGeneralError(null);
        setInvitePreview(null);
        setInviteError(null);
        setEmailStatus('idle');
        setDraftRestored(false);
        setIsCheckingInvite(false);
    };

    const handleFormSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (step === 'confirm') {
            handleSubmit();
        } else {
            goToNextStep();
        }
    };

    const renderAccountStep = () => (
        <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                    id="firstName"
                    label="First name"
                    value={form.firstName}
                    onChange={event => handleFieldChange('firstName', event.target.value)}
                    error={errors.firstName}
                    autoComplete="given-name"
                />
                <TextField
                    id="lastName"
                    label="Last name"
                    value={form.lastName}
                    onChange={event => handleFieldChange('lastName', event.target.value)}
                    error={errors.lastName}
                    autoComplete="family-name"
                />
            </div>
            <TextField
                id="email"
                label="Work email"
                type="email"
                value={form.email}
                onChange={event => handleFieldChange('email', event.target.value)}
                onBlur={handleEmailBlur}
                error={errors.email}
                autoComplete="email"
                hint="We use this for secure login links and workspace notifications."
            />
            {emailStatus === 'checking' && <p className="text-xs text-muted-foreground">Checking email availability…</p>}
            {emailStatus === 'available' && !errors.email && <p className="text-xs text-emerald-600">Great news — this email is available.</p>}
            {emailStatus === 'unavailable' && <p className="text-xs text-destructive">This email is already registered. Try signing in instead.</p>}
            <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                    id="password"
                    label="Password"
                    type="password"
                    value={form.password}
                    onChange={event => handleFieldChange('password', event.target.value)}
                    error={errors.password}
                    autoComplete="new-password"
                />
                <TextField
                    id="confirmPassword"
                    label="Confirm password"
                    type="password"
                    value={form.confirmPassword}
                    onChange={event => handleFieldChange('confirmPassword', event.target.value)}
                    error={errors.confirmPassword}
                    autoComplete="new-password"
                />
            </div>
            <PasswordStrengthMeter password={form.password} />
            <TextField
                id="phone"
                label="Phone number (optional)"
                type="tel"
                value={form.phone}
                onChange={event => handleFieldChange('phone', event.target.value)}
                error={errors.phone}
                hint="Include country code if you want SMS reminders."
            />
        </div>
    );

    const renderWorkspaceStep = () => (
        <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
                <SelectionCard
                    title="Create a new workspace"
                    description="Set up a workspace for your company and invite teammates later."
                    isSelected={form.companySelection === 'create'}
                    onSelect={() => handleFieldChange('companySelection', 'create')}
                />
                <SelectionCard
                    title="Join an existing workspace"
                    description="Use the invite token shared by an administrator to join instantly."
                    isSelected={form.companySelection === 'join'}
                    onSelect={() => handleFieldChange('companySelection', 'join')}
                />
            </div>
            {errors.companySelection && <p className="text-xs text-destructive">{errors.companySelection}</p>}

            {form.companySelection === 'create' && (
                <div className="space-y-4">
                    <TextField
                        id="companyName"
                        label="Company name"
                        value={form.companyName}
                        onChange={event => handleFieldChange('companyName', event.target.value)}
                        error={errors.companyName}
                        autoComplete="organization"
                    />
                    <SelectField
                        id="companyType"
                        label="Company type"
                        value={form.companyType}
                        onChange={event => handleFieldChange('companyType', event.target.value as CompanyType | '')}
                        options={COMPANY_TYPES}
                        error={errors.companyType}
                    />
                    <TextField
                        id="companyEmail"
                        label="Company email (optional)"
                        type="email"
                        value={form.companyEmail}
                        onChange={event => handleFieldChange('companyEmail', event.target.value)}
                        error={errors.companyEmail}
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                        <TextField
                            id="companyPhone"
                            label="Company phone (optional)"
                            value={form.companyPhone}
                            onChange={event => handleFieldChange('companyPhone', event.target.value)}
                            error={errors.companyPhone}
                        />
                        <TextField
                            id="companyWebsite"
                            label="Company website (optional)"
                            placeholder="https://example.com"
                            value={form.companyWebsite}
                            onChange={event => handleFieldChange('companyWebsite', event.target.value)}
                            error={errors.companyWebsite}
                        />
                    </div>
                    <div className="rounded-md border border-dashed border-primary/50 bg-primary/5 p-4 text-xs text-muted-foreground">
                        You will be registered as the workspace owner with full administrative access. Invite additional team members after onboarding.
                    </div>
                </div>
            )}

            {form.companySelection === 'join' && (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="inviteToken" className="block text-sm font-medium text-muted-foreground">
                            Invite token
                        </label>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <input
                                id="inviteToken"
                                className={`flex-1 rounded-md border px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary ${
                                    errors.inviteToken ? 'border-destructive' : 'border-border'
                                }`}
                                value={form.inviteToken}
                                onChange={event => handleFieldChange('inviteToken', event.target.value.toUpperCase())}
                                placeholder="JOIN-XXXXX"
                            />
                            <Button type="button" onClick={handleInviteLookup} isLoading={isCheckingInvite} variant="secondary" size="sm">
                                Verify token
                            </Button>
                        </div>
                        {inviteError && <p className="text-xs text-destructive">{inviteError}</p>}
                        {invitePreview && (
                            <div className="rounded-md border border-primary/40 bg-primary/5 p-3 text-xs text-muted-foreground">
                                <p className="font-medium text-foreground">Joining: {invitePreview.companyName}</p>
                                {invitePreview.companyType && <p className="mt-1">Type: {invitePreview.companyType.replace(/_/g, ' ').toLowerCase()}</p>}
                                <p className="mt-1">Allowed roles: {invitePreview.allowedRoles.map(role => ROLE_DETAILS[role].label).join(', ')}</p>
                            </div>
                        )}
                        {errors.inviteToken && <p className="text-xs text-destructive">{errors.inviteToken}</p>}
                    </div>
                    <SelectField
                        id="role"
                        label="Select your role"
                        value={form.role || ''}
                        onChange={event => handleFieldChange('role', (event.target.value as Role) || '')}
                        options={allowedRoles.map(role => ({ value: role, label: ROLE_DETAILS[role].label }))}
                        error={errors.role}
                        disabled={!invitePreview}
                    />
                    {form.role && (
                        <div className="rounded-md border border-border bg-muted/20 p-3 text-xs text-muted-foreground">
                            <p className="font-medium text-foreground">{ROLE_DETAILS[form.role].label}</p>
                            <p className="mt-1 leading-relaxed">{ROLE_DETAILS[form.role].description}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    const renderConfirmStep = () => (
        <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
                <Card className="p-4">
                    <p className="text-sm font-semibold text-foreground">Account</p>
                    <dl className="mt-2 space-y-1 text-xs text-muted-foreground">
                        <div className="flex justify-between"><dt>Name</dt><dd className="text-right text-foreground">{form.firstName} {form.lastName}</dd></div>
                        <div className="flex justify-between"><dt>Email</dt><dd className="text-right text-foreground">{form.email}</dd></div>
                        {form.phone && <div className="flex justify-between"><dt>Phone</dt><dd className="text-right text-foreground">{form.phone}</dd></div>}
                    </dl>
                </Card>
                <Card className="p-4">
                    <p className="text-sm font-semibold text-foreground">Workspace</p>
                    <dl className="mt-2 space-y-1 text-xs text-muted-foreground">
                        <div className="flex justify-between"><dt>Mode</dt><dd className="text-right text-foreground">{form.companySelection === 'create' ? 'Creating new workspace' : 'Joining existing workspace'}</dd></div>
                        {form.companySelection === 'create' && (
                            <>
                                <div className="flex justify-between"><dt>Company</dt><dd className="text-right text-foreground">{form.companyName}</dd></div>
                                {form.companyType && <div className="flex justify-between"><dt>Type</dt><dd className="text-right text-foreground">{form.companyType.replace(/_/g, ' ').toLowerCase()}</dd></div>}
                            </>
                        )}
                        {form.companySelection === 'join' && invitePreview && (
                            <>
                                <div className="flex justify-between"><dt>Company</dt><dd className="text-right text-foreground">{invitePreview.companyName}</dd></div>
                                <div className="flex justify-between"><dt>Role</dt><dd className="text-right text-foreground">{form.role ? ROLE_DETAILS[form.role].label : 'Pending selection'}</dd></div>
                            </>
                        )}
                    </dl>
                </Card>
            </div>
            <CheckboxField
                checked={form.updatesOptIn}
                onChange={event => handleFieldChange('updatesOptIn', event.target.checked)}
                label="Keep me updated with product improvements and release notes"
            />
            <CheckboxField
                checked={form.termsAccepted}
                onChange={event => handleFieldChange('termsAccepted', event.target.checked)}
                label="I agree to the AS Agents Terms of Service"
                description="You acknowledge our Privacy Policy and accept the responsibilities associated with holding project data."
                error={errors.termsAccepted}
            />
        </div>
    );

    const currentStepContent = () => {
        switch (step) {
            case 'account':
                return renderAccountStep();
            case 'workspace':
                return renderWorkspaceStep();
            case 'confirm':
                return renderConfirmStep();
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-background py-10 px-4">
            <div className="mx-auto grid w-full max-w-5xl gap-10 lg:grid-cols-[2fr,1fr]">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-8 w-8 text-primary" fill="currentColor">
                                <path d="M12 2 2 22h20L12 2Zm0 3.3L19.1 20H4.9L12 5.3Z" />
                            </svg>
                            <h1 className="text-2xl font-bold text-foreground">Create your AS Agents account</h1>
                        </div>
                        <p className="text-sm text-muted-foreground">Three quick steps to get your construction teams collaborating in one workspace.</p>
                    </div>

                    <StepIndicator currentStep={step} />

                    {draftRestored && (
                        <div className="flex flex-col gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                            <span className="sm:pr-4">
                                We restored your saved registration details. Continue where you left off or start over.
                            </span>
                            <button
                                type="button"
                                onClick={handleResetDraft}
                                className="self-start text-sm font-medium text-primary hover:text-primary/80 sm:self-center"
                            >
                                Start over
                            </button>
                        </div>
                    )}

                    {generalError && (
                        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                            {generalError}
                        </div>
                    )}

                    <Card>
                        <form className="space-y-6" onSubmit={handleFormSubmit} noValidate>
                            <AuthEnvironmentNotice align="left" className="rounded-md bg-muted/40 px-3 py-2" />
                            {currentStepContent()}
                            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-3">
                                    {step !== 'account' ? (
                                        <Button type="button" variant="secondary" onClick={goToPreviousStep}>
                                            Back
                                        </Button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                clearRegistrationDraft();
                                                onSwitchToLogin();
                                            }}
                                            className="text-sm font-medium text-primary hover:text-primary/80"
                                        >
                                            Already have an account? Sign in
                                        </button>
                                    )}
                                </div>
                                <Button type="submit" isLoading={isSubmitting}>
                                    {step === 'confirm' ? 'Create account' : 'Continue'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>

                <Card className="space-y-5 bg-muted/40">
                    <div>
                        <p className="text-sm font-semibold text-foreground">Why teams choose AS Agents</p>
                        <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                            {BENEFITS.map(benefit => (
                                <li key={benefit} className="flex items-start gap-2">
                                    <span className="mt-0.5 text-primary">•</span>
                                    <span>{benefit}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="rounded-md border border-border bg-background p-4 text-xs text-muted-foreground">
                        <p className="font-medium text-foreground">Need to invite your crew?</p>
                        <p className="mt-1 leading-relaxed">
                            Owners can add teammates instantly after onboarding. Prefer us to help? Reach out and we’ll migrate existing project data for you.
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );

// --- Form Field Components ---
const InputField = ({ label, name, type = 'text', value = '', onChange, error, maxLength, inputClassName = '', isLabelSrOnly = false, placeholder }: { label: string; name: string; type?: string; value?: string; onChange: (name: string, value: string) => void; error?: string; maxLength?: number; inputClassName?: string; isLabelSrOnly?: boolean; placeholder?: string }) => (
    <div>
        <label htmlFor={name} className={isLabelSrOnly ? 'sr-only' : 'block text-sm font-medium text-muted-foreground'}>{label}</label>
        <input id={name} name={name} type={type} value={value} maxLength={maxLength} onChange={e => onChange(name, e.target.value)} placeholder={placeholder}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${error ? 'border-destructive' : 'border-border'} ${inputClassName}`} />
        {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
);

const SelectField = ({ label, name, value, onChange, error, options }: {label: string, name: string, value: any, onChange: any, error?: string, options: {value:string, label:string}[]}) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-muted-foreground">{label}</label>
        <select id={name} name={name} value={value} onChange={e => onChange(name, e.target.value)} required
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-card ${error ? 'border-destructive' : 'border-border'}`}>
            <option value="">Select an option</option>
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
);

const RadioCard = ({ name, value, label, description, checked, onChange }: { name: string, value: string | CompanyType | Role, label: string, description: string, checked: boolean, onChange: any }) => (
    <label className={`block p-4 border rounded-md cursor-pointer transition-all ${checked ? 'bg-primary/10 border-primary ring-2 ring-primary' : 'hover:bg-accent'}`}>
        <input type="radio" name={name} value={value} checked={checked} onChange={e => onChange(name, e.target.value)} className="sr-only"/>
        <p className="font-semibold">{label}</p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </label>
);
};

*/
};
