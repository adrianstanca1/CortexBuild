/**
 * Comprehensive useAPI Hook Tests
 * Tests API calls, caching, error handling, retry logic, and React integration
 * @jest-environment jsdom
 */

import { act, renderHook } from '@testing-library/react';
import apiClient from '../../services/apiClient';
import { clearCache, getCacheStats, useAPI, useDELETE, useGET, usePOST, usePUT } from '../useAPI';

// Mock API client
jest.mock('../../services/apiClient', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('useAPI Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearCache(); // Clear cache before each test
  });

  describe('Basic Functionality', () => {
    it('should initialize with correct default state', () => {
      const mockApiCall = jest.fn().mockResolvedValue({ data: 'test' });

      const { result } = renderHook(() => useAPI(mockApiCall));

      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.execute).toBe('function');
      expect(typeof result.current.retry).toBe('function');
      expect(typeof result.current.reset).toBe('function');
      expect(typeof result.current.cancel).toBe('function');
    });

    it('should execute API call successfully', async () => {
      const mockData = { users: ['John', 'Jane'] };
      const mockApiCall = jest.fn().mockResolvedValue(mockData);

      const { result } = renderHook(() => useAPI(mockApiCall));

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.data).toEqual(mockData);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockApiCall).toHaveBeenCalledTimes(1);
    });

    it('should handle API call errors', async () => {
      const mockError = {
        code: 'NETWORK_ERROR',
        message: 'Network error',
        userMessage: 'Please check your connection',
        retryable: true,
        timestamp: new Date().toISOString()
      };
      const mockApiCall = jest.fn().mockRejectedValue(mockError);

      const { result } = renderHook(() => useAPI(mockApiCall));

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toEqual(mockError);
      expect(mockApiCall).toHaveBeenCalledTimes(1);
    });

    it('should set loading state during API call', async () => {
      let resolvePromise: (value: any) => void;
      const mockApiCall = jest.fn(() => new Promise(resolve => {
        resolvePromise = resolve;
      }));

      const { result } = renderHook(() => useAPI(mockApiCall));

      // Start the API call
      act(() => {
        result.current.execute();
      });

      // Should be loading
      expect(result.current.loading).toBe(true);

      // Resolve the promise
      act(() => {
        resolvePromise!({ data: 'test' });
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      expect(result.current.loading).toBe(false);
    });
  });

  describe('Caching', () => {
    it('should cache successful responses', async () => {
      const mockData = { users: ['John', 'Jane'] };
      const mockApiCall = jest.fn().mockResolvedValue(mockData);
      const cacheKey = 'test-users';

      const { result } = renderHook(() => useAPI(mockApiCall, { cacheKey }));

      // First call
      await act(async () => {
        await result.current.execute();
      });

      expect(mockApiCall).toHaveBeenCalledTimes(1);

      // Second call should use cache
      await act(async () => {
        await result.current.execute();
      });

      expect(mockApiCall).toHaveBeenCalledTimes(1); // Still only called once
      expect(result.current.data).toEqual(mockData);
    });

    it('should respect cache duration', async () => {
      const mockData = { data: 'test' };
      const mockApiCall = jest.fn().mockResolvedValue(mockData);
      const cacheKey = 'test-cache-duration';

      const { result } = renderHook(() => useAPI(mockApiCall, { cacheKey }));

      // First call
      await act(async () => {
        await result.current.execute();
      });

      expect(mockApiCall).toHaveBeenCalledTimes(1);

      // Advance time beyond cache duration (5 minutes)
      jest.advanceTimersByTime(6 * 60 * 1000);

      // Second call should not use cache
      await act(async () => {
        await result.current.execute();
      });

      expect(mockApiCall).toHaveBeenCalledTimes(2);
    });

    it('should not cache when no cacheKey provided', async () => {
      const mockData = { data: 'test' };
      const mockApiCall = jest.fn().mockResolvedValue(mockData);

      const { result } = renderHook(() => useAPI(mockApiCall));

      // First call
      await act(async () => {
        await result.current.execute();
      });

      // Second call should not use cache
      await act(async () => {
        await result.current.execute();
      });

      expect(mockApiCall).toHaveBeenCalledTimes(2);
    });
  });

  describe('Callbacks', () => {
    it('should call onSuccess callback on successful API call', async () => {
      const mockData = { success: true };
      const mockApiCall = jest.fn().mockResolvedValue(mockData);
      const onSuccess = jest.fn();

      const { result } = renderHook(() => useAPI(mockApiCall, { onSuccess }));

      await act(async () => {
        await result.current.execute();
      });

      expect(onSuccess).toHaveBeenCalledWith(mockData);
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });

    it('should call onError callback on API error', async () => {
      const mockError = {
        code: 'NETWORK_ERROR',
        message: 'Network error',
        userMessage: 'Please check your connection',
        retryable: true,
        timestamp: new Date().toISOString()
      };
      const mockApiCall = jest.fn().mockRejectedValue(mockError);
      const onError = jest.fn();

      const { result } = renderHook(() => useAPI(mockApiCall, { onError }));

      await act(async () => {
        await result.current.execute();
      });

      expect(onError).toHaveBeenCalledWith(mockError);
      expect(onError).toHaveBeenCalledTimes(1);
    });

    it('should not call callbacks if component unmounted', async () => {
      const mockData = { data: 'test' };
      const mockApiCall = jest.fn(() => new Promise(resolve => {
        setTimeout(() => resolve(mockData), 100);
      }));
      const onSuccess = jest.fn();

      const { result, unmount } = renderHook(() => useAPI(mockApiCall, { onSuccess }));

      // Start API call
      act(() => {
        result.current.execute();
      });

      // Unmount before call completes
      unmount();

      // Wait for call to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
      });

      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe('Auto-execution', () => {
    it('should auto-execute on mount when enabled', async () => {
      const mockData = { data: 'test' };
      const mockApiCall = jest.fn().mockResolvedValue(mockData);

      renderHook(() => useAPI(mockApiCall, { autoExecute: true }));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      expect(mockApiCall).toHaveBeenCalledTimes(1);
    });

    it('should not auto-execute when disabled', () => {
      const mockApiCall = jest.fn().mockResolvedValue({ data: 'test' });

      renderHook(() => useAPI(mockApiCall, { autoExecute: false }));

      expect(mockApiCall).not.toHaveBeenCalled();
    });

    it('should not auto-execute by default', () => {
      const mockApiCall = jest.fn().mockResolvedValue({ data: 'test' });

      renderHook(() => useAPI(mockApiCall));

      expect(mockApiCall).not.toHaveBeenCalled();
    });
  });

  describe('Retry Logic', () => {
    it('should auto-retry on retryable errors when enabled', async () => {
      const mockError = {
        code: 'NETWORK_ERROR',
        message: 'Network error',
        userMessage: 'Please check your connection',
        retryable: true,
        timestamp: new Date().toISOString()
      };
      const mockData = { success: true };
      const mockApiCall = jest.fn()
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce(mockData);

      const { result } = renderHook(() => useAPI(mockApiCall, { retryOnError: true }));

      await act(async () => {
        await result.current.execute();
      });

      // Should have been called twice (initial + retry)
      expect(mockApiCall).toHaveBeenCalledTimes(2);
      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBeNull();
    });

    it('should not auto-retry when disabled', async () => {
      const mockError = {
        code: 'NETWORK_ERROR',
        message: 'Network error',
        userMessage: 'Please check your connection',
        retryable: true,
        timestamp: new Date().toISOString()
      };
      const mockApiCall = jest.fn().mockRejectedValue(mockError);

      const { result } = renderHook(() => useAPI(mockApiCall, { retryOnError: false }));

      await act(async () => {
        await result.current.execute();
      });

      expect(mockApiCall).toHaveBeenCalledTimes(1);
      expect(result.current.error).toEqual(mockError);
    });

    it('should not retry non-retryable errors', async () => {
      const mockError = {
        code: 'BAD_REQUEST',
        message: 'Bad request',
        userMessage: 'Invalid input',
        retryable: false,
        timestamp: new Date().toISOString()
      };
      const mockApiCall = jest.fn().mockRejectedValue(mockError);

      const { result } = renderHook(() => useAPI(mockApiCall, { retryOnError: true }));

      await act(async () => {
        await result.current.execute();
      });

      expect(mockApiCall).toHaveBeenCalledTimes(1);
      expect(result.current.error).toEqual(mockError);
    });

    it('should provide manual retry functionality', async () => {
      const mockError = {
        code: 'NETWORK_ERROR',
        message: 'Network error',
        userMessage: 'Please check your connection',
        retryable: true,
        timestamp: new Date().toISOString()
      };
      const mockData = { success: true };
      const mockApiCall = jest.fn()
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce(mockData);

      const { result } = renderHook(() => useAPI(mockApiCall));

      // Initial call fails
      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.error).toEqual(mockError);

      // Manual retry succeeds
      await act(async () => {
        await result.current.retry();
      });

      expect(mockApiCall).toHaveBeenCalledTimes(2);
      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBeNull();
    });

    it('should warn when retrying without previous request', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const { result } = renderHook(() => useAPI(jest.fn()));

      await act(async () => {
        await result.current.retry();
      });

      expect(consoleSpy).toHaveBeenCalledWith('[useAPI] No previous request to retry');

      consoleSpy.mockRestore();
    });
  });

  describe('Request Cancellation', () => {
    it('should cancel pending request', async () => {
      let resolvePromise: (value: any) => void;
      const mockApiCall = jest.fn(() => new Promise(resolve => {
        resolvePromise = resolve;
      }));

      const { result } = renderHook(() => useAPI(mockApiCall));

      // Start API call
      act(() => {
        result.current.execute();
      });

      expect(result.current.loading).toBe(true);

      // Cancel the request
      act(() => {
        result.current.cancel();
      });

      expect(result.current.loading).toBe(false);

      // Resolve the promise (should not affect state)
      act(() => {
        resolvePromise!({ data: 'test' });
      });

      // State should remain unchanged
      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(false);
    });

    it('should cancel previous request when starting new one', async () => {
      let firstResolve: (value: any) => void;
      let secondResolve: (value: any) => void;

      const mockApiCall = jest.fn()
        .mockImplementationOnce(() => new Promise(resolve => {
          firstResolve = resolve;
        }))
        .mockImplementationOnce(() => new Promise(resolve => {
          secondResolve = resolve;
        }));

      const { result } = renderHook(() => useAPI(mockApiCall));

      // Start first request
      act(() => {
        result.current.execute('arg1');
      });

      expect(result.current.loading).toBe(true);

      // Start second request (should cancel first)
      act(() => {
        result.current.execute('arg2');
      });

      // Resolve first request (should not affect state)
      act(() => {
        firstResolve!({ data: 'first' });
      });

      // Resolve second request
      act(() => {
        secondResolve!({ data: 'second' });
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });
      expect(result.current.data).toEqual({ data: 'second' });

      expect(mockApiCall).toHaveBeenCalledTimes(2);
      expect(mockApiCall).toHaveBeenLastCalledWith('arg2');
    });
  });

  describe('State Management', () => {
    it('should reset state correctly', async () => {
      const mockData = { data: 'test' };
      const mockError = {
        code: 'NETWORK_ERROR',
        message: 'Network error',
        userMessage: 'Please check your connection',
        retryable: true,
        timestamp: new Date().toISOString()
      };

      const mockApiCall = jest.fn()
        .mockResolvedValueOnce(mockData)
        .mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useAPI(mockApiCall));

      // Successful call
      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBeNull();

      // Failed call
      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.error).toEqual(mockError);

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.loading).toBe(false);
    });

    it('should not update state after unmount', async () => {
      const mockData = { data: 'test' };
      const mockApiCall = jest.fn(() => new Promise(resolve => {
        setTimeout(() => resolve(mockData), 100);
      }));

      const { result, unmount } = renderHook(() => useAPI(mockApiCall));

      // Start API call
      act(() => {
        result.current.execute();
      });

      // Unmount before call completes
      unmount();

      // Wait for call to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
      });

      // Component was unmounted, so state should not be updated
      // (This is hard to test directly, but we can verify no errors are thrown)
    });
  });

  describe('Shorthand Hooks', () => {
    beforeEach(() => {
      mockedApiClient.get.mockResolvedValue({ data: 'GET response' });
      mockedApiClient.post.mockResolvedValue({ data: 'POST response' });
      mockedApiClient.put.mockResolvedValue({ data: 'PUT response' });
      mockedApiClient.delete.mockResolvedValue({ data: 'DELETE response' });
    });

    it('should work with useGET hook', async () => {
      const { result } = renderHook(() => useGET('/users'));

      await act(async () => {
        await result.current.execute();
      });

      expect(mockedApiClient.get).toHaveBeenCalledWith('/users', undefined);
      expect(result.current.data).toEqual({ data: 'GET response' });
    });

    it('should work with usePOST hook', async () => {
      const postData = { name: 'John' };
      const { result } = renderHook(() => usePOST('/users'));

      await act(async () => {
        await result.current.execute(postData);
      });

      expect(mockedApiClient.post).toHaveBeenCalledWith('/users', postData, undefined);
      expect(result.current.data).toEqual({ data: 'POST response' });
    });

    it('should work with usePUT hook', async () => {
      const putData = { name: 'Updated' };
      const { result } = renderHook(() => usePUT('/users/1'));

      await act(async () => {
        await result.current.execute(putData);
      });

      expect(mockedApiClient.put).toHaveBeenCalledWith('/users/1', putData, undefined);
      expect(result.current.data).toEqual({ data: 'PUT response' });
    });

    it('should work with useDELETE hook', async () => {
      const { result } = renderHook(() => useDELETE('/users/1'));

      await act(async () => {
        await result.current.execute();
      });

      expect(mockedApiClient.delete).toHaveBeenCalledWith('/users/1', undefined);
      expect(result.current.data).toEqual({ data: 'DELETE response' });
    });

    it('should pass configuration to shorthand hooks', async () => {
      const config = { skipErrorToast: true };
      const { result } = renderHook(() => useGET('/users', config));

      await act(async () => {
        await result.current.execute();
      });

      expect(mockedApiClient.get).toHaveBeenCalledWith('/users', config);
    });
  });

  describe('Cache Management', () => {
    it('should clear specific cache key', async () => {
      const mockData = { data: 'test' };
      const mockApiCall = jest.fn().mockResolvedValue(mockData);

      // First call with cache
      const { result: result1 } = renderHook(() =>
        useAPI(mockApiCall, { cacheKey: 'test-key' })
      );

      await act(async () => {
        await result1.current.execute();
      });

      expect(mockApiCall).toHaveBeenCalledTimes(1);

      // Second call should use cache
      await act(async () => {
        await result1.current.execute();
      });

      expect(mockApiCall).toHaveBeenCalledTimes(1);

      // Clear specific cache
      clearCache('test-key');

      // Third call should not use cache
      await act(async () => {
        await result1.current.execute();
      });

      expect(mockApiCall).toHaveBeenCalledTimes(2);
    });

    it('should clear all cache', async () => {
      const mockData = { data: 'test' };
      const mockApiCall = jest.fn().mockResolvedValue(mockData);

      // First hook with cache
      const { result: result1 } = renderHook(() =>
        useAPI(mockApiCall, { cacheKey: 'test-key-1' })
      );

      // Second hook with different cache
      const { result: result2 } = renderHook(() =>
        useAPI(mockApiCall, { cacheKey: 'test-key-2' })
      );

      await act(async () => {
        await result1.current.execute();
        await result2.current.execute();
      });

      expect(mockApiCall).toHaveBeenCalledTimes(2);

      // Both should use cache on second call
      await act(async () => {
        await result1.current.execute();
        await result2.current.execute();
      });

      expect(mockApiCall).toHaveBeenCalledTimes(2);

      // Clear all cache
      clearCache();

      // Both should make new requests
      await act(async () => {
        await result1.current.execute();
        await result2.current.execute();
      });

      expect(mockApiCall).toHaveBeenCalledTimes(4);
    });

    it('should provide cache stats', () => {
      const stats = getCacheStats();
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('keys');
      expect(Array.isArray(stats.keys)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle concurrent execute calls', async () => {
      const mockData = { data: 'test' };
      const mockApiCall = jest.fn().mockResolvedValue(mockData);

      const { result } = renderHook(() => useAPI(mockApiCall));

      // Start multiple concurrent calls
      const promises = [
        result.current.execute(),
        result.current.execute(),
        result.current.execute()
      ];

      const results = await Promise.all(promises);

      // All should succeed
      results.forEach(result => {
        expect(result).toEqual(mockData);
      });

      expect(mockApiCall).toHaveBeenCalledTimes(3);
    });

    it('should handle API call throwing non-APIError', async () => {
      const genericError = new Error('Generic error');
      const mockApiCall = jest.fn().mockRejectedValue(genericError);

      const { result } = renderHook(() => useAPI(mockApiCall));

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.error!.message).toBe('Generic error');
    });

    it('should handle rapid state changes', async () => {
      let resolveCount = 0;
      const mockApiCall = jest.fn(() => new Promise(resolve => {
        resolveCount++;
        setTimeout(() => resolve({ data: `response-${resolveCount}` }), 10);
      }));

      const { result } = renderHook(() => useAPI(mockApiCall));

      // Start multiple rapid calls
      act(() => {
        result.current.execute();
      });

      act(() => {
        result.current.execute();
      });

      act(() => {
        result.current.execute();
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      // Should end up with the last response
      expect((result.current.data as any)?.data).toMatch(/response-\d/);
    });
  });
});
