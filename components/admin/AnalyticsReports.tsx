import React, { useState, useEffect, useMemo } from 'react';
import {
    BarChart3, TrendingUp, Users, Building2, DollarSign,
    Download, RefreshCw, Activity, Target,
    CheckCircle, Clock, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import toast from 'react-hot-toast';

interface AnalyticsReportsProps {
    currentUser?: any;
}

interface MetricCard {
    title: string;
    value: string | number;
    change: number;
    trend: 'up' | 'down';
    icon: React.ComponentType<any>;
    color: string;
}

const AnalyticsReports: React.FC<AnalyticsReportsProps> = ({ currentUser: _currentUser }) => {
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('30'); // days
    const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'projects' | 'users'>('overview');

    // Data states
    const [users, setUsers] = useState<any[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [payments, setPayments] = useState<any[]>([]);
    const [tasks, setTasks] = useState<any[]>([]);

    useEffect(() => {
        loadAllData();
    }, [dateRange]);

    const loadAllData = async () => {
        try {
            setLoading(true);
            const daysAgo = parseInt(dateRange);
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - daysAgo);

            // Load all data in parallel
            const [
                usersData,
                companiesData,
                projectsData,
                subscriptionsData,
                invoicesData,
                paymentsData,
                tasksData
            ] = await Promise.all([
                supabase.from('users').select('*'),
                supabase.from('companies').select('*'),
                supabase.from('projects').select('*'),
                supabase.from('subscriptions').select('*'),
                supabase.from('invoices').select('*'),
                supabase.from('payments').select('*'),
                supabase.from('tasks').select('*')
            ]);

            setUsers(usersData.data || []);
            setCompanies(companiesData.data || []);
            setProjects(projectsData.data || []);
            setSubscriptions(subscriptionsData.data || []);
            setInvoices(invoicesData.data || []);
            setPayments(paymentsData.data || []);
            setTasks(tasksData.data || []);
        } catch (error: any) {
            console.error('Error loading analytics data:', error);
            toast.error('Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatPercentage = (value: number) => {
        return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
    };

    // Calculate metrics
    const metrics = useMemo(() => {
        const daysAgo = parseInt(dateRange);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysAgo);

        // Previous period for comparison
        const prevStartDate = new Date(startDate);
        prevStartDate.setDate(prevStartDate.getDate() - daysAgo);

        // Current period data
        const currentUsers = users.filter(u => new Date(u.created_at) >= startDate);
        const currentCompanies = companies.filter(c => new Date(c.created_at) >= startDate);
        const currentProjects = projects.filter(p => new Date(p.created_at) >= startDate);
        const currentRevenue = payments
            .filter(p => new Date(p.payment_date) >= startDate && p.status === 'completed')
            .reduce((sum, p) => sum + (p.amount || 0), 0);

        // Previous period data
        const prevUsers = users.filter(u => {
            const date = new Date(u.created_at);
            return date >= prevStartDate && date < startDate;
        });
        const prevCompanies = companies.filter(c => {
            const date = new Date(c.created_at);
            return date >= prevStartDate && date < startDate;
        });
        const prevProjects = projects.filter(p => {
            const date = new Date(p.created_at);
            return date >= prevStartDate && date < startDate;
        });
        const prevRevenue = payments
            .filter(p => {
                const date = new Date(p.payment_date);
                return date >= prevStartDate && date < startDate && p.status === 'completed';
            })
            .reduce((sum, p) => sum + (p.amount || 0), 0);

        // Calculate changes
        const userChange = prevUsers.length > 0
            ? ((currentUsers.length - prevUsers.length) / prevUsers.length) * 100
            : 100;
        const companyChange = prevCompanies.length > 0
            ? ((currentCompanies.length - prevCompanies.length) / prevCompanies.length) * 100
            : 100;
        const projectChange = prevProjects.length > 0
            ? ((currentProjects.length - prevProjects.length) / prevProjects.length) * 100
            : 100;
        const revenueChange = prevRevenue > 0
            ? ((currentRevenue - prevRevenue) / prevRevenue) * 100
            : 100;

        return {
            totalUsers: users.length,
            newUsers: currentUsers.length,
            userChange,
            totalCompanies: companies.length,
            newCompanies: currentCompanies.length,
            companyChange,
            totalProjects: projects.length,
            activeProjects: projects.filter(p => p.status === 'active').length,
            projectChange,
            totalRevenue: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + (p.amount || 0), 0),
            periodRevenue: currentRevenue,
            revenueChange,
            activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
            pendingInvoices: invoices.filter(i => i.status === 'pending').length,
            completedTasks: tasks.filter(t => t.status === 'completed').length,
            totalTasks: tasks.length
        };
    }, [users, companies, projects, subscriptions, invoices, payments, tasks, dateRange]);

    const overviewMetrics: MetricCard[] = [
        {
            title: 'Total Users',
            value: metrics.totalUsers,
            change: metrics.userChange,
            trend: metrics.userChange >= 0 ? 'up' : 'down',
            icon: Users,
            color: 'blue'
        },
        {
            title: 'Total Companies',
            value: metrics.totalCompanies,
            change: metrics.companyChange,
            trend: metrics.companyChange >= 0 ? 'up' : 'down',
            icon: Building2,
            color: 'purple'
        },
        {
            title: 'Active Projects',
            value: metrics.activeProjects,
            change: metrics.projectChange,
            trend: metrics.projectChange >= 0 ? 'up' : 'down',
            icon: Target,
            color: 'green'
        },
        {
            title: 'Total Revenue',
            value: formatCurrency(metrics.totalRevenue),
            change: metrics.revenueChange,
            trend: metrics.revenueChange >= 0 ? 'up' : 'down',
            icon: DollarSign,
            color: 'orange'
        }
    ];

    const revenueMetrics: MetricCard[] = [
        {
            title: 'Period Revenue',
            value: formatCurrency(metrics.periodRevenue),
            change: metrics.revenueChange,
            trend: metrics.revenueChange >= 0 ? 'up' : 'down',
            icon: DollarSign,
            color: 'blue'
        },
        {
            title: 'Active Subscriptions',
            value: metrics.activeSubscriptions,
            change: 0,
            trend: 'up',
            icon: CheckCircle,
            color: 'green'
        },
        {
            title: 'Pending Invoices',
            value: metrics.pendingInvoices,
            change: 0,
            trend: 'down',
            icon: Clock,
            color: 'yellow'
        },
        {
            title: 'Avg. Transaction',
            value: formatCurrency(payments.length > 0 ? metrics.totalRevenue / payments.length : 0),
            change: 0,
            trend: 'up',
            icon: Activity,
            color: 'purple'
        }
    ];

    const projectMetrics: MetricCard[] = [
        {
            title: 'Total Projects',
            value: metrics.totalProjects,
            change: metrics.projectChange,
            trend: metrics.projectChange >= 0 ? 'up' : 'down',
            icon: Target,
            color: 'blue'
        },
        {
            title: 'Active Projects',
            value: metrics.activeProjects,
            change: 0,
            trend: 'up',
            icon: Activity,
            color: 'green'
        },
        {
            title: 'Completed Tasks',
            value: metrics.completedTasks,
            change: 0,
            trend: 'up',
            icon: CheckCircle,
            color: 'purple'
        },
        {
            title: 'Task Completion',
            value: `${metrics.totalTasks > 0 ? ((metrics.completedTasks / metrics.totalTasks) * 100).toFixed(1) : 0}%`,
            change: 0,
            trend: 'up',
            icon: TrendingUp,
            color: 'orange'
        }
    ];

    const userMetrics: MetricCard[] = [
        {
            title: 'Total Users',
            value: metrics.totalUsers,
            change: metrics.userChange,
            trend: metrics.userChange >= 0 ? 'up' : 'down',
            icon: Users,
            color: 'blue'
        },
        {
            title: 'New Users',
            value: metrics.newUsers,
            change: metrics.userChange,
            trend: metrics.userChange >= 0 ? 'up' : 'down',
            icon: TrendingUp,
            color: 'green'
        },
        {
            title: 'Companies',
            value: metrics.totalCompanies,
            change: metrics.companyChange,
            trend: metrics.companyChange >= 0 ? 'up' : 'down',
            icon: Building2,
            color: 'purple'
        },
        {
            title: 'Avg. Users/Company',
            value: metrics.totalCompanies > 0 ? (metrics.totalUsers / metrics.totalCompanies).toFixed(1) : 0,
            change: 0,
            trend: 'up',
            icon: Activity,
            color: 'orange'
        }
    ];

    const getMetricsForTab = () => {
        switch (activeTab) {
            case 'revenue': return revenueMetrics;
            case 'projects': return projectMetrics;
            case 'users': return userMetrics;
            default: return overviewMetrics;
        }
    };

    const getColorClasses = (color: string) => {
        const colors: Record<string, { bg: string; text: string; icon: string }> = {
            blue: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-600' },
            green: { bg: 'bg-green-50', text: 'text-green-600', icon: 'text-green-600' },
            purple: { bg: 'bg-purple-50', text: 'text-purple-600', icon: 'text-purple-600' },
            orange: { bg: 'bg-orange-50', text: 'text-orange-600', icon: 'text-orange-600' },
            yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', icon: 'text-yellow-600' }
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Analytics & Reports</h1>
                        <p className="text-gray-600">Business insights and performance metrics</p>
                    </div>
                    <div className="flex items-center gap-4">
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
                            onClick={loadAllData}
                            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Refresh
                        </button>
                        <button
                            type="button"
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg flex items-center gap-2"
                        >
                            <Download className="w-5 h-5" />
                            Export Report
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
                        onClick={() => setActiveTab('revenue')}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'revenue'
                            ? 'bg-white text-blue-600 shadow-md'
                            : 'text-gray-600 hover:bg-white/50'
                            }`}
                    >
                        <DollarSign className="w-5 h-5 inline mr-2" />
                        Revenue
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('projects')}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'projects'
                            ? 'bg-white text-blue-600 shadow-md'
                            : 'text-gray-600 hover:bg-white/50'
                            }`}
                    >
                        <Target className="w-5 h-5 inline mr-2" />
                        Projects
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('users')}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'users'
                            ? 'bg-white text-blue-600 shadow-md'
                            : 'text-gray-600 hover:bg-white/50'
                            }`}
                    >
                        <Users className="w-5 h-5 inline mr-2" />
                        Users
                    </button>
                </div>
            </div>

            {/* Metrics Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {getMetricsForTab().map((metric, index) => {
                            const Icon = metric.icon;
                            const colors = getColorClasses(metric.color);
                            return (
                                <div key={index} className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-3 ${colors.bg} rounded-lg`}>
                                            <Icon className={`w-6 h-6 ${colors.icon}`} />
                                        </div>
                                        <div className={`flex items-center gap-1 text-sm font-medium ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                            {metric.trend === 'up' ? (
                                                <ArrowUpRight className="w-4 h-4" />
                                            ) : (
                                                <ArrowDownRight className="w-4 h-4" />
                                            )}
                                            {formatPercentage(metric.change)}
                                        </div>
                                    </div>
                                    <h3 className="text-sm text-gray-600 mb-1">{metric.title}</h3>
                                    <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Data Tables */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Activity */}
                        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                                <Activity className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="space-y-4">
                                {projects.slice(0, 5).map((project, idx) => (
                                    <div key={idx} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 rounded-lg">
                                                <Target className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{project.name}</p>
                                                <p className="text-sm text-gray-500">{project.location}</p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${project.status === 'active' ? 'bg-green-100 text-green-800' :
                                                project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-gray-100 text-gray-800'
                                            }`}>
                                            {project.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Top Companies */}
                        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Top Companies</h2>
                                <Building2 className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="space-y-4">
                                {companies.slice(0, 5).map((company, idx) => (
                                    <div key={idx} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-purple-50 rounded-lg">
                                                <Building2 className="w-4 h-4 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{company.name}</p>
                                                <p className="text-sm text-gray-500">{company.industry || 'Construction'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-900">
                                                {projects.filter(p => p.company_id === company.id).length}
                                            </p>
                                            <p className="text-xs text-gray-500">projects</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Revenue Breakdown */}
                        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Revenue Breakdown</h2>
                                <DollarSign className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-50 rounded-lg">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                        </div>
                                        <span className="font-medium text-gray-900">Completed Payments</span>
                                    </div>
                                    <span className="font-bold text-green-600">
                                        {formatCurrency(payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + (p.amount || 0), 0))}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-yellow-50 rounded-lg">
                                            <Clock className="w-4 h-4 text-yellow-600" />
                                        </div>
                                        <span className="font-medium text-gray-900">Pending Invoices</span>
                                    </div>
                                    <span className="font-bold text-yellow-600">
                                        {formatCurrency(invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + (i.amount || 0), 0))}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 rounded-lg">
                                            <Activity className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <span className="font-medium text-gray-900">Active Subscriptions</span>
                                    </div>
                                    <span className="font-bold text-blue-600">
                                        {formatCurrency(subscriptions.filter(s => s.status === 'active').reduce((sum, s) => sum + (s.amount || 0), 0))}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Task Statistics */}
                        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Task Statistics</h2>
                                <CheckCircle className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-50 rounded-lg">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                        </div>
                                        <span className="font-medium text-gray-900">Completed</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-green-600">{tasks.filter(t => t.status === 'completed').length}</p>
                                        <p className="text-xs text-gray-500">
                                            {metrics.totalTasks > 0 ? ((tasks.filter(t => t.status === 'completed').length / metrics.totalTasks) * 100).toFixed(0) : 0}%
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 rounded-lg">
                                            <Activity className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <span className="font-medium text-gray-900">In Progress</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-blue-600">{tasks.filter(t => t.status === 'in_progress').length}</p>
                                        <p className="text-xs text-gray-500">
                                            {metrics.totalTasks > 0 ? ((tasks.filter(t => t.status === 'in_progress').length / metrics.totalTasks) * 100).toFixed(0) : 0}%
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-50 rounded-lg">
                                            <Clock className="w-4 h-4 text-gray-600" />
                                        </div>
                                        <span className="font-medium text-gray-900">To Do</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-600">{tasks.filter(t => t.status === 'todo').length}</p>
                                        <p className="text-xs text-gray-500">
                                            {metrics.totalTasks > 0 ? ((tasks.filter(t => t.status === 'todo').length / metrics.totalTasks) * 100).toFixed(0) : 0}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AnalyticsReports;

