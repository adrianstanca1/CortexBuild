// A mock API using localStorage to simulate a backend.
// Supports offline queuing for write operations.

import { initialData } from './mockData';
import { apiCache, cacheKeys } from './cacheService';
import { ValidationService, securityValidation } from './validationService';
import { notificationService } from './notificationService';
import {
    User,
    Company,
    Project,
    ProjectPortfolioSummary,
    Task,
    TimeEntry,
    SafetyIncident,
    Equipment,
    Client,
    Invoice,
    Expense,
    Notification,
    LoginCredentials,
    RegisterCredentials,
    TaskStatus,
    TaskPriority,
    TimeEntryStatus,
    IncidentSeverity,
    SiteUpdate,
    ProjectMessage,
    Weather,
    InvoiceStatus,
    Quote,
    FinancialKPIs,
    MonthlyFinancials,
    CostBreakdown,
    Role,
    TimesheetStatus,
    IncidentStatus,
    AuditLog,
    ResourceAssignment,
    Conversation,
    Message,
    CompanySettings,
    ProjectAssignment,
    ProjectTemplate,
    ProjectInsight,
    FinancialForecast,
    WhiteboardNote,
    BidPackage,
    RiskAnalysis,
    Grant,
    Timesheet,
    Todo,
    InvoiceLineItem,
    Document,
    UsageMetric,
    CompanyType,
    ExpenseStatus,
    TodoStatus,
    TodoPriority,
    OperationalAlert,
    OperationalInsights,
} from '../types';
import { computeProjectPortfolioSummary } from '../utils/projectPortfolio';
import { getInvoiceFinancials } from '../utils/finance';
const delay = (ms = 50) => new Promise(res => setTimeout(res, ms));

type RequestOptions = { signal?: AbortSignal };
type ProjectSummaryOptions = RequestOptions & { projectIds?: string[] };

const ensureNotAborted = (signal?: AbortSignal) => {
    if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError');
    }
};

// Removed duplicate delay function - already exists elsewhere

// Enhanced API with caching, validation, and rate limiting
const withCache = <T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T> => {
    const cached = apiCache.get<T>(key);
    if (cached) return Promise.resolve(cached);

    return fetcher().then(result => {
        apiCache.set(key, result, ttl);
        return result;
    });
};

const withValidation = <T>(data: Partial<T>, rules: any[]): T => {
    const result = ValidationService.validate(data, rules);
    if (!result.isValid) {
        throw new Error(`Validation failed: ${Object.values(result.errors).flat().join(', ')}`);
    }
    return result.sanitizedData as T;
};

const withRateLimit = (key: string, limit: number = 100, windowMs: number = 60000): void => {
    if (!securityValidation.checkRateLimit(key, limit, windowMs)) {
        throw new Error('Rate limit exceeded. Please try again later.');
    }
};

const withSecurity = (input: string): void => {
    if (securityValidation.checkSqlInjection(input)) {
        throw new Error('Invalid input detected');
    }
    if (securityValidation.checkXss(input)) {
        throw new Error('Invalid input detected');
    }
};

const JWT_SECRET = 'your-super-secret-key-for-mock-jwt';
const MOCK_ACCESS_TOKEN_LIFESPAN = 15 * 60 * 1000; // 15 minutes
const MOCK_REFRESH_TOKEN_LIFESPAN = 7 * 24 * 60 * 60 * 1000; // 7 days
const MOCK_RESET_TOKEN_LIFESPAN = 60 * 60 * 1000; // 1 hour

// In-memory store for password reset tokens for this mock implementation
const passwordResetTokens = new Map<string, { userId: string, expires: number }>();

const encodeBase64 = (value: string): string => {
    if (typeof btoa === 'function') {
        return btoa(value);
    }
    if (typeof Buffer !== 'undefined') {
        return Buffer.from(value, 'binary').toString('base64');
    }
    throw new Error('Base64 encoding is not supported in this environment.');
};

const decodeBase64 = (value: string): string => {
    if (typeof atob === 'function') {
        return atob(value);
    }
    if (typeof Buffer !== 'undefined') {
        return Buffer.from(value, 'base64').toString('binary');
    }
    throw new Error('Base64 decoding is not supported in this environment.');
};

const createToken = (payload: object, expiresIn: number): string => {
    const header = { alg: 'HS256', typ: 'JWT' };
    const extendedPayload = { ...payload, iat: Date.now(), exp: Math.floor((Date.now() + expiresIn) / 1000) };
    const encodedHeader = encodeBase64(JSON.stringify(header));
    const encodedPayload = encodeBase64(JSON.stringify(extendedPayload));
    const signature = encodeBase64(JWT_SECRET);
    return `${encodedHeader}.${encodedPayload}.${signature}`;
};

/**
 * Decodes a token and validates its expiration.
 * @param token The JWT to decode.
 * @returns The decoded payload if the token is valid and not expired, otherwise null.
 */
const decodeToken = (token: string): any => {
    try {
        const payload = JSON.parse(decodeBase64(token.split('.')[1]));
        // This check ensures the token has not expired.
        if (payload.exp * 1000 < Date.now()) {
            throw new Error("Token expired");
        }
        return payload;
    } catch (e) {
        console.error("Token decode/validation failed:", e);
        return null;
    }
};

const safeNumber = (value: unknown): number => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === 'string') {
        const parsed = Number(value.trim());
        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }
    return 0;
};

const parseDate = (value: unknown): Date | null => {
    if (!value) {
        return null;
    }
    const parsed = value instanceof Date ? value : new Date(String(value));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getMonthKey = (date: Date): string => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const getMonthLabel = (date: Date): string =>
    date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });

const MILLISECONDS_PER_HOUR = 1000 * 60 * 60;
const MILLISECONDS_PER_DAY = MILLISECONDS_PER_HOUR * 24;

const hydrateData = <T extends { [key: string]: any }>(key: string, defaultData: T[]): T[] => {
    try {
        const stored = localStorage.getItem(`asagents_${key}`);
        if (stored) return JSON.parse(stored);
    } catch (e) {
        console.error(`Failed to hydrate ${key} from localStorage`, e);
    }
    localStorage.setItem(`asagents_${key}`, JSON.stringify(defaultData));
    return defaultData;
};

let db: {
    companies: Partial<Company>[];
    users: Partial<User>[];
    projects: Partial<Project>[];
    todos: Partial<Task>[];
    timeEntries: Partial<TimeEntry>[];
    safetyIncidents: Partial<SafetyIncident>[];
    equipment: Partial<Equipment>[];
    clients: Partial<Client>[];
    invoices: Partial<Invoice>[];
    expenses: Partial<Expense>[];
    siteUpdates: Partial<SiteUpdate>[];
    projectMessages: Partial<ProjectMessage>[];
    notifications: Partial<Notification>[];
    quotes: Partial<Quote>[];
    auditLogs: Partial<AuditLog>[];
    resourceAssignments: Partial<ResourceAssignment>[];
    conversations: Partial<Conversation>[];
    messages: Partial<Message>[];
    projectAssignments: Partial<ProjectAssignment>[];
    projectTemplates: Partial<ProjectTemplate>[];
    whiteboardNotes: Partial<WhiteboardNote>[];
    documents: Partial<Document>[];
    projectInsights: Partial<ProjectInsight>[];
    financialForecasts: Partial<FinancialForecast>[];
} = {
    companies: hydrateData('companies', initialData.companies),
    users: hydrateData('users', initialData.users),
    projects: hydrateData('projects', initialData.projects),
    todos: hydrateData('todos', initialData.todos),
    timeEntries: hydrateData('timeEntries', initialData.timeEntries),
    safetyIncidents: hydrateData('safetyIncidents', initialData.safetyIncidents),
    equipment: hydrateData('equipment', initialData.equipment),
    clients: hydrateData('clients', initialData.clients),
    invoices: hydrateData('invoices', initialData.invoices),
    expenses: hydrateData('expenses', initialData.expenses),
    siteUpdates: hydrateData('siteUpdates', initialData.siteUpdates),
    projectMessages: hydrateData('projectMessages', initialData.projectMessages),
    notifications: hydrateData('notifications', (initialData as any).notifications || []),
    quotes: hydrateData('quotes', (initialData as any).quotes || []),
    auditLogs: hydrateData('auditLogs', []),
    resourceAssignments: hydrateData('resourceAssignments', []),
    conversations: hydrateData('conversations', []),
    messages: hydrateData('messages', []),
    projectAssignments: hydrateData('projectAssignments', []),
    projectTemplates: hydrateData('projectTemplates', []),
    whiteboardNotes: hydrateData('whiteboardNotes', []),
    documents: hydrateData('documents', []),
    projectInsights: hydrateData('projectInsights', (initialData as any).projectInsights || []),
    financialForecasts: hydrateData('financialForecasts', (initialData as any).financialForecasts || []),
};

