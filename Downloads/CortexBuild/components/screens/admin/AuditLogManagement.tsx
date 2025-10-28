import React, { useState, useEffect } from 'react';
import { User } from '../../../types';
import * as api from '../../../api';

interface AuditLogManagementProps {
    currentUser: User;
}

const AuditLogManagement: React.FC<AuditLogManagementProps> = ({ currentUser }) => {
    const [auditLogs, setAuditLogs] = useState<api.AuditLogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        action: '',
        resourceType: '',
        userId: '',
        dateFrom: '',
        dateTo: ''
    });

    const logsPerPage = 50;

    useEffect(() => {
        loadAuditLogs();
    }, [currentPage, filters]);

    const loadAuditLogs = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const offset = (currentPage - 1) * logsPerPage;
            const logs = await api.getPlatformAuditLogs(currentUser, logsPerPage, offset);

            // Apply client-side filters
            let filteredLogs = logs;
            if (filters.action) {
                filteredLogs = filteredLogs.filter(log => log.action.toLowerCase().includes(filters.action.toLowerCase()));
            }
            if (filters.resourceType) {
                filteredLogs = filteredLogs.filter(log => log.resourceType.toLowerCase().includes(filters.resourceType.toLowerCase()));
            }
            if (filters.userId) {
                filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
            }
            if (filters.dateFrom) {
                const fromDate = new Date(filters.dateFrom);
                filteredLogs = filteredLogs.filter(log => new Date(log.createdAt) >= fromDate);
            }
            if (filters.dateTo) {
                const toDate = new Date(filters.dateTo);
                toDate.setHours(23, 59, 59, 999);
                filteredLogs = filteredLogs.filter(log => new Date(log.createdAt) <= toDate);
            }

            setAuditLogs(filteredLogs);
            setTotalPages(Math.ceil(filteredLogs.length / logsPerPage));
        } catch (err: any) {
            console.error('Error loading audit logs:', err);
            setError(err.message || 'Failed to load audit logs');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters({...filters, [key]: value});
        setCurrentPage(1); // Reset to first page when filters change
    };

    const clearFilters = () => {
        setFilters({
            action: '',
            resourceType: '',
            userId: '',
            dateFrom: '',
            dateTo: ''
        });
        setCurrentPage(1);
    };

    const getActionColor = (action: string) => {
        if (action.includes('create') || action.includes('add')) return 'text-green-600';
        if (action.includes('update') || action.includes('change')) return 'text-blue-600';
        if (action.includes('delete') || action.includes('remove')) return 'text-red-600';
        if (action.includes('login') || action.includes('access')) return 'text-gray-600';
        return 'text-gray-900';
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const formatChanges = (oldValues: any, newValues: any) => {
        if (!oldValues && !newValues) return 'No changes recorded';

        const changes: string[] = [];

        if (newValues) {
            Object.keys(newValues).forEach(key => {
                const oldVal = oldValues?.[key];
                const newVal = newValues[key];
                if (oldVal !== newVal) {
                    changes.push(`${key}: "${oldVal || 'null'}" → "${newVal}"`);
                }
            });
        }

        return changes.length > 0 ? changes.join(', ') : 'Details not available';
    };

    const paginatedLogs = auditLogs.slice(
        (currentPage - 1) * logsPerPage,
        currentPage * logsPerPage
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Platform Audit Log</h3>
                <div className="text-sm text-gray-600">
                    Total entries: {auditLogs.length}
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="text-red-800">{error}</div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Filters</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Action
                        </label>
                        <input
                            type="text"
                            value={filters.action}
                            onChange={(e) => handleFilterChange('action', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., invitation_sent"
                            title="Action Filter"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Resource Type
                        </label>
                        <input
                            type="text"
                            value={filters.resourceType}
                            onChange={(e) => handleFilterChange('resourceType', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., platform_invitation"
                            title="Resource Type Filter"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            User ID
                        </label>
                        <input
                            type="text"
                            value={filters.userId}
                            onChange={(e) => handleFilterChange('userId', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="User ID"
                            title="User ID Filter"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date From
                        </label>
                        <input
                            type="date"
                            value={filters.dateFrom}
                            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            title="Date From Filter"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date To
                        </label>
                        <input
                            type="date"
                            value={filters.dateTo}
                            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            title="Date To Filter"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={clearFilters}
                            className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Audit Log Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Timestamp
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Action
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Resource
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Details
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedLogs.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                    {auditLogs.length === 0 ? 'No audit logs found.' : 'No logs match the current filters.'}
                                </td>
                            </tr>
                        ) : (
                            paginatedLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatDateTime(log.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {log.userId || 'System'}
                                        </div>
                                        {log.ipAddress && (
                                            <div className="text-xs text-gray-500">
                                                IP: {log.ipAddress}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`text-sm font-medium ${getActionColor(log.action)}`}>
                                            {log.action.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {log.resourceType.replace('_', ' ')}
                                        </div>
                                        {log.resourceId && (
                                            <div className="text-xs text-gray-500">
                                                ID: {log.resourceId}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 max-w-xs truncate">
                                            {formatChanges(log.oldValues, log.newValues)}
                                        </div>
                                        {log.userAgent && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                {log.userAgent.substring(0, 50)}...
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                        Showing {((currentPage - 1) * logsPerPage) + 1} to {Math.min(currentPage * logsPerPage, auditLogs.length)} of {auditLogs.length} entries
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-700">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditLogManagement;