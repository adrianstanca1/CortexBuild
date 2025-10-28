// full contents of types.ts

export type View =
  | 'dashboard'
  | 'my-day'
  | 'projects'
  | 'documents'
  | 'safety'
  | 'timesheets'
  | 'time'
  | 'settings'
  | 'users'
  | 'chat'
  | 'tools'
  | 'financials'
  | 'equipment'
  | 'templates'
  | 'all-tasks'
  | 'map'
  | 'principal-dashboard';

export enum Role {
  PRINCIPAL_ADMIN = 'Principal Admin',
  ADMIN = 'Company Admin',
  PM = 'Project Manager',
  FOREMAN = 'Foreman',
  OPERATIVE = 'Operative',
}

export enum UserStatus {
    ON_SITE = 'On Site',
    ON_BREAK = 'On Break',
    OFF_SITE = 'Off Site',
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  companyId: number | null;
  avatarUrl?: string;
  phone?: string;
  status?: UserStatus;
}

export interface Company {
  id: number;
  name: string;
  status: 'Active' | 'Suspended' | 'Pending';
  subscriptionPlan: 'Basic' | 'Pro' | 'Enterprise';
  storageUsageGB: number;
}

export interface Location {
  address: string;
  lat: number;
  lng: number;
}

export interface Project {
  id: number;
  companyId: number;
  name: string;
  location: Location;
  budget: number;
  actualCost: number;
  startDate: Date;
  status: 'Active' | 'On Hold' | 'Completed';
  imageUrl: string;
  projectType: string;
  workClassification: string;
  geofenceRadius?: number;
}

export enum TodoStatus {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  DONE = 'Done',
}

export enum TodoPriority {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low',
}

export interface SubTask {
  id: number;
  text: string;
  isCompleted: boolean;
}

export interface Comment {
  id: number;
  text: string;
  authorId: number;
  timestamp: Date;
}

export interface Todo {
  id: number | string;
  text: string;
  projectId: number;
  assigneeId: number | null;
  creatorId: number;
  status: TodoStatus;
  priority: TodoPriority;
  dueDate: Date | null;
  subTasks?: SubTask[];
  comments?: Comment[];
  reminderAt?: Date;
  completedBy?: number;
  completedAt?: Date;
}

export enum DocumentStatus {
  APPROVED = 'Approved',
  UPLOADING = 'Uploading',
  SCANNING = 'Scanning',
  QUARANTINED = 'Quarantined',
}

export enum DocumentCategory {
  PLANS = 'Plans',
  PERMITS = 'Permits',
  INVOICES = 'Invoices',
  REPORTS = 'Reports',
  PHOTOS = 'Photos',
}

export interface Document {
  id: number;
  name: string;
  projectId: number;
  category: DocumentCategory;
  status: DocumentStatus;
  url: string;
  uploadedAt: Date;
}

export enum IncidentSeverity {
  CRITICAL = 'Critical',
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low',
}

export enum IncidentStatus {
  REPORTED = 'Reported',
  UNDER_REVIEW = 'Under Review',
  RESOLVED = 'Resolved',
}

export interface SafetyIncident {
  id: number;
  description: string;
  projectId: number;
  reporterId: number;
  timestamp: Date;
  severity: IncidentSeverity;
  status: IncidentStatus;
}

export enum TimesheetStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  FLAGGED = 'Flagged',
}

export interface Timesheet {
  id: number;
  userId: number;
  projectId: number;
  clockIn: Date;
  clockOut: Date | null;
  status: TimesheetStatus;
  notes?: string;
  rejectionReason?: string;
}

export enum EquipmentStatus {
    AVAILABLE = 'Available',
    IN_USE = 'In Use',
    MAINTENANCE = 'Maintenance',
}

export interface Equipment {
    id: number;
    companyId: number;
    name: string;
    type: string;
    status: EquipmentStatus;
    projectId: number | null;
}

export interface ProjectAssignment {
  id: number;
  userId: number;
  projectId: number;
}

export interface ResourceAssignment {
    id: number;
    companyId: number;
    projectId: number;
    resourceId: number;
    resourceType: 'user' | 'equipment';
    startDate: Date;
    endDate: Date;
}

