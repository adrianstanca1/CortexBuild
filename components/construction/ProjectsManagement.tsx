/**
 * Projects Management - Complete CRUD operations for construction projects
 * Features: Create, Read, Update, Delete projects with team assignments
 */

import React, { useState, useEffect } from 'react';
import {
    FolderKanban, Plus, Search, Edit2, Trash2, Users, Calendar,
    MapPin, DollarSign, Clock, CheckCircle, AlertCircle, XCircle,
    TrendingUp, Filter, Eye, Settings, BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase/client';

interface Project {
    id: string;
    name: string;
    description?: string;
    location: string;
    status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
    start_date: string;
    end_date?: string;
    budget?: number;
    spent?: number;
    company_id: string;
    project_manager?: string;
    team_size?: number;
    progress?: number;
    created_at: string;
    updated_at?: string;
}

interface ProjectsManagementProps {
    currentUser: any;
}

const ProjectsManagement: React.FC<ProjectsManagementProps> = ({ currentUser }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        location: '',
        status: 'planning' as Project['status'],
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        budget: 0,
        project_manager: ''
    });

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            setLoading(true);

            // Filter by company if user is company admin
            let query = supabase.from('projects').select('*');

            if (currentUser?.role === 'company_admin' && currentUser?.companyId) {
                query = query.eq('company_id', currentUser.companyId);
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;

            setProjects(data || []);
        } catch (error) {
            console.error('Error loading projects:', error);
            toast.error('Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const { data, error } = await supabase
                .from('projects')
                .insert({
                    id: crypto.randomUUID(),
                    name: formData.name,
                    description: formData.description,
                    location: formData.location,
                    status: formData.status,
                    start_date: formData.start_date,
                    end_date: formData.end_date || null,
                    budget: formData.budget,
                    spent: 0,
                    progress: 0,
                    company_id: currentUser?.companyId || '',
                    project_manager: formData.project_manager,
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;

            toast.success('Project created successfully!');
            setShowCreateModal(false);
            resetForm();
            loadProjects();
        } catch (error) {
            console.error('Error creating project:', error);
            toast.error('Failed to create project');
        }
    };

    const handleUpdateProject = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedProject) return;

        try {
            const { error } = await supabase
                .from('projects')
                .update({
                    name: formData.name,
                    description: formData.description,
                    location: formData.location,
                    status: formData.status,
                    start_date: formData.start_date,
                    end_date: formData.end_date || null,
                    budget: formData.budget,
                    project_manager: formData.project_manager,
                    updated_at: new Date().toISOString()
                })
                .eq('id', selectedProject.id);

            if (error) throw error;

            toast.success('Project updated successfully!');
            setShowEditModal(false);
            setSelectedProject(null);
            resetForm();
            loadProjects();
        } catch (error) {
            console.error('Error updating project:', error);
            toast.error('Failed to update project');
        }
    };

    const handleDeleteProject = async (projectId: string) => {
        if (!confirm('Are you sure you want to delete this project? This will also delete all associated tasks and documents.')) {
            return;
        }

        try {
            const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', projectId);

            if (error) throw error;

            toast.success('Project deleted successfully!');
            loadProjects();
        } catch (error) {
            console.error('Error deleting project:', error);
            toast.error('Failed to delete project');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            location: '',
            status: 'planning',
            start_date: new Date().toISOString().split('T')[0],
            end_date: '',
            budget: 0,
            project_manager: ''
        });
    };

    const openEditModal = (project: Project) => {
        setSelectedProject(project);
        setFormData({
            name: project.name,
            description: project.description || '',
            location: project.location,
            status: project.status,
            start_date: project.start_date,
            end_date: project.end_date || '',
            budget: project.budget || 0,
            project_manager: project.project_manager || ''
        });
        setShowEditModal(true);
    };

    // Filter projects
    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.location.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || project.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800 border-green-200';
            case 'planning': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'on_hold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'completed': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return CheckCircle;
            case 'planning': return Clock;
            case 'on_hold': return AlertCircle;
            case 'completed': return CheckCircle;
            case 'cancelled': return XCircle;
            default: return Clock;
        }
    };

    const calculateProgress = (project: Project) => {
        if (project.progress !== undefined) return project.progress;

        // Calculate based on dates if no explicit progress
        if (project.start_date && project.end_date) {
            const start = new Date(project.start_date).getTime();
            const end = new Date(project.end_date).getTime();
            const now = Date.now();

            if (now < start) return 0;
            if (now > end) return 100;

            return Math.round(((now - start) / (end - start)) * 100);
        }

        return 0;
    };

    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const totalSpent = projects.reduce((sum, p) => sum + (p.spent || 0), 0);
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <FolderKanban className="w-8 h-8 text-blue-600" />
                            Projects Management
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Manage all construction projects, timelines, and budgets
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowCreateModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-lg"
                    >
                        <Plus className="w-5 h-5" />
                        Create Project
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Projects</p>
                                <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
                            </div>
                            <FolderKanban className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active Projects</p>
                                <p className="text-2xl font-bold text-green-600">{activeProjects}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Budget</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    ${totalBudget.toLocaleString()}
                                </p>
                            </div>
                            <DollarSign className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Completed</p>
                                <p className="text-2xl font-bold text-purple-600">{completedProjects}</p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search projects by name or location..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            aria-label="Filter by status"
                        >
                            <option value="all">All Status</option>
                            <option value="planning">Planning</option>
                            <option value="active">Active</option>
                            <option value="on_hold">On Hold</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Projects Grid */}
            {loading ? (
                <div className="p-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading projects...</p>
                </div>
            ) : filteredProjects.length === 0 ? (
                <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
                    <FolderKanban className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No projects found</p>
                    <button
                        type="button"
                        onClick={() => setShowCreateModal(true)}
                        className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Create your first project
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => {
                        const StatusIcon = getStatusIcon(project.status);
                        const progress = calculateProgress(project);

                        return (
                            <div
                                key={project.id}
                                className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-lg transition-shadow overflow-hidden"
                            >
                                {/* Project Header */}
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="text-lg font-semibold text-gray-900 flex-1">
                                            {project.name}
                                        </h3>
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeColor(project.status)}`}>
                                            {project.status.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                        <MapPin className="w-4 h-4" />
                                        <span>{project.location}</span>
                                    </div>

                                    {project.description && (
                                        <p className="text-sm text-gray-600 line-clamp-2">
                                            {project.description}
                                        </p>
                                    )}
                                </div>

                                {/* Project Details */}
                                <div className="p-6 space-y-4">
                                    {/* Progress Bar */}
                                    <div>
                                        <div className="flex items-center justify-between text-sm mb-2">
                                            <span className="text-gray-600">Progress</span>
                                            <span className="font-semibold text-gray-900">{progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Budget */}
                                    {project.budget && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <DollarSign className="w-4 h-4" />
                                                <span>Budget</span>
                                            </div>
                                            <span className="text-sm font-semibold text-gray-900">
                                                ${project.budget.toLocaleString()}
                                            </span>
                                        </div>
                                    )}

                                    {/* Timeline */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Calendar className="w-4 h-4" />
                                            <span>Timeline</span>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900">
                                            {new Date(project.start_date).toLocaleDateString()}
                                            {project.end_date && ` - ${new Date(project.end_date).toLocaleDateString()}`}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => openEditModal(project)}
                                        className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Edit project"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteProject(project.id)}
                                        className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete project"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create Project Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Project</h2>
                        <form onSubmit={handleCreateProject}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Project Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g., Downtown Office Complex"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows={3}
                                        placeholder="Brief description of the project..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Location *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g., New York, NY"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as Project['status'] })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        aria-label="Project status"
                                        title="Project status"
                                    >
                                        <option value="planning">Planning</option>
                                        <option value="active">Active</option>
                                        <option value="on_hold">On Hold</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Start Date *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        aria-label="Project start date"
                                        title="Project start date"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        aria-label="Project end date"
                                        title="Project end date"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Budget ($)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.budget}
                                        onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Project Manager
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.project_manager}
                                        onChange={(e) => setFormData({ ...formData, project_manager: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Manager name"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        resetForm();
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Create Project
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Project Modal */}
            {showEditModal && selectedProject && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Project</h2>
                        <form onSubmit={handleUpdateProject}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Project Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        aria-label="Project name"
                                        title="Project name"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows={3}
                                        aria-label="Project description"
                                        title="Project description"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Location *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        aria-label="Project location"
                                        title="Project location"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as Project['status'] })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        aria-label="Project status"
                                        title="Project status"
                                    >
                                        <option value="planning">Planning</option>
                                        <option value="active">Active</option>
                                        <option value="on_hold">On Hold</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Start Date *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        aria-label="Project start date"
                                        title="Project start date"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        aria-label="Project end date"
                                        title="Project end date"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Budget ($)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.budget}
                                        onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        aria-label="Project budget"
                                        title="Project budget"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Project Manager
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.project_manager}
                                        onChange={(e) => setFormData({ ...formData, project_manager: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        aria-label="Project manager"
                                        title="Project manager"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setSelectedProject(null);
                                        resetForm();
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectsManagement;

