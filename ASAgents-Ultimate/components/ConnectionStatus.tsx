/**
 * Connection Status Component
 * Shows real-time connection status to both backends
 */

import React, { useState, useEffect } from 'react';
import { systemHealthService } from '../services/integratedApiService';

interface ConnectionStatus {
  backend: boolean;
  server: boolean;
  lastCheck: Date | null;
}

export const ConnectionStatus: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    backend: false,
    server: false,
    lastCheck: null,
  });
  const [isChecking, setIsChecking] = useState(false);

  const checkConnections = async () => {
    setIsChecking(true);
    try {
      const result = await systemHealthService.checkAll();
      setStatus({
        backend: result.backend,
        server: result.server,
        lastCheck: new Date(),
      });
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnections();
    const interval = setInterval(checkConnections, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (isConnected: boolean) =>
    isConnected ? 'text-green-500' : 'text-red-500';

  const getStatusIcon = (isConnected: boolean) =>
    isConnected ? '✓' : '✗';

  const getStatusText = (isConnected: boolean) =>
    isConnected ? 'Connected' : 'Disconnected';

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">
          System Status
        </h3>
        <button
          onClick={checkConnections}
          disabled={isChecking}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isChecking ? 'Checking...' : 'Refresh'}
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Backend API (Port 3000):</span>
          <span className={`text-sm font-medium ${getStatusColor(status.backend)}`}>
            {getStatusIcon(status.backend)} {getStatusText(status.backend)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Server API (Port 4000):</span>
          <span className={`text-sm font-medium ${getStatusColor(status.server)}`}>
            {getStatusIcon(status.server)} {getStatusText(status.server)}
          </span>
        </div>
      </div>

      {status.lastCheck && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Last checked: {status.lastCheck.toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
};
