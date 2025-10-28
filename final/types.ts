// === AUTHENTICATION & USER MANAGEMENT TYPES ===
export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  company: Company | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  companyId?: string;
  inviteToken?: string;
}

export type RegistrationPayload = Partial<RegisterCredentials & {
  companyName?: string;
  companyType?: CompanyType;
  companyEmail?: string;
  companyPhone?: string;
  companyWebsite?: string;
  companySelection?: 'create' | 'join';
  inviteToken?: string;
  role?: Role;
  updatesOptIn?: boolean;
  termsAccepted?: boolean;
}>;

export interface Company {
  id: string;
  name: string;
  type: CompanyType;
  address: Address;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  settings: CompanySettings;
  subscriptionPlan: SubscriptionPlan;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // FIX: Added missing properties to Company type
  status?: 'Active' | 'Suspended';
  storageUsageGB: number;
}

export type CompanyType = 'GENERAL_CONTRACTOR' | 'SUBCONTRACTOR' | 'SUPPLIER' | 'CONSULTANT' | 'CLIENT';

export interface CompanySettings {
  timeZone: string;
  dateFormat: string;
  currency: string;
  workingHours: WorkingHours;
  features: CompanyFeatures;
  // FIX: Added missing properties to CompanySettings
  theme: 'light' | 'dark';
  accessibility: {
    highContrast: boolean;
  };
}

export interface WorkingHours {
  start: string; // HH:mm format
  end: string;
  workDays: number[]; // 0 = Sunday, 1 = Monday, etc.
}

export interface CompanyFeatures {
  projectManagement: boolean;
  timeTracking: boolean;
  financials: boolean;
  documents: boolean;
  safety: boolean;
  equipment: boolean;
  reporting: boolean;
}

export type SubscriptionPlan = 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Enhanced User interface for RBAC
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  passwordHash?: string;
  passwordSalt?: string;
  mfaEnabled?: boolean;
  phone?: string;
  avatar?: string;
  role: Role; // FIX: Changed from UserRole to Role enum
  permissions: Permission[];
  companyId: string;
  departmentId?: string;
  position?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  preferences: UserPreferences;
  // FIX: Added missing properties to User type
  skills?: string[];
  availability?: AvailabilityStatus;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: NotificationSettings;
  dashboard: DashboardSettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  taskReminders: boolean;
  projectUpdates: boolean;
  systemAlerts: boolean;
}

export interface DashboardSettings {
  defaultView: string;
  pinnedWidgets: string[];
  hiddenWidgets: string[];
}

// FIX: Renamed UserRole to Role and converted to an enum for use as values.
export enum Role {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  FOREMAN = 'FOREMAN',
  OPERATIVE = 'OPERATIVE',
  CLIENT = 'CLIENT',
  // FIX: Added missing roles
  PRINCIPAL_ADMIN = 'PRINCIPAL_ADMIN',
  // FIX: Removed duplicate PM role. The original PROJECT_MANAGER should be used.
}


