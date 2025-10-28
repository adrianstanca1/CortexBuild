import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  X,
  Save,
  Star,
  History,
  Settings,
  Download,
  Upload,
  CheckSquare,
  Square,
  MoreVertical,
  Calendar,
  User,
  Tag,
  MapPin,
  DollarSign,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useFilters, FilterCriteria, FilterPreset } from '../../contexts/FilterContext';
import { useTenant } from '../../contexts/TenantContext';

interface FilterBarProps {
  entityType: 'tasks' | 'projects' | 'rfis' | 'documents' | 'users';
  onFiltersChange?: (filters: FilterCriteria) => void;
  onBulkSelect?: (selectedIds: string[]) => void;
  selectedIds?: string[];
  totalCount?: number;
  className?: string;
}

interface FilterOption {
  key: keyof FilterCriteria;
  label: string;
  icon: React.ComponentType<any>;
  type: 'text' | 'select' | 'multiselect' | 'date' | 'range' | 'number';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

const FilterBar: React.FC<FilterBarProps> = ({
  entityType,
  onFiltersChange,
  onBulkSelect,
  selectedIds = [],
  totalCount = 0,
  className = ""
}) => {
  const { user } = useTenant();
  const {
    currentFilters,
    activePreset,
    presets,
    searchHistory,
    setFilters,
    clearFilters,
    applyPreset,
    saveAsPreset,
    loadPresets,
    getSearchSuggestions,
    getSmartFilters
  } = useFilters();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [searchQuery, setSearchQuery] = useState(currentFilters.query);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [savingPreset, setSavingPreset] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');

  // Load presets when component mounts
  useEffect(() => {
    loadPresets(entityType);
  }, [entityType, loadPresets]);

  // Update search query when filters change
  useEffect(() => {
    setSearchQuery(currentFilters.query);
  }, [currentFilters.query]);

  // Get search suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length > 2) {
        const suggs = await getSearchSuggestions(searchQuery, entityType);
        setSuggestions(suggs);
        setShowSuggestions(suggs.length > 0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, entityType, getSearchSuggestions]);

