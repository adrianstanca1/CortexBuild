/**
 * Enhanced API Client with Retry Logic, Exponential Backoff, and Error Handling
 * Provides robust API communication with automatic recovery
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';
import offlineManager from './offlineManager';
import { loggingConfig, Logger } from '../config/logging.config';

/**
 * API Error Interface
 */
export interface APIError {
  code: string;
  message: string;
  userMessage: string;
  statusCode?: number;
  originalError?: any;
  retryable: boolean;
  timestamp: string;
}

/**
 * Retry Configuration
 */
export interface RetryConfig {
  maxRetries: number;
  retryDelay: number; // Base delay in ms
  retryableStatuses: number[];
  retryableMethods: string[];
}

/**
 * Request Configuration Extension
 */
export interface APIRequestConfig extends AxiosRequestConfig {
  skipRetry?: boolean;
  skipErrorToast?: boolean;
  customTimeout?: number;
}

/**
 * Default Retry Configuration
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000, // Start with 1 second
  retryableStatuses: [408, 429, 500, 502, 503, 504], // Timeout, Rate Limit, Server Errors
  retryableMethods: ['GET', 'HEAD', 'OPTIONS', 'PUT', 'DELETE'] // Safe to retry
};

/**
 * Enhanced API Client Class
 */
class APIClient {
  private axiosInstance: AxiosInstance;
  private retryConfig: RetryConfig;
  private requestCount: number = 0;
  private failureCount: number = 0;

  constructor(baseURL: string = '/api', retryConfig: Partial<RetryConfig> = {}) {
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };

