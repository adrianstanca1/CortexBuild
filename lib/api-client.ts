/**
 * Centralized API Client
 * Connects to Express backend with real endpoints
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = import.meta.env.PROD
  ? '/api'  // Vercel/production
  : 'http://localhost:3001/api';  // Local development

const TOKEN_KEY = 'constructai_token';

// Create axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

// Add token to requests automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem(TOKEN_KEY);
      globalThis.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper to get data from response
const getData = <T>(response: any): T => {
  return response.data?.data || response.data;
};

// Projects API
export const projectsAPI = {
  getAll: async () => {
    const response = await api.get('/projects');
    return getData(response);
  },
  getById: async (id: string) => {
    const response = await api.get(`/projects/${id}`);
    return getData(response);
  },
  create: async (data: any) => {
    const response = await api.post('/projects', data);
    return getData(response);
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/projects/${id}`, data);
    return getData(response);
  },
  delete: async (id: string) => {
    const response = await api.delete(`/projects/${id}`);
    return getData(response);
  }
};

// Tasks API
export const tasksAPI = {
  getAll: async (params?: any) => {
    const response = await api.get('/tasks', { params });
    return getData(response);
  },
  getById: async (id: string) => {
    const response = await api.get(`/tasks/${id}`);
    return getData(response);
  },
  create: async (data: any) => {
    const response = await api.post('/tasks', data);
    return getData(response);
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/tasks/${id}`, data);
    return getData(response);
  },
  delete: async (id: string) => {
    const response = await api.delete(`/tasks/${id}`);
    return getData(response);
  },
  addComment: async (id: string, comment: any) => {
    const response = await api.post(`/tasks/${id}/comments`, comment);
    return getData(response);
  }
};

// RFIs API
export const rfisAPI = {
  getAll: async (params?: any) => {
    const response = await api.get('/rfis', { params });
    return getData(response);
  },
  getById: async (id: string) => {
    const response = await api.get(`/rfis/${id}`);
    return getData(response);
  },
  getVersions: async (rfiNumber: string) => {
    const response = await api.get(`/rfis/versions/${rfiNumber}`);
    return getData(response);
  },
  create: async (data: any) => {
    const response = await api.post('/rfis', data);
    return getData(response);
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/rfis/${id}`, data);
    return getData(response);
  },
  addComment: async (id: string, comment: any) => {
    const response = await api.post(`/rfis/${id}/comments`, comment);
    return getData(response);
  },
  addAnswer: async (id: string, answer: any) => {
    const response = await api.post(`/rfis/${id}/answer`, answer);
    return getData(response);
  }
};

// Documents API
export const documentsAPI = {
  getAll: async (params?: any) => {
    const response = await api.get('/documents', { params });
    return getData(response);
  },
  getById: async (id: string) => {
    const response = await api.get(`/documents/${id}`);
    return getData(response);
  },
  create: async (data: any) => {
    const response = await api.post('/documents', data);
    return getData(response);
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/documents/${id}`, data);
    return getData(response);
  },
  delete: async (id: string) => {
    const response = await api.delete(`/documents/${id}`);
    return getData(response);
  }
};

// Punch List API
export const punchListAPI = {
  getAll: async (params?: any) => {
    const response = await api.get('/punch-list', { params });
    return getData(response);
  },
  getById: async (id: string) => {
    const response = await api.get(`/punch-list/${id}`);
    return getData(response);
  },
  create: async (data: any) => {
    const response = await api.post('/punch-list', data);
    return getData(response);
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/punch-list/${id}`, data);
    return getData(response);
  },
  addComment: async (id: string, comment: any) => {
    const response = await api.post(`/punch-list/${id}/comments`, comment);
    return getData(response);
  }
};

// Drawings API
export const drawingsAPI = {
  getAll: async (projectId?: string) => {
    const response = await api.get('/drawings', { params: { project_id: projectId } });
    return getData(response);
  },
  getById: async (id: string) => {
    const response = await api.get(`/drawings/${id}`);
    return getData(response);
  },
  create: async (data: any) => {
    const response = await api.post('/drawings', data);
    return getData(response);
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/drawings/${id}`, data);
    return getData(response);
  }
};

// Daywork Sheets API
export const dayworkSheetsAPI = {
  getAll: async (projectId?: string) => {
    const response = await api.get('/daywork-sheets', { params: { project_id: projectId } });
    return getData(response);
  },
  getById: async (id: string) => {
    const response = await api.get(`/daywork-sheets/${id}`);
    return getData(response);
  },
  create: async (data: any) => {
    const response = await api.post('/daywork-sheets', data);
    return getData(response);
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/daywork-sheets/${id}`, data);
    return getData(response);
  },
  updateStatus: async (id: string, status: string) => {
    const response = await api.put(`/daywork-sheets/${id}/status`, { status });
    return getData(response);
  }
};

// Delivery API
export const deliveryAPI = {
  getItems: async (projectId?: string) => {
    const response = await api.get('/delivery', { params: { project_id: projectId } });
    return getData(response);
  }
};

// Time Entries API
export const timeEntriesAPI = {
  getAll: async (params?: any) => {
    const response = await api.get('/time-entries', { params });
    return getData(response);
  },
  create: async (data: any) => {
    const response = await api.post('/time-entries', data);
    return getData(response);
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/time-entries/${id}`, data);
    return getData(response);
  }
};

// Users API
export const usersAPI = {
  getAll: async () => {
    const response = await api.get('/users');
    return getData(response);
  },
  getById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return getData(response);
  },
  getByCompany: async (companyId: string) => {
    const response = await api.get(`/users/by-company/${companyId}`);
    return getData(response);
  }
};

// Companies API
export const companiesAPI = {
  getAll: async () => {
    const response = await api.get('/clients');
    return getData(response);
  },
  getById: async (id: string) => {
    const response = await api.get(`/clients/${id}`);
    return getData(response);
  }
};

// AI API
export const aiAPI = {
  getTaskSuggestions: async (taskData: any) => {
    const response = await api.post('/ai/task-suggestions', taskData);
    return getData(response);
  },
  getRFISuggestions: async (rfiData: any) => {
    const response = await api.post('/ai/rfi-suggestions', rfiData);
    return getData(response);
  },
  getSuggestedAction: async (userId: string) => {
    const response = await api.post('/ai/suggested-action', { userId });
    return getData(response);
  },
  getInsights: async (params?: any) => {
    const response = await api.get('/ai/insights', { params });
    return getData(response);
  },
  getProjectPredictions: async () => {
    const response = await api.get('/ai/predictions/projects');
    return getData(response);
  }
};

// Daily Log API
export const dailyLogAPI = {
  create: async (data: any) => {
    const response = await api.post('/daily-logs', data);
    return getData(response);
  },
  getByUser: async (userId: string) => {
    const response = await api.get(`/daily-logs/user/${userId}`);
    return getData(response);
  }
};

// Analytics API
export const analyticsAPI = {
  getProjectAnalytics: async (projectId: string) => {
    const response = await api.get(`/analytics/projects/${projectId}`);
    return getData(response);
  },
  getOverallStats: async () => {
    const response = await api.get('/analytics/overall');
    return getData(response);
  }
};

// Export default instance for custom calls
export default api;

