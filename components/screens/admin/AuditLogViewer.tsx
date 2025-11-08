import React, { useState, useEffect } from 'react';
import {
    FileText, Download, Filter, Search, Calendar, User,
    Activity, AlertCircle, CheckCircle, XCircle, Clock,
    ChevronDown, ChevronUp, Eye
} from 'lucide-react';
import { supabase } from '../../../lib/supabase/client';
import toast from 'react-hot-toast';

interface AuditLog {
    id: string;
    timestamp: string;
    user_id: string;
    user_name: string;
    user_email: string;
    action: string;
    resource_type: string;
    resource_id: string;
    details: Record<string, any>;
    ip_address: string;
    user_agent: string;
    status: 'success' | 'failure' | 'warning';
}

interface AuditLogViewerProps {
    compactMode?: boolean;
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ compactMode = false }) => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterUser, setFilterUser] = useState('');
    const [filterAction, setFilterAction] = useState('');
    const [filterDateFrom, setFilterDateFrom] = useState('');
    const [filterDateTo, setFilterDateTo] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [expandedLog, setExpandedLog] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 20;

    useEffect(() => {
        loadAuditLogs();
    }, [currentPage, filterUser, filterAction, filterDateFrom, filterDateTo]);

    const loadAuditLogs = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('audit_logs')
                .select('*', { count: 'exact' })
                .order('timestamp', { ascending: false })
                .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

            if (filterUser) {
                query = query.ilike('user_email', `%${filterUser}%`);
            }

            if (filterAction) {
                query = query.eq('action', filterAction);
            }

            if (filterDateFrom) {
                query = query.gte('timestamp', new Date(filterDateFrom).toISOString());
            }

            if (filterDateTo) {
                query = query.lte('timestamp', new Date(filterDateTo).toISOString());
            }

            const { data, error, count } = await query;

            if (error) throw error;

            if (data) {
                setLogs(data);
                setTotalPages(Math.ceil((count || 0) / itemsPerPage));
            }
        } catch (error) {
            console.error('Error loading audit logs:', error);
            // Generate mock data for demo
            generateMockLogs();
        } finally {
            setLoading(false);
        }
    };

    const generateMockLogs = () => {
        const mockLogs: AuditLog[] = [
            {
                id: '1',
                timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
                user_id: '1',
                user_name: 'Adrian Stanca',
                user_email: 'adrian.stanca1@gmail.com',
                action: 'user.created',
                resource_type: 'user',
                resource_id: '123',
                details: { email: 'newuser@example.com', role: 'developer' },
                ip_address: '192.168.1.1',
                user_agent: 'Mozilla/5.0',
                status: 'success'
            },
            {
                id: '2',
                timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
                user_id: '1',
                user_name: 'Adrian Stanca',
                user_email: 'adrian.stanca1@gmail.com',
                action: 'company.updated',
                resource_type: 'company',
                resource_id: '456',
                details: { name: 'Acme Corp', subscription: 'premium' },
                ip_address: '192.168.1.1',
                user_agent: 'Mozilla/5.0',
                status: 'success'
            },
            {
                id: '3',
                timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                user_id: '2',
                user_name: 'John Doe',
                user_email: 'john@example.com',
                action: 'login.failed',
                resource_type: 'auth',
                resource_id: 'auth-001',
                details: { reason: 'Invalid password', attempts: 3 },
                ip_address: '10.0.0.5',
                user_agent: 'Chrome/120.0',
                status: 'failure'
            },
            {
                id: '4',
                timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
                user_id: '1',
                user_name: 'Adrian Stanca',
                user_email: 'adrian.stanca1@gmail.com',
                action: 'settings.updated',
                resource_type: 'platform',
                resource_id: 'platform-config',
                details: { setting: 'maintenanceMode', value: false },
                ip_address: '192.168.1.1',
                user_agent: 'Mozilla/5.0',
                status: 'success'
            },
            {
                id: '5',
                timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
                user_id: '3',
                user_name: 'Jane Smith',
                user_email: 'jane@example.com',
                action: 'api_key.generated',
                resource_type: 'api_key',
                resource_id: 'key-789',
                details: { permissions: ['read', 'write'] },
                ip_address: '172.16.0.10',
                user_agent: 'PostmanRuntime/7.32',
                status: 'success'
            }
        ];

        setLogs(mockLogs);
        setTotalPages(1);
    };

    const exportToCSV = () => {
        const csvData = [
            ['Timestamp', 'User', 'Email', 'Action', 'Resource Type', 'Resource ID', 'Status', 'IP Address'],
            ...logs.map(log => [
                new Date(log.timestamp).toLocaleString(),
                log.user_name,
                log.user_email,
                log.action,
                log.resource_type,
                log.resource_id,
                log.status,
                log.ip_address
            ])
        ];

        const csvContent = csvData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success('Audit logs exported to CSV');
    };

    const getStatusIcon = (status: AuditLog['status']) => {
        switch (status) {
            case 'success':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'failure':
                return <XCircle className="w-4 h-4 text-red-600" />;
            case 'warning':
                return <AlertCircle className="w-4 h-4 text-yellow-600" />;
        }
    };

    const getStatusColor = (status: AuditLog['status']) => {
        switch (status) {
            case 'success':
                return 'bg-green-50 text-green-700';
            case 'failure':
                return 'bg-red-50 text-red-700';
            case 'warning':
                return 'bg-yellow-50 text-yellow-700';
        }
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredLogs = logs.filter(log =>
        searchQuery === '' ||
        log.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.resource_type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Audit Log</h3>
                        <p className="text-sm text-gray-500 mt-1">Complete audit trail of all platform activities</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setShowFilters(!showFilters)}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                        >
                            <Filter className="w-4 h-4" />
                            Filters
                            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        <button
                            type="button"
                            onClick={exportToCSV}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Export CSV
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search logs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Filters */}
                {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
                        <div>
                            <label className="block text-xs text-gray-600 mb-1">User</label>
                            <input
                                type="text"
                                placeholder="Filter by user..."
                                value={filterUser}
                                onChange={(e) => setFilterUser(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-600 mb-1">Action</label>
                            <select
                                value={filterAction}
                                onChange={(e) => setFilterAction(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                aria-label="Action filter"
                                title="Filter by action type"
                            >
                                <option value="">All actions</option>
                                <option value="user.created">User Created</option>
                                <option value="user.updated">User Updated</option>
                                <option value="user.deleted">User Deleted</option>
                                <option value="company.created">Company Created</option>
                                <option value="company.updated">Company Updated</option>
                                <option value="login.success">Login Success</option>
                                <option value="login.failed">Login Failed</option>
                                <option value="settings.updated">Settings Updated</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-600 mb-1">From Date</label>
                            <input
                                type="date"
                                value={filterDateFrom}
                                onChange={(e) => setFilterDateFrom(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                aria-label="From date"
                                title="Filter from date"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-600 mb-1">To Date</label>
                            <input
                                type="date"
                                value={filterDateTo}
                                onChange={(e) => setFilterDateTo(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                aria-label="To date"
                                title="Filter to date"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="text-center py-12">
                        <Activity className="w-12 h-12 mx-auto mb-3 text-gray-400 animate-spin" />
                        <p className="text-sm text-gray-500">Loading audit logs...</p>
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-sm text-gray-500">No audit logs found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
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
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        IP Address
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredLogs.map((log) => (
                                    <React.Fragment key={log.id}>
                                        <tr className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-sm text-gray-900">
                                                    <Clock className="w-4 h-4 text-gray-400" />
                                                    {formatTimestamp(log.timestamp)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-gray-400" />
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{log.user_name}</div>
                                                        <div className="text-xs text-gray-500">{log.user_email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-900 font-mono">{log.action}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{log.resource_type}</div>
                                                <div className="text-xs text-gray-500">{log.resource_id}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                                                    {getStatusIcon(log.status)}
                                                    {log.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                                {log.ip_address}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <button
                                                    type="button"
                                                    onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                                                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    Details
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedLog === log.id && (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-4 bg-gray-50">
                                                    <div className="space-y-2">
                                                        <div>
                                                            <span className="text-xs font-semibold text-gray-700">User Agent:</span>
                                                            <p className="text-xs text-gray-600 mt-1">{log.user_agent}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-xs font-semibold text-gray-700">Details:</span>
                                                            <pre className="text-xs text-gray-600 mt-1 bg-white p-2 rounded border border-gray-200 overflow-x-auto">
                                                                {JSON.stringify(log.details, null, 2)}
                                                            </pre>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {!loading && filteredLogs.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of {filteredLogs.length} logs
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-gray-700">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                type="button"
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuditLogViewer;

