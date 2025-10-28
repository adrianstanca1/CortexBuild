// services/mockApi.ts
import { db } from './mockData';
import {
  User, Project, Todo, Document, SafetyIncident, Timesheet, Equipment,
  Company, CompanySettings, Role, TodoStatus, TodoPriority, DocumentStatus,
  DocumentCategory, IncidentSeverity, IncidentStatus, TimesheetStatus, EquipmentStatus,
  ProjectAssignment, ResourceAssignment, Conversation, ChatMessage,
  Client, Invoice, Quote, ProjectTemplate, AuditLog, UserStatus
} from '../types';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

let localDb = JSON.parse(JSON.stringify(db)); // Deep copy to avoid modifying original mock data
localDb.users.forEach((u: User) => {
    if (u.status === undefined) {
        u.status = UserStatus.OFF_SITE;
    }
});


let nextIds = {
    user: Math.max(...localDb.users.map((u:User) => u.id)) + 1,
    project: Math.max(...localDb.projects.map((p:Project) => p.id)) + 1,
    todo: Math.max(...localDb.todos.map((t:Todo) => typeof t.id === 'number' ? t.id : 0)) + 1,
    document: Math.max(...localDb.documents.map((d:Document) => d.id)) + 1,
    timesheet: Math.max(...localDb.timesheets.map((t:Timesheet) => t.id)) + 1,
    safetyIncident: Math.max(...localDb.safetyIncidents.map((i:SafetyIncident) => i.id)) + 1,
    projectAssignment: Math.max(...localDb.projectAssignments.map((a:ProjectAssignment) => a.id)) + 1,
    resourceAssignment: Math.max(...localDb.resourceAssignments.map((a:ResourceAssignment) => a.id)) + 1,
    auditLog: Math.max(...localDb.auditLogs.map((l:AuditLog) => l.id)) + 1,
    projectTemplate: Math.max(...localDb.projectTemplates.map((t:ProjectTemplate) => t.id)) + 1,
    conversation: Math.max(...localDb.conversations.map((c:Conversation) => c.id)) + 1,
    chatMessage: Math.max(...localDb.conversations.flatMap((c:Conversation) => c.messages).map((m:ChatMessage) => m.id)) + 1,
};

const createAuditLog = (actorId: number, action: string, target?: { type: string; id: number | string; name: string }) => {
    const log: AuditLog = {
        id: nextIds.auditLog++,
        actorId,
        action,
        target,
        timestamp: new Date()
    };
    localDb.auditLogs.unshift(log);
};

export const login = async (email: string, password: string): Promise<User> => {
    await delay(500);
    const user = localDb.users.find((u:User) => u.email === email);
    if (user && password === 'password123') { // Simple password check for mock
        return user;
    }
    throw new Error('Invalid email or password.');
};

export const getUserById = async (id: number): Promise<User> => {
    await delay(50);
    const user = localDb.users.find((u:User) => u.id === id);
    if (user) return user;
    throw new Error('User not found.');
};

export const getUsersByCompany = async (companyId?: number): Promise<User[]> => {
    await delay(100);
    if (companyId) {
        return localDb.users.filter((u:User) => u.companyId === companyId);
    }
    return localDb.users;
};

export const getProjectsByCompany = async (companyId: number): Promise<Project[]> => {
    await delay(200);
    return localDb.projects.filter((p:Project) => p.companyId === companyId);
};

export const getProjectsByUser = async (userId: number): Promise<Project[]> => {
    await delay(200);
    const assignments = localDb.projectAssignments.filter((a:ProjectAssignment) => a.userId === userId);
    const projectIds = new Set(assignments.map((a:ProjectAssignment) => a.projectId));
    return localDb.projects.filter((p:Project) => projectIds.has(p.id));
};

export const getProjectsByManager = async (userId: number): Promise<Project[]> => {
    return getProjectsByUser(userId); // Simplified logic for mock
};

