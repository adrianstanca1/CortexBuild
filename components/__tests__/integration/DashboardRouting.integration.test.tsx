import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import UnifiedDashboardScreen from '../../screens/UnifiedDashboardScreen';

// Mock all dashboard components
jest.mock('../../screens/admin/UnifiedAdminDashboard', () => {
  return function MockUnifiedAdminDashboard() {
    return <div data-testid="unified-admin-dashboard">Unified Admin Dashboard</div>;
  };
});

jest.mock('../../screens/developer/DeveloperWorkspaceScreen', () => {
  return function MockDeveloperWorkspaceScreen() {
    return <div data-testid="developer-workspace">Developer Workspace</div>;
  };
});

jest.mock('../../screens/company/CompanyAdminDashboardV2', () => {
  return function MockCompanyAdminDashboardScreen() {
    return <div data-testid="company-admin-dashboard-screen">Company Admin Dashboard Screen</div>;
  };
});

jest.mock('../../dashboard/EnhancedDashboard', () => {
  return function MockEnhancedDashboard() {
    return <div data-testid="enhanced-dashboard">Enhanced Dashboard</div>;
  };
});

jest.mock('../../screens/dashboards/SupervisorDashboard', () => {
  return function MockSupervisorDashboard() {
    return <div data-testid="supervisor-dashboard">Supervisor Dashboard</div>;
  };
});

jest.mock('../../screens/dashboards/OperativeDashboard', () => {
  return function MockOperativeDashboard() {
    return <div data-testid="operative-dashboard">Operative Dashboard</div>;
  };
});

describe('Dashboard Routing Integration Tests', () => {
  const mockNavigateTo = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Role-Based Dashboard Routing', () => {
    it('should route super_admin to UnifiedAdminDashboard', () => {
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

    it('should route developer to DeveloperWorkspaceScreen', () => {
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

    it('should route company_admin to CompanyAdminDashboardScreen', () => {
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

      expect(screen.getByTestId('company-admin-dashboard-screen')).toBeInTheDocument();
    });

    it('should route Foreman to SupervisorDashboard', () => {
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

    it('should route operative to OperativeDashboard', () => {
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
  });

  describe('Dashboard Isolation', () => {
    it('should not render multiple dashboards simultaneously', () => {
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
      expect(screen.queryByTestId('developer-workspace')).not.toBeInTheDocument();
      expect(screen.queryByTestId('operative-dashboard')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing role by rendering default dashboard', () => {
      const userWithoutRole = {
        id: 'user-7',
        name: 'Unknown',
        role: 'unknown_role',
        company_id: 'company-1',
      };

      render(
        <UnifiedDashboardScreen
          currentUser={userWithoutRole as any}
          navigateTo={mockNavigateTo}
        />
      );

      // Should render default dashboard for unknown role
      expect(screen.getByTestId('enhanced-dashboard')).toBeInTheDocument();
    });

    it('should handle Accounting Clerk role', () => {
      const accountingUser = {
        id: 'user-8',
        name: 'Accounting Clerk',
        role: 'Accounting Clerk',
        company_id: 'company-1',
      };

      render(
        <UnifiedDashboardScreen
          currentUser={accountingUser as any}
          navigateTo={mockNavigateTo}
        />
      );

      // Should render enhanced dashboard for accounting clerk
      expect(screen.getByTestId('enhanced-dashboard')).toBeInTheDocument();
    });
  });
});
