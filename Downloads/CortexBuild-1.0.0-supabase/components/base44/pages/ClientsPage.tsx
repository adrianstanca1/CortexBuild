/**
 * Clients Page - Connected to CortexBuild API
 * Version: 1.1.0 GOLDEN
 */

import React, { useState, useEffect } from 'react';
import { CreateClientModal } from '../modals/CreateClientModal';
import { EditClientModal } from '../modals/EditClientModal';
import { DeleteConfirmationModal } from '../modals/DeleteConfirmationModal';

interface Client {
    id: number;
    name: string;
    contact_name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    status: string;
    type?: string;
    projects?: number;
    revenue?: number;
}

export const ClientsPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Fetch clients from API
    useEffect(() => {
        fetchClients();
    }, [searchQuery, statusFilter, page]);

    const fetchClients = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20'
            });

            if (searchQuery) params.append('search', searchQuery);
            if (statusFilter !== 'all') params.append('status', statusFilter);

            // Get auth token
            const token = localStorage.getItem('token') || localStorage.getItem('constructai_token');

            const response = await fetch(`/api/clients?${params}`, {
                headers: token ? {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                } : {
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();

            if (data.success) {
                setClients(data.data);
                setTotalPages(data.pagination?.totalPages || 1);
            } else {
                setError(data.error || 'Failed to fetch clients');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch clients');
            // Fallback to mock data on error
            setClients(mockClients);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedClient) return;

        setDeleteLoading(true);
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('constructai_token');

            const response = await fetch(`/api/clients/${selectedClient.id}`, {
                method: 'DELETE',
                headers: token ? {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                } : {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                setShowDeleteModal(false);
                setSelectedClient(null);
                fetchClients();
            } else {
                setError(data.error || 'Failed to delete client');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to delete client');
        } finally {
            setDeleteLoading(false);
        }
    };

    // Mock data as fallback
    const mockClients: Client[] = [
        {
            id: 1,
            name: 'Green Valley Homes',
            contact_name: 'Sarah Johnson',
            email: 'sarah@greenvalley.com',
            phone: '(555) 234-5678',
            address: '',
            status: 'active',
            type: 'residential',
            projects: 2,
            revenue: 420000
        },
        {
            id: 2,
            name: 'Green Valley Homes',
            contact_name: 'Sarah Johnson',
            email: 'sarah@greenvalley.com',
            phone: '555-0456',
            address: '456 Oak Ave, Los Angeles, CA',
            status: 'active',
            type: 'residential',
            projects: 5,
            revenue: 1800000
        },
        {
            id: 3,
            name: 'Industrial Partners LLC',
            contact_name: 'Michael Chen',
            email: 'mchen@industrialp.com',
            phone: '555-0789',
            address: '789 Industrial Blvd, Chicago, IL',
            status: 'active',
            type: 'industrial',
            projects: 2,
            revenue: 3200000
        },
        {
            id: 4,
            name: 'Metro City Council',
            contact_name: 'David Chen',
            email: 'd.chen@metrocity.gov',
            phone: '(555) 345-6789',
            address: '',
            status: 'active',
            type: 'government',
            projects: 1,
            revenue: 1200000
        },
        {
            id: 5,
            name: 'Metro Construction Group',
            contact_name: 'John Anderson',
            email: 'john@metroconstruction.com',
            phone: '555-0123',
            address: '123 Main St, New York, NY',
            status: 'active',
            type: 'commercial',
            projects: 3,
            revenue: 2500000
        },
        {
            id: 6,
            name: 'Sunset Developments',
            contact_name: 'John Martinez',
            email: 'john@sunsetdev.com',
            phone: '(555) 123-4567',
            address: '',
            status: 'active',
            type: 'commercial',
            projects: 3,
            revenue: 850000
        }
    ];

    const formatCurrency = (amount?: number) => {
        if (amount === undefined || amount === null) return '£0';
        return `£${amount.toLocaleString()}`;
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'active': 'bg-green-100 text-green-800',
            'inactive': 'bg-gray-100 text-gray-800',
            'pending': 'bg-yellow-100 text-yellow-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            'residential': 'bg-blue-100 text-blue-800',
            'commercial': 'bg-purple-100 text-purple-800',
            'industrial': 'bg-orange-100 text-orange-800',
            'government': 'bg-indigo-100 text-indigo-800'
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Clients</h1>
                        <p className="text-gray-600">Manage your client relationships</p>
                        {loading && (
                            <p className="text-sm text-blue-600 mt-1">
                                <span className="inline-block animate-spin mr-2">⏳</span>
                                Loading clients...
                            </p>
                        )}
                        {error && (
                            <p className="text-sm text-red-600 mt-1">
                                ⚠️ {error}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center space-x-4">
                        {/* Search */}
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search clients..."
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
                            aria-label="Filter by status"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="pending">Pending</option>
                        </select>

                        {/* Type Filter */}
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            aria-label="Filter by type"
                        >
                            <option value="all">All Types</option>
                            <option value="residential">Residential</option>
                            <option value="commercial">Commercial</option>
                            <option value="industrial">Industrial</option>
                            <option value="government">Government</option>
                        </select>

                        {/* New Client Button */}
                        <button
                            type="button"
                            onClick={() => setShowCreateModal(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>New Client</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Clients Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clients.map((client) => (
                    <div key={client.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        {/* Header */}
                        <div className="mb-4">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(client.status)}`}>
                                        {client.status}
                                    </span>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(client.type)}`}>
                                        {client.type}
                                    </span>
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{client.name}</h3>
                            <p className="text-sm text-gray-600">{client.contact_name}</p>
                        </div>

                        {/* Contact Details */}
                        <div className="space-y-2 mb-4">
                            <div className="flex items-center text-sm text-gray-600">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <a href={`mailto:${client.email}`} className="hover:text-blue-600">
                                    {client.email}
                                </a>
                            </div>

                            <div className="flex items-center text-sm text-gray-600">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <a href={`tel:${client.phone}`} className="hover:text-blue-600">
                                    {client.phone}
                                </a>
                            </div>

                            {client.address && (
                                <div className="flex items-start text-sm text-gray-600">
                                    <svg className="w-4 h-4 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>{client.address}</span>
                                </div>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                            <div>
                                <div className="flex items-center text-xs text-gray-500 mb-1">
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <span>Projects:</span>
                                </div>
                                <p className="text-lg font-semibold text-gray-900">{client.projects}</p>
                            </div>
                            <div>
                                <div className="flex items-center text-xs text-gray-500 mb-1">
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Revenue:</span>
                                </div>
                                <p className="text-lg font-semibold text-gray-900">{formatCurrency(client.revenue)}</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedClient(client);
                                    setShowEditModal(true);
                                }}
                                className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center space-x-1"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <span className="text-sm font-medium">Edit</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedClient(client);
                                    setShowDeleteModal(true);
                                }}
                                className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center space-x-1"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span className="text-sm font-medium">Delete</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Client Modal */}
            <CreateClientModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => {
                    fetchClients();
                    setShowCreateModal(false);
                }}
            />

            {/* Edit Client Modal */}
            <EditClientModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedClient(null);
                }}
                onSuccess={() => {
                    fetchClients();
                    setShowEditModal(false);
                    setSelectedClient(null);
                }}
                client={selectedClient}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedClient(null);
                }}
                onConfirm={handleDelete}
                title="Delete Client"
                message="Are you sure you want to delete this client? This will also remove all associated projects and data."
                itemName={selectedClient?.name}
                loading={deleteLoading}
            />
        </div>
    );
};

