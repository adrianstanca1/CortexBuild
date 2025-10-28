import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { FilterProvider, useFilters } from '../../contexts/FilterContext';
import { TenantProvider } from '../../contexts/TenantContext';

// Mock fetch globally
global.fetch = jest.fn();

// Mock the TenantContext
jest.mock('../../contexts/TenantContext', () => ({
  useTenant: () => ({
    user: {
      id: 'test-user-id',
      name: 'Test User',
      company_id: 'test-company-id'
    }
  })
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <TenantProvider>
    <FilterProvider>
      {children}
    </FilterProvider>
  </TenantProvider>
);

describe('FilterContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    });
  });

  describe('Initial State', () => {
    it('should initialize with default filter criteria', () => {
      const { result } = renderHook(() => useFilters(), { wrapper });

      expect(result.current.currentFilters).toEqual({
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
      });
    });

    it('should initialize with null active preset', () => {
      const { result } = renderHook(() => useFilters(), { wrapper });

      expect(result.current.activePreset).toBeNull();
    });

    it('should initialize with empty arrays for presets and search history', () => {
      const { result } = renderHook(() => useFilters(), { wrapper });

      expect(result.current.presets).toEqual([]);
      expect(result.current.searchHistory).toEqual([]);
      expect(result.current.bulkOperations).toEqual([]);
    });
  });

  describe('Filter Management', () => {
    it('should update filters correctly', () => {
      const { result } = renderHook(() => useFilters(), { wrapper });

      act(() => {
        result.current.setFilters({ query: 'test query', status: ['To Do'] });
      });

      expect(result.current.currentFilters.query).toBe('test query');
      expect(result.current.currentFilters.status).toEqual(['To Do']);
    });

    it('should clear active preset when filters are updated', () => {
      const { result } = renderHook(() => useFilters(), { wrapper });

      const mockPreset = {
        id: '1',
        name: 'Test Preset',
        criteria: { status: ['In Progress'] },
        entityType: 'tasks' as const,
        isDefault: false,
        isShared: false,
        createdBy: 'test-user-id',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      };

      act(() => {
        result.current.applyPreset(mockPreset);
      });

      expect(result.current.activePreset).toEqual(mockPreset);

      act(() => {
        result.current.setFilters({ query: 'new query' });
      });

      expect(result.current.activePreset).toBeNull();
    });

    it('should clear all filters correctly', () => {
      const { result } = renderHook(() => useFilters(), { wrapper });

      // Set some filters first
      act(() => {
        result.current.setFilters({
          query: 'test',
          status: ['To Do'],
          priority: ['High']
        });
      });

      // Clear filters
      act(() => {
        result.current.clearFilters();
      });

      expect(result.current.currentFilters).toEqual({
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
      });
      expect(result.current.activePreset).toBeNull();
    });
  });

  describe('Preset Management', () => {
    it('should apply preset correctly', () => {
      const { result } = renderHook(() => useFilters(), { wrapper });

      const mockPreset = {
        id: '1',
        name: 'High Priority Tasks',
        description: 'Shows high priority tasks',
        criteria: {
          query: '',
          status: ['To Do'],
          priority: ['High'],
          assignee: [],
          tags: [],
          dateRange: { start: '', end: '' },
          location: '',
          budgetRange: { min: 0, max: 1000000 },
          projectType: [],
          customFields: {}
        },
        entityType: 'tasks' as const,
        isDefault: false,
        isShared: false,
        createdBy: 'test-user-id',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      };

      act(() => {
        result.current.applyPreset(mockPreset);
      });

      expect(result.current.currentFilters).toEqual(mockPreset.criteria);
      expect(result.current.activePreset).toEqual(mockPreset);
    });

    it('should save preset as new successfully', async () => {
      const { result } = renderHook(() => useFilters(), { wrapper });

      // Set some filters
      act(() => {
        result.current.setFilters({ status: ['To Do'], priority: ['High'] });
      });

      await act(async () => {
        await result.current.saveAsPreset('My Custom Preset', 'Test description');
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/filters/presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'My Custom Preset',
          description: 'Test description',
          criteria: result.current.currentFilters,
          entityType: 'tasks',
          isShared: false,
          createdBy: 'test-user-id'
        })
      });
    });

    it('should load presets successfully', async () => {
      const mockPresets = [
        {
          id: '1',
          name: 'High Priority',
          description: 'High priority tasks',
          criteria: { priority: ['High'] },
          entityType: 'tasks',
          isDefault: true,
          isShared: false,
          createdBy: 'test-user-id',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z'
        }
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPresets
      });

      const { result } = renderHook(() => useFilters(), { wrapper });

      await act(async () => {
        await result.current.loadPresets('tasks');
      });

      expect(result.current.presets).toEqual(mockPresets);
      expect(result.current.activePreset).toEqual(mockPresets[0]);
    });

    it('should handle preset loading errors gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500
      });

      const { result } = renderHook(() => useFilters(), { wrapper });

      // Should not throw error
      await act(async () => {
        await result.current.loadPresets('tasks');
      });

      expect(result.current.presets).toEqual([]);
    });

    it('should create preset successfully', async () => {
      const mockNewPreset = {
        id: '2',
        name: 'New Preset',
        criteria: { status: ['In Progress'] },
        entityType: 'tasks' as const,
        isDefault: false,
        isShared: false,
        createdBy: 'test-user-id',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockNewPreset
      });

      const { result } = renderHook(() => useFilters(), { wrapper });

      await act(async () => {
        await result.current.createPreset({
          name: 'New Preset',
          criteria: { status: ['In Progress'] },
          entityType: 'tasks',
          isDefault: false,
          isShared: false,
          createdBy: 'test-user-id'
        });
      });

      expect(result.current.presets).toContainEqual(mockNewPreset);
    });

    it('should update preset successfully', async () => {
      const { result } = renderHook(() => useFilters(), { wrapper });

      // Add a preset first
      const initialPreset = {
        id: '1',
        name: 'Original',
        criteria: { status: ['To Do'] },
        entityType: 'tasks' as const,
        isDefault: false,
        isShared: false,
        createdBy: 'test-user-id',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      };

      act(() => {
        result.current.presets.push(initialPreset);
      });

      const updatedPreset = {
        ...initialPreset,
        name: 'Updated Name',
        updatedAt: '2025-01-02T00:00:00Z'
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => updatedPreset
      });

      await act(async () => {
        await result.current.updatePreset('1', { name: 'Updated Name' });
      });

      const updatedPresetInList = result.current.presets.find(p => p.id === '1');
      expect(updatedPresetInList?.name).toBe('Updated Name');
    });

    it('should delete preset successfully', async () => {
      const { result } = renderHook(() => useFilters(), { wrapper });

      // Add a preset first
      const presetToDelete = {
        id: '1',
        name: 'To Delete',
        criteria: { status: ['To Do'] },
        entityType: 'tasks' as const,
        isDefault: false,
        isShared: false,
        createdBy: 'test-user-id',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      };

      act(() => {
        result.current.presets.push(presetToDelete);
        result.current.activePreset = presetToDelete;
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true
      });

      await act(async () => {
        await result.current.deletePreset('1');
      });

      expect(result.current.presets).not.toContainEqual(presetToDelete);
      expect(result.current.activePreset).toBeNull();
    });

    it('should set default preset correctly', async () => {
      const { result } = renderHook(() => useFilters(), { wrapper });

      // Add multiple presets
      const presets = [
        {
          id: '1',
          name: 'Preset 1',
          criteria: { status: ['To Do'] },
          entityType: 'tasks' as const,
          isDefault: true,
          isShared: false,
          createdBy: 'test-user-id',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z'
        },
        {
          id: '2',
          name: 'Preset 2',
          criteria: { status: ['In Progress'] },
          entityType: 'tasks' as const,
          isDefault: false,
          isShared: false,
          createdBy: 'test-user-id',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z'
        }
      ];

      act(() => {
        result.current.presets.push(...presets);
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ ...presets[1], isDefault: true })
      });

      await act(async () => {
        await result.current.setDefaultPreset('2');
      });

      expect(result.current.presets[0].isDefault).toBe(false);
      expect(result.current.presets[1].isDefault).toBe(true);
    });
  });

  describe('Search History', () => {
    it('should add to search history successfully', async () => {
      const { result } = renderHook(() => useFilters(), { wrapper });

      const searchCriteria = {
        query: 'urgent tasks',
        status: ['To Do'],
        priority: [],
        assignee: [],
        tags: [],
        dateRange: { start: '', end: '' },
        location: '',
        budgetRange: { min: 0, max: 1000000 },
        projectType: [],
        customFields: {}
      };

      await act(async () => {
        await result.current.addToSearchHistory('urgent tasks', searchCriteria, 'tasks', 5);
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/filters/search-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'urgent tasks',
          filters: searchCriteria,
          entityType: 'tasks',
          resultCount: 5,
          userId: 'test-user-id'
        })
      });
    });

    it('should clear search history successfully', async () => {
      const { result } = renderHook(() => useFilters(), { wrapper });

      await act(async () => {
        await result.current.clearSearchHistory();
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/filters/search-history', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'test-user-id' })
      });
    });

    it('should handle search history API errors gracefully', async () => {
      const { result } = renderHook(() => useFilters(), { wrapper });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500
      });

      // Should not throw error
      await act(async () => {
        await result.current.addToSearchHistory('test', result.current.currentFilters, 'tasks', 0);
      });

      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('Bulk Operations', () => {
    it('should create bulk operation successfully', async () => {
      const mockOperation = {
        id: 'bulk-1',
        entity_type: 'tasks',
        operation: 'update',
        selected_ids: ['1', '2', '3'],
        changes: { status: 'In Progress' },
        status: 'pending',
        progress: 0,
        created_by: 'test-user-id',
        company_id: 'test-company-id',
        created_at: '2025-01-01T00:00:00Z'
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockOperation
      });

      const { result } = renderHook(() => useFilters(), { wrapper });

      let operationId: string;
      await act(async () => {
        operationId = await result.current.createBulkOperation({
          entityType: 'tasks',
          operation: 'update',
          selectedIds: ['1', '2', '3'],
          changes: { status: 'In Progress' },
          createdBy: 'test-user-id',
          companyId: 'test-company-id'
        });
      });

      expect(operationId).toBe('bulk-1');
      expect(result.current.bulkOperations).toContainEqual(mockOperation);
    });

    it('should execute bulk operation successfully', async () => {
      const { result } = renderHook(() => useFilters(), { wrapper });

      // Add a bulk operation first
      const operation = {
        id: 'bulk-1',
        entityType: 'tasks',
        operation: 'update' as const,
        selectedIds: ['1', '2', '3'],
        changes: { status: 'In Progress' },
        status: 'pending' as const,
        progress: 0,
        createdAt: '2025-01-01T00:00:00Z'
      };

      act(() => {
        result.current.bulkOperations.push(operation);
      });

      await act(async () => {
        await result.current.executeBulkOperation('bulk-1');
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/filters/bulk-operations/bulk-1/execute', {
        method: 'POST'
      });

      const updatedOperation = result.current.bulkOperations.find(op => op.id === 'bulk-1');
      expect(updatedOperation?.status).toBe('processing');
    });

    it('should cancel bulk operation successfully', async () => {
      const { result } = renderHook(() => useFilters(), { wrapper });

      // Add a bulk operation first
      const operation = {
        id: 'bulk-1',
        entityType: 'tasks',
        operation: 'update' as const,
        selectedIds: ['1', '2', '3'],
        changes: { status: 'In Progress' },
        status: 'processing' as const,
        progress: 50,
        createdAt: '2025-01-01T00:00:00Z'
      };

      act(() => {
        result.current.bulkOperations.push(operation);
      });

      await act(async () => {
        await result.current.cancelBulkOperation('bulk-1');
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/filters/bulk-operations/bulk-1/cancel', {
        method: 'POST'
      });

      const updatedOperation = result.current.bulkOperations.find(op => op.id === 'bulk-1');
      expect(updatedOperation?.status).toBe('failed');
    });

    it('should get bulk operation status correctly', () => {
      const { result } = renderHook(() => useFilters(), { wrapper });

      const operation = {
        id: 'bulk-1',
        entityType: 'tasks',
        operation: 'update' as const,
        selectedIds: ['1', '2', '3'],
        changes: { status: 'In Progress' },
        status: 'processing' as const,
        progress: 50,
        createdAt: '2025-01-01T00:00:00Z'
      };

      act(() => {
        result.current.bulkOperations.push(operation);
      });

      const status = result.current.getBulkOperationStatus('bulk-1');
      expect(status).toEqual(operation);

      const nonExistentStatus = result.current.getBulkOperationStatus('non-existent');
      expect(nonExistentStatus).toBeNull();
    });
  });

  describe('AI-Powered Features', () => {
    it('should get search suggestions successfully', async () => {
      const mockSuggestions = ['urgent tasks', 'overdue items', 'high priority'];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockSuggestions
      });

      const { result } = renderHook(() => useFilters(), { wrapper });

      let suggestions: string[];
      await act(async () => {
        suggestions = await result.current.getSearchSuggestions('urgent', 'tasks');
      });

      expect(suggestions).toEqual(mockSuggestions);

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/filters/search-suggestions?q=urgent&entityType=tasks'
      );
    });

    it('should get smart filters successfully', async () => {
      const mockSmartFilters = {
        status: ['To Do'],
        priority: ['High']
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockSmartFilters
      });

      const { result } = renderHook(() => useFilters(), { wrapper });

      let smartFilters: any;
      await act(async () => {
        smartFilters = await result.current.getSmartFilters('tasks');
      });

      expect(smartFilters).toEqual(mockSmartFilters);

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/filters/smart-filters?entityType=tasks'
      );
    });

    it('should handle AI feature API errors gracefully', async () => {
      const { result } = renderHook(() => useFilters(), { wrapper });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500
      });

      // Should return empty array for suggestions
      let suggestions: string[];
      await act(async () => {
        suggestions = await result.current.getSearchSuggestions('test', 'tasks');
      });
      expect(suggestions).toEqual([]);

      // Should return default filters for smart filters
      let smartFilters: any;
      await act(async () => {
        smartFilters = await result.current.getSmartFilters('tasks');
      });
      expect(smartFilters).toEqual(result.current.currentFilters);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors in preset operations', async () => {
      const { result } = renderHook(() => useFilters(), { wrapper });

      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      // Should not throw error
      await act(async () => {
        try {
          await result.current.saveAsPreset('Test', 'Description');
        } catch (error) {
          // Expected to throw
        }
      });

      expect(global.fetch).toHaveBeenCalled();
    });

    it('should handle malformed API responses', async () => {
      const { result } = renderHook(() => useFilters(), { wrapper });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        }
      });

      // Should handle gracefully
      await act(async () => {
        await result.current.loadPresets('tasks');
      });

      expect(result.current.presets).toEqual([]);
    });
  });

  describe('State Consistency', () => {
    it('should maintain state consistency when multiple operations are performed', async () => {
      const { result } = renderHook(() => useFilters(), { wrapper });

      // Perform multiple operations
      act(() => {
        result.current.setFilters({ query: 'test1' });
      });

      act(() => {
        result.current.setFilters({ status: ['To Do'] });
      });

      act(() => {
        result.current.clearFilters();
      });

      // State should be consistent
      expect(result.current.currentFilters.query).toBe('');
      expect(result.current.currentFilters.status).toEqual([]);
      expect(result.current.activePreset).toBeNull();
    });

    it('should handle rapid state changes correctly', () => {
      const { result } = renderHook(() => useFilters(), { wrapper });

      // Rapid filter changes
      act(() => {
        result.current.setFilters({ query: 'test1' });
        result.current.setFilters({ query: 'test2' });
        result.current.setFilters({ query: 'test3' });
      });

      expect(result.current.currentFilters.query).toBe('test3');
    });
  });

  describe('Memory Management', () => {
    it('should limit search history to 50 entries', async () => {
      const { result } = renderHook(() => useFilters(), { wrapper });

      // Mock successful API response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'new-entry', success: true })
      });

      // Add more than 50 entries
      for (let i = 0; i < 60; i++) {
        await act(async () => {
          await result.current.addToSearchHistory(
            `query${i}`,
            result.current.currentFilters,
            'tasks',
            0
          );
        });
      }

      // Should be limited to 50 entries (implementation detail)
      expect(result.current.searchHistory.length).toBeLessThanOrEqual(50);
    });
  });

  describe('Context Provider', () => {
    it('should throw error when used outside provider', () => {
      // Temporarily remove wrapper
      const { result } = renderHook(() => useFilters());

      expect(result.error).toEqual(
        new Error('useFilters must be used within FilterProvider')
      );
    });

    it('should provide context to nested components', () => {
      const TestComponent = () => {
        const filters = useFilters();
        return <div data-testid="filter-context">{filters.currentFilters.query}</div>;
      };

      const { getByTestId } = render(
        <TenantProvider>
          <FilterProvider>
            <TestComponent />
          </FilterProvider>
        </TenantProvider>
      );

      expect(getByTestId('filter-context')).toHaveTextContent('');
    });
  });
});