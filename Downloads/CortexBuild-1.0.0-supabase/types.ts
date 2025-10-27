
// Fix: Broke circular dependency by defining UserRole, PermissionSubject, and PermissionAction types directly in this file.
export type UserRole = 
    | 'super_admin'
    | 'developer'
    | 'company_admin'
    | 'Project Manager'
    | 'Foreman'
    | 'Safety Officer'
    | 'Accounting Clerk'
    | 'operative';

export type PermissionSubject = 
    | 'task'
    | 'rfi'
    | 'punchListItem'
    | 'dayworkSheet'
    | 'drawing'
    | 'document'
    | 'dailyLog'
    | 'photo'
    | 'timeEntry'
    | 'accounting'
    | 'user';

export type PermissionAction = 
    | 'create'
    | 'read'
    | 'update'
    | 'delete'
    | 'approve';


export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar: string;
    companyId: string;
}

export interface Company {
    id: string;
    name: string;
}

export interface ProjectSnapshot {
    openRFIs: number;
    overdueTasks: number;
    pendingTMTickets: number;
    aiRiskLevel: string;
}

export interface ProjectContact {
    role: string;
    name: string;
}

export interface Project {
    id: string;
    companyId: string;
    name: string;
    location: string;
    image: string;
    description: string;
    contacts: ProjectContact[];
    snapshot: ProjectSnapshot;
    status?: string;
    startDate?: string;
    endDate?: string;
    budget?: number;
    spent?: number;
    projectManagerId?: string;
    createdAt?: string;
    updatedAt?: string;
}

export type Screen =
    | 'global-dashboard'
    | 'projects'
    | 'project-home'
    | 'my-day'
    | 'tasks'
    | 'my-tasks'
    | 'task-detail'
    | 'new-task'
    | 'daily-log'
    | 'photos'
    | 'rfis'
    | 'rfi-detail'
    | 'new-rfi'
    | 'punch-list'
    | 'punch-list-item-detail'
    | 'new-punch-list-item'
    | 'drawings'
    | 'plans'
    | 'daywork-sheets'
    | 'daywork-sheet-detail'
    | 'new-daywork-sheet'
    | 'documents'
    | 'delivery'
    | 'drawing-comparison'
    // Module Screens
    | 'accounting'
    | 'ai-tools'
    | 'document-management'
    | 'time-tracking'
    | 'project-operations'
    | 'financial-management'
    | 'business-development'
    | 'ai-agents-marketplace'
    | 'developer-dashboard'
    | 'automation-studio'
    | 'developer-console'
    | 'company-admin-dashboard'
    | 'super-admin-dashboard'
    | 'sdk-developer'
    | 'my-apps-desktop'
    // Admin screens
    | 'platform-admin'
    | 'admin-control-panel'
    // ML & Advanced Analytics
    | 'ml-analytics'
    | 'analytics-dashboard'
    // Notifications
    | 'notifications'
    // Advanced Features
    | 'advanced-search'
    | 'bulk-operations'
    | 'collaboration-hub'
    | 'advanced-analytics'
    // AI Features
    | 'ai-recommendations'
    | 'ai-workflow'
    | 'smart-task-assignment'
    // AI Marketplace Apps
    | 'quality-control-vision'
    | 'document-intelligence'
    | 'risk-assessment-ai'
    | 'cost-optimization'
    // Mobile & Integration Features
    | 'mobile-tools'
    | 'integrations'
    | 'photo-capture'
    | 'location-tracking'
    | 'calendar-sync'
    // Buildr-Inspired Enhanced Features
    | 'buildr-dashboard'
    | 'enhanced-project-management'
    | 'enhanced-team-collaboration'
    | 'enhanced-financial-tracking'
    | 'enhanced-mobile-experience'
    // Tool screens
    | 'placeholder-tool';


export interface Comment {
    id: string;
    author: string;
    timestamp: string;
    text: string;
    attachments?: Attachment[];
}

