import React, { useState, useEffect } from 'react';
import { User } from '../../../types';
import { supabase } from '../../../lib/supabase/client';
import toast from 'react-hot-toast';
import { CreditCard, Download, AlertCircle, CheckCircle, Clock, DollarSign } from 'lucide-react';

interface SubscriptionPlan {
    id: string;
    name: string;
    price: number;
    billingCycle: 'monthly' | 'yearly';
    features: string[];
    status: 'active' | 'cancelled' | 'past_due';
    startDate: string;
    renewalDate: string;
    autoRenew: boolean;
}

interface Invoice {
    id: string;
    invoiceNumber: string;
    amount: number;
    status: 'paid' | 'pending' | 'overdue';
    issueDate: string;
    dueDate: string;
    pdfUrl: string;
}

interface CompanyBillingProps {
    currentUser: User;
}

const CompanyBilling: React.FC<CompanyBillingProps> = ({ currentUser }) => {
    const [subscription, setSubscription] = useState<SubscriptionPlan | null>(null);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'subscription' | 'invoices'>('subscription');

    useEffect(() => {
        loadBillingData();
    }, [currentUser]);

    const loadBillingData = async () => {
        try {
            setIsLoading(true);
            const [subData, invData] = await Promise.all([
                supabase
                    .from('subscriptions')
                    .select('*')
                    .eq('company_id', currentUser.companyId)
                    .single(),
                supabase
                    .from('invoices')
                    .select('*')
                    .eq('company_id', currentUser.companyId)
                    .order('issue_date', { ascending: false })
            ]);

            if (subData.data) setSubscription(subData.data);
            if (invData.data) setInvoices(invData.data);
        } catch (error) {
            console.error('Error loading billing data:', error);
            toast.error('Failed to load billing information');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
            case 'paid':
                return 'text-green-600 bg-green-50';
            case 'pending':
                return 'text-yellow-600 bg-yellow-50';
            case 'overdue':
            case 'past_due':
                return 'text-red-600 bg-red-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
            case 'paid':
                return <CheckCircle className="w-5 h-5" />;
            case 'pending':
                return <Clock className="w-5 h-5" />;
            case 'overdue':
            case 'past_due':
                return <AlertCircle className="w-5 h-5" />;
            default:
                return null;
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center gap-3 mb-6">
                <CreditCard className="w-8 h-8 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Billing & Subscription</h2>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-200">
                <button
                    type="button"
                    onClick={() => setActiveTab('subscription')}
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === 'subscription'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Subscription
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('invoices')}
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === 'invoices'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Invoices
                </button>
            </div>

            {/* Subscription Tab */}
            {activeTab === 'subscription' && subscription && (
                <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">{subscription.name}</h3>
                                <p className="text-gray-600 mt-1">
                                    ${subscription.price}/{subscription.billingCycle === 'monthly' ? 'month' : 'year'}
                                </p>
                            </div>
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium ${getStatusColor(subscription.status)}`}>
                                {getStatusIcon(subscription.status)}
                                <span className="capitalize">{subscription.status}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div>
                                <p className="text-sm text-gray-600">Start Date</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {new Date(subscription.startDate).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Renewal Date</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {new Date(subscription.renewalDate).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-blue-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Auto-Renewal</p>
                                    <p className="font-semibold text-gray-900">
                                        {subscription.autoRenew ? 'Enabled' : 'Disabled'}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Manage Subscription
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Features */}
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Included Features</h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {subscription.features.map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-gray-700">
                                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Invoices Tab */}
            {activeTab === 'invoices' && (
                <div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Invoice #</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Amount</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Issue Date</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Due Date</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map(invoice => (
                                    <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 font-medium text-gray-900">{invoice.invoiceNumber}</td>
                                        <td className="py-3 px-4 text-gray-900 font-semibold">
                                            <div className="flex items-center gap-1">
                                                <DollarSign className="w-4 h-4" />
                                                {invoice.amount.toFixed(2)}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
                                                {getStatusIcon(invoice.status)}
                                                <span className="capitalize">{invoice.status}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-gray-600">
                                            {new Date(invoice.issueDate).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4 text-gray-600">
                                            {new Date(invoice.dueDate).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4">
                                            <a
                                                href={invoice.pdfUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-700 transition-colors"
                                                title="Download PDF"
                                            >
                                                <Download className="w-4 h-4" />
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {invoices.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No invoices found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CompanyBilling;

