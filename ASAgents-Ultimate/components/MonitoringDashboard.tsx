import React, { useState, useEffect } from 'react';
import { healthMonitor, HealthCheckResult } from '../services/healthMonitor';

interface MonitoringDashboardProps {
    refreshInterval?: number;
    showDetails?: boolean;
}

export const MonitoringDashboard: React.FC<MonitoringDashboardProps> = ({
    refreshInterval = 30000,
    showDetails = false
}) => {
    const [healthData, setHealthData] = useState<HealthCheckResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

    const fetchHealthData = async () => {
        try {
            setError(null);
            const data = await healthMonitor.performHealthCheck();
            setHealthData(data);
            setLastUpdate(new Date());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch health data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHealthData();
        const interval = setInterval(fetchHealthData, refreshInterval);
        return () => clearInterval(interval);
    }, [refreshInterval]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy':
            case 'pass':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'degraded':
            case 'warn':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'unhealthy':
            case 'fail':
                return 'text-red-600 bg-red-50 border-red-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const formatUptime = (milliseconds: number) => {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    };

    const formatMemory = (mb: number) => {
        if (mb >= 1024) {
            return `${(mb / 1024).toFixed(1)} GB`;
        }
        return `${mb.toFixed(1)} MB`;
    };

    if (isLoading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-gray-600">Loading health status...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-red-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="font-medium text-red-600">Monitoring Unavailable</span>
                    </div>
                    <button
                        onClick={fetchHealthData}
                        className="text-sm text-red-600 hover:text-red-800 underline"
                    >
                        Retry
                    </button>
                </div>
                <p className="text-red-600 text-sm mt-2">{error}</p>
            </div>
        );
    }

    if (!healthData) return null;

    return (
        <div className="space-y-4">
            {/* Overall Status */}
            <div className={`p-4 rounded-lg border ${getStatusColor(healthData.status)}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${healthData.status === 'healthy' ? 'bg-green-500' :
                                healthData.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}></div>
                        <div>
                            <h3 className="font-semibold capitalize">{healthData.status} System</h3>
                            <p className="text-sm opacity-75">
                                Last updated: {lastUpdate?.toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-medium">v{healthData.version}</div>
                        <div className="text-xs opacity-75">
                            Uptime: {formatUptime(healthData.metrics.uptime)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                    <div className="text-2xl font-bold text-blue-600">
                        {healthData.metrics.responseTime.toFixed(0)}ms
                    </div>
                    <div className="text-sm text-gray-600">Response Time</div>
                </div>

                <div className="bg-white p-4 rounded-lg border">
                    <div className="text-2xl font-bold text-green-600">
                        {healthData.metrics.activeUsers}
                    </div>
                    <div className="text-sm text-gray-600">Active Users</div>
                </div>

                <div className="bg-white p-4 rounded-lg border">
                    <div className="text-2xl font-bold text-purple-600">
                        {healthData.metrics.errorRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Error Rate</div>
                </div>

                {healthData.metrics.memoryUsage && (
                    <div className="bg-white p-4 rounded-lg border">
                        <div className="text-2xl font-bold text-orange-600">
                            {formatMemory(healthData.metrics.memoryUsage)}
                        </div>
                        <div className="text-sm text-gray-600">Memory Usage</div>
                    </div>
                )}
            </div>

            {/* Detailed Health Checks */}
            {showDetails && (
                <div className="bg-white rounded-lg border">
                    <div className="p-4 border-b">
                        <h4 className="font-semibold text-gray-900">System Components</h4>
                    </div>
                    <div className="divide-y">
                        {Object.entries(healthData.checks).map(([component, check]) => (
                            <div key={component} className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-2 h-2 rounded-full ${check.status === 'pass' ? 'bg-green-500' :
                                                check.status === 'warn' ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}></div>
                                        <div>
                                            <h5 className="font-medium capitalize">{component}</h5>
                                            <p className="text-sm text-gray-600">{check.message}</p>
                                        </div>
                                    </div>
                                    <div className="text-right text-sm text-gray-500">
                                        {check.responseTime && (
                                            <div>{check.responseTime.toFixed(2)}ms</div>
                                        )}
                                        <div>{new Date(check.lastChecked).toLocaleTimeString()}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
                <button
                    onClick={fetchHealthData}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    disabled={isLoading}
                >
                    {isLoading ? 'Refreshing...' : 'Refresh Now'}
                </button>

                {healthData.status !== 'healthy' && (
                    <div className="text-sm text-gray-600">
                        Issues detected - check system logs for details
                    </div>
                )}
            </div>
        </div>
    );
};

export default MonitoringDashboard;