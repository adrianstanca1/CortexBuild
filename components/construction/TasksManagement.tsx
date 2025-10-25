/**
 * Tasks & Assignments Management - Complete task tracking system
 * Features: Create, assign, track, and complete tasks within projects
 */

import React, { useState, useEffect } from 'react';
import {
    CheckSquare, Plus, Search, Edit2, Trash2, Users, Calendar,
    Clock, AlertCircle, CheckCircle, XCircle, Flag, Filter,
    User, Tag, MoreVertical, Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase/client';

interface Task {
    id: string;
    title: string;
    description?: string;
    project_id: string;
    project_name?: string;
    assignee?: string;
    assignee_name?: string;
    status: 'todo' | 'in_progress' | 'review' | 'completed' | 'blocked';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    due_date?: string;
    target_roles?: any;
    attachments?: any;
    comments?: any;
    history?: any;
    due_date_notified?: boolean;
    created_at: string;
    updated_at?: string;
}

interface TasksManagementProps {
    currentUser: any;
    projectId?: string; // Optional: filter by specific project
}

const TasksManagement: React.FC<TasksManagementProps> = ({ currentUser, projectId }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterPriority, setFilterPriority] = useState<string>('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        project_id: projectId || '',
        assignee: '',
        status: 'todo' as Task['status'],
        priority: 'medium' as Task['priority'],
        due_date: ''
    });

    useEffect(() => {
        loadProjects();
        loadTasks();
    }, [projectId]);

    const loadProjects = async () => {
        try {
            let query = supabase.from('projects').select('id, name');

            if (currentUser?.role === 'company_admin' && currentUser?.companyId) {
                query = query.eq('company_id', currentUser.companyId);
            }

            const { data, error } = await query;
            if (error) throw error;
            setProjects(data || []);
        } catch (error) {
            console.error('Error loading projects:', error);
        }
    };

    const loadTasks = async () => {
        try {
            setLoading(true);

            let query = supabase
                .from('tasks')
                .select(`
                    *,
                    projects:project_id (name)
                `);

            if (projectId) {
                query = query.eq('project_id', projectId);
            } else if (currentUser?.role === 'company_admin' && currentUser?.companyId) {
                // Filter by company's projects
                const { data: companyProjects } = await supabase
                    .from('projects')
                    .select('id')
                    .eq('company_id', currentUser.companyId);

                const projectIds = companyProjects?.map(p => p.id) || [];
                if (projectIds.length > 0) {
                    query = query.in('project_id', projectIds);
                }
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;

            // Transform data to include project names
            const transformedTasks = (data || []).map((task: any) => ({
                ...task,
                project_name: task.projects?.name
            }));

            setTasks(transformedTasks);
        } catch (error) {
            console.error('Error loading tasks:', error);
            toast.error('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const { data, error } = await supabase
                .from('tasks')
                .insert({
                    title: formData.title,
                    description: formData.description,
                    project_id: formData.project_id,
                    assignee: formData.assignee || null,
                    status: formData.status,
                    priority: formData.priority,
                    due_date: formData.due_date || null,
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;

            toast.success('Task created successfully!');
            setShowCreateModal(false);
            resetForm();
            loadTasks();
        } catch (error) {
            console.error('Error creating task:', error);
            toast.error('Failed to create task');
        }
    };

    const handleUpdateTask = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedTask) return;

        try {
            const { error } = await supabase
                .from('tasks')
                .update({
                    title: formData.title,
                    description: formData.description,
                    project_id: formData.project_id,
                    assignee: formData.assignee || null,
                    status: formData.status,
                    priority: formData.priority,
                    due_date: formData.due_date || null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', selectedTask.id);

            if (error) throw error;

            toast.success('Task updated successfully!');
            setShowEditModal(false);
            setSelectedTask(null);
            resetForm();
            loadTasks();
        } catch (error) {
            console.error('Error updating task:', error);
            toast.error('Failed to update task');
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!confirm('Are you sure you want to delete this task?')) {
            return;
        }

        try {
            const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', taskId);

            if (error) throw error;

            toast.success('Task deleted successfully!');
            loadTasks();
        } catch (error) {
            console.error('Error deleting task:', error);
            toast.error('Failed to delete task');
        }
    };

    const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
        try {
            const updateData: any = {
                status: newStatus,
                updated_at: new Date().toISOString()
            };

            if (newStatus === 'completed') {
                updateData.completed_date = new Date().toISOString();
            }

            const { error } = await supabase
                .from('tasks')
                .update(updateData)
                .eq('id', taskId);

            if (error) throw error;

            toast.success('Task status updated!');
            loadTasks();
        } catch (error) {
            console.error('Error updating task status:', error);
            toast.error('Failed to update task status');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            project_id: projectId || '',
            assignee: '',
            status: 'todo',
            priority: 'medium',
            due_date: ''
        });
    };

    const openEditModal = (task: Task) => {
        setSelectedTask(task);
        setFormData({
            title: task.title,
            description: task.description || '',
            project_id: task.project_id,
            assignee: task.assignee || '',
            status: task.status,
            priority: task.priority,
            due_date: task.due_date || ''
        });
        setShowEditModal(true);
    };

    // Filter tasks
    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
        const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;

        return matchesSearch && matchesStatus && matchesPriority;
    });

    // Calculate stats
    const stats = {
        total: tasks.length,
        todo: tasks.filter(t => t.status === 'todo').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        completed: tasks.filter(t => t.status === 'completed').length,
        overdue: tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length
    };

    const getStatusColor = (status: Task['status']) => {
        const colors = {
            todo: 'bg-gray-100 text-gray-800',
            in_progress: 'bg-blue-100 text-blue-800',
            review: 'bg-yellow-100 text-yellow-800',
            completed: 'bg-green-100 text-green-800',
            blocked: 'bg-red-100 text-red-800'
        };
        return colors[status];
    };

    const getPriorityColor = (priority: Task['priority']) => {
        const colors = {
            low: 'bg-gray-100 text-gray-600',
            medium: 'bg-blue-100 text-blue-600',
            high: 'bg-orange-100 text-orange-600',
            urgent: 'bg-red-100 text-red-600'
        };
        return colors[priority];
    };

    const getPriorityIcon = (priority: Task['priority']) => {
        const icons = {
            low: <Flag className="w-4 h-4" />,
            medium: <Flag className="w-4 h-4" />,
            high: <Flag className="w-4 h-4" />,
            urgent: <AlertCircle className="w-4 h-4" />
        };
        return icons[priority];
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <CheckSquare className="w-8 h-8 text-blue-600" />
                            Tasks & Assignments
                        </h1>
                        <p className="text-gray-600 mt-2">Track and manage project tasks</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Create Task
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Tasks</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <CheckSquare className="w-12 h-12 text-gray-400" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">To Do</p>
                                <p className="text-3xl font-bold text-gray-600">{stats.todo}</p>
                            </div>
                            <Clock className="w-12 h-12 text-gray-400" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-600 mb-1">In Progress</p>
                                <p className="text-3xl font-bold text-blue-600">{stats.inProgress}</p>
                            </div>
                            <Clock className="w-12 h-12 text-blue-400" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-md border border-green-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-600 mb-1">Completed</p>
                                <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                            </div>
                            <CheckCircle className="w-12 h-12 text-green-400" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-md border border-red-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-red-600 mb-1">Overdue</p>
                                <p className="text-3xl font-bold text-red-600">{stats.overdue}</p>
                            </div>
                            <AlertCircle className="w-12 h-12 text-red-400" />
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100 flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search tasks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        aria-label="Filter by status"
                        title="Filter by status"
                    >
                        <option value="all">All Status</option>
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="review">Review</option>
                        <option value="completed">Completed</option>
                        <option value="blocked">Blocked</option>
                    </select>

                    <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        aria-label="Filter by priority"
                        title="Filter by priority"
                    >
                        <option value="all">All Priority</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                    </select>
                </div>
            </div>

            {/* Tasks List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : filteredTasks.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center shadow-md">
                    <CheckSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No tasks found</h3>
                    <p className="text-gray-600 mb-6">Get started by creating your first task</p>
                    <button
                        type="button"
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
                    >
                        Create Task
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredTasks.map((task) => (
                        <div
                            key={task.id}
                            className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                            {task.status.replace('_', ' ').toUpperCase()}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getPriorityColor(task.priority)}`}>
                                            {getPriorityIcon(task.priority)}
                                            {task.priority.toUpperCase()}
                                        </span>
                                    </div>
                                    {task.description && (
                                        <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                                    )}
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                        {task.project_name && (
                                            <div className="flex items-center gap-1">
                                                <CheckSquare className="w-4 h-4" />
                                                {task.project_name}
                                            </div>
                                        )}
                                        {task.assignee && (
                                            <div className="flex items-center gap-1">
                                                <User className="w-4 h-4" />
                                                {task.assignee}
                                            </div>
                                        )}
                                        {task.due_date && (
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                Due: {new Date(task.due_date).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => openEditModal(task)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Edit task"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteTask(task.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete task"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Quick Status Change */}
                            <div className="flex gap-2 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => handleStatusChange(task.id, 'todo')}
                                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${task.status === 'todo' ? 'bg-gray-200 text-gray-800' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                                >
                                    To Do
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleStatusChange(task.id, 'in_progress')}
                                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${task.status === 'in_progress' ? 'bg-blue-200 text-blue-800' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                                >
                                    In Progress
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleStatusChange(task.id, 'review')}
                                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${task.status === 'review' ? 'bg-yellow-200 text-yellow-800' : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'}`}
                                >
                                    Review
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleStatusChange(task.id, 'completed')}
                                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${task.status === 'completed' ? 'bg-green-200 text-green-800' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                                >
                                    Completed
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Task Modal - will add in next edit */}
        </div>
    );
};

export default TasksManagement;