export const getTodosByProjectIds = async (projectIds: number[]): Promise<Todo[]> => {
    await delay(300);
    return localDb.todos.filter((t:Todo) => projectIds.includes(t.projectId));
};

export const updateTodo = async (todoId: number | string, updates: Partial<Todo>, actorId: number): Promise<Todo> => {
    await delay(150);
    const index = localDb.todos.findIndex((t:Todo) => t.id === todoId);
    if (index === -1) throw new Error("Todo not found");
    
    localDb.todos[index] = { ...localDb.todos[index], ...updates };
    createAuditLog(actorId, `updated_task_status_to_${updates.status}`, { type: 'Todo', id: todoId, name: localDb.todos[index].text });
    return localDb.todos[index];
};

export const getDocumentsByProjectIds = async (projectIds: number[]): Promise<Document[]> => {
    await delay(200);
    return localDb.documents.filter((d:Document) => projectIds.includes(d.projectId));
};

export const uploadDocument = async (file: File, projectId: number, category: DocumentCategory, actorId: number): Promise<Document> => {
    await delay(1000);
    const newDoc: Document = {
        id: nextIds.document++,
        name: file.name,
        projectId,
        category,
        status: DocumentStatus.UPLOADING, // Simulate processing
        url: '#',
        uploadedAt: new Date(),
    };
    localDb.documents.unshift(newDoc);
    createAuditLog(actorId, 'uploaded_document', { type: 'Document', id: newDoc.id, name: newDoc.name });
    
    // Simulate processing
    setTimeout(() => {
        const idx = localDb.documents.findIndex((d:Document) => d.id === newDoc.id);
        if(idx > -1) localDb.documents[idx].status = DocumentStatus.SCANNING;
    }, 2000);
    setTimeout(() => {
        const idx = localDb.documents.findIndex((d:Document) => d.id === newDoc.id);
        if(idx > -1) localDb.documents[idx].status = DocumentStatus.APPROVED;
    }, 4000);

    return newDoc;
};

export const getProjectAssignmentsByCompany = async (companyId: number): Promise<ProjectAssignment[]> => {
    await delay(100);
    const companyProjects = new Set(localDb.projects.filter((p:Project) => p.companyId === companyId).map((p:Project) => p.id));
    return localDb.projectAssignments.filter((pa:ProjectAssignment) => companyProjects.has(pa.projectId));
};

export const getCompanySettings = async (companyId: number): Promise<CompanySettings> => {
    await delay(50);
    const settings = localDb.companySettings.find((s:CompanySettings) => s.companyId === companyId);
    if (settings) return settings;
    throw new Error('Settings not found');
};

export const updateCompanySettings = async (companyId: number, updates: Partial<CompanySettings>, actorId: number): Promise<CompanySettings> => {
    await delay(200);
    const index = localDb.companySettings.findIndex((s:CompanySettings) => s.companyId === companyId);
    if (index === -1) throw new Error("Settings not found");
    localDb.companySettings[index] = { ...localDb.companySettings[index], ...updates };
    createAuditLog(actorId, 'updated_company_settings');
    return localDb.companySettings[index];
};

export const getSafetyIncidentsByCompany = async (companyId: number): Promise<SafetyIncident[]> => {
    await delay(200);
    const companyProjects = new Set(localDb.projects.filter((p:Project) => p.companyId === companyId).map((p:Project) => p.id));
    return localDb.safetyIncidents.filter((i:SafetyIncident) => companyProjects.has(i.projectId));
};

export const getTimesheetsByCompany = async (companyId: number, actorId: number): Promise<Timesheet[]> => {
    await delay(300);
    const companyUsers = new Set(localDb.users.filter((u:User) => u.companyId === companyId).map((u:User) => u.id));
    return localDb.timesheets.filter((ts:Timesheet) => companyUsers.has(ts.userId));
};

