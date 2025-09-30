import { api } from './mockApi';
import { analytics } from './analyticsService';
import { apiCache } from './cacheService';
import { getStorage } from '../utils/storage';
import { computeProjectPortfolioSummary } from '../utils/projectPortfolio';
import { ApiError } from './apiErrorHandler';
import { getAuthConnectionInfo, subscribeToAuthClientChanges } from './authClient';
import type {
    BackendConnectionState,
    BackendInteractionEvent,
    DashboardSnapshot,
    DashboardSnapshotMetadata,
    Project,
    User,
    Equipment,
    Todo,
    AuditLog,
    SafetyIncident,
    Expense,
    OperationalInsights,
    ResourceAssignment,
} from '../types';
import { Role } from '../types';

type SnapshotParams = {
    userId: string;
    companyId: string;
    signal?: AbortSignal;
    forceRefresh?: boolean;
};

type QueuedInteraction = BackendInteractionEvent & {
    id: string;
    attempts: number;
    lastError?: string;
};

const QUEUE_STORAGE_KEY = 'asagents:backend:interaction-queue:v1';
const DASHBOARD_CACHE_TTL = 60 * 1000; // 1 minute

const isAbortError = (error: unknown): boolean =>
    error instanceof DOMException && error.name === 'AbortError';

const normaliseStatus = (status: unknown): string =>
    typeof status === 'string' ? status.toUpperCase() : '';

const asStringId = (value: unknown): string | null => {
    if (value == null) {
        return null;
    }
    return String(value);
};

class BackendGateway {
    private static instance: BackendGateway;

    private connectionInfo = getAuthConnectionInfo();
    private state: BackendConnectionState = {
        mode: this.connectionInfo.mode,
        baseUrl: this.connectionInfo.baseUrl,
        online: typeof navigator === 'undefined' ? true : navigator.onLine,
        pendingMutations: 0,
        lastSync: null,
    };
    private readonly listeners = new Set<(state: BackendConnectionState) => void>();
    private readonly storage = getStorage();
    private queue: QueuedInteraction[];
    private syncingQueue = false;
    private cachedState: BackendConnectionState | null = null;

    private constructor() {
        this.queue = this.loadQueue();
        this.state.pendingMutations = this.queue.length;

        if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
            window.addEventListener('online', this.handleOnline);
            window.addEventListener('offline', this.handleOffline);
        }

        subscribeToAuthClientChanges(() => this.refreshConnectionInfo());

