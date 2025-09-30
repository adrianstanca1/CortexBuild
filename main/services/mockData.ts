// full contents of services/mockData.ts

import {
  User, Project, Todo, Document, SafetyIncident, Timesheet, Equipment,
  Company, CompanySettings, Role, TodoStatus, TodoPriority, DocumentStatus,
  DocumentCategory, IncidentSeverity, IncidentStatus, TimesheetStatus, EquipmentStatus,
  UserStatus, ProjectAssignment, ResourceAssignment, Conversation, ChatMessage,
  Client, Invoice, InvoiceStatus, Quote, QuoteStatus, ProjectTemplate, AuditLog,
  Comment
} from '../types';

let users: User[] = [
  // Platform Admin
  { id: 1, name: 'Platform Admin', email: 'platform@asagents.com', role: Role.PRINCIPAL_ADMIN, companyId: 0 },
  // Company 1
  { id: 10, name: 'Alice Admin', email: 'alice@construction.com', role: Role.ADMIN, companyId: 1, avatarUrl: 'https://i.pravatar.cc/150?u=10' },
  { id: 11, name: 'Bob Manager', email: 'bob@construction.com', role: Role.PM, companyId: 1, avatarUrl: 'https://i.pravatar.cc/150?u=11' },
  { id: 12, name: 'Charlie Foreman', email: 'charlie@construction.com', role: Role.FOREMAN, companyId: 1, status: UserStatus.ON_SITE, avatarUrl: 'https://i.pravatar.cc/150?u=12' },
  { id: 13, name: 'Diana Operative', email: 'diana@construction.com', role: Role.OPERATIVE, companyId: 1, status: UserStatus.ON_SITE, avatarUrl: 'https://i.pravatar.cc/150?u=13' },
  { id: 14, name: 'Ethan Operative', email: 'ethan@construction.com', role: Role.OPERATIVE, companyId: 1, status: UserStatus.OFF_SITE, avatarUrl: 'https://i.pravatar.cc/150?u=14' },
];

let companies: Company[] = [
  { id: 0, name: 'AS Agents Platform', status: 'Active', subscriptionPlan: 'Enterprise', storageUsageGB: 100 },
  { id: 1, name: 'ConstructCo', status: 'Active', subscriptionPlan: 'Pro', storageUsageGB: 25.5 },
  { id: 2, name: 'BuildIt Wright', status: 'Active', subscriptionPlan: 'Basic', storageUsageGB: 8.2 },
];

let projects: Project[] = [
  { id: 100, companyId: 1, name: 'Downtown Tower Renovation', location: { address: '123 Main St, London', lat: 51.5074, lng: -0.1278 }, budget: 5000000, actualCost: 2300000, startDate: new Date('2023-01-15'), status: 'Active', imageUrl: 'https://picsum.photos/seed/tower/800/400', projectType: 'Commercial', workClassification: 'Renovation', geofenceRadius: 150 },
  { id: 101, companyId: 1, name: 'Suburban Housing Development', location: { address: '456 Oak Ave, Manchester', lat: 53.4808, lng: -2.2426 }, budget: 12000000, actualCost: 9500000, startDate: new Date('2022-09-01'), status: 'Active', imageUrl: 'https://picsum.photos/seed/housing/800/400', projectType: 'Residential', workClassification: 'New Build', geofenceRadius: 500 },
  { id: 102, companyId: 1, name: 'Old Town Bridge Repair', location: { address: '789 River Rd, Bristol', lat: 51.4545, lng: -2.5879 }, budget: 750000, actualCost: 800000, startDate: new Date('2023-05-10'), status: 'On Hold', imageUrl: 'https://picsum.photos/seed/bridge/800/400', projectType: 'Infrastructure', workClassification: 'Repair' },
];

