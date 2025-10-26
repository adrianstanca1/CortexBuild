// components/search/AdvancedSearch.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, X, Calendar, User, Tag, MapPin, DollarSign } from 'lucide-react';

export interface SearchFilters {
    query: string;
    dateRange: {
        start: string;
        end: string;
    };
    status: string[];
    priority: string[];
    assignee: string[];
    tags: string[];
    location: string;
    budgetRange: {
        min: number;
        max: number;
    };
    projectType: string[];
}

export interface SearchResult {
    id: string;
    type: 'project' | 'task' | 'user' | 'document';
    title: string;
    description: string;
    status: string;
    priority: string;
    assignee?: string;
    tags: string[];
    location?: string;
    budget?: number;
    created_at: string;
    updated_at: string;
    relevance_score: number;
}

interface AdvancedSearchProps {
    onSearch: (filters: SearchFilters) => void;
    onResultSelect: (result: SearchResult) => void;
    placeholder?: string;
    className?: string;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
    onSearch,
    onResultSelect,
    placeholder = "Search projects, tasks, users...",
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const [filters, setFilters] = useState<SearchFilters>({
        query: '',
        dateRange: { start: '', end: '' },
        status: [],
        priority: [],
        assignee: [],
        tags: [],
        location: '',
        budgetRange: { min: 0, max: 1000000 },
        projectType: []
    });

    const statusOptions = ['planning', 'active', 'on-hold', 'completed', 'cancelled'];
    const priorityOptions = ['low', 'medium', 'high', 'urgent'];
    const projectTypeOptions = ['construction', 'renovation', 'maintenance', 'design'];

    // Mock search function - replace with actual API call
    const performSearch = async (searchFilters: SearchFilters) => {
        setIsSearching(true);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Mock results based on filters
        const mockResults: SearchResult[] = [
            {
                id: '1',
                type: 'project',
                title: 'Office Building Construction',
                description: 'New 10-story office building in downtown',
                status: 'active',
                priority: 'high',
                assignee: 'John Smith',
                tags: ['construction', 'commercial'],
                location: 'Downtown',
                budget: 2500000,
                created_at: '2024-01-15',
                updated_at: '2024-01-20',
                relevance_score: 0.95
            },
            {
                id: '2',
                type: 'task',
                title: 'Foundation Inspection',
                description: 'Inspect foundation before concrete pour',
                status: 'pending',
                priority: 'urgent',
                assignee: 'Sarah Johnson',
                tags: ['inspection', 'foundation'],
                location: 'Site A',
                created_at: '2024-01-18',
                updated_at: '2024-01-19',
                relevance_score: 0.87
            },
            {
                id: '3',
                type: 'user',
                title: 'Mike Wilson',
                description: 'Senior Project Manager',
                status: 'active',
                priority: 'medium',
                tags: ['manager', 'senior'],
                location: 'Main Office',
                created_at: '2023-06-01',
                updated_at: '2024-01-15',
                relevance_score: 0.72
            }
        ];

        // Filter results based on search criteria
        const filteredResults = mockResults.filter(result => {
            if (searchFilters.query && !result.title.toLowerCase().includes(searchFilters.query.toLowerCase()) &&
                !result.description.toLowerCase().includes(searchFilters.query.toLowerCase())) {
                return false;
            }

            if (searchFilters.status.length > 0 && !searchFilters.status.includes(result.status)) {
                return false;
            }

            if (searchFilters.priority.length > 0 && !searchFilters.priority.includes(result.priority)) {
                return false;
            }

            if (searchFilters.tags.length > 0 && !searchFilters.tags.some(tag => result.tags.includes(tag))) {
                return false;
            }

            return true;
        });

        setResults(filteredResults);
        setIsSearching(false);
    };

    const handleSearch = () => {
        const searchFilters = { ...filters, query };
        onSearch(searchFilters);
        performSearch(searchFilters);
    };

