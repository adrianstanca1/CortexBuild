/**
 * Subcontractors Page - Connected to CortexBuild API
 * Version: 1.1.0 GOLDEN
 */

import React, { useState, useEffect } from 'react';
import { CreateSubcontractorModal } from '../modals/CreateSubcontractorModal';

interface Subcontractor {
    id: number;
    name: string;
    trade?: string;
    contact_name?: string;
    email?: string;
    phone?: string;
    license_number?: string;
    status: string;
    rating?: number;
    projects?: number;
}

export const SubcontractorsPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [tradeFilter, setTradeFilter] = useState('all');
    const [activeTab, setActiveTab] = useState<'directory' | 'assignments'>('directory');
    const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        fetchSubcontractors();
    }, [searchQuery, tradeFilter]);

    const fetchSubcontractors = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({ page: '1', limit: '50' });
            if (searchQuery) params.append('search', searchQuery);
            if (tradeFilter !== 'all') params.append('trade', tradeFilter);

            const response = await fetch(`/api/subcontractors?${params}`);
            const data = await response.json();

            if (data.success) {
                setSubcontractors(data.data);
            } else {
                setError(data.error);
            }
        } catch (err: any) {
            setError(err.message);
            setSubcontractors(mockSubcontractors);
        } finally {
            setLoading(false);
        }
    };

    const mockSubcontractors: Subcontractor[] = [
        {
            id: '1',
            name: 'Elite Electrical Services',
            trade: 'electrical',
            contact: 'Mike Johnson',
            email: 'mike@eliteelectrical.com',
            phone: '555-0101',
            license: 'EC-12345',
            status: 'active',
            rating: 5,
            projects: 0,
            onTimeRate: 92,
            insuranceExpiring: true
        },
        {
            id: '2',
            name: 'Premier HVAC Inc',
            trade: 'hvac',
            contact: 'David Chen',
            email: 'david@premierhvac.com',
            phone: '555-0103',
            license: 'HV-24680',
            status: 'active',
            rating: 5,
            projects: 0,
            onTimeRate: 88,
            insuranceExpiring: true
        },
        {
            id: '3',
            name: 'ProPlumb Solutions',
            trade: 'plumbing',
            contact: 'Sarah Martinez',
            email: 'sarah@proplumb.com',
            phone: '555-0102',
            license: 'PL-67890',
            status: 'active',
            rating: 5,
            projects: 0,
            onTimeRate: 95,
            insuranceExpiring: true
        }
    ];

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
                ★
            </span>
        ));
    };

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

            {/* Directory Tab */}
            {activeTab === 'directory' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subcontractors.map((sub) => (
                        <div key={sub.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                            {/* Header */}
                            <div className="flex items-start space-x-3 mb-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                                    🔧
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                            {sub.status}
                                        </span>
                                        {sub.insuranceExpiring && (
                                            <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center space-x-1">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                                <span>Insurance Expiring</span>
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">{sub.name}</h3>
                                    <p className="text-sm text-gray-600">{sub.trade}</p>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-2 mb-4">
                                <div className="flex items-center text-sm text-gray-600">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span>{sub.contact}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span>{sub.email}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <span>{sub.phone}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span>License: {sub.license}</span>
                                </div>
                            </div>

                            {/* Rating */}
                            <div className="mb-4">
                                <div className="flex items-center space-x-2 text-sm">
                                    <span className="text-gray-600">Rating:</span>
                                    <div className="flex">{renderStars(sub.rating)}</div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 mb-4">
                                <div>
                                    <span className="text-xs text-gray-500">Projects:</span>
                                    <p className="text-lg font-semibold text-gray-900">{sub.projects}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500">On-time Rate:</span>
                                    <p className="text-lg font-semibold text-gray-900">{sub.onTimeRate}%</p>
                                </div>
                            </div>

                            {/* Action Button */}
                            <button
                                type="button"
                                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span>Assign to Project</span>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Assignments Tab */}
            {activeTab === 'assignments' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                    <p className="text-gray-600">No assignments yet. Assign subcontractors to projects from the Directory tab.</p>
                </div>
            )}

            {/* Create Subcontractor Modal */}
            <CreateSubcontractorModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => {
                    fetchSubcontractors();
                    setShowCreateModal(false);
                }}
            />
        </div>
    );
};

