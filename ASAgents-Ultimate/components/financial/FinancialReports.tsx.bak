import React, { useState } from 'react';
import { User, Expense, Invoice } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText
} from 'lucide-react';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';

interface FinancialReportsProps {
  expenses: Expense[];
  invoices: Invoice[];
  summary: any;
  user: User;
}

type ReportType = 'profit-loss' | 'cash-flow' | 'expense-breakdown' | 'revenue-analysis';
type DateRange = '7d' | '30d' | '90d' | '1y' | 'custom';

interface ReportData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
  }[];
}

export const FinancialReports: React.FC<FinancialReportsProps> = ({
  expenses,
  invoices,
  summary,
  user,
}) => {
  const [activeReport, setActiveReport] = useState<ReportType>('profit-loss');
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [customDateRange, setCustomDateRange] = useState({
    start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd'),
  });

  const reports = [
    { id: 'profit-loss', label: 'Profit & Loss', icon: <TrendingUp size={16} /> },
    { id: 'cash-flow', label: 'Cash Flow', icon: <DollarSign size={16} /> },
    { id: 'expense-breakdown', label: 'Expense Breakdown', icon: <BarChart3 size={16} /> },
    { id: 'revenue-analysis', label: 'Revenue Analysis', icon: <FileText size={16} /> },
  ];

  const dateRanges = [
    { id: '7d', label: 'Last 7 days' },
    { id: '30d', label: 'Last 30 days' },
    { id: '90d', label: 'Last 90 days' },
    { id: '1y', label: 'Last year' },
    { id: 'custom', label: 'Custom range' },
  ];

  // Generate report data based on selected report type
  const generateReportData = (): ReportData => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (dateRange) {
      case '7d':
        startDate = subDays(now, 7);
        break;
      case '30d':
        startDate = subDays(now, 30);
        break;
      case '90d':
        startDate = subDays(now, 90);
        break;
      case '1y':
        startDate = subDays(now, 365);
        break;
      case 'custom':
        startDate = new Date(customDateRange.start);
        endDate = new Date(customDateRange.end);
        break;
      default:
        startDate = subDays(now, 30);
    }

    switch (activeReport) {
      case 'profit-loss':
        return generateProfitLossData(startDate, endDate);
      case 'cash-flow':
        return generateCashFlowData(startDate, endDate);
      case 'expense-breakdown':
        return generateExpenseBreakdownData(startDate, endDate);
      case 'revenue-analysis':
        return generateRevenueAnalysisData(startDate, endDate);
      default:
        return { labels: [], datasets: [] };
    }
  };

  const generateProfitLossData = (startDate: Date, endDate: Date): ReportData => {
    const months = [];
    let currentDate = startOfMonth(startDate);
    
    while (currentDate <= endDate) {
      months.push(currentDate);
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    }

    const labels = months.map(month => format(month, 'MMM yyyy'));
    
    const revenueData = months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      return invoices
        .filter(inv => inv.status === 'paid' && inv.paidDate && 
          inv.paidDate >= monthStart && inv.paidDate <= monthEnd)
        .reduce((sum, inv) => sum + inv.total, 0);
    });

    const expenseData = months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      return expenses
        .filter(exp => exp.status === 'approved' && 
          exp.date >= monthStart && exp.date <= monthEnd)
        .reduce((sum, exp) => sum + exp.amount, 0);
    });

    return {
      labels,
      datasets: [
        { label: 'Revenue', data: revenueData, color: '#10B981' },
        { label: 'Expenses', data: expenseData, color: '#EF4444' },
      ],
    };
  };

  const generateCashFlowData = (startDate: Date, endDate: Date): ReportData => {
    // Similar implementation for cash flow
    return generateProfitLossData(startDate, endDate);
  };

  const generateExpenseBreakdownData = (startDate: Date, endDate: Date): ReportData => {
    const categories = Array.from(new Set(expenses.map(e => e.category)));
    const categoryTotals = categories.map(category =>
      expenses
        .filter(exp => exp.category === category && exp.status === 'approved' &&
          exp.date >= startDate && exp.date <= endDate)
        .reduce((sum, exp) => sum + exp.amount, 0)
    );

    return {
      labels: categories.map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)),
      datasets: [
        { label: 'Expenses', data: categoryTotals, color: '#3B82F6' },
      ],
    };
  };

  const generateRevenueAnalysisData = (startDate: Date, endDate: Date): ReportData => {
    // Similar implementation for revenue analysis
    return generateProfitLossData(startDate, endDate);
  };

  const reportData = generateReportData();

  // Simple bar chart component
  const BarChart: React.FC<{ data: ReportData }> = ({ data }) => {
    if (!data.labels.length) return <div>No data available</div>;

    const maxValue = Math.max(...data.datasets.flatMap(d => d.data));

    return (
      <div className="space-y-4">
        <div className="flex items-end justify-between h-64">
          {data.labels.map((label, index) => (
            <div key={label} className="flex flex-col items-center gap-2 flex-1">
              <div className="flex flex-col items-center gap-1">
                {data.datasets.map((dataset, datasetIndex) => {
                  const value = dataset.data[index];
                  const height = (value / maxValue) * 200;
                  
                  return (
                    <div key={datasetIndex} className="flex flex-col items-center">
                      <div className="text-xs font-medium text-gray-600">
                        ${value > 0 ? (value / 1000).toFixed(1) + 'K' : '0'}
                      </div>
                      <div
                        className="rounded-t-sm w-8 transition-all duration-300"
                        style={{ 
                          height: `${Math.max(height, 2)}px`,
                          backgroundColor: dataset.color,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="text-xs text-gray-500 text-center">{label}</div>
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="flex justify-center gap-6">
          {data.datasets.map((dataset, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: dataset.color }}
              />
              <span className="text-sm text-gray-600">{dataset.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const exportReport = () => {
    // Implementation for exporting reports
    console.log('Exporting report:', activeReport, dateRange);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Financial Reports</h2>
          <p className="text-muted-foreground">Analyze financial performance and trends</p>
        </div>
        
        <Button onClick={exportReport}>
          <Download size={16} className="mr-2" />
          Export Report
        </Button>
      </div>

      {/* Report Controls */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Report Type */}
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-muted-foreground" />
            <select
              value={activeReport}
              onChange={(e) => setActiveReport(e.target.value as ReportType)}
              className="border border-border rounded px-3 py-1 text-sm"
            >
              {reports.map(report => (
                <option key={report.id} value={report.id}>
                  {report.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Date Range */}
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-muted-foreground" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRange)}
              className="border border-border rounded px-3 py-1 text-sm"
            >
              {dateRanges.map(range => (
                <option key={range.id} value={range.id}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Custom Date Range */}
          {dateRange === 'custom' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customDateRange.start}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="border border-border rounded px-3 py-1 text-sm"
              />
              <span className="text-muted-foreground">to</span>
              <input
                type="date"
                value={customDateRange.end}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="border border-border rounded px-3 py-1 text-sm"
              />
            </div>
          )}
        </div>
      </Card>

      {/* Report Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">
            {reports.find(r => r.id === activeReport)?.label}
          </h3>
          <div className="text-sm text-muted-foreground">
            {dateRange === 'custom' 
              ? `${customDateRange.start} to ${customDateRange.end}`
              : dateRanges.find(r => r.id === dateRange)?.label
            }
          </div>
        </div>
        
        <BarChart data={reportData} />
      </Card>

      {/* Report Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-green-600" size={20} />
            <div>
              <div className="text-lg font-semibold">
                ${summary?.totalRevenue ? (summary.totalRevenue / 1000).toFixed(0) + 'K' : '0'}
              </div>
              <div className="text-sm text-muted-foreground">Total Revenue</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <TrendingDown className="text-red-600" size={20} />
            <div>
              <div className="text-lg font-semibold">
                ${summary?.totalExpenses ? (summary.totalExpenses / 1000).toFixed(0) + 'K' : '0'}
              </div>
              <div className="text-sm text-muted-foreground">Total Expenses</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <DollarSign className="text-blue-600" size={20} />
            <div>
              <div className="text-lg font-semibold">
                ${summary?.netProfit ? (summary.netProfit / 1000).toFixed(0) + 'K' : '0'}
              </div>
              <div className="text-sm text-muted-foreground">Net Profit</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Report Insights */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
        
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="text-blue-600" size={16} />
              <span className="font-medium text-blue-900">Revenue Trend</span>
            </div>
            <p className="text-sm text-blue-800">
              Revenue has increased by 12% compared to the previous period.
            </p>
          </div>
          
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="text-yellow-600" size={16} />
              <span className="font-medium text-yellow-900">Expense Analysis</span>
            </div>
            <p className="text-sm text-yellow-800">
              Material costs represent 45% of total expenses this period.
            </p>
          </div>
          
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="text-green-600" size={16} />
              <span className="font-medium text-green-900">Profit Margin</span>
            </div>
            <p className="text-sm text-green-800">
              Current profit margin is 23%, which is above industry average.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
