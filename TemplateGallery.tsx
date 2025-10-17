import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Download, Sparkles, Clock, TrendingUp } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  icon: string;
  features: string[];
  ai_enhanced: boolean;
  difficulty_level: string;
  estimated_time_minutes: number;
  install_count: number;
  rating: number;
}

interface TemplateGalleryProps {
  subscriptionTier: string;
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({ subscriptionTier }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAIOnly, setShowAIOnly] = useState(false);
  const [sortBy, setSortBy] = useState('popular');

  useEffect(() => {
    fetchTemplates();
  }, [selectedCategory, showAIOnly, sortBy]);

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (showAIOnly) params.append('ai_enhanced', 'true');
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`http://localhost:3001/api/sdk/templates?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        let sorted = data.data;
        if (sortBy === 'popular') {
          sorted = sorted.sort((a: Template, b: Template) => b.install_count - a.install_count);
        } else if (sortBy === 'rating') {
          sorted = sorted.sort((a: Template, b: Template) => b.rating - a.rating);
        } else if (sortBy === 'newest') {
          sorted = sorted.sort((a: Template, b: Template) => b.id.localeCompare(a.id));
        }
        setTemplates(sorted);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All Templates', count: templates.length },
    { id: 'rfi', label: 'RFI Management', count: templates.filter(t => t.category === 'rfi').length },
    { id: 'invoice', label: 'Invoicing', count: templates.filter(t => t.category === 'invoice').length },
    { id: 'safety', label: 'Safety', count: templates.filter(t => t.category === 'safety').length },
    { id: 'reporting', label: 'Reporting', count: templates.filter(t => t.category === 'reporting').length },
    { id: 'workflow', label: 'Workflows', count: templates.filter(t => t.category === 'workflow').length }
  ];

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Template Gallery</h2>
        <p className="text-gray-600">
          Choose from {templates.length} pre-built construction-specific app templates
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchTemplates()}
                placeholder="Search templates..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Sort */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          {/* AI Filter */}
          <div>
            <button
              onClick={() => setShowAIOnly(!showAIOnly)}
              className={`w-full px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                showAIOnly
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>AI-Enhanced Only</span>
            </button>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Categories</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading templates...</p>
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600">No templates found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(template => (
            <div key={template.id} className="bg-white rounded-lg shadow hover:shadow-xl transition-shadow overflow-hidden">
              {/* Template Header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{template.icon}</div>
                  {template.ai_enhanced && (
                    <div className="flex items-center space-x-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-semibold">
                      <Sparkles className="w-3 h-3" />
                      <span>AI</span>
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2">{template.name}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{template.description}</p>

                {/* Metadata */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span>{template.rating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Download className="w-3 h-3" />
                    <span>{template.install_count}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{template.estimated_time_minutes}min</span>
                  </div>
                </div>

                {/* Difficulty Badge */}
                <div className="mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(template.difficulty_level)}`}>
                    {template.difficulty_level}
                  </span>
                </div>

                {/* Features */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {JSON.parse(template.features).slice(0, 3).map((feature: string, index: number) => (
                      <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {feature}
                      </span>
                    ))}
                    {JSON.parse(template.features).length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{JSON.parse(template.features).length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                    disabled={subscriptionTier === 'free'}
                  >
                    Use Template
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    Preview
                  </button>
                </div>

                {subscriptionTier === 'free' && (
                  <p className="text-xs text-red-600 mt-2 text-center">
                    Upgrade to use templates
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

