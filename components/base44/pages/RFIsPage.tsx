/**
 * RFIs Page - Connected to CortexBuild API
 * Request for Information management
 * Version: 1.1.0 GOLDEN (enhanced normalization + UX)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { CreateRFIModal } from '../modals/CreateRFIModal';

interface RFI {
    id: number | string;
    title: string;
    description?: string;
    project: string;
    status: string;
    priority?: string;
    category?: string;
    submittedTo?: string;
    dueDate?: string;
    response?: string | null;
    respondedBy?: string | null;
    responseDate?: string | null;
    overdue?: boolean;
    overdueDays?: number | null;
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

const normalizeRfi = (raw: any): RFI => {
    const dueDateRaw = raw.due_date ?? raw.dueDate;
    const responseDateRaw = raw.response_date ?? raw.responseDate;

    const parsedDueDate = formatDate(dueDateRaw);
    const parsedResponseDate = formatDate(responseDateRaw);

    let overdueDays: number | null = null;
    if (raw.overdue_days !== undefined) {
        overdueDays = Number(raw.overdue_days);
    } else if (raw.overdueDays !== undefined) {
        overdueDays = Number(raw.overdueDays);
    } else if (dueDateRaw) {
        const due = new Date(dueDateRaw);
        const diff = Math.floor((Date.now() - due.getTime()) / (1000 * 60 * 60 * 24));
        overdueDays = diff > 0 ? diff : null;
    }

    return {
        id: raw.id ?? raw.rfi_number ?? raw.reference ?? `rfi-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: raw.title ?? raw.subject ?? 'Untitled RFI',
        description: raw.description ?? raw.question,
        project: raw.project ?? raw.project_name ?? raw.projectName ?? 'Unknown project',
        status: (raw.status ?? 'open').toString().toLowerCase(),
        priority: raw.priority,
        category: raw.category,
        submittedTo: raw.submitted_to ?? raw.submittedTo ?? raw.assignee,
        dueDate: parsedDueDate,
        response: raw.response ?? raw.answer ?? null,
        respondedBy: raw.responded_by ?? raw.respondedBy ?? raw.answered_by ?? null,
        responseDate: parsedResponseDate,
        overdue: Boolean(raw.overdue ?? (overdueDays !== null && overdueDays > 0)),
        overdueDays
    };
};

const MOCK_RFIS: RFI[] = [
    {
        id: 'RFI-2024-001',
        title: 'Clarification on HVAC Duct Sizing',
        description: 'The mechanical drawings show 14-inch ducts for the main supply, but the specifications call for 16-inch. Which should we follow?',
        project: 'Downtown Office Complex',
        status: 'answered',
        priority: 'high',
        category: 'design',
        submittedTo: 'Engineering Team',
        dueDate: '20 Dec 2024',
        response: 'Use 16-inch ducts as specified in the specifications document. The drawings will be updated in the next revision.',
        respondedBy: 'Lead Engineer',
        responseDate: '18 Dec 2024',
        overdue: false,
        overdueDays: 0
    },
    {
        id: 'RFI-2024-002',
        title: 'Flooring Material Confirmation',
        description: 'Owner requested premium hardwood, but budget shows standard laminate. Need clarification before ordering.',
        project: 'Riverside Luxury Apartments',
        status: 'open',
        priority: 'urgent',
        category: 'materials',
        submittedTo: 'Owner',
        dueDate: '25 Dec 2024',
        response: null,
        respondedBy: null,
        responseDate: null,
        overdue: true,
        overdueDays: 287
    },
    {
        id: 'RFI-2024-003',
        title: 'Fire Rating Requirements',
        description: 'Do interior partition walls on 3rd floor require 1-hour or 2-hour fire rating per local code?',
        project: 'Downtown Office Complex',
        status: 'pending response',
        priority: 'high',
        category: 'code compliance',
        submittedTo: 'Code Inspector',
        dueDate: '22 Dec 2024',
        response: null,
        respondedBy: null,
        responseDate: null,
        overdue: true,
        overdueDays: 290
    }
];

export const RFIsPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [rfis, setRfis] = useState<RFI[]>(MOCK_RFIS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const fetchRFIs = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams({ page: '1', limit: '50' });
            if (searchQuery) params.append('search', searchQuery);
            if (statusFilter !== 'all') params.append('status', statusFilter);

            const response = await fetch(`/api/rfis?${params}`);
            const data = await response.json();

            if (data.success) {
                const normalized = Array.isArray(data.data) ? data.data.map(normalizeRfi) : [];
                setRfis(normalized.length > 0 ? normalized : MOCK_RFIS);
                if (!normalized.length) {
                    setError('No RFIs found for the selected filters.');
                }
            } else {
                setError(data.error ?? 'Unable to load RFIs.');
                setRfis(MOCK_RFIS);
            }
        } catch (err: any) {
            setError(err.message ?? 'Failed to communicate with the RFI API.');
            setRfis(MOCK_RFIS);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, statusFilter]);

    useEffect(() => {
        fetchRFIs();
    }, [fetchRFIs]);

    const stats = {
        total: rfis.length,
        open: rfis.filter(rfi => rfi.status === 'open').length,
        overdue: rfis.filter(rfi => rfi.overdue).length,
        answered: rfis.filter(rfi => rfi.status === 'answered').length
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'answered': 'bg-green-100 text-green-800',
            'open': 'bg-blue-100 text-blue-800',
            'pending response': 'bg-yellow-100 text-yellow-800',
            'closed': 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status: string) => {
        const icons: Record<string, string> = {
            'answered': '✓',
            'open': '○',
            'pending response': '⏳',
            'closed': '✕'
        };
        return icons[status] || '○';
    };

    const getPriorityColor = (priority: string | undefined) => {
        if (!priority) return 'bg-gray-100 text-gray-800';
        const colors: Record<string, string> = {
            'low': 'bg-gray-100 text-gray-800',
            'medium': 'bg-blue-100 text-blue-800',
            'high': 'bg-orange-100 text-orange-800',
            'urgent': 'bg-red-100 text-red-800'
        };
        return colors[priority] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">RFIs</h1>
                        <p className="text-gray-600">Manage Requests for Information</p>
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
                            <span>New RFI</span>
                        </button>
                        {/* Search */}
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search RFIs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                            />
                        </div>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Status</option>
                            <option value="open">Open</option>
                            <option value="pending response">Pending Response</option>
                            <option value="answered">Answered</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="text-sm text-gray-500 mb-1">Total RFIs</div>
                    <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
                    <div className="text-sm text-blue-500 mb-1">Open</div>
                    <div className="text-3xl font-bold text-blue-600">{stats.open}</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-red-100 p-6">
                    <div className="text-sm text-red-500 mb-1">Overdue</div>
                    <div className="text-3xl font-bold text-red-600">{stats.overdue}</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-green-100 p-6">
                    <div className="text-sm text-green-500 mb-1">Answered</div>
                    <div className="text-3xl font-bold text-green-600">{stats.answered}</div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                </div>
            )}

            {loading && (
                <div className="space-y-6 mb-6">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={`rfi-skeleton-${index}`} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                            <div className="h-5 bg-gray-200 rounded w-2/3 mb-3" />
                            <div className="space-y-2">
                                <div className="h-3 bg-gray-100 rounded w-full" />
                                <div className="h-3 bg-gray-100 rounded w-3/4" />
                                <div className="h-3 bg-gray-100 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && rfis.length === 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-600">
                    <p>No RFIs found. Try changing your filters or create a new RFI.</p>
                </div>
            )}

            <div className="space-y-6">
                {rfis.map((rfi) => (
                    <div key={rfi.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(rfi.status)}`}>
                                        <span>{getStatusIcon(rfi.status)}</span>
                                        <span>{rfi.status}</span>
                                    </span>
                                    {rfi.priority && (
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(rfi.priority)}`}>
                                            {rfi.priority}
                                        </span>
                                    )}
                                    {rfi.category && (
                                        <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                            {rfi.category}
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">{rfi.title}</h3>
                                <p className="text-sm text-gray-600">{rfi.project}</p>
                            </div>
                            {rfi.overdue && (
                                <div className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                    Overdue{rfi.overdueDays ? ` by ${rfi.overdueDays} days` : ''}
                                </div>
                            )}
                        </div>

                        {rfi.description && (
                            <p className="text-sm text-gray-600 mb-4">{rfi.description}</p>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                                <span className="text-gray-500">Submitted To:</span>
                                <p className="font-medium text-gray-900">{rfi.submittedTo ?? 'Not assigned'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Due Date:</span>
                                <p className="font-medium text-gray-900">{rfi.dueDate ?? 'Not set'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Responded By:</span>
                                <p className="font-medium text-gray-900">{rfi.respondedBy ?? 'Awaiting response'}</p>
                            </div>
                        </div>

                        {rfi.response && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-700">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-gray-900">Response</span>
                                    {rfi.responseDate && (
                                        <span className="text-xs text-gray-500">{rfi.responseDate}</span>
                                    )}
                                </div>
                                <p>{rfi.response}</p>
                            </div>
                        )}

                        <div className="flex items-center justify-between mt-4">
                            <button
                                type="button"
                                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                            >
                                View Details
                            </button>
                            <div className="text-xs text-gray-500">
                                {rfi.responseDate ? `Responded ${rfi.responseDate}` : 'Awaiting response'}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <CreateRFIModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => {
                    setShowCreateModal(false);
                    fetchRFIs();
                }}
            />
        </div>
    );
};
