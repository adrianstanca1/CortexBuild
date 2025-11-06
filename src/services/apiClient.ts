/**
 * API Client for CortexBuild
 * Handles HTTP requests with offline support, authentication, and error handling
 */

import { supabase } from '../../supabaseClient';
import { getEnv } from '../utils/env';

export interface ApiRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data?: any;
  headers?: Record<string, string>;
  skipRetry?: boolean;
  timeout?: number;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
  headers?: Record<string, string>;
}

export class ApiClient {
  private baseURL: string;
  private defaultTimeout = 30000;

  constructor(baseURL: string = '') {
    this.baseURL = baseURL || getEnv('VITE_API_URL', 'http://localhost:3001/api');
  }

  async request<T = any>(config: ApiRequest): Promise<ApiResponse<T>> {
    const url = config.url.startsWith('http') ? config.url : `${this.baseURL}${config.url}`;

    try {
      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession();

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...config.headers
      };

      // Add auth token if available
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const requestConfig: RequestInit = {
        method: config.method,
        headers,
        signal: AbortSignal.timeout(config.timeout || this.defaultTimeout)
      };

      if (config.data && ['POST', 'PUT', 'PATCH'].includes(config.method)) {
        requestConfig.body = JSON.stringify(config.data);
      }

      const response = await fetch(url, requestConfig);

      let responseData: any;
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      if (!response.ok) {
        return {
          error: responseData?.message || `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          data: responseData
        };
      }

      return {
        data: responseData,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries())
      };

    } catch (error: any) {
      console.error('API Request failed:', error);

      return {
        error: error.message || 'Network request failed',
        status: 0
      };
    }
  }

  // Convenience methods
  async get<T = any>(url: string, config?: Omit<ApiRequest, 'method' | 'url'>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  async post<T = any>(url: string, data?: any, config?: Omit<ApiRequest, 'method' | 'url' | 'data'>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  async put<T = any>(url: string, data?: any, config?: Omit<ApiRequest, 'method' | 'url' | 'data'>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  async delete<T = any>(url: string, config?: Omit<ApiRequest, 'method' | 'url'>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  async patch<T = any>(url: string, data?: any, config?: Omit<ApiRequest, 'method' | 'url' | 'data'>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;

// Export class with uppercase alias for tests
export { ApiClient as APIClient };
