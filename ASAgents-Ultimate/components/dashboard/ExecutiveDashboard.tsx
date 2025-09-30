import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
    TrendingUp, TrendingDown, Users, Building, AlertTriangle,
    DollarSign, CheckCircle, Clock, Target, Zap
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { backendApi } from '../../services/backendApiService';
import './ExecutiveDashboard.css';

// Simple Chart Components
interface SimpleChartData {
    name: string;
    value: number;
    color?: string;
}

const SimpleBarChart: React.FC<{ data: SimpleChartData[]; height?: number }> = ({ data, height = 200 }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    const chartClass = `chart-container chart-container-${height}`;

    return (
        <div className={chartClass}>
            {data.map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                    <div className="w-20 text-sm text-gray-600">{item.name}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                        <div
                            className={`h-full rounded-full ${item.color || 'bg-blue-500'} flex items-center justify-end pr-2`}
                            style={{ width: `${(item.value / maxValue) * 100}%` }}
                        >
                            <span className="text-white text-xs font-medium">{item.value}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const SimplePieChart: React.FC<{ data: SimpleChartData[]; size?: number }> = ({ data, size = 200 }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

    return (
        <div className="flex items-center justify-center" style={{ height: size }}>
            <div className="grid grid-cols-2 gap-4">
                {data.map((item, index) => {
                    const percentage = ((item.value / total) * 100).toFixed(1);
                    return (
                        <div key={index} className="flex items-center space-x-2">
                            <div
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: colors[index % colors.length] }}
                            />
                            <span className="text-sm">{item.name}: {percentage}%</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const SimpleLineChart: React.FC<{ data: Array<{ month: string; value1: number; value2?: number }>; height?: number }> = ({ data, height = 200 }) => {
    return (
        <div className="space-y-2" style={{ height }}>
            <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                <span>Trends over time</span>
            </div>
            {data.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-1 border-b border-gray-100">
                    <span className="text-sm">{item.month}</span>
                    <div className="flex space-x-4">
                        <span className="text-sm font-medium text-blue-600">{item.value1}</span>
                        {item.value2 && <span className="text-sm font-medium text-green-600">{item.value2}</span>}
                    </div>
                </div>
            ))}
        </div>
    );
};

interface DashboardData {
    kpis: {
        active_projects: number;
        pending_tasks: number;
        team_size: number;
        total_budget: number;
        monthly_expenses: number;
        monthly_incidents: number;
    };
    alerts: Array<{
        type: 'warning' | 'error' | 'info';
        title: string;
        message: string;
        priority: 'low' | 'medium' | 'high' | 'critical';
    }>;
    trends: {
        projects: Array<{ month: string; projects_started: number }>;
        financial: Array<{ month: string; expenses: number }>;
        productivity: Array<{ month: string; tasks_created: number; tasks_completed: number }>;
    };
    analytics: {
        projectOverview: {
            statusBreakdown: Array<{ status: string; count: number; avg_duration: number }>;
            summary: {
                total_projects: number;
                completed: number;
                in_progress: number;
                planning: number;
                overdue: number;
            };
        };
        financialSummary: {
            budgetSummary: {
                total_budget: number;
                completed_budget: number;
                avg_budget: number;
            };
            expensesByCategory: Array<{ category: string; total_amount: number; count: number }>;
        };
        teamPerformance: {
            individualPerformance: Array<{
                name: string;
                role: string;
                total_tasks: number;
                completed_tasks: number;
                avg_completion_time: number;
                projects_involved: number;
            }>;
        };
    };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const ExecutiveDashboard: React.FC = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Mock data for now - replace with actual API calls when implemented
            const mockData: DashboardData = {
                kpis: {
                    active_projects: 23,
                    pending_tasks: 45,
                    team_size: 156,
                    total_budget: 2400000,
                    monthly_expenses: 180000,
                    monthly_incidents: 2
                },
                alerts: [
                    {
                        type: 'warning',
                        title: 'Budget Alert',
                        message: 'Budget variance in Project Alpha',
                        priority: 'high'
                    },
                    {
                        type: 'info',
                        title: 'Task Reminder',
                        message: '3 tasks due today',
                        priority: 'medium'
                    }
                ],
                trends: {
                    projects: [
                        { month: 'Jan', projects_started: 8 },
                        { month: 'Feb', projects_started: 6 },
                        { month: 'Mar', projects_started: 10 },
                        { month: 'Apr', projects_started: 7 }
                    ],
                    financial: [
                        { month: 'Jan', expenses: 150000 },
                        { month: 'Feb', expenses: 165000 },
                        { month: 'Mar', expenses: 180000 },
                        { month: 'Apr', expenses: 175000 }
                    ],
                    productivity: [
                        { month: 'Jan', tasks_created: 120, tasks_completed: 115 },
                        { month: 'Feb', tasks_created: 98, tasks_completed: 102 },
                        { month: 'Mar', tasks_created: 135, tasks_completed: 128 },
                        { month: 'Apr', tasks_created: 110, tasks_completed: 108 }
                    ]
                },
                analytics: {
                    projectOverview: {
                        statusBreakdown: [
                            { status: 'completed', count: 15, avg_duration: 90 },
                            { status: 'in_progress', count: 8, avg_duration: 45 },
                            { status: 'planning', count: 5, avg_duration: 15 }
                        ],
                        summary: {
                            total_projects: 28,
                            completed: 15,
                            in_progress: 8,
                            planning: 5,
                            overdue: 2
                        }
                    },
                    financialSummary: {
                        budgetSummary: {
                            total_budget: 2400000,
                            completed_budget: 1200000,
                            avg_budget: 85000
                        },
                        expensesByCategory: [
                            { category: 'Materials', total_amount: 450000, count: 25 },
                            { category: 'Labor', total_amount: 320000, count: 18 },
                            { category: 'Equipment', total_amount: 180000, count: 12 },
                            { category: 'Other', total_amount: 50000, count: 8 }
                        ]
                    },
                    teamPerformance: {
                        individualPerformance: [
                            {
                                name: 'John Smith',
                                role: 'Project Manager',
                                total_tasks: 45,
                                completed_tasks: 42,
                                avg_completion_time: 2.5,
                                projects_involved: 3
                            },
                            {
                                name: 'Sarah Johnson',
                                role: 'Senior Developer',
                                total_tasks: 68,
                                completed_tasks: 63,
                                avg_completion_time: 4.2,
                                projects_involved: 2
                            },
                            {
                                name: 'Mike Wilson',
                                role: 'Designer',
                                total_tasks: 32,
                                completed_tasks: 30,
                                avg_completion_time: 3.1,
                                projects_involved: 4
                            }
                        ]
                    }
                }
            };

            // TODO: Replace with actual API calls when backend is implemented
            // const [executiveData, analyticsData] = await Promise.all([
            //     backendApi.getExecutiveDashboard(),
            //     backendApi.getAnalytics()
            // ]);

            setData(mockData);
        } catch (err) {
            console.error('Failed to load dashboard data:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadDashboardData();
        setRefreshing(false);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('en-US').format(num);
    };

    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'error':
                return <AlertTriangle className="h-4 w-4 text-red-500" />;
            case 'warning':
                return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            default:
                return <AlertTriangle className="h-4 w-4 text-blue-500" />;
        }
    };

    const getAlertColor = (priority: string) => {
        switch (priority) {
            case 'critical':
                return 'bg-red-100 border-red-500';
            case 'high':
                return 'bg-orange-100 border-orange-500';
            case 'medium':
                return 'bg-yellow-100 border-yellow-500';
            default:
                return 'bg-blue-100 border-blue-500';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
                <p className="text-lg text-gray-600">{error}</p>
                <Button onClick={loadDashboardData} className="mt-4">
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Executive Dashboard</h1>
                    <p className="text-gray-600">Welcome back, {user?.email}</p>
                </div>
                <Button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center space-x-2"
                >
                    {refreshing ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                        <Zap className="h-4 w-4" />
                    )}
                    <span>Refresh</span>
                </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm">Active Projects</p>
                                <p className="text-2xl font-bold">{data.kpis.active_projects}</p>
                            </div>
                            <Building className="h-8 w-8 text-blue-200" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm">Pending Tasks</p>
                                <p className="text-2xl font-bold">{data.kpis.pending_tasks}</p>
                            </div>
                            <Clock className="h-8 w-8 text-green-200" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm">Team Size</p>
                                <p className="text-2xl font-bold">{data.kpis.team_size}</p>
                            </div>
                            <Users className="h-8 w-8 text-purple-200" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-yellow-100 text-sm">Total Budget</p>
                                <p className="text-2xl font-bold">{formatCurrency(data.kpis.total_budget)}</p>
                            </div>
                            <DollarSign className="h-8 w-8 text-yellow-200" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-red-100 text-sm">Monthly Expenses</p>
                                <p className="text-2xl font-bold">{formatCurrency(data.kpis.monthly_expenses)}</p>
                            </div>
                            <TrendingDown className="h-8 w-8 text-red-200" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm">Safety Incidents</p>
                                <p className="text-2xl font-bold">{data.kpis.monthly_incidents}</p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-orange-200" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Alerts Section */}
            {data.alerts.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            <span>System Alerts</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data.alerts.map((alert, index) => (
                                <div
                                    key={index}
                                    className={`border-l-4 p-4 rounded ${getAlertColor(alert.priority)}`}
                                >
                                    <div className="flex items-start space-x-3">
                                        {getAlertIcon(alert.type)}
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                                                <Badge variant={alert.priority === 'critical' ? 'danger' : 'secondary'}>
                                                    {alert.priority}
                                                </Badge>
                                            </div>
                                            <p className="text-gray-600 mt-1">{alert.message}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Project Status Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>Project Status Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <SimplePieChart
                            data={data.analytics.projectOverview.statusBreakdown.map(item => ({
                                name: item.status,
                                value: item.count
                            }))}
                        />
                    </CardContent>
                </Card>

                {/* Financial Trends */}
                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Expenses Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <SimpleLineChart
                            data={data.trends.financial.map(item => ({
                                month: item.month,
                                value1: item.expenses
                            }))}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Productivity Trends */}
                <Card>
                    <CardHeader>
                        <CardTitle>Task Productivity Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <SimpleLineChart
                            data={data.trends.productivity.map(item => ({
                                month: item.month,
                                value1: item.tasks_created,
                                value2: item.tasks_completed
                            }))}
                        />
                    </CardContent>
                </Card>

                {/* Expenses by Category */}
                <Card>
                    <CardHeader>
                        <CardTitle>Expenses by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <SimpleBarChart
                            data={data.analytics.financialSummary.expensesByCategory.map(item => ({
                                name: item.category,
                                value: item.total_amount
                            }))}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Team Performance Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Team Performance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-3 font-semibold">Team Member</th>
                                    <th className="text-left p-3 font-semibold">Role</th>
                                    <th className="text-right p-3 font-semibold">Total Tasks</th>
                                    <th className="text-right p-3 font-semibold">Completed</th>
                                    <th className="text-right p-3 font-semibold">Completion Rate</th>
                                    <th className="text-right p-3 font-semibold">Avg. Time (days)</th>
                                    <th className="text-right p-3 font-semibold">Projects</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.analytics.teamPerformance.individualPerformance.map((member, index) => {
                                    const completionRate = member.total_tasks > 0
                                        ? Math.round((member.completed_tasks / member.total_tasks) * 100)
                                        : 0;

                                    return (
                                        <tr key={index} className="border-b hover:bg-gray-50">
                                            <td className="p-3">
                                                <div>
                                                    <p className="font-medium text-gray-900">{member.name}</p>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <Badge variant="outline">{member.role}</Badge>
                                            </td>
                                            <td className="text-right p-3">{member.total_tasks}</td>
                                            <td className="text-right p-3">{member.completed_tasks}</td>
                                            <td className="text-right p-3">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <span>{completionRate}%</span>
                                                    <div className="w-16 h-2 bg-gray-200 rounded-full">
                                                        <div
                                                            className={`h-full rounded-full progress-bar-${completionRate >= 80 ? 'green' : completionRate >= 60 ? 'yellow' : 'red'}`}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-right p-3">
                                                {member.avg_completion_time ? Math.round(member.avg_completion_time) : '-'}
                                            </td>
                                            <td className="text-right p-3">{member.projects_involved}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};