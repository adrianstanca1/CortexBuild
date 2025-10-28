export interface User {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'foreman' | 'worker' | 'admin';
  avatar?: string;
  company?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Client {
  id: string;
  name: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  companyEmail: string;
  companyPhone: string;
  address: Address;
  billingAddress: string;
  paymentTerms: string;
  isActive: boolean;
  projects: Project[];
  totalValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  clientId: string;
  client?: Client;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  startDate: string;
  endDate?: string;
  budget: number;
  actualCost: number;
  progress: number;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  team: User[];
  tasks: Task[];
  documents: Document[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assignedTo: string[];
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  estimatedHours: number;
  actualHours: number;
  dependencies: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  projectId?: string;
  clientId?: string;
  uploadedBy: string;
  uploadedAt: string;
  tags: string[];
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  client?: Client;
  projectId?: string;
  project?: Project;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  projectId?: string;
  date: string;
  receipt?: string;
  approvedBy?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdBy: string;
  createdAt: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  model: string;
  serialNumber: string;
  status: 'available' | 'in-use' | 'maintenance' | 'retired';
  location: string;
  assignedTo?: string;
  projectId?: string;
  purchaseDate: string;
  purchasePrice: number;
  maintenanceSchedule: MaintenanceRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  type: 'routine' | 'repair' | 'inspection';
  description: string;
  cost: number;
  performedBy: string;
  performedAt: string;
  nextDue?: string;
}

export interface SafetyIncident {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  projectId?: string;
  location: string;
  reportedBy: string;
  reportedAt: string;
  assignedTo?: string;
  resolvedAt?: string;
  actions: string[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  userId: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type ViewType = 
  | 'dashboard' 
  | 'projects' 
  | 'clients' 
  | 'tasks' 
  | 'team' 
  | 'financials' 
  | 'invoices'
  | 'expenses'
  | 'equipment' 
  | 'safety' 
  | 'documents' 
  | 'reports' 
  | 'settings'
  | 'chat';
