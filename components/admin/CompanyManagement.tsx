/**
 * Company Management - Complete CRUD operations for companies
 * Features: Create, Read, Update, Delete companies with subscription management
 */

import { useState, useEffect } from 'react';
import {
    Building2, Plus, Search, Edit2, Trash2, Users,
    DollarSign, CheckCircle, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase/client';

interface Company {
    id: string;
    name: string;
    email: string;
    industry?: string;
    subscription_plan?: string;
    max_users?: number;
    max_projects?: number;
    created_at: string;
    updated_at?: string;
    status?: 'active' | 'inactive' | 'suspended';
    user_count?: number;
    project_count?: number;
}

interface CompanyManagementProps {
    currentUser: any;
}

const CompanyManagement: React.FC<CompanyManagementProps> = ({ currentUser }) => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPlan, setFilterPlan] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        industry: '',
        subscription_plan: 'free',
        max_users: 10,
        max_projects: 5
    });

    useEffect(() => {
        loadCompanies();
    }, []);

    const loadCompanies = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('companies')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Get user counts for each company
            const companiesWithCounts = await Promise.all(
                (data || []).map(async (company) => {
                    const { count: userCount } = await supabase
                        .from('users')
                        .select('*', { count: 'exact', head: true })
                        .eq('company_id', company.id);

                    return {
                        ...company,
                        user_count: userCount || 0,
                        project_count: 0, // TODO: Add projects table
                        status: company.status || 'active'
                    };
                })
            );

            setCompanies(companiesWithCounts);
        } catch (error) {
            console.error('Error loading companies:', error);
            toast.error('Failed to load companies');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCompany = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const { error } = await supabase
                .from('companies')
                .insert({
                    id: crypto.randomUUID(),
                    name: formData.name,
                    email: formData.email,
                    industry: formData.industry,
                    subscription_plan: formData.subscription_plan,
                    max_users: formData.max_users,
                    max_projects: formData.max_projects,
                    status: 'active',
                    created_at: new Date().toISOString(),
                    created_by: currentUser?.id
                })
                .select()
                .single();

            if (error) throw error;

            toast.success('Company created successfully!');
            setShowCreateModal(false);
            resetForm();
            loadCompanies();
        } catch (error) {
            console.error('Error creating company:', error);
            toast.error('Failed to create company');
        }
    };

    const handleUpdateCompany = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedCompany) return;

        try {
            const { error } = await supabase
                .from('companies')
                .update({
                    name: formData.name,
                    email: formData.email,
                    industry: formData.industry,
                    subscription_plan: formData.subscription_plan,
                    max_users: formData.max_users,
                    max_projects: formData.max_projects,
                    updated_at: new Date().toISOString()
                })
                .eq('id', selectedCompany.id);

            if (error) throw error;

            toast.success('Company updated successfully!');
            setShowEditModal(false);
            setSelectedCompany(null);
            resetForm();
            loadCompanies();
        } catch (error) {
            console.error('Error updating company:', error);
            toast.error('Failed to update company');
        }
    };

    const handleDeleteCompany = async (companyId: string) => {
        if (!confirm('Are you sure you want to delete this company? This will also affect all associated users.')) {
            return;
        }

        try {
            const { error } = await supabase
                .from('companies')
                .delete()
                .eq('id', companyId);

            if (error) throw error;

            toast.success('Company deleted successfully!');
            loadCompanies();
        } catch (error) {
            console.error('Error deleting company:', error);
            toast.error('Failed to delete company');
        }
    };

    const handleSuspendCompany = async (companyId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';

        try {
            const { error } = await supabase
                .from('companies')
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq('id', companyId);

            if (error) throw error;

            toast.success(`Company ${newStatus === 'suspended' ? 'suspended' : 'activated'} successfully!`);
            loadCompanies();
        } catch (error) {
            console.error('Error updating company status:', error);
            toast.error('Failed to update company status');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            industry: '',
            subscription_plan: 'free',
            max_users: 10,
            max_projects: 5
        });
    };

    const openEditModal = (company: Company) => {
        setSelectedCompany(company);
        setFormData({
            name: company.name,
            email: company.email,
            industry: company.industry || '',
            subscription_plan: company.subscription_plan || 'free',
            max_users: company.max_users || 10,
            max_projects: company.max_projects || 5
        });
        setShowEditModal(true);
    };

    // Filter companies
    const filteredCompanies = companies.filter((company: Company) => {
        const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            company.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPlan = filterPlan === 'all' || company.subscription_plan === filterPlan;
        const matchesStatus = filterStatus === 'all' || company.status === filterStatus;

        return matchesSearch && matchesPlan && matchesStatus;
    });

    const getPlanBadgeColor = (plan: string) => {
        switch (plan) {
            case 'enterprise': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'professional': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'starter': return 'bg-green-100 text-green-800 border-green-200';
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
                            <Building2 className="w-8 h-8 text-purple-600" />
                            Company Management
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Manage all companies, subscriptions, and limits
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowCreateModal(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-lg"
                    >
                        <Plus className="w-5 h-5" />
                        Create Company
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Companies</p>
                                <p className="text-2xl font-bold text-gray-900">{companies.length}</p>
                            </div>
                            <Building2 className="w-8 h-8 text-purple-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active Companies</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {companies.filter((c: Company) => c.status === 'active').length}
                                </p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Users</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {companies.reduce((sum: number, c: Company) => sum + (c.user_count || 0), 0)}
                                </p>
                            </div>
                            <Users className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Revenue</p>
                                <p className="text-2xl font-bold text-green-600">$0</p>
                            </div>
                            <DollarSign className="w-8 h-8 text-green-600" />
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
                                placeholder="Search companies by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div>
                        <select
                            value={filterPlan}
                            onChange={(e) => setFilterPlan(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            aria-label="Filter by subscription plan"
                            title="Filter by subscription plan"
                        >
                            <option value="all">All Plans</option>
                            <option value="free">Free</option>
                            <option value="starter">Starter</option>
                            <option value="professional">Professional</option>
                            <option value="enterprise">Enterprise</option>
                        </select>
                    </div>
                    <div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            aria-label="Filter by company status"
                            title="Filter by company status"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Companies Table */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                        <p className="text-gray-600 mt-4">Loading companies...</p>
                    </div>
                ) : filteredCompanies.length === 0 ? (
                    <div className="p-12 text-center">
                        <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No companies found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Company
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Plan
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Users
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
                                {filteredCompanies.map((company: Company) => (
                                    <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-semibold">
                                                        {company.name.charAt(0).toUpperCase()}
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{company.name}</div>
                                                    <div className="text-sm text-gray-500">{company.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getPlanBadgeColor(company.subscription_plan || 'free')}`}>
                                                {(company.subscription_plan || 'free').toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-900">
                                                    {company.user_count || 0} / {company.max_users || 10}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadgeColor(company.status || 'active')}`}>
                                                {(company.status || 'active').toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(company.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(company)}
                                                    className="text-purple-600 hover:text-purple-900 p-2 hover:bg-purple-50 rounded-lg transition-colors"
                                                    title="Edit company"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleSuspendCompany(company.id, company.status || 'active')}
                                                    className="text-yellow-600 hover:text-yellow-900 p-2 hover:bg-yellow-50 rounded-lg transition-colors"
                                                    title={company.status === 'suspended' ? 'Activate company' : 'Suspend company'}
                                                >
                                                    <AlertCircle className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteCompany(company.id)}
                                                    className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete company"
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

            {/* Create Company Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Company</h2>
                        <form onSubmit={handleCreateCompany}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="create-company-name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Company Name *
                                    </label>
                                    <input
                                        id="create-company-name"
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        aria-label="Company name"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="create-company-email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email *
                                    </label>
                                    <input
                                        id="create-company-email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        aria-label="Company email"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Industry
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.industry}
                                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="e.g., Construction, Technology"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="create-subscription-plan" className="block text-sm font-medium text-gray-700 mb-1">
                                        Subscription Plan
                                    </label>
                                    <select
                                        id="create-subscription-plan"
                                        value={formData.subscription_plan}
                                        onChange={(e) => setFormData({ ...formData, subscription_plan: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        aria-label="Subscription plan"
                                    >
                                        <option value="free">Free</option>
                                        <option value="starter">Starter</option>
                                        <option value="professional">Professional</option>
                                        <option value="enterprise">Enterprise</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="create-max-users" className="block text-sm font-medium text-gray-700 mb-1">
                                        Max Users
                                    </label>
                                    <input
                                        id="create-max-users"
                                        type="number"
                                        min="1"
                                        value={formData.max_users}
                                        onChange={(e) => setFormData({ ...formData, max_users: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        aria-label="Maximum number of users"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="create-max-projects" className="block text-sm font-medium text-gray-700 mb-1">
                                        Max Projects
                                    </label>
                                    <input
                                        id="create-max-projects"
                                        type="number"
                                        min="1"
                                        value={formData.max_projects}
                                        onChange={(e) => setFormData({ ...formData, max_projects: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        aria-label="Maximum number of projects"
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
                                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    Create Company
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Company Modal */}
            {showEditModal && selectedCompany && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Company</h2>
                        <form onSubmit={handleUpdateCompany}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="edit-company-name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Company Name *
                                    </label>
                                    <input
                                        id="edit-company-name"
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        aria-label="Company name"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="edit-company-email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email *
                                    </label>
                                    <input
                                        id="edit-company-email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        aria-label="Company email"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Industry
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.industry}
                                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="e.g., Construction, Technology"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="edit-subscription-plan" className="block text-sm font-medium text-gray-700 mb-1">
                                        Subscription Plan
                                    </label>
                                    <select
                                        id="edit-subscription-plan"
                                        value={formData.subscription_plan}
                                        onChange={(e) => setFormData({ ...formData, subscription_plan: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        aria-label="Subscription plan"
                                    >
                                        <option value="free">Free</option>
                                        <option value="starter">Starter</option>
                                        <option value="professional">Professional</option>
                                        <option value="enterprise">Enterprise</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="edit-max-users" className="block text-sm font-medium text-gray-700 mb-1">
                                        Max Users
                                    </label>
                                    <input
                                        id="edit-max-users"
                                        type="number"
                                        min="1"
                                        value={formData.max_users}
                                        onChange={(e) => setFormData({ ...formData, max_users: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        aria-label="Maximum number of users"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="edit-max-projects" className="block text-sm font-medium text-gray-700 mb-1">
                                        Max Projects
                                    </label>
                                    <input
                                        id="edit-max-projects"
                                        type="number"
                                        min="1"
                                        value={formData.max_projects}
                                        onChange={(e) => setFormData({ ...formData, max_projects: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        aria-label="Maximum number of projects"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setSelectedCompany(null);
                                        resetForm();
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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

export default CompanyManagement;

