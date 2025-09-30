/**
 * API Service - Central API Client
 * Consolidates all API calls through a single, typed interface
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { authApi } from './mockApi';

// API Configuration
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:4000';
const API_TIMEOUT = 30000;

// Create Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
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
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired, try to refresh
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const { token } = await authApi.refreshToken(refreshToken);
          localStorage.setItem('auth_token', token);
          // Retry the original request
          if (error.config) {
            error.config.headers.Authorization = `Bearer ${token}`;
            return apiClient.request(error.config);
          }
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API Service Interface
export const api = {
  // Generic methods
  get: <T = any>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<T>(url, config).then((res) => res.data),
  
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.post<T>(url, data, config).then((res) => res.data),
  
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.put<T>(url, data, config).then((res) => res.data),
  
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.patch<T>(url, data, config).then((res) => res.data),
  
  delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<T>(url, config).then((res) => res.data),

  // Project endpoints
  getProjects: (companyId: string) =>
    api.get(`/api/companies/${companyId}/projects`),
  
  getProject: (projectId: string) =>
    api.get(`/api/projects/${projectId}`),
  
  createProject: (companyId: string, data: any) =>
    api.post(`/api/companies/${companyId}/projects`, data),
  
  updateProject: (projectId: string, data: any) =>
    api.patch(`/api/projects/${projectId}`, data),
  
  deleteProject: (projectId: string) =>
    api.delete(`/api/projects/${projectId}`),

  // User endpoints
  getUsers: (companyId: string) =>
    api.get(`/api/companies/${companyId}/users`),
  
  getUser: (userId: string) =>
    api.get(`/api/users/${userId}`),
  
  createUser: (companyId: string, data: any) =>
    api.post(`/api/companies/${companyId}/users`, data),
  
  updateUser: (userId: string, data: any) =>
    api.patch(`/api/users/${userId}`, data),

  // Task endpoints
  getTasks: (projectId: string) =>
    api.get(`/api/projects/${projectId}/tasks`),
  
  getTask: (taskId: string) =>
    api.get(`/api/tasks/${taskId}`),
  
  createTask: (projectId: string, data: any) =>
    api.post(`/api/projects/${projectId}/tasks`, data),
  
  updateTask: (taskId: string, data: any) =>
    api.patch(`/api/tasks/${taskId}`, data),
  
  deleteTask: (taskId: string) =>
    api.delete(`/api/tasks/${taskId}`),

  // Financial endpoints
  getInvoices: (companyId: string) =>
    api.get(`/api/companies/${companyId}/invoices`),
  
  createInvoice: (companyId: string, data: any) =>
    api.post(`/api/companies/${companyId}/invoices`, data),
  
  getExpenses: (companyId: string) =>
    api.get(`/api/companies/${companyId}/expenses`),
  
  createExpense: (companyId: string, data: any) =>
    api.post(`/api/companies/${companyId}/expenses`, data),

  // Company endpoints
  getCompany: (companyId: string) =>
    api.get(`/api/companies/${companyId}`),
  
  updateCompany: (companyId: string, data: any) =>
    api.patch(`/api/companies/${companyId}`, data),

  // Dashboard endpoints
  getDashboardData: (companyId: string, dateRange?: string) =>
    api.get(`/api/companies/${companyId}/dashboard`, {
      params: { dateRange },
    }),

  // File upload
  uploadFile: (formData: FormData) =>
    api.post('/api/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export default api;
