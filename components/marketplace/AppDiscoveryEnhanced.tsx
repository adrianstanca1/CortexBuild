/**
 * Enhanced App Discovery
 * Complete marketplace with search, filters, ratings, and analytics
 */

import React, { useState, useEffect } from 'react';
import { Search, Star, Download, TrendingUp, Filter, Grid, List } from 'lucide-react';

interface MarketplaceApp {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rating: number;
  reviews: number;
  downloads: number;
  price: number;
  developer: string;
  screenshots?: string[];
  features?: string[];
  version: string;
  lastUpdated: string;
}

export const AppDiscoveryEnhanced: React.FC = () => {
  const [apps, setApps] = useState<MarketplaceApp[]>([]);
  const [filteredApps, setFilteredApps] = useState<MarketplaceApp[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'newest'>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories = [
    'all',
    'productivity',
    'analytics',
    'communication',
    'finance',
    'construction',
    'developer-tools',
  ];

  useEffect(() => {
    // Mock data - in production, fetch from API
    const mockApps: MarketplaceApp[] = [
      {
        id: 'app-1',
        name: 'Project Dashboard Pro',
        description: 'Advanced project analytics and real-time monitoring',
        icon: '📊',
        category: 'analytics',
        rating: 4.8,
        reviews: 234,
        downloads: 1250,
        price: 29.99,
        developer: 'CortexBuild Labs',
        version: '2.1.0',
        lastUpdated: '2025-10-28',
        features: ['Real-time analytics', 'Custom reports', 'Team collaboration'],
      },
      // Add more mock apps...
    ];

    setApps(mockApps);
    setFilteredApps(mockApps);
  }, []);

  useEffect(() => {
    let filtered = apps;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(app => app.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(app =>
        app.name.toLowerCase().includes(query) ||
        app.description.toLowerCase().includes(query) ||
        app.developer.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        case 'popular':
        default:
          return b.downloads - a.downloads;
      }
    });

    setFilteredApps(filtered);
  }, [apps, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">App Marketplace</h1>
          <p className="text-gray-600">Discover and install powerful apps to enhance your workflow</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search apps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
            </select>

            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-gray-600">
          {filteredApps.length} apps found
        </div>

        {/* Apps Grid/List */}
        <div className={viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'
        }>
          {filteredApps.map(app => (
            <div
              key={app.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-4xl">{app.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{app.name}</h3>
                    <p className="text-sm text-gray-500">{app.developer}</p>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{app.description}</p>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{app.rating}</span>
                    <span className="text-sm text-gray-500">({app.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Download className="w-4 h-4" />
                    <span className="text-sm">{app.downloads.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-gray-900">
                    ${app.price}
                  </span>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Install
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

