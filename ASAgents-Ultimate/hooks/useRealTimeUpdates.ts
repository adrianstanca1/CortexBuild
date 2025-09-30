import { useState, useEffect, useCallback } from 'react';

export interface RealTimeUpdate {
  type: string;
  data: any;
  timestamp: number;
}

export const useRealTimeUpdates = (endpoint?: string) => {
  const [updates, setUpdates] = useState<RealTimeUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const connect = useCallback(() => {
    // Mock connection for now
    setIsConnected(true);
  }, []);

  const disconnect = useCallback(() => {
    setIsConnected(false);
  }, []);

  const sendUpdate = useCallback((update: Partial<RealTimeUpdate>) => {
    const newUpdate: RealTimeUpdate = {
      type: update.type || 'unknown',
      data: update.data || {},
      timestamp: Date.now()
    };
    setUpdates(prev => [...prev, newUpdate]);
  }, []);

  useEffect(() => {
    if (endpoint) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [endpoint, connect, disconnect]);

  return {
    updates,
    isConnected,
    error,
    connect,
    disconnect,
    sendUpdate
  };
};

export default useRealTimeUpdates;
