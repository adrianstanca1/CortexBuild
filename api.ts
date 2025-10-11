import { GoogleGenAI, Type } from '@google/genai';
import {
    User, Project, Task, RFI, PunchListItem, Drawing, Document, SiteInstruction, DeliveryItem, DayworkSheet,
    Comment, Notification, ActivityEvent, Company, AISuggestion, AIInsight, AIFeedback, DailyLog, LogItem, Attachment,
    TimeEntry,
    PermissionAction,
    PermissionSubject,
    AgentCatalogItem,
    AgentExecution,
    Workflow,
    WorkflowRun,
    WorkflowTemplate,
    AutomationRule,
    AutomationEvent
} from './types';
import * as db from './db';
import { can } from './permissions';
import { validateName, validateEmail, validatePassword, validateCompanyName } from './utils/validation';
import { APIError, withErrorHandling } from './utils/errorHandling';
import { getMLPredictor } from './utils/mlPredictor';
import { PredictionResult } from './utils/neuralNetwork';
import * as authService from './auth/authService';
import { supabase } from './supabaseClient';

// Simulate API latency
const LATENCY = 200;
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const model = 'gemini-2.5-flash';

const checkPermissions = (user: User, action: PermissionAction, subject: PermissionSubject) => {
    if (!can(user.role, action, subject)) {
        throw new Error(`Permission denied. Role '${user.role}' cannot perform '${action}' on '${subject}'.`);
    }
};

const parseJsonIfNeeded = <T>(value: unknown, fallback: T): T => {
    if (value === undefined || value === null) {
        return fallback;
    }
    if (typeof value === 'string') {
        try {
            return JSON.parse(value) as T;
        } catch {
            return fallback;
        }
    }
    return value as T;
};

const mapWorkflowRecord = (record: any): Workflow => ({
    id: String(record.id),
    companyId: String(record.companyId ?? record.company_id ?? ''),
    name: record.name ?? 'Workflow',
    description: record.description ?? '',
    version: record.version ?? '1.0.0',
    definition: parseJsonIfNeeded(record.definition, {} as Record<string, unknown>),
    isActive: Boolean(record.isActive ?? record.is_active ?? true),
    createdBy: record.createdBy ?? record.created_by ?? undefined,
    createdAt: record.createdAt ?? record.created_at ?? new Date().toISOString(),
    updatedAt: record.updatedAt ?? record.updated_at ?? new Date().toISOString()
});

const mapWorkflowRunRecord = (record: any): WorkflowRun => ({
    id: String(record.id),
    workflowId: String(record.workflowId ?? record.workflow_id ?? ''),
    companyId: String(record.companyId ?? record.company_id ?? ''),
    status: record.status ?? 'running',
    trigger: parseJsonIfNeeded(record.trigger ?? record.trigger_payload, {} as Record<string, unknown>),
    input: parseJsonIfNeeded(record.input ?? record.input_payload, {} as Record<string, unknown>),
    output: parseJsonIfNeeded(record.output ?? record.output_payload, {} as Record<string, unknown>),
    error: record.error ?? record.error_message ?? undefined,
    startedAt: record.startedAt ?? record.started_at ?? new Date().toISOString(),
    completedAt: record.completedAt ?? record.completed_at ?? undefined,
    createdAt: record.createdAt ?? record.created_at ?? new Date().toISOString(),
    updatedAt: record.updatedAt ?? record.updated_at ?? new Date().toISOString(),
    steps: Array.isArray(record.steps) ? record.steps : undefined
});

const mapWorkflowTemplateRecord = (record: any): WorkflowTemplate => ({
    id: String(record.id),
    name: record.name ?? 'Template',
    category: record.category ?? 'General',
    description: record.description ?? '',
    icon: record.icon ?? '⚙️',
    difficulty: record.difficulty ?? 'intermediate',
    definition: parseJsonIfNeeded(record.definition, {} as Record<string, unknown>)
});

const mapAutomationRuleRecord = (record: any): AutomationRule => ({
    id: String(record.id),
    companyId: String(record.companyId ?? record.company_id ?? ''),
    name: record.name ?? 'Automation',
    description: record.description ?? '',
    triggerType: record.triggerType ?? record.trigger_type ?? 'event',
    triggerConfig: parseJsonIfNeeded(record.triggerConfig ?? record.trigger_config, {} as Record<string, unknown>),
    actionType: record.actionType ?? record.action_type ?? 'notification',
    actionConfig: parseJsonIfNeeded(record.actionConfig ?? record.action_config, {} as Record<string, unknown>),
    isActive: Boolean(record.isActive ?? record.is_active ?? true),
    lastTriggeredAt: record.lastTriggeredAt ?? record.last_triggered_at ?? undefined,
    createdAt: record.createdAt ?? record.created_at ?? new Date().toISOString(),
    updatedAt: record.updatedAt ?? record.updated_at ?? new Date().toISOString()
});

const mapAutomationEventRecord = (record: any): AutomationEvent => ({
    id: String(record.id),
    ruleId: String(record.ruleId ?? record.rule_id ?? ''),
    status: record.status ?? 'success',
    payload: parseJsonIfNeeded(record.payload, {} as Record<string, unknown>),
    error: record.error ?? record.error_message ?? undefined,
    createdAt: record.createdAt ?? record.created_at ?? new Date().toISOString()
});

const mapAgentCatalogRecord = (record: any): AgentCatalogItem => ({
    id: String(record.id),
    slug: record.slug ?? '',
    name: record.name ?? 'Agent',
    description: record.description ?? '',
    icon: record.icon ?? record.iconUrl ?? '🤖',
    status: record.status ?? 'inactive',
    isGlobal: Boolean(record.isGlobal ?? record.is_global ?? false),
    tags: parseJsonIfNeeded(record.tags, [] as string[]),
    capabilities: parseJsonIfNeeded(record.capabilities, {} as Record<string, unknown>),
    config: parseJsonIfNeeded(record.config, {} as Record<string, unknown>),
    metadata: parseJsonIfNeeded(record.metadata, {} as Record<string, unknown>),
    developerId: record.developerId ?? record.developer_id ?? undefined,
    companyId: record.companyId ?? record.company_id ?? undefined,
    createdAt: record.createdAt ?? record.created_at ?? new Date().toISOString(),
    updatedAt: record.updatedAt ?? record.updated_at ?? new Date().toISOString()
});

const mapAgentExecutionRecord = (record: any): AgentExecution => ({
    id: String(record.id),
    agentId: String(record.agentId ?? record.agent_id ?? ''),
    companyId: String(record.companyId ?? record.company_id ?? ''),
    triggeredBy: record.triggeredBy ?? record.triggered_by ?? undefined,
    input: parseJsonIfNeeded(record.input ?? record.input_payload, {} as Record<string, unknown>),
    output: parseJsonIfNeeded(record.output ?? record.output_payload, {} as Record<string, unknown>),
    status: record.status ?? 'success',
    durationMs: record.durationMs ?? record.duration_ms ?? undefined,
    error: record.error ?? record.error_message ?? undefined,
    startedAt: record.startedAt ?? record.started_at ?? new Date().toISOString(),
    completedAt: record.completedAt ?? record.completed_at ?? undefined
});


// --- Auth ---
export const loginUser = async (email: string, password?: string): Promise<User | null> => {
    console.log('🔐 [API] Login user:', email);
    return authService.login(email, password || '');
}

export const registerUser = async (details: { name: string, email: string, companyName: string, password?: string }): Promise<User | null> => {
    return withErrorHandling(async () => {
        // Validate input data
        const nameValidation = validateName(details.name);
        const emailValidation = validateEmail(details.email);
        const companyValidation = validateCompanyName(details.companyName);
        const passwordValidation = details.password ? validatePassword(details.password) : { isValid: true, errors: [] };

        if (!nameValidation.isValid || !emailValidation.isValid || !companyValidation.isValid || !passwordValidation.isValid) {
            const allErrors = [...nameValidation.errors, ...emailValidation.errors, ...companyValidation.errors, ...passwordValidation.errors];
            throw new APIError(allErrors.join('. '), 'VALIDATION_ERROR');
        }

        if (supabase) {
            // This is a simplified registration flow. A real app would have more robust company handling.
            const { data: companies } = await supabase.from('companies').select('id').eq('name', details.companyName.trim()).limit(1);
            let companyId;

            if (companies && companies.length > 0) {
                companyId = companies[0].id;
            } else {
                const { data: newCompany, error: companyError } = await supabase.from('companies').insert({ name: details.companyName.trim() }).select('id').single();
                if (companyError) throw companyError;
                companyId = newCompany.id;
            }

            const { data, error: signUpError } = await supabase.auth.signUp({
                email: details.email.trim(),
                password: details.password || '',
            });

            if (signUpError) throw signUpError;

            if (data.user) {
                  const { error: profileError } = await supabase.from('profiles').insert({
                      id: data.user.id,
                      name: details.name.trim(),
                      email: details.email.trim(),
                      role: 'Project Manager', // default role
                      company_id: companyId,
                      avatar: `https://i.pravatar.cc/150?u=${details.email.trim()}`,
                  });
                  if(profileError) throw profileError;

                // Immediately log in the new user to create a session
                return loginUser(details.email.trim(), details.password);
            }
            return null;

        } else {
            // Mock implementation
            await delay(LATENCY * 3);
            if (db.findUserByEmail(details.email.trim())) {
                throw new APIError("User with this email already exists.", 'DUPLICATE_USER');
            }

            let company = db.findCompanyByName(details.companyName.trim());
            if (!company) {
                const newCompany: Company = {
                    id: `comp-${Date.now()}`,
                    name: details.companyName.trim(),
                };
                db.addCompany(newCompany);
                company = newCompany;
            }

            const newUser: User = {
                id: `user-${Date.now()}`,
                name: details.name.trim(),
                email: details.email.trim(),
                role: 'Project Manager', // New users default to Project Manager for demo purposes
                avatar: `https://i.pravatar.cc/150?u=${details.email.trim()}`,
                companyId: company.id,
            };
            db.addUser(newUser);

            return newUser;
        }
    }, 'registerUser');
};


// --- User & Company ---
export const fetchUsers = async (): Promise<User[]> => {
    await delay(LATENCY);
    return db.getUsers();
};

export const fetchUsersByCompany = async (companyId: string): Promise<User[]> => {
    await delay(LATENCY);
    return db.getUsers().filter(u => u.companyId === companyId);
};

export const fetchCompanies = async (currentUser: User): Promise<Company[]> => {
    await delay(LATENCY);
    if (currentUser.role === 'super_admin') {
        return db.getCompanies();
    }
    return db.getCompanies().filter(c => c.id === currentUser.companyId);
};

// --- Projects ---
export const fetchAllProjects = async (currentUser: User): Promise<Project[]> => {
    return withErrorHandling(async () => {
        console.log('🏗️ Fetching projects for user:', currentUser.email, 'Company:', currentUser.companyId);

        // Data integrity check
        if (!currentUser.companyId) {
            throw new APIError('User company ID is required', 'VALIDATION_ERROR');
        }

        if (supabase) {
            const { data: projects, error } = await supabase
                .from('projects')
                .select(`
                    id,
                    name,
                    description,
                    status,
                    start_date,
                    end_date,
                    budget,
                    spent,
                    location,
                    company_id,
                    project_manager_id,
                    created_at,
                    updated_at
                `)
                .eq('company_id', currentUser.companyId);

            if (error) {
                console.error('❌ Error fetching projects:', error);
                throw error;
            }

            console.log('✅ Fetched projects:', projects?.length || 0);

            // Data integrity validation
            const validProjects = projects?.filter(p => {
                if (!p.id || !p.name || !p.company_id) {
                    console.warn('⚠️ Invalid project data:', p);
                    return false;
                }
                return true;
            }) || [];

            return validProjects.map(p => ({
                id: p.id,
                name: p.name,
                description: p.description || '',
                status: p.status,
                startDate: p.start_date,
                endDate: p.end_date,
                budget: p.budget,
                spent: p.spent || 0,
                location: p.location || '',
                companyId: p.company_id,
                projectManagerId: p.project_manager_id,
                createdAt: p.created_at,
                updatedAt: p.updated_at,
                image: '', // Default empty image
                contacts: [], // Default empty contacts
                snapshot: {
                    openRFIs: 0,
                    overdueTasks: 0,
                    pendingTMTickets: 0,
                    aiRiskLevel: 'low'
                } // Default snapshot
            }));
        } else {
            // Mock implementation with multi-tenant filtering
            await delay(LATENCY);
            if (currentUser.role === 'super_admin') {
                return db.getProjects();
            }
            return db.getProjects().filter(p => p.companyId === currentUser.companyId);
        }
    }, 'fetchAllProjects', []);
};

