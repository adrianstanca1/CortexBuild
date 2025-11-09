import React, { useState, useEffect } from 'react';
import { BaseWidget, WidgetAction } from './BaseWidget';
import {
    Store,
    Download,
    Star,
    Shield,
    Package,
    Search,
    CheckCircle,
    AlertTriangle,
    Clock,
    Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

interface MarketplaceApp {
    id: string;
    name: string;
    description: string;
    publisher: string;
    publisherVerified: boolean;
    version: string;
    category: string[];

    // Trust & Quality
    trustScore: number; // 0-100
    installCount: number;
    rating: number; // 1-5
    reviewCount: number;
    lastUpdated: Date;

    // Security
    securityAuditPassed: boolean;
    permissions: string[];

    // Pricing
    pricingModel: 'free' | 'paid' | 'subscription';
    price?: number;
    monthlyPrice?: number;

    // Status
    installed: boolean;
    updateAvailable: boolean;
}

export const AgentMarketplaceWidget: React.FC = () => {
    const [apps, setApps] = useState<MarketplaceApp[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'rating'>('popular');
    const [loading, setLoading] = useState(true);

    const categories = [
        'all',
        'procurement',
        'safety',
        'analytics',
        'productivity',
        'integration',
        'ai-tools'
    ];

    useEffect(() => {
        loadApps();
    }, [sortBy, selectedCategory]);

    const loadApps = async () => {
        setLoading(true);
        try {
            // Mock data - replace with real API call
            const mockApps: MarketplaceApp[] = [
                {
                    id: 'app-1',
                    name: 'Smart Bid Analyzer',
                    description: 'AI-powered bid comparison and scoring with vendor risk assessment',
                    publisher: 'CortexBuild Labs',
                    publisherVerified: true,
                    version: '2.1.0',
                    category: ['procurement', 'ai-tools'],
                    trustScore: 95,
                    installCount: 1240,
                    rating: 4.8,
                    reviewCount: 156,
                    lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                    securityAuditPassed: true,
                    permissions: ['read:bids', 'read:vendors', 'write:scores'],
                    pricingModel: 'subscription',
                    monthlyPrice: 29,
                    installed: false,
                    updateAvailable: false
                },
                {
                    id: 'app-2',
                    name: 'Safety Incident Tracker',
                    description: 'Real-time safety incident reporting with photo documentation',
                    publisher: 'SafetyFirst Inc',
                    publisherVerified: true,
                    version: '1.5.2',
                    category: ['safety'],
                    trustScore: 92,
                    installCount: 890,
                    rating: 4.9,
                    reviewCount: 203,
                    lastUpdated: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
                    securityAuditPassed: true,
                    permissions: ['read:incidents', 'write:incidents', 'upload:photos'],
                    pricingModel: 'paid',
                    price: 99,
                    installed: true,
                    updateAvailable: true
                },
                {
                    id: 'app-3',
                    name: 'Budget Forecaster Pro',
                    description: 'Predictive budget analytics with ML-powered cost projections',
                    publisher: 'DataWorks',
                    publisherVerified: false,
                    version: '1.0.0',
                    category: ['analytics'],
                    trustScore: 78,
                    installCount: 245,
                    rating: 4.3,
                    reviewCount: 42,
                    lastUpdated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    securityAuditPassed: false,
                    permissions: ['read:projects', 'read:expenses', 'read:budgets'],
                    pricingModel: 'free',
                    installed: false,
                    updateAvailable: false
                },
                {
                    id: 'app-4',
                    name: 'QuickBooks Connector',
                    description: 'Bi-directional sync with QuickBooks Online for seamless accounting',
                    publisher: 'CortexBuild',
                    publisherVerified: true,
                    version: '3.2.1',
                    category: ['integration', 'procurement'],
                    trustScore: 98,
                    installCount: 3450,
                    rating: 4.9,
                    reviewCount: 621,
                    lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                    securityAuditPassed: true,
                    permissions: ['read:invoices', 'write:invoices', 'read:vendors', 'oauth:quickbooks'],
                    pricingModel: 'subscription',
                    monthlyPrice: 19,
                    installed: true,
                    updateAvailable: false
                }
            ];

            // Apply filters
            let filtered = mockApps;

            if (selectedCategory !== 'all') {
                filtered = filtered.filter(app => app.category.includes(selectedCategory));
            }

            if (searchQuery) {
                filtered = filtered.filter(app =>
                    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    app.description.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }

            // Apply sorting
            filtered.sort((a, b) => {
                switch (sortBy) {
                    case 'popular':
                        return b.installCount - a.installCount;
                    case 'recent':
                        return b.lastUpdated.getTime() - a.lastUpdated.getTime();
                    case 'rating':
                        return b.rating - a.rating;
                    default:
                        return 0;
                }
            });

            setApps(filtered);
        } catch (error) {
            console.error('Failed to load marketplace apps:', error);
            toast.error('Failed to load marketplace');
        } finally {
            setLoading(false);
        }
    };

    const handleInstallApp = async (app: MarketplaceApp) => {
        if (app.installed) {
            toast.error('App is already installed');
            return;
        }

        toast.loading(`Installing ${app.name}...`);

        try {
            await axios.post('/api/marketplace/install', {
                appId: app.id,
                version: app.version
            });

            setApps(prev => prev.map(a =>
                a.id === app.id ? { ...a, installed: true } : a
            ));

            toast.dismiss();
            toast.success(`${app.name} installed successfully!`);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            toast.dismiss();
            toast.error(err.response?.data?.error || 'Installation failed');
        }
    };

    const handleUpdateApp = async (app: MarketplaceApp) => {
        toast.loading(`Updating ${app.name}...`);

        try {
            await axios.post('/api/marketplace/update', {
                appId: app.id
            });

            setApps(prev => prev.map(a =>
                a.id === app.id ? { ...a, updateAvailable: false } : a
            ));

            toast.dismiss();
            toast.success(`${app.name} updated successfully!`);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            toast.dismiss();
            toast.error(err.response?.data?.error || 'Update failed');
        }
    };

    const getTrustBadgeColor = (score: number): string => {
        if (score >= 90) return 'bg-green-100 text-green-700 border-green-300';
        if (score >= 75) return 'bg-blue-100 text-blue-700 border-blue-300';
        if (score >= 60) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
        return 'bg-red-100 text-red-700 border-red-300';
    };

    const actions: WidgetAction[] = [
        {
            icon: <Search size={16} />,
            label: 'Browse All',
            onClick: () => {
                setSelectedCategory('all');
                setSearchQuery('');
            },
            variant: 'secondary'
        }
    ];

    return (
        <BaseWidget
            id="agent-marketplace"
            title="Agent Marketplace"
            icon={<Store size={20} />}
            collapsible={true}
            expandable={true}
            defaultCollapsed={false}
            actions={actions}
            className="marketplace-widget"
        >
            <div className="space-y-4">
                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search apps..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        />
                    </div>

                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        aria-label="Filter by category"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>
                                {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                            </option>
                        ))}
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'popular' | 'recent' | 'rating')}
                        className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        aria-label="Sort by"
                    >
                        <option value="popular">Most Popular</option>
                        <option value="recent">Recently Updated</option>
                        <option value="rating">Highest Rated</option>
                    </select>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-3">
                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                        <Package className="mx-auto mb-1 text-slate-600" size={20} />
                        <div className="text-2xl font-bold text-slate-900">{apps.length}</div>
                        <div className="text-xs text-slate-600">Available</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                        <CheckCircle className="mx-auto mb-1 text-green-600" size={20} />
                        <div className="text-2xl font-bold text-green-900">
                            {apps.filter(a => a.installed).length}
                        </div>
                        <div className="text-xs text-green-600">Installed</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <Shield className="mx-auto mb-1 text-blue-600" size={20} />
                        <div className="text-2xl font-bold text-blue-900">
                            {apps.filter(a => a.securityAuditPassed).length}
                        </div>
                        <div className="text-xs text-blue-600">Verified</div>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-3 text-center">
                        <AlertTriangle className="mx-auto mb-1 text-amber-600" size={20} />
                        <div className="text-2xl font-bold text-amber-900">
                            {apps.filter(a => a.updateAvailable).length}
                        </div>
                        <div className="text-xs text-amber-600">Updates</div>
                    </div>
                </div>

                {/* Apps Grid */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin mx-auto mb-3 h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full"></div>
                        <p className="text-sm text-slate-600">Loading marketplace...</p>
                    </div>
                ) : apps.length === 0 ? (
                    <div className="text-center py-12">
                        <Package className="mx-auto mb-3 text-slate-300" size={48} />
                        <p className="text-slate-600">No apps found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {apps.map(app => (
                            <div
                                key={app.id}
                                className={`border rounded-lg p-4 hover:border-emerald-300 transition-all ${app.installed ? 'bg-emerald-50/30 border-emerald-200' : 'bg-white border-slate-200'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-semibold text-slate-900">{app.name}</h4>
                                            {app.publisherVerified && (
                                                <span title="Verified Publisher">
                                                    <CheckCircle className="text-blue-600" size={16} />
                                                </span>
                                            )}
                                            {app.updateAvailable && (
                                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                                                    Update Available
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-600 mb-2">{app.publisher}</p>
                                    </div>

                                    <div className={`px-2 py-1 rounded border text-xs font-medium ${getTrustBadgeColor(app.trustScore)}`}>
                                        <Shield size={12} className="inline mr-1" />
                                        {app.trustScore}
                                    </div>
                                </div>

                                <p className="text-sm text-slate-700 mb-3">{app.description}</p>

                                <div className="flex flex-wrap gap-1 mb-3">
                                    {app.category.map(cat => (
                                        <span key={cat} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                                            {cat}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between text-xs text-slate-600 mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center gap-1">
                                            <Star className="text-yellow-500" size={12} fill="currentColor" />
                                            {app.rating} ({app.reviewCount})
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Users size={12} />
                                            {app.installCount.toLocaleString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} />
                                            v{app.version}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                                    <div className="text-sm font-semibold text-slate-900">
                                        {app.pricingModel === 'free' && 'Free'}
                                        {app.pricingModel === 'paid' && `$${app.price}`}
                                        {app.pricingModel === 'subscription' && `$${app.monthlyPrice}/mo`}
                                    </div>

                                    {app.installed ? (
                                        app.updateAvailable ? (
                                            <button
                                                onClick={() => handleUpdateApp(app)}
                                                className="px-4 py-1.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
                                            >
                                                Update
                                            </button>
                                        ) : (
                                            <button
                                                disabled
                                                className="px-4 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium cursor-default"
                                            >
                                                <CheckCircle size={14} className="inline mr-1" />
                                                Installed
                                            </button>
                                        )
                                    ) : (
                                        <button
                                            onClick={() => handleInstallApp(app)}
                                            className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                                        >
                                            <Download size={14} className="inline mr-1" />
                                            Install
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </BaseWidget>
    );
};
