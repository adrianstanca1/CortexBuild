import React, { useState, useEffect, useMemo } from 'react';
import {
    Store, Plus, Search, Filter, Star, Download, Eye, CheckCircle,
    Clock, XCircle, DollarSign, TrendingUp, Users, Package,
    Upload, Edit2, Trash2, Award, BarChart3, Settings
} from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import toast from 'react-hot-toast';

interface MarketplaceApp {
    id: string;
    name: string;
    description: string;
    category: 'productivity' | 'communication' | 'analytics' | 'integration' | 'utility' | 'other';
    developer_id: string;
    developer_name?: string;
    version: string;
    price: number;
    pricing_model: 'free' | 'one_time' | 'subscription';
    status: 'pending' | 'approved' | 'rejected' | 'published' | 'suspended';
    icon_url?: string;
    screenshots?: string[];
    features?: string[];
    requirements?: string;
    install_count: number;
    rating: number;
    review_count: number;
    created_at: string;
    updated_at?: string;
}

interface AppInstallation {
    id: string;
    app_id: string;
    app_name?: string;
    company_id: string;
    company_name?: string;
    installed_by: string;
    installed_at: string;
    status: 'active' | 'inactive' | 'uninstalled';
}

interface AppReview {
    id: string;
    app_id: string;
    app_name?: string;
    user_id: string;
    user_name?: string;
    rating: number;
    comment?: string;
    created_at: string;
}

interface DeveloperEarning {
    id: string;
    developer_id: string;
    app_id: string;
    app_name?: string;
    amount: number;
    transaction_type: 'purchase' | 'subscription' | 'commission';
    status: 'pending' | 'paid' | 'cancelled';
    created_at: string;
}

interface MarketplaceManagementProps {
    currentUser?: any;
}

