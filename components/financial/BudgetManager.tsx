/**
 * Budget Manager Component
 * CSI MasterFormat-based budget management with cost tracking
 */

import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, Filter, Download, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { financialAPI } from '../../lib/api-client';

interface Budget {
  id: string;
  budget_name: string;
  budget_type: 'master' | 'revised' | 'forecast';
  cost_code: string;
  cost_code_name: string;
  category: 'labor' | 'material' | 'equipment' | 'subcontract' | 'overhead' | 'other';
  budget_amount: number;
  committed_amount: number;
  spent_amount: number;
  forecast_amount?: number;
}

interface BudgetManagerProps {
  projectId: string | number;
}

const BudgetManager: React.FC<BudgetManagerProps> = ({ projectId }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'labor' | 'material' | 'equipment' | 'subcontract'>('all');

  useEffect(() => {
    loadBudgets();
  }, [projectId]);

  const loadBudgets = async () => {
    try {
      setLoading(true);
      const response = await financialAPI.getBudgets(projectId);
      setBudgets(response.data.data || []);
    } catch (error: any) {
      console.error('Failed to load budgets:', error);
      toast.error('Failed to load budget information');
    } finally {
      setLoading(false);
    }
  };

  const filteredBudgets = filter === 'all' 
    ? budgets 
    : budgets.filter(b => b.category === filter);

  const totals = filteredBudgets.reduce(
    (acc, budget) => ({
      budget: acc.budget + (budget.budget_amount || 0),
      committed: acc.committed + (budget.committed_amount || 0),
      spent: acc.spent + (budget.spent_amount || 0),
      forecast: acc.forecast + (budget.forecast_amount || budget.budget_amount || 0)
    }),
    { budget: 0, committed: 0, spent: 0, forecast: 0 }
  );

  const calculateVariance = (budget: Budget) => {
    const planned = budget.forecast_amount || budget.budget_amount;
    const actual = budget.spent_amount;
    return planned - actual;
  };

  const calculateVariancePercent = (budget: Budget) => {
    const planned = budget.forecast_amount || budget.budget_amount;
    if (planned === 0) return 0;
    const variance = calculateVariance(budget);
    return (variance / planned) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Project Budget</h2>
            <p className="text-sm text-gray-600 mt-1">CSI MasterFormat-based cost tracking</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
              <Filter className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
              <Download className="w-5 h-5" />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-5 h-5" />
              Add Budget Line
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700">Total Budget</span>
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-900">
              ${(totals.budget / 1000).toFixed(0)}k
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-yellow-700">Committed</span>
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-yellow-900">
              ${(totals.committed / 1000).toFixed(0)}k
            </div>
            <div className="text-xs text-yellow-700 mt-1">
              {((totals.committed / totals.budget) * 100).toFixed(1)}% of budget
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-700">Spent</span>
              <TrendingDown className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-900">
              ${(totals.spent / 1000).toFixed(0)}k
            </div>
            <div className="text-xs text-green-700 mt-1">
              {((totals.spent / totals.budget) * 100).toFixed(1)}% of budget
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-700">Forecast</span>
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-900">
              ${(totals.forecast / 1000).toFixed(0)}k
            </div>
            <div className={`text-xs mt-1 ${
              totals.forecast > totals.budget ? 'text-red-700' : 'text-purple-700'
            }`}>
              {((totals.forecast / totals.budget) * 100).toFixed(1)}% of budget
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
        <div className="flex items-center gap-2">
          {['all', 'labor', 'material', 'equipment', 'subcontract'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat as any)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Budget Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Cost Code</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Category</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Budget</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Committed</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Spent</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Forecast</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Variance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredBudgets.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                  <DollarSign className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 font-medium">No budget lines defined</p>
                  <p className="text-gray-500 text-sm mt-1">Create budget lines for this project</p>
                </td>
              </tr>
            ) : (
              filteredBudgets.map((budget) => {
                const variance = calculateVariance(budget);
                const variancePercent = calculateVariancePercent(budget);
                
                return (
                  <tr key={budget.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono text-sm font-bold text-blue-600">{budget.cost_code}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{budget.cost_code_name || budget.budget_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium capitalize">
                        {budget.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                      ${budget.budget_amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-yellow-700">
                      ${budget.committed_amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-green-700">
                      ${budget.spent_amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      ${(budget.forecast_amount || budget.budget_amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={`font-medium ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${Math.abs(variance).toLocaleString()}
                      </div>
                      <div className={`text-xs ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {variancePercent >= 0 ? '+' : ''}{variancePercent.toFixed(1)}%
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BudgetManager;
