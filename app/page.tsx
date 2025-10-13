/**
 * Main Application Router
 * Routes to appropriate pages based on URL and authentication status
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import HomePage from './components/pages/HomePage';
import NeuralNetworkPage from './components/pages/NeuralNetworkPage';
import PlatformFeaturesPage from './components/pages/PlatformFeaturesPage';
import ConnectivityPage from './components/pages/ConnectivityPage';
import DeveloperPlatformPage from './components/pages/DeveloperPlatformPage';
import GetStartedPage from './components/pages/GetStartedPage';
import QuantumLoginPage from './components/auth/QuantumLoginPage';
import RootLayout from './layout';

export default function MainApp() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check current route
    const path = window.location.pathname;
    determineCurrentPage(path);

    // Check authentication
    checkAuthentication();
  }, []);

  const determineCurrentPage = (path: string) => {
    if (path === '/' || path === '/home') setCurrentPage('home');
    else if (path === '/neural-network') setCurrentPage('neural-network');
    else if (path === '/platform-features' || path === '/features') setCurrentPage('features');
    else if (path === '/connectivity') setCurrentPage('connectivity');
    else if (path === '/developer-platform' || path === '/developer') setCurrentPage('developer');
    else if (path === '/get-started') setCurrentPage('get-started');
    else if (path === '/login') setCurrentPage('login');
    else if (path.startsWith('/dashboard')) setCurrentPage('dashboard');
    else setCurrentPage('home');
  };

  const checkAuthentication = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const userData = await verifyUserSession(token);
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyUserSession = async (token: string): Promise<any> => {
    // Mock verification
    if (token === 'dev-token-123') {
      return {
        id: 'user_admin_1',
        name: 'System Administrator',
        email: 'admin@cortexbuild.com',
        role: 'super_admin'
      };
    }
    return null;
  };

  const renderPage = () => {
    // If user is authenticated and on dashboard, show dashboard
    if (user && currentPage === 'dashboard') {
      return <RootLayout children={undefined} />;
    }

    // Public pages - all our main pages as requested
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'neural-network':
        return <NeuralNetworkPage />;
      case 'features':
        return <PlatformFeaturesPage />;
      case 'connectivity':
        return <ConnectivityPage />;
      case 'developer':
        return <DeveloperPlatformPage />;
      case 'get-started':
        return <GetStartedPage />;
      case 'login':
        return <QuantumLoginPage />;
      default:
        return <HomePage />;
    }
  };

  if (isLoading) {
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

  return renderPage();
}