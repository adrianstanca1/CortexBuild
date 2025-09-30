import React from 'react';
import { User, Expense, Invoice } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  FileText,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { format, subDays, isAfter } from 'date-fns';

interface FinancialDashboardProps {
  summary: any;
  expenses: Expense[];
  invoices: Invoice[];
  user: User;
  onNavigateToView: (view: string) => void;
}

interface ChartData {
  labels: string[];
  values: number[];
}

export const FinancialDashboard: React.FC<FinancialDashboardProps> = ({
  summary,
  expenses,
  invoices,
  user,
  onNavigateToView,
}) => {
  // Generate chart data for the last 7 days
  const generateChartData = (): ChartData => {
    const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));

    const dailyExpenses = last7Days.map(day => {
      return expenses
        .filter(expense =>
          expense.date.toDateString() === day.toDateString() &&
          expense.status === 'approved'
        )
        .reduce((sum, expense) => sum + expense.amount, 0);
    });

    return {
      labels: last7Days.map(day => format(day, 'MMM dd')),
      values: dailyExpenses,
    };
  };

  const chartData = generateChartData();
  const maxValue = Math.max(...chartData.values, 1);

  // Recent transactions
  const recentExpenses = expenses
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

  const recentInvoices = invoices
    .sort((a, b) => b.issueDate.getTime() - a.issueDate.getTime())
    .slice(0, 5);

  // Overdue invoices
  const overdueInvoices = invoices.filter(invoice =>
    invoice.status === 'sent' && isAfter(new Date(), invoice.dueDate)
  );

  // Pending expenses
  const pendingExpenses = expenses.filter(expense => expense.status === 'pending');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'sent':
        return 'text-blue-600 bg-blue-100';
      case 'overdue':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Cash Flow Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Daily Expenses (Last 7 Days)</h3>
          <Button variant="outline" size="sm" onClick={() => onNavigateToView('reports')}>
            View Reports
          </Button>
        </div>

        <div className="h-64">
          <div className="flex items-end justify-between h-full">
            {chartData.labels.map((label, index) => {
              const value = chartData.values[index];
              const height = (value / maxValue) * 100;

              return (
                <div key={label} className="flex flex-col items-center gap-2 flex-1">
                  <div className="text-xs font-medium text-gray-600">
                    ${value > 0 ? (value / 1000).toFixed(1) + 'K' : '0'}
                  </div>
                  <div
                    className="bg-primary rounded-t-sm w-8 transition-all duration-300 hover:bg-primary/80"
                    style={{ height: `${Math.max(height, 2)}%` }}
                  />
                  <div className="text-xs text-gray-500">{label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Expenses */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Expenses</h3>
            <Button variant="outline" size="sm" onClick={() => onNavigateToView('expenses')}>
              View All
            </Button>
          </div>

          <div className="space-y-3">
            {recentExpenses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No recent expenses
              </div>
            ) : (
              recentExpenses.map(expense => (
                <div key={expense.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent">
                  <div className="flex items-center gap-3">
                    <Receipt size={16} className="text-muted-foreground" />
                    <div>
                      <div className="font-medium text-sm">{expense.description}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(expense.date, 'MMM dd, yyyy')} • {expense.vendor}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${expense.amount.toLocaleString()}</div>
                    <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor(expense.status)}`}>
                      {expense.status}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Recent Invoices */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Invoices</h3>
            <Button variant="outline" size="sm" onClick={() => onNavigateToView('invoices')}>
              View All
            </Button>
          </div>

          <div className="space-y-3">
            {recentInvoices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No recent invoices
              </div>
            ) : (
              recentInvoices.map(invoice => (
                <div key={invoice.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent">
                  <div className="flex items-center gap-3">
                    <FileText size={16} className="text-muted-foreground" />
                    <div>
                      <div className="font-medium text-sm">{invoice.number}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(invoice.issueDate, 'MMM dd, yyyy')} • Due: {format(invoice.dueDate, 'MMM dd')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${invoice.total.toLocaleString()}</div>
                    <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Alerts and Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue Invoices Alert */}
        {overdueInvoices.length > 0 && (
          <Card className="p-6 border-red-200 bg-red-50">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-red-600" size={20} />
              <h3 className="text-lg font-semibold text-red-900">Overdue Invoices</h3>
            </div>

            <div className="space-y-2">
              {overdueInvoices.slice(0, 3).map(invoice => (
                <div key={invoice.id} className="flex items-center justify-between">
                  <span className="text-sm text-red-800">{invoice.number}</span>
                  <span className="text-sm font-medium text-red-900">
                    ${invoice.total.toLocaleString()}
                  </span>
                </div>
              ))}
              {overdueInvoices.length > 3 && (
                <div className="text-sm text-red-700">
                  +{overdueInvoices.length - 3} more overdue invoices
                </div>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="mt-4 border-red-300 text-red-700 hover:bg-red-100"
              onClick={() => onNavigateToView('invoices')}
            >
              Review Invoices
            </Button>
          </Card>
        )}

        {/* Pending Expenses Alert */}
        {pendingExpenses.length > 0 && (
          <Card className="p-6 border-yellow-200 bg-yellow-50">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="text-yellow-600" size={20} />
              <h3 className="text-lg font-semibold text-yellow-900">Pending Approvals</h3>
            </div>

            <div className="space-y-2">
              {pendingExpenses.slice(0, 3).map(expense => (
                <div key={expense.id} className="flex items-center justify-between">
                  <span className="text-sm text-yellow-800">{expense.description}</span>
                  <span className="text-sm font-medium text-yellow-900">
                    ${expense.amount.toLocaleString()}
                  </span>
                </div>
              ))}
              {pendingExpenses.length > 3 && (
                <div className="text-sm text-yellow-700">
                  +{pendingExpenses.length - 3} more pending expenses
                </div>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="mt-4 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
              onClick={() => onNavigateToView('expenses')}
            >
              Review Expenses
            </Button>
          </Card>
        )}

        {/* Budget Status */}
        {summary && (
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="text-blue-600" size={20} />
              <h3 className="text-lg font-semibold">Budget Status</h3>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Monthly Budget</span>
                  <span className="text-sm text-muted-foreground">
                    ${summary.budgetUsed.toLocaleString()} / ${summary.monthlyBudget.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${(summary.budgetUsed / summary.monthlyBudget) > 0.9
                        ? 'bg-red-500'
                        : (summary.budgetUsed / summary.monthlyBudget) > 0.75
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                    style={{ width: `${Math.min((summary.budgetUsed / summary.monthlyBudget) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                {summary.budgetUsed < summary.monthlyBudget ? (
                  <span className="text-green-600">
                    ${(summary.monthlyBudget - summary.budgetUsed).toLocaleString()} remaining this month
                  </span>
                ) : (
                  <span className="text-red-600">
                    ${(summary.budgetUsed - summary.monthlyBudget).toLocaleString()} over budget
                  </span>
                )}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => onNavigateToView('budget')}
            >
              Manage Budget
            </Button>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => onNavigateToView('expenses')}
            >
              <Receipt size={16} className="mr-2" />
              Add New Expense
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => onNavigateToView('invoices')}
            >
              <FileText size={16} className="mr-2" />
              Create Invoice
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => onNavigateToView('reports')}
            >
              <TrendingUp size={16} className="mr-2" />
              Generate Report
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
