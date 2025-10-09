// CortexBuild Platform - TypeScript Type Definitions
// Version: 1.0.0 GOLDEN
// Last Updated: 2025-10-08

// ============================================
// CORE TYPES
// ============================================

export interface User {
  id: number;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'admin' | 'manager' | 'user' | 'developer';
  company_id?: number;
  avatar_url?: string;
  is_active: boolean;
  email_verified: boolean;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Company {
  id: number;
  name: string;
  industry?: string;
  size?: '1-10' | '11-50' | '51-200' | '201-500' | '500+';
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country: string;
  phone?: string;
  website?: string;
  logo_url?: string;
  tax_id?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Session {
  id: number;
  user_id: number;
  token: string;
  ip_address?: string;
  user_agent?: string;
  expires_at: Date;
  created_at: Date;
}

// ============================================
// PROJECT MANAGEMENT TYPES
// ============================================

export interface Project {
  id: number;
  company_id: number;
  name: string;
  description?: string;
  project_number?: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  start_date?: Date;
  end_date?: Date;
  budget?: number;
  actual_cost: number;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  client_id?: number;
  project_manager_id?: number;
  progress: number;
  is_archived: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Task {
  id: number;
  project_id: number;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'review' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_to?: number;
  due_date?: Date;
  estimated_hours?: number;
  actual_hours: number;
  progress: number;
  parent_task_id?: number;
  order_index: number;
  created_by?: number;
  created_at: Date;
  updated_at: Date;
  completed_at?: Date;
}

export interface Milestone {
  id: number;
  project_id: number;
  name: string;
  description?: string;
  due_date: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'delayed';
  progress: number;
  created_at: Date;
  updated_at: Date;
  completed_at?: Date;
}

export interface ProjectTeamMember {
  id: number;
  project_id: number;
  user_id: number;
  role: string;
  hourly_rate?: number;
  joined_at: Date;
  left_at?: Date;
}

// ============================================
// CLIENT MANAGEMENT TYPES
// ============================================

export interface Client {
  id: number;
  company_id: number;
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country: string;
  website?: string;
  tax_id?: string;
  payment_terms: number;
  credit_limit?: number;
  notes?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// ============================================
// RFI TYPES
// ============================================

export interface RFI {
  id: number;
  project_id: number;
  rfi_number: string;
  subject: string;
  question: string;
  answer?: string;
  status: 'open' | 'answered' | 'closed' | 'void';
  priority: 'low' | 'medium' | 'high' | 'critical';
  submitted_by: number;
  assigned_to?: number;
  due_date?: Date;
  answered_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// ============================================
// FINANCIAL TYPES
// ============================================

export interface Invoice {
  id: number;
  company_id: number;
  project_id?: number;
  client_id: number;
  invoice_number: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issue_date: Date;
  due_date: Date;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  paid_amount: number;
  balance: number;
  notes?: string;
  terms?: string;
  paid_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface InvoiceItem {
  id: number;
  invoice_id: number;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  created_at: Date;
}

// ============================================
// TIME TRACKING TYPES
// ============================================

export interface TimeEntry {
  id: number;
  user_id: number;
  project_id: number;
  task_id?: number;
  description?: string;
  start_time: Date;
  end_time?: Date;
  duration_minutes?: number;
  is_billable: boolean;
  hourly_rate?: number;
  amount?: number;
  created_at: Date;
  updated_at: Date;
}

// ============================================
// SUBCONTRACTOR TYPES
// ============================================

export interface Subcontractor {
  id: number;
  company_id: number;
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  trade?: string;
  license_number?: string;
  insurance_expiry?: Date;
  rating?: number;
  is_active: boolean;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ProjectSubcontractor {
  id: number;
  project_id: number;
  subcontractor_id: number;
  contract_amount?: number;
  start_date?: Date;
  end_date?: Date;
  status: 'active' | 'completed' | 'terminated';
  created_at: Date;
}

// ============================================
// PURCHASE ORDER TYPES
// ============================================

export interface PurchaseOrder {
  id: number;
  company_id: number;
  project_id?: number;
  vendor_id?: number;
  po_number: string;
  status: 'draft' | 'sent' | 'approved' | 'received' | 'cancelled';
  issue_date: Date;
  delivery_date?: Date;
  subtotal: number;
  tax_amount: number;
  total: number;
  notes?: string;
  created_by?: number;
  approved_by?: number;
  approved_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface PurchaseOrderItem {
  id: number;
  po_id: number;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  created_at: Date;
}

// ============================================
// DOCUMENT TYPES
// ============================================

export interface Document {
  id: number;
  company_id: number;
  project_id?: number;
  name: string;
  description?: string;
  file_path: string;
  file_size?: number;
  file_type?: string;
  category?: 'contract' | 'drawing' | 'photo' | 'report' | 'invoice' | 'other';
  uploaded_by: number;
  is_public: boolean;
  version: number;
  parent_document_id?: number;
  created_at: Date;
  updated_at: Date;
}

// ============================================
// ACTIVITY TYPES
// ============================================

export interface Activity {
  id: number;
  user_id: number;
  project_id?: number;
  entity_type: string;
  entity_id: number;
  action: string;
  description?: string;
  metadata?: string;
  created_at: Date;
}

// ============================================
// DEVELOPER PLATFORM TYPES
// ============================================

export interface Module {
  id: number;
  developer_id: number;
  name: string;
  slug: string;
  description?: string;
  category?: string;
  version: string;
  price: number;
  is_free: boolean;
  downloads: number;
  rating: number;
  reviews_count: number;
  status: 'draft' | 'review' | 'published' | 'suspended';
  repository_url?: string;
  documentation_url?: string;
  demo_url?: string;
  published_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface ModuleReview {
  id: number;
  module_id: number;
  user_id: number;
  rating: number;
  review?: string;
  created_at: Date;
  updated_at: Date;
}

export interface APIKey {
  id: number;
  user_id: number;
  name: string;
  key_hash: string;
  key_prefix: string;
  permissions?: string;
  last_used_at?: Date;
  expires_at?: Date;
  is_active: boolean;
  created_at: Date;
}

export interface Webhook {
  id: number;
  user_id: number;
  url: string;
  events: string;
  secret: string;
  is_active: boolean;
  last_triggered_at?: Date;
  created_at: Date;
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  company_name: string;
  industry?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: Omit<User, 'password'>;
  error?: string;
}

// ============================================
// QUERY FILTER TYPES
// ============================================

export interface ProjectFilters {
  status?: string;
  priority?: string;
  client_id?: number;
  project_manager_id?: number;
  search?: string;
  start_date?: string;
  end_date?: string;
}

export interface TaskFilters {
  project_id?: number;
  status?: string;
  priority?: string;
  assigned_to?: number;
  search?: string;
}

export interface InvoiceFilters {
  status?: string;
  client_id?: number;
  project_id?: number;
  start_date?: string;
  end_date?: string;
  search?: string;
}

export interface TimeEntryFilters {
  user_id?: number;
  project_id?: number;
  start_date?: string;
  end_date?: string;
  is_billable?: boolean;
}

// ============================================
// STATISTICS TYPES
// ============================================

export interface ProjectStats {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  total_budget: number;
  total_actual_cost: number;
  average_progress: number;
}

export interface FinancialStats {
  total_invoiced: number;
  total_paid: number;
  total_outstanding: number;
  overdue_amount: number;
  this_month_revenue: number;
  last_month_revenue: number;
}

export interface TimeStats {
  total_hours: number;
  billable_hours: number;
  non_billable_hours: number;
  total_amount: number;
  this_week_hours: number;
  last_week_hours: number;
}

// ============================================
// DASHBOARD TYPES
// ============================================

export interface DashboardData {
  projects: ProjectStats;
  financial: FinancialStats;
  time: TimeStats;
  recent_activities: Activity[];
  upcoming_milestones: Milestone[];
  overdue_tasks: Task[];
}

// ============================================
// EXPORT TYPES
// ============================================

export type UserRole = User['role'];
export type ProjectStatus = Project['status'];
export type TaskStatus = Task['status'];
export type InvoiceStatus = Invoice['status'];
export type RFIStatus = RFI['status'];
export type Priority = 'low' | 'medium' | 'high' | 'critical';
