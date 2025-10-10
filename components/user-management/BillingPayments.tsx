/**
 * Billing & Payments - Subscription management and payment processing
 */

import React, { useState } from 'react';
import {
    CreditCard,
    DollarSign,
    Download,
    Calendar,
    Check,
    Crown,
    Zap,
    Rocket,
    TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';

interface BillingPaymentsProps {
    isDarkMode?: boolean;
}

interface SubscriptionPlan {
    id: string;
    name: string;
    price: number;
    interval: 'month' | 'year';
    features: string[];
    popular?: boolean;
    color: string;
}

interface Invoice {
    id: string;
    date: Date;
    amount: number;
    status: 'paid' | 'pending' | 'failed';
    plan: string;
}

const PLANS: SubscriptionPlan[] = [
    {
        id: 'free',
        name: 'Free',
        price: 0,
        interval: 'month',
        features: [
            '5 Apps',
            '100 MB Storage',
            'Basic Support',
            'Community Access'
        ],
        color: 'from-gray-600 to-gray-700'
    },
    {
        id: 'pro',
        name: 'Professional',
        price: 29,
        interval: 'month',
        features: [
            'Unlimited Apps',
            '10 GB Storage',
            'Priority Support',
            'Advanced Analytics',
            'Team Collaboration',
            'Custom Branding'
        ],
        popular: true,
        color: 'from-purple-600 to-indigo-600'
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 99,
        interval: 'month',
        features: [
            'Everything in Pro',
            'Unlimited Storage',
            '24/7 Support',
            'Dedicated Account Manager',
            'Custom Integrations',
            'SLA Guarantee',
            'Advanced Security'
        ],
        color: 'from-orange-600 to-red-600'
    }
];

const BillingPayments: React.FC<BillingPaymentsProps> = ({ isDarkMode = true }) => {
    const [currentPlan, setCurrentPlan] = useState('pro');
    const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
    const [invoices] = useState<Invoice[]>([
        {
            id: 'INV-001',
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            amount: 29,
            status: 'paid',
            plan: 'Professional'
        },
        {
            id: 'INV-002',
            date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            amount: 29,
            status: 'paid',
            plan: 'Professional'
        },
        {
            id: 'INV-003',
            date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            amount: 29,
            status: 'paid',
            plan: 'Professional'
        }
    ]);

    const [usageStats] = useState({
        apps: 23,
        storage: 4.2,
        apiCalls: 15420,
        users: 12
    });

    const upgradePlan = (planId: string) => {
        setCurrentPlan(planId);
        toast.success(`Upgraded to ${PLANS.find(p => p.id === planId)?.name} plan!`);
    };

    const downloadInvoice = (invoiceId: string) => {
        toast.success(`Downloading invoice ${invoiceId}...`);
    };

    const getPrice = (plan: SubscriptionPlan) => {
        if (plan.price === 0) return 'Free';
        const price = billingInterval === 'year' ? plan.price * 10 : plan.price;
        return `$${price}/${billingInterval === 'year' ? 'year' : 'mo'}`;
    };

    return (
        <div className={`h-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} p-8 overflow-y-auto`}>
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className={`text-4xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        💳 Billing & Payments
                    </h1>
                    <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Manage your subscription and billing
                    </p>
                </div>

                {/* Current Usage */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-6 text-white">
                        <Rocket className="h-8 w-8 mb-2" />
                        <div className="text-3xl font-bold">{usageStats.apps}</div>
                        <div className="text-sm opacity-80">Apps Created</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
                        <DollarSign className="h-8 w-8 mb-2" />
                        <div className="text-3xl font-bold">{usageStats.storage} GB</div>
                        <div className="text-sm opacity-80">Storage Used</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-6 text-white">
                        <TrendingUp className="h-8 w-8 mb-2" />
                        <div className="text-3xl font-bold">{usageStats.apiCalls.toLocaleString()}</div>
                        <div className="text-sm opacity-80">API Calls</div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl p-6 text-white">
                        <Crown className="h-8 w-8 mb-2" />
                        <div className="text-3xl font-bold">{usageStats.users}</div>
                        <div className="text-sm opacity-80">Team Members</div>
                    </div>
                </div>

                {/* Billing Interval Toggle */}
                <div className="flex justify-center mb-8">
                    <div className={`inline-flex rounded-xl p-1 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                        <button
                            type="button"
                            onClick={() => setBillingInterval('month')}
                            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                                billingInterval === 'month'
                                    ? 'bg-purple-600 text-white'
                                    : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}
                        >
                            Monthly
                        </button>
                        <button
                            type="button"
                            onClick={() => setBillingInterval('year')}
                            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                                billingInterval === 'year'
                                    ? 'bg-purple-600 text-white'
                                    : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}
                        >
                            Yearly
                            <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-500 text-xs rounded">
                                Save 20%
                            </span>
                        </button>
                    </div>
                </div>

                {/* Pricing Plans */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {PLANS.map(plan => (
                        <div
                            key={plan.id}
                            className={`relative p-6 rounded-2xl border transition-all ${
                                plan.popular
                                    ? 'border-purple-500 shadow-2xl shadow-purple-500/20 scale-105'
                                    : isDarkMode ? 'border-gray-700' : 'border-gray-200'
                            } ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <span className="px-4 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-bold rounded-full">
                                        MOST POPULAR
                                    </span>
                                </div>
                            )}

                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-white mb-4`}>
                                {plan.id === 'free' && <Zap className="h-6 w-6" />}
                                {plan.id === 'pro' && <Crown className="h-6 w-6" />}
                                {plan.id === 'enterprise' && <Rocket className="h-6 w-6" />}
                            </div>

                            <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {plan.name}
                            </h3>

                            <div className="mb-6">
                                <span className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {getPrice(plan)}
                                </span>
                            </div>

                            <ul className="space-y-3 mb-6">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                        <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                type="button"
                                onClick={() => upgradePlan(plan.id)}
                                disabled={currentPlan === plan.id}
                                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                                    currentPlan === plan.id
                                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                        : plan.popular
                                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
                                        : isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                                }`}
                            >
                                {currentPlan === plan.id ? 'Current Plan' : 'Upgrade'}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Payment Method & Invoices */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Payment Method */}
                    <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Payment Method
                        </h3>
                        <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                                    <CreditCard className="h-6 w-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        •••• •••• •••• 4242
                                    </div>
                                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Expires 12/25
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold"
                                >
                                    Update
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Next Billing */}
                    <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Next Billing
                        </h3>
                        <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                                    <Calendar className="h-6 w-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        ${PLANS.find(p => p.id === currentPlan)?.price || 0}/month
                                    </div>
                                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Due on {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Invoices */}
                <div className={`mt-6 p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Billing History
                    </h3>
                    <div className="space-y-3">
                        {invoices.map(invoice => (
                            <div
                                key={invoice.id}
                                className={`p-4 rounded-xl border flex items-center justify-between ${
                                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                                        invoice.status === 'paid' ? 'bg-green-500/20 text-green-500' :
                                        invoice.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                                        'bg-red-500/20 text-red-500'
                                    }`}>
                                        {invoice.status.toUpperCase()}
                                    </div>
                                    <div>
                                        <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {invoice.id}
                                        </div>
                                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {invoice.date.toLocaleDateString()} • {invoice.plan}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        ${invoice.amount}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => downloadInvoice(invoice.id)}
                                        className="p-2 hover:bg-gray-600 rounded-lg"
                                    >
                                        <Download className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BillingPayments;

