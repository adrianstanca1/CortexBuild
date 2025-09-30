import { useCallback, useRef, useState } from 'react';
import React from 'react';
import { 
  AppError, 
  wrapError, 
  withRetry, 
  safeAsync, 
  errorReporter, 
  getUserFriendlyErrorMessage,
  ErrorContext,
  RetryConfig 
} from '../utils/errorHandling';

export interface UseErrorHandlingOptions {
  component?: string;
  onError?: (error: AppError) => void;
  showToast?: (message: string, type: 'error' | 'success' | 'warning') => void;
  defaultRetryConfig?: Partial<RetryConfig>;
}

export interface ErrorState {
  error: AppError | null;
  isRetrying: boolean;
  retryCount: number;
  lastRetryAt: Date | null;
}

/**
 * Hook for comprehensive error handling with retry mechanisms
 */
export function useErrorHandling(options: UseErrorHandlingOptions = {}) {
  const { component, onError, showToast, defaultRetryConfig } = options;
  
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isRetrying: false,
    retryCount: 0,
    lastRetryAt: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const createContext = useCallback((operation: string, metadata?: Record<string, any>): ErrorContext => ({
    operation,
    component,
    timestamp: new Date().toISOString(),
    metadata,
  }), [component]);

  const handleError = useCallback((error: unknown, context: ErrorContext) => {
    const appError = wrapError(error, context);
    
    setErrorState(prev => ({
      ...prev,
      error: appError,
    }));

    // Report error
    errorReporter.report(appError);

    // Call custom error handler
    onError?.(appError);

    // Show toast notification
    if (showToast) {
      showToast(appError.userMessage, 'error');
    }

    return appError;
  }, [onError, showToast]);

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isRetrying: false,
      retryCount: 0,
      lastRetryAt: null,
    });
  }, []);

  const executeWithErrorHandling = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string,
    options: {
      retryConfig?: Partial<RetryConfig>;
      metadata?: Record<string, any>;
      silent?: boolean;
    } = {}
  ): Promise<T | null> => {
    const { retryConfig, metadata, silent } = options;
    const context = createContext(operationName, metadata);

    // Clear previous error
    if (!silent) {
      clearError();
    }

    try {
      const finalRetryConfig = { ...defaultRetryConfig, ...retryConfig };
      
      if (finalRetryConfig.maxAttempts && finalRetryConfig.maxAttempts > 1) {
        return await withRetry(operation, finalRetryConfig, context);
      } else {
        return await operation();
      }
    } catch (error) {
      if (!silent) {
        handleError(error, context);
      }
      return null;
    }
  }, [createContext, defaultRetryConfig, clearError, handleError]);

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string,
    retryConfig?: Partial<RetryConfig>
  ): Promise<T | null> => {
    const context = createContext(operationName);
    
    setErrorState(prev => ({
      ...prev,
      isRetrying: true,
      retryCount: prev.retryCount + 1,
      lastRetryAt: new Date(),
    }));

    try {
      const result = await withRetry(operation, retryConfig, context);
      
      // Clear error state on success
      setErrorState({
        error: null,
        isRetrying: false,
        retryCount: 0,
        lastRetryAt: null,
      });

      return result;
    } catch (error) {
      const appError = handleError(error, context);
      
      setErrorState(prev => ({
        ...prev,
        error: appError,
        isRetrying: false,
      }));

      return null;
    }
  }, [createContext, handleError]);

  const executeSafely = useCallback(async <T>(
    operation: () => Promise<T>,
    fallback: T,
    operationName: string,
    metadata?: Record<string, any>
  ): Promise<T> => {
    const context = createContext(operationName, metadata);
    
    try {
      return await safeAsync(operation, fallback, context);
    } catch (error) {
      // safeAsync shouldn't throw, but just in case
      handleError(error, context);
      return fallback;
    }
  }, [createContext, handleError]);

  const withAbortSignal = useCallback(<T>(
    operation: (signal: AbortSignal) => Promise<T>,
    operationName: string
  ) => {
    return async (): Promise<T | null> => {
      // Abort any previous operation
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const result = await operation(controller.signal);
        
        // Only clear the controller if this operation completed
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
        
        return result;
      } catch (error) {
        // Don't handle AbortError as a real error
        if (error instanceof Error && error.name === 'AbortError') {
          return null;
        }
        
        const context = createContext(operationName);
        handleError(error, context);
        return null;
      }
    };
  }, [createContext, handleError]);

  const abortCurrentOperation = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  return {
    // Error state
    error: errorState.error,
    isRetrying: errorState.isRetrying,
    retryCount: errorState.retryCount,
    lastRetryAt: errorState.lastRetryAt,
    hasError: !!errorState.error,

    // Error handling functions
    handleError: useCallback((error: unknown, operationName: string, metadata?: Record<string, any>) => {
      const context = createContext(operationName, metadata);
      return handleError(error, context);
    }, [createContext, handleError]),

    clearError,
    executeWithErrorHandling,
    executeWithRetry,
    executeSafely,
    withAbortSignal,
    abortCurrentOperation,

    // Utility functions
    getUserFriendlyMessage: useCallback((error: unknown) => {
      return getUserFriendlyErrorMessage(error);
    }, []),

    createAppError: useCallback((
      message: string, 
      operationName: string, 
      options?: {
        severity?: 'low' | 'medium' | 'high' | 'critical';
        userMessage?: string;
        isRetryable?: boolean;
        metadata?: Record<string, any>;
      }
    ) => {
      const context = createContext(operationName, options?.metadata);
      return new AppError(message, context, options);
    }, [createContext]),
  };
}

/**
 * Hook for handling async operations with loading states and error handling
 */
export function useAsyncOperation<T>(
  operation: () => Promise<T>,
  dependencies: React.DependencyList = [],
  options: UseErrorHandlingOptions & {
    immediate?: boolean;
    retryConfig?: Partial<RetryConfig>;
  } = {}
) {
  const { immediate = false, retryConfig, ...errorOptions } = options;
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<T | null>(null);
  
  const errorHandling = useErrorHandling(errorOptions);

  const execute = useCallback(async (operationName = 'async_operation') => {
    setLoading(true);
    
    const result = await errorHandling.executeWithErrorHandling(
      operation,
      operationName,
      { retryConfig }
    );
    
    if (result !== null) {
      setData(result);
    }
    
    setLoading(false);
    return result;
  }, [operation, errorHandling, retryConfig]);

  const retry = useCallback(() => {
    return execute('retry_operation');
  }, [execute]);

  // Auto-execute on mount if immediate is true
  React.useEffect(() => {
    if (immediate) {
      execute('initial_load');
    }
  }, [immediate, ...dependencies]);

  return {
    loading,
    data,
    execute,
    retry,
    ...errorHandling,
  };
}
