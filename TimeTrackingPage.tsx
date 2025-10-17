/**
 * Time Tracking Page - Connected to CortexBuild API
 * Version: 1.1.0 GOLDEN
 */

import React, { useState, useEffect } from 'react';
import { CreateTimeEntryModal } from '../modals/CreateTimeEntryModal';

interface TimeEntry {
    id: number;
    project_name?: string;
    description?: string;
    date?: string;
    hours?: number;
    rate?: number;
    amount?: number;
    billable?: boolean;
    category?: string;
    user_name?: string;
}

export const TimeTrackingPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [periodFilter, setPeriodFilter] = useState('this-week');
    const [projectFilter, setProjectFilter] = useState('all');
    const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({ totalHours: 0, revenue: 0, entries: 0 });
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        fetchTimeEntries();
    }, [searchQuery, periodFilter, projectFilter]);

    const fetchTimeEntries = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({ page: '1', limit: '100' });
            if (projectFilter !== 'all') params.append('project_id', projectFilter);

            const response = await fetch(`/api/time-entries?${params}`);
            const data = await response.json();

            if (data.success) {
                setTimeEntries(data.data);
                const total = data.data.reduce((sum: number, e: TimeEntry) => sum + (e.hours || 0), 0);
                const rev = data.data.reduce((sum: number, e: TimeEntry) => sum + (e.amount || 0), 0);
                setStats({ totalHours: total, revenue: rev, entries: data.data.length });
            } else {
                setError(data.error);
            }
        } catch (err: any) {
            setError(err.message);
            setTimeEntries(mockTimeEntries);
        } finally {
            setLoading(false);
        }
    };

    const mockTimeEntries: TimeEntry[] = [
        {
            id: '1',
            project: 'Manufacturing Facility Expansion',
            description: '',
            date: 'Oct 7, 2025',
            hours: 16,
            rate: 0,
            amount: 0,
            billable: true,
            category: 'labor',
            employee: 'Adrian Stanca'
        }
    ];

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
                            <p className="text-3xl font-bold text-gray-900">{stats.totalHours}h</p>
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
                            <p className="text-3xl font-bold text-gray-900">£{stats.revenue.toFixed(2)}</p>
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
                    <option value="downtown">Downtown Office Complex</option>
                    <option value="riverside">Riverside Luxury Apartments</option>
                    <option value="manufacturing">Manufacturing Facility Expansion</option>
                </select>
            </div>

            {/* Time Entries List */}
            <div className="space-y-4">
                {timeEntries.map((entry) => (
                    <div key={entry.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                    <h4 className="font-semibold text-gray-900">{entry.project}</h4>
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
                                    <span>{entry.date}</span>
                                    <span>•</span>
                                    <span className="font-semibold">{entry.hours}h</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-gray-900">£{entry.amount.toFixed(2)}</p>
                                <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                    {entry.category}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Time Entry Modal */}
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

