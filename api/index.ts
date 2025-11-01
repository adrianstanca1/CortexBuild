// API Module Exports
// Central export point for all API modules

// Export mock API for development
export { mockApi } from './mockApi';
export type { ChatMessage, ChatSession } from './mockApi';

// Export chat API functions
export * from './chat';

// Export platform admin API
export * from './platformAdmin';

// Re-export types from types.ts for API usage
export type { AIAgent } from '../types';

// Define missing types here
export interface AuditLogEntry {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string;
  userId: string;
  userName: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface CompanyPlan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  limits: {
    users: number;
    projects: number;
    storage: number;
  };
  isActive: boolean;
}

export interface PlatformInvitation {
  id: string;
  email: string;
  companyName?: string;
  invitationType: 'company_admin' | 'super_admin' | 'platform_partner';
  status: 'pending' | 'accepted' | 'expired';
  sentAt: string;
  expiresAt: string;
  acceptedAt?: string;
}
