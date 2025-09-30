// Enhanced backend service with intelligent fallback to mock data
import { backendApi } from './backendApiService';
import { api as mockApi } from './mockApi';
import { getEnvironment } from '../config/environment';
import type {
  User,
  Project,
  Task,
  Company,
  Expense,
  Invoice,
  Document,
  DashboardSnapshot,
  LoginCredentials,
  RegistrationPayload,
  AuthenticatedSession
} from '../types';

export interface ServiceConfig {
  useBackend: boolean;
  fallbackToMock: boolean;
  timeout: number;
}

class EnhancedBackendService {
  private config: ServiceConfig;
  private isBackendAvailable: boolean = false;
  private lastHealthCheck: number = 0;
  private healthCheckInterval: number = 30000; // 30 seconds

  constructor() {
    const env = getEnvironment();
    this.config = {
      useBackend: env.features.useSupabase || !!env.apiUrl,
      fallbackToMock: env.features.allowMockFallback,
      timeout: 10000, // 10 seconds
    };

    // Don't perform async operations in constructor
    // Health check will be performed on first use
  }

  /**
   * Check if backend is available
   */
  private async checkBackendHealth(): Promise<boolean> {
    const now = Date.now();
    
    // Skip if recently checked
    if (now - this.lastHealthCheck < this.healthCheckInterval) {
      return this.isBackendAvailable;
    }

    this.lastHealthCheck = now;

    if (!this.config.useBackend) {
      this.isBackendAvailable = false;
      return false;
    }

    try {
      const response = await backendApi.getSystemHealth();
      this.isBackendAvailable = response.success && response.data?.status === 'ok';
    } catch (error) {
      console.warn('Backend health check failed:', error);
      this.isBackendAvailable = false;
    }

    return this.isBackendAvailable;
  }

