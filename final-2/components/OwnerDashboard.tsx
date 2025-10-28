import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { ViewHeader } from './layout/ViewHeader';
import {
  User,
  Project,
  FinancialKPIs,
  MonthlyFinancials,
  CostBreakdown,
  Invoice,
  Expense,
  SafetyIncident,
  Timesheet,
  FinancialForecast,
  OperationalInsights,
  View,
  InvoiceStatus,
  IncidentStatus,
  IncidentSeverity,
  TimesheetStatus,
  ProjectPortfolioSummary,
} from '../types';
import * as api from '../services/mockApi';
import { 
  computeProjectPortfolioSummary,
  getInvoiceFinancials,
  getDerivedStatus,
  generateFinancialForecast,
} from '../utils/businessLogic';

interface OwnerDashboardProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
  onSelectProject: (project: Project) => void;
  setActiveView?: (view: View) => void;
}

interface OwnerDashboardData {
  projects: Project[];
  kpis: FinancialKPIs | null;
  monthly: MonthlyFinancials[];
  costs: CostBreakdown[];
  invoices: Invoice[];
  expenses: Expense[];
  incidents: SafetyIncident[];
  timesheets: Timesheet[];
  forecasts: FinancialForecast[];
  companyName: string | null;
  users: User[];
  operationalInsights: OperationalInsights | null;
}

const formatCurrency = (value: number, currency: string = 'GBP') =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value || 0);

const clampPercentage = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const renderMarkdownSummary = (summary: string) =>
  summary
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line, index) => (
      <p
        key={`${line}-${index}`}
        className="text-sm text-muted-foreground"
        dangerouslySetInnerHTML={{
          __html: line
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>')
            .replace(/^[-•]\s+/, '• '),
        }}
      />
    ));

