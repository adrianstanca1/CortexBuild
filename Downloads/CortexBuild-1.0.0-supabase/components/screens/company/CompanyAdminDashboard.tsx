/**
 * Company Admin Dashboard
 * Complete control panel for company owners/clients
 * Dual scope: Office Operations + Field Operations
 */

import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Users,
    FolderKanban,
    FileText,
    BarChart3,
    CreditCard,
    Settings,
    Briefcase,
    ClipboardList,
    Shield,
    Clock,
    Camera,
    MapPin,
    Package,
    ShoppingCart,
    AlertTriangle,
    CheckSquare,
    TrendingUp,
    Building2,
    Hammer
} from 'lucide-react';
import { User } from '../../../types';
import toast from 'react-hot-toast';

interface CompanyAdminDashboardProps {
    currentUser: User;
    navigateTo: (screen: string, params?: any) => void;
    isDarkMode?: boolean;
}

interface CompanyStats {
    totalUsers: number;
    activeProjects: number;
    completedProjects: number;
    totalRevenue: number;
    monthlyRevenue: number;
    activeWorkers: number;
    safetyIncidents: number;
    qualityIssues: number;
}

const CompanyAdminDashboard: React.FC<CompanyAdminDashboardProps> = ({
    currentUser,
    navigateTo,
    isDarkMode = false
}) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'office' | 'field'>('overview');
    const [stats, setStats] = useState<CompanyStats>({
        totalUsers: 45,
        activeProjects: 12,
        completedProjects: 34,
        totalRevenue: 2456789,
        monthlyRevenue: 145678,
        activeWorkers: 38,
        safetyIncidents: 2,
        qualityIssues: 5
    });

    // Office Operations Sections
    const officeOperations = [
        {
            id: 'projects',
            title: 'Project Management',
            description: 'Manage all company projects',
            icon: FolderKanban,
            color: 'blue',
            stats: `${stats.activeProjects} active`,
            action: () => navigateTo('projects')
        },
        {
            id: 'teams',
            title: 'Team Management',
            description: 'Manage teams and members',
            icon: Users,
            color: 'purple',
            stats: `${stats.totalUsers} members`,
            action: () => navigateTo('teams')
        },
        {
            id: 'documents',
            title: 'Document Management',
            description: 'Contracts, plans, and files',
            icon: FileText,
            color: 'green',
            stats: '234 documents',
            action: () => navigateTo('documents')
        },
        {
            id: 'analytics',
            title: 'Analytics & Reports',
            description: 'Company metrics and insights',
            icon: BarChart3,
            color: 'orange',
            stats: 'Real-time data',
            action: () => navigateTo('analytics')
        },
        {
            id: 'billing',
            title: 'Billing & Invoicing',
            description: 'Manage subscriptions and invoices',
            icon: CreditCard,
            color: 'cyan',
            stats: `$${(stats.monthlyRevenue / 1000).toFixed(1)}k/mo`,
            action: () => navigateTo('billing')
        },
        {
            id: 'clients',
            title: 'Client Management',
            description: 'Manage client relationships',
            icon: Briefcase,
            color: 'indigo',
            stats: '23 clients',
            action: () => toast.info('Client management opening...')
        },
        {
            id: 'settings',
            title: 'Company Settings',
            description: 'Configure company preferences',
            icon: Settings,
            color: 'gray',
            stats: 'Configuration',
            action: () => toast.info('Settings opening...')
        }
    ];

    // Field Operations Sections
    const fieldOperations = [
        {
            id: 'daily-logs',
            title: 'Daily Site Logs',
            description: 'Track daily construction activities',
            icon: ClipboardList,
            color: 'blue',
            stats: 'Today: 12 logs',
            action: () => navigateTo('daily-log')
        },
        {
            id: 'safety',
            title: 'Safety Reports',
            description: 'OSHA compliance and incidents',
            icon: Shield,
            color: 'red',
            stats: `${stats.safetyIncidents} incidents`,
            action: () => toast.info('Safety reports opening...')
        },
        {
            id: 'quality',
            title: 'Quality Control',
            description: 'Inspections and checklists',
            icon: CheckSquare,
            color: 'green',
            stats: `${stats.qualityIssues} issues`,
            action: () => toast.info('Quality control opening...')
        },
        {
            id: 'time-tracking',
            title: 'Time Tracking',
            description: 'GPS clock in/out and payroll',
            icon: Clock,
            color: 'purple',
            stats: `${stats.activeWorkers} active`,
            action: () => navigateTo('time-tracking')
        },
        {
            id: 'photos',
            title: 'Photo Documentation',
            description: 'Site photos with GPS tags',
            icon: Camera,
            color: 'pink',
            stats: '456 photos',
            action: () => navigateTo('photo-gallery')
        },
        {
            id: 'equipment',
            title: 'Equipment Tracking',
            description: 'Track equipment location and usage',
            icon: Hammer,
            color: 'orange',
            stats: '34 items',
            action: () => toast.info('Equipment tracking opening...')
        },
        {
            id: 'procurement',
            title: 'Material Procurement',
            description: 'Inventory and vendor management',
            icon: ShoppingCart,
            color: 'cyan',
            stats: '12 orders',
            action: () => toast.info('Procurement opening...')
        },
        {
            id: 'rfis',
            title: 'RFIs & Issues',
            description: 'Request for information tracking',
            icon: AlertTriangle,
            color: 'yellow',
            stats: '8 open',
            action: () => navigateTo('rfis')
        }
    ];

    // Quick Stats
    const quickStats = [
        {
            label: 'Active Projects',
            value: stats.activeProjects,
            change: '+3 this month',
            icon: FolderKanban,
            color: 'blue'
        },
        {
            label: 'Team Members',
            value: stats.totalUsers,
            change: '+5 this month',
            icon: Users,
            color: 'purple'
        },
        {
            label: 'Monthly Revenue',
            value: `$${(stats.monthlyRevenue / 1000).toFixed(1)}k`,
            change: '+12% growth',
            icon: TrendingUp,
            color: 'green'
        },
        {
            label: 'Active Workers',
            value: stats.activeWorkers,
            change: 'On site now',
            icon: MapPin,
            color: 'orange'
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
        yellow: 'bg-yellow-500'
    };

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Header */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Company Dashboard
                            </h1>
                            <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Welcome back, {currentUser.name} - {currentUser.company?.name || 'Your Company'}
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Building2 className={`w-8 h-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="mt-6 flex space-x-4 border-b border-gray-200">
                        {[
                            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                            { id: 'office', label: 'Office Operations', icon: Briefcase },
                            { id: 'field', label: 'Field Operations', icon: Hammer }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center space-x-2 px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                                    activeTab === tab.id
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
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                                                {stat.change}
                                            </p>
                                        </div>
                                        <div className={`w-12 h-12 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]} bg-opacity-10 flex items-center justify-center`}>
                                            <stat.icon className={`w-6 h-6 ${colorClasses[stat.color as keyof typeof colorClasses].replace('bg-', 'text-')}`} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Combined Operations */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Office Operations Preview */}
                            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
                                <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Office Operations
                                </h2>
                                <div className="space-y-3">
                                    {officeOperations.slice(0, 4).map((op) => (
                                        <button
                                            key={op.id}
                                            onClick={op.action}
                                            className={`w-full flex items-center justify-between p-3 rounded-lg ${
                                                isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                                            } transition-colors`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-10 h-10 rounded-lg ${colorClasses[op.color as keyof typeof colorClasses]} flex items-center justify-center`}>
                                                    <op.icon className="w-5 h-5 text-white" />
                                                </div>
                                                <div className="text-left">
                                                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                        {op.title}
                                                    </p>
                                                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                        {op.stats}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Field Operations Preview */}
                            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
                                <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Field Operations
                                </h2>
                                <div className="space-y-3">
                                    {fieldOperations.slice(0, 4).map((op) => (
                                        <button
                                            key={op.id}
                                            onClick={op.action}
                                            className={`w-full flex items-center justify-between p-3 rounded-lg ${
                                                isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                                            } transition-colors`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-10 h-10 rounded-lg ${colorClasses[op.color as keyof typeof colorClasses]} flex items-center justify-center`}>
                                                    <op.icon className="w-5 h-5 text-white" />
                                                </div>
                                                <div className="text-left">
                                                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                        {op.title}
                                                    </p>
                                                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                        {op.stats}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Office Operations Tab */}
                {activeTab === 'office' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {officeOperations.map((section) => (
                            <button
                                key={section.id}
                                onClick={section.action}
                                className={`${
                                    isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'
                                } rounded-lg shadow p-6 text-left transition-all hover:shadow-lg`}
                            >
                                <div className={`w-12 h-12 rounded-lg ${colorClasses[section.color as keyof typeof colorClasses]} flex items-center justify-center mb-4`}>
                                    <section.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {section.title}
                                </h3>
                                <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {section.description}
                                </p>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                    isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                                }`}>
                                    {section.stats}
                                </span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Field Operations Tab */}
                {activeTab === 'field' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {fieldOperations.map((section) => (
                            <button
                                key={section.id}
                                onClick={section.action}
                                className={`${
                                    isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'
                                } rounded-lg shadow p-6 text-left transition-all hover:shadow-lg`}
                            >
                                <div className={`w-12 h-12 rounded-lg ${colorClasses[section.color as keyof typeof colorClasses]} flex items-center justify-center mb-4`}>
                                    <section.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {section.title}
                                </h3>
                                <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {section.description}
                                </p>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                    isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                                }`}>
                                    {section.stats}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompanyAdminDashboard;

