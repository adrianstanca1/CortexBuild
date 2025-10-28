import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NotificationCenter } from '../../../components/notifications/NotificationCenter';
import { NotificationProvider } from '../../../contexts/NotificationContext';
import type { Notification } from '../../../types/notifications';

// Mock the NotificationContext
const mockNotifications: Notification[] = [
  {
    id: '1',
    user_id: 'user-1',
    title: 'Test Notification 1',
    message: 'This is a test notification',
    type: 'info',
    category: 'system',
    priority: 'medium',
    channels: ['in_app'],
    read: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: 'user-1',
    title: 'Test Notification 2',
    message: 'This is another test notification',
    type: 'warning',
    category: 'task',
    priority: 'high',
    channels: ['in_app', 'email'],
    read: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const mockContextValue = {
  notifications: mockNotifications,
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
  X: () => <div data-testid="x-icon">X</div>,
  Check: () => <div data-testid="check-icon">Check</div>,
  Trash2: () => <div data-testid="trash-icon">Trash</div>,
  BellOff: () => <div data-testid="bell-off-icon">BellOff</div>,
  Filter: () => <div data-testid="filter-icon">Filter</div>,
  Search: () => <div data-testid="search-icon">Search</div>,
  CheckCheck: () => <div data-testid="check-check-icon">CheckCheck</div>,
  Archive: () => <div data-testid="archive-icon">Archive</div>,
  Settings: () => <div data-testid="settings-icon">Settings</div>,
  MoreVertical: () => <div data-testid="more-vertical-icon">MoreVertical</div>,
  AlertCircle: () => <div data-testid="alert-circle-icon">AlertCircle</div>,
  Info: () => <div data-testid="info-icon">Info</div>,
  CheckCircle: () => <div data-testid="check-circle-icon">CheckCircle</div>,
  XCircle: () => <div data-testid="x-circle-icon">XCircle</div>,
}));

