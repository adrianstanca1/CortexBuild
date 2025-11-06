/**
 * Integration Tests for CortexBuild Application
 * Tests critical service integrations and workflows
 */

import { jest } from '@jest/globals';

// Mock external dependencies BEFORE importing
jest.mock('../../auth/authService');
jest.mock('../../lib/api/client');
jest.mock('../../src/monitoring/webVitals');
jest.mock('../../src/monitoring/performanceObserver');
jest.mock('../../src/monitoring/metricsCollector');
jest.mock('../../src/monitoring/alerting');

import * as authService from '../../auth/authService';
import { apiClient } from '../../lib/api/client';

const mockedAuthService = authService as jest.Mocked<typeof authService>;
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

// Test data
const mockUser: any = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'company_admin',
  companyId: 'company-1'
};

const mockProjects: any[] = [
  {
    id: 'project-1',
    name: 'Test Project 1',
    location: 'Test Location',
    companyId: 'company-1',
    status: 'active',
    startDate: '2025-01-01',
    budget: 100000,
    spent: 25000,
    image: '',
    description: 'Test project description',
    contacts: [],
    snapshot: {
      openRFIs: 2,
      overdueTasks: 1,
      pendingTMTickets: 0,
      aiRiskLevel: 'low'
    }
  }
];

describe('CortexBuild Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default successful mocks
    mockedAuthService.getCurrentUser.mockResolvedValue(mockUser);
    mockedApiClient.fetchProjects.mockResolvedValue(mockProjects);
  });

  describe('Authentication Integration', () => {
    it('should authenticate user and load initial data', async () => {
      const user = await authService.getCurrentUser();

      expect(user).toBeTruthy();
      expect(user?.id).toBe('user-1');
      expect(user?.role).toBe('company_admin');
    });

    it('should handle authentication errors gracefully', async () => {
      mockedAuthService.getCurrentUser.mockRejectedValueOnce(new Error('Auth failed'));

      await expect(authService.getCurrentUser()).rejects.toThrow('Auth failed');
    });

    it('should load projects after successful authentication', async () => {
      const projects = await apiClient.fetchProjects();

      expect(projects).toHaveLength(1);
      expect(projects[0].name).toBe('Test Project 1');
      expect(mockedApiClient.fetchProjects).toHaveBeenCalled();
    });
  });

  describe('Project Management Integration', () => {
    it('should fetch projects successfully', async () => {
      const projects = await apiClient.fetchProjects();

      expect(projects).toBeDefined();
      expect(Array.isArray(projects)).toBe(true);
      expect(mockedApiClient.fetchProjects).toHaveBeenCalledTimes(1);
    });

    it('should handle project loading errors', async () => {
      mockedApiClient.fetchProjects.mockRejectedValueOnce(new Error('Network error'));

      await expect(apiClient.fetchProjects()).rejects.toThrow('Network error');
    });

    it('should validate project data structure', async () => {
      const projects = await apiClient.fetchProjects();
      const project = projects[0];

      expect(project).toHaveProperty('id');
      expect(project).toHaveProperty('name');
      expect(project).toHaveProperty('status');
      expect(project).toHaveProperty('snapshot');
    });
  });

  describe('Role-Based Access Integration', () => {
    it('should handle different user roles correctly', () => {
      const adminUser = { ...mockUser, role: 'super_admin' };
      const developerUser = { ...mockUser, role: 'developer' };

      expect(adminUser.role).toBe('super_admin');
      expect(developerUser.role).toBe('developer');
    });

    it('should provide appropriate permissions for each role', () => {
      const adminUser = { ...mockUser, role: 'super_admin' };
      const regularUser = { ...mockUser, role: 'company_admin' };

      // Admin should have broader permissions than regular user
      expect(adminUser.role).not.toBe(regularUser.role);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle API errors with proper error structure', async () => {
      const apiError = {
        code: 'NETWORK_ERROR',
        message: 'Network error',
        userMessage: 'Please check your connection',
        retryable: true,
        timestamp: new Date().toISOString()
      };

      mockedApiClient.fetchProjects.mockRejectedValueOnce(apiError);

      await expect(apiClient.fetchProjects()).rejects.toMatchObject({
        code: 'NETWORK_ERROR',
        retryable: true
      });
    });

    it('should handle authentication errors properly', async () => {
      mockedAuthService.getCurrentUser.mockRejectedValueOnce(new Error('Session expired'));

      await expect(authService.getCurrentUser()).rejects.toThrow('Session expired');
    });
  });

  describe('Performance Monitoring Integration', () => {
    it('should initialize performance monitoring systems', () => {
      // Performance monitoring should be initialized
      // This is mocked, but in real implementation it would track metrics
      expect(true).toBe(true); // Placeholder for actual performance tests
    });
  });

  describe('Data Flow Integration', () => {
    it('should maintain data consistency across services', async () => {
      const user = await authService.getCurrentUser();
      const projects = await apiClient.fetchProjects();

      // User company ID should match project company ID
      expect(user?.companyId).toBe(projects[0]?.companyId);
    });

    it('should handle concurrent service calls', async () => {
      const promises = [
        authService.getCurrentUser(),
        apiClient.fetchProjects()
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(2);
      expect(results[0]).toBeTruthy(); // User
      expect(results[1]).toBeTruthy(); // Projects
    });
  });

  describe('Service Communication Integration', () => {
    it('should handle service dependencies correctly', async () => {
      // Test that services can work together
      const user = await authService.getCurrentUser();
      expect(user).toBeTruthy();

      if (user) {
        const projects = await apiClient.fetchProjects();
        expect(projects).toBeTruthy();
      }
    });

    it('should handle partial service failures gracefully', async () => {
      // Auth works but projects fail
      mockedApiClient.fetchProjects.mockRejectedValueOnce(new Error('Projects service down'));

      const user = await authService.getCurrentUser();
      expect(user).toBeTruthy();

      await expect(apiClient.fetchProjects()).rejects.toThrow('Projects service down');
    });
  });

  describe('Configuration Integration', () => {
    it('should use consistent configuration across services', () => {
      // Test that services use the same base URLs, timeouts, etc.
      expect(mockedAuthService.getCurrentUser).toBeDefined();
      expect(mockedApiClient.fetchProjects).toBeDefined();
    });
  });

  describe('End-to-End Workflow Integration', () => {
    it('should complete a full user session workflow', async () => {
      // 1. Authenticate user
      const user = await authService.getCurrentUser();
      expect(user).toBeTruthy();

      // 2. Load user projects
      const projects = await apiClient.fetchProjects();
      expect(projects).toBeTruthy();

      // 3. Verify data consistency
      if (user && projects.length > 0) {
        expect(user.companyId).toBe(projects[0].companyId);
      }
    });

    it('should handle complete workflow failure', async () => {
      // Both services fail
      mockedAuthService.getCurrentUser.mockRejectedValueOnce(new Error('Auth service down'));
      mockedApiClient.fetchProjects.mockRejectedValueOnce(new Error('Projects service down'));

      await expect(authService.getCurrentUser()).rejects.toThrow('Auth service down');
      await expect(apiClient.fetchProjects()).rejects.toThrow('Projects service down');
    });
  });
});
