export type UserRole = 'user' | 'admin' | 'developer' | 'super_admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  tenantId?: string;
  permissions?: string[];
  isActive: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  progress: number;
  clientId?: string;
  managerId: string;
  teamMembers: string[];
  createdAt: string;
  updatedAt: string;
  tenantId: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  projects: string[];
  totalValue: number;
  status: 'active' | 'inactive' | 'prospect';
  createdAt: string;
  updatedAt: string;
  tenantId: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigneeId?: string;
  projectId: string;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  createdAt: string;
  updatedAt: string;
  tenantId: string;
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  projectId?: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  issuedDate: string;
  paidDate?: string;
  items: InvoiceItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  tenantId: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Tenant {
  id: string;
  name: string;
  domain?: string;
  logo?: string;
  settings: TenantSettings;
  createdAt: string;
  updatedAt: string;
}

export interface TenantSettings {
  theme: 'light' | 'dark' | 'auto';
  timezone: string;
  currency: string;
  dateFormat: string;
  features: {
    projects: boolean;
    clients: boolean;
    invoices: boolean;
    reports: boolean;
    api: boolean;
  };
}

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalClients: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingInvoices: number;
  overdueInvoices: number;
  completedTasks: number;
  totalTasks: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  error?: string;
}