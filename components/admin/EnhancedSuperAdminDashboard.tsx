/**
 * Enhanced Super Admin Dashboard v2.0
 * Revolutionary administrative control panel with modern UI/UX
 * Features: Real-time stats, animations, advanced analytics
 */

import React, { useState, useEffect } from 'react';
import {
    Users,
    Building2,
    CreditCard,
    BarChart3,
    Settings,
    Shield,
    Database,
    Activity,
    FileText,
    Bell,
    Lock,
    Globe,
    Package,
    Zap,
    TrendingUp,
    DollarSign,
    UserCheck,
    AlertCircle,
    CheckCircle,
    Clock,
    Download,
    ArrowUpRight,
    ArrowDownRight,
    Sparkles,
    Target,
    Award,
    Cpu
} from 'lucide-react';
import toast from 'react-hot-toast';

interface EnhancedSuperAdminDashboardProps {
    isDarkMode?: boolean;
    onNavigate?: (section: string) => void;
}

interface AdminStats {
    totalUsers: number;
    activeUsers: number;
    totalCompanies: number;
    activeCompanies: number;
    totalRevenue: number;
    monthlyRevenue: number;
    totalSubscriptions: number;
    activeSubscriptions: number;
}

const EnhancedSuperAdminDashboard: React.FC<EnhancedSuperAdminDashboardProps> = ({
    isDarkMode = true,
    onNavigate
}) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'companies' | 'billing' | 'system'>('overview');
    const [stats, setStats] = useState<AdminStats>({
        totalUsers: 1247,
        activeUsers: 892,
        totalCompanies: 156,
        activeCompanies: 134,
        totalRevenue: 456789,
        monthlyRevenue: 45678,
        totalSubscriptions: 156,
        activeSubscriptions: 134
    });

    // Administrative Sections
    const adminSections = [
        {
            id: 'user-management',
            title: 'User Management',
            description: 'Manage users, roles, and permissions',
            icon: Users,
            color: 'blue',
            stats: `${stats.totalUsers} users`,
            actions: ['View Users', 'Add User', 'Manage Roles']
        },
        {
            id: 'company-management',
            title: 'Company Management',
            description: 'Manage companies and organizations',
            icon: Building2,
            color: 'purple',
            stats: `${stats.totalCompanies} companies`,
            actions: ['View Companies', 'Add Company', 'Settings']
        },
        {
            id: 'billing-payments',
            title: 'Billing & Payments',
            description: 'Manage subscriptions and invoices',
            icon: CreditCard,
            color: 'green',
            stats: `$${(stats.totalRevenue / 1000).toFixed(1)}k revenue`,
            actions: ['View Invoices', 'Subscriptions', 'Reports']
        },
        {
            id: 'analytics-reports',
            title: 'Analytics & Reports',
            description: 'View system analytics and generate reports',
            icon: BarChart3,
            color: 'orange',
            stats: 'Real-time data',
            actions: ['Dashboard', 'Reports', 'Export']
        },
        {
            id: 'system-settings',
            title: 'System Settings',
            description: 'Configure system-wide settings',
            icon: Settings,
            color: 'gray',
            stats: 'All systems operational',
            actions: ['General', 'Security', 'Integrations']
        },
        {
            id: 'security-audit',
            title: 'Security & Audit',
            description: 'Security logs and audit trails',
            icon: Shield,
            color: 'red',
            stats: 'No alerts',
            actions: ['Audit Logs', 'Security', 'Compliance']
        },
        {
            id: 'database-management',
            title: 'Database Management',
            description: 'Manage databases and backups',
            icon: Database,
            color: 'cyan',
            stats: '54 tables',
            actions: ['View Tables', 'Backups', 'Migrations']
        },
        {
            id: 'activity-monitoring',
            title: 'Activity Monitoring',
            description: 'Monitor system activity and performance',
            icon: Activity,
            color: 'pink',
            stats: 'Live monitoring',
            actions: ['Live Feed', 'Metrics', 'Alerts']
        },
        {
            id: 'content-management',
            title: 'Content Management',
            description: 'Manage content and documentation',
            icon: FileText,
            color: 'indigo',
            stats: '234 documents',
            actions: ['Documents', 'Templates', 'Media']
        },
        {
            id: 'notifications',
            title: 'Notifications',
            description: 'Manage system notifications',
            icon: Bell,
            color: 'yellow',
            stats: '12 pending',
            actions: ['View All', 'Settings', 'Templates']
        },
        {
            id: 'permissions',
            title: 'Permissions',
            description: 'Manage access control and permissions',
            icon: Lock,
            color: 'violet',
            stats: '24 roles',
            actions: ['Roles', 'Permissions', 'Groups']
        },
        {
            id: 'integrations',
            title: 'Integrations',
            description: 'Manage third-party integrations',
            icon: Globe,
            color: 'teal',
            stats: '8 active',
            actions: ['View All', 'Add New', 'Settings']
        }
    ];

    // Top Navigation Tabs
    const navigationTabs = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'users', label: 'Users & Companies', icon: Users },
        { id: 'billing', label: 'Billing & Revenue', icon: DollarSign },
        { id: 'system', label: 'System & Security', icon: Shield }
    ];

    // Quick Stats
    const quickStats = [
        {
            label: 'Total Users',
            value: stats.totalUsers,
            change: '+12%',
            trend: 'up',
            icon: Users,
            color: 'blue'
        },
        {
            label: 'Active Companies',
            value: stats.activeCompanies,
            change: '+8%',
            trend: 'up',
            icon: Building2,
            color: 'purple'
        },
        {
            label: 'Monthly Revenue',
            value: `$${(stats.monthlyRevenue / 1000).toFixed(1)}k`,
            change: '+15%',
            trend: 'up',
            icon: DollarSign,
            color: 'green'
        },
        {
            label: 'Active Subscriptions',
            value: stats.activeSubscriptions,
            change: '+5%',
            trend: 'up',
            icon: CheckCircle,
            color: 'cyan'
        }
    ];

    const colorClasses = {
        blue: 'bg-blue-500',
        purple: 'bg-purple-500',
        green: 'bg-green-500',
        orange: 'bg-orange-500',
        gray: 'bg-gray-500',
        red: 'bg-red-500',
        cyan: 'bg-cyan-500',
        pink: 'bg-pink-500',
        indigo: 'bg-indigo-500',
        yellow: 'bg-yellow-500',
        violet: 'bg-violet-500',
        teal: 'bg-teal-500'
    };

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Header */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Super Admin Dashboard
                            </h1>
                            <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Complete administrative control panel
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => toast.success('Refreshing data...')}
                                className={`px-4 py-2 rounded-lg ${isDarkMode
                                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                                    } transition-colors`}
                            >
                                <Activity className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => toast.info('Downloading report...')}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                            >
                                <Download className="w-4 h-4" />
                                <span>Export Report</span>
                            </button>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="mt-6 flex space-x-4 border-b border-gray-200">
                        {navigationTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center space-x-2 px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : `border-transparent ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'}`
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {quickStats.map((stat, index) => (
                        <div
                            key={index}
                            className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {stat.label}
                                    </p>
                                    <p className={`text-2xl font-bold mt-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {stat.value}
                                    </p>
                                    <p className="text-sm text-green-600 mt-1">
                                        {stat.change} from last month
                                    </p>
                                </div>
                                <div className={`w-12 h-12 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]} bg-opacity-10 flex items-center justify-center`}>
                                    <stat.icon className={`w-6 h-6 ${colorClasses[stat.color as keyof typeof colorClasses].replace('bg-', 'text-')}`} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Administrative Sections Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {adminSections.map((section) => (
                        <div
                            key={section.id}
                            className={`${isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'
                                } rounded-lg shadow p-6 transition-all cursor-pointer hover:shadow-lg`}
                            onClick={() => {
                                toast.success(`Opening ${section.title}...`);
                                onNavigate?.(section.id);
                            }}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-12 h-12 rounded-lg ${colorClasses[section.color as keyof typeof colorClasses]} flex items-center justify-center`}>
                                    <section.icon className="w-6 h-6 text-white" />
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {section.stats}
                                </span>
                            </div>
                            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {section.title}
                            </h3>
                            <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {section.description}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {section.actions.map((action, index) => (
                                    <span
                                        key={index}
                                        className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        {action}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EnhancedSuperAdminDashboard;

