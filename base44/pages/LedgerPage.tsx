/**
 * Ledger Page - Complete implementation from Base44
 */

import React, { useState } from 'react';

export const LedgerPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const transactions = [
        {
            id: '1',
            date: 'Dec 15, 2024',
            description: 'Invoice Payment - Metro Construction',
            category: 'Revenue',
            account: 'Accounts Receivable',
            debit: 486000,
            credit: 0,
            balance: 486000,
            reference: 'INV-2024-001'
        },
        {
            id: '2',
            date: 'Dec 10, 2024',
            description: 'Material Purchase - ABC Supplies',
            category: 'Expenses',
            account: 'Materials',
            debit: 0,
            credit: 45000,
            balance: 441000,
            reference: 'PO-2024-001'
        },
        {
            id: '3',
            date: 'Dec 5, 2024',
            description: 'Subcontractor Payment - Elite Electrical',
            category: 'Expenses',
            account: 'Labor',
            debit: 0,
            credit: 12500,
            balance: 428500,
            reference: 'PAY-2024-015'
        }
    ];

    const formatCurrency = (amount?: number) => {
        if (amount === undefined || amount === null) return '£0.00';
        return `£${amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            'Revenue': 'bg-green-100 text-green-800',
            'Expenses': 'bg-red-100 text-red-800',
            'Assets': 'bg-blue-100 text-blue-800',
            'Liabilities': 'bg-yellow-100 text-yellow-800'
        };
        return colors[category] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ledger</h1>
                        <p className="text-gray-600">Financial transactions and accounting</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        {/* Search */}
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search transactions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                            />
                        </div>

                        {/* Category Filter */}
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Categories</option>
                            <option value="revenue">Revenue</option>
                            <option value="expenses">Expenses</option>
                            <option value="assets">Assets</option>
                            <option value="liabilities">Liabilities</option>
                        </select>

                        {/* New Entry Button */}
                        <button
                            type="button"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>New Entry</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <p className="text-sm text-gray-600 mb-1">Total Debits</p>
                    <p className="text-3xl font-bold text-green-600">{formatCurrency(486000)}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <p className="text-sm text-gray-600 mb-1">Total Credits</p>
                    <p className="text-3xl font-bold text-red-600">{formatCurrency(57500)}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <p className="text-sm text-gray-600 mb-1">Current Balance</p>
                    <p className="text-3xl font-bold text-gray-900">{formatCurrency(428500)}</p>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Debit</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Credit</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {transactions.map((transaction) => (
                                <tr key={transaction.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.date}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{transaction.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(transaction.category)}`}>
                                            {transaction.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{transaction.account}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600">
                                        {transaction.debit > 0 ? formatCurrency(transaction.debit) : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-red-600">
                                        {transaction.credit > 0 ? formatCurrency(transaction.credit) : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                                        {formatCurrency(transaction.balance)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.reference}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

