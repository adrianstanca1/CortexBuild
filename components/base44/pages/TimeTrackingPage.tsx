/**
 * Time Tracking Page - Connected to CortexBuild API
 * Version: 1.1.0 GOLDEN (normalized data)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { CreateTimeEntryModal } from '../modals/CreateTimeEntryModal';

interface TimeEntry {
    id: number | string;
    project: string;
    description?: string;
    date?: string;
    hours: number;
    rate?: number;
    amount: number;
    billable: boolean;
    category?: string;
    employee?: string;
}

const formatDate = (value?: string | null) => {
    if (!value) return undefined;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value ?? undefined;
    return parsed.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

const parseNumber = (value: unknown, fallback = 0): number => {
    if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;
    if (typeof value === 'string') {
        const numeric = Number(value);
        return Number.isFinite(numeric) ? numeric : fallback;
    }
    return fallback;
};

const normalizeEntry = (raw: any): TimeEntry => {
    const hours = parseNumber(raw.hours ?? raw.duration_hours ?? raw.total_hours);
    const rate = raw.hourly_rate !== undefined ? parseNumber(raw.hourly_rate, undefined as any) : undefined;
    const amount = raw.amount !== undefined ? parseNumber(raw.amount) : (rate ? hours * rate : parseNumber(raw.total_amount));

    return {
        id: raw.id ?? raw.entry_id ?? `time-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        project: raw.project ?? raw.project_name ?? raw.projectName ?? 'Unassigned project',
        description: raw.description ?? raw.notes,
        date: formatDate(raw.date ?? raw.start_time ?? raw.started_at),
        hours,
        rate,
        amount,
        billable: Boolean(raw.billable ?? raw.is_billable ?? true),
        category: raw.category ?? raw.work_type,
        employee: raw.employee ?? raw.user_name ?? raw.user
    };
};

const MOCK_ENTRIES: TimeEntry[] = [
    {
        id: '1',
        project: 'Manufacturing Facility Expansion',
        description: 'Site survey and coordination',
        date: '07 Oct 2025',
        hours: 16,
        rate: 85,
        amount: 1360,
        billable: true,
        category: 'labor',
        employee: 'Adrian Stanca'
    }
];

export const TimeTrackingPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [periodFilter, setPeriodFilter] = useState('this-week');
    const [projectFilter, setProjectFilter] = useState('all');
    const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(MOCK_ENTRIES);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({ totalHours: 0, revenue: 0, entries: 0 });
    const [showCreateModal, setShowCreateModal] = useState(false);

    const fetchTimeEntries = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams({ page: '1', limit: '100' });
            if (projectFilter !== 'all') params.append('project_id', projectFilter);

            const response = await fetch(`/api/time-entries?${params}`);
            const data = await response.json();

            if (data.success) {
                const normalized = Array.isArray(data.data) ? data.data.map(normalizeEntry) : [];
                const entries = normalized.length > 0 ? normalized : MOCK_ENTRIES;
                setTimeEntries(entries);

                const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
                const revenue = entries.reduce((sum, entry) => sum + entry.amount, 0);
                setStats({ totalHours, revenue, entries: entries.length });

                if (!normalized.length) {
                    setError('No time entries found for the current filters.');
                }
            } else {
                setError(data.error ?? 'Unable to load time entries.');
                setTimeEntries(MOCK_ENTRIES);
                setStats({ totalHours: 16, revenue: 1360, entries: MOCK_ENTRIES.length });
            }
        } catch (err: any) {
            setError(err.message ?? 'Failed to communicate with the time tracking API.');
            setTimeEntries(MOCK_ENTRIES);
            setStats({ totalHours: 16, revenue: 1360, entries: MOCK_ENTRIES.length });
        } finally {
            setLoading(false);
        }
    }, [projectFilter]);

    useEffect(() => {
        fetchTimeEntries();
    }, [fetchTimeEntries]);

    const filteredEntries = timeEntries.filter(entry => {
        const matchesSearch = !searchQuery ||
            entry.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (entry.description && entry.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (entry.employee && entry.employee.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesSearch;
    });

    const formatCurrency = (amount: number) => `£${amount.toFixed(2)}`;

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Time Tracking</h1>
                        <p className="text-gray-600">Log and manage your work hours</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            type="button"
                            onClick={() => setShowCreateModal(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Log Time</span>
                        </button>
                        {/* Period Filter */}
                        <select
                            value={periodFilter}
                            onChange={(e) => setPeriodFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="today">Today</option>
                            <option value="this-week">This Week</option>
                            <option value="this-month">This Month</option>
                            <option value="last-month">Last Month</option>
                            <option value="custom">Custom Range</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total Hours</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.totalHours.toFixed(1)}h</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-2xl">
                            ⏱️
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Revenue</p>
                            <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.revenue)}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center text-2xl">
                            💰
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Entries</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.entries}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center text-2xl">
                            📝
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4 mb-6">
                {/* Search */}
                <div className="relative flex-1">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search time entries..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                    />
                </div>

                {/* Project Filter */}
                <select
                    value={projectFilter}
                    onChange={(e) => setProjectFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="all">All Projects</option>
                    {Array.from(new Set(timeEntries.map(entry => entry.project))).map(project => (
                        <option key={project} value={project}>
                            {project}
                        </option>
                    ))}
                </select>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                </div>
            )}

            {loading && (
                <div className="space-y-4 mb-6">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div key={`time-skeleton-${index}`} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                            <div className="h-5 bg-gray-200 rounded w-1/2 mb-3" />
                            <div className="space-y-2">
                                <div className="h-3 bg-gray-100 rounded w-full" />
                                <div className="h-3 bg-gray-100 rounded w-3/4" />
                                <div className="h-3 bg-gray-100 rounded w-2/3" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && filteredEntries.length === 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-600">
                    <p>No time entries found. Try adjusting your filters or log a new time entry.</p>
                </div>
            )}

            {/* Time Entries List */}
            <div className="space-y-4">
                {filteredEntries.map((entry) => (
                    <div key={entry.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                    <h4 className="font-semibold text-gray-900">{entry.project || entry.project_name || 'N/A'}</h4>
                                    {entry.billable && (
                                        <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                            Billable
                                        </span>
                                    )}
                                </div>
                                {entry.description && (
                                    <p className="text-sm text-gray-600 mb-2">{entry.description}</p>
                                )}
                                <div className="flex items-center text-sm text-gray-600 space-x-2">
                                    <span>{entry.employee ?? 'Unknown employee'}</span>
                                    <span>•</span>
                                    <span>{entry.date ?? 'Unknown date'}</span>
                                    <span>•</span>
                                    <span>{entry.hours.toFixed(1)} hours</span>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="text-xl font-bold text-gray-900">{formatCurrency(entry.amount)}</p>
                                {entry.rate && (
                                    <p className="text-sm text-gray-500">£{entry.rate.toFixed(2)}/hr</p>
                                )}
                            </div>
                        </div>

                        {entry.category && (
                            <div className="mt-4 inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                {entry.category}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <CreateTimeEntryModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => {
                    setShowCreateModal(false);
                    fetchTimeEntries();
                }}
            />
        </div>
    );
};