export interface TaskHistoryEvent {
    timestamp: string;
    author: string;
    change: string;
}

export interface Task {
    id: string;
    projectId: string;
    title: string;
    description: string;
    status: 'To Do' | 'In Progress' | 'Done';
    priority: 'High' | 'Medium' | 'Low';
    assignee?: string;
    targetRoles?: UserRole[];
    dueDate: string;
    completedAt?: string;
    createdBy?: string;
    dueDateNotified?: boolean;
    attachments: Attachment[];
    comments: Comment[];
    history?: TaskHistoryEvent[];
}

export interface Attachment {
    name: string;
    url: string;
}

export interface RFIHistoryEvent {
    timestamp: string;
    author: string;
    change: string;
}

export interface RFI {
    id: string;
    projectId: string;
    rfiNumber: string; // Groups all versions of an RFI
    version: number;
    subject: string;
    question: string;
    status: 'Open' | 'Closed' | 'Draft';
    assignee: string;
    dueDate: string;
    attachments: Attachment[];
    comments: Comment[];
    response?: string;
    answeredBy?: string;
    responseAttachments?: Attachment[];
    createdBy: string;
    dueDateNotified: boolean;
    history?: RFIHistoryEvent[];
}

export interface PunchListItemHistoryEvent {
    timestamp: string;
    author: string;
    change: string;
}

export interface PunchListItem {
    id: string;
    projectId: string;
    title: string;
    description: string;
    location: string;
    status: 'Open' | 'Ready for Review' | 'Closed';
    assignee: string;
    photos: string[];
    comments: Comment[];
    history?: PunchListItemHistoryEvent[];
}

export interface Drawing {
    id: string;
    projectId: string;
    drawingNumber: string;
    title: string;
    revision: number;
    date: string;
    url: string;
    tags: string[];
}

export interface Document {
    id: string;
    projectId: string;
    name: string;
    url: string;
    uploadedAt: string;
}

export interface SiteInstruction {
    id: string;
    text: string;
    author: string;
}

export interface DeliveryItem {
    id: string;
    name: string;
    ordered: number;
    received: number;
}

export interface DayworkSheetItem {
    id: string;
    description: string;
    quantity: number;
    unit: string;
    rate: number;
}

export interface DayworkSheet {
    id: string;
    projectId: string;
    ticketNumber: string;
    date: string;
    contractor: string;
    description: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    items: DayworkSheetItem[];
    approvedBy: string | null;
    approvedDate: string | null;
}

export interface NotificationLink {
    projectId?: string;
    screen: Screen;
    params?: any;
}

export interface Notification {
    id: string;
    userId: string;
    message: string;
    timestamp: string;
    read: boolean;
    link: NotificationLink;
}

export interface ActivityEvent {
    id: string;
    type: 'status_change' | 'comment' | 'photo' | 'log_submitted';
    author: string;
    description: string;
    timestamp: string;
    projectId: string;
    projectName: string;
    link: {
        screen: Screen;
        params: any;
    };
}

export interface AISuggestion {
    title: string;
    reason: string;
    action: {
        label: string;
        link: NotificationLink;
    }
}

export interface AIInsight {
    type: 'risk' | 'alert' | 'tip';
    title: string;
    message: string;
}

export interface AIFeedback {
    id: string;
    suggestionTitle: string;
    suggestionReason: string;
    feedback: 'up' | 'down';
    timestamp: string;
    userId: string;
}

export interface LogItem {
    id: number;
    item: string;
    quantity: string;
    unitCost: string;
}

export interface DailyLog {
    id: string;
    projectId: string;
    userId: string;
    date: string;
    submittedAt: string;
    weather: string;
    notes: string;
    photos: string[];
    labor: LogItem[];
    equipment: LogItem[];
    materials: LogItem[];
}

