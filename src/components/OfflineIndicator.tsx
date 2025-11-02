/**
 * Offline Indicator Component
 * Shows network status and queue sync progress
 */

import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import offlineManager from '../services/offlineManager';

interface OfflineIndicatorProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showWhenOnline?: boolean;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  position = 'bottom-right',
  showWhenOnline = false
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueLength, setQueueLength] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<{ success: number; failed: number } | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  /**
   * Handle manual sync
   */
  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await offlineManager.syncQueue();
      setLastSync(result);
      setTimeout(() => setLastSync(null), 5000); // Clear after 5 seconds
    } catch (error) {
      console.error('[OfflineIndicator] Sync failed', error);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    // Subscribe to online/offline events
    const unsubscribeOnline = offlineManager.onOnline(() => {
      setIsOnline(true);
      handleSync();
    });

    const unsubscribeOffline = offlineManager.onOffline(() => {
      setIsOnline(false);
      setLastSync(null);
    });

    // Update queue status periodically
    const interval = setInterval(() => {
      const status = offlineManager.getQueueStatus();
      setQueueLength(status.queueLength);
      setSyncing(status.syncInProgress);
    }, 1000);

    // Initial status
    const status = offlineManager.getQueueStatus();
    setQueueLength(status.queueLength);

    // Cleanup
    return () => {
      unsubscribeOnline();
      unsubscribeOffline();
      clearInterval(interval);
    };
  }, []);

  /**
   * Position classes
   */
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  // Don't show if online and showWhenOnline is false and no queue
  if (isOnline && !showWhenOnline && queueLength === 0 && !lastSync) {
    return null;
  }

  return (
    <div
      className={`fixed ${positionClasses[position]} z-50 transition-all duration-300`}
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
    >
      {/* Main indicator */}
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm transition-all duration-300 cursor-pointer ${isOnline
            ? 'bg-green-500/90 text-white'
            : 'bg-red-500/90 text-white'
          }`}
        onClick={() => setShowDetails(!showDetails)}
      >
        {/* Icon */}
        {isOnline ? (
          <Wifi className="w-4 h-4" />
        ) : (
          <WifiOff className="w-4 h-4 animate-pulse" />
        )}

        {/* Status text */}
        <span className="text-sm font-medium">
          {isOnline ? 'Online' : 'Offline'}
        </span>

        {/* Queue badge */}
        {queueLength > 0 && (
          <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-semibold">
            {queueLength}
          </span>
        )}

        {/* Syncing indicator */}
        {syncing && (
          <RefreshCw className="w-4 h-4 animate-spin" />
        )}

        {/* Last sync result */}
        {lastSync && (
          <div className="flex items-center gap-1">
            {lastSync.success > 0 && (
              <span className="flex items-center gap-1 text-xs">
                <CheckCircle className="w-3 h-3" />
                {lastSync.success}
              </span>
            )}
            {lastSync.failed > 0 && (
              <span className="flex items-center gap-1 text-xs">
                <XCircle className="w-3 h-3" />
                {lastSync.failed}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Details panel */}
      {showDetails && (
        <div className="mt-2 bg-white rounded-lg shadow-xl p-4 min-w-[280px] max-w-[320px] border border-slate-200">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900">Network Status</h3>
            {isOnline ? (
              <span className="text-xs text-green-600 font-medium">Connected</span>
            ) : (
              <span className="text-xs text-red-600 font-medium">Disconnected</span>
            )}
          </div>

          {/* Connection status */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
              <span>{isOnline ? 'Internet connection active' : 'No internet connection'}</span>
            </div>

            {!isOnline && (
              <p className="text-xs text-slate-500 pl-4">
                Your requests will be queued and synced automatically when connection is restored.
              </p>
            )}
          </div>

          {/* Queue status */}
          {queueLength > 0 && (
            <div className="border-t border-slate-200 pt-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-900">Queued Requests</span>
                <span className="text-sm font-semibold text-slate-900">{queueLength}</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock className="w-3 h-3" />
                <span>Waiting to sync</span>
              </div>

              {isOnline && !syncing && (
                <button
                  onClick={handleSync}
                  className="mt-2 w-full bg-blue-500 text-white text-xs py-2 px-3 rounded hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3 h-3" />
                  Sync Now
                </button>
              )}

              {syncing && (
                <div className="mt-2 w-full bg-slate-100 text-slate-600 text-xs py-2 px-3 rounded flex items-center justify-center gap-2">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Syncing...
                </div>
              )}
            </div>
          )}

          {/* Last sync result */}
          {lastSync && (
            <div className="border-t border-slate-200 pt-3">
              <div className="text-xs font-medium text-slate-900 mb-2">Last Sync</div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-3 h-3" />
                  <span>{lastSync.success} succeeded</span>
                </div>
                {lastSync.failed > 0 && (
                  <div className="flex items-center gap-1 text-red-600">
                    <XCircle className="w-3 h-3" />
                    <span>{lastSync.failed} failed</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Help text */}
          <div className="border-t border-slate-200 pt-3 mt-3">
            <p className="text-xs text-slate-500">
              {isOnline
                ? 'All systems operational. Your data is syncing in real-time.'
                : 'Work continues offline. Changes will sync automatically when you reconnect.'
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfflineIndicator;
