// === AUTHENTICATION & USER MANAGEMENT TYPES ===
export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  company: Company | null;
  availableCompanies: CompanyAccessSummary[];
  activeCompanyId: string | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  tenant?: string;
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
  companySelection?: 'create' | 'join';
  companyName?: string;
  companyType?: CompanyType;
  companyEmail?: string;
  companyPhone?: string;
  companyWebsite?: string;
  companyIndustry?: string;
  role?: Role;
  termsAccepted?: boolean;
}

export type SocialProvider = 'google' | 'facebook';

export interface AuthSuccessPayload {
  token: string;
  refreshToken: string;
  expiresAt?: string;
  refreshExpiresAt?: string;
  provider?: string;
  user: User;
  company: Company;
  availableCompanies?: CompanyAccessSummary[];
  activeCompanyId?: string;
}

export interface SocialAuthRequest extends Partial<RegisterCredentials> {
  provider: SocialProvider;
  token: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export type RegistrationPayload = Partial<RegisterCredentials & {
  username?: string;
  tenant?: string;
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

export interface CompanyAccessSummary {
  id: string;
  name: string;
  status: string;
  subscriptionPlan: SubscriptionPlan | string;
  membershipRole: Role | 'PLATFORM_ADMIN';
  membershipType: 'primary' | 'platform' | 'delegated';
  isPlatform: boolean;
  isPrimary: boolean;
}

export interface TenantSummary {
  id: string;
  name: string;
  industry: string;
  status: string;
  subscriptionPlan: SubscriptionPlan | string;
  totalUsers: number;
  totalProjects: number;
  activeProjects: number;
  totalRevenue: number;
  outstandingBalance: number;
  overdueInvoices: number;
  collectedRevenue: number;
  createdAt: string;
  updatedAt: string;
}

export interface TenantDirectoryResponse {
  source: 'backend' | 'mock';
  generatedAt: string;
  tenants: TenantSummary[];
}

export interface PlatformOwnerSummary {
  username: string;
  email: string;
  name?: string;
}

export interface PlatformMetricsResponse {
  source: 'backend' | 'mock';
  generatedAt: string;
  metrics: UsageMetric[];
  platformOwner: PlatformOwnerSummary | null;
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
  username?: string;
  password?: string;
  passwordHash?: string;
  passwordSalt?: string;
  mfaEnabled?: boolean;
  phone?: string;
  avatar?: string;
  role: Role; // FIX: Changed from UserRole to Role enum
  permissions: Permission[];
  companyId: string;
  primaryCompanyId?: string;
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
  authProvider?: SocialProvider | 'local';
  // Additional properties for compatibility
  name?: string; // Computed from firstName + lastName or provided directly
  location?: string; // User's location/address
}

export interface SwitchCompanyResponse {
  user: User;
  company: Company;
  availableCompanies: CompanyAccessSummary[];
  activeCompanyId: string;
}

export interface TenantDirectoryContext {
  activeCompanyId: string;
  companies: CompanyAccessSummary[];
}

export interface SessionSnapshot {
  user: User;
  company: Company;
  availableCompanies: CompanyAccessSummary[];
  activeCompanyId: string;
  provider?: string;
  expiresAt?: string;
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
  MANAGE_PROJECTS = 'MANAGE_PROJECTS', // Added for backward compatibility
  VIEW_ALL_TASKS = 'VIEW_ALL_TASKS',
  MANAGE_TASKS = 'MANAGE_TASKS', // Added for backward compatibility
  MANAGE_ALL_TASKS = 'MANAGE_ALL_TASKS',
  SUBMIT_TIMESHEET = 'SUBMIT_TIMESHEET',
  VIEW_ALL_TIMESHEETS = 'VIEW_ALL_TIMESHEETS',
  MANAGE_TIMESHEETS = 'MANAGE_TIMESHEETS',
  UPLOAD_DOCUMENTS = 'UPLOAD_DOCUMENTS',
  VIEW_DOCUMENTS = 'VIEW_DOCUMENTS',
  VIEW_DASHBOARD = 'VIEW_DASHBOARD', // Added
  EDIT_PROJECTS = 'EDIT_PROJECTS', // Added
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
  URGENT = 'URGENT',
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
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
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
    city?: string;
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
  milestones?: ProjectMilestone[];
  risks?: ProjectRisk[];
  workforce?: WorkforceAllocation[];
  color?: string;
  owner?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  tags?: string[];
  locationAddress?: string;
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
  // FIX: Added missing properties for ProjectInsight
  risks?: Array<{
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    mitigation?: string;
  }>;
  recommendations?: Array<{
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    category?: string;
  }>;
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
// FIX: Added prioritized task tracking
export interface PrioritizedTasksResponse {
  prioritizedTaskIds: string[];
  tasks: Todo[];
}

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
  subTasks?: Todo[];
  startDate?: string;
}
export type Task = Todo; // Alias for backward compatibility if needed
export type TaskStatus = TodoStatus;
export type TaskPriority = TodoPriority;

export type ProjectRiskLevel = 'HEALTHY' | 'WATCH' | 'AT_RISK';

export interface DashboardSummaryStats {
  overdueTasks: number;
  openIncidents: number;
  outstandingInvoices: number;
  averageTaskProgress: number;
}

export interface DashboardSummaryDeadline {
  id: string;
  title: string;
  dueDate: string;
  projectId: string;
  projectName: string;
  assigneeId?: string;
  assigneeName?: string;
  priority: TodoPriority;
  status: TodoStatus;
}

export interface DashboardSummaryProject {
  id: string;
  name: string;
  riskLevel: ProjectRiskLevel;
  progress: number;
  budgetUtilisation: number;
  overdueTasks: number;
  openIncidents: number;
}

export interface DashboardSummaryWorkforce {
  available: number;
  onProject: number;
  onLeave: number;
  utilisationRate: number;
}

export interface DashboardSummary {
  totalProjects: number;
  activeProjects: number;
  totalRevenue: number;
  totalExpenses: number;
  tenants?: number;
  source?: string;
  generatedAt?: string;
  stats?: DashboardSummaryStats;
  workforce?: DashboardSummaryWorkforce;
  upcomingDeadlines?: DashboardSummaryDeadline[];
  atRiskProjects?: DashboardSummaryProject[];
}

export interface Expense {
  vendor?: string;
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string | Date; // FIX: Allow both string and Date
  status: ExpenseStatus;
  projectId?: string;
  companyId: string;
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  currency?: string; // FIX: Added currency field
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
  payments?: Array<{ amount: number; date: Date }>;
  paidAmount?: number;
  total?: number;
  issueDate?: string | Date;
  number?: string;
  id: string;
  invoiceNumber: string;
  clientId: string;
  projectId?: string;
  companyId: string;
  amount: number;
  date: string | Date; // FIX: Allow both string and Date
  dueDate: string | Date; // FIX: Allow both string and Date
  dueAt?: string | Date;
  status: InvoiceStatus;
  items: InvoiceLineItem[];
  lineItems?: InvoiceLineItem[];
  notes?: string;
  createdBy: string;
  createdAt: string;
  subtotal?: number;
  taxRate?: number;
  taxAmount?: number;
  retentionRate?: number;
  retentionAmount?: number;
  amountPaid?: number;
  balance?: number;
  paidDate?: string | Date; // FIX: Added paidDate field
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

export interface InvoiceStatusSummary {
  status: InvoiceStatus;
  invoiceCount: number;
  totalBilled: number;
  outstandingBalance: number;
}

export interface InvoiceCashFlowBucket {
  count: number;
  total: number;
  averageDays?: number;
}

export interface InvoiceCashFlowSnapshot {
  upcomingDue: InvoiceCashFlowBucket;
  overdue: InvoiceCashFlowBucket;
  paidLast30Days: InvoiceCashFlowBucket;
  expectedThisMonth: InvoiceCashFlowBucket;
}

export interface TopOutstandingClientInsight {
  clientId: string;
  clientName: string;
  outstanding: number;
  invoices: number;
  lastInvoiceDueAt?: string;
}

export interface InvoiceTotalsInsight {
  totalBilled: number;
  totalCollected: number;
  outstandingBalance: number;
  overdueBalance: number;
  draftCount: number;
  collectionRate: number;
}

export interface InvoiceInsights {
  updatedAt: string;
  statusSummary: InvoiceStatusSummary[];
  cashFlow: InvoiceCashFlowSnapshot;
  topOutstandingClients: TopOutstandingClientInsight[];
  totals: InvoiceTotalsInsight;
}

export interface ClientAtRiskInsight {
  clientId: string;
  clientName: string;
  outstanding: number;
  unpaidInvoices: number;
  lastInvoiceDueAt?: string;
  lastPaymentAt?: string;
}

export interface ClientRevenueInsight {
  clientId: string;
  clientName: string;
  totalPaid: number;
}

export interface ClientInsights {
  updatedAt: string;
  totalClients: number;
  activeClients: number;
  dormantClients: number;
  newThisQuarter: number;
  atRiskClients: ClientAtRiskInsight[];
  topRevenueClients: ClientRevenueInsight[];
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
  companyId?: string;
  date: string;
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
  description?: string;
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

export interface DashboardSnapshotMetadata {
    source: 'mock' | 'backend';
    generatedAt: string;
    usedFallback: boolean;
    projectCount?: number;
    fallbackReason?: string;
    [key: string]: unknown;
}

export interface DashboardSnapshot {
    projects: Project[];
    team: User[];
    equipment: Equipment[];
    tasks: Todo[];
    activityLog: AuditLog[];
    operationalInsights: OperationalInsights | null;
    incidents: SafetyIncident[];
    expenses: Expense[];
    portfolioSummary: ProjectPortfolioSummary | null;
    metadata: DashboardSnapshotMetadata;
}

export interface BackendInteractionEvent {
    id?: string;
    type: string;
    userId?: string;
    companyId?: string;
    context?: Record<string, unknown>;
    createdAt?: string;
    metadata?: Record<string, unknown>;
}

export interface BackendConnectionState {
    mode: 'mock' | 'backend';
    baseUrl: string | null;
    online: boolean;
    pendingMutations: number;
    lastSync: string | null;
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

// === MULTIMODAL AI SYSTEM TYPES ===

export type MediaType = 'text' | 'image' | 'audio' | 'video' | 'document' | 'mixed';

export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export type AIProvider = 'gemini' | 'openai' | 'anthropic' | 'java-enterprise';

export interface ContentMetadata {
  filename?: string;
  fileSize?: number;
  mimeType?: string;
  dimensions?: { width: number; height: number };
  duration?: number;
  source: 'upload' | 'url' | 'generated';
  originalUrl?: string;
  encoding?: string;
  bitrate?: number;
  sampleRate?: number;
  channels?: number;
  // FIX: Added missing textContent property
  textContent?: string;
}

export interface ProcessingResults {
  aiProvider: AIProvider;
  modelVersion: string;
  confidence: number;
  processingTime: number;
  textAnalysis?: TextAnalysisResult;
  imageAnalysis?: ImageAnalysisResult;
  audioAnalysis?: AudioAnalysisResult;
  videoAnalysis?: VideoAnalysisResult;
  documentAnalysis?: DocumentAnalysisResult;
  crossModalAnalysis?: CrossModalAnalysisResult;
}

export interface TextAnalysisResult {
  extractedText: string;
  language: string;
  sentiment: {
    score: number;
    label: 'positive' | 'negative' | 'neutral';
    confidence: number;
  };
  entities: Array<{
    text: string;
    type: string;
    confidence: number;
  }>;
  keywords: string[];
  summary?: string;
  topics?: string[];
}

export interface ImageAnalysisResult {
  objects: Array<{
    name: string;
    confidence: number;
    boundingBox: { x: number; y: number; width: number; height: number };
  }>;
  faces: Array<{
    confidence: number;
    boundingBox: { x: number; y: number; width: number; height: number };
    emotions?: Array<{ emotion: string; confidence: number }>;
    age?: number;
    gender?: string;
  }>;
  scenes: Array<{ name: string; confidence: number }>;
  colors: Array<{
    hex: string;
    percentage: number;
    name: string;
  }>;
  safetyLabels: Array<{
    name: string;
    confidence: number;
    severity: 'low' | 'medium' | 'high';
  }>;
  description: string;
  tags: string[];
  textInImage?: string;
  // FIX: Added text property for multimodal viewer
  text?: string;
}

export interface AudioAnalysisResult {
  transcription: string;
  language: string;
  confidence: number;
  speakers?: Array<{
    id: string;
    segments: Array<{ start: number; end: number; text: string }>;
  }>;
  emotions?: Array<{
    emotion: string;
    confidence: number;
    timestamp: number;
  }>;
  musicAnalysis?: {
    tempo: number;
    key: string;
    genre: string;
    instruments: string[];
  };
  noiseLevel: number;
  qualityScore: number;
}

export interface VideoAnalysisResult {
  scenes: Array<{
    start: number;
    end: number;
    description: string;
    confidence: number;
  }>;
  objects: Array<{
    name: string;
    confidence: number;
    timestamps: Array<{ start: number; end: number }>;
  }>;
  faces: Array<{
    confidence: number;
    timestamps: Array<{ start: number; end: number }>;
  }>;
  activities: Array<{
    name: string;
    confidence: number;
    timestamps: Array<{ start: number; end: number }>;
  }>;
  audioTrack?: AudioAnalysisResult;
  thumbnail?: string;
  keyFrames: Array<{ timestamp: number; imageUrl: string }>;
}

export interface DocumentAnalysisResult {
  extractedText: string;
  language: string;
  pageCount: number;
  structure: {
    headings: Array<{ level: number; text: string; page: number }>;
    paragraphs: Array<{ text: string; page: number }>;
    tables: Array<{ data: string[][]; page: number }>;
    images: Array<{ description: string; page: number }>;
  };
  metadata: {
    title?: string;
    author?: string;
    createdDate?: string;
    modifiedDate?: string;
    subject?: string;
    keywords?: string[];
  };
  summary: string;
  keyPoints: string[];
}

export interface CrossModalAnalysisResult {
  coherenceScore: number;
  complementarity: number;
  redundancy: number;
  mainTheme: string;
  insights: Array<{
    type: 'correlation' | 'contradiction' | 'enhancement';
    description: string;
    confidence: number;
  }>;
  recommendations: Array<{
    action: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

export interface MultimodalContent {
  id: string;
  type: MediaType;
  status: ProcessingStatus;
  createdAt: string;
  updatedAt: string;
  userId: string;
  projectId?: string;
  metadata: ContentMetadata;
  processingResults?: ProcessingResults;
  tags?: string[];
  description?: string;
}

export interface ProcessingJob {
  id: string;
  contentId: string;
  type: 'analysis' | 'transcription' | 'translation' | 'enhancement';
  status: ProcessingStatus;
  progress: number;
  startedAt: string;
  completedAt?: string;
  error?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface MultimodalSearchQuery {
  text?: string;
  filters: {
    mediaTypes?: MediaType[];
    dateRange?: {
      start: string;
      end: string;
    };
    minConfidence?: number;
    tags?: string[];
    userId?: string;
    projectId?: string;
  };
  sortBy?: 'relevance' | 'date' | 'confidence';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface MultimodalSearchResult {
  content: MultimodalContent;
  relevanceScore: number;
  matchedFields: string[];
  snippet?: string;
  highlights?: string[];
  score?: number;
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

// Additional Authentication Types
export interface LoginResult {
  success: boolean;
  token?: string;
  refreshToken?: string;
  user?: User;
  company?: Company;
  error?: string;
  mfaRequired?: boolean;
  userId?: string;
}

export interface AuthenticatedSession {
  token: string;
  refreshToken: string;
  user: User;
  company: Company;
}

export interface MultimodalConfig {
  apiKey: string;
  provider: AIProvider;
  maxFileSize: number;
  supportedFormats: string[];
  processingTimeout: number;
  cacheEnabled: boolean;
  cacheTtl: number;
}

// Additional types for missing properties
export interface ProjectMilestone {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  dueDate: string;
  completedDate?: string;
  status: 'pending' | 'completed' | 'overdue';
  dependencies?: string[];
  date?: string; // FIX: Added for compatibility
  completed?: boolean; // FIX: Added for compatibility
}

export interface ProjectRisk {
  id: string;
  projectId: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
  impact: string;
  mitigation?: string;
  status: 'identified' | 'mitigating' | 'resolved';
  identifiedDate: string;
  resolvedDate?: string;
}

export interface WorkforceAllocation {
  id: string;
  projectId: string;
  userId: string;
  role: string;
  allocatedHours: number;
  actualHours?: number;
  startDate: string;
  endDate?: string;
}

export interface SafetyRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  status: 'pending' | 'implemented' | 'dismissed';
  createdAt: string;
  implementedAt?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  companyId: string;
  metadata?: Record<string, unknown>;
}

// Extended DashboardSummary interface
export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
}

export interface WorkforceStats {
  total: number;
  active: number;
  available: number;
  onLeave: number;
}
