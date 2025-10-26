// components/screens/AdvancedSearchScreen.tsx
import React, { useState } from 'react';
import { AdvancedSearch, SearchFilters, SearchResult } from '../search/AdvancedSearch';

interface AdvancedSearchScreenProps {
    currentUser: any;
}

export const AdvancedSearchScreen: React.FC<AdvancedSearchScreenProps> = ({ currentUser }) => {
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);

    const handleSearch = (filters: SearchFilters) => {
        console.log('Search filters:', filters);
        // Implement actual search logic here
    };

    const handleResultSelect = (result: SearchResult) => {
        setSelectedResult(result);
        console.log('Selected result:', result);
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Advanced Search</h1>
                <p className="text-gray-600">Search across projects, tasks, users, and documents with powerful filters</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <AdvancedSearch
                    onSearch={handleSearch}
                    onResultSelect={handleResultSelect}
                    placeholder="Search projects, tasks, users, documents..."
                    className="mb-6"
                />

                {selectedResult && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="text-lg font-semibold text-blue-900 mb-2">Selected Result</h3>
                        <div className="text-sm text-blue-800">
                            <p><strong>Type:</strong> {selectedResult.type}</p>
                            <p><strong>Title:</strong> {selectedResult.title}</p>
                            <p><strong>Description:</strong> {selectedResult.description}</p>
                            <p><strong>Status:</strong> {selectedResult.status}</p>
                            <p><strong>Priority:</strong> {selectedResult.priority}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
