import React, { useState, useEffect, useMemo } from 'react';
import {
    DollarSign, TrendingUp, Download, Star, Package, Users,
    Calendar, BarChart3, Award, Clock, CheckCircle, XCircle,
    ArrowUp, ArrowDown, Eye, MessageSquare, RefreshCw
} from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import toast from 'react-hot-toast';

interface DeveloperApp {
    id: string;
    name: string;
    status: string;
    install_count: number;
    rating: number;
    review_count: number;
    price: number;
    pricing_model: string;
    created_at: string;
}

interface Earning {
    id: string;
    app_id: string;
    app_name?: string;
    amount: number;
    transaction_type: string;
    status: string;
    created_at: string;
    paid_at?: string;
}

interface Installation {
    id: string;
    app_id: string;
    installed_at: string;
    status: string;
}

interface Review {
    id: string;
    app_id: string;
    rating: number;
    comment?: string;
    user_name?: string;
    created_at: string;
}

interface PayoutRequest {
    id: string;
    developer_id: string;
    amount: number;
    status: 'pending' | 'approved' | 'rejected' | 'paid';
    requested_at: string;
    processed_at?: string;
}

interface DeveloperDashboardProps {
    currentUser?: any;
}

const DeveloperDashboard: React.FC<DeveloperDashboardProps> = ({ currentUser }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'earnings' | 'apps' | 'reviews' | 'payouts'>('overview');
    const [apps, setApps] = useState<DeveloperApp[]>([]);
    const [earnings, setEarnings] = useState<Earning[]>([]);
    const [installations, setInstallations] = useState<Installation[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('30');
    const [showPayoutModal, setShowPayoutModal] = useState(false);
    const [payoutAmount, setPayoutAmount] = useState('');

    useEffect(() => {
        loadData();
    }, [currentUser]);

    const loadData = async () => {
        if (!currentUser?.id) return;

        try {
            setLoading(true);
            await Promise.all([
                loadApps(),
                loadEarnings(),
                loadInstallations(),
                loadReviews(),
                loadPayouts()
            ]);
        } catch (error: any) {
            console.error('Error loading data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const loadApps = async () => {
        const { data, error } = await supabase
            .from('marketplace_apps')
            .select('*')
            .eq('developer_id', currentUser.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        setApps(data || []);
    };

    const loadEarnings = async () => {
        const { data, error } = await supabase
            .from('developer_earnings')
            .select(`
                *,
                marketplace_apps(name)
            `)
            .eq('developer_id', currentUser.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const formatted = (data || []).map((earning: any) => ({
            ...earning,
            app_name: earning.marketplace_apps?.name
        }));

        setEarnings(formatted);
    };

    const loadInstallations = async () => {
        const appIds = apps.map(a => a.id);
        if (appIds.length === 0) return;

        const { data, error } = await supabase
            .from('app_installations')
            .select('*')
            .in('app_id', appIds)
            .order('installed_at', { ascending: false });

        if (error) throw error;
        setInstallations(data || []);
    };

    const loadReviews = async () => {
        const appIds = apps.map(a => a.id);
        if (appIds.length === 0) return;

        const { data, error } = await supabase
            .from('app_reviews')
            .select(`
                *,
                users(name)
            `)
            .in('app_id', appIds)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const formatted = (data || []).map((review: any) => ({
            ...review,
            user_name: review.users?.name
        }));

        setReviews(formatted);
    };

    const loadPayouts = async () => {
        const { data, error } = await supabase
            .from('payout_requests')
            .select('*')
            .eq('developer_id', currentUser.id)
            .order('requested_at', { ascending: false });

        if (error) {
            console.error('Error loading payouts:', error);
            return;
        }
        setPayouts(data || []);
    };

    const handleRequestPayout = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(payoutAmount);

        if (isNaN(amount) || amount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        if (amount > metrics.availableBalance) {
            toast.error('Insufficient balance');
            return;
        }

        try {
            const { error } = await supabase.from('payout_requests').insert({
                id: crypto.randomUUID(),
                developer_id: currentUser.id,
                amount,
                status: 'pending',
                requested_at: new Date().toISOString()
            });

            if (error) throw error;

            toast.success('Payout request submitted!');
            setShowPayoutModal(false);
            setPayoutAmount('');
            loadPayouts();
        } catch (error: any) {
            console.error('Error requesting payout:', error);
            toast.error('Failed to request payout');
        }
    };

    const metrics = useMemo(() => {
        const daysAgo = parseInt(dateRange);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysAgo);

        // Previous period for comparison
        const prevStartDate = new Date(startDate);
        prevStartDate.setDate(prevStartDate.getDate() - daysAgo);

        // Current period data
        const currentEarnings = earnings.filter(e => new Date(e.created_at) >= startDate);
        const currentInstalls = installations.filter(i => new Date(i.installed_at) >= startDate);
        const currentReviews = reviews.filter(r => new Date(r.created_at) >= startDate);

        // Previous period data
        const prevEarnings = earnings.filter(e => {
            const date = new Date(e.created_at);
            return date >= prevStartDate && date < startDate;
        });
        const prevInstalls = installations.filter(i => {
            const date = new Date(i.installed_at);
            return date >= prevStartDate && date < startDate;
        });

        // Calculate totals
        const totalRevenue = currentEarnings
            .filter(e => e.status === 'paid')
            .reduce((sum, e) => sum + e.amount, 0);

        const prevRevenue = prevEarnings
            .filter(e => e.status === 'paid')
            .reduce((sum, e) => sum + e.amount, 0);

        const pendingEarnings = earnings
            .filter(e => e.status === 'pending')
            .reduce((sum, e) => sum + e.amount, 0);

        const totalPaidOut = earnings
            .filter(e => e.status === 'paid')
            .reduce((sum, e) => sum + e.amount, 0);

        const availableBalance = pendingEarnings;

        // Calculate changes
        const revenueChange = prevRevenue > 0
            ? ((totalRevenue - prevRevenue) / prevRevenue) * 100
            : totalRevenue > 0 ? 100 : 0;

        const installsChange = prevInstalls.length > 0
            ? ((currentInstalls.length - prevInstalls.length) / prevInstalls.length) * 100
            : currentInstalls.length > 0 ? 100 : 0;

        const avgRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

        return {
            totalRevenue,
            revenueChange,
            totalInstalls: currentInstalls.length,
            installsChange,
            totalReviews: currentReviews.length,
            avgRating,
            totalApps: apps.length,
            publishedApps: apps.filter(a => a.status === 'published').length,
            pendingEarnings,
            availableBalance,
            totalPaidOut
        };
    }, [apps, earnings, installations, reviews, dateRange]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatPercentage = (value: number) => {
        return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
            />
        ));
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-blue-100 text-blue-800',
            paid: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            published: 'bg-green-100 text-green-800',
            active: 'bg-green-100 text-green-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Developer Dashboard</h1>
                        <p className="text-gray-600">Track your app performance and earnings</p>
                    </div>
                    <div className="flex gap-3">
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            aria-label="Select date range"
                        >
                            <option value="7">Last 7 days</option>
                            <option value="30">Last 30 days</option>
                            <option value="90">Last 90 days</option>
                            <option value="365">Last year</option>
                        </select>
                        <button
                            type="button"
                            onClick={loadData}
                            className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        type="button"
                        onClick={() => setActiveTab('overview')}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'overview'
                            ? 'bg-white text-blue-600 shadow-md'
                            : 'text-gray-600 hover:bg-white/50'
                            }`}
                    >
                        <BarChart3 className="w-5 h-5 inline mr-2" />
                        Overview
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
                    <button
                        type="button"
                        onClick={() => setActiveTab('apps')}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'apps'
                            ? 'bg-white text-blue-600 shadow-md'
                            : 'text-gray-600 hover:bg-white/50'
                            }`}
                    >
                        <Package className="w-5 h-5 inline mr-2" />
                        Apps
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
                        onClick={() => setActiveTab('payouts')}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'payouts'
                            ? 'bg-white text-blue-600 shadow-md'
                            : 'text-gray-600 hover:bg-white/50'
                            }`}
                    >
                        <CheckCircle className="w-5 h-5 inline mr-2" />
                        Payouts
                    </button>
                </div>

                {/* Overview Stats */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-600">Total Revenue</p>
                                <DollarSign className="w-5 h-5 text-green-600" />
                            </div>
                            <p className="text-3xl font-bold text-gray-900 mb-1">
                                {formatCurrency(metrics.totalRevenue)}
                            </p>
                            <div className="flex items-center gap-1 text-sm">
                                {metrics.revenueChange >= 0 ? (
                                    <ArrowUp className="w-4 h-4 text-green-600" />
                                ) : (
                                    <ArrowDown className="w-4 h-4 text-red-600" />
                                )}
                                <span className={metrics.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                                    {formatPercentage(metrics.revenueChange)}
                                </span>
                                <span className="text-gray-500">vs last period</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-600">Total Installs</p>
                                <Download className="w-5 h-5 text-blue-600" />
                            </div>
                            <p className="text-3xl font-bold text-gray-900 mb-1">
                                {metrics.totalInstalls}
                            </p>
                            <div className="flex items-center gap-1 text-sm">
                                {metrics.installsChange >= 0 ? (
                                    <ArrowUp className="w-4 h-4 text-green-600" />
                                ) : (
                                    <ArrowDown className="w-4 h-4 text-red-600" />
                                )}
                                <span className={metrics.installsChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                                    {formatPercentage(metrics.installsChange)}
                                </span>
                                <span className="text-gray-500">vs last period</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-600">Average Rating</p>
                                <Star className="w-5 h-5 text-yellow-600" />
                            </div>
                            <p className="text-3xl font-bold text-gray-900 mb-1">
                                {metrics.avgRating.toFixed(1)}
                            </p>
                            <div className="flex items-center gap-1">
                                {renderStars(Math.round(metrics.avgRating))}
                                <span className="text-sm text-gray-500 ml-1">({metrics.totalReviews})</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-600">Published Apps</p>
                                <Package className="w-5 h-5 text-purple-600" />
                            </div>
                            <p className="text-3xl font-bold text-gray-900 mb-1">
                                {metrics.publishedApps}
                            </p>
                            <p className="text-sm text-gray-500">
                                of {metrics.totalApps} total apps
                            </p>
                        </div>
                    </div>
                )}

                {/* Earnings Stats */}
                {activeTab === 'earnings' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-600">Available Balance</p>
                                <DollarSign className="w-5 h-5 text-green-600" />
                            </div>
                            <p className="text-3xl font-bold text-green-600 mb-3">
                                {formatCurrency(metrics.availableBalance)}
                            </p>
                            <button
                                type="button"
                                onClick={() => setShowPayoutModal(true)}
                                disabled={metrics.availableBalance <= 0}
                                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                Request Payout
                            </button>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-600">Pending Earnings</p>
                                <Clock className="w-5 h-5 text-yellow-600" />
                            </div>
                            <p className="text-3xl font-bold text-gray-900">
                                {formatCurrency(metrics.pendingEarnings)}
                            </p>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-600">Total Paid Out</p>
                                <CheckCircle className="w-5 h-5 text-blue-600" />
                            </div>
                            <p className="text-3xl font-bold text-gray-900">
                                {formatCurrency(metrics.totalPaidOut)}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <>
                    {/* Overview Tab Content */}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Recent Installations */}
                            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-blue-600" />
                                    Installation Trends
                                </h3>
                                <div className="space-y-3">
                                    {installations.slice(0, 5).map((install) => {
                                        const app = apps.find(a => a.id === install.app_id);
                                        return (
                                            <div key={install.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-gray-900">{app?.name || 'Unknown App'}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {new Date(install.installed_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(install.status)}`}>
                                                    {install.status}
                                                </span>
                                            </div>
                                        );
                                    })}
                                    {installations.length === 0 && (
                                        <p className="text-center text-gray-500 py-4">No installations yet</p>
                                    )}
                                </div>
                            </div>

                            {/* Top Performing Apps */}
                            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Award className="w-5 h-5 text-yellow-600" />
                                    Top Performing Apps
                                </h3>
                                <div className="space-y-3">
                                    {apps
                                        .sort((a, b) => b.install_count - a.install_count)
                                        .slice(0, 5)
                                        .map((app) => (
                                            <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">{app.name}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className="flex items-center gap-1">
                                                            {renderStars(Math.round(app.rating))}
                                                        </div>
                                                        <span className="text-sm text-gray-500">
                                                            {app.install_count} installs
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    {apps.length === 0 && (
                                        <p className="text-center text-gray-500 py-4">No apps yet</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Earnings Tab Content */}
                    {activeTab === 'earnings' && (
                        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">App</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {earnings.map((earning) => (
                                            <tr key={earning.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {new Date(earning.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {earning.app_name || 'Unknown'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {earning.transaction_type}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                                    {formatCurrency(earning.amount)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(earning.status)}`}>
                                                        {earning.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {earnings.length === 0 && (
                                    <div className="text-center py-12">
                                        <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No earnings yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Apps Tab Content */}
                    {activeTab === 'apps' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {apps.map((app) => (
                                <div key={app.id} className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-1">{app.name}</h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                                                {app.status}
                                            </span>
                                        </div>
                                        <Package className="w-6 h-6 text-blue-600" />
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Installs</span>
                                            <span className="font-medium text-gray-900">{app.install_count}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Rating</span>
                                            <div className="flex items-center gap-1">
                                                <span className="font-medium text-gray-900">{app.rating.toFixed(1)}</span>
                                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Reviews</span>
                                            <span className="font-medium text-gray-900">{app.review_count}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Price</span>
                                            <span className="font-medium text-gray-900">
                                                {app.pricing_model === 'free' ? 'FREE' : formatCurrency(app.price)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {apps.length === 0 && (
                                <div className="col-span-full text-center py-12">
                                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">No apps yet</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Reviews Tab Content */}
                    {activeTab === 'reviews' && (
                        <div className="space-y-4">
                            {reviews.map((review) => {
                                const app = apps.find(a => a.id === review.app_id);
                                return (
                                    <div key={review.id} className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <p className="font-medium text-gray-900">{app?.name || 'Unknown App'}</p>
                                                <p className="text-sm text-gray-500">{review.user_name || 'Anonymous'}</p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {renderStars(review.rating)}
                                            </div>
                                        </div>
                                        {review.comment && (
                                            <p className="text-gray-700 mb-2">{review.comment}</p>
                                        )}
                                        <p className="text-sm text-gray-500">
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                );
                            })}
                            {reviews.length === 0 && (
                                <div className="bg-white rounded-xl p-12 text-center shadow-md">
                                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">No reviews yet</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Payouts Tab Content */}
                    {activeTab === 'payouts' && (
                        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Processed</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {payouts.map((payout) => (
                                            <tr key={payout.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {new Date(payout.requested_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                                    {formatCurrency(payout.amount)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payout.status)}`}>
                                                        {payout.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {payout.processed_at ? new Date(payout.processed_at).toLocaleDateString() : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {payouts.length === 0 && (
                                    <div className="text-center py-12">
                                        <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No payout requests yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Payout Request Modal */}
            {showPayoutModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Request Payout</h3>
                        <form onSubmit={handleRequestPayout}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Amount
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={payoutAmount}
                                    onChange={(e) => setPayoutAmount(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="0.00"
                                    required
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Available: {formatCurrency(metrics.availableBalance)}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPayoutModal(false);
                                        setPayoutAmount('');
                                    }}
                                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeveloperDashboard;

