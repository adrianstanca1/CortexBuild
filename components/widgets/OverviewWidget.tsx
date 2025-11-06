import React from 'react';
import { ProjectAnalytics } from '../../services/projectService';
import { UserRole } from '../../types';

interface OverviewWidgetProps {
    analytics: ProjectAnalytics;
    userRole: UserRole;
    onNavigate: (screen: string, params?: any) => void;
}

const OverviewWidget: React.FC<OverviewWidgetProps> = ({ analytics, userRole, onNavigate }) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getStatusColor = (utilization: number) => {
        if (utilization < 70) return 'text-green-600';
        if (utilization < 90) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-800">
                    {userRole === 'super_admin' ? 'Platform Overview' : 'Company Overview'}
                </h2>
                <button
                    onClick={() => onNavigate('projects')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                    View All Projects →
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{analytics.totalProjects}</div>
                    <div className="text-sm text-gray-500">Total Projects</div>
                </div>

                <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{analytics.activeProjects}</div>
                    <div className="text-sm text-gray-500">Active</div>
                </div>

                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{analytics.completedProjects}</div>
                    <div className="text-sm text-gray-500">Completed</div>
                </div>

                <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{Math.round(analytics.averageProjectDuration)}</div>
                    <div className="text-sm text-gray-500">Avg Days</div>
                </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">Budget Overview</span>
                            <span className={`text-sm font-medium ${getStatusColor(analytics.budgetUtilization)}`}>
                                {analytics.budgetUtilization}%
                            </span>
                        </div>
                        <div className="text-lg font-semibold text-gray-900">
                            {formatCurrency(analytics.totalSpent)} / {formatCurrency(analytics.totalBudget)}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div
                                className={`h-2 rounded-full ${
                                    analytics.budgetUtilization < 70 ? 'bg-green-500' :
                                    analytics.budgetUtilization < 90 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(100, analytics.budgetUtilization)}%` }}
                            ></div>
                        </div>
                    </div>

                    <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">Risk Distribution</div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Low Risk</span>
                                <span className="text-sm font-medium text-green-600">{analytics.riskDistribution.low}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Medium Risk</span>
                                <span className="text-sm font-medium text-yellow-600">{analytics.riskDistribution.medium}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">High Risk</span>
                                <span className="text-sm font-medium text-red-600">{analytics.riskDistribution.high}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OverviewWidget;
