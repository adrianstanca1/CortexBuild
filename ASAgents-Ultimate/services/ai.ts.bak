import { GoogleGenAI, GenerateContentResponse, type GenerateContentConfig } from '@google/genai';
import {
  Project,
  Todo,
  SafetyIncident,
  Expense,
  Document,
  User,
  TodoStatus,
  TodoPriority,
  IncidentSeverity,
  FinancialKPIs,
  MonthlyFinancials,
  CostBreakdown,
  Invoice,
  InvoiceStatus,
  ExpenseStatus,
} from '../types';
import { apiCache } from './cacheService';
import { wrapError, withRetry } from '../utils/errorHandling';
import { getEnvironment } from '../config/environment';
import { geminiService } from './geminiService';

const MODEL_NAME = 'gemini-2.0-flash-001';
let cachedClient: GoogleGenAI | null = null;
let cachedApiKey: string | null = null;

const DEFAULT_GENERATION_CONFIG: GenerateContentConfig = {
  temperature: 0.35,
  maxOutputTokens: 768,
};


const normaliseForCache = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(normaliseForCache);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, entryValue]) => entryValue !== undefined)
        .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
        .map(([key, entryValue]) => [key, normaliseForCache(entryValue)]),
    );
  }

  return value;
};

const sanitiseGenerationConfig = (
  overrides: Partial<GenerateContentConfig> = {},
): GenerateContentConfig => {
  const merged: Record<string, unknown> = {
    ...DEFAULT_GENERATION_CONFIG,
    ...overrides,
  };

  const filteredEntries = Object.entries(merged).filter(([, value]) => value !== undefined);
  return filteredEntries.length
    ? (Object.fromEntries(filteredEntries) as GenerateContentConfig)
    : (DEFAULT_GENERATION_CONFIG as GenerateContentConfig);
};

const stripJsonCodeFences = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed.startsWith('```')) {
    return trimmed;
  }

  const withoutOpeningFence = trimmed.replace(/^```(?:json)?/i, '').trimStart();
  if (withoutOpeningFence.endsWith('```')) {
    return withoutOpeningFence.slice(0, -3).trimEnd();
  }
  return withoutOpeningFence.trim();
};

const extractTextFromResponse = (response?: GenerateContentResponse | null): string | null => {
  if (!response) {
    return null;
  }

  const directText = response.text?.trim();
  if (directText) {
    return directText;
  }

  const candidates = response.candidates ?? [];
  for (const candidate of candidates) {
    const parts = candidate.content?.parts ?? [];
    const text = parts
      .map(part => ('text' in part && typeof part.text === 'string' ? part.text.trim() : ''))
      .filter(Boolean)
      .join('\n')
      .trim();

    if (text) {
      return text;
    }
  }

  return null;
};

const hashString = (value: string): string => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
};

export type AdvisorTurn = {
  role: 'user' | 'assistant';
  text: string;
};

export interface AdvisorPromptInput {
  userName?: string;
  companyName?: string;
  projects: Project[];
  tasks: Todo[];
  history: AdvisorTurn[];
  query: string;
  intent?: 'intro' | 'general';
}

export interface AdvisorPromptResult {
  reply: string;
  model?: string;
  isFallback: boolean;
  metadata: Record<string, unknown>;
}

const getClient = (): GoogleGenAI | null => {
  const environment = getEnvironment();
  const geminiApiKey = environment.gemini.apiKey || import.meta.env.VITE_GEMINI_API_KEY;

  if (!geminiApiKey) {
    console.warn('Gemini API key is not configured. AI features will be disabled.');
    return null;
  }

  if (cachedClient && cachedApiKey === geminiApiKey) {
    return cachedClient;
  }

  try {
    cachedClient = new GoogleGenAI({ apiKey: geminiApiKey });
    cachedApiKey = geminiApiKey;
    return cachedClient;
  } catch (error) {
    cachedClient = null;
    cachedApiKey = null;
    console.error('Failed to initialise Gemini client', error);
    return null;
  }
};

type GenerationOverrides = Partial<GenerateContentConfig>;

const callGemini = async (
  prompt: string,
  overrides: GenerationOverrides = {},
): Promise<GenerateContentResponse | null> => {
  const client = getClient();
  if (!client) {
    return null;
  }

  // Check cache first
  const generationConfig = sanitiseGenerationConfig(overrides);
  const cacheKey = `ai:${hashString(prompt)}:${prompt.length}:${JSON.stringify(normaliseForCache(generationConfig))}`;
  const cached = apiCache.get<GenerateContentResponse>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    // Use retry mechanism for API calls
    const result = await withRetry(
      async () => {
        return await client.models.generateContent({
          model: MODEL_NAME,
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
          config: generationConfig,
        });
      },
      {
        maxAttempts: 3,
        baseDelay: 1000,
        backoffFactor: 2,
      },
      {
        operation: 'callGemini',
        component: 'ai-service',
        timestamp: new Date().toISOString(),
        metadata: { prompt: prompt.slice(0, 100), config: generationConfig },
      }
    );

    // Cache successful responses for 10 minutes
    if (result) {
      apiCache.set(cacheKey, result, 10 * 60 * 1000);
    }

    return result;
  } catch (error) {
    const wrappedError = wrapError(error, {
      operation: 'callGemini',
      component: 'ai-service',
      timestamp: new Date().toISOString(),
      metadata: { prompt: prompt.slice(0, 100), config: generationConfig },
    });
    console.error('Gemini request failed', wrappedError);
    return null;
  }
};

const formatCurrency = (value: number, currency: string = 'GBP') =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);

