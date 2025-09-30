/**
 * Unified API Client
 * Handles all HTTP requests to both backend servers
 */

import { API_CONFIG, getAuthHeaders, API_ERRORS } from '../config/api.config';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
}

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
  success: boolean;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.loadToken();
  }

  private loadToken() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number = API_CONFIG.TIMEOUT
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = API_CONFIG.TIMEOUT,
      retries = API_CONFIG.RETRY_ATTEMPTS,
    } = options;

    const url = `${this.baseUrl}${endpoint}`;
    const authHeaders = getAuthHeaders(this.token || undefined);

    const fetchOptions: RequestInit = {
      method,
      headers: {
        ...authHeaders,
        ...headers,
      },
      ...(body && { body: JSON.stringify(body) }),
    };

    let lastError: any;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await this.fetchWithTimeout(url, fetchOptions, timeout);

        let data;
        const contentType = response.headers.get('content-type');
        
        if (contentType?.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }

        if (!response.ok) {
          // Handle specific error codes
          if (response.status === 401) {
            this.setToken(null);
            return {
              error: API_ERRORS.UNAUTHORIZED,
              status: response.status,
              success: false,
            };
          }

          return {
            error: data?.message || data?.error || API_ERRORS.SERVER_ERROR,
            status: response.status,
            success: false,
          };
        }

        return {
          data,
          status: response.status,
          success: true,
        };
      } catch (error: any) {
        lastError = error;

        // Don't retry on abort (timeout)
        if (error.name === 'AbortError') {
          return {
            error: API_ERRORS.TIMEOUT,
            status: 408,
            success: false,
          };
        }

        // Wait before retry
        if (attempt < retries) {
          await new Promise(resolve => 
            setTimeout(resolve, API_CONFIG.RETRY_DELAY * (attempt + 1))
          );
        }
      }
    }

    return {
      error: lastError?.message || API_ERRORS.NETWORK_ERROR,
      status: 0,
      success: false,
    };
  }

  // HTTP Methods
  async get<T = any>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T = any>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, body, method: 'POST' });
  }

  async put<T = any>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, body, method: 'PUT' });
  }

  async patch<T = any>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, body, method: 'PATCH' });
  }

  async delete<T = any>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // Upload file
  async uploadFile<T = any>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
      });
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {};
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data?.message || API_ERRORS.SERVER_ERROR,
          status: response.status,
          success: false,
        };
      }

      return {
        data,
        status: response.status,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error?.message || API_ERRORS.NETWORK_ERROR,
        status: 0,
        success: false,
      };
    }
  }
}

// Create instances for both backends
export const backendClient = new ApiClient(API_CONFIG.BACKEND_URL);
export const serverClient = new ApiClient(API_CONFIG.SERVER_URL);

// Export default instance (backend)
export default backendClient;
