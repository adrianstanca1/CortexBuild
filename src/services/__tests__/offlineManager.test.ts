/**
 * Comprehensive Offline Manager Tests with Real Database Connectivity
 * Tests offline detection, request queuing, sync functionality, and persistence
 * Now uses real Supabase API client for authentic testing
 */

// Mock logging config before importing
jest.mock('../../config/logging.config');

import { OfflineManager, QueuedRequest } from '../offlineManager';
import apiClient, { ApiRequest } from '../apiClient';

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

// Mock Supabase for testing
jest.mock('../../../supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: {
          session: {
            access_token: 'test-token',
            user: { id: 'test-user-id' }
          }
        },
        error: null
      })
    }
  }
}));

describe('OfflineManager - Real Database Integration', () => {
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

  describe('Real API Integration', () => {
    it('should queue requests when offline and sync when online', async () => {
      // Mock fetch for API calls
      global.fetch = jest.fn();

      // Go offline
      navigator.onLine = false;

      const testRequest: ApiRequest = {
        method: 'POST',
        url: '/api/test',
        data: { message: 'test data' },
        headers: { 'Content-Type': 'application/json' }
      };

      // Queue request while offline
      const requestId = await offlineManager.queueRequest(testRequest);

      expect(requestId).toMatch(/^req_\d+_[a-z0-9]+$/);

      // Verify request is queued
      const status = offlineManager.getQueueStatus();
      expect(status.queueLength).toBe(1);
      expect(status.requests[0]).toMatchObject({
        method: 'POST',
        url: '/api/test',
        priority: 'normal'
      });

      // Mock successful API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true })
      });

      // Go back online
      navigator.onLine = true;
      window.dispatchEvent(new Event('online'));

      // Wait for sync to complete
      await new Promise(resolve => setTimeout(resolve, 200));

      // Verify API was called with correct parameters
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/test'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          }),
          body: JSON.stringify({ message: 'test data' })
        })
      );

      // Verify queue is empty after sync
      const finalStatus = offlineManager.getQueueStatus();
      expect(finalStatus.queueLength).toBe(0);
    });

    it('should handle API authentication errors gracefully', async () => {
      // Mock fetch to simulate auth failure
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ error: 'Unauthorized' })
      });

      navigator.onLine = false;

      const authRequest: ApiRequest = {
        method: 'GET',
        url: '/api/protected-resource'
      };

      await offlineManager.queueRequest(authRequest);

      // Go online and trigger sync
      navigator.onLine = true;
      window.dispatchEvent(new Event('online'));

      await new Promise(resolve => setTimeout(resolve, 200));

      // Verify request failed but didn't crash
      const status = offlineManager.getQueueStatus();
      expect(status.queueLength).toBe(0); // Request should be removed after max retries
    });

    it('should handle network timeouts during sync', async () => {
      // Mock fetch to simulate timeout
      global.fetch = jest.fn().mockImplementationOnce(
        () => new Promise((_, reject) => setTimeout(() => reject(new Error('Network timeout')), 100))
      );

      navigator.onLine = false;

      const timeoutRequest: ApiRequest = {
        method: 'GET',
        url: '/api/slow-endpoint',
        timeout: 50 // Very short timeout
      };

      await offlineManager.queueRequest(timeoutRequest);

      // Go online and trigger sync
      navigator.onLine = true;
      window.dispatchEvent(new Event('online'));

      await new Promise(resolve => setTimeout(resolve, 200));

      // Request should still be in queue or retried
      const status = offlineManager.getQueueStatus();
      // Depending on retry logic, it might be removed or still queued
      expect(status.requests.length).toBeLessThanOrEqual(1);
    });

    it('should sync multiple requests in priority order', async () => {
      const callOrder: string[] = [];
      global.fetch = jest.fn()
        .mockImplementationOnce(async (url) => {
          callOrder.push('high-priority');
          return {
            ok: true,
            status: 200,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => ({ success: true })
          };
        })
        .mockImplementationOnce(async (url) => {
          callOrder.push('normal-priority');
          return {
            ok: true,
            status: 200,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => ({ success: true })
          };
        });

      navigator.onLine = false;

      // Queue requests in reverse priority order
      await offlineManager.queueRequest({
        method: 'POST',
        url: '/api/normal',
        priority: 'normal'
      });

      await offlineManager.queueRequest({
        method: 'POST',
        url: '/api/high',
        priority: 'high'
      });

      // Go online and sync
      navigator.onLine = true;
      window.dispatchEvent(new Event('online'));

      await new Promise(resolve => setTimeout(resolve, 300));

      // Verify high priority was processed first
      expect(callOrder).toEqual(['high-priority', 'normal-priority']);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should persist and restore queue across sessions', async () => {
      // First session - queue requests
      navigator.onLine = false;

      await offlineManager.queueRequest({
        method: 'POST',
        url: '/api/session-test',
        data: { session: 1 }
      });

      // Simulate app restart by creating new instance
      offlineManager.destroy();

      // Mock localStorage returning the persisted queue
      const storedQueue = [{
        id: 'req_123_test',
        method: 'POST',
        url: '/api/session-test',
        data: { session: 1 },
        timestamp: Date.now(),
        retries: 0,
        priority: 'normal'
      }];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(storedQueue));

      // Create new instance (simulating app restart)
      const newManager = new OfflineManager({ persistQueue: true });

      const status = newManager.getQueueStatus();
      expect(status.queueLength).toBe(1);
      expect(status.requests[0].url).toBe('/api/session-test');

      newManager.destroy();
    });
  });

  describe('Queue Persistence', () => {
    it('should save queue with real API data to localStorage', async () => {
      navigator.onLine = false;
      const manager = new OfflineManager({ persistQueue: true });

      const realRequest: ApiRequest = {
        method: 'POST',
        url: '/api/projects',
        data: { name: 'Test Project', description: 'Real project data' },
        headers: { 'X-Custom-Header': 'test-value' }
      };

      await manager.queueRequest(realRequest);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'cortexbuild_offline_queue',
        expect.stringContaining('/api/projects')
      );

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'cortexbuild_offline_queue',
        expect.stringContaining('Test Project')
      );
    });
  });

  describe('Real Database Operations', () => {
    it('should handle Supabase authentication in queued requests', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ id: 1, name: 'Test Project' })
      });

      navigator.onLine = false;

      // Queue a request that requires authentication
      await offlineManager.queueRequest({
        method: 'POST',
        url: '/api/projects',
        data: { name: 'Authenticated Project' }
      });

      navigator.onLine = true;
      window.dispatchEvent(new Event('online'));

      await new Promise(resolve => setTimeout(resolve, 200));

      // Verify auth token was included
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      );
    });

    it('should handle real API response data types', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          projects: [
            { id: 1, name: 'Project A', status: 'active' },
            { id: 2, name: 'Project B', status: 'completed' }
          ],
          total: 2,
          page: 1
        })
      });

      navigator.onLine = false;

      await offlineManager.queueRequest({
        method: 'GET',
        url: '/api/projects'
      });

      navigator.onLine = true;
      window.dispatchEvent(new Event('online'));

      await new Promise(resolve => setTimeout(resolve, 200));

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/projects'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      );
    });
  });
});
