/**
 * Purchase Orders Page - Connected to CortexBuild API
 * Version: 1.1.0 GOLDEN
 */

import React, { useState, useEffect } from 'react';
import { CreatePurchaseOrderModal } from '../modals/CreatePurchaseOrderModal';

interface PurchaseOrder {
    id: number;
    po_number?: string;
    vendor_name?: string;
    project_name?: string;
    total?: number;
    status: string;
    order_date?: string;
    delivery_date?: string;
}

export const PurchaseOrdersPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        fetchPurchaseOrders();
    }, [searchQuery, statusFilter]);

    const fetchPurchaseOrders = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({ page: '1', limit: '50' });
            if (searchQuery) params.append('search', searchQuery);
            if (statusFilter !== 'all') params.append('status', statusFilter);

            const response = await fetch(`/api/purchase-orders?${params}`);
            const data = await response.json();

            if (data.success) {
                setPurchaseOrders(data.data);
            } else {
                setError(data.error);
            }
        } catch (err: any) {
            setError(err.message);
            setPurchaseOrders(mockPurchaseOrders);
        } finally {
            setLoading(false);
        }
    };

    const mockPurchaseOrders: PurchaseOrder[] = [
        {
            id: 'PO-2024-001',
            vendor: 'ABC Supplies Inc',
            project: 'Downtown Office Complex',
            items: 'Steel beams, concrete mix',
            amount: 45000,
            status: 'approved',
            orderDate: 'Dec 1, 2024',
            deliveryDate: 'Dec 15, 2024',
            receivedDate: null
        },
        {
            id: 'PO-2024-002',
            vendor: 'BuildMart Wholesale',
            project: 'Riverside Luxury Apartments',
            items: 'Lumber, drywall, insulation',
            amount: 32500,
            status: 'pending',
            orderDate: 'Dec 5, 2024',
            deliveryDate: 'Dec 20, 2024',
            receivedDate: null
        }
    ];

    const formatCurrency = (amount?: number) => {
        if (amount === undefined || amount === null) return '£0.00';
        return `£${amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

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
            <div className="space-y-4">
                {purchaseOrders.map((po) => (
                    <div key={po.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(po.status)}`}>
                                        {po.status}
                                    </span>
                                    <span className="text-2xl font-bold text-gray-900">{formatCurrency(po.amount)}</span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">PO #{po.id}</h3>
                                <p className="text-sm text-gray-600">{po.vendor}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-start">
                                <span className="text-sm text-gray-600 mr-2">Project:</span>
                                <p className="text-sm font-medium text-gray-900">{po.project}</p>
                            </div>
                            <div className="flex items-start">
                                <span className="text-sm text-gray-600 mr-2">Items:</span>
                                <p className="text-sm text-gray-600">{po.items}</p>
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

