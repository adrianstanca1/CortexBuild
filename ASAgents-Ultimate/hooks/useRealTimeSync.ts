import { useState, useEffect, useCallback, useRef } from 'react';
import { websocketService } from '../services/websocketService';
import { apiClient } from '../services/apiClient';
import { performanceMonitor } from '../utils/performance';

export interface SyncOptions {
  endpoint: string;
  syncInterval?: number;
  enableOptimisticUpdates?: boolean;
  enableConflictResolution?: boolean;
  retryAttempts?: number;
  cacheKey?: string;
  filters?: Record<string, any>;
  transform?: (data: any) => any;
}

export interface SyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastSync: Date | null;
  isConnected: boolean;
  pendingUpdates: number;
  conflicts: Array<{
    id: string;
    localData: any;
    serverData: any;
    timestamp: Date;
  }>;
}

export interface SyncActions<T> {
  refresh: () => Promise<void>;
  update: (id: string, data: Partial<T>) => Promise<void>;
  create: (data: Omit<T, 'id'>) => Promise<void>;
  delete: (id: string) => Promise<void>;
  resolveConflict: (conflictId: string, resolution: 'local' | 'server' | 'merge', mergedData?: any) => void;
  clearError: () => void;
  forceSync: () => Promise<void>;
}

export function useRealTimeSync<T extends { id: string; updatedAt?: string }>(
  options: SyncOptions
): [SyncState<T[]>, SyncActions<T>] {
  const {
    endpoint,
    syncInterval = 30000,
    enableOptimisticUpdates = true,
    enableConflictResolution = true,
    retryAttempts = 3,
    cacheKey,
    filters = {},
    transform,
  } = options;

  const [state, setState] = useState<SyncState<T[]>>({
    data: null,
    loading: true,
    error: null,
    lastSync: null,
    isConnected: false,
    pendingUpdates: 0,
    conflicts: [],
  });

  const pendingOperations = useRef<Map<string, { type: string; data: any; timestamp: Date }>>(new Map());
  const syncTimer = useRef<NodeJS.Timeout | null>(null);
  const lastSyncVersion = useRef<string | null>(null);

  // Initialize data
  const fetchData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setState(prev => ({ ...prev, loading: true, error: null }));
      }

      const response = await apiClient.get(endpoint, filters, {
        cache: !!cacheKey,
        cacheKey,
      });

      if (response.success) {
        let data = response.data;
        if (transform) {
          data = transform(data);
        }

        setState(prev => ({
          ...prev,
          data,
          loading: false,
          error: null,
          lastSync: new Date(),
        }));

        // Store sync version for conflict detection
        lastSyncVersion.current = response.meta?.version || Date.now().toString();

        // Record sync metric
        performanceMonitor.recordMetric({
          name: `sync_${endpoint.replace(/\//g, '_')}_success`,
          value: 1,
          timestamp: Date.now(),
          type: 'counter',
        });
      } else {
        throw new Error(response.message || 'Failed to fetch data');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));

      // Record error metric
      performanceMonitor.recordMetric({
        name: `sync_${endpoint.replace(/\//g, '_')}_error`,
        value: 1,
        timestamp: Date.now(),
        type: 'counter',
        tags: { error: errorMessage },
      });
    }
  }, [endpoint, filters, cacheKey, transform]);

  // Handle real-time updates
  const handleRealTimeUpdate = useCallback((data: any) => {
    const { type, entityType, entityId, data: updateData } = data;

    // Check if this update is relevant to our endpoint
    if (!endpoint.includes(entityType)) return;

    setState(prev => {
      if (!prev.data) return prev;

      let newData = [...prev.data];

      switch (type) {
        case 'created':
          // Add new item if not already present
          if (!newData.find(item => item.id === entityId)) {
            newData.push({ id: entityId, ...updateData } as T);
          }
          break;

        case 'updated':
          // Update existing item
          const updateIndex = newData.findIndex(item => item.id === entityId);
          if (updateIndex !== -1) {
            // Check for conflicts if optimistic updates are enabled
            const pendingOp = pendingOperations.current.get(entityId);
            if (enableConflictResolution && pendingOp && updateData.updatedAt) {
              const serverTime = new Date(updateData.updatedAt);
              const localTime = pendingOp.timestamp;
              
              if (serverTime < localTime) {
                // Conflict detected - server data is older than local changes
                const conflict = {
                  id: `${entityId}_${Date.now()}`,
                  localData: pendingOp.data,
                  serverData: updateData,
                  timestamp: new Date(),
                };
                
                return {
                  ...prev,
                  conflicts: [...prev.conflicts, conflict],
                };
              }
            }

            newData[updateIndex] = { ...newData[updateIndex], ...updateData };
          }
          break;

        case 'deleted':
          // Remove item
          newData = newData.filter(item => item.id !== entityId);
          break;
      }

      return {
        ...prev,
        data: newData,
        lastSync: new Date(),
      };
    });
  }, [endpoint, enableConflictResolution]);

  // Optimistic update helper
  const applyOptimisticUpdate = useCallback((id: string, updateData: Partial<T>, operation: 'update' | 'create' | 'delete') => {
    if (!enableOptimisticUpdates) return;

    setState(prev => {
      if (!prev.data) return prev;

      let newData = [...prev.data];

      switch (operation) {
        case 'create':
          newData.push({ id, ...updateData } as T);
          break;
        case 'update':
          const index = newData.findIndex(item => item.id === id);
          if (index !== -1) {
            newData[index] = { ...newData[index], ...updateData };
          }
          break;
        case 'delete':
          newData = newData.filter(item => item.id !== id);
          break;
      }

      return {
        ...prev,
        data: newData,
        pendingUpdates: prev.pendingUpdates + 1,
      };
    });

    // Track pending operation
    pendingOperations.current.set(id, {
      type: operation,
      data: updateData,
      timestamp: new Date(),
    });
  }, [enableOptimisticUpdates]);

  // Actions
  const refresh = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  const update = useCallback(async (id: string, updateData: Partial<T>) => {
    try {
      // Apply optimistic update
      applyOptimisticUpdate(id, updateData, 'update');

      const response = await apiClient.patch(`${endpoint}/${id}`, updateData);

      if (response.success) {
        // Remove from pending operations
        pendingOperations.current.delete(id);
        setState(prev => ({ ...prev, pendingUpdates: Math.max(0, prev.pendingUpdates - 1) }));
      } else {
        throw new Error(response.message || 'Update failed');
      }
    } catch (error) {
      // Revert optimistic update on error
      await fetchData(false);
      throw error;
    }
  }, [endpoint, applyOptimisticUpdate, fetchData]);

  const create = useCallback(async (createData: Omit<T, 'id'>) => {
    try {
      const tempId = `temp_${Date.now()}`;
      
      // Apply optimistic update
      applyOptimisticUpdate(tempId, createData as Partial<T>, 'create');

      const response = await apiClient.post(endpoint, createData);

      if (response.success) {
        // Replace temp item with real item
        setState(prev => {
          if (!prev.data) return prev;
          
          const newData = prev.data.map(item => 
            item.id === tempId ? { ...response.data } : item
          );
          
          return {
            ...prev,
            data: newData,
            pendingUpdates: Math.max(0, prev.pendingUpdates - 1),
          };
        });

        pendingOperations.current.delete(tempId);
      } else {
        throw new Error(response.message || 'Create failed');
      }
    } catch (error) {
      // Revert optimistic update on error
      await fetchData(false);
      throw error;
    }
  }, [endpoint, applyOptimisticUpdate, fetchData]);

  const deleteItem = useCallback(async (id: string) => {
    try {
      // Apply optimistic update
      applyOptimisticUpdate(id, {}, 'delete');

      const response = await apiClient.delete(`${endpoint}/${id}`);

      if (response.success) {
        // Remove from pending operations
        pendingOperations.current.delete(id);
        setState(prev => ({ ...prev, pendingUpdates: Math.max(0, prev.pendingUpdates - 1) }));
      } else {
        throw new Error(response.message || 'Delete failed');
      }
    } catch (error) {
      // Revert optimistic update on error
      await fetchData(false);
      throw error;
    }
  }, [endpoint, applyOptimisticUpdate, fetchData]);

  const resolveConflict = useCallback((conflictId: string, resolution: 'local' | 'server' | 'merge', mergedData?: any) => {
    setState(prev => {
      const conflict = prev.conflicts.find(c => c.id === conflictId);
      if (!conflict) return prev;

      let resolvedData;
      switch (resolution) {
        case 'local':
          resolvedData = conflict.localData;
          break;
        case 'server':
          resolvedData = conflict.serverData;
          break;
        case 'merge':
          resolvedData = mergedData || { ...conflict.serverData, ...conflict.localData };
          break;
      }

      // Apply resolution to data
      const newData = prev.data?.map(item => {
        // Find the item this conflict relates to (assuming conflict has entity info)
        if (item.id === conflict.localData.id) {
          return { ...item, ...resolvedData };
        }
        return item;
      }) || [];

      return {
        ...prev,
        data: newData,
        conflicts: prev.conflicts.filter(c => c.id !== conflictId),
      };
    });
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const forceSync = useCallback(async () => {
    // Clear pending operations and force fresh data
    pendingOperations.current.clear();
    setState(prev => ({ ...prev, pendingUpdates: 0, conflicts: [] }));
    await fetchData(true);
  }, [fetchData]);

  // Setup WebSocket listeners
  useEffect(() => {
    const unsubscribe = websocketService.subscribe('data_update', handleRealTimeUpdate, filters);
    
    // Track connection status
    const handleConnection = () => {
      setState(prev => ({ ...prev, isConnected: true }));
    };
    
    const handleDisconnection = () => {
      setState(prev => ({ ...prev, isConnected: false }));
    };

    websocketService.onConnect(handleConnection);
    websocketService.onDisconnect(handleDisconnection);

    return () => {
      unsubscribe();
    };
  }, [handleRealTimeUpdate, filters]);

  // Setup periodic sync
  useEffect(() => {
    if (syncInterval > 0) {
      syncTimer.current = setInterval(() => {
        if (websocketService.isConnected()) {
          fetchData(false); // Background sync
        }
      }, syncInterval);

      return () => {
        if (syncTimer.current) {
          clearInterval(syncTimer.current);
        }
      };
    }
  }, [syncInterval, fetchData]);

  // Initial data fetch
  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  const actions: SyncActions<T> = {
    refresh,
    update,
    create,
    delete: deleteItem,
    resolveConflict,
    clearError,
    forceSync,
  };

  return [state, actions];
}