  // Filter options based on entity type
  const filterOptions: FilterOption[] = useMemo(() => {
    const baseOptions: FilterOption[] = [
      {
        key: 'query',
        label: 'Search',
        icon: Search,
        type: 'text',
        placeholder: `Search ${entityType}...`
      }
    ];

    switch (entityType) {
      case 'tasks':
        return [
          ...baseOptions,
          {
            key: 'status',
            label: 'Status',
            icon: CheckSquare,
            type: 'multiselect',
            options: [
              { value: 'To Do', label: 'To Do' },
              { value: 'In Progress', label: 'In Progress' },
              { value: 'Done', label: 'Done' }
            ]
          },
          {
            key: 'priority',
            label: 'Priority',
            icon: Tag,
            type: 'multiselect',
            options: [
              { value: 'High', label: 'High' },
              { value: 'Medium', label: 'Medium' },
              { value: 'Low', label: 'Low' }
            ]
          },
          {
            key: 'assignee',
            label: 'Assignee',
            icon: User,
            type: 'multiselect',
            options: [] // Will be populated dynamically
          },
          {
            key: 'dateRange',
            label: 'Date Range',
            icon: Calendar,
            type: 'date'
          }
        ];

      case 'projects':
        return [
          ...baseOptions,
          {
            key: 'status',
            label: 'Status',
            icon: CheckSquare,
            type: 'multiselect',
            options: [
              { value: 'planning', label: 'Planning' },
              { value: 'active', label: 'Active' },
              { value: 'on-hold', label: 'On Hold' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' }
            ]
          },
          {
            key: 'location',
            label: 'Location',
            icon: MapPin,
            type: 'text',
            placeholder: 'Enter location...'
          },
          {
            key: 'budgetRange',
            label: 'Budget Range',
            icon: DollarSign,
            type: 'range'
          },
          {
            key: 'projectType',
            label: 'Project Type',
            icon: Tag,
            type: 'multiselect',
            options: [
              { value: 'construction', label: 'Construction' },
              { value: 'renovation', label: 'Renovation' },
              { value: 'maintenance', label: 'Maintenance' },
              { value: 'design', label: 'Design' }
            ]
          }
        ];

      default:
        return baseOptions;
    }
  }, [entityType]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setFilters({ query: value });
    onFiltersChange?.({ ...currentFilters, query: value });
  };

  const handleFilterChange = (key: keyof FilterCriteria, value: any) => {
    const newFilters = { ...currentFilters, [key]: value };
    setFilters({ [key]: value });
    onFiltersChange?.(newFilters);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSearchChange(suggestion);
    setShowSuggestions(false);
  };

  const handleSavePreset = async () => {
    if (!presetName.trim()) return;

    setSavingPreset(true);
    try {
      await saveAsPreset(presetName, presetDescription);
      setPresetName('');
      setPresetDescription('');
      setShowPresets(false);
    } catch (error) {
      console.error('Failed to save preset:', error);
    } finally {
      setSavingPreset(false);
    }
  };

  const handleApplySmartFilters = async () => {
    try {
      const smartFilters = await getSmartFilters(entityType);
      setFilters(smartFilters);
      onFiltersChange?.(smartFilters);
    } catch (error) {
      console.error('Failed to apply smart filters:', error);
    }
  };

  const hasActiveFilters = useMemo(() => {
    return currentFilters.query ||
           currentFilters.status.length > 0 ||
           currentFilters.priority.length > 0 ||
           currentFilters.assignee.length > 0 ||
           currentFilters.tags.length > 0 ||
           currentFilters.dateRange.start ||
           currentFilters.dateRange.end ||
           currentFilters.location ||
           currentFilters.budgetRange.min > 0 ||
           currentFilters.budgetRange.max < 1000000 ||
           currentFilters.projectType.length > 0;
  }, [currentFilters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (currentFilters.query) count++;
    if (currentFilters.status.length > 0) count++;
    if (currentFilters.priority.length > 0) count++;
    if (currentFilters.assignee.length > 0) count++;
    if (currentFilters.tags.length > 0) count++;
    if (currentFilters.dateRange.start || currentFilters.dateRange.end) count++;
    if (currentFilters.location) count++;
    if (currentFilters.budgetRange.min > 0 || currentFilters.budgetRange.max < 1000000) count++;
    if (currentFilters.projectType.length > 0) count++;
    return count;
  }, [currentFilters]);

  return (
    <div className={`bg-white border-b border-gray-200 ${className}`}>
      {/* Main Filter Bar */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setShowSuggestions(suggestions.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`Search ${entityType}...`}
            />

            {/* Search Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                  >
                    <Search className="h-3 w-3 inline mr-2 text-gray-400" />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              hasActiveFilters
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {/* Presets */}
          <div className="relative">
            <button
              onClick={() => setShowPresets(!showPresets)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              <Star className="h-4 w-4" />
              Presets
              <ChevronDown className="h-4 w-4" />
            </button>

            {showPresets && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Filter Presets</h3>

                  {/* Current Preset */}
                  {activePreset && (
                    <div className="mb-3 p-2 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-900">{activePreset.name}</span>
                        <Star className="h-4 w-4 text-blue-600" />
                      </div>
                      {activePreset.description && (
                        <p className="text-xs text-blue-700 mt-1">{activePreset.description}</p>
                      )}
                    </div>
                  )}

                  {/* Preset List */}
                  <div className="space-y-1 mb-3 max-h-32 overflow-y-auto">
                    {presets.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => {
                          applyPreset(preset);
                          setShowPresets(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors ${
                          activePreset?.id === preset.id ? 'bg-blue-50 text-blue-900' : 'text-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{preset.name}</span>
                          {preset.isDefault && <Star className="h-3 w-3 text-yellow-500" />}
                        </div>
                        {preset.description && (
                          <p className="text-xs text-gray-500 mt-1">{preset.description}</p>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Save Current Filters */}
                  <div className="border-t pt-3">
                    <input
                      type="text"
                      value={presetName}
                      onChange={(e) => setPresetName(e.target.value)}
                      placeholder="Preset name..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2"
                    />
                    <textarea
                      value={presetDescription}
                      onChange={(e) => setPresetDescription(e.target.value)}
                      placeholder="Description (optional)..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2 resize-none"
                      rows={2}
                    />
                    <button
                      onClick={handleSavePreset}
                      disabled={!presetName.trim() || savingPreset}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="h-4 w-4" />
                      {savingPreset ? 'Saving...' : 'Save Preset'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Smart Filters */}
          <button
            onClick={handleApplySmartFilters}
            className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
            title="Apply AI-powered smart filters"
          >
            <Settings className="h-4 w-4" />
            Smart Filters
          </button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          )}

          {/* Bulk Actions */}
          {onBulkSelect && (
            <div className="relative">
              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                <CheckSquare className="h-4 w-4" />
                Bulk Actions
                <ChevronDown className="h-4 w-4" />
              </button>

              {showBulkActions && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Bulk Actions</h3>
                    <div className="space-y-2">
                      <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                        Update Status
                      </button>
                      <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                        Assign to User
                      </button>
                      <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                        Add Tags
                      </button>
                      <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                        Delete Selected
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Results Count */}
          {totalCount > 0 && (
            <div className="text-sm text-gray-600">
              {totalCount.toLocaleString()} {entityType}
            </div>
          )}
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {filterOptions.slice(1).map((option) => (
              <div key={option.key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {option.label}
                </label>

                {option.type === 'text' && (
                  <input
                    type="text"
                    value={(currentFilters[option.key] as string) || ''}
                    onChange={(e) => handleFilterChange(option.key, e.target.value)}
                    placeholder={option.placeholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}

                {option.type === 'multiselect' && option.options && (
                  <div className="space-y-2">
                    {option.options.map((opt) => (
                      <label key={opt.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={(currentFilters[option.key] as string[])?.includes(opt.value) || false}
                          onChange={(e) => {
                            const current = (currentFilters[option.key] as string[]) || [];
                            const updated = e.target.checked
                              ? [...current, opt.value]
                              : current.filter(v => v !== opt.value);
                            handleFilterChange(option.key, updated);
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                )}

                {option.type === 'date' && (
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={currentFilters.dateRange?.start || ''}
                      onChange={(e) => handleFilterChange('dateRange', {
                        ...currentFilters.dateRange,
                        start: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Start date"
                    />
                    <input
                      type="date"
                      value={currentFilters.dateRange?.end || ''}
                      onChange={(e) => handleFilterChange('dateRange', {
                        ...currentFilters.dateRange,
                        end: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="End date"
                    />
                  </div>
                )}

                {option.type === 'range' && (
                  <div className="space-y-2">
                    <input
                      type="number"
                      value={currentFilters.budgetRange?.min || 0}
                      onChange={(e) => handleFilterChange('budgetRange', {
                        ...currentFilters.budgetRange,
                        min: Number(e.target.value)
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Min budget"
                    />
                    <input
                      type="number"
                      value={currentFilters.budgetRange?.max || 1000000}
                      onChange={(e) => handleFilterChange('budgetRange', {
                        ...currentFilters.budgetRange,
                        max: Number(e.target.value)
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Max budget"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;