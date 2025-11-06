/**
 * Subcontractors Page - Connected to CortexBuild API
 * Version: 1.1.0 GOLDEN (normalized)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { CreateSubcontractorModal } from '../modals/CreateSubcontractorModal';

interface Subcontractor {
    id: number | string;
    name: string;
    trade?: string;
    company?: string;
    contactName?: string;
    email?: string;
    phone?: string;
    license?: string;
    status: string;
    rating?: number;
    projects?: number;
    onTimeRate?: number;
    insuranceExpires?: string | null;
}

const formatDate = (value?: string | null) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

const normalizeSubcontractor = (raw: any): Subcontractor => {
    const rating = raw.rating ?? raw.performance_rating;
    const onTime = raw.on_time_rate ?? raw.onTimeRate;
    const projects = raw.projects_assigned ?? raw.projects ?? raw.active_projects;

    return {
        id: raw.id ?? raw.subcontractor_id ?? `sub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: raw.name ?? raw.company_name ?? 'Unnamed subcontractor',
        trade: raw.trade ?? raw.specialty,
        company: raw.company_name ?? raw.company,
        contactName: raw.contact_name ?? raw.contact ?? raw.primary_contact,
        email: raw.email,
        phone: raw.phone,
        license: raw.license_number ?? raw.license,
        status: (raw.status ?? 'active').toLowerCase(),
        rating: typeof rating === 'number' ? rating : rating ? Number(rating) : undefined,
        projects: typeof projects === 'number' ? projects : projects ? Number(projects) : undefined,
        onTimeRate: typeof onTime === 'number' ? onTime : onTime ? Number(onTime) : undefined,
        insuranceExpires: formatDate(raw.insurance_expiry ?? raw.insuranceExpires ?? raw.insurance_expiration)
    };
};

const MOCK_SUBCONTRACTORS: Subcontractor[] = [
    {
        id: '1',
        name: 'Elite Electrical Services',
        trade: 'electrical',
        contactName: 'Mike Johnson',
        email: 'mike@eliteelectrical.com',
        phone: '555-0101',
        license: 'EC-12345',
        status: 'active',
        rating: 5,
        projects: 0,
        onTimeRate: 92,
        insuranceExpires: '01 Mar 2025'
    },
    {
        id: '2',
        name: 'Premier HVAC Inc',
        trade: 'hvac',
        contactName: 'David Chen',
        email: 'david@premierhvac.com',
        phone: '555-0103',
        license: 'HV-24680',
        status: 'active',
        rating: 5,
        projects: 0,
        onTimeRate: 88,
        insuranceExpires: '17 Feb 2025'
    },
    {
        id: '3',
        name: 'ProPlumb Solutions',
        trade: 'plumbing',
        contactName: 'Sarah Martinez',
        email: 'sarah@proplumb.com',
        phone: '555-0102',
        license: 'PL-67890',
        status: 'active',
        rating: 5,
        projects: 0,
        onTimeRate: 95,
        insuranceExpires: '09 Jan 2025'
    }
];

export const SubcontractorsPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [tradeFilter, setTradeFilter] = useState('all');
    const [activeTab, setActiveTab] = useState<'directory' | 'assignments'>('directory');
    const [subcontractors, setSubcontractors] = useState<Subcontractor[]>(MOCK_SUBCONTRACTORS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const fetchSubcontractors = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams({ page: '1', limit: '50' });
            if (searchQuery) params.append('search', searchQuery);
            if (tradeFilter !== 'all') params.append('trade', tradeFilter);

            const response = await fetch(`/api/subcontractors?${params}`);
            const data = await response.json();

            if (data.success) {
                const normalized = Array.isArray(data.data) ? data.data.map(normalizeSubcontractor) : [];
                setSubcontractors(normalized.length > 0 ? normalized : MOCK_SUBCONTRACTORS);
                if (!normalized.length) {
                    setError('No subcontractors match the current filters.');
                }
            } else {
                setError(data.error ?? 'Unable to load subcontractors.');
                setSubcontractors(MOCK_SUBCONTRACTORS);
            }
        } catch (err: any) {
            setError(err.message ?? 'Failed to communicate with the subcontractors API.');
            setSubcontractors(MOCK_SUBCONTRACTORS);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, tradeFilter]);

    useEffect(() => {
        fetchSubcontractors();
    }, [fetchSubcontractors]);

    const renderStars = (rating: number | undefined) => {
        const value = Math.max(0, Math.min(5, rating ?? 0));
        return Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={i < value ? 'text-yellow-400' : 'text-gray-300'}>
                ★
            </span>
        ));
    };

    const getStatusBadge = (status: string) => {
        const map: Record<string, string> = {
            'active': 'bg-green-100 text-green-800',
            'inactive': 'bg-gray-100 text-gray-800',
            'pending': 'bg-yellow-100 text-yellow-800',
            'suspended': 'bg-red-100 text-red-800'
        };
        return map[status] || 'bg-gray-100 text-gray-800';
    };

    const filteredSubcontractors = subcontractors.filter(sub => {
        const matchesSearch = !searchQuery ||
            sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (sub.company && sub.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (sub.trade && sub.trade.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesTrade = tradeFilter === 'all' || (sub.trade ?? '').toLowerCase() === tradeFilter;
        return matchesSearch && matchesTrade;
    });

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Subcontractors</h1>
                        <p className="text-gray-600">Manage your subcontractor network</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        {/* Search */}
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search subcontractors..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                            />
                        </div>

                        {/* Trade Filter */}
                        <select
                            value={tradeFilter}
                            onChange={(e) => setTradeFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Trades</option>
                            <option value="electrical">Electrical</option>
                            <option value="hvac">HVAC</option>
                            <option value="plumbing">Plumbing</option>
                            <option value="carpentry">Carpentry</option>
                            <option value="concrete">Concrete</option>
                        </select>

                        {/* Add Button */}
                        <button
                            type="button"
                            onClick={() => setShowCreateModal(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Add Subcontractor</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="mb-6">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8">
                        <button
                            type="button"
                            onClick={() => setActiveTab('directory')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'directory'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Directory
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('assignments')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'assignments'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Assignments
                        </button>
                    </nav>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                </div>
            )}

            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={`sub-skeleton-${index}`} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                            <div className="h-5 bg-gray-200 rounded w-2/3 mb-4" />
                            <div className="space-y-2">
                                <div className="h-3 bg-gray-100 rounded w-full" />
                                <div className="h-3 bg-gray-100 rounded w-3/4" />
                                <div className="h-3 bg-gray-100 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && filteredSubcontractors.length === 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-600">
                    <p>No subcontractors found. Try adjusting your filters or add a new subcontractor.</p>
                </div>
            )}

            {activeTab === 'directory' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSubcontractors.map((sub) => (
                        <div key={sub.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{sub.name}</h3>
                                    <p className="text-sm text-gray-600 capitalize">{sub.trade ?? 'General'}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(sub.status)}`}>
                                    {sub.status}
                                </span>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600">
                                {sub.contactName && (
                                    <div>
                                        <span className="text-gray-500">Contact: </span>
                                        <span className="font-medium text-gray-900">{sub.contactName}</span>
                                    </div>
                                )}
                                {sub.email && (
                                    <div>
                                        <span className="text-gray-500">Email: </span>
                                        <span className="font-medium text-gray-900">{sub.email}</span>
                                    </div>
                                )}
                                {sub.phone && (
                                    <div>
                                        <span className="text-gray-500">Phone: </span>
                                        <span className="font-medium text-gray-900">{sub.phone}</span>
                                    </div>
                                )}
                                {sub.license && (
                                    <div>
                                        <span className="text-gray-500">License: </span>
                                        <span className="font-medium text-gray-900">{sub.license}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 flex items-center justify-between text-sm">
                                <div className="flex items-center space-x-2">
                                    {renderStars(sub.rating)}
                                    <span className="text-gray-500">{sub.rating ?? 0}/5</span>
                                </div>
                                <div className="text-gray-500">
                                    {sub.onTimeRate ? `${sub.onTimeRate}% on-time` : 'On-time rate N/A'}
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                                <span>{sub.projects ? `${sub.projects} active projects` : 'No active projects'}</span>
                                <span>{sub.insuranceExpires ? `Insurance exp. ${sub.insuranceExpires}` : 'Insurance up to date'}</span>
                            </div>

                            <div className="mt-6 flex items-center space-x-2">
                                <button
                                    type="button"
                                    className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                                >
                                    View Profile
                                </button>
                                <button
                                    type="button"
                                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Assign
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'assignments' && (
                <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-600">
                    <p>Assignments view is coming soon. Use the directory to select a subcontractor and assign them to projects.</p>
                </div>
            )}

            <CreateSubcontractorModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => {
                    setShowCreateModal(false);
                    fetchSubcontractors();
                }}
            />
        </div>
    );
};