export const fetchProjectById = async (id: string, currentUser?: User): Promise<Project | null> => {
    console.log('🏗️ Fetching project by ID:', id, 'for user:', currentUser?.email);

    if (supabase && currentUser) {
        try {
            const { data: project, error } = await supabase
                .from('projects')
                .select(`
                    id,
                    name,
                    description,
                    status,
                    start_date,
                    end_date,
                    budget,
                    spent,
                    location,
                    company_id,
                    project_manager_id,
                    created_at,
                    updated_at
                `)
                .eq('id', id)
                .eq('company_id', currentUser.companyId) // Multi-tenant security
                .single();

            if (error) {
                console.error('❌ Error fetching project:', error);
                return null;
            }

            if (!project) {
                console.log('❌ Project not found or access denied');
                return null;
            }

            console.log('✅ Fetched project:', project.name);
            return {
                id: project.id,
                name: project.name,
                description: project.description || '',
                status: project.status,
                startDate: project.start_date,
                endDate: project.end_date,
                budget: project.budget,
                spent: project.spent || 0,
                location: project.location || '',
                companyId: project.company_id,
                projectManagerId: project.project_manager_id,
                createdAt: project.created_at,
                updatedAt: project.updated_at,
                image: '', // Default empty image
                contacts: [], // Default empty contacts
                snapshot: {
                    openRFIs: 0,
                    overdueTasks: 0,
                    pendingTMTickets: 0,
                    aiRiskLevel: 'low'
                } // Default snapshot
            };
        } catch (error) {
            console.error('❌ Error in fetchProjectById:', error);
            return null;
        }
    } else {
        // Mock implementation with multi-tenant check
        await delay(LATENCY);
        const project = db.findProject(id);

        // Multi-tenant security check for mock data
        if (project && currentUser && project.companyId !== currentUser.companyId && currentUser.role !== 'super_admin') {
            console.log('❌ Access denied to project from different company');
            return null;
        }

        return project;
    }
};

// --- Tasks ---
export const fetchTasksForProject = async (projectId: string, currentUser: User): Promise<Task[]> => {
    console.log('📋 Fetching tasks for project:', projectId, 'user:', currentUser.email);

    if (supabase) {
        try {
            // First verify the user has access to this project (multi-tenant check)
            const project = await fetchProjectById(projectId, currentUser);
            if (!project) {
                console.log('❌ Access denied to project tasks');
                return [];
            }

            const { data: tasks, error } = await supabase
                .from('tasks')
                .select(`
                    id,
                    title,
                    description,
                    status,
                    priority,
                    assigned_to,
                    due_date,
                    completed_at,
                    created_by,
                    project_id,
                    created_at,
                    updated_at
                `)
                .eq('project_id', projectId);

            if (error) {
                console.error('❌ Error fetching tasks:', error);
                throw error;
            }

            console.log('✅ Fetched tasks:', tasks?.length || 0);
            return tasks?.map(t => ({
                id: t.id,
                title: t.title,
                description: t.description || '',
                status: t.status,
                priority: t.priority,
                assignee: t.assigned_to || '',
                dueDate: t.due_date,
                completedAt: t.completed_at,
                createdBy: t.created_by,
                projectId: t.project_id,
                attachments: [], // Would need separate query for attachments
                comments: [], // Would need separate query for comments
                history: [], // Would need separate query for history
                targetRoles: [] // Would need to add this field to schema if needed
            })) || [];
        } catch (error) {
            console.error('❌ Error in fetchTasksForProject:', error);
            return [];
        }
    } else {
        // Mock implementation with multi-tenant check
        await delay(LATENCY);
        checkPermissions(currentUser, 'read', 'task');

        // Verify project access first
        const project = db.findProject(projectId);
        if (!project || (project.companyId !== currentUser.companyId && currentUser.role !== 'super_admin')) {
            console.log('❌ Access denied to project tasks (mock)');
            return [];
        }

        return db.getTasks().filter(t => t.projectId === projectId);
    }
};

export const fetchTasksForUser = async (user: User): Promise<Task[]> => {
    console.log('📋 Fetching tasks for user:', user.email);

    if (supabase) {
        try {
            const { data: tasks, error } = await supabase
                .from('tasks')
                .select(`
                    id,
                    title,
                    description,
                    status,
                    priority,
                    assigned_to,
                    due_date,
                    completed_at,
                    created_by,
                    project_id,
                    created_at,
                    updated_at,
                    projects!inner(company_id)
                `)
                .eq('assigned_to', user.id)
                .eq('projects.company_id', user.companyId); // Multi-tenant filter

            if (error) {
                console.error('❌ Error fetching user tasks:', error);
                throw error;
            }

            console.log('✅ Fetched user tasks:', tasks?.length || 0);
            return tasks?.map(t => ({
                id: t.id,
                title: t.title,
                description: t.description || '',
                status: t.status,
                priority: t.priority,
                assignee: t.assigned_to || '',
                dueDate: t.due_date,
                completedAt: t.completed_at,
                createdBy: t.created_by,
                projectId: t.project_id,
                attachments: [],
                comments: [],
                history: [],
                targetRoles: []
            })) || [];
        } catch (error) {
            console.error('❌ Error in fetchTasksForUser:', error);
            return [];
        }
    } else {
        // Mock implementation with multi-tenant filtering
        await delay(LATENCY);
        const userTasks = db.getTasks().filter(t => t.assignee === user.name || t.targetRoles?.includes(user.role));

        // Filter by company access
        return userTasks.filter(task => {
            const project = db.findProject(task.projectId);
            return project && (project.companyId === user.companyId || user.role === 'super_admin');
        });
    }
};

export const fetchTaskById = async (id: string, currentUser?: User): Promise<Task | null> => {
    console.log('📋 Fetching task by ID:', id, 'for user:', currentUser?.email);

    if (supabase && currentUser) {
        try {
            const { data: task, error } = await supabase
                .from('tasks')
                .select(`
                    id,
                    title,
                    description,
                    status,
                    priority,
                    assigned_to,
                    due_date,
                    completed_at,
                    created_by,
                    project_id,
                    created_at,
                    updated_at,
                    projects!inner(company_id)
                `)
                .eq('id', id)
                .eq('projects.company_id', currentUser.companyId) // Multi-tenant security
                .single();

            if (error) {
                console.error('❌ Error fetching task:', error);
                return null;
            }

            if (!task) {
                console.log('❌ Task not found or access denied');
                return null;
            }

            console.log('✅ Fetched task:', task.title);
            return {
                id: task.id,
                title: task.title,
                description: task.description || '',
                status: task.status,
                priority: task.priority,
                assignee: task.assigned_to || '',
                dueDate: task.due_date,
                completedAt: task.completed_at,
                createdBy: task.created_by,
                projectId: task.project_id,
                attachments: [],
                comments: [],
                history: [],
                targetRoles: []
            };
        } catch (error) {
            console.error('❌ Error in fetchTaskById:', error);
            return null;
        }
    } else {
        // Mock implementation with multi-tenant check
        await delay(LATENCY);
        const task = db.findTask(id);

        if (task && currentUser) {
            // Verify user has access to this task's project
            const project = db.findProject(task.projectId);
            if (!project || (project.companyId !== currentUser.companyId && currentUser.role !== 'super_admin')) {
                console.log('❌ Access denied to task from different company');
                return null;
            }
        }

        return task;
    }
};

export const createTask = async (taskData: Omit<Task, 'id' | 'comments' | 'history'>, creator: User): Promise<Task> => {
    return withErrorHandling(async () => {
        await delay(LATENCY);
        checkPermissions(creator, 'create', 'task');

        // Data integrity checks
        if (!taskData.title || taskData.title.trim().length === 0) {
            throw new APIError('Task title is required', 'VALIDATION_ERROR');
        }
        if (taskData.title.length > 200) {
            throw new APIError('Task title must be less than 200 characters', 'VALIDATION_ERROR');
        }
        if (!taskData.projectId) {
            throw new APIError('Project ID is required', 'VALIDATION_ERROR');
        }

        // Verify project exists and user has access
        const project = db.findProject(taskData.projectId);
        if (!project) {
            throw new APIError('Project not found', 'NOT_FOUND');
        }
        if (project.companyId !== creator.companyId && creator.role !== 'super_admin') {
            throw new APIError('Access denied to project', 'PERMISSION_DENIED');
        }

        // Validate due date
        if (taskData.dueDate) {
            const dueDate = new Date(taskData.dueDate);
            if (isNaN(dueDate.getTime())) {
                throw new APIError('Invalid due date', 'VALIDATION_ERROR');
            }
            if (dueDate < new Date()) {
                throw new APIError('Due date cannot be in the past', 'VALIDATION_ERROR');
            }
        }

        // Validate priority
        if (taskData.priority && !['Low', 'Medium', 'High', 'Critical'].includes(taskData.priority)) {
            throw new APIError('Invalid priority level', 'VALIDATION_ERROR');
        }

        const newTask: Task = {
            id: `task-${Date.now()}`,
            comments: [],
            history: [{
                timestamp: new Date().toISOString(),
                author: creator.name,
                change: 'Created task.'
            }],
            ...taskData
        };
        db.addTask(newTask);

        // If task is assigned to a role, notify all users with that role in the company
        if (newTask.targetRoles && newTask.targetRoles.length > 0) {
            const usersToNotify = db.getUsers().filter(u =>
                u.companyId === project.companyId &&
                newTask.targetRoles?.includes(u.role)
            );

            usersToNotify.forEach(user => {
                  db.addNotification({
                     userId: user.id,
                     message: `New task for your role (${newTask.targetRoles?.join(', ')}): "${newTask.title}"`,
                     timestamp: new Date().toISOString(),
                     read: false,
                     link: { projectId: newTask.projectId, screen: 'task-detail', params: { taskId: newTask.id } }
                 });
            });
        }

        return newTask;
    }, 'createTask');
};

export const updateTask = async (updatedTask: Task, user: User): Promise<Task> => {
    await delay(LATENCY);
    checkPermissions(user, 'update', 'task');
    const { task: originalTask, index } = db.findTaskAndIndex(updatedTask.id);
    
    if (index !== -1 && originalTask) {
        const taskWithHistory = { ...updatedTask };
        if (!taskWithHistory.history) {
            taskWithHistory.history = originalTask.history ? [...originalTask.history] : [];
        }

        // Log status change
        if (originalTask.status !== taskWithHistory.status) {
            // Business logic: a Foreman or operative cannot move a task backward from "In Progress"
            if ((user.role === 'Foreman' || user.role === 'operative') && originalTask.status === 'In Progress' && taskWithHistory.status === 'To Do') {
                throw new Error('You do not have permission to move this task back to "To Do".');
            }

            taskWithHistory.history.push({
                timestamp: new Date().toISOString(),
                author: user.name,
                change: `Changed status from ${originalTask.status} to ${taskWithHistory.status}.`
            });

            const project = db.findProject(taskWithHistory.projectId);
            const activity: ActivityEvent = {
                id: `ae-${Date.now()}`,
                type: 'status_change',
                author: user.name,
                description: `updated task "${taskWithHistory.title}" to ${taskWithHistory.status}.`,
                timestamp: new Date().toISOString(),
                projectId: taskWithHistory.projectId,
                projectName: project?.name || 'Unknown Project',
                link: { screen: 'task-detail', params: { taskId: taskWithHistory.id } }
            };
            db.addActivityEvent(activity);
        }

        // Log assignee change
        const formatAssigneeString = (task: Task): string => {
            if (task.assignee) return task.assignee;
            if (task.targetRoles && task.targetRoles.length > 0) return `Role: ${task.targetRoles[0]}`;
            return 'Unassigned';
        };

        const originalAssignee = formatAssigneeString(originalTask);
        const updatedAssignee = formatAssigneeString(taskWithHistory);
        if (originalAssignee !== updatedAssignee) {
            taskWithHistory.history.push({
                timestamp: new Date().toISOString(),
                author: user.name,
                change: `Changed assignee from ${originalAssignee} to ${updatedAssignee}.`
            });
        }
        
        db.updateTaskInDb(index, taskWithHistory);
        return taskWithHistory;
    }
    return updatedTask;
};

