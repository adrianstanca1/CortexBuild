import React, { useState, useEffect, useCallback } from 'react';
import { User, Expense, Invoice, InvoiceStatus, ExpenseStatus } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ExpenseTracker } from './ExpenseTracker';
import { InvoiceManager } from './InvoiceManager';
import { BudgetManager } from './BudgetManager';
import { FinancialReports } from './FinancialReports';
import { FinancialDashboard } from './FinancialDashboard';
import { useRealTimeEvent } from '../../hooks/useRealTime';
import { 
  DollarSign, 
  Receipt, 
  FileText, 
  BarChart3, 
  TrendingUp,
  Plus,
  Filter,
  Download,
  Upload,
  Settings
} from 'lucide-react';

interface FinancialManagementProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  onNavigate?: (view: string) => void;
}

type FinancialView = 'dashboard' | 'expenses' | 'invoices' | 'budget' | 'reports';

interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  pendingInvoices: number;
  overdueInvoices: number;
  monthlyBudget: number;
  budgetUsed: number;
  cashFlow: number;
}

export const FinancialManagement: React.FC<FinancialManagementProps> = ({
  user,
  addToast,
  onNavigate,
}) => {
  const [activeView, setActiveView] = useState<FinancialView>('dashboard');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Real-time financial updates
  useRealTimeEvent('expense_created', (event) => {
    if (event.data) {
      setExpenses(prev => [event.data, ...prev]);
      addToast(`New expense of $${event.data.amount} added`, 'info');
      loadFinancialSummary();
    }
  });

  useRealTimeEvent('invoice_updated', (event) => {
    setInvoices(prev => prev.map(invoice => 
      invoice.id === event.entityId 
        ? { ...invoice, ...event.data }
        : invoice
    ));
    addToast(`Invoice "${event.data?.number}" was updated`, 'info');
    loadFinancialSummary();
  });

  // Load financial data
  const loadExpenses = useCallback(async () => {
    try {
      // Simulate API call - replace with actual API
      const mockExpenses: Expense[] = [
        {
          id: '1',
          amount: 2500,
          description: 'Construction Materials - Steel Beams',
          category: 'materials',
          date: new Date('2024-03-15'),
          status: 'approved' as ExpenseStatus,
          projectId: 'project-1',
          submittedBy: user.id,
          approvedBy: user.id,
          receiptUrl: '/receipts/receipt-1.pdf',
          tags: ['materials', 'steel', 'construction'],
          vendor: 'Steel Supply Co.',
          paymentMethod: 'company-card',
        },
        {
          id: '2',
          amount: 850,
          description: 'Equipment Rental - Excavator',
          category: 'equipment',
          date: new Date('2024-03-14'),
          status: 'pending' as ExpenseStatus,
          projectId: 'project-1',
          submittedBy: user.id,
          tags: ['equipment', 'rental'],
          vendor: 'Heavy Equipment Rentals',
          paymentMethod: 'check',
        },
        {
          id: '3',
          amount: 1200,
          description: 'Labor - Electrical Work',
          category: 'labor',
          date: new Date('2024-03-13'),
          status: 'approved' as ExpenseStatus,
          projectId: 'project-2',
          submittedBy: user.id,
          approvedBy: user.id,
          tags: ['labor', 'electrical'],
          vendor: 'Elite Electrical Services',
          paymentMethod: 'bank-transfer',
        },
      ];
      setExpenses(mockExpenses);
    } catch (error) {
      console.error('Failed to load expenses:', error);
      addToast('Failed to load expenses', 'error');
    }
  }, [user.id, addToast]);

  const loadInvoices = useCallback(async () => {
    try {
      // Simulate API call - replace with actual API
      const mockInvoices: Invoice[] = [
        {
          id: '1',
          number: 'INV-2024-001',
          clientId: 'client-1',
          projectId: 'project-1',
          amount: 25000,
          tax: 2500,
          total: 27500,
          status: 'sent' as InvoiceStatus,
          issueDate: new Date('2024-03-01'),
          dueDate: new Date('2024-03-31'),
          items: [
            {
              id: '1',
              description: 'Foundation Work - Phase 1',
              quantity: 1,
              rate: 25000,
              amount: 25000,
            },
          ],
          notes: 'Payment due within 30 days',
          terms: 'Net 30',
        },
        {
          id: '2',
          number: 'INV-2024-002',
          clientId: 'client-2',
          projectId: 'project-2',
          amount: 18500,
          tax: 1850,
          total: 20350,
          status: 'paid' as InvoiceStatus,
          issueDate: new Date('2024-02-15'),
          dueDate: new Date('2024-03-15'),
          paidDate: new Date('2024-03-10'),
          items: [
            {
              id: '1',
              description: 'Structural Framework',
              quantity: 1,
              rate: 18500,
              amount: 18500,
            },
          ],
          notes: 'Thank you for your business',
          terms: 'Net 30',
        },
      ];
      setInvoices(mockInvoices);
    } catch (error) {
      console.error('Failed to load invoices:', error);
      addToast('Failed to load invoices', 'error');
    }
  }, [addToast]);

  const loadFinancialSummary = useCallback(async () => {
    try {
      // Calculate summary from loaded data
      const totalRevenue = invoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.total, 0);
      
      const totalExpenses = expenses
        .filter(exp => exp.status === 'approved')
        .reduce((sum, exp) => sum + exp.amount, 0);
      
      const pendingInvoices = invoices.filter(inv => inv.status === 'sent').length;
      const overdueInvoices = invoices.filter(inv => 
        inv.status === 'sent' && inv.dueDate < new Date()
      ).length;

      const mockSummary: FinancialSummary = {
        totalRevenue,
        totalExpenses,
        netProfit: totalRevenue - totalExpenses,
        pendingInvoices,
        overdueInvoices,
        monthlyBudget: 50000,
        budgetUsed: totalExpenses,
        cashFlow: totalRevenue - totalExpenses,
      };

      setSummary(mockSummary);
    } catch (error) {
      console.error('Failed to load financial summary:', error);
      addToast('Failed to load financial summary', 'error');
    }
  }, [expenses, invoices, addToast]);

  // Initialize
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        loadExpenses(),
        loadInvoices(),
      ]);
      setLoading(false);
    };
    loadData();
  }, [loadExpenses, loadInvoices]);

  // Update summary when data changes
  useEffect(() => {
    if (expenses.length > 0 || invoices.length > 0) {
      loadFinancialSummary();
    }
  }, [expenses, invoices, loadFinancialSummary]);

  const views = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={16} /> },
    { id: 'expenses', label: 'Expenses', icon: <Receipt size={16} /> },
    { id: 'invoices', label: 'Invoices', icon: <FileText size={16} /> },
    { id: 'budget', label: 'Budget', icon: <DollarSign size={16} /> },
    { id: 'reports', label: 'Reports', icon: <TrendingUp size={16} /> },
  ];

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <FinancialDashboard
            summary={summary}
            expenses={expenses}
            invoices={invoices}
            user={user}
            onNavigateToView={setActiveView}
          />
        );
      case 'expenses':
        return (
          <ExpenseTracker
            expenses={expenses}
            onExpenseUpdate={(updatedExpenses) => setExpenses(updatedExpenses)}
            user={user}
            addToast={addToast}
          />
        );
      case 'invoices':
        return (
          <InvoiceManager
            invoices={invoices}
            onInvoiceUpdate={(updatedInvoices) => setInvoices(updatedInvoices)}
            user={user}
            addToast={addToast}
          />
        );
      case 'budget':
        return (
          <BudgetManager
            summary={summary}
            expenses={expenses}
            user={user}
            addToast={addToast}
          />
        );
      case 'reports':
        return (
          <FinancialReports
            expenses={expenses}
            invoices={invoices}
            summary={summary}
            user={user}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Financial Management</h1>
          <p className="text-muted-foreground">
            Track expenses, manage invoices, monitor budgets, and generate financial reports
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download size={16} className="mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload size={16} className="mr-2" />
            Import
          </Button>
          <Button size="sm">
            <Plus size={16} className="mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="text-green-600" size={20} />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  ${(summary.totalRevenue / 1000).toFixed(0)}K
                </div>
                <div className="text-sm text-muted-foreground">Total Revenue</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Receipt className="text-red-600" size={20} />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  ${(summary.totalExpenses / 1000).toFixed(0)}K
                </div>
                <div className="text-sm text-muted-foreground">Total Expenses</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="text-blue-600" size={20} />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  ${(summary.netProfit / 1000).toFixed(0)}K
                </div>
                <div className="text-sm text-muted-foreground">Net Profit</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FileText className="text-yellow-600" size={20} />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {summary.pendingInvoices}
                </div>
                <div className="text-sm text-muted-foreground">Pending Invoices</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-border">
        <div className="flex space-x-8">
          {views.map(view => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id as FinancialView)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeView === view.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {view.icon}
              {view.label}
            </button>
          ))}
        </div>
      </div>

      {/* View Content */}
      <div>
        {renderView()}
      </div>
    </div>
  );
};
