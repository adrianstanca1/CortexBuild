/**
 * Production API Service
 * Connects frontend to backend with proper error handling and types
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ProductionApiService {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = API_BASE_URL;
    // Load token from localStorage if available
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Request failed',
        };
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Authentication
  async login(email: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data?.token) {
      this.token = response.data.token;
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  }

  async register(data: {
    name: string;
    email: string;
    password: string;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async validateToken() {
    return this.request('/auth/validate');
  }

  async logout() {
    const response = await this.request('/auth/logout', {
      method: 'POST',
    });
    
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    
    return response;
  }

  // Users
  async getUsers() {
    return this.request('/users');
  }

  async getUser(id: string) {
    return this.request(`/users/${id}`);
  }

  async updateUser(id: string, data: any) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Projects
  async getProjects() {
    return this.request('/projects');
  }

  async getProject(id: string) {
    return this.request(`/projects/${id}`);
  }

  async createProject(data: any) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProject(id: string, data: any) {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id: string) {
    return this.request(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Tasks
  async getTasks() {
    return this.request('/tasks');
  }

  async getTask(id: string) {
    return this.request(`/tasks/${id}`);
  }

  async createTask(data: any) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTask(id: string, data: any) {
    return this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTask(id: string) {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  async completeTask(id: string) {
    return this.request(`/tasks/${id}/complete`, {
      method: 'POST',
    });
  }

  // Dashboard
  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  async getDashboardOverview() {
    return this.request('/dashboard/overview');
  }

  async getRecentActivities() {
    return this.request('/dashboard/recent');
  }

  // Clients
  async getClients() {
    return this.request('/clients');
  }

  async createClient(data: any) {
    return this.request('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Financials
  async getInvoices() {
    return this.request('/financials/invoices');
  }

  async createInvoice(data: any) {
    return this.request('/financials/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getExpenses() {
    return this.request('/financials/expenses');
  }

  async createExpense(data: any) {
    return this.request('/financials/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Notifications
  async getNotifications() {
    return this.request('/notifications');
  }

  async markNotificationRead(id: string) {
    return this.request(`/notifications/${id}/read`, {
      method: 'POST',
    });
  }

  async markAllNotificationsRead() {
    return this.request('/notifications/mark-all-read', {
      method: 'POST',
    });
  }

  // Analytics
  async getAnalyticsOverview() {
    return this.request('/analytics/overview');
  }

  async getProjectAnalytics() {
    return this.request('/analytics/projects');
  }

  async getRevenueAnalytics() {
    return this.request('/analytics/revenue');
  }

  async getPerformanceAnalytics() {
    return this.request('/analytics/performance');
  }

  // System
  async getSystemHealth() {
    return this.request('/system/health');
  }

  async getSystemStatus() {
    return this.request('/system/status');
  }
}

// Export singleton instance
export const productionApi = new ProductionApiService();

// Export class for testing
export default ProductionApiService;