const clampPercentage = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const formatSignedPercentage = (value: number) => {
  if (!Number.isFinite(value)) {
    return '0%';
  }
  const rounded = Number(value.toFixed(1));
  const prefix = rounded > 0 ? '+' : '';
  return `${prefix}${rounded}%`;
};

type PortfolioStats = {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  onHoldProjects: number;
  overBudgetCount: number;
  overBudgetProjectNames: string[];
  averageProgress: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  highPriorityOpen: number;
};

const computePortfolioStats = (projects: Project[], tasks: Todo[]): PortfolioStats => {
  const totalProjects = projects.length;
  const activeProjects = projects.filter(project => project.status === 'ACTIVE').length;
  const completedProjects = projects.filter(project => project.status === 'COMPLETED').length;
  const onHoldProjects = projects.filter(project => project.status === 'ON_HOLD').length;
  const overBudgetProjects = projects.filter(project => project.actualCost > project.budget);
  const averageProgress =
    totalProjects > 0
      ? projects.reduce((sum, project) => sum + (Number.isFinite(project.progress) ? project.progress : 0), 0) /
        totalProjects
      : 0;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === TodoStatus.DONE).length;
  const inProgressTasks = tasks.filter(task => task.status === TodoStatus.IN_PROGRESS).length;
  const todoTasks = totalTasks - completedTasks - inProgressTasks;
  const highPriorityOpen = tasks.filter(
    task => task.priority === TodoPriority.HIGH && task.status !== TodoStatus.DONE,
  ).length;

  return {
    totalProjects,
    activeProjects,
    completedProjects,
    onHoldProjects,
    overBudgetCount: overBudgetProjects.length,
    overBudgetProjectNames: overBudgetProjects.slice(0, 4).map(project => project.name),
    averageProgress,
    totalTasks,
    completedTasks,
    inProgressTasks,
    todoTasks,
    highPriorityOpen,
  };
};

