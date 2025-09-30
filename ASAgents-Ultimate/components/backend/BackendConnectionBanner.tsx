import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { BackendConnectionState, DashboardSnapshotMetadata } from '../../types';
import { useBackendConnectionState } from '../../hooks/useBackendConnectionState';

export type ConnectionBannerTone = 'info' | 'warning' | 'success';

export interface ConnectionBannerDescriptor {
    show: boolean;
    tone: ConnectionBannerTone;
    title: string;
    message: string;
    detail?: string | null;
}

const pluralize = (count: number, singular: string, plural?: string) =>
    count === 1 ? singular : plural ?? `${singular}s`;

const formatHost = (baseUrl: string | null): string | null => {
    if (!baseUrl) {
        return null;
    }
    try {
        return new URL(baseUrl).host;
    } catch {
        return baseUrl.replace(/^https?:\/\//, '');
    }
};

const formatLastSync = (
    connection: BackendConnectionState,
    metadata?: DashboardSnapshotMetadata | null,
): string | null => {
    const timestamp = connection.lastSync ?? metadata?.generatedAt ?? null;
    if (!timestamp) {
        return null;
    }
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) {
        return null;
    }
    try {
        return `Last sync ${formatDistanceToNow(date, { addSuffix: true })}`;
    } catch {
        return `Last sync ${date.toLocaleString()}`;
    }
};

export const deriveConnectionBanner = (
    connection: BackendConnectionState,
    metadata?: DashboardSnapshotMetadata | null,
): ConnectionBannerDescriptor => {
    const lastSyncDetail = formatLastSync(connection, metadata);

    if (connection.mode === 'mock') {
        return {
            show: true,
            tone: 'info',
            title: 'Secure demo workspace',
            message:
                'No live backend is configured. All authentication and data writes remain within your local browser sandbox.',
            detail: lastSyncDetail,
        };
    }

    if (!connection.online) {
        const queued = connection.pendingMutations;
        const queueNote =
            queued > 0
                ? ` ${queued} ${pluralize(queued, 'change')} ${queued === 1 ? 'is' : 'are'} queued and will sync automatically once you reconnect.`
                : '';
        return {
            show: true,
            tone: 'warning',
            title: 'Offline mode',
            message: `We are serving cached workspace data until your connection returns.${queueNote}`.trim(),
            detail: lastSyncDetail,
        };
    }

    if (metadata?.usedFallback) {
        const baseMessage =
            metadata.fallbackReason ??
            'We could not reach the live backend, so this view reflects the most recent cached information.';
        const queued = connection.pendingMutations;
        const queueNote =
            queued > 0
                ? ` ${queued} ${pluralize(queued, 'update')} will sync to the backend when it becomes available.`
                : '';
        return {
            show: true,
            tone: 'warning',
            title: 'Showing cached workspace data',
            message: `${baseMessage}${queueNote}`.trim(),
            detail: lastSyncDetail,
        };
    }

    if (connection.pendingMutations > 0) {
        const host = formatHost(connection.baseUrl) ?? 'the backend';
        return {
            show: true,
            tone: 'info',
            title: 'Sync in progress',
            message: `${connection.pendingMutations} ${pluralize(
                connection.pendingMutations,
                'update',
            )} will sync to ${host} momentarily.`,
            detail: lastSyncDetail,
        };
    }

    if (!connection.baseUrl) {
        return {
            show: true,
            tone: 'info',
            title: 'Backend configuration incomplete',
            message: 'The authentication client is active but no base URL is defined. Configure VITE_API_BASE_URL to enable live sync.',
            detail: lastSyncDetail,
        };
    }

    return {
        show: false,
        tone: 'info',
        title: '',
        message: '',
        detail: null,
    };
};

const toneStyles: Record<ConnectionBannerTone, { container: string; icon: string; glyph: React.ReactNode }> = {
    info: {
        container: 'border-sky-200 bg-sky-50 text-sky-900',
        icon: 'text-sky-500',
        glyph: (
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" focusable="false">
                <path
                    fill="currentColor"
                    d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm.75 15h-1.5v-6h1.5Zm0-8h-1.5V7h1.5Z"
                />
            </svg>
        ),
    },
    warning: {
        container: 'border-amber-300 bg-amber-50 text-amber-900',
        icon: 'text-amber-500',
        glyph: (
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" focusable="false">
                <path
                    fill="currentColor"
                    d="M11.05 3.5 2.3 19.25A1.5 1.5 0 0 0 3.6 21.5h16.8a1.5 1.5 0 0 0 1.3-2.25L12.95 3.5a1.5 1.5 0 0 0-1.9 0ZM12 16.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Zm-.75-6.5h1.5V15h-1.5Z"
                />
            </svg>
        ),
    },
    success: {
        container: 'border-emerald-200 bg-emerald-50 text-emerald-900',
        icon: 'text-emerald-500',
        glyph: (
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" focusable="false">
                <path
                    fill="currentColor"
                    d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm5 9.17-6.11 6.12a1.25 1.25 0 0 1-1.77 0L7 15.17a1.25 1.25 0 0 1 1.77-1.77l1.5 1.5 5.23-5.23A1.25 1.25 0 0 1 17 11.17Z"
                />
            </svg>
        ),
    },
};

interface BackendConnectionBannerProps {
    metadata?: DashboardSnapshotMetadata | null;
    className?: string;
}

export const BackendConnectionBanner: React.FC<BackendConnectionBannerProps> = ({ metadata = null, className = '' }) => {
    const connection = useBackendConnectionState();
    const descriptor = deriveConnectionBanner(connection, metadata);

    if (!descriptor.show) {
        return null;
    }

    const tone = toneStyles[descriptor.tone];

    return (
        <div
            className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-sm transition ${tone.container} ${className}`.trim()}
        >
            <span className={`mt-0.5 ${tone.icon}`}>{tone.glyph}</span>
            <div className="space-y-1">
                <p className="font-semibold leading-tight">{descriptor.title}</p>
                <p className="text-xs leading-snug text-current/90">{descriptor.message}</p>
                {descriptor.detail ? (
                    <p className="text-[11px] uppercase tracking-wide text-current/70">{descriptor.detail}</p>
                ) : null}
            </div>
        </div>
    );
};