describe('NotificationCenter Component', () => {
  const defaultProps = {
    userId: 'user-1',
    isOpen: true,
    onClose: jest.fn(),
    filters: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders notification center when open', () => {
      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationCenter {...defaultProps} />
        </NotificationProvider>
      );

      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('1 unread')).toBeInTheDocument();
      expect(screen.getByText('2 total')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationCenter {...defaultProps} isOpen={false} />
        </NotificationProvider>
      );

      expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
    });

    it('displays loading state', () => {
      const loadingContext = { ...mockContextValue, loading: true };
      jest.mocked(require('../../../contexts/NotificationContext').useNotifications).mockReturnValue(loadingContext);

      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationCenter {...defaultProps} />
        </NotificationProvider>
      );

      expect(screen.getByText('Loading notifications...')).toBeInTheDocument();
    });

    it('displays error state', () => {
      const errorContext = { ...mockContextValue, error: 'Failed to load notifications' };
      jest.mocked(require('../../../contexts/NotificationContext').useNotifications).mockReturnValue(errorContext);

      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationCenter {...defaultProps} />
        </NotificationProvider>
      );

      expect(screen.getByText('Error loading notifications')).toBeInTheDocument();
      expect(screen.getByText('Failed to load notifications')).toBeInTheDocument();
    });

    it('displays empty state when no notifications', () => {
      const emptyContext = { ...mockContextValue, notifications: [] };
      jest.mocked(require('../../../contexts/NotificationContext').useNotifications).mockReturnValue(emptyContext);

      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationCenter {...defaultProps} />
        </NotificationProvider>
      );

      expect(screen.getByText('No notifications')).toBeInTheDocument();
      expect(screen.getByText("You're all caught up!")).toBeInTheDocument();
    });
  });

  describe('Notification Display', () => {
    it('renders notifications correctly', () => {
      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationCenter {...defaultProps} />
        </NotificationProvider>
      );

      expect(screen.getByText('Test Notification 1')).toBeInTheDocument();
      expect(screen.getByText('Test Notification 2')).toBeInTheDocument();
      expect(screen.getByText('This is a test notification')).toBeInTheDocument();
      expect(screen.getByText('This is another test notification')).toBeInTheDocument();
    });

    it('groups notifications by date', () => {
      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationCenter {...defaultProps} />
        </NotificationProvider>
      );

      expect(screen.getByText('Today')).toBeInTheDocument();
    });

    it('shows priority badges', () => {
      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationCenter {...defaultProps} />
        </NotificationProvider>
      );

      expect(screen.getByText('medium')).toBeInTheDocument();
      expect(screen.getByText('high')).toBeInTheDocument();
    });

    it('shows category badges', () => {
      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationCenter {...defaultProps} />
        </NotificationProvider>
      );

      expect(screen.getByText('system')).toBeInTheDocument();
      expect(screen.getByText('task')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('calls onClose when close button is clicked', () => {
      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationCenter {...defaultProps} />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByTestId('x-icon'));
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('calls markAsRead when notification is clicked', () => {
      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationCenter {...defaultProps} />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByText('Test Notification 1'));
      expect(mockContextValue.markAsRead).toHaveBeenCalledWith('1');
    });

    it('calls markAllAsRead when mark all button is clicked', () => {
      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationCenter {...defaultProps} />
        </NotificationProvider>
      );

      fireEvent.click(screen.getByText('Mark all as read'));
      expect(mockContextValue.markAllAsRead).toHaveBeenCalledTimes(1);
    });

    it('toggles view modes correctly', () => {
      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationCenter {...defaultProps} />
        </NotificationProvider>
      );

      // Click on "Unread" mode
      fireEvent.click(screen.getByText('Unread'));
      expect(screen.getByText('Unread')).toHaveClass('bg-white');

      // Click on "Priority" mode
      fireEvent.click(screen.getByText('Priority'));
      expect(screen.getByText('Priority')).toHaveClass('bg-white');
    });

    it('toggles filters panel', () => {
      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationCenter {...defaultProps} />
        </NotificationProvider>
      );

      const filterButton = screen.getByTestId('filter-icon');
      fireEvent.click(filterButton);

      // Should show search input and filters
      expect(screen.getByPlaceholderText('Search notifications...')).toBeInTheDocument();
    });
  });

  describe('Filtering and Search', () => {
    it('filters notifications based on search query', async () => {
      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationCenter {...defaultProps} />
        </NotificationProvider>
      );

      // Open filters
      fireEvent.click(screen.getByTestId('filter-icon'));

      // Type in search
      const searchInput = screen.getByPlaceholderText('Search notifications...');
      fireEvent.change(searchInput, { target: { value: 'another' } });

      await waitFor(() => {
        expect(screen.getByText('Test Notification 2')).toBeInTheDocument();
        expect(screen.queryByText('Test Notification 1')).not.toBeInTheDocument();
      });
    });

    it('filters by read status', async () => {
      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationCenter {...defaultProps} />
        </NotificationProvider>
      );

      // Open filters
      fireEvent.click(screen.getByTestId('filter-icon'));

      // Select "Read" filter
      const readSelect = screen.getByDisplayValue('All Status');
      fireEvent.change(readSelect, { target: { value: 'true' } });

      await waitFor(() => {
        expect(screen.getByText('Test Notification 2')).toBeInTheDocument();
        expect(screen.queryByText('Test Notification 1')).not.toBeInTheDocument();
      });
    });

    it('filters by priority', async () => {
      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationCenter {...defaultProps} />
        </NotificationProvider>
      );

      // Open filters
      fireEvent.click(screen.getByTestId('filter-icon'));

      // Select "High" priority filter
      const prioritySelect = screen.getByDisplayValue('All Priorities');
      fireEvent.change(prioritySelect, { target: { value: 'high' } });

      await waitFor(() => {
        expect(screen.getByText('Test Notification 2')).toBeInTheDocument();
        expect(screen.queryByText('Test Notification 1')).not.toBeInTheDocument();
      });
    });
  });

  describe('Bulk Operations', () => {
    it('selects all notifications', () => {
      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationCenter {...defaultProps} />
        </NotificationProvider>
      );

      const selectAllCheckbox = screen.getByLabelText('Select all');
      fireEvent.click(selectAllCheckbox);

      // Should show bulk action buttons
      expect(screen.getByText('Mark as read')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('performs bulk mark as read', () => {
      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationCenter {...defaultProps} />
        </NotificationProvider>
      );

      // Select all
      const selectAllCheckbox = screen.getByLabelText('Select all');
      fireEvent.click(selectAllCheckbox);

      // Click bulk mark as read
      fireEvent.click(screen.getByText('Mark as read'));
      expect(mockContextValue.markAsRead).toHaveBeenCalledTimes(2);
    });

    it('performs bulk delete', () => {
      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationCenter {...defaultProps} />
        </NotificationProvider>
      );

      // Select all
      const selectAllCheckbox = screen.getByLabelText('Select all');
      fireEvent.click(selectAllCheckbox);

      // Click bulk delete
      fireEvent.click(screen.getByText('Delete'));
      expect(mockContextValue.deleteNotification).toHaveBeenCalledTimes(2);
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationCenter {...defaultProps} />
        </NotificationProvider>
      );

      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    });

    it('supports keyboard navigation', () => {
      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationCenter {...defaultProps} />
        </NotificationProvider>
      );

      const closeButton = screen.getByTestId('x-icon');
      closeButton.focus();
      expect(closeButton).toHaveFocus();
    });
  });

  describe('Edge Cases', () => {
    it('handles notifications with missing data gracefully', () => {
      const incompleteNotifications = [
        {
          ...mockNotifications[0],
          title: undefined,
          message: undefined,
        },
      ];

      const incompleteContext = { ...mockContextValue, notifications: incompleteNotifications };
      jest.mocked(require('../../../contexts/NotificationContext').useNotifications).mockReturnValue(incompleteContext);

      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationCenter {...defaultProps} />
        </NotificationProvider>
      );

      // Should not crash and show fallback content
      expect(screen.getByText('Notification')).toBeInTheDocument();
    });

    it('handles very long notification messages', () => {
      const longMessage = 'A'.repeat(1000);
      const longNotifications = [
        {
          ...mockNotifications[0],
          message: longMessage,
        },
      ];

      const longContext = { ...mockContextValue, notifications: longNotifications };
      jest.mocked(require('../../../contexts/NotificationContext').useNotifications).mockReturnValue(longContext);

      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationCenter {...defaultProps} />
        </NotificationProvider>
      );

      // Should render without issues
      expect(screen.getByText(longMessage.substring(0, 100) + '...')).toBeInTheDocument();
    });

    it('handles notifications with special characters', () => {
      const specialNotifications = [
        {
          ...mockNotifications[0],
          title: 'Notification with émojis 🎉 and spëcial chärs',
          message: 'Message with <script>alert("xss")</script> and symbols @#$%^&*()',
        },
      ];

      const specialContext = { ...mockContextValue, notifications: specialNotifications };
      jest.mocked(require('../../../contexts/NotificationContext').useNotifications).mockReturnValue(specialContext);

      render(
        <NotificationProvider userId="user-1" companyId="company-1">
          <NotificationCenter {...defaultProps} />
        </NotificationProvider>
      );

      expect(screen.getByText('Notification with émojis 🎉 and spëcial chärs')).toBeInTheDocument();
    });
  });
});