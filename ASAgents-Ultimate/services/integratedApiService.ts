/**
 * Integrated API Service
 * Combines backend and server API calls
 */

import { backendClient, serverClient } from '../lib/apiClient';
import { BACKEND_ENDPOINTS, SERVER_ENDPOINTS } from '../config/api.config';

// Types
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData extends LoginCredentials {
  name: string;
  company?: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  assignedTo?: string;
  dueDate?: string;
}

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalRevenue: number;
  totalExpenses: number;
  activeTasks: number;
  completedTasks: number;
}

/**
 * Authentication Service
 */
export const authService = {
  async login(credentials: LoginCredentials) {
    // Try server first (more advanced auth system)
    const serverResponse = await serverClient.post(SERVER_ENDPOINTS.AUTH.LOGIN, credentials);
    
    if (serverResponse.success && serverResponse.data?.token) {
      const token = serverResponse.data.token;
      serverClient.setToken(token);
      backendClient.setToken(token);
      return serverResponse;
    }

    // Fallback to backend
    const backendResponse = await backendClient.post(BACKEND_ENDPOINTS.AUTH.LOGIN, credentials);
    
    if (backendResponse.success && backendResponse.data?.token) {
      const token = backendResponse.data.token;
      serverClient.setToken(token);
      backendClient.setToken(token);
    }
    
    return backendResponse;
  },

  async register(data: RegisterData) {
    // Register on both systems
    const [serverResponse, backendResponse] = await Promise.all([
      serverClient.post(SERVER_ENDPOINTS.AUTH.REGISTER, data),
      backendClient.post(BACKEND_ENDPOINTS.AUTH.REGISTER, data),
    ]);

    // Return server response if successful, otherwise backend
    return serverResponse.success ? serverResponse : backendResponse;
  },

  async logout() {
    serverClient.setToken(null);
    backendClient.setToken(null);
    return { success: true };
  },

  async getProfile() {
    // Try server first
    const serverResponse = await serverClient.get(BACKEND_ENDPOINTS.AUTH.PROFILE);
    if (serverResponse.success) {
      return serverResponse;
    }

    // Fallback to backend
    return backendClient.get(BACKEND_ENDPOINTS.AUTH.PROFILE);
  },
};

/**
 * Projects Service
 */
export const projectsService = {
  async list(filters?: any) {
    const response = await backendClient.get(BACKEND_ENDPOINTS.PROJECTS.LIST, {
      headers: filters ? { 'X-Filters': JSON.stringify(filters) } : {},
    });
    return response;
  },

  async create(project: Partial<Project>) {
    return backendClient.post(BACKEND_ENDPOINTS.PROJECTS.CREATE, project);
  },

  async get(id: string) {
    return backendClient.get(BACKEND_ENDPOINTS.PROJECTS.GET(id));
  },

  async update(id: string, updates: Partial<Project>) {
    return backendClient.put(BACKEND_ENDPOINTS.PROJECTS.UPDATE(id), updates);
  },

  async delete(id: string) {
    return backendClient.delete(BACKEND_ENDPOINTS.PROJECTS.DELETE(id));
  },

  async getStats(id: string) {
    return backendClient.get(BACKEND_ENDPOINTS.PROJECTS.STATS(id));
  },
};

/**
 * Tasks Service
 */
export const tasksService = {
  async list(filters?: any) {
    return serverClient.get(SERVER_ENDPOINTS.TASKS.LIST, {
      headers: filters ? { 'X-Filters': JSON.stringify(filters) } : {},
    });
  },

  async create(task: Partial<Task>) {
    return serverClient.post(SERVER_ENDPOINTS.TASKS.CREATE, task);
  },

  async get(id: string) {
    return serverClient.get(SERVER_ENDPOINTS.TASKS.GET(id));
  },

  async update(id: string, updates: Partial<Task>) {
    return serverClient.put(SERVER_ENDPOINTS.TASKS.UPDATE(id), updates);
  },

  async delete(id: string) {
    return serverClient.delete(SERVER_ENDPOINTS.TASKS.DELETE(id));
  },

  async complete(id: string) {
    return serverClient.post(SERVER_ENDPOINTS.TASKS.COMPLETE(id), {});
  },
};

