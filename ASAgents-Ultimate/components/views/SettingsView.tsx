import React, { useCallback, useMemo, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Tag } from '../ui/Tag';
import {
    getEnvironmentSnapshot,
    refreshEnvironment,
    type EnvironmentShape,
} from '../../config/environment';
import { useBackendConnectionState } from '../../hooks/useBackendConnectionState';
import { backendGateway } from '../../services/backendGateway';

const maskSecret = (value: string | null): string => {
    if (!value) {
        return 'Not configured';
    }
    const trimmed = value.trim();
    if (!trimmed) {
        return 'Not configured';
    }
    if (trimmed.length <= 8) {
        return '•'.repeat(trimmed.length);
    }
    return `${trimmed.slice(0, 4)}…${trimmed.slice(-4)}`;
};

const formatBoolean = (value: boolean | null | undefined): string => {
    if (value == null) {
        return 'Not specified';
    }
    return value ? 'Enabled' : 'Disabled';
};

const describeMode = (mode: 'backend' | 'mock'): string =>
    mode === 'backend' ? 'Live backend' : 'Secure local demo';

const formatTimestamp = (value: string | null | undefined): string => {
    if (!value) {
        return 'Never synced';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return date.toISOString();
};

const asUrlHost = (value: string | null | undefined): string | null => {
    if (!value) {
        return null;
    }
    try {
        return new URL(value).host;
    } catch {
        return value;
    }
};

export const SettingsView: React.FC = () => {
    const [environment, setEnvironment] = useState<EnvironmentShape>(() => getEnvironmentSnapshot());
    const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(() => new Date());
    const [queueClearedAt, setQueueClearedAt] = useState<Date | null>(null);

    const connection = useBackendConnectionState();

    const secretStatuses = useMemo(
        () => [
            { label: 'Gemini API key', value: environment.geminiApiKey },
            { label: 'Analytics write key', value: environment.analyticsWriteKey },
            { label: 'Mapbox token', value: environment.mapboxToken },
            { label: 'Supabase URL', value: environment.supabaseUrl },
            { label: 'Supabase anon key', value: environment.supabaseAnonKey },
        ],
        [environment],
    );

    const handleRefreshEnvironment = useCallback(() => {
        const next = refreshEnvironment();
        setEnvironment(next);
        setLastRefreshedAt(new Date());
    }, []);

    const handleClearQueue = useCallback(() => {
        backendGateway.clearInteractionQueue();
        setQueueClearedAt(new Date());
    }, []);

    const baseHost = useMemo(() => asUrlHost(connection.baseUrl), [connection.baseUrl]);

    return (
        <div className="space-y-6">
            <header className="flex flex-col gap-2">
                <h1 className="text-2xl font-semibold text-foreground">Platform settings</h1>
                <p className="text-sm text-muted-foreground">
                    Inspect live environment wiring, secret availability, and backend connectivity for the BuildingManagement
                    workspace.
                </p>
            </header>

            <Card className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">Environment snapshot</h2>
                        <p className="text-xs text-muted-foreground">
                            Loaded from import.meta/env, process.env, and runtime globals.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="secondary" size="sm" onClick={handleRefreshEnvironment}>
                            Refresh snapshot
                        </Button>
                        <Tag
                            label={`Last refreshed ${lastRefreshedAt.toISOString()}`}
                            color="blue"
                            statusIndicator="blue"
                        />
                    </div>
                </div>

                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border border-border/60 bg-muted/40 p-4">
                        <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
                            API base URL
                        </dt>
                        <dd className="mt-1 text-sm text-foreground">
                            {environment.apiBaseUrl ?? 'Not configured'}
                        </dd>
                        {environment.apiBaseUrl ? (
                            <p className="mt-1 text-xs text-muted-foreground">
                                Host: {asUrlHost(environment.apiBaseUrl)}
                            </p>
                        ) : null}
                    </div>
                    <div className="rounded-lg border border-border/60 bg-muted/40 p-4">
                        <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
                            Supabase authentication
                        </dt>
                        <dd className="mt-1 text-sm text-foreground">
                            {formatBoolean(environment.featureFlags.useSupabaseAuth)}
                        </dd>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Mock fallback {environment.featureFlags.allowMockFallback ? 'enabled' : 'disabled'}
                        </p>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-muted/40 p-4">
                        <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
                            Analytics write key
                        </dt>
                        <dd className="mt-1 text-sm text-foreground">{maskSecret(environment.analyticsWriteKey)}</dd>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-muted/40 p-4">
                        <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
                            Gemini API key
                        </dt>
                        <dd className="mt-1 text-sm text-foreground">{maskSecret(environment.geminiApiKey)}</dd>
                    </div>
                </dl>
            </Card>

            <Card className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">Secret catalogue</h2>
                        <p className="text-xs text-muted-foreground">
                            Verifies which credentials are present in the current runtime context.
                        </p>
                    </div>
                </div>
                <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {secretStatuses.map(secret => {
                        const configured = Boolean(secret.value && secret.value.trim());
                        return (
                            <li
                                key={secret.label}
                                className="flex items-center justify-between rounded-lg border border-border/60 bg-background/60 px-4 py-3"
                            >
                                <div>
                                    <p className="text-sm font-medium text-foreground">{secret.label}</p>
                                    <p className="text-xs text-muted-foreground">{maskSecret(secret.value ?? null)}</p>
                                </div>
                                <Tag
                                    label={configured ? 'Configured' : 'Missing'}
                                    color={configured ? 'green' : 'red'}
                                    statusIndicator={configured ? 'green' : 'red'}
                                />
                            </li>
                        );
                    })}
                </ul>
            </Card>

            <Card className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">Backend connection</h2>
                        <p className="text-xs text-muted-foreground">
                            Monitor gateway state, queued interactions, and last successful synchronisation.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Tag
                            label={connection.online ? 'Online' : 'Offline'}
                            color={connection.online ? 'green' : 'red'}
                            statusIndicator={connection.online ? 'green' : 'red'}
                        />
                        <Tag
                            label={describeMode(connection.mode)}
                            color={connection.mode === 'backend' ? 'blue' : 'gray'}
                            statusIndicator={connection.mode === 'backend' ? 'blue' : 'gray'}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-lg border border-border/60 bg-muted/40 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">Base endpoint</p>
                        <p className="mt-1 text-sm text-foreground">
                            {connection.baseUrl ?? 'Not configured'}
                        </p>
                        {baseHost ? (
                            <p className="mt-1 text-xs text-muted-foreground">Host: {baseHost}</p>
                        ) : null}
                    </div>
                    <div className="rounded-lg border border-border/60 bg-muted/40 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">Last sync</p>
                        <p className="mt-1 text-sm text-foreground">{formatTimestamp(connection.lastSync)}</p>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-muted/40 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">Queued mutations</p>
                        <p className="mt-1 text-sm font-semibold text-foreground">{connection.pendingMutations}</p>
                        <div className="mt-3 flex items-center gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleClearQueue}
                                disabled={connection.pendingMutations === 0}
                            >
                                Clear queue
                            </Button>
                            {queueClearedAt ? (
                                <span className="text-[11px] text-muted-foreground">
                                    Cleared at {queueClearedAt.toISOString()}
                                </span>
                            ) : null}
                        </div>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-muted/40 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">Operating mode</p>
                        <p className="mt-1 text-sm text-foreground">{describeMode(connection.mode)}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Mock fallback {connection.mode === 'mock' ? 'active – data stays on device.' : 'disabled while backend is available.'}
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default SettingsView;
