import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationBell, NotificationBellWithPreview } from '../../../components/notifications/NotificationBell';
import { NotificationProvider } from '../../../contexts/NotificationContext';
import type { Notification } from '../../../types/notifications';

// Mock the NotificationContext
const mockContextValue = {
  notifications: [
    {
      id: '1',
      user_id: 'user-1',
      company_id: 'company-1',
      title: 'Test Notification 1',
      message: 'This is a test notification',
      type: 'info',
      category: 'system',
      priority: 'medium',
      channels: ['in_app'],
      read: false,
      metadata: {},
      company_wide: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      user_id: 'user-1',
      company_id: 'company-1',
      title: 'Test Notification 2',
      message: 'This is another test notification',
      type: 'warning',
      category: 'task',
      priority: 'high',
      channels: ['in_app', 'email'],
      read: true,
      metadata: {},
      company_wide: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ] as Notification[],
  unreadCount: 1,
  loading: false,
  error: null,
  preferences: null,
  summary: {
    total: 2,
    unread: 1,
    high_priority: 1,
    by_type: { info: 1, warning: 1 },
    by_category: { system: 1, task: 1 },
    by_priority: { medium: 1, high: 1 },
  },
  fetchNotifications: jest.fn(),
  markAsRead: jest.fn(),
  markAllAsRead: jest.fn(),
  deleteNotification: jest.fn(),
  dismissNotification: jest.fn(),
  updatePreferences: jest.fn(),
  refreshNotifications: jest.fn(),
  subscribeToNotifications: jest.fn(() => () => {}),
  isSubscribed: true,
};

jest.mock('../../../contexts/NotificationContext', () => ({
  useNotifications: () => mockContextValue,
  NotificationProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Bell: () => <div data-testid="bell-icon">Bell</div>,
  BellRing: () => <div data-testid="bell-ring-icon">BellRing</div>,
}));

describe('NotificationBell Component', () => {
  const defaultProps = {
    userId: 'user-1',
    onOpenNotifications: jest.fn(),
    showUnreadCount: true,
    maxCount: 99,
    className: '',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders bell icon when there are no unread notifications', () => {
      const noUnreadContext = { ...mockContextValue, unreadCount: 0 };
      jest.mocked(require('../../../contexts/NotificationContext').useNotifications).mockReturnValue(noUnreadContext);

      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationBell {...defaultProps} />
        </NotificationProvider>
      );

      expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('bell-ring-icon')).not.toBeInTheDocument();
    });

    it('renders bell ring icon when there are unread notifications', () => {
      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationBell {...defaultProps} />
        </NotificationProvider>
      );

      expect(screen.getByTestId('bell-ring-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('bell-icon')).not.toBeInTheDocument();
    });

    it('displays unread count badge when showUnreadCount is true and there are unread notifications', () => {
      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationBell {...defaultProps} />
        </NotificationProvider>
      );

      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('does not display unread count badge when showUnreadCount is false', () => {
      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationBell {...defaultProps} showUnreadCount={false} />
        </NotificationProvider>
      );

      expect(screen.queryByText('1')).not.toBeInTheDocument();
    });

    it('displays "99+" when unread count exceeds maxCount', () => {
      const highCountContext = { ...mockContextValue, unreadCount: 150 };
      jest.mocked(require('../../../contexts/NotificationContext').useNotifications).mockReturnValue(highCountContext);

      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationBell {...defaultProps} />
        </NotificationProvider>
      );

      expect(screen.getByText('99+')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationBell {...defaultProps} className="custom-class" />
        </NotificationProvider>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('shows loading state with reduced opacity', () => {
      const loadingContext = { ...mockContextValue, loading: true };
      jest.mocked(require('../../../contexts/NotificationContext').useNotifications).mockReturnValue(loadingContext);

      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationBell {...defaultProps} />
        </NotificationProvider>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('opacity-50');
    });

    it('shows error state with red text', () => {
      const errorContext = { ...mockContextValue, error: 'Failed to load' };
      jest.mocked(require('../../../contexts/NotificationContext').useNotifications).mockReturnValue(errorContext);

      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationBell {...defaultProps} />
        </NotificationProvider>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-red-500');
    });
  });

  describe('User Interactions', () => {
    it('calls onOpenNotifications when clicked', () => {
      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationBell {...defaultProps} />
        </NotificationProvider>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(defaultProps.onOpenNotifications).toHaveBeenCalledTimes(1);
    });

    it('supports keyboard navigation with Enter key', () => {
      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationBell {...defaultProps} />
        </NotificationProvider>
      );

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });

      expect(defaultProps.onOpenNotifications).toHaveBeenCalledTimes(1);
    });

    it('supports keyboard navigation with Space key', () => {
      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationBell {...defaultProps} />
        </NotificationProvider>
      );

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: ' ' });

      expect(defaultProps.onOpenNotifications).toHaveBeenCalledTimes(1);
    });

    it('shows tooltip on hover', () => {
      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationBell {...defaultProps} />
        </NotificationProvider>
      );

      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);

      expect(screen.getByText('1 unread notifications')).toBeInTheDocument();
    });

    it('shows different tooltip when loading', () => {
      const loadingContext = { ...mockContextValue, loading: true };
      jest.mocked(require('../../../contexts/NotificationContext').useNotifications).mockReturnValue(loadingContext);

      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationBell {...defaultProps} />
        </NotificationProvider>
      );

      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('shows different tooltip when there are no unread notifications', () => {
      const noUnreadContext = { ...mockContextValue, unreadCount: 0 };
      jest.mocked(require('../../../contexts/NotificationContext').useNotifications).mockReturnValue(noUnreadContext);

      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationBell {...defaultProps} />
        </NotificationProvider>
      );

      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);

      expect(screen.getByText('Notifications (no unread)')).toBeInTheDocument();
    });
  });

  describe('Animation and Visual States', () => {
    it('shows bounce animation when new notification arrives', () => {
      // Mock the initial state with 0 unread
      const initialContext = { ...mockContextValue, unreadCount: 0 };
      jest.mocked(require('../../../contexts/NotificationContext').useNotifications).mockReturnValue(initialContext);

      const { rerender } = render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationBell {...defaultProps} />
        </NotificationProvider>
      );

      // Change to 1 unread (simulating new notification)
      const updatedContext = { ...mockContextValue, unreadCount: 1 };
      jest.mocked(require('../../../contexts/NotificationContext').useNotifications).mockReturnValue(updatedContext);

      rerender(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationBell {...defaultProps} />
        </NotificationProvider>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('animate-bounce');
    });

    it('shows pulse animation on badge when new notification arrives', () => {
      const { rerender } = render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationBell {...defaultProps} />
        </NotificationProvider>
      );

      // Trigger animation by changing unread count
      const updatedContext = { ...mockContextValue, unreadCount: 2 };
      jest.mocked(require('../../../contexts/NotificationContext').useNotifications).mockReturnValue(updatedContext);

      rerender(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationBell {...defaultProps} />
        </NotificationProvider>
      );

      const badge = screen.getByText('2');
      expect(badge).toHaveClass('animate-pulse', 'scale-110');
    });

    it('shows connection status dot when subscribed', () => {
      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationBell {...defaultProps} />
        </NotificationProvider>
      );

      const dot = screen.getByTitle('Connected');
      expect(dot).toBeInTheDocument();
      expect(dot).toHaveClass('animate-pulse');
    });

    it('does not show connection status dot when there are unread notifications', () => {
      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationBell {...defaultProps} />
        </NotificationProvider>
      );

      const dot = screen.getByTitle('Connected');
      expect(dot).toHaveClass('hidden');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA label', () => {
      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationBell {...defaultProps} />
        </NotificationProvider>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Notifications (1 unread)');
    });

    it('has proper ARIA expanded state', () => {
      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationBell {...defaultProps} />
        </NotificationProvider>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('is focusable', () => {
      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationBell {...defaultProps} />
        </NotificationProvider>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('tabIndex', '0');
    });
  });
});