const formatDueDate = (value?: string) => {
  if (!value) {
    return 'unscheduled';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

const summariseProjectsForAdvisor = (projects: Project[], stats: PortfolioStats): string => {
  if (!stats.totalProjects) {
    return 'No active projects in scope.';
  }

  const progressLine = `Average progress ${Math.round(stats.averageProgress)}% with ${stats.overBudgetCount} project${
    stats.overBudgetCount === 1 ? '' : 's'
  } over budget.`;

  const highlights = [...projects]
    .sort((a, b) => (a.progress ?? 0) - (b.progress ?? 0))
    .slice(0, Math.min(3, projects.length))
    .map(project => {
      const progress = Number.isFinite(project.progress) ? Math.round(project.progress) : 0;
      return `- ${project.name}: status ${project.status}, progress ${progress}%, spend ${formatCurrency(
        project.actualCost,
      )} of ${formatCurrency(project.budget)}.`;
    });

  const lines = [
    `Portfolio: ${stats.totalProjects} project${stats.totalProjects === 1 ? '' : 's'} (${stats.activeProjects} active, ${stats.completedProjects} completed, ${stats.onHoldProjects} on hold).`,
    progressLine,
  ];

  if (highlights.length) {
    lines.push('Key project signals:', ...highlights);
  }

  return lines.join('\n');
};

const summariseTasksForAdvisor = (tasks: Todo[], stats: PortfolioStats): string => {
  if (!stats.totalTasks) {
    return 'No active tasks captured.';
  }

  const lines = [
    `Tasks: ${stats.totalTasks} total (${stats.completedTasks} done, ${stats.inProgressTasks} in progress, ${stats.todoTasks} queued).`,
  ];

  if (stats.highPriorityOpen > 0) {
    lines.push(`${stats.highPriorityOpen} high-priority task${stats.highPriorityOpen === 1 ? '' : 's'} awaiting attention.`);
  }

  const highPriorityTasks = tasks
    .filter(task => task.priority === TodoPriority.HIGH && task.status !== TodoStatus.DONE)
    .slice(0, 4)
    .map(task => {
      const progressValue =
        typeof task.progress === 'number'
          ? Math.round(task.progress)
          : task.status === TodoStatus.DONE
            ? 100
            : undefined;
      const progressLabel = progressValue != null ? `, progress ${progressValue}%` : '';
      return `- ${task.title || task.text} (${task.status}${progressLabel}) due ${formatDueDate(task.dueDate)}`;
    });

  if (highPriorityTasks.length) {
    lines.push('High-priority focus:', ...highPriorityTasks);
  }

  return lines.join('\n');
};

const MAX_HISTORY_TURNS = 6;

const formatConversationHistory = (history: AdvisorTurn[]): string => {
  if (!history.length) {
    return 'No prior conversation.';
  }

  const recent = history.slice(-MAX_HISTORY_TURNS);
  return recent
    .map(turn => `${turn.role === 'user' ? 'User' : 'Advisor'}: ${turn.text.trim()}`)
    .join('\n');
};

const buildAdvisorPrompt = (input: AdvisorPromptInput, stats: PortfolioStats): string => {
  const projectsSummary = summariseProjectsForAdvisor(input.projects, stats);
  const tasksSummary = summariseTasksForAdvisor(input.tasks, stats);
  const conversation = formatConversationHistory(input.history);
  const trimmedQuery = input.query.trim();
  const userDescriptor = input.userName ? `The user is ${input.userName}.` : 'The user manages the construction portfolio.';
  const companyDescriptor = input.companyName ? `They are working with ${input.companyName}.` : '';
  const requestDescriptor =
    input.intent === 'intro'
      ? 'Provide a brief greeting (max 3 sentences) that references one relevant data point and invite the user to ask how you can help.'
      : 'Respond with at most 4 concise sentences or bullet points. Prioritise actionable recommendations tied to the data. Avoid repeating the full context.';

  return `You are Ash, an expert construction operations co-pilot embedded in a project management platform.
${userDescriptor} ${companyDescriptor}

Portfolio context:
${projectsSummary}

Task context:
${tasksSummary}

Conversation so far:
${conversation}

Latest ${input.intent === 'intro' ? 'system instruction' : 'user request'}:
${trimmedQuery}

${requestDescriptor}
If information is missing, acknowledge it and recommend next steps rather than fabricating details.`;
};

const buildAdvisorFallback = (
  input: AdvisorPromptInput,
  stats: PortfolioStats,
  reason: string,
): AdvisorPromptResult => {
  const greetingName = input.userName ? ` ${input.userName}` : '';
  const projectLine = stats.totalProjects
    ? `${stats.totalProjects} project${stats.totalProjects === 1 ? '' : 's'} in scope (${stats.activeProjects} active, ${stats.completedProjects} completed, ${stats.onHoldProjects} on hold) with average progress ${Math.round(stats.averageProgress)}%.`
    : 'No active projects are currently linked to this workspace.';
  const taskLine = stats.totalTasks
    ? `${stats.totalTasks} tasks tracked (${stats.completedTasks} done, ${stats.inProgressTasks} in progress, ${stats.todoTasks} queued) and ${stats.highPriorityOpen} high-priority item${stats.highPriorityOpen === 1 ? '' : 's'} still open.`
    : 'No outstanding tasks are recorded yet.';
  const budgetLine = stats.overBudgetCount
    ? `Watch budgets on ${stats.overBudgetProjectNames.join(', ')}; spending has exceeded plan.`
    : 'Budgets are currently tracking within plan.';

  const introPrefix =
    input.intent === 'intro'
      ? `Hi${greetingName}! I cannot reach the Gemini service right now, so I am sharing a quick portfolio pulse instead.`
      : 'The Gemini service is temporarily unavailable; here is the latest snapshot from local data:';

  const reply = [introPrefix, `Projects: ${projectLine}`, `Tasks: ${taskLine}`, budgetLine, 'Try again shortly once connectivity is restored for deeper analysis.'].join(
    '\n\n',
  );

  return {
    reply,
    isFallback: true,
    metadata: {
      reason,
      intent: input.intent ?? 'general',
      isFallback: true,
      ...stats,
    },
  };
};

export const generateAdvisorResponse = async (
  input: AdvisorPromptInput,
): Promise<AdvisorPromptResult> => {
  const trimmedQuery = input.query.trim();
  const stats = computePortfolioStats(input.projects, input.tasks);

  if (!trimmedQuery) {
    return buildAdvisorFallback(input, stats, 'empty-query');
  }

  const prompt = buildAdvisorPrompt(input, stats);
  const overrides = input.intent === 'intro'
    ? { maxOutputTokens: 512, temperature: 0.25 }
    : { maxOutputTokens: 640, temperature: 0.35 };

  const response = await callGemini(prompt, overrides);

  const text = extractTextFromResponse(response);
  if (text) {
    const metadata: Record<string, unknown> = {
      intent: input.intent ?? 'general',
      isFallback: false,
      model: response?.modelVersion ?? MODEL_NAME,
      ...stats,
    };

    if (response?.usageMetadata) {
      metadata.usage = response.usageMetadata;
    }

    return {
      reply: text,
      model: response?.modelVersion ?? MODEL_NAME,
      isFallback: false,
      metadata,
    };
  }

  const reason = response ? 'empty-response' : 'llm-unavailable';
  return buildAdvisorFallback(input, stats, reason);
};

const inferHealthStatus = (progress: number, budgetUtilisation: number, openIncidents: number) => {
  if (budgetUtilisation > 110 || progress < 40) {
    return 'At Risk';
  }
  if (budgetUtilisation > 95 || openIncidents > 1) {
    return 'Needs Attention';
  }
  if (progress > 85 && budgetUtilisation < 95 && openIncidents === 0) {
    return 'On Track';
  }
  return 'Stable';
};

const buildTaskSummary = (tasks: Todo[]) => {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === TodoStatus.DONE).length;
  const inProgress = tasks.filter(t => t.status === TodoStatus.IN_PROGRESS).length;
  const notStarted = total - completed - inProgress;
  const averageProgress = total === 0
    ? 0
    : Math.round(
        tasks.reduce((acc, task) => acc + (task.progress ?? (task.status === TodoStatus.DONE ? 100 : 0)), 0) / total,
      );
  return { total, completed, inProgress, notStarted, averageProgress };
};

const buildIncidentSummary = (incidents: SafetyIncident[] = []) => {
  const openIncidents = incidents.filter(i => i.status !== 'RESOLVED');
  const highSeverity = openIncidents.filter(i => i.severity === IncidentSeverity.HIGH).length;
  return {
    total: incidents.length,
    open: openIncidents.length,
    highSeverity,
  };
};

const buildExpenseSummary = (expenses: Expense[] = []) => {
  const totalAmount = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  return {
    count: expenses.length,
    totalAmount,
  };
};

export interface ProjectHealthSummaryInput {
  project: Project;
  tasks: Todo[];
  incidents?: SafetyIncident[];
  expenses?: Expense[];
}

export interface ProjectHealthSummaryResult {
  summary: string;
  model?: string;
  isFallback: boolean;
  metadata: Record<string, unknown>;
}

const buildProjectContext = ({ project, tasks, incidents, expenses }: ProjectHealthSummaryInput) => {
  const tasksSnippet = tasks
    .slice(0, 12)
    .map(task => `- ${task.title || task.text}: status=${task.status} priority=${task.priority} progress=${task.progress ?? 0}%`)
    .join('\n');
  const incidentSnippet = (incidents ?? [])
    .slice(0, 8)
    .map(incident => `- ${incident.title} (${incident.severity}) status=${incident.status}`)
    .join('\n');
  const expenseSnippet = (expenses ?? [])
    .slice(0, 8)
    .map(expense => `- ${expense.description} – ${formatCurrency(expense.amount)} (${expense.status})`)
    .join('\n');

  return `Project overview:
Name: ${project.name}
Status: ${project.status}
Budget: ${formatCurrency(project.budget)}
Actual cost: ${formatCurrency(project.actualCost)}
Progress value: ${project.progress}%
Location: ${project.location.address}

Tasks:
${tasksSnippet || 'No active tasks listed.'}

Safety incidents:
${incidentSnippet || 'No incidents recorded.'}

Expenses:
${expenseSnippet || 'No expenses logged.'}`;
};

const buildFallbackProjectSummary = (input: ProjectHealthSummaryInput): ProjectHealthSummaryResult => {
  const { project, tasks, incidents = [], expenses = [] } = input;
  const taskSummary = buildTaskSummary(tasks);
  const incidentSummary = buildIncidentSummary(incidents);
  const expenseSummary = buildExpenseSummary(expenses);

  const budgetUtilisation = project.budget > 0 ? (project.actualCost / project.budget) * 100 : 0;
  const health = inferHealthStatus(taskSummary.averageProgress, budgetUtilisation, incidentSummary.open);

  const summary = [
    `Project health assessment for **${project.name}**: status **${health}**.`,
    `- **Progress:** ${clampPercentage(taskSummary.averageProgress)}% average progress with ${taskSummary.completed}/${taskSummary.total} tasks completed (${taskSummary.inProgress} in progress, ${taskSummary.notStarted} pending).`,
    `- **Budget:** ${clampPercentage(budgetUtilisation)}% of the ${formatCurrency(project.budget)} budget used (${formatCurrency(project.actualCost)} spent).`,
    `- **Safety:** ${incidentSummary.open} open incident(s) (${incidentSummary.highSeverity} high severity) out of ${incidentSummary.total} reported.`,
    `- **Expenses:** ${expenseSummary.count} logged entries totalling ${formatCurrency(expenseSummary.totalAmount)}.`,
    `- **Recommendation:** Focus on clearing blockers and monitor spending against contingency to keep the project on track.`,
  ].join('\n');

  return {
    summary,
    isFallback: true,
    metadata: {
      completedTasks: taskSummary.completed,
      totalTasks: taskSummary.total,
      averageProgress: taskSummary.averageProgress,
      budgetUtilisation,
      openIncidents: incidentSummary.open,
      highSeverityIncidents: incidentSummary.highSeverity,
      expenseTotal: expenseSummary.totalAmount,
      isFallback: true,
    },
  };
};

export const generateProjectHealthSummary = async (
  input: ProjectHealthSummaryInput,
): Promise<ProjectHealthSummaryResult> => {
  const prompt = `You are an experienced construction operations analyst. Review the project information and produce a concise status update with:
1. A one-line overall health classification (e.g., On Track, Needs Attention) using bold text.
2. Bullet points covering progress, budget position, safety signals, and actionable recommendations.
3. Keep the tone practical and data-driven, using figures from the context. If information is missing, acknowledge it rather than inventing details.

${buildProjectContext(input)}

Respond in Markdown using bullet points as requested.`;

  const response = await callGemini(prompt);

  const text = extractTextFromResponse(response);
  if (text) {
      const taskSummary = buildTaskSummary(input.tasks);
      const incidentSummary = buildIncidentSummary(input.incidents);
      const expenseSummary = buildExpenseSummary(input.expenses);
      const budgetUtilisation = input.project.budget > 0 ? (input.project.actualCost / input.project.budget) * 100 : 0;

      const metadata: Record<string, unknown> = {
        completedTasks: taskSummary.completed,
        totalTasks: taskSummary.total,
        averageProgress: taskSummary.averageProgress,
        budgetUtilisation,
        openIncidents: incidentSummary.open,
        highSeverityIncidents: incidentSummary.highSeverity,
        expenseTotal: expenseSummary.totalAmount,
        isFallback: false,
      };

      if (response.modelVersion) {
        metadata.modelVersion = response.modelVersion;
      }
      if (response.usageMetadata) {
        metadata.usageMetadata = response.usageMetadata;
      }

      return {
        summary: text,
        model: response.modelVersion ?? MODEL_NAME,
        isFallback: false,
        metadata,
      };
  }

  return buildFallbackProjectSummary(input);
};

export interface KnowledgeSearchInput {
  query: string;
  user: User;
  project?: Project | null;
  tasks?: Todo[];
  documents?: Document[];
  incidents?: SafetyIncident[];
  expenses?: Expense[];
}

export interface KnowledgeSearchResult {
  text: string;
  model?: string;
  isFallback: boolean;
}

const buildSearchContext = (input: KnowledgeSearchInput) => {
  const { project, tasks = [], documents = [], incidents = [], expenses = [] } = input;
  const projectLine = project
    ? `Focus project: ${project.name} (${project.status}) in ${project.location.address}. Budget ${formatCurrency(project.budget)}; spent ${formatCurrency(project.actualCost)}.`
    : 'Focus project: not specified.';
  const taskLines = tasks
    .slice(0, 15)
    .map(task => `- [${task.projectId}] ${task.title || task.text} (status=${task.status}, priority=${task.priority}, due=${task.dueDate})`)
    .join('\n');
  const docLines = documents
    .slice(0, 12)
    .map(doc => `- [${doc.projectId ?? 'n/a'}] ${doc.name} (${doc.category || doc.type}) tags=${doc.tags?.join(', ') ?? 'none'}`)
    .join('\n');
  const incidentLines = incidents
    .slice(0, 12)
    .map(incident => `- [${incident.projectId}] ${incident.title} severity=${incident.severity} status=${incident.status}`)
    .join('\n');
  const expenseLines = expenses
    .slice(0, 8)
    .map(expense => `- [${expense.projectId}] ${expense.description} amount=${formatCurrency(expense.amount)} status=${expense.status}`)
    .join('\n');

  return `${projectLine}

Relevant tasks:
${taskLines || 'No tasks available.'}

Documents:
${docLines || 'No documents captured.'}

Safety incidents:
${incidentLines || 'No incidents logged.'}

Expenses:
${expenseLines || 'No expenses recorded.'}`;
};

const buildFallbackSearch = (input: KnowledgeSearchInput): KnowledgeSearchResult => {
  const { query, tasks = [], documents = [], incidents = [], expenses = [] } = input;
  const needle = query.toLowerCase();

  const matchedTasks = tasks.filter(task =>
    [task.title, task.text, task.description]
      .filter(Boolean)
      .some(field => field!.toLowerCase().includes(needle)),
  );
  const matchedDocuments = documents.filter(doc =>
    [doc.name, doc.category, ...(doc.tags ?? [])]
      .filter(Boolean)
      .some(field => field!.toLowerCase().includes(needle)),
  );
  const matchedIncidents = incidents.filter(incident =>
    [incident.title, incident.description]
      .filter(Boolean)
      .some(field => field!.toLowerCase().includes(needle)),
  );
  const matchedExpenses = expenses.filter(expense =>
    [expense.description, expense.category]
      .filter(Boolean)
      .some(field => field!.toLowerCase().includes(needle)),
  );

  const parts: string[] = [`AI search results for "${query}":`];

  if (matchedTasks.length) {
    parts.push('- Tasks:');
    matchedTasks.slice(0, 5).forEach(task => {
      parts.push(`  • ${task.title || task.text} (project ${task.projectId}, status ${task.status})`);
    });
  }
  if (matchedDocuments.length) {
    parts.push('- Documents:');
    matchedDocuments.slice(0, 5).forEach(doc => {
      parts.push(`  • ${doc.name} (${doc.category || doc.type})`);
    });
  }
  if (matchedIncidents.length) {
    parts.push('- Safety incidents:');
    matchedIncidents.slice(0, 3).forEach(incident => {
      parts.push(`  • ${incident.title} (${incident.severity}, status ${incident.status})`);
    });
  }
  if (matchedExpenses.length) {
    parts.push('- Expenses:');
    matchedExpenses.slice(0, 3).forEach(expense => {
      parts.push(`  • ${expense.description} (${formatCurrency(expense.amount)})`);
    });
  }

  if (parts.length === 1) {
    parts.push('- No matching records found. Consider refining the query or checking another project.');
  } else {
    parts.push('- Tip: run a broader search or open the related module for full context.');
  }

  return {
    text: parts.join('\n'),
    isFallback: true,
  };
};

export const searchKnowledgeBase = async (input: KnowledgeSearchInput): Promise<KnowledgeSearchResult> => {
  const prompt = `You are an AI assistant embedded in a construction management platform. Answer the user's query using only the information in the context. If you cannot find a specific answer, suggest which dataset or module should be consulted.

User query: ${input.query}

Context:
${buildSearchContext(input)}

Respond with concise Markdown. Prioritise actionable insights, references to document names, task IDs, or incident statuses when relevant.`;

  const response = await callGemini(prompt, { maxOutputTokens: 512 });

  const text = extractTextFromResponse(response);
  if (text) {
    return {
      text,
      model: response?.modelVersion ?? MODEL_NAME,
      isFallback: false,
    };
  }

  return buildFallbackSearch(input);
};

interface FinancialSnapshot {
  monthsCount: number;
  averageProfit: number;
  lastProfit: number;
  profitTrendPct: number;
  openInvoiceBalance: number;
  approvedExpenseTotal: number;
  approvedExpenseRunRate: number;
  cashFlow: number;
  currency: string;
  projectedCash: number;
}

export interface FinancialForecastInput {
  companyName: string;
  currency?: string;
  horizonMonths: number;
  kpis?: FinancialKPIs | null;
  monthly?: MonthlyFinancials[];
  costs?: CostBreakdown[];
  invoices?: Invoice[];
  expenses?: Expense[];
}

export interface FinancialForecastResult {
  summary: string;
  model?: string;
  isFallback: boolean;
  metadata: Record<string, unknown>;
}

const computeFinancialSnapshot = (input: FinancialForecastInput, horizonMonths: number): FinancialSnapshot => {
  const monthly = input.monthly ?? [];
  const profits = monthly.map(entry => entry.profit ?? 0);
  const monthsCount = monthly.length;

  const totalProfit = profits.reduce((sum, value) => sum + value, 0);
  const averageProfit = monthsCount > 0 ? totalProfit / monthsCount : 0;
  const lastProfit = monthsCount > 0 ? profits[monthsCount - 1] : 0;
  const previousProfit = monthsCount > 1 ? profits[monthsCount - 2] : lastProfit;
  const rawTrend = monthsCount > 1 && previousProfit !== 0 ? ((lastProfit - previousProfit) / Math.abs(previousProfit)) * 100 : 0;
  const profitTrendPct = Number.isFinite(rawTrend) ? rawTrend : 0;

  const openInvoiceBalance = (input.invoices ?? []).reduce((sum, invoice) => {
    if (!invoice || invoice.status === InvoiceStatus.PAID || invoice.status === InvoiceStatus.CANCELLED) {
      return sum;
    }
    const balance = typeof invoice.balance === 'number'
      ? invoice.balance
      : Math.max((invoice.total ?? 0) - (invoice.amountPaid ?? 0), 0);
    return sum + balance;
  }, 0);

  const approvedExpenseTotal = (input.expenses ?? [])
    .filter(expense => expense.status === ExpenseStatus.APPROVED || expense.status === ExpenseStatus.PAID)
    .reduce((sum, expense) => sum + (expense.amount ?? 0), 0);

  const approvedExpenseRunRate = monthsCount > 0 ? approvedExpenseTotal / monthsCount : approvedExpenseTotal;

  const cashFlow = input.kpis?.cashFlow ?? 0;
  const currency = input.currency || input.kpis?.currency || 'GBP';
  const projectedCash = cashFlow + horizonMonths * (averageProfit - approvedExpenseRunRate);

  return {
    monthsCount,
    averageProfit,
    lastProfit,
    profitTrendPct,
    openInvoiceBalance,
    approvedExpenseTotal,
    approvedExpenseRunRate,
    cashFlow,
    currency,
    projectedCash,
  };
};

const buildForecastContext = (input: FinancialForecastInput, snapshot: FinancialSnapshot): string => {
  const monthlyLines = (input.monthly ?? [])
    .map(entry => `- ${entry.month}: revenue ${formatCurrency(entry.revenue, snapshot.currency)}, profit ${formatCurrency(entry.profit, snapshot.currency)}`)
    .join('\n');

  const costLines = (input.costs ?? [])
    .map(cost => `- ${cost.category}: ${formatCurrency(cost.amount, snapshot.currency)}`)
    .join('\n');

  const invoiceLines = (input.invoices ?? [])
    .filter(invoice => invoice.status !== InvoiceStatus.PAID && invoice.status !== InvoiceStatus.CANCELLED)
    .slice(0, 8)
    .map(invoice => {
      const balance = typeof invoice.balance === 'number'
        ? invoice.balance
        : Math.max((invoice.total ?? 0) - (invoice.amountPaid ?? 0), 0);
      const identifier = invoice.invoiceNumber || invoice.id;
      return `- ${identifier}: ${invoice.status} • total ${formatCurrency(invoice.total ?? 0, snapshot.currency)} • balance ${formatCurrency(balance, snapshot.currency)}`;
    })
    .join('\n');

  const expenseLines = (input.expenses ?? [])
    .filter(expense => expense.status === ExpenseStatus.APPROVED || expense.status === ExpenseStatus.PAID)
    .slice(0, 8)
    .map(expense => `- ${expense.description}: ${formatCurrency(expense.amount, expense.currency || snapshot.currency)} (${expense.status})`)
    .join('\n');

  return `Company: ${input.companyName}
Currency in use: ${snapshot.currency}
Planning horizon: ${input.horizonMonths} month(s)
Current KPIs: profitability ${typeof input.kpis?.profitability === 'number' ? `${input.kpis.profitability}%` : 'n/a'}, project margin ${typeof input.kpis?.projectMargin === 'number' ? `${input.kpis.projectMargin}%` : 'n/a'}, cash flow ${formatCurrency(snapshot.cashFlow, snapshot.currency)}

Monthly revenue and profit history:
${monthlyLines || 'No monthly history captured.'}

Cost allocation snapshot:
${costLines || 'No cost breakdown provided.'}

Outstanding invoices:
${invoiceLines || 'All invoices are settled.'}

Approved or paid expenses:
${expenseLines || 'No approved expenses logged.'}

Derived metrics:
- Average monthly profit: ${formatCurrency(snapshot.averageProfit, snapshot.currency)}
- Profit trend vs prior month: ${formatSignedPercentage(snapshot.profitTrendPct)}
- Open invoice balance: ${formatCurrency(snapshot.openInvoiceBalance, snapshot.currency)}
- Expense run rate: ${formatCurrency(snapshot.approvedExpenseRunRate, snapshot.currency)} per month
- Projected cash position (${input.horizonMonths} mo): ${formatCurrency(snapshot.projectedCash, snapshot.currency)}
- Notes: Focus on actionable recommendations and highlight risks to runway.`;
};

const buildFallbackFinancialForecast = (
  input: FinancialForecastInput,
  snapshot: FinancialSnapshot,
): FinancialForecastResult => {
  const historyLabel = snapshot.monthsCount > 0
    ? `${snapshot.monthsCount} month${snapshot.monthsCount === 1 ? '' : 's'} of trading`
    : 'limited trading data';

  const summary = [
    `**${input.companyName}** – ${input.horizonMonths}-month financial outlook`,
    `- Average profit: ${formatCurrency(snapshot.averageProfit, snapshot.currency)} per month (${historyLabel}).`,
    `- Cash position: ${formatCurrency(snapshot.cashFlow, snapshot.currency)} on hand with projected runway ${formatCurrency(snapshot.projectedCash, snapshot.currency)} after ${input.horizonMonths} month(s).`,
    `- Trend: ${snapshot.profitTrendPct === 0 ? 'Flat' : snapshot.profitTrendPct > 0 ? 'Improving' : 'Softening'} ${formatSignedPercentage(snapshot.profitTrendPct)} versus last month.`,
    `- Pipeline vs. spend: ${formatCurrency(snapshot.openInvoiceBalance, snapshot.currency)} outstanding invoices; monthly approved spend about ${formatCurrency(snapshot.approvedExpenseRunRate, snapshot.currency)}.`,
    `- Recommendation: Accelerate collections and hold discretionary costs to protect cash coverage over the planning window.`,
  ].join('\n');

  return {
    summary,
    isFallback: true,
    metadata: {
      horizonMonths: input.horizonMonths,
      averageMonthlyProfit: snapshot.averageProfit,
      projectedCash: snapshot.projectedCash,
      profitTrendPct: Number(Number.isFinite(snapshot.profitTrendPct) ? snapshot.profitTrendPct.toFixed(1) : '0'),
      openInvoiceBalance: snapshot.openInvoiceBalance,
      approvedExpenseRunRate: snapshot.approvedExpenseRunRate,
      cashFlow: snapshot.cashFlow,
      currency: snapshot.currency,
      isFallback: true,
    },
  };
};

export const generateFinancialForecast = async (
  input: FinancialForecastInput,
): Promise<FinancialForecastResult> => {
  const horizonMonths = Number.isFinite(input.horizonMonths)
    ? Math.max(1, Math.round(input.horizonMonths))
    : 3;
  const snapshot = computeFinancialSnapshot(input, horizonMonths);

  const prompt = `You are the CFO co-pilot for a construction company. Draft an actionable cash flow and profitability outlook for the next ${horizonMonths} month(s).
- Emphasise momentum (improving or declining) and quantify expected profit/runway.
- Highlight risks, e.g. outstanding invoices or elevated spend, and suggest mitigations.
- Keep it to 4-5 concise bullet points, using bold sparingly for key figures.
- Base recommendations strictly on the provided data.

${buildForecastContext({ ...input, horizonMonths }, snapshot)}

Respond in Markdown using bullet points.`;

  const response = await callGemini(prompt, { maxOutputTokens: 768, temperature: 0.3 });

  const text = extractTextFromResponse(response);
  if (text) {
    const metadata: Record<string, unknown> = {
      horizonMonths,
      averageMonthlyProfit: snapshot.averageProfit,
      projectedCash: snapshot.projectedCash,
      profitTrendPct: Number(Number.isFinite(snapshot.profitTrendPct) ? snapshot.profitTrendPct.toFixed(1) : '0'),
      openInvoiceBalance: snapshot.openInvoiceBalance,
      approvedExpenseRunRate: snapshot.approvedExpenseRunRate,
      cashFlow: snapshot.cashFlow,
      currency: snapshot.currency,
      isFallback: false,
    };

    if (response?.modelVersion) {
      metadata.modelVersion = response.modelVersion;
    }
    if (response?.usageMetadata) {
      metadata.usageMetadata = response.usageMetadata;
    }

    return {
      summary: text,
      model: response?.modelVersion ?? MODEL_NAME,
      isFallback: false,
      metadata,
    };
  }

  return buildFallbackFinancialForecast({ ...input, horizonMonths }, snapshot);
};

export type CostEstimateQuality = 'basic' | 'standard' | 'high-end';

export interface CostEstimateInput {
  description: string;
  squareFootage: number;
  quality: CostEstimateQuality;
  currency?: string;
  location?: string;
  requestedBy?: string;
}

export interface CostEstimateBreakdownItem {
  category: string;
  cost: number;
  details: string;
}

export interface CostEstimateResult {
  totalEstimate: number;
  breakdown: CostEstimateBreakdownItem[];
  contingency: number;
  summary: string;
  model?: string;
  isFallback: boolean;
  metadata: Record<string, unknown>;
}

type InternalCostEstimateInput = CostEstimateInput & { currency: string; squareFootage: number };

const COST_PER_SQFT: Record<CostEstimateQuality, number> = {
  basic: 120,
  standard: 165,
  'high-end': 225,
};

const CONTINGENCY_RATE = 0.12;

const COST_BREAKDOWN_TEMPLATE: Array<{ category: string; share: number; details: string }> = [
  {
    category: 'Structure & shell',
    share: 0.3,
    details: 'Foundations, frame, envelope and core stability works.',
  },
  {
    category: 'Building services',
    share: 0.22,
    details: 'Mechanical, electrical, plumbing, fire and life safety systems.',
  },
  {
    category: 'Interior fit-out',
    share: 0.2,
    details: 'Partitions, finishes, joinery, fixtures and specialist spaces.',
  },
  {
    category: 'Site & preliminaries',
    share: 0.18,
    details: 'Site setup, logistics, temporary works and programme management.',
  },
  {
    category: 'Professional & compliance',
    share: 0.1,
    details: 'Design coordination, surveys, permits and quality assurance.',
  },
];

const COST_ESTIMATE_SCHEMA: Record<string, unknown> = {
  type: 'object',
  properties: {
    totalEstimate: { type: 'number' },
    breakdown: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          cost: { type: 'number' },
          details: { type: 'string' },
        },
        required: ['category', 'cost'],
      },
      minItems: 3,
    },
    contingency: { type: 'number' },
    summary: { type: 'string' },
  },
  required: ['totalEstimate', 'breakdown', 'contingency', 'summary'],
};

