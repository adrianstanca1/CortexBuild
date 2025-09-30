import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store';

// API Base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth-token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh-token');
        
        if (refreshToken) {
          // Try to refresh the token
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { token, refreshToken: newRefreshToken } = response.data;

          // Store new tokens
          localStorage.setItem('auth-token', token);
          if (newRefreshToken) {
            localStorage.setItem('refresh-token', newRefreshToken);
          }

          // Update the request header with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }

          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('auth-token');
        localStorage.removeItem('refresh-token');
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
    }

    return Promise.reject(error);
  }
);

// API helper functions
export const apiClient = {
  // Auth endpoints
  auth: {
    login: async (email: string, password: string) => {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    },
    register: async (userData: any) => {
      const response = await api.post('/auth/register', userData);
      return response.data;
    },
    logout: async () => {
      const response = await api.post('/auth/logout');
      return response.data;
    },
    refreshToken: async (refreshToken: string) => {
      const response = await api.post('/auth/refresh', { refreshToken });
      return response.data;
    },
    getCurrentUser: async () => {
      const response = await api.get('/auth/me');
      return response.data;
    },
  },

  // Project endpoints
  projects: {
    getAll: async (params?: any) => {
      const response = await api.get('/projects', { params });
      return response.data;
    },
    getById: async (id: string) => {
      const response = await api.get(`/projects/${id}`);
      return response.data;
    },
    create: async (projectData: any) => {
      const response = await api.post('/projects', projectData);
      return response.data;
    },
    update: async (id: string, projectData: any) => {
      const response = await api.put(`/projects/${id}`, projectData);
      return response.data;
    },
    delete: async (id: string) => {
      const response = await api.delete(`/projects/${id}`);
      return response.data;
    },
  },

  // Invoice endpoints
  invoices: {
    getAll: async (params?: any) => {
      const response = await api.get('/invoices', { params });
      return response.data;
    },
    getById: async (id: string) => {
      const response = await api.get(`/invoices/${id}`);
      return response.data;
    },
    create: async (invoiceData: any) => {
      const response = await api.post('/invoices', invoiceData);
      return response.data;
    },
    update: async (id: string, invoiceData: any) => {
      const response = await api.put(`/invoices/${id}`, invoiceData);
      return response.data;
    },
    delete: async (id: string) => {
      const response = await api.delete(`/invoices/${id}`);
      return response.data;
    },
  },

  // User endpoints
  users: {
    getAll: async (params?: any) => {
      const response = await api.get('/users', { params });
      return response.data;
    },
    getById: async (id: string) => {
      const response = await api.get(`/users/${id}`);
      return response.data;
    },
    update: async (id: string, userData: any) => {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    },
  },

  // Analytics endpoints
  analytics: {
    getDashboard: async () => {
      const response = await api.get('/analytics/dashboard');
      return response.data;
    },
    getProjectMetrics: async (projectId: string) => {
      const response = await api.get(`/analytics/projects/${projectId}`);
      return response.data;
    },
  },

  // Upload endpoints
  uploads: {
    uploadFile: async (file: File, metadata?: any) => {
      const formData = new FormData();
      formData.append('file', file);
      if (metadata) {
        Object.keys(metadata).forEach(key => {
          formData.append(key, metadata[key]);
        });
      }

      const response = await api.post('/uploads', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
  },
};

export default api;
