// 🏗️ API Integration Layer
// Comprehensive API client with authentication, caching, and error handling

import { User, Project, Task, Document, SafetyIncident, Equipment } from '../types';

// API Configuration
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'https://api.asagents.construction.com';
const API_VERSION = 'v1';
const API_TIMEOUT = 30000; // 30 seconds

// API Response Types
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// Request Options
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  cache?: boolean;
  retries?: number;
}

// Authentication Token Management
class TokenManager {
  private static instance: TokenManager;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: Date | null = null;

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  setTokens(accessToken: string, refreshToken: string, expiresIn: number) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.tokenExpiry = new Date(Date.now() + expiresIn * 1000);
    
    // Store in localStorage for persistence
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('token_expiry', this.tokenExpiry.toISOString());
  }

  getAccessToken(): string | null {
    if (!this.accessToken) {
      this.loadTokensFromStorage();
    }
    
    if (this.isTokenExpired()) {
      this.refreshAccessToken();
    }
    
    return this.accessToken;
  }

  private loadTokensFromStorage() {
    this.accessToken = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
    const expiry = localStorage.getItem('token_expiry');
    this.tokenExpiry = expiry ? new Date(expiry) : null;
  }

  private isTokenExpired(): boolean {
    if (!this.tokenExpiry) return true;
    return new Date() >= this.tokenExpiry;
  }

  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      this.clearTokens();
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${API_VERSION}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      this.setTokens(data.accessToken, data.refreshToken, data.expiresIn);
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expiry');
  }
}

// Cache Management
class CacheManager {
  private static instance: CacheManager;
  private cache = new Map<string, { data: any; expiry: Date }>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  set(key: string, data: any, ttl?: number): void {
    const expiry = new Date(Date.now() + (ttl || this.defaultTTL));
    this.cache.set(key, { data, expiry });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (new Date() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}

// Main API Client
export class ApiClient {
  private tokenManager = TokenManager.getInstance();
  private cacheManager = CacheManager.getInstance();

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = API_TIMEOUT,
      cache = false,
      retries = 3
    } = options;

    // Check cache for GET requests
    const cacheKey = `${method}:${endpoint}:${JSON.stringify(body)}`;
    if (method === 'GET' && cache) {
      const cached = this.cacheManager.get(cacheKey);
      if (cached) return cached;
    }

    // Prepare request
    const url = `${API_BASE_URL}/${API_VERSION}${endpoint}`;
    const accessToken = this.tokenManager.getAccessToken();
    
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...headers,
    };

