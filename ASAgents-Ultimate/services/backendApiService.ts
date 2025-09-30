// Enhanced backend API service for full integration
import environment from '../config/environment';
import type {
  User,
  Project,
  Task,
  Company,
  Expense,
  Invoice,
  Document,
  SafetyIncident,
  Equipment,
  TimeEntry,
  Notification,
  AuditLog,
  LoginCredentials,
  RegistrationPayload,
  AuthenticatedSession
} from '../types';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface EquipmentAssignment {
  project_id: string;
  assigned_to?: string;
  notes?: string;
}

export interface TimeEntryData {
  project_id: string;
  task_id?: string;
  start_time: Date;
  end_time?: Date;
  hours?: number;
  description?: string;
  hourly_rate?: number;
}

export interface NotificationData {
  user_id?: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'reminder';
  action_url?: string;
  metadata?: any;
}

class BackendApiService {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    const env = environment;
    this.baseUrl = env.apiUrl || 'http://localhost:4000/api';
    
    // Load token from storage
    this.token = localStorage.getItem('auth_token');
  }

  /**
   * Set authentication token
   */
  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  /**
   * Get authentication headers
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Make API request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthenticatedSession>> {
    const response = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data?.tokens?.accessToken) {
      this.setToken(response.data.tokens.accessToken);
    }

    return response;
  }

  async register(payload: RegistrationPayload): Promise<ApiResponse<AuthenticatedSession>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async logout(): Promise<ApiResponse<void>> {
    const response = await this.request('/auth/logout', {
      method: 'POST',
    });
    
    this.setToken(null);
    return response;
  }

  async refreshToken(): Promise<ApiResponse<{ accessToken: string }>> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      return { success: false, error: 'No refresh token available' };
    }

    return this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  // User methods
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request('/me');
  }

  async getUsers(): Promise<ApiResponse<User[]>> {
    return this.request('/users');
  }

  // Company methods
  async getCompanies(): Promise<ApiResponse<Company[]>> {
    return this.request('/companies');
  }

  async getCompany(id: string): Promise<ApiResponse<Company>> {
    return this.request(`/companies/${id}`);
  }

  async createCompany(company: Partial<Company>): Promise<ApiResponse<{ id: number }>> {
    return this.request('/companies', {
      method: 'POST',
      body: JSON.stringify(company),
    });
  }

  async updateCompany(id: string, company: Partial<Company>): Promise<ApiResponse<void>> {
    return this.request(`/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(company),
    });
  }

  async deleteCompany(id: string): Promise<ApiResponse<void>> {
    return this.request(`/companies/${id}`, {
      method: 'DELETE',
    });
  }

  // Project methods
  async getProjects(): Promise<ApiResponse<Project[]>> {
    return this.request('/projects');
  }

  async getProject(id: string): Promise<ApiResponse<Project>> {
    return this.request(`/projects/${id}`);
  }

  async createProject(project: Partial<Project>): Promise<ApiResponse<{ id: number }>> {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  }

  async updateProject(id: string, project: Partial<Project>): Promise<ApiResponse<void>> {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(project),
    });
  }

  async deleteProject(id: string): Promise<ApiResponse<void>> {
    return this.request(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Task methods
  async getTasks(filters?: {
    projectId?: string;
    assignedTo?: string;
    status?: string;
    priority?: string;
  }): Promise<ApiResponse<Task[]>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    
    const query = params.toString();
    return this.request(`/tasks${query ? `?${query}` : ''}`);
  }

  async getTask(id: string): Promise<ApiResponse<Task>> {
    return this.request(`/tasks/${id}`);
  }

  async createTask(task: Partial<Task>): Promise<ApiResponse<{ id: number }>> {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async updateTask(id: string, task: Partial<Task>): Promise<ApiResponse<void>> {
    return this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    });
  }

  async deleteTask(id: string): Promise<ApiResponse<void>> {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  // Expense methods
  async getExpenses(filters?: {
    projectId?: string;
    userId?: string;
    category?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<Expense[]>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    
    const query = params.toString();
    return this.request(`/expenses${query ? `?${query}` : ''}`);
  }

  async getExpense(id: string): Promise<ApiResponse<Expense>> {
    return this.request(`/expenses/${id}`);
  }

  async createExpense(expense: Partial<Expense>): Promise<ApiResponse<{ id: number }>> {
    return this.request('/expenses', {
      method: 'POST',
      body: JSON.stringify(expense),
    });
  }

  async updateExpense(id: string, expense: Partial<Expense>): Promise<ApiResponse<void>> {
    return this.request(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(expense),
    });
  }

  async approveExpense(id: string, status: 'approved' | 'rejected', notes?: string): Promise<ApiResponse<void>> {
    return this.request(`/expenses/${id}/approval`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  }

  async deleteExpense(id: string): Promise<ApiResponse<void>> {
    return this.request(`/expenses/${id}`, {
      method: 'DELETE',
    });
  }

  // Invoice methods
  async getInvoices(): Promise<ApiResponse<Invoice[]>> {
    return this.request('/invoices');
  }

  async getInvoice(id: string): Promise<ApiResponse<Invoice>> {
    return this.request(`/invoices/${id}`);
  }

  // Document methods
  async getDocuments(): Promise<ApiResponse<Document[]>> {
    return this.request('/documents');
  }

  async uploadDocument(file: File, projectId?: string): Promise<ApiResponse<{ id: number }>> {
    const formData = new FormData();
    formData.append('file', file);
    if (projectId) {
      formData.append('projectId', projectId);
    }

    try {
      const response = await fetch(`${this.baseUrl}/documents`, {
        method: 'POST',
        headers: {
          'Authorization': this.token ? `Bearer ${this.token}` : '',
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  // System methods
  async getSystemHealth(): Promise<ApiResponse<{ status: string; database: boolean }>> {
    return this.request('/system/health');
  }

  // ==================== EQUIPMENT MANAGEMENT ====================

  /**
   * Get all equipment
   */
  async getEquipment(): Promise<ApiResponse<Equipment[]>> {
    return this.request('/equipment');
  }

  /**
   * Create new equipment
   */
  async createEquipment(equipmentData: Partial<Equipment>): Promise<ApiResponse<Equipment>> {
    return this.request('/equipment', {
      method: 'POST',
      body: JSON.stringify(equipmentData)
    });
  }

  /**
   * Update equipment
   */
  async updateEquipment(id: string, equipmentData: Partial<Equipment>): Promise<ApiResponse<Equipment>> {
    return this.request(`/equipment/${id}`, {
      method: 'PUT',
      body: JSON.stringify(equipmentData)
    });
  }

  /**
   * Delete equipment
   */
  async deleteEquipment(id: string): Promise<ApiResponse> {
    return this.request(`/equipment/${id}`, {
      method: 'DELETE'
    });
  }

  /**
   * Assign equipment to project
   */
  async assignEquipment(id: string, assignment: EquipmentAssignment): Promise<ApiResponse> {
    return this.request(`/equipment/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify(assignment)
    });
  }

  /**
   * Return equipment from assignment
   */
  async returnEquipment(id: string): Promise<ApiResponse> {
    return this.request(`/equipment/${id}/return`, {
      method: 'POST'
    });
  }

  // ==================== SAFETY INCIDENTS ====================

  /**
   * Get all safety incidents
   */
  async getSafetyIncidents(): Promise<ApiResponse<SafetyIncident[]>> {
    return this.request('/safety');
  }

  /**
   * Create safety incident
   */
  async createSafetyIncident(incidentData: Partial<SafetyIncident>): Promise<ApiResponse<SafetyIncident>> {
    return this.request('/safety', {
      method: 'POST',
      body: JSON.stringify(incidentData)
    });
  }

  /**
   * Update safety incident
   */
  async updateSafetyIncident(id: string, incidentData: Partial<SafetyIncident>): Promise<ApiResponse<SafetyIncident>> {
    return this.request(`/safety/${id}`, {
      method: 'PUT',
      body: JSON.stringify(incidentData)
    });
  }

  /**
   * Delete safety incident
   */
  async deleteSafetyIncident(id: string): Promise<ApiResponse> {
    return this.request(`/safety/${id}`, {
      method: 'DELETE'
    });
  }

  /**
   * Get safety statistics
   */
  async getSafetyStats(): Promise<ApiResponse> {
    return this.request('/safety/stats');
  }

  // ==================== TIME TRACKING ====================

  /**
   * Get time entries
   */
  async getTimeEntries(params?: Record<string, any>): Promise<ApiResponse<TimeEntry[]>> {
    const query = params ? new URLSearchParams(params).toString() : '';
    const endpoint = query ? `/time-tracking?${query}` : '/time-tracking';
    return this.request(endpoint);
  }

  /**
   * Create time entry
   */
  async createTimeEntry(timeData: TimeEntryData): Promise<ApiResponse<TimeEntry>> {
    return this.request('/time-tracking', {
      method: 'POST',
      body: JSON.stringify(timeData)
    });
  }

  /**
   * Start timer
   */
  async startTimer(timerData: { project_id: string; task_id?: string; description?: string }): Promise<ApiResponse<TimeEntry>> {
    return this.request('/time-tracking/start', {
      method: 'POST',
      body: JSON.stringify(timerData)
    });
  }

  /**
   * Stop timer
   */
  async stopTimer(): Promise<ApiResponse<TimeEntry>> {
    return this.request('/time-tracking/stop', {
      method: 'POST'
    });
  }

  /**
   * Update time entry
   */
  async updateTimeEntry(id: string, timeData: Partial<TimeEntryData>): Promise<ApiResponse<TimeEntry>> {
    return this.request(`/time-tracking/${id}`, {
      method: 'PUT',
      body: JSON.stringify(timeData)
    });
  }

  /**
   * Delete time entry
   */
  async deleteTimeEntry(id: string): Promise<ApiResponse> {
    return this.request(`/time-tracking/${id}`, {
      method: 'DELETE'
    });
  }

  /**
   * Get time tracking statistics
   */
  async getTimeStats(params?: Record<string, any>): Promise<ApiResponse> {
    const query = params ? new URLSearchParams(params).toString() : '';
    const endpoint = query ? `/time-tracking/stats?${query}` : '/time-tracking/stats';
    return this.request(endpoint);
  }

  // ==================== NOTIFICATIONS ====================

  /**
   * Get notifications
   */
  async getNotifications(params?: Record<string, any>): Promise<ApiResponse<Notification[]>> {
    const query = params ? new URLSearchParams(params).toString() : '';
    const endpoint = query ? `/notifications?${query}` : '/notifications';
    return this.request(endpoint);
  }

  /**
   * Create notification
   */
  async createNotification(notificationData: NotificationData): Promise<ApiResponse<Notification>> {
    return this.request('/notifications', {
      method: 'POST',
      body: JSON.stringify(notificationData)
    });
  }

  /**
   * Mark notification as read
   */
  async markNotificationRead(id: string): Promise<ApiResponse> {
    return this.request(`/notifications/${id}/read`, {
      method: 'PUT'
    });
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsRead(): Promise<ApiResponse> {
    return this.request('/notifications/mark-all-read', {
      method: 'PUT'
    });
  }

  /**
   * Delete notification
   */
  async deleteNotification(id: string): Promise<ApiResponse> {
    return this.request(`/notifications/${id}`, {
      method: 'DELETE'
    });
  }

  /**
   * Get notification counts
   */
  async getNotificationCounts(): Promise<ApiResponse> {
    return this.request('/notifications/counts');
  }

  /**
   * Create bulk notifications
   */
  async createBulkNotifications(data: { user_ids: string[] } & NotificationData): Promise<ApiResponse> {
    return this.request('/notifications/bulk', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // ==================== AUDIT LOGS ====================

  /**
   * Get audit logs (admin only)
   */
  async getAuditLogs(params?: Record<string, any>): Promise<ApiResponse<AuditLog[]>> {
    const query = params ? new URLSearchParams(params).toString() : '';
    const endpoint = query ? `/audit-logs?${query}` : '/audit-logs';
    return this.request(endpoint);
  }

  /**
   * Get audit statistics
   */
  async getAuditStats(): Promise<ApiResponse> {
    return this.request('/audit-logs/stats');
  }

  /**
   * Get resource audit logs
   */
  async getResourceAuditLogs(resourceType: string, resourceId: string): Promise<ApiResponse<AuditLog[]>> {
    return this.request(`/audit-logs/resource/${resourceType}/${resourceId}`);
  }
}

// Export singleton instance
export const backendApi = new BackendApiService();
