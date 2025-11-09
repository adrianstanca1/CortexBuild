import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Filter, Eye, Send, CheckCircle, Calendar, DollarSign, Users, AlertTriangle } from 'lucide-react';
import { BaseWidget } from './BaseWidget';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

interface RFQ {
  id: string;
  number: string;
  title: string;
  description: string;
  category: string;
  estimatedValue: number;
  currency: string;
  dueDate: string;
  status: 'draft' | 'open' | 'closed' | 'awarded' | 'cancelled';
  bids?: Bid[];
  vendors?: string[];
  createdAt: string;
}

interface Bid {
  id: string;
  rfqId: string;
  vendorId: string;
  vendorName?: string;
  number: string;
  totalAmount: number;
  currency: string;
  deliveryTimeline: string;
  status: 'submitted' | 'under_review' | 'accepted' | 'rejected';
  submittedAt: string;
}

interface PurchaseOrder {
  id: string;
  number: string;
  vendorId: string;
  vendorName?: string;
  totalAmount: number;
  currency: string;
  status: 'draft' | 'approved' | 'sent' | 'acknowledged' | 'delivered' | 'cancelled';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  deliveryDate: string;
  createdAt: string;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
};

export const ProcurementPipelineWidget: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rfqs' | 'bids' | 'pos'>('rfqs');
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewRFQModal, setShowNewRFQModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load RFQs
      const rfqsRes = await axios.get(`${API_URL}/automation/rfqs`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('constructai_token')}` }
      });
      setRfqs(rfqsRes.data.rfqs || []);

      // Load Bids
      const bidsRes = await axios.get(`${API_URL}/automation/bids`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('constructai_token')}` }
      });
      setBids(bidsRes.data.bids || []);

      // Load Purchase Orders
      const posRes = await axios.get(`${API_URL}/automation/purchase-orders`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('constructai_token')}` }
      });
      setPurchaseOrders(posRes.data.purchaseOrders || []);
    } catch (error: any) {
      console.error('Failed to load procurement data:', error);
      toast.error(error.response?.data?.error || 'Failed to load procurement data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (rfqId: string) => {
    toast.success('Opening RFQ details...');
    // TODO: Navigate to RFQ details view
  };

  const handleSendToVendors = (rfqId: string) => {
    toast.success('Sending RFQ to vendors...');
    // TODO: Implement send functionality
  };

  const handleReviewBids = (rfqId: string) => {
    toast.success('Opening bid review...');
    // TODO: Navigate to bid review
  };

  return (
    <BaseWidget
      id="procurement-pipeline"
      title="Procurement Pipeline"
      icon={<ShoppingCart size={24} />}
      actions={[
        {
          icon: <Plus size={16} />,
          label: 'New RFQ',
          onClick: () => setShowNewRFQModal(true),
          variant: 'primary'
        },
        {
          icon: <Filter size={16} />,
          label: 'Filter',
          onClick: () => setShowFilters(!showFilters)
        }
      ]}
    >
      <div className="procurement-pipeline space-y-4">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200">
          <button 
            className={`px-6 py-3 text-sm font-semibold transition-colors ${
              activeTab === 'rfqs' 
                ? 'text-emerald-600 border-b-2 border-emerald-600' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => setActiveTab('rfqs')}
          >
            📋 RFQs ({rfqs.length})
          </button>
          <button 
            className={`px-6 py-3 text-sm font-semibold transition-colors ${
              activeTab === 'bids' 
                ? 'text-emerald-600 border-b-2 border-emerald-600' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => setActiveTab('bids')}
          >
            📝 Bids ({bids.length})
          </button>
          <button 
            className={`px-6 py-3 text-sm font-semibold transition-colors ${
              activeTab === 'pos' 
                ? 'text-emerald-600 border-b-2 border-emerald-600' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => setActiveTab('pos')}
          >
            📦 Purchase Orders ({purchaseOrders.length})
          </button>
        </div>

        {/* Content */}
        <div className="pipeline-content">
          {loading ? (
            <div className="py-12 text-center">
              <div className="inline-block w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2 text-sm text-slate-600">Loading procurement data...</p>
            </div>
          ) : (
            <>
              {activeTab === 'rfqs' && <RFQsTab rfqs={rfqs} onView={handleViewDetails} onSend={handleSendToVendors} onReview={handleReviewBids} />}
              {activeTab === 'bids' && <BidsTab bids={bids} />}
              {activeTab === 'pos' && <PurchaseOrdersTab purchaseOrders={purchaseOrders} />}
            </>
          )}
        </div>
      </div>

      {/* New RFQ Modal Placeholder */}
      {showNewRFQModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Create New RFQ</h3>
            <p className="text-slate-600 mb-4">RFQ creation form coming soon...</p>
            <button 
              onClick={() => setShowNewRFQModal(false)}
              className="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </BaseWidget>
  );
};