describe('NotificationBellWithPreview Component', () => {
  const defaultProps = {
    userId: 'user-1',
    onOpenNotifications: jest.fn(),
    showUnreadCount: true,
    maxCount: 99,
    className: '',
    previewCount: 3,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Preview Dropdown', () => {
    it('shows preview dropdown when bell is clicked', () => {
      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationBellWithPreview {...defaultProps} />
        </NotificationProvider>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(screen.getByText('Recent Notifications')).toBeInTheDocument();
      expect(screen.getByText('Test Notification 1')).toBeInTheDocument();
    });

    it('closes preview when clicking outside', () => {
      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationBellWithPreview {...defaultProps} />
        </NotificationProvider>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(screen.getByText('Recent Notifications')).toBeInTheDocument();

      // Click outside (backdrop)
      const backdrop = document.querySelector('.fixed.inset-0.z-40');
      if (backdrop) {
        fireEvent.click(backdrop);
      }

      expect(screen.queryByText('Recent Notifications')).not.toBeInTheDocument();
    });

    it('shows only unread notifications in preview', () => {
      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationBellWithPreview {...defaultProps} />
        </NotificationProvider>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(screen.getByText('Test Notification 1')).toBeInTheDocument();
      expect(screen.queryByText('Test Notification 2')).not.toBeInTheDocument();
    });

    it('limits preview to previewCount items', () => {
      const manyNotifications = Array.from({ length: 5 }, (_, i) => ({
        id: `${i + 1}`,
        user_id: 'user-1',
        company_id: 'company-1',
        title: `Test Notification ${i + 1}`,
        message: `This is test notification ${i + 1}`,
        type: 'info' as const,
        category: 'system' as const,
        priority: 'medium' as const,
        channels: ['in_app'] as const,
        read: false,
        metadata: {},
        company_wide: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const manyContext = { ...mockContextValue, notifications: manyNotifications, unreadCount: 5 };
      jest.mocked(require('../../../contexts/NotificationContext').useNotifications).mockReturnValue(manyContext);

      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationBellWithPreview {...defaultProps} previewCount={3} />
        </NotificationProvider>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(screen.getByText('Test Notification 1')).toBeInTheDocument();
      expect(screen.getByText('Test Notification 2')).toBeInTheDocument();
      expect(screen.getByText('Test Notification 3')).toBeInTheDocument();
      expect(screen.queryByText('Test Notification 4')).not.toBeInTheDocument();
    });

    it('shows "View all notifications" button', () => {
      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationBellWithPreview {...defaultProps} />
        </NotificationProvider>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(screen.getByText('View all notifications')).toBeInTheDocument();
    });

    it('calls onOpenNotifications when "View all" is clicked', () => {
      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationBellWithPreview {...defaultProps} />
        </NotificationProvider>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      const viewAllButton = screen.getByText('View all notifications');
      fireEvent.click(viewAllButton);

      expect(defaultProps.onOpenNotifications).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('does not show preview when there are no unread notifications', () => {
      const noUnreadContext = { ...mockContextValue, unreadCount: 0 };
      jest.mocked(require('../../../contexts/NotificationContext').useNotifications).mockReturnValue(noUnreadContext);

      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationBellWithPreview {...defaultProps} />
        </NotificationProvider>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(screen.queryByText('Recent Notifications')).not.toBeInTheDocument();
    });

    it('handles notifications with long messages gracefully', () => {
      const longMessage = 'A'.repeat(200);
      const longNotifications = [
        {
          ...mockContextValue.notifications[0],
          message: longMessage,
        },
      ];

      const longContext = { ...mockContextValue, notifications: longNotifications };
      jest.mocked(require('../../../contexts/NotificationContext').useNotifications).mockReturnValue(longContext);

      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationBellWithPreview {...defaultProps} />
        </NotificationProvider>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Should truncate long messages
      expect(screen.getByText(longMessage.substring(0, 100) + '...')).toBeInTheDocument();
    });
  });
});