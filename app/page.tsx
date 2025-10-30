/**
 * Home Page - Next.js 13+ App Directory
 * Main landing page for CortexBuild platform
 */

import React from 'react';
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'CortexBuild - Quantum Intelligence Platform',
  description: 'Advanced AI-powered construction management platform with quantum computing capabilities',
};

export default function Home() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">CortexBuild</h1>
      <p className="mt-2 text-gray-600">Welcome. Use the navigation or go to /login to start.</p>
    </div>
  );
}
