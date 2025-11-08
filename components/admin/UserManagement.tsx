/**
 * User Management - Complete CRUD operations for users
 * Features: Create, Read, Update, Delete users with role management
 */

import React, { useState, useEffect } from 'react';
import {
    Users, Plus, Search, Edit2, Trash2, Shield,
    CheckCircle, XCircle, Filter, Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase/client';

interface User {
    id: string;
    email: string;
    name: string;
    role: 'super_admin' | 'company_admin' | 'developer' | 'user';
    company_id?: string;
    avatar?: string;
    created_at: string;
    last_login?: string;
    status: 'active' | 'inactive' | 'suspended';
}

interface UserManagementProps {
    currentUser: any;
}

const UserManagement: React.FC<UserManagementProps> = ({ currentUser: _currentUser }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        role: 'user' as User['role'],
        company_id: '',
        password: ''
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            setUsers(data || []);
        } catch (error) {
            console.error('Error loading users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Simple password hashing using Web Crypto API
            const encoder = new TextEncoder();
            const data = encoder.encode(formData.password);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            const { error } = await supabase
                .from('users')
                .insert({
                    id: crypto.randomUUID(),
                    email: formData.email,
                    name: formData.name,
                    role: formData.role,
                    company_id: formData.company_id || null,
                    password: hashedPassword,
                    status: 'active',
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;

            toast.success('User created successfully!');
            setShowCreateModal(false);
            resetForm();
            loadUsers();
        } catch (error: any) {
            console.error('Error creating user:', error);
            toast.error(error.message || 'Failed to create user');
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedUser) return;

        try {
            const { error } = await supabase
                .from('users')
                .update({
                    name: formData.name,
                    role: formData.role,
                    company_id: formData.company_id || null
                })
                .eq('id', selectedUser.id);

            if (error) throw error;

            toast.success('User updated successfully!');
            setShowEditModal(false);
            setSelectedUser(null);
            resetForm();
            loadUsers();
        } catch (error) {
            console.error('Error updating user:', error);
            toast.error('Failed to update user');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        try {
            const { error } = await supabase
                .from('users')
                .delete()
                .eq('id', userId);

            if (error) throw error;

            toast.success('User deleted successfully!');
            loadUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error('Failed to delete user');
        }
    };

    const handleSuspendUser = async (userId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';

        try {
            const { error } = await supabase
                .from('users')
                .update({ status: newStatus })
                .eq('id', userId);

            if (error) throw error;

            toast.success(`User ${newStatus === 'suspended' ? 'suspended' : 'activated'} successfully!`);
            loadUsers();
        } catch (error) {
            console.error('Error updating user status:', error);
            toast.error('Failed to update user status');
        }
    };

    const resetForm = () => {
        setFormData({
            email: '',
            name: '',
            role: 'user',
            company_id: '',
            password: ''
        });
    };

    const openEditModal = (user: User) => {
        setSelectedUser(user);
        setFormData({
            email: user.email,
            name: user.name,
            role: user.role,
            company_id: user.company_id || '',
            password: ''
        });
        setShowEditModal(true);
    };

    // Filter users
    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.email || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = filterRole === 'all' || (user.role || 'user') === filterRole;
        const matchesStatus = filterStatus === 'all' || (user.status || 'inactive') === filterStatus;

        return matchesSearch && matchesRole && matchesStatus;
    });

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'super_admin': return 'bg-red-100 text-red-800 border-red-200';
            case 'company_admin': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'developer': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800 border-green-200';
            case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'suspended': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <Users className="w-8 h-8 text-blue-600" />
                            User Management
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Manage all platform users, roles, and permissions
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowCreateModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-lg"
                    >
                        <Plus className="w-5 h-5" />
                        Create User
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Users</p>
                                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                            </div>
                            <Users className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active Users</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {users.filter(u => u.status === 'active').length}
                                </p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Admins</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {users.filter(u => u.role.includes('admin')).length}
                                </p>
                            </div>
                            <Shield className="w-8 h-8 text-purple-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Suspended</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {users.filter(u => u.status === 'suspended').length}
                                </p>
                            </div>
                            <XCircle className="w-8 h-8 text-red-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search users by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            aria-label="Filter by role"
                            title="Filter users by role"
                        >
                            <option value="all">All Roles</option>
                            <option value="super_admin">Super Admin</option>
                            <option value="company_admin">Company Admin</option>
                            <option value="developer">Developer</option>
                            <option value="user">User</option>
                        </select>
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            aria-label="Filter by status"
                            title="Filter users by status"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-600 mt-4">Loading users...</p>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-12 text-center">
                        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No users found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                                        {(user.name || 'U').charAt(0).toUpperCase()}
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{user.name || 'Unknown'}</div>
                                                    <div className="text-sm text-gray-500">{user.email || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getRoleBadgeColor(user.role || 'user')}`}>
                                                {(user.role || 'user').replace('_', ' ').toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadgeColor(user.status || 'inactive')}`}>
                                                {(user.status || 'inactive').toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(user)}
                                                    className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                                    aria-label="Edit user"
                                                    title="Edit user"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleSuspendUser(user.id, user.status)}
                                                    className="text-yellow-600 hover:text-yellow-900 p-2 hover:bg-yellow-50 rounded-lg transition-colors"
                                                    aria-label={user.status === 'suspended' ? 'Activate user' : 'Suspend user'}
                                                    title={user.status === 'suspended' ? 'Activate user' : 'Suspend user'}
                                                >
                                                    <Lock className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                    aria-label="Delete user"
                                                    title="Delete user"
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
                )}
            </div>

            {/* Create User Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New User</h2>
                        <form onSubmit={handleCreateUser}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        aria-label="Email"
                                        title="Enter user email address"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        aria-label="Name"
                                        title="Enter user full name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        aria-label="Password"
                                        title="Enter user password"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Role
                                    </label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        aria-label="Role"
                                        title="Select user role"
                                    >
                                        <option value="user">User</option>
                                        <option value="developer">Developer</option>
                                        <option value="company_admin">Company Admin</option>
                                        <option value="super_admin">Super Admin</option>
                                    </select>
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
                                    Create User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit User</h2>
                        <form onSubmit={handleUpdateUser}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        disabled
                                        value={formData.email}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                                        aria-label="Email"
                                        title="Email address (cannot be changed)"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        aria-label="Name"
                                        title="Enter user full name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Role
                                    </label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        aria-label="Role"
                                        title="Select user role"
                                    >
                                        <option value="user">User</option>
                                        <option value="developer">Developer</option>
                                        <option value="company_admin">Company Admin</option>
                                        <option value="super_admin">Super Admin</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setSelectedUser(null);
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

export default UserManagement;