let todos: Todo[] = [
  { id: 1001, text: 'Finalize structural steel drawings', projectId: 100, assigneeId: 11, creatorId: 10, status: TodoStatus.IN_PROGRESS, priority: TodoPriority.HIGH, dueDate: new Date('2024-08-15') },
  { id: 1002, text: 'Install HVAC system on floors 1-5', projectId: 100, assigneeId: 12, creatorId: 11, status: TodoStatus.TODO, priority: TodoPriority.HIGH, dueDate: new Date('2024-09-01'), subTasks: [{id: 1, text: "Floor 1", isCompleted: true}, {id: 2, text: "Floor 2", isCompleted: false}], comments: [{ id: 1, text: "We need to coordinate with the electricians before starting floor 3.", authorId: 11, timestamp: new Date(Date.now() - 86400000) }] },
  { id: 1003, text: 'Lay foundations for Plot 12', projectId: 101, assigneeId: 13, creatorId: 12, status: TodoStatus.TODO, priority: TodoPriority.MEDIUM, dueDate: new Date() },
  { id: 1004, text: 'Source and order bespoke windows', projectId: 100, assigneeId: 11, creatorId: 10, status: TodoStatus.DONE, priority: TodoPriority.LOW, dueDate: new Date('2024-06-01') },
];

let documents: Document[] = [
  { id: 101, name: 'Structural Plans v3.pdf', projectId: 100, category: DocumentCategory.PLANS, status: DocumentStatus.APPROVED, url: '#', uploadedAt: new Date() },
  { id: 102, name: 'Site Access Permit.pdf', projectId: 100, category: DocumentCategory.PERMITS, status: DocumentStatus.APPROVED, url: '#', uploadedAt: new Date() },
  { id: 103, name: 'Crane_Safety_Manual.pdf', projectId: 100, category: DocumentCategory.REPORTS, status: DocumentStatus.APPROVED, url: '#', uploadedAt: new Date() },
  { id: 104, name: 'Phase 1 Electrical Layout.dwg', projectId: 101, category: DocumentCategory.PLANS, status: DocumentStatus.APPROVED, url: '#', uploadedAt: new Date() },
];

let timesheets: Timesheet[] = [
  { id: 1, userId: 13, projectId: 101, clockIn: new Date(new Date().setDate(new Date().getDate() - 1)), clockOut: new Date(new Date().setDate(new Date().getDate() - 1)), status: TimesheetStatus.APPROVED },
  { id: 2, userId: 12, projectId: 100, clockIn: new Date(new Date().setDate(new Date().getDate() - 1)), clockOut: new Date(new Date().setDate(new Date().getDate() - 1)), status: TimesheetStatus.APPROVED },
  { id: 3, userId: 13, projectId: 101, clockIn: new Date(), clockOut: null, status: TimesheetStatus.PENDING },
  { id: 4, userId: 14, projectId: 101, clockIn: new Date(), clockOut: null, status: TimesheetStatus.PENDING },
];

let safetyIncidents: SafetyIncident[] = [
    { id: 1, description: 'Minor slip near scaffolding, no injury.', projectId: 100, reporterId: 12, timestamp: new Date(), severity: IncidentSeverity.LOW, status: IncidentStatus.RESOLVED },
    { id: 2, description: 'Incorrect PPE worn by subcontractor.', projectId: 101, reporterId: 11, timestamp: new Date(Date.now() - 86400000 * 5), severity: IncidentSeverity.MEDIUM, status: IncidentStatus.UNDER_REVIEW }
];

let equipment: Equipment[] = [
    { id: 1, companyId: 1, name: 'Excavator EX-250', type: 'Heavy Machinery', status: EquipmentStatus.IN_USE, projectId: 101 },
    { id: 2, companyId: 1, name: 'Tower Crane TC-01', type: 'Crane', status: EquipmentStatus.IN_USE, projectId: 100 },
    { id: 3, companyId: 1, name: 'Concrete Mixer CM-5', type: 'Machinery', status: EquipmentStatus.AVAILABLE, projectId: null },
    { id: 4, companyId: 1, name: 'Scaffolding Set A', type: 'Support', status: EquipmentStatus.MAINTENANCE, projectId: null },
];

const companySettings: CompanySettings[] = [
    { companyId: 1, theme: 'light', notificationPreferences: { projectUpdates: true, timeReminders: true, photoRequirements: false }, locationPreferences: { backgroundTracking: false, gpsAccuracy: 'standard' } },
    { companyId: 2, theme: 'dark', notificationPreferences: { projectUpdates: true, timeReminders: false, photoRequirements: true }, locationPreferences: { backgroundTracking: true, gpsAccuracy: 'high' } }
];

