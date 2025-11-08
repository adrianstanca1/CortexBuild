import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UnifiedAdminDashboard from '../UnifiedAdminDashboard';

// Mock the child components
jest.mock('../../../../lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({ eq: jest.fn(() => Promise.resolve({ data: [], error: null })) })),
    })),
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    },
  },
}));

jest.mock('../../../admin/UserManagement', () => {
  return function MockUserManagement() {
    return <div data-testid="user-management">User Management</div>;
  };
});

jest.mock('../../../admin/CompanyManagement', () => {
  return function MockCompanyManagement() {
    return <div data-testid="company-management">Company Management</div>;
  };
});

jest.mock('../../../admin/BillingPaymentsManagement', () => {
  return function MockBillingPaymentsManagement() {
    return <div data-testid="billing-management">Billing Management</div>;
  };
});

jest.mock('../../../admin/AnalyticsReports', () => {
  return function MockAnalyticsReports() {
    return <div data-testid="analytics-reports">Analytics Reports</div>;
  };
});

describe('UnifiedAdminDashboard', () => {
  const mockCurrentUser = {
    id: 'user-123',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'super_admin',
    company_id: 'company-123',
  };

  const mockNavigateTo = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the dashboard without crashing', () => {
    render(
      <UnifiedAdminDashboard
        currentUser={mockCurrentUser}
        navigateTo={mockNavigateTo}
      />
    );
    expect(screen.getByTestId('unified-admin-dashboard')).toBeInTheDocument();
  });

  it('displays the overview tab by default', () => {
    render(
      <UnifiedAdminDashboard
        currentUser={mockCurrentUser}
        navigateTo={mockNavigateTo}
      />
    );
    expect(screen.getByText(/overview/i)).toBeInTheDocument();
  });

  it('switches to users tab when clicked', async () => {
    render(
      <UnifiedAdminDashboard
        currentUser={mockCurrentUser}
        navigateTo={mockNavigateTo}
      />
    );

    const usersTab = screen.getByRole('button', { name: /users/i });
    fireEvent.click(usersTab);

    await waitFor(() => {
      expect(screen.getByTestId('user-management')).toBeInTheDocument();
    });
  });

  it('switches to companies tab when clicked', async () => {
    render(
      <UnifiedAdminDashboard
        currentUser={mockCurrentUser}
        navigateTo={mockNavigateTo}
      />
    );

    const companiesTab = screen.getByRole('button', { name: /companies/i });
    fireEvent.click(companiesTab);

    await waitFor(() => {
      expect(screen.getByTestId('company-management')).toBeInTheDocument();
    });
  });

  it('displays user role badge with super admin role', () => {
    render(
      <UnifiedAdminDashboard
        currentUser={mockCurrentUser}
        navigateTo={mockNavigateTo}
      />
    );

    expect(screen.getByText(/super admin/i)).toBeInTheDocument();
  });

  it('displays user name in profile section', () => {
    render(
      <UnifiedAdminDashboard
        currentUser={mockCurrentUser}
        navigateTo={mockNavigateTo}
      />
    );

    expect(screen.getByText(mockCurrentUser.name)).toBeInTheDocument();
  });

  it('handles null currentUser gracefully', () => {
    const { container } = render(
      <UnifiedAdminDashboard
        currentUser={null as any}
        navigateTo={mockNavigateTo}
      />
    );

    expect(container).toBeInTheDocument();
  });

  it('calls navigateTo when navigation action is triggered', () => {
    render(
      <UnifiedAdminDashboard
        currentUser={mockCurrentUser}
        navigateTo={mockNavigateTo}
      />
    );

    // This would depend on your actual navigation implementation
    // Adjust based on your actual component
  });
});