    if (accessToken) {
      requestHeaders['Authorization'] = `Bearer ${accessToken}`;
    }

    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
      signal: AbortSignal.timeout(timeout),
    };

    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body);
    }

    // Make request with retries
    let lastError: Error;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, requestOptions);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new ApiError(
            errorData.code || `HTTP_${response.status}`,
            errorData.message || response.statusText,
            errorData
          );
        }

        const data: ApiResponse<T> = await response.json();
        
        // Cache successful GET requests
        if (method === 'GET' && cache && data.success) {
          this.cacheManager.set(cacheKey, data);
        }

        return data;
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on authentication errors
        if (error instanceof ApiError && error.code.includes('AUTH')) {
          throw error;
        }
        
        // Don't retry on the last attempt
        if (attempt === retries) {
          throw error;
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    throw lastError!;
  }

  // Authentication Methods
  async login(email: string, password: string): Promise<User> {
    const response = await this.makeRequest<{ user: User; accessToken: string; refreshToken: string; expiresIn: number }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });

    if (response.success) {
      this.tokenManager.setTokens(
        response.data.accessToken,
        response.data.refreshToken,
        response.data.expiresIn
      );
      return response.data.user;
    }

    throw new Error(response.message || 'Login failed');
  }

  async logout(): Promise<void> {
    try {
      await this.makeRequest('/auth/logout', { method: 'POST' });
    } finally {
      this.tokenManager.clearTokens();
      this.cacheManager.clear();
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.makeRequest<User>('/auth/me', { cache: true });
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to get current user');
  }

  // Project Methods
  async getProjects(params?: { page?: number; limit?: number; search?: string }): Promise<{ projects: Project[]; pagination: any }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    const endpoint = `/projects${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await this.makeRequest<Project[]>(endpoint, { cache: true });
    
    if (response.success) {
      return {
        projects: response.data,
        pagination: response.pagination || {}
      };
    }
    throw new Error(response.message || 'Failed to get projects');
  }

  async getProject(id: string): Promise<Project> {
    const response = await this.makeRequest<Project>(`/projects/${id}`, { cache: true });
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to get project');
  }

  async createProject(project: Partial<Project>): Promise<Project> {
    const response = await this.makeRequest<Project>('/projects', {
      method: 'POST',
      body: project,
    });
    
    if (response.success) {
      // Invalidate projects cache
      this.cacheManager.invalidatePattern('GET:/projects');
      return response.data;
    }
    throw new Error(response.message || 'Failed to create project');
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const response = await this.makeRequest<Project>(`/projects/${id}`, {
      method: 'PATCH',
      body: updates,
    });
    
    if (response.success) {
      // Invalidate related cache
      this.cacheManager.invalidatePattern(`projects/${id}`);
      this.cacheManager.invalidatePattern('GET:/projects');
      return response.data;
    }
    throw new Error(response.message || 'Failed to update project');
  }

  // Task Methods
  async getTasks(projectId: string, params?: { assignee?: string; status?: string }): Promise<Task[]> {
    const queryParams = new URLSearchParams();
    if (params?.assignee) queryParams.append('assignee', params.assignee);
    if (params?.status) queryParams.append('status', params.status);

    const endpoint = `/projects/${projectId}/tasks${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await this.makeRequest<Task[]>(endpoint, { cache: true });
    
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to get tasks');
  }

  async createTask(projectId: string, task: Partial<Task>): Promise<Task> {
    const response = await this.makeRequest<Task>(`/projects/${projectId}/tasks`, {
      method: 'POST',
      body: task,
    });
    
    if (response.success) {
      this.cacheManager.invalidatePattern(`projects/${projectId}/tasks`);
      return response.data;
    }
    throw new Error(response.message || 'Failed to create task');
  }

  async updateTask(projectId: string, taskId: string, updates: Partial<Task>): Promise<Task> {
    const response = await this.makeRequest<Task>(`/projects/${projectId}/tasks/${taskId}`, {
      method: 'PATCH',
      body: updates,
    });
    
    if (response.success) {
      this.cacheManager.invalidatePattern(`projects/${projectId}/tasks`);
      return response.data;
    }
    throw new Error(response.message || 'Failed to update task');
  }

  // Document Methods
  async uploadDocument(projectId: string, file: File, metadata?: any): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    const response = await fetch(`${API_BASE_URL}/${API_VERSION}/projects/${projectId}/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.tokenManager.getAccessToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload document');
    }

    const data: ApiResponse<Document> = await response.json();
    if (data.success) {
      this.cacheManager.invalidatePattern(`projects/${projectId}/documents`);
      return data.data;
    }
    throw new Error(data.message || 'Failed to upload document');
  }

  async getDocuments(projectId: string): Promise<Document[]> {
    const response = await this.makeRequest<Document[]>(`/projects/${projectId}/documents`, { cache: true });
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to get documents');
  }

  // Safety Methods
  async getSafetyIncidents(projectId: string): Promise<SafetyIncident[]> {
    const response = await this.makeRequest<SafetyIncident[]>(`/projects/${projectId}/safety/incidents`, { cache: true });
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to get safety incidents');
  }

  async createSafetyIncident(projectId: string, incident: Partial<SafetyIncident>): Promise<SafetyIncident> {
    const response = await this.makeRequest<SafetyIncident>(`/projects/${projectId}/safety/incidents`, {
      method: 'POST',
      body: incident,
    });
    
    if (response.success) {
      this.cacheManager.invalidatePattern(`projects/${projectId}/safety`);
      return response.data;
    }
    throw new Error(response.message || 'Failed to create safety incident');
  }

  // Equipment Methods
  async getEquipment(projectId?: string): Promise<Equipment[]> {
    const endpoint = projectId ? `/projects/${projectId}/equipment` : '/equipment';
    const response = await this.makeRequest<Equipment[]>(endpoint, { cache: true });
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to get equipment');
  }

  async createEquipment(equipment: Partial<Equipment>): Promise<Equipment> {
    const response = await this.makeRequest<Equipment>('/equipment', {
      method: 'POST',
      body: equipment,
    });
    
    if (response.success) {
      this.cacheManager.invalidatePattern('equipment');
      return response.data;
    }
    throw new Error(response.message || 'Failed to create equipment');
  }

  // Real-time Updates (WebSocket)
  private websocket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connectWebSocket(onMessage?: (data: any) => void): void {
    const token = this.tokenManager.getAccessToken();
    if (!token) {
      console.warn('No access token available for WebSocket connection');
      return;
    }

    const wsUrl = `${API_BASE_URL.replace('http', 'ws')}/${API_VERSION}/ws?token=${token}`;
    this.websocket = new WebSocket(wsUrl);

    this.websocket.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (onMessage) {
          onMessage(data);
        }
        
        // Handle cache invalidation
        if (data.type === 'cache_invalidate') {
          this.cacheManager.invalidatePattern(data.pattern);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.websocket.onclose = () => {
      console.log('WebSocket disconnected');
      this.attemptReconnect(onMessage);
    };

    this.websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private attemptReconnect(onMessage?: (data: any) => void): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.pow(2, this.reconnectAttempts) * 1000;
      
      setTimeout(() => {
        console.log(`Attempting WebSocket reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connectWebSocket(onMessage);
      }, delay);
    }
  }

  disconnectWebSocket(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }

  // Utility Methods
  clearCache(): void {
    this.cacheManager.clear();
  }

  invalidateCache(pattern: string): void {
    this.cacheManager.invalidatePattern(pattern);
  }
}

// Custom Error Class
class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export types
export type { ApiResponse, ApiError, RequestOptions };
