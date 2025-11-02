/**
 * Daily Logs Management - Site inspection and progress tracking
 * Features: Create daily site reports, track progress, weather, safety incidents
 */

import React, { useState, useEffect } from 'react';
import {
    FileText, Plus, Search, Edit2, Trash2, Calendar,
    Cloud, AlertTriangle, Users, CheckCircle, Camera,
    Download, Filter, Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase/client';

interface DailyLog {
    id: string;
    project_id: string;
    project_name?: string;
    date: string;
    weather: string;
    temperature?: number;
    workers_count: number;
    hours_worked: number;
    work_completed: string;
    materials_used?: string;
    equipment_used?: string;
    safety_incidents?: string;
    delays?: string;
    notes?: string;
    photos?: string[];
    created_by: string;
    created_by_name?: string;
    created_at: string;
    updated_at?: string;
}

interface DailyLogsManagementProps {
    currentUser: any;
    projectId?: string;
}

const DailyLogsManagement: React.FC<DailyLogsManagementProps> = ({ currentUser, projectId }) => {
    const [logs, setLogs] = useState<DailyLog[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterProject, setFilterProject] = useState<string>('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedLog, setSelectedLog] = useState<DailyLog | null>(null);

    const [formData, setFormData] = useState({
        project_id: projectId || '',
        date: new Date().toISOString().split('T')[0],
        weather: 'Clear',
        temperature: 70,
        workers_count: 0,
        hours_worked: 8,
        work_completed: '',
        materials_used: '',
        equipment_used: '',
        safety_incidents: '',
        delays: '',
        notes: ''
    });

    useEffect(() => {
        loadProjects();
        loadLogs();
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

    const loadLogs = async () => {
        try {
            setLoading(true);

            let query = supabase
                .from('daily_logs')
                .select(`
                    *,
                    projects:project_id (name),
                    users:created_by (name)
                `);

            if (projectId) {
                query = query.eq('project_id', projectId);
            } else if (currentUser?.role === 'company_admin' && currentUser?.companyId) {
                const { data: companyProjects } = await supabase
                    .from('projects')
                    .select('id')
                    .eq('company_id', currentUser.companyId);

                const projectIds = companyProjects?.map(p => p.id) || [];
                if (projectIds.length > 0) {
                    query = query.in('project_id', projectIds);
                }
            }

            const { data, error } = await query.order('date', { ascending: false });

            if (error) throw error;

            const transformedLogs = (data || []).map((log: any) => ({
                ...log,
                project_name: log.projects?.name,
                created_by_name: log.users?.name
            }));

            setLogs(transformedLogs);
        } catch (error) {
            console.error('Error loading logs:', error);
            toast.error('Failed to load daily logs');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateLog = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const { data, error } = await supabase
                .from('daily_logs')
                .insert({
                    project_id: formData.project_id,
                    date: formData.date,
                    weather: formData.weather,
                    temperature: formData.temperature,
                    workers_count: formData.workers_count,
                    hours_worked: formData.hours_worked,
                    work_completed: formData.work_completed,
                    materials_used: formData.materials_used || null,
                    equipment_used: formData.equipment_used || null,
                    safety_incidents: formData.safety_incidents || null,
                    delays: formData.delays || null,
                    notes: formData.notes || null,
                    created_by: currentUser?.id,
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;

            toast.success('Daily log created successfully!');
            setShowCreateModal(false);
            resetForm();
            loadLogs();
        } catch (error) {
            console.error('Error creating log:', error);
            toast.error('Failed to create daily log');
        }
    };

    const handleDeleteLog = async (logId: string) => {
        if (!confirm('Are you sure you want to delete this daily log?')) {
            return;
        }

        try {
            const { error } = await supabase
                .from('daily_logs')
                .delete()
                .eq('id', logId);

            if (error) throw error;

            toast.success('Daily log deleted successfully!');
            loadLogs();
        } catch (error) {
            console.error('Error deleting log:', error);
            toast.error('Failed to delete daily log');
        }
    };

    const resetForm = () => {
        setFormData({
            project_id: projectId || '',
            date: new Date().toISOString().split('T')[0],
            weather: 'Clear',
            temperature: 70,
            workers_count: 0,
            hours_worked: 8,
            work_completed: '',
            materials_used: '',
            equipment_used: '',
            safety_incidents: '',
            delays: '',
            notes: ''
        });
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.work_completed?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.notes?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesProject = filterProject === 'all' || log.project_id === filterProject;

        return matchesSearch && matchesProject;
    });

    const stats = {
        total: logs.length,
        thisWeek: logs.filter(l => {
            const logDate = new Date(l.date);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return logDate >= weekAgo;
        }).length,
        totalWorkers: logs.reduce((sum, l) => sum + (l.workers_count || 0), 0),
        safetyIncidents: logs.filter(l => l.safety_incidents && l.safety_incidents.trim() !== '').length
    };

    const getWeatherIcon = (weather: string) => {
        const icons: Record<string, string> = {
            'Clear': '☀️',
            'Cloudy': '☁️',
            'Rain': '🌧️',
            'Snow': '❄️',
            'Windy': '💨'
        };
        return icons[weather] || '☀️';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <FileText className="w-8 h-8 text-blue-600" />
                            Daily Site Logs
                        </h1>
                        <p className="text-gray-600 mt-2">Track daily progress and site activities</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Create Log
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Logs</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <FileText className="w-12 h-12 text-gray-400" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-600 mb-1">This Week</p>
                                <p className="text-3xl font-bold text-blue-600">{stats.thisWeek}</p>
                            </div>
                            <Calendar className="w-12 h-12 text-blue-400" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-md border border-green-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-600 mb-1">Total Workers</p>
                                <p className="text-3xl font-bold text-green-600">{stats.totalWorkers}</p>
                            </div>
                            <Users className="w-12 h-12 text-green-400" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-md border border-red-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-red-600 mb-1">Safety Incidents</p>
                                <p className="text-3xl font-bold text-red-600">{stats.safetyIncidents}</p>
                            </div>
                            <AlertTriangle className="w-12 h-12 text-red-400" />
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
                                placeholder="Search logs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {!projectId && (
                        <select
                            value={filterProject}
                            onChange={(e) => setFilterProject(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            aria-label="Filter by project"
                        >
                            <option value="all">All Projects</option>
                            {projects.map(project => (
                                <option key={project.id} value={project.id}>{project.name}</option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            {/* Logs List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : filteredLogs.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center shadow-md">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No daily logs found</h3>
                    <p className="text-gray-600 mb-6">Start documenting your daily site activities</p>
                    <button
                        type="button"
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
                    >
                        Create Daily Log
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredLogs.map((log) => (
                        <div
                            key={log.id}
                            className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {new Date(log.date).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </h3>
                                        <span className="text-2xl">{getWeatherIcon(log.weather)}</span>
                                        {log.temperature && (
                                            <span className="text-sm text-gray-600">{log.temperature}°F</span>
                                        )}
                                    </div>
                                    {log.project_name && (
                                        <p className="text-sm text-gray-600 mb-3">
                                            <span className="font-medium">Project:</span> {log.project_name}
                                        </p>
                                    )}
                                    <div className="bg-gray-50 rounded-lg p-4 mb-3">
                                        <h4 className="font-medium text-gray-900 mb-2">Work Completed:</h4>
                                        <p className="text-gray-700">{log.work_completed}</p>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-blue-600" />
                                            <span className="text-gray-600">
                                                <span className="font-medium text-gray-900">{log.workers_count}</span> workers
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-green-600" />
                                            <span className="text-gray-600">
                                                <span className="font-medium text-gray-900">{log.hours_worked}</span> hours
                                            </span>
                                        </div>
                                        {log.safety_incidents && log.safety_incidents.trim() !== '' && (
                                            <div className="flex items-center gap-2">
                                                <AlertTriangle className="w-4 h-4 text-red-600" />
                                                <span className="text-red-600 font-medium">Safety Incident</span>
                                            </div>
                                        )}
                                        {log.delays && log.delays.trim() !== '' && (
                                            <div className="flex items-center gap-2">
                                                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                                                <span className="text-yellow-600 font-medium">Delays Reported</span>
                                            </div>
                                        )}
                                    </div>
                                    {(log.materials_used || log.equipment_used || log.notes) && (
                                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-sm">
                                            {log.materials_used && (
                                                <p className="text-gray-600">
                                                    <span className="font-medium text-gray-900">Materials:</span> {log.materials_used}
                                                </p>
                                            )}
                                            {log.equipment_used && (
                                                <p className="text-gray-600">
                                                    <span className="font-medium text-gray-900">Equipment:</span> {log.equipment_used}
                                                </p>
                                            )}
                                            {log.notes && (
                                                <p className="text-gray-600">
                                                    <span className="font-medium text-gray-900">Notes:</span> {log.notes}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedLog(log);
                                            setShowViewModal(true);
                                        }}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="View details"
                                    >
                                        <Eye className="w-5 h-5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteLog(log.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete log"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DailyLogsManagement;

