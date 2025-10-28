// A mock API using localStorage to simulate a backend.
// Supports offline queuing for write operations.

import { initialData } from './mockData';
import {
    User,
    Company,
    Project,
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
} from '../types';

const delay = (ms = 50) => new Promise(res => setTimeout(res, ms));

type RequestOptions = { signal?: AbortSignal };

const ensureNotAborted = (signal?: AbortSignal) => {
    if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError');
    }
};

const JWT_SECRET = 'your-super-secret-key-for-mock-jwt';
const MOCK_ACCESS_TOKEN_LIFESPAN = 15 * 60 * 1000; // 15 minutes
const MOCK_REFRESH_TOKEN_LIFESPAN = 7 * 24 * 60 * 60 * 1000; // 7 days
const MOCK_RESET_TOKEN_LIFESPAN = 60 * 60 * 1000; // 1 hour

// In-memory store for password reset tokens for this mock implementation
const passwordResetTokens = new Map<string, { userId: string, expires: number }>();

const createToken = (payload: object, expiresIn: number): string => {
    const header = { alg: 'HS256', typ: 'JWT' };
    const extendedPayload = { ...payload, iat: Date.now(), exp: Math.floor((Date.now() + expiresIn) / 1000) };
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(extendedPayload));
    const signature = btoa(JWT_SECRET);
    return `${encodedHeader}.${encodedPayload}.${signature}`;
};

/**
 * Decodes a token and validates its expiration.
 * @param token The JWT to decode.
 * @returns The decoded payload if the token is valid and not expired, otherwise null.
 */
const decodeToken = (token: string): any => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
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
    getSafetyIncidentsByCompany: async (companyId: string): Promise<SafetyIncident[]> => {
        await delay();
        return db.safetyIncidents as SafetyIncident[];
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
    createProjectInsight: async (
        data: { projectId: string; summary: string; type?: ProjectInsight['type']; metadata?: Record<string, unknown>; model?: string },
        userId: string
    ): Promise<ProjectInsight> => {
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
    createFinancialForecast: async (
        data: { companyId: string; summary: string; horizonMonths: number; metadata?: Record<string, unknown>; model?: string },
        userId: string,
    ): Promise<FinancialForecast> => {
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
        return { profitability: 15, projectMargin: 22, cashFlow: 120000, currency: 'GBP' };
    },
    getMonthlyFinancials: async (companyId: string, options?: RequestOptions): Promise<MonthlyFinancials[]> => {
        ensureNotAborted(options?.signal);
        return [{month: 'Jan', revenue: 50000, profit: 8000}, {month: 'Feb', revenue: 75000, profit: 12000}];
    },
    getCostBreakdown: async (companyId: string, options?: RequestOptions): Promise<CostBreakdown[]> => {
        ensureNotAborted(options?.signal);
        return [{category: 'Labor', amount: 40000}, {category: 'Materials', amount: 30000}];
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