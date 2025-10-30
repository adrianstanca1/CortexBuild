/**
 * Database Adapter Interface
 * Unified interface for both SQLite and Supabase databases
 * Allows seamless switching between database providers
 */

export type DatabaseMode = 'sqlite' | 'supabase';

export interface DatabaseConfig {
  mode: DatabaseMode;
  sqlite?: {
    path: string;
  };
  supabase?: {
    url: string; // from env only
    anonKey: string; // from env only
    serviceKey?: string;
  };
}

export interface QueryResult<T = any> {
  data: T | null;
  error: Error | null;
  count?: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  company_id: string;
  avatar?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Company {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  subscription_tier?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Project {
  id: string | number;
  company_id: string;
  name: string;
  description?: string;
  status: string;
  priority?: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  actual_cost?: number;
  progress?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Unified Database Adapter Interface
 * All database implementations must follow this interface
 */
export interface IDatabaseAdapter {
  // Connection Management
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;

  // Generic CRUD Operations
  select<T = any>(table: string, filters?: Record<string, any>, options?: {
    limit?: number;
    offset?: number;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
  }): Promise<QueryResult<T[]>>;

  selectOne<T = any>(table: string, filters: Record<string, any>): Promise<QueryResult<T>>;

  insert<T = any>(table: string, data: Record<string, any>): Promise<QueryResult<T>>;

  update<T = any>(table: string, filters: Record<string, any>, data: Record<string, any>): Promise<QueryResult<T>>;

  delete(table: string, filters: Record<string, any>): Promise<QueryResult<void>>;

  // User Operations
  findUserByEmail(email: string): Promise<QueryResult<User>>;
  findUserById(id: string): Promise<QueryResult<User>>;
  createUser(user: Partial<User>): Promise<QueryResult<User>>;
  updateUser(id: string, data: Partial<User>): Promise<QueryResult<User>>;

  // Company Operations
  findCompanyById(id: string): Promise<QueryResult<Company>>;
  findCompanyByName(name: string): Promise<QueryResult<Company>>;
  createCompany(company: Partial<Company>): Promise<QueryResult<Company>>;
  updateCompany(id: string, data: Partial<Company>): Promise<QueryResult<Company>>;
  listCompanies(filters?: Record<string, any>): Promise<QueryResult<Company[]>>;

  // Project Operations
  findProjectById(id: string | number): Promise<QueryResult<Project>>;
  listProjects(companyId: string, filters?: Record<string, any>): Promise<QueryResult<Project[]>>;
  createProject(project: Partial<Project>): Promise<QueryResult<Project>>;
  updateProject(id: string | number, data: Partial<Project>): Promise<QueryResult<Project>>;
  deleteProject(id: string | number): Promise<QueryResult<void>>;

  // Transaction Support
  transaction<T>(callback: () => Promise<T>): Promise<T>;

  // Real-time Subscriptions (Supabase only, no-op for SQLite)
  subscribe?(table: string, callback: (payload: any) => void): () => void;

  // Migration & Sync
  exportData?(): Promise<Record<string, any[]>>;
  importData?(data: Record<string, any[]>): Promise<void>;

  // Health Check
  healthCheck(): Promise<boolean>;
}

/**
 * Database Error Types
 */
export class DatabaseError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class ConnectionError extends DatabaseError {
  constructor(message: string, originalError?: any) {
    super(message, originalError);
    this.name = 'ConnectionError';
  }
}

export class QueryError extends DatabaseError {
  constructor(message: string, originalError?: any) {
    super(message, originalError);
    this.name = 'QueryError';
  }
}

export class ValidationError extends DatabaseError {
  constructor(message: string, originalError?: any) {
    super(message, originalError);
    this.name = 'ValidationError';
  }
}