  /**
   * Execute with fallback strategy
   */
  private async executeWithFallback<T>(
    backendOperation: () => Promise<T>,
    mockOperation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    // Check backend availability
    const backendAvailable = await this.checkBackendHealth();

    if (backendAvailable && this.config.useBackend) {
      try {
        console.log(`Executing ${operationName} via backend API`);
        return await backendOperation();
      } catch (error) {
        console.warn(`Backend ${operationName} failed:`, error);
        
        if (this.config.fallbackToMock) {
          console.log(`Falling back to mock data for ${operationName}`);
          return await mockOperation();
        }
        
        throw error;
      }
    }

    if (this.config.fallbackToMock) {
      console.log(`Using mock data for ${operationName}`);
      return await mockOperation();
    }

    throw new Error(`Backend unavailable and mock fallback disabled for ${operationName}`);
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<AuthenticatedSession> {
    return this.executeWithFallback(
      async () => {
        const response = await backendApi.login(credentials);
        if (!response.success) {
          throw new Error(response.error || 'Login failed');
        }
        return response.data!;
      },
      () => mockApi.login(credentials),
      'login'
    );
  }

  async register(payload: RegistrationPayload): Promise<AuthenticatedSession> {
    return this.executeWithFallback(
      async () => {
        const response = await backendApi.register(payload);
        if (!response.success) {
          throw new Error(response.error || 'Registration failed');
        }
        return response.data!;
      },
      () => mockApi.register(payload),
      'register'
    );
  }

  async logout(): Promise<void> {
    return this.executeWithFallback(
      async () => {
        const response = await backendApi.logout();
        if (!response.success) {
          throw new Error(response.error || 'Logout failed');
        }
      },
      () => mockApi.logout(),
      'logout'
    );
  }

  // User methods
  async getCurrentUser(): Promise<User> {
    return this.executeWithFallback(
      async () => {
        const response = await backendApi.getCurrentUser();
        if (!response.success) {
          throw new Error(response.error || 'Failed to get current user');
        }
        return response.data!;
      },
      () => mockApi.getCurrentUser(),
      'getCurrentUser'
    );
  }

  async getUsers(): Promise<User[]> {
    return this.executeWithFallback(
      async () => {
        const response = await backendApi.getUsers();
        if (!response.success) {
          throw new Error(response.error || 'Failed to get users');
        }
        return response.data!;
      },
      () => mockApi.getUsers(),
      'getUsers'
    );
  }

  // Company methods
  async getCompanies(): Promise<Company[]> {
    return this.executeWithFallback(
      async () => {
        const response = await backendApi.getCompanies();
        if (!response.success) {
          throw new Error(response.error || 'Failed to get companies');
        }
        return response.data!;
      },
      () => mockApi.getCompanies(),
      'getCompanies'
    );
  }

  async createCompany(company: Partial<Company>): Promise<Company> {
    return this.executeWithFallback(
      async () => {
        const response = await backendApi.createCompany(company);
        if (!response.success) {
          throw new Error(response.error || 'Failed to create company');
        }
        // Return the created company (would need to fetch it)
        const createdResponse = await backendApi.getCompany(response.data!.id.toString());
        if (!createdResponse.success) {
          throw new Error('Failed to fetch created company');
        }
        return createdResponse.data!;
      },
      () => mockApi.createCompany(company),
      'createCompany'
    );
  }

  // Project methods
  async getProjects(): Promise<Project[]> {
    return this.executeWithFallback(
      async () => {
        const response = await backendApi.getProjects();
        if (!response.success) {
          throw new Error(response.error || 'Failed to get projects');
        }
        return response.data!;
      },
      () => mockApi.getProjects(),
      'getProjects'
    );
  }

  async createProject(project: Partial<Project>): Promise<Project> {
    return this.executeWithFallback(
      async () => {
        const response = await backendApi.createProject(project);
        if (!response.success) {
          throw new Error(response.error || 'Failed to create project');
        }
        // Return the created project (would need to fetch it)
        const createdResponse = await backendApi.getProject(response.data!.id.toString());
        if (!createdResponse.success) {
          throw new Error('Failed to fetch created project');
        }
        return createdResponse.data!;
      },
      () => mockApi.createProject(project),
      'createProject'
    );
  }

  // Task methods
  async getTasks(filters?: {
    projectId?: string;
    assignedTo?: string;
    status?: string;
    priority?: string;
  }): Promise<Task[]> {
    return this.executeWithFallback(
      async () => {
        const response = await backendApi.getTasks(filters);
        if (!response.success) {
          throw new Error(response.error || 'Failed to get tasks');
        }
        return response.data!;
      },
      () => mockApi.getTodos(),
      'getTasks'
    );
  }

  async createTask(task: Partial<Task>): Promise<Task> {
    return this.executeWithFallback(
      async () => {
        const response = await backendApi.createTask(task);
        if (!response.success) {
          throw new Error(response.error || 'Failed to create task');
        }
        // Return the created task (would need to fetch it)
        const createdResponse = await backendApi.getTask(response.data!.id.toString());
        if (!createdResponse.success) {
          throw new Error('Failed to fetch created task');
        }
        return createdResponse.data!;
      },
      () => mockApi.createTodo(task),
      'createTask'
    );
  }

  // Expense methods
  async getExpenses(filters?: {
    projectId?: string;
    userId?: string;
    category?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Expense[]> {
    return this.executeWithFallback(
      async () => {
        const response = await backendApi.getExpenses(filters);
        if (!response.success) {
          throw new Error(response.error || 'Failed to get expenses');
        }
        return response.data!;
      },
      () => mockApi.getExpenses(),
      'getExpenses'
    );
  }

  async createExpense(expense: Partial<Expense>): Promise<Expense> {
    return this.executeWithFallback(
      async () => {
        const response = await backendApi.createExpense(expense);
        if (!response.success) {
          throw new Error(response.error || 'Failed to create expense');
        }
        // Return the created expense (would need to fetch it)
        const createdResponse = await backendApi.getExpense(response.data!.id.toString());
        if (!createdResponse.success) {
          throw new Error('Failed to fetch created expense');
        }
        return createdResponse.data!;
      },
      () => mockApi.createExpense(expense),
      'createExpense'
    );
  }

  // Dashboard methods
  async getDashboardSnapshot(params: {
    userId: string;
    companyId: string;
    signal?: AbortSignal;
    forceRefresh?: boolean;
  }): Promise<DashboardSnapshot> {
    return this.executeWithFallback(
      async () => {
        // For backend, we'd need to aggregate data from multiple endpoints
        const [projects, users, expenses] = await Promise.all([
          this.getProjects(),
          this.getUsers(),
          this.getExpenses()
        ]);

        return {
          projects,
          team: users,
          equipment: [], // Would need equipment endpoint
          tasks: [], // Would need tasks endpoint
          activityLog: [], // Would need audit log endpoint
          operationalInsights: null,
          incidents: [], // Would need incidents endpoint
          expenses,
          portfolioSummary: null,
          metadata: {
            source: 'backend',
            generatedAt: new Date().toISOString(),
            usedFallback: false,
            projectCount: projects.length
          }
        };
      },
      () => mockApi.getDashboardSnapshot(params),
      'getDashboardSnapshot'
    );
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      backendAvailable: this.isBackendAvailable,
      usingBackend: this.config.useBackend && this.isBackendAvailable,
      fallbackEnabled: this.config.fallbackToMock,
      lastHealthCheck: new Date(this.lastHealthCheck).toISOString()
    };
  }
}

// Export singleton instance
export const enhancedBackend = new EnhancedBackendService();
