/**
 * Server-side HTTP Client with Retry Logic and Timeout Handling
 * Provides robust external API communication with automatic recovery
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';

/**
 * HTTP Error Interface
 */
export interface HTTPError {
  code: string;
  message: string;
  statusCode?: number;
  originalError?: any;
  retryable: boolean;
  timestamp: string;
}

/**
 * Retry Configuration
 */
export interface HTTPRetryConfig {
  maxRetries: number;
  retryDelay: number; // Base delay in ms
  retryableStatuses: number[];
  retryableMethods: string[];
  timeout: number; // Request timeout in ms
}

/**
 * Request Configuration Extension
 */
export interface HTTPRequestConfig extends AxiosRequestConfig {
  skipRetry?: boolean;
  customTimeout?: number;
}

/**
 * Default Retry Configuration
 */
const DEFAULT_RETRY_CONFIG: HTTPRetryConfig = {
  maxRetries: 3,
  retryDelay: 1000, // Start with 1 second
  retryableStatuses: [408, 429, 500, 502, 503, 504], // Timeout, Rate Limit, Server Errors
  retryableMethods: ['GET', 'HEAD', 'OPTIONS', 'PUT', 'DELETE'], // Safe to retry
  timeout: 30000 // 30 seconds default
};

/**
 * Enhanced HTTP Client Class
 */
class HTTPClient {
  private axiosInstance: AxiosInstance;
  private retryConfig: HTTPRetryConfig;
  private requestCount: number = 0;
  private failureCount: number = 0;

  constructor(baseURL?: string, retryConfig: Partial<HTTPRetryConfig> = {}) {
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };

    // Create Axios instance
    this.axiosInstance = axios.create({
      baseURL,
      timeout: this.retryConfig.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'CortexBuild-Server/1.0'
      }
    });

    // Setup interceptors
    this.setupRequestInterceptor();
    this.setupResponseInterceptor();
  }

  /**
   * Setup Request Interceptor
   * Track requests and set timeouts
   */
  private setupRequestInterceptor(): void {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Track request
        this.requestCount++;

        // Set custom timeout if provided
        if ((config as HTTPRequestConfig).customTimeout) {
          config.timeout = (config as HTTPRequestConfig).customTimeout;
        }

        // Log request in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`[HTTP Request] ${config.method?.toUpperCase()} ${config.url}`, {
            data: config.data,
            params: config.params,
            timeout: config.timeout
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
        // Log successful response in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`[HTTP Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
            status: response.status,
            data: response.data ? 'data received' : 'no data'
          });
        }

        return response;
      },
      async (error: AxiosError) => {
        const config = error.config as HTTPRequestConfig;

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

            // Log retry attempt
            if (process.env.NODE_ENV === 'development') {
              console.log(`[HTTP Retry] Attempt ${retryCount + 1}/${this.retryConfig.maxRetries} after ${delay}ms`, {
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
        const httpError = this.transformError(error);
        return Promise.reject(httpError);
      }
    );
  }

  /**
   * Check if error should be retried
   */
  private shouldRetry(error: AxiosError, config: HTTPRequestConfig): boolean {
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
   * Transform Axios error to HTTP error
   */
  private transformError(error: AxiosError): HTTPError {
    const statusCode = error.response?.status;

    // Default error message
    let message = 'An unexpected error occurred during HTTP request';
    let code = 'HTTP_ERROR';

    // Network error (no response)
    if (!error.response) {
      message = 'Network error. Unable to connect to external service.';
      code = 'NETWORK_ERROR';
    }
    // HTTP error codes
    else if (statusCode) {
      switch (statusCode) {
        case 400:
          message = 'Bad request to external service';
          code = 'BAD_REQUEST';
          break;
        case 401:
          message = 'Authentication failed with external service';
          code = 'UNAUTHORIZED';
          break;
        case 403:
          message = 'Access forbidden by external service';
          code = 'FORBIDDEN';
          break;
        case 404:
          message = 'Resource not found on external service';
          code = 'NOT_FOUND';
          break;
        case 408:
          message = 'Request timeout to external service';
          code = 'TIMEOUT';
          break;
        case 429:
          message = 'Rate limit exceeded on external service';
          code = 'RATE_LIMIT';
          break;
        case 500:
          message = 'External service internal error';
          code = 'SERVER_ERROR';
          break;
        case 502:
        case 503:
        case 504:
          message = 'External service temporarily unavailable';
          code = 'SERVICE_UNAVAILABLE';
          break;
        default:
          message = `External service error: ${statusCode}`;
          code = `HTTP_${statusCode}`;
      }
    }

    return {
      code,
      message,
      statusCode,
      originalError: error,
      retryable: this.shouldRetry(error, error.config as HTTPRequestConfig),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Public API Methods
   */

  /**
   * GET request
   */
  async get<T = any>(url: string, config?: HTTPRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, config);
    return response.data;
  }

  /**
   * POST request
   */
  async post<T = any>(url: string, data?: any, config?: HTTPRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, config);
    return response.data;
  }

  /**
   * PUT request
   */
  async put<T = any>(url: string, data?: any, config?: HTTPRequestConfig): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, data, config);
    return response.data;
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, config?: HTTPRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url, config);
    return response.data;
  }

  /**
   * PATCH request
   */
  async patch<T = any>(url: string, data?: any, config?: HTTPRequestConfig): Promise<T> {
    const response = await this.axiosInstance.patch<T>(url, data, config);
    return response.data;
  }

  /**
   * Custom request with full control
   */
  async request<T = any>(config: HTTPRequestConfig): Promise<T> {
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
}

/**
 * Create singleton instance for external API calls
 */
const httpClient = new HTTPClient();

export default httpClient;
export { HTTPClient };