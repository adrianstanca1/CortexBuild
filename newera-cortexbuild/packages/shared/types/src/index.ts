export type UUID = string;

export type PlanTier = 'starter' | 'growth' | 'enterprise';

export interface Tenant {
  id: UUID;
  name: string;
  slug: string;
  plan: PlanTier;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'super_admin' | 'admin' | 'project_manager' | 'field' | 'viewer';

export type PermissionAction = 'view' | 'create' | 'update' | 'delete' | 'approve';

export type PermissionSubject = 'projects' | 'rfis' | 'finance' | 'automation' | 'copilot';

export interface User {
  id: UUID;
  tenantId: UUID;
  email: string;
  fullName: string;
  role: UserRole;
  status: 'pending' | 'active' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: UUID;
  tenantId: UUID;
  name: string;
  code: string;
  status: 'planning' | 'active' | 'hold' | 'closed';
  startDate?: string;
  endDate?: string;
  budget: number;
  createdAt: string;
  updatedAt: string;
}

export type RFIStatus = 'draft' | 'open' | 'answered' | 'closed';

export interface RFI {
  id: UUID;
  tenantId: UUID;
  projectId: UUID;
  number: string;
  subject: string;
  question: string;
  response?: string;
  dueDate?: string;
  status: RFIStatus;
  createdBy: UUID;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetLine {
  id: UUID;
  tenantId: UUID;
  projectId: UUID;
  category: string;
  description: string;
  amount: number;
  committed: number;
  forecast: number;
  createdAt: string;
  updatedAt: string;
}

export type InvoiceStatus = 'draft' | 'submitted' | 'approved' | 'paid' | 'void';

export interface Invoice {
  id: UUID;
  tenantId: UUID;
  projectId: UUID;
  vendor: string;
  amount: number;
  status: InvoiceStatus;
  dueDate?: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceAlert {
  id: string;
  type: 'invoice_overdue' | 'budget_over_commit';
  severity: 'warning' | 'critical';
  message: string;
}

export interface ApiListResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
  };
}
