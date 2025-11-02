/**
 * Invoices Page - Connected to CortexBuild API
 * Version: 1.1.0 GOLDEN
 */

import React, { useState, useEffect, useCallback } from 'react';
import { InvoiceBuilder } from '../components/InvoiceBuilder';

interface Invoice {
    id: number | string;
    client: string;
    project?: string;
    description?: string;
    amount: number;
    status: string;
    type?: string;
    issueDate?: string;
    dueDate?: string;
    paidAmount?: number;
    paidDate?: string | null;
}

const formatDate = (value?: string | null) => {
    if (!value) return undefined;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

const parseAmount = (value: unknown): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const numeric = Number(value);
        return Number.isFinite(numeric) ? numeric : 0;
    }
    return 0;
};

const normalizeInvoice = (raw: any): Invoice => {
    const amount = parseAmount(raw.amount ?? raw.total ?? raw.invoice_total);
    const paidAmount = parseAmount(raw.paidAmount ?? raw.paid_amount);

    const id =
        raw.id ??
        raw.invoice_number ??
        raw.invoiceNumber ??
        raw.reference ??
        `invoice-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    return {
        id,
        client: raw.client ?? raw.client_name ?? raw.clientName ?? 'Unknown client',
        project: raw.project ?? raw.project_name ?? raw.projectName,
        description: raw.description,
        amount,
        status: (raw.status ?? 'draft').toLowerCase(),
        type: raw.type ?? raw.invoice_type ?? 'standard',
        issueDate: formatDate(raw.issueDate ?? raw.issue_date),
        dueDate: formatDate(raw.dueDate ?? raw.due_date),
        paidAmount,
        paidDate: formatDate(raw.paidDate ?? raw.paid_date) ?? null
    };
};

const MOCK_INVOICES: Invoice[] = [
    {
        id: 'INV-2024-001',
        client: 'Metro Construction Group',
        project: 'Downtown Office Complex',
        description: 'Progress billing - Phase 1 completion',
        amount: 486000,
        status: 'paid',
        type: 'progress',
        issueDate: 'Nov 1, 2024',
        dueDate: 'Nov 30, 2024',
        paidAmount: 486000,
        paidDate: 'Nov 28, 2024'
    },
    {
        id: 'INV-2024-002',
        client: 'Green Valley Homes',
        project: 'Riverside Luxury Apartments',
        description: 'Progress billing - Foundation and framing',
        amount: 302400,
        status: 'sent',
        type: 'progress',
        issueDate: 'Dec 1, 2024',
        dueDate: 'Dec 31, 2024',
        paidAmount: 0,
        paidDate: null
    },
    {
        id: 'INV-2024-003',
        client: 'Metro Construction Group',
        project: 'Downtown Office Complex',
        description: 'Progress billing - Phase 2 structural work',
        amount: 561600,
        status: 'viewed',
        type: 'progress',
        issueDate: 'Dec 15, 2024',
        dueDate: 'Jan 15, 2025',
        paidAmount: 0,
        paidDate: null
    },
    {
        id: 'INV-2024-004',
        client: 'Green Valley Homes',
        project: 'Riverside Apartments',
        description: 'Progress payment - 50% completion',
        amount: 172800,
        status: 'sent',
        type: 'progress',
        issueDate: 'May 15, 2024',
        dueDate: 'Jun 15, 2024',
        paidAmount: 0,
        paidDate: null
    },
    {
        id: 'INV-2024-005',
        client: 'Sunset Developments',
        project: 'Downtown Office Complex',
        description: 'Progress payment - Phase 1 completion',
        amount: 486000,
        status: 'paid',
        type: 'progress',
        issueDate: 'Feb 1, 2024',
        dueDate: 'Mar 1, 2024',
        paidAmount: 486000,
        paidDate: 'Feb 28, 2024'
    }
];

export const InvoicesPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showInvoiceBuilder, setShowInvoiceBuilder] = useState(false);

    const fetchInvoices = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const params = new URLSearchParams({ page: '1', limit: '50' });
            if (searchQuery) params.append('search', searchQuery);
            if (statusFilter !== 'all') params.append('status', statusFilter);

            const response = await fetch(`/api/invoices?${params}`);
            const data = await response.json();

            if (data.success) {
                const normalized = Array.isArray(data.data) ? data.data.map(normalizeInvoice) : [];
                setInvoices(normalized.length > 0 ? normalized : MOCK_INVOICES);
                if (!normalized.length) {
                    setError('No invoices found for the selected filters.');
                }
            } else {
                setError(data.error ?? 'Unable to load invoices.');
                setInvoices(MOCK_INVOICES);
            }
        } catch (err: any) {
            setError(err.message ?? 'Failed to communicate with the invoices API.');
            setInvoices(MOCK_INVOICES);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, statusFilter]);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    const formatCurrency = (amount?: number | null) => {
        if (amount === undefined || amount === null) return '£0.00';
        return `£${amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'paid': 'bg-green-100 text-green-800',
            'sent': 'bg-blue-100 text-blue-800',
            'viewed': 'bg-yellow-100 text-yellow-800',
            'overdue': 'bg-red-100 text-red-800',
            'draft': 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status: string) => {
        const icons: Record<string, string> = {
            'paid': '✓',
            'sent': '📤',
            'viewed': '👁',
            'overdue': '⚠️',
            'draft': '📝'
        };
        return icons[status] || '📄';
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Invoices</h1>
                        <p className="text-gray-600">Manage billing and payments</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        {/* Search */}
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search invoices..."
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
                            <option value="paid">Paid</option>
                            <option value="sent">Sent</option>
                            <option value="viewed">Viewed</option>
                            <option value="overdue">Overdue</option>
                            <option value="draft">Draft</option>
                        </select>

                        {/* New Invoice Button */}
                        <button
                            type="button"
                            onClick={() => setShowInvoiceBuilder(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>New Invoice</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Invoices List */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                </div>
            )}

            {loading && (
                <div className="space-y-4 mb-6">
                    {Array.from({ length: 3 }).map((_, skeletonIndex) => (
                        <div
                            key={`invoice-skeleton-${skeletonIndex}`}
                            className="animate-pulse bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                        >
                            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                            <div className="h-4 bg-gray-100 rounded w-full mb-2" />
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                                {[...Array(4)].map((__, innerIndex) => (
                                    <div key={`invoice-skeleton-section-${skeletonIndex}-${innerIndex}`}>
                                        <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
                                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="space-y-4">
                {invoices.map((invoice, index) => (
                    <div key={`${invoice.id}-${index}`} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(invoice.status)}`}>
                                        <span>{getStatusIcon(invoice.status)}</span>
                                        <span>{invoice.status}</span>
                                    </span>
                                    <span className="text-2xl font-bold text-gray-900">{formatCurrency((invoice as any).amount || invoice.total || 0)}</span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">Invoice #{invoice.id}</h3>
                                <p className="text-sm text-gray-600">{(invoice as any).client || invoice.client_name || 'N/A'}</p>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="space-y-2">
                            <div className="flex items-start">
                                <span className="text-sm text-gray-600 mr-2">Project:</span>
                                <p className="text-sm font-medium text-gray-900">{(invoice as any).project || invoice.project_name || 'N/A'}</p>
                            </div>
                            <p className="text-sm text-gray-600">{invoice.description}</p>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                                <div>
                                    <span className="text-xs text-gray-500">Issue Date:</span>
                                    <p className="text-sm font-medium text-gray-900">{invoice.issueDate ?? '—'}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500">Due Date:</span>
                                    <p className="text-sm font-medium text-gray-900">{invoice.dueDate ?? '—'}</p>
                                </div>
                                {invoice.paidAmount > 0 && (
                                    <div>
                                        <span className="text-xs text-gray-500">Paid:</span>
                                        <p className="text-sm font-medium text-green-600">{formatCurrency(invoice.paidAmount)}</p>
                                    </div>
                                )}
                                <div>
                                    <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                        {invoice.type}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Invoice Builder Modal */}
            {showInvoiceBuilder && (
                <InvoiceBuilder
                    onClose={() => setShowInvoiceBuilder(false)}
                    onSave={async (invoiceData) => {
                        try {
                            // Get company_id from localStorage
                            const userStr = localStorage.getItem('user');
                            const user = userStr ? JSON.parse(userStr) : null;
                            const company_id = user?.company_id || 'company-1';

                            // Save invoice to API
                            const response = await fetch('/api/invoices', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    company_id,
                                    invoice_number: invoiceData.invoiceNumber,
                                    client_name: invoiceData.clientName,
                                    description: invoiceData.items.map(i => i.description).join(', '),
                                    total: invoiceData.total,
                                    status: 'draft',
                                    issue_date: invoiceData.invoiceDate,
                                    due_date: invoiceData.dueDate
                                })
                            });

                            if (response.ok) {
                                setShowInvoiceBuilder(false);
                                fetchInvoices(); // Refresh list
                            }
                        } catch (err) {
                            console.error('Failed to save invoice:', err);
                        }
                    }}
                />
            )}
        </div>
    );
};