const MiniBarChart: React.FC<{
  data: Array<{ label: string; value: number }>;
  accent?: 'primary' | 'emerald' | 'amber';
  emptyLabel: string;
}> = ({ data, accent = 'primary', emptyLabel }) => {
  if (!data.length) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }
  const max = Math.max(...data.map((item) => item.value), 1);
  const color =
    accent === 'emerald' ? 'bg-emerald-500' : accent === 'amber' ? 'bg-amber-500' : 'bg-primary';
  return (
    <div className="flex items-end gap-2">
      {data.map((item) => (
        <div className="flex flex-1 flex-col items-center gap-1" key={item.label}>
          <div className="text-xs font-semibold text-muted-foreground">{item.label}</div>
          <div className="flex h-32 w-full items-end overflow-hidden rounded bg-muted/60">
            <div
              className={`${color} w-full rounded-t transition-all`}
              style={{ height: `${Math.max(6, (item.value / max) * 100)}%` }}
              title={`${item.label}: ${item.value.toLocaleString()}`}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const CostBreakdownList: React.FC<{ data: CostBreakdown[]; currency: string }> = ({ data, currency }) => {
  if (!data.length) {
    return <p className="text-sm text-muted-foreground">No approved costs recorded.</p>;
  }
  const total = data.reduce((sum, entry) => sum + (entry.amount || 0), 0) || 1;
  return (
    <div className="space-y-3">
      {data.map((entry) => {
        const share = Math.round(((entry.amount || 0) / total) * 100);
        return (
          <div className="space-y-1" key={entry.category}>
            <div className="flex items-center justify-between text-sm font-semibold text-foreground">
              <span>{entry.category}</span>
              <span>{formatCurrency(entry.amount || 0, currency)}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded bg-muted">
              <div className="h-full rounded bg-primary/80" style={{ width: `${share}%` }} />
            </div>
            <p className="text-xs text-muted-foreground">{share}% of tracked spend</p>
          </div>
        );
      })}
    </div>
  );
};

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  user,
  addToast,
  onSelectProject,
  setActiveView,
}) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<OwnerDashboardData>({
    projects: [],
    kpis: null,
    monthly: [],
    costs: [],
    invoices: [],
    expenses: [],
    incidents: [],
    timesheets: [],
    forecasts: [],
    companyName: null,
    users: [],
    operationalInsights: null,
  });
  const [briefError, setBriefError] = useState<string | null>(null);
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);
  const [selectedHorizon, setSelectedHorizon] = useState(3);
  const abortControllerRef = useRef<AbortController | null>(null);

  const currency = data.kpis?.currency ?? 'GBP';

  const fetchData = useCallback(async () => {
    if (!user.companyId) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    abortControllerRef.current?.abort();
    abortControllerRef.current = controller;
    setLoading(true);
    try {
      const [
        projects,
        kpis,
        monthly,
        costs,
        invoices,
        expenses,
        users,
        timesheets,
        forecasts,
        operationalInsights,
        companies,
      ] = await Promise.all([
        api.getProjectsByCompany(user.companyId, { signal: controller.signal }),
        api.getFinancialKPIsForCompany(user.companyId, { signal: controller.signal }),
        api.getMonthlyFinancials(user.companyId, { signal: controller.signal }),
        api.getCostBreakdown(user.companyId, { signal: controller.signal }),
        api.getInvoicesByCompany(user.companyId, { signal: controller.signal }),
        api.getExpensesByCompany(user.companyId, { signal: controller.signal }),
        api.getUsersByCompany(user.companyId, { signal: controller.signal }),
        api.getTimesheetsByCompany(user.companyId, user.id, { signal: controller.signal }),
        api.getFinancialForecasts(user.companyId, { signal: controller.signal }),
        api.getOperationalInsights(user.companyId, { signal: controller.signal }),
        api.getCompanies({ signal: controller.signal }),
      ]);
      if (controller.signal.aborted) return;

      const incidents = await api.getSafetyIncidentsByCompany(user.companyId);
      if (controller.signal.aborted) return;

      const companyName = companies.find((company) => company.id === user.companyId)?.name ?? null;

      setData({
        projects,
        kpis,
        monthly,
        costs,
        invoices,
        expenses,
        incidents,
        timesheets,
        forecasts,
        companyName,
        users,
        operationalInsights,
      });
    } catch (error) {
      if (controller.signal.aborted) return;
      console.error('Failed to load owner dashboard', error);
      addToast('Unable to load the executive dashboard right now.', 'error');
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [user.companyId, user.id, addToast]);

  useEffect(() => {
    fetchData();
    return () => abortControllerRef.current?.abort();
  }, [fetchData]);

  const portfolioSummary: ProjectPortfolioSummary = useMemo(
    () => computeProjectPortfolioSummary(data.projects),
    [data.projects]
  );

  const atRiskProjects = useMemo(() => {
    return data.projects
      .map((project) => {
        const budget = project.budget ?? 0;
        const actual = project.actualCost ?? project.spent ?? 0;
        const progress = project.progress ?? 0;
        const isOverBudget = budget > 0 ? actual / budget > 1.05 : false;
        const riskScore =
          (isOverBudget ? 1.2 : 1) *
          (project.status === 'ON_HOLD' ? 1.3 : 1) *
          (project.status === 'CANCELLED' ? 0 : 1) *
          (progress < 40 ? 1.2 : 1) *
          (portfolioSummary.upcomingDeadlines.some((d) => d.id === project.id && d.isOverdue) ? 1.3 : 1);
        return { project, budget, actual, progress, riskScore };
      })
      .filter((entry) => entry.project.status !== 'COMPLETED' && entry.project.status !== 'CANCELLED')
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 4);
  }, [data.projects, portfolioSummary.upcomingDeadlines]);

  const { outstandingReceivables, overdueReceivables, invoicePipeline } = useMemo(() => {
    return data.invoices.reduce(
      (acc, invoice) => {
        const { balance, total } = getInvoiceFinancials(invoice);
        acc.outstandingReceivables += balance;
        acc.invoicePipeline += total;
        const derivedStatus = getDerivedStatus(invoice);
        if (derivedStatus === InvoiceStatus.OVERDUE) acc.overdueReceivables += balance;
        return acc;
      },
      { outstandingReceivables: 0, overdueReceivables: 0, invoicePipeline: 0 }
    );
  }, [data.invoices]);

  const fallbackApprovedExpenseTotal = useMemo(
    () =>
      data.expenses
        .filter((expense) => expense.status === 'APPROVED' || expense.status === 'PAID')
        .reduce((sum, expense) => sum + (expense.amount || 0), 0),
    [data.expenses]
  );

  const approvedExpenses = useMemo(
    () => data.expenses.filter((expense) => expense.status === 'APPROVED' || expense.status === 'PAID'),
    [data.expenses]
  );

  const approvedExpenseTotal = useMemo(
    () => approvedExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0),
    [approvedExpenses]
  );

  const openIncidents = useMemo(
    () => data.incidents.filter((incident) => incident.status !== IncidentStatus.RESOLVED),
    [data.incidents]
  );

  const fallbackHighSeverityIncidents = useMemo(
    () => openIncidents.filter((i) => i.severity === IncidentSeverity.HIGH || i.severity === IncidentSeverity.CRITICAL),
    [openIncidents]
  );

  const highSeverityIncidents = useMemo(
    () => openIncidents.filter((i) => i.severity === IncidentSeverity.HIGH || i.severity === IncidentSeverity.CRITICAL),
    [openIncidents]
  );

  const complianceRate = useMemo(() => {
    const submitted = data.timesheets.filter((ts) => ts.status !== TimesheetStatus.DRAFT);
    if (!submitted.length) return 0;
    const approved = submitted.filter((ts) => ts.status === TimesheetStatus.APPROVED).length;
    return clampPercentage((approved / submitted.length) * 100);
  }, [data.timesheets]);

  const revenueTrend = useMemo(
    () => data.monthly.slice(-6).map((entry) => ({ label: entry.month, value: entry.revenue })),
    [data.monthly]
  );

  const profitTrend = useMemo(
    () => data.monthly.slice(-6).map((entry) => ({ label: entry.month, value: entry.profit })),
    [data.monthly]
  );

  const operationalInsights = data.operationalInsights;
  const financialCurrency = operationalInsights?.financial.currency ?? currency;
  const openIncidentsCount = operationalInsights?.safety.openIncidents ?? openIncidents.length;
  const highSeverityCount = operationalInsights?.safety.highSeverity ?? fallbackHighSeverityIncidents.length;
  const daysSinceLastIncident = operationalInsights?.safety.daysSinceLastIncident ?? null;
  const approvedExpenseRunRate = operationalInsights?.financial.approvedExpensesThisMonth ?? fallbackApprovedExpenseTotal;
  const burnRatePerProject = operationalInsights?.financial.burnRatePerActiveProject ?? null;
  const crewOnShift = operationalInsights?.workforce.activeTimesheets ?? 0;
  const pendingTimesheetApprovals = operationalInsights?.workforce.pendingApprovals ?? 0;
  const approvalsClearedThisWeek = operationalInsights?.workforce.approvedThisWeek ?? 0;
  const overtimeHours = operationalInsights?.workforce.overtimeHours ?? null;
  const operationalAlerts = operationalInsights?.alerts ?? [];

  const latestForecast = data.forecasts[0] ?? null;
  const previousForecasts = data.forecasts.slice(1, 4);

  const handleGenerateBrief = useCallback(
    async (horizon: number) => {
      if (!user.companyId) return;
      setIsGeneratingBrief(true);
      setBriefError(null);
      try {
        const forecast = await generateFinancialForecast({
          companyName: data.companyName ?? 'Portfolio',
          currency,
          horizonMonths: horizon,
          kpis: data.kpis,
          monthly: data.monthly,
          costs: data.costs,
          invoices: data.invoices,
          expenses: data.expenses,
        });
        const saved = await api.createFinancialForecast(
          {
            companyId: user.companyId,
            summary: forecast.summary,
            horizonMonths: horizon,
            metadata: { ...forecast.metadata, source: 'owner-dashboard' },
            model: forecast.model,
          },
          user.id
        );
        setData((prev) => ({ ...prev, forecasts: [saved, ...prev.forecasts] }));
        addToast('Executive outlook refreshed.', 'success');
      } catch (error) {
        console.error('Failed to generate financial forecast', error);
        setBriefError('Unable to generate the AI outlook right now.');
        addToast('Could not generate the AI briefing.', 'error');
      } finally {
        setIsGeneratingBrief(false);
      }
    },
    [user.companyId, user.id, data.companyName, data.kpis, data.monthly, data.costs, data.invoices, data.expenses, currency, addToast]
  );

  if (loading) return <>Loading executive overview…</>;

  return (
    <div className="space-y-6">
      <ViewHeader
        title="Executive control centre"
        description="Monitor the commercial pulse and operational risk across the portfolio."
        actions={
          setActiveView
            ? (
                <Button variant="secondary" onClick={() => setActiveView('financials')}>
                  Open financial workspace
                </Button>
              )
            : undefined
        }
        meta={[
          {
            label: 'Portfolio value',
            value: formatCurrency(portfolioSummary.pipelineValue, currency),
            helper: `${portfolioSummary.totalProjects} active engagements`,
          },
          {
            label: 'Risk exposure',
            value: `${portfolioSummary.highRiskProjects} high-risk`,
            helper: 'Projects requiring immediate attention',
          },
        ]}
      />

      {/* Dashboard content would go here */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Portfolio Overview</h3>
          </CardHeader>
          <CardContent>
            <p>Executive dashboard content coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
