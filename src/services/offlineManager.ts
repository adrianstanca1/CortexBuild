/**
 * Offline Manager
 * Handles offline/online detection, request queuing, and automatic sync
 */

import { APIRequestConfig } from './apiClient';

/**
 * Queued Request Interface
 */
export interface QueuedRequest {
  id: string;
  method: string;
  url: string;
  data?: any;
  headers?: Record<string, string>;
  timestamp: number;
  retries: number;
  priority: 'high' | 'normal' | 'low';
  config?: APIRequestConfig;
}

/**
 * Offline Manager Configuration
 */
export interface OfflineManagerConfig {
  maxQueueSize: number;
  persistQueue: boolean;
  syncOnReconnect: boolean;
  queueStorageKey: string;
}

/**
 * Default Configuration
 */
const DEFAULT_CONFIG: OfflineManagerConfig = {
  maxQueueSize: 50,
  persistQueue: true,
  syncOnReconnect: true,
  queueStorageKey: 'cortexbuild_offline_queue'
};

/**
 * Offline Manager Class
 */
class OfflineManager {
  private queue: QueuedRequest[] = [];
  private isOnline: boolean = navigator.onLine;
  private config: OfflineManagerConfig;
  private onlineCallbacks: Array<() => void> = [];
  private offlineCallbacks: Array<() => void> = [];
  private syncInProgress: boolean = false;

  constructor(config: Partial<OfflineManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Load persisted queue
    if (this.config.persistQueue) {
      this.loadQueue();
    }

    // Setup event listeners
    this.setupEventListeners();

    // Log initial status
    console.log(`[OfflineManager] Initialized - ${this.isOnline ? 'Online' : 'Offline'}`);
  }

  /**
   * Setup online/offline event listeners
   */
  private setupEventListeners(): void {
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
  }

  /**
   * Handle online event
   */
  private async handleOnline(): Promise<void> {
    console.log('[OfflineManager] Connection restored');
    this.isOnline = true;

    // Trigger callbacks
    this.onlineCallbacks.forEach(callback => callback());

    // Auto-sync queue if enabled
    if (this.config.syncOnReconnect && this.queue.length > 0) {
      console.log(`[OfflineManager] Auto-syncing ${this.queue.length} queued requests`);
      await this.syncQueue();
    }
  }

  /**
   * Handle offline event
   */
  private handleOffline(): void {
    console.log('[OfflineManager] Connection lost');
    this.isOnline = false;

    // Trigger callbacks
    this.offlineCallbacks.forEach(callback => callback());
  }

  /**
   * Add request to queue
   */
  async queueRequest(request: Omit<QueuedRequest, 'id' | 'timestamp' | 'retries'>): Promise<string> {
    // Check queue size
    if (this.queue.length >= this.config.maxQueueSize) {
      console.warn('[OfflineManager] Queue is full, removing oldest low-priority item');
      this.removeOldestLowPriority();
    }

    // Create queued request
    const queuedRequest: QueuedRequest = {
      ...request,
      id: this.generateRequestId(),
      timestamp: Date.now(),
      retries: 0
    };

    // Add to queue
    this.queue.push(queuedRequest);

    // Sort by priority
    this.sortQueueByPriority();

    // Persist queue
    if (this.config.persistQueue) {
      this.saveQueue();
    }

    console.log(`[OfflineManager] Request queued: ${request.method} ${request.url}`);

    return queuedRequest.id;
  }

  /**
   * Sync all queued requests
   */
  async syncQueue(): Promise<{ success: number; failed: number }> {
    if (this.syncInProgress) {
      console.warn('[OfflineManager] Sync already in progress');
      return { success: 0, failed: 0 };
    }

    if (!this.isOnline) {
      console.warn('[OfflineManager] Cannot sync - offline');
      return { success: 0, failed: 0 };
    }

    this.syncInProgress = true;
    const stats = { success: 0, failed: 0 };

    console.log(`[OfflineManager] Starting sync of ${this.queue.length} requests`);

    // Process queue
    while (this.queue.length > 0) {
      const request = this.queue[0];

      try {
        await this.executeRequest(request);
        stats.success++;
        
        // Remove from queue
        this.queue.shift();
        console.log(`[OfflineManager] Request synced: ${request.method} ${request.url}`);
      } catch (error) {
        console.error(`[OfflineManager] Failed to sync request: ${request.method} ${request.url}`, error);
        
        // Increment retries
        request.retries++;

        // Remove if too many retries
        if (request.retries >= 3) {
          stats.failed++;
          this.queue.shift();
          console.warn(`[OfflineManager] Request removed after 3 failed attempts: ${request.url}`);
        } else {
          // Move to end of queue
          this.queue.push(this.queue.shift()!);
        }
        
        // Break if offline
        if (!navigator.onLine) {
          console.log('[OfflineManager] Went offline during sync');
          break;
        }
      }
    }

    // Persist updated queue
    if (this.config.persistQueue) {
      this.saveQueue();
    }

    this.syncInProgress = false;

    console.log(`[OfflineManager] Sync complete - Success: ${stats.success}, Failed: ${stats.failed}`);

    return stats;
  }

