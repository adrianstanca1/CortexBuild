/**
 * Centralized API Client
 * Handles all API communications with authentication and error handling
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class APIClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
    this.loadToken();
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (this.token && config.headers) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle errors globally
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.clearToken();
          // Redirect to login if not already there
          if (globalThis.location.pathname !== '/login') {
            globalThis.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private loadToken() {
    this.token = localStorage.getItem('token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  getClient() {
    return this.client;
  }
}

// Export singleton instance
export const apiClient = new APIClient();

// Export API modules
export const projectsAPI = {
  getAll: (companyId?: string) => 
    apiClient.getClient().get(`/api/projects${companyId ? `?company_id=${companyId}` : ''}`),
  
  getById: (id: string | number) => 
    apiClient.getClient().get(`/api/projects/${id}`),
  
  create: (data: any) => 
    apiClient.getClient().post('/api/projects', data),
  
  update: (id: string | number, data: any) => 
    apiClient.getClient().put(`/api/projects/${id}`, data),
  
  delete: (id: string | number) => 
    apiClient.getClient().delete(`/api/projects/${id}`),
};

// Tasks API
export const tasksAPI = {
  getAll: (projectId?: string | number) => 
    apiClient.getClient().get(`/api/tasks${projectId ? `?project_id=${projectId}` : ''}`),
  
  getById: (id: string | number) => 
    apiClient.getClient().get(`/api/tasks/${id}`),
  
  create: (data: any) => 
    apiClient.getClient().post('/api/tasks', data),
  
  update: (id: string | number, data: any) => 
    apiClient.getClient().put(`/api/tasks/${id}`, data),
  
  delete: (id: string | number) => 
    apiClient.getClient().delete(`/api/tasks/${id}`),
};

// Gantt API
export const ganttAPI = {
  getGantt: (projectId: string | number) => 
    apiClient.getClient().get(`/api/projects/${projectId}/gantt`),
  
  createTask: (projectId: string | number, data: any) => 
    apiClient.getClient().post(`/api/projects/${projectId}/gantt/tasks`, data),
  
  updateTask: (projectId: string | number, taskId: string, data: any) => 
    apiClient.getClient().put(`/api/projects/${projectId}/gantt/tasks/${taskId}`, data),
  
  deleteTask: (projectId: string | number, taskId: string) => 
    apiClient.getClient().delete(`/api/projects/${projectId}/gantt/tasks/${taskId}`),
  
  createDependency: (projectId: string | number, data: any) => 
    apiClient.getClient().post(`/api/projects/${projectId}/gantt/dependencies`, data),
  
  getCriticalPath: (projectId: string | number) => 
    apiClient.getClient().get(`/api/projects/${projectId}/gantt/critical-path`),
  
  optimize: (projectId: string | number, data: any) => 
    apiClient.getClient().post(`/api/projects/${projectId}/gantt/optimize`, data),
};

// WBS API
export const wbsAPI = {
  getWBS: (projectId: string | number) => 
    apiClient.getClient().get(`/api/projects/${projectId}/wbs`),
  
  createNode: (projectId: string | number, data: any) => 
    apiClient.getClient().post(`/api/projects/${projectId}/wbs/nodes`, data),
  
  updateNode: (projectId: string | number, nodeId: string, data: any) => 
    apiClient.getClient().put(`/api/projects/${projectId}/wbs/nodes/${nodeId}`, data),
  
  deleteNode: (projectId: string | number, nodeId: string) => 
    apiClient.getClient().delete(`/api/projects/${projectId}/wbs/nodes/${nodeId}`),
  
  getSummary: (projectId: string | number) => 
    apiClient.getClient().get(`/api/projects/${projectId}/wbs/summary`),
};

// Financial API
export const financialAPI = {
  getBudgets: (projectId: string | number) => 
    apiClient.getClient().get(`/api/projects/${projectId}/budgets`),
  
  createBudget: (projectId: string | number, data: any) => 
    apiClient.getClient().post(`/api/projects/${projectId}/budgets`, data),
  
  getContracts: (projectId: string | number) => 
    apiClient.getClient().get(`/api/projects/${projectId}/contracts`),
  
  createContract: (projectId: string | number, data: any) => 
    apiClient.getClient().post(`/api/projects/${projectId}/contracts`, data),
  
  getChangeOrders: (contractId: string) => 
    apiClient.getClient().get(`/api/contracts/${contractId}/change-orders`),
  
  createChangeOrder: (contractId: string, data: any) => 
    apiClient.getClient().post(`/api/contracts/${contractId}/change-orders`, data),
  
  getPurchaseOrders: (projectId: string | number) => 
    apiClient.getClient().get(`/api/projects/${projectId}/purchase-orders`),
  
  createPurchaseOrder: (projectId: string | number, data: any) => 
    apiClient.getClient().post(`/api/projects/${projectId}/purchase-orders`, data),
  
  getPaymentApplications: (projectId: string | number) => 
    apiClient.getClient().get(`/api/projects/${projectId}/payment-applications`),
  
  createPaymentApplication: (projectId: string | number, data: any) => 
    apiClient.getClient().post(`/api/projects/${projectId}/payment-applications`, data),
};

// CSI MasterFormat API
export const costCodesAPI = {
  getAll: () => 
    apiClient.getClient().get('/api/cost-codes'),
  
  getByCode: (code: string) => 
    apiClient.getClient().get(`/api/cost-codes/${code}`),
};

// Documents API
export const documentsAPI = {
  getAll: () => 
    apiClient.getClient().get('/api/documents'),
  
  getById: (id: string) => 
    apiClient.getClient().get(`/api/documents/${id}`),
  
  upload: (file: File, metadata?: any) => {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      Object.keys(metadata).forEach(key => {
        formData.append(key, metadata[key]);
      });
    }
    return apiClient.getClient().post('/api/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  delete: (id: string) => 
    apiClient.getClient().delete(`/api/documents/${id}`),
  
  getAnnotations: (documentId: string) => 
    apiClient.getClient().get(`/api/documents/${documentId}/annotations`),
  
  createAnnotation: (documentId: string, data: any) => 
    apiClient.getClient().post(`/api/documents/${documentId}/annotations`, data),
  
  getRevisions: (drawingId: string) => 
    apiClient.getClient().get(`/api/documents/${drawingId}/revisions`),
  
  createRevision: (drawingId: string, data: any) => 
    apiClient.getClient().post(`/api/documents/${drawingId}/revisions`, data),
};

// Analytics API
export const analyticsAPI = {
  getCashFlow: (projectId: string | number, params?: any) => 
    apiClient.getClient().get(`/api/projects/${projectId}/analytics/cash-flow`, { params }),
  
  getEarnedValue: (projectId: string | number, params?: any) => 
    apiClient.getClient().get(`/api/projects/${projectId}/analytics/earned-value`, { params }),
  
  getJobCost: (projectId: string | number, params?: any) => 
    apiClient.getClient().get(`/api/projects/${projectId}/analytics/job-cost`, { params }),
};

// RFIs API
export const rfisAPI = {
  getAll: () => apiClient.getClient().get('/api/rfis'),
  getById: (id: string) => apiClient.getClient().get(`/api/rfis/${id}`),
  create: (data: any) => apiClient.getClient().post('/api/rfis', data),
  update: (id: string, data: any) => apiClient.getClient().put(`/api/rfis/${id}`, data),
  delete: (id: string) => apiClient.getClient().delete(`/api/rfis/${id}`),
};

// Punch List API
export const punchListAPI = {
  getAll: () => apiClient.getClient().get('/api/punch-list'),
  getById: (id: string) => apiClient.getClient().get(`/api/punch-list/${id}`),
  create: (data: any) => apiClient.getClient().post('/api/punch-list', data),
  update: (id: string, data: any) => apiClient.getClient().put(`/api/punch-list/${id}`, data),
};

// Drawings API
export const drawingsAPI = {
  getAll: () => apiClient.getClient().get('/api/drawings'),
  getById: (id: string) => apiClient.getClient().get(`/api/drawings/${id}`),
  create: (data: any) => apiClient.getClient().post('/api/drawings', data),
};

// Daywork Sheets API
export const dayworkSheetsAPI = {
  getAll: () => apiClient.getClient().get('/api/daywork-sheets'),
  create: (data: any) => apiClient.getClient().post('/api/daywork-sheets', data),
};

// Delivery API
export const deliveryAPI = {
  getAll: () => apiClient.getClient().get('/api/deliveries'),
  create: (data: any) => apiClient.getClient().post('/api/deliveries', data),
};

// Time Entries API
export const timeEntriesAPI = {
  getAll: () => apiClient.getClient().get('/api/time-entries'),
  create: (data: any) => apiClient.getClient().post('/api/time-entries', data),
};

// Users API
export const usersAPI = {
  getAll: () => apiClient.getClient().get('/api/users'),
  getById: (id: string) => apiClient.getClient().get(`/api/users/${id}`),
};

// Companies API
export const companiesAPI = {
  getAll: () => apiClient.getClient().get('/api/companies'),
  getById: (id: string) => apiClient.getClient().get(`/api/companies/${id}`),
};

// AI API
export const aiAPI = {
  chat: (message: string, sessionId?: string) => 
    apiClient.getClient().post('/api/ai/chat', { message, sessionId }),
};

// Daily Log API
export const dailyLogAPI = {
  getAll: () => apiClient.getClient().get('/api/daily-logs'),
  create: (data: any) => apiClient.getClient().post('/api/daily-logs', data),
};

export default apiClient;
