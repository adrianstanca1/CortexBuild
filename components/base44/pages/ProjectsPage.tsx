/**
 * Projects Page - Connected to CortexBuild API
 * Version: 1.1.0 GOLDEN
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ProjectDetailPage } from './ProjectDetailPage';
import { CreateProjectModal } from '../modals/CreateProjectModal';

interface Project {
    id: number | string;
    name: string;
    client: string;
    location?: string;
    budget?: number;
    spent?: number;
    progress?: number;
    status: string;
    priority?: string;
    startDate?: string | null;
    endDate?: string | null;
}

const formatCurrency = (amount?: number | null) => {
    if (!amount) return '£0';
    return `£${amount.toLocaleString('en-GB')}`;
};

const formatDate = (value?: string | null) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

const normalizeProject = (raw: any): Project => {
    const budget = typeof raw.budget === 'number' ? raw.budget : Number(raw.budget) || undefined;
    const spent = typeof raw.spent === 'number' ? raw.spent : Number(raw.spent) || undefined;
    const progress = typeof raw.progress === 'number' ? raw.progress : Number(raw.progress) || undefined;

    return {
        id: raw.id ?? raw.project_id ?? `project-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: raw.name ?? raw.project_name ?? 'Untitled Project',
        client: raw.client ?? raw.client_name ?? raw.clientName ?? 'Unknown Client',
        location: raw.location ?? raw.site_location,
        budget,
        spent,
        progress,
        status: (raw.status ?? 'planning').toString().toLowerCase(),
        priority: raw.priority ?? raw.project_priority,
        startDate: formatDate(raw.start_date ?? raw.startDate),
        endDate: formatDate(raw.end_date ?? raw.endDate)
    };
};

const MOCK_PROJECTS: Project[] = [
    {
        id: '1',
        name: 'ASasdad',
        client: 'Green Valley Homes',
        location: 'rm82ul',
        budget: 123333,
        spent: 0,
        progress: 0,
        status: 'planning',
        priority: 'medium',
        startDate: null,
        endDate: null
    },
    {
        id: '2',
        name: 'Downtown Office Complex',
        client: 'Metro Construction Group',
        location: 'Manhattan, NY',
        budget: 12500000,
        spent: 5200000,
        progress: 45,
        status: 'in progress',
        priority: 'high',
        startDate: '15 Jan 2024',
        endDate: '30 Jun 2025'
    },
    {
        id: '3',
        name: 'Riverside Luxury Apartments',
        client: 'Green Valley Homes',
        location: 'Los Angeles, CA',
        budget: 8900000,
        spent: 2100000,
        progress: 28,
        status: 'in progress',
        priority: 'medium',
        startDate: '01 Mar 2024',
        endDate: '31 Aug 2025'
    }
];

export const ProjectsPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [selectedProjectId, setSelectedProjectId] = useState<string | number | null>(null);
    const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Fetch projects from API
    const fetchProjects = useCallback(async () => {
        try {
            const params = new URLSearchParams({
                page: '1',
                limit: '20'
            });

            if (searchQuery) params.append('search', searchQuery);
            if (statusFilter !== 'all') params.append('status', statusFilter);

            const response = await fetch(`/api/projects?${params}`);
            const data = await response.json();

            if (data.success) {
                const normalized = Array.isArray(data.data) ? data.data.map(normalizeProject) : [];
                setProjects(normalized.length > 0 ? normalized : MOCK_PROJECTS);
                if (!normalized.length) {
                    setError('No projects found for the selected filters.');
                }
                setTotalPages(data.pagination?.totalPages || 1);
            } else {
                setError(data.error || 'Failed to fetch projects');
                setProjects(MOCK_PROJECTS);
            }
        } catch (err: any) {
            console.error('Failed to fetch projects:', err);
            // Fallback to mock data
            setProjects(MOCK_PROJECTS);
        } finally {
            setLoading(false);
        }
    }, [page, searchQuery, statusFilter]);

    useEffect(() => {
        if (!selectedProjectId) {
            fetchProjects();
        }
    }, [fetchProjects, selectedProjectId]);

    // If a project is selected, show the detail page
    if (selectedProjectId) {
        return <ProjectDetailPage projectId={String(selectedProjectId)} onBack={() => setSelectedProjectId(null)} />;
    }

    // Mock data as fallback
    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'planning': 'bg-yellow-100 text-yellow-800',
            'in progress': 'bg-blue-100 text-blue-800',
            'approved': 'bg-green-100 text-green-800',
            'completed': 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getPriorityColor = (priority: string) => {
        const colors: Record<string, string> = {
            'low': 'bg-gray-100 text-gray-800',
            'medium': 'bg-blue-100 text-blue-800',
            'high': 'bg-orange-100 text-orange-800',
            'critical': 'bg-red-100 text-red-800'
        };
        return colors[priority] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Projects</h1>
                        <p className="text-gray-600">Manage all your construction projects</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        {/* Search */}
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search projects..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                            />
                        </div>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Status</option>
                            <option value="planning">Planning</option>
                            <option value="in progress">In Progress</option>
                            <option value="approved">Approved</option>
                            <option value="completed">Completed</option>
                        </select>

                        {/* Type Filter */}
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Types</option>
                            <option value="residential">Residential</option>
                            <option value="commercial">Commercial</option>
                            <option value="industrial">Industrial</option>
                        </select>

                        {/* New Project Button */}
                        <button
                            type="button"
                            onClick={() => setShowCreateModal(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>New Project</span>
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                </div>
            )}

            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={`project-skeleton-${index}`} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                            <div className="h-5 bg-gray-200 rounded w-3/4 mb-4" />
                            <div className="space-y-2">
                                <div className="h-3 bg-gray-100 rounded w-full" />
                                <div className="h-3 bg-gray-100 rounded w-5/6" />
                                <div className="h-3 bg-gray-100 rounded w-2/3" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && projects.length === 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-600">
                    <p>No projects found. Try adjusting your filters or create a new project.</p>
                </div>
            )}

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <div
                        key={project.id}
                        onClick={() => setSelectedProjectId(String(project.id))}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer hover:scale-105"
                    >
                        {/* Header */}
                        <div className="mb-4">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(project.status)}`}>
                                        {project.status}
                                    </span>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(project.priority)}`}>
                                        {project.priority}
                                    </span>
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.name}</h3>
                            <p className="text-sm text-gray-600">{project.client || project.client_name || 'N/A'}</p>
                        </div>

                        {/* Details */}
                        <div className="space-y-2 mb-4">
                            <p className="text-sm text-gray-600">{project.location}</p>

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Budget:</span>
                                <span className="font-semibold text-gray-900">{formatCurrency(project.budget)}</span>
                            </div>

                            {project.spent > 0 && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Spent:</span>
                                    <span className="font-semibold text-gray-900">{formatCurrency(project.spent)}</span>
                                </div>
                            )}

                            {project.progress > 0 && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Progress:</span>
                                    <span className="font-semibold text-gray-900">{project.progress}%</span>
                                </div>
                            )}

                            {project.startDate && project.endDate && (
                                <div className="flex items-center text-xs text-gray-500 mt-2">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span>{project.startDate}</span>
                                    <span className="mx-1">→</span>
                                    <span>{project.endDate}</span>
                                </div>
                            )}
                        </div>

                        {/* View Details Button */}
                        <button
                            type="button"
                            className="w-full bg-gray-50 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span>View Details</span>
                        </button>
                    </div>
                ))}
            </div>

            {/* Create Project Modal */}
            <CreateProjectModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => {
                    fetchProjects();
                    setShowCreateModal(false);
                }}
            />
        </div>
    );
};