  /**
   * Execute a queued request
   */
  private async executeRequest(request: QueuedRequest): Promise<any> {
    // Dynamic import to avoid circular dependency
    const { default: apiClient } = await import('./apiClient');

    const config: APIRequestConfig = {
      ...request.config,
      method: request.method as any,
      url: request.url,
      data: request.data,
      headers: request.headers,
      skipRetry: true // Already in retry queue
    };

    return apiClient.request(config);
  }

  /**
   * Clear queue
   */
  clearQueue(): void {
    this.queue = [];
    if (this.config.persistQueue) {
      localStorage.removeItem(this.config.queueStorageKey);
    }
    console.log('[OfflineManager] Queue cleared');
  }

  /**
   * Get queue status
   */
  getQueueStatus() {
    return {
      isOnline: this.isOnline,
      queueLength: this.queue.length,
      syncInProgress: this.syncInProgress,
      requests: this.queue.map(r => ({
        id: r.id,
        method: r.method,
        url: r.url,
        priority: r.priority,
        timestamp: r.timestamp,
        retries: r.retries
      }))
    };
  }

  /**
   * Register online callback
   */
  onOnline(callback: () => void): () => void {
    this.onlineCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.onlineCallbacks = this.onlineCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Register offline callback
   */
  onOffline(callback: () => void): () => void {
    this.offlineCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.offlineCallbacks = this.offlineCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Check if online
   */
  checkOnlineStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Private Helper Methods
   */

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sort queue by priority
   */
  private sortQueueByPriority(): void {
    const priorityOrder = { high: 0, normal: 1, low: 2 };
    this.queue.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.timestamp - b.timestamp; // FIFO within same priority
    });
  }

  /**
   * Remove oldest low-priority request
   */
  private removeOldestLowPriority(): void {
    const lowPriorityIndex = this.queue.findIndex(r => r.priority === 'low');
    if (lowPriorityIndex !== -1) {
      this.queue.splice(lowPriorityIndex, 1);
    } else {
      // If no low priority, remove oldest normal priority
      const normalPriorityIndex = this.queue.findIndex(r => r.priority === 'normal');
      if (normalPriorityIndex !== -1) {
        this.queue.splice(normalPriorityIndex, 1);
      } else {
        // Last resort: remove oldest request
        this.queue.shift();
      }
    }
  }

  /**
   * Save queue to localStorage
   */
  private saveQueue(): void {
    try {
      localStorage.setItem(
        this.config.queueStorageKey,
        JSON.stringify(this.queue)
      );
    } catch (error) {
      console.error('[OfflineManager] Failed to save queue to localStorage', error);
    }
  }

  /**
   * Load queue from localStorage
   */
  private loadQueue(): void {
    try {
      const stored = localStorage.getItem(this.config.queueStorageKey);
      if (stored) {
        this.queue = JSON.parse(stored);
        console.log(`[OfflineManager] Loaded ${this.queue.length} queued requests from storage`);
      }
    } catch (error) {
      console.error('[OfflineManager] Failed to load queue from localStorage', error);
      this.queue = [];
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    window.removeEventListener('online', this.handleOnline.bind(this));
    window.removeEventListener('offline', this.handleOffline.bind(this));
    this.onlineCallbacks = [];
    this.offlineCallbacks = [];
  }
}

/**
 * Create singleton instance
 */
const offlineManager = new OfflineManager();

export default offlineManager;
export { OfflineManager };
