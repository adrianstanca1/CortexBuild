import React, { useState } from 'react';
import { User, Expense, ExpenseStatus } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  Plus, 
  Receipt, 
  Filter, 
  Search, 
  Download, 
  Edit, 
  Trash2, 
  Check, 
  X,
  Upload,
  Calendar,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';

interface ExpenseTrackerProps {
  expenses: Expense[];
  onExpenseUpdate: (expenses: Expense[]) => void;
  user: User;
  addToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

interface ExpenseFilters {
  status: ExpenseStatus | 'all';
  category: string;
  dateRange: string;
  search: string;
}

export const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({
  expenses,
  onExpenseUpdate,
  user,
  addToast,
}) => {
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filters, setFilters] = useState<ExpenseFilters>({
    status: 'all',
    category: 'all',
    dateRange: 'all',
    search: '',
  });

  // Filter expenses
  const filteredExpenses = expenses.filter(expense => {
    if (filters.status !== 'all' && expense.status !== filters.status) return false;
    if (filters.category !== 'all' && expense.category !== filters.category) return false;
    if (filters.search && !expense.description.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  // Get unique categories
  const categories = Array.from(new Set(expenses.map(e => e.category)));

  const getStatusColor = (status: ExpenseStatus) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleApproveExpense = (expenseId: string) => {
    const updatedExpenses = expenses.map(expense =>
      expense.id === expenseId
        ? { ...expense, status: 'approved' as ExpenseStatus, approvedBy: user.id }
        : expense
    );
    onExpenseUpdate(updatedExpenses);
    addToast('Expense approved successfully', 'success');
  };

  const handleRejectExpense = (expenseId: string) => {
    const updatedExpenses = expenses.map(expense =>
      expense.id === expenseId
        ? { ...expense, status: 'rejected' as ExpenseStatus }
        : expense
    );
    onExpenseUpdate(updatedExpenses);
    addToast('Expense rejected', 'warning');
  };

  const handleDeleteExpense = (expenseId: string) => {
    const updatedExpenses = expenses.filter(expense => expense.id !== expenseId);
    onExpenseUpdate(updatedExpenses);
    addToast('Expense deleted successfully', 'success');
  };

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const approvedExpenses = filteredExpenses.filter(e => e.status === 'approved').reduce((sum, e) => sum + e.amount, 0);
  const pendingExpenses = filteredExpenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Expense Tracker</h2>
          <p className="text-muted-foreground">Track and manage project expenses</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download size={16} className="mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowExpenseForm(true)}>
            <Plus size={16} className="mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="text-blue-600" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold">${totalExpenses.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Expenses</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Check className="text-green-600" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold">${approvedExpenses.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Approved</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="text-yellow-600" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold">${pendingExpenses.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
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
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as ExpenseStatus | 'all' }))}
              className="border border-border rounded px-3 py-1 text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="border border-border rounded px-3 py-1 text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <Search size={16} className="text-muted-foreground" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="border border-border rounded px-3 py-1 text-sm w-64"
            />
          </div>
        </div>
      </Card>

      {/* Expenses List */}
      <Card className="p-6">
        <div className="space-y-4">
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-12">
              <Receipt size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No expenses found</h3>
              <p className="text-muted-foreground mb-4">
                {filters.search || filters.status !== 'all' || filters.category !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Start by adding your first expense'
                }
              </p>
              <Button onClick={() => setShowExpenseForm(true)}>
                <Plus size={16} className="mr-2" />
                Add Expense
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredExpenses.map(expense => (
                <div key={expense.id} className="border border-border rounded-lg p-4 hover:bg-accent transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Receipt size={20} className="text-gray-600" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-medium text-foreground">{expense.description}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(expense.status)}`}>
                            {expense.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{format(expense.date, 'MMM dd, yyyy')}</span>
                          <span>•</span>
                          <span>{expense.category}</span>
                          {expense.vendor && (
                            <>
                              <span>•</span>
                              <span>{expense.vendor}</span>
                            </>
                          )}
                          {expense.projectId && (
                            <>
                              <span>•</span>
                              <span>Project: {expense.projectId}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-semibold text-foreground">
                          ${expense.amount.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {expense.paymentMethod}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {expense.status === 'pending' && (user.role === 'admin' || user.role === 'owner') && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApproveExpense(expense.id)}
                              className="text-green-600 border-green-300 hover:bg-green-50"
                            >
                              <Check size={14} />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRejectExpense(expense.id)}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              <X size={14} />
                            </Button>
                          </>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingExpense(expense)}
                        >
                          <Edit size={14} />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteExpense(expense.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Tags */}
                  {expense.tags && expense.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {expense.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Receipt Link */}
                  {expense.receiptUrl && (
                    <div className="mt-3">
                      <a
                        href={expense.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80"
                      >
                        <Upload size={14} />
                        View Receipt
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Expense Form Modal */}
      {showExpenseForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Expense</h3>
            <p className="text-muted-foreground mb-4">Expense form will be implemented here</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowExpenseForm(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowExpenseForm(false)}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
