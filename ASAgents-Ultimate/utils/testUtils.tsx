/**
 * Test Utilities
 * Common utilities for testing React components and services
 */

import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';
import { vi } from 'vitest';

// Mock localStorage
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
    get length() {
      return Object.keys(store).length;
    },
  };
};

// Mock user data
export const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'OWNER' as const,
  companyId: 'company-1',
  permissions: ['VIEW_ALL_PROJECTS', 'MANAGE_TASKS'],
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

// Mock company data
export const mockCompany = {
  id: 'company-1',
  name: 'Test Company',
  type: 'GENERAL_CONTRACTOR' as const,
  email: 'company@example.com',
  phone: '555-0100',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

// Mock project data
export const mockProject = {
  id: 'project-1',
  name: 'Test Project',
  description: 'A test project',
  status: 'IN_PROGRESS' as const,
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  budget: 100000,
  companyId: 'company-1',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

// Mock task data
export const mockTask = {
  id: 'task-1',
  title: 'Test Task',
  description: 'A test task',
  status: 'TODO' as const,
  priority: 'HIGH' as const,
  projectId: 'project-1',
  assignedTo: 'user-1',
  dueDate: '2024-12-31',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

// Custom render with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialUser?: typeof mockUser;
  initialCompany?: typeof mockCompany;
}

export const renderWithProviders = (
  ui: ReactElement,
  options?: CustomRenderOptions
) => {
  const { initialUser = mockUser, initialCompany = mockCompany, ...renderOptions } = options || {};

  const Wrapper = ({ children }: { children: ReactNode }) => {
    // Add context providers here when needed
    return <>{children}</>;
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

// Mock API response
export const mockApiResponse = <T,>(data: T, delay = 0) => {
  return new Promise<T>((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};

// Mock API error
export const mockApiError = (message: string, status = 400, delay = 0) => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject({
        response: {
          status,
          data: { message },
        },
      });
    }, delay);
  });
};

// Setup/teardown helpers
export const setupTest = () => {
  const originalLocalStorage = global.localStorage;
  global.localStorage = mockLocalStorage() as any;
  
  return () => {
    global.localStorage = originalLocalStorage;
  };
};

// Export all testing library utilities
export * from '@testing-library/react';
export { vi } from 'vitest';