const buildFallbackCostEstimate = (
  input: InternalCostEstimateInput,
  reason: 'llm-unavailable' | 'invalid-json',
): CostEstimateResult => {
  const qualityRate = COST_PER_SQFT[input.quality] ?? COST_PER_SQFT.standard;
  const baseCost = Math.max(input.squareFootage, 1) * qualityRate;
  const contingency = Math.round(baseCost * CONTINGENCY_RATE);
  const totalEstimate = Math.round(baseCost + contingency);

  const breakdown = COST_BREAKDOWN_TEMPLATE.map(item => ({
    category: item.category,
    cost: Math.round(baseCost * item.share),
    details: item.details,
  }));

  const summary = [
    `Offline baseline for ${input.squareFootage.toLocaleString()} sq ft (${input.quality.replace('-', ' ')}) project: ~${formatCurrency(totalEstimate, input.currency)} including ${Math.round(CONTINGENCY_RATE * 100)}% contingency.`,
    'Tune procurement packages and configure a Gemini API key for supplier-calibrated estimates.',
  ].join('\n');

  return {
    totalEstimate,
    breakdown,
    contingency,
    summary,
    isFallback: true,
    metadata: {
      quality: input.quality,
      squareFootage: input.squareFootage,
      baseRatePerSqFt: qualityRate,
      contingencyRate: CONTINGENCY_RATE,
      currency: input.currency,
      fallbackReason: reason,
      isFallback: true,
    },
  };
};

