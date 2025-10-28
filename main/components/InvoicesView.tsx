

import React, { useState, useEffect, useMemo, useCallback } from 'react';
// FIX: Corrected import paths to be relative.
import { User, Invoice, Quote, Client, Project, InvoiceStatus, QuoteStatus } from '../types';
import { api } from '../services/mockApi';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { InvoiceStatusBadge, QuoteStatusBadge } from './ui/StatusBadge';

interface InvoicesViewProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount);
};

export const InvoicesView: React.FC<InvoicesViewProps> = ({ user, addToast }) => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'invoices' | 'quotes'>('invoices');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            if (!user.companyId) return;
            const [invoiceData, quoteData, clientData, projectData] = await Promise.all([
                api.getInvoicesByCompany(user.companyId),
                api.getQuotesByCompany(user.companyId),
                api.getClientsByCompany(user.companyId),
                api.getProjectsByCompany(user.companyId),
            ]);
            setInvoices(invoiceData);
            setQuotes(quoteData);
            setClients(clientData);
            setProjects(projectData);
        } catch (error) {
            addToast("Failed to load financial data.", "error");
        } finally {
            setLoading(false);
        }
    }, [user.companyId, addToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const findClientName = (id: number) => clients.find(c => c.id === id)?.name || 'Unknown Client';
    const findProjectName = (id: number) => projects.find(p => p.id === id)?.name || 'Unknown Project';

    const renderInvoicesTable = () => (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-slate-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Invoice #</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Client</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Project</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Due Date</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Amount Due</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Total</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {invoices.map(invoice => (
                        <tr key={invoice.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 text-sm font-medium text-slate-900">INV-{String(invoice.id).padStart(4, '0')}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{findClientName(invoice.clientId)}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{findProjectName(invoice.projectId)}</td>
                            <td className="px-6 py-4 text-sm"><InvoiceStatusBadge status={invoice.status} /></td>
                            <td className="px-6 py-4 text-sm text-slate-600">{new Date(invoice.dueAt).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-sm text-right font-semibold text-slate-800">{formatCurrency(invoice.amountDue)}</td>
                            <td className="px-6 py-4 text-sm text-right text-slate-600">{formatCurrency(invoice.total)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
             {invoices.length === 0 && <p className="text-center py-8 text-slate-500">No invoices found.</p>}
        </div>
    );

    const renderQuotesTable = () => (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-slate-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Quote #</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Client</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Project</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Valid Until</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Total</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {quotes.map(quote => (
                        <tr key={quote.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 text-sm font-medium text-slate-900">Q-{String(quote.id).padStart(4, '0')}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{findClientName(quote.clientId)}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{findProjectName(quote.projectId)}</td>
                            <td className="px-6 py-4 text-sm"><QuoteStatusBadge status={quote.status} /></td>
                            <td className="px-6 py-4 text-sm text-slate-600">{new Date(quote.validUntil).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-sm text-right font-semibold text-slate-800">{formatCurrency(quote.total)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {quotes.length === 0 && <p className="text-center py-8 text-slate-500">No quotes found.</p>}
        </div>
    );


    if (loading) {
        return <Card><p>Loading financial data...</p></Card>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-slate-800">Invoices & Quotes</h2>
                <div className="flex gap-2">
                    <Button variant="secondary">New Quote</Button>
                    <Button variant="primary">New Invoice</Button>
                </div>
            </div>
            <Card>
                <div className="border-b border-gray-200 mb-4">
                    <nav className="-mb-px flex space-x-6">
                        <button
                            onClick={() => setActiveTab('invoices')}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'invoices' ? 'border-green-500 text-green-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        >
                            Invoices
                        </button>
                        <button
                            onClick={() => setActiveTab('quotes')}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'quotes' ? 'border-green-500 text-green-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        >
                            Quotes
                        </button>
                    </nav>
                </div>
                {activeTab === 'invoices' ? renderInvoicesTable() : renderQuotesTable()}
            </Card>
        </div>
    );
};