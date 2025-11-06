/**
 * Studio API Service
 * Handles all communication with the backend SDK endpoints
 */

import {
  StudioProject,
  StudioWorkspace,
  DeploymentConfig,
  TestSuite,
  CodeGenerationRequest,
  CodeGenerationResponse,
  CollaborationSession,
  AnalyticsData,
  APIResponse,
  PaginatedResponse
} from '../types/index';

class StudioAPI {
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

  // Project Management
  async getProjects(developerId: string): Promise<StudioProject[]> {
    const response = await this.request<APIResponse<StudioProject[]>>(
      `/sdk/apps?developer_id=${developerId}`
    );
    return response.data || [];
  }

  async createProject(project: Partial<StudioProject>): Promise<StudioProject> {
    const response = await this.request<APIResponse<StudioProject>>('/sdk/apps', {
      method: 'POST',
      body: JSON.stringify(project),
    });
    return response.data!;
  }

  async updateProject(id: string, updates: Partial<StudioProject>): Promise<StudioProject> {
    const response = await this.request<APIResponse<StudioProject>>(`/sdk/apps/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response.data!;
  }

  async deleteProject(id: string): Promise<void> {
    await this.request(`/sdk/apps/${id}`, {
      method: 'DELETE',
    });
  }

  // Workspace Management
  async getWorkspaces(developerId: string): Promise<StudioWorkspace[]> {
    const response = await this.request<APIResponse<StudioWorkspace[]>>(
      `/sdk/workspaces?developer_id=${developerId}`
    );
    return response.data || [];
  }

  async createWorkspace(workspace: Partial<StudioWorkspace>): Promise<StudioWorkspace> {
    const response = await this.request<APIResponse<StudioWorkspace>>('/sdk/workspaces', {
      method: 'POST',
      body: JSON.stringify(workspace),
    });
    return response.data!;
  }

  async updateWorkspace(id: string, updates: Partial<StudioWorkspace>): Promise<StudioWorkspace> {
    const response = await this.request<APIResponse<StudioWorkspace>>(`/sdk/workspaces/${id}`, {
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

  // AI Code Generation
  async generateCode(request: CodeGenerationRequest): Promise<CodeGenerationResponse> {
    const response = await this.request<APIResponse<CodeGenerationResponse>>('/sdk/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return response.data!;
  }

  async getAvailableModels(provider: string): Promise<string[]> {
    const response = await this.request<APIResponse<string[]>>(`/sdk/models/${provider}`);
    return response.data || [];
  }

  // Testing
  async runTests(projectId: string, testSuite?: string): Promise<any> {
    const response = await this.request<APIResponse<any>>(`/sdk/test/${projectId}`, {
      method: 'POST',
      body: JSON.stringify({ testSuite }),
    });
    return response.data!;
  }

  async getTestResults(projectId: string): Promise<any[]> {
    const response = await this.request<APIResponse<any[]>>(`/sdk/test/${projectId}/results`);
    return response.data || [];
  }

  // Deployment
  async deployProject(projectId: string, config: Partial<DeploymentConfig>): Promise<any> {
    const response = await this.request<APIResponse<any>>(`/sdk/deploy/${projectId}`, {
      method: 'POST',
      body: JSON.stringify(config),
    });
    return response.data!;
  }

  async getDeploymentStatus(deploymentId: string): Promise<any> {
    const response = await this.request<APIResponse<any>>(`/sdk/deploy/${deploymentId}/status`);
    return response.data!;
  }

  async getDeployments(projectId: string): Promise<any[]> {
    const response = await this.request<APIResponse<any[]>>(`/sdk/deploy/${projectId}`);
    return response.data || [];
  }

  // Collaboration
  async createCollaborationSession(session: Partial<CollaborationSession>): Promise<CollaborationSession> {
    const response = await this.request<APIResponse<CollaborationSession>>('/sdk/collaboration/sessions', {
      method: 'POST',
      body: JSON.stringify(session),
    });
    return response.data!;
  }

  async joinCollaborationSession(sessionId: string, userId: string): Promise<CollaborationSession> {
    const response = await this.request<APIResponse<CollaborationSession>>(`/sdk/collaboration/sessions/${sessionId}/join`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
    return response.data!;
  }

  async leaveCollaborationSession(sessionId: string, userId: string): Promise<void> {
    await this.request(`/sdk/collaboration/sessions/${sessionId}/leave`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async updateLiveCursor(sessionId: string, cursor: any): Promise<any> {
    const response = await this.request<APIResponse<any>>('/sdk/collaboration/cursor', {
      method: 'POST',
      body: JSON.stringify({ sessionId, ...cursor }),
    });
    return response.data!;
  }

  async addCodeComment(sessionId: string, comment: any): Promise<any> {
    const response = await this.request<APIResponse<any>>('/sdk/collaboration/comments', {
      method: 'POST',
      body: JSON.stringify({ sessionId, ...comment }),
    });
    return response.data!;
  }

  async getFileComments(sessionId: string, filePath: string): Promise<any[]> {
    const response = await this.request<APIResponse<any[]>>(
      `/sdk/collaboration/sessions/${sessionId}/comments/${encodeURIComponent(filePath)}`
    );
    return response.data || [];
  }

  // Analytics
  async getAnalytics(developerId: string, period: string = 'month'): Promise<AnalyticsData> {
    const response = await this.request<APIResponse<AnalyticsData>>(`/sdk/analytics/usage?period=${period}`);
    return response.data!;
  }

  async getUsageLogs(developerId: string, limit: number = 50): Promise<any[]> {
    const response = await this.request<APIResponse<any[]>>(
      `/sdk/analytics/logs?limit=${limit}`
    );
    return response.data || [];
  }

  // Stats
  async getStats(developerId: string): Promise<any> {
    const response = await this.request<APIResponse<any>>(`/sdk/analytics/usage`);
    return response.data || {
      totalProjects: 0,
      activeDeployments: 0,
      apiCalls: 0,
      collaborators: 0
    };
  }

  // Workflows
  async getWorkflows(developerId: string): Promise<any[]> {
    const response = await this.request<APIResponse<any[]>>('/sdk/workflows');
    return response.data || [];
  }

  async saveWorkflow(developerId: string, workflow: any): Promise<any> {
    const response = await this.request<APIResponse<any>>('/sdk/workflows', {
      method: 'POST',
      body: JSON.stringify({ developer_id: developerId, ...workflow }),
    });
    return response.data!;
  }

  // AI Agents
  async getAIAgents(developerId: string): Promise<any[]> {
    const response = await this.request<APIResponse<any[]>>('/sdk/agents');
    return response.data || [];
  }

  async updateAgentStatus(agentId: string, status: string): Promise<any> {
    const response = await this.request<APIResponse<any>>(`/sdk/agents/${agentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return response.data!;
  }

  // Profile Management
  async getProfile(userId: string): Promise<any> {
    const response = await this.request<APIResponse<any>>('/sdk/profile');
    return response.data!;
  }

  async updateProfileSubscription(userId: string, tier: string): Promise<any> {
    const response = await this.request<APIResponse<any>>('/sdk/profile/subscription', {
      method: 'PATCH',
      body: JSON.stringify({ tier }),
    });
    return response.data!;
  }

  async saveAPIKey(provider: string, encryptedKey: string): Promise<void> {
    await this.request('/sdk/profile/api-key', {
      method: 'POST',
      body: JSON.stringify({ provider, encryptedKey }),
    });
  }

  // Utility methods
  async logUsage(provider: string, model: string, tokens: any, cost: number): Promise<void> {
    await this.request('/sdk/analytics/log', {
      method: 'POST',
      body: JSON.stringify({ provider, model, ...tokens, cost }),
    });
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
export const studioAPI = new StudioAPI();