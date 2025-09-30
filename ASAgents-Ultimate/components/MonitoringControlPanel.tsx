import React, { useState, useEffect } from 'react';
import { uptimeMonitor, UptimeStats } from '../services/uptimeMonitor';
import { errorTracker, ErrorStats } from '../services/errorTracker';
import { healthMonitor } from '../services/healthMonitor';

interface MonitoringControlPanelProps {
    className?: string;
}

export const MonitoringControlPanel: React.FC<MonitoringControlPanelProps> = ({
    className = ''
}) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'uptime' | 'errors' | 'health'>('overview');
    const [uptimeStats, setUptimeStats] = useState<UptimeStats | null>(null);
    const [errorStats, setErrorStats] = useState<ErrorStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState(30); // seconds

    const fetchAllStats = async () => {
        try {
            setIsLoading(true);
            const [uptime, errors] = await Promise.all([
                Promise.resolve(uptimeMonitor.getStats()),
                Promise.resolve(errorTracker.getErrorStats())
            ]);

            setUptimeStats(uptime);
            setErrorStats(errors);
        } catch (error) {
            console.error('Failed to fetch monitoring stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAllStats();
    }, []);

    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(fetchAllStats, refreshInterval * 1000);
        return () => clearInterval(interval);
    }, [autoRefresh, refreshInterval]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'up':
            case 'healthy':
            case 'pass':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'degraded':
            case 'at_risk':
            case 'warn':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'down':
            case 'unhealthy':
            case 'breached':
            case 'fail':
                return 'text-red-600 bg-red-50 border-red-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'up':
            case 'healthy':
            case 'pass':
                return '🟢';
            case 'degraded':
            case 'at_risk':
            case 'warn':
                return '🟡';
            case 'down':
            case 'unhealthy':
            case 'breached':
            case 'fail':
                return '🔴';
            default:
                return '⚪';
        }
    };

    const renderOverview = () => {
        if (!uptimeStats || !errorStats) return null;

        const sla = uptimeMonitor.getSLA();

        return (
            <div className="space-y-6">
                {/* System Status Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`p-4 rounded-lg border ${getStatusColor(uptimeStats.currentStatus)}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold">System Status</h3>
                                <p className="text-sm capitalize">{uptimeStats.currentStatus}</p>
                            </div>
                            <span className="text-2xl">{getStatusIcon(uptimeStats.currentStatus)}</span>
                        </div>
                    </div>

                    <div className={`p-4 rounded-lg border ${getStatusColor(sla.status)}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold">SLA Status</h3>
                                <p className="text-sm">{sla.current.toFixed(2)}% uptime</p>
                            </div>
                            <span className="text-2xl">{getStatusIcon(sla.status)}</span>
                        </div>
                    </div>

                    <div className={`p-4 rounded-lg border ${errorStats.recentErrors.length > 5 ? 'text-red-600 bg-red-50 border-red-200' : 'text-green-600 bg-green-50 border-green-200'}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold">Error Rate</h3>
                                <p className="text-sm">{errorStats.recentErrors.length} recent errors</p>
                            </div>
                            <span className="text-2xl">{errorStats.recentErrors.length > 5 ? '🚨' : '✅'}</span>
                        </div>
                    </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg border">
                        <div className="text-2xl font-bold text-blue-600">
                            {uptimeStats.uptime.toFixed(2)}%
                        </div>
                        <div className="text-sm text-gray-600">Uptime (24h)</div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                        <div className="text-2xl font-bold text-green-600">
                            {uptimeStats.averageResponseTime.toFixed(0)}ms
                        </div>
                        <div className="text-sm text-gray-600">Avg Response</div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                        <div className="text-2xl font-bold text-purple-600">
                            {errorStats.totalErrors}
                        </div>
                        <div className="text-sm text-gray-600">Total Errors</div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                        <div className="text-2xl font-bold text-orange-600">
                            {errorStats.errorRate.toFixed(1)}/hr
                        </div>
                        <div className="text-sm text-gray-600">Error Rate</div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg border">
                    <div className="p-4 border-b">
                        <h4 className="font-semibold">Recent Activity</h4>
                    </div>
                    <div className="p-4">
                        {errorStats.recentErrors.length > 0 ? (
                            <div className="space-y-2">
                                {errorStats.recentErrors.slice(0, 5).map((error, index) => (
                                    <div key={error.id || index} className="flex items-start space-x-3 p-2 bg-red-50 rounded">
                                        <span className="text-red-500">🚨</span>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-red-800">{error.message}</p>
                                            <p className="text-xs text-red-600">{new Date(error.timestamp).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <span className="text-green-500 text-2xl">✅</span>
                                <p className="text-green-600 font-medium">No recent errors</p>
                                <p className="text-sm text-gray-500">System running smoothly</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderUptimeTab = () => {
        if (!uptimeStats) return null;

        return (
            <div className="space-y-6">
                {/* Uptime Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg border">
                        <div className="text-lg font-bold text-blue-600">
                            {uptimeMonitor.formatUptime(uptimeStats.uptime)}
                        </div>
                        <div className="text-sm text-gray-600">Current Uptime</div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                        <div className="text-lg font-bold text-green-600">
                            {uptimeMonitor.formatUptime(uptimeMonitor.getUptimeForPeriod(24))}
                        </div>
                        <div className="text-sm text-gray-600">24 Hours</div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                        <div className="text-lg font-bold text-purple-600">
                            {uptimeMonitor.formatUptime(uptimeMonitor.getUptimeForPeriod(24 * 7))}
                        </div>
                        <div className="text-sm text-gray-600">7 Days</div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                        <div className="text-lg font-bold text-orange-600">
                            {uptimeMonitor.formatUptime(uptimeMonitor.getUptimeForPeriod(24 * 30))}
                        </div>
                        <div className="text-sm text-gray-600">30 Days</div>
                    </div>
                </div>

                {/* Recent Uptime Records */}
                <div className="bg-white rounded-lg border">
                    <div className="p-4 border-b">
                        <h4 className="font-semibold">Recent Checks ({uptimeStats.totalChecks} total)</h4>
                    </div>
                    <div className="p-4">
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {uptimeStats.uptimeRecords.slice(0, 20).map((record, index) => (
                                <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                                    <div className="flex items-center space-x-3">
                                        <span className={`w-2 h-2 rounded-full ${record.status === 'up' ? 'bg-green-500' :
                                                record.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}></span>
                                        <span className="text-sm font-medium capitalize">{record.status}</span>
                                        {record.error && (
                                            <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                                                {record.error}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm">{record.responseTime?.toFixed(0)}ms</div>
                                        <div className="text-xs text-gray-500">
                                            {new Date(record.timestamp).toLocaleTimeString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderErrorsTab = () => {
        if (!errorStats) return null;

        return (
            <div className="space-y-6">
                {/* Error Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg border">
                        <div className="text-2xl font-bold text-red-600">{errorStats.totalErrors}</div>
                        <div className="text-sm text-gray-600">Total Errors</div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                        <div className="text-2xl font-bold text-orange-600">
                            {errorStats.recentErrors.length}
                        </div>
                        <div className="text-sm text-gray-600">Recent Errors</div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                        <div className="text-2xl font-bold text-purple-600">
                            {errorStats.errorRate.toFixed(1)}/hr
                        </div>
                        <div className="text-sm text-gray-600">Error Rate</div>
                    </div>
                </div>

                {/* Top Errors */}
                <div className="bg-white rounded-lg border">
                    <div className="p-4 border-b">
                        <h4 className="font-semibold">Top Errors</h4>
                    </div>
                    <div className="divide-y">
                        {errorStats.topErrors.slice(0, 10).map((error, index) => (
                            <div key={index} className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{error.message}</p>
                                        <p className="text-sm text-gray-500">
                                            First: {new Date(error.firstSeen).toLocaleString()} •
                                            Last: {new Date(error.lastSeen).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-lg font-bold text-red-600">{error.count}</span>
                                        <p className="text-xs text-gray-500">occurrences</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderHealthTab = () => {
        return (
            <div className="space-y-6">
                {/* Import and render the MonitoringDashboard component */}
                <div className="bg-white rounded-lg border p-4">
                    <h4 className="font-semibold mb-4">System Health Checks</h4>
                    {/* This would import and render the MonitoringDashboard component */}
                    <div className="text-center py-8">
                        <p className="text-gray-500">Health monitoring dashboard will be rendered here</p>
                        <button
                            onClick={() => healthMonitor.performHealthCheck()}
                            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Run Health Check
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (isLoading && !uptimeStats && !errorStats) {
        return (
            <div className={`bg-white rounded-lg border p-8 ${className}`}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading monitoring data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-gray-50 rounded-lg ${className}`}>
            {/* Header */}
            <div className="bg-white border-b p-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Monitoring Control Panel</h2>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <label className="text-sm text-gray-600">Auto-refresh:</label>
                            <input
                                type="checkbox"
                                checked={autoRefresh}
                                onChange={(e) => setAutoRefresh(e.target.checked)}
                                className="rounded"
                            />
                            <select
                                value={refreshInterval}
                                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                                className="text-sm border rounded px-2 py-1"
                                disabled={!autoRefresh}
                            >
                                <option value={10}>10s</option>
                                <option value={30}>30s</option>
                                <option value={60}>1m</option>
                                <option value={300}>5m</option>
                            </select>
                        </div>
                        <button
                            onClick={fetchAllStats}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white border-b">
                <nav className="flex space-x-8 px-4">
                    {[
                        { key: 'overview', label: 'Overview' },
                        { key: 'uptime', label: 'Uptime' },
                        { key: 'errors', label: 'Errors' },
                        { key: 'health', label: 'Health Checks' }
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as any)}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.key
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'uptime' && renderUptimeTab()}
                {activeTab === 'errors' && renderErrorsTab()}
                {activeTab === 'health' && renderHealthTab()}
            </div>
        </div>
    );
};

export default MonitoringControlPanel;