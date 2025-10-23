import React, { useState, useEffect, useMemo } from 'react';
import {
    CreditCard, DollarSign, FileText, Download, Eye, Search, Filter,
    Plus, X, CheckCircle, AlertCircle, Clock, TrendingUp, Calendar,
    Users, Building2, Receipt, Wallet, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import toast from 'react-hot-toast';

interface Subscription {
    id: string;
    company_id: string;
    company_name?: string;
    plan_type: 'free' | 'basic' | 'professional' | 'enterprise';
    status: 'active' | 'cancelled' | 'expired' | 'trial';
    billing_cycle: 'monthly' | 'yearly';
    amount: number;
    start_date: string;
    end_date?: string;
    auto_renew: boolean;
    created_at: string;
    updated_at?: string;
}

interface Invoice {
    id: string;
    company_id: string;
    company_name?: string;
    invoice_number: string;
    amount: number;
    status: 'paid' | 'pending' | 'overdue' | 'cancelled';
    due_date: string;
    paid_date?: string;
    description: string;
    items?: any[];
    created_at: string;
}

interface Payment {
    id: string;
    company_id: string;
    company_name?: string;
    invoice_id?: string;
    invoice_number?: string;
    amount: number;
    payment_method: 'credit_card' | 'bank_transfer' | 'paypal' | 'other';
    status: 'completed' | 'pending' | 'failed' | 'refunded';
    transaction_id?: string;
    payment_date: string;
    created_at: string;
}

interface BillingPaymentsManagementProps {
    currentUser?: any;
}

const BillingPaymentsManagement: React.FC<BillingPaymentsManagementProps> = ({ currentUser }) => {
    const [activeTab, setActiveTab] = useState<'subscriptions' | 'invoices' | 'payments'>('subscriptions');
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [showViewModal, setShowViewModal] = useState(false);

    // Form states
    const [subscriptionForm, setSubscriptionForm] = useState({
        company_id: '',
        plan_type: 'basic' as Subscription['plan_type'],
        billing_cycle: 'monthly' as Subscription['billing_cycle'],
        amount: 0,
        start_date: new Date().toISOString().split('T')[0],
        auto_renew: true
    });

    const [invoiceForm, setInvoiceForm] = useState({
        company_id: '',
        amount: 0,
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: ''
    });

    const [paymentForm, setPaymentForm] = useState({
        company_id: '',
        invoice_id: '',
        amount: 0,
        payment_method: 'credit_card' as Payment['payment_method'],
        transaction_id: '',
        payment_date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        loadData();
        loadCompanies();
    }, [activeTab]);

    const loadCompanies = async () => {
        try {
            const { data, error } = await supabase
                .from('companies')
                .select('id, name')
                .order('name');
            if (error) throw error;
            setCompanies(data || []);
        } catch (error: any) {
            console.error('Error loading companies:', error);
        }
    };

    const loadData = async () => {
        try {
            setLoading(true);
            if (activeTab === 'subscriptions') {
                await loadSubscriptions();
            } else if (activeTab === 'invoices') {
                await loadInvoices();
            } else {
                await loadPayments();
            }
        } catch (error: any) {
            console.error('Error loading data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const loadSubscriptions = async () => {
        const { data, error } = await supabase
            .from('subscriptions')
            .select(`
                *,
                companies(name)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const formatted = (data || []).map((sub: any) => ({
            ...sub,
            company_name: sub.companies?.name
        }));

        setSubscriptions(formatted);
    };

    const loadInvoices = async () => {
        const { data, error } = await supabase
            .from('invoices')
            .select(`
                *,
                companies(name)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const formatted = (data || []).map((inv: any) => ({
            ...inv,
            company_name: inv.companies?.name
        }));

        setInvoices(formatted);
    };

    const loadPayments = async () => {
        try {
            const { data, error } = await supabase
                .from('payments')
                .select(`
                    *,
                    companies(name),
                    invoices(invoice_number)
                `)
                .order('created_at', { ascending: false });

            if (error) {
                // Handle table not found error gracefully
                if (error.code === 'PGRST116' || error.message?.includes('not found')) {
                    console.warn('Payments table not found in database');
                    setPayments([]);
                    return;
                }
                throw error;
            }

            const formatted = (data || []).map((pay: any) => ({
                ...pay,
                company_name: pay.companies?.name,
                invoice_number: pay.invoices?.invoice_number
            }));

            setPayments(formatted);
        } catch (error: any) {
            console.error('Error loading payments:', error);
            // Set empty array instead of throwing to prevent app crash
            setPayments([]);
        }
    };

    const generateInvoiceNumber = () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `INV-${year}${month}-${random}`;
    };

    const handleCreateSubscription = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const endDate = new Date(subscriptionForm.start_date);
            if (subscriptionForm.billing_cycle === 'monthly') {
                endDate.setMonth(endDate.getMonth() + 1);
            } else {
                endDate.setFullYear(endDate.getFullYear() + 1);
            }

            const { error } = await supabase.from('subscriptions').insert({
                id: crypto.randomUUID(),
                company_id: subscriptionForm.company_id,
                plan_type: subscriptionForm.plan_type,
                status: 'active',
                billing_cycle: subscriptionForm.billing_cycle,
                amount: subscriptionForm.amount,
                start_date: subscriptionForm.start_date,
                end_date: endDate.toISOString().split('T')[0],
                auto_renew: subscriptionForm.auto_renew,
                created_at: new Date().toISOString()
            });

            if (error) throw error;

            toast.success('Subscription created successfully!');
            setShowCreateModal(false);
            setSubscriptionForm({
                company_id: '',
                plan_type: 'basic',
                billing_cycle: 'monthly',
                amount: 0,
                start_date: new Date().toISOString().split('T')[0],
                auto_renew: true
            });
            loadSubscriptions();
        } catch (error: any) {
            console.error('Error creating subscription:', error);
            toast.error('Failed to create subscription');
        }
    };

    const handleCreateInvoice = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from('invoices').insert({
                id: crypto.randomUUID(),
                company_id: invoiceForm.company_id,
                invoice_number: generateInvoiceNumber(),
                amount: invoiceForm.amount,
                status: 'pending',
                due_date: invoiceForm.due_date,
                description: invoiceForm.description,
                created_at: new Date().toISOString()
            });

            if (error) throw error;

            toast.success('Invoice created successfully!');
            setShowCreateModal(false);
            setInvoiceForm({
                company_id: '',
                amount: 0,
                due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                description: ''
            });
            loadInvoices();
        } catch (error: any) {
            console.error('Error creating invoice:', error);
            toast.error('Failed to create invoice');
        }
    };

    const handleCreatePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from('payments').insert({
                id: crypto.randomUUID(),
                company_id: paymentForm.company_id,
                invoice_id: paymentForm.invoice_id || null,
                amount: paymentForm.amount,
                payment_method: paymentForm.payment_method,
                status: 'completed',
                transaction_id: paymentForm.transaction_id || null,
                payment_date: paymentForm.payment_date,
                created_at: new Date().toISOString()
            });

            if (error) {
                // Handle table not found error
                if (error.code === 'PGRST116' || error.message?.includes('not found')) {
                    toast.error('Payments table not configured. Please contact support.');
                    return;
                }
                throw error;
            }

            // Update invoice status if payment is linked to an invoice
            if (paymentForm.invoice_id) {
                await supabase
                    .from('invoices')
                    .update({ status: 'paid', paid_date: paymentForm.payment_date })
                    .eq('id', paymentForm.invoice_id);
            }

            toast.success('Payment recorded successfully!');
            setShowCreateModal(false);
            setPaymentForm({
                company_id: '',
                invoice_id: '',
                amount: 0,
                payment_method: 'credit_card',
                transaction_id: '',
                payment_date: new Date().toISOString().split('T')[0]
            });
            loadPayments();
        } catch (error: any) {
            console.error('Error creating payment:', error);
            toast.error('Failed to record payment');
        }
    };

    const getPlanColor = (plan: string) => {
        const colors: Record<string, string> = {
            free: 'bg-gray-100 text-gray-800',
            basic: 'bg-blue-100 text-blue-800',
            professional: 'bg-purple-100 text-purple-800',
            enterprise: 'bg-orange-100 text-orange-800'
        };
        return colors[plan] || colors.free;
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            active: 'bg-green-100 text-green-800',
            paid: 'bg-green-100 text-green-800',
            completed: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            trial: 'bg-blue-100 text-blue-800',
            overdue: 'bg-red-100 text-red-800',
            failed: 'bg-red-100 text-red-800',
            cancelled: 'bg-gray-100 text-gray-800',
            expired: 'bg-gray-100 text-gray-800',
            refunded: 'bg-orange-100 text-orange-800'
        };
        return colors[status] || colors.pending;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const stats = useMemo(() => {
        if (activeTab === 'subscriptions') {
            return {
                total: subscriptions.length,
                active: subscriptions.filter(s => s.status === 'active').length,
                revenue: subscriptions.filter(s => s.status === 'active').reduce((sum, s) => sum + s.amount, 0),
                trial: subscriptions.filter(s => s.status === 'trial').length
            };
        } else if (activeTab === 'invoices') {
            return {
                total: invoices.length,
                paid: invoices.filter(i => i.status === 'paid').length,
                pending: invoices.filter(i => i.status === 'pending').length,
                overdue: invoices.filter(i => i.status === 'overdue').length,
                revenue: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0)
            };
        } else {
            return {
                total: payments.length,
                completed: payments.filter(p => p.status === 'completed').length,
                pending: payments.filter(p => p.status === 'pending').length,
                revenue: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0)
            };
        }
    }, [activeTab, subscriptions, invoices, payments]);

    const filteredData = useMemo(() => {
        let data: any[] = [];
        if (activeTab === 'subscriptions') data = subscriptions;
        else if (activeTab === 'invoices') data = invoices;
        else data = payments;

        return data.filter(item => {
            const matchesSearch = !searchQuery ||
                item.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.transaction_id?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = filterStatus === 'all' || item.status === filterStatus;

            return matchesSearch && matchesStatus;
        });
    }, [activeTab, subscriptions, invoices, payments, searchQuery, filterStatus]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Billing & Payments</h1>
                        <p className="text-gray-600">Manage subscriptions, invoices, and payments</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Create {activeTab === 'subscriptions' ? 'Subscription' : activeTab === 'invoices' ? 'Invoice' : 'Payment'}
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        type="button"
                        onClick={() => setActiveTab('subscriptions')}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'subscriptions'
                            ? 'bg-white text-blue-600 shadow-md'
                            : 'text-gray-600 hover:bg-white/50'
                            }`}
                    >
                        <CreditCard className="w-5 h-5 inline mr-2" />
                        Subscriptions
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('invoices')}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'invoices'
                            ? 'bg-white text-blue-600 shadow-md'
                            : 'text-gray-600 hover:bg-white/50'
                            }`}
                    >
                        <FileText className="w-5 h-5 inline mr-2" />
                        Invoices
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('payments')}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'payments'
                            ? 'bg-white text-blue-600 shadow-md'
                            : 'text-gray-600 hover:bg-white/50'
                            }`}
                    >
                        <Wallet className="w-5 h-5 inline mr-2" />
                        Payments
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {activeTab === 'subscriptions' && (
                        <>
                            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Subscriptions</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                    </div>
                                    <Users className="w-8 h-8 text-blue-600" />
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Active</p>
                                        <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                                    </div>
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Monthly Revenue</p>
                                        <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.revenue)}</p>
                                    </div>
                                    <DollarSign className="w-8 h-8 text-blue-600" />
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Trial</p>
                                        <p className="text-2xl font-bold text-yellow-600">{stats.trial}</p>
                                    </div>
                                    <Clock className="w-8 h-8 text-yellow-600" />
                                </div>
                            </div>
                        </>
                    )}
                    {activeTab === 'invoices' && (
                        <>
                            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Invoices</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                    </div>
                                    <FileText className="w-8 h-8 text-blue-600" />
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Paid</p>
                                        <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
                                    </div>
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Pending</p>
                                        <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                                    </div>
                                    <Clock className="w-8 h-8 text-yellow-600" />
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Revenue</p>
                                        <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.revenue)}</p>
                                    </div>
                                    <DollarSign className="w-8 h-8 text-blue-600" />
                                </div>
                            </div>
                        </>
                    )}
                    {activeTab === 'payments' && (
                        <>
                            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Payments</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                    </div>
                                    <Receipt className="w-8 h-8 text-blue-600" />
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Completed</p>
                                        <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                                    </div>
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Pending</p>
                                        <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                                    </div>
                                    <Clock className="w-8 h-8 text-yellow-600" />
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Received</p>
                                        <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.revenue)}</p>
                                    </div>
                                    <DollarSign className="w-8 h-8 text-blue-600" />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Search and Filters */}
            <div className="mb-6">
                <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100 flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        aria-label="Filter by status"
                    >
                        <option value="all">All Status</option>
                        {activeTab === 'subscriptions' && (
                            <>
                                <option value="active">Active</option>
                                <option value="trial">Trial</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="expired">Expired</option>
                            </>
                        )}
                        {activeTab === 'invoices' && (
                            <>
                                <option value="paid">Paid</option>
                                <option value="pending">Pending</option>
                                <option value="overdue">Overdue</option>
                                <option value="cancelled">Cancelled</option>
                            </>
                        )}
                        {activeTab === 'payments' && (
                            <>
                                <option value="completed">Completed</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                                <option value="refunded">Refunded</option>
                            </>
                        )}
                    </select>
                </div>
            </div>

            {/* Data Display */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : filteredData.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center shadow-md">
                    {activeTab === 'subscriptions' && <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />}
                    {activeTab === 'invoices' && <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />}
                    {activeTab === 'payments' && <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />}
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No {activeTab} found</h3>
                    <p className="text-gray-600 mb-6">Create your first {activeTab.slice(0, -1)} to get started</p>
                    <button
                        type="button"
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
                    >
                        Create {activeTab === 'subscriptions' ? 'Subscription' : activeTab === 'invoices' ? 'Invoice' : 'Payment'}
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredData.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Building2 className="w-5 h-5 text-gray-400" />
                                        <h3 className="text-lg font-semibold text-gray-900">{item.company_name}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                            {item.status.toUpperCase()}
                                        </span>
                                        {activeTab === 'subscriptions' && (
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPlanColor(item.plan_type)}`}>
                                                {item.plan_type.toUpperCase()}
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                        {activeTab === 'subscriptions' && (
                                            <>
                                                <div>
                                                    <p className="text-sm text-gray-500">Amount</p>
                                                    <p className="font-semibold text-gray-900">{formatCurrency(item.amount)}/{item.billing_cycle}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Start Date</p>
                                                    <p className="font-semibold text-gray-900">{new Date(item.start_date).toLocaleDateString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">End Date</p>
                                                    <p className="font-semibold text-gray-900">
                                                        {item.end_date ? new Date(item.end_date).toLocaleDateString() : 'N/A'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Auto Renew</p>
                                                    <p className="font-semibold text-gray-900">{item.auto_renew ? 'Yes' : 'No'}</p>
                                                </div>
                                            </>
                                        )}
                                        {activeTab === 'invoices' && (
                                            <>
                                                <div>
                                                    <p className="text-sm text-gray-500">Invoice #</p>
                                                    <p className="font-semibold text-gray-900">{item.invoice_number}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Amount</p>
                                                    <p className="font-semibold text-gray-900">{formatCurrency(item.amount)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Due Date</p>
                                                    <p className="font-semibold text-gray-900">{new Date(item.due_date).toLocaleDateString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Paid Date</p>
                                                    <p className="font-semibold text-gray-900">
                                                        {item.paid_date ? new Date(item.paid_date).toLocaleDateString() : 'N/A'}
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                        {activeTab === 'payments' && (
                                            <>
                                                <div>
                                                    <p className="text-sm text-gray-500">Amount</p>
                                                    <p className="font-semibold text-gray-900">{formatCurrency(item.amount)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Payment Method</p>
                                                    <p className="font-semibold text-gray-900">{item.payment_method.replace('_', ' ').toUpperCase()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Payment Date</p>
                                                    <p className="font-semibold text-gray-900">{new Date(item.payment_date).toLocaleDateString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Transaction ID</p>
                                                    <p className="font-semibold text-gray-900">{item.transaction_id || 'N/A'}</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 ml-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedItem(item);
                                            setShowViewModal(true);
                                        }}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="View details"
                                    >
                                        <Eye className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BillingPaymentsManagement;

