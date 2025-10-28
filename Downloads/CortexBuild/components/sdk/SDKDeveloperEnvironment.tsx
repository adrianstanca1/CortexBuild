import React, { useState, useEffect } from 'react';
import { Code, Workflow, Bot, FileCode, Puzzle, Settings, Sparkles, Lock, Crown, BarChart3 } from 'lucide-react';
import { AIAppBuilder } from './AIAppBuilder';
import { WorkflowBuilder } from './WorkflowBuilder';
import { AgentDashboard } from './AgentDashboard';
import { TemplateGallery } from './TemplateGallery';
import { IntegrationsHub } from './IntegrationsHub';
import { SDKSettings } from './SDKSettings';
import { DeveloperLandingPage } from './DeveloperLandingPage';
import { AnalyticsDashboard } from './AnalyticsDashboard';

interface User {
  id: string;
  role: string;
  email: string;
  name: string;
}

interface SDKDeveloper {
  id: string;
  subscription_tier: string;
  api_requests_used: number;
  api_requests_limit: number;
  is_active: boolean;
}

export const SDKDeveloperEnvironment: React.FC<{ user: User }> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'builder' | 'workflows' | 'agents' | 'templates' | 'integrations' | 'analytics' | 'settings'>('builder');
  const [sdkDeveloper, setSdkDeveloper] = useState<SDKDeveloper | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    fetchSDKDeveloperStatus();
  }, []);

  const fetchSDKDeveloperStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/sdk/developer/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setSdkDeveloper(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch SDK developer status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check if user has access to SDK environment
  const hasAccess = user.role === 'super_admin' || sdkDeveloper?.is_active;
  const isSuperAdmin = user.role === 'super_admin';
  const subscriptionTier = isSuperAdmin ? 'enterprise' : (sdkDeveloper?.subscription_tier || 'free');

  // Calculate usage percentage
  const usagePercentage = sdkDeveloper && sdkDeveloper.api_requests_limit > 0
    ? Math.min((sdkDeveloper.api_requests_used / sdkDeveloper.api_requests_limit) * 100, 100)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading SDK Environment...</p>
        </div>
      </div>
    );
  }

  // Demo/Free tier access - show Developer Landing Page
  if (!hasAccess || subscriptionTier === 'free') {
    return (
      <DeveloperLandingPage onGetStarted={() => setShowUpgradeModal(true)} />
    );
  }

  // Full SDK Environment for authorized users
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Upgrade to SDK Developer</h3>
            <p className="text-gray-600 mb-6">
              Contact your administrator or Super Admin to upgrade your account to SDK Developer access.
            </p>
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <Code className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">SDK Developer Environment</h1>
                <p className="text-blue-100">Build custom construction apps with AI</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-blue-100">API Usage</p>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-white bg-opacity-20 rounded-full h-2">
                    <div
                      className="bg-white rounded-full h-2"
                      style={{ width: `${usagePercentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold">
                    {sdkDeveloper?.api_requests_used || 0} / {sdkDeveloper?.api_requests_limit === -1 ? '∞' : sdkDeveloper?.api_requests_limit || 0}
                  </span>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-lg font-semibold ${subscriptionTier === 'enterprise' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                subscriptionTier === 'pro' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                  subscriptionTier === 'starter' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                    'bg-gray-500'
                }`}>
                {subscriptionTier.toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            {[
              { id: 'builder', label: 'AI App Builder', icon: Code },
              { id: 'workflows', label: 'Workflow Builder', icon: Workflow },
              { id: 'agents', label: 'AI Agents', icon: Bot },
              { id: 'templates', label: 'Templates', icon: FileCode },
              { id: 'integrations', label: 'Integrations', icon: Puzzle },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-4 border-b-2 transition-colors ${activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'builder' && <AIAppBuilder subscriptionTier={subscriptionTier} />}
        {activeTab === 'workflows' && <WorkflowBuilder subscriptionTier={subscriptionTier} />}
        {activeTab === 'agents' && <AgentDashboard subscriptionTier={subscriptionTier} />}
        {activeTab === 'templates' && <TemplateGallery subscriptionTier={subscriptionTier} />}
        {activeTab === 'integrations' && <IntegrationsHub subscriptionTier={subscriptionTier} />}
        {activeTab === 'analytics' && <AnalyticsDashboard />}
        {activeTab === 'settings' && <SDKSettings sdkDeveloper={sdkDeveloper} />}
      </div>
    </div>
  );
};