export const getTimesheetsForManager = async (managerId: number): Promise<Timesheet[]> => {
    await delay(300);
    // simplified: return all for now
    const manager = await getUserById(managerId);
    return getTimesheetsByCompany(manager.companyId!, managerId);
};

export const getTimesheetsByUser = async (userId: number): Promise<Timesheet[]> => {
    await delay(150);
    return localDb.timesheets.filter((ts:Timesheet) => ts.userId === userId);
};

export const updateTimesheetStatus = async (timesheetId: number, status: TimesheetStatus, actorId: number, reason?: string): Promise<Timesheet> => {
    await delay(200);
    const index = localDb.timesheets.findIndex((ts:Timesheet) => ts.id === timesheetId);
    if (index === -1) throw new Error("Timesheet not found");
    
    localDb.timesheets[index].status = status;
    if (reason) {
        localDb.timesheets[index].rejectionReason = reason;
    }
    const targetUser = localDb.users.find((u:User) => u.id === localDb.timesheets[index].userId);
    createAuditLog(actorId, `updated_timesheet_to_${status}`, { type: 'Timesheet', id: timesheetId, name: `Timesheet for ${targetUser?.name}` });
    return localDb.timesheets[index];
};

export const updateUserStatus = async (userId: number, status: UserStatus): Promise<User> => {
    await delay(200);
    const userIndex = localDb.users.findIndex((u:User) => u.id === userId);
    if (userIndex === -1) throw new Error("User not found");

    localDb.users[userIndex].status = status;
    return localDb.users[userIndex];
};

export const getEquipmentByCompany = async (companyId: number): Promise<Equipment[]> => {
    await delay(200);
    return localDb.equipment.filter((e:Equipment) => e.companyId === companyId);
};

export const assignEquipmentToProject = async (equipmentId: number, projectId: number, actorId: number): Promise<Equipment> => {
    await delay(300);
    const index = localDb.equipment.findIndex((e:Equipment) => e.id === equipmentId);
    if (index === -1) throw new Error("Equipment not found");
    
    localDb.equipment[index].projectId = projectId;
    localDb.equipment[index].status = EquipmentStatus.IN_USE;
    localDb.equipment[index].lastAssignedDate = new Date();

    const proj = localDb.projects.find((p:Project) => p.id === projectId);
    createAuditLog(actorId, `assigned_equipment_to_project`, { type: 'Equipment', id: equipmentId, name: `${localDb.equipment[index].name} to ${proj?.name}` });
    return localDb.equipment[index];
};

export const unassignEquipmentFromProject = async (equipmentId: number, actorId: number): Promise<Equipment> => {
    await delay(300);
    const index = localDb.equipment.findIndex((e:Equipment) => e.id === equipmentId);
    if (index === -1) throw new Error("Equipment not found");

    const oldProjectId = localDb.equipment[index].projectId;
    localDb.equipment[index].projectId = null;
    localDb.equipment[index].status = EquipmentStatus.AVAILABLE;
    
    const proj = localDb.projects.find((p:Project) => p.id === oldProjectId);
    createAuditLog(actorId, `unassigned_equipment_from_project`, { type: 'Equipment', id: equipmentId, name: `${localDb.equipment[index].name} from ${proj?.name}` });
    return localDb.equipment[index];
};

export const updateEquipmentStatus = async (equipmentId: number, status: EquipmentStatus, actorId: number): Promise<Equipment> => {
    await delay(200);
    const index = localDb.equipment.findIndex((e:Equipment) => e.id === equipmentId);
    if (index === -1) throw new Error("Equipment not found");

    localDb.equipment[index].status = status;
    if (status === EquipmentStatus.MAINTENANCE) {
        localDb.equipment[index].maintenanceStartDate = new Date();
    }
    createAuditLog(actorId, `updated_equipment_status_to_${status}`, { type: 'Equipment', id: equipmentId, name: localDb.equipment[index].name });
    return localDb.equipment[index];
};