        if (this.state.online && this.connectionInfo.mode === 'backend') {
            void this.syncQueuedInteractions();
        }
    }

    static getInstance(): BackendGateway {
        if (!BackendGateway.instance) {
            BackendGateway.instance = new BackendGateway();
        }
        return BackendGateway.instance;
    }

    getState(): BackendConnectionState {
        if (!this.cachedState) {
            this.cachedState = { ...this.state };
        }
        return this.cachedState;
    }

    subscribe(listener: (state: BackendConnectionState) => void): () => void {
        this.listeners.add(listener);
        try {
            listener({ ...this.state });
        } catch (error) {
            console.error('[backendGateway] listener threw during initial emit', error);
        }
        return () => {
            this.listeners.delete(listener);
        };
    }

    async getDashboardSnapshot(params: SnapshotParams): Promise<DashboardSnapshot> {
        const { userId, companyId, signal, forceRefresh = false } = params;

        if (!userId || !companyId) {
            throw new Error('Both userId and companyId are required to load dashboard data.');
        }

        const cacheKey = `dashboard:snapshot:${companyId}:${userId}`;
        if (!forceRefresh) {
            const cached = apiCache.get<DashboardSnapshot>(cacheKey);
            if (cached) {
                return { ...cached, metadata: { ...cached.metadata } };
            }
        }

        const canUseBackend = this.connectionInfo.mode === 'backend' && !!this.connectionInfo.baseUrl;
        let snapshot: DashboardSnapshot | null = null;
        let usedBackend = false;
        let fallbackReason: string | undefined;

        if (canUseBackend && this.state.online) {
            try {
                const query = new URLSearchParams({ companyId, userId }).toString();
                const remote = await this.fetchFromBackend<Partial<DashboardSnapshot>>(
                    `/app/dashboard/snapshot?${query}`,
                    { method: 'GET', signal },
                );

                if (remote && Array.isArray(remote.projects)) {
                    const metadata = {
                        projectCount: Array.isArray(remote.projects) ? remote.projects.length : undefined,
                        ...remote.metadata,
                        source: 'backend' as const,
                        generatedAt: remote.metadata?.generatedAt ?? new Date().toISOString(),
                        usedFallback: false,
                    };

                    snapshot = {
                        projects: remote.projects as Project[],
                        team: (remote.team ?? []) as User[],
                        equipment: (remote.equipment ?? []) as Equipment[],
                        tasks: (remote.tasks ?? []) as Todo[],
                        activityLog: (remote.activityLog ?? []) as AuditLog[],
                        operationalInsights: (remote.operationalInsights ?? null) as OperationalInsights | null,
                        incidents: (remote.incidents ?? []) as SafetyIncident[],
                        expenses: (remote.expenses ?? []) as Expense[],
                        portfolioSummary: remote.portfolioSummary ?? computeProjectPortfolioSummary(remote.projects as Project[]),
                        metadata,
                    };

                    usedBackend = true;
                }
            } catch (error) {
                if (isAbortError(error)) {
                    throw error;
                }
                console.warn('[backendGateway] backend snapshot fetch failed, using local data instead.', error);
                if (error instanceof Error && error.message) {
                    fallbackReason = `Backend request failed: ${error.message}`.slice(0, 200);
                } else {
                    fallbackReason = 'Backend request failed due to an unknown error.';
                }
            }
        } else if (!canUseBackend) {
            fallbackReason = 'No backend connection configured.';
        } else if (!this.state.online) {
            fallbackReason = 'Offline: using locally cached data.';
        }

        if (!snapshot) {
            snapshot = await this.buildLocalSnapshot({ userId, companyId, signal });
        }

        const existingMetadata: Partial<DashboardSnapshotMetadata> = snapshot.metadata ?? {};
        snapshot.metadata = {
            ...existingMetadata,
            projectCount: existingMetadata.projectCount ?? snapshot.projects.length,
            generatedAt: existingMetadata.generatedAt ?? new Date().toISOString(),
            source: usedBackend ? 'backend' : 'mock',
            usedFallback: usedBackend ? existingMetadata.usedFallback ?? false : true,
            fallbackReason: usedBackend
                ? existingMetadata.fallbackReason
                : fallbackReason ?? existingMetadata.fallbackReason,
        };

        apiCache.set(cacheKey, snapshot, DASHBOARD_CACHE_TTL);
        this.setState({ lastSync: snapshot.metadata.generatedAt });

        try {
            analytics.track?.('dashboard_snapshot_loaded', {
                source: snapshot.metadata.source,
                project_count: snapshot.metadata.projectCount,
                used_fallback: snapshot.metadata.usedFallback,
                fallback_reason: snapshot.metadata.fallbackReason ?? null,
            });
        } catch (error) {
            console.warn('[backendGateway] analytics tracking failed', error);
        }

        return snapshot;
    }

    async recordInteraction(event: BackendInteractionEvent): Promise<void> {
        const enriched: QueuedInteraction = {
            ...event,
            id: event.id ?? this.generateId(),
            createdAt: event.createdAt ?? new Date().toISOString(),
            attempts: 0,
        };

        if (this.connectionInfo.mode === 'backend' && this.connectionInfo.baseUrl && this.state.online) {
            try {
                await this.sendInteractionToBackend(enriched);
                this.setState({ lastSync: enriched.createdAt ?? new Date().toISOString() });
                analytics.track?.('backend_interaction_sent', {
                    type: enriched.type,
                    queued: false,
                });
                return;
            } catch (error) {
                if (isAbortError(error)) {
                    throw error;
                }
                console.warn('[backendGateway] failed to deliver interaction, queueing for retry', error);
            }
        }

        this.queue.push({ ...enriched });
        this.enforceQueueLimit();
        this.persistQueue();
        this.setState({ pendingMutations: this.queue.length });

        analytics.track?.('backend_interaction_queued', {
            type: enriched.type,
            pending: this.queue.length,
        });

        if (this.connectionInfo.mode === 'backend' && this.connectionInfo.baseUrl && this.state.online) {
            void this.syncQueuedInteractions();
        }
    }

    clearInteractionQueue(): void {
        this.queue = [];
        this.persistQueue();
        this.setState({ pendingMutations: 0 });
    }

    private async buildLocalSnapshot(params: SnapshotParams): Promise<DashboardSnapshot> {
        const { userId, companyId, signal } = params;

        const safeCall = async <T>(promise: Promise<T>, fallback: T): Promise<T> => {
            try {
                return await promise;
            } catch (error) {
                if (isAbortError(error)) {
                    throw error;
                }
                console.warn('[backendGateway] local snapshot call failed, using fallback value.', error);
                return fallback;
            }
        };

        const [
            projects,
            users,
            equipment,
            assignments,
            logs,
            insights,
        ] = await Promise.all([
            safeCall(api.getProjectsByManager(userId, { signal }) as Promise<Project[]>, [] as Project[]),
            safeCall(api.getUsersByCompany(companyId, { signal }) as Promise<User[]>, [] as User[]),
            safeCall(api.getEquipmentByCompany(companyId, { signal }) as Promise<Equipment[]>, [] as Equipment[]),
            safeCall(api.getResourceAssignments(companyId, { signal }) as Promise<ResourceAssignment[]>, [] as ResourceAssignment[]),
            safeCall(api.getAuditLogsByCompany(companyId, { signal }) as Promise<AuditLog[]>, [] as AuditLog[]),
            safeCall(
                api
                    .getOperationalInsights(companyId, { signal })
                    .then(result => result as OperationalInsights | null),
                null as OperationalInsights | null,
            ),
        ]);

        const activeProjectIds = new Set(
            projects
                .filter(project => normaliseStatus(project.status) === 'ACTIVE')
                .map(project => String(project.id)),
        );
        const projectIds = new Set(projects.map(project => String(project.id)));

        const tasks = activeProjectIds.size
            ? await safeCall(
                  api.getTodosByProjectIds(Array.from(activeProjectIds), { signal }) as Promise<Todo[]>,
                  [] as Todo[],
              )
            : ([] as Todo[]);

        const [incidents, expenses] = await Promise.all([
            safeCall(api.getSafetyIncidentsByCompany(companyId, { signal }) as Promise<SafetyIncident[]>, [] as SafetyIncident[]),
            safeCall(api.getExpensesByCompany(companyId, { signal }) as Promise<Expense[]>, [] as Expense[]),
        ]);

        const equipmentAssignments = assignments.filter(assignment => {
            if (assignment.resourceType !== 'equipment') {
                return false;
            }
            const projectId = asStringId(assignment.projectId);
            return projectId != null && activeProjectIds.has(projectId);
        });

        const assignedEquipmentIds = new Set(equipmentAssignments.map(assignment => String(assignment.resourceId)));
        const filteredEquipment = assignedEquipmentIds.size > 0
            ? equipment.filter(item => assignedEquipmentIds.has(String(item.id)))
            : equipment;

        const filteredTeam = users.filter(user => user.role !== Role.PRINCIPAL_ADMIN);

        const activityLog = logs
            .filter(log => typeof log.action === 'string' && log.action.toLowerCase().includes('task'))
            .sort((a, b) => new Date(b.timestamp ?? '').getTime() - new Date(a.timestamp ?? '').getTime())
            .slice(0, 50);

        const scopedIncidents = incidents.filter(incident => {
            if (incident.companyId) {
                return String(incident.companyId) === companyId;
            }
            if (incident.projectId) {
                return projectIds.has(String(incident.projectId));
            }
            return true;
        });

        const snapshot: DashboardSnapshot = {
            projects,
            team: filteredTeam,
            equipment: filteredEquipment,
            tasks,
            activityLog,
            operationalInsights: insights ?? null,
            incidents: scopedIncidents,
            expenses,
            portfolioSummary: computeProjectPortfolioSummary(projects),
            metadata: {
                source: 'mock',
                generatedAt: new Date().toISOString(),
                usedFallback: true,
                projectCount: projects.length,
            },
        };

        return snapshot;
    }

    private async fetchFromBackend<T>(path: string, init: RequestInit & { signal?: AbortSignal } = {}): Promise<T> {
        if (!this.connectionInfo.baseUrl) {
            throw new ApiError('No backend configured', 503);
        }

        const url = `${this.connectionInfo.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
        const { signal, ...rest } = init;
        const controller = new AbortController();
        const abortListener = () => controller.abort();
        const timeoutId = setTimeout(() => controller.abort(), 30_000);

        if (signal) {
            if (signal.aborted) {
                clearTimeout(timeoutId);
                throw new DOMException('Aborted', 'AbortError');
            }
            signal.addEventListener('abort', abortListener);
        }

        try {
            const response = await fetch(url, {
                ...rest,
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    ...(rest.headers ?? {}),
                },
                signal: controller.signal,
            });

            if (!response.ok) {
                let errorBody: any = null;
                try {
                    errorBody = await response.json();
                } catch {
                    // Ignore JSON parsing issues
                }
                throw new ApiError(
                    errorBody?.message || `HTTP ${response.status}`,
                    response.status,
                    errorBody?.code,
                    errorBody,
                );
            }

            if (response.status === 204) {
                return null as T;
            }

            const text = await response.text();
            if (!text) {
                return null as T;
            }

            try {
                return JSON.parse(text) as T;
            } catch (error) {
                console.warn('[backendGateway] failed to parse backend response as JSON, returning raw text', error);
                return text as unknown as T;
            }
        } catch (error) {
            if (isAbortError(error)) {
                throw error;
            }
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError(error instanceof Error ? error.message : 'Failed to reach backend service', 503);
        } finally {
            clearTimeout(timeoutId);
            if (signal) {
                signal.removeEventListener('abort', abortListener);
            }
        }
    }

    private async sendInteractionToBackend(interaction: QueuedInteraction): Promise<void> {
        const { attempts, lastError, ...payload } = interaction;
        await this.fetchFromBackend('/app/interactions', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    private async syncQueuedInteractions(): Promise<void> {
        if (this.syncingQueue) {
            return;
        }
        if (!this.queue.length) {
            return;
        }
        if (this.connectionInfo.mode !== 'backend' || !this.connectionInfo.baseUrl || !this.state.online) {
            return;
        }

        this.syncingQueue = true;

        try {
            while (this.queue.length > 0) {
                const current = this.queue[0];
                try {
                    await this.sendInteractionToBackend(current);
                    this.queue.shift();
                    this.persistQueue();
                    this.setState({ pendingMutations: this.queue.length, lastSync: current.createdAt ?? new Date().toISOString() });
                } catch (error) {
                    if (isAbortError(error)) {
                        throw error;
                    }

                    current.attempts += 1;
                    current.lastError = error instanceof Error ? error.message : String(error);
                    this.persistQueue();

                    if (current.attempts >= 3) {
                        console.error('[backendGateway] dropping interaction after repeated failures', current);
                        this.queue.shift();
                        this.persistQueue();
                        this.setState({ pendingMutations: this.queue.length });
                        continue;
                    }

                    console.warn('[backendGateway] interaction sync failed, will retry later', error);
                    break;
                }
            }
        } finally {
            this.syncingQueue = false;
        }
    }

    private handleOnline = () => {
        this.setState({ online: true });
        void this.syncQueuedInteractions();
    };

    private handleOffline = () => {
        this.setState({ online: false });
    };

    private refreshConnectionInfo() {
        this.connectionInfo = getAuthConnectionInfo();
        this.setState({ mode: this.connectionInfo.mode, baseUrl: this.connectionInfo.baseUrl });

        if (this.connectionInfo.mode === 'backend' && this.state.online) {
            void this.syncQueuedInteractions();
        }
    }

    private setState(patch: Partial<BackendConnectionState>) {
        this.state = { ...this.state, ...patch };
        this.cachedState = null; // Invalidate cache
        this.emitState();
    }

    private emitState() {
        const snapshot = { ...this.state };
        this.listeners.forEach(listener => {
            try {
                listener(snapshot);
            } catch (error) {
                console.error('[backendGateway] state listener threw an error', error);
            }
        });
    }

    private loadQueue(): QueuedInteraction[] {
        try {
            const stored = this.storage.getItem(QUEUE_STORAGE_KEY);
            if (!stored) {
                return [];
            }
            const parsed = JSON.parse(stored);
            if (!Array.isArray(parsed)) {
                return [];
            }
            return parsed
                .map((entry: Partial<QueuedInteraction>) => ({
                    id: entry.id ?? this.generateId(),
                    type: entry.type ?? 'unknown',
                    userId: entry.userId,
                    companyId: entry.companyId,
                    context: entry.context ?? {},
                    createdAt: entry.createdAt ?? new Date().toISOString(),
                    metadata: entry.metadata ?? {},
                    attempts: entry.attempts ?? 0,
                    lastError: entry.lastError,
                }))
                .slice(-100);
        } catch (error) {
            console.warn('[backendGateway] failed to restore interaction queue from storage', error);
            return [];
        }
    }

    private persistQueue() {
        try {
            this.storage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
        } catch (error) {
            console.warn('[backendGateway] failed to persist interaction queue', error);
        }
    }

    private enforceQueueLimit(limit = 100) {
        if (this.queue.length <= limit) {
            return;
        }
        this.queue.splice(0, this.queue.length - limit);
        this.persistQueue();
    }

    private generateId(): string {
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
            return crypto.randomUUID();
        }
        return `queue-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    }
}

export const backendGateway = BackendGateway.getInstance();