// FIX: Converted Permission to an enum for use as values in hasPermission checks.
export enum Permission {
  VIEW_ALL_PROJECTS = 'VIEW_ALL_PROJECTS',
  VIEW_ASSIGNED_PROJECTS = 'VIEW_ASSIGNED_PROJECTS',
  CREATE_PROJECT = 'CREATE_PROJECT',
  MANAGE_PROJECT_DETAILS = 'MANAGE_PROJECT_DETAILS',
  MANAGE_PROJECT_TEMPLATES = 'MANAGE_PROJECT_TEMPLATES',
  VIEW_ALL_TASKS = 'VIEW_ALL_TASKS',
  MANAGE_ALL_TASKS = 'MANAGE_ALL_TASKS',
  SUBMIT_TIMESHEET = 'SUBMIT_TIMESHEET',
  VIEW_ALL_TIMESHEETS = 'VIEW_ALL_TIMESHEETS',
  MANAGE_TIMESHEETS = 'MANAGE_TIMESHEETS',
  UPLOAD_DOCUMENTS = 'UPLOAD_DOCUMENTS',
  VIEW_DOCUMENTS = 'VIEW_DOCUMENTS',
  SUBMIT_SAFETY_REPORT = 'SUBMIT_SAFETY_REPORT',
  VIEW_SAFETY_REPORTS = 'VIEW_SAFETY_REPORTS',
  MANAGE_SAFETY_REPORTS = 'MANAGE_SAFETY_REPORTS',
  VIEW_FINANCES = 'VIEW_FINANCES',
  MANAGE_FINANCES = 'MANAGE_FINANCES',
  VIEW_TEAM = 'VIEW_TEAM',
  MANAGE_TEAM = 'MANAGE_TEAM',
  MANAGE_EQUIPMENT = 'MANAGE_EQUIPMENT',
  VIEW_AUDIT_LOG = 'VIEW_AUDIT_LOG',
  SEND_DIRECT_MESSAGE = 'SEND_DIRECT_MESSAGE',
  ACCESS_ALL_TOOLS = 'ACCESS_ALL_TOOLS',
  SUBMIT_EXPENSE = 'SUBMIT_EXPENSE',
}

export type ResourceType = 
  | 'PROJECTS' 
  | 'TASKS' 
  | 'USERS' 
  | 'COMPANIES' 
  | 'FINANCIALS' 
  | 'DOCUMENTS' 
  | 'REPORTS' 
  | 'SAFETY' 
  | 'EQUIPMENT' 
  | 'SETTINGS';

export type ActionType = 
  | 'CREATE' 
  | 'READ' 
  | 'UPDATE' 
  | 'DELETE' 
  | 'MANAGE' 
  | 'APPROVE' 
  | 'ASSIGN';

export interface PermissionCondition {
  field: string;
  operator: 'equals' | 'in' | 'not_in' | 'contains';
  value: any;
}

// Password Reset
export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  token: string;
  password: string;
  confirmPassword: string;
}

// JWT Token Payload
export interface TokenPayload {
  userId: string;
  companyId: string;
  role: Role;
  permissions: string[];
  exp: number;
  iat: number;
}

// API Response Types
export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    refreshToken: string;
    user: User;
    company: Company;
  };
  message?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

// === EXISTING PROJECT TYPES ===
export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
// FIX: Converted status types to enums for type safety and value usage.
export enum TodoStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}
export enum TodoPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}
export enum ExpenseStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
}
export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}
export enum NotificationType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  // FIX: Added missing notification types
  APPROVAL_REQUEST = 'APPROVAL_REQUEST',
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  NEW_MESSAGE = 'NEW_MESSAGE',
  SAFETY_ALERT = 'SAFETY_ALERT',
  DOCUMENT_COMMENT = 'DOCUMENT_COMMENT',
}
export enum TimesheetStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  DRAFT = 'DRAFT',
}
export enum IncidentSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}
export enum IncidentStatus {
  REPORTED = 'REPORTED',
  UNDER_INVESTIGATION = 'UNDER_INVESTIGATION',
  RESOLVED = 'RESOLVED',
}
export enum EquipmentStatus {
  AVAILABLE = 'AVAILABLE',
  IN_USE = 'IN_USE',
  MAINTENANCE = 'MAINTENANCE',
  OUT_OF_ORDER = 'OUT_OF_ORDER',
}
// FIX: Added missing status enums
export enum QuoteStatus {
    DRAFT = 'DRAFT',
    SENT = 'SENT',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
}
export enum DocumentStatus {
    DRAFT = 'DRAFT',
    IN_REVIEW = 'IN_REVIEW',
    APPROVED = 'APPROVED',
}
export enum AvailabilityStatus {
    AVAILABLE = 'AVAILABLE',
    ON_PROJECT = 'ON_PROJECT',
    ON_LEAVE = 'ON_LEAVE',
}