export interface TimeEntry {
    id: string;
    projectId: string;
    taskId: string;
    userId: string;
    startTime: string;
    endTime: string | null;
}

// AI Agents and Multi-Tenant Types
export interface AIAgent {
    id: string;
    name: string;
    description: string;
    category: 'safety' | 'quality' | 'productivity' | 'compliance' | 'analytics' | 'documentation' | 'communication' | 'planning';
    priceMonthly: number;
    priceYearly: number;
    features: string[];
    capabilities: string[];
    iconUrl?: string;
    bannerUrl?: string;
    isActive: boolean;
    isFeatured: boolean;
    minPlan: 'basic' | 'professional' | 'enterprise';
}

export interface CompanySubscription {
    id: string;
    companyId: string;
    agentId: string;
    status: 'active' | 'paused' | 'cancelled' | 'expired';
    billingCycle: 'monthly' | 'yearly';
    pricePaid: number;
    startedAt: string;
    expiresAt?: string;
    autoRenew: boolean;
    agent?: AIAgent;
}

export interface AgentUsageLog {
    id: string;
    companyId: string;
    agentId: string;
    userId: string;
    projectId?: string;
    action: string;
    inputData?: any;
    outputData?: any;
    tokensUsed: number;
    processingTimeMs: number;
    success: boolean;
    errorMessage?: string;
    createdAt: string;
}

// Multi-tenant context interface
export interface TenantContext {
    user: User;
    company: Company;
    subscriptions: CompanySubscription[];
    availableAgents: AIAgent[];
    hasAgentAccess: (agentId: string) => boolean;
}

// BuilderKit / AgentKit enriched types
export interface AgentCatalogItem {
    id: string;
    slug: string;
    name: string;
    description: string;
    icon: string;
    status: string;
    isGlobal: boolean;
    tags: string[];
    capabilities: Record<string, unknown>;
    config: Record<string, unknown>;
    metadata: Record<string, unknown>;
    developerId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface AgentInstance extends AgentCatalogItem {
    companyId: string;
}

export interface AgentExecution {
    id: string;
    agentId: string;
    companyId: string;
    triggeredBy?: string;
    input?: Record<string, unknown>;
    output?: Record<string, unknown>;
    status: 'running' | 'success' | 'failed';
    durationMs?: number;
    error?: string;
    startedAt: string;
    completedAt?: string;
}

export interface WorkflowTemplate {
    id: string;
    name: string;
    category: string;
    description: string;
    icon?: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    definition: Record<string, unknown>;
}

export interface WorkflowDefinition {
    trigger?: Record<string, unknown>;
    steps?: Array<Record<string, unknown>>;
}

export interface Workflow {
    id: string;
    companyId: string;
    name: string;
    description: string;
    version: string;
    definition: WorkflowDefinition;
    isActive: boolean;
    createdBy?: string;
    createdAt: string;
    updatedAt: string;
}

export interface WorkflowRunStep {
    id: string;
    runId: string;
    index: number;
    type: string;
    name: string;
    status: string;
    input?: Record<string, unknown>;
    output?: Record<string, unknown>;
    error?: string;
    startedAt: string;
    completedAt?: string;
}

export interface WorkflowRun {
    id: string;
    workflowId: string;
    companyId: string;
    status: 'running' | 'success' | 'failed';
    trigger?: Record<string, unknown>;
    input?: Record<string, unknown>;
    output?: Record<string, unknown>;
    error?: string;
    startedAt: string;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
    steps?: WorkflowRunStep[];
}

export interface AutomationRule {
    id: string;
    companyId: string;
    name: string;
    description: string;
    triggerType: string;
    triggerConfig: Record<string, unknown>;
    actionType: string;
    actionConfig: Record<string, unknown>;
    isActive: boolean;
    lastTriggeredAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface AutomationEvent {
    id: string;
    ruleId: string;
    status: string;
    payload: Record<string, unknown>;
    error?: string;
    createdAt: string;
}
