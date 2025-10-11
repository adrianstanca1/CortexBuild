/**
 * Modern API Client for CortexBuild
 * 
 * This client replaces the old api.ts file with proper HTTP calls to the backend.
 * All functions return promises and handle errors consistently.
 */

import { User, Project, Task, Notification, AISuggestion } from '../../types';

// API Configuration
const API_BASE = import.meta.env.PROD 
    ? '/api' 
    : 'http://localhost:3001/api';

/**
 * Get authentication token from localStorage
 */
const getAuthToken = (): string => {
    return localStorage.getItem('token') || 
           localStorage.getItem('constructai_token') || 
           '';
};

/**
 * Make an authenticated API request
 */
async function apiRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
): Promise<T> {
    const token = getAuthToken();
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`API Error: ${response.status} - ${error}`);
    }

    return response.json();
}

/**
 * API Client with all methods
 */
export const apiClient = {
    // ==================== PROJECTS ====================
    
    /**
     * Fetch all projects for the current user
     */
    async fetchProjects(): Promise<Project[]> {
        return apiRequest<Project[]>('/projects');
    },

    /**
     * Fetch a single project by ID
     */
    async fetchProject(projectId: string): Promise<Project> {
        return apiRequest<Project>(`/projects/${projectId}`);
    },

    /**
     * Create a new project
     */
    async createProject(project: Partial<Project>): Promise<Project> {
        return apiRequest<Project>('/projects', {
            method: 'POST',
            body: JSON.stringify(project),
        });
    },

    /**
     * Update a project
     */
    async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
        return apiRequest<Project>(`/projects/${projectId}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    },

    /**
     * Delete a project
     */
    async deleteProject(projectId: string): Promise<void> {
        return apiRequest<void>(`/projects/${projectId}`, {
            method: 'DELETE',
        });
    },

    // ==================== TASKS ====================

    /**
     * Fetch all tasks for a project
     */
    async fetchTasksForProject(projectId: string): Promise<Task[]> {
        return apiRequest<Task[]>(`/tasks?projectId=${projectId}`);
    },

    /**
     * Fetch a single task by ID
     */
    async fetchTask(taskId: string): Promise<Task> {
        return apiRequest<Task>(`/tasks/${taskId}`);
    },

    /**
     * Create a new task
     */
    async createTask(task: Partial<Task>): Promise<Task> {
        return apiRequest<Task>('/tasks', {
            method: 'POST',
            body: JSON.stringify(task),
        });
    },

    /**
     * Update a task
     */
    async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
        return apiRequest<Task>(`/tasks/${taskId}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    },

    /**
     * Delete a task
     */
    async deleteTask(taskId: string): Promise<void> {
        return apiRequest<void>(`/tasks/${taskId}`, {
            method: 'DELETE',
        });
    },

    // ==================== NOTIFICATIONS ====================

    /**
     * Fetch notifications for the current user
     */
    async fetchNotifications(): Promise<Notification[]> {
        return apiRequest<Notification[]>('/notifications');
    },

    /**
     * Mark notifications as read
     */
    async markNotificationsAsRead(notificationIds: string[]): Promise<void> {
        return apiRequest<void>('/notifications/mark-read', {
            method: 'POST',
            body: JSON.stringify({ notificationIds }),
        });
    },

    /**
     * Delete a notification
     */
    async deleteNotification(notificationId: string): Promise<void> {
        return apiRequest<void>(`/notifications/${notificationId}`, {
            method: 'DELETE',
        });
    },

    // ==================== AI FEATURES ====================

    /**
     * Get AI suggested action for the current user
     */
    async getAISuggestion(userId: string): Promise<AISuggestion | null> {
        return apiRequest<AISuggestion | null>('/ai/suggest', {
            method: 'POST',
            body: JSON.stringify({ userId }),
        });
    },

    /**
     * Send a chat message to AI
     */
    async sendAIChat(message: string, context?: any): Promise<any> {
        return apiRequest<any>('/ai/chat', {
            method: 'POST',
            body: JSON.stringify({ message, context }),
        });
    },

    /**
     * Get AI usage statistics
     */
    async getAIUsage(): Promise<any> {
        return apiRequest<any>('/ai/usage');
    },

    // ==================== MARKETPLACE ====================

    /**
     * Fetch all marketplace apps
     */
    async fetchMarketplaceApps(): Promise<any[]> {
        return apiRequest<any[]>('/global-marketplace');
    },

    /**
     * Install a marketplace app
     */
    async installApp(appId: string): Promise<any> {
        return apiRequest<any>('/global-marketplace/install', {
            method: 'POST',
            body: JSON.stringify({ appId }),
        });
    },

    /**
     * Uninstall a marketplace app
     */
    async uninstallApp(appId: string): Promise<void> {
        return apiRequest<void>('/global-marketplace/uninstall', {
            method: 'POST',
            body: JSON.stringify({ appId }),
        });
    },

    // ==================== MY APPLICATIONS ====================

    /**
     * Fetch user's installed applications
     */
    async fetchMyApplications(): Promise<any[]> {
        return apiRequest<any[]>('/my-applications');
    },

    /**
     * Launch an application
     */
    async launchApplication(appId: string): Promise<any> {
        return apiRequest<any>(`/my-applications/${appId}/launch`, {
            method: 'POST',
        });
    },

    // ==================== UTILITY METHODS ====================

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return !!getAuthToken();
    },

    /**
     * Clear authentication token
     */
    clearAuth(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('constructai_token');
    },

    /**
     * Set authentication token
     */
    setAuth(token: string): void {
        localStorage.setItem('token', token);
    },
};

export default apiClient;