export const addCommentToTask = async (taskId: string, text: string, attachments: Attachment[], author: User): Promise<Comment> => {
    await delay(LATENCY);
    const newComment: Comment = {
        id: `c-${Date.now()}`,
        author: author.name,
        timestamp: new Date().toISOString(),
        text,
        attachments
    };
    const task = db.addCommentToTaskInDb(taskId, newComment);
    
    if (task) {
        const project = db.findProject(task.projectId);
        const activity: ActivityEvent = {
            id: `ae-${Date.now()}`,
            type: 'comment',
            author: author.name,
            description: `commented on task "${task.title}".`,
            timestamp: new Date().toISOString(),
            projectId: task.projectId,
            projectName: project?.name || 'Unknown Project',
            link: { screen: 'task-detail', params: { taskId: task.id } }
        };
        db.addActivityEvent(activity);
    }
    
    return newComment;
};

// --- RFIs ---
export const fetchRFIsForProject = async (projectId: string): Promise<RFI[]> => {
    await delay(LATENCY);
    return db.getRFIs().filter(r => r.projectId === projectId);
};

export const fetchRFIById = async (id: string): Promise<RFI | null> => {
    await delay(LATENCY);
    return db.findRFI(id);
};

export const fetchRFIVersions = async (rfiNumber: string): Promise<RFI[]> => {
    await delay(LATENCY);
    return db.getRFIs().filter(r => r.rfiNumber === rfiNumber).sort((a, b) => a.version - b.version);
};

export const createRFI = async (rfiData: Omit<RFI, 'id' | 'rfiNumber' | 'version' | 'comments'| 'answeredBy' | 'dueDateNotified' | 'response' | 'createdBy' | 'history' | 'responseAttachments'>, createdBy: User): Promise<RFI> => {
    await delay(LATENCY);
    checkPermissions(createdBy, 'create', 'rfi');
    
    const projectRFIs = db.getRFIs().filter(r => r.projectId === rfiData.projectId);
    const nextRfiNum = `RFI-${String(projectRFIs.length + 1).padStart(3, '0')}`;
    
    const newRFI: RFI = {
        id: `rfi-${Date.now()}`,
        rfiNumber: nextRfiNum,
        version: 1,
        comments: [],
        createdBy: createdBy.id,
        dueDateNotified: false,
        history: [{
            timestamp: new Date().toISOString(),
            author: createdBy.name,
            change: 'Created RFI.'
        }],
        ...rfiData
    };
    db.addRFI(newRFI);
    return newRFI;
};

export const updateRFI = async (rfiId: string, updates: Partial<Pick<RFI, 'question' | 'attachments'>>, user: User): Promise<RFI> => {
    await delay(LATENCY);
    checkPermissions(user, 'update', 'rfi');
    const originalRfi = db.findRFI(rfiId);
    if (!originalRfi) {
        throw new Error('RFI not found');
    }

    const newVersion: RFI = {
        ...originalRfi,
        id: `rfi-${Date.now()}`,
        version: originalRfi.version + 1,
        ...updates,
        history: [
            ...(originalRfi.history || []),
            {
                timestamp: new Date().toISOString(),
                author: user.name,
                change: `Updated RFI to version ${originalRfi.version + 1}.`,
            },
        ],
    };

    db.addRFI(newVersion);
    return newVersion;
};


export const addCommentToRFI = async (rfiId: string, text: string, author: User): Promise<Comment> => {
    await delay(LATENCY);
    const newComment: Comment = {
        id: `c-${Date.now()}`,
        author: author.name,
        timestamp: new Date().toISOString(),
        text
    };
    const rfi = db.addCommentToRFIInDb(rfiId, newComment);

    if (rfi) {
        const project = db.findProject(rfi.projectId);
        const activity: ActivityEvent = {
            id: `ae-${Date.now()}`,
            type: 'comment',
            author: author.name,
            description: `commented on RFI "${rfi.subject}".`,
            timestamp: new Date().toISOString(),
            projectId: rfi.projectId,
            projectName: project?.name || 'Unknown Project',
            link: { screen: 'rfi-detail', params: { rfiId: rfi.id } }
        };
        db.addActivityEvent(activity);
    }

    return newComment;
};

export const addAnswerToRFI = async (rfiId: string, answer: string, attachments: Attachment[], author: User): Promise<RFI | null> => {
    await delay(LATENCY);
    checkPermissions(author, 'update', 'rfi');
    const rfi = db.findRFI(rfiId);
    if (rfi) {
        rfi.response = answer;
        rfi.answeredBy = author.name;
        rfi.status = 'Closed';
        rfi.responseAttachments = attachments;

        if (!rfi.history) {
            rfi.history = [];
        }
        rfi.history.push({
            timestamp: new Date().toISOString(),
            author: author.name,
            change: 'Answered RFI and changed status to Closed.'
        });


        // Notify the creator
        if (rfi.createdBy) {
            db.addNotification({
                userId: rfi.createdBy,
                message: `Your RFI "${rfi.subject}" has been answered.`,
                timestamp: new Date().toISOString(),
                read: false,
                link: { projectId: rfi.projectId, screen: 'rfi-detail', params: { rfiId: rfi.id } }
            });
        }
        return rfi;
    }
    return null;
}

// --- Punch List ---
export const fetchPunchListItemsForProject = async (projectId: string): Promise<PunchListItem[]> => {
    await delay(LATENCY);
    return db.getPunchListItems().filter(i => i.projectId === projectId);
};

export const fetchPunchListItemById = async (id: string): Promise<PunchListItem | null> => {
    await delay(LATENCY);
    return db.findPunchListItem(id);
};

export const createPunchListItem = async (itemData: Omit<PunchListItem, 'id' | 'comments' | 'history'>, creator: User): Promise<PunchListItem> => {
    await delay(LATENCY);
    checkPermissions(creator, 'create', 'punchListItem');
    const newItem: PunchListItem = {
        id: `pl-${Date.now()}`,
        comments: [],
        history: [{
            timestamp: new Date().toISOString(),
            author: creator.name,
            change: 'Created item.'
        }],
        ...itemData
    };
    db.addPunchListItem(newItem);
    return newItem;
};

export const updatePunchListItem = async (updatedItem: PunchListItem, user: User): Promise<PunchListItem> => {
    await delay(LATENCY);
    checkPermissions(user, 'update', 'punchListItem');
    const { index, item: originalItem } = db.findPunchListItemAndIndex(updatedItem.id);
    if (index !== -1 && originalItem) {
        const itemWithHistory = { ...updatedItem };
        if (!itemWithHistory.history) {
            itemWithHistory.history = originalItem.history ? [...originalItem.history] : [];
        }

        // Log status change
        if (originalItem.status !== itemWithHistory.status) {
            itemWithHistory.history.push({
                timestamp: new Date().toISOString(),
                author: user.name,
                change: `Changed status from ${originalItem.status} to ${itemWithHistory.status}.`
            });
        }

        // Log assignee change
        if (originalItem.assignee !== itemWithHistory.assignee) {
             itemWithHistory.history.push({
                timestamp: new Date().toISOString(),
                author: user.name,
                change: `Changed assignee from ${originalItem.assignee} to ${itemWithHistory.assignee}.`
            });
        }

        db.updatePunchListItemInDb(index, itemWithHistory);
        return itemWithHistory;
    }
    throw new Error('Could not update punch list item.');
};

export const addCommentToPunchListItem = async (itemId: string, text: string, author: User): Promise<Comment> => {
    await delay(LATENCY);
    const newComment: Comment = {
        id: `c-${Date.now()}`,
        author: author.name,
        timestamp: new Date().toISOString(),
        text
    };
    const item = db.addCommentToPunchListItemInDb(itemId, newComment);
    if (item) {
        const project = db.findProject(item.projectId);
        const activity: ActivityEvent = {
            id: `ae-${Date.now()}`,
            type: 'comment',
            author: author.name,
            description: `commented on punch list item "${item.title}".`,
            timestamp: new Date().toISOString(),
            projectId: item.projectId,
            projectName: project?.name || 'Unknown Project',
            link: { screen: 'punch-list-item-detail', params: { itemId: item.id } }
        };
        db.addActivityEvent(activity);
    }
    return newComment;
};


// --- Drawings, Documents, etc. ---
export const fetchDrawings = async (): Promise<Drawing[]> => {
    await delay(LATENCY);
    return db.getDrawings();
};

export const createDrawing = async (projectId: string, drawingData: { drawingNumber: string; title: string; date: string; file: File }, creator: User): Promise<Drawing> => {
    await delay(LATENCY);
    checkPermissions(creator, 'create', 'drawing');

    const existingDrawings = db.getDrawings().filter(d => d.projectId === projectId && d.drawingNumber === drawingData.drawingNumber);
    const latestRevision = existingDrawings.reduce((max, d) => Math.max(max, d.revision), -1);

    const tags = await analyzeDrawingAndGenerateTags({ title: drawingData.title, number: drawingData.drawingNumber });

    const newDrawing: Drawing = {
        id: `dwg-${Date.now()}`,
        projectId,
        drawingNumber: drawingData.drawingNumber,
        title: drawingData.title,
        revision: latestRevision + 1,
        date: drawingData.date,
        url: '/sample.pdf', // In real app, this would be a storage URL
        tags: tags,
    };
    db.addDrawing(newDrawing);
    return newDrawing;
};

export const fetchDocuments = async (): Promise<Document[]> => {
    await delay(LATENCY);
    return db.getDocuments();
};

export const fetchSiteInstructions = async (): Promise<SiteInstruction[]> => {
    await delay(LATENCY);
    return db.getSiteInstructions();
};

export const fetchDeliveryItems = async (): Promise<DeliveryItem[]> => {
    await delay(LATENCY);
    return db.getDeliveryItems();
};

// --- Daywork Sheets (T&M) ---
export const fetchDayworkSheetsForProject = async (projectId: string): Promise<DayworkSheet[]> => {
    await delay(LATENCY);
    return db.getDayworkSheets().filter(s => s.projectId === projectId);
};

export const fetchDayworkSheetById = async (id: string): Promise<DayworkSheet | null> => {
    await delay(LATENCY);
    return db.findDayworkSheet(id);
};

export const createDayworkSheet = async (sheetData: Omit<DayworkSheet, 'id' | 'ticketNumber' | 'status' | 'items' | 'approvedBy' | 'approvedDate'>, creator: User): Promise<DayworkSheet> => {
    await delay(LATENCY);
    checkPermissions(creator, 'create', 'dayworkSheet');

    const projectSheets = db.getDayworkSheets().filter(s => s.projectId === sheetData.projectId);
    const nextTicketNum = `T&M-${String(projectSheets.length + 1).padStart(3, '0')}`;

    const newSheet: DayworkSheet = {
        id: `dws-${Date.now()}`,
        ticketNumber: nextTicketNum,
        status: 'Pending',
        items: [],
        approvedBy: null,
        approvedDate: null,
        ...sheetData
    };

    db.addDayworkSheet(newSheet);
    db.addDayworkLedgerItem(newSheet); // Add to company ledger
    return newSheet;
};

