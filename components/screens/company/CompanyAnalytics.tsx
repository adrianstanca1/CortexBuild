import React, { useState, useEffect } from 'react';
import { User } from '../../../types';
import { supabase } from '../../../lib/supabase/client';
import toast from 'react-hot-toast';
import { BarChart3, TrendingUp, Users, CheckCircle, DollarSign, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface AnalyticsData {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalRevenue: number;
    monthlyRevenue: number;
    teamProductivity: number;
    completionRate: number;
    budgetUtilization: number;
    monthlyData: Array<{ month: string; revenue: number; projects: number }>;
}

interface CompanyAnalyticsProps {
    currentUser: User;
}

const CompanyAnalytics: React.FC<CompanyAnalyticsProps> = ({ currentUser }) => {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [dateRange, setDateRange] = useState({ start: '2024-01-01', end: '2024-12-31' });

    useEffect(() => {
        loadAnalytics();
    }, [currentUser, dateRange]);

    const loadAnalytics = async () => {
        try {
            setIsLoading(true);
            const { data: projects, error: projectsError } = await supabase
                .from('projects')
                .select('id, status, budget, progress, created_at')
                .eq('company_id', currentUser.companyId);

            if (projectsError) throw projectsError;

            const totalProjects = projects?.length || 0;
            const activeProjects = projects?.filter(p => p.status === 'active').length || 0;
            const completedProjects = projects?.filter(p => p.status === 'completed').length || 0;
            const totalRevenue = projects?.reduce((sum, p) => sum + (p.budget || 0), 0) || 0;
            const completionRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;

            setAnalytics({
                totalProjects,
                activeProjects,
                completedProjects,
                totalRevenue,
                monthlyRevenue: totalRevenue / 12,
                teamProductivity: Math.min(100, (activeProjects / Math.max(totalProjects, 1)) * 100),
                completionRate,
                budgetUtilization: 65,
                monthlyData: [
                    { month: 'Jan', revenue: totalRevenue * 0.08, projects: Math.floor(totalProjects * 0.1) },
                    { month: 'Feb', revenue: totalRevenue * 0.09, projects: Math.floor(totalProjects * 0.12) },
                    { month: 'Mar', revenue: totalRevenue * 0.1, projects: Math.floor(totalProjects * 0.15) },
                    { month: 'Apr', revenue: totalRevenue * 0.09, projects: Math.floor(totalProjects * 0.14) },
                    { month: 'May', revenue: totalRevenue * 0.11, projects: Math.floor(totalProjects * 0.16) },
                    { month: 'Jun', revenue: totalRevenue * 0.12, projects: Math.floor(totalProjects * 0.18) }
                ]
            });
        } catch (error) {
            console.error('Error loading analytics:', error);
            toast.error('Failed to load analytics');
        } finally {
            setIsLoading(false);
        }
    };

    const exportToPDF = () => {
        if (!analytics) return;

        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text('Company Analytics Report', 14, 15);
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 25);

        const data = [
            ['Metric', 'Value'],
            ['Total Projects', analytics.totalProjects.toString()],
            ['Active Projects', analytics.activeProjects.toString()],
            ['Completed Projects', analytics.completedProjects.toString()],
            ['Total Revenue', `$${analytics.totalRevenue.toLocaleString()}`],
            ['Monthly Revenue', `$${analytics.monthlyRevenue.toLocaleString()}`],
            ['Completion Rate', `${analytics.completionRate.toFixed(1)}%`],
            ['Team Productivity', `${analytics.teamProductivity.toFixed(1)}%`],
            ['Budget Utilization', `${analytics.budgetUtilization.toFixed(1)}%`]
        ];

        (doc as any).autoTable({
            head: [data[0]],
            body: data.slice(1),
            startY: 35
        });

        doc.save('company-analytics.pdf');
        toast.success('Analytics exported to PDF');
    };

    const exportToCSV = () => {
        if (!analytics) return;

        const csv = [
            ['Company Analytics Report'],
            [`Generated: ${new Date().toLocaleDateString()}`],
            [],
            ['Metric', 'Value'],
            ['Total Projects', analytics.totalProjects],
            ['Active Projects', analytics.activeProjects],
            ['Completed Projects', analytics.completedProjects],
            ['Total Revenue', analytics.totalRevenue],
            ['Monthly Revenue', analytics.monthlyRevenue],
            ['Completion Rate', `${analytics.completionRate.toFixed(1)}%`],
            ['Team Productivity', `${analytics.teamProductivity.toFixed(1)}%`],
            ['Budget Utilization', `${analytics.budgetUtilization.toFixed(1)}%`]
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'company-analytics.csv';
        a.click();
        toast.success('Analytics exported to CSV');
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-24 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600">No analytics data available</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <BarChart3 className="w-8 h-8 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Company Analytics</h2>
                </div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={exportToPDF}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                        <Download className="w-4 h-4" />
                        PDF
                    </button>
                    <button
                        type="button"
                        onClick={exportToCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                        <Download className="w-4 h-4" />
                        CSV
                    </button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Total Projects</span>
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{analytics.totalProjects}</p>
                    <p className="text-xs text-gray-600 mt-2">{analytics.activeProjects} active</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Total Revenue</span>
                        <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">${(analytics.totalRevenue / 1000).toFixed(1)}K</p>
                    <p className="text-xs text-gray-600 mt-2">${(analytics.monthlyRevenue / 1000).toFixed(1)}K/month</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Completion Rate</span>
                        <CheckCircle className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{analytics.completionRate.toFixed(1)}%</p>
                    <p className="text-xs text-gray-600 mt-2">{analytics.completedProjects} completed</p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Team Productivity</span>
                        <TrendingUp className="w-5 h-5 text-orange-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{analytics.teamProductivity.toFixed(1)}%</p>
                    <p className="text-xs text-gray-600 mt-2">Active engagement</p>
                </div>
            </div>

            {/* Monthly Trends */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
                <div className="space-y-3">
                    {analytics.monthlyData.map((month, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600 w-12">{month.month}</span>
                            <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${(month.revenue / (analytics.totalRevenue / 6)) * 100}%` }}
                                ></div>
                            </div>
                            <span className="text-sm font-semibold text-gray-900 w-24 text-right">
                                ${(month.revenue / 1000).toFixed(1)}K
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CompanyAnalytics;

