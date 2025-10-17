import { Activity, ArrowRight, Building2, Code, DollarSign, Download, FolderKanban, RefreshCw, TrendingDown, TrendingUp, Users, Zap } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface DashboardStats {
    users: {
        total: number;
        active: number;
        newThisWeek: number;
        trend: number;
    };
    companies: {
        total: number;
        active: number;
        trend: number;
    };
    projects: {
        active: number;
        total: number;
        trend: number;
    };
    revenue: {
        monthly: number;
        total: number;
        trend: number;
    };
    sdk: {
        developers: number;
        requests: number;
        cost: number;
    };
    system: {
        uptime: number;
        cpu: number;
        memory: number;
        storage: number;
    };
}

interface EnhancedSuperAdminDashboardProps {
    onNavigate: (tab: string) => void;
    onAddUser: () => void;
    onAddCompany: () => void;
    onAddProject: () => void;
    onSDKAccess: () => void;
}

// Ensure JSX types exist in environments where they're missing (silences JSX.IntrinsicElements error)
declare global {
	namespace JSX {
		interface IntrinsicElements {
			[key: string]: any;
		}
	}
}

export const EnhancedSuperAdminDashboard: React.FC<EnhancedSuperAdminDashboardProps> = ({
    onNavigate,
    onAddUser,
    onAddCompany,
    onAddProject,
    onSDKAccess
}) => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setRefreshing(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3001/api/admin/analytics/overview', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const exportData = () => {
        if (!stats) {return;}
        const dataStr = JSON.stringify(stats, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `cortexbuild-dashboard-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    if (loading || !stats) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <Activity className="w-12 h-12 text-blue-600 animate-pulse mx-auto mb-4" />
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Super Admin Dashboard</h1>
                    <p className="text-gray-600">Complete overview of your CortexBuild platform</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={loadDashboardData}
                        disabled={refreshing}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors disabled:opacity-50"
                        aria-label="Refresh dashboard"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </button>
                    <button
                        onClick={exportData}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        aria-label="Export data"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export</span>
                    </button>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {/* Total Users */}
                <div
                    onClick={() => onNavigate('users')}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        {stats.users.trend >= 0 ? (
                            <TrendingUp className="w-5 h-5 text-green-600" />
                        ) : (
                            <TrendingDown className="w-5 h-5 text-red-600" />
                        )}
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium mb-1">Total Users</h3>
                    <p className="text-3xl font-bold text-gray-900 mb-2">{stats.users.total}</p>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{stats.users.active} active</span>
                        <span className={`font-medium ${stats.users.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stats.users.trend >= 0 ? '+' : ''}{stats.users.trend}%
                        </span>
                    </div>
                </div>

                {/* Companies */}
                <div
                    onClick={() => onNavigate('companies')}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <Building2 className="w-6 h-6 text-green-600" />
                        </div>
                        {stats.companies.trend >= 0 ? (
                            <TrendingUp className="w-5 h-5 text-green-600" />
                        ) : (
                            <TrendingDown className="w-5 h-5 text-red-600" />
                        )}
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium mb-1">Companies</h3>
                    <p className="text-3xl font-bold text-gray-900 mb-2">{stats.companies.total}</p>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{stats.companies.active} active</span>
                        <span className={`font-medium ${stats.companies.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stats.companies.trend >= 0 ? '+' : ''}{stats.companies.trend}%
                        </span>
                    </div>
                </div>

                {/* Active Projects */}
                <div
                    onClick={() => onNavigate('overview')}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <FolderKanban className="w-6 h-6 text-purple-600" />
                        </div>
                        {stats.projects.trend >= 0 ? (
                            <TrendingUp className="w-5 h-5 text-green-600" />
                        ) : (
                            <TrendingDown className="w-5 h-5 text-red-600" />
                        )}
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium mb-1">Active Projects</h3>
                    <p className="text-3xl font-bold text-gray-900 mb-2">{stats.projects.active}</p>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{stats.projects.total} total</span>
                        <span className={`font-medium ${stats.projects.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stats.projects.trend >= 0 ? '+' : ''}{stats.projects.trend}%
                        </span>
                    </div>
                </div>

                {/* Monthly Revenue */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-orange-100 rounded-lg">
                            <DollarSign className="w-6 h-6 text-orange-600" />
                        </div>
                        {stats.revenue.trend >= 0 ? (
                            <TrendingUp className="w-5 h-5 text-green-600" />
                        ) : (
                            <TrendingDown className="w-5 h-5 text-red-600" />
                        )}
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium mb-1">Monthly Revenue</h3>
                    <p className="text-3xl font-bold text-gray-900 mb-2">
                        ${stats.revenue.monthly.toLocaleString()}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">${stats.revenue.total.toLocaleString()} total</span>
                        <span className={`font-medium ${stats.revenue.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stats.revenue.trend >= 0 ? '+' : ''}{stats.revenue.trend}%
                        </span>
                    </div>
                </div>
            </div>

            {/* SDK Platform Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <Code className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">SDK Platform Stats</h2>
                            <p className="text-sm text-gray-600">Developer environment metrics</p>
                        </div>
                    </div>
                    <button
                        onClick={() => onNavigate('sdk-env')}
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        <span className="font-medium">View Details</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-indigo-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">SDK Developers</p>
                        <p className="text-3xl font-bold text-indigo-600">{stats.sdk.developers}</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Total API Requests</p>
                        <p className="text-3xl font-bold text-blue-600">{stats.sdk.requests.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Total Cost</p>
                        <p className="text-3xl font-bold text-purple-600">${stats.sdk.cost.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            {/* System Health */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Activity className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">System Health</h2>
                            <p className="text-sm text-gray-600">Real-time platform status</p>
                        </div>
                    </div>
                    <button
                        onClick={() => onNavigate('system')}
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        <span className="font-medium">View Details</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Uptime</span>
                            <span className="text-sm font-semibold text-green-600">{stats.system.uptime}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-600 h-2 rounded-full" style={{ width: `${stats.system.uptime}%` }} />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">CPU Usage</span>
                            <span className="text-sm font-semibold text-blue-600">{stats.system.cpu}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${stats.system.cpu}%` }} />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Memory</span>
                            <span className="text-sm font-semibold text-purple-600">{stats.system.memory}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${stats.system.memory}%` }} />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Storage</span>
                            <span className="text-sm font-semibold text-orange-600">{stats.system.storage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-orange-600 h-2 rounded-full" style={{ width: `${stats.system.storage}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <button
                        onClick={onAddUser}
                        className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
                    >
                        <Users className="w-8 h-8 text-gray-400 group-hover:text-blue-600 mb-2" />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Add User</span>
                    </button>
                    <button
                        onClick={onAddCompany}
                        className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group"
                    >
                        <Building2 className="w-8 h-8 text-gray-400 group-hover:text-green-600 mb-2" />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-green-600">Add Company</span>
                    </button>
                    <button
                        onClick={onAddProject}
                        className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all group"
                    >
                        <FolderKanban className="w-8 h-8 text-gray-400 group-hover:text-purple-600 mb-2" />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600">New Project</span>
                    </button>
                    <button
                        onClick={onSDKAccess}
                        className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                    >
                        <Code className="w-8 h-8 text-gray-400 group-hover:text-indigo-600 mb-2" />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600">SDK Access</span>
                    </button>
                    <button
                        onClick={() => alert('Security settings - Coming soon')}
                        className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all group"
                    >
                        <Zap className="w-8 h-8 text-gray-400 group-hover:text-red-600 mb-2" />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-red-600">Security</span>
                    </button>
                    <button
                        onClick={() => onNavigate('system')}
                        className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-gray-500 hover:bg-gray-50 transition-all group"
                    >
                        <Activity className="w-8 h-8 text-gray-400 group-hover:text-gray-600 mb-2" />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-600">Settings</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
