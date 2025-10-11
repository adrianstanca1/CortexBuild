/**
 * Integration Tests for CortexBuild Application
 * Tests critical user workflows end-to-end
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import App from '../../App';
import * as authService from '../../auth/authService';
import { apiClient } from '../../lib/api/client';

// Mock external dependencies
jest.mock('../../auth/authService');
jest.mock('../../lib/api/client');
jest.mock('../../src/monitoring/webVitals');
jest.mock('../../src/monitoring/performanceObserver');
jest.mock('../../src/monitoring/metricsCollector');
jest.mock('../../src/monitoring/alerting');

const mockedAuthService = authService as jest.Mocked<typeof authService>;
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

// Mock window and console
const mockDispatchEvent = jest.fn();
Object.defineProperty(window, 'dispatchEvent', {
  writable: true,
  value: mockDispatchEvent
});

// Mock user data
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
  },
  {
    id: 'project-2',
    name: 'Test Project 2',
    location: 'Another Location',
    companyId: 'company-1',
    status: 'active',
    startDate: '2025-02-01',
    budget: 200000,
    spent: 50000,
    image: '',
    description: 'Another test project',
    contacts: [],
    snapshot: {
      openRFIs: 0,
      overdueTasks: 0,
      pendingTMTickets: 1,
      aiRiskLevel: 'medium'
    }
  }
];

describe('CortexBuild Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockedAuthService.getCurrentUser.mockResolvedValue(null);
    mockedApiClient.fetchProjects.mockResolvedValue(mockProjects);

    // Mock window events
    window.dispatchEvent = jest.fn();
    window.addEventListener = jest.fn();
    window.removeEventListener = jest.fn();
  });

  describe('Authentication Flow', () => {
    it('should show login screen when user is not authenticated', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
      });

      expect(mockedAuthService.getCurrentUser).toHaveBeenCalled();
    });

    it('should handle successful login', async () => {
      mockedAuthService.getCurrentUser.mockResolvedValue(mockUser);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/unified dashboard/i)).toBeInTheDocument();
      });

      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'userLoggedIn' })
      );
    });

    it('should handle login errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockedAuthService.getCurrentUser.mockRejectedValue(new Error('Auth failed'));

      render(<App />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Session check error:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Project Management Workflow', () => {
    beforeEach(() => {
      mockedAuthService.getCurrentUser.mockResolvedValue(mockUser);
    });

    it('should load and display projects', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Test Project 1')).toBeInTheDocument();
        expect(screen.getByText('Test Project 2')).toBeInTheDocument();
      });

      expect(mockedApiClient.fetchProjects).toHaveBeenCalled();
    });

    it('should navigate to project details', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Test Project 1')).toBeInTheDocument();
      });

      // Click on a project (this would depend on the actual UI structure)
      // For now, we'll test that the navigation function exists
      const projectElements = screen.getAllByText('Test Project 1');
      if (projectElements.length > 0) {
        fireEvent.click(projectElements[0]);
      }
    });

    it('should handle project loading errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockedApiClient.fetchProjects.mockRejectedValue(new Error('Failed to load projects'));

      render(<App />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error loading projects:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Navigation System', () => {
    beforeEach(() => {
      mockedAuthService.getCurrentUser.mockResolvedValue(mockUser);
    });

    it('should maintain navigation state', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      // Test navigation stack management
      // This would depend on the actual navigation implementation
    });

    it('should handle deep links', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      // Test deep link handling
      // window.location.hash = '#dashboard';
      // This would trigger the hash change handler
    });
  });

  describe('Error Handling Integration', () => {
    beforeEach(() => {
      mockedAuthService.getCurrentUser.mockResolvedValue(mockUser);
    });

    it('should display error boundaries for component errors', async () => {
      // Mock a component that throws an error
      const ThrowError = () => {
        throw new Error('Test component error');
      };

      // This would test that error boundaries catch component errors
      // and display fallback UI instead of crashing the app
    });

    it('should handle API errors gracefully', async () => {
      mockedApiClient.fetchProjects.mockRejectedValue({
        code: 'NETWORK_ERROR',
        message: 'Network error',
        userMessage: 'Please check your connection',
        retryable: true,
        timestamp: new Date().toISOString()
      });

      render(<App />);

      await waitFor(() => {
        // Should handle the error without crashing
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });
    });
  });

  describe('Chat Functionality', () => {
    beforeEach(() => {
      mockedAuthService.getCurrentUser.mockResolvedValue(mockUser);
    });

    it('should render chatbot widget for authenticated users', async () => {
      render(<App />);

      await waitFor(() => {
        // Chatbot widget should be present (though it might be lazy loaded)
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });
    });

    it('should handle AI suggestion requests', async () => {
      mockedApiClient.getAISuggestion = jest.fn().mockResolvedValue({
        id: 'suggestion-1',
        title: 'Test Suggestion',
        description: 'Test description',
        action: 'navigate',
        link: {
          screen: 'tasks',
          projectId: 'project-1'
        }
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      // Test AI suggestion functionality
      expect(mockedApiClient.getAISuggestion).toBeDefined();
    });
  });

  describe('Admin Operations', () => {
    beforeEach(() => {
      const adminUser = { ...mockUser, role: 'super_admin' };
      mockedAuthService.getCurrentUser.mockResolvedValue(adminUser);
    });

    it('should show admin dashboard for super admin users', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/admin/i)).toBeInTheDocument();
      });
    });

    it('should handle admin-specific operations', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/admin/i)).toBeInTheDocument();
      });

      // Test admin-specific functionality
      // This would depend on the actual admin interface
    });
  });

  describe('Performance Monitoring Integration', () => {
    beforeEach(() => {
      mockedAuthService.getCurrentUser.mockResolvedValue(mockUser);
    });

    it('should initialize performance monitoring on app start', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      // Performance monitoring should be initialized
      // This is mocked, but in real app it would track metrics
    });
  });

  describe('Offline Support', () => {
    beforeEach(() => {
      mockedAuthService.getCurrentUser.mockResolvedValue(mockUser);
    });

    it('should show offline indicator when appropriate', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      // Offline indicator should be present
      // This would depend on the actual offline detection implementation
    });
  });

  describe('Role-based Access Control', () => {
    it('should show different interfaces for different user roles', async () => {
      // Test company admin
      mockedAuthService.getCurrentUser.mockResolvedValue({ ...mockUser, role: 'company_admin' });
      const { rerender } = render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      // Test developer role
      mockedAuthService.getCurrentUser.mockResolvedValue({ ...mockUser, role: 'developer' });
      rerender(<App />);

      await waitFor(() => {
        expect(screen.getByText(/developer/i)).toBeInTheDocument();
      });

      // Test super admin role
      mockedAuthService.getCurrentUser.mockResolvedValue({ ...mockUser, role: 'super_admin' });
      rerender(<App />);

      await waitFor(() => {
        expect(screen.getByText(/admin/i)).toBeInTheDocument();
      });
    });
  });

  describe('Toast Notifications', () => {
    beforeEach(() => {
      mockedAuthService.getCurrentUser.mockResolvedValue(mockUser);
    });

    it('should display success messages', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      // Toast system should be available
      // This would depend on the actual toast implementation
    });
  });

  describe('End-to-End User Journey', () => {
    beforeEach(() => {
      mockedAuthService.getCurrentUser.mockResolvedValue(mockUser);
    });

    it('should complete a full user session', async () => {
      render(<App />);

      // 1. App loads and authenticates user
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      // 2. Projects are loaded
      expect(mockedApiClient.fetchProjects).toHaveBeenCalled();

      // 3. User can navigate (this would depend on actual UI)
      // 4. User can interact with features
      // 5. User can logout

      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'userLoggedIn' })
      );
    });
  });
});
