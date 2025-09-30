// Enhanced Dual Backend Service for ASAgents
// Intelligently routes requests between Node.js (AI) and Java (Enterprise) backends
import type {
  User,
  Project,
  Task,
  Company,
  Expense,
  LoginCredentials,
  AuthenticatedSession
} from '../types';

export interface DualBackendResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  backend?: 'nodejs' | 'java' | 'combined';
  fallback?: boolean;
}

export interface EnhancedAuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  nodeJsAuth?: any;
  enterpriseFeatures?: boolean;
  multiBackendAuth?: boolean;
  aiEnhanced?: boolean;
  roles?: string[];
  permissions?: Record<string, boolean>;
  backendCapabilities?: Record<string, any>;
}

export interface MultimodalProcessingRequest {
  projectId: string;
  file?: File;
  analysisType?: 'basic' | 'full' | 'enterprise';
  aiFeatures?: string[];
  enterpriseAnalysis?: boolean;
}

export interface MultimodalProcessingResponse {
  success: boolean;
  aiProcessing?: any;
  enterpriseAnalysis?: {
    projectAnalytics: any;
    complianceCheck: any;
    costAnalysis: any;
    riskAssessment: any;
  };
  combinedCapabilities?: boolean;
  processingBackends?: string[];
  syncStatus?: any;
}

class DualBackendService {
  private nodeJsUrl: string = 'http://localhost:4000/api';
  private javaUrl: string = 'http://localhost:4001/api';
  private token: string | null = null;
  private backendHealth: { nodejs: boolean; java: boolean } = {
    nodejs: false,
    java: false
  };

  constructor() {
    // Load token from storage
    this.token = localStorage.getItem('auth_token');
    
    // Initialize backend health monitoring
    this.monitorBackendHealth();
  }

  /**
   * Enhanced authentication using both backends
   */
  async enhancedLogin(credentials: LoginCredentials): Promise<EnhancedAuthResponse> {
    try {
      // Try enhanced authentication via Java backend first
      const response = await this.fetchFromJava('/enhanced/auth/enhanced-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (response.ok) {
        const authData = await response.json();
        
        if (authData.nodeJsAuth && !authData.nodeJsAuth.error) {
          // Enhanced authentication successful
          this.setToken(authData.nodeJsAuth.token);
          
          return {
            success: true,
            token: authData.nodeJsAuth.token,
            user: authData.nodeJsAuth.user,
            nodeJsAuth: authData.nodeJsAuth,
            enterpriseFeatures: authData.enterpriseFeatures,
            multiBackendAuth: authData.multiBackendAuth,
            aiEnhanced: authData.aiEnhanced,
            roles: authData.roles,
            permissions: authData.permissions,
            backendCapabilities: authData.backendCapabilities
          };
        }
      }

      // Fallback to Node.js only authentication
      return await this.fallbackNodeJsLogin(credentials);

    } catch (error) {
      console.error('Enhanced authentication failed:', error);
      return await this.fallbackNodeJsLogin(credentials);
    }
  }

  /**
   * Fallback Node.js authentication
   */
  private async fallbackNodeJsLogin(credentials: LoginCredentials): Promise<EnhancedAuthResponse> {
    try {
      const response = await this.fetchFromNodeJs('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (response.ok) {
        const authData = await response.json();
        this.setToken(authData.token);
        
        return {
          success: true,
          token: authData.token,
          user: authData.user,
          enterpriseFeatures: false,
          multiBackendAuth: false,
          aiEnhanced: false
        };
      }

      throw new Error('Authentication failed');
    } catch (error) {
      return {
        success: false,
        error: `Authentication failed: ${error}`
      };
    }
  }