export const getResourceAssignments = async (companyId: number): Promise<ResourceAssignment[]> => {
    await delay(200);
    return localDb.resourceAssignments.filter((a:ResourceAssignment) => a.companyId === companyId);
};

export const createResourceAssignment = async (data: Omit<ResourceAssignment, 'id'>, actorId: number): Promise<ResourceAssignment> => {
    await delay(300);
    const newAssignment: ResourceAssignment = {
        id: nextIds.resourceAssignment++,
        ...data
    };
    localDb.resourceAssignments.push(newAssignment);
    const proj = localDb.projects.find((p:Project) => p.id === data.projectId);
    createAuditLog(actorId, 'created_resource_assignment', { type: 'Project', id: data.projectId, name: proj!.name });
    return newAssignment;
};

export const deleteResourceAssignment = async (assignmentId: number, actorId: number): Promise<void> => {
    await delay(200);
    const index = localDb.resourceAssignments.findIndex((a:ResourceAssignment) => a.id === assignmentId);
    if (index > -1) {
        const assignment = localDb.resourceAssignments[index];
        const proj = localDb.projects.find((p:Project) => p.id === assignment.projectId);
        localDb.resourceAssignments.splice(index, 1);
        createAuditLog(actorId, 'deleted_resource_assignment', { type: 'Project', id: assignment.projectId, name: proj!.name });
    }
};

export const getConversationsForUser = async (userId: number): Promise<Conversation[]> => {
    await delay(200);
    return localDb.conversations.filter((c:Conversation) => c.participants.includes(userId));
};

export const getMessagesForConversation = async (conversationId: number, userId: number): Promise<ChatMessage[]> => {
    await delay(100);
    const convo = localDb.conversations.find((c:Conversation) => c.id === conversationId);
    if (!convo) throw new Error("Conversation not found");
    if (!convo.participants.includes(userId)) throw new Error("Unauthorized");
    return convo.messages;
};

export const sendMessage = async (senderId: number, recipientId: number, content: string): Promise<ChatMessage> => {
    await delay(100);
    let convo = localDb.conversations.find((c:Conversation) => c.participants.includes(senderId) && c.participants.includes(recipientId));
    
    if (!convo) {
        convo = {
            id: nextIds.conversation++,
            participants: [senderId, recipientId],
            messages: [],
            lastMessage: null
        };
        localDb.conversations.push(convo);
    }
    
    const newMessage: ChatMessage = {
        id: nextIds.chatMessage++,
        conversationId: convo.id,
        senderId,
        content,
        timestamp: new Date(),
        isRead: false,
    };
    
    convo.messages.push(newMessage);
    convo.lastMessage = newMessage;
    
    return newMessage;
};

export const getFinancialKPIsForCompany = async (companyId: number) => {
    await delay(400);
    return { profitability: 12.5, projectMargin: 18.2, cashFlow: 250000, currency: 'GBP' };
};

export const getMonthlyFinancials = async (companyId: number) => {
    await delay(400);
    return [
        { month: 'Jan', revenue: 500, costs: 400, profit: 100 },
        { month: 'Feb', revenue: 600, costs: 450, profit: 150 },
        { month: 'Mar', revenue: 750, costs: 500, profit: 250 },
        { month: 'Apr', revenue: 700, costs: 550, profit: 150 },
    ].map(m => ({ ...m, revenue: m.revenue * 1000, costs: m.costs * 1000, profit: m.profit * 1000 }));
};

export const getCostBreakdown = async (companyId: number) => {
    await delay(400);
    return [
        { category: 'Labor', amount: 1200000 },
        { category: 'Materials', amount: 2500000 },
        { category: 'Subcontractors', amount: 800000 },
        { category: 'Overhead', amount: 400000 },
    ];
};

export const getInvoicesByCompany = async (companyId: number) => {
    await delay(200);
    return localDb.invoices;
};

export const getQuotesByCompany = async (companyId: number) => {
    await delay(200);
    return localDb.quotes;
};

