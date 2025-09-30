import React, { useState, useEffect } from 'react';
import { connectivityService } from '../../../services/connectivityService';
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  ArrowPathIcon 
} from '@heroicons/react/24/outline';

export const ConnectivityMonitor: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState(
    connectivityService.getConnectionStatus()
  );
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleConnectivityUpdate = (event: CustomEvent) => {
      setConnectionStatus(event.detail);
      
      // Show monitor if there are connection issues
      const hasIssues = Object.values(event.detail).some(status => status === 'disconnected');
      setIsVisible(hasIssues);
    };

    window.addEventListener('connectivity-update', handleConnectivityUpdate);

    return () => {
      window.removeEventListener('connectivity-update', handleConnectivityUpdate);
    };
  }, []);

  const handleReconnect = async () => {
    await connectivityService.forceReconnect();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'disconnected': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return CheckCircleIcon;
      case 'disconnected': return ExclamationCircleIcon;
      default: return ArrowPathIcon;
    }
  };

  if (!isVisible && connectivityService.isFullyConnected()) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200 z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">System Status</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>

      <div className="space-y-2">
        {Object.entries(connectionStatus).map(([service, status]) => {
          const Icon = getStatusIcon(status);
          return (
            <div key={service} className="flex items-center space-x-2">
              <Icon className={`h-4 w-4 ${getStatusColor(status)}`} />
              <span className="text-sm text-gray-700 capitalize">
                {service}
              </span>
              <span className={`text-xs font-medium ${getStatusColor(status)}`}>
                {status}
              </span>
            </div>
          );
        })}
      </div>

      {connectivityService.hasConnectionIssues() && (
        <button
          onClick={handleReconnect}
          className="mt-3 w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
        >
          <ArrowPathIcon className="h-4 w-4" />
          <span>Reconnect</span>
        </button>
      )}
    </div>
  );
};