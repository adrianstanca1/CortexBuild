import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Download, Package, Check, X } from 'lucide-react';
import { getAPIUrl } from '../../../config/api.config';

interface Module {
  id: number;
  name: string;
  slug: string;
  description: string;
  category: string;
  category_name: string;
  category_icon: string;
  version: string;
  price: number;
  is_free: boolean;
  downloads: number;
  rating: number;
  reviews_count: number;
  install_count: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  module_count: number;
}

export const MarketplacePage: React.FC = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [installedModules, setInstalledModules] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('downloads');

  useEffect(() => {
    fetchCategories();
    fetchModules();
    fetchInstalledModules();
  }, [selectedCategory, sortBy]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getAPIUrl('/marketplace/categories'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchModules = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (sortBy) params.append('sort', sortBy);

      const response = await fetch(`${getAPIUrl('/marketplace/modules')}?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setModules(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInstalledModules = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getAPIUrl('/marketplace/installed'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        const installed = new Set<number>(data.data.map((m: any) => Number(m.module_id)));
        setInstalledModules(installed);
      }
    } catch (error) {
      console.error('Failed to fetch installed modules:', error);
    }
  };

  const handleInstall = async (moduleId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getAPIUrl('/marketplace/install'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ module_id: moduleId })
      });

      const data = await response.json();
      if (data.success) {
        setInstalledModules(prev => new Set([...prev, moduleId]));
        alert('Module installed successfully!');
      } else {
        alert(data.error || 'Failed to install module');
      }
    } catch (error) {
      console.error('Install error:', error);
      alert('Failed to install module');
    }
  };

  const handleUninstall = async (moduleId: number) => {
    if (!confirm('Are you sure you want to uninstall this module?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getAPIUrl(`/marketplace/uninstall/${moduleId}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setInstalledModules(prev => {
          const newSet = new Set(prev);
          newSet.delete(moduleId);
          return newSet;
        });
        alert('Module uninstalled successfully!');
      }
    } catch (error) {
      console.error('Uninstall error:', error);
      alert('Failed to uninstall module');
    }
  };

  const filteredModules = modules.filter(module =>
    module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Module Marketplace</h1>
          <p className="text-gray-600">Extend your CortexBuild platform with powerful modules</p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search modules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="downloads">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Filter className="w-5 h-5" />
                <span>Categories</span>
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedCategory === '' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span>All Modules</span>
                    <span className="text-sm text-gray-500">{modules.length}</span>
                  </div>
                </button>
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.slug)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedCategory === category.slug ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{category.name}</span>
                      <span className="text-sm text-gray-500">{category.module_count}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Modules Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-12">Loading modules...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredModules.map(module => {
                  const isInstalled = installedModules.has(module.id);
                  return (
                    <div key={module.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{module.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{module.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Download className="w-4 h-4" />
                              <span>{module.downloads.toLocaleString()}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span>{module.rating} ({module.reviews_count})</span>
                            </span>
                          </div>
                        </div>
                        {isInstalled && (
                          <div className="ml-4 p-2 bg-green-100 rounded-full">
                            <Check className="w-5 h-5 text-green-600" />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div>
                          <span className="text-sm text-gray-500">v{module.version}</span>
                          {module.is_free ? (
                            <span className="ml-3 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">FREE</span>
                          ) : (
                            <span className="ml-3 text-lg font-bold text-gray-900">£{module.price}</span>
                          )}
                        </div>
                        {isInstalled ? (
                          <button
                            onClick={() => handleUninstall(module.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                          >
                            <X className="w-4 h-4" />
                            <span>Uninstall</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleInstall(module.id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                          >
                            <Package className="w-4 h-4" />
                            <span>Install</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
