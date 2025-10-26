import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Clock, Target, BarChart3, PieChart } from 'lucide-react';

interface User {
    id: string;
    name: string;
    role: string;
}

interface AnalyticsDashboardProps {
    currentUser: User;
    navigateTo: (screen: string, params?: any) => void;
    goBack: () => void;
}

interface ProjectMetrics {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalBudget: number;
    spentBudget: number;
    remainingBudget: number;
    totalTasks: number;
    completedTasks: number;
    totalTimeSpent: number;
    averageProjectDuration: number;
}

export const AnalyticsDashboardScreen: React.FC<AnalyticsDashboardProps> = ({ currentUser }) => {
    const [metrics, setMetrics] = useState<ProjectMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

    useEffect(() => {
        loadAnalytics();
    }, [timeRange]);

    const loadAnalytics = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/analytics?timeRange=${timeRange}`);
            const data = await response.json();

            if (data.success) {
                setMetrics(data.metrics);
            }
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
        );
    }

    if (!metrics) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-gray-500">Nu există date disponibile</p>
            </div>
        );
    }

    const budgetPercentage = metrics.totalBudget > 0
        ? (metrics.spentBudget / metrics.totalBudget) * 100
        : 0;

    const taskCompletionPercentage = metrics.totalTasks > 0
        ? (metrics.completedTasks / metrics.totalTasks) * 100
        : 0;

    const timeSpentHours = Math.floor(metrics.totalTimeSpent / 60);
    const avgDurationDays = Math.floor(metrics.averageProjectDuration);

    return (
        <div className="h-full overflow-y-auto bg-gray-50 p-6">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                    <p className="mt-2 text-gray-600">Analiză completă a performanțelor proiectelor</p>
                </div>

                {/* Time Range Selector */}
                <div className="mb-6 flex items-center justify-between rounded-lg bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Perioadă:</span>
                    </div>
                    <div className="flex gap-2">
                        {(['7d', '30d', '90d', 'all'] as const).map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${timeRange === range
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {range === '7d' ? '7 zile' : range === '30d' ? '30 zile' : range === '90d' ? '90 zile' : 'Toate'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Key Metrics Cards */}
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <MetricCard
                        title="Proiecte Active"
                        value={metrics.activeProjects}
                        total={metrics.totalProjects}
                        icon={<Target className="h-8 w-8 text-blue-600" />}
                        color="blue"
                        percentage={metrics.totalProjects > 0 ? (metrics.activeProjects / metrics.totalProjects) * 100 : 0}
                    />
                    <MetricCard
                        title="Buget Utilizat"
                        value={`${metrics.spentBudget.toLocaleString()}`}
                        total={`${metrics.totalBudget.toLocaleString()}`}
                        unit="lei"
                        icon={<DollarSign className="h-8 w-8 text-green-600" />}
                        color="green"
                        percentage={budgetPercentage}
                    />
                    <MetricCard
                        title="Task-uri Finalizate"
                        value={metrics.completedTasks}
                        total={metrics.totalTasks}
                        icon={<TrendingUp className="h-8 w-8 text-purple-600" />}
                        color="purple"
                        percentage={taskCompletionPercentage}
                    />
                    <MetricCard
                        title="Timp Petrecut"
                        value={`${timeSpentHours}h`}
                        total={`${avgDurationDays} zile (medie)`}
                        icon={<Clock className="h-8 w-8 text-orange-600" />}
                        color="orange"
                        percentage={0}
                    />
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Budget Tracking */}
                    <ChartCard title="Tracking Buget" icon={<PieChart />}>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Cheltuit</span>
                                <span className="text-lg font-semibold text-green-600">
                                    {metrics.spentBudget.toLocaleString()} lei
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Rămas</span>
                                <span className="text-lg font-semibold text-blue-600">
                                    {metrics.remainingBudget.toLocaleString()} lei
                                </span>
                            </div>
                            <div className="relative h-6 w-full overflow-hidden rounded-full bg-gray-200">
                                <div
                                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                                    style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                                />
                            </div>
                            <p className="text-center text-sm text-gray-500">
                                {budgetPercentage.toFixed(1)}% utilizat din buget total
                            </p>
                        </div>
                    </ChartCard>

                    {/* Project Progress */}
                    <ChartCard title="Progres Proiecte" icon={<BarChart3 />}>
                        <div className="space-y-4">
                            <ProgressBar label="Finalizate" value={metrics.completedProjects} total={metrics.totalProjects} color="blue" />
                            <ProgressBar label="În desfășurare" value={metrics.activeProjects} total={metrics.totalProjects} color="green" />
                            <ProgressBar label="Planificate" value={metrics.totalProjects - metrics.activeProjects - metrics.completedProjects} total={metrics.totalProjects} color="gray" />
                        </div>
                    </ChartCard>

                    {/* Task Completion */}
                    <ChartCard title="Completare Task-uri" icon={<Target />}>
                        <div className="flex h-48 items-center justify-center">
                            <div className="text-center">
                                <div className="text-5xl font-bold text-purple-600">{taskCompletionPercentage.toFixed(0)}%</div>
                                <p className="mt-2 text-sm text-gray-600">
                                    {metrics.completedTasks} din {metrics.totalTasks} task-uri finalizate
                                </p>
                            </div>
                        </div>
                    </ChartCard>

                    {/* Time Analysis */}
                    <ChartCard title="Analiză Timp" icon={<Clock />}>
                        <div className="space-y-4">
                            <div className="rounded-lg bg-orange-50 p-4">
                                <div className="text-sm text-gray-600">Timp total petrecut</div>
                                <div className="mt-1 text-2xl font-bold text-orange-600">{timeSpentHours} ore</div>
                            </div>
                            <div className="rounded-lg bg-blue-50 p-4">
                                <div className="text-sm text-gray-600">Durată medie proiect</div>
                                <div className="mt-1 text-2xl font-bold text-blue-600">{avgDurationDays} zile</div>
                            </div>
                        </div>
                    </ChartCard>
                </div>
            </div>
        </div>
    );
};

interface MetricCardProps {
    title: string;
    value: string | number;
    total: string | number;
    unit?: string;
    icon: React.ReactNode;
    color: 'blue' | 'green' | 'purple' | 'orange';
    percentage: number;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, total, unit = '', icon, color, percentage }) => {
    const colorClasses = {
        blue: 'from-blue-50 to-blue-100',
        green: 'from-green-50 to-green-100',
        purple: 'from-purple-50 to-purple-100',
        orange: 'from-orange-50 to-orange-100',
    };

    return (
        <div className={`rounded-lg bg-gradient-to-br ${colorClasses[color]} p-6 shadow-sm`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">
                        {value} {unit}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">din {total} {unit}</p>
                </div>
                <div className="opacity-80">{icon}</div>
            </div>
            {percentage > 0 && (
                <div className="mt-4">
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/50">
                        <div
                            className={`absolute left-0 top-0 h-full bg-${color}-600 transition-all duration-500`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                    </div>
                    <p className="mt-1 text-xs text-gray-600">{percentage.toFixed(0)}% complet</p>
                </div>
            )}
        </div>
    );
};

interface ChartCardProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, icon, children }) => {
    return (
        <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
                <div className="text-gray-600">{icon}</div>
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
            {children}
        </div>
    );
};

interface ProgressBarProps {
    label: string;
    value: number;
    total: number;
    color: 'blue' | 'green' | 'gray';
}

const ProgressBar: React.FC<ProgressBarProps> = ({ label, value, total, color }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    const colorClasses = {
        blue: 'bg-blue-600',
        green: 'bg-green-600',
        gray: 'bg-gray-600',
    };

    return (
        <div>
            <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">{label}</span>
                <span className="text-sm font-semibold text-gray-900">
                    {value} ({percentage.toFixed(0)}%)
                </span>
            </div>
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                    className={`absolute left-0 top-0 h-full ${colorClasses[color]} transition-all duration-500`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                />
            </div>
        </div>
    );
};
