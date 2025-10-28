/**
 * Analytics Dashboard - Usage metrics and insights
 */

import React, { useState } from 'react';
import {
    TrendingUp,
    Users,
    Activity,
    Download,
    Eye,
    Star,
    Clock,
    BarChart3
} from 'lucide-react';

interface AnalyticsDashboardProps {
    isDarkMode?: boolean;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ isDarkMode = true }) => {
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

    const stats = {
        totalUsers: 1247,
        activeUsers: 892,
        totalApps: 11,
        totalDownloads: 3456,
        avgRating: 4.8,
        totalReviews: 234
    };

    const appUsage = [
        { name: 'Daily Site Inspector', users: 342, sessions: 1245, avgDuration: '12m' },
        { name: 'Smart Procurement', users: 298, sessions: 987, avgDuration: '8m' },
        { name: 'Safety Reporter', users: 267, sessions: 856, avgDuration: '6m' },
        { name: 'Crew Time Tracker', users: 234, sessions: 745, avgDuration: '15m' },
        { name: 'Quality Control', users: 198, sessions: 623, avgDuration: '10m' }
    ];

    const topApps = [
        { name: 'Daily Site Inspector', downloads: 856, rating: 4.9 },
        { name: 'Mobile App Builder', downloads: 723, rating: 4.8 },
        { name: 'Smart Procurement', downloads: 645, rating: 4.7 },
        { name: 'Crew Time Tracker', downloads: 534, rating: 4.6 },
        { name: 'Safety Reporter', downloads: 498, rating: 4.8 }
    ];

    return (
        <div className={`h-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} p-8 overflow-y-auto`}>
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className={`text-4xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                📊 Analytics Dashboard
                            </h1>
                            <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Usage metrics and insights
                            </p>
                        </div>
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value as any)}
                            className={`px-4 py-2 rounded-lg border ${
                                isDarkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'
                            }`}
                        >
                            <option value="7d">Last 7 days</option>
                            <option value="30d">Last 30 days</option>
                            <option value="90d">Last 90 days</option>
                        </select>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-6 text-white">
                        <Users className="h-8 w-8 mb-2" />
                        <div className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                        <div className="text-sm opacity-80">Total Users</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-6 text-white">
                        <Activity className="h-8 w-8 mb-2" />
                        <div className="text-3xl font-bold">{stats.activeUsers.toLocaleString()}</div>
                        <div className="text-sm opacity-80">Active Users</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
                        <BarChart3 className="h-8 w-8 mb-2" />
                        <div className="text-3xl font-bold">{stats.totalApps}</div>
                        <div className="text-sm opacity-80">Total Apps</div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl p-6 text-white">
                        <Download className="h-8 w-8 mb-2" />
                        <div className="text-3xl font-bold">{stats.totalDownloads.toLocaleString()}</div>
                        <div className="text-sm opacity-80">Downloads</div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-600 to-orange-600 rounded-2xl p-6 text-white">
                        <Star className="h-8 w-8 mb-2" />
                        <div className="text-3xl font-bold">{stats.avgRating}</div>
                        <div className="text-sm opacity-80">Avg Rating</div>
                    </div>
                    <div className="bg-gradient-to-br from-pink-600 to-purple-600 rounded-2xl p-6 text-white">
                        <Eye className="h-8 w-8 mb-2" />
                        <div className="text-3xl font-bold">{stats.totalReviews}</div>
                        <div className="text-sm opacity-80">Reviews</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* App Usage */}
                    <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            App Usage
                        </h2>
                        <div className="space-y-4">
                            {appUsage.map((app, index) => (
                                <div
                                    key={app.name}
                                    className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {app.name}
                                            </h3>
                                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {app.users} users • {app.sessions} sessions
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                            <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {app.avgDuration}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                                        <div
                                            className="h-full bg-gradient-to-r from-purple-600 to-indigo-600"
                                            style={{ width: `${(app.users / 342) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Apps */}
                    <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Top Apps
                        </h2>
                        <div className="space-y-4">
                            {topApps.map((app, index) => (
                                <div
                                    key={app.name}
                                    className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                                            index === 0 ? 'bg-gradient-to-br from-yellow-500 to-orange-500' :
                                            index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                                            index === 2 ? 'bg-gradient-to-br from-orange-600 to-red-600' :
                                            'bg-gradient-to-br from-purple-600 to-indigo-600'
                                        }`}>
                                            #{index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {app.name}
                                            </h3>
                                            <div className="flex items-center gap-4 mt-1">
                                                <div className="flex items-center gap-1">
                                                    <Download className={`h-3 w-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                        {app.downloads}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                        {app.rating}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Growth Chart Placeholder */}
                <div className={`mt-6 p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        User Growth
                    </h2>
                    <div className={`h-64 flex items-center justify-center rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div className="text-center">
                            <TrendingUp className={`h-16 w-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                            <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Chart visualization coming soon
                            </p>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                Integration with Chart.js or Recharts
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;