/**
 * Dashboard Service
 */
export const dashboardService = {
  async getOverview() {
    const [serverStats, backendProjects] = await Promise.all([
      serverClient.get(SERVER_ENDPOINTS.DASHBOARD.OVERVIEW),
      backendClient.get(BACKEND_ENDPOINTS.PROJECTS.LIST),
    ]);

    return {
      success: true,
      data: {
        serverStats: serverStats.data,
        projects: backendProjects.data,
      },
    };
  },

  async getStats(): Promise<DashboardStats> {
    const response = await serverClient.get(SERVER_ENDPOINTS.DASHBOARD.STATS);
    
    if (response.success) {
      return response.data;
    }

    // Return mock data as fallback
    return {
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      totalRevenue: 0,
      totalExpenses: 0,
      activeTasks: 0,
      completedTasks: 0,
    };
  },

  async getRecent() {
    return serverClient.get(SERVER_ENDPOINTS.DASHBOARD.RECENT);
  },
};

/**
 * Analytics Service
 */
export const analyticsService = {
  async getOverview() {
    return serverClient.get(SERVER_ENDPOINTS.ANALYTICS.OVERVIEW);
  },

  async getProjectAnalytics() {
    return serverClient.get(SERVER_ENDPOINTS.ANALYTICS.PROJECTS);
  },

  async getRevenueAnalytics() {
    return serverClient.get(SERVER_ENDPOINTS.ANALYTICS.REVENUE);
  },

  async getPerformanceAnalytics() {
    return serverClient.get(SERVER_ENDPOINTS.ANALYTICS.PERFORMANCE);
  },
};

/**
 * Documents Service
 */
export const documentsService = {
  async list() {
    return backendClient.get(BACKEND_ENDPOINTS.DOCUMENTS.LIST);
  },

  async upload(file: File, metadata?: any) {
    return backendClient.uploadFile(BACKEND_ENDPOINTS.DOCUMENTS.UPLOAD, file, metadata);
  },

  async get(id: string) {
    return backendClient.get(BACKEND_ENDPOINTS.DOCUMENTS.GET(id));
  },

  async delete(id: string) {
    return backendClient.delete(BACKEND_ENDPOINTS.DOCUMENTS.DELETE(id));
  },
};

/**
 * Notifications Service
 */
export const notificationsService = {
  async list() {
    return serverClient.get(SERVER_ENDPOINTS.NOTIFICATIONS.LIST);
  },

  async get(id: string) {
    return serverClient.get(SERVER_ENDPOINTS.NOTIFICATIONS.GET(id));
  },

  async markAsRead(id: string) {
    return serverClient.post(SERVER_ENDPOINTS.NOTIFICATIONS.MARK_READ(id), {});
  },

  async markAllAsRead() {
    return serverClient.post(SERVER_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ, {});
  },
};

/**
 * System Health Service
 */
export const systemHealthService = {
  async checkBackend() {
    return backendClient.get(BACKEND_ENDPOINTS.HEALTH);
  },

  async checkServer() {
    return serverClient.get(SERVER_ENDPOINTS.SYSTEM.HEALTH);
  },

  async checkAll() {
    const [backend, server] = await Promise.all([
      this.checkBackend(),
      this.checkServer(),
    ]);

    return {
      backend: backend.success,
      server: server.success,
      overall: backend.success && server.success,
    };
  },
};

// Export all services
export default {
  auth: authService,
  projects: projectsService,
  tasks: tasksService,
  dashboard: dashboardService,
  analytics: analyticsService,
  documents: documentsService,
  notifications: notificationsService,
  health: systemHealthService,
};
