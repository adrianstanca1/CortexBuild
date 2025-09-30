// @ts-nocheck
import React, { useState } from 'react';
import { User, Invoice, InvoiceStatus } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  Plus, 
  FileText, 
  Filter, 
  Search, 
  Download, 
  Edit, 
  Trash2, 
  Send,
  Eye,
  Calendar,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import { format, isAfter } from 'date-fns';

interface InvoiceManagerProps {
  invoices: Invoice[];
  onInvoiceUpdate: (invoices: Invoice[]) => void;
  user: User;
  addToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

interface InvoiceFilters {
  status: InvoiceStatus | 'all';
  dateRange: string;
  search: string;
}

export const InvoiceManager: React.FC<InvoiceManagerProps> = ({
  invoices,
  onInvoiceUpdate,
  user,
  addToast,
}) => {
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [filters, setFilters] = useState<InvoiceFilters>({
    status: 'all',
    dateRange: 'all',
    search: '',
  });

  // Filter invoices
  const filteredInvoices = invoices.filter(invoice => {
    if (filters.status !== 'all' && invoice.status !== filters.status) return false;
    if (filters.search && !invoice.number.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'sent':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getInvoiceStatus = (invoice: Invoice): InvoiceStatus => {
    if (invoice.status === 'sent' && isAfter(new Date(), invoice.dueDate)) {
      return 'overdue';
    }
    return invoice.status;
  };

  const handleSendInvoice = (invoiceId: string) => {
    const updatedInvoices = invoices.map(invoice =>
      invoice.id === invoiceId
        ? { ...invoice, status: 'sent' as InvoiceStatus }
        : invoice
    );
    onInvoiceUpdate(updatedInvoices);
    addToast('Invoice sent successfully', 'success');
  };

  const handleMarkAsPaid = (invoiceId: string) => {
    const updatedInvoices = invoices.map(invoice =>
      invoice.id === invoiceId
        ? { ...invoice, status: 'paid' as InvoiceStatus, paidDate: new Date() }
        : invoice
    );
    onInvoiceUpdate(updatedInvoices);
    addToast('Invoice marked as paid', 'success');
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    const updatedInvoices = invoices.filter(invoice => invoice.id !== invoiceId);
    onInvoiceUpdate(updatedInvoices);
    addToast('Invoice deleted successfully', 'success');
  };

  const totalInvoiced = filteredInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const totalPaid = filteredInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0);
  const totalOutstanding = filteredInvoices.filter(i => i.status === 'sent').reduce((sum, i) => sum + i.total, 0);
  const overdueInvoices = filteredInvoices.filter(i => getInvoiceStatus(i) === 'overdue');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Invoice Manager</h2>
          <p className="text-muted-foreground">Create, send, and track invoices</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download size={16} className="mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowInvoiceForm(true)}>
            <Plus size={16} className="mr-2" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="text-blue-600" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold">${totalInvoiced.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Invoiced</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="text-green-600" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold">${totalPaid.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Paid</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="text-yellow-600" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold">${totalOutstanding.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Outstanding</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="text-red-600" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold">{overdueInvoices.length}</div>
              <div className="text-sm text-muted-foreground">Overdue</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-muted-foreground" />
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as InvoiceStatus | 'all' }))}
              className="border border-border rounded px-3 py-1 text-sm"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <Search size={16} className="text-muted-foreground" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="border border-border rounded px-3 py-1 text-sm w-64"
            />
          </div>
        </div>
      </Card>

      {/* Invoices List */}
      <Card className="p-6">
        <div className="space-y-4">
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No invoices found</h3>
              <p className="text-muted-foreground mb-4">
                {filters.search || filters.status !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Start by creating your first invoice'
                }
              </p>
              <Button onClick={() => setShowInvoiceForm(true)}>
                <Plus size={16} className="mr-2" />
                Create Invoice
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredInvoices.map(invoice => {
                const status = getInvoiceStatus(invoice);
                const isOverdue = status === 'overdue';
                
                return (
                  <div key={invoice.id} className={`border rounded-lg p-4 hover:bg-accent transition-colors ${
                    isOverdue ? 'border-red-200 bg-red-50' : 'border-border'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${isOverdue ? 'bg-red-100' : 'bg-gray-100'}`}>
                          <FileText size={20} className={isOverdue ? 'text-red-600' : 'text-gray-600'} />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-medium text-foreground">{invoice.number}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                              {status}
                            </span>
                            {isOverdue && (
                              <div className="flex items-center gap-1 text-red-600">
                                <AlertTriangle size={14} />
                                <span className="text-xs">Overdue</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Issued: {format(invoice.issueDate, 'MMM dd, yyyy')}</span>
                            <span>•</span>
                            <span>Due: {format(invoice.dueDate, 'MMM dd, yyyy')}</span>
                            {invoice.paidDate && (
                              <>
                                <span>•</span>
                                <span>Paid: {format(invoice.paidDate, 'MMM dd, yyyy')}</span>
                              </>
                            )}
                            {invoice.projectId && (
                              <>
                                <span>•</span>
                                <span>Project: {invoice.projectId}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-lg font-semibold text-foreground">
                            ${invoice.total.toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {invoice.terms}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye size={14} />
                          </Button>
                          
                          {invoice.status === 'draft' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSendInvoice(invoice.id)}
                              className="text-blue-600 border-blue-300 hover:bg-blue-50"
                            >
                              <Send size={14} />
                            </Button>
                          )}
                          
                          {invoice.status === 'sent' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkAsPaid(invoice.id)}
                              className="text-green-600 border-green-300 hover:bg-green-50"
                            >
                              Mark Paid
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingInvoice(invoice)}
                          >
                            <Edit size={14} />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteInvoice(invoice.id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Invoice Items Preview */}
                    <div className="mt-3 pl-12">
                      <div className="text-sm text-muted-foreground">
                        {invoice.items.length} item(s) • 
                        Subtotal: ${invoice.amount.toLocaleString()} • 
                        Tax: ${invoice.tax.toLocaleString()}
                      </div>
                      {invoice.notes && (
                        <div className="text-sm text-muted-foreground mt-1">
                          Note: {invoice.notes}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Invoice Form Modal */}
      {showInvoiceForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New Invoice</h3>
            <p className="text-muted-foreground mb-4">Invoice form will be implemented here</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowInvoiceForm(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowInvoiceForm(false)}>
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
