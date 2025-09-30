import React, { useState, useCallback } from 'react';
import { MultimodalSearchQuery, MultimodalSearchResult, MediaType } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Tag } from '../ui/Tag';

interface MultimodalSearchProps {
  onSearch: (query: MultimodalSearchQuery) => Promise<MultimodalSearchResult[]>;
  onResultSelect: (result: MultimodalSearchResult) => void;
  className?: string;
}

export const MultimodalSearch: React.FC<MultimodalSearchProps> = ({
  onSearch,
  onResultSelect,
  className = ''
}) => {
  const [query, setQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<MediaType[]>([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [results, setResults] = useState<MultimodalSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const mediaTypes: MediaType[] = ['text', 'image', 'audio', 'video', 'document', 'mixed'];

  const handleTypeToggle = useCallback((type: MediaType) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  }, []);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) {
      setSearchError('Please enter a search query');
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const searchQuery: MultimodalSearchQuery = {
        query: query.trim(),
        mediaTypes: selectedTypes.length > 0 ? selectedTypes : undefined,
        dateRange: dateRange.start && dateRange.end ? {
          start: new Date(dateRange.start),
          end: new Date(dateRange.end)
        } : undefined,
        limit: 20
      };

      const searchResults = await onSearch(searchQuery);
      setResults(searchResults);
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : 'Search failed');
    } finally {
      setIsSearching(false);
    }
  }, [query, selectedTypes, dateRange, onSearch]);

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const getTypeIcon = useCallback((type: MediaType) => {
    switch (type) {
      case 'text': return '📝';
      case 'image': return '🖼️';
      case 'audio': return '🎵';
      case 'video': return '🎥';
      case 'document': return '📄';
      case 'mixed': return '📁';
      default: return '📄';
    }
  }, []);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search Form */}
      <Card>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Search Multimodal Content</h3>

          {/* Search Query */}
          <div>
            <label htmlFor="search-query" className="block text-sm font-medium text-gray-700 mb-2">
              Search Query
            </label>
            <div className="flex gap-2">
              <input
                id="search-query"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search across all content types..."
                className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button
                onClick={handleSearch}
                disabled={isSearching || !query.trim()}
                isLoading={isSearching}
              >
                Search
              </Button>
            </div>
          </div>

          {/* Media Type Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Types
            </label>
            <div className="flex flex-wrap gap-2">
              {mediaTypes.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeToggle(type)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${selectedTypes.includes(type)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {getTypeIcon(type)} {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                id="start-date"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                id="end-date"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {searchError && (
            <div className="text-red-600 text-sm">{searchError}</div>
          )}
        </div>
      </Card>

      {/* Search Results */}
      {results.length > 0 && (
        <Card>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Search Results ({results.length})
            </h3>

            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={result.content.id || index}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onResultSelect(result)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{getTypeIcon(result.content.type)}</span>
                        <Tag label={result.content.type} color="blue" />
                        <span className="text-sm text-gray-500">
                          Score: {(result.score * 100).toFixed(1)}%
                        </span>
                      </div>

                      <h4 className="font-medium text-gray-900">
                        {result.content.metadata?.filename || `${result.content.type} content`}
                      </h4>

                      {result.snippet && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {result.snippet}
                        </p>
                      )}

                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>
                          Created: {new Date(result.content.createdAt).toLocaleDateString()}
                        </span>
                        {result.content.metadata?.fileSize && (
                          <span>
                            Size: {formatFileSize(result.content.metadata.fileSize)}
                          </span>
                        )}
                        <span>Status: {result.content.status}</span>
                      </div>
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onResultSelect(result);
                      }}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* No Results */}
      {results.length === 0 && query && !isSearching && (
        <Card>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
            <p className="text-gray-600">
              Try adjusting your search query or filters
            </p>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {results.length === 0 && !query && (
        <Card>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Search Multimodal Content</h3>
            <p className="text-gray-600">
              Enter a search query to find content across all media types
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};