const findProjectById = (projectId: unknown): Partial<Project> | undefined => {
    if (projectId == null) {
        return undefined;
    }
    return db.projects.find(project => project.id != null && String(project.id) === String(projectId));
};

const resolveCompanyIdFromProject = (projectId: unknown): string | null => {
    const project = findProjectById(projectId);
    return project?.companyId != null ? String(project.companyId) : null;
};

const resolveCompanyIdFromUser = (userId: unknown): string | null => {
    if (userId == null) {
        return null;
    }
    const user = db.users.find(candidate => candidate.id != null && String(candidate.id) === String(userId));
    return user?.companyId != null ? String(user.companyId) : null;
};

const resolveCompanyIdForInvoice = (invoice: Partial<Invoice>): string | null => {
    const directCompany = (invoice as any).companyId;
    if (directCompany != null) {
        return String(directCompany);
    }

    const projectCompany = resolveCompanyIdFromProject(invoice.projectId);
    if (projectCompany) {
        return projectCompany;
    }

    if (invoice.clientId != null) {
        const client = db.clients.find(candidate => candidate.id != null && String(candidate.id) === String(invoice.clientId));
        if (client?.companyId != null) {
            return String(client.companyId);
        }
    }

    return null;
};

const resolveCompanyIdForExpense = (expense: Partial<Expense>): string | null => {
    const directCompany = (expense as any).companyId;
    if (directCompany != null) {
        return String(directCompany);
    }
    const projectCompany = resolveCompanyIdFromProject(expense.projectId);
    if (projectCompany) {
        return projectCompany;
    }
    const userCompany = resolveCompanyIdFromUser(expense.userId);
    if (userCompany) {
        return userCompany;
    }
    return null;
};

const getCompanyCurrency = (companyId: string): string => {
    const company = db.companies.find(entry => entry.id != null && String(entry.id) === String(companyId));
    const directCurrency = (company as any)?.currency;
    if (typeof directCurrency === 'string' && directCurrency.trim().length > 0) {
        return directCurrency;
    }
    const settingsCurrency = (company as any)?.settings?.currency;
    if (typeof settingsCurrency === 'string' && settingsCurrency.trim().length > 0) {
        return settingsCurrency;
    }
    return 'GBP';
};

const saveDb = () => {
    Object.entries(db).forEach(([key, value]) => {
        localStorage.setItem(`asagents_${key}`, JSON.stringify(value));
    });
};

const addAuditLog = (actorId: string, action: string, target?: { type: string, id: string, name: string }) => {
    const newLog: AuditLog = {
        id: String(Date.now() + Math.random()),
        actorId,
        action,
        target,
        timestamp: new Date().toISOString(),
    };
    db.auditLogs.push(newLog);
};

export const authApi = {
    register: async (credentials: Partial<RegisterCredentials & { companyName?: string; companyType?: CompanyType; companyEmail?: string; companyPhone?: string; companyWebsite?: string; companySelection?: 'create' | 'join', role?: Role }>): Promise<any> => {
        await delay();
        if (db.users.some(u => u.email === credentials.email)) {
            throw new Error("An account with this email already exists.");
        }

        let companyId: string;
        let userRole = credentials.role || Role.OPERATIVE;

        if (credentials.companySelection === 'create') {
            const newCompany: Partial<Company> = {
                id: String(Date.now()),
                name: credentials.companyName,
                type: credentials.companyType || 'GENERAL_CONTRACTOR',
                email: credentials.companyEmail,
                phone: credentials.companyPhone,
                website: credentials.companyWebsite,
                status: 'Active',
                subscriptionPlan: 'FREE',
                storageUsageGB: 0,
            };
            db.companies.push(newCompany);
            companyId = newCompany.id!;
            userRole = Role.OWNER;
        } else if (credentials.companySelection === 'join') {
            if (credentials.inviteToken !== 'JOIN-CONSTRUCTCO') {
                 throw new Error("Invalid invite token.");
            }
            companyId = '1';
        } else {
            throw new Error("Invalid company selection.");
        }

        const newUser: Partial<User> = {
            id: String(Date.now()),
            firstName: credentials.firstName,
            lastName: credentials.lastName,
            email: credentials.email,
            password: credentials.password,
            phone: credentials.phone,
            role: userRole,
            companyId,
            isActive: true,
            isEmailVerified: true, // Mocking verification for simplicity
            createdAt: new Date().toISOString(),
        };
        db.users.push(newUser);
        saveDb();

        const user = db.users.find(u => u.id === newUser.id) as User;
        const company = db.companies.find(c => c.id === companyId) as Company;

        const token = createToken({ userId: user.id, companyId: company.id, role: user.role }, MOCK_ACCESS_TOKEN_LIFESPAN);
        const refreshToken = createToken({ userId: user.id }, MOCK_REFRESH_TOKEN_LIFESPAN);
        
        return { success: true, token, refreshToken, user, company };
    },
    login: async (credentials: LoginCredentials): Promise<any> => {
        await delay(200);
        const user = db.users.find(u => u.email === credentials.email && u.password === credentials.password);
        if (!user) {
            throw new Error("Invalid email or password.");
        }
        if (user.mfaEnabled) {
            return { success: true, mfaRequired: true, userId: user.id };
        }
        return authApi.finalizeLogin(user.id as string);
    },
    verifyMfa: async (userId: string, code: string): Promise<any> => {
        await delay(200);
        if (code !== '123456') {
            throw new Error("Invalid MFA code.");
        }
        return authApi.finalizeLogin(userId);
    },
    finalizeLogin: async (userId: string): Promise<any> => {
        await delay();
        const user = db.users.find(u => u.id === userId) as User;
        if (!user) throw new Error("User not found during finalization.");
        const company = db.companies.find(c => c.id === user.companyId) as Company;
        if (!company) throw new Error("Company not found for user.");

        const token = createToken({ userId: user.id, companyId: company.id, role: user.role }, MOCK_ACCESS_TOKEN_LIFESPAN);
        const refreshToken = createToken({ userId: user.id }, MOCK_REFRESH_TOKEN_LIFESPAN);
        
        return { success: true, token, refreshToken, user, company };
    },
    refreshToken: async (refreshToken: string): Promise<{ token: string }> => {
        await delay();
        const decoded = decodeToken(refreshToken);
        if (!decoded) throw new Error("Invalid refresh token");
        const user = db.users.find(u => u.id === decoded.userId);
        if (!user) throw new Error("User not found for refresh token");
        const token = createToken({ userId: user.id, companyId: user.companyId, role: user.role }, MOCK_ACCESS_TOKEN_LIFESPAN);
        return { token };
    },
    /**
     * Gets user and company info from a token.
     * This function validates the token, including its expiration.
     * The client (`AuthContext`) is responsible for catching an expiry error and using the refresh token.
     */
    me: async (token: string): Promise<{ user: User, company: Company }> => {
        await delay();
        const decoded = decodeToken(token);
        if (!decoded) throw new Error("Invalid or expired token");
        const user = db.users.find(u => u.id === decoded.userId) as User;
        const company = db.companies.find(c => c.id === decoded.companyId) as Company;
        if (!user || !company) throw new Error("User or company not found");
        return { user, company };
    },
    requestPasswordReset: async (email: string): Promise<{ success: boolean }> => {
        await delay(300);
        const user = db.users.find(u => u.email === email);
        if (user) {
            const token = `reset-${Date.now()}-${Math.random()}`;
            passwordResetTokens.set(token, { userId: user.id!, expires: Date.now() + MOCK_RESET_TOKEN_LIFESPAN });
            console.log(`Password reset for ${email}. Token: ${token}`); // Simulate sending email
        }
        // Always return success to prevent user enumeration attacks
        return { success: true };
    },
    resetPassword: async (token: string, newPassword: string): Promise<{ success: boolean }> => {
        await delay(300);
        const tokenData = passwordResetTokens.get(token);
        if (!tokenData || tokenData.expires < Date.now()) {
            throw new Error("Invalid or expired password reset token.");
        }
        const userIndex = db.users.findIndex(u => u.id === tokenData.userId);
        if (userIndex === -1) {
            throw new Error("User not found.");
        }
        db.users[userIndex].password = newPassword;
        saveDb();
        passwordResetTokens.delete(token);
        return { success: true };
    },
};

