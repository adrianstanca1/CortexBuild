import React, { useState, useEffect } from 'react';
import { User } from '../../../types';
import * as api from '../../../api';

interface PlansManagementProps {
    currentUser: User;
}

const PlansManagement: React.FC<PlansManagementProps> = ({ currentUser }) => {
    const [plans, setPlans] = useState<api.CompanyPlan[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingPlan, setEditingPlan] = useState<api.CompanyPlan | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        priceMonthly: 0,
        priceYearly: 0,
        maxUsers: 0,
        maxProjects: 0,
        features: [] as string[],
        aiAgentsIncluded: [] as string[],
        aiAgentsLimit: 0,
        storageGb: 0,
        isActive: true,
        isFeatured: false,
        sortOrder: 0
    });

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const plansData = await api.getAllCompanyPlans();
            setPlans(plansData);
        } catch (err: any) {
            console.error('Error loading plans:', err);
            setError(err.message || 'Failed to load plans');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            priceMonthly: 0,
            priceYearly: 0,
            maxUsers: 0,
            maxProjects: 0,
            features: [],
            aiAgentsIncluded: [],
            aiAgentsLimit: 0,
            storageGb: 0,
            isActive: true,
            isFeatured: false,
            sortOrder: 0
        });
        setEditingPlan(null);
        setShowCreateForm(false);
    };

    const handleCreatePlan = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            await api.createCompanyPlan(currentUser, formData);
            resetForm();
            loadPlans();
        } catch (err: any) {
            setError(err.message || 'Failed to create plan');
        }
    };

    const handleEditPlan = (plan: api.CompanyPlan) => {
        setEditingPlan(plan);
        setFormData({
            name: plan.name,
            description: plan.description,
            priceMonthly: plan.priceMonthly,
            priceYearly: plan.priceYearly,
            maxUsers: plan.maxUsers,
            maxProjects: plan.maxProjects,
            features: plan.features,
            aiAgentsIncluded: plan.aiAgentsIncluded,
            aiAgentsLimit: plan.aiAgentsLimit,
            storageGb: plan.storageGb,
            isActive: plan.isActive,
            isFeatured: plan.isFeatured,
            sortOrder: plan.sortOrder
        });
        setShowCreateForm(true);
    };

    const handleUpdatePlan = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            await api.updateCompanyPlanDetails(currentUser, editingPlan!.id, formData);
            resetForm();
            loadPlans();
        } catch (err: any) {
            setError(err.message || 'Failed to update plan');
        }
    };

    const handleTogglePlanStatus = async (planId: string, isActive: boolean) => {
        try {
            await api.toggleCompanyPlanStatus(currentUser, planId, isActive);
            loadPlans();
        } catch (err: any) {
            setError(err.message || 'Failed to update plan status');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Company Plans Management</h3>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Create New Plan
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="text-red-800">{error}</div>
                </div>
            )}

            {/* Create/Edit Plan Form */}
            {showCreateForm && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">
                        {editingPlan ? 'Edit Plan' : 'Create New Plan'}
                    </h4>
                    <form onSubmit={editingPlan ? handleUpdatePlan : handleCreatePlan} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Plan Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter plan name"
                                    title="Plan Name"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Sort Order
                                </label>
                                <input
                                    type="number"
                                    value={formData.sortOrder}
                                    onChange={(e) => setFormData({...formData, sortOrder: parseInt(e.target.value) || 0})}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="0"
                                    title="Sort Order"
                                    min="0"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter plan description"
                                title="Description"
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Monthly Price ($)
                                </label>
                                <input
                                    type="number"
                                    value={formData.priceMonthly}
                                    onChange={(e) => setFormData({...formData, priceMonthly: parseFloat(e.target.value) || 0})}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="0.00"
                                    title="Monthly Price"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Yearly Price ($)
                                </label>
                                <input
                                    type="number"
                                    value={formData.priceYearly}
                                    onChange={(e) => setFormData({...formData, priceYearly: parseFloat(e.target.value) || 0})}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="0.00"
                                    title="Yearly Price"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Max Users
                                </label>
                                <input
                                    type="number"
                                    value={formData.maxUsers}
                                    onChange={(e) => setFormData({...formData, maxUsers: parseInt(e.target.value) || 0})}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="0"
                                    title="Max Users"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Max Projects
                                </label>
                                <input
                                    type="number"
                                    value={formData.maxProjects}
                                    onChange={(e) => setFormData({...formData, maxProjects: parseInt(e.target.value) || 0})}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="0"
                                    title="Max Projects"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Storage (GB)
                                </label>
                                <input
                                    type="number"
                                    value={formData.storageGb}
                                    onChange={(e) => setFormData({...formData, storageGb: parseInt(e.target.value) || 0})}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="0"
                                    title="Storage GB"
                                    min="0"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    AI Agents Limit
                                </label>
                                <input
                                    type="number"
                                    value={formData.aiAgentsLimit}
                                    onChange={(e) => setFormData({...formData, aiAgentsLimit: parseInt(e.target.value) || 0})}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="0"
                                    title="AI Agents Limit"
                                    min="0"
                                />
                            </div>
                            <div className="flex items-center space-x-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Active</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.isFeatured}
                                        onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Featured</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                {editingPlan ? 'Update Plan' : 'Create Plan'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Plans Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Plan
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Pricing
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Limits
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {plans.map((plan) => (
                            <tr key={plan.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900 flex items-center">
                                                {plan.name}
                                                {plan.isFeatured && (
                                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                                        Featured
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {plan.description}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        ${plan.priceMonthly}/mo
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        ${plan.priceYearly}/yr
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {plan.maxUsers} users, {plan.maxProjects} projects
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {plan.storageGb}GB storage, {plan.aiAgentsLimit} AI agents
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        plan.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {plan.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => handleEditPlan(plan)}
                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleTogglePlanStatus(plan.id, !plan.isActive)}
                                        className={`hover:text-gray-900 ${
                                            plan.isActive ? 'text-red-600' : 'text-green-600'
                                        }`}
                                    >
                                        {plan.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PlansManagement;