// RFQs Tab Component
const RFQsTab: React.FC<{ 
  rfqs: RFQ[]; 
  onView: (id: string) => void;
  onSend: (id: string) => void;
  onReview: (id: string) => void;
}> = ({ rfqs, onView, onSend, onReview }) => {
  if (rfqs.length === 0) {
    return (
      <div className="py-12 text-center">
        <ShoppingCart className="mx-auto h-12 w-12 text-slate-300" />
        <h3 className="mt-2 text-sm font-medium text-slate-900">No RFQs</h3>
        <p className="mt-1 text-sm text-slate-500">Get started by creating a new Request for Quotation.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {rfqs.map(rfq => (
        <div 
          key={rfq.id} 
          className={`rfq-card bg-white border-2 rounded-lg p-4 hover:shadow-lg transition-shadow ${
            rfq.status === 'open' ? 'border-l-4 border-l-emerald-500' :
            rfq.status === 'closed' ? 'border-l-4 border-l-slate-400' :
            'border-slate-200'
          }`}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <span className="text-sm font-mono font-semibold text-slate-700">{rfq.number}</span>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
              rfq.status === 'open' ? 'bg-emerald-100 text-emerald-700' :
              rfq.status === 'closed' ? 'bg-slate-100 text-slate-700' :
              rfq.status === 'awarded' ? 'bg-blue-100 text-blue-700' :
              'bg-slate-100 text-slate-600'
            }`}>
              {rfq.status.toUpperCase()}
            </span>
          </div>

          {/* Content */}
          <h4 className="text-base font-semibold text-slate-900 mb-2">{rfq.title}</h4>
          <p className="text-sm text-slate-600 mb-4 line-clamp-2">{rfq.description}</p>

          {/* Meta */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Calendar size={14} />
              <span>Due: {formatDate(rfq.dueDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <DollarSign size={14} />
              <span>Budget: {formatCurrency(rfq.estimatedValue, rfq.currency)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Users size={14} />
              <span>{rfq.vendors?.length || 0} vendors</span>
            </div>
          </div>

          {/* 3-Bid Enforcement Indicator */}
          {rfq.status === 'open' && (
            <div className="mb-4 p-2 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center justify-between text-xs">
                <span className={`font-semibold ${
                  (rfq.bids?.length || 0) >= 3 ? 'text-emerald-700' : 'text-amber-700'
                }`}>
                  {rfq.bids?.length || 0}/3 bids received
                </span>
                {(rfq.bids?.length || 0) < 3 && (
                  <AlertTriangle size={14} className="text-amber-600" />
                )}
              </div>
              {(rfq.bids?.length || 0) < 3 && (
                <p className="mt-1 text-xs text-amber-600">
                  ⚠️ 3 bids required for compliance
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button 
              onClick={() => onView(rfq.id)}
              className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <Eye size={14} /> View
            </button>
            {rfq.status === 'draft' && (
              <button 
                onClick={() => onSend(rfq.id)}
                className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Send size={14} /> Send
              </button>
            )}
            {rfq.status === 'open' && (rfq.bids?.length || 0) >= 3 && (
              <button 
                onClick={() => onReview(rfq.id)}
                className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <CheckCircle size={14} /> Review
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Bids Tab Component
const BidsTab: React.FC<{ bids: Bid[] }> = ({ bids }) => {
  if (bids.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-slate-500">No bids submitted yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bids.map(bid => (
        <div key={bid.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono font-semibold text-slate-700">{bid.number}</span>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                bid.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                bid.status === 'rejected' ? 'bg-red-100 text-red-700' :
                bid.status === 'under_review' ? 'bg-amber-100 text-amber-700' :
                'bg-slate-100 text-slate-600'
              }`}>
                {bid.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-600">
              Vendor: {bid.vendorName || bid.vendorId} · Submitted: {formatDate(bid.submittedAt)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-slate-900">{formatCurrency(bid.totalAmount, bid.currency)}</p>
            <p className="text-xs text-slate-500">Timeline: {bid.deliveryTimeline}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// Purchase Orders Tab Component
const PurchaseOrdersTab: React.FC<{ purchaseOrders: PurchaseOrder[] }> = ({ purchaseOrders }) => {
  if (purchaseOrders.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-slate-500">No purchase orders created yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {purchaseOrders.map(po => (
        <div key={po.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono font-semibold text-slate-700">{po.number}</span>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                po.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                po.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                po.status === 'sent' ? 'bg-purple-100 text-purple-700' :
                'bg-slate-100 text-slate-600'
              }`}>
                {po.status.toUpperCase()}
              </span>
              {po.approvalStatus === 'pending' && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">
                  PENDING APPROVAL
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-600">
              Vendor: {po.vendorName || po.vendorId} · Delivery: {formatDate(po.deliveryDate)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-slate-900">{formatCurrency(po.totalAmount, po.currency)}</p>
            <p className="text-xs text-slate-500">Created: {formatDate(po.createdAt)}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
