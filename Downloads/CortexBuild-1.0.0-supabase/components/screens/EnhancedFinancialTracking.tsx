/**
 * Enhanced Financial Tracking - Buildr-Inspired Financial Management
 * Advanced budgeting, expense tracking, and financial reporting
 */

import React, { useState, useEffect } from 'react';
import {
    DollarSign, TrendingUp, TrendingDown, PieChart, BarChart3,
    Calendar, Clock, Receipt, CreditCard, Banknote, Calculator,
    Target, AlertTriangle, CheckCircle, XCircle, Eye, Download,
    Upload, Filter, Search, Plus, Edit, Trash2, MoreHorizontal,
    ArrowUpRight, ArrowDownRight, Activity, Zap, Award, Star,
    Heart, ThumbsUp, Share2, Copy, ExternalLink, Lock, Unlock,
    Settings, Bell, BellOff, Pin, Archive, Flag, Tag, Folder,
    FileText, Image, Camera, MapPin, Users, Building2, Hammer
} from 'lucide-react';
import { User } from '../../types';

interface EnhancedFinancialTrackingProps {
    currentUser: User;
    navigateTo: (screen: string, params?: any) => void;
    isDarkMode?: boolean;
}

interface FinancialMetric {
    id: string;
    category: string;
    budgeted: number;
    actual: number;
    variance: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
    lastUpdated: string;
    subcategories: FinancialSubcategory[];
}

interface FinancialSubcategory {
    id: string;
    name: string;
    budgeted: number;
    actual: number;
    variance: number;
    percentage: number;
    transactions: number;
}

interface Transaction {
    id: string;
    date: string;
    description: string;
    category: string;
    subcategory: string;
    amount: number;
    type: 'income' | 'expense';
    paymentMethod: 'cash' | 'card' | 'transfer' | 'check';
    vendor?: string;
    projectId?: string;
    projectName?: string;
    receipt?: string;
    status: 'pending' | 'approved' | 'rejected';
    approvedBy?: string;
    notes?: string;
}

interface BudgetForecast {
    month: string;
    projected: number;
    actual: number;
    variance: number;
    confidence: number;
}

interface FinancialReport {
    id: string;
    title: string;
    type: 'monthly' | 'quarterly' | 'annual' | 'project';
    period: string;
    generatedAt: string;
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    keyMetrics: Record<string, number>;
}

