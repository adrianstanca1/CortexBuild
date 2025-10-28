import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTenant } from './TenantContext';

export interface FilterCriteria {
  query: string;
  status: string[];
  priority: string[];
  assignee: string[];
  tags: string[];
  dateRange: {
    start: string;
    end: string;
  };
  location: string;
  budgetRange: {
    min: number;
    max: number;
  };
  projectType: string[];
  customFields: Record<string, any>;
}

export interface FilterPreset {
  id: string;
  name: string;
  description?: string;
  criteria: FilterCriteria;
  entityType: 'tasks' | 'projects' | 'rfis' | 'documents' | 'users';
  isDefault: boolean;
  isShared: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SearchHistory {
  id: string;
  query: string;
  filters: FilterCriteria;
  entityType: string;
  resultCount: number;
  timestamp: string;
  userId: string;
}

export interface BulkOperation {
  id: string;
  entityType: string;
  operation: 'update' | 'delete' | 'move' | 'assign' | 'status_change';
  selectedIds: string[];
  changes: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

interface FilterContextType {
  // Current filter state
  currentFilters: FilterCriteria;
  activePreset: FilterPreset | null;
  searchHistory: SearchHistory[];
  bulkOperations: BulkOperation[];

  // Filter management
  setFilters: (filters: Partial<FilterCriteria>) => void;
  clearFilters: () => void;
  applyPreset: (preset: FilterPreset) => void;
  saveAsPreset: (name: string, description?: string, isShared?: boolean) => Promise<void>;

  // Preset management
  presets: FilterPreset[];
  loadPresets: (entityType: string) => Promise<void>;
  createPreset: (preset: Omit<FilterPreset, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePreset: (id: string, updates: Partial<FilterPreset>) => Promise<void>;
  deletePreset: (id: string) => Promise<void>;
  setDefaultPreset: (id: string) => Promise<void>;

  // Search history
  addToSearchHistory: (query: string, filters: FilterCriteria, entityType: string, resultCount: number) => Promise<void>;
  clearSearchHistory: () => Promise<void>;

  // Bulk operations
  createBulkOperation: (operation: Omit<BulkOperation, 'id' | 'status' | 'progress' | 'createdAt'>) => Promise<string>;
  executeBulkOperation: (id: string) => Promise<void>;
  cancelBulkOperation: (id: string) => Promise<void>;
  getBulkOperationStatus: (id: string) => BulkOperation | null;

  // AI-powered search
  getSearchSuggestions: (query: string, entityType: string) => Promise<string[]>;
  getSmartFilters: (entityType: string) => Promise<FilterCriteria>;
}

const FilterContext = createContext<FilterContextType | null>(null);

interface FilterProviderProps {
  children: ReactNode;
}

const defaultFilters: FilterCriteria = {
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
};

export const FilterProvider: React.FC<FilterProviderProps> = ({ children }) => {
  const { user } = useTenant();
  const [currentFilters, setCurrentFilters] = useState<FilterCriteria>(defaultFilters);
  const [activePreset, setActivePreset] = useState<FilterPreset | null>(null);
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [bulkOperations, setBulkOperations] = useState<BulkOperation[]>([]);

  // Load presets on mount
  useEffect(() => {
    if (user) {
      loadPresets('tasks'); // Default to tasks
    }
  }, [user]);

  const setFilters = (filters: Partial<FilterCriteria>) => {
    setCurrentFilters(prev => ({ ...prev, ...filters }));
    setActivePreset(null); // Clear active preset when manually changing filters
  };

  const clearFilters = () => {
    setCurrentFilters(defaultFilters);
    setActivePreset(null);
  };

  const applyPreset = (preset: FilterPreset) => {
    setCurrentFilters(preset.criteria);
    setActivePreset(preset);
  };

  const saveAsPreset = async (name: string, description?: string, isShared = false) => {
    if (!user) return;

    try {
      const response = await fetch('/api/filters/presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          criteria: currentFilters,
          entityType: 'tasks', // TODO: Make dynamic based on current context
          isShared,
          createdBy: user.id
        })
      });

      if (!response.ok) throw new Error('Failed to save preset');

      const newPreset = await response.json();
      setPresets(prev => [...prev, newPreset]);
      setActivePreset(newPreset);
    } catch (error) {
      console.error('Error saving preset:', error);
      throw error;
    }
  };

