/**
 * Modern API Client for CortexBuild
 *
 * This client replaces the old api.ts file with proper HTTP calls to the backend.
 * All functions return promises and handle errors consistently.
 */

import { User, Project, Task, Notification, AISuggestion } from '../../types';
import { isProd } from '../../src/utils/env';

// API Configuration
const API_BASE = isProd()
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

    /**
     * Fetch tasks for a user
     */
    async fetchTasksForUser(userId: string): Promise<Task[]> {
        return apiRequest<Task[]>(`/tasks?userId=${userId}`);
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

    // ==================== DOCUMENTS ====================

    /**
     * Fetch documents for a project
     */
    async fetchDocuments(projectId: string): Promise<any[]> {
        return apiRequest<any[]>(`/documents?projectId=${projectId}`);
    },

    /**
     * Upload a document
     */
    async uploadDocument(projectId: string, formData: FormData): Promise<any> {
        const token = getAuthToken();
        const response = await fetch(`${API_BASE}/documents`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });
        if (!response.ok) throw new Error('Upload failed');
        return response.json();
    },

    /**
     * Delete a document
     */
    async deleteDocument(documentId: string): Promise<void> {
        return apiRequest<void>(`/documents/${documentId}`, {
            method: 'DELETE',
        });
    },

    // ==================== RFIs ====================

    /**
     * Fetch RFIs for a project
     */
    async fetchRFIs(projectId: string): Promise<any[]> {
        return apiRequest<any[]>(`/rfis?projectId=${projectId}`);
    },

    /**
     * Fetch a single RFI
     */
    async fetchRFI(rfiId: string): Promise<any> {
        return apiRequest<any>(`/rfis/${rfiId}`);
    },

    /**
     * Create a new RFI
     */
    async createRFI(rfi: any): Promise<any> {
        return apiRequest<any>('/rfis', {
            method: 'POST',
            body: JSON.stringify(rfi),
        });
    },

    /**
     * Update an RFI
     */
    async updateRFI(rfiId: string, updates: any): Promise<any> {
        return apiRequest<any>(`/rfis/${rfiId}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    },

    /**
     * Delete an RFI
     */
    async deleteRFI(rfiId: string): Promise<void> {
        return apiRequest<void>(`/rfis/${rfiId}`, {
            method: 'DELETE',
        });
    },

    /**
     * Fetch RFI by ID
     */
    async fetchRFIById(rfiId: string): Promise<any> {
        return apiRequest<any>(`/rfis/${rfiId}`);
    },

    /**
     * Fetch RFI versions
     */
    async fetchRFIVersions(rfiNumber: string): Promise<any[]> {
        return apiRequest<any[]>(`/rfis/versions/${rfiNumber}`);
    },

    /**
     * Add comment to RFI
     */
    async addCommentToRFI(rfiId: string, comment: string, user: any): Promise<any> {
        return apiRequest<any>(`/rfis/${rfiId}/comments`, {
            method: 'POST',
            body: JSON.stringify({ comment, userId: user.id }),
        });
    },

    /**
     * Add answer to RFI
     */
    async addAnswerToRFI(rfiId: string, answer: string, attachments: any[], user: any): Promise<any> {
        return apiRequest<any>(`/rfis/${rfiId}/answer`, {
            method: 'POST',
            body: JSON.stringify({ answer, attachments, userId: user.id }),
        });
    },

    // ==================== TIME ENTRIES ====================

    /**
     * Fetch time entries
     */
    async fetchTimeEntries(params?: any): Promise<any[]> {
        const query = params ? `?${new URLSearchParams(params).toString()}` : '';
        return apiRequest<any[]>(`/time-entries${query}`);
    },

    /**
     * Create a time entry
     */
    async createTimeEntry(entry: any): Promise<any> {
        return apiRequest<any>('/time-entries', {
            method: 'POST',
            body: JSON.stringify(entry),
        });
    },

    /**
     * Update a time entry
     */
    async updateTimeEntry(entryId: string, updates: any): Promise<any> {
        return apiRequest<any>(`/time-entries/${entryId}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    },

    /**
     * Delete a time entry
     */
    async deleteTimeEntry(entryId: string): Promise<void> {
        return apiRequest<void>(`/time-entries/${entryId}`, {
            method: 'DELETE',
        });
    },

    /**
     * Fetch time entries for a user
     */
    async fetchTimeEntriesForUser(userId: string): Promise<any[]> {
        return apiRequest<any[]>(`/time-entries?userId=${userId}`);
    },

    /**
     * Start a time entry
     */
    async startTimeEntry(taskId: string, projectId: string, userId: string): Promise<any> {
        return apiRequest<any>('/time-entries', {
            method: 'POST',
            body: JSON.stringify({ taskId, projectId, userId, startTime: new Date().toISOString() }),
        });
    },

    /**
     * Stop a time entry
     */
    async stopTimeEntry(entryId: string): Promise<any> {
        return apiRequest<any>(`/time-entries/${entryId}`, {
            method: 'PUT',
            body: JSON.stringify({ endTime: new Date().toISOString() }),
        });
    },

    // ==================== INVOICES ====================

    /**
     * Fetch invoices
     */
    async fetchInvoices(projectId?: string): Promise<any[]> {
        const query = projectId ? `?projectId=${projectId}` : '';
        return apiRequest<any[]>(`/invoices${query}`);
    },

    /**
     * Fetch a single invoice
     */
    async fetchInvoice(invoiceId: string): Promise<any> {
        return apiRequest<any>(`/invoices/${invoiceId}`);
    },

    /**
     * Create an invoice
     */
    async createInvoice(invoice: any): Promise<any> {
        return apiRequest<any>('/invoices', {
            method: 'POST',
            body: JSON.stringify(invoice),
        });
    },

    /**
     * Update an invoice
     */
    async updateInvoice(invoiceId: string, updates: any): Promise<any> {
        return apiRequest<any>(`/invoices/${invoiceId}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    },

    /**
     * Delete an invoice
     */
    async deleteInvoice(invoiceId: string): Promise<void> {
        return apiRequest<void>(`/invoices/${invoiceId}`, {
            method: 'DELETE',
        });
    },

    // ==================== SUBCONTRACTORS ====================

    /**
     * Fetch subcontractors
     */
    async fetchSubcontractors(projectId?: string): Promise<any[]> {
        const query = projectId ? `?projectId=${projectId}` : '';
        return apiRequest<any[]>(`/subcontractors${query}`);
    },

    /**
     * Create a subcontractor
     */
    async createSubcontractor(subcontractor: any): Promise<any> {
        return apiRequest<any>('/subcontractors', {
            method: 'POST',
            body: JSON.stringify(subcontractor),
        });
    },

    /**
     * Update a subcontractor
     */
    async updateSubcontractor(subcontractorId: string, updates: any): Promise<any> {
        return apiRequest<any>(`/subcontractors/${subcontractorId}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    },

    /**
     * Delete a subcontractor
     */
    async deleteSubcontractor(subcontractorId: string): Promise<void> {
        return apiRequest<void>(`/subcontractors/${subcontractorId}`, {
            method: 'DELETE',
        });
    },

    // ==================== PURCHASE ORDERS ====================

    /**
     * Fetch purchase orders
     */
    async fetchPurchaseOrders(projectId?: string): Promise<any[]> {
        const query = projectId ? `?projectId=${projectId}` : '';
        return apiRequest<any[]>(`/purchase-orders${query}`);
    },

    /**
     * Create a purchase order
     */
    async createPurchaseOrder(po: any): Promise<any> {
        return apiRequest<any>('/purchase-orders', {
            method: 'POST',
            body: JSON.stringify(po),
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

    // ==================== AI AGENTS & SUBSCRIPTIONS ====================

    /**
     * Fetch available AI agents from marketplace
     */
    async fetchAvailableAIAgents(): Promise<any[]> {
        try {
            const response = await apiRequest<{ agents: any[] }>('/sdk/agents');
            return response.agents || [];
        } catch (error) {
            console.error('[APIClient] Error fetching AI agents:', error);
            return [];
        }
    },

    /**
     * Fetch company subscriptions for a user
     * Note: This endpoint is not yet implemented on the backend
     */
    async fetchCompanySubscriptions(user: any): Promise<any[]> {
        try {
            if (!user || !user.companyId) {
                // Silently return empty array - this is expected behavior
                return [];
            }

            // TODO: Implement backend endpoint for company subscriptions
            // For now, return empty array to avoid 404 errors
            return [];

            // Future implementation:
            // const response = await apiRequest<{ subscriptions: any[] }>(
            //     `/sdk/subscriptions?companyId=${user.companyId}`
            // );
            // return response.subscriptions || [];
        } catch (error) {
            console.error('[APIClient] Error fetching company subscriptions:', error);
            throw error;
        }
    },

    /**
     * Subscribe to an AI agent
     */
    async subscribeToAIAgent(agentId: string, billingCycle: 'monthly' | 'yearly'): Promise<any> {
        try {
            return await apiRequest<any>('/integrations/subscribe', {
                method: 'POST',
                body: JSON.stringify({ agentId, billingCycle }),
            });
        } catch (error) {
            console.error('[APIClient] Error subscribing to AI agent:', error);
            throw error;
        }
    },
};

export default apiClient;

