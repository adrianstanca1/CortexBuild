import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  Crown,
  DollarSign,
  Calendar,
  Activity
} from 'lucide-react';

// Simple Card component
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 ${className}`}>
    {children}
  </div>
);

// Simple Button component
const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ children, onClick, variant = 'primary', size = 'md', className = '' }) => {
  const baseClasses = 'rounded-lg font-semibold transition-colors inline-flex items-center justify-center';
  const variantClasses = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700',
    secondary: 'bg-slate-200 text-slate-800 hover:bg-slate-300',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100'
  };
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  );
};

// Simple Badge component
const Badge: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${className}`}>
    {children}
  </span>
);

interface SubscriptionProfile {
  id: string;
  user_id: string;
  subscription_tier: 'free' | 'starter' | 'pro' | 'enterprise';
  subscription_status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
  api_requests_used: number;
  api_requests_limit: number;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  trial_ends_at?: string;
  created_at: string;
  updated_at: string;
  email: string;
  name: string;
  company_name?: string;
}

interface SubscriptionAnalytics {
  subscriptions: Array<{
    subscription_tier: string;
    subscription_status: string;
    count: number;
    avg_usage: number;
    avg_limit: number;
  }>;
  recentChanges: Array<{
    new_tier: string;
    changes: number;
    change_date: string;
  }>;
  summary: {
    totalSubscriptions: number;
    activeSubscriptions: number;
  };
}

const SUBSCRIPTION_DETAILS = {
  free: { label: 'Free', limit: 100, color: 'bg-slate-100 text-slate-700' },
  starter: { label: 'Starter', limit: 1000, color: 'bg-blue-100 text-blue-700' },
  pro: { label: 'Pro', limit: 10000, color: 'bg-purple-100 text-purple-700' },
  enterprise: { label: 'Enterprise', limit: 100000, color: 'bg-emerald-100 text-emerald-700' }
};

const STATUS_DETAILS = {
  active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700' },
  canceled: { label: 'Canceled', color: 'bg-slate-100 text-slate-700' },
  past_due: { label: 'Past Due', color: 'bg-amber-100 text-amber-700' },
  unpaid: { label: 'Unpaid', color: 'bg-rose-100 text-rose-700' },
  trialing: { label: 'Trial', color: 'bg-blue-100 text-blue-700' }
};