  /**
   * Enhanced multimodal processing using both backends
   */
  async processMultimodal(request: MultimodalProcessingRequest): Promise<MultimodalProcessingResponse> {
    try {
      const formData = new FormData();
      formData.append('projectId', request.projectId);
      if (request.file) {
        formData.append('file', request.file);
      }
      formData.append('analysisType', request.analysisType || 'full');

      const response = await this.fetchFromJava('/enhanced/projects/process-multimodal', {
        method: 'POST',
        headers: this.getAuthHeaders(false), // Don't set Content-Type for FormData
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        return {
          success: true,
          aiProcessing: result.aiProcessing,
          enterpriseAnalysis: result.enterpriseAnalysis,
          combinedCapabilities: result.combinedCapabilities,
          processingBackends: result.processingBackends,
          syncStatus: result.syncStatus
        };
      }

      // Fallback to Node.js only processing
      return await this.fallbackNodeJsProcessing(request);

    } catch (error) {
      console.error('Enhanced multimodal processing failed:', error);
      return await this.fallbackNodeJsProcessing(request);
    }
  }

  /**
   * Get unified dashboard data from both backends
   */
  async getUnifiedDashboard(userId: string): Promise<DualBackendResponse> {
    try {
      const response = await this.fetchFromJava(`/enhanced/dashboard/unified?userId=${userId}`, {
        headers: this.getAuthHeaders()
      });

      if (response.ok) {
        const dashboardData = await response.json();
        return {
          success: true,
          data: dashboardData,
          backend: 'combined'
        };
      }

      // Fallback to individual backend calls
      return await this.getFallbackDashboard(userId);

    } catch (error) {
      console.error('Unified dashboard failed:', error);
      return await this.getFallbackDashboard(userId);
    }
  }

  /**
   * Intelligent project routing - AI features to Node.js, enterprise to Java
   */
  async getProjects(params: any = {}): Promise<DualBackendResponse<Project[]>> {
    const promises = [];

    // Get AI-enhanced projects from Node.js if available
    if (this.backendHealth.nodejs) {
      promises.push(
        this.fetchFromNodeJs('/projects', { headers: this.getAuthHeaders() })
          .then(res => res.ok ? res.json() : null)
          .catch(() => null)
      );
    }

    // Get enterprise project data from Java if available
    if (this.backendHealth.java) {
      promises.push(
        this.fetchFromJava('/projects', { headers: this.getAuthHeaders() })
          .then(res => res.ok ? res.json() : null)
          .catch(() => null)
      );
    }

    try {
      const results = await Promise.all(promises);
      const [nodeProjects, javaProjects] = results;

      // Merge and enhance project data
      const projects = this.mergeProjectData(nodeProjects, javaProjects);

      return {
        success: true,
        data: projects,
        backend: 'combined'
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch projects: ${error}`,
        backend: 'none'
      };
    }
  }

  /**
   * Route AI-specific requests to Node.js
   */
  async processAiRequest(endpoint: string, data: any): Promise<DualBackendResponse> {
    try {
      const response = await this.fetchFromNodeJs(`/ai/${endpoint}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        return {
          success: true,
          data: result,
          backend: 'nodejs'
        };
      }

      throw new Error(`AI request failed: ${response.statusText}`);

    } catch (error) {
      return {
        success: false,
        error: `AI processing failed: ${error}`,
        backend: 'nodejs',
        fallback: false
      };
    }
  }

  /**
   * Route enterprise requests to Java
   */
  async processEnterpriseRequest(endpoint: string, data: any): Promise<DualBackendResponse> {
    try {
      const response = await this.fetchFromJava(`/${endpoint}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        return {
          success: true,
          data: result,
          backend: 'java'
        };
      }

      throw new Error(`Enterprise request failed: ${response.statusText}`);

    } catch (error) {
      return {
        success: false,
        error: `Enterprise processing failed: ${error}`,
        backend: 'java',
        fallback: false
      };
    }
  }

  /**
   * Get system health from both backends
   */
  async getSystemHealth(): Promise<DualBackendResponse> {
    try {
      const response = await this.fetchFromJava('/enhanced/health');
      
      if (response.ok) {
        const health = await response.json();
        this.backendHealth = {
          nodejs: health.nodejsBackend?.status === 'healthy',
          java: health.javaBackend?.status === 'healthy'
        };
        
        return {
          success: true,
          data: health,
          backend: 'combined'
        };
      }

      throw new Error('Health check failed');

    } catch (error) {
      return {
        success: false,
        error: `Health check failed: ${error}`,
        backend: 'none'
      };
    }
  }

  // Private helper methods
  private async fetchFromNodeJs(endpoint: string, options: RequestInit = {}): Promise<Response> {
    return fetch(`${this.nodeJsUrl}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        'X-Source': 'dual-backend-service'
      }
    });
  }

