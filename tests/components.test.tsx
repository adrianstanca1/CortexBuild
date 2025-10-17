// Component Unit Tests for CortexBuild
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// Mock the auth service
vi.mock('../auth/authService', () => ({
  getCurrentUser: vi.fn().mockResolvedValue({
    id: 'test-user',
    email: 'test@example.com',
    name: 'Test User',
    role: 'admin'
  }),
  getHealthStatus: vi.fn().mockResolvedValue({
    status: 'healthy',
    services: { api: 'up', database: 'up' }
  })
}));

// Mock the navigation hook
vi.mock('../hooks/useNavigation', () => ({
  useNavigation: () => ({
    currentScreen: 'dashboard',
    navigateTo: vi.fn(),
    goBack: vi.fn(),
    canGoBack: false,
    navigationStack: [{ screen: 'dashboard', data: {} }]
  })
}));

// Mock the toast hook
vi.mock('../hooks/useToast', () => ({
  useToast: () => ({
    toasts: [],
    addToast: vi.fn(),
    removeToast: vi.fn()
  })
}));

describe('Core Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AuthScreen Component', () => {
    it('should render login form', async () => {
      const AuthScreen = (await import('../components/screens/AuthScreen')).default;
      const mockOnLogin = vi.fn();
      
      render(<AuthScreen onLogin={mockOnLogin} />);
      
      expect(screen.getByText(/sign in/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('should handle login form submission', async () => {
      const AuthScreen = (await import('../components/screens/AuthScreen')).default;
      const mockOnLogin = vi.fn();
      
      render(<AuthScreen onLogin={mockOnLogin} />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnLogin).toHaveBeenCalled();
      });
    });
  });

  describe('ErrorBoundary Component', () => {
    it('should catch and display errors', () => {
      const ErrorBoundary = require('../components/ErrorBoundary').default;
      const ThrowError = () => {
        throw new Error('Test error');
      };
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );
      
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      consoleSpy.mockRestore();
    });

    it('should render children when no error', () => {
      const ErrorBoundary = require('../components/ErrorBoundary').default;
      
      render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      );
      
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });
  });

  describe('ToastContainer Component', () => {
    it('should render toast messages', () => {
      const ToastContainer = require('../components/ToastContainer').default;
      const mockToasts = [
        { id: '1', type: 'success', title: 'Success', message: 'Operation completed' },
        { id: '2', type: 'error', title: 'Error', message: 'Something went wrong' }
      ];
      
      render(<ToastContainer toasts={mockToasts} onRemoveToast={vi.fn()} />);
      
      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Operation completed')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should handle toast removal', () => {
      const ToastContainer = require('../components/ToastContainer').default;
      const mockOnRemove = vi.fn();
      const mockToasts = [
        { id: '1', type: 'success', title: 'Success', message: 'Test message' }
      ];
      
      render(<ToastContainer toasts={mockToasts} onRemoveToast={mockOnRemove} />);
      
      const closeButton = screen.getByRole('button');
      fireEvent.click(closeButton);
      
      expect(mockOnRemove).toHaveBeenCalledWith('1');
    });
  });

  describe('MainSidebar Component', () => {
    it('should render navigation items', () => {
      const MainSidebar = require('../components/layout/MainSidebar').default;
      const mockProps = {
        currentScreen: 'dashboard',
        onNavigate: vi.fn(),
        currentUser: { id: '1', name: 'Test User', email: 'test@example.com' },
        currentProject: { id: '1', name: 'Test Project' }
      };
      
      render(<MainSidebar {...mockProps} />);
      
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });

    it('should handle navigation clicks', () => {
      const MainSidebar = require('../components/layout/MainSidebar').default;
      const mockOnNavigate = vi.fn();
      const mockProps = {
        currentScreen: 'dashboard',
        onNavigate: mockOnNavigate,
        currentUser: { id: '1', name: 'Test User', email: 'test@example.com' },
        currentProject: { id: '1', name: 'Test Project' }
      };
      
      render(<MainSidebar {...mockProps} />);
      
      const dashboardLink = screen.getByText(/dashboard/i);
      fireEvent.click(dashboardLink);
      
      expect(mockOnNavigate).toHaveBeenCalled();
    });
  });

  describe('AppLayout Component', () => {
    it('should render header and content', () => {
      const AppLayout = require('../components/layout/AppLayout').default;
      
      render(
        <AppLayout onLogout={vi.fn()} canGoBack={false} onGoBack={vi.fn()}>
          <div>Test content</div>
        </AppLayout>
      );
      
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should handle logout', () => {
      const AppLayout = require('../components/layout/AppLayout').default;
      const mockOnLogout = vi.fn();
      
      render(
        <AppLayout onLogout={mockOnLogout} canGoBack={false} onGoBack={vi.fn()}>
          <div>Test content</div>
        </AppLayout>
      );
      
      // Look for logout button and click it
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      fireEvent.click(logoutButton);
      
      expect(mockOnLogout).toHaveBeenCalled();
    });
  });

  describe('FloatingMenu Component', () => {
    it('should render menu items', () => {
      const FloatingMenu = require('../components/layout/FloatingMenu').default;
      const mockProps = {
        isOpen: true,
        onClose: vi.fn(),
        onNavigate: vi.fn(),
        currentUser: { id: '1', name: 'Test User', email: 'test@example.com' }
      };
      
      render(<FloatingMenu {...mockProps} />);
      
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      const FloatingMenu = require('../components/layout/FloatingMenu').default;
      const mockProps = {
        isOpen: false,
        onClose: vi.fn(),
        onNavigate: vi.fn(),
        currentUser: { id: '1', name: 'Test User', email: 'test@example.com' }
      };
      
      render(<FloatingMenu {...mockProps} />);
      
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  describe('ChatbotWidget Component', () => {
    it('should render chat interface', () => {
      const { ChatbotWidget } = require('../components/chat/ChatbotWidget');
      
      render(<ChatbotWidget />);
      
      expect(screen.getByRole('button')).toBeInTheDocument(); // Chat toggle button
    });

    it('should toggle chat visibility', () => {
      const { ChatbotWidget } = require('../components/chat/ChatbotWidget');
      
      render(<ChatbotWidget />);
      
      const toggleButton = screen.getByRole('button');
      fireEvent.click(toggleButton);
      
      // Chat should be open
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should handle message sending', async () => {
      const { ChatbotWidget } = require('../components/chat/ChatbotWidget');
      
      render(<ChatbotWidget />);
      
      // Open chat
      const toggleButton = screen.getByRole('button');
      fireEvent.click(toggleButton);
      
      const input = screen.getByRole('textbox');
      const sendButton = screen.getByRole('button', { name: /send/i });
      
      fireEvent.change(input, { target: { value: 'Hello' } });
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText('Hello')).toBeInTheDocument();
      });
    });
  });
});
