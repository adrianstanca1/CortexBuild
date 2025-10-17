/**
 * App Marketplace - Browse and install mini applications
 */

import React, { useState } from 'react';
import {
    Search,
    Download,
    Star,
    CheckCircle,
    TrendingUp,
    Filter,
    Grid,
    List
} from 'lucide-react';
import { MiniApp } from './AppContainer';
import toast from 'react-hot-toast';

interface MarketplaceProps {
    apps: MiniApp[];
    onInstall: (appId: string) => void;
    onLaunch: (appId: string) => void;
    isDarkMode?: boolean;
}

const Marketplace: React.FC<MarketplaceProps> = ({ apps, onInstall, onLaunch, isDarkMode = true }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const categories = [
        { id: 'all', name: 'All Apps', icon: '📱' },
        { id: 'productivity', name: 'Productivity', icon: '⚡' },
        { id: 'finance', name: 'Finance', icon: '💰' },
        { id: 'health', name: 'Health', icon: '❤️' },
        { id: 'utilities', name: 'Utilities', icon: '🔧' },
        { id: 'entertainment', name: 'Entertainment', icon: '🎮' }
    ];

    const filteredApps = apps.filter(app => {
        const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            app.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleInstall = (appId: string) => {
        onInstall(appId);
        toast.success('App installed successfully!');
    };

    const bgClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
    const textClass = isDarkMode ? 'text-white' : 'text-gray-900';
    const inputClass = isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300';

    return (
        <div className={`${bgClass} border rounded-xl shadow-lg h-full flex flex-col`}>
            {/* Header */}
            <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className={`text-3xl font-black ${textClass} mb-2`}>App Marketplace</h2>
                        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Discover and install free applications
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-colors ${
                                viewMode === 'grid'
                                    ? 'bg-purple-600 text-white'
                                    : isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                            }`}
                        >
                            <Grid className="h-5 w-5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-colors ${
                                viewMode === 'list'
                                    ? 'bg-purple-600 text-white'
                                    : isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                            }`}
                        >
                            <List className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search apps..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full pl-12 pr-4 py-3 rounded-xl border ${inputClass} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    />
                </div>

                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {categories.map(category => (
                        <button
                            key={category.id}
                            type="button"
                            onClick={() => setSelectedCategory(category.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                                selectedCategory === category.id
                                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                                    : isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <span>{category.icon}</span>
                            <span className="font-medium">{category.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Apps Grid/List */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className={`${
                    viewMode === 'grid' 
                        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                        : 'space-y-4'
                }`}>
                    {filteredApps.map(app => (
                        <div
                            key={app.id}
                            className={`${bgClass} border rounded-xl p-6 hover:shadow-xl transition-all ${
                                viewMode === 'grid' ? '' : 'flex items-center gap-6'
                            }`}
                        >
                            <div className={`${viewMode === 'list' ? 'flex-shrink-0' : 'mb-4'}`}>
                                <div className={`${
                                    viewMode === 'grid' ? 'w-20 h-20' : 'w-16 h-16'
                                } bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-4xl shadow-lg`}>
                                    {app.icon}
                                </div>
                            </div>

                            <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className={`text-xl font-bold ${textClass} mb-1`}>{app.name}</h3>
                                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                                            {app.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 mb-4">
                                    <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                        <span className={`text-sm font-semibold ${textClass}`}>4.8</span>
                                    </div>
                                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        v{app.version}
                                    </span>
                                    <span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs font-semibold rounded-full">
                                        FREE
                                    </span>
                                </div>

                                <div className="flex gap-2">
                                    {app.installed ? (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => onLaunch(app.id)}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all"
                                            >
                                                <CheckCircle className="h-4 w-4" />
                                                Launch
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => handleInstall(app.id)}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-semibold transition-all"
                                        >
                                            <Download className="h-4 w-4" />
                                            Install
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredApps.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Search className={`h-16 w-16 mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                        <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            No apps found
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Marketplace;