export const updateDayworkSheetStatus = async (sheetId: string, status: 'Approved' | 'Rejected', user: User): Promise<DayworkSheet | null> => {
    await delay(LATENCY);
    checkPermissions(user, 'approve', 'dayworkSheet');
    const sheet = db.findDayworkSheet(sheetId);
    if (sheet && sheet.status === 'Pending') {
        sheet.status = status;
        if (status === 'Approved') {
            sheet.approvedBy = user.name;
            sheet.approvedDate = new Date().toISOString();
        }
        return sheet;
    }
    return null;
};

// --- Daily Logs ---
export const fetchDailyLogForUser = async (userId: string, date: string): Promise<DailyLog | null> => {
    await delay(LATENCY);
    return db.findDailyLogsForUserAndDate(userId, date) || null;
};

export const createDailyLog = async (logData: Omit<DailyLog, 'id' | 'submittedAt'>, creator: User): Promise<DailyLog> => {
    await delay(LATENCY);
    checkPermissions(creator, 'create', 'dailyLog');
    const newLog: DailyLog = {
        id: `log-${Date.now()}`,
        submittedAt: new Date().toISOString(),
        ...logData
    };
    db.addDailyLog(newLog);
    const project = db.findProject(newLog.projectId);
    db.addActivityEvent({
        id: `ae-${Date.now()}`,
        type: 'log_submitted',
        author: creator.name,
        description: `submitted a daily log.`,
        timestamp: new Date().toISOString(),
        projectId: newLog.projectId,
        projectName: project?.name || 'Unknown Project',
        link: { screen: 'daily-log', params: {} } // Needs a way to link to a specific log
    });
    return newLog;
};

// --- Time Tracking ---
export const fetchTimeEntriesForUser = async (userId: string): Promise<TimeEntry[]> => {
    await delay(LATENCY);
    return db.getTimeEntries().filter(e => e.userId === userId);
};

export const startTimeEntry = async (taskId: string, projectId: string, userId: string): Promise<TimeEntry> => {
    await delay(LATENCY);
    const newEntry: TimeEntry = {
        id: `te-${Date.now()}`,
        projectId,
        taskId,
        userId,
        startTime: new Date().toISOString(),
        endTime: null,
    };
    db.addTimeEntry(newEntry);
    return newEntry;
};

export const stopTimeEntry = async (entryId: string): Promise<TimeEntry> => {
    await delay(LATENCY);
    const updatedEntry = db.updateTimeEntryInDb(entryId, { endTime: new Date().toISOString() });
    if (!updatedEntry) throw new Error("Could not find time entry to stop.");
    return updatedEntry;
};

