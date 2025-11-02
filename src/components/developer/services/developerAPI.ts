/**
 * Developer Console API Service
 * Handles communication with backend for developer-specific features
 */

import {
  DeveloperWorkspace,
  DebugSession,
  AnalyticsData,
  PerformanceMetric,
  ErrorRecord,
  APIEndpoint,
  DatabaseConnection,
  WorkflowDefinition,
  AIAgent,
  CollaborationEvent,
  APIResponse,
  PaginatedResponse
} from '../types/index';

class DeveloperAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('token');

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Workspace Management
  async getWorkspaces(developerId: string): Promise<DeveloperWorkspace[]> {
    const response = await this.request<APIResponse<DeveloperWorkspace[]>>(
      `/sdk/workspaces?developer_id=${developerId}`
    );
    return response.data || [];
  }

  async createWorkspace(workspace: Partial<DeveloperWorkspace>): Promise<DeveloperWorkspace> {
    const response = await this.request<APIResponse<DeveloperWorkspace>>('/sdk/workspaces', {
      method: 'POST',
      body: JSON.stringify(workspace),
    });
    return response.data!;
  }

  async updateWorkspace(id: string, updates: Partial<DeveloperWorkspace>): Promise<DeveloperWorkspace> {
    const response = await this.request<APIResponse<DeveloperWorkspace>>(`/sdk/workspaces/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response.data!;
  }

  async deleteWorkspace(id: string): Promise<void> {
    await this.request(`/sdk/workspaces/${id}`, {
      method: 'DELETE',
    });
  }

  // Debug Sessions
  async getDebugSessions(developerId: string): Promise<DebugSession[]> {
    const response = await this.request<APIResponse<DebugSession[]>>(
      `/developer/debug/sessions?developer_id=${developerId}`
    );
    return response.data || [];
  }

  async createDebugSession(session: Partial<DebugSession>): Promise<DebugSession> {
    const response = await this.request<APIResponse<DebugSession>>('/developer/debug/sessions', {
      method: 'POST',
      body: JSON.stringify(session),
    });
    return response.data!;
  }

  async updateDebugSession(id: string, updates: Partial<DebugSession>): Promise<DebugSession> {
    const response = await this.request<APIResponse<DebugSession>>(`/developer/debug/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response.data!;
  }

  async deleteDebugSession(id: string): Promise<void> {
    await this.request(`/developer/debug/sessions/${id}`, {
      method: 'DELETE',
    });
  }

  async getDebugLogs(sessionId: string, limit: number = 100): Promise<any[]> {
    const response = await this.request<APIResponse<any[]>>(
      `/developer/debug/sessions/${sessionId}/logs?limit=${limit}`
    );
    return response.data || [];
  }

  // Analytics
  async getAnalytics(developerId: string, period: string = 'day'): Promise<AnalyticsData> {
    const response = await this.request<APIResponse<AnalyticsData>>(
      `/developer/analytics?developer_id=${developerId}&period=${period}`
    );
    return response.data!;
  }

  async getPerformanceMetrics(workspaceId?: string): Promise<PerformanceMetric[]> {
    const endpoint = workspaceId
      ? `/developer/performance/metrics?workspace_id=${workspaceId}`
      : '/developer/performance/metrics';
    const response = await this.request<APIResponse<PerformanceMetric[]>>(endpoint);
    return response.data || [];
  }

  // Error Tracking
  async getErrors(filters?: {
    workspace_id?: string;
    severity?: string;
    status?: string;
    limit?: number;
  }): Promise<ErrorRecord[]> {
    const params = new URLSearchParams();
    if (filters?.workspace_id) params.append('workspace_id', filters.workspace_id);
    if (filters?.severity) params.append('severity', filters.severity);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await this.request<APIResponse<ErrorRecord[]>>(
      `/developer/errors?${params.toString()}`
    );
    return response.data || [];
  }

  async updateErrorStatus(errorId: string, status: string): Promise<ErrorRecord> {
    const response = await this.request<APIResponse<ErrorRecord>>(`/developer/errors/${errorId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return response.data!;
  }

  async resolveError(errorId: string, resolution?: string): Promise<ErrorRecord> {
    const response = await this.request<APIResponse<ErrorRecord>>(`/developer/errors/${errorId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolution }),
    });
    return response.data!;
  }

  // API Explorer
  async getAPIEndpoints(): Promise<APIEndpoint[]> {
    const response = await this.request<APIResponse<APIEndpoint[]>>('/developer/api/endpoints');
    return response.data || [];
  }

  async testAPIEndpoint(endpointId: string, data?: any): Promise<any> {
    const response = await this.request<APIResponse<any>>(`/developer/api/endpoints/${endpointId}/test`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data!;
  }

  async getAPIHistory(limit: number = 50): Promise<any[]> {
    const response = await this.request<APIResponse<any[]>>(
      `/developer/api/history?limit=${limit}`
    );
    return response.data || [];
  }

  // Database Management
  async getDatabaseConnections(): Promise<DatabaseConnection[]> {
    const response = await this.request<APIResponse<DatabaseConnection[]>>('/developer/database/connections');
    return response.data || [];
  }

  async testDatabaseConnection(connectionId: string): Promise<any> {
    const response = await this.request<APIResponse<any>>(`/developer/database/connections/${connectionId}/test`, {
      method: 'POST',
    });
    return response.data!;
  }

  async executeQuery(connectionId: string, query: string): Promise<any> {
    const response = await this.request<APIResponse<any>>(`/developer/database/connections/${connectionId}/query`, {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
    return response.data!;
  }

  // Workflow Management
  async getWorkflows(): Promise<WorkflowDefinition[]> {
    const response = await this.request<APIResponse<WorkflowDefinition[]>>('/developer/workflows');
    return response.data || [];
  }

  async createWorkflow(workflow: Partial<WorkflowDefinition>): Promise<WorkflowDefinition> {
    const response = await this.request<APIResponse<WorkflowDefinition>>('/developer/workflows', {
      method: 'POST',
      body: JSON.stringify(workflow),
    });
    return response.data!;
  }

  async updateWorkflow(id: string, updates: Partial<WorkflowDefinition>): Promise<WorkflowDefinition> {
    const response = await this.request<APIResponse<WorkflowDefinition>>(`/developer/workflows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response.data!;
  }

  async executeWorkflow(id: string, data?: any): Promise<any> {
    const response = await this.request<APIResponse<any>>(`/developer/workflows/${id}/execute`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data!;
  }

  // AI Agent Management
  async getAIAgents(): Promise<AIAgent[]> {
    const response = await this.request<APIResponse<AIAgent[]>>('/developer/ai/agents');
    return response.data || [];
  }

  async createAIAgent(agent: Partial<AIAgent>): Promise<AIAgent> {
    const response = await this.request<APIResponse<AIAgent>>('/developer/ai/agents', {
      method: 'POST',
      body: JSON.stringify(agent),
    });
    return response.data!;
  }

  async updateAIAgent(id: string, updates: Partial<AIAgent>): Promise<AIAgent> {
    const response = await this.request<APIResponse<AIAgent>>(`/developer/ai/agents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response.data!;
  }

  async queryAIAgent(agentId: string, query: string, context?: any): Promise<any> {
    const response = await this.request<APIResponse<any>>(`/developer/ai/agents/${agentId}/query`, {
      method: 'POST',
      body: JSON.stringify({ query, context }),
    });
    return response.data!;
  }

  // Collaboration
  async getCollaborationEvents(workspaceId: string, limit: number = 100): Promise<CollaborationEvent[]> {
    const response = await this.request<APIResponse<CollaborationEvent[]>>(
      `/developer/collaboration/events?workspace_id=${workspaceId}&limit=${limit}`
    );
    return response.data || [];
  }

  async getLiveCursors(workspaceId: string): Promise<any[]> {
    const response = await this.request<APIResponse<any[]>>(
      `/developer/collaboration/cursors?workspace_id=${workspaceId}`
    );
    return response.data || [];
  }

  async updateLiveCursor(workspaceId: string, cursor: any): Promise<void> {
    await this.request('/developer/collaboration/cursor', {
      method: 'POST',
      body: JSON.stringify({ workspace_id: workspaceId, ...cursor }),
    });
  }

  async addCodeComment(workspaceId: string, comment: any): Promise<any> {
    const response = await this.request<APIResponse<any>>('/developer/collaboration/comments', {
      method: 'POST',
      body: JSON.stringify({ workspace_id: workspaceId, ...comment }),
    });
    return response.data!;
  }

  async getCodeComments(workspaceId: string, filePath?: string): Promise<any[]> {
    const endpoint = filePath
      ? `/developer/collaboration/comments?workspace_id=${workspaceId}&file_path=${encodeURIComponent(filePath)}`
      : `/developer/collaboration/comments?workspace_id=${workspaceId}`;
    const response = await this.request<APIResponse<any[]>>(endpoint);
    return response.data || [];
  }

  // Real-time Stats
  async getRealtimeStats(developerId: string): Promise<any> {
    const response = await this.request<APIResponse<any>>(`/developer/realtime/stats?developer_id=${developerId}`);
    return response.data || {
      activeUsers: 0,
      apiCalls: 0,
      errors: 0,
      performance: 0
    };
  }

  // System Health
  async getSystemHealth(): Promise<any> {
    const response = await this.request<APIResponse<any>>('/developer/system/health');
    return response.data!;
  }

  async getSystemLogs(limit: number = 50): Promise<any[]> {
    const response = await this.request<APIResponse<any[]>>(
      `/developer/system/logs?limit=${limit}`
    );
    return response.data || [];
  }

  // Utility methods
  async exportData(type: 'analytics' | 'errors' | 'performance' | 'logs', format: 'json' | 'csv' = 'json'): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/developer/export/${type}?format=${format}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.status}`);
    }

    return response.blob();
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.request('/health');
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const developerAPI = new DeveloperAPI();