const MarketplaceManagement: React.FC<MarketplaceManagementProps> = ({ currentUser }) => {
    const [activeTab, setActiveTab] = useState<'apps' | 'installations' | 'reviews' | 'earnings'>('apps');
    const [apps, setApps] = useState<MarketplaceApp[]>([]);
    const [installations, setInstallations] = useState<AppInstallation[]>([]);
    const [reviews, setReviews] = useState<AppReview[]>([]);
    const [earnings, setEarnings] = useState<DeveloperEarning[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [selectedApp, setSelectedApp] = useState<MarketplaceApp | null>(null);
    const [showViewModal, setShowViewModal] = useState(false);

    // Form state for app submission
    const [appForm, setAppForm] = useState({
        name: '',
        description: '',
        category: 'productivity' as MarketplaceApp['category'],
        version: '1.0.0',
        price: 0,
        pricing_model: 'free' as MarketplaceApp['pricing_model'],
        features: '',
        requirements: ''
    });

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        try {
            setLoading(true);
            if (activeTab === 'apps') {
                await loadApps();
            } else if (activeTab === 'installations') {
                await loadInstallations();
            } else if (activeTab === 'reviews') {
                await loadReviews();
            } else {
                await loadEarnings();
            }
        } catch (error: any) {
            console.error('Error loading data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const loadApps = async () => {
        let query = supabase.from('marketplace_apps').select(`
            *,
            users(name)
        `);

        // Filter by developer if not admin
        if (currentUser?.role === 'developer') {
            query = query.eq('developer_id', currentUser.id);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        const formatted = (data || []).map((app: any) => ({
            ...app,
            developer_name: app.users?.name
        }));

        setApps(formatted);
    };

    const loadInstallations = async () => {
        const { data, error } = await supabase
            .from('app_installations')
            .select(`
                *,
                marketplace_apps(name),
                companies(name)
            `)
            .order('installed_at', { ascending: false });

        if (error) throw error;

        const formatted = (data || []).map((inst: any) => ({
            ...inst,
            app_name: inst.marketplace_apps?.name,
            company_name: inst.companies?.name
        }));

        setInstallations(formatted);
    };

    const loadReviews = async () => {
        const { data, error } = await supabase
            .from('app_reviews')
            .select(`
                *,
                marketplace_apps(name),
                users(name)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const formatted = (data || []).map((review: any) => ({
            ...review,
            app_name: review.marketplace_apps?.name,
            user_name: review.users?.name
        }));

        setReviews(formatted);
    };

    const loadEarnings = async () => {
        let query = supabase.from('developer_earnings').select(`
            *,
            marketplace_apps(name)
        `);

        // Filter by developer if not admin
        if (currentUser?.role === 'developer') {
            query = query.eq('developer_id', currentUser.id);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        const formatted = (data || []).map((earning: any) => ({
            ...earning,
            app_name: earning.marketplace_apps?.name
        }));

        setEarnings(formatted);
    };

    const handleSubmitApp = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const features = appForm.features.split('\n').filter(f => f.trim());

            const { error } = await supabase.from('marketplace_apps').insert({
                id: crypto.randomUUID(),
                name: appForm.name,
                description: appForm.description,
                category: appForm.category,
                developer_id: currentUser?.id,
                version: appForm.version,
                price: appForm.price,
                pricing_model: appForm.pricing_model,
                status: 'pending',
                features,
                requirements: appForm.requirements || null,
                install_count: 0,
                rating: 0,
                review_count: 0,
                created_at: new Date().toISOString()
            });

            if (error) throw error;

            toast.success('App submitted for review!');
            setShowSubmitModal(false);
            setAppForm({
                name: '',
                description: '',
                category: 'productivity',
                version: '1.0.0',
                price: 0,
                pricing_model: 'free',
                features: '',
                requirements: ''
            });
            loadApps();
        } catch (error: any) {
            console.error('Error submitting app:', error);
            toast.error('Failed to submit app');
        }
    };

    const handleApproveApp = async (appId: string) => {
        try {
            const { error } = await supabase
                .from('marketplace_apps')
                .update({ status: 'published', updated_at: new Date().toISOString() })
                .eq('id', appId);

            if (error) throw error;

            toast.success('App approved and published!');
            loadApps();
        } catch (error: any) {
            console.error('Error approving app:', error);
            toast.error('Failed to approve app');
        }
    };

    const handleRejectApp = async (appId: string) => {
        try {
            const { error } = await supabase
                .from('marketplace_apps')
                .update({ status: 'rejected', updated_at: new Date().toISOString() })
                .eq('id', appId);

            if (error) throw error;

            toast.success('App rejected');
            loadApps();
        } catch (error: any) {
            console.error('Error rejecting app:', error);
            toast.error('Failed to reject app');
        }
    };

    const handleInstallApp = async (appId: string) => {
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
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            published: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            suspended: 'bg-gray-100 text-gray-800',
            active: 'bg-green-100 text-green-800',
            inactive: 'bg-gray-100 text-gray-800',
            uninstalled: 'bg-red-100 text-red-800',
            paid: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return colors[status] || colors.pending;
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

    const stats = useMemo(() => {
        if (activeTab === 'apps') {
            return {
                total: apps.length,
                published: apps.filter(a => a.status === 'published').length,
                pending: apps.filter(a => a.status === 'pending').length,
                totalInstalls: apps.reduce((sum, a) => sum + a.install_count, 0)
            };
        } else if (activeTab === 'installations') {
            return {
                total: installations.length,
                active: installations.filter(i => i.status === 'active').length,
                inactive: installations.filter(i => i.status === 'inactive').length,
                uninstalled: installations.filter(i => i.status === 'uninstalled').length
            };
        } else if (activeTab === 'reviews') {
            return {
                total: reviews.length,
                avgRating: reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0,
                fiveStar: reviews.filter(r => r.rating === 5).length,
                oneStar: reviews.filter(r => r.rating === 1).length
            };
        } else {
            return {
                total: earnings.length,
                totalEarnings: earnings.filter(e => e.status === 'paid').reduce((sum, e) => sum + e.amount, 0),
                pending: earnings.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0),
                paid: earnings.filter(e => e.status === 'paid').length
            };
        }
    }, [activeTab, apps, installations, reviews, earnings]);

    const filteredData = useMemo(() => {
        let data: any[] = [];
        if (activeTab === 'apps') data = apps;
        else if (activeTab === 'installations') data = installations;
        else if (activeTab === 'reviews') data = reviews;
        else data = earnings;

        return data.filter(item => {
            const matchesSearch = !searchQuery ||
                item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.app_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.developer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.company_name?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
            const matchesCategory = filterCategory === 'all' || item.category === filterCategory;

            return matchesSearch && matchesStatus && matchesCategory;
        });
    }, [activeTab, apps, installations, reviews, earnings, searchQuery, filterStatus, filterCategory]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Marketplace Management</h1>
                        <p className="text-gray-600">Manage apps, installations, reviews, and earnings</p>
                    </div>
                    {(currentUser?.role === 'developer' || currentUser?.role === 'super_admin') && (
                        <button
                            type="button"
                            onClick={() => setShowSubmitModal(true)}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Submit App
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        type="button"
                        onClick={() => setActiveTab('apps')}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'apps'
                            ? 'bg-white text-blue-600 shadow-md'
                            : 'text-gray-600 hover:bg-white/50'
                            }`}
                    >
                        <Store className="w-5 h-5 inline mr-2" />
                        Apps
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('installations')}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'installations'
                            ? 'bg-white text-blue-600 shadow-md'
                            : 'text-gray-600 hover:bg-white/50'
                            }`}
                    >
                        <Download className="w-5 h-5 inline mr-2" />
                        Installations
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('reviews')}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'reviews'
                            ? 'bg-white text-blue-600 shadow-md'
                            : 'text-gray-600 hover:bg-white/50'
                            }`}
                    >
                        <Star className="w-5 h-5 inline mr-2" />
                        Reviews
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('earnings')}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'earnings'
                            ? 'bg-white text-blue-600 shadow-md'
                            : 'text-gray-600 hover:bg-white/50'
                            }`}
                    >
                        <DollarSign className="w-5 h-5 inline mr-2" />
                        Earnings
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {activeTab === 'apps' && (
                        <>
                            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Apps</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                    </div>
                                    <Package className="w-8 h-8 text-blue-600" />
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Published</p>
                                        <p className="text-2xl font-bold text-green-600">{stats.published}</p>
                                    </div>
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Pending Review</p>
                                        <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                                    </div>
                                    <Clock className="w-8 h-8 text-yellow-600" />
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Installs</p>
                                        <p className="text-2xl font-bold text-blue-600">{stats.totalInstalls}</p>
                                    </div>
                                    <Download className="w-8 h-8 text-blue-600" />
                                </div>
                            </div>
                        </>
                    )}
                    {activeTab === 'installations' && (
                        <>
                            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Installations</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                    </div>
                                    <Download className="w-8 h-8 text-blue-600" />
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Active</p>
                                        <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                                    </div>
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Inactive</p>
                                        <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
                                    </div>
                                    <Clock className="w-8 h-8 text-gray-600" />
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Uninstalled</p>
                                        <p className="text-2xl font-bold text-red-600">{stats.uninstalled}</p>
                                    </div>
                                    <XCircle className="w-8 h-8 text-red-600" />
                                </div>
                            </div>
                        </>
                    )}
                    {activeTab === 'reviews' && (
                        <>
                            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Reviews</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                    </div>
                                    <Star className="w-8 h-8 text-blue-600" />
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Avg Rating</p>
                                        <p className="text-2xl font-bold text-yellow-600">{stats.avgRating.toFixed(1)}</p>
                                    </div>
                                    <Award className="w-8 h-8 text-yellow-600" />
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">5-Star Reviews</p>
                                        <p className="text-2xl font-bold text-green-600">{stats.fiveStar}</p>
                                    </div>
                                    <Star className="w-8 h-8 text-green-600" />
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">1-Star Reviews</p>
                                        <p className="text-2xl font-bold text-red-600">{stats.oneStar}</p>
                                    </div>
                                    <Star className="w-8 h-8 text-red-600" />
                                </div>
                            </div>
                        </>
                    )}
                    {activeTab === 'earnings' && (
                        <>
                            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Transactions</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                    </div>
                                    <BarChart3 className="w-8 h-8 text-blue-600" />
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Earnings</p>
                                        <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalEarnings)}</p>
                                    </div>
                                    <DollarSign className="w-8 h-8 text-green-600" />
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Pending</p>
                                        <p className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.pending)}</p>
                                    </div>
                                    <Clock className="w-8 h-8 text-yellow-600" />
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Paid Transactions</p>
                                        <p className="text-2xl font-bold text-blue-600">{stats.paid}</p>
                                    </div>
                                    <CheckCircle className="w-8 h-8 text-blue-600" />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Search and Filters */}
            <div className="mb-6">
                <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100 flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {activeTab === 'apps' && (
                        <>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                aria-label="Filter by status"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="published">Published</option>
                                <option value="rejected">Rejected</option>
                                <option value="suspended">Suspended</option>
                            </select>
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                aria-label="Filter by category"
                            >
                                <option value="all">All Categories</option>
                                <option value="productivity">Productivity</option>
                                <option value="communication">Communication</option>
                                <option value="analytics">Analytics</option>
                                <option value="integration">Integration</option>
                                <option value="utility">Utility</option>
                                <option value="other">Other</option>
                            </select>
                        </>
                    )}

                    {(activeTab === 'installations' || activeTab === 'earnings') && (
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            aria-label="Filter by status"
                        >
                            <option value="all">All Status</option>
                            {activeTab === 'installations' && (
                                <>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="uninstalled">Uninstalled</option>
                                </>
                            )}
                            {activeTab === 'earnings' && (
                                <>
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                    <option value="cancelled">Cancelled</option>
                                </>
                            )}
                        </select>
                    )}
                </div>
            </div>

            {/* Data Display */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : filteredData.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center shadow-md">
                    <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No {activeTab} found</h3>
                    <p className="text-gray-600 mb-6">Get started by submitting your first app</p>
                    {(currentUser?.role === 'developer' || currentUser?.role === 'super_admin') && (
                        <button
                            type="button"
                            onClick={() => setShowSubmitModal(true)}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
                        >
                            Submit App
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeTab === 'apps' && filteredData.map((app: MarketplaceApp) => (
                        <div
                            key={app.id}
                            className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <Package className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{app.name}</h3>
                                        <p className="text-sm text-gray-500">v{app.version}</p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{app.description}</p>

                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                                    {app.status.toUpperCase()}
                                </span>
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
                                {currentUser?.role === 'super_admin' && app.status === 'pending' && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => handleApproveApp(app.id)}
                                            className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleRejectApp(app.id)}
                                            className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}
                                {app.status === 'published' && currentUser?.role !== 'developer' && (
                                    <button
                                        type="button"
                                        onClick={() => handleInstallApp(app.id)}
                                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                    >
                                        Install
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedApp(app);
                                        setShowViewModal(true);
                                    }}
                                    className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="View details"
                                >
                                    <Eye className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MarketplaceManagement;