type OfflineAction = { id: number, type: string, payload: any, retries: number, error?: string };
let offlineQueue: OfflineAction[] = JSON.parse(localStorage.getItem('asagents_offline_queue') || '[]');
let failedSyncActions: OfflineAction[] = JSON.parse(localStorage.getItem('asagents_failed_sync_actions') || '[]');

const saveQueues = () => {
    localStorage.setItem('asagents_offline_queue', JSON.stringify(offlineQueue));
    localStorage.setItem('asagents_failed_sync_actions', JSON.stringify(failedSyncActions));
};

const addToOfflineQueue = (type: string, payload: any) => {
    offlineQueue.push({ id: Date.now(), type, payload, retries: 0 });
    saveQueues();
};

export const processOfflineQueue = async () => {
    if (offlineQueue.length === 0) return { successCount: 0, movedToFailedCount: 0 };
    
    let successCount = 0;
    let movedToFailedCount = 0;
    const processingQueue = [...offlineQueue];
    offlineQueue = [];
    
    for (const action of processingQueue) {
        try {
            await delay(100); 
            console.log(`Successfully synced action: ${action.type}`, action.payload);
            successCount++;
        } catch (error) {
            action.retries++;
            action.error = error instanceof Error ? error.message : "Unknown sync error";
            if (action.retries >= 3) {
                failedSyncActions.push(action);
                movedToFailedCount++;
            } else {
                offlineQueue.push(action);
            }
        }
    }
    saveQueues();
    return { successCount, movedToFailedCount };
};

export const getFailedSyncActions = () => [...failedSyncActions];
export const retryFailedAction = async (id: number) => {
    const actionIndex = failedSyncActions.findIndex(a => a.id === id);
    if (actionIndex > -1) {
        const [action] = failedSyncActions.splice(actionIndex, 1);
        action.retries = 0;
        offlineQueue.push(action);
        saveQueues();
        await processOfflineQueue();
    }
};
export const discardFailedAction = (id: number) => {
    failedSyncActions = failedSyncActions.filter(a => a.id !== id);
    saveQueues();
};
export interface FailedActionForUI { id: number; summary: string; error: string; timestamp: string; }
export const formatFailedActionForUI = (action: OfflineAction): FailedActionForUI => ({
    id: action.id,
    summary: `${action.type.replace(/_/g, ' ')}: ${JSON.stringify(action.payload).substring(0, 100)}...`,
    error: action.error || 'Unknown Error',
    timestamp: new Date(action.id).toLocaleString(),
});

