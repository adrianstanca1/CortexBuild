import React, { useState, useEffect } from 'react';
import {
    Package, Search, Grid3x3, List, Star, Clock, Settings,
    Play, Pause, Trash2, RefreshCw, ExternalLink, Zap,
    Brain, Gem, Sparkles, TrendingUp, Shield, Eye,
    FileText, DollarSign, Calendar, Wrench, Target
} from 'lucide-react';
import toast from 'react-hot-toast';

interface InstalledApp {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    version: string;
    code: string;
    config: any;
    installed_at: string;
    is_active: number;
    install_type: 'individual' | 'company';
}

interface MyApplicationsProps {
    isDarkMode?: boolean;
    currentUser?: any;
    onLaunchApp?: (appCode: string) => void;
}

const MyApplications: React.FC<MyApplicationsProps> = ({
    isDarkMode = true,
    currentUser,
    onLaunchApp
}) => {
    const [apps, setApps] = useState<InstalledApp[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [loading, setLoading] = useState(true);

    const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
    const cardClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
    const textClass = isDarkMode ? 'text-white' : 'text-gray-900';
    const mutedClass = isDarkMode ? 'text-gray-400' : 'text-gray-600';

    useEffect(() => {
        fetchMyApps();
    }, []);

    const fetchMyApps = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                // Show magic apps as demo when not logged in
                setApps(getMagicDemoApps());
                setLoading(false);
                return;
            }

            const response = await fetch('http://localhost:3001/api/my-applications', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success) {
                setApps(data.apps);
            } else {
                // Fallback to magic demo apps
                setApps(getMagicDemoApps());
            }
        } catch (error) {
            console.error('Error fetching apps:', error);
            // Show magic apps as demo
            setApps(getMagicDemoApps());
        } finally {
            setLoading(false);
        }
    };

    const getMagicDemoApps = (): InstalledApp[] => {
        return [
            {
                id: 'construction-oracle-magic',
                name: '🔮 AI Construction Oracle',
                description: 'Revolutionary AI Oracle that creates magic in construction. Predict the future with 99% accuracy.',
                icon: '🔮',
                category: 'AI & Magic',
                version: '2.0.0',
                code: 'construction-oracle',
                config: { magical: true, revolutionary: true },
                installed_at: new Date().toISOString(),
                is_active: 1,
                install_type: 'individual'
            },
            {
                id: 'n8n-procore-mega-builder',
                name: '🔥 N8N + Procore MEGA Builder',
                description: 'Revolutionary visual workflow builder with 60+ Procore APIs.',
                icon: '🔥',
                category: 'Workflow Automation',
                version: '2.0.0',
                code: 'n8n-procore-builder',
                config: { visual_builder: true },
                installed_at: new Date().toISOString(),
                is_active: 1,
                install_type: 'company'
            },
            {
                id: 'predictive-maintenance-ai',
                name: '⚡ Predictive Maintenance AI',
                description: 'Advanced AI that predicts equipment failures with 97% accuracy.',
                icon: '⚡',
                category: 'AI & Automation',
                version: '1.5.0',
                code: 'predictive-maintenance',
                config: { ai_powered: true },
                installed_at: new Date().toISOString(),
                is_active: 1,
                install_type: 'individual'
            }
        ];
    };

    const handleLaunchApp = (app: InstalledApp) => {
        if (onLaunchApp) {
            onLaunchApp(app.code);
            toast.success(`🚀 Launching ${app.name}...`);
        } else {
            toast.error('App launcher not available');
        }
    };

    const getMagicScore = (app: InstalledApp) => {
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
            case 'ai & magic': return <Gem className="w-5 h-5 text-purple-500" />;
            case 'workflow automation': return <Zap className="w-5 h-5 text-blue-500" />;
            case 'ai & automation': return <Brain className="w-5 h-5 text-green-500" />;
            case 'safety & compliance': return <Shield className="w-5 h-5 text-red-500" />;
            case 'quality control': return <Eye className="w-5 h-5 text-orange-500" />;
            case 'document management': return <FileText className="w-5 h-5 text-indigo-500" />;
            case 'financial management': return <DollarSign className="w-5 h-5 text-yellow-500" />;
            case 'project management': return <Calendar className="w-5 h-5 text-pink-500" />;
            case 'simulation & modeling': return <Target className="w-5 h-5 text-cyan-500" />;
            default: return <Package className="w-5 h-5 text-gray-500" />;
        }
    };

    const filteredApps = apps.filter(app => {
        const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = ['all', ...Array.from(new Set(apps.map(app => app.category)))];

    const renderAppCard = (app: InstalledApp) => {
        const isMagic = app.category.includes('Magic') || app.config?.magical;

        return (
            <div
                key={app.id}
                className={`${cardClass} border rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 ${isMagic ? 'border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-pink-900/20' : ''
                    }`}
            >
                {/* App Header */}
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
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {app.install_type === 'company' && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                Company
                            </span>
                        )}
                        {isMagic && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                Magic
                            </span>
                        )}
                    </div>
                </div>

                {/* Description */}
                <p className={`${mutedClass} text-sm mb-4 line-clamp-2`}>
                    {app.description}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between mb-4 text-sm">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span className={mutedClass}>
                                {new Date(app.installed_at).toLocaleDateString()}
                            </span>
                        </div>
                        {app.config?.accuracy && (
                            <div className="flex items-center space-x-1">
                                <TrendingUp className="w-4 h-4 text-green-500" />
                                <span className="text-green-500">{app.config.accuracy}% accuracy</span>
                            </div>
                        )}
                    </div>
                    <div className={`flex items-center space-x-1 ${app.is_active ? 'text-green-500' : 'text-red-500'}`}>
                        <div className={`w-2 h-2 rounded-full ${app.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-xs">{app.is_active ? 'Active' : 'Inactive'}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                    <button
                        type="button"
                        onClick={() => handleLaunchApp(app)}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 ${isMagic
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                    >
                        <Play className="w-4 h-4" />
                        <span>Launch</span>
                    </button>
                    <button
                        type="button"
                        className={`px-3 py-2 border rounded-lg transition-all hover:bg-gray-50 ${isDarkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300'
                            }`}
                    >
                        <Settings className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className={`h-screen flex flex-col ${bgClass}`}>
            {/* Header */}
            <div className="bg-white/10 backdrop-blur-sm border-b border-white/10 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className={`text-3xl font-bold ${textClass} flex items-center`}>
                            <Package className="w-8 h-8 mr-3 text-blue-500" />
                            My Applications
                            <Sparkles className="w-6 h-6 ml-2 text-yellow-400" />
                        </h1>
                        <p className={mutedClass}>Manage your installed construction apps</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-right mr-4">
                            <div className="text-2xl font-bold text-white">{apps.length}</div>
                            <div className="text-sm text-gray-400">Total Apps</div>
                        </div>
                        <div className="text-right mr-4">
                            <div className="text-2xl font-bold text-purple-400">
                                {apps.filter(app => app.category?.includes('Magic') || app.category?.includes('AI')).length}
                            </div>
                            <div className="text-sm text-gray-400">Magic Apps</div>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                type="button"
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                                    }`}
                            >
                                <Grid3x3 className="w-5 h-5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                                    }`}
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={fetchMyApps}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center space-x-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Magic Insights Section */}
                {apps.filter(app => app.category?.includes('Magic') || app.category?.includes('AI')).length > 0 && (
                    <div className="mt-4 mx-6 p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg border border-purple-500/30">
                        <div className="flex items-center space-x-2 mb-3">
                            <Sparkles className="w-5 h-5 text-yellow-400" />
                            <h3 className="text-lg font-semibold text-white">Magic Insights</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-yellow-400">
                                    {Math.round(apps.filter(app => app.category?.includes('Magic') || app.category?.includes('AI'))
                                        .reduce((sum, app) => sum + getMagicScore(app), 0) /
                                        Math.max(apps.filter(app => app.category?.includes('Magic') || app.category?.includes('AI')).length, 1))}%
                                </div>
                                <div className="text-sm text-gray-400">Average Magic Score</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-400">
                                    {apps.filter(app => getMagicScore(app) >= 95).length}
                                </div>
                                <div className="text-sm text-gray-400">Revolutionary Apps</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-pink-400">∞</div>
                                <div className="text-sm text-gray-400">Magical Possibilities</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white/5 backdrop-blur-sm border-b border-white/10 px-6 py-4">
                <div className="flex items-center space-x-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search applications..."
                            className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    >
                        {categories.map(category => (
                            <option key={category} value={category} className="bg-gray-800">
                                {category === 'all' ? 'All Categories' : category}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Apps Grid */}
            <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mx-auto mb-4" />
                            <p className={textClass}>Loading your magical applications...</p>
                        </div>
                    </div>
                ) : filteredApps.length === 0 ? (
                    <div className="text-center py-20">
                        <Package className="w-24 h-24 text-gray-400 mx-auto mb-6 opacity-50" />
                        <h3 className={`text-2xl font-bold ${textClass} mb-4`}>No Applications Found</h3>
                        <p className={mutedClass}>Install apps from the marketplace to get started</p>
                    </div>
                ) : (
                    <div className={`grid gap-6 ${viewMode === 'grid'
                        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                        : 'grid-cols-1'
                        }`}>
                        {filteredApps.map(renderAppCard)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyApplications;