  private async fetchFromJava(endpoint: string, options: RequestInit = {}): Promise<Response> {
    return fetch(`${this.javaUrl}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        'X-Source': 'dual-backend-service'
      }
    });
  }

  private getAuthHeaders(includeContentType: boolean = true): Record<string, string> {
    const headers: Record<string, string> = {};
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    
    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }
    
    return headers;
  }

  private setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  private async monitorBackendHealth(): Promise<void> {
    try {
      // Check Node.js backend
      const nodeCheck = await this.fetchFromNodeJs('/health').then(res => res.ok).catch(() => false);
      
      // Check Java backend
      const javaCheck = await this.fetchFromJava('/enhanced/health').then(res => res.ok).catch(() => false);
      
      this.backendHealth = {
        nodejs: nodeCheck,
        java: javaCheck
      };

    } catch (error) {
      console.warn('Backend health monitoring failed:', error);
    }
  }

  private async fallbackNodeJsProcessing(request: MultimodalProcessingRequest): Promise<MultimodalProcessingResponse> {
    try {
      const formData = new FormData();
      if (request.file) {
        formData.append('file', request.file);
      }
      formData.append('projectId', request.projectId);

      const response = await this.fetchFromNodeJs('/upload', {
        method: 'POST',
        headers: this.getAuthHeaders(false),
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        return {
          success: true,
          aiProcessing: result,
          combinedCapabilities: false,
          processingBackends: ['nodejs']
        };
      }

      throw new Error('Node.js processing failed');

    } catch (error) {
      return {
        success: false,
        error: `Multimodal processing failed: ${error}`
      };
    }
  }

  private async getFallbackDashboard(userId: string): Promise<DualBackendResponse> {
    const dashboardData: any = {};

    // Try to get data from available backends
    if (this.backendHealth.nodejs) {
      try {
        const nodeResponse = await this.fetchFromNodeJs(`/dashboard?userId=${userId}`, {
          headers: this.getAuthHeaders()
        });
        if (nodeResponse.ok) {
          dashboardData.nodeJsData = await nodeResponse.json();
        }
      } catch (error) {
        console.warn('Failed to get Node.js dashboard data:', error);
      }
    }

    if (this.backendHealth.java) {
      try {
        const javaResponse = await this.fetchFromJava(`/dashboard?userId=${userId}`, {
          headers: this.getAuthHeaders()
        });
        if (javaResponse.ok) {
          dashboardData.javaData = await javaResponse.json();
        }
      } catch (error) {
        console.warn('Failed to get Java dashboard data:', error);
      }
    }

    return {
      success: Object.keys(dashboardData).length > 0,
      data: dashboardData,
      backend: 'combined',
      fallback: true
    };
  }

  private mergeProjectData(nodeProjects: any, javaProjects: any): Project[] {
    const projects: Project[] = [];
    
    // Add Node.js projects with AI enhancements
    if (nodeProjects?.data) {
      projects.push(...nodeProjects.data.map((project: Project) => ({
        ...project,
        aiEnhanced: true,
        source: 'nodejs'
      })));
    }

    // Add or enhance with Java enterprise data
    if (javaProjects?.data) {
      javaProjects.data.forEach((javaProject: Project) => {
        const existingIndex = projects.findIndex(p => p.id === javaProject.id);
        if (existingIndex >= 0) {
          // Enhance existing project with enterprise data
          projects[existingIndex] = {
            ...projects[existingIndex],
            ...javaProject,
            aiEnhanced: true,
            enterpriseFeatures: true,
            source: 'combined'
          };
        } else {
          // Add new enterprise project
          projects.push({
            ...javaProject,
            enterpriseFeatures: true,
            source: 'java'
          });
        }
      });
    }

    return projects;
  }

  // Getter for backend health status
  get isHealthy(): { nodejs: boolean; java: boolean; overall: boolean } {
    return {
      ...this.backendHealth,
      overall: this.backendHealth.nodejs || this.backendHealth.java
    };
  }

  // Health check method
  async checkBackendHealth(): Promise<{ node: boolean; typescript: boolean }> {
    const results = { node: false, typescript: false };
    
    try {
      const nodeHealth = await this.getWithFallback('/api/health');
      results.node = nodeHealth.success || false;
    } catch {
      results.node = false;
    }
    
    try {
      const tsHealth = await this.getWithFallback('/api/health', { preferBackend: 'typescript' });
      results.typescript = tsHealth.success || false;
    } catch {
      results.typescript = false;
    }
    
    return results;
  }
}

export const dualBackendService = new DualBackendService();
export default dualBackendService;
