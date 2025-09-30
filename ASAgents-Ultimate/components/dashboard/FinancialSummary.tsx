import React from 'react';

interface FinancialData {
  totalRevenue: number;
  totalCosts: number;
  profitMargin: number;
  cashFlow: {
    inflow: number;
    outflow: number;
    net: number;
  };
}

interface FinancialSummaryProps {
  financials: FinancialData | null;
  detailed?: boolean;
}

export const FinancialSummary: React.FC<FinancialSummaryProps> = ({ 
  financials, 
  detailed = false 
}) => {
  if (!financials) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Summary</h3>
        <div className="text-center py-8 text-gray-500">
          <p>No financial data available</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Summary</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(financials.totalRevenue)}
          </p>
          <p className="text-sm text-gray-600">Total Revenue</p>
        </div>
        
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(financials.totalCosts)}
          </p>
          <p className="text-sm text-gray-600">Total Costs</p>
        </div>
        
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">
            {financials.profitMargin.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600">Profit Margin</p>
        </div>
      </div>

      {detailed && financials.cashFlow && (
        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">Cash Flow</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 border rounded">
              <p className="text-lg font-semibold text-green-600">
                {formatCurrency(financials.cashFlow.inflow)}
              </p>
              <p className="text-xs text-gray-600">Inflow</p>
            </div>
            <div className="text-center p-3 border rounded">
              <p className="text-lg font-semibold text-red-600">
                {formatCurrency(financials.cashFlow.outflow)}
              </p>
              <p className="text-xs text-gray-600">Outflow</p>
            </div>
            <div className="text-center p-3 border rounded">
              <p className={`text-lg font-semibold ${financials.cashFlow.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(financials.cashFlow.net)}
              </p>
              <p className="text-xs text-gray-600">Net Flow</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};