type ParsedCostEstimate = Pick<CostEstimateResult, 'totalEstimate' | 'breakdown' | 'contingency' | 'summary'>;

const parseCostEstimateResponse = (payload: string): ParsedCostEstimate | null => {
  try {
    const normalised = stripJsonCodeFences(payload);
    const data = JSON.parse(normalised);
    if (!data || typeof data !== 'object') {
      return null;
    }

    const totalEstimate = Number((data as Record<string, unknown>).totalEstimate);
    const contingency = Number((data as Record<string, unknown>).contingency);
    const summary = typeof (data as Record<string, unknown>).summary === 'string'
      ? ((data as Record<string, unknown>).summary as string).trim()
      : '';

    const breakdownRaw = Array.isArray((data as Record<string, unknown>).breakdown)
      ? ((data as Record<string, unknown>).breakdown as Array<Record<string, unknown>>)
      : [];

    const breakdown: CostEstimateBreakdownItem[] = breakdownRaw
      .map(item => ({
        category: typeof item.category === 'string' ? item.category.trim() : '',
        cost: Number(item.cost),
        details: typeof item.details === 'string' ? item.details.trim() : '',
      }))
      .filter(item => Boolean(item.category) && Number.isFinite(item.cost) && item.cost >= 0)
      .map(item => ({
        category: item.category,
        cost: Math.round(item.cost),
        details: item.details || 'No additional detail provided.',
      }));

    if (!Number.isFinite(totalEstimate) || totalEstimate <= 0) {
      return null;
    }
    if (!Number.isFinite(contingency) || contingency < 0) {
      return null;
    }
    if (!summary) {
      return null;
    }
    if (!breakdown.length) {
      return null;
    }

    return {
      totalEstimate: Math.round(totalEstimate),
      contingency: Math.round(contingency),
      breakdown,
      summary,
    };
  } catch (error) {
    console.warn('[ai] Failed to parse cost estimate response as JSON', error);
    return null;
  }
};