// --- Notifications & Activity ---
export const fetchNotificationsForUser = async (currentUser: User): Promise<Notification[]> => {
    await delay(LATENCY);
    return db.getNotifications()
        .filter(n => n.userId === currentUser.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const markNotificationsAsRead = async (ids: string[], currentUser: User): Promise<void> => {
    await delay(LATENCY / 2);
    // In a real app, you'd also check ownership here on the backend
    db.markNotificationsAsReadInDb(ids);
};

export const fetchRecentActivity = async (currentUser: User): Promise<ActivityEvent[]> => {
    await delay(LATENCY);
    const userProjects = db.getProjects().filter(p => p.companyId === currentUser.companyId).map(p => p.id);
    return db.getActivityEvents()
        .filter(event => userProjects.includes(event.projectId))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const checkAndCreateDueDateNotifications = async (currentUser: User): Promise<void> => {
    await delay(LATENCY);
    const userTasks = db.getTasks().filter(t => 
        (t.assignee === currentUser.name || t.targetRoles?.includes(currentUser.role)) &&
        t.status !== 'Done' &&
        !t.dueDateNotified
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    userTasks.forEach(task => {
        const dueDate = new Date(task.dueDate);
        const timeDiff = dueDate.getTime() - today.getTime();
        const daysUntilDue = Math.ceil(timeDiff / (1000 * 3600 * 24));

        let shouldNotify = false;
        let message = '';

        if (daysUntilDue < 0) {
            shouldNotify = true;
            message = `Task "${task.title}" is overdue by ${Math.abs(daysUntilDue)} day(s).`;
        } else if (daysUntilDue <= 3) {
            shouldNotify = true;
            message = `Task "${task.title}" is due in ${daysUntilDue} day(s).`;
        }

        if (shouldNotify) {
            db.addNotification({
                userId: currentUser.id,
                message: message,
                timestamp: new Date().toISOString(),
                read: false,
                link: { projectId: task.projectId, screen: 'task-detail', params: { taskId: task.id } }
            });
            const { index } = db.findTaskAndIndex(task.id);
            if (index !== -1) {
                db.updateTaskInDb(index, { ...task, dueDateNotified: true });
            }
        }
    });
};


// --- AI Features ---

export const getAISuggestedAction = async (user: User): Promise<AISuggestion | null> => {
    await delay(LATENCY * 4);

    const feedback = db.getAIFeedbackForUser(user.id);
    const dislikesOverdue = feedback.filter(f => f.feedback === 'down' && f.suggestionReason.includes('overdue')).length > 2;

    const userTasks = db.getTasks().filter(t => (t.assignee === user.name || t.targetRoles?.includes(user.role)) && t.status !== 'Done');
    const overdueTasks = userTasks.filter(t => new Date(t.dueDate) < new Date());

    if (overdueTasks.length > 0) {
        const task = overdueTasks[0];
        if (dislikesOverdue) {
             return {
                title: 'Help Unblock a Task',
                reason: `Task "${task.title}" is overdue. Sometimes adding a photo or a comment can help clarify the issue.`,
                action: {
                    label: 'Add Comment/Photo',
                    link: { projectId: task.projectId, screen: 'task-detail', params: { taskId: task.id } }
                }
            };
        }
        return {
            title: 'Focus on Overdue Task',
            reason: `Your task "${task.title}" is overdue. It's a high priority.`,
            action: {
                label: 'View Task',
                link: { projectId: task.projectId, screen: 'task-detail', params: { taskId: task.id } }
            }
        };
    }
    
    const pendingRFIs = db.getRFIs().filter(rfi => rfi.createdBy === user.id && rfi.status === 'Open');
    if (pendingRFIs.length > 0) {
        const rfi = pendingRFIs[0];
        return {
            title: 'Follow up on RFI',
            reason: `You're waiting for a response on "${rfi.subject}".`,
            action: {
                label: 'View RFI',
                link: { projectId: rfi.projectId, screen: 'rfi-detail', params: { rfiId: rfi.id } }
            }
        };
    }
    
    return null;
};

export const getAIInsightsForMyDay = async (tasks: Task[], project: Project, weather: any): Promise<AIInsight[]> => {
    await delay(LATENCY * 3);
    const insights: AIInsight[] = [];
    const overdue = tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'Done');
    if (overdue.length > 0) {
        insights.push({
            type: 'risk',
            title: 'Overdue Task Alert',
            message: `You have ${overdue.length} overdue task(s). Prioritize "${overdue[0].title}" to avoid project delays.`
        });
    }
    
    if (weather.condition.toLowerCase().includes('rain')) {
         insights.push({
            type: 'alert',
            title: 'Weather Alert: Rain',
            message: 'Rain is in the forecast. Ensure all materials are covered and site is secure.'
        });
    }

    if (tasks.length > 5) {
         insights.push({
            type: 'tip',
            title: 'Productivity Tip',
            message: 'You have a busy day! Tackle your highest priority task first to build momentum.'
        });
    }
    
    return insights;
};

export const submitAIFeedback = async (suggestion: AISuggestion, feedback: 'up' | 'down', user: User): Promise<void> => {
    await delay(LATENCY);
    const feedbackItem: AIFeedback = {
        id: `fb-${Date.now()}`,
        suggestionTitle: suggestion.title,
        suggestionReason: suggestion.reason,
        feedback,
        timestamp: new Date().toISOString(),
        userId: user.id
    };
    db.addAIFeedback(feedbackItem);
};

export const getAITaskSuggestions = async (description: string, allUsers: User[]): Promise<{ suggestedAssigneeIds: string[], suggestedDueDate: string, photosRecommended: boolean } | null> => {
    const prompt = `
        Analyze the following task description and suggest an assignee, due date, and if photos are recommended.
        Description: "${description}"

        Available Users and their roles:
        ${allUsers.map(u => `- ${u.name} (ID: ${u.id}, Role: ${u.role})`).join('\n')}

        Keywords for roles:
        - Plumbing, electrical, mechanical, HVAC: Suggest an 'operative'.
        - Inspection, safety, hazard: Suggest a 'Safety Officer'.
        - Coordination, schedule, meeting, report: Suggest a 'Project Manager'.
        - Installation, drywall, concrete, framing, site work: Suggest a 'Foreman'.
        
        Keywords for photos:
        - install, inspect, repair, verify, existing condition, damage, complete

        Due Date Logic:
        - If it mentions "today" or "ASAP", suggest today's date.
        - If it mentions "tomorrow", suggest tomorrow's date.
        - If it mentions "end of week", suggest the coming Friday.
        - Otherwise, suggest 3 days from now.

        Current date: ${new Date().toISOString().split('T')[0]}

        Respond ONLY with a JSON object in the format:
        {
          "suggestedAssigneeIds": ["user-id-1", "user-id-2"],
          "suggestedDueDate": "YYYY-MM-DD",
          "photosRecommended": boolean
        }
        If you cannot determine a value, use an empty array, empty string, or false.
        The suggestedAssigneeIds should be ordered from most to least likely.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestedAssigneeIds: { type: Type.ARRAY, items: { type: Type.STRING } },
                        suggestedDueDate: { type: Type.STRING },
                        photosRecommended: { type: Type.BOOLEAN }
                    }
                }
            }
        });

        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr);

    } catch (e) {
        console.error("Gemini API call failed", e);
        return null;
    }
};

// --- BuilderKit & Automations ---

export const fetchWorkflowTemplates = async (): Promise<WorkflowTemplate[]> => {
    const response = await apiRequest<{ success?: boolean; templates?: unknown[] }>('/workflows/templates');
    const templates = Array.isArray(response?.templates) ? response.templates : Array.isArray(response) ? response : [];
    return templates.map(mapWorkflowTemplateRecord);
};

export const fetchBuilderBlocks = async (): Promise<any[]> => {
    const response = await apiRequest<{ success?: boolean; blocks?: any[] }>('/workflows/builder/blocks');
    return Array.isArray(response?.blocks) ? response.blocks : [];
};

export const fetchCompanyWorkflows = async (options: { includeInactive?: boolean; companyId?: string } = {}): Promise<Workflow[]> => {
    const params = new URLSearchParams();
    if (options.includeInactive === false) {
        params.set('includeInactive', 'false');
    }
    if (options.companyId) {
        params.set('companyId', options.companyId);
    }
    const response = await apiRequest<{ success?: boolean; workflows?: unknown[] }>(`/workflows${params.toString() ? `?${params.toString()}` : ''}`);
    const workflows = Array.isArray(response?.workflows) ? response.workflows : Array.isArray(response) ? response : [];
    return workflows.map(mapWorkflowRecord);
};

export const createCompanyWorkflow = async (payload: { name: string; description?: string; definition: Record<string, unknown> }): Promise<Workflow> => {
    const response = await apiRequest<{ success?: boolean; workflow?: unknown }>(
        '/workflows',
        {
            method: 'POST',
            body: JSON.stringify(payload)
        }
    );
    const workflow = (response as any).workflow ?? response;
    return mapWorkflowRecord(workflow);
};

export const updateCompanyWorkflow = async (
    workflowId: string,
    updates: Partial<{ name: string; description: string; definition: Record<string, unknown>; version: string; isActive: boolean }>
): Promise<Workflow> => {
    const response = await apiRequest<{ success?: boolean; workflow?: unknown }>(
        `/workflows/${workflowId}`,
        {
            method: 'PUT',
            body: JSON.stringify(updates)
        }
    );
    const workflow = (response as any).workflow ?? response;
    return mapWorkflowRecord(workflow);
};

export const toggleWorkflowActivation = async (workflowId: string, isActive: boolean): Promise<Workflow> => {
    const endpoint = isActive ? `/workflows/${workflowId}/activate` : `/workflows/${workflowId}/deactivate`;
    const response = await apiRequest<{ success?: boolean; workflow?: unknown }>(endpoint, { method: 'POST' });
    const workflow = (response as any).workflow ?? response;
    return mapWorkflowRecord(workflow);
};

export const runWorkflowNow = async (
    workflowId: string,
    payload: { input?: Record<string, unknown>; trigger?: Record<string, unknown> } = {}
): Promise<WorkflowRun> => {
    const response = await apiRequest<{ success?: boolean; run?: unknown }>(
        `/workflows/${workflowId}/run`,
        {
            method: 'POST',
            body: JSON.stringify(payload)
        }
    );
    const run = (response as any).run ?? response;
    return mapWorkflowRunRecord(run);
};

export const fetchWorkflowRuns = async (workflowId: string, limit = 20): Promise<WorkflowRun[]> => {
    const response = await apiRequest<{ success?: boolean; runs?: unknown[] }>(`/workflows/${workflowId}/runs?limit=${limit}`);
    const runs = Array.isArray(response?.runs) ? response.runs : Array.isArray(response) ? response : [];
    return runs.map(mapWorkflowRunRecord);
};

export const fetchAutomationRules = async (): Promise<AutomationRule[]> => {
    const response = await apiRequest<{ success?: boolean; rules?: unknown[] }>('/automations');
    const rules = Array.isArray(response?.rules) ? response.rules : Array.isArray(response) ? response : [];
    return rules.map(mapAutomationRuleRecord);
};

export const createAutomationRule = async (payload: {
    name: string;
    description?: string;
    triggerType: string;
    triggerConfig?: Record<string, unknown>;
    actionType: string;
    actionConfig?: Record<string, unknown>;
}): Promise<AutomationRule> => {
    const response = await apiRequest<{ success?: boolean; rule?: unknown }>(
        '/automations',
        {
            method: 'POST',
            body: JSON.stringify(payload)
        }
    );
    const rule = (response as any).rule ?? response;
    return mapAutomationRuleRecord(rule);
};

export const updateAutomationRule = async (
    ruleId: string,
    updates: Partial<{ name: string; description: string; triggerType: string; triggerConfig: Record<string, unknown>; actionType: string; actionConfig: Record<string, unknown>; isActive: boolean }>
): Promise<AutomationRule> => {
    const response = await apiRequest<{ success?: boolean; rule?: unknown }>(
        `/automations/${ruleId}`,
        {
            method: 'PATCH',
            body: JSON.stringify(updates)
        }
    );
    const rule = (response as any).rule ?? response;
    return mapAutomationRuleRecord(rule);
};

export const deleteAutomationRule = async (ruleId: string): Promise<void> => {
    await apiRequest(`/automations/${ruleId}`, { method: 'DELETE' });
};

export const testAutomationRule = async (ruleId: string, payload?: Record<string, unknown>): Promise<{ eventId: string; status: string }> => {
    const response = await apiRequest<{ success?: boolean; result?: { eventId: string; status: string } }>(
        `/automations/${ruleId}/test`,
        {
            method: 'POST',
            body: JSON.stringify({ payload })
        }
    );
    return (response as any).result ?? { eventId: '', status: 'success' };
};

export const fetchAutomationEvents = async (ruleId: string): Promise<AutomationEvent[]> => {
    const response = await apiRequest<{ success?: boolean; events?: unknown[] }>(`/automations/${ruleId}/events`);
    const events = Array.isArray(response?.events) ? response.events : Array.isArray(response) ? response : [];
    return events.map(mapAutomationEventRecord);
};

export const fetchAgentCatalog = async (): Promise<AgentCatalogItem[]> => {
    const response = await apiRequest<{ success?: boolean; agents?: unknown[] }>('/agentkit/catalog');
    const agents = Array.isArray(response?.agents) ? response.agents : Array.isArray(response) ? response : [];
    return agents.map(mapAgentCatalogRecord);
};

export const fetchCompanyAgents = async (): Promise<{ agents: AgentCatalogItem[]; subscriptions: any[] }> => {
    const response = await apiRequest<{ success?: boolean; agents?: unknown[]; subscriptions?: any[] }>('/agentkit/agents');
    const agents = Array.isArray(response?.agents) ? response.agents : [];
    return {
        agents: agents.map(mapAgentCatalogRecord),
        subscriptions: Array.isArray(response?.subscriptions) ? response.subscriptions : []
    };
};

export const subscribeAgentViaApi = async (agentId: string, options: { companyId?: string } = {}): Promise<AgentCatalogItem> => {
    const response = await apiRequest<{ success?: boolean; agent?: unknown }>(
        `/agentkit/agents/${agentId}/subscribe`,
        {
            method: 'POST',
            body: JSON.stringify(options)
        }
    );
    const agent = (response as any).agent ?? response;
    return mapAgentCatalogRecord(agent);
};

export const unsubscribeAgent = async (agentId: string): Promise<void> => {
    await apiRequest(`/agentkit/agents/${agentId}`, { method: 'DELETE' });
};

export const runAgentExecution = async (agentId: string, payload: { input?: Record<string, unknown>; trigger?: Record<string, unknown> } = {}): Promise<AgentExecution> => {
    const response = await apiRequest<{ success?: boolean; execution?: unknown }>(
        `/agentkit/agents/${agentId}/run`,
        {
            method: 'POST',
            body: JSON.stringify(payload)
        }
    );
    const execution = (response as any).execution ?? response;
    return mapAgentExecutionRecord(execution);
};

export const fetchAgentExecutions = async (agentId: string, limit = 25): Promise<AgentExecution[]> => {
    const response = await apiRequest<{ success?: boolean; executions?: unknown[] }>(`/agentkit/agents/${agentId}/executions?limit=${limit}`);
    const executions = Array.isArray(response?.executions) ? response.executions : Array.isArray(response) ? response : [];
    return executions.map(mapAgentExecutionRecord);
};

export const getAIRFISuggestions = async (subject: string, question: string, possibleAssignees: string[]): Promise<{ suggestedAssignee: string, suggestedDueDate: string } | null> => {
    await delay(LATENCY * 4);
    // Mock AI logic
    let suggestedAssignee = '';
    const text = (subject + ' ' + question).toLowerCase();
    if (text.includes('structural') || text.includes('beam') || text.includes('column') || text.includes('foundation')) {
        suggestedAssignee = 'Structural Engineer';
    } else if (text.includes('architectural') || text.includes('finish') || text.includes('window') || text.includes('door')) {
        suggestedAssignee = 'Architect Team';
    } else if (text.includes('hvac') || text.includes('plumbing') || text.includes('electrical')) {
        suggestedAssignee = 'MEP Consultant';
    }
    
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    return {
        suggestedAssignee: possibleAssignees.includes(suggestedAssignee) ? suggestedAssignee : '',
        suggestedDueDate: dueDate.toISOString().split('T')[0]
    };
};

export const analyzeDrawingAndGenerateTags = async (drawing: { title: string, number: string }): Promise<string[]> => {
    const prompt = `
        Analyze the following drawing title and number to generate relevant search tags.
        Title: "${drawing.title}"
        Number: "${drawing.number}"

        Rules:
        - Extract the discipline (e.g., Architectural, Structural, Mechanical, Electrical, Plumbing, Civil). The discipline is usually the first letter of the drawing number (A, S, M, E, P, C).
        - Extract keywords from the title (e.g., "Floor Plan", "Elevation", "Section", "Details", "Framing", "Site Plan").
        - Extract the floor or level number if present (e.g., "Level 1", "Floor 10", "Roof").
        - If the title contains "For Construction" or "Permit Set", add those as tags.
        - Keep tags concise (1-2 words). Capitalize the first letter of each word.

        Respond ONLY with a JSON array of strings, like this:
        ["Tag 1", "Tag 2", "Tag 3"]
    `;
    
     try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                 responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });
        
        const jsonStr = response.text.trim();
        const aiTags = JSON.parse(jsonStr);

        // If AI returns an empty array, trigger the fallback.
        if (!aiTags || aiTags.length === 0) {
            throw new Error("AI returned no tags.");
        }
        return aiTags;

    } catch (e) {
        console.warn("Gemini API call for drawing analysis failed or returned empty. Using fallback tagging.", e);
        
        // Robust Fallback Logic
        const tags = new Set<string>();
        const combinedText = `${drawing.title} ${drawing.number}`.toLowerCase();

        // 1. Discipline Tagging
        const disciplineMap: {[key: string]: string} = {'A': 'Architectural', 'S': 'Structural', 'M': 'Mechanical', 'E': 'Electrical', 'P': 'Plumbing', 'C': 'Civil'};
        const firstLetter = drawing.number.charAt(0).toUpperCase();
        if (disciplineMap[firstLetter]) {
            tags.add(disciplineMap[firstLetter]);
        }

        // 2. Level/Floor Tagging
        const levelRegex = /(?:level|floor|lvl)[\s-]*(\d+)/i;
        const levelMatch = combinedText.match(levelRegex);
        if (levelMatch && levelMatch[1]) {
            tags.add(`Level ${levelMatch[1]}`);
        }

        // 3. Keyword Tagging
        const keywords = ["Floor Plan", "Elevation", "Section", "Details", "Framing", "Site Plan", "Roof", "Foundation", "For Construction", "Permit Set"];
        keywords.forEach(keyword => {
            if (combinedText.includes(keyword.toLowerCase())) {
                tags.add(keyword);
            }
        });

        return Array.from(tags);
    }
};

// =====================================================
// AI AGENTS MARKETPLACE API
// =====================================================

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

// Fetch all available AI agents from marketplace
export const fetchAvailableAIAgents = async (): Promise<AIAgent[]> => {
    console.log('🤖 Fetching available AI agents');

    if (supabase) {
        try {
            const { data: agents, error } = await supabase
                .from('ai_agents')
                .select('*')
                .eq('is_active', true)
                .order('is_featured', { ascending: false })
                .order('name');

            if (error) {
                console.error('❌ Error fetching AI agents:', error);
                throw error;
            }

            console.log('✅ Fetched AI agents:', agents?.length || 0);
            return agents?.map(a => ({
                id: a.id,
                name: a.name,
                description: a.description,
                category: a.category,
                priceMonthly: a.price_monthly,
                priceYearly: a.price_yearly,
                features: a.features || [],
                capabilities: a.capabilities || [],
                iconUrl: a.icon_url,
                bannerUrl: a.banner_url,
                isActive: a.is_active,
                isFeatured: a.is_featured,
                minPlan: a.min_plan
            })) || [];
        } catch (error) {
            console.error('❌ Error in fetchAvailableAIAgents:', error);
            return [];
        }
    } else {
        // Mock implementation
        await delay(LATENCY);
        return [
            {
                id: 'agent-hse-sentinel',
                name: 'HSE Sentinel AI',
                description: 'Advanced health, safety, and environmental monitoring agent that analyzes site conditions and provides real-time safety recommendations.',
                category: 'safety',
                priceMonthly: 49.99,
                priceYearly: 499.99,
                features: ['Real-time safety monitoring', 'Incident prediction', 'Compliance checking', 'Safety report generation'],
                capabilities: ['Image analysis for PPE compliance', 'Risk assessment automation', 'Safety training recommendations', 'Incident documentation'],
                isActive: true,
                isFeatured: true,
                minPlan: 'basic'
            },
            {
                id: 'agent-quality-inspector',
                name: 'Quality Inspector AI',
                description: 'Automated quality control agent that inspects work progress and identifies potential issues before they become problems.',
                category: 'quality',
                priceMonthly: 39.99,
                priceYearly: 399.99,
                features: ['Automated quality checks', 'Progress monitoring', 'Defect detection', 'Quality reports'],
                capabilities: ['Photo analysis for quality issues', 'Progress tracking', 'Compliance verification', 'Quality metrics dashboard'],
                isActive: true,
                isFeatured: true,
                minPlan: 'basic'
            },
            {
                id: 'agent-productivity-optimizer',
                name: 'Productivity Optimizer AI',
                description: 'Analyzes project data to identify bottlenecks and suggest optimizations for improved efficiency.',
                category: 'productivity',
                priceMonthly: 59.99,
                priceYearly: 599.99,
                features: ['Performance analytics', 'Bottleneck identification', 'Resource optimization', 'Productivity insights'],
                capabilities: ['Data analysis and reporting', 'Predictive scheduling', 'Resource allocation', 'Performance benchmarking'],
                isActive: true,
                isFeatured: false,
                minPlan: 'professional'
            }
        ];
    }
};

// Fetch company's active AI agent subscriptions
export const fetchCompanySubscriptions = async (currentUser: User): Promise<CompanySubscription[]> => {
    console.log('📋 Fetching company subscriptions for:', currentUser.companyId);

    if (supabase) {
        try {
            const { data: subscriptions, error } = await supabase
                .from('company_subscriptions')
                .select(`
                    *,
                    ai_agents (
                        id,
                        name,
                        description,
                        category,
                        price_monthly,
                        price_yearly,
                        features,
                        capabilities,
                        icon_url,
                        banner_url,
                        is_active,
                        is_featured,
                        min_plan
                    )
                `)
                .eq('company_id', currentUser.companyId)
                .eq('status', 'active');

            if (error) {
                console.error('❌ Error fetching company subscriptions:', error);
                throw error;
            }

            console.log('✅ Fetched company subscriptions:', subscriptions?.length || 0);
            return subscriptions?.map(s => ({
                id: s.id,
                companyId: s.company_id,
                agentId: s.agent_id,
                status: s.status,
                billingCycle: s.billing_cycle,
                pricePaid: s.price_paid,
                startedAt: s.started_at,
                expiresAt: s.expires_at,
                autoRenew: s.auto_renew,
                agent: s.ai_agents ? {
                    id: s.ai_agents.id,
                    name: s.ai_agents.name,
                    description: s.ai_agents.description,
                    category: s.ai_agents.category,
                    priceMonthly: s.ai_agents.price_monthly,
                    priceYearly: s.ai_agents.price_yearly,
                    features: s.ai_agents.features || [],
                    capabilities: s.ai_agents.capabilities || [],
                    iconUrl: s.ai_agents.icon_url,
                    bannerUrl: s.ai_agents.banner_url,
                    isActive: s.ai_agents.is_active,
                    isFeatured: s.ai_agents.is_featured,
                    minPlan: s.ai_agents.min_plan
                } : undefined
            })) || [];
        } catch (error) {
            console.error('❌ Error in fetchCompanySubscriptions:', error);
            return [];
        }
    } else {
        // Mock implementation
        await delay(LATENCY);
        return [
            {
                id: 'sub-1',
                companyId: currentUser.companyId,
                agentId: 'agent-hse-sentinel',
                status: 'active',
                billingCycle: 'monthly',
                pricePaid: 49.99,
                startedAt: new Date().toISOString(),
                autoRenew: true,
                agent: {
                    id: 'agent-hse-sentinel',
                    name: 'HSE Sentinel AI',
                    description: 'Advanced health, safety, and environmental monitoring agent.',
                    category: 'safety',
                    priceMonthly: 49.99,
                    priceYearly: 499.99,
                    features: ['Real-time safety monitoring', 'Incident prediction'],
                    capabilities: ['Image analysis for PPE compliance', 'Risk assessment automation'],
                    isActive: true,
                    isFeatured: true,
                    minPlan: 'basic'
                }
            }
        ];
    }
};

// Check if company has access to a specific AI agent
export const hasAgentAccess = async (currentUser: User, agentId: string): Promise<boolean> => {
    console.log('🔍 Checking agent access for:', agentId, 'user:', currentUser.email);

    if (supabase) {
        try {
            const { data: subscription, error } = await supabase
                .from('company_subscriptions')
                .select('id')
                .eq('company_id', currentUser.companyId)
                .eq('agent_id', agentId)
                .eq('status', 'active')
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
                console.error('❌ Error checking agent access:', error);
                return false;
            }

            const hasAccess = !!subscription;
            console.log(hasAccess ? '✅ Agent access granted' : '❌ Agent access denied');
            return hasAccess;
        } catch (error) {
            console.error('❌ Error in hasAgentAccess:', error);
            return false;
        }
    } else {
        // Mock implementation - always grant access for demo
        await delay(LATENCY / 2);
        return true;
    }
};

// Subscribe company to an AI agent
export const subscribeToAgent = async (
    currentUser: User,
    agentId: string,
    billingCycle: 'monthly' | 'yearly'
): Promise<CompanySubscription | null> => {
    console.log('💳 Subscribing to agent:', agentId, 'billing:', billingCycle);

    // Check permissions
    if (!['company_admin', 'super_admin'].includes(currentUser.role)) {
        throw new Error('Only company administrators can manage subscriptions');
    }

    if (supabase) {
        try {
            // Get agent details first
            const { data: agent, error: agentError } = await supabase
                .from('ai_agents')
                .select('*')
                .eq('id', agentId)
                .single();

            if (agentError || !agent) {
                throw new Error('Agent not found');
            }

            const price = billingCycle === 'monthly' ? agent.price_monthly : agent.price_yearly;
            const expiresAt = new Date();
            if (billingCycle === 'monthly') {
                expiresAt.setMonth(expiresAt.getMonth() + 1);
            } else {
                expiresAt.setFullYear(expiresAt.getFullYear() + 1);
            }

            const { data: subscription, error } = await supabase
                .from('company_subscriptions')
                .insert({
                    company_id: currentUser.companyId,
                    agent_id: agentId,
                    billing_cycle: billingCycle,
                    price_paid: price,
                    expires_at: expiresAt.toISOString(),
                    status: 'active',
                    auto_renew: true
                })
                .select()
                .single();

            if (error) {
                console.error('❌ Error creating subscription:', error);
                throw error;
            }

            console.log('✅ Subscription created successfully');
            return {
                id: subscription.id,
                companyId: subscription.company_id,
                agentId: subscription.agent_id,
                status: subscription.status,
                billingCycle: subscription.billing_cycle,
                pricePaid: subscription.price_paid,
                startedAt: subscription.started_at,
                expiresAt: subscription.expires_at,
                autoRenew: subscription.auto_renew
            };
        } catch (error) {
            console.error('❌ Error in subscribeToAgent:', error);
            throw error;
        }
    } else {
        // Mock implementation
        await delay(LATENCY * 2);
        return {
            id: `sub-${Date.now()}`,
            companyId: currentUser.companyId,
            agentId,
            status: 'active',
            billingCycle,
            pricePaid: billingCycle === 'monthly' ? 49.99 : 499.99,
            startedAt: new Date().toISOString(),
            autoRenew: true
        };
    }
};

// =====================================================
// PLATFORM ADMINISTRATION API
// =====================================================

export interface PlatformInvitation {
    id: string;
    email: string;
    companyName: string;
    invitedBy: string;
    invitationType: 'company_admin' | 'super_admin' | 'platform_partner';
    status: 'pending' | 'accepted' | 'declined' | 'expired';
    invitationToken: string;
    expiresAt: string;
    acceptedAt?: string;
    metadata: any;
    createdAt: string;
}

export interface CompanyPlan {
    id: string;
    name: string;
    description: string;
    priceMonthly: number;
    priceYearly: number;
    maxUsers: number;
    maxProjects: number;
    features: string[];
    aiAgentsIncluded: string[];
    aiAgentsLimit: number;
    storageGb: number;
    isActive: boolean;
    isFeatured: boolean;
    sortOrder: number;
}

export interface PlatformSettings {
    [key: string]: any;
}

export interface PlatformStats {
    totalCompanies: number;
    totalUsers: number;
    totalProjects: number;
    activeSubscriptions: number;
    monthlyRevenue: number;
    newCompaniesThisMonth: number;
    newUsersThisMonth: number;
}

export interface AuditLogEntry {
    id: string;
    userId?: string;
    companyId?: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string;
    userAgent?: string;
    createdAt: string;
}

// Get platform statistics (super admin only)
export const getPlatformStats = async (currentUser: User): Promise<PlatformStats> => {
    console.log('📊 Fetching platform statistics');

    if (currentUser.role !== 'super_admin') {
        throw new Error('Access denied: Super admin required');
    }

    if (supabase) {
        try {
            // Get companies count
            const { count: companiesCount } = await supabase
                .from('companies')
                .select('*', { count: 'exact', head: true });

            // Get users count
            const { count: usersCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            // Get projects count
            const { count: projectsCount } = await supabase
                .from('projects')
                .select('*', { count: 'exact', head: true });

            // Get active subscriptions count
            const { count: subscriptionsCount } = await supabase
                .from('company_subscriptions')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'active');

            // Get new companies this month
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const { count: newCompaniesCount } = await supabase
                .from('companies')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', startOfMonth.toISOString());

            // Get new users this month
            const { count: newUsersCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', startOfMonth.toISOString());

            // Calculate monthly revenue (simplified)
            const { data: subscriptions } = await supabase
                .from('company_subscriptions')
                .select('price_paid')
                .eq('status', 'active')
                .eq('billing_cycle', 'monthly');

            const monthlyRevenue = subscriptions?.reduce((sum, sub) => sum + sub.price_paid, 0) || 0;

            return {
                totalCompanies: companiesCount || 0,
                totalUsers: usersCount || 0,
                totalProjects: projectsCount || 0,
                activeSubscriptions: subscriptionsCount || 0,
                monthlyRevenue,
                newCompaniesThisMonth: newCompaniesCount || 0,
                newUsersThisMonth: newUsersCount || 0
            };
        } catch (error) {
            console.error('❌ Error fetching platform stats:', error);
            throw error;
        }
    } else {
        // Mock data for development
        await delay(LATENCY);
        return {
            totalCompanies: 15,
            totalUsers: 127,
            totalProjects: 89,
            activeSubscriptions: 12,
            monthlyRevenue: 2847.50,
            newCompaniesThisMonth: 3,
            newUsersThisMonth: 18
        };
    }
};

// Get all companies (super admin only)
export const getAllCompanies = async (currentUser: User): Promise<(Company & { plan?: CompanyPlan; userCount: number; projectCount: number })[]> => {
    console.log('🏢 Fetching all companies');

    if (currentUser.role !== 'super_admin') {
        throw new Error('Access denied: Super admin required');
    }

    if (supabase) {
        try {
            const { data: companies, error } = await supabase
                .from('companies')
                .select(`
                    *,
                    company_plans (
                        id, name, description, price_monthly, price_yearly,
                        max_users, max_projects, features, ai_agents_included,
                        ai_agents_limit, storage_gb, is_active, is_featured, sort_order
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('❌ Error fetching companies:', error);
                throw error;
            }

            // Get user and project counts for each company
            const companiesWithCounts = await Promise.all(
                (companies || []).map(async (company) => {
                    const [userCountResult, projectCountResult] = await Promise.all([
                        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('company_id', company.id),
                        supabase.from('projects').select('*', { count: 'exact', head: true }).eq('company_id', company.id)
                    ]);

                    return {
                        id: company.id,
                        name: company.name,
                        userCount: userCountResult.count || 0,
                        projectCount: projectCountResult.count || 0,
                        plan: company.company_plans ? {
                            id: company.company_plans.id,
                            name: company.company_plans.name,
                            description: company.company_plans.description,
                            priceMonthly: company.company_plans.price_monthly,
                            priceYearly: company.company_plans.price_yearly,
                            maxUsers: company.company_plans.max_users,
                            maxProjects: company.company_plans.max_projects,
                            features: company.company_plans.features || [],
                            aiAgentsIncluded: company.company_plans.ai_agents_included || [],
                            aiAgentsLimit: company.company_plans.ai_agents_limit,
                            storageGb: company.company_plans.storage_gb,
                            isActive: company.company_plans.is_active,
                            isFeatured: company.company_plans.is_featured,
                            sortOrder: company.company_plans.sort_order
                        } : undefined
                    };
                })
            );

            console.log('✅ Fetched companies:', companiesWithCounts.length);
            return companiesWithCounts;
        } catch (error) {
            console.error('❌ Error in getAllCompanies:', error);
            throw error;
        }
    } else {
        // Mock data
        await delay(LATENCY);
        return [
            {
                id: 'comp-1',
                name: 'Demo Construction Company',
                userCount: 8,
                projectCount: 5,
                plan: {
                    id: 'plan-professional',
                    name: 'Professional Plan',
                    description: 'Ideal for growing construction companies',
                    priceMonthly: 79.99,
                    priceYearly: 799.99,
                    maxUsers: 25,
                    maxProjects: 15,
                    features: ['Everything in Basic', 'Advanced Reporting'],
                    aiAgentsIncluded: ['agent-hse-sentinel', 'agent-quality-inspector'],
                    aiAgentsLimit: 5,
                    storageGb: 100,
                    isActive: true,
                    isFeatured: true,
                    sortOrder: 2
                }
            }
        ];
    }
};

// Send platform invitation
export const sendPlatformInvitation = async (
    currentUser: User,
    email: string,
    companyName: string,
    invitationType: 'company_admin' | 'super_admin' | 'platform_partner' = 'company_admin'
): Promise<PlatformInvitation> => {
    console.log('📧 Sending platform invitation to:', email);

    if (currentUser.role !== 'super_admin') {
        throw new Error('Access denied: Super admin required');
    }

    if (supabase) {
        try {
            const invitationToken = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

            const { data: invitation, error } = await supabase
                .from('platform_invitations')
                .insert({
                    email,
                    company_name: companyName,
                    invited_by: currentUser.id,
                    invitation_type: invitationType,
                    invitation_token: invitationToken,
                    expires_at: expiresAt.toISOString(),
                    status: 'pending',
                    metadata: {
                        invitedByName: currentUser.name,
                        invitedByEmail: currentUser.email
                    }
                })
                .select()
                .single();

            if (error) {
                console.error('❌ Error creating invitation:', error);
                throw error;
            }

            // Log the action
            await logPlatformAction(currentUser, 'invitation_sent', 'platform_invitation', invitation.id, null, {
                email,
                companyName,
                invitationType
            });

            console.log('✅ Invitation sent successfully');
            return {
                id: invitation.id,
                email: invitation.email,
                companyName: invitation.company_name,
                invitedBy: invitation.invited_by,
                invitationType: invitation.invitation_type,
                status: invitation.status,
                invitationToken: invitation.invitation_token,
                expiresAt: invitation.expires_at,
                acceptedAt: invitation.accepted_at,
                metadata: invitation.metadata,
                createdAt: invitation.created_at
            };
        } catch (error) {
            console.error('❌ Error in sendPlatformInvitation:', error);
            throw error;
        }
    } else {
        // Mock implementation
        await delay(LATENCY * 2);
        return {
            id: `inv-${Date.now()}`,
            email,
            companyName,
            invitedBy: currentUser.id,
            invitationType,
            status: 'pending',
            invitationToken: `inv_${Date.now()}_mock`,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            metadata: {},
            createdAt: new Date().toISOString()
        };
    }
};

// Get all company plans
export const getAllCompanyPlans = async (): Promise<CompanyPlan[]> => {
    console.log('📋 Fetching company plans');

    if (supabase) {
        try {
            const { data: plans, error } = await supabase
                .from('company_plans')
                .select('*')
                .eq('is_active', true)
                .order('sort_order');

            if (error) {
                console.error('❌ Error fetching plans:', error);
                throw error;
            }

            return (plans || []).map(plan => ({
                id: plan.id,
                name: plan.name,
                description: plan.description,
                priceMonthly: plan.price_monthly,
                priceYearly: plan.price_yearly,
                maxUsers: plan.max_users,
                maxProjects: plan.max_projects,
                features: plan.features || [],
                aiAgentsIncluded: plan.ai_agents_included || [],
                aiAgentsLimit: plan.ai_agents_limit,
                storageGb: plan.storage_gb,
                isActive: plan.is_active,
                isFeatured: plan.is_featured,
                sortOrder: plan.sort_order
            }));
        } catch (error) {
            console.error('❌ Error in getAllCompanyPlans:', error);
            return [];
        }
    } else {
        // Mock data
        await delay(LATENCY);
        return [
            {
                id: 'plan-basic',
                name: 'Basic Plan',
                description: 'Perfect for small construction teams',
                priceMonthly: 29.99,
                priceYearly: 299.99,
                maxUsers: 5,
                maxProjects: 3,
                features: ['Project Management', 'Task Tracking', 'Basic Reporting'],
                aiAgentsIncluded: ['agent-hse-sentinel'],
                aiAgentsLimit: 1,
                storageGb: 10,
                isActive: true,
                isFeatured: false,
                sortOrder: 1
            }
        ];
    }
};

// Update company plan
export const updateCompanyPlan = async (
    currentUser: User,
    companyId: string,
    planId: string
): Promise<boolean> => {
    console.log('📝 Updating company plan:', companyId, 'to plan:', planId);

    if (currentUser.role !== 'super_admin') {
        throw new Error('Access denied: Super admin required');
    }

    if (supabase) {
        try {
            const { error } = await supabase
                .from('companies')
                .update({
                    plan_id: planId,
                    plan_started_at: new Date().toISOString()
                })
                .eq('id', companyId);

            if (error) {
                console.error('❌ Error updating company plan:', error);
                throw error;
            }

            // Log the action
            await logPlatformAction(currentUser, 'plan_updated', 'company', companyId, null, {
                newPlanId: planId
            });

            console.log('✅ Company plan updated successfully');
            return true;
        } catch (error) {
            console.error('❌ Error in updateCompanyPlan:', error);
            return false;
        }
    } else {
        await delay(LATENCY);
        return true;
    }
};

// Create company plan
export const createCompanyPlan = async (
    currentUser: User,
    planData: Omit<CompanyPlan, 'id' | 'createdAt' | 'updatedAt'>
): Promise<CompanyPlan> => {
    console.log('📝 Creating company plan:', planData.name);

    if (currentUser.role !== 'super_admin') {
        throw new Error('Access denied: Super admin required');
    }

    if (supabase) {
        try {
            const { data: plan, error } = await supabase
                .from('company_plans')
                .insert({
                    name: planData.name,
                    description: planData.description,
                    price_monthly: planData.priceMonthly,
                    price_yearly: planData.priceYearly,
                    max_users: planData.maxUsers,
                    max_projects: planData.maxProjects,
                    features: planData.features,
                    ai_agents_included: planData.aiAgentsIncluded,
                    ai_agents_limit: planData.aiAgentsLimit,
                    storage_gb: planData.storageGb,
                    is_active: planData.isActive,
                    is_featured: planData.isFeatured,
                    sort_order: planData.sortOrder
                })
                .select()
                .single();

            if (error) {
                console.error('❌ Error creating company plan:', error);
                throw error;
            }

            // Log the action
            await logPlatformAction(currentUser, 'plan_created', 'company_plan', plan.id, null, {
                planName: planData.name
            });

            console.log('✅ Company plan created successfully');
            return {
                id: plan.id,
                name: plan.name,
                description: plan.description,
                priceMonthly: plan.price_monthly,
                priceYearly: plan.price_yearly,
                maxUsers: plan.max_users,
                maxProjects: plan.max_projects,
                features: plan.features || [],
                aiAgentsIncluded: plan.ai_agents_included || [],
                aiAgentsLimit: plan.ai_agents_limit,
                storageGb: plan.storage_gb,
                isActive: plan.is_active,
                isFeatured: plan.is_featured,
                sortOrder: plan.sort_order
            };
        } catch (error) {
            console.error('❌ Error in createCompanyPlan:', error);
            throw error;
        }
    } else {
        // Mock implementation
        await delay(LATENCY);
        const newPlan: CompanyPlan = {
            id: `plan-${Date.now()}`,
            ...planData
        };
        return newPlan;
    }
};

// Update company plan details
export const updateCompanyPlanDetails = async (
    currentUser: User,
    planId: string,
    planData: Partial<Omit<CompanyPlan, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<CompanyPlan> => {
    console.log('📝 Updating company plan details:', planId);

    if (currentUser.role !== 'super_admin') {
        throw new Error('Access denied: Super admin required');
    }

    if (supabase) {
        try {
            const updateData: any = {};
            if (planData.name !== undefined) updateData.name = planData.name;
            if (planData.description !== undefined) updateData.description = planData.description;
            if (planData.priceMonthly !== undefined) updateData.price_monthly = planData.priceMonthly;
            if (planData.priceYearly !== undefined) updateData.price_yearly = planData.priceYearly;
            if (planData.maxUsers !== undefined) updateData.max_users = planData.maxUsers;
            if (planData.maxProjects !== undefined) updateData.max_projects = planData.maxProjects;
            if (planData.features !== undefined) updateData.features = planData.features;
            if (planData.aiAgentsIncluded !== undefined) updateData.ai_agents_included = planData.aiAgentsIncluded;
            if (planData.aiAgentsLimit !== undefined) updateData.ai_agents_limit = planData.aiAgentsLimit;
            if (planData.storageGb !== undefined) updateData.storage_gb = planData.storageGb;
            if (planData.isActive !== undefined) updateData.is_active = planData.isActive;
            if (planData.isFeatured !== undefined) updateData.is_featured = planData.isFeatured;
            if (planData.sortOrder !== undefined) updateData.sort_order = planData.sortOrder;

            const { data: plan, error } = await supabase
                .from('company_plans')
                .update(updateData)
                .eq('id', planId)
                .select()
                .single();

            if (error) {
                console.error('❌ Error updating company plan:', error);
                throw error;
            }

            // Log the action
            await logPlatformAction(currentUser, 'plan_updated', 'company_plan', planId, null, planData);

            console.log('✅ Company plan updated successfully');
            return {
                id: plan.id,
                name: plan.name,
                description: plan.description,
                priceMonthly: plan.price_monthly,
                priceYearly: plan.price_yearly,
                maxUsers: plan.max_users,
                maxProjects: plan.max_projects,
                features: plan.features || [],
                aiAgentsIncluded: plan.ai_agents_included || [],
                aiAgentsLimit: plan.ai_agents_limit,
                storageGb: plan.storage_gb,
                isActive: plan.is_active,
                isFeatured: plan.is_featured,
                sortOrder: plan.sort_order
            };
        } catch (error) {
            console.error('❌ Error in updateCompanyPlanDetails:', error);
            throw error;
        }
    } else {
        // Mock implementation
        await delay(LATENCY);
        return {
            id: planId,
            name: 'Updated Plan',
            description: 'Updated description',
            priceMonthly: 50,
            priceYearly: 500,
            maxUsers: 10,
            maxProjects: 5,
            features: ['Updated features'],
            aiAgentsIncluded: [],
            aiAgentsLimit: 2,
            storageGb: 50,
            isActive: true,
            isFeatured: false,
            sortOrder: 1,
            ...planData
        };
    }
};

// Toggle company plan status
export const toggleCompanyPlanStatus = async (
    currentUser: User,
    planId: string,
    isActive: boolean
): Promise<boolean> => {
    console.log('📝 Toggling company plan status:', planId, 'to:', isActive);

    if (currentUser.role !== 'super_admin') {
        throw new Error('Access denied: Super admin required');
    }

    if (supabase) {
        try {
            const { error } = await supabase
                .from('company_plans')
                .update({ is_active: isActive })
                .eq('id', planId);

            if (error) {
                console.error('❌ Error toggling company plan status:', error);
                throw error;
            }

            // Log the action
            await logPlatformAction(currentUser, 'plan_status_toggled', 'company_plan', planId, null, {
                isActive
            });

            console.log('✅ Company plan status toggled successfully');
            return true;
        } catch (error) {
            console.error('❌ Error in toggleCompanyPlanStatus:', error);
            return false;
        }
    } else {
        await delay(LATENCY);
        return true;
    }
};

// Create AI agent
export const createAIAgent = async (
    currentUser: User,
    agentData: Omit<AIAgent, 'id' | 'createdAt' | 'updatedAt'>
): Promise<AIAgent> => {
    console.log('🤖 Creating AI agent:', agentData.name);

    if (currentUser.role !== 'super_admin') {
        throw new Error('Access denied: Super admin required');
    }

    if (supabase) {
        try {
            const { data: agent, error } = await supabase
                .from('ai_agents')
                .insert({
                    name: agentData.name,
                    description: agentData.description,
                    category: agentData.category,
                    price_monthly: agentData.priceMonthly,
                    price_yearly: agentData.priceYearly,
                    features: agentData.features,
                    capabilities: agentData.capabilities,
                    icon_url: agentData.iconUrl,
                    banner_url: agentData.bannerUrl,
                    is_active: agentData.isActive,
                    is_featured: agentData.isFeatured,
                    min_plan: agentData.minPlan
                })
                .select()
                .single();

            if (error) {
                console.error('❌ Error creating AI agent:', error);
                throw error;
            }

            // Log the action
            await logPlatformAction(currentUser, 'agent_created', 'ai_agent', agent.id, null, {
                agentName: agentData.name
            });

            console.log('✅ AI agent created successfully');
            return {
                id: agent.id,
                name: agent.name,
                description: agent.description,
                category: agent.category,
                priceMonthly: agent.price_monthly,
                priceYearly: agent.price_yearly,
                features: agent.features || [],
                capabilities: agent.capabilities || [],
                iconUrl: agent.icon_url,
                bannerUrl: agent.banner_url,
                isActive: agent.is_active,
                isFeatured: agent.is_featured,
                minPlan: agent.min_plan
            };
        } catch (error) {
            console.error('❌ Error in createAIAgent:', error);
            throw error;
        }
    } else {
        // Mock implementation
        await delay(LATENCY);
        const newAgent: AIAgent = {
            id: `agent-${Date.now()}`,
            ...agentData
        };
        return newAgent;
    }
};

// Update AI agent
export const updateAIAgent = async (
    currentUser: User,
    agentId: string,
    agentData: Partial<Omit<AIAgent, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<AIAgent> => {
    console.log('🤖 Updating AI agent:', agentId);

    if (currentUser.role !== 'super_admin') {
        throw new Error('Access denied: Super admin required');
    }

    if (supabase) {
        try {
            const updateData: any = {};
            if (agentData.name !== undefined) updateData.name = agentData.name;
            if (agentData.description !== undefined) updateData.description = agentData.description;
            if (agentData.category !== undefined) updateData.category = agentData.category;
            if (agentData.priceMonthly !== undefined) updateData.price_monthly = agentData.priceMonthly;
            if (agentData.priceYearly !== undefined) updateData.price_yearly = agentData.priceYearly;
            if (agentData.features !== undefined) updateData.features = agentData.features;
            if (agentData.capabilities !== undefined) updateData.capabilities = agentData.capabilities;
            if (agentData.iconUrl !== undefined) updateData.icon_url = agentData.iconUrl;
            if (agentData.bannerUrl !== undefined) updateData.banner_url = agentData.bannerUrl;
            if (agentData.isActive !== undefined) updateData.is_active = agentData.isActive;
            if (agentData.isFeatured !== undefined) updateData.is_featured = agentData.isFeatured;
            if (agentData.minPlan !== undefined) updateData.min_plan = agentData.minPlan;

            const { data: agent, error } = await supabase
                .from('ai_agents')
                .update(updateData)
                .eq('id', agentId)
                .select()
                .single();

            if (error) {
                console.error('❌ Error updating AI agent:', error);
                throw error;
            }

            // Log the action
            await logPlatformAction(currentUser, 'agent_updated', 'ai_agent', agentId, null, agentData);

            console.log('✅ AI agent updated successfully');
            return {
                id: agent.id,
                name: agent.name,
                description: agent.description,
                category: agent.category,
                priceMonthly: agent.price_monthly,
                priceYearly: agent.price_yearly,
                features: agent.features || [],
                capabilities: agent.capabilities || [],
                iconUrl: agent.icon_url,
                bannerUrl: agent.banner_url,
                isActive: agent.is_active,
                isFeatured: agent.is_featured,
                minPlan: agent.min_plan
            };
        } catch (error) {
            console.error('❌ Error in updateAIAgent:', error);
            throw error;
        }
    } else {
        // Mock implementation
        await delay(LATENCY);
        return {
            id: agentId,
            name: 'Updated Agent',
            description: 'Updated description',
            category: 'safety',
            priceMonthly: 50,
            priceYearly: 500,
            features: ['Updated features'],
            capabilities: ['Updated capabilities'],
            isActive: true,
            isFeatured: false,
            minPlan: 'basic',
            ...agentData
        };
    }
};

// Toggle AI agent status
export const toggleAIAgentStatus = async (
    currentUser: User,
    agentId: string,
    isActive: boolean
): Promise<boolean> => {
    console.log('🤖 Toggling AI agent status:', agentId, 'to:', isActive);

    if (currentUser.role !== 'super_admin') {
        throw new Error('Access denied: Super admin required');
    }

    if (supabase) {
        try {
            const { error } = await supabase
                .from('ai_agents')
                .update({ is_active: isActive })
                .eq('id', agentId);

            if (error) {
                console.error('❌ Error toggling AI agent status:', error);
                throw error;
            }

            // Log the action
            await logPlatformAction(currentUser, 'agent_status_toggled', 'ai_agent', agentId, null, {
                isActive
            });

            console.log('✅ AI agent status toggled successfully');
            return true;
        } catch (error) {
            console.error('❌ Error in toggleAIAgentStatus:', error);
            return false;
        }
    } else {
        await delay(LATENCY);
        return true;
    }
};

// Log platform action for audit trail
export const logPlatformAction = async (
    currentUser: User,
    action: string,
    resourceType: string,
    resourceId: string,
    oldValues?: any,
    newValues?: any
): Promise<void> => {
    if (!supabase) return;

    try {
        await supabase
            .from('platform_audit_log')
            .insert({
                user_id: currentUser.id,
                company_id: currentUser.companyId,
                action,
                resource_type: resourceType,
                resource_id: resourceId,
                old_values: oldValues,
                new_values: newValues,
                ip_address: null, // Would be populated from request in real app
                user_agent: navigator.userAgent
            });
    } catch (error) {
        console.error('❌ Error logging platform action:', error);
    }
};

// Get platform audit logs
export const getPlatformAuditLogs = async (
    currentUser: User,
    limit: number = 50,
    offset: number = 0
): Promise<AuditLogEntry[]> => {
    console.log('📜 Fetching platform audit logs');

    if (currentUser.role !== 'super_admin') {
        throw new Error('Access denied: Super admin required');
    }

    if (supabase) {
        try {
            const { data: logs, error } = await supabase
                .from('platform_audit_log')
                .select(`
                    *,
                    profiles!platform_audit_log_user_id_fkey (name, email),
                    companies!platform_audit_log_company_id_fkey (name)
                `)
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) {
                console.error('❌ Error fetching audit logs:', error);
                throw error;
            }

            return (logs || []).map(log => ({
                id: log.id,
                userId: log.user_id,
                companyId: log.company_id,
                action: log.action,
                resourceType: log.resource_type,
                resourceId: log.resource_id,
                oldValues: log.old_values,
                newValues: log.new_values,
                ipAddress: log.ip_address,
                userAgent: log.user_agent,
                createdAt: log.created_at
            }));
        } catch (error) {
            console.error('❌ Error in getPlatformAuditLogs:', error);
            return [];
        }
    } else {
        // Mock data
        await delay(LATENCY);
        return [
            {
                id: 'audit-1',
                userId: currentUser.id,
                companyId: 'comp-1',
                action: 'invitation_sent',
                resourceType: 'platform_invitation',
                resourceId: 'inv-1',
                newValues: { email: 'test@example.com' },
                createdAt: new Date().toISOString()
            }
        ];
    }
};

// Get platform invitations
export const getPlatformInvitations = async (currentUser: User): Promise<PlatformInvitation[]> => {
    console.log('📧 Fetching platform invitations');

    if (currentUser.role !== 'super_admin') {
        throw new Error('Access denied: Super admin required');
    }

    if (supabase) {
        try {
            const { data: invitations, error } = await supabase
                .from('platform_invitations')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('❌ Error fetching platform invitations:', error);
                throw error;
            }

            return (invitations || []).map(inv => ({
                id: inv.id,
                email: inv.email,
                companyName: inv.company_name,
                invitedBy: inv.invited_by,
                invitationType: inv.invitation_type,
                status: inv.status,
                invitationToken: inv.invitation_token,
                expiresAt: inv.expires_at,
                acceptedAt: inv.accepted_at,
                metadata: inv.metadata,
                createdAt: inv.created_at
            }));
        } catch (error) {
            console.error('❌ Error in getPlatformInvitations:', error);
            return [];
        }
    } else {
        // Mock data
        await delay(LATENCY);
        return [];
    }
}

// --- ML Predictions ---

/**
 * Get ML-powered predictions for a project
 */
export const getProjectPredictions = async (
    projectId: string,
    currentUser: User
): Promise<PredictionResult> => {
    return withErrorHandling(async () => {
        console.log('🧠 Generating ML predictions for project:', projectId);

        // Fetch project data
        const project = await fetchProjectById(projectId, currentUser);
        if (!project) {
            throw new APIError('Project not found', 'NOT_FOUND');
        }

        // Fetch related data
        const tasks = await fetchTasksForProject(projectId, currentUser);
        const rfis = await fetchRFIsForProject(projectId, currentUser);
        const punchItems = await fetchPunchListItemsForProject(projectId, currentUser);

        // Generate predictions using ML
        const predictor = getMLPredictor();
        const prediction = await predictor.predictProjectOutcome(
            project,
            tasks,
            rfis,
            punchItems
        );

        console.log('✅ ML predictions generated:', prediction);
        return prediction;
    }, 'getProjectPredictions');
};

/**
 * Get ML insights for all projects (for dashboard)
 */
export const getAllProjectsPredictions = async (
    currentUser: User
): Promise<Array<{ projectId: string; projectName: string; prediction: PredictionResult }>> => {
    return withErrorHandling(async () => {
        console.log('🧠 Generating ML predictions for all projects');

        const projects = await fetchAllProjects(currentUser);
        const predictions: Array<{ projectId: string; projectName: string; prediction: PredictionResult }> = [];

        for (const project of projects.slice(0, 5)) { // Limit to 5 projects for performance
            try {
                const tasks = await fetchTasksForProject(project.id, currentUser);
                const rfis = await fetchRFIsForProject(project.id, currentUser);
                const punchItems = await fetchPunchListItemsForProject(project.id, currentUser);

                const predictor = getMLPredictor();
                const prediction = await predictor.predictProjectOutcome(
                    project,
                    tasks,
                    rfis,
                    punchItems
                );

                predictions.push({
                    projectId: project.id,
                    projectName: project.name,
                    prediction
                });
            } catch (error) {
                console.error(`❌ Failed to generate prediction for project ${project.id}:`, error);
            }
        }

        console.log('✅ Generated predictions for', predictions.length, 'projects');
        return predictions;
    }, 'getAllProjectsPredictions', []);
};;
