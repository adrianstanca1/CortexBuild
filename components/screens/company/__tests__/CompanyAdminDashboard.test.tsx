import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CompanyAdminDashboard from '../CompanyAdminDashboard';

// Mock child components
jest.mock('../../../construction/ProjectsManagement', () => {
  return function MockProjectsManagement() {
    return <div data-testid="projects-management">Projects Management</div>;
  };
});

jest.mock('../../../company/TeamManagement', () => {
  return function MockTeamManagement() {
    return <div data-testid="team-management">Team Management</div>;
  };
});

describe('CompanyAdminDashboard', () => {
  const mockCurrentUser = {
    id: 'user-456',
    name: 'Company Admin',
    email: 'admin@company.com',
    role: 'company_admin',
    company_id: 'company-456',
  };

  const mockNavigateTo = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the dashboard without crashing', () => {
    render(
      <CompanyAdminDashboard
        currentUser={mockCurrentUser}
        navigateTo={mockNavigateTo}
      />
    );
    expect(screen.getByTestId('company-admin-dashboard')).toBeInTheDocument();
  });

  it('displays overview tab by default', () => {
    render(
      <CompanyAdminDashboard
        currentUser={mockCurrentUser}
        navigateTo={mockNavigateTo}
      />
    );
    expect(screen.getByText(/overview/i)).toBeInTheDocument();
  });

  it('displays company statistics', () => {
    render(
      <CompanyAdminDashboard
        currentUser={mockCurrentUser}
        navigateTo={mockNavigateTo}
      />
    );
    
    expect(screen.getByText(/active projects/i)).toBeInTheDocument();
    expect(screen.getByText(/team members/i)).toBeInTheDocument();
  });

  it('switches to office tab when clicked', async () => {
    render(
      <CompanyAdminDashboard
        currentUser={mockCurrentUser}
        navigateTo={mockNavigateTo}
      />
    );
    
    const officeTab = screen.getByRole('button', { name: /office/i });
    fireEvent.click(officeTab);
    
    await waitFor(() => {
      expect(screen.getByText(/office operations/i)).toBeInTheDocument();
    });
  });

  it('switches to field tab when clicked', async () => {
    render(
      <CompanyAdminDashboard
        currentUser={mockCurrentUser}
        navigateTo={mockNavigateTo}
      />
    );
    
    const fieldTab = screen.getByRole('button', { name: /field/i });
    fireEvent.click(fieldTab);
    
    await waitFor(() => {
      expect(screen.getByText(/field operations/i)).toBeInTheDocument();
    });
  });

  it('displays user name in header', () => {
    render(
      <CompanyAdminDashboard
        currentUser={mockCurrentUser}
        navigateTo={mockNavigateTo}
      />
    );
    
    expect(screen.getByText(mockCurrentUser.name)).toBeInTheDocument();
  });

  it('displays company admin role badge', () => {
    render(
      <CompanyAdminDashboard
        currentUser={mockCurrentUser}
        navigateTo={mockNavigateTo}
      />
    );
    
    expect(screen.getByText(/company admin/i)).toBeInTheDocument();
  });

  it('handles navigation to different sections', () => {
    render(
      <CompanyAdminDashboard
        currentUser={mockCurrentUser}
        navigateTo={mockNavigateTo}
      />
    );
    
    const projectsButton = screen.getByRole('button', { name: /projects/i });
    fireEvent.click(projectsButton);
    
    expect(mockNavigateTo).toHaveBeenCalled();
  });

  it('displays billing information', () => {
    render(
      <CompanyAdminDashboard
        currentUser={mockCurrentUser}
        navigateTo={mockNavigateTo}
      />
    );
    
    expect(screen.getByText(/billing/i)).toBeInTheDocument();
  });
});

