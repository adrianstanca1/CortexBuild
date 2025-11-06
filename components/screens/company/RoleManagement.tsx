import React, { useState, useEffect } from 'react';
import { User } from '../../../types';
import { supabase } from '../../../lib/supabase/client';
import toast from 'react-hot-toast';
import { Shield, Plus, Trash2, Edit2, CheckCircle, Lock } from 'lucide-react';

interface Role {
    id: string;
    name: string;
    description: string;
    permissions: string[];
    user_count: number;
    created_at: string;
}

interface RoleManagementProps {
    currentUser: User;
}

const AVAILABLE_PERMISSIONS = [
    { id: 'view_projects', label: 'View Projects' },
    { id: 'create_projects', label: 'Create Projects' },
    { id: 'edit_projects', label: 'Edit Projects' },
    { id: 'delete_projects', label: 'Delete Projects' },
    { id: 'manage_team', label: 'Manage Team' },
    { id: 'view_billing', label: 'View Billing' },
    { id: 'manage_billing', label: 'Manage Billing' },
    { id: 'view_analytics', label: 'View Analytics' },
    { id: 'manage_settings', label: 'Manage Settings' },
    { id: 'manage_roles', label: 'Manage Roles' }
];

const RoleManagement: React.FC<RoleManagementProps> = ({ currentUser }) => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        permissions: [] as string[]
    });

    useEffect(() => {
        loadRoles();
    }, [currentUser]);

    const loadRoles = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('custom_roles')
                .select('*')
                .eq('company_id', currentUser.companyId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRoles(data || []);
        } catch (error) {
            console.error('Error loading roles:', error);
            toast.error('Failed to load roles');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast.error('Role name is required');
            return;
        }

        if (formData.permissions.length === 0) {
            toast.error('Select at least one permission');
            return;
        }

        try {
            if (editingId) {
                const { error } = await supabase
                    .from('custom_roles')
                    .update(formData)
                    .eq('id', editingId);

                if (error) throw error;
                toast.success('Role updated successfully');
            } else {
                const { error } = await supabase
                    .from('custom_roles')
                    .insert([{
                        ...formData,
                        company_id: currentUser.companyId
                    }]);

                if (error) throw error;
                toast.success('Role created successfully');
            }

            resetForm();
            loadRoles();
        } catch (error) {
            console.error('Error saving role:', error);
            toast.error('Failed to save role');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this role?')) return;

        try {
            const { error } = await supabase
                .from('custom_roles')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success('Role deleted');
            loadRoles();
        } catch (error) {
            console.error('Error deleting role:', error);
            toast.error('Failed to delete role');
        }
    };

    const handleEdit = (role: Role) => {
        setFormData({
            name: role.name,
            description: role.description,
            permissions: role.permissions
        });
        setEditingId(role.id);
        setShowAddForm(true);
    };

    const togglePermission = (permissionId: string) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permissionId)
                ? prev.permissions.filter(p => p !== permissionId)
                : [...prev.permissions, permissionId]
        }));
    };

    const resetForm = () => {
        setFormData({ name: '', description: '', permissions: [] });
        setEditingId(null);
        setShowAddForm(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Shield className="w-8 h-8 text-blue-600" />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Role Management</h2>
                        <p className="text-sm text-gray-600">{roles.length} custom roles</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Create Role
                </button>
            </div>

            {/* Add/Edit Form */}
            {showAddForm && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-gray-900 mb-4">{editingId ? 'Edit Role' : 'Create New Role'}</h3>
                    <div className="space-y-4">
                        <input
                            type="text"
                            name="name"
                            placeholder="Role name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <textarea
                            name="description"
                            placeholder="Role description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            rows={2}
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">Permissions</label>
                            <div className="grid grid-cols-2 gap-3">
                                {AVAILABLE_PERMISSIONS.map(perm => (
                                    <label key={perm.id} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.permissions.includes(perm.id)}
                                            onChange={() => togglePermission(perm.id)}
                                            className="w-4 h-4 rounded border-gray-300"
                                        />
                                        <span className="text-sm text-gray-700">{perm.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-4">
                        <button
                            type="button"
                            onClick={handleSave}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            {editingId ? 'Update' : 'Create'}
                        </button>
                        <button
                            type="button"
                            onClick={resetForm}
                            className="px-6 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Roles List */}
            <div className="space-y-4">
                {roles.map(role => (
                    <div key={role.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                                        {role.user_count} users
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleEdit(role)}
                                    className="text-blue-600 hover:text-blue-700"
                                    aria-label="Edit role"
                                    title="Edit role"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(role.id)}
                                    className="text-red-600 hover:text-red-700"
                                    aria-label="Delete role"
                                    title="Delete role"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {role.permissions.map(perm => {
                                const permLabel = AVAILABLE_PERMISSIONS.find(p => p.id === perm)?.label;
                                return (
                                    <span key={perm} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                                        <CheckCircle className="w-3 h-3" />
                                        {permLabel}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {roles.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <Lock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No custom roles yet. Create one to get started.</p>
                </div>
            )}
        </div>
    );
};

export default RoleManagement;