export const getClientsByCompany = async (companyId: number) => {
    await delay(150);
    return localDb.clients.filter((c:Client) => c.companyId === companyId);
};

export const getProjectTemplates = async (companyId: number): Promise<ProjectTemplate[]> => {
    await delay(150);
    return localDb.projectTemplates.filter((pt:ProjectTemplate) => pt.companyId === companyId);
};

export const createProjectTemplate = async (data: Omit<ProjectTemplate, 'id'>, actorId: number): Promise<ProjectTemplate> => {
    await delay(250);
    const newTemplate: ProjectTemplate = { ...data, id: nextIds.projectTemplate++ };
    localDb.projectTemplates.push(newTemplate);
    createAuditLog(actorId, 'created_project_template', { type: 'ProjectTemplate', id: newTemplate.id, name: newTemplate.name });
    return newTemplate;
};

export const updateProjectTemplate = async (templateId: number, data: Partial<ProjectTemplate>, actorId: number): Promise<ProjectTemplate> => {
    await delay(250);
    const index = localDb.projectTemplates.findIndex((t:ProjectTemplate) => t.id === templateId);
    if(index === -1) throw new Error("Template not found");
    localDb.projectTemplates[index] = { ...localDb.projectTemplates[index], ...data };
    createAuditLog(actorId, 'updated_project_template', { type: 'ProjectTemplate', id: templateId, name: localDb.projectTemplates[index].name });
    return localDb.projectTemplates[index];
};

export const deleteProjectTemplate = async (templateId: number, actorId: number): Promise<void> => {
    await delay(200);
    const index = localDb.projectTemplates.findIndex((t:ProjectTemplate) => t.id === templateId);
    if(index > -1) {
        const template = localDb.projectTemplates[index];
        localDb.projectTemplates.splice(index, 1);
        createAuditLog(actorId, 'deleted_project_template', { type: 'ProjectTemplate', id: template.id, name: template.name });
    }
};

export const createProject = async (data: Omit<Project, 'id' | 'companyId' | 'actualCost' | 'status'>, templateId: number | null, actorId: number): Promise<Project> => {
    await delay(400);
    const user = await getUserById(actorId);
    const newProject: Project = {
        ...data,
        id: nextIds.project++,
        companyId: user.companyId!,
        actualCost: 0,
        status: 'Active'
    };
    localDb.projects.push(newProject);
    createAuditLog(actorId, 'created_project', { type: 'Project', id: newProject.id, name: newProject.name });
    
    // If template is used, create tasks
    if (templateId) {
        const template = localDb.projectTemplates.find((t:ProjectTemplate) => t.id === templateId);
        if (template) {
            template.templateTasks.forEach((taskTemplate: Partial<Todo>) => {
                const newTodo: Todo = {
                    id: nextIds.todo++,
                    text: taskTemplate.text!,
                    projectId: newProject.id,
                    assigneeId: null,
                    creatorId: actorId,
                    status: TodoStatus.TODO,
                    priority: taskTemplate.priority || TodoPriority.MEDIUM,
                    dueDate: null,
                };
                localDb.todos.push(newTodo);
            });
        }
    }
    
    return newProject;
};

export const getAuditLogsByActorId = async (actorId: number): Promise<AuditLog[]> => {
    await delay(150);
    return localDb.auditLogs.filter((l:AuditLog) => l.actorId === actorId);
};

export const getPlatformUsageMetrics = async () => {
    await delay(300);
    return [
        { name: 'Active Projects', value: localDb.projects.filter((p:Project) => p.status === 'Active').length, unit: 'projects' },
        { name: 'Completed Tasks', value: localDb.todos.filter((t:Todo) => t.status === TodoStatus.DONE).length, unit: 'tasks' },
        { name: 'Uploaded Documents', value: localDb.documents.length, unit: 'files' }
    ];
};

export const getCompanies = async (): Promise<Company[]> => {
    await delay(100);
    return localDb.companies;
};