export const api = {
    getCompanySettings: async (companyId: string): Promise<CompanySettings> => {
        await delay();
        return {
            theme: 'light',
            accessibility: { highContrast: false },
            timeZone: 'GMT',
            dateFormat: 'DD/MM/YYYY',
            currency: 'GBP',
            workingHours: { start: '08:00', end: '17:00', workDays: [1,2,3,4,5] },
            features: { projectManagement: true, timeTracking: true, financials: true, documents: true, safety: true, equipment: true, reporting: true },
        };
    },
    getTimesheetsByCompany: async (companyId: string, userId?: string, options?: RequestOptions): Promise<Timesheet[]> => {
        ensureNotAborted(options?.signal);
        await delay();
        ensureNotAborted(options?.signal);
        return db.timeEntries.map(te => ({...te, clockIn: new Date(te.clockIn!), clockOut: te.clockOut ? new Date(te.clockOut) : null })) as Timesheet[];
    },
    getSafetyIncidentsByCompany: async (companyId: string, options?: RequestOptions): Promise<SafetyIncident[]> => {
        ensureNotAborted(options?.signal);
        await delay();
        ensureNotAborted(options?.signal);
        return db.safetyIncidents.filter(incident => resolveCompanyIdFromProject(incident.projectId) === companyId) as SafetyIncident[];
    },
    getConversationsForUser: async (userId: string, options?: RequestOptions): Promise<Conversation[]> => {
        ensureNotAborted(options?.signal);
        await delay();
        ensureNotAborted(options?.signal);
        return db.conversations.filter(c => c.participantIds?.includes(userId)) as Conversation[];
    },
    getNotificationsForUser: async (userId: string, options?: RequestOptions): Promise<Notification[]> => {
        ensureNotAborted(options?.signal);
        await delay();
        ensureNotAborted(options?.signal);
        return db.notifications.filter(n => n.userId === userId).map(n => ({...n, timestamp: new Date(n.timestamp!)})) as Notification[];
    },
    markAllNotificationsAsRead: async (userId: string): Promise<void> => {
        await delay();
        db.notifications.forEach(n => {
            if (n.userId === userId) { n.isRead = true; n.read = true; }
        });
        saveDb();
    },
    markNotificationAsRead: async (notificationId: string): Promise<void> => {
        await delay();
        const notification = db.notifications.find(n => n.id === notificationId);
        if (!notification) {
            throw new Error('Notification not found');
        }
        notification.isRead = true;
        notification.read = true;
        saveDb();
    },
    getProjectsByManager: async (managerId: string, options?: RequestOptions): Promise<Project[]> => {
        ensureNotAborted(options?.signal);
        await delay();
        ensureNotAborted(options?.signal);
        return db.projects.filter(p => (p as any).managerId === managerId) as Project[];
    },
    getProjectById: async (projectId: string, options?: RequestOptions): Promise<Project | null> => {
        ensureNotAborted(options?.signal);
        await delay();
        ensureNotAborted(options?.signal);
        const project = db.projects.find(p => p.id === projectId);
        return project ? project as Project : null;
    },
    getUsersByCompany: async (companyId: string, options?: RequestOptions): Promise<User[]> => {
        ensureNotAborted(options?.signal);
        await delay();
        ensureNotAborted(options?.signal);
        return db.users.filter(u => u.companyId === companyId) as User[];
    },
    getEquipmentByCompany: async (companyId: string, options?: RequestOptions): Promise<Equipment[]> => {
        ensureNotAborted(options?.signal);
        await delay();
        ensureNotAborted(options?.signal);
        return db.equipment.filter(e => e.companyId === companyId) as Equipment[];
    },
    getResourceAssignments: async (companyId: string, options?: RequestOptions): Promise<ResourceAssignment[]> => {
        ensureNotAborted(options?.signal);
        await delay();
        ensureNotAborted(options?.signal);
        return db.resourceAssignments as ResourceAssignment[];
    },
    getAuditLogsByCompany: async (companyId: string, options?: RequestOptions): Promise<AuditLog[]> => {
        ensureNotAborted(options?.signal);
        await delay();
        ensureNotAborted(options?.signal);
        return db.auditLogs as AuditLog[];
    },
    getTodosByProjectIds: async (projectIds: string[], options?: RequestOptions): Promise<Todo[]> => {
        ensureNotAborted(options?.signal);
        await delay();
        ensureNotAborted(options?.signal);
        const idSet = new Set(projectIds);
        return db.todos.filter(t => idSet.has(t.projectId!)) as Todo[];
    },
    getDocumentsByProject: async (projectId: string, options?: RequestOptions): Promise<Document[]> => {
        ensureNotAborted(options?.signal);
        await delay();
        ensureNotAborted(options?.signal);
        return db.documents.filter(d => d.projectId === projectId) as Document[];
    },
    getUsersByProject: async (projectId: string, options?: RequestOptions): Promise<User[]> => {
        ensureNotAborted(options?.signal);
        await delay();
        ensureNotAborted(options?.signal);
        const assignments = db.projectAssignments.filter(pa => pa.projectId === projectId);
        const userIds = new Set(assignments.map(a => a.userId));
        return db.users.filter(u => userIds.has(u.id!)) as User[];
    },

    getProjectInsights: async (projectId: string, options?: RequestOptions): Promise<ProjectInsight[]> => {
        ensureNotAborted(options?.signal);
        await delay();
        ensureNotAborted(options?.signal);
        return db.projectInsights
            .filter(insight => insight.projectId === projectId)
            .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
            .map(insight => ({
                id: insight.id!,
                projectId: insight.projectId!,
                summary: insight.summary || '',
                type: (insight.type as ProjectInsight['type']) || 'CUSTOM',
                createdAt: insight.createdAt || new Date().toISOString(),
                createdBy: insight.createdBy || 'system',
                model: insight.model,
                metadata: insight.metadata,
            }));
    },
    createProjectInsight: async (data: { projectId: string; summary: string; type?: ProjectInsight['type']; metadata?: Record<string, unknown>; model?: string }, userId: string): Promise<ProjectInsight> => {
        await delay();
        if (!data.projectId) {
            throw new Error('projectId is required to create an insight.');
        }
        if (!data.summary.trim()) {
            throw new Error('summary is required to create an insight.');
        }

        const newInsight: ProjectInsight = {
            id: String(Date.now() + Math.random()),
            projectId: data.projectId,
            summary: data.summary,
            type: data.type || 'CUSTOM',
            createdAt: new Date().toISOString(),
            createdBy: userId,
            model: data.model,
            metadata: data.metadata,
        };

        db.projectInsights.push(newInsight);
        const project = db.projects.find(p => p.id === data.projectId);
        addAuditLog(userId, 'generated_project_insight', project ? { type: 'project', id: project.id!, name: project.name || '' } : undefined);
        saveDb();
        return newInsight;
    },
    getFinancialForecasts: async (companyId: string, options?: RequestOptions): Promise<FinancialForecast[]> => {
        ensureNotAborted(options?.signal);
        await delay();
        ensureNotAborted(options?.signal);
        return db.financialForecasts
            .filter(forecast => forecast.companyId === companyId)
            .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
            .map(forecast => ({
                id: forecast.id!,
                companyId: forecast.companyId!,
                summary: forecast.summary || '',
                horizonMonths: typeof forecast.horizonMonths === 'number'
                    ? forecast.horizonMonths
                    : Number((forecast.metadata as any)?.horizonMonths) || 3,
                createdAt: forecast.createdAt || new Date().toISOString(),
                createdBy: forecast.createdBy || 'system',
                model: forecast.model,
                metadata: forecast.metadata,
            }));
    },
    createFinancialForecast: async (data: { companyId: string; summary: string; horizonMonths: number; metadata?: Record<string, unknown>; model?: string }, userId: string): Promise<FinancialForecast> => {
        await delay();
        if (!data.companyId) {
            throw new Error('companyId is required to create a financial forecast.');
        }
        if (!data.summary.trim()) {
            throw new Error('summary is required to create a financial forecast.');
        }

        const newForecast: FinancialForecast = {
            id: String(Date.now() + Math.random()),
            companyId: data.companyId,
            summary: data.summary,
            horizonMonths: data.horizonMonths,
            createdAt: new Date().toISOString(),
            createdBy: userId,
            model: data.model,
            metadata: data.metadata,
        };

        db.financialForecasts.push(newForecast);
        const company = db.companies.find(c => c.id === data.companyId);
        addAuditLog(
            userId,
            'generated_financial_forecast',
            company ? { type: 'company', id: company.id!, name: company.name || '' } : undefined,
        );
        saveDb();
        return newForecast;
    },
    getExpensesByCompany: async (companyId: string, options?: RequestOptions): Promise<Expense[]> => {
        ensureNotAborted(options?.signal);
        await delay();
        ensureNotAborted(options?.signal);
        const projectIds = new Set(db.projects.filter(p => p.companyId === companyId).map(p => p.id));
        return db.expenses.filter(e => projectIds.has(e.projectId!)) as Expense[];
    },
    updateTodo: async (todoId: string, updates: Partial<Todo>, userId: string): Promise<Todo> => {
        await delay();
        const todoIndex = db.todos.findIndex(t => t.id === todoId);
        if (todoIndex === -1) throw new Error("Todo not found");
        db.todos[todoIndex] = { ...db.todos[todoIndex], ...updates, updatedAt: new Date().toISOString() };
        saveDb();
        return db.todos[todoIndex] as Todo;
    },
    getProjectsByUser: async (userId: string, options?: RequestOptions): Promise<Project[]> => {
        ensureNotAborted(options?.signal);
        await delay();
        ensureNotAborted(options?.signal);
        const assignments = db.projectAssignments.filter(pa => pa.userId === userId);
        const projectIds = new Set(assignments.map(a => a.projectId));
        return db.projects.filter(p => projectIds.has(p.id!)) as Project[];
    },
    updateEquipment: async (equipmentId: string, updates: Partial<Equipment>, userId: string): Promise<Equipment> => {
        await delay();
        const index = db.equipment.findIndex(e => e.id === equipmentId);
        if (index === -1) throw new Error("Equipment not found");
        db.equipment[index] = { ...db.equipment[index], ...updates };
        saveDb();
        return db.equipment[index] as Equipment;
    },
    createEquipment: async (data: Partial<Equipment>, userId: string): Promise<Equipment> => {
        await delay();
        const newEquipment: Partial<Equipment> = { ...data, id: String(Date.now()), companyId: db.users.find(u=>u.id===userId)?.companyId };
        db.equipment.push(newEquipment);
        saveDb();
        return newEquipment as Equipment;
    },
    createResourceAssignment: async (data: any, userId: string): Promise<ResourceAssignment> => {
        const newAssignment = { ...data, id: String(Date.now()) };
        db.resourceAssignments.push(newAssignment);
        saveDb();
        return newAssignment;
    },
    updateResourceAssignment: async (id: string, data: any, userId: string): Promise<ResourceAssignment> => {
        const index = db.resourceAssignments.findIndex(a => a.id === id);
        db.resourceAssignments[index] = { ...db.resourceAssignments[index], ...data };
        saveDb();
        return db.resourceAssignments[index] as ResourceAssignment;
    },
    deleteResourceAssignment: async (id: string, userId: string): Promise<void> => {
        db.resourceAssignments = db.resourceAssignments.filter(a => a.id !== id);
        saveDb();
    },
    uploadDocument: async (data: any, userId: string): Promise<Document> => {
        const newDoc = { ...data, id: String(Date.now()), uploadedBy: userId, version: 1, uploadedAt: new Date().toISOString() };
        db.documents.push(newDoc);
        saveDb();
        return newDoc as Document;
    },
    getDocumentsByCompany: async (companyId: string, options?: RequestOptions): Promise<Document[]> => {
        ensureNotAborted(options?.signal);
        return db.documents as Document[];
    },
    getProjectsByCompany: async (companyId: string, options?: RequestOptions): Promise<Project[]> => {
        ensureNotAborted(options?.signal);
        return db.projects.filter(p => p.companyId === companyId) as Project[];
    },
    getProjectPortfolioSummary: async (companyId: string, options?: ProjectSummaryOptions): Promise<ProjectPortfolioSummary> => {
        ensureNotAborted(options?.signal);
        await delay();
        ensureNotAborted(options?.signal);

        const scopedIds = options?.projectIds?.map(String);
        const idFilter = scopedIds && scopedIds.length > 0 ? new Set(scopedIds) : null;

        const scopedProjects = db.projects.filter(project => {
            if (project.companyId !== companyId) {
                return false;
            }
            if (idFilter) {
                return project.id != null && idFilter.has(String(project.id));
            }
            return true;
        });

        return computeProjectPortfolioSummary(scopedProjects);
    },
    findGrants: async (keywords: string, location: string): Promise<Grant[]> => {
        await delay(1000);
        return [{ id: 'g1', name: 'Green Retrofit Grant', agency: 'Gov UK', amount: '£50,000', description: 'For sustainable energy retrofits.', url: '#' }];
    },
    analyzeForRisks: async (text: string): Promise<RiskAnalysis> => {
        await delay(1000);
        return { summary: 'Low risk detected.', identifiedRisks: [{ severity: 'Low', description: 'Ambiguous payment terms.', recommendation: 'Clarify payment schedule before signing.' }]};
    },
    generateBidPackage: async (url: string, strengths: string, userId: string): Promise<BidPackage> => {
        await delay(1500);
        return { summary: 'Executive summary...', coverLetter: 'Dear Sir/Madam...', checklist: ['Form A', 'Form B'] };
    },
    generateSafetyAnalysis: async (incidents: SafetyIncident[], projectId: string, userId: string): Promise<{ report: string }> => {
        await delay(1500);
        return { report: `Analysis for project #${projectId}:\n- Common issue: Slips on wet surfaces (${incidents.length} incidents).\n- Recommendation: Increase signage and regular clean-up patrols.` };
    },
    getCompanies: async (options?: RequestOptions): Promise<Company[]> => {
        ensureNotAborted(options?.signal);
        return db.companies as Company[];
    },
    getPlatformUsageMetrics: async (options?: RequestOptions): Promise<UsageMetric[]> => {
        ensureNotAborted(options?.signal);
        return [
            { name: 'Active Users (24h)', value: db.users.length - 2, unit: 'users' },
            { name: 'API Calls (24h)', value: 12543, unit: 'calls' },
        ];
    },
    updateTimesheetEntry: async (id: string, data: any, userId: string): Promise<Timesheet> => {
        const index = db.timeEntries.findIndex(t => t.id === id);
        db.timeEntries[index] = { ...db.timeEntries[index], ...data };
        saveDb();
        return db.timeEntries[index] as Timesheet;
    },
    submitTimesheet: async (data: any, userId: string): Promise<Timesheet> => {
        const newTimesheet = { ...data, id: String(Date.now()), status: TimesheetStatus.PENDING };
        db.timeEntries.push(newTimesheet);
        saveDb();
        return newTimesheet as Timesheet;
    },
    updateTimesheetStatus: async (id: string, status: TimesheetStatus, userId: string, reason?: string): Promise<Timesheet> => {
        const index = db.timeEntries.findIndex(t => t.id === id);
        db.timeEntries[index]!.status = status;
        if (reason) (db.timeEntries[index] as any).rejectionReason = reason;
        saveDb();
        return db.timeEntries[index] as Timesheet;
    },
    generateDailySummary: async (projectId: string, date: Date, userId: string): Promise<string> => {
        await delay(1000);
        return `Summary for ${date.toDateString()}:\n- Task A completed.\n- Task B in progress.`;
    },
    getFinancialKPIsForCompany: async (companyId: string, options?: RequestOptions): Promise<FinancialKPIs> => {
        ensureNotAborted(options?.signal);
        await delay();
        ensureNotAborted(options?.signal);

        const currency = getCompanyCurrency(companyId);

        const invoices = db.invoices.filter(invoice => resolveCompanyIdForInvoice(invoice) === companyId);
        const invoiceTotals = invoices.reduce(
            (acc, invoice) => {
                const total = safeNumber((invoice as Invoice).total ?? (invoice as any).amount ?? 0);
                const amountPaid = safeNumber((invoice as Invoice).amountPaid ?? 0);
                const explicitBalance = (invoice as Invoice).balance;
                const balance = explicitBalance != null ? safeNumber(explicitBalance) : Math.max(total - amountPaid, 0);

                acc.pipeline += total;
                acc.collected += amountPaid > 0 ? Math.min(total, amountPaid) : total - balance;
                acc.outstanding += balance;
                return acc;
            },
            { pipeline: 0, collected: 0, outstanding: 0 },
        );

        const approvedExpenseStatuses = new Set<ExpenseStatus>([ExpenseStatus.APPROVED, ExpenseStatus.PAID]);
        const expenses = db.expenses.filter(expense => {
            if (resolveCompanyIdForExpense(expense) !== companyId) {
                return false;
            }
            if (!expense.status) {
                return false;
            }
            const status = String(expense.status) as ExpenseStatus;
            return approvedExpenseStatuses.has(status);
        });

        const expenseTotal = expenses.reduce((sum, expense) => sum + safeNumber(expense.amount), 0);

        const profitabilityRaw = invoiceTotals.collected > 0
            ? ((invoiceTotals.collected - expenseTotal) / invoiceTotals.collected) * 100
            : 0;
        const profitability = Math.round(Math.max(-100, Math.min(100, profitabilityRaw)) * 10) / 10;

        const companyProjects = db.projects.filter(project => project.companyId === companyId);
        const marginValues = companyProjects
            .map(project => {
                const budget = safeNumber(project.budget);
                if (budget <= 0) {
                    return null;
                }
                const actual = safeNumber(project.actualCost ?? (project as any).spent ?? 0);
                const margin = ((budget - actual) / budget) * 100;
                return Math.max(-100, Math.min(100, margin));
            })
            .filter((value): value is number => value !== null);

        const projectMargin = marginValues.length
            ? Math.round((marginValues.reduce((sum, value) => sum + value, 0) / marginValues.length) * 10) / 10
            : 0;

        const cashFlow = Math.round((invoiceTotals.collected - expenseTotal) * 100) / 100;

        return {
            profitability,
            projectMargin,
            cashFlow,
            currency,
        };
    },
    getMonthlyFinancials: async (companyId: string, options?: RequestOptions): Promise<MonthlyFinancials[]> => {
        ensureNotAborted(options?.signal);
        await delay();
        ensureNotAborted(options?.signal);

        const monthlyMap = new Map<string, { label: string; date: Date; revenue: number; expense: number }>();

        const registerMonth = (date: Date) => {
            const key = getMonthKey(date);
            if (!monthlyMap.has(key)) {
                const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
                monthlyMap.set(key, {
                    label: getMonthLabel(date),
                    date: monthStart,
                    revenue: 0,
                    expense: 0,
                });
            }
            return monthlyMap.get(key)!;
        };

        for (const invoice of db.invoices) {
            if (resolveCompanyIdForInvoice(invoice) !== companyId) {
                continue;
            }
            const issuedDate = parseDate((invoice as Invoice).issueDate ?? (invoice as any).issuedAt ?? (invoice as any).createdAt);
            if (!issuedDate) {
                continue;
            }
            const monthBucket = registerMonth(issuedDate);
            monthBucket.revenue += safeNumber((invoice as Invoice).total ?? (invoice as any).amount ?? 0);
        }

        const approvedExpenseStatuses = new Set<ExpenseStatus>([ExpenseStatus.APPROVED, ExpenseStatus.PAID]);
        for (const expense of db.expenses) {
            if (resolveCompanyIdForExpense(expense) !== companyId) {
                continue;
            }
            if (!expense.status || !approvedExpenseStatuses.has(String(expense.status) as ExpenseStatus)) {
                continue;
            }
            const expenseDate = parseDate(expense.date ?? (expense as any).createdAt ?? (expense as any).submittedAt);
            if (!expenseDate) {
                continue;
            }
            const monthBucket = registerMonth(expenseDate);
            monthBucket.expense += safeNumber(expense.amount);
        }

        return Array.from(monthlyMap.values())
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .map(entry => ({
                month: entry.label,
                revenue: Math.round(entry.revenue * 100) / 100,
                profit: Math.round((entry.revenue - entry.expense) * 100) / 100,
            }));
    },
    getCostBreakdown: async (companyId: string, options?: RequestOptions): Promise<CostBreakdown[]> => {
        ensureNotAborted(options?.signal);
        await delay();
        ensureNotAborted(options?.signal);

        const approvedExpenseStatuses = new Set<ExpenseStatus>([ExpenseStatus.APPROVED, ExpenseStatus.PAID]);
        const totals = new Map<string, number>();

        for (const expense of db.expenses) {
            if (resolveCompanyIdForExpense(expense) !== companyId) {
                continue;
            }
            if (!expense.status || !approvedExpenseStatuses.has(String(expense.status) as ExpenseStatus)) {
                continue;
            }
            const category = (expense.category ?? 'Uncategorised').toString();
            const amount = safeNumber(expense.amount);
            if (amount <= 0) {
                continue;
            }
            totals.set(category, (totals.get(category) ?? 0) + amount);
        }

        return Array.from(totals.entries())
            .map(([category, amount]) => ({ category, amount: Math.round(amount * 100) / 100 }))
            .sort((a, b) => b.amount - a.amount);
    },
    getOperationalInsights: async (companyId: string, options?: RequestOptions): Promise<OperationalInsights> => {
        ensureNotAborted(options?.signal);
        await delay();
        ensureNotAborted(options?.signal);

        const now = new Date();
        const isoNow = now.toISOString();
        const nowTime = now.getTime();

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);

        const weekStart = new Date(now);
        weekStart.setHours(0, 0, 0, 0);
        const weekday = weekStart.getDay();
        const isoWeekday = weekday === 0 ? 6 : weekday - 1;
        weekStart.setDate(weekStart.getDate() - isoWeekday);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);

        const companyCurrency = getCompanyCurrency(companyId);

        const projects = db.projects.filter(project => project.companyId === companyId);
        const projectIds = new Set<string>();
        for (const project of projects) {
            if (project.id != null) {
                projectIds.add(String(project.id));
            }
        }

        const companyUsers = db.users.filter(user => user.companyId === companyId);
        const userIds = new Set<string>();
        for (const user of companyUsers) {
            if (user.id != null) {
                userIds.add(String(user.id));
            }
        }

        const relevantTodos = db.todos.filter(todo => {
            const projectId = (todo as Todo).projectId ?? (todo as any).projectId;
            if (projectId != null && projectIds.has(String(projectId))) {
                return true;
            }
            const assignee = (todo as Todo).assignedTo ?? (todo as any).assigneeId;
            return assignee != null && userIds.has(String(assignee));
        });

        const relevantTimesheets = db.timeEntries.filter(entry => {
            const projectCompany = resolveCompanyIdFromProject(entry.projectId);
            if (projectCompany === companyId) {
                return true;
            }
            const userCompany = resolveCompanyIdFromUser(entry.userId);
            return userCompany === companyId;
        });

        const safetyIncidents = db.safetyIncidents.filter(
            incident => resolveCompanyIdFromProject(incident.projectId) === companyId,
        );
        const invoices = db.invoices.filter(invoice => resolveCompanyIdForInvoice(invoice) === companyId);
        const expenses = db.expenses.filter(expense => resolveCompanyIdForExpense(expense) === companyId);

        const normaliseTodoStatus = (value: unknown): TodoStatus | null => {
            if (!value) {
                return null;
            }
            const status = String(value).toUpperCase();
            return Object.values(TodoStatus).includes(status as TodoStatus) ? (status as TodoStatus) : null;
        };

        const normaliseTimesheetStatus = (value: unknown): TimesheetStatus | null => {
            if (!value) {
                return null;
            }
            const status = String(value).toUpperCase();
            return Object.values(TimesheetStatus).includes(status as TimesheetStatus)
                ? (status as TimesheetStatus)
                : null;
        };

        const isApprovedExpense = (value: unknown): boolean => {
            if (!value) {
                return false;
            }
            const status = String(value).toUpperCase();
            return status === ExpenseStatus.APPROVED || status === ExpenseStatus.PAID;
        };

        const getTimesheetHours = (entry: Partial<Timesheet>): number => {
            const start = parseDate(entry.startTime ?? (entry as any).clockIn);
            const end = parseDate(entry.endTime ?? (entry as any).clockOut);
            if (start && end) {
                return Math.max(0, (end.getTime() - start.getTime()) / MILLISECONDS_PER_HOUR);
            }
            const recorded = safeNumber((entry as any).duration ?? entry.duration);
            if (recorded <= 0) {
                return 0;
            }
            if (recorded > 48) {
                return recorded / 60;
            }
            return recorded;
        };

        const submittedTimesheets = relevantTimesheets.filter(entry => {
            const status = normaliseTimesheetStatus(entry.status);
            return status !== null && status !== TimesheetStatus.DRAFT;
        });

        const approvedTimesheets = submittedTimesheets.filter(
            entry => normaliseTimesheetStatus(entry.status) === TimesheetStatus.APPROVED,
        );

        const pendingApprovals = submittedTimesheets.filter(
            entry => normaliseTimesheetStatus(entry.status) === TimesheetStatus.PENDING,
        ).length;

        const activeTimesheets = relevantTimesheets.filter(entry => {
            const status = normaliseTimesheetStatus(entry.status);
            if (status !== TimesheetStatus.PENDING) {
                return false;
            }
            const hasEnded = entry.endTime != null || (entry as any).clockOut != null;
            return !hasEnded;
        }).length;

        const complianceRate = submittedTimesheets.length
            ? (approvedTimesheets.length / submittedTimesheets.length) * 100
            : 0;

        const hoursLogged = submittedTimesheets
            .map(entry => getTimesheetHours(entry))
            .filter(hours => hours > 0);
        const totalHoursLogged = hoursLogged.reduce((sum, hours) => sum + hours, 0);
        const averageHours = hoursLogged.length ? totalHoursLogged / hoursLogged.length : 0;
        const overtimeHours = hoursLogged.reduce((sum, hours) => sum + Math.max(0, hours - 8), 0);

        const approvedThisWeek = approvedTimesheets.filter(entry => {
            const completionDate = parseDate(
                entry.updatedAt ?? entry.endTime ?? (entry as any).clockOut ?? (entry as any).approvedAt,
            );
            if (!completionDate) {
                return false;
            }
            return completionDate >= weekStart && completionDate < weekEnd;
        }).length;

        const tasksWithDueDates = relevantTodos.filter(todo => parseDate((todo as Todo).dueDate ?? (todo as any).due_at));

        const tasksDueSoon = tasksWithDueDates.filter(todo => {
            const due = parseDate((todo as Todo).dueDate ?? (todo as any).due_at);
            if (!due) {
                return false;
            }
            const time = due.getTime();
            return time >= nowTime && time <= nowTime + 7 * MILLISECONDS_PER_DAY;
        }).length;

        const overdueTasks = tasksWithDueDates.filter(todo => {
            const due = parseDate((todo as Todo).dueDate ?? (todo as any).due_at);
            if (!due) {
                return false;
            }
            const status = normaliseTodoStatus((todo as Todo).status ?? (todo as any).status);
            return due.getTime() < nowTime && status !== TodoStatus.DONE;
        }).length;

        const tasksInProgress = relevantTodos.filter(
            todo => normaliseTodoStatus((todo as Todo).status ?? (todo as any).status) === TodoStatus.IN_PROGRESS,
        ).length;

        const openIncidents = safetyIncidents.filter(incident => {
            const status = incident.status ? String(incident.status).toUpperCase() : null;
            return status !== IncidentStatus.RESOLVED;
        });

        const highSeverity = openIncidents.filter(incident => {
            const severity = incident.severity ? String(incident.severity).toUpperCase() : null;
            return severity === IncidentSeverity.HIGH || severity === IncidentSeverity.CRITICAL;
        }).length;

        const lastIncidentDate = safetyIncidents.reduce<Date | null>((latest, incident) => {
            const date = parseDate(incident.incidentDate ?? incident.timestamp ?? incident.createdAt);
            if (!date) {
                return latest;
            }
            if (!latest || date.getTime() > latest.getTime()) {
                return date;
            }
            return latest;
        }, null);

        const daysSinceLastIncident = lastIncidentDate
            ? Math.max(0, Math.floor((nowTime - lastIncidentDate.getTime()) / MILLISECONDS_PER_DAY))
            : null;

        const portfolioSummary = computeProjectPortfolioSummary(projects);
        const activeProjects = portfolioSummary.activeProjects > 0
            ? portfolioSummary.activeProjects
            : projects.filter(project => String(project.status).toUpperCase() === 'ACTIVE').length;

        const atRiskActiveProjects = projects.reduce((count, project) => {
            const status = project.status ? String(project.status).toUpperCase() : null;
            if (status === 'COMPLETED' || status === 'CANCELLED') {
                return count;
            }
            const budget = safeNumber(project.budget);
            if (budget <= 0) {
                return count;
            }
            const actual = safeNumber(project.actualCost ?? (project as any).spent ?? 0);
            return actual > budget * 1.05 ? count + 1 : count;
        }, 0);

        const approvedExpensesThisMonth = expenses.reduce((sum, expense) => {
            if (!isApprovedExpense(expense.status)) {
                return sum;
            }
            const expenseDate = parseDate(expense.date ?? (expense as any).submittedAt ?? (expense as any).createdAt);
            if (!expenseDate || expenseDate < startOfMonth) {
                return sum;
            }
            return sum + safeNumber(expense.amount);
        }, 0);

        const burnRatePerActiveProject = activeProjects > 0
            ? approvedExpensesThisMonth / activeProjects
            : approvedExpensesThisMonth;

        const outstandingReceivables = invoices.reduce((sum, invoice) => {
            const financials = getInvoiceFinancials(invoice as Invoice);
            return sum + financials.balance;
        }, 0);

        const alerts: OperationalAlert[] = [];
        const formatCurrencyForAlert = (value: number) =>
            new Intl.NumberFormat('en-GB', {
                style: 'currency',
                currency: companyCurrency,
                maximumFractionDigits: 0,
            }).format(Math.round(value));

        if (submittedTimesheets.length > 0 && complianceRate < 85) {
            alerts.push({
                id: 'low-timesheet-compliance',
                severity: complianceRate < 60 ? 'critical' : 'warning',
                message: `Timesheet approvals are at ${Math.round(complianceRate)}%. Clear pending entries to restore compliance.`,
            });
        }

        if (highSeverity > 0) {
            alerts.push({
                id: 'high-severity-incidents',
                severity: 'critical',
                message: `${highSeverity} high-severity incident${highSeverity === 1 ? ' requires' : 's require'} immediate action.`,
            });
        }

        if (overdueTasks > 0) {
            alerts.push({
                id: 'overdue-field-tasks',
                severity: 'warning',
                message: `${overdueTasks} task${overdueTasks === 1 ? ' is' : 's are'} past due. Rebalance crew priorities.`,
            });
        }

        if (outstandingReceivables > 0) {
            alerts.push({
                id: 'outstanding-receivables',
                severity: outstandingReceivables > 100000 ? 'warning' : 'info',
                message: `${formatCurrencyForAlert(outstandingReceivables)} outstanding in receivables.`,
            });
        }

        return {
            updatedAt: isoNow,
            safety: {
                openIncidents: openIncidents.length,
                highSeverity,
                daysSinceLastIncident,
            },
            workforce: {
                complianceRate: Math.round(complianceRate * 10) / 10,
                approvedThisWeek,
                overtimeHours: Math.round(overtimeHours * 10) / 10,
                averageHours: Math.round(averageHours * 10) / 10,
                activeTimesheets,
                pendingApprovals,
            },
            schedule: {
                atRiskProjects: atRiskActiveProjects,
                overdueProjects: portfolioSummary.overdueProjects,
                tasksDueSoon,
                overdueTasks,
                tasksInProgress,
                averageProgress: Math.round(portfolioSummary.averageProgress * 10) / 10,
            },
            financial: {
                currency: companyCurrency,
                approvedExpensesThisMonth: Math.round(approvedExpensesThisMonth * 100) / 100,
                burnRatePerActiveProject: Math.round(burnRatePerActiveProject * 100) / 100,
                outstandingReceivables: Math.round(outstandingReceivables * 100) / 100,
            },
            alerts,
        };
    },
    getInvoicesByCompany: async (companyId: string, options?: RequestOptions): Promise<Invoice[]> => {
        ensureNotAborted(options?.signal);
        return db.invoices as Invoice[];
    },
    getQuotesByCompany: async (companyId: string, options?: RequestOptions): Promise<Quote[]> => {
        ensureNotAborted(options?.signal);
        return db.quotes as Quote[];
    },
    getClientsByCompany: async (companyId: string, options?: RequestOptions): Promise<Client[]> => {
        ensureNotAborted(options?.signal);
        return db.clients
            .filter(client => client.companyId === companyId)
            .map(client => ({
                ...client,
                isActive: client.isActive ?? true,
            })) as Client[];
    },
    updateClient: async (id:string, data:any, userId:string): Promise<Client> => {
        const index = db.clients.findIndex(c=>c.id === id);
        if (index === -1) {
            throw new Error('Client not found');
        }
        db.clients[index] = {
            ...db.clients[index],
            ...data,
            updatedAt: new Date().toISOString(),
        };
        saveDb();
        return db.clients[index] as Client;
    },
    createClient: async (data:any, userId:string): Promise<Client> => {
        const timestamp = new Date().toISOString();
        const companyId = db.users.find(u=>u.id===userId)!.companyId;
        const newClient = {
            isActive: true,
            createdAt: timestamp,
            updatedAt: timestamp,
            contactPerson: data.contactPerson || '',
            contactEmail: data.contactEmail,
            contactPhone: data.contactPhone || data.phone,
            paymentTerms: data.paymentTerms || 'Net 30',
            billingAddress: data.billingAddress || '',
            address: data.address || { street: '', city: '', state: '', zipCode: '', country: '' },
            ...data,
            id: String(Date.now()),
            companyId,
        };
        db.clients.push(newClient);
        saveDb();
        return newClient as Client;
    },
    updateInvoice: async (id: string, data: any, userId: string): Promise<Invoice> => {
        await delay();
        const index = db.invoices.findIndex(i => i.id === id);
        if (index === -1) throw new Error("Invoice not found");

        const existingInvoice = db.invoices[index]!;
        const companyId = existingInvoice.companyId ?? db.users.find(u => u.id === userId)?.companyId;
        const updatedInvoiceNumber = (data.invoiceNumber ?? existingInvoice.invoiceNumber) as string | undefined;

        if (!updatedInvoiceNumber) {
            throw new Error("Invoice number is required.");
        }

        const hasDuplicateNumber = db.invoices.some((invoice, invoiceIndex) => {
            if (invoiceIndex === index) return false;
            if (!invoice.invoiceNumber) return false;
            return invoice.invoiceNumber === updatedInvoiceNumber;
        });

        if (hasDuplicateNumber) {
            throw new Error("Invoice number already exists.");
        }

        const oldStatus = existingInvoice?.status;
        db.invoices[index] = {
            ...existingInvoice,
            ...data,
            companyId: existingInvoice.companyId ?? companyId,
            invoiceNumber: updatedInvoiceNumber,
        };

        if (oldStatus !== data.status) {
            addAuditLog(userId, `UPDATE_INVOICE_STATUS: ${oldStatus} -> ${data.status}`, { type: 'Invoice', id: id, name: updatedInvoiceNumber });
        } else {
            addAuditLog(userId, 'UPDATE_INVOICE', { type: 'Invoice', id: id, name: updatedInvoiceNumber });
        }
        saveDb();
        return db.invoices[index] as Invoice;
    },
    createInvoice: async (data: any, userId: string): Promise<Invoice> => {
        await delay();
        const companyId = db.users.find(u => u.id === userId)?.companyId;
        if (!companyId) {
            throw new Error("Unable to determine company for invoice creation.");
        }

        const companyInvoices = db.invoices.filter(inv => {
            if (!inv.companyId) return true;
            return inv.companyId === companyId;
        });

        const extractNumber = (invoiceNumber?: string): number => {
            if (!invoiceNumber) return 0;
            const match = invoiceNumber.match(/(\d+)$/);
            return match ? parseInt(match[1], 10) : 0;
        };

        const existingNumbers = new Set(
            companyInvoices
                .map(inv => inv.invoiceNumber)
                .filter((value): value is string => Boolean(value))
        );

        let counter = companyInvoices.reduce((max, inv) => {
            const numeric = extractNumber(inv.invoiceNumber as string | undefined);
            return Math.max(max, numeric);
        }, 0);

        let invoiceNumber: string;
        do {
            counter += 1;
            invoiceNumber = `INV-${String(counter).padStart(3, '0')}`;
        } while (existingNumbers.has(invoiceNumber));

        if (!invoiceNumber) {
            throw new Error("Failed to generate invoice number.");
        }

        const newInvoice = {
            ...data,
            id: String(Date.now()),
            companyId,
            invoiceNumber,
        };

        db.invoices.push(newInvoice);
        addAuditLog(userId, 'CREATE_INVOICE', { type: 'Invoice', id: newInvoice.id, name: newInvoice.invoiceNumber });
        saveDb();
        return newInvoice as Invoice;
    },
    recordPaymentForInvoice: async (id: string, data: any, userId: string): Promise<Invoice> => {
        await delay();
        const index = db.invoices.findIndex(i => i.id === id);
        if (index === -1) throw new Error("Invoice not found");
        const inv = db.invoices[index]!;
        if (!inv.payments) inv.payments = [];
        const newPayment = { ...data, id: String(Date.now()), createdBy: userId, date: new Date().toISOString(), invoiceId: id };
        inv.payments.push(newPayment);
        inv.amountPaid = (inv.amountPaid || 0) + data.amount;
        const balance = (inv.total || 0) - (inv.amountPaid || 0);
        inv.balance = balance;

        if (balance <= 0 && inv.status !== InvoiceStatus.CANCELLED) {
            inv.status = InvoiceStatus.PAID;
            addAuditLog(userId, `RECORD_PAYMENT (amount: ${data.amount})`, { type: 'Invoice', id: id, name: inv.invoiceNumber });
            addAuditLog(userId, `UPDATE_INVOICE_STATUS: ${InvoiceStatus.SENT} -> ${InvoiceStatus.PAID}`, { type: 'Invoice', id: id, name: inv.invoiceNumber });
        } else {
            addAuditLog(userId, `RECORD_PAYMENT (amount: ${data.amount})`, { type: 'Invoice', id: id, name: inv.invoiceNumber });
        }
        saveDb();
        return inv as Invoice;
    },
    submitExpense: async (data:any, userId:string): Promise<Expense> => {
        const newExpense = {...data, id: String(Date.now()), userId, status: ExpenseStatus.PENDING, submittedAt: new Date().toISOString()};
        db.expenses.push(newExpense);
        saveDb();
        return newExpense as Expense;
    },
    updateExpense: async (id:string, data:any, userId:string): Promise<Expense> => {
        const index = db.expenses.findIndex(e=>e.id === id);
        db.expenses[index] = {...db.expenses[index], ...data, status: ExpenseStatus.PENDING};
        saveDb();
        return db.expenses[index] as Expense;
    },
    clockIn: async (projectId: string, userId: string): Promise<Timesheet> => {
        const newEntry = { id: String(Date.now()), userId, projectId, clockIn: new Date(), clockOut: null, status: TimesheetStatus.DRAFT };
        db.timeEntries.push(newEntry);
        saveDb();
        return newEntry as Timesheet;
    },
    clockOut: async (userId: string): Promise<Timesheet> => {
        const entry = db.timeEntries.find(t => t.userId === userId && t.clockOut === null);
        if(!entry) throw new Error("Not clocked in");
        entry.clockOut = new Date();
        entry.status = TimesheetStatus.PENDING;
        saveDb();
        return entry as Timesheet;
    },
    getTimesheetsByUser: async (userId: string, options?: RequestOptions): Promise<Timesheet[]> => {
        ensureNotAborted(options?.signal);
        return db.timeEntries.filter(t => t.userId === userId).map(te => ({...te, clockIn: new Date(te.clockIn!), clockOut: te.clockOut ? new Date(te.clockOut) : null })) as Timesheet[];
    },
    createSafetyIncident: async (data: any, userId: string): Promise<SafetyIncident> => {
        const newIncident = { ...data, id: String(Date.now()), reportedById: userId, timestamp: new Date().toISOString(), status: IncidentStatus.REPORTED };
        db.safetyIncidents.push(newIncident);
        saveDb();
        return newIncident as SafetyIncident;
    },
    updateSafetyIncidentStatus: async (id: string, status: IncidentStatus, userId: string): Promise<SafetyIncident> => {
        const index = db.safetyIncidents.findIndex(i => i.id === id);
        db.safetyIncidents[index]!.status = status;
        saveDb();
        return db.safetyIncidents[index] as SafetyIncident;
    },
    createProject: async (data: any, templateId: number | null, userId: string): Promise<Project> => {
        const companyId = db.users.find(u=>u.id===userId)?.companyId;
        const newProject = { ...data, id: String(Date.now()), companyId, status: 'PLANNING', actualCost: 0 };
        db.projects.push(newProject);
        db.projectAssignments.push({ userId, projectId: newProject.id });
        saveDb();
        return newProject as Project;
    },
    updateProject: async (id: string, data: any, userId: string): Promise<Project> => {
        const index = db.projects.findIndex(p => p.id === id);
        db.projects[index] = { ...db.projects[index], ...data };
        saveDb();
        return db.projects[index] as Project;
    },
    getProjectTemplates: async (companyId: string, options?: RequestOptions): Promise<ProjectTemplate[]> => {
        ensureNotAborted(options?.signal);
        return db.projectTemplates as ProjectTemplate[];
    },
    createProjectTemplate: async (data: any, userId: string): Promise<ProjectTemplate> => {
        const newTemplate = { ...data, id: String(Date.now()) };
        db.projectTemplates.push(newTemplate);
        saveDb();
        return newTemplate as ProjectTemplate;
    },
    getProjectAssignmentsByCompany: async (companyId: string, options?: RequestOptions): Promise<ProjectAssignment[]> => {
        ensureNotAborted(options?.signal);
        return db.projectAssignments as ProjectAssignment[];
    },
    getUserPerformanceMetrics: async (userId: string): Promise<{totalHours: number, tasksCompleted: number}> => {
        return { totalHours: 120, tasksCompleted: 15 };
    },
    createUser: async (data: any, userId: string): Promise<User> => {
        const newUser = { ...data, id: String(Date.now()), companyId: db.users.find(u=>u.id===userId)?.companyId };
        db.users.push(newUser);
        saveDb();
        return newUser as User;
    },
    updateUser: async (id: string, data: Partial<User>, projectIds: (string|number)[] | undefined, userId: string): Promise<User> => {
        const index = db.users.findIndex(u=>u.id === id);
        if (index === -1) throw new Error("User not found");
        
        // Merge existing user data with updates
        db.users[index] = { ...db.users[index], ...data };
        
        // Only update project assignments if the projectIds array is explicitly passed
        // This allows for profile-only updates by omitting the projectIds argument
        if (projectIds !== undefined) {
            db.projectAssignments = db.projectAssignments.filter(pa => pa.userId !== id);
            projectIds.forEach(pid => db.projectAssignments.push({userId: id, projectId: String(pid)}));
        }
        
        saveDb();
        return db.users[index] as User;
    },
    prioritizeTasks: async (tasks: Todo[], projects: Project[], userId: string): Promise<{prioritizedTaskIds: string[]}> => {
        await delay(1000);
        return { prioritizedTaskIds: tasks.sort((a,b) => (b.priority === TodoPriority.HIGH ? 1 : -1) - (a.priority === TodoPriority.HIGH ? 1 : -1)).map(t=>t.id) };
    },
    getMessagesForConversation: async (conversationId: string, userId: string, options?: RequestOptions): Promise<Message[]> => {
        ensureNotAborted(options?.signal);
        return db.messages.filter(m => m.conversationId === conversationId).map(m=>({...m, timestamp: new Date(m.timestamp!)})) as Message[];
    },
    sendMessage: async (senderId: string, recipientId: string, content: string, conversationId?: string): Promise<{conversation: Conversation, message: Message}> => {
        let convo = conversationId ? db.conversations.find(c => c.id === conversationId) : db.conversations.find(c => c.participantIds?.includes(senderId) && c.participantIds?.includes(recipientId));
        if(!convo) {
            convo = { id: String(Date.now()), participantIds: [senderId, recipientId], lastMessage: null };
            db.conversations.push(convo);
        }
        const newMessage = { id: String(Date.now()), conversationId: convo.id, senderId, content, timestamp: new Date(), isRead: false };
        db.messages.push(newMessage);
        convo.lastMessage = newMessage as Message;
        saveDb();
        return { conversation: convo as Conversation, message: newMessage as Message };
    },
    getWhiteboardNotesByProject: async (projectId: string, options?: RequestOptions): Promise<WhiteboardNote[]> => {
        ensureNotAborted(options?.signal);
        return db.whiteboardNotes.filter(n => n.projectId === projectId) as WhiteboardNote[];
    },
    createWhiteboardNote: async (data: any, userId: string): Promise<WhiteboardNote> => {
        const newNote = { ...data, id: String(Date.now()) };
        db.whiteboardNotes.push(newNote);
        saveDb();
        return newNote as WhiteboardNote;
    },
    updateWhiteboardNote: async (id: string, data: any, userId: string): Promise<WhiteboardNote> => {
        const index = db.whiteboardNotes.findIndex(n => n.id === id);
        db.whiteboardNotes[index] = { ...db.whiteboardNotes[index], ...data };
        saveDb();
        return db.whiteboardNotes[index] as WhiteboardNote;
    },
    deleteWhiteboardNote: async (id: string, userId: string): Promise<void> => {
        db.whiteboardNotes = db.whiteboardNotes.filter(n => n.id !== id);
        saveDb();
    },
    createTodo: async (data: Partial<Todo>, userId: string): Promise<Todo> => {
        const newTodo = { ...data, id: String(Date.now()), status: TodoStatus.TODO, createdAt: new Date().toISOString() };
        db.todos.push(newTodo);
        saveDb();
        return newTodo as Todo;
    },
    bulkUpdateTodos: async (ids: (string|number)[], updates: Partial<Todo>, userId: string): Promise<void> => {
        const idSet = new Set(ids.map(String));
        db.todos.forEach(t => {
            if (idSet.has(t.id!)) {
                Object.assign(t, updates);
            }
        });
        saveDb();
    },
    getSiteUpdatesByProject: async (projectId: string, options?: RequestOptions): Promise<SiteUpdate[]> => {
        ensureNotAborted(options?.signal);
        return db.siteUpdates.filter(s => s.projectId === projectId) as SiteUpdate[];
    },
    getProjectMessages: async (projectId: string, options?: RequestOptions): Promise<ProjectMessage[]> => {
        ensureNotAborted(options?.signal);
        return db.projectMessages.filter(p => p.projectId === projectId) as ProjectMessage[];
    },
    getWeatherForLocation: async (lat: number, lng: number, options?: RequestOptions): Promise<Weather> => {
        ensureNotAborted(options?.signal);
        return { temperature: 18, condition: 'Sunny', windSpeed: 10, icon: '☀️' };
    },
    createSiteUpdate: async (data: any, userId: string): Promise<SiteUpdate> => {
        const newUpdate = { ...data, id: String(Date.now()), userId, timestamp: new Date().toISOString() };
        db.siteUpdates.push(newUpdate);
        saveDb();
        return newUpdate as SiteUpdate;
    },
    sendProjectMessage: async (data: any, userId: string): Promise<ProjectMessage> => {
        const newMessage = { ...data, id: String(Date.now()), senderId: userId, timestamp: new Date().toISOString() };
        db.projectMessages.push(newMessage);
        saveDb();
        return newMessage as ProjectMessage;
    }
};
