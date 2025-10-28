/**
 * Invoice Builder Component - CortexBuild Platform
 * Full-featured invoice builder with multiple templates
 * Version: 1.1.0 GOLDEN
 */

import React, { useState } from 'react';
import '../styles/invoice-templates.css';

interface InvoiceItem {
    description: string;
    quantity: number;
    rate: number;
    amount: number;
}

interface InvoiceData {
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    companyName: string;
    companyAddress: string;
    companyEmail: string;
    companyPhone: string;
    clientName: string;
    clientAddress: string;
    clientEmail: string;
    clientPhone: string;
    items: InvoiceItem[];
    notes: string;
    terms: string;
    subtotal: number;
    tax: number;
    total: number;
}

interface InvoiceBuilderProps {
    onClose: () => void;
    onSave: (invoice: InvoiceData) => void;
}

export const InvoiceBuilder: React.FC<InvoiceBuilderProps> = ({ onClose, onSave }) => {
    const [template, setTemplate] = useState('modern');
    const [invoiceData, setInvoiceData] = useState<InvoiceData>({
        invoiceNumber: `INV-${Date.now()}`,
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        companyName: 'CortexBuild Ltd',
        companyAddress: '123 Construction Ave, London, UK',
        companyEmail: 'billing@cortexbuild.com',
        companyPhone: '+44 20 1234 5678',
        clientName: '',
        clientAddress: '',
        clientEmail: '',
        clientPhone: '',
        items: [
            { description: '', quantity: 1, rate: 0, amount: 0 }
        ],
        notes: 'Thank you for your business!',
        terms: 'Payment due within 30 days',
        subtotal: 0,
        tax: 0,
        total: 0
    });

    const templates = [
        { id: 'modern', name: 'Modern', color: 'bg-blue-500' },
        { id: 'classic', name: 'Classic', color: 'bg-gray-800' },
        { id: 'creative', name: 'Creative', color: 'bg-teal-500' },
        { id: 'minimalist', name: 'Minimalist', color: 'bg-gray-400' },
        { id: 'corporate', name: 'Corporate', color: 'bg-gray-700' },
        { id: 'artistic', name: 'Artistic', color: 'bg-red-800' },
        { id: 'teal', name: 'Teal', color: 'bg-teal-600' },
        { id: 'geometric', name: 'Geometric', color: 'bg-yellow-500' },
        { id: 'handwritten', name: 'Handwritten', color: 'bg-gray-600' },
        { id: 'vintage', name: 'Vintage', color: 'bg-amber-700' }
    ];

    const addItem = () => {
        setInvoiceData({
            ...invoiceData,
            items: [...invoiceData.items, { description: '', quantity: 1, rate: 0, amount: 0 }]
        });
    };

    const removeItem = (index: number) => {
        const newItems = invoiceData.items.filter((_, i) => i !== index);
        setInvoiceData({ ...invoiceData, items: newItems });
        calculateTotals(newItems);
    };

    const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
        const newItems = [...invoiceData.items];
        newItems[index] = { ...newItems[index], [field]: value };

        if (field === 'quantity' || field === 'rate') {
            newItems[index].amount = newItems[index].quantity * newItems[index].rate;
        }

        setInvoiceData({ ...invoiceData, items: newItems });
        calculateTotals(newItems);
    };

    const calculateTotals = (items: InvoiceItem[]) => {
        const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
        const tax = subtotal * 0.2; // 20% VAT
        const total = subtotal + tax;

        setInvoiceData(prev => ({
            ...prev,
            subtotal,
            tax,
            total
        }));
    };

    const formatCurrency = (amount: number) => {
        return `£${amount.toFixed(2)}`;
    };

    const handlePrint = () => {
        window.print();
    };

    const handleSave = () => {
        onSave(invoiceData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
            <div className="min-h-screen p-4">
                {/* Control Panel */}
                <div className="max-w-7xl mx-auto mb-4 bg-white rounded-lg shadow-lg p-4 print:hidden">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-gray-900">Invoice Builder</h2>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={handlePrint}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Print / PDF
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Save Invoice
                            </button>
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>

                    {/* Template Selector */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Template
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {templates.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setTemplate(t.id)}
                                    className={`px-4 py-2 rounded-lg transition-all ${template === t.id
                                        ? `${t.color} text-white shadow-lg scale-105`
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                >
                                    {t.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Company Info */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">Your Company</h3>
                            <input
                                type="text"
                                placeholder="Company Name"
                                value={invoiceData.companyName}
                                onChange={(e) => setInvoiceData({ ...invoiceData, companyName: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                            />
                            <input
                                type="text"
                                placeholder="Address"
                                value={invoiceData.companyAddress}
                                onChange={(e) => setInvoiceData({ ...invoiceData, companyAddress: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={invoiceData.companyEmail}
                                onChange={(e) => setInvoiceData({ ...invoiceData, companyEmail: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                            />
                            <input
                                type="tel"
                                placeholder="Phone"
                                value={invoiceData.companyPhone}
                                onChange={(e) => setInvoiceData({ ...invoiceData, companyPhone: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>

                        {/* Client Info */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">Bill To</h3>
                            <input
                                type="text"
                                placeholder="Client Name"
                                value={invoiceData.clientName}
                                onChange={(e) => setInvoiceData({ ...invoiceData, clientName: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                            />
                            <input
                                type="text"
                                placeholder="Address"
                                value={invoiceData.clientAddress}
                                onChange={(e) => setInvoiceData({ ...invoiceData, clientAddress: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={invoiceData.clientEmail}
                                onChange={(e) => setInvoiceData({ ...invoiceData, clientEmail: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                            />
                            <input
                                type="tel"
                                placeholder="Phone"
                                value={invoiceData.clientPhone}
                                onChange={(e) => setInvoiceData({ ...invoiceData, clientPhone: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                    </div>

                    {/* Invoice Details */}
                    <div className="grid grid-cols-3 gap-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice #</label>
                            <input
                                type="text"
                                value={invoiceData.invoiceNumber}
                                onChange={(e) => setInvoiceData({ ...invoiceData, invoiceNumber: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
                            <input
                                type="date"
                                value={invoiceData.invoiceDate}
                                onChange={(e) => setInvoiceData({ ...invoiceData, invoiceDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                            <input
                                type="date"
                                value={invoiceData.dueDate}
                                onChange={(e) => setInvoiceData({ ...invoiceData, dueDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                    </div>

                    {/* Line Items */}
                    <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900">Line Items</h3>
                            <button
                                onClick={addItem}
                                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                            >
                                + Add Item
                            </button>
                        </div>
                        {invoiceData.items.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 gap-2 mb-2">
                                <input
                                    type="text"
                                    placeholder="Description"
                                    value={item.description}
                                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                                    className="col-span-5 px-3 py-2 border border-gray-300 rounded-lg"
                                />
                                <input
                                    type="number"
                                    placeholder="Qty"
                                    value={item.quantity}
                                    onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                                    className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg"
                                />
                                <input
                                    type="number"
                                    placeholder="Rate"
                                    value={item.rate}
                                    onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                                    className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg"
                                />
                                <div className="col-span-2 px-3 py-2 bg-gray-100 rounded-lg flex items-center">
                                    {formatCurrency(item.amount)}
                                </div>
                                <button
                                    onClick={() => removeItem(index)}
                                    className="col-span-1 px-2 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Invoice Preview - A4 Format */}
                <div className={`a4-preview-container ${template} bg-white mx-auto shadow-2xl`} style={{
                    width: '21cm',
                    minHeight: '29.7cm',
                    padding: '1cm',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                }}>
                    {/* Header */}
                    <header style={{ borderBottom: '2px solid #e5e7eb', paddingBottom: '1rem', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div>
                                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
                                    {invoiceData.companyName}
                                </h1>
                                <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.5' }}>
                                    {invoiceData.companyAddress}<br />
                                    {invoiceData.companyEmail}<br />
                                    {invoiceData.companyPhone}
                                </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2563eb', marginBottom: '0.5rem' }}>
                                    INVOICE
                                </h2>
                                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                    #{invoiceData.invoiceNumber}
                                </p>
                            </div>
                        </div>
                    </header>

                    {/* Bill To & Invoice Details */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                        <div>
                            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                                Bill To
                            </h3>
                            <p style={{ fontSize: '0.875rem', color: '#1f2937', lineHeight: '1.5' }}>
                                <strong>{invoiceData.clientName}</strong><br />
                                {invoiceData.clientAddress}<br />
                                {invoiceData.clientEmail}<br />
                                {invoiceData.clientPhone}
                            </p>
                        </div>
                        <div>
                            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                                Invoice Details
                            </h3>
                            <div style={{ fontSize: '0.875rem', color: '#1f2937' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                    <span>Invoice Date:</span>
                                    <span>{invoiceData.invoiceDate}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Due Date:</span>
                                    <span>{invoiceData.dueDate}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #d1d5db' }}>
                                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                                    Description
                                </th>
                                <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                                    Qty
                                </th>
                                <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                                    Rate
                                </th>
                                <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                                    Amount
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoiceData.items.map((item, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#1f2937' }}>
                                        {item.description}
                                    </td>
                                    <td style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', color: '#1f2937' }}>
                                        {item.quantity}
                                    </td>
                                    <td style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', color: '#1f2937' }}>
                                        {formatCurrency(item.rate)}
                                    </td>
                                    <td style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', color: '#1f2937' }}>
                                        {formatCurrency(item.amount)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Summary */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
                        <div style={{ width: '300px', backgroundColor: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: '0.5rem', padding: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                <span>Subtotal:</span>
                                <span>{formatCurrency(invoiceData.subtotal)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                <span>Tax (20%):</span>
                                <span>{formatCurrency(invoiceData.tax)}</span>
                            </div>
                            <div style={{ borderTop: '2px solid #d1d5db', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold' }}>
                                    <span>Total:</span>
                                    <span>{formatCurrency(invoiceData.total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Amount Due Box */}
                    <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '0.5rem', marginBottom: '2rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Amount Due</p>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{formatCurrency(invoiceData.total)}</p>
                    </div>

                    {/* Notes & Terms */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div>
                            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                                Notes
                            </h3>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.5' }}>
                                {invoiceData.notes}
                            </p>
                        </div>
                        <div>
                            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                                Terms & Conditions
                            </h3>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.5' }}>
                                {invoiceData.terms}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

