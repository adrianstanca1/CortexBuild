import React from 'react';
import { User } from '../../types';
import { ProductionSDKDeveloperView } from '../sdk/ProductionSDKDeveloperView';

interface DeveloperPlatformProps {
  user: User;
  onLogout: () => void;
}

/**
 * Developer Platform - SEPARATE MODULE for Developers
 * 
 * NO CONNECTION to main construction app!
 * This is a standalone development environment with:
 * - Real sandbox for code execution
 * - AgentKit builder
 * - Workflows & webhooks
 * - SDK environment & console
 * - Testing tools
 */
export const DeveloperPlatform: React.FC<DeveloperPlatformProps> = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-slate-900">
      <ProductionSDKDeveloperView 
        user={user}
        onLogout={onLogout}
      />
    </div>
  );
};
