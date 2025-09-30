import React, { useState, useCallback, useMemo } from 'react';
import { User, Project, TodoStatus, TodoPriority, ExpenseStatus } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export interface FilterCriteria {
  search?: string;
  status?: string[];
  priority?: string[];
  assignee?: string[];
  project?: string[];
  dateRange?: {
    start?: string;
    end?: string;
  };
  tags?: string[];
  customFields?: { [key: string]: any };
}

export interface SavedFilter {
  id: string;
  name: string;
  criteria: FilterCriteria;
  isDefault?: boolean;
  createdBy: string;
  createdAt: string;
}

interface AdvancedFilterProps {
  criteria: FilterCriteria;
  onCriteriaChange: (criteria: FilterCriteria) => void;
  personnel?: User[];
  projects?: Project[];
  availableTags?: string[];
  savedFilters?: SavedFilter[];
  onSaveFilter?: (name: string, criteria: FilterCriteria) => void;
  onLoadFilter?: (filter: SavedFilter) => void;
  onDeleteFilter?: (filterId: string) => void;
  filterType?: 'tasks' | 'projects' | 'expenses' | 'general';
  isOpen?: boolean;
  onToggle?: () => void;
}

const FilterSection: React.FC<{
  title: string;
  children: React.ReactNode;
  isCollapsed?: boolean;
  onToggle?: () => void;
}> = ({ title, children, isCollapsed = false, onToggle }) => (
  <div className="border-b border-gray-200 pb-4">
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center justify-between w-full text-left"
    >
      <h4 className="text-sm font-medium text-gray-900">{title}</h4>
      <svg
        className={`h-4 w-4 transform transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    {!isCollapsed && <div className="mt-3">{children}</div>}
  </div>
);

const MultiSelect: React.FC<{
  options: { value: string; label: string; avatar?: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}> = ({ options, selected, onChange, placeholder = "Select options..." }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter(s => s !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {selected.length === 0 ? (
          <span className="text-gray-500">{placeholder}</span>
        ) : (
          <span>{selected.length} selected</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {options.map(option => (
            <label
              key={option.value}
              className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.includes(option.value)}
                onChange={() => handleToggle(option.value)}
                className="mr-3 h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              {option.avatar && (
                <img
                  src={option.avatar}
                  alt=""
                  className="h-6 w-6 rounded-full mr-2"
                />
              )}
              <span className="text-sm text-gray-900">{option.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export const AdvancedFilter: React.FC<AdvancedFilterProps> = ({
  criteria,
  onCriteriaChange,
  personnel = [],
  projects = [],
  availableTags = [],
  savedFilters = [],
  onSaveFilter,
  onLoadFilter,
  onDeleteFilter,
  filterType = 'general',
  isOpen = false,
  onToggle
}) => {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [saveFilterName, setSaveFilterName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const toggleSection = useCallback((section: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  }, []);

  const updateCriteria = useCallback((updates: Partial<FilterCriteria>) => {
    onCriteriaChange({ ...criteria, ...updates });
  }, [criteria, onCriteriaChange]);

  const clearAllFilters = useCallback(() => {
    onCriteriaChange({});
  }, [onCriteriaChange]);

  const handleSaveFilter = useCallback(() => {
    if (saveFilterName.trim() && onSaveFilter) {
      onSaveFilter(saveFilterName.trim(), criteria);
      setSaveFilterName('');
      setShowSaveDialog(false);
    }
  }, [saveFilterName, criteria, onSaveFilter]);

  const statusOptions = useMemo(() => {
    switch (filterType) {
      case 'tasks':
        return [
          { value: TodoStatus.TODO, label: 'To Do' },
          { value: TodoStatus.IN_PROGRESS, label: 'In Progress' },
          { value: TodoStatus.DONE, label: 'Done' }
        ];
      case 'expenses':
        return [
          { value: ExpenseStatus.PENDING, label: 'Pending' },
          { value: ExpenseStatus.APPROVED, label: 'Approved' },
          { value: ExpenseStatus.REJECTED, label: 'Rejected' }
        ];
      default:
        return [];
    }
  }, [filterType]);

  const priorityOptions = useMemo(() => [
    { value: TodoPriority.LOW, label: 'Low' },
    { value: TodoPriority.MEDIUM, label: 'Medium' },
    { value: TodoPriority.HIGH, label: 'High' },
    { value: TodoPriority.URGENT, label: 'Urgent' }
  ], []);

  const personnelOptions = useMemo(() =>
    personnel.map(person => ({
      value: person.id.toString(),
      label: `${person.firstName} ${person.lastName}`,
      avatar: person.avatar
    })), [personnel]);

  const projectOptions = useMemo(() =>
    projects.map(project => ({
      value: project.id.toString(),
      label: project.name
    })), [projects]);

  const tagOptions = useMemo(() =>
    availableTags.map(tag => ({
      value: tag,
      label: tag
    })), [availableTags]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (criteria.search) count++;
    if (criteria.status?.length) count++;
    if (criteria.priority?.length) count++;
    if (criteria.assignee?.length) count++;
    if (criteria.project?.length) count++;
    if (criteria.dateRange?.start || criteria.dateRange?.end) count++;
    if (criteria.tags?.length) count++;
    return count;
  }, [criteria]);

  if (!isOpen) {
    return (
      <Button
        variant="secondary"
        onClick={onToggle}
        className="relative"
      >
        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filters
        {activeFilterCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </Button>
    );
  }

  return (
    <Card className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Advanced Filters</h3>
        <div className="flex items-center space-x-2">
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Clear All
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onToggle}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Saved Filters */}
      {savedFilters.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Saved Filters</h4>
          <div className="flex flex-wrap gap-2">
            {savedFilters.map(filter => (
              <div key={filter.id} className="flex items-center">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onLoadFilter?.(filter)}
                >
                  {filter.name}
                </Button>
                {onDeleteFilter && (
                  <button
                    type="button"
                    title="Delete filter"
                    onClick={() => onDeleteFilter(filter.id)}
                    className="ml-1 text-red-500 hover:text-red-700"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Search */}
        <FilterSection
          title="Search"
          isCollapsed={collapsedSections.has('search')}
          onToggle={() => toggleSection('search')}
        >
          <input
            type="text"
            placeholder="Search by title, description, or content..."
            value={criteria.search || ''}
            onChange={(e) => updateCriteria({ search: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </FilterSection>

        {/* Status */}
        {statusOptions.length > 0 && (
          <FilterSection
            title="Status"
            isCollapsed={collapsedSections.has('status')}
            onToggle={() => toggleSection('status')}
          >
            <MultiSelect
              options={statusOptions}
              selected={criteria.status || []}
              onChange={(status) => updateCriteria({ status })}
              placeholder="Select status..."
            />
          </FilterSection>
        )}

        {/* Priority */}
        {filterType === 'tasks' && (
          <FilterSection
            title="Priority"
            isCollapsed={collapsedSections.has('priority')}
            onToggle={() => toggleSection('priority')}
          >
            <MultiSelect
              options={priorityOptions}
              selected={criteria.priority || []}
              onChange={(priority) => updateCriteria({ priority })}
              placeholder="Select priority..."
            />
          </FilterSection>
        )}

        {/* Assignee */}
        {personnel.length > 0 && (
          <FilterSection
            title="Assignee"
            isCollapsed={collapsedSections.has('assignee')}
            onToggle={() => toggleSection('assignee')}
          >
            <MultiSelect
              options={personnelOptions}
              selected={criteria.assignee || []}
              onChange={(assignee) => updateCriteria({ assignee })}
              placeholder="Select assignees..."
            />
          </FilterSection>
        )}

        {/* Project */}
        {projects.length > 0 && (
          <FilterSection
            title="Project"
            isCollapsed={collapsedSections.has('project')}
            onToggle={() => toggleSection('project')}
          >
            <MultiSelect
              options={projectOptions}
              selected={criteria.project || []}
              onChange={(project) => updateCriteria({ project })}
              placeholder="Select projects..."
            />
          </FilterSection>
        )}

        {/* Date Range */}
        <FilterSection
          title="Date Range"
          isCollapsed={collapsedSections.has('dateRange')}
          onToggle={() => toggleSection('dateRange')}
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="date-from" className="block text-xs text-gray-600 mb-1">From</label>
              <input
                id="date-from"
                type="date"
                title="Start date"
                value={criteria.dateRange?.start || ''}
                onChange={(e) => updateCriteria({
                  dateRange: { ...criteria.dateRange, start: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="date-to" className="block text-xs text-gray-600 mb-1">To</label>
              <input
                id="date-to"
                type="date"
                title="End date"
                value={criteria.dateRange?.end || ''}
                onChange={(e) => updateCriteria({
                  dateRange: { ...criteria.dateRange, end: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </FilterSection>

        {/* Tags */}
        {availableTags.length > 0 && (
          <FilterSection
            title="Tags"
            isCollapsed={collapsedSections.has('tags')}
            onToggle={() => toggleSection('tags')}
          >
            <MultiSelect
              options={tagOptions}
              selected={criteria.tags || []}
              onChange={(tags) => updateCriteria({ tags })}
              placeholder="Select tags..."
            />
          </FilterSection>
        )}
      </div>

      {/* Save Filter */}
      {onSaveFilter && (
        <div className="pt-4 border-t border-gray-200">
          {!showSaveDialog ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowSaveDialog(true)}
              disabled={activeFilterCount === 0}
            >
              Save Current Filter
            </Button>
          ) : (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Filter name..."
                value={saveFilterName}
                onChange={(e) => setSaveFilterName(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button size="sm" onClick={handleSaveFilter}>
                Save
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowSaveDialog(false);
                  setSaveFilterName('');
                }}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
