import React, { useState, useEffect } from 'react';
import { User } from '../../../types';
import { supabase } from '../../../lib/supabase/client';
import toast from 'react-hot-toast';
import { Building, Plus, Trash2, Edit2, Users, DollarSign, TrendingUp } from 'lucide-react';

interface Department {
    id: string;
    name: string;
    description: string;
    budget: number;
    manager_id: string;
    manager_name: string;
    member_count: number;
    spent: number;
    created_at: string;
}

interface DepartmentManagementProps {
    currentUser: User;
}

const DepartmentManagement: React.FC<DepartmentManagementProps> = ({ currentUser }) => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        budget: 0,
        manager_id: ''
    });
    const [teamMembers, setTeamMembers] = useState<any[]>([]);

    useEffect(() => {
        loadDepartments();
        loadTeamMembers();
    }, [currentUser]);

    const loadDepartments = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('departments')
                .select('*')
                .eq('company_id', currentUser.companyId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setDepartments(data || []);
        } catch (error) {
            console.error('Error loading departments:', error);
            toast.error('Failed to load departments');
        } finally {
            setIsLoading(false);
        }
    };

    const loadTeamMembers = async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id, name, email')
                .eq('company_id', currentUser.companyId);

            if (error) throw error;
            setTeamMembers(data || []);
        } catch (error) {
            console.error('Error loading team members:', error);
        }
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast.error('Department name is required');
            return;
        }

        try {
            if (editingId) {
                const { error } = await supabase
                    .from('departments')
                    .update(formData)
                    .eq('id', editingId);

                if (error) throw error;
                toast.success('Department updated successfully');
            } else {
                const { error } = await supabase
                    .from('departments')
                    .insert([{
                        ...formData,
                        company_id: currentUser.companyId
                    }]);

                if (error) throw error;
                toast.success('Department created successfully');
            }

            resetForm();
            loadDepartments();
        } catch (error) {
            console.error('Error saving department:', error);
            toast.error('Failed to save department');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this department?')) return;

        try {
            const { error } = await supabase
                .from('departments')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success('Department deleted');
            loadDepartments();
        } catch (error) {
            console.error('Error deleting department:', error);
            toast.error('Failed to delete department');
        }
    };

    const handleEdit = (dept: Department) => {
        setFormData({
            name: dept.name,
            description: dept.description,
            budget: dept.budget,
            manager_id: dept.manager_id
        });
        setEditingId(dept.id);
        setShowAddForm(true);
    };

    const resetForm = () => {
        setFormData({ name: '', description: '', budget: 0, manager_id: '' });
        setEditingId(null);
        setShowAddForm(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'budget' ? parseFloat(value) || 0 : value
        }));
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-gray-200 rounded"></div>
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
                    <Building className="w-8 h-8 text-blue-600" />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Department Management</h2>
                        <p className="text-sm text-gray-600">{departments.length} departments</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Department
                </button>
            </div>

            {/* Add/Edit Form */}
            {showAddForm && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-gray-900 mb-4">{editingId ? 'Edit Department' : 'Create New Department'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            name="name"
                            placeholder="Department name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <select
                            name="manager_id"
                            value={formData.manager_id}
                            onChange={handleInputChange}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            aria-label="Department manager"
                            title="Select department manager"
                        >
                            <option value="">Select Manager</option>
                            {teamMembers.map(member => (
                                <option key={member.id} value={member.id}>{member.name}</option>
                            ))}
                        </select>
                        <input
                            type="number"
                            name="budget"
                            placeholder="Budget"
                            value={formData.budget}
                            onChange={handleInputChange}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <textarea
                            name="description"
                            placeholder="Description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 md:col-span-2"
                            rows={2}
                        />
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

            {/* Departments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {departments.map(dept => (
                    <div key={dept.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">{dept.name}</h3>
                                <p className="text-sm text-gray-600 mt-1">{dept.description}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleEdit(dept)}
                                    className="text-blue-600 hover:text-blue-700"
                                    aria-label="Edit department"
                                    title="Edit department"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(dept.id)}
                                    className="text-red-600 hover:text-red-700"
                                    aria-label="Delete department"
                                    title="Delete department"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-blue-50 rounded p-3">
                                <div className="flex items-center gap-2 text-blue-600 mb-1">
                                    <Users className="w-4 h-4" />
                                    <span className="text-xs font-medium">Members</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{dept.member_count}</p>
                            </div>
                            <div className="bg-green-50 rounded p-3">
                                <div className="flex items-center gap-2 text-green-600 mb-1">
                                    <DollarSign className="w-4 h-4" />
                                    <span className="text-xs font-medium">Budget</span>
                                </div>
                                <p className="text-lg font-bold text-gray-900">${dept.budget.toLocaleString()}</p>
                            </div>
                            <div className="bg-orange-50 rounded p-3">
                                <div className="flex items-center gap-2 text-orange-600 mb-1">
                                    <TrendingUp className="w-4 h-4" />
                                    <span className="text-xs font-medium">Spent</span>
                                </div>
                                <p className="text-lg font-bold text-gray-900">${dept.spent.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {departments.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <Building className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No departments yet. Create one to get started.</p>
                </div>
            )}
        </div>
    );
};

export default DepartmentManagement;

