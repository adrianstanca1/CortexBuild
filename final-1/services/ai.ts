import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import {
  Project,
  Todo,
  SafetyIncident,
  Expense,
  Document,
  User,
  TodoStatus,
  IncidentSeverity,
  FinancialKPIs,
  MonthlyFinancials,
  CostBreakdown,
  Invoice,
  InvoiceStatus,
  ExpenseStatus,
} from '../types';

const MODEL_NAME = 'gemini-2.0-flash-001';
const API_KEY = typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY
  ? import.meta.env.VITE_GEMINI_API_KEY
  : typeof process !== 'undefined'
    ? (process.env?.GEMINI_API_KEY as string | undefined)
    : undefined;

let cachedClient: GoogleGenAI | null = null;

const DEFAULT_GENERATION_CONFIG = {
  temperature: 0.35,
  maxOutputTokens: 768,
} as const;

const getClient = (): GoogleGenAI | null => {
  if (!API_KEY) {
    return null;
  }

  if (cachedClient) {
    return cachedClient;
  }

  try {
    cachedClient = new GoogleGenAI({ apiKey: API_KEY });
    return cachedClient;
  } catch (error) {
    console.error('Failed to initialise Gemini client', error);
    return null;
  }
};

type GenerationOverrides = Partial<typeof DEFAULT_GENERATION_CONFIG>;

const callGemini = async (
  prompt: string,
  overrides: GenerationOverrides = {},
): Promise<GenerateContentResponse | null> => {
  const client = getClient();
  if (!client) {
    return null;
  }

  try {
    const config = { ...DEFAULT_GENERATION_CONFIG, ...overrides };
    return await client.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config,
    });
  } catch (error) {
    console.error('Gemini request failed', error);
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

  if (response?.text) {
    const text = response.text.trim();
    if (text.length > 0) {
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

  if (response?.text) {
    const text = response.text.trim();
    if (text.length > 0) {
      return {
        text,
        model: response.modelVersion ?? MODEL_NAME,
        isFallback: false,
      };
    }
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

  if (response?.text) {
    const text = response.text.trim();
    if (text.length > 0) {
      const metadata: Record<string, unknown> = {
        horizonMonths,
        averageMonthlyProfit: snapshot.averageProfit,
        projectedCash: snapshot.projectedCash,
        profitTrendPct: Number(snapshot.profitTrendPct.toFixed(1)),
        openInvoiceBalance: snapshot.openInvoiceBalance,
        approvedExpenseRunRate: snapshot.approvedExpenseRunRate,
        cashFlow: snapshot.cashFlow,
        currency: snapshot.currency,
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
  }

  return buildFallbackFinancialForecast({ ...input, horizonMonths }, snapshot);
};
