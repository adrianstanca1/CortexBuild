/**
 * API Configuration
 * Central configuration for all API endpoints and connections
 */

// API Base URLs
export const API_CONFIG = {
  // Backend API (Port 3000)
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api',
  
  // Server API (Port 4000)
  SERVER_URL: import.meta.env.VITE_SERVER_URL || 'http://localhost:4000/api',
  
  // WebSocket URLs
  BACKEND_WS: import.meta.env.VITE_BACKEND_WS || 'ws://localhost:3000',
  SERVER_WS: import.meta.env.VITE_SERVER_WS || 'ws://localhost:4000',
  
  // Timeout settings
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Backend API Endpoints (Port 3000)
export const BACKEND_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
  },
  
  // Projects
  PROJECTS: {
    LIST: '/projects',
    CREATE: '/projects',
    GET: (id: string) => `/projects/${id}`,
    UPDATE: (id: string) => `/projects/${id}`,
    DELETE: (id: string) => `/projects/${id}`,
    STATS: (id: string) => `/projects/${id}/stats`,
  },
  
  // Users
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    GET: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
  },
  
  // Documents
  DOCUMENTS: {
    LIST: '/documents',
    UPLOAD: '/documents/upload',
    GET: (id: string) => `/documents/${id}`,
    DELETE: (id: string) => `/documents/${id}`,
  },
  
  // Equipment
  EQUIPMENT: {
    LIST: '/equipment',
    CREATE: '/equipment',
    GET: (id: string) => `/equipment/${id}`,
    UPDATE: (id: string) => `/equipment/${id}`,
    DELETE: (id: string) => `/equipment/${id}`,
  },
  
  // Invoices
  INVOICES: {
    LIST: '/invoices',
    CREATE: '/invoices',
    GET: (id: string) => `/invoices/${id}`,
    UPDATE: (id: string) => `/invoices/${id}`,
    DELETE: (id: string) => `/invoices/${id}`,
    PAY: (id: string) => `/invoices/${id}/pay`,
  },
  
  // Reports
  REPORTS: {
    GENERATE: '/reports/generate',
    LIST: '/reports',
    GET: (id: string) => `/reports/${id}`,
  },
  
  // Time Tracking
  TIME_TRACKING: {
    LIST: '/time-tracking',
    CREATE: '/time-tracking',
    UPDATE: (id: string) => `/time-tracking/${id}`,
    DELETE: (id: string) => `/time-tracking/${id}`,
  },
  
  // Workflows
  WORKFLOWS: {
    LIST: '/workflows',
    CREATE: '/workflows',
    EXECUTE: (id: string) => `/workflows/${id}/execute`,
  },
  
  // Health
  HEALTH: '/health',
};

// Server API Endpoints (Port 4000)
export const SERVER_ENDPOINTS = {
  // System
  SYSTEM: {
    HEALTH: '/system/health',
    STATUS: '/system/status',
    METRICS: '/system/metrics',
  },
  
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY: '/auth/verify',
    REFRESH: '/auth/refresh',
  },
  
  // Dashboard
  DASHBOARD: {
    OVERVIEW: '/dashboard/overview',
    STATS: '/dashboard/stats',
    RECENT: '/dashboard/recent',
  },
  
  // Analytics
  ANALYTICS: {
    OVERVIEW: '/analytics/overview',
    PROJECTS: '/analytics/projects',
    REVENUE: '/analytics/revenue',
    PERFORMANCE: '/analytics/performance',
  },
  
  // Tasks
  TASKS: {
    LIST: '/tasks',
    CREATE: '/tasks',
    GET: (id: string) => `/tasks/${id}`,
    UPDATE: (id: string) => `/tasks/${id}`,
    DELETE: (id: string) => `/tasks/${id}`,
    COMPLETE: (id: string) => `/tasks/${id}/complete`,
  },
  
  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    GET: (id: string) => `/notifications/${id}`,
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
  },
  
  // Tenants (Multi-tenancy)
  TENANTS: {
    LIST: '/tenants',
    CREATE: '/tenants',
    GET: (id: string) => `/tenants/${id}`,
    UPDATE: (id: string) => `/tenants/${id}`,
  },
  
  // Companies
  COMPANIES: {
    LIST: '/companies',
    CREATE: '/companies',
    GET: (id: string) => `/companies/${id}`,
    UPDATE: (id: string) => `/companies/${id}`,
  },
  
  // Expenses
  EXPENSES: {
    LIST: '/expenses',
    CREATE: '/expenses',
    GET: (id: string) => `/expenses/${id}`,
    UPDATE: (id: string) => `/expenses/${id}`,
    DELETE: (id: string) => `/expenses/${id}`,
  },
};

// API Headers
export const getAuthHeaders = (token?: string) => ({
  'Content-Type': 'application/json',
  ...(token && { Authorization: `Bearer ${token}` }),
});

// Error Messages
export const API_ERRORS = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  TIMEOUT: 'Request timeout. Please try again.',
  UNAUTHORIZED: 'Unauthorized. Please login again.',
  FORBIDDEN: 'Access forbidden.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Validation error. Please check your input.',
};
