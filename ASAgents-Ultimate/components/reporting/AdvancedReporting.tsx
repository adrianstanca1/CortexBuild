import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
    BarChart3, PieChart, TrendingUp, Download, Filter,
    Calendar, Users, DollarSign, Activity,
    Building2, Shield, Clock, Target
} from 'lucide-react';

interface ReportData {
    id: string;
    name: string;
    type: 'financial' | 'safety' | 'productivity' | 'compliance';
    period: string;
    status: 'generated' | 'generating' | 'scheduled';
    lastGenerated: string;
    size: string;
}

interface ChartData {
    label: string;
    value: number;
    change?: number;
}

export const AdvancedReporting: React.FC = () => {
    const [reports, setReports] = useState<ReportData[]>([]);
    const [selectedPeriod, setSelectedPeriod] = useState('month');
    const [selectedType, setSelectedType] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        setLoading(true);
        try {
            // Mock report data
            setReports([
                {
                    id: 'rpt-001',
                    name: 'Monthly Financial Summary',
                    type: 'financial',
                    period: 'September 2025',
                    status: 'generated',
                    lastGenerated: '2025-09-28T09:00:00Z',
                    size: '2.4 MB'
                },
                {
                    id: 'rpt-002',
                    name: 'Safety Incidents Report',
                    type: 'safety',
                    period: 'Q3 2025',
                    status: 'generating',
                    lastGenerated: '2025-09-25T14:30:00Z',
                    size: '1.1 MB'
                },
                {
                    id: 'rpt-003',
                    name: 'Team Productivity Analysis',
                    type: 'productivity',
                    period: 'September 2025',
                    status: 'generated',
                    lastGenerated: '2025-09-27T11:15:00Z',
                    size: '3.8 MB'
                },
                {
                    id: 'rpt-004',
                    name: 'Compliance Audit Report',
                    type: 'compliance',
                    period: 'Q3 2025',
                    status: 'scheduled',
                    lastGenerated: '2025-08-31T16:45:00Z',
                    size: '5.2 MB'
                }
            ]);
        } catch (error) {
            console.error('Failed to load reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const getReportIcon = (type: string) => {
        switch (type) {
            case 'financial':
                return <DollarSign className="h-5 w-5 text-green-500" />;
            case 'safety':
                return <Shield className="h-5 w-5 text-red-500" />;
            case 'productivity':
                return <Activity className="h-5 w-5 text-blue-500" />;
            case 'compliance':
                return <Target className="h-5 w-5 text-purple-500" />;
            default:
                return <BarChart3 className="h-5 w-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string): 'outline' | 'secondary' | 'success' => {
        switch (status) {
            case 'generated':
                return 'success';
            case 'generating':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    const getTypeColor = (type: string): 'outline' | 'secondary' | 'success' => {
        switch (type) {
            case 'financial':
                return 'success';
            case 'safety':
                return 'secondary';
            case 'productivity':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    // Mock chart data
    const projectProgress: ChartData[] = [
        { label: 'Completed', value: 65, change: 8 },
        { label: 'In Progress', value: 28, change: -2 },
        { label: 'Not Started', value: 7, change: -6 }
    ];

    const monthlyExpenses: ChartData[] = [
        { label: 'Jan', value: 85000 },
        { label: 'Feb', value: 92000 },
        { label: 'Mar', value: 78000 },
        { label: 'Apr', value: 103000 },
        { label: 'May', value: 94000 },
        { label: 'Jun', value: 87000 },
        { label: 'Jul', value: 96000 },
        { label: 'Aug', value: 89000 },
        { label: 'Sep', value: 105000 }
    ];

    const safetyMetrics: ChartData[] = [
        { label: 'Days without incident', value: 45 },
        { label: 'Safety training completed', value: 95 },
        { label: 'Equipment inspections', value: 87 },
        { label: 'Compliance score', value: 92 }
    ];

    const SimpleBarChart: React.FC<{ data: ChartData[]; title: string }> = ({ data, title }) => {
        const maxValue = Math.max(...data.map(d => d.value));

        return (
            <div className="space-y-4">
                <h4 className="font-medium text-gray-900">{title}</h4>
                <div className="space-y-3">
                    {data.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 min-w-0 flex-1 mr-3">{item.label}</span>
                            <div className="flex items-center space-x-3 flex-1">
                                <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-32">
                                    <div
                                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                        data-width={`${(item.value / maxValue) * 100}%`}
                                    ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-900 min-w-0">
                                    {typeof item.value === 'number' && item.value > 1000
                                        ? `$${(item.value / 1000).toFixed(0)}k`
                                        : item.value
                                    }
                                    {item.change && (
                                        <span className={`ml-2 text-xs ${item.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {item.change > 0 ? '+' : ''}{item.change}%
                                        </span>
                                    )}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const SimplePieChart: React.FC<{ data: ChartData[]; title: string }> = ({ data, title }) => {
        const total = data.reduce((sum, item) => sum + item.value, 0);

        const getColorClass = (index: number): string => {
            switch (index % 5) {
                case 0: return 'bg-blue-500';
                case 1: return 'bg-green-500';
                case 2: return 'bg-yellow-500';
                case 3: return 'bg-red-500';
                default: return 'bg-purple-500';
            }
        };

        return (
            <div className="space-y-4">
                <h4 className="font-medium text-gray-900">{title}</h4>
                <div className="space-y-2">
                    {data.map((item, index) => (
                        <div key={`pie-${item.label}-${index}`} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${getColorClass(index)}`}></div>
                                <span className="text-sm text-gray-600">{item.label}</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                                {((item.value / total) * 100).toFixed(1)}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const filteredReports = reports.filter(report => {
        const matchesType = selectedType === 'all' || report.type === selectedType;
        return matchesType;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Advanced Reporting</h1>
                    <p className="text-gray-600">Generate comprehensive reports and analytics</p>
                </div>
                <div className="flex items-center space-x-3">
                    <Button variant="outline" className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>Schedule Report</span>
                    </Button>
                    <Button className="flex items-center space-x-2">
                        <BarChart3 className="h-4 w-4" />
                        <span>Generate Report</span>
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Projects</p>
                                <p className="text-3xl font-bold text-gray-900">24</p>
                                <p className="text-sm text-green-500 mt-1">
                                    <TrendingUp className="inline h-3 w-3 mr-1" />
                                    +12% from last month
                                </p>
                            </div>
                            <Building2 className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active Workers</p>
                                <p className="text-3xl font-bold text-gray-900">156</p>
                                <p className="text-sm text-blue-500 mt-1">
                                    <Users className="inline h-3 w-3 mr-1" />
                                    8 new this week
                                </p>
                            </div>
                            <Users className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Monthly Budget</p>
                                <p className="text-3xl font-bold text-gray-900">$1.2M</p>
                                <p className="text-sm text-red-500 mt-1">
                                    <TrendingUp className="inline h-3 w-3 mr-1" />
                                    +5% over budget
                                </p>
                            </div>
                            <DollarSign className="h-8 w-8 text-yellow-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Safety Score</p>
                                <p className="text-3xl font-bold text-gray-900">94%</p>
                                <p className="text-sm text-green-500 mt-1">
                                    <Shield className="inline h-3 w-3 mr-1" />
                                    Above industry avg
                                </p>
                            </div>
                            <Shield className="h-8 w-8 text-red-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <SimpleBarChart data={monthlyExpenses} title="Monthly Expenses Trend" />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <SimplePieChart data={projectProgress} title="Project Status Distribution" />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <SimpleBarChart data={safetyMetrics} title="Safety Metrics" />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-900">Recent Activity</h4>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <Clock className="h-4 w-4 text-gray-500" />
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-900">Safety report generated</p>
                                        <p className="text-xs text-gray-500">2 hours ago</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Clock className="h-4 w-4 text-gray-500" />
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-900">Financial summary completed</p>
                                        <p className="text-xs text-gray-500">4 hours ago</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Clock className="h-4 w-4 text-gray-500" />
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-900">Productivity analysis started</p>
                                        <p className="text-xs text-gray-500">6 hours ago</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                        aria-label="Filter reports by type"
                    >
                        <option value="all">All Report Types</option>
                        <option value="financial">Financial</option>
                        <option value="safety">Safety</option>
                        <option value="productivity">Productivity</option>
                        <option value="compliance">Compliance</option>
                    </select>
                </div>
                <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                        aria-label="Filter reports by period"
                    >
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="quarter">This Quarter</option>
                        <option value="year">This Year</option>
                    </select>
                </div>
            </div>

            {/* Reports List */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="text-left py-3 px-4 font-medium text-gray-900">Report</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-900">Period</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-900">Last Generated</th>
                                    <th className="text-right py-3 px-4 font-medium text-gray-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredReports.map((report) => (
                                    <tr key={report.id} className="hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center space-x-3">
                                                {getReportIcon(report.type)}
                                                <div>
                                                    <div className="font-medium text-gray-900">{report.name}</div>
                                                    <div className="text-sm text-gray-500">{report.size}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <Badge variant={getTypeColor(report.type)}>
                                                {report.type}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-500">
                                            {report.period}
                                        </td>
                                        <td className="py-3 px-4">
                                            <Badge variant={getStatusColor(report.status)}>
                                                {report.status}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-500">
                                            {new Date(report.lastGenerated).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Button variant="ghost" size="sm">
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm">
                                                    <BarChart3 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {filteredReports.length === 0 && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <BarChart3 className="h-16 w-16 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
                        <p className="text-gray-500 mb-4">
                            No reports match your current filters.
                        </p>
                        <Button>
                            <PieChart className="h-4 w-4 mr-2" />
                            Generate New Report
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};