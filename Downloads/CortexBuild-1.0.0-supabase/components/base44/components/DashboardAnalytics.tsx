import React from 'react';

interface DashboardAnalyticsProps {
    stats: {
        totalRevenue: number;
        activeProjects: number;
        totalHours: number;
        pendingInvoices: number;
    };
    revenueData: { month: string; amount: number }[];
    projectStatusData: { status: string; count: number; color: string }[];
    timeTrackingData: { week: string; hours: number }[];
}

interface AIInsight {
    icon: string;
    title: string;
    description: string;
    action: string;
    color: 'red' | 'green' | 'blue' | 'yellow';
}

interface RecentProject {
    name: string;
    client: string;
    budget: string;
    status: 'planning' | 'in progress' | 'on hold' | 'completed';
    progress?: number;
}

interface Alert {
    icon: string;
    title: string;
    description: string;
    color: 'yellow' | 'blue' | 'red' | 'green';
}

export const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({
    stats,
    revenueData,
    projectStatusData,
    timeTrackingData
}) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const maxRevenue = Math.max(...revenueData.map(d => d.amount));
    const maxHours = Math.max(...timeTrackingData.map(d => d.hours));
    const totalProjects = projectStatusData.reduce((sum, d) => sum + d.count, 0);

    // Intelligent calculations
    const avgRevenuePerMonth = revenueData.reduce((sum, d) => sum + d.amount, 0) / revenueData.length;
    const revenueGrowth = ((revenueData[revenueData.length - 1].amount - revenueData[0].amount) / revenueData[0].amount * 100).toFixed(1);
    const avgHoursPerWeek = timeTrackingData.reduce((sum, d) => sum + d.hours, 0) / timeTrackingData.length;
    const projectCompletionRate = ((projectStatusData.find(p => p.status === 'Completed')?.count || 0) / totalProjects * 100).toFixed(0);
    const revenuePerHour = stats.totalRevenue / stats.totalHours;

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Revenue */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-white bg-opacity-20 rounded-lg p-3">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="text-sm font-medium opacity-90">+12.5%</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-1">{formatCurrency(stats.totalRevenue)}</h3>
                    <p className="text-sm opacity-90">Total Revenue</p>
                    <p className="text-xs opacity-75 mt-2">Avg: {formatCurrency(avgRevenuePerMonth)}/month</p>
                </div>

                {/* Active Projects */}
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-white bg-opacity-20 rounded-lg p-3">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <span className="text-sm font-medium opacity-90">+3 new</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-1">{stats.activeProjects}</h3>
                    <p className="text-sm opacity-90">Active Projects</p>
                    <p className="text-xs opacity-75 mt-2">{projectCompletionRate}% completion rate</p>
                </div>

                {/* Total Hours */}
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-white bg-opacity-20 rounded-lg p-3">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="text-sm font-medium opacity-90">This month</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-1">{stats.totalHours.toLocaleString()}h</h3>
                    <p className="text-sm opacity-90">Total Hours Logged</p>
                    <p className="text-xs opacity-75 mt-2">Avg: {avgHoursPerWeek.toFixed(0)}h/week</p>
                </div>

                {/* Pending Invoices */}
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-white bg-opacity-20 rounded-lg p-3">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <span className="text-sm font-medium opacity-90">Awaiting</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-1">{stats.pendingInvoices}</h3>
                    <p className="text-sm opacity-90">Pending Invoices</p>
                    <p className="text-xs opacity-75 mt-2">{formatCurrency(revenuePerHour)}/hour rate</p>
                </div>
            </div>

            {/* AI Business Insights */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">🤖</span>
                    AI Business Insights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <AIInsightCard
                        icon="⚠️"
                        title="Budget Alert"
                        description="3 projects trending over budget by £125K total. Review cost controls immediately."
                        action="View Projects"
                        color="red"
                    />
                    <AIInsightCard
                        icon="💷"
                        title="Cash Flow Optimization"
                        description="£485K in outstanding invoices. Send reminders to improve cash flow by 18%."
                        action="Send Reminders"
                        color="green"
                    />
                    <AIInsightCard
                        icon="📊"
                        title="Performance Insight"
                        description="Team productivity up 12% this month. 2,340 hours logged across 15 active projects."
                        action="View Analytics"
                        color="blue"
                    />
                </div>
            </div>

            {/* Recent Projects and Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Projects */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <span className="mr-2">📋</span>
                                Recent Projects
                            </h3>
                            <button type="button" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                                View All →
                            </button>
                        </div>
                        <div className="space-y-3">
                            <ProjectCard
                                name="Canary Wharf Office Tower"
                                client="London Development Group"
                                budget="£8,750,000"
                                status="in progress"
                                progress={62}
                            />
                            <ProjectCard
                                name="Thames Riverside Apartments"
                                client="Green Valley Homes UK"
                                budget="£6,200,000"
                                status="in progress"
                                progress={38}
                            />
                            <ProjectCard
                                name="Manchester Industrial Park"
                                client="Northern Construction Ltd"
                                budget="£12,500,000"
                                status="planning"
                            />
                            <ProjectCard
                                name="Birmingham Shopping Centre"
                                client="Retail Developments PLC"
                                budget="£9,800,000"
                                status="in progress"
                                progress={15}
                            />
                        </div>
                    </div>
                </div>

                {/* Alerts & Actions */}
                <div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <span className="mr-2">🔔</span>
                            Alerts & Actions
                        </h3>
                        <div className="space-y-3">
                            <AlertCard
                                icon="💷"
                                title="Outstanding Invoices"
                                description="£485,000 awaiting payment from 12 clients"
                                color="yellow"
                            />
                            <AlertCard
                                icon="⏰"
                                title="Deadline Alert"
                                description="3 projects due for completion within 2 weeks"
                                color="red"
                            />
                            <AlertCard
                                icon="🤖"
                                title="AI Recommendation"
                                description="Allocate 15% more resources to Canary Wharf project"
                                color="blue"
                            />
                            <button
                                type="button"
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center space-x-2 shadow-lg"
                            >
                                <span>➕</span>
                                <span>New Project</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row - MOVED TO BOTTOM */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trend Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend (Last 6 Months)</h3>
                    <div className="space-y-2">
                        {revenueData.map((item, index) => (
                            <div key={index} className="flex items-center space-x-3">
                                <span className="text-sm font-medium text-gray-600 w-16">{item.month}</span>
                                <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                                    <div
                                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-end pr-3"
                                        style={{ width: `${(item.amount / maxRevenue) * 100}%` }}
                                    >
                                        <span className="text-xs font-medium text-white">{formatCurrency(item.amount)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Growth Rate:</span>
                            <span className={`font-semibold ${parseFloat(revenueGrowth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {parseFloat(revenueGrowth) >= 0 ? '+' : ''}{revenueGrowth}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Project Status Distribution */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Status Distribution</h3>


                    <div className="flex items-center justify-center mb-6">
                        <div className="relative w-48 h-48">
                            {/* Simple Pie Chart using conic-gradient */}
                            <div
                                className="w-full h-full rounded-full"
                                style={{
                                    background: `conic-gradient(
                                        ${projectStatusData.map((item, index) => {
                                        const prevPercentage = projectStatusData
                                            .slice(0, index)
                                            .reduce((sum, d) => sum + (d.count / totalProjects) * 100, 0);
                                        const currentPercentage = (item.count / totalProjects) * 100;
                                        return `${item.color} ${prevPercentage}% ${prevPercentage + currentPercentage}%`;
                                    }).join(', ')}
                                    )`
                                }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-white rounded-full w-24 h-24 flex items-center justify-center shadow-lg">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-900">{totalProjects}</div>
                                        <div className="text-xs text-gray-600">Total</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {projectStatusData.map((item, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-sm text-gray-700">{item.status}</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">{item.count} ({((item.count / totalProjects) * 100).toFixed(0)}%)</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Time Tracking Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Time Tracking</h3>
                <div className="flex items-end space-x-4 h-64">
                    {timeTrackingData.map((item, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center space-y-2">
                            <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: `${(item.hours / maxHours) * 100}%` }}>
                                <div className="absolute inset-0 bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg flex items-start justify-center pt-2">
                                    <span className="text-xs font-medium text-white">{item.hours}h</span>
                                </div>
                            </div>
                            <span className="text-xs font-medium text-gray-600">{item.week}</span>
                        </div>
                    ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Weekly Average:</span>
                        <span className="font-semibold text-green-600">{avgHoursPerWeek.toFixed(0)} hours</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// AI Insight Card Component
const AIInsightCard: React.FC<AIInsight> = ({ icon, title, description, action, color }) => {
    const colorClasses = {
        red: 'bg-red-50 border-red-200 text-red-800',
        green: 'bg-green-50 border-green-200 text-green-800',
        blue: 'bg-blue-50 border-blue-200 text-blue-800',
        yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800'
    };

    const buttonColors = {
        red: 'bg-red-600 hover:bg-red-700',
        green: 'bg-green-600 hover:bg-green-700',
        blue: 'bg-blue-600 hover:bg-blue-700',
        yellow: 'bg-yellow-600 hover:bg-yellow-700'
    };

    return (
        <div className={`${colorClasses[color]} border rounded-lg p-4`}>
            <div className="text-3xl mb-2">{icon}</div>
            <h4 className="font-semibold mb-1">{title}</h4>
            <p className="text-sm mb-3 opacity-90">{description}</p>
            <button
                type="button"
                className={`${buttonColors[color]} text-white px-3 py-1.5 rounded text-sm font-medium transition-colors`}
            >
                {action}
            </button>
        </div>
    );
};

// Project Card Component
const ProjectCard: React.FC<RecentProject> = ({ name, client, budget, status, progress }) => {
    const statusColors = {
        'planning': 'bg-yellow-100 text-yellow-800',
        'in progress': 'bg-blue-100 text-blue-800',
        'on hold': 'bg-gray-100 text-gray-800',
        'completed': 'bg-green-100 text-green-800'
    };

    return (
        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{name}</h4>
                    <p className="text-sm text-gray-600">{client}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[status]}`}>
                    {status}
                </span>
            </div>
            <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{budget}</span>
                {progress !== undefined && (
                    <span className="text-blue-600 font-medium">{progress}% complete</span>
                )}
            </div>
            {progress !== undefined && (
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
        </div>
    );
};

// Alert Card Component
const AlertCard: React.FC<Alert> = ({ icon, title, description, color }) => {
    const colorClasses = {
        yellow: 'bg-yellow-50 border-yellow-200',
        blue: 'bg-blue-50 border-blue-200',
        red: 'bg-red-50 border-red-200',
        green: 'bg-green-50 border-green-200'
    };

    return (
        <div className={`${colorClasses[color]} border rounded-lg p-4`}>
            <div className="flex items-start space-x-3">
                <span className="text-2xl">{icon}</span>
                <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
                    <p className="text-sm text-gray-700">{description}</p>
                </div>
            </div>
        </div>
    );
};