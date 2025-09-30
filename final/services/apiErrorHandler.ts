import { AppError, wrapError, withRetry, DEFAULT_RETRY_CONFIGS } from '../utils/errorHandling';

export interface ApiErrorResponse {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly details?: any;

  constructor(message: string, status: number, code?: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static fromResponse(response: Response, data?: any): ApiError {
    const message = data?.message || `HTTP ${response.status}: ${response.statusText}`;
    return new ApiError(message, response.status, data?.code, data?.details);
  }

  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  get isServerError(): boolean {
    return this.status >= 500;
  }

  get isNetworkError(): boolean {
    return this.status === 0 || this.message.toLowerCase().includes('network');
  }

  get isRetryable(): boolean {
    // Don't retry client errors (4xx) except for specific cases
    if (this.isClientError) {
      // Retry on rate limiting or request timeout
      return this.status === 408 || this.status === 429;
    }
    
    // Retry server errors and network errors
    return this.isServerError || this.isNetworkError;
  }

  getUserMessage(): string {
    switch (this.status) {
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 401:
        return 'Your session has expired. Please log in again.';
      case 403:
        return 'You don\'t have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 408:
        return 'Request timed out. Please try again.';
      case 409:
        return 'This action conflicts with the current state. Please refresh and try again.';
      case 413:
        return 'The file is too large. Please choose a smaller file.';
      case 422:
        return 'Invalid data provided. Please check your input.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Server error. Please try again later.';
      case 502:
      case 503:
      case 504:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        if (this.isNetworkError) {
          return 'Network connection issue. Please check your internet connection.';
        }
        return 'An unexpected error occurred. Please try again.';
    }
  }
}

/**
 * Enhanced fetch wrapper with comprehensive error handling
 */
export async function apiRequest<T = any>(
  url: string,
  options: RequestInit & {
    timeout?: number;
    retries?: number;
    retryDelay?: number;
  } = {}
): Promise<T> {
  const {
    timeout = 30000,
    retries = 3,
    retryDelay = 1000,
    ...fetchOptions
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await withRetry(
      async () => {
        const res = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            ...fetchOptions.headers,
          },
        });

        if (!res.ok) {
          let errorData;
          try {
            errorData = await res.json();
          } catch {
            // Response is not JSON
          }
          throw ApiError.fromResponse(res, errorData);
        }

        return res;
      },
      {
        ...DEFAULT_RETRY_CONFIGS.api,
        maxAttempts: retries,
        baseDelay: retryDelay,
        retryCondition: (error) => {
          if (error instanceof ApiError) {
            return error.isRetryable;
          }
          return DEFAULT_RETRY_CONFIGS.api.retryCondition?.(error) ?? false;
        },
      }
    );

    clearTimeout(timeoutId);

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return null as T;
    }

    const data = await response.json();
    return data as T;

  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) {
      throw error;
    }

    // Handle AbortError (timeout or manual abort)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Request timed out', 408);
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError('Network connection failed', 0);
    }

    // Wrap other errors
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      0
    );
  }
}

/**
 * API client with built-in error handling and retry logic
 */
export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string = '', defaultHeaders: Record<string, string> = {}) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = defaultHeaders;
  }

  setAuthToken(token: string) {
    this.defaultHeaders.Authorization = `Bearer ${token}`;
  }

  removeAuthToken() {
    delete this.defaultHeaders.Authorization;
  }

  private buildUrl(endpoint: string): string {
    if (endpoint.startsWith('http')) {
      return endpoint;
    }
    return `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  }

  async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return apiRequest<T>(this.buildUrl(endpoint), {
      ...options,
      method: 'GET',
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    });
  }

  async post<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    return apiRequest<T>(this.buildUrl(endpoint), {
      ...options,
      method: 'POST',
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    return apiRequest<T>(this.buildUrl(endpoint), {
      ...options,
      method: 'PUT',
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    return apiRequest<T>(this.buildUrl(endpoint), {
      ...options,
      method: 'PATCH',
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return apiRequest<T>(this.buildUrl(endpoint), {
      ...options,
      method: 'DELETE',
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    });
  }

  async upload<T>(endpoint: string, file: File, options: RequestInit = {}): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    return apiRequest<T>(this.buildUrl(endpoint), {
      ...options,
      method: 'POST',
      headers: {
        // Don't set Content-Type for FormData, let browser set it with boundary
        Authorization: this.defaultHeaders.Authorization,
        ...options.headers,
      },
      body: formData,
    });
  }
}

// Default API client instance
export const apiClient = new ApiClient();

/**
 * Higher-order function to wrap API calls with error handling
 */
export function withApiErrorHandling<T extends any[], R>(
  apiCall: (...args: T) => Promise<R>,
  context: {
    operation: string;
    component?: string;
  }
) {
  return async (...args: T): Promise<R> => {
    try {
      return await apiCall(...args);
    } catch (error) {
      if (error instanceof ApiError) {
        throw wrapError(error, {
          operation: context.operation,
          component: context.component,
          timestamp: new Date().toISOString(),
          metadata: {
            status: error.status,
            code: error.code,
            details: error.details,
          },
        }, {
          userMessage: error.getUserMessage(),
          isRetryable: error.isRetryable,
          severity: error.isServerError ? 'high' : 'medium',
        });
      }
      
      throw wrapError(error, {
        operation: context.operation,
        component: context.component,
        timestamp: new Date().toISOString(),
      });
    }
  };
}
