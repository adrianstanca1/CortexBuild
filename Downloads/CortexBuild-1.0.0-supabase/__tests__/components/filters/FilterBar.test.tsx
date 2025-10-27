import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterBar from '../../../components/filters/FilterBar';
import { FilterProvider } from '../../../contexts/FilterContext';
import { TenantProvider } from '../../../contexts/TenantContext';

// Mock the contexts
jest.mock('../../../contexts/FilterContext', () => ({
  useFilters: () => ({
    currentFilters: {
      query: '',
      status: [],
      priority: [],
      assignee: [],
      tags: [],
      dateRange: { start: '', end: '' },
      location: '',
      budgetRange: { min: 0, max: 1000000 },
      projectType: [],
      customFields: {}
    },
    activePreset: null,
    presets: [
      {
        id: '1',
        name: 'High Priority Tasks',
        description: 'Shows only high priority tasks',
        criteria: { priority: ['High'] },
        entityType: 'tasks',
        isDefault: false,
        isShared: false,
        createdBy: 'user1',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      }
    ],
    searchHistory: [],
    setFilters: jest.fn(),
    clearFilters: jest.fn(),
    applyPreset: jest.fn(),
    saveAsPreset: jest.fn(),
    loadPresets: jest.fn(),
    getSearchSuggestions: jest.fn().mockResolvedValue(['urgent tasks', 'overdue items']),
    getSmartFilters: jest.fn().mockResolvedValue({ status: ['To Do'] })
  })
}));

jest.mock('../../../contexts/TenantContext', () => ({
  useTenant: () => ({
    user: {
      id: 'user1',
      name: 'Test User',
      company_id: 'company1'
    }
  })
}));

// Mock fetch globally
global.fetch = jest.fn();

const renderFilterBar = (entityType: 'tasks' | 'projects' | 'rfis' | 'documents' | 'users' = 'tasks') => {
  return render(
    <TenantProvider>
      <FilterProvider>
        <FilterBar
          entityType={entityType}
          onFiltersChange={jest.fn()}
          totalCount={25}
        />
      </FilterProvider>
    </TenantProvider>
  );
};

