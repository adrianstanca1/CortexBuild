'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useAI } from '../contexts/AIContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import { LoginForm } from './LoginForm';
import { Dashboard } from './Dashboard';

export function AdvancedDashboard() {
  const { user, loading } = useAuth();
  const { aiEnabled } = useAI();
  const { isConnected } = useWebSocket();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <Dashboard
      user={user}
      aiEnabled={aiEnabled}
      webSocketConnected={isConnected}
    />
  );
}