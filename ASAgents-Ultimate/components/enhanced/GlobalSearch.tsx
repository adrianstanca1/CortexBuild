import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Todo, Project, Document, Expense, Company } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Tag } from '../ui/Tag';

export interface SearchResult {
  id: string;
  type: 'task' | 'project' | 'document' | 'expense' | 'user' | 'company';
  title: string;
  subtitle?: string;
  description?: string;
  metadata?: {
    status?: string;
    assignee?: string;
    project?: string;
    date?: string;
    amount?: number;
    tags?: string[];
  };
  relevanceScore: number;
  matchedFields: string[];
  data: any; // Original data object
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onResultSelect: (result: SearchResult) => void;
  // Data sources
  tasks: Todo[];
  projects: Project[];
  documents: Document[];
  expenses: Expense[];
  users: User[];
  companies: Company[];
  // Search configuration
  placeholder?: string;
  maxResults?: number;
  enableFilters?: boolean;
}

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const highlightMatch = (text: string, query: string): React.ReactNode => {
  if (!query.trim()) return text;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, index) => 
    regex.test(part) ? (
      <mark key={index} className="bg-yellow-200 text-yellow-900 px-0.5 rounded">
        {part}
      </mark>
    ) : part
  );
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'task':
      return (
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
      );
    case 'project':
      return (
        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
      );
    case 'document':
      return (
        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      );
    case 'expense':
      return (
        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </div>
      );
    case 'user':
      return (
        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      );
    case 'company':
      return (
        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
      );
    default:
      return (
        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      );
  }
};

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  isOpen,
  onClose,
  onResultSelect,
  tasks,
  projects,
  documents,
  expenses,
  users,
  companies,
  placeholder = "Search tasks, projects, documents...",
  maxResults = 50,
  enableFilters = true
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  const searchResults = useMemo(() => {
    if (!debouncedQuery.trim()) return [];

    setIsLoading(true);
    const results: SearchResult[] = [];
    const queryLower = debouncedQuery.toLowerCase();

    // Search tasks
    if (typeFilter === 'all' || typeFilter === 'task') {
      tasks.forEach(task => {
        const matchedFields: string[] = [];
        let relevanceScore = 0;

        if (task.title.toLowerCase().includes(queryLower)) {
          matchedFields.push('title');
          relevanceScore += task.title.toLowerCase().startsWith(queryLower) ? 10 : 5;
        }
        if (task.description?.toLowerCase().includes(queryLower)) {
          matchedFields.push('description');
          relevanceScore += 3;
        }
        if (task.tags?.some(tag => tag.toLowerCase().includes(queryLower))) {
          matchedFields.push('tags');
          relevanceScore += 2;
        }

        if (matchedFields.length > 0) {
          const project = projects.find(p => p.id === task.projectId);
          const assignee = users.find(u => u.id === task.assigneeId);

          results.push({
            id: `task-${task.id}`,
            type: 'task',
            title: task.title,
            subtitle: project?.name,
            description: task.description,
            metadata: {
              status: task.status,
              assignee: assignee ? `${assignee.firstName} ${assignee.lastName}` : undefined,
              project: project?.name,
              date: task.dueDate,
              tags: task.tags
            },
            relevanceScore,
            matchedFields,
            data: task
          });
        }
      });
    }

    // Search projects
    if (typeFilter === 'all' || typeFilter === 'project') {
      projects.forEach(project => {
        const matchedFields: string[] = [];
        let relevanceScore = 0;

        if (project.name.toLowerCase().includes(queryLower)) {
          matchedFields.push('name');
          relevanceScore += project.name.toLowerCase().startsWith(queryLower) ? 10 : 5;
        }
        if (project.description?.toLowerCase().includes(queryLower)) {
          matchedFields.push('description');
          relevanceScore += 3;
        }

        if (matchedFields.length > 0) {
          results.push({
            id: `project-${project.id}`,
            type: 'project',
            title: project.name,
            description: project.description,
            metadata: {
              status: project.status,
              date: project.startDate
            },
            relevanceScore,
            matchedFields,
            data: project
          });
        }
      });
    }

    // Search documents
    if (typeFilter === 'all' || typeFilter === 'document') {
      documents.forEach(doc => {
        const matchedFields: string[] = [];
        let relevanceScore = 0;

        if (doc.name.toLowerCase().includes(queryLower)) {
          matchedFields.push('name');
          relevanceScore += doc.name.toLowerCase().startsWith(queryLower) ? 10 : 5;
        }
        if (doc.description?.toLowerCase().includes(queryLower)) {
          matchedFields.push('description');
          relevanceScore += 3;
        }

        if (matchedFields.length > 0) {
          const project = projects.find(p => p.id === doc.projectId);
          
          results.push({
            id: `document-${doc.id}`,
            type: 'document',
            title: doc.name,
            subtitle: project?.name,
            description: doc.description,
            metadata: {
              project: project?.name,
              date: doc.uploadedAt
            },
            relevanceScore,
            matchedFields,
            data: doc
          });
        }
      });
    }

    // Search expenses
    if (typeFilter === 'all' || typeFilter === 'expense') {
      expenses.forEach(expense => {
        const matchedFields: string[] = [];
        let relevanceScore = 0;

        if (expense.description.toLowerCase().includes(queryLower)) {
          matchedFields.push('description');
          relevanceScore += expense.description.toLowerCase().startsWith(queryLower) ? 10 : 5;
        }
        if (expense.category?.toLowerCase().includes(queryLower)) {
          matchedFields.push('category');
          relevanceScore += 3;
        }

        if (matchedFields.length > 0) {
          const project = projects.find(p => p.id === expense.projectId);
          
          results.push({
            id: `expense-${expense.id}`,
            type: 'expense',
            title: expense.description,
            subtitle: project?.name,
            metadata: {
              status: expense.status,
              project: project?.name,
              date: expense.date,
              amount: expense.amount
            },
            relevanceScore,
            matchedFields,
            data: expense
          });
        }
      });
    }

    // Search users
    if (typeFilter === 'all' || typeFilter === 'user') {
      users.forEach(user => {
        const matchedFields: string[] = [];
        let relevanceScore = 0;
        const fullName = `${user.firstName} ${user.lastName}`;

        if (fullName.toLowerCase().includes(queryLower)) {
          matchedFields.push('name');
          relevanceScore += fullName.toLowerCase().startsWith(queryLower) ? 10 : 5;
        }
        if (user.email.toLowerCase().includes(queryLower)) {
          matchedFields.push('email');
          relevanceScore += 3;
        }

        if (matchedFields.length > 0) {
          results.push({
            id: `user-${user.id}`,
            type: 'user',
            title: fullName,
            subtitle: user.email,
            metadata: {
              status: user.role
            },
            relevanceScore,
            matchedFields,
            data: user
          });
        }
      });
    }

    // Search companies
    if (typeFilter === 'all' || typeFilter === 'company') {
      companies.forEach(company => {
        const matchedFields: string[] = [];
        let relevanceScore = 0;

        if (company.name.toLowerCase().includes(queryLower)) {
          matchedFields.push('name');
          relevanceScore += company.name.toLowerCase().startsWith(queryLower) ? 10 : 5;
        }

        if (matchedFields.length > 0) {
          results.push({
            id: `company-${company.id}`,
            type: 'company',
            title: company.name,
            subtitle: company.type,
            relevanceScore,
            matchedFields,
            data: company
          });
        }
      });
    }

    // Sort by relevance and limit results
    const sortedResults = results
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxResults);

    setIsLoading(false);
    return sortedResults;
  }, [debouncedQuery, typeFilter, tasks, projects, documents, expenses, users, companies, maxResults]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, searchResults.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (searchResults[selectedIndex]) {
          onResultSelect(searchResults[selectedIndex]);
          onClose();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  }, [searchResults, selectedIndex, onResultSelect, onClose]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchResults]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-start justify-center p-4 pt-16">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
        
        <Card className="relative w-full max-w-2xl bg-white shadow-xl">
          <div className="p-4">
            {/* Search Input */}
            <div className="relative">
              <svg className="absolute left-3 top-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="w-full pl-10 pr-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              {isLoading && (
                <div className="absolute right-3 top-3">
                  <svg className="animate-spin h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Filters */}
            {enableFilters && (
              <div className="flex space-x-2 mt-4">
                {['all', 'task', 'project', 'document', 'expense', 'user', 'company'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setTypeFilter(type)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      typeFilter === type
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto border-t border-gray-200">
            {query.trim() && searchResults.length === 0 && !isLoading && (
              <div className="p-8 text-center text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p>No results found for "{query}"</p>
              </div>
            )}

            {searchResults.map((result, index) => (
              <div
                key={result.id}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                  index === selectedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => {
                  onResultSelect(result);
                  onClose();
                }}
              >
                <div className="flex items-start space-x-3">
                  {getTypeIcon(result.type)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {highlightMatch(result.title, query)}
                      </h3>
                      <Tag variant="secondary" size="sm">
                        {result.type}
                      </Tag>
                    </div>
                    
                    {result.subtitle && (
                      <p className="text-sm text-gray-600 truncate">
                        {highlightMatch(result.subtitle, query)}
                      </p>
                    )}
                    
                    {result.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {highlightMatch(result.description, query)}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      {result.metadata?.status && (
                        <span>Status: {result.metadata.status}</span>
                      )}
                      {result.metadata?.assignee && (
                        <span>Assignee: {result.metadata.assignee}</span>
                      )}
                      {result.metadata?.project && (
                        <span>Project: {result.metadata.project}</span>
                      )}
                      {result.metadata?.amount && (
                        <span>Amount: ${result.metadata.amount}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-3 bg-gray-50 text-xs text-gray-500 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>Esc Close</span>
            </div>
            {searchResults.length > 0 && (
              <span>{searchResults.length} result{searchResults.length !== 1 ? 's' : ''}</span>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
