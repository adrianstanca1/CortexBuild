// services/apiService.ts
import { Type } from "@google/genai";
import * as mockApi from './mockApi';
import { generateContent, generateJSON } from './aiService';
import { User, Project, Todo, AISearchResult, Grant, RiskAnalysis, BidPackage, ProjectHealth, SafetyIncident } from '../types';

const FAKE_TOKEN = 'fake-jwt-token';

export const hasSession = (): boolean => {
    return !!localStorage.getItem('authToken');
};

// FIX: Corrected the return type of the withAuth wrapper to correctly handle both sync and async functions.
// This ensures that the returned function always has a Promise-based return type, resolving the TypeScript error.
const withAuth = <T extends (...args: any[]) => any>(fn: T): ((...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>) => {
    return async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
        if (!hasSession()) {
            throw new Error("401 Unauthorized: No active session.");
        }
        return fn(...args);
    };
};

export const api = {
    // Auth
    login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
        const user = await mockApi.login(email, password);
        localStorage.setItem('authToken', FAKE_TOKEN);
        localStorage.setItem('userId', user.id.toString());
        return { user, token: FAKE_TOKEN };
    },
    logout: (): void => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
    },
    getProfile: async (): Promise<{ user: User, token: string }> => {
        if (!hasSession()) throw new Error("No session");
        const userId = localStorage.getItem('userId');
        if (!userId) throw new Error("No user in session");
        const user = await mockApi.getUserById(parseInt(userId, 10));
        return { user, token: FAKE_TOKEN };
    },
    
    // Wrapped mockApi functions
    getUserById: withAuth(mockApi.getUserById),
    getUsersByCompany: withAuth(mockApi.getUsersByCompany),
    getProjectsByCompany: withAuth(mockApi.getProjectsByCompany),
    getProjectsByUser: withAuth(mockApi.getProjectsByUser),
    getProjectsByManager: withAuth(mockApi.getProjectsByManager),
    getTodosByProjectIds: withAuth(mockApi.getTodosByProjectIds),
    updateTodo: withAuth(mockApi.updateTodo),
    getDocumentsByProjectIds: withAuth(mockApi.getDocumentsByProjectIds),
    uploadDocument: withAuth(mockApi.uploadDocument),
    getProjectAssignmentsByCompany: withAuth(mockApi.getProjectAssignmentsByCompany),
    getCompanySettings: withAuth(mockApi.getCompanySettings),
    updateCompanySettings: withAuth(mockApi.updateCompanySettings),
    getSafetyIncidentsByCompany: withAuth(mockApi.getSafetyIncidentsByCompany),
    getTimesheetsByCompany: withAuth(mockApi.getTimesheetsByCompany),
    getTimesheetsForManager: withAuth(mockApi.getTimesheetsForManager),
    getTimesheetsByUser: withAuth(mockApi.getTimesheetsByUser),
    updateTimesheetStatus: withAuth(mockApi.updateTimesheetStatus),
    updateUserStatus: withAuth(mockApi.updateUserStatus),
    getEquipmentByCompany: withAuth(mockApi.getEquipmentByCompany),
    assignEquipmentToProject: withAuth(mockApi.assignEquipmentToProject),
    unassignEquipmentFromProject: withAuth(mockApi.unassignEquipmentFromProject),
    updateEquipmentStatus: withAuth(mockApi.updateEquipmentStatus),
    getResourceAssignments: withAuth(mockApi.getResourceAssignments),
    createResourceAssignment: withAuth(mockApi.createResourceAssignment),
    deleteResourceAssignment: withAuth(mockApi.deleteResourceAssignment),
    getConversationsForUser: withAuth(mockApi.getConversationsForUser),
    getMessagesForConversation: withAuth(mockApi.getMessagesForConversation),
    sendMessage: withAuth(mockApi.sendMessage),
    getFinancialKPIsForCompany: withAuth(mockApi.getFinancialKPIsForCompany),
    getMonthlyFinancials: withAuth(mockApi.getMonthlyFinancials),
    getCostBreakdown: withAuth(mockApi.getCostBreakdown),
    getInvoicesByCompany: withAuth(mockApi.getInvoicesByCompany),
    getQuotesByCompany: withAuth(mockApi.getQuotesByCompany),
    getClientsByCompany: withAuth(mockApi.getClientsByCompany),
    getProjectTemplates: withAuth(mockApi.getProjectTemplates),
    createProjectTemplate: withAuth(mockApi.createProjectTemplate),
    updateProjectTemplate: withAuth(mockApi.updateProjectTemplate),
    deleteProjectTemplate: withAuth(mockApi.deleteProjectTemplate),
    createProject: withAuth(mockApi.createProject),
    getAuditLogsByActorId: withAuth(mockApi.getAuditLogsByActorId),
    getPlatformUsageMetrics: withAuth(mockApi.getPlatformUsageMetrics),
    getCompanies: withAuth(mockApi.getCompanies),

    // AI Features
    searchAcrossDocuments: async (query: string, projectIds: number[], userId: number): Promise<AISearchResult> => {
        // In a real app, you'd fetch document content. Here, we'll use metadata.
        const docs = await mockApi.getDocumentsByProjectIds(projectIds);
        const docInfo = docs.map(d => `DocID ${d.id}: ${d.name} (${d.category})`).join('\n');

        const prompt = `User is asking: "${query}". Search these documents: \n${docInfo}\n Provide a summary and cite 2-3 document IDs as sources with a brief snippet.`;

        const response = await generateContent(prompt);

        // Mock parsing for simplicity
        return {
            summary: response.text || "AI could not generate a summary.",
            sources: docs.slice(0, 2).map(d => ({ documentId: d.id, snippet: `...relevant snippet from ${d.name}...` }))
        };
    },

    prioritizeTasks: async (tasks: Todo[], projects: Project[], userId: number): Promise<{ prioritizedTaskIds: (string | number)[] }> => {
        const taskDetails = tasks.map(t => {
            const projName = projects.find(p => p.id === t.projectId)?.name;
            return `ID ${t.id}: "${t.text}" for project "${projName}", Priority: ${t.priority}, Due: ${t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'N/A'}`;
        }).join('\n');
        
        const prompt = `A user has these tasks:\n${taskDetails}\n\nBased on urgency (due date), importance (priority), and project context, return a comma-separated list of just the task IDs in the order they should be done.`;
        
        const response = await generateContent(prompt);
        
        const ids = response.text.split(',').map(id => id.trim()).filter(Boolean);
        return { prioritizedTaskIds: ids };
    },

    generateDailySummary: async (projectId: number, date: Date, userId: number): Promise<string> => {
        const [project] = await mockApi.getProjectsByCompany(1).then(projs => projs.filter(p => p.id === projectId));
        const todos = await mockApi.getTodosByProjectIds([projectId]);
        const todoSummary = todos.map(t => `- ${t.text} (Status: ${t.status})`).join('\n');

        const prompt = `Generate a daily summary report for project "${project.name}" for the date ${date.toLocaleDateString()}. Use this activity:\n${todoSummary}\n\nFormat it nicely with sections for completed tasks, in-progress tasks, and any blockers.`;
        
        const response = await generateContent(prompt);
        return response.text;
    },

    generateSafetyAnalysis: async (incidents: SafetyIncident[], projectId: number, userId: number): Promise<{ report: string }> => {
        const incidentSummary = incidents.map(i => `- ${i.description} (Severity: ${i.severity})`).join('\n');
        const prompt = `Analyze these safety incidents for a project:\n${incidentSummary}\n\nIdentify trends, common causes, and suggest 2-3 actionable preventative measures.`;
        const response = await generateContent(prompt);
        return { report: response.text };
    },

    getProjectHealth: async (project: Project, overdueTaskCount: number): Promise<ProjectHealth> => {
        const prompt = `Project "${project.name}" has status "${project.status}" with ${overdueTaskCount} overdue tasks. Budget is £${project.budget}, actual cost is £${project.actualCost}. Based on this, is the health 'Good', 'Needs Attention', or 'At Risk'? Provide a 1-sentence summary for the reasoning. Respond in JSON format: {"status": "...", "summary": "..."}`;
        
        try {
            return await generateJSON<ProjectHealth>(prompt);
        } catch {
            return { status: 'Needs Attention', summary: 'Could not determine project health.' };
        }
    },

    findGrants: async (keywords: string, location: string): Promise<Grant[]> => {
        const schema = {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.NUMBER },
                    name: { type: Type.STRING },
                    agency: { type: Type.STRING },
                    amount: { type: Type.STRING },
                    description: { type: Type.STRING },
                    url: { type: Type.STRING },
                }
            }
        };

        const prompt = `Find 3 construction grants in ${location} related to: ${keywords}. Return as JSON array.`;
        
        try {
            return await generateJSON<Grant[]>(prompt, schema);
        } catch {
            return [];
        }
    },

    analyzeForRisks: async (text: string): Promise<RiskAnalysis> => {
        const prompt = `Analyze this text for financial and compliance risks in a construction context. Provide a summary and a list of identified risks with severity, description, and recommendation.\n\nText: "${text}"\n\nReturn JSON with structure: {"summary": "...", "identifiedRisks": [{"severity": "...", "description": "...", "recommendation": "..."}]}`;
        
        const schema = {
            type: Type.OBJECT,
            properties: {
                summary: { type: Type.STRING },
                identifiedRisks: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            severity: { type: Type.STRING },
                            description: { type: Type.STRING },
                            recommendation: { type: Type.STRING },
                        }
                    }
                }
            }
        };

        try {
            return await generateJSON<RiskAnalysis>(prompt, schema);
        } catch {
            return {
                summary: 'Unable to analyze risks',
                identifiedRisks: []
            };
        }
    },

    generateBidPackage: async (tenderUrl: string, companyStrengths: string, userId: number): Promise<BidPackage> => {
        const prompt = `Company strengths: ${companyStrengths}. Tender URL (if provided): ${tenderUrl}. Generate a bid package with a summary, a professional cover letter, and a submission checklist.\n\nReturn JSON with structure: {"summary": "...", "coverLetter": "...", "checklist": ["item1", "item2", ...]}`;
        
        const schema = {
            type: Type.OBJECT,
            properties: {
                summary: { type: Type.STRING },
                coverLetter: { type: Type.STRING },
                checklist: { type: Type.ARRAY, items: { type: Type.STRING } },
            }
        };

        try {
            return await generateJSON<BidPackage>(prompt, schema);
        } catch {
            return {
                summary: 'Unable to generate bid package',
                coverLetter: '',
                checklist: []
            };
        }
    },
    
    generateCostEstimate: async (description: string, userId: number): Promise<string> => {
        const prompt = `Generate a high-level cost estimate for a construction project with this description: "${description}". Provide a single paragraph summary with a rough cost range.`;
        const response = await generateContent(prompt);
        return response.text;
    }
};