export interface Location {
    address: string;
    lat: number;
    lng: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  location: Location; // FIX: Changed from string to Location object
  clientId: string;
  managerId: string;
  image?: string;
  progress: number;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  // FIX: Added missing properties
  actualCost: number;
  geofenceRadius?: number;
  imageUrl?: string;
  projectType: string;
  workClassification: string;
}

export interface UpcomingProjectDeadline {
  id: string;
  name: string;
  endDate: string;
  daysRemaining: number;
  status: ProjectStatus;
  isOverdue: boolean;
}

export interface ProjectPortfolioSummary {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  atRiskProjects: number;
  overdueProjects: number;
  pipelineValue: number;
  totalActualCost: number;
  budgetVariance: number;
  averageProgress: number;
  statusBreakdown: Record<ProjectStatus, number>;
  upcomingDeadlines: UpcomingProjectDeadline[];
}

export interface ProjectInsight {
  id: string;
  projectId: string;
  summary: string;
  type: 'HEALTH_SUMMARY' | 'KNOWLEDGE_SUMMARY' | 'CUSTOM';
  createdAt: string;
  createdBy: string;
  model?: string;
  metadata?: Record<string, unknown>;
}

export interface FinancialForecast {
  id: string;
  companyId: string;
  summary: string;
  horizonMonths: number;
  createdAt: string;
  createdBy: string;
  model?: string;
  metadata?: Record<string, unknown>;
}

// FIX: Renamed Task to Todo for consistency with component usage.
export interface Todo {
  id: string;
  title: string;
  description: string;
  status: TodoStatus;
  priority: TodoPriority;
  assignedTo: string;
  projectId: string;
  dueDate: string;
  estimatedHours: number;
  actualHours?: number;
  dependencies?: string[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  // FIX: Added missing properties
  text: string;
  assigneeId?: string;
  dependsOn?: (string | number)[];
  progress?: number;
  reminderAt?: Date;
  completedAt?: string;
}
export type Task = Todo; // Alias for backward compatibility if needed
export type TaskStatus = TodoStatus;
export type TaskPriority = TodoPriority;

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  projectId: string;
  userId: string;
  date: string;
  status: ExpenseStatus;
  receipt?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
  // FIX: Added missing property
  submittedAt: string;
  currency?: string;
  rejectionReason?: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  // FIX: Added missing property
  unitPrice: number;
}

export type InvoiceLineItemDraft = Omit<InvoiceLineItem, 'amount' | 'rate'>;

export interface Invoice {
  id: string;
  companyId: string;
  invoiceNumber: string;
  projectId: string;
  clientId: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  retentionRate: number;
  retentionAmount: number;
  total: number;
  amountPaid: number;
  balance: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // FIX: Added missing properties
  payments: InvoicePayment[];
  issuedAt: string;
  dueAt: string;
}

