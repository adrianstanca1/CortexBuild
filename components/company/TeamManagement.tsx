import React, { useState, useEffect, useMemo } from 'react';
import {
    Users, UserPlus, Search, Filter, Mail, Phone, Calendar,
    Shield, Edit2, Trash2, MoreVertical, Award, Clock, CheckCircle,
    XCircle, AlertCircle, TrendingUp, UserCheck, UserX, Settings
} from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import toast from 'react-hot-toast';

interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: string;
    department?: string;
    phone?: string;
    status: string;
    joined_at: string;
    last_active?: string;
    projects_count?: number;
    tasks_completed?: number;
    avatar_url?: string;
}

interface TeamManagementProps {
    currentUser?: any;
}

const TeamManagement: React.FC<TeamManagementProps> = ({ currentUser }) => {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRole, setSelectedRole] = useState('all');
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
    const [memberForm, setMemberForm] = useState({
        name: '',
        email: '',
        role: 'developer',
        department: '',
        phone: '',
        status: 'active'
    });

    const roles = [
        { value: 'all', label: 'All Roles' },
        { value: 'company_admin', label: 'Company Admin' },
        { value: 'project_manager', label: 'Project Manager' },
        { value: 'developer', label: 'Developer' },
        { value: 'designer', label: 'Designer' },
        { value: 'qa', label: 'QA Engineer' }
    ];

    const departments = [
        { value: 'all', label: 'All Departments' },
        { value: 'engineering', label: 'Engineering' },
        { value: 'design', label: 'Design' },
        { value: 'product', label: 'Product' },
        { value: 'operations', label: 'Operations' },
        { value: 'sales', label: 'Sales' }
    ];

    const statuses = [
        { value: 'all', label: 'All Statuses' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'on_leave', label: 'On Leave' }
    ];

    useEffect(() => {
        loadMembers();
    }, []);

    const loadMembers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('companyId', currentUser?.companyId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Get additional stats for each member
            const membersWithStats = await Promise.all((data || []).map(async (member: any) => {
                const [projectsResult, tasksResult] = await Promise.all([
                    supabase.from('projects').select('id', { count: 'exact' }).eq('created_by', member.id),
                    supabase.from('tasks').select('id', { count: 'exact' }).eq('assigned_to', member.id).eq('status', 'completed')
                ]);

                return {
                    ...member,
                    projects_count: projectsResult.count || 0,
                    tasks_completed: tasksResult.count || 0,
                    joined_at: member.created_at,
                    status: member.status || 'active'
                };
            }));

            setMembers(membersWithStats);
        } catch (error: any) {
            console.error('Error loading members:', error);
            toast.error('Failed to load team members');
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from('users').insert({
                id: crypto.randomUUID(),
                name: memberForm.name,
                email: memberForm.email,
                role: memberForm.role,
                department: memberForm.department || null,
                phone: memberForm.phone || null,
                status: memberForm.status,
                companyId: currentUser?.companyId,
                created_at: new Date().toISOString()
            });

            if (error) throw error;

            toast.success('Team member added successfully!');
            setShowAddModal(false);
            setMemberForm({
                name: '',
                email: '',
                role: 'developer',
                department: '',
                phone: '',
                status: 'active'
            });
            loadMembers();
        } catch (error: any) {
            console.error('Error adding member:', error);
            toast.error('Failed to add team member');
        }
    };

    const handleUpdateMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMember) return;

        try {
            const { error } = await supabase
                .from('users')
                .update({
                    name: memberForm.name,
                    email: memberForm.email,
                    role: memberForm.role,
                    department: memberForm.department || null,
                    phone: memberForm.phone || null,
                    status: memberForm.status
                })
                .eq('id', selectedMember.id);

            if (error) throw error;

            toast.success('Team member updated successfully!');
            setShowEditModal(false);
            setSelectedMember(null);
            loadMembers();
        } catch (error: any) {
            console.error('Error updating member:', error);
            toast.error('Failed to update team member');
        }
    };

    const handleDeleteMember = async (memberId: string) => {
        if (!confirm('Are you sure you want to remove this team member?')) return;

        try {
            const { error } = await supabase
                .from('users')
                .delete()
                .eq('id', memberId);

            if (error) throw error;

            toast.success('Team member removed successfully!');
            loadMembers();
        } catch (error: any) {
            console.error('Error deleting member:', error);
            toast.error('Failed to remove team member');
        }
    };

    const openEditModal = (member: TeamMember) => {
        setSelectedMember(member);
        setMemberForm({
            name: member.name,
            email: member.email,
            role: member.role,
            department: member.department || '',
            phone: member.phone || '',
            status: member.status
        });
        setShowEditModal(true);
    };

    const filteredMembers = useMemo(() => {
        return members.filter(member => {
            const matchesSearch = !searchQuery ||
                member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                member.department?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesRole = selectedRole === 'all' || member.role === selectedRole;
            const matchesDepartment = selectedDepartment === 'all' || member.department === selectedDepartment;
            const matchesStatus = selectedStatus === 'all' || member.status === selectedStatus;

            return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
        });
    }, [members, searchQuery, selectedRole, selectedDepartment, selectedStatus]);

    const stats = useMemo(() => {
        return {
            total: members.length,
            active: members.filter(m => m.status === 'active').length,
            inactive: members.filter(m => m.status === 'inactive').length,
            onLeave: members.filter(m => m.status === 'on_leave').length
        };
    }, [members]);

    const getRoleColor = (role: string) => {
        const colors: Record<string, string> = {
            company_admin: 'bg-purple-100 text-purple-800',
            project_manager: 'bg-blue-100 text-blue-800',
            developer: 'bg-green-100 text-green-800',
            designer: 'bg-pink-100 text-pink-800',
            qa: 'bg-orange-100 text-orange-800'
        };
        return colors[role] || 'bg-gray-100 text-gray-800';
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            active: 'bg-green-100 text-green-800',
            inactive: 'bg-gray-100 text-gray-800',
            on_leave: 'bg-yellow-100 text-yellow-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <CheckCircle className="w-4 h-4" />;
            case 'inactive':
                return <XCircle className="w-4 h-4" />;
            case 'on_leave':
                return <AlertCircle className="w-4 h-4" />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Team Management</h1>
                    <p className="text-gray-600">Manage your team members, roles, and permissions</p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md"
                >
                    <UserPlus className="w-5 h-5" />
                    Add Member
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Total Members</p>
                        <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Active</p>
                        <UserCheck className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">On Leave</p>
                        <Clock className="w-5 h-5 text-yellow-600" />
                    </div>
                    <p className="text-3xl font-bold text-yellow-600">{stats.onLeave}</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Inactive</p>
                        <UserX className="w-5 h-5 text-gray-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-600">{stats.inactive}</p>
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
                                placeholder="Search members..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        aria-label="Filter by role"
                    >
                        {roles.map(role => (
                            <option key={role.value} value={role.value}>{role.label}</option>
                        ))}
                    </select>

                    <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        aria-label="Filter by department"
                    >
                        {departments.map(dept => (
                            <option key={dept.value} value={dept.value}>{dept.label}</option>
                        ))}
                    </select>

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
                </div>
            </div>

            {/* Members List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : filteredMembers.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center shadow-md">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No team members found</h3>
                    <p className="text-gray-600 mb-4">Get started by adding your first team member</p>
                    <button
                        type="button"
                        onClick={() => setShowAddModal(true)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Add Member
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredMembers.map((member) => (
                                    <tr key={member.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <span className="text-blue-600 font-medium">
                                                            {member.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{member.name}</div>
                                                    <div className="text-sm text-gray-500 flex items-center gap-1">
                                                        <Mail className="w-3 h-3" />
                                                        {member.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                                                {member.role.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {member.department || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getStatusColor(member.status)}`}>
                                                {getStatusIcon(member.status)}
                                                {member.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1">
                                                    <Award className="w-4 h-4 text-blue-600" />
                                                    <span>{member.tasks_completed || 0} tasks</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(member)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Edit member"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteMember(member.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Remove member"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add Member Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Add Team Member</h3>
                        <form onSubmit={handleAddMember}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={memberForm.name}
                                        onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                        aria-label="Team member name"
                                        title="Team member name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        value={memberForm.email}
                                        onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                        aria-label="Team member email"
                                        title="Team member email"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Role *
                                    </label>
                                    <select
                                        value={memberForm.role}
                                        onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                        aria-label="Team member role"
                                        title="Team member role"
                                    >
                                        <option value="developer">Developer</option>
                                        <option value="designer">Designer</option>
                                        <option value="project_manager">Project Manager</option>
                                        <option value="qa">QA Engineer</option>
                                        <option value="company_admin">Company Admin</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Department
                                    </label>
                                    <select
                                        value={memberForm.department}
                                        onChange={(e) => setMemberForm({ ...memberForm, department: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        aria-label="Team member department"
                                        title="Team member department"
                                    >
                                        <option value="">Select Department</option>
                                        <option value="engineering">Engineering</option>
                                        <option value="design">Design</option>
                                        <option value="product">Product</option>
                                        <option value="operations">Operations</option>
                                        <option value="sales">Sales</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={memberForm.phone}
                                        onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        aria-label="Team member phone"
                                        title="Team member phone"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status *
                                    </label>
                                    <select
                                        value={memberForm.status}
                                        onChange={(e) => setMemberForm({ ...memberForm, status: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                        aria-label="Team member status"
                                        title="Team member status"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="on_leave">On Leave</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setMemberForm({
                                            name: '',
                                            email: '',
                                            role: 'developer',
                                            department: '',
                                            phone: '',
                                            status: 'active'
                                        });
                                    }}
                                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Add Member
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Member Modal */}
            {showEditModal && selectedMember && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Team Member</h3>
                        <form onSubmit={handleUpdateMember}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={memberForm.name}
                                        onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                        aria-label="Team member name"
                                        title="Team member name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        value={memberForm.email}
                                        onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                        aria-label="Team member email"
                                        title="Team member email"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Role *
                                    </label>
                                    <select
                                        value={memberForm.role}
                                        onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                        aria-label="Team member role"
                                        title="Team member role"
                                    >
                                        <option value="developer">Developer</option>
                                        <option value="designer">Designer</option>
                                        <option value="project_manager">Project Manager</option>
                                        <option value="qa">QA Engineer</option>
                                        <option value="company_admin">Company Admin</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Department
                                    </label>
                                    <select
                                        value={memberForm.department}
                                        onChange={(e) => setMemberForm({ ...memberForm, department: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        aria-label="Team member department"
                                        title="Team member department"
                                    >
                                        <option value="">Select Department</option>
                                        <option value="engineering">Engineering</option>
                                        <option value="design">Design</option>
                                        <option value="product">Product</option>
                                        <option value="operations">Operations</option>
                                        <option value="sales">Sales</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={memberForm.phone}
                                        onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        aria-label="Team member phone"
                                        title="Team member phone"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status *
                                    </label>
                                    <select
                                        value={memberForm.status}
                                        onChange={(e) => setMemberForm({ ...memberForm, status: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                        aria-label="Team member status"
                                        title="Team member status"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="on_leave">On Leave</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setSelectedMember(null);
                                    }}
                                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Update Member
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamManagement;
