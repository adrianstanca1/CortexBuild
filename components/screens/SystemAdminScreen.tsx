import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { integrationService } from '../../services/integrationService';
import { performanceService } from '../../services/performanceService';
import { securityService } from '../../services/securityService';
import { realTimeService } from '../../services/realTimeService';

interface SystemAdminScreenProps {
  currentUser: User;
  onNavigate: (screen: string, params?: any) => void;
}

const SystemAdminScreen: React.FC<SystemAdminScreenProps> = ({ currentUser, onNavigate }) => {
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [securityMetrics, setSecurityMetrics] = useState<any>(null);
  const [realTimeStatus, setRealTimeStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'security' | 'realtime' | 'integration'>('overview');

  useEffect(() => {
    loadSystemData();
  }, []);

  const loadSystemData = async () => {
    try {
      setLoading(true);
      
      // Load system status
      const status = await integrationService.getSystemStatus();
      setSystemStatus(status);

      // Load performance metrics
      const perfScore = await performanceService.getPerformanceScore();
      const latestMetrics = await performanceService.getLatestMetrics();
      setPerformanceMetrics({ score: perfScore, metrics: latestMetrics });

      // Load security metrics
      const secMetrics = await securityService.getSecurityMetrics({
        start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString()
      });
      setSecurityMetrics(secMetrics);

      // Load real-time status
      const rtStatus = realTimeService.getConnectionStatus();
      setRealTimeStatus(rtStatus);

    } catch (error) {
      console.error('Error loading system data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'good':
      case 'online':
        return 'text-green-600 bg-green-100';
      case 'degraded':
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'down':
      case 'critical':
      case 'offline':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatUptime = (uptime: number) => {
    return `${uptime.toFixed(2)}%`;
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Administration</h1>
          <p className="text-gray-600 mt-1">Monitor and manage platform infrastructure</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={loadSystemData}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Refresh Data
          </button>
          <button
            onClick={() => onNavigate('system-backup')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Backup
          </button>
        </div>
      </div>

      {/* System Status Overview */}
      {systemStatus && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Overall Status</div>
                <div className={`text-lg font-bold px-2 py-1 rounded ${getStatusColor(systemStatus.overall)}`}>
                  {systemStatus.overall.toUpperCase()}
                </div>
              </div>
              <div className="text-2xl">🖥️</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Active Users</div>
                <div className="text-2xl font-bold text-blue-600">{systemStatus.activeUsers}</div>
              </div>
              <div className="text-2xl">👥</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">System Load</div>
                <div className="text-2xl font-bold text-orange-600">{systemStatus.systemLoad.toFixed(1)}%</div>
              </div>
              <div className="text-2xl">⚡</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Memory Usage</div>
                <div className="text-2xl font-bold text-purple-600">{systemStatus.memoryUsage.toFixed(1)}%</div>
              </div>
              <div className="text-2xl">💾</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: '📊' },
            { id: 'performance', name: 'Performance', icon: '⚡' },
            { id: 'security', name: 'Security', icon: '🔒' },
            { id: 'realtime', name: 'Real-time', icon: '🔄' },
            { id: 'integration', name: 'Integrations', icon: '🔗' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon} {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && systemStatus && (
        <div className="space-y-6">
          {/* Service Health */}
          <div className="bg-white rounded-lg shadow border p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Service Health</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {systemStatus.services.map((service: any) => (
                <div key={service.serviceName} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">{service.serviceName}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                      {service.status}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>Response: {service.responseTime}ms</div>
                    <div>Uptime: {formatUptime(service.uptime)}</div>
                    <div>Errors: {service.errorCount}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow border p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => onNavigate('system-backup')}
                className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-center"
              >
                <div className="text-2xl mb-2">💾</div>
                <div className="text-sm font-medium">Create Backup</div>
              </button>
              
              <button
                onClick={() => onNavigate('system-logs')}
                className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-center"
              >
                <div className="text-2xl mb-2">📋</div>
                <div className="text-sm font-medium">View Logs</div>
              </button>
              
              <button
                onClick={() => onNavigate('user-management')}
                className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-center"
              >
                <div className="text-2xl mb-2">👥</div>
                <div className="text-sm font-medium">Manage Users</div>
              </button>
              
              <button
                onClick={() => onNavigate('system-settings')}
                className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-center"
              >
                <div className="text-2xl mb-2">⚙️</div>
                <div className="text-sm font-medium">System Settings</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && performanceMetrics && (
        <div className="space-y-6">
          {/* Performance Scores */}
          <div className="bg-white rounded-lg shadow border p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Performance Scores</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(performanceMetrics.score).map(([category, score]: [string, any]) => (
                <div key={category} className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{score.toFixed(1)}</div>
                  <div className="text-sm text-gray-600 capitalize">{category}</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full ${
                        score >= 90 ? 'bg-green-500' :
                        score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Latest Metrics */}
          <div className="bg-white rounded-lg shadow border p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Latest Performance Metrics</h2>
            <div className="space-y-4">
              {performanceMetrics.metrics.slice(0, 10).map((metric: any) => (
                <div key={metric.id} className="flex justify-between items-center p-3 border border-gray-200 rounded">
                  <div>
                    <div className="font-medium text-gray-900">{metric.name}</div>
                    <div className="text-sm text-gray-600">{metric.category}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{metric.value.toFixed(1)} {metric.unit}</div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                      {metric.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && securityMetrics && (
        <div className="space-y-6">
          {/* Security Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="text-2xl font-bold text-red-600">{securityMetrics.events.total}</div>
              <div className="text-sm text-gray-600">Security Events</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="text-2xl font-bold text-green-600">{securityMetrics.events.resolved}</div>
              <div className="text-sm text-gray-600">Resolved Events</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="text-2xl font-bold text-blue-600">{securityMetrics.compliance.overallScore.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Compliance Score</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="text-2xl font-bold text-orange-600">{securityMetrics.vulnerabilities.total}</div>
              <div className="text-sm text-gray-600">Vulnerabilities</div>
            </div>
          </div>

          {/* Security Events by Type */}
          <div className="bg-white rounded-lg shadow border p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Security Events by Type</h2>
            <div className="space-y-3">
              {Object.entries(securityMetrics.events.byType).map(([type, count]: [string, any]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="capitalize text-gray-700">{type.replace('_', ' ')}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance Status */}
          <div className="bg-white rounded-lg shadow border p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Compliance Status</h2>
            <div className="space-y-3">
              {Object.entries(securityMetrics.compliance.byFramework).map(([framework, score]: [string, any]) => (
                <div key={framework} className="flex justify-between items-center">
                  <span className="text-gray-700">{framework}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{score.toFixed(1)}%</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          score >= 90 ? 'bg-green-500' :
                          score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${score}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Real-time Tab */}
      {activeTab === 'realtime' && realTimeStatus && (
        <div className="space-y-6">
          {/* Connection Status */}
          <div className="bg-white rounded-lg shadow border p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Real-time Connection Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${realTimeStatus.connected ? 'text-green-600' : 'text-red-600'}`}>
                  {realTimeStatus.connected ? 'CONNECTED' : 'DISCONNECTED'}
                </div>
                <div className="text-sm text-gray-600">WebSocket Status</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{realTimeStatus.reconnectAttempts}</div>
                <div className="text-sm text-gray-600">Reconnect Attempts</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {realTimeStatus.lastHeartbeat ? new Date(realTimeStatus.lastHeartbeat).toLocaleTimeString() : 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Last Heartbeat</div>
              </div>
            </div>
          </div>

          {/* Real-time Features */}
          <div className="bg-white rounded-lg shadow border p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Real-time Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Live Chat</h3>
                <div className="text-sm text-gray-600">
                  Real-time messaging and collaboration
                </div>
                <div className="mt-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Live Collaboration</h3>
                <div className="text-sm text-gray-600">
                  Real-time document and drawing collaboration
                </div>
                <div className="mt-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Presence Tracking</h3>
                <div className="text-sm text-gray-600">
                  User online status and location tracking
                </div>
                <div className="mt-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Live Notifications</h3>
                <div className="text-sm text-gray-600">
                  Real-time push notifications
                </div>
                <div className="mt-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Integration Tab */}
      {activeTab === 'integration' && (
        <div className="space-y-6">
          {/* Integration Status */}
          <div className="bg-white rounded-lg shadow border p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Integration Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Webhook Integrations</h3>
                <div className="text-sm text-gray-600 mb-2">
                  External system integrations via webhooks
                </div>
                <div className="flex justify-between items-center">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>
                  <button
                    onClick={() => onNavigate('webhook-management')}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Manage
                  </button>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">API Access</h3>
                <div className="text-sm text-gray-600 mb-2">
                  RESTful API for third-party integrations
                </div>
                <div className="flex justify-between items-center">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>
                  <button
                    onClick={() => onNavigate('api-management')}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Manage
                  </button>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Data Synchronization</h3>
                <div className="text-sm text-gray-600 mb-2">
                  Automated data sync across services
                </div>
                <div className="flex justify-between items-center">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>
                  <button
                    onClick={() => onNavigate('sync-management')}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Manage
                  </button>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Event Processing</h3>
                <div className="text-sm text-gray-600 mb-2">
                  Real-time event processing and routing
                </div>
                <div className="flex justify-between items-center">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>
                  <button
                    onClick={() => onNavigate('event-management')}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Manage
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* System Actions */}
          <div className="bg-white rounded-lg shadow border p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">System Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => integrationService.syncAllData()}
                className="p-4 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50"
              >
                <div className="text-2xl mb-2">🔄</div>
                <div className="text-sm font-medium">Sync All Data</div>
              </button>
              
              <button
                onClick={() => integrationService.createSystemBackup()}
                className="p-4 border border-green-300 text-green-600 rounded-lg hover:bg-green-50"
              >
                <div className="text-2xl mb-2">💾</div>
                <div className="text-sm font-medium">Create Backup</div>
              </button>
              
              <button
                onClick={() => onNavigate('system-health')}
                className="p-4 border border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50"
              >
                <div className="text-2xl mb-2">🏥</div>
                <div className="text-sm font-medium">Health Check</div>
              </button>
              
              <button
                onClick={() => onNavigate('system-maintenance')}
                className="p-4 border border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50"
              >
                <div className="text-2xl mb-2">🔧</div>
                <div className="text-sm font-medium">Maintenance</div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemAdminScreen;
