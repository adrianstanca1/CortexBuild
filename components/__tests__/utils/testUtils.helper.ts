import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { describe, expect, it } from '@jest/globals';

/**
 * Mock user objects for testing
 */
export const mockUsers = {
  superAdmin: {
    id: 'user-super-admin-1',
    name: 'Super Admin User',
    email: 'superadmin@example.com',
    role: 'super_admin',
    company_id: 'company-1',
  },
  companyAdmin: {
    id: 'user-company-admin-1',
    name: 'Company Admin User',
    email: 'companyadmin@example.com',
    role: 'company_admin',
    company_id: 'company-1',
  },
  projectManager: {
    id: 'user-pm-1',
    name: 'Project Manager',
    email: 'pm@example.com',
    role: 'Project Manager',
    company_id: 'company-1',
  },
  foreman: {
    id: 'user-foreman-1',
    name: 'Foreman',
    email: 'foreman@example.com',
    role: 'Foreman',
    company_id: 'company-1',
  },
  operative: {
    id: 'user-operative-1',
    name: 'Operative',
    email: 'operative@example.com',
    role: 'operative',
    company_id: 'company-1',
  },
  developer: {
    id: 'user-developer-1',
    name: 'Developer',
    email: 'developer@example.com',
    role: 'developer',
    company_id: 'company-1',
  },
};

/**
 * Mock company objects for testing
 */
export const mockCompanies = {
  company1: {
    id: 'company-1',
    name: 'Test Construction Co',
    email: 'contact@testconstruction.com',
    phone: '555-0100',
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    zip: '10001',
  },
  company2: {
    id: 'company-2',
    name: 'Build Solutions Inc',
    email: 'contact@buildsolutions.com',
    phone: '555-0200',
    address: '456 Oak Ave',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90001',
  },
};

/**
 * Mock project objects for testing
 */
export const mockProjects = {
  project1: {
    id: 'project-1',
    name: 'Downtown Office Complex',
    company_id: 'company-1',
    status: 'active',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    budget: 5000000,
    spent: 2500000,
  },
  project2: {
    id: 'project-2',
    name: 'Residential Development',
    company_id: 'company-1',
    status: 'planning',
    startDate: '2024-06-01',
    endDate: '2025-06-01',
    budget: 3000000,
    spent: 0,
  },
};

/**
 * Custom render function that includes common providers
 */
export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(React.Fragment, null, children as any);
  };

  return render(ui, { wrapper: Wrapper, ...options });
};

/**
 * Wait for async operations
 */
export const waitForAsync = () => {
  return new Promise(resolve => setTimeout(resolve, 0));
};

/**
 * Create mock API response
 */
export const createMockApiResponse = <T,>(data: T, status = 200) => {
  return {
    data,
    status,
    statusText: 'OK',
    headers: {},
    config: {},
  };
};

/**
 * Create mock API error
 */
export const createMockApiError = (message: string, status = 500) => {
  const error = new Error(message);
  (error as any).response = {
    status,
    data: { message },
  };
  return error;
};

/**
 * Mock localStorage
 */
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach(key => delete store[key]);
    },
  };
};

/**
 * Mock sessionStorage
 */
export const mockSessionStorage = () => {
  const store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach(key => delete store[key]);
    },
  };
};

describe('testUtils.helper exports', () => {
  it('provides mock user roles', () => {
    expect(mockUsers.superAdmin.role).toBe('super_admin');
  });

  it('renders using renderWithProviders helper', () => {
    const element = React.createElement('div', { 'data-testid': 'provider-test' });
    const { container } = renderWithProviders(element);
    expect(container.firstChild).toBeTruthy();
  });
});
