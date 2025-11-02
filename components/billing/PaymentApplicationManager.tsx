/**
 * Payment Application Manager
 * Handles AIA billing, progress billing, retainage calculations
 */

import React, { useState, useEffect } from 'react';
import { DollarSign, FileText, CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { financialAPI } from '../../lib/api-client';

interface PaymentApplication {
  id: string;
  period_start_date: string;
  period_end_date: string;
  application_number: string;
  application_date: string;
  work_performed_amount: number;
  stored_materials_amount?: number;
  retainage_held: number;
  retention_percentage: number;
  total_billed_amount: number;
  previous_payments_received: number;
  current_payment_due: number;
  status: 'draft' | 'submitted' | 'reviewed' | 'approved' | 'paid' | 'rejected';
}

interface PaymentApplicationManagerProps {
  projectId: string | number;
}

const PaymentApplicationManager: React.FC<PaymentApplicationManagerProps> = ({ projectId }) => {
  const [applications, setApplications] = useState<PaymentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'draft' | 'submitted' | 'approved' | 'paid'>('all');

  useEffect(() => {
    loadApplications();
  }, [projectId]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const response = await financialAPI.getPaymentApplications(projectId);
      setApplications(response.data.data || []);
    } catch (error: any) {
      console.error('Failed to load payment applications:', error);
      toast.error('Failed to load payment applications');
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = filter === 'all' 
    ? applications 
    : applications.filter(a => a.status === filter);

  const totals = filteredApplications.reduce(
    (acc, app) => ({
      billed: acc.billed + (app.total_billed_amount || 0),
      paid: acc.paid + (app.previous_payments_received || 0),
      due: acc.due + (app.current_payment_due || 0),
      retainage: acc.retainage + (app.retainage_held || 0)
    }),
    { billed: 0, paid: 0, due: 0, retainage: 0 }
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700 border-green-300';
      case 'approved': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'reviewed': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'submitted': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-5 h-5" />;
      case 'approved': return <CheckCircle className="w-5 h-5" />;
      case 'reviewed': return <Clock className="w-5 h-5" />;
      case 'submitted': return <Clock className="w-5 h-5" />;
      case 'rejected': return <AlertCircle className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
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
            <h2 className="text-2xl font-bold text-gray-900">Payment Applications</h2>
            <p className="text-sm text-gray-600 mt-1">Progress billing and AIA document management</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <FileText className="w-5 h-5" />
            New Application
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700">Total Billed</span>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-900">
              ${(totals.billed / 1000).toFixed(0)}k
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-700">Total Paid</span>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-900">
              ${(totals.paid / 1000).toFixed(0)}k
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-yellow-700">Amount Due</span>
              <DollarSign className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-yellow-900">
              ${(totals.due / 1000).toFixed(0)}k
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-700">Retainage Held</span>
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-900">
              ${(totals.retainage / 1000).toFixed(0)}k
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
        <div className="flex items-center gap-2">
          {['all', 'draft', 'submitted', 'approved', 'paid'].map((cat) => (
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

      {/* Applications Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Application #</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Period</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Work Performed</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Stored Materials</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Total Billed</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Previous Paid</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Current Due</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredApplications.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center">
                  <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 font-medium">No payment applications</p>
                  <p className="text-gray-500 text-sm mt-1">Create a payment application</p>
                </td>
              </tr>
            ) : (
              filteredApplications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-mono text-sm font-bold text-blue-600">{app.application_number}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {new Date(app.period_start_date).toLocaleDateString()} - {new Date(app.period_end_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{new Date(app.application_date).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">
                    ${app.work_performed_amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-600">
                    ${(app.stored_materials_amount || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">
                    ${app.total_billed_amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-green-700">
                    ${app.previous_payments_received.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-yellow-700">
                    ${app.current_payment_due.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded border text-xs font-medium capitalize ${getStatusColor(app.status)}`}>
                        {getStatusIcon(app.status)}
                        {app.status}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentApplicationManager;