    const handleFilterChange = (key: keyof SearchFilters, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            query: '',
            dateRange: { start: '', end: '' },
            status: [],
            priority: [],
            assignee: [],
            tags: [],
            location: '',
            budgetRange: { min: 0, max: 1000000 },
            projectType: []
        });
        setQuery('');
        setResults([]);
    };

    const getResultIcon = (type: SearchResult['type']) => {
        switch (type) {
            case 'project': return '🏗️';
            case 'task': return '✅';
            case 'user': return '👤';
            case 'document': return '📄';
            default: return '📁';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'text-red-600 bg-red-50';
            case 'high': return 'text-orange-600 bg-orange-50';
            case 'medium': return 'text-yellow-600 bg-yellow-50';
            case 'low': return 'text-green-600 bg-green-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-blue-600 bg-blue-50';
            case 'completed': return 'text-green-600 bg-green-50';
            case 'pending': return 'text-yellow-600 bg-yellow-50';
            case 'cancelled': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className={`relative ${className}`}>
            {/* Search Input */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleSearch();
                        }
                    }}
                    className="block w-full pl-10 pr-20 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={placeholder}
                />
                <div className="absolute inset-y-0 right-0 flex items-center">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-2 mr-2 rounded-md transition-colors ${showFilters ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                            }`}
                        title="Toggle filters"
                    >
                        <Filter className="h-4 w-4" />
                    </button>
                    <button
                        onClick={handleSearch}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Search
                    </button>
                </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <div className="space-y-2">
                                {statusOptions.map(status => (
                                    <label key={status} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={filters.status.includes(status)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    handleFilterChange('status', [...filters.status, status]);
                                                } else {
                                                    handleFilterChange('status', filters.status.filter(s => s !== status));
                                                }
                                            }}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700 capitalize">{status}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Priority Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                            <div className="space-y-2">
                                {priorityOptions.map(priority => (
                                    <label key={priority} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={filters.priority.includes(priority)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    handleFilterChange('priority', [...filters.priority, priority]);
                                                } else {
                                                    handleFilterChange('priority', filters.priority.filter(p => p !== priority));
                                                }
                                            }}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700 capitalize">{priority}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Date Range */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                            <div className="space-y-2">
                                <input
                                    type="date"
                                    value={filters.dateRange.start}
                                    onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })}
                                    className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                    placeholder="Start date"
                                />
                                <input
                                    type="date"
                                    value={filters.dateRange.end}
                                    onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })}
                                    className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                    placeholder="End date"
                                />
                            </div>
                        </div>

                        {/* Budget Range */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range</label>
                            <div className="space-y-2">
                                <input
                                    type="number"
                                    value={filters.budgetRange.min}
                                    onChange={(e) => handleFilterChange('budgetRange', { ...filters.budgetRange, min: Number(e.target.value) })}
                                    className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                    placeholder="Min budget"
                                />
                                <input
                                    type="number"
                                    value={filters.budgetRange.max}
                                    onChange={(e) => handleFilterChange('budgetRange', { ...filters.budgetRange, max: Number(e.target.value) })}
                                    className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                    placeholder="Max budget"
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                            <input
                                type="text"
                                value={filters.location}
                                onChange={(e) => handleFilterChange('location', e.target.value)}
                                className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                placeholder="Enter location"
                            />
                        </div>

                        {/* Clear Filters */}
                        <div className="flex items-end">
                            <button
                                onClick={clearFilters}
                                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Search Results */}
            {isOpen && (results.length > 0 || isSearching) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-40 max-h-96 overflow-y-auto">
                    {isSearching ? (
                        <div className="p-4 text-center text-gray-500">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                            Searching...
                        </div>
                    ) : (
                        <div className="divide-y">
                            {results.map((result) => (
                                <div
                                    key={result.id}
                                    onClick={() => {
                                        onResultSelect(result);
                                        setIsOpen(false);
                                    }}
                                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-lg">{getResultIcon(result.type)}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                                    {result.title}
                                                </h4>
                                                <div className="flex items-center gap-1">
                                                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(result.status)}`}>
                                                        {result.status}
                                                    </span>
                                                    <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(result.priority)}`}>
                                                        {result.priority}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                {result.description}
                                            </p>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                {result.assignee && (
                                                    <span className="flex items-center gap-1">
                                                        <User className="w-3 h-3" />
                                                        {result.assignee}
                                                    </span>
                                                )}
                                                {result.location && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {result.location}
                                                    </span>
                                                )}
                                                {result.budget && (
                                                    <span className="flex items-center gap-1">
                                                        <DollarSign className="w-3 h-3" />
                                                        ${result.budget.toLocaleString()}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(result.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            {result.tags.length > 0 && (
                                                <div className="flex items-center gap-1 mt-2">
                                                    <Tag className="w-3 h-3 text-gray-400" />
                                                    <div className="flex gap-1">
                                                        {result.tags.map(tag => (
                                                            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Click outside to close */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};
