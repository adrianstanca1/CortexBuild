import React, { useState, useEffect, useMemo } from 'react';
import {
    LayoutDashboard, TrendingUp, Users, Clock, DollarSign,
    Calendar, CheckCircle, AlertCircle, Package, Target,
    Activity, BarChart3, PieChart, ArrowUp, ArrowDown,
    Filter, Search, Download, RefreshCw, Eye, Edit
} from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import toast from 'react-hot-toast';

interface Project {
    id: string;
    name: string;
    description: string;
    status: string;
    priority: string;
    budget: number;
    spent: number;
    start_date: string;
    end_date: string;
    progress: number;
    team_size: number;
    tasks_total: number;
    tasks_completed: number;
    created_at: string;
}

interface ProjectDashboardProps {
    currentUser?: any;
}

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ currentUser }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedPriority, setSelectedPriority] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateRange, setDateRange] = useState(30);

    const statuses = [
        { value: 'all', label: 'All Status' },
        { value: 'planning', label: 'Planning' },
        { value: 'active', label: 'Active' },
        { value: 'on_hold', label: 'On Hold' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' }
    ];

    const priorities = [
        { value: 'all', label: 'All Priorities' },
        { value: 'critical', label: 'Critical' },
        { value: 'high', label: 'High' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' }
    ];

    useEffect(() => {
        loadProjects();
    }, [currentUser?.companyId]);

    const loadProjects = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('company_id', currentUser?.companyId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Enhance projects with calculated metrics
            const enhancedProjects = await Promise.all((data || []).map(async (project: any) => {
                const [tasksResult, teamResult] = await Promise.all([
                    supabase
                        .from('tasks')
                        .select('id, status', { count: 'exact' })
                        .eq('project_id', project.id),
                    supabase
                        .from('users')
                        .select('id', { count: 'exact' })
                        .eq('companyId', currentUser?.companyId)
                ]);

                const tasks = tasksResult.data || [];
                const tasksCompleted = tasks.filter((t: any) => t.status === 'completed').length;
                const progress = tasks.length > 0 ? (tasksCompleted / tasks.length) * 100 : 0;

                return {
                    ...project,
                    tasks_total: tasks.length,
                    tasks_completed: tasksCompleted,
                    progress: Math.round(progress),
                    team_size: teamResult.count || 0,
                    spent: project.budget ? project.budget * 0.65 : 0 // Mock spent amount
                };
            }));

            setProjects(enhancedProjects);
        } catch (error: any) {
            console.error('Error loading projects:', error);
            toast.error('Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    const filteredProjects = useMemo(() => {
        return projects.filter(project => {
            const matchesSearch = !searchQuery ||
                project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                project.description?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus;
            const matchesPriority = selectedPriority === 'all' || project.priority === selectedPriority;

            return matchesSearch && matchesStatus && matchesPriority;
        });
    }, [projects, searchQuery, selectedStatus, selectedPriority]);

    const stats = useMemo(() => {
        const now = Date.now();
        const periodMs = dateRange * 24 * 60 * 60 * 1000;
        const periodStart = now - periodMs;

        const recentProjects = projects.filter(p =>
            new Date(p.created_at).getTime() >= periodStart
        );

        const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
        const totalSpent = projects.reduce((sum, p) => sum + (p.spent || 0), 0);
        const avgProgress = projects.length > 0
            ? projects.reduce((sum, p) => sum + p.progress, 0) / projects.length
            : 0;

        return {
            total: projects.length,
            active: projects.filter(p => p.status === 'active').length,
            completed: projects.filter(p => p.status === 'completed').length,
            onHold: projects.filter(p => p.status === 'on_hold').length,
            totalBudget,
            totalSpent,
            budgetUtilization: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
            avgProgress: Math.round(avgProgress),
            recentCount: recentProjects.length,
            criticalCount: projects.filter(p => p.priority === 'critical' && p.status === 'active').length
        };
    }, [projects, dateRange]);

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            planning: 'bg-blue-100 text-blue-800',
            active: 'bg-green-100 text-green-800',
            on_hold: 'bg-yellow-100 text-yellow-800',
            completed: 'bg-purple-100 text-purple-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return colors[status] || colors.planning;
    };

    const getPriorityColor = (priority: string) => {
        const colors: Record<string, string> = {
            critical: 'bg-red-100 text-red-800',
            high: 'bg-orange-100 text-orange-800',
            medium: 'bg-yellow-100 text-yellow-800',
            low: 'bg-green-100 text-green-800'
        };
        return colors[priority] || colors.medium;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                        <LayoutDashboard className="w-10 h-10 text-blue-600" />
                        Project Dashboard
                    </h1>
                    <p className="text-gray-600">Comprehensive project overview and analytics</p>
                </div>
                <div className="flex gap-3">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(Number(e.target.value))}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        aria-label="Select date range"
                    >
                        <option value={7}>Last 7 days</option>
                        <option value={30}>Last 30 days</option>
                        <option value={90}>Last 90 days</option>
                        <option value={365}>Last year</option>
                    </select>
                    <button
                        type="button"
                        onClick={loadProjects}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Total Projects</p>
                        <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                    <p className="text-sm text-gray-500 mt-1">{stats.recentCount} new this period</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Active Projects</p>
                        <Activity className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                    <p className="text-sm text-gray-500 mt-1">{stats.criticalCount} critical priority</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Avg Progress</p>
                        <Target className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-3xl font-bold text-purple-600">{stats.avgProgress}%</p>
                    <p className="text-sm text-gray-500 mt-1">{stats.completed} completed</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Budget Usage</p>
                        <DollarSign className="w-5 h-5 text-orange-600" />
                    </div>
                    <p className="text-3xl font-bold text-orange-600">{Math.round(stats.budgetUtilization)}%</p>
                    <p className="text-sm text-gray-500 mt-1">{formatCurrency(stats.totalSpent)} of {formatCurrency(stats.totalBudget)}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100 mb-6">
                <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search projects..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        aria-label="Filter by status"
                    >
                        {statuses.map(status => (
                            <option key={status.value} value={status.value}>{status.label}</option>
                        ))}
                    </select>

                    <select
                        value={selectedPriority}
                        onChange={(e) => setSelectedPriority(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        aria-label="Filter by priority"
                    >
                        {priorities.map(priority => (
                            <option key={priority.value} value={priority.value}>{priority.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Projects List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : filteredProjects.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center shadow-md">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects found</h3>
                    <p className="text-gray-600">Try adjusting your filters or create a new project</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredProjects.map((project) => (
                        <div
                            key={project.id}
                            className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
                        >
                            {/* Project Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">{project.name}</h3>
                                    <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                                </div>
                                <div className="flex gap-2 ml-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                                        {project.status}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                                        {project.priority}
                                    </span>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">Progress</span>
                                    <span className="text-sm font-bold text-blue-600">{project.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all"
                                        style={{ width: `${project.progress}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <div>
                                        <p className="text-xs text-gray-500">Tasks</p>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {project.tasks_completed}/{project.tasks_total}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-blue-600" />
                                    <div>
                                        <p className="text-xs text-gray-500">Team</p>
                                        <p className="text-sm font-semibold text-gray-900">{project.team_size} members</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-orange-600" />
                                    <div>
                                        <p className="text-xs text-gray-500">Budget</p>
                                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(project.budget || 0)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-purple-600" />
                                    <div>
                                        <p className="text-xs text-gray-500">Deadline</p>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {project.end_date ? formatDate(project.end_date) : 'Not set'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Budget Progress */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">Budget Used</span>
                                    <span className="text-sm font-bold text-orange-600">
                                        {formatCurrency(project.spent || 0)}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all ${(project.spent / project.budget) * 100 > 90
                                                ? 'bg-red-600'
                                                : (project.spent / project.budget) * 100 > 75
                                                    ? 'bg-orange-600'
                                                    : 'bg-green-600'
                                            }`}
                                        style={{ width: `${Math.min((project.spent / project.budget) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    className="flex-1 px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Eye className="w-4 h-4" />
                                    View Details
                                </button>
                                <button
                                    type="button"
                                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Edit className="w-4 h-4" />
                                    Edit
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProjectDashboard;