export const SubscriptionManagement: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionProfile[]>([]);
  const [analytics, setAnalytics] = useState<SubscriptionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionProfile | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const loadSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sdk/admin/subscriptions');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSubscriptions(data.subscriptions);
        }
      }
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAnalytics = useCallback(async () => {
    try {
      // This would be a new endpoint for subscription analytics
      // For now, we'll calculate basic analytics from subscriptions
      const tierCounts = subscriptions.reduce((acc, sub) => {
        const key = `${sub.subscription_tier}_${sub.subscription_status}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const analyticsData: SubscriptionAnalytics = {
        subscriptions: Object.entries(tierCounts).map(([key, count]) => {
          const [tier, status] = key.split('_');
          return {
            subscription_tier: tier,
            subscription_status: status,
            count,
            avg_usage: 0,
            avg_limit: SUBSCRIPTION_DETAILS[tier as keyof typeof SUBSCRIPTION_DETAILS]?.limit || 0
          };
        }),
        recentChanges: [],
        summary: {
          totalSubscriptions: subscriptions.length,
          activeSubscriptions: subscriptions.filter(s => s.subscription_status === 'active').length
        }
      };

      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  }, [subscriptions]);

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (sub.company_name && sub.company_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || sub.subscription_status === statusFilter;
    const matchesTier = tierFilter === 'all' || sub.subscription_tier === tierFilter;

    return matchesSearch && matchesStatus && matchesTier;
  });

  const handleUpdateSubscription = async (userId: string, updates: any) => {
    try {
      const response = await fetch(`/api/sdk/admin/subscriptions/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          await loadSubscriptions();
          setShowUpdateModal(false);
          setSelectedSubscription(null);
          toast.success('Subscription updated successfully');
        }
      }
    } catch (error) {
      console.error('Failed to update subscription:', error);
      toast.error('Failed to update subscription');
    }
  };

  const formatUsagePercent = (used: number, limit: number) => {
    if (limit <= 0) return '0%';
    return `${Math.round((used / limit) * 100)}%`;
  };

  const getDaysUntilExpiration = (endDate?: string) => {
    if (!endDate) return null;
    const days = Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-slate-200 rounded"></div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Subscription Management</h2>
          <p className="text-slate-600">Manage user subscriptions and billing</p>
        </div>
        <Button onClick={loadSubscriptions}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-slate-900">{analytics.summary.totalSubscriptions}</div>
            <div className="text-sm text-slate-600">Total Subscriptions</div>
          </Card>

          <Card className="text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
            <div className="text-2xl font-bold text-slate-900">{analytics.summary.activeSubscriptions}</div>
            <div className="text-sm text-slate-600">Active Subscriptions</div>
          </Card>

          <Card className="text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold text-slate-900">
              {analytics.subscriptions.filter(s => s.subscription_status === 'active').length}
            </div>
            <div className="text-sm text-slate-600">Paying Customers</div>
          </Card>

          <Card className="text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-amber-600" />
            <div className="text-2xl font-bold text-slate-900">
              {subscriptions.filter(s => s.subscription_status === 'past_due' || s.subscription_status === 'unpaid').length}
            </div>
            <div className="text-sm text-slate-600">Issues</div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search users, emails, companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="trialing">Trial</option>
              <option value="past_due">Past Due</option>
              <option value="canceled">Canceled</option>
            </select>

            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Tiers</option>
              <option value="free">Free</option>
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-semibold text-slate-900">User</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900">Company</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900">Tier</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900">Usage</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900">Period</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscriptions.map((subscription) => {
                const usagePercent = (subscription.api_requests_used / subscription.api_requests_limit) * 100;
                const daysUntilExpiration = getDaysUntilExpiration(subscription.current_period_end);

                return (
                  <tr key={subscription.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-semibold text-slate-900">{subscription.name}</div>
                        <div className="text-sm text-slate-600">{subscription.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-slate-600">
                        {subscription.company_name || 'No Company'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={SUBSCRIPTION_DETAILS[subscription.subscription_tier]?.color}>
                        {SUBSCRIPTION_DETAILS[subscription.subscription_tier]?.label}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={STATUS_DETAILS[subscription.subscription_status]?.color}>
                        {STATUS_DETAILS[subscription.subscription_status]?.label}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="text-sm font-semibold text-slate-900">
                          {subscription.api_requests_used.toLocaleString()} / {subscription.api_requests_limit.toLocaleString()}
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              usagePercent > 90 ? 'bg-rose-500' :
                              usagePercent > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(usagePercent, 100)}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-slate-500">
                          {formatUsagePercent(subscription.api_requests_used, subscription.api_requests_limit)} used
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-slate-600">
                        {subscription.current_period_end ?
                          new Date(subscription.current_period_end).toLocaleDateString() :
                          'No period'
                        }
                        {daysUntilExpiration !== null && daysUntilExpiration <= 7 && (
                          <div className="text-xs text-amber-600 font-semibold">
                            {daysUntilExpiration <= 0 ? 'Expired' : `${daysUntilExpiration} days left`}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedSubscription(subscription);
                          setShowUpdateModal(true);
                        }}
                      >
                        Manage
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredSubscriptions.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No subscriptions found matching your criteria.
            </div>
          )}
        </div>
      </Card>

      {/* Update Subscription Modal */}
      {showUpdateModal && selectedSubscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Update Subscription
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    User
                  </label>
                  <div className="text-sm text-slate-600">
                    {selectedSubscription.name} ({selectedSubscription.email})
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Subscription Tier
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    defaultValue={selectedSubscription.subscription_tier}
                    id="tier-select"
                  >
                    <option value="free">Free</option>
                    <option value="starter">Starter</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Status
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    defaultValue={selectedSubscription.subscription_status}
                    id="status-select"
                  >
                    <option value="active">Active</option>
                    <option value="canceled">Canceled</option>
                    <option value="past_due">Past Due</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="trialing">Trial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Reason for Change
                  </label>
                  <input
                    type="text"
                    id="reason-input"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Admin adjustment, customer request, etc."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => {
                    const tier = (document.getElementById('tier-select') as HTMLSelectElement).value;
                    const status = (document.getElementById('status-select') as HTMLSelectElement).value;
                    const reason = (document.getElementById('reason-input') as HTMLInputElement).value;

                    handleUpdateSubscription(selectedSubscription.user_id, {
                      tier,
                      status,
                      reason
                    });
                  }}
                >
                  Update Subscription
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowUpdateModal(false);
                    setSelectedSubscription(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};