// components/analytics/AdvancedAnalyticsDashboard.tsx
import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    TrendingDown,
    Users,
    Calendar,
    DollarSign,
    Clock,
    CheckCircle,
    AlertTriangle,
    BarChart3,
    PieChart,
    Activity,
    Target,
    Zap,
    Award,
    Download,
    RefreshCw,
    Filter,
    Eye,
    EyeOff
} from 'lucide-react';

export interface AnalyticsData {
    overview: {
        totalProjects: number;
        activeProjects: number;
        completedProjects: number;
        totalRevenue: number;
        monthlyRevenue: number;
        teamProductivity: number;
        completionRate: number;
        budgetUtilization: number;
    };
    trends: {
        revenue: { month: string; value: number }[];
        projects: { month: string; completed: number; started: number }[];
        productivity: { week: string; score: number }[];
    };
    performance: {
        topPerformers: {
            id: string;
            name: string;
            role: string;
            projectsCompleted: number;
            productivityScore: number;
            avatar?: string;
        }[];
        projectHealth: {
            id: string;
            name: string;
            status: string;
            progress: number;
            budgetUsed: number;
            timelineStatus: string;
            riskLevel: 'low' | 'medium' | 'high';
        }[];
    };
    insights: {
        recommendations: {
            id: string;
            title: string;
            description: string;
            impact: 'high' | 'medium' | 'low';
            effort: 'high' | 'medium' | 'low';
            category: string;
        }[];
        alerts: {
            id: string;
            type: 'warning' | 'error' | 'info';
            title: string;
            message: string;
            timestamp: string;
        }[];
    };
}

interface AdvancedAnalyticsDashboardProps {
    projectId?: string;
    timeRange: '7d' | '30d' | '90d' | '1y';
    onTimeRangeChange: (range: '7d' | '30d' | '90d' | '1y') => void;
    className?: string;
}

