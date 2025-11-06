/**
 * Purchase Orders Page - Connected to CortexBuild API
 * Version: 1.1.0 GOLDEN
 */

import React, { useState, useEffect, useCallback } from 'react';
import { CreatePurchaseOrderModal } from '../modals/CreatePurchaseOrderModal';

interface PurchaseOrder {
    id: number | string;
    vendor: string;
    project?: string;
    items?: string;
    amount: number;
    status: string;
    orderDate?: string;
    deliveryDate?: string;
    receivedDate?: string | null;
}

const formatCurrency = (amount?: number | null) => {
    if (amount === undefined || amount === null) return '£0.00';
    return `£${amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

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

const parseAmount = (value: unknown): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const numeric = Number(value);
        return Number.isFinite(numeric) ? numeric : 0;
    }
    return 0;
};

const normalizePurchaseOrder = (raw: any): PurchaseOrder => {
    return {
        id: raw.id ?? raw.po_number ?? raw.reference ?? `po-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        vendor: raw.vendor ?? raw.vendor_name ?? raw.supplier ?? 'Unknown vendor',
        project: raw.project ?? raw.project_name ?? raw.projectName,
        items: raw.items ?? raw.description,
        amount: parseAmount(raw.amount ?? raw.total ?? raw.order_total),
        status: (raw.status ?? 'pending').toLowerCase(),
        orderDate: formatDate(raw.order_date ?? raw.orderDate),
        deliveryDate: formatDate(raw.delivery_date ?? raw.deliveryDate),
        receivedDate: formatDate(raw.received_date ?? raw.receivedDate) ?? null
    };
};

const MOCK_PURCHASE_ORDERS: PurchaseOrder[] = [
    {
        id: 'PO-2024-001',
        vendor: 'ABC Supplies Inc',
        project: 'Downtown Office Complex',
        items: 'Steel beams, concrete mix',
        amount: 45000,
        status: 'approved',
        orderDate: '01 Dec 2024',
        deliveryDate: '15 Dec 2024',
        receivedDate: null
    },
    {
        id: 'PO-2024-002',
        vendor: 'BuildMart Wholesale',
        project: 'Riverside Luxury Apartments',
        items: 'Lumber, drywall, insulation',
        amount: 32500,
        status: 'pending',
        orderDate: '05 Dec 2024',
        deliveryDate: '20 Dec 2024',
        receivedDate: null
    }
];

export const PurchaseOrdersPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(MOCK_PURCHASE_ORDERS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const fetchPurchaseOrders = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const params = new URLSearchParams({ page: '1', limit: '50' });
            if (searchQuery) params.append('search', searchQuery);
            if (statusFilter !== 'all') params.append('status', statusFilter);

            const response = await fetch(`/api/purchase-orders?${params}`);
            const data = await response.json();

            if (data.success) {
                const normalized = Array.isArray(data.data) ? data.data.map(normalizePurchaseOrder) : [];
                setPurchaseOrders(normalized.length > 0 ? normalized : MOCK_PURCHASE_ORDERS);
                if (!normalized.length) {
                    setError('No purchase orders found for the selected filters.');
                }
            } else {
                setError(data.error ?? 'Unable to load purchase orders.');
                setPurchaseOrders(MOCK_PURCHASE_ORDERS);
            }
        } catch (err: any) {
            setError(err.message ?? 'Failed to communicate with the purchase orders API.');
            setPurchaseOrders(MOCK_PURCHASE_ORDERS);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, statusFilter]);

    useEffect(() => {
        fetchPurchaseOrders();
    }, [fetchPurchaseOrders]);

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'approved': 'bg-green-100 text-green-800',
            'pending': 'bg-yellow-100 text-yellow-800',
            'received': 'bg-blue-100 text-blue-800',
            'cancelled': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Purchase Orders</h1>
                        <p className="text-gray-600">Manage procurement and orders</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        {/* Search */}
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search purchase orders..."
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
                            <option value="approved">Approved</option>
                            <option value="pending">Pending</option>
                            <option value="received">Received</option>
                            <option value="cancelled">Cancelled</option>
                        </select>

                        {/* New PO Button */}
                        <button
                            type="button"
                            onClick={() => setShowCreateModal(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>New Purchase Order</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Purchase Orders List */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                </div>
            )}

            {loading && (
                <div className="space-y-4 mb-6">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={`po-skeleton-${index}`} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                            <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
                            <div className="space-y-2">
                                <div className="h-3 bg-gray-100 rounded w-full" />
                                <div className="h-3 bg-gray-100 rounded w-2/3" />
                                <div className="h-3 bg-gray-100 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && purchaseOrders.length === 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-600">
                    <p>No purchase orders found. Try adjusting your filters or create a new purchase order.</p>
                </div>
            )}

            <div className="space-y-4">
                {purchaseOrders.map((po) => (
                    <div key={po.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(po.status)}`}>
                                        {po.status}
                                    </span>
                                    <span className="text-2xl font-bold text-gray-900">{formatCurrency((po as any).amount || po.total || 0)}</span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">PO #{po.id}</h3>
                                <p className="text-sm text-gray-600">{(po as any).vendor || po.vendor_name || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-start">
                                <span className="text-sm text-gray-600 mr-2">Project:</span>
                                <p className="text-sm font-medium text-gray-900">{(po as any).project || po.project_name || 'N/A'}</p>
                            </div>
                            <div className="flex items-start">
                                <span className="text-sm text-gray-600 mr-2">Items:</span>
                                <p className="text-sm text-gray-600">{(po as any).items || 'N/A'}</p>
                            </div>

                            <div className="grid grid-cols-3 gap-4 pt-4">
                                <div>
                                    <span className="text-xs text-gray-500">Order Date:</span>
                                    <p className="text-sm font-medium text-gray-900">{po.orderDate}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500">Delivery Date:</span>
                                    <p className="text-sm font-medium text-gray-900">{po.deliveryDate}</p>
                                </div>
                                {po.receivedDate && (
                                    <div>
                                        <span className="text-xs text-gray-500">Received:</span>
                                        <p className="text-sm font-medium text-green-600">{po.receivedDate}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Purchase Order Modal */}
            <CreatePurchaseOrderModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => {
                    setShowCreateModal(false);
                    fetchPurchaseOrders();
                }}
            />
        </div>
    );
};