let projectAssignments: ProjectAssignment[] = [
    {id: 1, userId: 11, projectId: 100},
    {id: 2, userId: 11, projectId: 101},
    {id: 3, userId: 12, projectId: 100},
    {id: 4, userId: 13, projectId: 101},
    {id: 5, userId: 14, projectId: 101},
];

let resourceAssignments: ResourceAssignment[] = [
    { id: 1, companyId: 1, projectId: 100, resourceId: 12, resourceType: 'user', startDate: new Date('2024-07-29'), endDate: new Date('2024-08-02') },
    { id: 2, companyId: 1, projectId: 101, resourceId: 1, resourceType: 'equipment', startDate: new Date('2024-07-29'), endDate: new Date('2024-08-09') },
];

let conversations: Conversation[] = [
    {
        id: 1, participants: [10, 11],
        messages: [
            { id: 1, conversationId: 1, senderId: 10, content: "Hey Bob, can you check the budget for the tower renovation?", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), isRead: true },
            { id: 2, conversationId: 1, senderId: 11, content: "Sure Alice, I'm on it. We're looking good, about 46% spent.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1), isRead: true },
            { id: 3, conversationId: 1, senderId: 10, content: "Perfect, thanks!", timestamp: new Date(Date.now() - 1000 * 60 * 55), isRead: false },
        ],
        lastMessage: { id: 3, conversationId: 1, senderId: 10, content: "Perfect, thanks!", timestamp: new Date(Date.now() - 1000 * 60 * 55), isRead: false }
    },
    {
        id: 2, participants: [11, 12],
        messages: [
             { id: 4, conversationId: 2, senderId: 11, content: "Charlie, how's the steelwork going?", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), isRead: true },
        ],
        lastMessage: { id: 4, conversationId: 2, senderId: 11, content: "Charlie, how's the steelwork going?", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), isRead: true }
    }
];

let clients: Client[] = [
    {id: 1, name: "Global Property Group", companyId: 1, createdAt: new Date('2022-01-20'), contactEmail: "contact@gpg.com", contactPhone: "020 1234 5678"},
    {id: 2, name: "City Developments", companyId: 1, createdAt: new Date('2021-11-05'), contactEmail: "info@citydev.co.uk", contactPhone: "0161 987 6543"},
];

let invoices: Invoice[] = [
    {id: 1, clientId: 1, projectId: 100, status: InvoiceStatus.PAID, dueAt: new Date('2024-06-30'), amountDue: 0, total: 250000},
    {id: 2, clientId: 2, projectId: 101, status: InvoiceStatus.SENT, dueAt: new Date('2024-08-15'), amountDue: 500000, total: 500000},
    {id: 3, clientId: 1, projectId: 100, status: InvoiceStatus.OVERDUE, dueAt: new Date('2024-07-30'), amountDue: 15000, total: 15000},
];

let quotes: Quote[] = [
    {id: 1, clientId: 2, projectId: 102, status: QuoteStatus.SENT, validUntil: new Date('2024-08-30'), total: 750000},
    {id: 2, clientId: 1, projectId: 100, status: QuoteStatus.ACCEPTED, validUntil: new Date('2023-01-01'), total: 5000000},
];

let projectTemplates: ProjectTemplate[] = [
    {id: 1, companyId: 1, name: "Standard Commercial Build", description: "Template for mid-size commercial projects.", documentCategories: [DocumentCategory.PLANS, DocumentCategory.PERMITS], templateTasks: [{text: "Submit initial planning application", priority: TodoPriority.HIGH}, {text: "Conduct site survey", priority: TodoPriority.HIGH}]}
];

let auditLogs: AuditLog[] = [
    {id: 1, actorId: 11, action: "updated_task", target: { type: 'Todo', id: 1004, name: "Source and order bespoke windows"}, timestamp: new Date(Date.now() - 3600000) },
    {id: 2, actorId: 11, action: "approved_timesheet", target: { type: 'Timesheet', id: 1, name: `Timesheet for ${users.find(u=>u.id===13)?.name}`}, timestamp: new Date(Date.now() - 7200000) },
];


export const db = {
  users, companies, projects, todos, documents, timesheets, safetyIncidents,
  equipment, companySettings, projectAssignments, resourceAssignments,
  conversations, clients, invoices, quotes, projectTemplates, auditLogs
};