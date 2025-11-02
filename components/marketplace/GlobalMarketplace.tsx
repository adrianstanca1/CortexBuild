/**
 * Global Marketplace Component
 * Browse and install apps from the global marketplace
 */

import React, { useState, useEffect } from 'react';
import {
    Package, Search, Filter, Download, Star, TrendingUp,
    Clock, CheckCircle, XCircle, AlertCircle, Grid3x3, List,
    Eye, Users, Building2, Sparkles, Gem, Zap, Brain,
    Shield, FileText, DollarSign, Calendar, Target, Layers
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getAPIUrl } from '../../config/api.config';

interface App {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    version: string;
    developer_id: string;
    published_at: string;
    install_count: number;
    company_install_count: number;
    is_installed_by_me?: number;
    is_installed_by_company?: number;
    config?: string | any;
}

interface Category {
    id: string;
    name: string;
    icon: string;
}

interface GlobalMarketplaceProps {
    isDarkMode?: boolean;
    currentUser?: any;
}

const GlobalMarketplace: React.FC<GlobalMarketplaceProps> = ({
    isDarkMode = true,
    currentUser
}) => {
    const [apps, setApps] = useState<App[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'name'>('recent');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [loading, setLoading] = useState(true);

    const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
    const cardClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
    const textClass = isDarkMode ? 'text-white' : 'text-gray-900';
    const mutedClass = isDarkMode ? 'text-gray-400' : 'text-gray-600';

    useEffect(() => {
        fetchCategories();
        fetchApps();
    }, [selectedCategory, searchQuery, sortBy]);

    const fetchCategories = async () => {
        try {
            const response = await fetch(getAPIUrl('/global-marketplace/categories'));
            const data = await response.json();
            if (data.success) {
                setCategories(data.categories);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchApps = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();

            if (selectedCategory !== 'all') params.append('category', selectedCategory);
            if (searchQuery) params.append('search', searchQuery);
            params.append('sort', sortBy);

            const endpoint = token
                ? 'http://localhost:3001/api/global-marketplace/apps/detailed'
                : 'http://localhost:3001/api/global-marketplace/apps';

            const headers: any = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const response = await fetch(`${endpoint}?${params}`, { headers });
            const data = await response.json();

            if (data.success) {
                setApps(data.apps);
            }
        } catch (error) {
            console.error('Error fetching apps:', error);
            toast.error('Failed to load apps');
        } finally {
            setLoading(false);
        }
    };

    const handleInstallIndividual = async (appId: string) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please login to install apps');
                return;
            }

            const response = await fetch(getAPIUrl(`/global-marketplace/install/individual/${appId}`), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                toast.success('App installed successfully!');
                fetchApps(); // Refresh to update install status
            } else {
                toast.error(data.error || 'Failed to install app');
            }
        } catch (error) {
            console.error('Error installing app:', error);
            toast.error('Failed to install app');
        }
    };

    const handleInstallCompany = async (appId: string) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please login to install apps');
                return;
            }

            const response = await fetch(getAPIUrl(`/global-marketplace/install/company/${appId}`), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                toast.success('App installed for entire company!');
                fetchApps(); // Refresh to update install status
            } else {
                toast.error(data.error || 'Failed to install app');
            }
        } catch (error) {
            console.error('Error installing app for company:', error);
            toast.error('Failed to install app');
        }
    };

    // Helper functions for magic apps
    const isMagicApp = (app: App) => {
        return app.category?.includes('Magic') ||
            app.category?.includes('AI') ||
            app.name.includes('🔮') ||
            app.name.includes('✨') ||
            app.name.includes('⚡') ||
            app.name.includes('🧠') ||
            app.name.includes('🌟');
    };

    const getMagicScore = (app: App) => {
        // Extract magic score from config or generate based on app type
        try {
            const config = typeof app.config === 'string' ? JSON.parse(app.config) : app.config;
            if (config?.magicScore) return config.magicScore;
            if (config?.accuracy) return config.accuracy;
        } catch (e) {
            // Ignore parsing errors
        }

        // Default magic scores for known apps
        if (app.name.includes('Oracle')) return 99;
        if (app.name.includes('Predictive')) return 97;
        if (app.name.includes('Intelligent')) return 96;
        if (app.name.includes('Magic')) return 95;
        if (app.name.includes('AI')) return 92;
        return 85;
    };

    const getCategoryIcon = (category: string) => {
        switch (category.toLowerCase()) {
            case 'ai & magic': return <Gem className="w-4 h-4 text-purple-500" />;
            case 'workflow automation': return <Zap className="w-4 h-4 text-blue-500" />;
            case 'ai & automation': return <Brain className="w-4 h-4 text-green-500" />;
            case 'safety & compliance': return <Shield className="w-4 h-4 text-red-500" />;
            case 'quality control': return <Eye className="w-4 h-4 text-orange-500" />;
            case 'document management': return <FileText className="w-4 h-4 text-indigo-500" />;
            case 'financial management': return <DollarSign className="w-4 h-4 text-yellow-500" />;
            case 'project management': return <Calendar className="w-4 h-4 text-pink-500" />;
            case 'simulation & modeling': return <Layers className="w-4 h-4 text-cyan-500" />;
            default: return <Package className="w-4 h-4 text-gray-500" />;
        }
    };

    const renderAppCard = (app: App) => {
        const isInstalledByMe = app.is_installed_by_me === 1;
        const isInstalledByCompany = app.is_installed_by_company === 1;
        const totalInstalls = app.install_count + app.company_install_count;
        const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'company_admin';
        const isMagic = isMagicApp(app);
        const magicScore = getMagicScore(app);

        return (
            <div
                key={app.id}
                className={`${cardClass} border rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 ${isMagic ? 'border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-pink-900/20' : ''
                    }`}
            >
                {/* App Icon & Name */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className={`text-4xl ${isMagic ? 'animate-pulse' : ''}`}>
                            {app.icon}
                        </div>
                        <div>
                            <h3 className={`text-lg font-bold ${textClass} flex items-center`}>
                                {app.name}
                                {isMagic && <Sparkles className="w-4 h-4 ml-2 text-yellow-400" />}
                            </h3>
                            <div className="flex items-center space-x-2">
                                {getCategoryIcon(app.category)}
                                <span className={`text-sm ${mutedClass}`}>v{app.version}</span>
                                {isMagic && (
                                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                        Magic
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                        {(isInstalledByMe || isInstalledByCompany) && (
                            <div className="flex items-center space-x-1 text-green-500 text-sm">
                                <CheckCircle className="w-4 h-4" />
                                <span>Installed</span>
                            </div>
                        )}
                        {isMagic && (
                            <div className="flex items-center space-x-1">
                                <Sparkles className="w-4 h-4 text-yellow-400" />
                                <span className="text-sm text-yellow-400 font-medium">{magicScore}%</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Description */}
                <p className={`${mutedClass} text-sm mb-4 line-clamp-2`}>
                    {app.description}
                </p>

                {/* Stats */}
                <div className="flex items-center space-x-4 mb-4 text-sm">
                    <div className="flex items-center space-x-1">
                        <Download className="w-4 h-4 text-blue-500" />
                        <span className={mutedClass}>{totalInstalls}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-purple-500" />
                        <span className={mutedClass}>
                            {new Date(app.published_at).toLocaleDateString()}
                        </span>
                    </div>
                </div>

                {/* Install Buttons */}
                <div className="flex space-x-2">
                    {!isInstalledByMe && (
                        <button
                            type="button"
                            onClick={() => handleInstallIndividual(app.id)}
                            className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 ${isMagic
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                                : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                        >
                            <Download className="w-4 h-4" />
                            <span>{isMagic ? 'Install Magic' : 'Install for Me'}</span>
                        </button>
                    )}
                    {isAdmin && !isInstalledByCompany && (
                        <button
                            onClick={() => handleInstallCompany(app.id)}
                            className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                        >
                            <Building2 className="w-4 h-4" />
                            <span>Install for Company</span>
                        </button>
                    )}
                    {(isInstalledByMe || isInstalledByCompany) && (
                        <button
                            disabled
                            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            <CheckCircle className="w-4 h-4" />
                            <span>Installed</span>
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className={`min-h-screen ${bgClass} p-8`}>
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className={`text-4xl font-bold ${textClass} mb-2`}>
                            🛍️ Global Marketplace
                        </h1>
                        <p className={mutedClass}>
                            Discover and install apps to enhance your CortexBuild experience
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-600 text-white' : `${cardClass} ${textClass}`}`}
                        >
                            <Grid3x3 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-600 text-white' : `${cardClass} ${textClass}`}`}
                        >
                            <List className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${mutedClass}`} />
                        <input
                            type="text"
                            placeholder="Search apps..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full pl-10 pr-4 py-3 ${cardClass} border rounded-lg ${textClass} focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                        />
                    </div>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className={`px-4 py-3 ${cardClass} border rounded-lg ${textClass} focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                    >
                        <option value="recent">Most Recent</option>
                        <option value="popular">Most Popular</option>
                        <option value="name">Name (A-Z)</option>
                    </select>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {categories.map(category => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`px-4 py-2 rounded-lg transition-all ${selectedCategory === category.id
                                ? 'bg-blue-600 text-white'
                                : `${cardClass} ${textClass} hover:bg-blue-600 hover:text-white`
                                }`}
                        >
                            <span className="mr-2">{category.icon}</span>
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Apps Grid */}
            <div className="max-w-7xl mx-auto">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className={`${mutedClass} mt-4`}>Loading apps...</p>
                    </div>
                ) : apps.length === 0 ? (
                    <div className="text-center py-12">
                        <Package className={`w-16 h-16 ${mutedClass} mx-auto mb-4`} />
                        <p className={`${textClass} text-xl font-semibold mb-2`}>No apps found</p>
                        <p className={mutedClass}>Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
                        {apps.map(app => renderAppCard(app))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GlobalMarketplace;

