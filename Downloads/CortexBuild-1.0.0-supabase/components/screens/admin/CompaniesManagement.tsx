import React, { useState, useEffect } from 'react';
import { User, Company } from '../../../types';
import * as api from '../../../api';

interface CompaniesManagementProps {
    currentUser: User;
}

const CompaniesManagement: React.FC<CompaniesManagementProps> = ({ currentUser }) => {
    const [companies, setCompanies] = useState<(Company & { plan?: api.CompanyPlan; userCount: number; projectCount: number })[]>([]);
    const [plans, setPlans] = useState<api.CompanyPlan[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
    const [newPlanId, setNewPlanId] = useState<string>('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [companiesData, plansData] = await Promise.all([
                api.getAllCompanies(currentUser),
                api.getAllCompanyPlans()
            ]);
            setCompanies(companiesData);
            setPlans(plansData);
        } catch (err: any) {
            console.error('Error loading data:', err);
            setError(err.message || 'Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePlanUpdate = async (companyId: string, planId: string) => {
        try {
            const success = await api.updateCompanyPlan(currentUser, companyId, planId);
            if (success) {
                await loadData(); // Reload data
                setSelectedCompany(null);
                setNewPlanId('');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to update plan');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="text-red-800">{error}</div>
                <button
                    onClick={loadData}
                    className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Companies Management</h3>
                <div className="text-sm text-gray-600">
                    Total: {companies.length} companies
                </div>
            </div>

            {/* Companies Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
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
                                Projects
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Revenue
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {companies.map((company) => (
                            <tr key={company.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <span className="text-blue-600 font-bold text-sm">
                                                {company.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {company.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                ID: {company.id.slice(0, 8)}...
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {company.plan ? (
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {company.plan.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                ${company.plan.priceMonthly}/month
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-gray-400">No plan</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {company.userCount}
                                        {company.plan && company.plan.maxUsers > 0 && (
                                            <span className="text-gray-500">
                                                /{company.plan.maxUsers}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {company.plan && company.plan.maxUsers > 0 && 
                                            `${Math.round((company.userCount / company.plan.maxUsers) * 100)}% used`
                                        }
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {company.projectCount}
                                        {company.plan && company.plan.maxProjects > 0 && (
                                            <span className="text-gray-500">
                                                /{company.plan.maxProjects}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {company.plan && company.plan.maxProjects > 0 && 
                                            `${Math.round((company.projectCount / company.plan.maxProjects) * 100)}% used`
                                        }
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        ${company.plan?.priceMonthly || 0}/mo
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        ${(company.plan?.priceYearly || 0) / 12}/mo yearly
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => setSelectedCompany(company.id)}
                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                    >
                                        Change Plan
                                    </button>
                                    <button className="text-gray-600 hover:text-gray-900">
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Change Plan Modal */}
            {selectedCompany && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Change Company Plan
                        </h3>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select New Plan
                            </label>
                            <select
                                value={newPlanId}
                                onChange={(e) => setNewPlanId(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select a plan...</option>
                                {plans.map(plan => (
                                    <option key={plan.id} value={plan.id}>
                                        {plan.name} - ${plan.priceMonthly}/month
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setSelectedCompany(null);
                                    setNewPlanId('');
                                }}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handlePlanUpdate(selectedCompany, newPlanId)}
                                disabled={!newPlanId}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                            >
                                Update Plan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompaniesManagement;
