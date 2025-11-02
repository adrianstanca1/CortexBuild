/**
 * useAPI Hook
 * Custom React hook for API calls with loading, error handling, and retry logic
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import apiClient, { APIError, APIRequestConfig } from '../services/apiClient';

/**
 * Hook Options
 */
export interface UseAPIOptions {
  autoExecute?: boolean; // Execute on mount
  onSuccess?: (data: any) => void;
  onError?: (error: APIError) => void;
  retryOnError?: boolean;
  cacheKey?: string; // For caching responses
  skipErrorToast?: boolean;
}

/**
 * Hook Return Type
 */
export interface UseAPIReturn<T> {
  data: T | null;
  loading: boolean;
  error: APIError | null;
  execute: (...args: any[]) => Promise<T | null>;
  retry: () => Promise<T | null>;
  reset: () => void;
  cancel: () => void;
}

/**
 * Simple in-memory cache
 */
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * useAPI Hook
 */
export function useAPI<T = any>(
  apiCall: (...args: any[]) => Promise<T>,
  options: UseAPIOptions = {}
): UseAPIReturn<T> {
  const {
    autoExecute = false,
    onSuccess,
    onError,
    retryOnError = false,
    cacheKey,
    skipErrorToast = false
  } = options;

  // State
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<APIError | null>(null);

  // Refs
  const mountedRef = useRef(true);
  const argsRef = useRef<any[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Execute API call
   */
  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      // Store args for retry
      argsRef.current = args;

      // Check cache first
      if (cacheKey) {
        const cached = cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          console.log(`[useAPI] Using cached data for ${cacheKey}`);
          setData(cached.data);
          return cached.data;
        }
      }

      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      // Set loading state
      setLoading(true);
      setError(null);

      try {
        // Execute API call
        const result = await apiCall(...args);

        // Only update state if component is still mounted
        if (mountedRef.current) {
          setData(result);
          setError(null);
          setLoading(false);

          // Cache result if cacheKey provided
          if (cacheKey) {
            cache.set(cacheKey, { data: result, timestamp: Date.now() });
          }

          // Success callback
          if (onSuccess) {
            onSuccess(result);
          }
        }

        return result;
      } catch (err) {
        const apiError = err as APIError;

        // Only update state if component is still mounted
        if (mountedRef.current) {
          setError(apiError);
          setLoading(false);

          // Error callback
          if (onError) {
            onError(apiError);
          }

          // Auto-retry if enabled and error is retryable
          if (retryOnError && apiError.retryable) {
            console.log('[useAPI] Auto-retrying after error');
            setTimeout(() => {
              if (mountedRef.current) {
                execute(...args);
              }
            }, 2000);
          }
        }

        return null;
      }
    },
    [apiCall, onSuccess, onError, retryOnError, cacheKey]
  );

  /**
   * Retry last failed request
   */
  const retry = useCallback(async (): Promise<T | null> => {
    if (!argsRef.current || argsRef.current.length === 0) {
      console.warn('[useAPI] No previous request to retry');
      return null;
    }

    console.log('[useAPI] Retrying request');
    return execute(...argsRef.current);
  }, [execute]);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  /**
   * Cancel pending request
   */
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
  }, []);

  /**
   * Auto-execute on mount if enabled
   */
  useEffect(() => {
    if (autoExecute) {
      execute();
    }

    // Cleanup on unmount
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []); // Only run on mount/unmount

  return {
    data,
    loading,
    error,
    execute,
    retry,
    reset,
    cancel
  };
}

/**
 * useGET Hook - Shorthand for GET requests
 */
export function useGET<T = any>(
  url: string,
  config?: APIRequestConfig,
  options?: UseAPIOptions
): UseAPIReturn<T> {
  const apiCall = useCallback(
    () => apiClient.get<T>(url, config),
    [url, config]
  );

  return useAPI<T>(apiCall, options);
}

/**
 * usePOST Hook - Shorthand for POST requests
 */
export function usePOST<T = any>(
  url: string,
  config?: APIRequestConfig,
  options?: UseAPIOptions
): UseAPIReturn<T> {
  const apiCall = useCallback(
    (data: any) => apiClient.post<T>(url, data, config),
    [url, config]
  );

  return useAPI<T>(apiCall, options);
}

/**
 * usePUT Hook - Shorthand for PUT requests
 */
export function usePUT<T = any>(
  url: string,
  config?: APIRequestConfig,
  options?: UseAPIOptions
): UseAPIReturn<T> {
  const apiCall = useCallback(
    (data: any) => apiClient.put<T>(url, data, config),
    [url, config]
  );

  return useAPI<T>(apiCall, options);
}

/**
 * useDELETE Hook - Shorthand for DELETE requests
 */
export function useDELETE<T = any>(
  url: string,
  config?: APIRequestConfig,
  options?: UseAPIOptions
): UseAPIReturn<T> {
  const apiCall = useCallback(
    () => apiClient.delete<T>(url, config),
    [url, config]
  );

  return useAPI<T>(apiCall, options);
}

/**
 * Clear cache
 */
export function clearCache(key?: string): void {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}

/**
 * Get cache stats
 */
export function getCacheStats() {
  return {
    size: cache.size,
    keys: Array.from(cache.keys())
  };
}