  const loadPresets = async (entityType: string) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/filters/presets?entityType=${entityType}&userId=${user.id}`);
      if (!response.ok) throw new Error('Failed to load presets');

      const data = await response.json();
      setPresets(data);

      // Set default preset if available
      const defaultPreset = data.find((p: FilterPreset) => p.isDefault);
      if (defaultPreset) {
        applyPreset(defaultPreset);
      }
    } catch (error) {
      console.error('Error loading presets:', error);
    }
  };

  const createPreset = async (preset: Omit<FilterPreset, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/filters/presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preset)
      });

      if (!response.ok) throw new Error('Failed to create preset');

      const newPreset = await response.json();
      setPresets(prev => [...prev, newPreset]);
    } catch (error) {
      console.error('Error creating preset:', error);
      throw error;
    }
  };

  const updatePreset = async (id: string, updates: Partial<FilterPreset>) => {
    try {
      const response = await fetch(`/api/filters/presets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) throw new Error('Failed to update preset');

      const updatedPreset = await response.json();
      setPresets(prev => prev.map(p => p.id === id ? updatedPreset : p));

      if (activePreset?.id === id) {
        setActivePreset(updatedPreset);
      }
    } catch (error) {
      console.error('Error updating preset:', error);
      throw error;
    }
  };

  const deletePreset = async (id: string) => {
    try {
      const response = await fetch(`/api/filters/presets/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete preset');

      setPresets(prev => prev.filter(p => p.id !== id));

      if (activePreset?.id === id) {
        setActivePreset(null);
      }
    } catch (error) {
      console.error('Error deleting preset:', error);
      throw error;
    }
  };

  const setDefaultPreset = async (id: string) => {
    try {
      // First, unset any existing default
      const currentDefault = presets.find(p => p.isDefault);
      if (currentDefault) {
        await updatePreset(currentDefault.id, { isDefault: false });
      }

      // Set new default
      await updatePreset(id, { isDefault: true });
    } catch (error) {
      console.error('Error setting default preset:', error);
      throw error;
    }
  };

  const addToSearchHistory = async (query: string, filters: FilterCriteria, entityType: string, resultCount: number) => {
    if (!user) return;

    try {
      const response = await fetch('/api/filters/search-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          filters,
          entityType,
          resultCount,
          userId: user.id
        })
      });

      if (!response.ok) throw new Error('Failed to add to search history');

      const newEntry = await response.json();
      setSearchHistory(prev => [newEntry, ...prev.slice(0, 49)]); // Keep last 50 entries
    } catch (error) {
      console.error('Error adding to search history:', error);
    }
  };

  const clearSearchHistory = async () => {
    if (!user) return;

    try {
      await fetch('/api/filters/search-history', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });

      setSearchHistory([]);
    } catch (error) {
      console.error('Error clearing search history:', error);
      throw error;
    }
  };

  const createBulkOperation = async (operation: Omit<BulkOperation, 'id' | 'status' | 'progress' | 'createdAt'>) => {
    try {
      const response = await fetch('/api/filters/bulk-operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(operation)
      });

      if (!response.ok) throw new Error('Failed to create bulk operation');

      const newOperation = await response.json();
      setBulkOperations(prev => [...prev, newOperation]);
      return newOperation.id;
    } catch (error) {
      console.error('Error creating bulk operation:', error);
      throw error;
    }
  };

  const executeBulkOperation = async (id: string) => {
    try {
      const response = await fetch(`/api/filters/bulk-operations/${id}/execute`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Failed to execute bulk operation');

      // Update operation status
      setBulkOperations(prev => prev.map(op =>
        op.id === id ? { ...op, status: 'processing' as const } : op
      ));
    } catch (error) {
      console.error('Error executing bulk operation:', error);
      throw error;
    }
  };

  const cancelBulkOperation = async (id: string) => {
    try {
      const response = await fetch(`/api/filters/bulk-operations/${id}/cancel`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Failed to cancel bulk operation');

      setBulkOperations(prev => prev.map(op =>
        op.id === id ? { ...op, status: 'failed' as const } : op
      ));
    } catch (error) {
      console.error('Error canceling bulk operation:', error);
      throw error;
    }
  };

  const getBulkOperationStatus = (id: string): BulkOperation | null => {
    return bulkOperations.find(op => op.id === id) || null;
  };

  const getSearchSuggestions = async (query: string, entityType: string): Promise<string[]> => {
    try {
      const response = await fetch(`/api/filters/search-suggestions?q=${encodeURIComponent(query)}&entityType=${entityType}`);
      if (!response.ok) throw new Error('Failed to get search suggestions');

      return await response.json();
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  };

  const getSmartFilters = async (entityType: string): Promise<FilterCriteria> => {
    try {
      const response = await fetch(`/api/filters/smart-filters?entityType=${entityType}`);
      if (!response.ok) throw new Error('Failed to get smart filters');

      return await response.json();
    } catch (error) {
      console.error('Error getting smart filters:', error);
      return defaultFilters;
    }
  };

  const value: FilterContextType = {
    currentFilters,
    activePreset,
    searchHistory,
    bulkOperations,
    setFilters,
    clearFilters,
    applyPreset,
    saveAsPreset,
    presets,
    loadPresets,
    createPreset,
    updatePreset,
    deletePreset,
    setDefaultPreset,
    addToSearchHistory,
    clearSearchHistory,
    createBulkOperation,
    executeBulkOperation,
    cancelBulkOperation,
    getBulkOperationStatus,
    getSearchSuggestions,
    getSmartFilters
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = (): FilterContextType => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within FilterProvider');
  }
  return context;
};

export default FilterProvider;