export const generateCostEstimate = async (
  input: CostEstimateInput,
): Promise<CostEstimateResult> => {
  const currency = input.currency ?? 'GBP';
  const squareFootage = Number.isFinite(input.squareFootage)
    ? Math.max(1, Math.round(input.squareFootage))
    : 0;
  const description = input.description.trim();

  if (!description || squareFootage <= 0) {
    throw new Error('Description and positive square footage are required to estimate costs.');
  }

  const promptSegments = [
    'You are a UK construction quantity surveyor generating an order-of-magnitude estimate.',
    `Project brief: ${description}`,
    `Floor area: ${squareFootage.toLocaleString()} sq ft`,
    `Finish quality: ${input.quality}`,
    input.location ? `Location/context: ${input.location}` : null,
    input.requestedBy ? `Requested by: ${input.requestedBy}` : null,
    `Respond with a single JSON object matching the provided schema in ${currency}.`,
    'Normalise costs to 2024 pricing and include UK-typical allowances.',
  ].filter(Boolean);

  const prompt = `${promptSegments.join('\n')}`;

  const response = await callGemini(prompt, {
    maxOutputTokens: 640,
    temperature: 0.2,
    responseMimeType: 'application/json',
    responseSchema: COST_ESTIMATE_SCHEMA,
  });

  const text = extractTextFromResponse(response);
  if (text) {
    const parsed = parseCostEstimateResponse(text);
    if (parsed) {
      const metadata: Record<string, unknown> = {
        quality: input.quality,
        squareFootage,
        currency,
        breakdownCategories: parsed.breakdown.length,
        isFallback: false,
      };

      if (response?.modelVersion) {
        metadata.modelVersion = response.modelVersion;
      }
      if (response?.usageMetadata) {
        metadata.usageMetadata = response.usageMetadata;
      }

      return {
        ...parsed,
        model: response?.modelVersion ?? MODEL_NAME,
        isFallback: false,
        metadata,
      };
    }
  }

  return buildFallbackCostEstimate({ ...input, currency, squareFootage }, text ? 'invalid-json' : 'llm-unavailable');
};
