import React from 'react';
import { Zap } from 'lucide-react';
import { ProcurementPipelineWidget } from './widgets/ProcurementPipelineWidget';
import { UniversalAssistantWidget } from './widgets/UniversalAssistantWidget';
import { FlowBuilderWidget } from './widgets/FlowBuilderWidget';
import { MobileAppBuilderWidget } from './widgets/MobileAppBuilderWidget';
import { AgentMarketplaceWidget } from './widgets/AgentMarketplaceWidget';

interface AutomationStudioDashboardProps {
  onNavigate?: (screen: string, params?: Record<string, unknown>) => void;
}

export const AutomationStudioDashboard: React.FC<AutomationStudioDashboardProps> = ({ onNavigate }) => {
  return (
    <div className="automation-studio space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Automation Studio</h2>
            <p className="text-sm text-slate-600">AI Assistant, Workflows, Procurement & Mobile Apps - All in One Place</p>
          </div>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg">
          ✨ NEW
        </span>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700">Active Flows</p>
              <p className="mt-1 text-3xl font-bold text-emerald-900">3</p>
              <p className="mt-1 text-xs text-emerald-600">▶ 2 running · ⏸ 1 paused</p>
            </div>
            <div className="p-3 bg-emerald-200 rounded-lg">
              <svg className="h-6 w-6 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Open RFQs</p>
              <p className="mt-1 text-3xl font-bold text-blue-900">8</p>
              <p className="mt-1 text-xs text-blue-600">24 bids received</p>
            </div>
            <div className="p-3 bg-blue-200 rounded-lg">
              <svg className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">Mobile Apps</p>
              <p className="mt-1 text-3xl font-bold text-purple-900">3</p>
              <p className="mt-1 text-xs text-purple-600">Published & active</p>
            </div>
            <div className="p-3 bg-purple-200 rounded-lg">
              <svg className="h-6 w-6 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Active Widgets */}
      <div className="space-y-6">
        {/* Universal AI Assistant - PRIORITY 2 */}
        <UniversalAssistantWidget onNavigate={onNavigate} />

        {/* Procurement Pipeline - PRIORITY 1 */}
        <ProcurementPipelineWidget />

        {/* Flow Builder */}
        <FlowBuilderWidget />

        {/* Mobile App Builder */}
        <MobileAppBuilderWidget />

        {/* Agent Marketplace */}
        <AgentMarketplaceWidget />
      </div>

      {/* Coming Soon Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Marketplace Preview */}
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg mb-3">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h4 className="text-base font-semibold text-slate-900 mb-2">Agent Marketplace</h4>
          <p className="text-xs text-slate-600 mb-3">Browse and install automation agents</p>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            Q2 2025
          </span>
        </div>

        {/* Advanced Analytics Preview */}
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg mb-3">
            <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h4 className="text-base font-semibold text-slate-900 mb-2">Advanced Analytics</h4>
          <p className="text-xs text-slate-600 mb-3">AI-powered insights and predictions</p>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            Q2 2025
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mobile App Builder Preview */}
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg mb-3">
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h4 className="text-base font-semibold text-slate-900 mb-2">Mobile App Builder</h4>
          <p className="text-xs text-slate-600 mb-3">No-code screen composer with PWA generation</p>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            Coming Soon
          </span>
        </div>

        {/* Agent Marketplace Preview */}
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg mb-3">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h4 className="text-base font-semibold text-slate-900 mb-2">Agent Marketplace</h4>
          <p className="text-xs text-slate-600 mb-3">Browse and install automation widgets</p>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            Coming Soon
          </span>
        </div>

        {/* Connectors Preview */}
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg mb-3">
            <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h4 className="text-base font-semibold text-slate-900 mb-2">Connectors</h4>
          <p className="text-xs text-slate-600 mb-3">Integrate with QuickBooks, Slack, and more</p>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            Coming Soon
          </span>
        </div>
      </div>

      {/* Information Box */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center w-10 h-10 bg-emerald-200 rounded-lg">
              <svg className="h-6 w-6 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-emerald-900 mb-1">Automation Studio is Live!</h3>
            <p className="text-sm text-emerald-700">
              The Procurement Pipeline widget is now active with RFQ management, bid collection, and 3-bid enforcement.
              More automation features including Flow Builder, Universal AI Assistant, and Mobile App Builder are coming soon.
            </p>
            <div className="mt-3 flex items-center gap-4 text-xs text-emerald-600">
              <span>✓ Procurement Management</span>
              <span>🚧 Flow Builder (Coming Soon)</span>
              <span>🚧 AI Assistant (Coming Soon)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
