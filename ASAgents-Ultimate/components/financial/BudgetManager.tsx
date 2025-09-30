import React, { useState } from 'react';
import { User, Expense, ExpenseStatus } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Plus,
  Edit,
  Target,
  BarChart3
} from 'lucide-react';

interface BudgetManagerProps {
  summary: any;
  expenses: Expense[];
  user: User;
  addToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  remaining: number;
  percentage: number;
}

export const BudgetManager: React.FC<BudgetManagerProps> = ({
  summary,
  expenses,
  user,
  addToast,
}) => {
  const [showBudgetForm, setShowBudgetForm] = useState(false);

  // Calculate budget by category
  const budgetCategories: BudgetCategory[] = [
    {
      id: 'materials',
      name: 'Materials',
      allocated: 20000,
      spent: expenses.filter(e => e.category === 'materials' && e.status === ExpenseStatus.APPROVED).reduce((sum, e) => sum + e.amount, 0),
      remaining: 0,
      percentage: 0,
    },
    {
      id: 'labor',
      name: 'Labor',
      allocated: 15000,
      spent: expenses.filter(e => e.category === 'labor' && e.status === ExpenseStatus.APPROVED).reduce((sum, e) => sum + e.amount, 0),
      remaining: 0,
      percentage: 0,
    },
    {
      id: 'equipment',
      name: 'Equipment',
      allocated: 10000,
      spent: expenses.filter(e => e.category === 'equipment' && e.status === ExpenseStatus.APPROVED).reduce((sum, e) => sum + e.amount, 0),
      remaining: 0,
      percentage: 0,
    },
    {
      id: 'overhead',
      name: 'Overhead',
      allocated: 5000,
      spent: expenses.filter(e => e.category === 'overhead' && e.status === ExpenseStatus.APPROVED).reduce((sum, e) => sum + e.amount, 0),
      remaining: 0,
      percentage: 0,
    },
  ].map(category => ({
    ...category,
    remaining: category.allocated - category.spent,
    percentage: (category.spent / category.allocated) * 100,
  }));

  const totalAllocated = budgetCategories.reduce((sum, cat) => sum + cat.allocated, 0);
  const totalSpent = budgetCategories.reduce((sum, cat) => sum + cat.spent, 0);
  const totalRemaining = totalAllocated - totalSpent;

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 100) return <AlertTriangle className="text-red-600" size={16} />;
    if (percentage >= 90) return <TrendingUp className="text-yellow-600" size={16} />;
    return <Target className="text-green-600" size={16} />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Budget Manager</h2>
          <p className="text-muted-foreground">Monitor and manage project budgets</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <BarChart3 size={16} className="mr-2" />
            View Reports
          </Button>
          <Button onClick={() => setShowBudgetForm(true)}>
            <Plus size={16} className="mr-2" />
            Set Budget
          </Button>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Total Budget</h3>
              <p className="text-sm text-muted-foreground">Allocated funds</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground">
            ${totalAllocated.toLocaleString()}
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="text-red-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Total Spent</h3>
              <p className="text-sm text-muted-foreground">Used budget</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground">
            ${totalSpent.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            {((totalSpent / totalAllocated) * 100).toFixed(1)}% of budget
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Remaining</h3>
              <p className="text-sm text-muted-foreground">Available funds</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground">
            ${totalRemaining.toLocaleString()}
          </div>
          <div className={`text-sm mt-2 ${totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totalRemaining >= 0 ? 'Under budget' : 'Over budget'}
          </div>
        </Card>
      </div>

      {/* Budget Progress */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Overall Budget Progress</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Budget Utilization</span>
            <span>{((totalSpent / totalAllocated) * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${getProgressColor((totalSpent / totalAllocated) * 100)}`}
              style={{ width: `${Math.min((totalSpent / totalAllocated) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>${totalSpent.toLocaleString()} spent</span>
            <span>${totalAllocated.toLocaleString()} allocated</span>
          </div>
        </div>
      </Card>

      {/* Category Budgets */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Budget by Category</h3>
          <Button variant="outline" size="sm">
            <Edit size={16} className="mr-2" />
            Edit Budgets
          </Button>
        </div>
        
        <div className="space-y-6">
          {budgetCategories.map(category => (
            <div key={category.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(category.percentage)}
                  <div>
                    <h4 className="font-medium text-foreground">{category.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      ${category.spent.toLocaleString()} of ${category.allocated.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-medium text-foreground">
                    {category.percentage.toFixed(1)}%
                  </div>
                  <div className={`text-sm ${category.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${Math.abs(category.remaining).toLocaleString()} {category.remaining >= 0 ? 'left' : 'over'}
                  </div>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getProgressColor(category.percentage)}`}
                  style={{ width: `${Math.min(category.percentage, 100)}%` }}
                />
              </div>
              
              {category.percentage >= 90 && (
                <div className={`text-sm p-2 rounded ${
                  category.percentage >= 100 
                    ? 'bg-red-50 text-red-700 border border-red-200' 
                    : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                }`}>
                  {category.percentage >= 100 
                    ? `⚠️ Budget exceeded by $${(category.spent - category.allocated).toLocaleString()}`
                    : `⚠️ Approaching budget limit - $${category.remaining.toLocaleString()} remaining`
                  }
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Budget Alerts */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Budget Alerts</h3>
        
        <div className="space-y-3">
          {budgetCategories.filter(cat => cat.percentage >= 75).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target size={48} className="mx-auto mb-4 opacity-50" />
              <p>All budgets are on track</p>
            </div>
          ) : (
            budgetCategories
              .filter(cat => cat.percentage >= 75)
              .map(category => (
                <div key={category.id} className={`p-4 rounded-lg border ${
                  category.percentage >= 100 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={category.percentage >= 100 ? 'text-red-600' : 'text-yellow-600'} size={20} />
                    <div>
                      <h4 className="font-medium">
                        {category.name} Budget {category.percentage >= 100 ? 'Exceeded' : 'Alert'}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {category.percentage >= 100 
                          ? `Over budget by $${(category.spent - category.allocated).toLocaleString()}`
                          : `${category.percentage.toFixed(1)}% of budget used - $${category.remaining.toLocaleString()} remaining`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </Card>

      {/* Budget Form Modal */}
      {showBudgetForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Set Budget</h3>
            <p className="text-muted-foreground mb-4">Budget form will be implemented here</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowBudgetForm(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowBudgetForm(false)}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
