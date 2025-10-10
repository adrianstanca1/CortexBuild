/**
 * Company Admin Dashboard V2.0 - Revolutionary Design
 * Modern dual-scope dashboard: Office Operations + Field Operations
 */

import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard, Users, FolderKanban, FileText, BarChart3,
    CreditCard, Settings, Briefcase, ClipboardList, Shield,
    Clock, Camera, MapPin, Package, ShoppingCart, AlertTriangle,
    CheckSquare, TrendingUp, Building2, Hammer, ArrowUpRight,
    ArrowDownRight, Sparkles, Target, Award, ChevronRight,
    Zap, Activity
} from 'lucide-react';
import { User } from '../../../types';
import toast from 'react-hot-toast';

interface CompanyAdminDashboardV2Props {
    currentUser: User;
    navigateTo: (screen: string, params?: any) => void;
    isDarkMode?: boolean;
}

const CompanyAdminDashboardV2: React.FC<CompanyAdminDashboardV2Props> = ({
    currentUser,
    navigateTo,
    isDarkMode = true
}) => {
    const [stats, setStats] = useState({
        activeProjects: 12,
        teamMembers: 45,
        monthlyRevenue: 125000,
        activeWorkers: 28,
        safetyIncidents: 2,
        qualityScore: 94.5
    });

    const [activeTab, setActiveTab] = useState<'overview' | 'office' | 'field'>('overview');
    const [isAnimating, setIsAnimating] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsAnimating(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    // Quick Stats
    const quickStats = [
        {
            title: 'Active Projects',
            value: stats.activeProjects.toString(),
            change: '+3 this month',
            trend: 'up',
            icon: FolderKanban,
            color: 'blue',
            bgGradient: 'from-blue-500 to-blue-600'
        },
        {
            title: 'Team Members',
            value: stats.teamMembers.toString(),
            change: '+5 new',
            trend: 'up',
            icon: Users,
            color: 'purple',
            bgGradient: 'from-purple-500 to-purple-600'
        },
        {
            title: 'Monthly Revenue',
            value: `$${(stats.monthlyRevenue / 1000).toFixed(0)}K`,
            change: '+12.5%',
            trend: 'up',
            icon: TrendingUp,
            color: 'green',
            bgGradient: 'from-green-500 to-green-600'
        },
        {
            title: 'Quality Score',
            value: `${stats.qualityScore}%`,
            change: '+2.3%',
            trend: 'up',
            icon: Award,
            color: 'cyan',
            bgGradient: 'from-cyan-500 to-cyan-600'
        }
    ];

    // Office Operations
    const officeOperations = [
        { id: 'projects', title: 'Project Management', icon: FolderKanban, color: 'blue', count: stats.activeProjects, description: 'Manage all projects' },
        { id: 'teams', title: 'Team Management', icon: Users, color: 'purple', count: stats.teamMembers, description: 'Team coordination' },
        { id: 'documents', title: 'Document Management', icon: FileText, color: 'green', count: 234, description: 'Files & documents' },
        { id: 'marketplace', title: 'App Marketplace', icon: Package, color: 'purple', count: 0, description: 'Browse & install apps' },
        { id: 'analytics', title: 'Analytics & Reports', icon: BarChart3, color: 'orange', count: 0, description: 'Business insights' },
        { id: 'billing', title: 'Billing & Invoicing', icon: CreditCard, color: 'cyan', count: 0, description: 'Financial management' },
        { id: 'clients', title: 'Client Management', icon: Briefcase, color: 'indigo', count: 23, description: 'Client relationships' },
        { id: 'settings', title: 'Company Settings', icon: Settings, color: 'gray', count: 0, description: 'Configuration' }
    ];

    // Field Operations
    const fieldOperations = [
        { id: 'daily-logs', title: 'Daily Site Logs', icon: ClipboardList, color: 'blue', count: 0, description: 'Daily reports' },
        { id: 'safety', title: 'Safety Reports', icon: Shield, color: 'red', count: stats.safetyIncidents, description: 'Safety monitoring' },
        { id: 'quality', title: 'Quality Control', icon: CheckSquare, color: 'green', count: 0, description: 'Quality inspections' },
        { id: 'time-tracking', title: 'Time Tracking', icon: Clock, color: 'purple', count: stats.activeWorkers, description: 'Worker hours' },
        { id: 'photos', title: 'Photo Documentation', icon: Camera, color: 'pink', count: 0, description: 'Site photos' },
        { id: 'equipment', title: 'Equipment Tracking', icon: Hammer, color: 'orange', count: 0, description: 'Equipment management' },
        { id: 'procurement', title: 'Material Procurement', icon: ShoppingCart, color: 'cyan', count: 0, description: 'Material orders' },
        { id: 'rfis', title: 'RFIs & Issues', icon: AlertTriangle, color: 'yellow', count: 0, description: 'Issue tracking' }
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

    const renderOperationCard = (operation: any, index: number) => {
        const Icon = operation.icon;
        const colors = getColorClasses(operation.color);

        return (
            <button
                key={operation.id}
                type="button"
                onClick={() => {
                    toast.success(`Opening ${operation.title}...`);
                    navigateTo(operation.id);
                }}
                className={`group relative overflow-hidden rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 text-left transition-all duration-300 hover:scale-105 hover:shadow-2xl ${colors.hover} ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}
                style={{ transitionDelay: `${index * 50}ms` }}
            >
                <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${colors.bg} border ${colors.border}`}>
                        <Icon className={`w-6 h-6 ${colors.text}`} />
                    </div>
                    {operation.count > 0 && (
                        <div className={`px-3 py-1 rounded-full ${colors.bg} ${colors.text} text-sm font-medium`}>
                            {operation.count}
                        </div>
                    )}
                </div>

                <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {operation.title}
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                    {operation.description}
                </p>

                <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${colors.text}`}>Open</span>
                    <ChevronRight className={`w-5 h-5 ${colors.text} transform group-hover:translate-x-1 transition-transform`} />
                </div>
            </button>
        );
    };

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center space-x-3 mb-2">
                                <Building2 className="w-8 h-8 text-white" />
                                <h1 className="text-3xl font-bold text-white">Company Dashboard</h1>
                            </div>
                            <p className="text-purple-100">Office Operations & Field Management</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                type="button"
                                onClick={() => toast.success('Refreshing data...')}
                                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all backdrop-blur-sm"
                            >
                                <Activity className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-8">
                {/* Quick Stats */}
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
                        { id: 'office', label: 'Office Operations', icon: Briefcase },
                        { id: 'field', label: 'Field Operations', icon: Hammer }
                    ].map((tab) => {
                        const TabIcon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${activeTab === tab.id
                                        ? 'bg-purple-600 text-white shadow-lg'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                                    }`}
                            >
                                <TabIcon className="w-5 h-5" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Content based on active tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        <div>
                            <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Office Operations
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {officeOperations.slice(0, 3).map((op, idx) => renderOperationCard(op, idx))}
                            </div>
                        </div>
                        <div>
                            <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Field Operations
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {fieldOperations.slice(0, 3).map((op, idx) => renderOperationCard(op, idx + 3))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'office' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {officeOperations.map((op, idx) => renderOperationCard(op, idx))}
                    </div>
                )}

                {activeTab === 'field' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {fieldOperations.map((op, idx) => renderOperationCard(op, idx))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompanyAdminDashboardV2;

