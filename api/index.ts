// API Module Exports
// Central export point for all API modules

// Export mock API for development
export { mockApi } from './mockApi';
export type { ChatMessage, ChatSession } from './mockApi';

// Export chat API functions
export * from './chat';

// Export platform admin API
export * from './platformAdmin';
export { toggleCompanyPlanStatus } from './platformAdmin';

// Re-export types from types.ts for API usage
export type { AIAgent } from '../types';

// Re-export types from platformAdmin.ts (types are defined there, not duplicated here)
export type { 
  AuditLogEntry, 
  CompanyPlan, 
  PlatformInvitation 
} from './platformAdmin';
