import React from 'react';
import { useAppStore } from '../store';

export const InvoicesPage: React.FC = () => {
  const { invoices } = useAppStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Invoices</h2>
        
        {invoices.length === 0 ? (
          <p className="text-gray-600">No invoices yet. Financial management coming soon...</p>
        ) : (
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">Invoice #{invoice.id}</p>
                    <p className="text-sm text-gray-600">Amount: ${invoice.amount}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">Status: {invoice.status}</p>
                    <p className="text-sm text-gray-600">Due: {invoice.dueDate}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
