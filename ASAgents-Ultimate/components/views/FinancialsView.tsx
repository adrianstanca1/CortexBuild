import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../utils/finance';
import { hasPermission } from '../../services/auth';
import { Permission } from '../../types';
import type { User, FinancialKPIs, MonthlyFinancials, CostBreakdown, FinancialForecast } from '../../types';

interface FinancialsViewProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

interface BarChartProps {
  data: { label: string; value: number }[];
  barColor: string;
}

const BarChart: React.FC<BarChartProps> = ({ data, barColor }) => {
  const maxValue = Math.max(...data.map(item => item.value));

  return (
    <div className="w-full h-64 flex items-end justify-around p-4 border rounded-lg bg-slate-50 dark:bg-slate-800">
      {data.map((item, index) => (
        <div key={`${item.label}-${index}`} className="flex flex-col items-center justify-end h-full w-full">
          <div
            className={`w-3/4 rounded-t-md ${barColor}`}
            style={{ height: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%` }}
            title={formatCurrency(item.value)}
          />
          <span className="text-xs mt-2 text-center">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

const FinancialsView: React.FC<FinancialsViewProps> = ({ user, addToast }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    kpis: null as FinancialKPIs | null,
    monthly: [] as MonthlyFinancials[],
    costs: [] as CostBreakdown[],
    forecasts: [] as FinancialForecast[],
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Mock data for now
      setData({
        kpis: {
          profitability: 15.2,
          projectMargin: 22.8,
          cashFlow: 45000,
          currency: 'GBP'
        },
        monthly: [
          { month: 'Jan', profit: 12000, revenue: 50000 },
          { month: 'Feb', profit: 15000, revenue: 55000 },
          { month: 'Mar', profit: 18000, revenue: 60000 },
          { month: 'Apr', profit: 16000, revenue: 58000 },
          { month: 'May', profit: 20000, revenue: 65000 },
          { month: 'Jun', profit: 22000, revenue: 70000 }
        ],
        costs: [
          { category: 'Materials', amount: 25000 },
          { category: 'Labor', amount: 35000 },
          { category: 'Equipment', amount: 15000 },
          { category: 'Overhead', amount: 10000 }
        ],
        forecasts: []
      });
    } catch (error) {
      console.error('Failed to load financial data:', error);
      addToast('Failed to load financial data', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <Card>Loading financials...</Card>;

  const canManageFinances = hasPermission(user, Permission.MANAGE_FINANCES);

  return (
    <div className="space-y-6">
      <div className="text-center p-6">
        <h1 className="text-2xl font-bold">Financials</h1>
        <p className="text-muted-foreground">Comprehensive financial management dashboard</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <p className="text-sm text-slate-500">Profitability</p>
          <p className="text-3xl font-bold">{data.kpis?.profitability || 0}%</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Avg. Project Margin</p>
          <p className="text-3xl font-bold">{data.kpis?.projectMargin || 0}%</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Cash Flow</p>
          <p className="text-3xl font-bold">{formatCurrency(data.kpis?.cashFlow || 0, data.kpis?.currency ?? 'GBP')}</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold mb-4">Monthly Performance (Profit)</h3>
          <BarChart data={data.monthly.map(m => ({ label: m.month, value: m.profit }))} barColor="bg-green-500" />
        </Card>
        <Card>
          <h3 className="font-semibold mb-4">Cost Breakdown</h3>
          <BarChart data={data.costs.map(c => ({ label: c.category, value: c.amount }))} barColor="bg-sky-500" />
        </Card>
      </div>

      {/* Actions */}
      {canManageFinances && (
        <Card>
          <h3 className="font-semibold mb-4">Financial Management</h3>
          <div className="flex gap-4">
            <Button onClick={() => addToast('Feature coming soon', 'info')}>
              Create Invoice
            </Button>
            <Button onClick={() => addToast('Feature coming soon', 'info')}>
              Add Expense
            </Button>
            <Button onClick={() => addToast('Feature coming soon', 'info')}>
              Generate Report
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export { FinancialsView };
export default FinancialsView;
