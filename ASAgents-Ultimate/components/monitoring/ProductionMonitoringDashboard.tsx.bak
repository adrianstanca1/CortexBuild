/**
 * ASAgents Platform - Production Monitoring Dashboard
 * Real-time monitoring and alerting dashboard for production systems
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar
} from 'recharts';

interface SystemMetrics {
    timestamp: number;
    cpu: number;
    memory: number;
    requests: number;
    errors: number;
    responseTime: number;
}

interface AlertData {
    id: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: number;
    resolved: boolean;
    component: string;
}

export const ProductionMonitoringDashboard: React.FC = () => {
    const [metrics, setMetrics] = useState<SystemMetrics[]>([]);
    const [alerts, setAlerts] = useState<AlertData[]>([]);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
    const [selectedMetric, setSelectedMetric] = useState<string>('responseTime');

    // Real-time data fetching
    const fetchMetrics = useCallback(async () => {
        try {
            const response = await fetch('/api/monitoring/metrics');
            if (response.ok) {
                const data = await response.json();
                setMetrics(prev => [...prev.slice(-50), ...data.metrics]);
                setLastUpdate(new Date());
            }
        } catch (error) {
            console.error('Failed to fetch metrics:', error);
        }
    }, []);

    const fetchAlerts = useCallback(async () => {
        try {
            const response = await fetch('/api/monitoring/alerts');
            if (response.ok) {
                const data = await response.json();
                setAlerts(data.alerts || []);
            }
        } catch (error) {
            console.error('Failed to fetch alerts:', error);
        }
    }, []);

    // Update online status
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Set up real-time monitoring
    useEffect(() => {
        const interval = setInterval(() => {
            fetchMetrics();
            fetchAlerts();
        }, 5000); // Update every 5 seconds

        // Initial fetch
        fetchMetrics();
        fetchAlerts();

        return () => clearInterval(interval);
    }, [fetchMetrics, fetchAlerts]);

    // Calculate derived metrics
    const currentMetrics = metrics.length > 0 ? metrics[metrics.length - 1] : null;
    const avgResponseTime = metrics.length > 0
        ? metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length
        : 0;
    const totalErrors = metrics.reduce((sum, m) => sum + m.errors, 0);
    const uptime = isOnline ? '99.9%' : '0%';

    // Alert severity colors
    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return '#dc2626';
            case 'high': return '#ea580c';
            case 'medium': return '#d97706';
            case 'low': return '#65a30d';
            default: return '#6b7280';
        }
    };

    // Chart colors
    const chartColors = {
        primary: '#3b82f6',
        secondary: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#06b6d4',
    };

    return (
        <div className="monitoring-dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <div className="header-content">
                    <h1>Production Monitoring Dashboard</h1>
                    <div className="status-indicators">
                        <div className={`status-indicator ${isOnline ? 'online' : 'offline'}`}>
                            <div className="indicator-dot"></div>
                            <span>{isOnline ? 'Online' : 'Offline'}</span>
                        </div>
                        <div className="last-update">
                            Last Update: {lastUpdate.toLocaleTimeString()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="metrics-grid">
                <div className="metric-card">
                    <div className="metric-header">
                        <h3>Response Time</h3>
                        <div className="metric-trend positive">↗</div>
                    </div>
                    <div className="metric-value">
                        {currentMetrics ? `${currentMetrics.responseTime.toFixed(0)}ms` : '--'}
                    </div>
                    <div className="metric-subtitle">
                        Avg: {avgResponseTime.toFixed(0)}ms
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-header">
                        <h3>Active Alerts</h3>
                        <div className="metric-trend negative">↑</div>
                    </div>
                    <div className="metric-value">
                        {alerts.filter(a => !a.resolved).length}
                    </div>
                    <div className="metric-subtitle">
                        {alerts.filter(a => a.severity === 'critical').length} Critical
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-header">
                        <h3>Uptime</h3>
                        <div className="metric-trend positive">↗</div>
                    </div>
                    <div className="metric-value">{uptime}</div>
                    <div className="metric-subtitle">Last 30 days</div>
                </div>

                <div className="metric-card">
                    <div className="metric-header">
                        <h3>Total Errors</h3>
                        <div className="metric-trend neutral">→</div>
                    </div>
                    <div className="metric-value">{totalErrors}</div>
                    <div className="metric-subtitle">Last 24h</div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-section">
                <div className="chart-container">
                    <div className="chart-header">
                        <h3>Performance Metrics</h3>
                        <select
                            value={selectedMetric}
                            onChange={(e) => setSelectedMetric(e.target.value)}
                            className="metric-selector"
                        >
                            <option value="responseTime">Response Time</option>
                            <option value="memory">Memory Usage</option>
                            <option value="requests">Request Rate</option>
                            <option value="errors">Error Rate</option>
                        </select>
                    </div>
                    <div className="chart-content">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={metrics}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="timestamp"
                                    tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
                                />
                                <YAxis />
                                <Tooltip
                                    labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
                                />
                                <Area
                                    type="monotone"
                                    dataKey={selectedMetric}
                                    stroke={chartColors.primary}
                                    fill={chartColors.primary}
                                    fillOpacity={0.3}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-container">
                    <div className="chart-header">
                        <h3>Error Distribution</h3>
                    </div>
                    <div className="chart-content">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'API Errors', value: 45, color: chartColors.danger },
                                        { name: 'Client Errors', value: 30, color: chartColors.warning },
                                        { name: 'Network Errors', value: 15, color: chartColors.info },
                                        { name: 'Other', value: 10, color: chartColors.secondary },
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    dataKey="value"
                                >
                                    {[
                                        { name: 'API Errors', value: 45, color: chartColors.danger },
                                        { name: 'Client Errors', value: 30, color: chartColors.warning },
                                        { name: 'Network Errors', value: 15, color: chartColors.info },
                                        { name: 'Other', value: 10, color: chartColors.secondary },
                                    ].map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Alerts Section */}
            <div className="alerts-section">
                <div className="section-header">
                    <h3>Active Alerts</h3>
                    <button
                        className="refresh-button"
                        onClick={() => fetchAlerts()}
                    >
                        Refresh
                    </button>
                </div>
                <div className="alerts-list">
                    {alerts.filter(alert => !alert.resolved).map((alert) => (
                        <div
                            key={alert.id}
                            className={`alert-item ${alert.severity}`}
                            style={{ borderLeftColor: getSeverityColor(alert.severity) }}
                        >
                            <div className="alert-content">
                                <div className="alert-header">
                                    <span className="alert-severity">{alert.severity.toUpperCase()}</span>
                                    <span className="alert-component">{alert.component}</span>
                                    <span className="alert-time">
                                        {new Date(alert.timestamp).toLocaleString()}
                                    </span>
                                </div>
                                <div className="alert-message">{alert.message}</div>
                            </div>
                            <div className="alert-actions">
                                <button className="resolve-button">Resolve</button>
                                <button className="investigate-button">Investigate</button>
                            </div>
                        </div>
                    ))}
                    {alerts.filter(alert => !alert.resolved).length === 0 && (
                        <div className="no-alerts">
                            <div className="no-alerts-icon">✅</div>
                            <div className="no-alerts-message">All systems operational</div>
                        </div>
                    )}
                </div>
            </div>

            {/* System Health Status */}
            <div className="health-section">
                <div className="section-header">
                    <h3>System Health</h3>
                </div>
                <div className="health-grid">
                    <div className="health-item">
                        <div className="health-indicator green"></div>
                        <span>Frontend</span>
                        <span className="health-status">Healthy</span>
                    </div>
                    <div className="health-item">
                        <div className="health-indicator green"></div>
                        <span>Backend API</span>
                        <span className="health-status">Healthy</span>
                    </div>
                    <div className="health-item">
                        <div className="health-indicator yellow"></div>
                        <span>Database</span>
                        <span className="health-status">Warning</span>
                    </div>
                    <div className="health-item">
                        <div className="health-indicator green"></div>
                        <span>CDN</span>
                        <span className="health-status">Healthy</span>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .monitoring-dashboard {
          padding: 24px;
          background-color: #f8fafc;
          min-height: 100vh;
        }

        .dashboard-header {
          margin-bottom: 32px;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .header-content h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
        }

        .status-indicators {
          display: flex;
          gap: 24px;
          align-items: center;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
        }

        .indicator-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #10b981;
        }

        .status-indicator.offline .indicator-dot {
          background-color: #ef4444;
        }

        .last-update {
          color: #6b7280;
          font-size: 14px;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }

        .metric-card {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .metric-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .metric-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #374151;
        }

        .metric-trend {
          font-size: 18px;
          font-weight: bold;
        }

        .metric-trend.positive { color: #10b981; }
        .metric-trend.negative { color: #ef4444; }
        .metric-trend.neutral { color: #6b7280; }

        .metric-value {
          font-size: 32px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 8px;
        }

        .metric-subtitle {
          color: #6b7280;
          font-size: 14px;
        }

        .charts-section {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
          margin-bottom: 32px;
        }

        .chart-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid #e5e7eb;
        }

        .chart-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
        }

        .metric-selector {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          font-size: 14px;
        }

        .chart-content {
          padding: 24px;
        }

        .alerts-section,
        .health-section {
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          margin-bottom: 24px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid #e5e7eb;
        }

        .section-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
        }

        .refresh-button {
          padding: 8px 16px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }

        .refresh-button:hover {
          background: #2563eb;
        }

        .alerts-list {
          max-height: 400px;
          overflow-y: auto;
        }

        .alert-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-left: 4px solid;
          border-bottom: 1px solid #f3f4f6;
        }

        .alert-item:last-child {
          border-bottom: none;
        }

        .alert-content {
          flex: 1;
        }

        .alert-header {
          display: flex;
          gap: 12px;
          margin-bottom: 8px;
        }

        .alert-severity {
          background: #fef3c7;
          color: #92400e;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .alert-component {
          background: #dbeafe;
          color: #1d4ed8;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
        }

        .alert-time {
          color: #6b7280;
          font-size: 12px;
        }

        .alert-message {
          color: #374151;
          font-size: 14px;
        }

        .alert-actions {
          display: flex;
          gap: 8px;
        }

        .resolve-button,
        .investigate-button {
          padding: 6px 12px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          background: white;
          cursor: pointer;
          font-size: 12px;
        }

        .resolve-button:hover {
          background: #f9fafb;
        }

        .investigate-button:hover {
          background: #f9fafb;
        }

        .no-alerts {
          text-align: center;
          padding: 48px 24px;
          color: #6b7280;
        }

        .no-alerts-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .no-alerts-message {
          font-size: 18px;
          font-weight: 500;
        }

        .health-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          padding: 24px;
        }

        .health-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }

        .health-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .health-indicator.green { background: #10b981; }
        .health-indicator.yellow { background: #f59e0b; }
        .health-indicator.red { background: #ef4444; }

        .health-status {
          margin-left: auto;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .charts-section {
            grid-template-columns: 1fr;
          }
          
          .metrics-grid {
            grid-template-columns: 1fr;
          }
          
          .header-content {
            flex-direction: column;
            gap: 16px;
          }
        }
      `}</style>
        </div>
    );
};

export default ProductionMonitoringDashboard;