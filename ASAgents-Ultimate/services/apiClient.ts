import environment from '../config/environment';
import { apiCache, performanceMonitor } from '../utils/performance';

// Enhanced API client with caching, retry logic, and performance monitoring
export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  };
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  cache?: boolean;
  cacheTTL?: number;
  retries?: number;
  timeout?: number;
  signal?: AbortSignal;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private retryAttempts: number = 3;
  private retryDelay: number = 1000;

  constructor() {
    const env = environment;
    this.baseUrl = env.apiUrl || import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // Set authentication token
  setAuthToken(token: string) {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Remove authentication token
  clearAuthToken() {
    delete this.defaultHeaders['Authorization'];
  }

  // Generate cache key for requests
  private getCacheKey(url: string, options: ApiRequestOptions): string {
    const method = options.method || 'GET';
    const body = options.body ? JSON.stringify(options.body) : '';
    return `${method}:${url}:${body}`;
  }

  // Retry logic with exponential backoff
  private async retryRequest<T>(
    fn: () => Promise<T>,
    retries: number = this.retryAttempts
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0 && this.shouldRetry(error)) {
        await this.delay(this.retryDelay * (this.retryAttempts - retries + 1));
        return this.retryRequest(fn, retries - 1);
      }
      throw error;
    }
  }

  // Check if error should trigger a retry
  private shouldRetry(error: any): boolean {
    if (error.name === 'AbortError') return false;
    if (error.status >= 400 && error.status < 500) return false; // Client errors
    return true; // Retry for network errors and 5xx errors
  }

  // Delay utility for retry logic
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Main request method
  async request<T = any>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      cache = method === 'GET',
      cacheTTL = 5 * 60 * 1000, // 5 minutes
      retries = this.retryAttempts,
      timeout = 30000,
      signal,
    } = options;

    const url = `${this.baseUrl}${endpoint}`;
    const cacheKey = this.getCacheKey(url, options);

    // Check cache for GET requests
    if (cache && method === 'GET') {
      const cached = apiCache.get(cacheKey);
      if (cached) {
        performanceMonitor.recordMetric({
          name: `api_${endpoint.replace(/\//g, '_')}_cached`,
          value: 1,
          timestamp: Date.now(),
          type: 'counter',
        });
        return cached;
      }
    }

    // Start performance monitoring
    const metricName = `api_${endpoint.replace(/\//g, '_')}`;
    performanceMonitor.startTimer(metricName);

    try {
      const response = await this.retryRequest(async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
          const fetchResponse = await fetch(url, {
            method,
            headers: {
              ...this.defaultHeaders,
              ...headers,
            },
            body: body ? JSON.stringify(body) : undefined,
            signal: signal || controller.signal,
          });

          clearTimeout(timeoutId);

          if (!fetchResponse.ok) {
            throw new Error(`HTTP ${fetchResponse.status}: ${fetchResponse.statusText}`);
          }

          const data = await fetchResponse.json();
          return data;
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      }, retries);

      // Cache successful GET requests
      if (cache && method === 'GET') {
        apiCache.set(cacheKey, response, cacheTTL);
      }

      // Record successful request
      performanceMonitor.endTimer(metricName, { 
        status: 'success',
        method,
        endpoint 
      });

      return response;

    } catch (error) {
      // Record failed request
      performanceMonitor.endTimer(metricName, { 
        status: 'error',
        method,
        endpoint,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  }

  // Convenience methods
  async get<T = any>(
    endpoint: string,
    params?: Record<string, any>,
    options?: Omit<ApiRequestOptions, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<T>(`${endpoint}${queryString}`, {
      ...options,
      method: 'GET',
    });
  }

  async post<T = any>(
    endpoint: string,
    data?: any,
    options?: Omit<ApiRequestOptions, 'method'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data,
    });
  }

  async put<T = any>(
    endpoint: string,
    data?: any,
    options?: Omit<ApiRequestOptions, 'method'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data,
    });
  }

  async patch<T = any>(
    endpoint: string,
    data?: any,
    options?: Omit<ApiRequestOptions, 'method'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data,
    });
  }

  async delete<T = any>(
    endpoint: string,
    options?: Omit<ApiRequestOptions, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }

  // Paginated requests
  async getPaginated<T = any>(
    endpoint: string,
    params: PaginationParams = {},
    options?: Omit<ApiRequestOptions, 'method' | 'body'>
  ): Promise<ApiResponse<T[]>> {
    const {
      page = 1,
      limit = 20,
      sort,
      order = 'asc',
      search,
      filters = {},
    } = params;

    const queryParams: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString(),
    };

    if (sort) {
      queryParams.sort = sort;
      queryParams.order = order;
    }

    if (search) {
      queryParams.search = search;
    }

    // Add filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams[key] = value.toString();
      }
    });

    return this.get<T[]>(endpoint, queryParams, options);
  }

  // File upload
  async uploadFile(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<any>> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);

      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, value.toString());
        });
      }

      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Invalid response format'));
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error('Upload failed'));

      xhr.open('POST', `${this.baseUrl}${endpoint}`);
      
      // Add auth header if available
      if (this.defaultHeaders['Authorization']) {
        xhr.setRequestHeader('Authorization', this.defaultHeaders['Authorization']);
      }

      xhr.send(formData);
    });
  }

  // Batch requests
  async batch<T = any>(
    requests: Array<{
      endpoint: string;
      options?: ApiRequestOptions;
    }>
  ): Promise<Array<ApiResponse<T> | Error>> {
    const promises = requests.map(({ endpoint, options }) =>
      this.request<T>(endpoint, options).catch(error => error)
    );

    return Promise.all(promises);
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.get('/health', undefined, { cache: false, timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  // Clear cache
  clearCache(): void {
    apiCache.clear();
  }

  // Get cache stats
  getCacheStats() {
    return apiCache.getStats();
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export types
export type { ApiResponse, ApiRequestOptions, PaginationParams };