    // Create Axios instance
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 30000, // 30 seconds default
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Setup interceptors
    this.setupRequestInterceptor();
    this.setupResponseInterceptor();
  }

  /**
   * Setup Request Interceptor
   * Add auth token, track requests, handle offline queuing
   */
  private setupRequestInterceptor(): void {
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        // Check if offline and queue request if necessary
        if (!offlineManager.checkOnlineStatus()) {
          const method = config.method?.toUpperCase() || 'GET';
          const url = config.url || '';

          // Queue the request for later
          const requestId = await offlineManager.queueRequest({
            method,
            url,
            data: config.data,
            headers: config.headers as Record<string, string>,
            priority: this.getRequestPriority(method, url),
            config: config as APIRequestConfig
          });

          if (loggingConfig.api.verbose) {
            Logger.info(`[API Offline] Request queued: ${method} ${url} (ID: ${requestId})`);
          }

          // Return a promise that will be resolved when the request is processed
          return new Promise((resolve, reject) => {
            // The offline manager will handle this request when back online
            // For now, we'll reject with a specific error to indicate queuing
            const offlineError = new Error('Request queued due to offline status');
            (offlineError as any).isOfflineQueued = true;
            (offlineError as any).requestId = requestId;
            reject(offlineError);
          });
        }

        // Add authorization token if available
        const token = localStorage.getItem('constructai_token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Track request
        this.requestCount++;

        // Log request if enabled
        if (loggingConfig.api.logRequests && loggingConfig.api.verbose) {
          Logger.info(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
            data: config.data,
            params: config.params
          });
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  /**
   * Setup Response Interceptor
   * Handle errors, retry logic
   */
  private setupResponseInterceptor(): void {
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Log successful response in development (only if verbose)
        if (process.env.NODE_ENV === 'development' && loggingConfig.api.verbose) {
          Logger.debug(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
            status: response.status,
            data: response.data
          });
        }

        return response;
      },
      async (error: AxiosError) => {
        const config = error.config as APIRequestConfig;

        // Track failure
        this.failureCount++;

        // Check if should retry
        if (config && !config.skipRetry && this.shouldRetry(error, config)) {
          const retryCount = (config as any).__retryCount || 0;

          if (retryCount < this.retryConfig.maxRetries) {
            // Increment retry count
            (config as any).__retryCount = retryCount + 1;

            // Calculate delay with exponential backoff
            const delay = this.calculateDelay(retryCount);

            // Log retry attempt (only if verbose)
            if (process.env.NODE_ENV === 'development' && loggingConfig.api.verbose) {
              Logger.debug(`[API Retry] Attempt ${retryCount + 1}/${this.retryConfig.maxRetries} after ${delay}ms`, {
                url: config.url,
                method: config.method,
                error: error.message
              });
            }

            // Wait before retry
            await this.sleep(delay);

            // Retry request
            return this.axiosInstance(config);
          }
        }

        // Transform and reject error
        const apiError = this.transformError(error);

        // Show toast notification unless skipped
        if (!config?.skipErrorToast) {
          toast.error(apiError.userMessage, {
            duration: 5000,
            position: 'top-right'
          });
        }

        return Promise.reject(apiError);
      }
    );
  }

  /**
   * Check if error should be retried
   */
  private shouldRetry(error: AxiosError, config: APIRequestConfig): boolean {
    // Don't retry if explicitly disabled
    if (config.skipRetry) {
      return false;
    }

    // Only retry certain HTTP methods
    const method = config.method?.toUpperCase() || 'GET';
    if (!this.retryConfig.retryableMethods.includes(method)) {
      return false;
    }

    // Network errors (no response) are retryable
    if (!error.response) {
      return true;
    }

    // Check if status code is retryable
    const statusCode = error.response.status;
    return this.retryConfig.retryableStatuses.includes(statusCode);
  }

  /**
   * Calculate delay with exponential backoff
   */
  private calculateDelay(retryCount: number): number {
    // Exponential backoff: baseDelay * 2^retryCount
    // With jitter to prevent thundering herd
    const exponentialDelay = this.retryConfig.retryDelay * Math.pow(2, retryCount);
    const jitter = Math.random() * 1000; // Add up to 1 second jitter
    const maxDelay = 10000; // Cap at 10 seconds

    return Math.min(exponentialDelay + jitter, maxDelay);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Transform Axios error to API error
   */
  private transformError(error: AxiosError): APIError {
    const statusCode = error.response?.status;
    const errorData = error.response?.data as any;

    // Check if this is an offline-queued error
    if ((error as any).isOfflineQueued) {
      return {
        code: 'OFFLINE_QUEUED',
        message: 'Request queued due to offline status',
        userMessage: 'You are currently offline. Your request has been saved and will be sent when you reconnect.',
        statusCode: 0,
        originalError: error,
        retryable: false,
        timestamp: new Date().toISOString()
      };
    }

    // Default error message
    let userMessage = 'An unexpected error occurred. Please try again.';
    let code = 'UNKNOWN_ERROR';

    // Network error (no response)
    if (!error.response) {
      userMessage = 'Network error. Please check your internet connection.';
      code = 'NETWORK_ERROR';
    }
    // HTTP error codes
    else if (statusCode) {
      switch (statusCode) {
        case 400:
          userMessage = errorData?.message || 'Invalid request. Please check your input.';
          code = 'BAD_REQUEST';
          break;
        case 401:
          userMessage = 'Session expired. Please log in again.';
          code = 'UNAUTHORIZED';
          // Optionally redirect to login
          setTimeout(() => {
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          }, 2000);
          break;
        case 403:
          userMessage = 'You don\'t have permission to perform this action.';
          code = 'FORBIDDEN';
          break;
        case 404:
          userMessage = 'The requested resource was not found.';
          code = 'NOT_FOUND';
          break;
        case 408:
          userMessage = 'Request timeout. Please try again.';
          code = 'TIMEOUT';
          break;
        case 429:
          userMessage = 'Too many requests. Please wait a moment and try again.';
          code = 'RATE_LIMIT';
          break;
        case 500:
          userMessage = 'Server error. We\'re working on it.';
          code = 'SERVER_ERROR';
          break;
        case 502:
        case 503:
        case 504:
          userMessage = 'Service temporarily unavailable. Please try again.';
          code = 'SERVICE_UNAVAILABLE';
          break;
        default:
          userMessage = errorData?.message || `Error ${statusCode}`;
          code = `HTTP_${statusCode}`;
      }
    }

    return {
      code,
      message: error.message,
      userMessage,
      statusCode,
      originalError: error,
      retryable: this.shouldRetry(error, error.config as APIRequestConfig),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Public API Methods
   */

  /**
   * GET request
   */
  async get<T = any>(url: string, config?: APIRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, config);
    return response.data;
  }

  /**
   * POST request
   */
  async post<T = any>(url: string, data?: any, config?: APIRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, config);
    return response.data;
  }

  /**
   * PUT request
   */
  async put<T = any>(url: string, data?: any, config?: APIRequestConfig): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, data, config);
    return response.data;
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, config?: APIRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url, config);
    return response.data;
  }

  /**
   * PATCH request
   */
  async patch<T = any>(url: string, data?: any, config?: APIRequestConfig): Promise<T> {
    const response = await this.axiosInstance.patch<T>(url, data, config);
    return response.data;
  }

  /**
   * Custom request with full control
   */
  async request<T = any>(config: APIRequestConfig): Promise<T> {
    const response = await this.axiosInstance.request<T>(config);
    return response.data;
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      totalRequests: this.requestCount,
      totalFailures: this.failureCount,
      successRate: this.requestCount > 0
        ? ((this.requestCount - this.failureCount) / this.requestCount) * 100
        : 100
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.requestCount = 0;
    this.failureCount = 0;
  }

  /**
   * Determine request priority for offline queuing
   */
  private getRequestPriority(method: string, url: string): 'high' | 'normal' | 'low' {
    // High priority for critical operations
    if (method === 'POST' && (url.includes('/auth/') || url.includes('/emergency'))) {
      return 'high';
    }

    // Normal priority for standard CRUD operations
    if (['GET', 'POST', 'PUT', 'DELETE'].includes(method)) {
      return 'normal';
    }

    // Low priority for everything else
    return 'low';
  }
}

/**
 * Create singleton instance
 */
const apiClient = new APIClient();

export default apiClient;
export { APIClient };
