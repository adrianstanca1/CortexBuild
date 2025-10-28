/**
 * Marketplace with 6 Pre-Approved Apps
 * Complete marketplace system with app management
 */

import React, { useState } from 'react';
import { Download, Star, Users, TrendingUp, BarChart3, Clock, FileText, Zap, Settings, X } from 'lucide-react';

interface MarketplaceApp {
    id: string;
    name: string;
    description: string;
    category: string;
    icon: React.ReactNode;
    rating: number;
    downloads: number;
    version: string;
    price: string;
    features: string[];
    screenshots: string[];
    developer: string;
    isApproved: boolean;
    isInstalled?: boolean;
}

const MARKETPLACE_APPS: MarketplaceApp[] = [
    {
        id: 'app-1',
        name: 'Project Analytics',
        description: 'Advanced analytics and reporting for project performance tracking',
        category: 'Analytics',
        icon: <BarChart3 className="w-8 h-8" />,
        rating: 4.8,
        downloads: 2500,
        version: '2.1.0',
        price: 'Free',
        features: ['Real-time dashboards', 'Custom reports', 'Data export', 'Predictive analytics'],
        screenshots: [],
        developer: 'CortexBuild Team',
        isApproved: true
    },
    {
        id: 'app-2',
        name: 'Time Tracking Pro',
        description: 'Comprehensive time tracking and resource management solution',
        category: 'Time Management',
        icon: <Clock className="w-8 h-8" />,
        rating: 4.7,
        downloads: 1800,
        version: '1.9.0',
        price: 'Free',
        features: ['Automatic time tracking', 'Timesheet management', 'Resource allocation', 'Billing integration'],
        screenshots: [],
        developer: 'CortexBuild Team',
        isApproved: true
    },
    {
        id: 'app-3',
        name: 'Budget Manager',
        description: 'Smart budget tracking and financial forecasting for projects',
        category: 'Finance',
        icon: <TrendingUp className="w-8 h-8" />,
        rating: 4.9,
        downloads: 3200,
        version: '2.0.0',
        price: 'Free',
        features: ['Budget tracking', 'Cost forecasting', 'Variance analysis', 'Financial reports'],
        screenshots: [],
        developer: 'CortexBuild Team',
        isApproved: true
    },
    {
        id: 'app-4',
        name: 'Team Collaboration Hub',
        description: 'Unified communication and collaboration platform for teams',
        category: 'Collaboration',
        icon: <Users className="w-8 h-8" />,
        rating: 4.6,
        downloads: 2100,
        version: '1.8.0',
        price: 'Free',
        features: ['Chat & messaging', 'File sharing', 'Video conferencing', 'Task comments'],
        screenshots: [],
        developer: 'CortexBuild Team',
        isApproved: true
    },
    {
        id: 'app-5',
        name: 'Document Management',
        description: 'Centralized document storage and version control system',
        category: 'Document Management',
        icon: <FileText className="w-8 h-8" />,
        rating: 4.7,
        downloads: 1600,
        version: '1.7.0',
        price: 'Free',
        features: ['Document storage', 'Version control', 'Access control', 'Search & tagging'],
        screenshots: [],
        developer: 'CortexBuild Team',
        isApproved: true
    },
    {
        id: 'app-6',
        name: 'Reporting Suite',
        description: 'Comprehensive reporting and business intelligence tools',
        category: 'Reporting',
        icon: <Zap className="w-8 h-8" />,
        rating: 4.8,
        downloads: 2800,
        version: '2.2.0',
        price: 'Free',
        features: ['Custom reports', 'Scheduled exports', 'Data visualization', 'KPI tracking'],
        screenshots: [],
        developer: 'CortexBuild Team',
        isApproved: true
    }
];