export interface InvoicePayment {
  id: string;
  invoiceId: string;
  amount: number;
  date: string;
  method: 'CASH' | 'CHECK' | 'BANK_TRANSFER' | 'CREDIT_CARD';
  reference?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  model: string;
  serialNumber: string;
  status: EquipmentStatus;
  currentProjectId?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  location?: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

// FIX: Renamed TimeEntry to Timesheet for consistency
export interface Timesheet {
  id: string;
  userId: string;
  projectId: string;
  taskId?: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  description: string;
  status: TimesheetStatus;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
  // FIX: Added missing properties for clock-in/out functionality
  clockIn: Date;
  clockOut: Date | null;
  notes?: string;
  rejectionReason?: string;
}
export type TimeEntry = Timesheet; // Alias
export type TimeEntryStatus = TimesheetStatus;

export interface SafetyIncident {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  projectId: string;
  reportedBy: string;
  incidentDate: string;
  location: string;
  witnessIds?: string[];
  actionsTaken?: string;
  images?: string[];
  status: IncidentStatus;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
  // FIX: Added missing properties
  timestamp: string;
  reportedById: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  // FIX: Added missing properties
  isRead: boolean;
  timestamp: Date;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  projectId?: string;
  uploadedBy: string;
  tags?: string[];
  version: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // FIX: Added missing properties
  category: string;
  uploadedAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: Address;
  contactPerson: string;
  companyId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // FIX: Added missing properties
  contactEmail: string;
  contactPhone: string;
  billingAddress: string;
  paymentTerms: string;
}

// === FOREMAN DASHBOARD ENHANCEMENTS ===
export interface SiteUpdate {
  id: string;
  projectId: string;
  userId: string;
  message: string;
  images?: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
  timestamp: string;
  type: 'PROGRESS' | 'ISSUE' | 'MILESTONE' | 'GENERAL';
  // FIX: Added missing properties to match usage
  text: string;
  imageUrl?: string;
}

export interface ProjectMessage {
  id: string;
  projectId: string;
  senderId: string;
  message: string;
  type: 'BROADCAST' | 'ANNOUNCEMENT' | 'ALERT';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  targetRoles?: Role[];
  readBy: string[];
  timestamp: string;
  // FIX: Added missing property
  content: string;
}

export interface Weather {
  temperature: number; // in Celsius
  condition: 'Sunny' | 'Cloudy' | 'Rain' | 'Storm';
  windSpeed: number; // in km/h
  icon: string; // emoji or identifier
}

// FIX: Added all missing types from across the application
export type View = 'dashboard' | 'my-day' | 'foreman-dashboard' | 'principal-dashboard' | 'projects' | 'project-detail' | 'all-tasks' | 'map' | 'time' | 'timesheets' | 'documents' | 'safety' | 'financials' | 'users' | 'equipment' | 'templates' | 'tools' | 'audit-log' | 'settings' | 'chat' | 'clients' | 'invoices';

export interface Quote {
    id: string;
    clientId: string;
    projectId: string;
    status: QuoteStatus;
}

export interface Grant {
    id: string;
    name: string;
    agency: string;
    amount: string;
    description: string;
    url: string;
}

export interface RiskAnalysis {
    summary: string;
    identifiedRisks: {
        severity: 'Low' | 'Medium' | 'High';
        description: string;
        recommendation: string;
    }[];
}

export interface BidPackage {
    summary: string;
    coverLetter: string;
    checklist: string[];
}

export interface SystemHealth {
    status: 'OK' | 'DEGRADED' | 'DOWN';
    message: string;
}

export interface UsageMetric {
    name: string;
    value: number;
    unit: string;
}

export interface ProjectAssignment {
    userId: string;
    projectId: string;
}

export interface ResourceAssignment {
    id: string;
    resourceType: 'user' | 'equipment';
    resourceId: string;
    projectId: string;
    startDate: string;
    endDate: string;
}

export interface FinancialKPIs {
    profitability: number;
    projectMargin: number;
    cashFlow: number;
    currency: string;
}

export interface MonthlyFinancials {
    month: string;
    revenue: number;
    profit: number;
}

export interface CostBreakdown {
    category: string;
    amount: number;
}

export type OperationalAlertSeverity = 'info' | 'warning' | 'critical';

export interface OperationalAlert {
    id: string;
    severity: OperationalAlertSeverity;
    message: string;
}

export interface OperationalInsights {
    updatedAt: string;
    safety: {
        openIncidents: number;
        highSeverity: number;
        daysSinceLastIncident: number | null;
    };
    workforce: {
        complianceRate: number;
        approvedThisWeek: number;
        overtimeHours: number;
        averageHours: number;
        activeTimesheets: number;
        pendingApprovals: number;
    };
    schedule: {
        atRiskProjects: number;
        overdueProjects: number;
        tasksDueSoon: number;
        overdueTasks: number;
        tasksInProgress: number;
        averageProgress: number;
    };
    financial: {
        currency: string;
        approvedExpensesThisMonth: number;
        burnRatePerActiveProject: number;
        outstandingReceivables: number;
    };
    alerts: OperationalAlert[];
}

export interface ProjectTemplate {
    id: string;
    name: string;
    description: string;
    templateTasks: { text: string }[];
    documentCategories: string[];
}

export interface AuditLog {
    id: string;
    actorId: string;
    action: string;
    target?: {
        type: string;
        id: string;
        name: string;
    };
    timestamp: string;
}

export interface Conversation {
    id: string;
    participantIds: string[];
    lastMessage: Message | null;
}

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    timestamp: Date;
    isRead: boolean;
    isSending?: boolean;
    error?: string;
}