const EnhancedFinancialTracking: React.FC<EnhancedFinancialTrackingProps> = ({
    currentUser,
    navigateTo,
    isDarkMode = true
}) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'budgets' | 'reports' | 'forecasts'>('overview');
    const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');
    const [isLoading, setIsLoading] = useState(true);

    // Mock data - in real app, this would come from API
    const [financialMetrics] = useState<FinancialMetric[]>([
        {
            id: '1',
            category: 'Labor',
            budgeted: 200000,
            actual: 185000,
            variance: -15000,
            percentage: 92.5,
            trend: 'down',
            lastUpdated: '2024-03-15',
            subcategories: [
                { id: '1', name: 'Wages', budgeted: 150000, actual: 140000, variance: -10000, percentage: 93.3, transactions: 45 },
                { id: '2', name: 'Overtime', budgeted: 30000, actual: 25000, variance: -5000, percentage: 83.3, transactions: 12 },
                { id: '3', name: 'Benefits', budgeted: 20000, actual: 20000, variance: 0, percentage: 100, transactions: 8 }
            ]
        },
        {
            id: '2',
            category: 'Materials',
            budgeted: 300000,
            actual: 320000,
            variance: 20000,
            percentage: 106.7,
            trend: 'up',
            lastUpdated: '2024-03-15',
            subcategories: [
                { id: '4', name: 'Concrete', budgeted: 100000, actual: 110000, variance: 10000, percentage: 110, transactions: 15 },
                { id: '5', name: 'Steel', budgeted: 120000, actual: 130000, variance: 10000, percentage: 108.3, transactions: 8 },
                { id: '6', name: 'Electrical', budgeted: 80000, actual: 80000, variance: 0, percentage: 100, transactions: 22 }
            ]
        },
        {
            id: '3',
            category: 'Equipment',
            budgeted: 150000,
            actual: 140000,
            variance: -10000,
            percentage: 93.3,
            trend: 'down',
            lastUpdated: '2024-03-15',
            subcategories: [
                { id: '7', name: 'Rental', budgeted: 80000, actual: 75000, variance: -5000, percentage: 93.8, transactions: 18 },
                { id: '8', name: 'Maintenance', budgeted: 40000, actual: 35000, variance: -5000, percentage: 87.5, transactions: 9 },
                { id: '9', name: 'Fuel', budgeted: 30000, actual: 30000, variance: 0, percentage: 100, transactions: 25 }
            ]
        },
        {
            id: '4',
            category: 'Subcontractors',
            budgeted: 200000,
            actual: 195000,
            variance: -5000,
            percentage: 97.5,
            trend: 'down',
            lastUpdated: '2024-03-15',
            subcategories: [
                { id: '10', name: 'Plumbing', budgeted: 80000, actual: 78000, variance: -2000, percentage: 97.5, transactions: 12 },
                { id: '11', name: 'HVAC', budgeted: 70000, actual: 68000, variance: -2000, percentage: 97.1, transactions: 8 },
                { id: '12', name: 'Roofing', budgeted: 50000, actual: 49000, variance: -1000, percentage: 98, transactions: 6 }
            ]
        }
    ]);

    const [transactions] = useState<Transaction[]>([
        {
            id: '1',
            date: '2024-03-15',
            description: 'Concrete delivery for foundation',
            category: 'Materials',
            subcategory: 'Concrete',
            amount: 15000,
            type: 'expense',
            paymentMethod: 'card',
            vendor: 'ABC Concrete Co.',
            projectId: '1',
            projectName: 'Downtown Office Complex',
            receipt: '/receipts/concrete-2024-03-15.pdf',
            status: 'approved',
            approvedBy: 'Sarah Johnson',
            notes: 'Foundation pour completed'
        },
        {
            id: '2',
            date: '2024-03-14',
            description: 'Weekly payroll',
            category: 'Labor',
            subcategory: 'Wages',
            amount: 25000,
            type: 'expense',
            paymentMethod: 'transfer',
            projectId: '1',
            projectName: 'Downtown Office Complex',
            status: 'approved',
            approvedBy: 'Sarah Johnson'
        },
        {
            id: '3',
            date: '2024-03-13',
            description: 'Equipment rental - Excavator',
            category: 'Equipment',
            subcategory: 'Rental',
            amount: 2500,
            type: 'expense',
            paymentMethod: 'card',
            vendor: 'Heavy Equipment Rentals',
            projectId: '1',
            projectName: 'Downtown Office Complex',
            receipt: '/receipts/excavator-2024-03-13.pdf',
            status: 'pending',
            notes: 'Weekly rental for excavation work'
        }
    ]);

    const [budgetForecasts] = useState<BudgetForecast[]>([
        { month: 'Jan 2024', projected: 180000, actual: 175000, variance: -5000, confidence: 95 },
        { month: 'Feb 2024', projected: 195000, actual: 190000, variance: -5000, confidence: 92 },
        { month: 'Mar 2024', projected: 210000, actual: 205000, variance: -5000, confidence: 88 },
        { month: 'Apr 2024', projected: 225000, actual: 0, variance: 0, confidence: 85 },
        { month: 'May 2024', projected: 240000, actual: 0, variance: 0, confidence: 82 },
        { month: 'Jun 2024', projected: 255000, actual: 0, variance: 0, confidence: 80 }
    ]);

    const [reports] = useState<FinancialReport[]>([
        {
            id: '1',
            title: 'Q1 2024 Financial Summary',
            type: 'quarterly',
            period: 'Q1 2024',
            generatedAt: '2024-03-31',
            totalRevenue: 850000,
            totalExpenses: 720000,
            netProfit: 130000,
            profitMargin: 15.3,
            keyMetrics: {
                'Labor Efficiency': 92.5,
                'Material Cost Variance': 6.7,
                'Equipment Utilization': 93.3,
                'Subcontractor Performance': 97.5
            }
        },
        {
            id: '2',
            title: 'March 2024 Monthly Report',
            type: 'monthly',
            period: 'March 2024',
            generatedAt: '2024-03-31',
            totalRevenue: 280000,
            totalExpenses: 240000,
            netProfit: 40000,
            profitMargin: 14.3,
            keyMetrics: {
                'Labor Efficiency': 94.2,
                'Material Cost Variance': 5.2,
                'Equipment Utilization': 91.8,
                'Subcontractor Performance': 98.1
            }
        }
    ]);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    const getTrendIcon = (trend: string) => {
        const icons = {
            up: ArrowUpRight,
            down: ArrowDownRight,
            stable: Activity
        };
        return icons[trend as keyof typeof icons] || Activity;
    };

    const getTrendColor = (trend: string) => {
        const colors = {
            up: 'text-red-400',
            down: 'text-green-400',
            stable: 'text-gray-400'
        };
        return colors[trend as keyof typeof colors] || 'text-gray-400';
    };

    const getStatusColor = (status: string) => {
        const colors = {
            approved: 'bg-green-500',
            pending: 'bg-yellow-500',
            rejected: 'bg-red-500'
        };
        return colors[status as keyof typeof colors] || 'bg-gray-500';
    };

    const getPaymentMethodIcon = (method: string) => {
        const icons = {
            cash: Banknote,
            card: CreditCard,
            transfer: Calculator,
            check: Receipt
        };
        return icons[method as keyof typeof icons] || Receipt;
    };

    const renderFinancialMetric = (metric: FinancialMetric) => {
        const TrendIcon = getTrendIcon(metric.trend);
        const isOverBudget = metric.actual > metric.budgeted;
        const varianceColor = isOverBudget ? 'text-red-400' : 'text-green-400';
        const barColor = isOverBudget ? 'bg-red-500' : 'bg-green-500';

        return (
            <div
                key={metric.id}
                className={`group relative overflow-hidden rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
            >
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <DollarSign className={`w-6 h-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                        </div>
                        <div>
                            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {metric.category}
                            </h3>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Last updated: {metric.lastUpdated}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <TrendIcon className={`w-5 h-5 ${getTrendColor(metric.trend)}`} />
                        <span className={`text-sm font-medium ${varianceColor}`}>
                            {isOverBudget ? '+' : ''}${(metric.variance / 1000).toFixed(0)}K
                        </span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Budgeted</span>
                            <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                                ${(metric.budgeted / 1000).toFixed(0)}K
                            </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-gray-500 h-2 rounded-full"
                                style={{ width: '100%' }}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Actual</span>
                            <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                                ${(metric.actual / 1000).toFixed(0)}K
                            </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full transition-all duration-500 ${barColor}`}
                                style={{ width: `${Math.min(metric.percentage, 120)}%` }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {metric.percentage.toFixed(1)}%
                            </p>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                of Budget
                            </p>
                        </div>
                        <div className="text-center">
                            <p className={`text-2xl font-bold ${varianceColor}`}>
                                {isOverBudget ? '+' : ''}${(metric.variance / 1000).toFixed(0)}K
                            </p>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Variance
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="flex items-center justify-between">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {metric.subcategories.length} subcategories
                        </span>
                        <button
                            type="button"
                            onClick={() => navigateTo('financial-detail', { categoryId: metric.id })}
                            className="text-purple-400 hover:text-purple-300 flex items-center space-x-1"
                        >
                            <span className="text-sm">View Details</span>
                            <ArrowUpRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderTransaction = (transaction: Transaction) => {
        const PaymentIcon = getPaymentMethodIcon(transaction.paymentMethod);
        const isExpense = transaction.type === 'expense';

        return (
            <div
                key={transaction.id}
                className={`group relative overflow-hidden rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer`}
                onClick={() => navigateTo('transaction-detail', { transactionId: transaction.id })}
            >
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <PaymentIcon className={`w-6 h-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                        </div>
                        <div>
                            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {transaction.description}
                            </h3>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {transaction.category} • {transaction.subcategory}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(transaction.status)}`} />
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {transaction.status}
                        </span>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Amount
                        </span>
                        <span className={`text-lg font-bold ${isExpense ? 'text-red-400' : 'text-green-400'}`}>
                            {isExpense ? '-' : '+'}${transaction.amount.toLocaleString()}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Date
                        </span>
                        <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {transaction.date}
                        </span>
                    </div>

                    {transaction.vendor && (
                        <div className="flex items-center justify-between">
                            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Vendor
                            </span>
                            <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {transaction.vendor}
                            </span>
                        </div>
                    )}

                    {transaction.projectName && (
                        <div className="flex items-center justify-between">
                            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Project
                            </span>
                            <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {transaction.projectName}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                    <div className="flex items-center space-x-2">
                        {transaction.receipt && (
                            <div className="flex items-center space-x-1 text-gray-400">
                                <Receipt className="w-4 h-4" />
                                <span className="text-xs">Receipt</span>
                            </div>
                        )}
                        {transaction.notes && (
                            <div className="flex items-center space-x-1 text-gray-400">
                                <FileText className="w-4 h-4" />
                                <span className="text-xs">Notes</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            type="button"
                            className="p-1 hover:bg-gray-700 rounded"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigateTo('transaction-detail', { transactionId: transaction.id });
                            }}
                        >
                            <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                            type="button"
                            className="p-1 hover:bg-gray-700 rounded"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigateTo('edit-transaction', { transactionId: transaction.id });
                            }}
                        >
                            <Edit className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderBudgetForecast = (forecast: BudgetForecast) => {
        const isActual = forecast.actual > 0;
        const varianceColor = forecast.variance < 0 ? 'text-green-400' : forecast.variance > 0 ? 'text-red-400' : 'text-gray-400';

        return (
            <div
                key={forecast.month}
                className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} transition-colors cursor-pointer`}
            >
                <div className="flex items-center justify-between mb-3">
                    <h4 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {forecast.month}
                    </h4>
                    <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${isActual ? 'bg-green-500' : 'bg-gray-500'}`} />
                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {forecast.confidence}% confidence
                        </span>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Projected</span>
                        <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                            ${(forecast.projected / 1000).toFixed(0)}K
                        </span>
                    </div>
                    {isActual && (
                        <div className="flex justify-between text-sm">
                            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Actual</span>
                            <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                                ${(forecast.actual / 1000).toFixed(0)}K
                            </span>
                        </div>
                    )}
                    <div className="flex justify-between text-sm">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Variance</span>
                        <span className={`font-medium ${varianceColor}`}>
                            {forecast.variance < 0 ? '' : '+'}${(forecast.variance / 1000).toFixed(0)}K
                        </span>
                    </div>
                </div>

                <div className="mt-3">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all duration-500 ${isActual ? 'bg-blue-500' : 'bg-gray-500'}`}
                            style={{ width: `${Math.min((forecast.projected / 300000) * 100, 100)}%` }}
                        />
                    </div>
                </div>
            </div>
        );
    };

    const renderFinancialReport = (report: FinancialReport) => {
        return (
            <div
                key={report.id}
                className={`group relative overflow-hidden rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer`}
                onClick={() => navigateTo('financial-report-detail', { reportId: report.id })}
            >
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {report.title}
                        </h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {report.period} • Generated {report.generatedAt}
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
                            {report.type}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                        <p className={`text-2xl font-bold text-green-400`}>
                            ${(report.totalRevenue / 1000).toFixed(0)}K
                        </p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Total Revenue
                        </p>
                    </div>
                    <div className="text-center">
                        <p className={`text-2xl font-bold text-red-400`}>
                            ${(report.totalExpenses / 1000).toFixed(0)}K
                        </p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Total Expenses
                        </p>
                    </div>
                </div>

                <div className="text-center mb-4">
                    <p className={`text-3xl font-bold ${report.netProfit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${(report.netProfit / 1000).toFixed(0)}K
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Net Profit ({report.profitMargin.toFixed(1)}% margin)
                    </p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="flex items-center justify-between">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {Object.keys(report.keyMetrics).length} key metrics
                        </span>
                        <div className="flex items-center space-x-2">
                            <button
                                type="button"
                                className="p-1 hover:bg-gray-700 rounded"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigateTo('download-report', { reportId: report.id });
                                }}
                            >
                                <Download className="w-4 h-4 text-gray-400" />
                            </button>
                            <button
                                type="button"
                                className="p-1 hover:bg-gray-700 rounded"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigateTo('share-report', { reportId: report.id });
                                }}
                            >
                                <Share2 className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Loading Financial Data...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center space-x-3 mb-2">
                                <DollarSign className="w-8 h-8 text-white" />
                                <h1 className="text-3xl font-bold text-white">Financial Tracking</h1>
                            </div>
                            <p className="text-green-100">Advanced budgeting, expense tracking, and financial reporting</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                type="button"
                                onClick={() => navigateTo('financial-settings')}
                                className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all backdrop-blur-sm"
                            >
                                <Settings className="w-5 h-5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => navigateTo('new-transaction')}
                                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all backdrop-blur-sm flex items-center space-x-2"
                            >
                                <Plus className="w-5 h-5" />
                                <span>New Transaction</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-8">
                {/* Period Selector */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex space-x-2 p-1 bg-gray-800 rounded-xl">
                        {[
                            { id: 'month', label: 'Month' },
                            { id: 'quarter', label: 'Quarter' },
                            { id: 'year', label: 'Year' }
                        ].map((period) => (
                            <button
                                key={period.id}
                                type="button"
                                onClick={() => setSelectedPeriod(period.id as any)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedPeriod === period.id
                                    ? 'bg-purple-600 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                                    }`}
                            >
                                {period.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            type="button"
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center space-x-2"
                        >
                            <Filter className="w-5 h-5" />
                            <span>Filter</span>
                        </button>
                        <button
                            type="button"
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                        >
                            <Download className="w-5 h-5" />
                            <span>Export</span>
                        </button>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex space-x-2 mb-8 p-1 bg-gray-800 rounded-xl">
                    {[
                        { id: 'overview', label: 'Overview', icon: BarChart3 },
                        { id: 'transactions', label: 'Transactions', icon: Receipt },
                        { id: 'budgets', label: 'Budgets', icon: Target },
                        { id: 'reports', label: 'Reports', icon: FileText },
                        { id: 'forecasts', label: 'Forecasts', icon: TrendingUp }
                    ].map((tab) => {
                        const TabIcon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${activeTab === tab.id
                                    ? 'bg-purple-600 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                                    }`}
                            >
                                <TabIcon className="w-5 h-5" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Content based on active tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Financial Metrics */}
                        <div>
                            <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Financial Overview
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {financialMetrics.map(renderFinancialMetric)}
                            </div>
                        </div>

                        {/* Recent Transactions */}
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Recent Transactions
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('transactions')}
                                    className="text-purple-400 hover:text-purple-300 flex items-center space-x-1"
                                >
                                    <span>View All</span>
                                    <ArrowUpRight className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {transactions.slice(0, 3).map(renderTransaction)}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'transactions' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                All Transactions
                            </h2>
                            <div className="flex items-center space-x-3">
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center space-x-2"
                                >
                                    <Search className="w-5 h-5" />
                                    <span>Search</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigateTo('new-transaction')}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span>New Transaction</span>
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {transactions.map(renderTransaction)}
                        </div>
                    </div>
                )}

                {activeTab === 'budgets' && (
                    <div>
                        <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Budget Management
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {financialMetrics.map(renderFinancialMetric)}
                        </div>
                    </div>
                )}

                {activeTab === 'reports' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Financial Reports
                            </h2>
                            <button
                                type="button"
                                onClick={() => navigateTo('generate-report')}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Generate Report</span>
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {reports.map(renderFinancialReport)}
                        </div>
                    </div>
                )}

                {activeTab === 'forecasts' && (
                    <div>
                        <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Budget Forecasts
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {budgetForecasts.map(renderBudgetForecast)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EnhancedFinancialTracking;
