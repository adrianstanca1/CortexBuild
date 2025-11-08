import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import UnifiedDashboardScreen from '../UnifiedDashboardScreen';

// Mock all dashboard components
jest.mock('../admin/UnifiedAdminDashboard', () => {
  return function MockUnifiedAdminDashboard() {
    return <div data-testid="unified-admin-dashboard">Unified Admin Dashboard</div>;
  };
});

jest.mock('../developer/DeveloperWorkspaceScreen', () => {
  return function MockDeveloperWorkspaceScreen() {
    return <div data-testid="developer-workspace">Developer Workspace</div>;
  };
});

jest.mock('../company/CompanyAdminDashboardV2', () => {
  return function MockCompanyAdminDashboardV2() {
    return <div data-testid="company-admin-dashboard-v2">Company Admin Dashboard V2</div>;
  };
});

jest.mock('../../dashboard/EnhancedDashboard', () => {
  return function MockEnhancedDashboard() {
    return <div data-testid="enhanced-dashboard">Enhanced Dashboard</div>;
  };
});

jest.mock('../dashboards/SupervisorDashboard', () => {
  return function MockSupervisorDashboard() {
    return <div data-testid="supervisor-dashboard">Supervisor Dashboard</div>;
  };
});

jest.mock('../dashboards/OperativeDashboard', () => {
  return function MockOperativeDashboard() {
    return <div data-testid="operative-dashboard">Operative Dashboard</div>;
  };
});

describe('UnifiedDashboardScreen', () => {
  const mockNavigateTo = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders UnifiedAdminDashboard for super_admin role', () => {
    const superAdminUser = {
      id: 'user-1',
      name: 'Super Admin',
      role: 'super_admin',
      company_id: 'company-1',
    };

    render(
      <UnifiedDashboardScreen
        currentUser={superAdminUser}
        navigateTo={mockNavigateTo}
      />
    );

    expect(screen.getByTestId('unified-admin-dashboard')).toBeInTheDocument();
  });

  it('renders DeveloperWorkspaceScreen for developer role', () => {
    const developerUser = {
      id: 'user-2',
      name: 'Developer',
      role: 'developer',
      company_id: 'company-1',
    };

    render(
      <UnifiedDashboardScreen
        currentUser={developerUser}
        navigateTo={mockNavigateTo}
      />
    );

    expect(screen.getByTestId('developer-workspace')).toBeInTheDocument();
  });

  it('renders CompanyAdminDashboardV2 for company_admin role', () => {
    const companyAdminUser = {
      id: 'user-3',
      name: 'Company Admin',
      role: 'company_admin',
      company_id: 'company-1',
    };

    render(
      <UnifiedDashboardScreen
        currentUser={companyAdminUser}
        navigateTo={mockNavigateTo}
      />
    );

    expect(screen.getByTestId('company-admin-dashboard-v2')).toBeInTheDocument();
  });

  it('renders EnhancedDashboard for Project Manager role', () => {
    const projectManagerUser = {
      id: 'user-4',
      name: 'Project Manager',
      role: 'Project Manager',
      company_id: 'company-1',
    };

    render(
      <UnifiedDashboardScreen
        currentUser={projectManagerUser}
        navigateTo={mockNavigateTo}
      />
    );

    expect(screen.getByTestId('enhanced-dashboard')).toBeInTheDocument();
  });

  it('renders SupervisorDashboard for Foreman role', () => {
    const foremanUser = {
      id: 'user-5',
      name: 'Foreman',
      role: 'Foreman',
      company_id: 'company-1',
    };

    render(
      <UnifiedDashboardScreen
        currentUser={foremanUser}
        navigateTo={mockNavigateTo}
      />
    );

    expect(screen.getByTestId('supervisor-dashboard')).toBeInTheDocument();
  });

  it('renders OperativeDashboard for operative role', () => {
    const operativeUser = {
      id: 'user-6',
      name: 'Operative',
      role: 'operative',
      company_id: 'company-1',
    };

    render(
      <UnifiedDashboardScreen
        currentUser={operativeUser}
        navigateTo={mockNavigateTo}
      />
    );

    expect(screen.getByTestId('operative-dashboard')).toBeInTheDocument();
  });

  it('renders EnhancedDashboard as default for unknown role', () => {
    const unknownRoleUser = {
      id: 'user-7',
      name: 'Unknown Role',
      role: 'unknown_role',
      company_id: 'company-1',
    };

    render(
      <UnifiedDashboardScreen
        currentUser={unknownRoleUser}
        navigateTo={mockNavigateTo}
      />
    );

    expect(screen.getByTestId('enhanced-dashboard')).toBeInTheDocument();
  });
});

