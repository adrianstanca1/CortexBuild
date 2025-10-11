/**
 * Comprehensive Offline Manager Tests
 * Tests offline detection, request queuing, sync functionality, and persistence
 */

import { OfflineManager, QueuedRequest } from '../offlineManager';

// Mock API client to avoid circular dependency
jest.mock('../apiClient', () => ({
  default: {
    request: jest.fn()
  }
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true
});

describe('OfflineManager', () => {
  let offlineManager: OfflineManager;
  let onlineCallback: jest.Mock;
  let offlineCallback: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset navigator.onLine
    navigator.onLine = true;

    // Create fresh instance for each test
    offlineManager = new OfflineManager({
      maxQueueSize: 10,
      persistQueue: true,
      syncOnReconnect: true
    });

    onlineCallback = jest.fn();
    offlineCallback = jest.fn();
  });

  afterEach(() => {
    // Clean up event listeners
    offlineManager.destroy();
  });

  describe('Initialization', () => {
    it('should initialize with default configuration', () => {
      const defaultManager = new OfflineManager();
      expect(defaultManager).toBeInstanceOf(OfflineManager);
    });

    it('should load persisted queue on initialization', () => {
      const storedQueue = [
        {
          id: 'req_1',
          method: 'POST',
          url: '/test',
          timestamp: Date.now(),
          retries: 0,
          priority: 'normal' as const
        }
      ];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(storedQueue));

      const managerWithPersistence = new OfflineManager({ persistQueue: true });

      const status = managerWithPersistence.getQueueStatus();
      expect(status.queueLength).toBe(1);
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');

      const managerWithPersistence = new OfflineManager({ persistQueue: true });

      const status = managerWithPersistence.getQueueStatus();
      expect(status.queueLength).toBe(0);
    });

    it('should setup event listeners on initialization', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

      new OfflineManager();

      expect(addEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));

      addEventListenerSpy.mockRestore();
    });
  });

  describe('Online/Offline Detection', () => {
    it('should detect initial online status', () => {
      navigator.onLine = true;
      const manager = new OfflineManager();

      expect(manager.checkOnlineStatus()).toBe(true);
    });

    it('should detect initial offline status', () => {
      navigator.onLine = false;
      const manager = new OfflineManager();

      expect(manager.checkOnlineStatus()).toBe(false);
    });

    it('should handle online event', () => {
      navigator.onLine = false;
      const manager = new OfflineManager();

      // Register callback
      manager.onOnline(onlineCallback);

      // Simulate online event
      navigator.onLine = true;
      window.dispatchEvent(new Event('online'));

      expect(onlineCallback).toHaveBeenCalledTimes(1);
      expect(manager.checkOnlineStatus()).toBe(true);
    });

    it('should handle offline event', () => {
      const manager = new OfflineManager();

      // Register callback
      manager.onOffline(offlineCallback);

      // Simulate offline event
      navigator.onLine = false;
      window.dispatchEvent(new Event('offline'));

      expect(offlineCallback).toHaveBeenCalledTimes(1);
      expect(manager.checkOnlineStatus()).toBe(false);
    });

    it('should return unsubscribe function for callbacks', () => {
      const manager = new OfflineManager();

      const unsubscribe = manager.onOnline(onlineCallback);
      expect(typeof unsubscribe).toBe('function');

      // Unsubscribe and verify callback is not called
      unsubscribe();

      navigator.onLine = false;
      window.dispatchEvent(new Event('online'));

      expect(onlineCallback).not.toHaveBeenCalled();
    });
  });

  describe('Request Queuing', () => {
    it('should queue requests when offline', async () => {
      navigator.onLine = false;
      const manager = new OfflineManager();

      const requestData = {
        method: 'POST',
        url: '/api/users',
        data: { name: 'John' },
        headers: { 'Content-Type': 'application/json' }
      };

      const requestId = await manager.queueRequest(requestData);

      expect(requestId).toMatch(/^req_\d+_[a-z0-9]+$/);
      expect(localStorageMock.setItem).toHaveBeenCalled();

      const status = manager.getQueueStatus();
      expect(status.queueLength).toBe(1);
      expect(status.requests[0]).toMatchObject({
        method: 'POST',
        url: '/api/users',
        priority: 'normal'
      });
    });

    it('should assign high priority to auth requests', async () => {
      navigator.onLine = false;
      const manager = new OfflineManager();

      const authRequest = {
        method: 'POST',
        url: '/auth/login',
        data: { username: 'test' }
      };

      await manager.queueRequest(authRequest);

      const status = manager.getQueueStatus();
      expect(status.requests[0].priority).toBe('high');
    });

    it('should assign high priority to emergency requests', async () => {
      navigator.onLine = false;
      const manager = new OfflineManager();

      const emergencyRequest = {
        method: 'POST',
        url: '/emergency/alert',
        data: { message: 'urgent' }
      };

      await manager.queueRequest(emergencyRequest);

      const status = manager.getQueueStatus();
      expect(status.requests[0].priority).toBe('high');
    });

    it('should sort queue by priority', async () => {
      navigator.onLine = false;
      const manager = new OfflineManager();

      // Add requests in reverse priority order
      await manager.queueRequest({
        method: 'GET',
        url: '/low-priority',
        priority: 'low'
      });

      await manager.queueRequest({
        method: 'POST',
        url: '/high-priority',
        priority: 'high'
      });

      await manager.queueRequest({
        method: 'PUT',
        url: '/normal-priority',
        priority: 'normal'
      });

      const status = manager.getQueueStatus();
      expect(status.requests[0].priority).toBe('high');
      expect(status.requests[1].priority).toBe('normal');
      expect(status.requests[2].priority).toBe('low');
    });

    it('should enforce maximum queue size', async () => {
      const manager = new OfflineManager({ maxQueueSize: 2 });

      // Add requests to reach limit
      await manager.queueRequest({ method: 'GET', url: '/test1' });
      await manager.queueRequest({ method: 'GET', url: '/test2' });

      // This should trigger removal of oldest low-priority item
      await manager.queueRequest({ method: 'GET', url: '/test3' });

      const status = manager.getQueueStatus();
      expect(status.queueLength).toBe(2);
    });

    it('should remove oldest low priority when queue is full', async () => {
      const manager = new OfflineManager({ maxQueueSize: 2 });

      // Add low priority request first
      await manager.queueRequest({
        method: 'GET',
        url: '/low1',
        priority: 'low'
      });

      // Add high priority request
      await manager.queueRequest({
        method: 'POST',
        url: '/high1',
        priority: 'high'
      });

      // Queue should be full, adding another should remove low priority
      await manager.queueRequest({
        method: 'GET',
        url: '/normal1',
        priority: 'normal'
      });

      const status = manager.getQueueStatus();
      expect(status.queueLength).toBe(2);
      expect(status.requests.some(r => r.url === '/low1')).toBe(false);
      expect(status.requests.some(r => r.url === '/high1')).toBe(true);
    });
  });

  describe('Queue Persistence', () => {
    it('should save queue to localStorage', async () => {
      navigator.onLine = false;
      const manager = new OfflineManager({ persistQueue: true });

      await manager.queueRequest({
        method: 'POST',
        url: '/test',
        data: { test: true }
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'cortexbuild_offline_queue',
        expect.stringContaining('/test')
      );
    });

    it('should not persist when disabled', async () => {
      navigator.onLine = false;
      const manager = new OfflineManager({ persistQueue: false });

      await manager.queueRequest({
        method: 'POST',
        url: '/test'
      });

      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it('should handle localStorage errors gracefully', async () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      navigator.onLine = false;
      const manager = new OfflineManager({ persistQueue: true });

      // Should not throw error
      await expect(manager.queueRequest({
        method: 'POST',
        url: '/test'
      })).resolves.toMatch(/^req_\d+_[a-z0-9]+$/);
    });
  });

  describe('Queue Sync', () => {
    let mockApiClient: any;

    beforeEach(() => {
      // Get the mocked API client
      mockApiClient = require('../apiClient').default;
      mockApiClient.request.mockResolvedValue({ success: true });
    });

    it('should sync queue when back online', async () => {
      navigator.onLine = false;
      const manager = new OfflineManager({ syncOnReconnect: true });

      // Add request to queue while offline
      await manager.queueRequest({
        method: 'POST',
        url: '/test',
        data: { test: true }
      });

      // Go back online
      navigator.onLine = true;
      window.dispatchEvent(new Event('online'));

      // Wait for async sync to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockApiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        url: '/test',
        data: { test: true },
        headers: undefined,
        skipRetry: true
      });
    });

    it('should not auto-sync when disabled', async () => {
      navigator.onLine = false;
      const manager = new OfflineManager({ syncOnReconnect: false });

      await manager.queueRequest({
        method: 'POST',
        url: '/test'
      });

      navigator.onLine = true;
      window.dispatchEvent(new Event('online'));

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockApiClient.request).not.toHaveBeenCalled();
    });

    it('should handle sync failures and retry', async () => {
      mockApiClient.request
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ success: true });

      navigator.onLine = false;
      const manager = new OfflineManager();

      await manager.queueRequest({
        method: 'POST',
        url: '/test'
      });

      // Manual sync
      const result = await manager.syncQueue();

      expect(result.success).toBe(1);
      expect(result.failed).toBe(0);
      expect(mockApiClient.request).toHaveBeenCalledTimes(2); // Initial + 1 retry
    });

    it('should remove requests after max retries', async () => {
      mockApiClient.request.mockRejectedValue(new Error('Persistent failure'));

      navigator.onLine = false;
      const manager = new OfflineManager();

      await manager.queueRequest({
        method: 'POST',
        url: '/test'
      });

      // Sync should fail 3 times and then remove the request
      for (let i = 0; i < 3; i++) {
        const result = await manager.syncQueue();
        if (i < 2) {
          expect(result.failed).toBe(0);
          expect(result.success).toBe(0);
        } else {
          expect(result.failed).toBe(1);
        }
      }

      const status = manager.getQueueStatus();
      expect(status.queueLength).toBe(0);
    });

    it('should stop sync when going offline during sync', async () => {
      let callCount = 0;
      mockApiClient.request.mockImplementation(() => {
        callCount++;
        if (callCount === 2) {
          navigator.onLine = false;
        }
        return Promise.resolve({ success: true });
      });

      navigator.onLine = false;
      const manager = new OfflineManager();

      // Add multiple requests
      await manager.queueRequest({ method: 'POST', url: '/test1' });
      await manager.queueRequest({ method: 'POST', url: '/test2' });
      await manager.queueRequest({ method: 'POST', url: '/test3' });

      const result = await manager.syncQueue();

      expect(result.success).toBe(1); // Only first request should succeed
      expect(mockApiClient.request).toHaveBeenCalledTimes(1);
    });

    it('should not sync when already in progress', async () => {
      mockApiClient.request.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );

      navigator.onLine = false;
      const manager = new OfflineManager();

      await manager.queueRequest({ method: 'POST', url: '/test' });

      // Start two syncs simultaneously
      const sync1 = manager.syncQueue();
      const sync2 = manager.syncQueue();

      const [result1, result2] = await Promise.all([sync1, sync2]);

      expect(result1.success + result2.success).toBe(1); // Only one should succeed
    });
  });

  describe('Queue Management', () => {
    it('should clear queue completely', async () => {
      navigator.onLine = false;
      const manager = new OfflineManager({ persistQueue: true });

      await manager.queueRequest({ method: 'POST', url: '/test1' });
      await manager.queueRequest({ method: 'POST', url: '/test2' });

      expect(manager.getQueueStatus().queueLength).toBe(2);

      manager.clearQueue();

      const status = manager.getQueueStatus();
      expect(status.queueLength).toBe(0);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('cortexbuild_offline_queue');
    });

    it('should provide detailed queue status', async () => {
      navigator.onLine = false;
      const manager = new OfflineManager();

      const requestData = {
        method: 'POST',
        url: '/test',
        data: { test: true },
        priority: 'high' as const
      };

      const requestId = await manager.queueRequest(requestData);

      const status = manager.getQueueStatus();

      expect(status).toEqual({
        isOnline: false,
        queueLength: 1,
        syncInProgress: false,
        requests: [
          expect.objectContaining({
            id: requestId,
            method: 'POST',
            url: '/test',
            priority: 'high',
            retries: 0
          })
        ]
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty queue sync', async () => {
      const manager = new OfflineManager();

      const result = await manager.syncQueue();

      expect(result.success).toBe(0);
      expect(result.failed).toBe(0);
    });

    it('should handle sync when offline', async () => {
      navigator.onLine = false;
      const manager = new OfflineManager();

      await manager.queueRequest({ method: 'POST', url: '/test' });

      const result = await manager.syncQueue();

      expect(result.success).toBe(0);
      expect(result.failed).toBe(0);
    });

    it('should generate unique request IDs', async () => {
      navigator.onLine = false;
      const manager = new OfflineManager();

      const id1 = await manager.queueRequest({ method: 'POST', url: '/test1' });
      const id2 = await manager.queueRequest({ method: 'POST', url: '/test2' });

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^req_\d+_[a-z0-9]+$/);
      expect(id2).toMatch(/^req_\d+_[a-z0-9]+$/);
    });

    it('should handle rapid online/offline transitions', async () => {
      const manager = new OfflineManager();

      // Rapid transitions
      navigator.onLine = false;
      window.dispatchEvent(new Event('offline'));

      navigator.onLine = true;
      window.dispatchEvent(new Event('online'));

      navigator.onLine = false;
      window.dispatchEvent(new Event('offline'));

      expect(manager.checkOnlineStatus()).toBe(false);
      expect(offlineCallback).toHaveBeenCalledTimes(2);
      expect(onlineCallback).toHaveBeenCalledTimes(1);
    });

    it('should cleanup event listeners on destroy', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      const manager = new OfflineManager();
      manager.destroy();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });
  });
});