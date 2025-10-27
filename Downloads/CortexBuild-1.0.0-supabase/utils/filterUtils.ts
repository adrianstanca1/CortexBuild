import { FilterCriteria, FilterPreset, SearchHistory } from '../contexts/FilterContext';

/**
 * Validates filter criteria
 */
export const validateFilters = (filters: FilterCriteria): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate date range
  if (filters.dateRange.start && filters.dateRange.end) {
    const startDate = new Date(filters.dateRange.start);
    const endDate = new Date(filters.dateRange.end);
    if (startDate > endDate) {
      errors.push('Start date cannot be after end date');
    }
  }

  // Validate budget range
  if (filters.budgetRange.min < 0) {
    errors.push('Minimum budget cannot be negative');
  }
  if (filters.budgetRange.max < filters.budgetRange.min) {
    errors.push('Maximum budget cannot be less than minimum budget');
  }

  // Validate query length
  if (filters.query && filters.query.length > 500) {
    errors.push('Search query cannot exceed 500 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Serializes filter criteria for URL/storage
 */
export const serializeFilters = (filters: FilterCriteria): string => {
  const cleanFilters = { ...filters };

  // Remove empty arrays and default values
  if (cleanFilters.status.length === 0) delete cleanFilters.status;
  if (cleanFilters.priority.length === 0) delete cleanFilters.priority;
  if (cleanFilters.assignee.length === 0) delete cleanFilters.assignee;
  if (cleanFilters.tags.length === 0) delete cleanFilters.tags;
  if (!cleanFilters.dateRange.start && !cleanFilters.dateRange.end) delete cleanFilters.dateRange;
  if (!cleanFilters.location) delete cleanFilters.location;
  if (cleanFilters.budgetRange.min === 0 && cleanFilters.budgetRange.max === 1000000) delete cleanFilters.budgetRange;
  if (cleanFilters.projectType.length === 0) delete cleanFilters.projectType;
  if (!cleanFilters.query) delete cleanFilters.query;
  if (Object.keys(cleanFilters.customFields).length === 0) delete cleanFilters.customFields;

  return JSON.stringify(cleanFilters);
};

/**
 * Deserializes filter criteria from URL/storage
 */
export const deserializeFilters = (serialized: string): FilterCriteria => {
  try {
    const parsed = JSON.parse(serialized);

    // Ensure all required properties exist with defaults
    return {
      query: parsed.query || '',
      status: Array.isArray(parsed.status) ? parsed.status : [],
      priority: Array.isArray(parsed.priority) ? parsed.priority : [],
      assignee: Array.isArray(parsed.assignee) ? parsed.assignee : [],
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      dateRange: parsed.dateRange || { start: '', end: '' },
      location: parsed.location || '',
      budgetRange: parsed.budgetRange || { min: 0, max: 1000000 },
      projectType: Array.isArray(parsed.projectType) ? parsed.projectType : [],
      customFields: parsed.customFields || {}
    };
  } catch {
    return getDefaultFilters();
  }
};

/**
 * Gets default filter criteria
 */
export const getDefaultFilters = (): FilterCriteria => ({
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

/**
 * Checks if filters are empty (no active filters)
 */
export const areFiltersEmpty = (filters: FilterCriteria): boolean => {
  return !filters.query &&
         filters.status.length === 0 &&
         filters.priority.length === 0 &&
         filters.assignee.length === 0 &&
         filters.tags.length === 0 &&
         !filters.dateRange.start &&
         !filters.dateRange.end &&
         !filters.location &&
         filters.budgetRange.min === 0 &&
         filters.budgetRange.max === 1000000 &&
         filters.projectType.length === 0 &&
         Object.keys(filters.customFields).length === 0;
};

/**
 * Counts active filters
 */
export const countActiveFilters = (filters: FilterCriteria): number => {
  let count = 0;
  if (filters.query) count++;
  if (filters.status.length > 0) count++;
  if (filters.priority.length > 0) count++;
  if (filters.assignee.length > 0) count++;
  if (filters.tags.length > 0) count++;
  if (filters.dateRange.start || filters.dateRange.end) count++;
  if (filters.location) count++;
  if (filters.budgetRange.min > 0 || filters.budgetRange.max < 1000000) count++;
  if (filters.projectType.length > 0) count++;
  if (Object.keys(filters.customFields).length > 0) count++;
  return count;
};

/**
 * Merges two filter criteria objects
 */
export const mergeFilters = (base: FilterCriteria, override: Partial<FilterCriteria>): FilterCriteria => {
  return {
    ...base,
    ...override,
    dateRange: { ...base.dateRange, ...override.dateRange },
    budgetRange: { ...base.budgetRange, ...override.budgetRange },
    customFields: { ...base.customFields, ...override.customFields }
  };
};

/**
 * Creates a filter preset from current filters
 */
export const createPresetFromFilters = (
  filters: FilterCriteria,
  name: string,
  description?: string,
  entityType: FilterPreset['entityType'] = 'tasks',
  isShared = false,
  userId: string
): Omit<FilterPreset, 'id' | 'createdAt' | 'updatedAt'> => {
  return {
    name,
    description,
    criteria: filters,
    entityType,
    isDefault: false,
    isShared,
    createdBy: userId
  };
};

/**
 * Applies preset to filters
 */
export const applyPresetToFilters = (preset: FilterPreset): FilterCriteria => {
  return { ...preset.criteria };
};

/**
 * Generates filter summary for display
 */
export const getFilterSummary = (filters: FilterCriteria): string => {
  const parts: string[] = [];

  if (filters.query) {
    parts.push(`Search: "${filters.query}"`);
  }

  if (filters.status.length > 0) {
    parts.push(`Status: ${filters.status.join(', ')}`);
  }

  if (filters.priority.length > 0) {
    parts.push(`Priority: ${filters.priority.join(', ')}`);
  }

  if (filters.assignee.length > 0) {
    parts.push(`Assignee: ${filters.assignee.join(', ')}`);
  }

  if (filters.tags.length > 0) {
    parts.push(`Tags: ${filters.tags.join(', ')}`);
  }

  if (filters.dateRange.start || filters.dateRange.end) {
    const start = filters.dateRange.start ? new Date(filters.dateRange.start).toLocaleDateString() : '';
    const end = filters.dateRange.end ? new Date(filters.dateRange.end).toLocaleDateString() : '';
    parts.push(`Date: ${start} - ${end}`);
  }

  if (filters.location) {
    parts.push(`Location: ${filters.location}`);
  }

  if (filters.budgetRange.min > 0 || filters.budgetRange.max < 1000000) {
    parts.push(`Budget: $${filters.budgetRange.min.toLocaleString()} - $${filters.budgetRange.max.toLocaleString()}`);
  }

  if (filters.projectType.length > 0) {
    parts.push(`Type: ${filters.projectType.join(', ')}`);
  }

  return parts.length > 0 ? parts.join(' • ') : 'No filters applied';
};

/**
 * Debounces filter changes
 */
export const debounceFilterChange = <T extends any[]>(
  func: (...args: T) => void,
  wait: number
): ((...args: T) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: T) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Filters search history by query
 */
export const filterSearchHistory = (
  history: SearchHistory[],
  query: string,
  limit = 10
): SearchHistory[] => {
  if (!query) return history.slice(0, limit);

  return history
    .filter(item =>
      item.query.toLowerCase().includes(query.toLowerCase()) ||
      item.filters.query.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, limit);
};

/**
 * Gets recent search suggestions
 */
export const getRecentSearchSuggestions = (
  history: SearchHistory[],
  limit = 5
): string[] => {
  return history
    .slice(0, limit)
    .map(item => item.query)
    .filter((query, index, arr) => arr.indexOf(query) === index); // Remove duplicates
};

/**
 * Validates preset data
 */
export const validatePreset = (preset: Partial<FilterPreset>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!preset.name || preset.name.trim().length === 0) {
    errors.push('Preset name is required');
  }

  if (preset.name && preset.name.length > 100) {
    errors.push('Preset name cannot exceed 100 characters');
  }

  if (preset.description && preset.description.length > 500) {
    errors.push('Preset description cannot exceed 500 characters');
  }

  if (!preset.criteria) {
    errors.push('Preset must have filter criteria');
  } else {
    const filterValidation = validateFilters(preset.criteria);
    if (!filterValidation.isValid) {
      errors.push(...filterValidation.errors);
    }
  }

  if (!preset.entityType) {
    errors.push('Entity type is required');
  }

  if (!preset.createdBy) {
    errors.push('Created by user ID is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Compares two filter criteria for equality
 */
export const areFiltersEqual = (filters1: FilterCriteria, filters2: FilterCriteria): boolean => {
  return JSON.stringify(filters1) === JSON.stringify(filters2);
};

/**
 * Gets filter difference (what changed)
 */
export const getFilterChanges = (
  oldFilters: FilterCriteria,
  newFilters: FilterCriteria
): Partial<FilterCriteria> => {
  const changes: Partial<FilterCriteria> = {};

  if (oldFilters.query !== newFilters.query) {
    changes.query = newFilters.query;
  }

  if (JSON.stringify(oldFilters.status) !== JSON.stringify(newFilters.status)) {
    changes.status = newFilters.status;
  }

  if (JSON.stringify(oldFilters.priority) !== JSON.stringify(newFilters.priority)) {
    changes.priority = newFilters.priority;
  }

  if (JSON.stringify(oldFilters.assignee) !== JSON.stringify(newFilters.assignee)) {
    changes.assignee = newFilters.assignee;
  }

  if (JSON.stringify(oldFilters.tags) !== JSON.stringify(newFilters.tags)) {
    changes.tags = newFilters.tags;
  }

  if (JSON.stringify(oldFilters.dateRange) !== JSON.stringify(newFilters.dateRange)) {
    changes.dateRange = newFilters.dateRange;
  }

  if (oldFilters.location !== newFilters.location) {
    changes.location = newFilters.location;
  }

  if (JSON.stringify(oldFilters.budgetRange) !== JSON.stringify(newFilters.budgetRange)) {
    changes.budgetRange = newFilters.budgetRange;
  }

  if (JSON.stringify(oldFilters.projectType) !== JSON.stringify(newFilters.projectType)) {
    changes.projectType = newFilters.projectType;
  }

  if (JSON.stringify(oldFilters.customFields) !== JSON.stringify(newFilters.customFields)) {
    changes.customFields = newFilters.customFields;
  }

  return changes;
};