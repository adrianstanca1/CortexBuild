/**
 * Platform Admin Dashboard
 * 
 * Comprehensive dashboard for super_admin role showing platform-wide metrics,
 * company management, revenue analytics, and system health.
 */

import React, { useState, useEffect } from 'react';
import { User, Screen } from '../../../types';
import { PlatformDashboardData } from '../../../types/platformAdmin';
import * as platformAPI from '../../../api/platformAdmin';

interface PlatformAdminDashboardProps {
    currentUser: User;
    navigateTo: (screen: Screen, params?: any) => void;
}

const PlatformAdminDashboard: React.FC<PlatformAdminDashboardProps> = ({ currentUser, navigateTo }) => {
    const [dashboardData, setDashboardData] = useState<PlatformDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await platformAPI.getPlatformDashboardData();
            setDashboardData(data);
        } catch (err: any) {
            console.error('Error loading platform dashboard:', err);
            setError(err.message || 'Failed to load dashboard data');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-gray-900">Loading Platform Dashboard...</h2>
                </div>
            </div>
        );
    }

    if (error || !dashboardData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center max-w-md">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
                    <p className="text-gray-600 mb-6">{error || 'Unknown error occurred'}</p>
                    <button
                        type="button"
                        onClick={loadDashboardData}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const { stats, metrics, companies, agents, recentActivity, systemHealth } = dashboardData;

    return (
        <div className="space-y-8 pb-8">
            {/* Header */}
            <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-lg p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">🚀 Platform Admin Dashboard</h1>
                        <p className="text-blue-100 text-lg">
                            Welcome back, {currentUser.name}! Here's your platform overview.
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-blue-200">System Status</div>
                        <div className="flex items-center space-x-2 mt-1">
                            <div className={`w-3 h-3 rounded-full ${systemHealth.status === 'healthy' ? 'bg-green-400' :
                                systemHealth.status === 'degraded' ? 'bg-yellow-400' :
                                    'bg-red-400'
                                }`}></div>
                            <span className="font-semibold capitalize">{systemHealth.status}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Companies */}
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total Companies</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.total_companies}</p>
                            <p className="text-xs text-green-600 mt-1">
                                +{metrics.new_companies_this_month} this month
                            </p>
                        </div>
                        <div className="text-4xl">🏢</div>
                    </div>
                </div>

                {/* Total Users */}
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total Users</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.total_users}</p>
                            <p className="text-xs text-green-600 mt-1">
                                +{metrics.new_users_this_month} this month
                            </p>
                        </div>
                        <div className="text-4xl">👥</div>
                    </div>
                </div>

                {/* Monthly Revenue */}
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Monthly Revenue</p>
                            <p className="text-3xl font-bold text-gray-900">
                                ${metrics.mrr.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                ARR: ${metrics.arr.toLocaleString()}
                            </p>
                        </div>
                        <div className="text-4xl">💰</div>
                    </div>
                </div>

                {/* Active Subscriptions */}
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Active Subscriptions</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.active_subscriptions}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                Across {stats.active_companies} companies
                            </p>
                        </div>
                        <div className="text-4xl">✅</div>
                    </div>
                </div>
            </div>

            {/* Plan Distribution */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Plan Distribution</h2>
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-3xl font-bold text-gray-600">{metrics.free_plan_count}</div>
                        <div className="text-sm text-gray-600 mt-1">Free</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-3xl font-bold text-blue-600">{metrics.professional_plan_count}</div>
                        <div className="text-sm text-blue-600 mt-1">Professional</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-3xl font-bold text-purple-600">{metrics.enterprise_plan_count}</div>
                        <div className="text-sm text-purple-600 mt-1">Enterprise</div>
                    </div>
                </div>
            </div>

            {/* Companies and Agents Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Companies */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Top Companies</h2>
                        <button type="button" className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
                            View All →
                        </button>
                    </div>
                    <div className="space-y-3">
                        {companies.slice(0, 5).map(company => (
                            <div key={company.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="flex-1">
                                    <div className="font-semibold text-gray-900">{company.name}</div>
                                    <div className="text-xs text-gray-600">
                                        {company.user_count} users • {company.project_count} projects
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`inline-block px-2 py-1 rounded text-xs font-semibold ${company.plan === 'enterprise' ? 'bg-purple-100 text-purple-700' :
                                        company.plan === 'professional' ? 'bg-blue-100 text-blue-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                        {company.plan}
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1">
                                        ${company.monthly_spend}/mo
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Agent Performance */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Agent Performance</h2>
                        <button type="button" className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
                            Manage →
                        </button>
                    </div>
                    <div className="space-y-3">
                        {agents.map(agent => (
                            <div key={agent.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                    <div className="font-semibold text-gray-900">{agent.name}</div>
                                    <div className="text-xs text-gray-600">{agent.category}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold text-gray-900">
                                        {agent.subscription_count} subs
                                    </div>
                                    <div className="text-xs text-green-600">
                                        ${agent.monthly_revenue}/mo
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
                <div className="space-y-3">
                    {recentActivity.length > 0 ? (
                        recentActivity.map(activity => (
                            <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                <div className="text-2xl">{activity.icon}</div>
                                <div className="flex-1">
                                    <div className="font-semibold text-gray-900">{activity.title}</div>
                                    <div className="text-sm text-gray-600">{activity.description}</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {new Date(activity.timestamp).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            No recent activity
                        </div>
                    )}
                </div>
            </div>

            {/* System Health */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">System Health</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-700">Database</span>
                            <span className={`text-xs px-2 py-1 rounded ${systemHealth.database.status === 'connected' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                {systemHealth.database.status}
                            </span>
                        </div>
                        <div className="text-xs text-gray-600">
                            Response: {systemHealth.database.response_time_ms}ms
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-700">API</span>
                            <span className={`text-xs px-2 py-1 rounded ${systemHealth.api.status === 'operational' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                {systemHealth.api.status}
                            </span>
                        </div>
                        <div className="text-xs text-gray-600">
                            Response: {systemHealth.api.response_time_ms}ms
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-700">Uptime</span>
                            <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">
                                {systemHealth.uptime_percentage}%
                            </span>
                        </div>
                        <div className="text-xs text-gray-600">
                            Last 30 days
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlatformAdminDashboard;