export interface ChatMessage {
    id: number;
    conversationId: number;
    senderId: number;
    content: string;
    timestamp: Date;
    isRead: boolean;
}

export interface Conversation {
    id: number;
    participants: number[];
    messages: ChatMessage[];
    lastMessage: ChatMessage | null;
}

export interface AISearchResult {
    summary: string;
    sources: {
        documentId: number;
        snippet: string;
    }[];
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
    costs: number;
    profit: number;
}

export interface CostBreakdown {
    category: string;
    amount: number;
}


export interface NotificationPreferences {
    projectUpdates: boolean;
    timeReminders: boolean;
    photoRequirements: boolean;
}

export interface LocationPreferences {
    backgroundTracking: boolean;
    gpsAccuracy: 'standard' | 'high';
}

export interface CompanySettings {
    companyId: number;
    theme: 'light' | 'dark';
    notificationPreferences: NotificationPreferences;
    locationPreferences: LocationPreferences;
}

export interface Grant {
    id: number;
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

export interface Client {
    id: number;
    name: string;
    companyId: number;
    createdAt: Date;
    contactEmail: string;
    contactPhone: string;
}

export enum InvoiceStatus {
    PAID = 'Paid',
    SENT = 'Sent',
    OVERDUE = 'Overdue',
    DRAFT = 'Draft',
    VOID = 'Void',
}

export interface Invoice {
    id: number;
    clientId: number;
    projectId: number;
    status: InvoiceStatus;
    dueAt: Date;
    amountDue: number;
    total: number;
}

export enum QuoteStatus {
    ACCEPTED = 'Accepted',
    SENT = 'Sent',
    REJECTED = 'Rejected',
    DRAFT = 'Draft',
}

export interface Quote {
    id: number;
    clientId: number;
    projectId: number;
    status: QuoteStatus;
    validUntil: Date;
    total: number;
}


export interface ProjectTemplate {
    id: number;
    companyId: number;
    name: string;
    description: string;
    templateTasks: Partial<Todo>[];
    documentCategories: DocumentCategory[];
}

export interface AuditLog {
    id: number;
    actorId: number;
    action: string;
    target?: {
        type: string;
        id: number | string;
        name: string;
    };
    timestamp: Date;
}


export interface PendingApproval { id: number; type: 'Timesheet' | 'Invoice'; description: string; }
export interface SystemHealth { status: 'OK' | 'DEGRADED' | 'DOWN'; message: string; }
export interface UsageMetric { name: string; value: number; unit: string; }
export interface PlatformSettings { maintenanceMode: boolean; }


export enum Permission {
    VIEW_DASHBOARD = 'VIEW_DASHBOARD',
    VIEW_ALL_PROJECTS = 'VIEW_ALL_PROJECTS',
    VIEW_ASSIGNED_PROJECTS = 'VIEW_ASSIGNED_PROJECTS',
    MANAGE_PROJECTS = 'MANAGE_PROJECTS',
    VIEW_ALL_TASKS = 'VIEW_ALL_TASKS',
    MANAGE_TASKS = 'MANAGE_TASKS',
    SUBMIT_TIMESHEET = 'SUBMIT_TIMESHEET',
    VIEW_OWN_TIMESHEETS = 'VIEW_OWN_TIMESHEETS',
    MANAGE_TIMESHEETS = 'MANAGE_TIMESHEETS',
    VIEW_ALL_TIMESHEETS = 'VIEW_ALL_TIMESHEETS',
    VIEW_DOCUMENTS = 'VIEW_DOCUMENTS',
    UPLOAD_DOCUMENTS = 'UPLOAD_DOCUMENTS',
    MANAGE_DOCUMENTS = 'MANAGE_DOCUMENTS',
    VIEW_SAFETY_REPORTS = 'VIEW_SAFETY_REPORTS',
    SUBMIT_SAFETY_REPORT = 'SUBMIT_SAFETY_REPORT',
    MANAGE_SAFETY_REPORTS = 'MANAGE_SAFETY_REports',
    VIEW_FINANCES = 'VIEW_FINANCES',
    MANAGE_FINANCES = 'MANAGE_FINANCES',
    VIEW_TEAM = 'VIEW_TEAM',
    MANAGE_TEAM = 'MANAGE_TEAM',
    MANAGE_EQUIPMENT = 'MANAGE_EQUIPMENT',
    MANAGE_PROJECT_TEMPLATES = 'MANAGE_PROJECT_TEMPLATES',
    ACCESS_ALL_TOOLS = 'ACCESS_ALL_TOOLS',
    SEND_DIRECT_MESSAGE = 'SEND_DIRECT_MESSAGE',
}

export interface ProjectHealth {
    status: 'Good' | 'Needs Attention' | 'At Risk';
    summary: string;
}

export const RolePermissions: Record<Role, Set<Permission>> = {
    [Role.PRINCIPAL_ADMIN]: new Set(Object.values(Permission)), // Has all permissions implicitly
    [Role.ADMIN]: new Set([
        Permission.VIEW_DASHBOARD,
        Permission.VIEW_ALL_PROJECTS,
        Permission.MANAGE_PROJECTS,
        Permission.VIEW_ALL_TASKS,
        Permission.MANAGE_TASKS,
        Permission.MANAGE_TIMESHEETS,
        Permission.VIEW_ALL_TIMESHEETS,
        Permission.MANAGE_DOCUMENTS,
        Permission.VIEW_DOCUMENTS,
        Permission.UPLOAD_DOCUMENTS,
        Permission.MANAGE_SAFETY_REPORTS,
        Permission.VIEW_SAFETY_REPORTS,
        Permission.SUBMIT_SAFETY_REPORT,
        Permission.VIEW_FINANCES,
        Permission.MANAGE_FINANCES,
        Permission.VIEW_TEAM,
        Permission.MANAGE_TEAM,
        Permission.MANAGE_EQUIPMENT,
        Permission.MANAGE_PROJECT_TEMPLATES,
        Permission.ACCESS_ALL_TOOLS,
        Permission.SEND_DIRECT_MESSAGE,
    ]),
    [Role.PM]: new Set([
        Permission.VIEW_DASHBOARD,
        Permission.VIEW_ASSIGNED_PROJECTS,
        Permission.MANAGE_PROJECTS, // Can manage their own projects
        Permission.VIEW_ALL_TASKS, // Within their projects
        Permission.MANAGE_TASKS,
        Permission.MANAGE_TIMESHEETS, // For their project teams
        Permission.VIEW_ALL_TIMESHEETS, // For their projects
        Permission.VIEW_DOCUMENTS,
        Permission.UPLOAD_DOCUMENTS,
        Permission.VIEW_SAFETY_REPORTS,
        Permission.SUBMIT_SAFETY_REPORT,
        Permission.VIEW_TEAM,
        Permission.ACCESS_ALL_TOOLS,
        Permission.SEND_DIRECT_MESSAGE,
    ]),
    [Role.FOREMAN]: new Set([
        Permission.VIEW_ASSIGNED_PROJECTS,
        Permission.VIEW_ALL_TASKS,
        Permission.MANAGE_TASKS, // Can manage tasks for their crew
        Permission.SUBMIT_TIMESHEET,
        Permission.VIEW_OWN_TIMESHEETS,
        Permission.VIEW_DOCUMENTS,
        Permission.UPLOAD_DOCUMENTS,
        Permission.SUBMIT_SAFETY_REPORT,
        Permission.VIEW_SAFETY_REPORTS,
        Permission.VIEW_TEAM,
        Permission.SEND_DIRECT_MESSAGE,
    ]),
    [Role.OPERATIVE]: new Set([
        Permission.VIEW_ASSIGNED_PROJECTS,
        Permission.SUBMIT_TIMESHEET,
        Permission.VIEW_OWN_TIMESHEETS,
        Permission.VIEW_DOCUMENTS,
        Permission.SUBMIT_SAFETY_REPORT,
        Permission.SEND_DIRECT_MESSAGE,
    ]),
};