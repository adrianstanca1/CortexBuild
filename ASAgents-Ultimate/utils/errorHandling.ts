/**
 * Enhanced error handling utilities for better error management,
 * retry mechanisms, and user-friendly error messages
 */

export interface ErrorContext {
  operation: string;
  component?: string;
  userId?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryCondition?: (error: Error) => boolean;
}

export interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  context: ErrorContext;
  userAgent: string;
  url: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Default retry configuration for different types of operations
 */
export const DEFAULT_RETRY_CONFIGS: Record<string, RetryConfig> = {
  api: {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
    retryCondition: (error) => {
      // Retry on network errors, 5xx errors, but not on 4xx client errors
      if (error.name === 'AbortError') return false;
      if (error.message.includes('401') || error.message.includes('403')) return false;
      if (error.message.includes('404')) return false;
      return true;
    },
  },
  upload: {
    maxAttempts: 2,
    baseDelay: 2000,
    maxDelay: 8000,
    backoffFactor: 2,
    retryCondition: (error) => !error.message.includes('413'), // Don't retry on file too large
  },
  background: {
    maxAttempts: 5,
    baseDelay: 500,
    maxDelay: 30000,
    backoffFactor: 1.5,
    retryCondition: () => true,
  },
};

/**
 * Enhanced error class with additional context and metadata
 */
export class AppError extends Error {
  public readonly id: string;
  public readonly context: ErrorContext;
  public readonly severity: 'low' | 'medium' | 'high' | 'critical';
  public readonly userMessage: string;
  public readonly isRetryable: boolean;

  constructor(
    message: string,
    context: ErrorContext,
    options: {
      severity?: 'low' | 'medium' | 'high' | 'critical';
      userMessage?: string;
      isRetryable?: boolean;
      cause?: Error;
    } = {}
  ) {
    super(message);
    this.name = 'AppError';
    this.id = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.context = context;
    this.severity = options.severity || 'medium';
    this.userMessage = options.userMessage || this.getDefaultUserMessage();
    this.isRetryable = options.isRetryable ?? true;

    if (options.cause) {
      this.stack = `${this.stack}\nCaused by: ${options.cause.stack}`;
    }
  }

  private getDefaultUserMessage(): string {
    const operation = this.context.operation.toLowerCase();
    
    if (operation.includes('load') || operation.includes('fetch')) {
      return 'Failed to load data. Please try again.';
    }
    if (operation.includes('save') || operation.includes('create') || operation.includes('update')) {
      return 'Failed to save changes. Please try again.';
    }
    if (operation.includes('delete')) {
      return 'Failed to delete item. Please try again.';
    }
    if (operation.includes('upload')) {
      return 'Failed to upload file. Please check your connection and try again.';
    }
    
    return 'An unexpected error occurred. Please try again.';
  }

  toReport(): ErrorReport {
    return {
      id: this.id,
      message: this.message,
      stack: this.stack,
      context: this.context,
      userAgent: navigator.userAgent,
      url: window.location.href,
      severity: this.severity,
    };
  }
}

/**
 * Wraps an error in an AppError if it's not already one
 */
export function wrapError(
  error: unknown,
  context: ErrorContext,
  options?: {
    severity?: 'low' | 'medium' | 'high' | 'critical';
    userMessage?: string;
    isRetryable?: boolean;
  }
): AppError {
  if (error instanceof AppError) {
    return error;
  }

  const errorMessage = error instanceof Error ? error.message : String(error);
  const cause = error instanceof Error ? error : undefined;

  return new AppError(errorMessage, context, { ...options, cause });
}

/**
 * Retry function with exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  context?: ErrorContext
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIGS.api, ...config };
  let lastError: Error;
  let delay = finalConfig.baseDelay;

  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry if this is the last attempt
      if (attempt === finalConfig.maxAttempts) {
        break;
      }

      // Check if we should retry this error
      if (finalConfig.retryCondition && !finalConfig.retryCondition(lastError)) {
        break;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Increase delay for next attempt (exponential backoff)
      delay = Math.min(delay * finalConfig.backoffFactor, finalConfig.maxDelay);

      console.warn(`Retry attempt ${attempt}/${finalConfig.maxAttempts} for operation`, {
        error: lastError.message,
        context,
        nextDelay: delay,
      });
    }
  }

  // If we get here, all retries failed
  throw context 
    ? wrapError(lastError, context, { isRetryable: false })
    : lastError;
}

/**
 * Safe async operation wrapper that handles errors gracefully
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  fallback: T,
  context?: ErrorContext
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.warn('Safe async operation failed, using fallback:', {
      error: error instanceof Error ? error.message : String(error),
      context,
      fallback,
    });
    return fallback;
  }
}

/**
 * Debounced error reporter to prevent spam
 */
class ErrorReporter {
  private reportQueue: ErrorReport[] = [];
  private reportTimeout: number | null = null;
  private readonly BATCH_SIZE = 10;
  private readonly BATCH_DELAY = 2000;

  report(error: AppError): void {
    this.reportQueue.push(error.toReport());

    if (this.reportTimeout) {
      clearTimeout(this.reportTimeout);
    }

    this.reportTimeout = window.setTimeout(() => {
      this.flushReports();
    }, this.BATCH_DELAY);

    // Immediately flush if queue is full
    if (this.reportQueue.length >= this.BATCH_SIZE) {
      this.flushReports();
    }
  }

  private flushReports(): void {
    if (this.reportQueue.length === 0) return;

    const reports = [...this.reportQueue];
    this.reportQueue = [];

    if (this.reportTimeout) {
      clearTimeout(this.reportTimeout);
      this.reportTimeout = null;
    }

    // In a real app, send to error tracking service
    console.group('📊 Error Reports Batch');
    reports.forEach(report => {
      console.error(`[${report.severity.toUpperCase()}] ${report.message}`, report);
    });
    console.groupEnd();

    // TODO: Send to error tracking service
    // errorTrackingService.sendBatch(reports);
  }
}

export const errorReporter = new ErrorReporter();

/**
 * Global error handler setup
 */
export function setupGlobalErrorHandling(): void {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = wrapError(event.reason, {
      operation: 'unhandled_promise_rejection',
      component: 'global',
      timestamp: new Date().toISOString(),
    }, {
      severity: 'high',
      userMessage: 'An unexpected error occurred in the background.',
    });

    errorReporter.report(error);
    console.error('Unhandled promise rejection:', error);
  });

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    const error = wrapError(event.error || event.message, {
      operation: 'uncaught_error',
      component: 'global',
      timestamp: new Date().toISOString(),
      metadata: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    }, {
      severity: 'critical',
      userMessage: 'A critical error occurred. Please refresh the page.',
    });

    errorReporter.report(error);
    console.error('Uncaught error:', error);
  });
}

/**
 * User-friendly error messages for common error types
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.userMessage;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'Network connection issue. Please check your internet connection and try again.';
    }
    if (message.includes('timeout')) {
      return 'The operation took too long. Please try again.';
    }
    if (message.includes('unauthorized') || message.includes('401')) {
      return 'Your session has expired. Please log in again.';
    }
    if (message.includes('forbidden') || message.includes('403')) {
      return 'You don\'t have permission to perform this action.';
    }
    if (message.includes('not found') || message.includes('404')) {
      return 'The requested resource was not found.';
    }
    if (message.includes('server') || message.includes('500')) {
      return 'Server error. Please try again later.';
    }
  }

  return 'An unexpected error occurred. Please try again.';
}
