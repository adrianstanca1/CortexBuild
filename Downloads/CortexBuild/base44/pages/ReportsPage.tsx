/**
 * Reports Page - Complete implementation from Base44
 */

import React, { useState } from 'react';

export const ReportsPage: React.FC = () => {
    const [periodFilter, setPeriodFilter] = useState('this-month');

    const reports = [
        {
            id: '1',
            name: 'Financial Summary',
            description: 'Overview of revenue, expenses, and profit',
            icon: '💰',
            color: 'green'
        },
        {
            id: '2',
            name: 'Project Progress',
            description: 'Status and completion rates of all projects',
            icon: '📊',
            color: 'blue'
        },
        {
            id: '3',
            name: 'Time Tracking',
            description: 'Hours logged by team and project',
            icon: '⏱️',
            color: 'purple'
        },
        {
            id: '4',
            name: 'Invoice Status',
            description: 'Paid, pending, and overdue invoices',
            icon: '📄',
            color: 'yellow'
        },
        {
            id: '5',
            name: 'Budget vs Actual',
            description: 'Compare budgeted vs actual costs',
            icon: '📈',
            color: 'red'
        },
        {
            id: '6',
            name: 'Resource Allocation',
            description: 'Team and equipment utilization',
            icon: '👥',
            color: 'indigo'
        }
    ];

    const getColorClasses = (color: string) => {
        const colors: Record<string, string> = {
            'green': 'bg-green-50 text-green-600 border-green-200',
            'blue': 'bg-blue-50 text-blue-600 border-blue-200',
            'purple': 'bg-purple-50 text-purple-600 border-purple-200',
            'yellow': 'bg-yellow-50 text-yellow-600 border-yellow-200',
            'red': 'bg-red-50 text-red-600 border-red-200',
            'indigo': 'bg-indigo-50 text-indigo-600 border-indigo-200'
        };
        return colors[color] || 'bg-gray-50 text-gray-600 border-gray-200';
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports</h1>
                        <p className="text-gray-600">Analytics and insights for your business</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        {/* Period Filter */}
                        <select
                            value={periodFilter}
                            onChange={(e) => setPeriodFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="this-week">This Week</option>
                            <option value="this-month">This Month</option>
                            <option value="this-quarter">This Quarter</option>
                            <option value="this-year">This Year</option>
                            <option value="custom">Custom Range</option>
                        </select>

                        {/* Export Button */}
                        <button
                            type="button"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Export All</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map((report) => (
                    <div key={report.id} className={`rounded-xl border-2 p-6 hover:shadow-lg transition-all cursor-pointer ${getColorClasses(report.color)}`}>
                        <div className="flex items-start space-x-4 mb-4">
                            <div className="text-4xl">{report.icon}</div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">{report.name}</h3>
                                <p className="text-sm text-gray-600">{report.description}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <button
                                type="button"
                                className="flex-1 bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium border border-gray-300"
                            >
                                View Report
                            </button>
                            <button
                                type="button"
                                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Stats */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">£972,000</p>
                    <p className="text-sm text-green-600 mt-1">+12% vs last month</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <p className="text-sm text-gray-600 mb-1">Active Projects</p>
                    <p className="text-3xl font-bold text-gray-900">4</p>
                    <p className="text-sm text-gray-500 mt-1">of 7 total</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <p className="text-sm text-gray-600 mb-1">Outstanding</p>
                    <p className="text-3xl font-bold text-gray-900">£1,036,800</p>
                    <p className="text-sm text-yellow-600 mt-1">Awaiting payment</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <p className="text-sm text-gray-600 mb-1">Team Hours</p>
                    <p className="text-3xl font-bold text-gray-900">16.0h</p>
                    <p className="text-sm text-gray-500 mt-1">This week</p>
                </div>
            </div>
        </div>
    );
};

