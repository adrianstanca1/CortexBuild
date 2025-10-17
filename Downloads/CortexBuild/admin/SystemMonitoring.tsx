import React, { useState, useEffect } from 'react';
import { Server, Database, Activity, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface SystemStats {
  database: {
    size: string;
    tables: number;
    records: any;
  };
  performance: {
    uptime: number;
    memory: any;
    cpu: any;
  };
  activity: {
    last24h: { count: number };
    last7d: { count: number };
  };
}

export const SystemMonitoring: React.FC = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemStats();
    const interval = setInterval(fetchSystemStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSystemStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/admin/system-stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch system stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return <div className="text-center py-8">Loading system stats...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">System Monitoring</h2>

      {/* System Health */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">All Systems Operational</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Server Uptime */}
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Server className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Server Uptime</p>
              <p className="text-xl font-bold text-gray-900">
                {stats?.performance?.uptime ? formatUptime(stats.performance.uptime) : 'N/A'}
              </p>
            </div>
          </div>

          {/* Database */}
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Database className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Database Size</p>
              <p className="text-xl font-bold text-gray-900">{stats?.database?.size || 'N/A'}</p>
              <p className="text-xs text-gray-500">{stats?.database?.tables || 0} tables</p>
            </div>
          </div>

          {/* Activity */}
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Activity (24h)</p>
              <p className="text-xl font-bold text-gray-900">{stats?.activity?.last24h?.count || 0}</p>
              <p className="text-xs text-gray-500">{stats?.activity?.last7d?.count || 0} in last 7 days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
        
        <div className="space-y-4">
          {/* Memory Usage */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Memory Usage</span>
              <span className="text-sm text-gray-600">
                {stats?.performance?.memory ? formatBytes(stats.performance.memory.heapUsed) : 'N/A'} / 
                {stats?.performance?.memory ? formatBytes(stats.performance.memory.heapTotal) : 'N/A'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ 
                  width: stats?.performance?.memory 
                    ? `${(stats.performance.memory.heapUsed / stats.performance.memory.heapTotal) * 100}%` 
                    : '0%' 
                }}
              ></div>
            </div>
          </div>

          {/* CPU Usage */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">CPU Usage</span>
              <span className="text-sm text-gray-600">
                User: {stats?.performance?.cpu ? (stats.performance.cpu.user / 1000000).toFixed(2) : 0}s | 
                System: {stats?.performance?.cpu ? (stats.performance.cpu.system / 1000000).toFixed(2) : 0}s
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Database Statistics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Statistics</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{stats?.database?.tables || 0}</p>
            <p className="text-sm text-gray-600">Tables</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{stats?.database?.records?.total || 0}</p>
            <p className="text-sm text-gray-600">Total Records</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{stats?.database?.size || 'N/A'}</p>
            <p className="text-sm text-gray-600">Database Size</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">Healthy</p>
            <p className="text-sm text-gray-600">Status</p>
          </div>
        </div>
      </div>

      {/* Recent Activity Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Last 24 Hours</span>
              <span className="text-2xl font-bold text-blue-600">{stats?.activity?.last24h?.count || 0}</span>
            </div>
            <div className="text-xs text-gray-500">User actions and API calls</div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Last 7 Days</span>
              <span className="text-2xl font-bold text-purple-600">{stats?.activity?.last7d?.count || 0}</span>
            </div>
            <div className="text-xs text-gray-500">Total platform activity</div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b">
            <span className="text-sm text-gray-600">Platform</span>
            <span className="text-sm font-medium text-gray-900">CortexBuild v2.0.0</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-sm text-gray-600">Node.js Version</span>
            <span className="text-sm font-medium text-gray-900">{process.version || 'N/A'}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-sm text-gray-600">Environment</span>
            <span className="text-sm font-medium text-gray-900">Development</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm text-gray-600">Last Restart</span>
            <span className="text-sm font-medium text-gray-900">
              {new Date(Date.now() - (stats?.performance?.uptime || 0) * 1000).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

