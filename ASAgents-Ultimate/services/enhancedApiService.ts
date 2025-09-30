/**
 * Enhanced API Service Client
 * Comprehensive service for interacting with ASAgents Ultimate backend APIs
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const API_TIMEOUT = 30000;

// Types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  summary?: any;
  timestamp: string;
  api_version?: string;
}

export interface ProjectFilters extends PaginationParams {
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
  budget_min?: number;
  budget_max?: number;
}

export interface InvoiceFilters extends PaginationParams {
  status?: string;
  client_id?: string;
  project_id?: string;
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TeamFilters extends PaginationParams {
  role?: string;
  status?: string;
  project_id?: string;
  search?: string;
  skills?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
  budget: number;
  spent: number;
  actualCost: number;
  startDate: string;
  endDate: string;
  location: {
    address: string;
    city: string;
    state: string;
    zip: string;
    coordinates: { lat: number; lng: number };
    postcode?: string;
  };
  client: {
    id: string;
    name: string;
    contact: string;
  };
  manager: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };
  team: Array<{
    id: string;
    name: string;
    role: string;
  }>;
  milestones: Array<{
    id: string;
    name: string;
    date: string;
    completed: boolean;
  }>;
  risks?: Array<{
    id: string;
    description: string;
    severity: string;
    probability: string;
  }>;
  documents?: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
  }>;
  companyId: string;
  projectType: string;
  workClassification: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  projectId: string;
  projectName?: string;
  clientId: string;
  clientName?: string;
  clientEmail?: string;
  issueDate: string;
  dueDate: string;
  status: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  amountPaid: number;
  balance: number;
  paymentTerms: string;
  notes: string;
  paymentDate?: string;
  paymentMethod?: string;
  daysOverdue?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: string;
  avatar: string | null;
  joinDate: string;
  location: string;
  skills: string[];
  certifications: string[];
  currentProjects: Array<{
    id: string;
    name: string;
    role: string;
  }>;
  performance: {
    projectsCompleted: number;
    onTimeDelivery: number;
    budgetAccuracy: number;
    clientSatisfaction: number;
    teamRating: number;
  };
  workload: {
    currentUtilization: number;
    hoursThisWeek: number;
    upcomingDeadlines: number;
  };
  contact: {
    emergencyContact: string;
    address: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Create Enhanced Axios instance
class EnhancedApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired, try to refresh
          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
              const response = await this.auth.refreshToken(refreshToken);
              localStorage.setItem('auth_token', response.token);
              // Retry the original request
              if (error.config) {
                error.config.headers.Authorization = `Bearer ${response.token}`;
                return this.client.request(error.config);
              }
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            localStorage.removeItem('auth_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Health Check
  async healthCheck() {
    const response = await this.client.get('/health');
    return response.data;
  }

  // Authentication API
  auth = {
    login: async (email: string, password: string) => {
      const response = await this.client.post('/auth/login', { email, password });
      return response.data;
    },

    logout: async () => {
      const response = await this.client.post('/auth/logout');
      return response.data;
    },

    refreshToken: async (refreshToken: string) => {
      const response = await this.client.post('/auth/refresh', { refreshToken });
      return response.data;
    },

    getCurrentUser: async () => {
      const response = await this.client.get('/auth/me');
      return response.data;
    }
  };

  // Projects API
  projects = {
    list: async (filters: ProjectFilters = {}): Promise<ApiResponse<{ projects: Project[] }>> => {
      const response = await this.client.get('/projects', { params: filters });
      return response.data;
    },

    get: async (id: string): Promise<Project> => {
      const response = await this.client.get(`/projects/${id}`);
      return response.data;
    },

    create: async (project: Partial<Project>): Promise<Project> => {
      const response = await this.client.post('/projects', project);
      return response.data;
    },

    update: async (id: string, updates: Partial<Project>): Promise<Project> => {
      const response = await this.client.put(`/projects/${id}`, updates);
      return response.data;
    },

    delete: async (id: string): Promise<void> => {
      await this.client.delete(`/projects/${id}`);
    },

    getAnalytics: async (id: string) => {
      const response = await this.client.get(`/projects/${id}/analytics`);
      return response.data;
    }
  };

  // Invoices API
  invoices = {
    list: async (filters: InvoiceFilters = {}): Promise<ApiResponse<{ invoices: Invoice[] }>> => {
      const response = await this.client.get('/invoices', { params: filters });
      return response.data;
    },

    get: async (id: string): Promise<Invoice> => {
      const response = await this.client.get(`/invoices/${id}`);
      return response.data;
    },

    create: async (invoice: Partial<Invoice>): Promise<Invoice> => {
      const response = await this.client.post('/invoices', invoice);
      return response.data;
    },

    update: async (id: string, updates: Partial<Invoice>): Promise<Invoice> => {
      const response = await this.client.put(`/invoices/${id}`, updates);
      return response.data;
    },

    delete: async (id: string): Promise<void> => {
      await this.client.delete(`/invoices/${id}`);
    },

    markAsPaid: async (id: string, paymentData: any) => {
      const response = await this.client.post(`/invoices/${id}/payments`, paymentData);
      return response.data;
    },

    downloadPdf: async (id: string): Promise<Blob> => {
      const response = await this.client.get(`/invoices/${id}/pdf`, {
        responseType: 'blob'
      });
      return response.data;
    }
  };

  // Team API
  team = {
    list: async (filters: TeamFilters = {}): Promise<ApiResponse<{ members: TeamMember[] }>> => {
      const response = await this.client.get('/team', { params: filters });
      return response.data;
    },

    get: async (id: string): Promise<TeamMember> => {
      const response = await this.client.get(`/team/${id}`);
      return response.data;
    },

    create: async (member: Partial<TeamMember>): Promise<TeamMember> => {
      const response = await this.client.post('/team', member);
      return response.data;
    },

    update: async (id: string, updates: Partial<TeamMember>): Promise<TeamMember> => {
      const response = await this.client.put(`/team/${id}`, updates);
      return response.data;
    },

    delete: async (id: string): Promise<void> => {
      await this.client.delete(`/team/${id}`);
    },

    getPerformance: async (id: string) => {
      const response = await this.client.get(`/team/${id}/performance`);
      return response.data;
    },

    getWorkload: async (id: string) => {
      const response = await this.client.get(`/team/${id}/workload`);
      return response.data;
    }
  };

  // Analytics API
  analytics = {
    getDashboard: async () => {
      const response = await this.client.get('/analytics/dashboard');
      return response.data;
    },

    getProjectMetrics: async (timeframe: string = '30d') => {
      const response = await this.client.get('/analytics/projects', {
        params: { timeframe }
      });
      return response.data;
    },

    getFinancialMetrics: async (timeframe: string = '30d') => {
      const response = await this.client.get('/analytics/financial', {
        params: { timeframe }
      });
      return response.data;
    },

    getTeamMetrics: async (timeframe: string = '30d') => {
      const response = await this.client.get('/analytics/team', {
        params: { timeframe }
      });
      return response.data;
    }
  };

  // Documents API
  documents = {
    upload: async (file: File, projectId: string, metadata: any = {}) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', projectId);
      formData.append('metadata', JSON.stringify(metadata));

      const response = await this.client.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },

    list: async (projectId?: string) => {
      const response = await this.client.get('/documents', {
        params: projectId ? { projectId } : {}
      });
      return response.data;
    },

    download: async (id: string): Promise<Blob> => {
      const response = await this.client.get(`/documents/${id}/download`, {
        responseType: 'blob'
      });
      return response.data;
    },

    delete: async (id: string): Promise<void> => {
      await this.client.delete(`/documents/${id}`);
    }
  };

  // Notifications API
  notifications = {
    list: async (filters: { read?: boolean; type?: string } = {}) => {
      const response = await this.client.get('/notifications', { params: filters });
      return response.data;
    },

    markAsRead: async (id: string) => {
      const response = await this.client.put(`/notifications/${id}/read`);
      return response.data;
    },

    markAllAsRead: async () => {
      const response = await this.client.put('/notifications/read-all');
      return response.data;
    },

    getUnreadCount: async (): Promise<number> => {
      const response = await this.client.get('/notifications/unread-count');
      return response.data.count;
    }
  };

  // Real-time updates
  realTime = {
    subscribe: (callback: (data: any) => void) => {
      // WebSocket connection for real-time updates
      const wsUrl = API_BASE_URL.replace(/^http/, 'ws') + '/ws';
      const ws = new WebSocket(wsUrl);
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        callback(data);
      };

      return () => ws.close();
    }
  };

  // AI Insights API
  ai = {
    getProjectInsights: async (projectId: string) => {
      const response = await this.client.get(`/ai/projects/${projectId}/insights`);
      return response.data;
    },

    getRecommendations: async (type: string = 'general') => {
      const response = await this.client.get('/ai/recommendations', {
        params: { type }
      });
      return response.data;
    },

    analyzeRisk: async (projectId: string) => {
      const response = await this.client.get(`/ai/projects/${projectId}/risk-analysis`);
      return response.data;
    }
  };
}

// Create and export singleton instance
export const apiClient = new EnhancedApiClient();

// Export error handler utility
export const handleApiError = (error: AxiosError) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    return {
      status,
      message: (data as any)?.message || 'An error occurred',
      details: (data as any)?.details || null
    };
  } else if (error.request) {
    // Request made but no response received
    return {
      status: 0,
      message: 'Network error - please check your connection',
      details: null
    };
  } else {
    // Something else happened
    return {
      status: 0,
      message: error.message || 'An unexpected error occurred',
      details: null
    };
  }
};

export default apiClient;