describe('FilterBar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render search input for tasks', () => {
      renderFilterBar('tasks');
      expect(screen.getByPlaceholderText('Search tasks...')).toBeInTheDocument();
    });

    it('should render search input for projects', () => {
      renderFilterBar('projects');
      expect(screen.getByPlaceholderText('Search projects...')).toBeInTheDocument();
    });

    it('should render filter toggle button', () => {
      renderFilterBar();
      expect(screen.getByText('Filters')).toBeInTheDocument();
    });

    it('should render presets button', () => {
      renderFilterBar();
      expect(screen.getByText('Presets')).toBeInTheDocument();
    });

    it('should render smart filters button', () => {
      renderFilterBar();
      expect(screen.getByText('Smart Filters')).toBeInTheDocument();
    });

    it('should render clear filters button when filters are active', () => {
      // Mock active filters
      jest.doMock('../../../contexts/FilterContext', () => ({
        useFilters: () => ({
          currentFilters: {
            query: 'test',
            status: ['To Do'],
            priority: [],
            assignee: [],
            tags: [],
            dateRange: { start: '', end: '' },
            location: '',
            budgetRange: { min: 0, max: 1000000 },
            projectType: [],
            customFields: {}
          },
          activePreset: null,
          presets: [],
          searchHistory: [],
          setFilters: jest.fn(),
          clearFilters: jest.fn(),
          applyPreset: jest.fn(),
          saveAsPreset: jest.fn(),
          loadPresets: jest.fn(),
          getSearchSuggestions: jest.fn().mockResolvedValue([]),
          getSmartFilters: jest.fn().mockResolvedValue({})
        })
      }));

      renderFilterBar();
      expect(screen.getByText('Clear')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should update search query when user types', async () => {
      const user = userEvent.setup();
      const mockSetFilters = jest.fn();

      jest.doMock('../../../contexts/FilterContext', () => ({
        useFilters: () => ({
          currentFilters: {
            query: '',
            status: [],
            priority: [],
            assignee: [],
            tags: [],
            dateRange: { start: '', end: '' },
            location: '',
            budgetRange: { min: 0, max: 1000000 },
            projectType: [],
            customFields: {}
          },
          activePreset: null,
          presets: [],
          searchHistory: [],
          setFilters: mockSetFilters,
          clearFilters: jest.fn(),
          applyPreset: jest.fn(),
          saveAsPreset: jest.fn(),
          loadPresets: jest.fn(),
          getSearchSuggestions: jest.fn().mockResolvedValue(['urgent tasks']),
          getSmartFilters: jest.fn().mockResolvedValue({})
        })
      }));

      renderFilterBar();

      const searchInput = screen.getByPlaceholderText('Search tasks...');
      await user.type(searchInput, 'urgent');

      expect(mockSetFilters).toHaveBeenCalledWith({ query: 'urgent' });
    });

    it('should show search suggestions when query is long enough', async () => {
      const user = userEvent.setup();

      renderFilterBar();

      const searchInput = screen.getByPlaceholderText('Search tasks...');
      await user.type(searchInput, 'urgent');

      await waitFor(() => {
        expect(screen.getByText('urgent tasks')).toBeInTheDocument();
      });
    });

    it('should handle suggestion click', async () => {
      const user = userEvent.setup();
      const mockSetFilters = jest.fn();

      jest.doMock('../../../contexts/FilterContext', () => ({
        useFilters: () => ({
          currentFilters: {
            query: '',
            status: [],
            priority: [],
            assignee: [],
            tags: [],
            dateRange: { start: '', end: '' },
            location: '',
            budgetRange: { min: 0, max: 1000000 },
            projectType: [],
            customFields: {}
          },
          activePreset: null,
          presets: [],
          searchHistory: [],
          setFilters: mockSetFilters,
          clearFilters: jest.fn(),
          applyPreset: jest.fn(),
          saveAsPreset: jest.fn(),
          loadPresets: jest.fn(),
          getSearchSuggestions: jest.fn().mockResolvedValue(['urgent tasks']),
          getSmartFilters: jest.fn().mockResolvedValue({})
        })
      }));

      renderFilterBar();

      const searchInput = screen.getByPlaceholderText('Search tasks...');
      await user.type(searchInput, 'urgent');

      await waitFor(() => {
        const suggestion = screen.getByText('urgent tasks');
        fireEvent.click(suggestion);
      });

      expect(mockSetFilters).toHaveBeenCalledWith({ query: 'urgent tasks' });
    });
  });

  describe('Filter Toggle', () => {
    it('should expand filters when toggle is clicked', async () => {
      const user = userEvent.setup();

      renderFilterBar('tasks');

      const filterToggle = screen.getByText('Filters');
      await user.click(filterToggle);

      // Should show expanded filter options for tasks
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Priority')).toBeInTheDocument();
      expect(screen.getByText('Assignee')).toBeInTheDocument();
      expect(screen.getByText('Date Range')).toBeInTheDocument();
    });

    it('should show project-specific filters for projects entity type', async () => {
      const user = userEvent.setup();

      renderFilterBar('projects');

      const filterToggle = screen.getByText('Filters');
      await user.click(filterToggle);

      // Should show project-specific filters
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Location')).toBeInTheDocument();
      expect(screen.getByText('Budget Range')).toBeInTheDocument();
      expect(screen.getByText('Project Type')).toBeInTheDocument();
    });

    it('should collapse filters when toggle is clicked again', async () => {
      const user = userEvent.setup();

      renderFilterBar('tasks');

      const filterToggle = screen.getByText('Filters');

      // Expand
      await user.click(filterToggle);
      expect(screen.getByText('Status')).toBeInTheDocument();

      // Collapse
      await user.click(filterToggle);
      expect(screen.queryByText('Status')).not.toBeInTheDocument();
    });
  });

  describe('Filter Options', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      renderFilterBar('tasks');

      const filterToggle = screen.getByText('Filters');
      await user.click(filterToggle);
    });

    it('should handle status filter changes', async () => {
      const user = userEvent.setup();
      const mockSetFilters = jest.fn();

      jest.doMock('../../../contexts/FilterContext', () => ({
        useFilters: () => ({
          currentFilters: {
            query: '',
            status: [],
            priority: [],
            assignee: [],
            tags: [],
            dateRange: { start: '', end: '' },
            location: '',
            budgetRange: { min: 0, max: 1000000 },
            projectType: [],
            customFields: {}
          },
          activePreset: null,
          presets: [],
          searchHistory: [],
          setFilters: mockSetFilters,
          clearFilters: jest.fn(),
          applyPreset: jest.fn(),
          saveAsPreset: jest.fn(),
          loadPresets: jest.fn(),
          getSearchSuggestions: jest.fn().mockResolvedValue([]),
          getSmartFilters: jest.fn().mockResolvedValue({})
        })
      }));

      const statusSelect = screen.getByDisplayValue('All Statuses');
      await user.click(statusSelect);

      const toDoOption = screen.getByText('To Do');
      await user.click(toDoOption);

      expect(mockSetFilters).toHaveBeenCalledWith({ status: 'To Do' });
    });

    it('should handle date range filters', async () => {
      const user = userEvent.setup();
      const mockSetFilters = jest.fn();

      jest.doMock('../../../contexts/FilterContext', () => ({
        useFilters: () => ({
          currentFilters: {
            query: '',
            status: [],
            priority: [],
            assignee: [],
            tags: [],
            dateRange: { start: '', end: '' },
            location: '',
            budgetRange: { min: 0, max: 1000000 },
            projectType: [],
            customFields: {}
          },
          activePreset: null,
          presets: [],
          searchHistory: [],
          setFilters: mockSetFilters,
          clearFilters: jest.fn(),
          applyPreset: jest.fn(),
          saveAsPreset: jest.fn(),
          loadPresets: jest.fn(),
          getSearchSuggestions: jest.fn().mockResolvedValue([]),
          getSmartFilters: jest.fn().mockResolvedValue({})
        })
      }));

      const startDateInput = screen.getAllByDisplayValue('')[0]; // First date input
      await user.type(startDateInput, '2025-01-01');

      expect(mockSetFilters).toHaveBeenCalledWith({
        dateRange: { start: '2025-01-01', end: '' }
      });
    });

    it('should handle budget range filters for projects', async () => {
      const user = userEvent.setup();

      renderFilterBar('projects');

      const filterToggle = screen.getByText('Filters');
      await user.click(filterToggle);

      const mockSetFilters = jest.fn();

      jest.doMock('../../../contexts/FilterContext', () => ({
        useFilters: () => ({
          currentFilters: {
            query: '',
            status: [],
            priority: [],
            assignee: [],
            tags: [],
            dateRange: { start: '', end: '' },
            location: '',
            budgetRange: { min: 0, max: 1000000 },
            projectType: [],
            customFields: {}
          },
          activePreset: null,
          presets: [],
          searchHistory: [],
          setFilters: mockSetFilters,
          clearFilters: jest.fn(),
          applyPreset: jest.fn(),
          saveAsPreset: jest.fn(),
          loadPresets: jest.fn(),
          getSearchSuggestions: jest.fn().mockResolvedValue([]),
          getSmartFilters: jest.fn().mockResolvedValue({})
        })
      }));

      const minBudgetInput = screen.getAllByDisplayValue('0')[0];
      await user.clear(minBudgetInput);
      await user.type(minBudgetInput, '10000');

      expect(mockSetFilters).toHaveBeenCalledWith({
        budgetRange: { min: 10000, max: 1000000 }
      });
    });
  });

  describe('Presets Functionality', () => {
    it('should show presets dropdown when clicked', async () => {
      const user = userEvent.setup();

      renderFilterBar();

      const presetsButton = screen.getByText('Presets');
      await user.click(presetsButton);

      expect(screen.getByText('Filter Presets')).toBeInTheDocument();
      expect(screen.getByText('High Priority Tasks')).toBeInTheDocument();
    });

    it('should apply preset when clicked', async () => {
      const user = userEvent.setup();
      const mockApplyPreset = jest.fn();

      jest.doMock('../../../contexts/FilterContext', () => ({
        useFilters: () => ({
          currentFilters: {
            query: '',
            status: [],
            priority: [],
            assignee: [],
            tags: [],
            dateRange: { start: '', end: '' },
            location: '',
            budgetRange: { min: 0, max: 1000000 },
            projectType: [],
            customFields: {}
          },
          activePreset: null,
          presets: [
            {
              id: '1',
              name: 'High Priority Tasks',
              description: 'Shows only high priority tasks',
              criteria: { priority: ['High'] },
              entityType: 'tasks',
              isDefault: false,
              isShared: false,
              createdBy: 'user1',
              createdAt: '2025-01-01T00:00:00Z',
              updatedAt: '2025-01-01T00:00:00Z'
            }
          ],
          searchHistory: [],
          setFilters: jest.fn(),
          clearFilters: jest.fn(),
          applyPreset: mockApplyPreset,
          saveAsPreset: jest.fn(),
          loadPresets: jest.fn(),
          getSearchSuggestions: jest.fn().mockResolvedValue([]),
          getSmartFilters: jest.fn().mockResolvedValue({})
        })
      }));

      renderFilterBar();

      const presetsButton = screen.getByText('Presets');
      await user.click(presetsButton);

      const presetOption = screen.getByText('High Priority Tasks');
      await user.click(presetOption);

      expect(mockApplyPreset).toHaveBeenCalled();
    });

    it('should save new preset', async () => {
      const user = userEvent.setup();
      const mockSaveAsPreset = jest.fn().mockResolvedValue();

      jest.doMock('../../../contexts/FilterContext', () => ({
        useFilters: () => ({
          currentFilters: {
            query: 'test',
            status: ['To Do'],
            priority: [],
            assignee: [],
            tags: [],
            dateRange: { start: '', end: '' },
            location: '',
            budgetRange: { min: 0, max: 1000000 },
            projectType: [],
            customFields: {}
          },
          activePreset: null,
          presets: [],
          searchHistory: [],
          setFilters: jest.fn(),
          clearFilters: jest.fn(),
          applyPreset: jest.fn(),
          saveAsPreset: mockSaveAsPreset,
          loadPresets: jest.fn(),
          getSearchSuggestions: jest.fn().mockResolvedValue([]),
          getSmartFilters: jest.fn().mockResolvedValue({})
        })
      }));

      renderFilterBar();

      const presetsButton = screen.getByText('Presets');
      await user.click(presetsButton);

      const presetNameInput = screen.getByPlaceholderText('Preset name...');
      await user.type(presetNameInput, 'My Custom Filter');

      const saveButton = screen.getByText('Save Preset');
      await user.click(saveButton);

      expect(mockSaveAsPreset).toHaveBeenCalledWith('My Custom Filter', '');
    });
  });

  describe('Smart Filters', () => {
    it('should apply smart filters when button is clicked', async () => {
      const user = userEvent.setup();
      const mockSetFilters = jest.fn();
      const mockGetSmartFilters = jest.fn().mockResolvedValue({
        status: ['To Do'],
        priority: ['High']
      });

      jest.doMock('../../../contexts/FilterContext', () => ({
        useFilters: () => ({
          currentFilters: {
            query: '',
            status: [],
            priority: [],
            assignee: [],
            tags: [],
            dateRange: { start: '', end: '' },
            location: '',
            budgetRange: { min: 0, max: 1000000 },
            projectType: [],
            customFields: {}
          },
          activePreset: null,
          presets: [],
          searchHistory: [],
          setFilters: mockSetFilters,
          clearFilters: jest.fn(),
          applyPreset: jest.fn(),
          saveAsPreset: jest.fn(),
          loadPresets: jest.fn(),
          getSearchSuggestions: jest.fn().mockResolvedValue([]),
          getSmartFilters: mockGetSmartFilters
        })
      }));

      renderFilterBar();

      const smartFiltersButton = screen.getByText('Smart Filters');
      await user.click(smartFiltersButton);

      await waitFor(() => {
        expect(mockSetFilters).toHaveBeenCalledWith({
          status: ['To Do'],
          priority: ['High']
        });
      });
    });
  });

  describe('Clear Filters', () => {
    it('should clear all filters when clear button is clicked', async () => {
      const user = userEvent.setup();
      const mockClearFilters = jest.fn();

      // Mock active filters
      jest.doMock('../../../contexts/FilterContext', () => ({
        useFilters: () => ({
          currentFilters: {
            query: 'test',
            status: ['To Do'],
            priority: [],
            assignee: [],
            tags: [],
            dateRange: { start: '', end: '' },
            location: '',
            budgetRange: { min: 0, max: 1000000 },
            projectType: [],
            customFields: {}
          },
          activePreset: null,
          presets: [],
          searchHistory: [],
          setFilters: jest.fn(),
          clearFilters: mockClearFilters,
          applyPreset: jest.fn(),
          saveAsPreset: jest.fn(),
          loadPresets: jest.fn(),
          getSearchSuggestions: jest.fn().mockResolvedValue([]),
          getSmartFilters: jest.fn().mockResolvedValue({})
        })
      }));

      renderFilterBar();

      const clearButton = screen.getByText('Clear');
      await user.click(clearButton);

      expect(mockClearFilters).toHaveBeenCalled();
    });
  });

  describe('Results Count', () => {
    it('should display total count when provided', () => {
      renderFilterBar();
      expect(screen.getByText('25 tasks')).toBeInTheDocument();
    });

    it('should not display count when zero', () => {
      render(
        <TenantProvider>
          <FilterProvider>
            <FilterBar
              entityType="tasks"
              onFiltersChange={jest.fn()}
              totalCount={0}
            />
          </FilterProvider>
        </TenantProvider>
      );

      expect(screen.queryByText(/tasks/)).not.toBeInTheDocument();
    });
  });

  describe('Active Filter Count', () => {
    it('should show active filter count badge', () => {
      // Mock active filters
      jest.doMock('../../../contexts/FilterContext', () => ({
        useFilters: () => ({
          currentFilters: {
            query: 'test',
            status: ['To Do'],
            priority: [],
            assignee: [],
            tags: [],
            dateRange: { start: '', end: '' },
            location: '',
            budgetRange: { min: 0, max: 1000000 },
            projectType: [],
            customFields: {}
          },
          activePreset: null,
          presets: [],
          searchHistory: [],
          setFilters: jest.fn(),
          clearFilters: jest.fn(),
          applyPreset: jest.fn(),
          saveAsPreset: jest.fn(),
          loadPresets: jest.fn(),
          getSearchSuggestions: jest.fn().mockResolvedValue([]),
          getSmartFilters: jest.fn().mockResolvedValue({})
        })
      }));

      renderFilterBar();

      // Should show badge with count of 2 (query + status)
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle search suggestions API error gracefully', async () => {
      const user = userEvent.setup();

      jest.doMock('../../../contexts/FilterContext', () => ({
        useFilters: () => ({
          currentFilters: {
            query: '',
            status: [],
            priority: [],
            assignee: [],
            tags: [],
            dateRange: { start: '', end: '' },
            location: '',
            budgetRange: { min: 0, max: 1000000 },
            projectType: [],
            customFields: {}
          },
          activePreset: null,
          presets: [],
          searchHistory: [],
          setFilters: jest.fn(),
          clearFilters: jest.fn(),
          applyPreset: jest.fn(),
          saveAsPreset: jest.fn(),
          loadPresets: jest.fn(),
          getSearchSuggestions: jest.fn().mockRejectedValue(new Error('API Error')),
          getSmartFilters: jest.fn().mockResolvedValue({})
        })
      }));

      renderFilterBar();

      const searchInput = screen.getByPlaceholderText('Search tasks...');
      await user.type(searchInput, 'urgent');

      // Should not crash and should not show suggestions
      await waitFor(() => {
        expect(screen.queryByText('urgent tasks')).not.toBeInTheDocument();
      });
    });

    it('should handle smart filters API error gracefully', async () => {
      const user = userEvent.setup();

      jest.doMock('../../../contexts/FilterContext', () => ({
        useFilters: () => ({
          currentFilters: {
            query: '',
            status: [],
            priority: [],
            assignee: [],
            tags: [],
            dateRange: { start: '', end: '' },
            location: '',
            budgetRange: { min: 0, max: 1000000 },
            projectType: [],
            customFields: {}
          },
          activePreset: null,
          presets: [],
          searchHistory: [],
          setFilters: jest.fn(),
          clearFilters: jest.fn(),
          applyPreset: jest.fn(),
          saveAsPreset: jest.fn(),
          loadPresets: jest.fn(),
          getSearchSuggestions: jest.fn().mockResolvedValue([]),
          getSmartFilters: jest.fn().mockRejectedValue(new Error('API Error'))
        })
      }));

      renderFilterBar();

      const smartFiltersButton = screen.getByText('Smart Filters');
      await user.click(smartFiltersButton);

      // Should not crash
      expect(smartFiltersButton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderFilterBar();

      const searchInput = screen.getByPlaceholderText('Search tasks...');
      expect(searchInput).toHaveAttribute('type', 'text');

      const filterToggle = screen.getByText('Filters');
      expect(filterToggle).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();

      renderFilterBar();

      const searchInput = screen.getByPlaceholderText('Search tasks...');
      searchInput.focus();

      expect(document.activeElement).toBe(searchInput);

      // Tab to next element
      await user.tab();
      expect(document.activeElement).toBe(screen.getByText('Filters'));
    });
  });

  describe('Performance', () => {
    it('should debounce search suggestions', async () => {
      const user = userEvent.setup();
      const mockGetSearchSuggestions = jest.fn().mockResolvedValue([]);

      jest.doMock('../../../contexts/FilterContext', () => ({
        useFilters: () => ({
          currentFilters: {
            query: '',
            status: [],
            priority: [],
            assignee: [],
            tags: [],
            dateRange: { start: '', end: '' },
            location: '',
            budgetRange: { min: 0, max: 1000000 },
            projectType: [],
            customFields: {}
          },
          activePreset: null,
          presets: [],
          searchHistory: [],
          setFilters: jest.fn(),
          clearFilters: jest.fn(),
          applyPreset: jest.fn(),
          saveAsPreset: jest.fn(),
          loadPresets: jest.fn(),
          getSearchSuggestions: mockGetSearchSuggestions,
          getSmartFilters: jest.fn().mockResolvedValue({})
        })
      }));

      renderFilterBar();

      const searchInput = screen.getByPlaceholderText('Search tasks...');

      // Type quickly
      await user.type(searchInput, 'urgenttask');

      // Should only call API once due to debouncing
      await waitFor(() => {
        expect(mockGetSearchSuggestions).toHaveBeenCalledTimes(1);
      }, { timeout: 1000 });
    });
  });
});