/**
 * RFI Management - Request for Information tracking
 * Features: Create, track, and respond to RFIs
 */

import React, { useState, useEffect } from 'react';
import {
    HelpCircle, Plus, Search, Edit2, Trash2, Calendar,
    Clock, CheckCircle, XCircle, AlertCircle, User,
    MessageSquare, FileText, Eye, Send
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase/client';

interface RFI {
    id: string;
    project_id: string;
    project_name?: string;
    rfi_number: string;
    subject: string;
    question: string;
    response?: string;
    status: 'open' | 'pending' | 'answered' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    requested_by: string;
    requested_by_name?: string;
    assigned_to?: string;
    assigned_to_name?: string;
    due_date?: string;
    response_date?: string;
    attachments?: string[];
    created_at: string;
    updated_at?: string;
}

interface RFIManagementProps {
    currentUser: any;
    projectId?: string;
}

const RFIManagement: React.FC<RFIManagementProps> = ({ currentUser, projectId }) => {
    const [rfis, setRfis] = useState<RFI[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterPriority, setFilterPriority] = useState<string>('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedRFI, setSelectedRFI] = useState<RFI | null>(null);

    const [formData, setFormData] = useState({
        project_id: projectId || '',
        subject: '',
        question: '',
        priority: 'medium' as RFI['priority'],
        assigned_to: '',
        due_date: ''
    });

    useEffect(() => {
        loadProjects();
        loadRFIs();
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

    const loadRFIs = async () => {
        try {
            setLoading(true);

            let query = supabase
                .from('rfis')
                .select(`
                    *,
                    projects:project_id (name),
                    requester:requested_by (name)
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

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;

            const transformedRFIs = (data || []).map((rfi: any) => ({
                ...rfi,
                project_name: rfi.projects?.name,
                requested_by_name: rfi.requester?.name
            }));

            setRfis(transformedRFIs);
        } catch (error) {
            console.error('Error loading RFIs:', error);
            toast.error('Failed to load RFIs');
        } finally {
            setLoading(false);
        }
    };

    const generateRFINumber = () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `RFI-${year}${month}-${random}`;
    };

    const handleCreateRFI = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const { data, error } = await supabase
                .from('rfis')
                .insert({
                    project_id: formData.project_id,
                    rfi_number: generateRFINumber(),
                    subject: formData.subject,
                    question: formData.question,
                    priority: formData.priority,
                    assigned_to: formData.assigned_to || null,
                    due_date: formData.due_date || null,
                    status: 'open',
                    requested_by: currentUser?.id,
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;

            toast.success('RFI created successfully!');
            setShowCreateModal(false);
            resetForm();
            loadRFIs();
        } catch (error) {
            console.error('Error creating RFI:', error);
            toast.error('Failed to create RFI');
        }
    };

    const handleDeleteRFI = async (rfiId: string) => {
        if (!confirm('Are you sure you want to delete this RFI?')) {
            return;
        }

        try {
            const { error } = await supabase
                .from('rfis')
                .delete()
                .eq('id', rfiId);

            if (error) throw error;

            toast.success('RFI deleted successfully!');
            loadRFIs();
        } catch (error) {
            console.error('Error deleting RFI:', error);
            toast.error('Failed to delete RFI');
        }
    };

    const handleStatusChange = async (rfiId: string, newStatus: RFI['status']) => {
        try {
            const updateData: any = {
                status: newStatus,
                updated_at: new Date().toISOString()
            };

            if (newStatus === 'answered') {
                updateData.response_date = new Date().toISOString();
            }

            const { error } = await supabase
                .from('rfis')
                .update(updateData)
                .eq('id', rfiId);

            if (error) throw error;

            toast.success('RFI status updated!');
            loadRFIs();
        } catch (error) {
            console.error('Error updating RFI status:', error);
            toast.error('Failed to update RFI status');
        }
    };

    const resetForm = () => {
        setFormData({
            project_id: projectId || '',
            subject: '',
            question: '',
            priority: 'medium',
            assigned_to: '',
            due_date: ''
        });
    };

    const filteredRFIs = rfis.filter(rfi => {
        const matchesSearch = rfi.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            rfi.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            rfi.rfi_number?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || rfi.status === filterStatus;
        const matchesPriority = filterPriority === 'all' || rfi.priority === filterPriority;

        return matchesSearch && matchesStatus && matchesPriority;
    });

    const stats = {
        total: rfis.length,
        open: rfis.filter(r => r.status === 'open').length,
        pending: rfis.filter(r => r.status === 'pending').length,
        answered: rfis.filter(r => r.status === 'answered').length,
        overdue: rfis.filter(r => r.due_date && new Date(r.due_date) < new Date() && r.status !== 'answered' && r.status !== 'closed').length
    };

    const getStatusColor = (status: RFI['status']) => {
        const colors = {
            open: 'bg-blue-100 text-blue-800',
            pending: 'bg-yellow-100 text-yellow-800',
            answered: 'bg-green-100 text-green-800',
            closed: 'bg-gray-100 text-gray-800'
        };
        return colors[status];
    };

    const getPriorityColor = (priority: RFI['priority']) => {
        const colors = {
            low: 'bg-gray-100 text-gray-600',
            medium: 'bg-blue-100 text-blue-600',
            high: 'bg-orange-100 text-orange-600',
            urgent: 'bg-red-100 text-red-600'
        };
        return colors[priority];
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <HelpCircle className="w-8 h-8 text-blue-600" />
                            RFI Management
                        </h1>
                        <p className="text-gray-600 mt-2">Request for Information tracking</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Create RFI
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total RFIs</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <HelpCircle className="w-12 h-12 text-gray-400" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-600 mb-1">Open</p>
                                <p className="text-3xl font-bold text-blue-600">{stats.open}</p>
                            </div>
                            <AlertCircle className="w-12 h-12 text-blue-400" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-md border border-yellow-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-yellow-600 mb-1">Pending</p>
                                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                            </div>
                            <Clock className="w-12 h-12 text-yellow-400" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-md border border-green-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-600 mb-1">Answered</p>
                                <p className="text-3xl font-bold text-green-600">{stats.answered}</p>
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
                                placeholder="Search RFIs..."
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
                    >
                        <option value="all">All Status</option>
                        <option value="open">Open</option>
                        <option value="pending">Pending</option>
                        <option value="answered">Answered</option>
                        <option value="closed">Closed</option>
                    </select>

                    <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        aria-label="Filter by priority"
                    >
                        <option value="all">All Priority</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                    </select>
                </div>
            </div>

            {/* RFI List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : filteredRFIs.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center shadow-md">
                    <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No RFIs found</h3>
                    <p className="text-gray-600 mb-6">Create your first Request for Information</p>
                    <button
                        type="button"
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
                    >
                        Create RFI
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredRFIs.map((rfi) => (
                        <div
                            key={rfi.id}
                            className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-lg text-sm font-mono">
                                            {rfi.rfi_number}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(rfi.status)}`}>
                                            {rfi.status.toUpperCase()}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(rfi.priority)}`}>
                                            {rfi.priority.toUpperCase()}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{rfi.subject}</h3>
                                    <div className="bg-blue-50 rounded-lg p-4 mb-3">
                                        <h4 className="font-medium text-blue-900 mb-2">Question:</h4>
                                        <p className="text-blue-800">{rfi.question}</p>
                                    </div>
                                    {rfi.response && (
                                        <div className="bg-green-50 rounded-lg p-4 mb-3">
                                            <h4 className="font-medium text-green-900 mb-2">Response:</h4>
                                            <p className="text-green-800">{rfi.response}</p>
                                        </div>
                                    )}
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                        {rfi.project_name && (
                                            <div className="flex items-center gap-1">
                                                <FileText className="w-4 h-4" />
                                                {rfi.project_name}
                                            </div>
                                        )}
                                        {rfi.requested_by_name && (
                                            <div className="flex items-center gap-1">
                                                <User className="w-4 h-4" />
                                                Requested by: {rfi.requested_by_name}
                                            </div>
                                        )}
                                        {rfi.due_date && (
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                Due: {new Date(rfi.due_date).toLocaleDateString()}
                                            </div>
                                        )}
                                        {rfi.response_date && (
                                            <div className="flex items-center gap-1 text-green-600">
                                                <CheckCircle className="w-4 h-4" />
                                                Answered: {new Date(rfi.response_date).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedRFI(rfi);
                                            setShowViewModal(true);
                                        }}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="View details"
                                    >
                                        <Eye className="w-5 h-5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteRFI(rfi.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete RFI"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Quick Status Change */}
                            <div className="flex gap-2 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => handleStatusChange(rfi.id, 'open')}
                                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${rfi.status === 'open' ? 'bg-blue-200 text-blue-800' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                                >
                                    Open
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleStatusChange(rfi.id, 'pending')}
                                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${rfi.status === 'pending' ? 'bg-yellow-200 text-yellow-800' : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'}`}
                                >
                                    Pending
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleStatusChange(rfi.id, 'answered')}
                                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${rfi.status === 'answered' ? 'bg-green-200 text-green-800' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                                >
                                    Answered
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleStatusChange(rfi.id, 'closed')}
                                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${rfi.status === 'closed' ? 'bg-gray-200 text-gray-800' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                                >
                                    Closed
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RFIManagement;

