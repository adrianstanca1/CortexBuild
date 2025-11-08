import React, { useState, useEffect, useMemo } from 'react';
import {
    Search, Filter, Star, Download, TrendingUp, Clock, Award,
    Package, Tag, Grid, List, SlidersHorizontal, X, Eye, Heart
} from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import toast from 'react-hot-toast';

interface App {
    id: string;
    name: string;
    description: string;
    category: string;
    developer_id: string;
    developer_name?: string;
    version: string;
    price: number;
    pricing_model: string;
    status: string;
    icon_url?: string;
    screenshots?: string[];
    features?: string[];
    install_count: number;
    rating: number;
    review_count: number;
    created_at: string;
    is_featured?: boolean;
}

interface AppDiscoveryProps {
    currentUser?: any;
    onInstall?: (appId: string) => void;
    onViewDetails?: (app: App) => void;
}

const AppDiscovery: React.FC<AppDiscoveryProps> = ({ currentUser, onInstall, onViewDetails }) => {
    const [apps, setApps] = useState<App[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedPricing, setSelectedPricing] = useState('all');
    const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'recent' | 'name'>('popular');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [minRating, setMinRating] = useState(0);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const categories = [
        { value: 'all', label: 'All Categories', icon: Package },
        { value: 'productivity', label: 'Productivity', icon: TrendingUp },
        { value: 'communication', label: 'Communication', icon: Package },
        { value: 'analytics', label: 'Analytics', icon: TrendingUp },
        { value: 'integration', label: 'Integration', icon: Package },
        { value: 'utility', label: 'Utility', icon: Package },
        { value: 'other', label: 'Other', icon: Package }
    ];

    const pricingOptions = [
        { value: 'all', label: 'All Pricing' },
        { value: 'free', label: 'Free' },
        { value: 'one_time', label: 'One-time Purchase' },
        { value: 'subscription', label: 'Subscription' }
    ];

    useEffect(() => {
        loadApps();
    }, []);

    const loadApps = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('marketplace_apps')
                .select(`
                    *,
                    users(name)
                `)
                .eq('status', 'published')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const formatted = (data || []).map((app: any) => ({
                ...app,
                developer_name: app.users?.name,
                is_featured: app.install_count > 100 || app.rating >= 4.5
            }));

            setApps(formatted);
        } catch (error: any) {
            console.error('Error loading apps:', error);
            toast.error('Failed to load apps');
        } finally {
            setLoading(false);
        }
    };

    const handleInstall = async (appId: string) => {
        if (onInstall) {
            onInstall(appId);
        } else {
            try {
                const { error } = await supabase.from('app_installations').insert({
                    id: crypto.randomUUID(),
                    app_id: appId,
                    company_id: currentUser?.companyId,
                    installed_by: currentUser?.id,
                    installed_at: new Date().toISOString(),
                    status: 'active'
                });

                if (error) throw error;

                // Update install count
                const app = apps.find(a => a.id === appId);
                if (app) {
                    await supabase
                        .from('marketplace_apps')
                        .update({ install_count: app.install_count + 1 })
                        .eq('id', appId);
                }

                toast.success('App installed successfully!');
                loadApps();
            } catch (error: any) {
                console.error('Error installing app:', error);
                toast.error('Failed to install app');
            }
        }
    };

    const filteredAndSortedApps = useMemo(() => {
        let filtered = apps.filter(app => {
            const matchesSearch = !searchQuery ||
                app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                app.developer_name?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
            const matchesPricing = selectedPricing === 'all' || app.pricing_model === selectedPricing;
            const matchesRating = app.rating >= minRating;

            return matchesSearch && matchesCategory && matchesPricing && matchesRating;
        });

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'popular':
                    return b.install_count - a.install_count;
                case 'rating':
                    return b.rating - a.rating;
                case 'recent':
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                case 'name':
                    return a.name.localeCompare(b.name);
                default:
                    return 0;
            }
        });

        return filtered;
    }, [apps, searchQuery, selectedCategory, selectedPricing, sortBy, minRating]);

    const featuredApps = useMemo(() => {
        return apps.filter(app => app.is_featured).slice(0, 3);
    }, [apps]);

    const popularApps = useMemo(() => {
        return [...apps].sort((a, b) => b.install_count - a.install_count).slice(0, 5);
    }, [apps]);

    const recentApps = useMemo(() => {
        return [...apps].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);
    }, [apps]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
            />
        ));
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            productivity: 'bg-blue-100 text-blue-800',
            communication: 'bg-purple-100 text-purple-800',
            analytics: 'bg-green-100 text-green-800',
            integration: 'bg-orange-100 text-orange-800',
            utility: 'bg-pink-100 text-pink-800',
            other: 'bg-gray-100 text-gray-800'
        };
        return colors[category] || colors.other;
    };

    const AppCard: React.FC<{ app: App; featured?: boolean }> = ({ app, featured }) => (
        <div className={`bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all ${featured ? 'ring-2 ring-yellow-400' : ''}`}>
            {featured && (
                <div className="flex items-center gap-1 text-yellow-600 text-sm font-medium mb-3">
                    <Award className="w-4 h-4" />
                    Featured
                </div>
            )}

            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{app.name}</h3>
                        <p className="text-sm text-gray-500">{app.developer_name}</p>
                    </div>
                </div>
            </div>

            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{app.description}</p>

            <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(app.category)}`}>
                    {app.category}
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                    {app.pricing_model === 'free' ? 'FREE' : formatCurrency(app.price)}
                </span>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                    {renderStars(Math.round(app.rating))}
                    <span className="ml-1">({app.review_count})</span>
                </div>
                <div className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    <span>{app.install_count}</span>
                </div>
            </div>

            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => handleInstall(app.id)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                    Install
                </button>
                <button
                    type="button"
                    onClick={() => onViewDetails?.(app)}
                    className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View details"
                >
                    <Eye className="w-5 h-5" />
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Discover Apps</h1>
                <p className="text-gray-600">Find the perfect apps to enhance your workflow</p>
            </div>

            {/* Featured Apps */}
            {featuredApps.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Award className="w-6 h-6 text-yellow-600" />
                        Featured Apps
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {featuredApps.map(app => (
                            <AppCard key={app.id} app={app} featured />
                        ))}
                    </div>
                </div>
            )}

            {/* Search and Filters */}
            <div className="mb-6">
                <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                    <div className="flex flex-wrap gap-4">
                        {/* Search */}
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search apps..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Category Filter */}
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            aria-label="Filter by category"
                        >
                            {categories.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>

                        {/* Pricing Filter */}
                        <select
                            value={selectedPricing}
                            onChange={(e) => setSelectedPricing(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            aria-label="Filter by pricing"
                        >
                            {pricingOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>

                        {/* Sort */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            aria-label="Sort by"
                        >
                            <option value="popular">Most Popular</option>
                            <option value="rating">Highest Rated</option>
                            <option value="recent">Recently Added</option>
                            <option value="name">Name (A-Z)</option>
                        </select>

                        {/* View Mode Toggle */}
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                                title="Grid view"
                            >
                                <Grid className="w-5 h-5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                                title="List view"
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Advanced Filters Toggle */}
                        <button
                            type="button"
                            onClick={() => setShowFilters(!showFilters)}
                            className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <SlidersHorizontal className="w-5 h-5" />
                            Filters
                        </button>
                    </div>

                    {/* Advanced Filters */}
                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Minimum Rating
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="5"
                                        step="0.5"
                                        value={minRating}
                                        onChange={(e) => setMinRating(parseFloat(e.target.value))}
                                        className="w-full"
                                        aria-label="Minimum rating filter"
                                        title="Minimum rating filter"
                                    />
                                    <div className="flex items-center justify-between text-sm text-gray-600 mt-1">
                                        <span>0</span>
                                        <span className="font-medium">{minRating.toFixed(1)} stars</span>
                                        <span>5</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Results */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : filteredAndSortedApps.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center shadow-md">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No apps found</h3>
                    <p className="text-gray-600">Try adjusting your filters</p>
                </div>
            ) : (
                <>
                    <div className="mb-4 text-sm text-gray-600">
                        Showing {filteredAndSortedApps.length} {filteredAndSortedApps.length === 1 ? 'app' : 'apps'}
                    </div>
                    <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                        {filteredAndSortedApps.map(app => (
                            <AppCard key={app.id} app={app} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default AppDiscovery;
