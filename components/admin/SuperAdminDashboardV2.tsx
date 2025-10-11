/**
 * Super Admin Dashboard V2.0 - Revolutionary Design
 * Modern, animated, feature-rich administrative control panel
 */

import React, { useState, useEffect } from 'react';
import {
    Users, Building2, CreditCard, BarChart3, Settings, Shield,
    Database, Activity, FileText, Bell, Lock, Globe, Package,
    DollarSign, Download, ArrowUpRight, ArrowDownRight,
    Sparkles, Cpu, ChevronRight, LayoutDashboard
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SuperAdminDashboardV2Props {
    isDarkMode?: boolean;
    onNavigate?: (section: string) => void;
}

const SuperAdminDashboardV2: React.FC<SuperAdminDashboardV2Props> = ({
    isDarkMode = true,
    onNavigate
}) => {
    const [stats, setStats] = useState({
        totalUsers: 1247,
        activeUsers: 892,
        totalCompanies: 156,
        activeCompanies: 134,
        totalRevenue: 284750,
        monthlyRevenue: 45890,
        activeSubscriptions: 134,
        systemHealth: 98.5
    });

    const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'system'>('overview');
    const [isAnimating, setIsAnimating] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsAnimating(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    // Quick Stats Cards with animations
    const quickStats = [
        {
            title: 'Total Users',
            value: stats.totalUsers.toLocaleString(),
            change: '+12.5%',
            trend: 'up',
            icon: Users,
            color: 'blue',
            bgGradient: 'from-blue-500 to-blue-600'
        },
        {
            title: 'Active Companies',
            value: stats.activeCompanies.toLocaleString(),
            change: '+8.3%',
            trend: 'up',
            icon: Building2,
            color: 'purple',
            bgGradient: 'from-purple-500 to-purple-600'
        },
        {
            title: 'Monthly Revenue',
            value: `$${(stats.monthlyRevenue / 1000).toFixed(1)}K`,
            change: '+15.2%',
            trend: 'up',
            icon: DollarSign,
            color: 'green',
            bgGradient: 'from-green-500 to-green-600'
        },
        {
            title: 'System Health',
            value: `${stats.systemHealth}%`,
            change: '+0.5%',
            trend: 'up',
            icon: Activity,
            color: 'cyan',
            bgGradient: 'from-cyan-500 to-cyan-600'
        }
    ];

    // Admin Sections with modern design
    const adminSections = [
        { id: 'user-management', title: 'User Management', icon: Users, color: 'blue', count: stats.totalUsers, description: 'Manage all platform users' },
        { id: 'company-management', title: 'Company Management', icon: Building2, color: 'purple', count: stats.totalCompanies, description: 'Oversee all companies' },
        { id: 'billing-payments', title: 'Billing & Payments', icon: CreditCard, color: 'green', count: stats.activeSubscriptions, description: 'Revenue & subscriptions' },
        { id: 'marketplace', title: 'App Marketplace', icon: Package, color: 'purple', count: 0, description: 'Browse & manage apps' },
        { id: 'analytics-reports', title: 'Analytics & Reports', icon: BarChart3, color: 'orange', count: 0, description: 'Platform insights' },
        { id: 'system-settings', title: 'System Settings', icon: Settings, color: 'gray', count: 0, description: 'Platform configuration' },
        { id: 'security-audit', title: 'Security & Audit', icon: Shield, color: 'red', count: 0, description: 'Security monitoring' },
        { id: 'database-management', title: 'Database Management', icon: Database, color: 'indigo', count: 0, description: 'Data management' },
        { id: 'activity-monitoring', title: 'Activity Monitoring', icon: Activity, color: 'pink', count: 0, description: 'Real-time activity' },
        { id: 'content-management', title: 'Content Management', icon: FileText, color: 'yellow', count: 0, description: 'Platform content' },
        { id: 'notifications', title: 'Notifications', icon: Bell, color: 'blue', count: 0, description: 'System alerts' },
        { id: 'permissions', title: 'Permissions', icon: Lock, color: 'red', count: 0, description: 'Access control' },
        { id: 'integrations', title: 'Integrations', icon: Globe, color: 'cyan', count: 0, description: 'Third-party services' }
    ];

    const getColorClasses = (color: string) => {
        const colors: Record<string, { bg: string; text: string; border: string; hover: string }> = {
            blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', hover: 'hover:bg-blue-500/20' },
            purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', hover: 'hover:bg-purple-500/20' },
            green: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20', hover: 'hover:bg-green-500/20' },
            orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', hover: 'hover:bg-orange-500/20' },
            red: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', hover: 'hover:bg-red-500/20' },
            cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', hover: 'hover:bg-cyan-500/20' },
            pink: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20', hover: 'hover:bg-pink-500/20' },
            yellow: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20', hover: 'hover:bg-yellow-500/20' },
            indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20', hover: 'hover:bg-indigo-500/20' },
            gray: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20', hover: 'hover:bg-gray-500/20' }
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center space-x-3 mb-2">
                                <Sparkles className="w-8 h-8 text-white" />
                                <h1 className="text-3xl font-bold text-white">Super Admin Dashboard</h1>
                            </div>
                            <p className="text-blue-100">Complete platform control & analytics</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                type="button"
                                onClick={() => toast.success('Refreshing data...')}
                                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all backdrop-blur-sm"
                                title="Refresh dashboard data"
                                aria-label="Refresh dashboard data"
                            >
                                <Activity className="w-5 h-5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => toast('Downloading report...', { icon: '📥' })}
                                className="px-6 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-all font-medium flex items-center space-x-2"
                                title="Export dashboard report"
                                aria-label="Export dashboard report"
                            >
                                <Download className="w-5 h-5" />
                                <span>Export</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-8">
                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {quickStats.map((stat, index) => {
                        const Icon = stat.icon;
                        const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight;

                        return (
                            <div
                                key={stat.title}
                                className={`relative overflow-hidden rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}
                                style={{ transitionDelay: `${index * 100}ms` }}
                            >
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.bgGradient} opacity-10 rounded-full -mr-16 -mt-16`} />

                                <div className="relative">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.bgGradient}`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${stat.trend === 'up' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                            <TrendIcon className="w-4 h-4" />
                                            <span className="text-sm font-medium">{stat.change}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>{stat.title}</p>
                                        <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Navigation Tabs */}
                <div className="flex space-x-2 mb-8 p-1 bg-gray-800 rounded-xl">
                    {[
                        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                        { id: 'system', label: 'System', icon: Cpu }
                    ].map((tab) => {
                        const TabIcon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                                    }`}
                            >
                                <TabIcon className="w-5 h-5" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Admin Sections Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {adminSections.map((section, index) => {
                        const Icon = section.icon;
                        const colors = getColorClasses(section.color);

                        return (
                            <button
                                key={section.id}
                                type="button"
                                onClick={() => {
                                    toast.success(`Opening ${section.title}...`);
                                    onNavigate?.(section.id);
                                }}
                                className={`group relative overflow-hidden rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 text-left transition-all duration-300 hover:scale-105 hover:shadow-2xl ${colors.hover} ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}
                                style={{ transitionDelay: `${(index + 4) * 50}ms` }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-xl ${colors.bg} border ${colors.border}`}>
                                        <Icon className={`w-6 h-6 ${colors.text}`} />
                                    </div>
                                    {section.count > 0 && (
                                        <div className={`px-3 py-1 rounded-full ${colors.bg} ${colors.text} text-sm font-medium`}>
                                            {section.count.toLocaleString()}
                                        </div>
                                    )}
                                </div>

                                <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {section.title}
                                </h3>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                                    {section.description}
                                </p>

                                <div className="flex items-center justify-between">
                                    <span className={`text-sm font-medium ${colors.text}`}>Manage</span>
                                    <ChevronRight className={`w-5 h-5 ${colors.text} transform group-hover:translate-x-1 transition-transform`} />
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboardV2;