export const AdvancedAnalyticsDashboard: React.FC<AdvancedAnalyticsDashboardProps> = ({
    projectId,
    timeRange,
    onTimeRangeChange,
    className = ""
}) => {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedMetric, setSelectedMetric] = useState<string>('overview');
    const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});

    // Mock data - replace with actual API calls
    const mockData: AnalyticsData = {
        overview: {
            totalProjects: 24,
            activeProjects: 8,
            completedProjects: 16,
            totalRevenue: 2500000,
            monthlyRevenue: 180000,
            teamProductivity: 87,
            completionRate: 92,
            budgetUtilization: 78
        },
        trends: {
            revenue: [
                { month: 'Jan', value: 150000 },
                { month: 'Feb', value: 165000 },
                { month: 'Mar', value: 180000 },
                { month: 'Apr', value: 175000 },
                { month: 'May', value: 190000 },
                { month: 'Jun', value: 180000 }
            ],
            projects: [
                { month: 'Jan', completed: 3, started: 2 },
                { month: 'Feb', completed: 4, started: 3 },
                { month: 'Mar', completed: 2, started: 4 },
                { month: 'Apr', completed: 5, started: 2 },
                { month: 'May', completed: 3, started: 3 },
                { month: 'Jun', completed: 4, started: 2 }
            ],
            productivity: [
                { week: 'W1', score: 85 },
                { week: 'W2', score: 88 },
                { week: 'W3', score: 82 },
                { week: 'W4', score: 90 }
            ]
        },
        performance: {
            topPerformers: [
                {
                    id: '1',
                    name: 'John Smith',
                    role: 'Project Manager',
                    projectsCompleted: 8,
                    productivityScore: 95,
                    avatar: '/avatars/john.jpg'
                },
                {
                    id: '2',
                    name: 'Sarah Johnson',
                    role: 'Site Supervisor',
                    projectsCompleted: 6,
                    productivityScore: 92,
                    avatar: '/avatars/sarah.jpg'
                },
                {
                    id: '3',
                    name: 'Mike Wilson',
                    role: 'Safety Officer',
                    projectsCompleted: 5,
                    productivityScore: 89,
                    avatar: '/avatars/mike.jpg'
                }
            ],
            projectHealth: [
                {
                    id: '1',
                    name: 'Office Building Construction',
                    status: 'active',
                    progress: 75,
                    budgetUsed: 68,
                    timelineStatus: 'on-track',
                    riskLevel: 'low'
                },
                {
                    id: '2',
                    name: 'Residential Complex',
                    status: 'active',
                    progress: 45,
                    budgetUsed: 52,
                    timelineStatus: 'delayed',
                    riskLevel: 'medium'
                },
                {
                    id: '3',
                    name: 'Shopping Mall Renovation',
                    status: 'active',
                    progress: 90,
                    budgetUsed: 95,
                    timelineStatus: 'at-risk',
                    riskLevel: 'high'
                }
            ]
        },
        insights: {
            recommendations: [
                {
                    id: '1',
                    title: 'Optimize Resource Allocation',
                    description: 'Reallocate 2 team members from low-priority projects to high-impact initiatives',
                    impact: 'high',
                    effort: 'medium',
                    category: 'Resource Management'
                },
                {
                    id: '2',
                    title: 'Implement Automated Reporting',
                    description: 'Set up automated daily progress reports to improve transparency',
                    impact: 'medium',
                    effort: 'low',
                    category: 'Process Improvement'
                },
                {
                    id: '3',
                    title: 'Enhance Safety Training',
                    description: 'Schedule additional safety training sessions for new team members',
                    impact: 'high',
                    effort: 'low',
                    category: 'Safety'
                }
            ],
            alerts: [
                {
                    id: '1',
                    type: 'warning',
                    title: 'Budget Overrun Risk',
                    message: 'Shopping Mall Renovation project is approaching budget limit',
                    timestamp: '2024-01-20T10:30:00Z'
                },
                {
                    id: '2',
                    type: 'info',
                    title: 'Milestone Achieved',
                    message: 'Office Building Construction reached 75% completion',
                    timestamp: '2024-01-20T09:15:00Z'
                },
                {
                    id: '3',
                    type: 'error',
                    title: 'Safety Incident',
                    message: 'Minor safety incident reported at Residential Complex site',
                    timestamp: '2024-01-19T16:45:00Z'
                }
            ]
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setData(mockData);
            setLoading(false);
        };

        loadData();
    }, [timeRange, projectId]);

    const toggleDetails = (key: string) => {
        setShowDetails(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatPercentage = (value: number) => {
        return `${value}%`;
    };

    const getTrendIcon = (current: number, previous: number) => {
        if (current > previous) {
            return <TrendingUp className="w-4 h-4 text-green-600" />;
        } else if (current < previous) {
            return <TrendingDown className="w-4 h-4 text-red-600" />;
        }
        return null;
    };

    const getTrendColor = (current: number, previous: number) => {
        if (current > previous) return 'text-green-600';
        if (current < previous) return 'text-red-600';
        return 'text-gray-600';
    };

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'low': return 'text-green-600 bg-green-50';
            case 'medium': return 'text-yellow-600 bg-yellow-50';
            case 'high': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
            case 'error': return <AlertTriangle className="w-4 h-4 text-red-600" />;
            case 'info': return <CheckCircle className="w-4 h-4 text-blue-600" />;
            default: return <CheckCircle className="w-4 h-4 text-gray-600" />;
        }
    };

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case 'high': return 'text-red-600 bg-red-50';
            case 'medium': return 'text-yellow-600 bg-yellow-50';
            case 'low': return 'text-green-600 bg-green-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    if (loading) {
        return (
            <div className={`analytics-dashboard ${className}`}>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className={`analytics-dashboard bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
            {/* Header */}
            <div className="border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <BarChart3 className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-semibold text-gray-900">Advanced Analytics</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={timeRange}
                            onChange={(e) => onTimeRangeChange(e.target.value as any)}
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="7d">Last 7 days</option>
                            <option value="30d">Last 30 days</option>
                            <option value="90d">Last 90 days</option>
                            <option value="1y">Last year</option>
                        </select>
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
                            <RefreshCw className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
                            <Download className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Metric Tabs */}
                <div className="flex gap-1 mt-4">
                    {[
                        { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
                        { id: 'trends', label: 'Trends', icon: <TrendingUp className="w-4 h-4" /> },
                        { id: 'performance', label: 'Performance', icon: <Target className="w-4 h-4" /> },
                        { id: 'insights', label: 'Insights', icon: <Zap className="w-4 h-4" /> }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setSelectedMetric(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${selectedMetric === tab.id
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {selectedMetric === 'overview' && (
                    <div className="space-y-6">
                        {/* Key Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-100 text-sm">Total Projects</p>
                                        <p className="text-2xl font-bold">{data.overview.totalProjects}</p>
                                    </div>
                                    <Users className="w-8 h-8 text-blue-200" />
                                </div>
                                <div className="mt-2 flex items-center gap-1">
                                    {getTrendIcon(data.overview.activeProjects, 6)}
                                    <span className="text-sm text-blue-100">
                                        {data.overview.activeProjects} active
                                    </span>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-100 text-sm">Total Revenue</p>
                                        <p className="text-2xl font-bold">{formatCurrency(data.overview.totalRevenue)}</p>
                                    </div>
                                    <DollarSign className="w-8 h-8 text-green-200" />
                                </div>
                                <div className="mt-2 flex items-center gap-1">
                                    {getTrendIcon(data.overview.monthlyRevenue, 160000)}
                                    <span className="text-sm text-green-100">
                                        {formatCurrency(data.overview.monthlyRevenue)} this month
                                    </span>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-purple-100 text-sm">Team Productivity</p>
                                        <p className="text-2xl font-bold">{formatPercentage(data.overview.teamProductivity)}</p>
                                    </div>
                                    <Activity className="w-8 h-8 text-purple-200" />
                                </div>
                                <div className="mt-2 flex items-center gap-1">
                                    {getTrendIcon(data.overview.teamProductivity, 82)}
                                    <span className="text-sm text-purple-100">
                                        +5% from last month
                                    </span>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-orange-100 text-sm">Completion Rate</p>
                                        <p className="text-2xl font-bold">{formatPercentage(data.overview.completionRate)}</p>
                                    </div>
                                    <CheckCircle className="w-8 h-8 text-orange-200" />
                                </div>
                                <div className="mt-2 flex items-center gap-1">
                                    {getTrendIcon(data.overview.completionRate, 88)}
                                    <span className="text-sm text-orange-100">
                                        +4% from last month
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Additional Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Project Status</h3>
                                    <PieChart className="w-5 h-5 text-gray-400" />
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Completed</span>
                                        <span className="text-sm font-medium text-gray-900">{data.overview.completedProjects}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Active</span>
                                        <span className="text-sm font-medium text-gray-900">{data.overview.activeProjects}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Total</span>
                                        <span className="text-sm font-medium text-gray-900">{data.overview.totalProjects}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Budget Utilization</h3>
                                    <Target className="w-5 h-5 text-gray-400" />
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Current Usage</span>
                                        <span className="text-sm font-medium text-gray-900">{formatPercentage(data.overview.budgetUtilization)}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full"
                                            style={{ width: `${data.overview.budgetUtilization}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-gray-500">22% remaining budget</p>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                                    <Zap className="w-5 h-5 text-gray-400" />
                                </div>
                                <div className="space-y-2">
                                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                                        Generate Report
                                    </button>
                                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                                        Export Data
                                    </button>
                                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                                        Schedule Review
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {selectedMetric === 'trends' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Revenue Trend */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
                                    <TrendingUp className="w-5 h-5 text-gray-400" />
                                </div>
                                <div className="space-y-2">
                                    {data.trends.revenue.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">{item.month}</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-green-500 h-2 rounded-full"
                                                        style={{ width: `${(item.value / 200000) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-medium text-gray-900 w-20 text-right">
                                                    {formatCurrency(item.value)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Project Activity */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Project Activity</h3>
                                    <Calendar className="w-5 h-5 text-gray-400" />
                                </div>
                                <div className="space-y-2">
                                    {data.trends.projects.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">{item.month}</span>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                    <span className="text-sm text-gray-700">{item.completed} completed</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                    <span className="text-sm text-gray-700">{item.started} started</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {selectedMetric === 'performance' && (
                    <div className="space-y-6">
                        {/* Top Performers */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Top Performers</h3>
                                <Award className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="space-y-4">
                                {data.performance.topPerformers.map((performer, index) => (
                                    <div key={performer.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                        <div className="flex-shrink-0">
                                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                                                {performer.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-sm font-medium text-gray-900">{performer.name}</h4>
                                                <span className="text-xs text-gray-500">#{index + 1}</span>
                                            </div>
                                            <p className="text-sm text-gray-600">{performer.role}</p>
                                            <div className="flex items-center gap-4 mt-1">
                                                <span className="text-xs text-gray-500">
                                                    {performer.projectsCompleted} projects completed
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {performer.productivityScore}% productivity
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <div className="w-16 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-500 h-2 rounded-full"
                                                    style={{ width: `${performer.productivityScore}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Project Health */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Project Health</h3>
                                <Activity className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="space-y-4">
                                {data.performance.projectHealth.map(project => (
                                    <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-sm font-medium text-gray-900">{project.name}</h4>
                                            <span className={`text-xs px-2 py-1 rounded-full ${getRiskColor(project.riskLevel)}`}>
                                                {project.riskLevel} risk
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 mb-3">
                                            <div>
                                                <p className="text-xs text-gray-500">Progress</p>
                                                <p className="text-sm font-medium text-gray-900">{formatPercentage(project.progress)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Budget Used</p>
                                                <p className="text-sm font-medium text-gray-900">{formatPercentage(project.budgetUsed)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Timeline</p>
                                                <p className="text-sm font-medium text-gray-900 capitalize">{project.timelineStatus}</p>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-500 h-2 rounded-full"
                                                style={{ width: `${project.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {selectedMetric === 'insights' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Recommendations */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900">Recommendations</h3>
                                    <Zap className="w-5 h-5 text-gray-400" />
                                </div>
                                <div className="space-y-4">
                                    {data.insights.recommendations.map(recommendation => (
                                        <div key={recommendation.id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="text-sm font-medium text-gray-900">{recommendation.title}</h4>
                                                <div className="flex gap-1">
                                                    <span className={`text-xs px-2 py-1 rounded-full ${getImpactColor(recommendation.impact)}`}>
                                                        {recommendation.impact} impact
                                                    </span>
                                                    <span className={`text-xs px-2 py-1 rounded-full ${getImpactColor(recommendation.effort)}`}>
                                                        {recommendation.effort} effort
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">{recommendation.description}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-500">{recommendation.category}</span>
                                                <button className="text-xs text-blue-600 hover:text-blue-800">
                                                    Implement
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Alerts */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
                                    <AlertTriangle className="w-5 h-5 text-gray-400" />
                                </div>
                                <div className="space-y-4">
                                    {data.insights.alerts.map(alert => (
                                        <div key={alert.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="flex-shrink-0 mt-0.5">
                                                {getAlertIcon(alert.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-medium text-gray-900">{alert.title}</h4>
                                                <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                                                <p className="text-xs text-gray-500 mt-2">
                                                    {new Date(alert.timestamp).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