export interface WhiteboardNote {
    id: string;
    projectId: string;
    content: string;
    position: { x: number; y: number };
    size: { width: number, height: number };
    color: 'yellow' | 'green' | 'blue';
}

export enum ExpenseCategory {
    MATERIALS = 'MATERIALS',
    LABOR = 'LABOR',
    EQUIPMENT = 'EQUIPMENT',
    SUBCONTRACTOR = 'SUBCONTRACTOR',
    PERMITS = 'PERMITS',
    OTHER = 'OTHER',
}
export type LineItem = InvoiceLineItem;
export type Payment = InvoicePayment;

// FIX: Added RolePermissions constant for hasPermission check
export const RolePermissions: Record<Role, Set<Permission>> = {
    [Role.OWNER]: new Set(Object.values(Permission)),
    [Role.ADMIN]: new Set([
        Permission.VIEW_ALL_PROJECTS, Permission.CREATE_PROJECT, Permission.MANAGE_PROJECT_DETAILS, Permission.VIEW_ALL_TASKS, Permission.MANAGE_ALL_TASKS,
        Permission.VIEW_ALL_TIMESHEETS, Permission.MANAGE_TIMESHEETS, Permission.UPLOAD_DOCUMENTS, Permission.VIEW_DOCUMENTS, Permission.VIEW_SAFETY_REPORTS,
        Permission.MANAGE_SAFETY_REPORTS, Permission.VIEW_FINANCES, Permission.MANAGE_FINANCES, Permission.VIEW_TEAM, Permission.MANAGE_TEAM,
        Permission.MANAGE_EQUIPMENT, Permission.VIEW_AUDIT_LOG, Permission.SEND_DIRECT_MESSAGE, Permission.ACCESS_ALL_TOOLS, Permission.SUBMIT_EXPENSE,
        Permission.MANAGE_PROJECT_TEMPLATES
    ]),
    [Role.PROJECT_MANAGER]: new Set([
        Permission.VIEW_ALL_PROJECTS, Permission.MANAGE_PROJECT_DETAILS, Permission.VIEW_ALL_TASKS, Permission.MANAGE_ALL_TASKS, Permission.VIEW_ALL_TIMESHEETS,
        Permission.MANAGE_TIMESHEETS, Permission.UPLOAD_DOCUMENTS, Permission.VIEW_DOCUMENTS, Permission.VIEW_SAFETY_REPORTS, Permission.VIEW_FINANCES,
        Permission.VIEW_TEAM, Permission.MANAGE_EQUIPMENT, Permission.SEND_DIRECT_MESSAGE, Permission.SUBMIT_EXPENSE
    ]),
    [Role.FOREMAN]: new Set([
        Permission.VIEW_ASSIGNED_PROJECTS, Permission.SUBMIT_TIMESHEET, Permission.UPLOAD_DOCUMENTS, Permission.VIEW_DOCUMENTS,
        Permission.SUBMIT_SAFETY_REPORT, Permission.VIEW_SAFETY_REPORTS, Permission.SEND_DIRECT_MESSAGE, Permission.SUBMIT_EXPENSE
    ]),
    [Role.OPERATIVE]: new Set([
        Permission.VIEW_ASSIGNED_PROJECTS, Permission.SUBMIT_TIMESHEET, Permission.VIEW_DOCUMENTS, Permission.SUBMIT_SAFETY_REPORT, Permission.SUBMIT_EXPENSE
    ]),
    [Role.CLIENT]: new Set([Permission.VIEW_ASSIGNED_PROJECTS, Permission.VIEW_DOCUMENTS]),
    [Role.PRINCIPAL_ADMIN]: new Set(Object.values(Permission)),
};