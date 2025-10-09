import React, { useState, useEffect } from 'react';
import { Bot, Users, Sparkles, MessageCircle, Shield, Database, Code, Zap, Activity, Lock, Key, Terminal } from 'lucide-react';
import { RealtimeCollaboration } from '../../collaboration/RealtimeCollaboration';
import { AdvancedAIAssistant } from '../../ai/AdvancedAIAssistant';
import { SuperAdminAIPanel } from '../../admin/SuperAdminAIPanel';

export const AICollaborationHub: React.FC = () => {
  const [activeView, setActiveView] = useState<'both' | 'ai' | 'collab' | 'admin'>('both');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    // Check if user is super admin
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setIsSuperAdmin(user.role === 'super_admin' || user.accessClass === 'super_admin');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI & Collaboration Hub
            </h1>
            <p className="text-gray-600 mt-2">
              Real-time collaboration and AI-powered assistance for your team
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2 bg-white rounded-lg p-1 shadow-md">
            <button
              onClick={() => setActiveView('both')}
              className={`px-4 py-2 rounded-md transition-all flex items-center gap-2 ${activeView === 'both'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <Sparkles className="w-4 h-4" />
              Both
            </button>
            <button
              onClick={() => setActiveView('ai')}
              className={`px-4 py-2 rounded-md transition-all flex items-center gap-2 ${activeView === 'ai'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <Bot className="w-4 h-4" />
              AI Assistant
            </button>
            <button
              type="button"
              onClick={() => setActiveView('collab')}
              className={`px-4 py-2 rounded-md transition-all flex items-center gap-2 ${activeView === 'collab'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <Users className="w-4 h-4" />
              Collaboration
            </button>
            {isSuperAdmin && (
              <button
                type="button"
                onClick={() => setActiveView('admin')}
                className={`px-4 py-2 rounded-md transition-all flex items-center gap-2 ${activeView === 'admin'
                  ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <Shield className="w-4 h-4" />
                Super Admin
              </button>
            )}
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-blue-600">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bot className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">AI Assistant</h3>
                <p className="text-sm text-gray-600">GPT-4 Turbo Powered</p>
              </div>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Context-aware responses</li>
              <li>• Smart project suggestions</li>
              <li>• Data analysis & predictions</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-purple-600">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Live Collaboration</h3>
                <p className="text-sm text-gray-600">Real-time Updates</p>
              </div>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• See who's online</li>
              <li>• Team chat messaging</li>
              <li>• Live activity feed</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {activeView === 'admin' && isSuperAdmin && (
          <div>
            <SuperAdminAIPanel />
          </div>
        )}

        {(activeView === 'both' || activeView === 'ai') && (
          <div className={activeView === 'both' ? 'mb-6' : ''}>
            <AdvancedAIAssistant />
          </div>
        )}

        {(activeView === 'both' || activeView === 'collab') && (
          <div>
            <RealtimeCollaboration />
          </div>
        )}
      </div>

      {/* Quick Tips */}
      <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Sparkles className="w-6 h-6" />
          Quick Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Bot className="w-5 h-5" />
              AI Assistant Tips:
            </h4>
            <ul className="text-sm space-y-1 opacity-90">
              <li>• Use "Analyze" mode for data insights</li>
              <li>• Use "Predict" mode for forecasting</li>
              <li>• Export conversations for records</li>
              <li>• Ask about your specific projects</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Collaboration Tips:
            </h4>
            <ul className="text-sm space-y-1 opacity-90">
              <li>• Open multiple tabs to test real-time</li>
              <li>• Chat with team members instantly</li>
              <li>• Track activity across projects</li>
              <li>• See who's working on what</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

