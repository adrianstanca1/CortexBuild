/**
 * Home Page - Next.js 13+ App Directory
 * Main landing page for CortexBuild platform
 */

import React from 'react';
import HomePage from './components/pages/HomePage';

export const metadata = {
  title: 'CortexBuild - Quantum Intelligence Platform',
  description: 'Advanced AI-powered construction management platform with quantum computing capabilities',
};

export default function Home() {
  return <HomePage />;
}
