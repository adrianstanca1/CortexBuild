import React, { useState, useEffect, useMemo } from 'react';
import {
    CreditCard, DollarSign, FileText, Eye, Search, Filter,
    Plus, X, CheckCircle, Clock, Users, Building2, Receipt, Wallet
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

const BillingPaymentsManagement: React.FC<BillingPaymentsManagementProps> = ({ currentUser: _currentUser }) => {
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

    const modalTitle = activeTab === 'subscriptions' ? 'Subscription' : activeTab === 'invoices' ? 'Invoice' : 'Payment';

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
        <>
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
                        Create {modalTitle}
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

                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        Create {modalTitle}
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

        {showCreateModal && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-gray-900">
                            Create {modalTitle}
                        </h3>
                        <button
                            type="button"
                            onClick={() => setShowCreateModal(false)}
                            className="p-2 rounded-full hover:bg-gray-100"
                            aria-label="Close create modal"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {activeTab === 'subscriptions' && (
                        <form onSubmit={handleCreateSubscription} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                                <select
                                    value={subscriptionForm.company_id}
                                    onChange={(e) => setSubscriptionForm({ ...subscriptionForm, company_id: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select company</option>
                                    {companies.map((company) => (
                                        <option key={company.id} value={company.id}>{company.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Plan Type</label>
                                    <select
                                        value={subscriptionForm.plan_type}
                                        onChange={(e) => setSubscriptionForm({ ...subscriptionForm, plan_type: e.target.value as Subscription['plan_type'] })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="basic">Basic</option>
                                        <option value="professional">Professional</option>
                                        <option value="enterprise">Enterprise</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Billing Cycle</label>
                                    <select
                                        value={subscriptionForm.billing_cycle}
                                        onChange={(e) => setSubscriptionForm({ ...subscriptionForm, billing_cycle: e.target.value as Subscription['billing_cycle'] })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="monthly">Monthly</option>
                                        <option value="yearly">Yearly</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={subscriptionForm.amount}
                                        onChange={(e) => setSubscriptionForm({ ...subscriptionForm, amount: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={subscriptionForm.start_date}
                                        onChange={(e) => setSubscriptionForm({ ...subscriptionForm, start_date: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    id="auto-renew"
                                    type="checkbox"
                                    checked={subscriptionForm.auto_renew}
                                    onChange={(e) => setSubscriptionForm({ ...subscriptionForm, auto_renew: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="auto-renew" className="text-sm text-gray-700">Enable auto renew</label>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create Subscription</button>
                            </div>
                        </form>
                    )}

                    {activeTab === 'invoices' && (
                        <form onSubmit={handleCreateInvoice} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                                <select
                                    value={invoiceForm.company_id}
                                    onChange={(e) => setInvoiceForm({ ...invoiceForm, company_id: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select company</option>
                                    {companies.map((company) => (
                                        <option key={company.id} value={company.id}>{company.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={invoiceForm.amount}
                                        onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                    <input
                                        type="date"
                                        value={invoiceForm.due_date}
                                        onChange={(e) => setInvoiceForm({ ...invoiceForm, due_date: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={invoiceForm.description}
                                    onChange={(e) => setInvoiceForm({ ...invoiceForm, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows={4}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create Invoice</button>
                            </div>
                        </form>
                    )}

                    {activeTab === 'payments' && (
                        <form onSubmit={handleCreatePayment} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                                <select
                                    value={paymentForm.company_id}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, company_id: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select company</option>
                                    {companies.map((company) => (
                                        <option key={company.id} value={company.id}>{company.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={paymentForm.amount}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                                    <select
                                        value={paymentForm.payment_method}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value as Payment['payment_method'] })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="credit_card">Credit Card</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                        <option value="paypal">PayPal</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                                    <input
                                        type="date"
                                        value={paymentForm.payment_date}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice</label>
                                    <input
                                        type="text"
                                        value={paymentForm.invoice_id}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, invoice_id: e.target.value })}
                                        placeholder="Linked invoice ID (optional)"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
                                <input
                                    type="text"
                                    value={paymentForm.transaction_id}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, transaction_id: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Record Payment</button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        )}

        {showViewModal && selectedItem && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-gray-900">{modalTitle} Details</h3>
                        <button
                            type="button"
                            onClick={() => setShowViewModal(false)}
                            className="p-2 rounded-full hover:bg-gray-100"
                            aria-label="Close detail modal"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Company</p>
                            <p className="text-base font-semibold text-gray-900">{selectedItem.company_name || 'N/A'}</p>
                        </div>
                        {('invoice_number' in selectedItem) && (
                            <div>
                                <p className="text-sm text-gray-500">Invoice #</p>
                                <p className="text-base font-semibold text-gray-900">{selectedItem.invoice_number}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <p className="text-base font-semibold text-gray-900 uppercase">{selectedItem.status}</p>
                        </div>
                        {('amount' in selectedItem) && (
                            <div>
                                <p className="text-sm text-gray-500">Amount</p>
                                <p className="text-base font-semibold text-gray-900">{formatCurrency(selectedItem.amount)}</p>
                            </div>
                        )}
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-2">Full record</p>
                        <pre className="text-xs text-gray-600 overflow-x-auto whitespace-pre-wrap">
{JSON.stringify(selectedItem, null, 2)}
                        </pre>
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => setShowViewModal(false)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
};

export default BillingPaymentsManagement;