export const MarketplaceApps = () => {
    const [apps, setApps] = useState<MarketplaceApp[]>(MARKETPLACE_APPS);
    const [selectedApp, setSelectedApp] = useState<MarketplaceApp | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const categories = Array.from(new Set(apps.map(app => app.category)));
    
    const filteredApps = apps.filter(app => {
        const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            app.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || app.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleInstall = (appId: string) => {
        setApps(apps.map(app => 
            app.id === appId ? { ...app, isInstalled: !app.isInstalled } : app
        ));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-white mb-4">App Marketplace</h1>
                    <p className="text-gray-400 text-lg">Discover and install pre-approved apps to extend your platform</p>
                </div>

                {/* Search and Filter */}
                <div className="mb-8 space-y-4">
                    <input
                        type="text"
                        placeholder="Search apps..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    />
                    
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                selectedCategory === null
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                            }`}
                        >
                            All
                        </button>
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-lg transition-colors ${
                                    selectedCategory === category
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Apps Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {filteredApps.map(app => (
                        <div
                            key={app.id}
                            className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition-all cursor-pointer group"
                            onClick={() => setSelectedApp(app)}
                        >
                            {/* App Icon */}
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                                {app.icon}
                            </div>

                            {/* App Info */}
                            <h3 className="text-lg font-semibold text-white mb-2">{app.name}</h3>
                            <p className="text-gray-400 text-sm mb-4 line-clamp-2">{app.description}</p>

                            {/* Rating and Downloads */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-1">
                                    <Star size={16} className="text-yellow-400 fill-yellow-400" />
                                    <span className="text-sm text-gray-300">{app.rating}</span>
                                </div>
                                <span className="text-sm text-gray-400">{app.downloads.toLocaleString()} downloads</span>
                            </div>

                            {/* Category and Price */}
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full">{app.category}</span>
                                <span className="text-sm font-semibold text-white">{app.price}</span>
                            </div>

                            {/* Install Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleInstall(app.id);
                                }}
                                className={`w-full py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                                    app.isInstalled
                                        ? 'bg-green-600/20 text-green-300 border border-green-600'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                            >
                                <Download size={16} />
                                {app.isInstalled ? 'Installed' : 'Install'}
                            </button>
                        </div>
                    ))}
                </div>

                {/* App Detail Modal */}
                {selectedApp && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-slate-700 sticky top-0 bg-slate-800">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                                        {selectedApp.icon}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">{selectedApp.name}</h2>
                                        <p className="text-gray-400 text-sm">by {selectedApp.developer}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedApp(null)}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 space-y-6">
                                {/* Description */}
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                                    <p className="text-gray-300">{selectedApp.description}</p>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                                        <p className="text-2xl font-bold text-blue-400">{selectedApp.rating}</p>
                                        <p className="text-sm text-gray-400">Rating</p>
                                    </div>
                                    <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                                        <p className="text-2xl font-bold text-blue-400">{selectedApp.downloads.toLocaleString()}</p>
                                        <p className="text-sm text-gray-400">Downloads</p>
                                    </div>
                                    <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                                        <p className="text-2xl font-bold text-blue-400">{selectedApp.version}</p>
                                        <p className="text-sm text-gray-400">Version</p>
                                    </div>
                                    <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                                        <p className="text-2xl font-bold text-blue-400">{selectedApp.price}</p>
                                        <p className="text-sm text-gray-400">Price</p>
                                    </div>
                                </div>

                                {/* Features */}
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-3">Features</h3>
                                    <ul className="grid grid-cols-2 gap-2">
                                        {selectedApp.features.map((feature, i) => (
                                            <li key={i} className="flex items-center gap-2 text-gray-300">
                                                <Zap size={16} className="text-blue-400" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Install Button */}
                                <button
                                    onClick={() => {
                                        handleInstall(selectedApp.id);
                                        setSelectedApp(null);
                                    }}
                                    className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                                        selectedApp.isInstalled
                                            ? 'bg-green-600/20 text-green-300 border border-green-600'
                                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    }`}
                                >
                                    <Download size={20} />
                                    {selectedApp.isInstalled ? 'Installed' : 'Install App'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarketplaceApps;

