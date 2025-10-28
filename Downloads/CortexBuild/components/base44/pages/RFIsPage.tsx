/**
 * RFIs Page - Connected to CortexBuild API
 * Request for Information management
 * Version: 1.1.0 GOLDEN
 */

import React, { useState, useEffect } from 'react';
import { CreateRFIModal } from '../modals/CreateRFIModal';

interface RFI {
    id: number;
    rfi_number?: string;
    title: string;
    description?: string;
    project_name?: string;
    status: string;
    priority?: string;
    category?: string;
    submitted_to?: string;
    due_date?: string;
    response?: string;
    responded_by?: string;
    response_date?: string;
}

export const RFIsPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [rfis, setRfis] = useState<RFI[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        fetchRFIs();
    }, [searchQuery, statusFilter]);

    const fetchRFIs = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({ page: '1', limit: '50' });
            if (searchQuery) params.append('search', searchQuery);
            if (statusFilter !== 'all') params.append('status', statusFilter);

            const response = await fetch(`/api/rfis?${params}`);
            const data = await response.json();

            if (data.success) {
                setRfis(data.data);
            } else {
                setError(data.error);
            }
        } catch (err: any) {
            setError(err.message);
            setRfis(mockRfis);
        } finally {
            setLoading(false);
        }
    };

    const mockRfis: RFI[] = [
        {
            id: 'RFI-2024-001',
            title: 'Clarification on HVAC Duct Sizing',
            description: 'The mechanical drawings show 14-inch ducts for the main supply, but the specifications call for 16-inch. Which should we follow?',
            project: 'Downtown Office Complex',
            status: 'answered',
            priority: 'high',
            category: 'design',
            submittedTo: 'Engineering Team',
            dueDate: 'Dec 20, 2024',
            response: 'Use 16-inch ducts as specified in the specifications document. The drawings will be updated in the next revision.',
            respondedBy: 'Lead Engineer',
            responseDate: 'Dec 18, 2024',
            overdue: false
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
            dueDate: 'Dec 25, 2024',
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
            dueDate: 'Dec 22, 2024',
            response: null,
            respondedBy: null,
            responseDate: null,
            overdue: true,
            overdueDays: 290
        }
    ];

    const stats = {
        total: 3,
        open: 2,
        overdue: 2,
        answered: 1
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

    const getPriorityColor = (priority: string) => {
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

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total RFIs</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-2xl">
                            📋
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Open</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.open}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-2xl">
                            ○
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Overdue</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.overdue}</p>
                        </div>
                        <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center text-2xl">
                            ⚠️
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Answered</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.answered}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center text-2xl">
                            ✓
                        </div>
                    </div>
                </div>
            </div>

            {/* RFIs List */}
            <div className="space-y-4">
                {rfis.map((rfi) => (
                    <div key={rfi.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(rfi.status)}`}>
                                        <span>{getStatusIcon(rfi.status)}</span>
                                        <span>{rfi.status}</span>
                                    </span>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(rfi.priority)}`}>
                                        {rfi.priority}
                                    </span>
                                    {rfi.overdue && (
                                        <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 flex items-center space-x-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>{rfi.overdueDays}d overdue</span>
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">RFI #{rfi.id}</h3>
                                <p className="text-sm text-gray-600">{rfi.project}</p>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="mb-4">
                            <h4 className="font-semibold text-gray-900 mb-2">{rfi.title}</h4>
                            <p className="text-sm text-gray-600 mb-4">{rfi.description}</p>

                            {/* Details */}
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600">Category: </span>
                                    <span className="font-medium text-gray-900">{rfi.category}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Submitted to: </span>
                                    <span className="font-medium text-gray-900">{rfi.submittedTo}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Due: </span>
                                    <span className="font-medium text-gray-900">{rfi.dueDate}</span>
                                </div>
                            </div>

                            {/* Response */}
                            {rfi.response && (
                                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-sm font-medium text-gray-900 mb-1">Response:</p>
                                    <p className="text-sm text-gray-700 mb-2">{rfi.response}</p>
                                    <p className="text-xs text-gray-500">By {rfi.respondedBy} on {rfi.responseDate}</p>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        {!rfi.response && (
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                    </svg>
                                    <span>Respond</span>
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Create RFI Modal */}
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

