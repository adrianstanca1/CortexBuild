'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

interface DashboardProps {
  user: any;
  aiEnabled: boolean;
  webSocketConnected: boolean;
}

export function Dashboard({ user, aiEnabled, webSocketConnected }: DashboardProps) {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">🚀</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">CortexBuild Pro</h1>
                <p className="text-purple-200">Most Advanced AI Construction Platform</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-white font-medium">{user.name}</p>
                <p className="text-purple-200 text-sm">{user.role}</p>
              </div>
              <button
                onClick={logout}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">AI Status</p>
                <p className="text-2xl font-bold text-white">{aiEnabled ? 'Active' : 'Inactive'}</p>
              </div>
              <div className={`w-4 h-4 rounded-full ${aiEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Real-time</p>
                <p className="text-2xl font-bold text-white">{webSocketConnected ? 'Connected' : 'Disconnected'}</p>
              </div>
              <div className={`w-4 h-4 rounded-full ${webSocketConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Platform</p>
                <p className="text-2xl font-bold text-white">NextJS 14</p>
              </div>
              <div className="w-4 h-4 rounded-full bg-blue-500" />
            </div>
          </motion.div>
        </div>

        {/* Feature Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
        >
          <h2 className="text-3xl font-bold text-white mb-6">🚀 Most Advanced Features</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-xl p-6 border border-purple-500/30">
              <h3 className="text-xl font-bold text-white mb-3">NextJS 14 App Router</h3>
              <p className="text-purple-200">Latest React framework with server components, streaming, and advanced routing</p>
            </div>

            <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-xl p-6 border border-green-500/30">
              <h3 className="text-xl font-bold text-white mb-3">TypeScript 5.0+</h3>
              <p className="text-green-200">Full type safety with latest TypeScript features and enhanced DX</p>
            </div>

            <div className="bg-gradient-to-br from-orange-600/20 to-red-600/20 rounded-xl p-6 border border-orange-500/30">
              <h3 className="text-xl font-bold text-white mb-3">Advanced AI Integration</h3>
              <p className="text-orange-200">Multiple AI providers with real-time chat and intelligent automation</p>
            </div>

            <div className="bg-gradient-to-br from-cyan-600/20 to-blue-600/20 rounded-xl p-6 border border-cyan-500/30">
              <h3 className="text-xl font-bold text-white mb-3">Real-time WebSocket</h3>
              <p className="text-cyan-200">Live collaboration with advanced WebSocket infrastructure</p>
            </div>

            <div className="bg-gradient-to-br from-pink-600/20 to-purple-600/20 rounded-xl p-6 border border-pink-500/30">
              <h3 className="text-xl font-bold text-white mb-3">Performance Monitoring</h3>
              <p className="text-pink-200">Web Vitals tracking, performance metrics, and optimization insights</p>
            </div>

            <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-xl p-6 border border-indigo-500/30">
              <h3 className="text-xl font-bold text-white mb-3">Enterprise Security</h3>
              <p className="text-indigo-200">JWT authentication, role-based access, and enterprise-grade security</p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}