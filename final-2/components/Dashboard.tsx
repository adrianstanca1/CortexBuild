import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    User,
    View,
    Project,
    Todo,
    Equipment,
    AuditLog,
    TodoStatus,
    AvailabilityStatus,
    SafetyIncident,
    Expense,
    IncidentStatus,
    ExpenseStatus,
    ProjectPortfolioSummary,
    OperationalInsights,
    DashboardSnapshotMetadata,
 } from '../types';
import './ui/storageUsage.css';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Avatar } from './ui/Avatar';
import { EquipmentStatusBadge } from './ui/StatusBadge';
import { Tag } from './ui/Tag';
import { ViewHeader } from './layout/ViewHeader';
import { format, eachDayOfInterval, isWithinInterval } from 'date-fns';
import { computeProjectPortfolioSummary } from '../utils/projectPortfolio';
import { generateProjectHealthSummary, ProjectHealthSummaryResult } from '../services/ai';
import { backendGateway } from '../services/backendGateway';

interface DashboardProps {
    user: User;
    addToast: (message: string, type: 'success' | 'error') => void;
    activeView: View;
    setActiveView: (view: View) => void;
    onSelectProject: (project: Project) => void;
}

interface KpiCardProps { title: string; value: string; subtext?: string; icon: React.ReactNode; children?: React.ReactNode }
const KpiCard: React.FC<KpiCardProps> = ({ title, value, subtext, icon, children }) => (
    <Card className="flex items-center gap-4 animate-card-enter">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-muted text-muted-foreground">
            {icon}
        </div>
        <div className="flex-1">
            <h3 className="font-semibold text-muted-foreground">{title}</h3>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {subtext && <p className="text-sm text-muted-foreground">{subtext}</p>}
            {children ? <div className="mt-2">{children}</div> : null}
        </div>
    </Card>
);

const BarChart: React.FC<{ data: { label: string, value: number }[], barColor: string }> = ({ data, barColor }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1); // Ensure maxValue is at least 1 to avoid division by zero
    return (
        <div className="w-full h-48 flex items-end justify-around gap-2 p-2">
            {data.map((item, index) => (
                <div key={index} className="flex flex-col items-center justify-end h-full w-full group">
                    <div className="text-xs font-bold text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">{item.value}</div>
                    <div className={`${barColor} w-full rounded-t-sm group-hover:opacity-80 transition-opacity`} style={{ height: `${(item.value / maxValue) * 90}%` }} title={`${item.label}: ${item.value}`}></div>
                    <span className="text-xs mt-1 text-muted-foreground">{item.label}</span>
                </div>
            ))}
        </div>
    );
};

const renderMarkdownSummary = (summary: string) =>
    summary
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
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

const formatCurrency = (value: number, currency: string = 'GBP') =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value || 0);

const clampPercentage = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const availabilityTagColor: Record<AvailabilityStatus, 'green' | 'blue' | 'gray'> = {
    [AvailabilityStatus.AVAILABLE]: 'green',
    [AvailabilityStatus.ON_PROJECT]: 'blue',
    [AvailabilityStatus.ON_LEAVE]: 'gray',
};

// FIX: Local implementation of startOfWeek to resolve module export error.
const startOfWeek = (date: Date, options?: { weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6 }): Date => {
    const weekStartsOn = options?.weekStartsOn ?? 0;
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day < weekStartsOn ? day + 7 : day) - weekStartsOn;
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
};

export const Dashboard: React.FC<DashboardProps> = ({ user, addToast, setActiveView, onSelectProject }) => {
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState<Project[]>([]);
    const [team, setTeam] = useState<User[]>([]);
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [tasks, setTasks] = useState<Todo[]>([]);
    const [activityLog, setActivityLog] = useState<AuditLog[]>([]);
    const [incidents, setIncidents] = useState<SafetyIncident[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [operationalInsights, setOperationalInsights] = useState<OperationalInsights | null>(null);
    const [snapshotMetadata, setSnapshotMetadata] = useState<DashboardSnapshotMetadata | null>(null);

    const [aiSelectedProjectId, setAiSelectedProjectId] = useState<string | null>(null);
    const [aiSummary, setAiSummary] = useState<ProjectHealthSummaryResult | null>(null);
    const [aiSummaryProjectId, setAiSummaryProjectId] = useState<string | null>(null);
    const [isGeneratingAiSummary, setIsGeneratingAiSummary] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchData = useCallback(async (forceRefresh = false) => {
        const controller = new AbortController();
        abortControllerRef.current?.abort();
        abortControllerRef.current = controller;

        setLoading(true);
        try {
            if (!user.companyId) {
                return;
            }

            const snapshot = await backendGateway.getDashboardSnapshot({
                userId: user.id,
                companyId: user.companyId,
                signal: controller.signal,
                forceRefresh,
            });

            if (controller.signal.aborted) return;
             setSnapshotMetadata(snapshot.metadata);
              setProjects(snapshot.projects);
            setAiSelectedProjectId(prev => prev ?? snapshot.projects.find(p => p.status === 'ACTIVE')?.id ?? snapshot.projects[0]?.id ?? null);
            if (controller.signal.aborted) return;
            setTeam(snapshot.team);
            if (controller.signal.aborted) return;
            setEquipment(snapshot.equipment);
            if (controller.signal.aborted) return;
            setTasks(snapshot.tasks);
            if (controller.signal.aborted) return;
            setActivityLog(snapshot.activityLog);
            if (controller.signal.aborted) return;
            setOperationalInsights(snapshot.operationalInsights);
            if (controller.signal.aborted) return;
            setIncidents(snapshot.incidents);
            if (controller.signal.aborted) return;
            setExpenses(snapshot.expenses);

            void backendGateway.recordInteraction({
                type: 'dashboard_snapshot_loaded',
                userId: user.id,
                companyId: user.companyId,
                context: {
                    projectCount: snapshot.projects.length,
                    taskCount: snapshot.tasks.length,
                    source: snapshot.metadata.source,
                    usedFallback: snapshot.metadata.usedFallback,
                     fallbackReason: snapshot.metadata.fallbackReason,
                  },
            });
        } catch (error) {
            if (controller.signal.aborted) return;
            console.error('[Dashboard] Failed to load dashboard data via backend gateway', error);
            addToast("Failed to load dashboard data.", 'error');
            void backendGateway.recordInteraction({
                type: 'dashboard_snapshot_failed',
                userId: user.id,
                companyId: user.companyId,
                context: {
                    message: error instanceof Error ? error.message : String(error),
                },
            });
        } finally {
            if (controller.signal.aborted) return;
            setLoading(false);
        }
    }, [user, addToast]);

    useEffect(() => {
        fetchData();
        return () => {
            abortControllerRef.current?.abort();
        };
    }, [fetchData]);

    const userMap = useMemo(() => new Map(team.map(u => [u.id, u])), [team]);

    const portfolioSummary: ProjectPortfolioSummary = useMemo(
        () => computeProjectPortfolioSummary(projects),
        [projects],
    );

    const activeProjects = useMemo(() => projects.filter(p => p.status === 'ACTIVE'), [projects]);

    const atRiskProjects = useMemo(() => {
        return activeProjects
            .map(project => {
                const budget = project.budget ?? 0;
                const actual = project.actualCost ?? project.spent ?? 0;
                const progress = project.progress ?? 0;
                const overdue = portfolioSummary.upcomingDeadlines.some(deadline => deadline.id === project.id && deadline.isOverdue);
                const score =
                    (budget > 0 ? actual / budget : 1) +
                    (project.status === 'ON_HOLD' ? 1 : 0) +
                    (progress < 50 ? 0.5 : 0) +
                    (overdue ? 0.75 : 0);
                return { project, budget, actual, progress, overdue, score };
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, 4);
    }, [activeProjects, portfolioSummary.upcomingDeadlines]);

    const openIncidents = useMemo(
        () => incidents.filter(incident => incident.status !== IncidentStatus.RESOLVED),
        [incidents],
    );

    const fallbackHighSeverityIncidents = useMemo(
        () => openIncidents.filter(incident => incident.severity === 'HIGH' || incident.severity === 'CRITICAL'),
        [openIncidents],
    );

    const fallbackApprovedExpenseTotal = useMemo(
        () => expenses
            .filter(expense => expense.status === ExpenseStatus.APPROVED || expense.status === ExpenseStatus.PAID)
            .reduce((sum, expense) => sum + (expense.amount ?? 0), 0),
        [expenses],
    );
    const highSeverityIncidents = useMemo(
        () => openIncidents.filter(incident => incident.severity === 'HIGH' || incident.severity === 'CRITICAL'),
        [openIncidents],
    );

    const approvedExpenses = useMemo(
        () => expenses.filter(expense => expense.status === ExpenseStatus.APPROVED || expense.status === ExpenseStatus.PAID),
        [expenses],
    );

    const approvedExpenseTotal = useMemo(
        () => approvedExpenses.reduce((sum, expense) => sum + (expense.amount ?? 0), 0),
        [approvedExpenses],
    );

    const weeklyTaskData = useMemo(() => {
        const now = new Date();
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
        const weekInterval = { start: weekStart, end: now };
        const daysOfWeek = eachDayOfInterval(weekInterval);

        return daysOfWeek.map(day => ({
            label: format(day, 'E'),
            value: tasks.filter(t => t.completedAt && isWithinInterval(new Date(t.completedAt), { start: day, end: new Date(day).setHours(23, 59, 59, 999) })).length
        }));
    }, [tasks]);

    const availabilityBreakdown = useMemo(() => {
        return team.reduce<Record<string, number>>((acc, member) => {
            const key = member.availability ?? 'Unknown';
            acc[key] = (acc[key] ?? 0) + 1;
            return acc;
        }, {});
    }, [team]);

    const upcomingDeadlines = portfolioSummary.upcomingDeadlines;

    const tasksInProgress = useMemo(
        () => tasks.filter(task => task.status !== TodoStatus.DONE).length,
        [tasks],
    );

    const insight = operationalInsights;
    const operationalCurrency = insight?.financial.currency ?? 'GBP';
    const complianceRate = clampPercentage(insight?.workforce.complianceRate ?? 0);
    const openIncidentsCount = insight?.safety.openIncidents ?? openIncidents.length;
    const highSeverityCount = insight?.safety.highSeverity ?? fallbackHighSeverityIncidents.length;
    const pendingApprovals = insight?.workforce.pendingApprovals ?? 0;
    const approvedExpenseThisMonth = insight?.financial.approvedExpensesThisMonth ?? fallbackApprovedExpenseTotal;
    const burnPerProject = insight?.financial.burnRatePerActiveProject ?? 0;
    const overtimeHours = insight?.workforce.overtimeHours ?? 0;
    const averageHours = insight?.workforce.averageHours ?? 0;
    const tasksDueSoon = insight?.schedule.tasksDueSoon ?? 0;
    const overdueTasks = insight?.schedule.overdueTasks ?? 0;
    const scheduleInProgress = insight?.schedule.tasksInProgress ?? tasksInProgress;
    const operationalAlerts = insight?.alerts ?? [];

    const handleGenerateProjectBrief = useCallback(async () => {
        if (!aiSelectedProjectId) {
            setAiError('Select a project to analyse.');
            return;
        }

        const project = projects.find(p => p.id === aiSelectedProjectId);
        if (!project) {
            setAiError('The selected project is no longer available.');
            return;
        }

        setIsGeneratingAiSummary(true);
        setAiError(null);

        try {
            const projectTasks = tasks.filter(task => task.projectId === project.id);


            const projectIncidents = openIncidents.filter(incident => incident.projectId === project.id);
            const projectExpenses = approvedExpenses.filter(expense => expense.projectId === project.id);


            const summary = await generateProjectHealthSummary({
                project,
                tasks: projectTasks,
                incidents: projectIncidents,
                expenses: projectExpenses,
            });

            setAiSummary(summary);
            setAiSummaryProjectId(project.id);
        } catch (error) {
            console.error('Failed to generate project health summary', error);
            setAiError('Unable to generate the AI brief right now.');
            addToast('Gemini could not analyse that project at the moment.', 'error');
        } finally {
            setIsGeneratingAiSummary(false);
        }
    }, [aiSelectedProjectId, projects, tasks, openIncidents, expenses, addToast]);

    if (loading) return <Card>Loading project manager dashboard…</Card>;

    return (
        <div className="space-y-6">
            {snapshotMetadata?.usedFallback && (
                <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900">
                    <p className="text-sm font-semibold">Showing cached workspace data</p>
                    <p className="text-xs">
                        {snapshotMetadata.fallbackReason ??
                            'We could not reach the live backend, so this view reflects the latest cached information.'}
                    </p>
                </div>
            )}
            <ViewHeader
                title={`Welcome back, ${user.firstName}!`}
                description="Your live delivery and commercial snapshot."
                actions={<Button variant="secondary" onClick={() => setActiveView('projects')}>Open projects workspace</Button>}
                meta={[
                    {
                        label: 'Active projects',
                        value: kpiData.activeProjectsCount.toString(),
                        helper: `${portfolioSummary.completedProjects} completed`,
                        indicator: kpiData.activeProjectsCount > 0 ? 'positive' : 'neutral',
                    },
                    {
                        label: 'At-risk',
                        value: `${kpiData.atRisk}`,
                        helper: atRiskProjects.length > 0 ? 'See priority list below' : 'All projects steady',
                        indicator: kpiData.atRisk > 0 ? 'warning' : 'positive',
                    },
                    {
                        label: 'Open incidents',
                        value: `${kpiData.openIncidents}`,
                        helper: highSeverityIncidents.length > 0 ? `${highSeverityIncidents.length} high severity` : 'No critical alerts',
                        indicator: kpiData.openIncidents > 0 ? 'warning' : 'positive',
                    },
                    {
                        label: 'Budget utilisation',
                        value: `${kpiData.budgetUtilization}%`,
                        helper: 'Across active projects',
                        indicator: Number(kpiData.budgetUtilization) > 90 ? 'warning' : 'positive',
                    },
                ]}
            />

            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <KpiCard
                    title="Active projects"
                    value={kpiData.activeProjectsCount.toString()}
                    subtext={`${portfolioSummary.totalProjects} in portfolio`}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>}
                />
                <KpiCard
                    title="Team size"
                    value={kpiData.teamSize.toString()}
                    subtext="Across your organisation"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                />
                <KpiCard
                    title="Budget utilisation"
                    value={`${kpiData.budgetUtilization}%`}
                    subtext="Across active projects"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                />
                <KpiCard
                    title="Approved spend"
                    value={formatCurrency(approvedExpenseTotal)}
                    subtext="Approved or paid expenses"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M9 6h6m-3-2v2m0 12v2m7-5a9 9 0 11-14 0" /></svg>}
                />
            </section>

            <section className="grid gap-6 lg:grid-cols-3">
                <Card className="space-y-4 p-6">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">Focus projects</h2>
                            <p className="text-sm text-muted-foreground">Highest-risk delivery or budget positions.</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setActiveView('projects')}>
                            View all
                        </Button>
                    </div>
                    {atRiskProjects.length === 0 ? (
                        <p className="text-sm text-muted-foreground">All monitored projects are currently stable.</p>
                    ) : (
                        <div className="space-y-4">
                            {atRiskProjects.map(({ project, budget, actual, progress, overdue }) => (
                                <div key={project.id} className="space-y-2 rounded-lg border border-border/60 p-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-foreground">{project.name}</p>
                                            <p className="text-xs text-muted-foreground">{project.location?.city ?? project.location?.address}</p>
                                        </div>
                                        <Tag
                                            label={project.status.replace(/_/g, ' ')}
                                            color={project.status === 'ACTIVE' ? 'green' : project.status === 'ON_HOLD' ? 'yellow' : 'red'}
                                        />
                                    </div>
                                    <div className="grid grid-cols-3 gap-3 text-xs text-muted-foreground">
                                        <div>
                                            <p>Budget</p>
                                            <p className="font-semibold text-foreground">{formatCurrency(budget)}</p>
                                        </div>
                                        <div>
                                            <p>Actual</p>
                                            <p className="font-semibold text-foreground">{formatCurrency(actual)}</p>
                                        </div>
                                        <div>
                                            <p>Progress</p>
                                            <p className="font-semibold text-foreground">{clampPercentage(progress)}%</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>{overdue ? '⚠️ Overdue milestone' : 'On schedule'}</span>
                                        <Button size="sm" variant="secondary" onClick={() => onSelectProject(project)}>
                                            Open
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
                            <Card className="space-y-4 p-6">
                                <h2 className="text-lg font-semibold text-foreground">Upcoming deadlines</h2>
                                {upcomingDeadlines.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No due dates in the next few weeks.</p>
                                ) : (
                                    <ul className="space-y-3 text-sm">
                                        {upcomingDeadlines.map(deadline => (
                                            <li key={deadline.id} className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-semibold text-foreground">{deadline.name}</p>
                                                    <p className={`text-xs ${deadline.isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                                                        {new Date(deadline.endDate).toLocaleDateString()} • {deadline.isOverdue ? 'Overdue' : `Due in ${Math.max(0, deadline.daysRemaining)} day(s)`}
                                                    </p>
                                                </div>
                                                <Tag
                                                    label={deadline.status.replace(/_/g, ' ')}
                                                    color={deadline.isOverdue ? 'red' : 'blue'}
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </Card>
                            <Card className="space-y-4 p-6">
                                <h2 className="text-lg font-semibold text-foreground">Operational snapshot</h2>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Open incidents</span>
                                        <span className="font-semibold text-foreground">
                                            {openIncidentsCount}
                                            {highSeverityCount > 0 && (
                                                <span className="text-xs font-medium text-destructive"> • {highSeverityCount} high</span>
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Tasks due next 7 days</span>
                                        <span className={`font-semibold ${tasksDueSoon > 5 ? 'text-amber-600' : 'text-foreground'}`}>{tasksDueSoon}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Overdue tasks</span>
                                        <span className={`font-semibold ${overdueTasks > 0 ? 'text-destructive' : 'text-foreground'}`}>{overdueTasks}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Active tasks</span>
                                        <span className="font-semibold text-foreground">{scheduleInProgress}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Pending approvals</span>
                                        <span className="font-semibold text-foreground">{pendingApprovals}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Avg hours / shift</span>
                                        <span className="font-semibold text-foreground">{averageHours.toFixed(1)}h</span>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Burn per active project {formatCurrency(burnPerProject, operationalCurrency)}
                                    {overtimeHours > 0 ? ` • ${overtimeHours.toFixed(1)} overtime hrs` : ''}
                                </p>
                                {operationalAlerts.length > 0 && (
                                    <div className="space-y-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-3">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Alerts</p>
                                        <ul className="space-y-1 text-sm text-muted-foreground">
                                            {operationalAlerts.slice(0, 3).map(alert => (
                                                <li key={alert.id} className="flex items-start gap-2">
                                                    <span
                                                        className={`mt-1 h-2 w-2 rounded-full ${alert.severity === 'critical'
                                                                ? 'bg-destructive'
                                                                : alert.severity === 'warning'
                                                                    ? 'bg-amber-500'
                                                                    : 'bg-primary'
                                                            }`}
                                                    />
                                                    <span>{alert.message}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </Card>
                            <Card className="space-y-4 p-6">
                                <h2 className="text-lg font-semibold text-foreground">Operational snapshot</h2>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Open incidents</span>
                                        <span className="font-semibold text-foreground">{openIncidents.length}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">High severity</span>
                                        <span className="font-semibold text-destructive">{highSeverityIncidents.length}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Active tasks</span>
                                        <span className="font-semibold text-foreground">{tasksInProgress}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Approved spend</span>
                                        <span className="font-semibold text-foreground">{formatCurrency(approvedExpenseTotal)}</span>
                                    </div>
                                </div>

                            </Card>
                        </section>

                        <section className="grid gap-6 xl:grid-cols-[2fr,1fr]">
                            <Card className="space-y-4 p-6">
                                <div className="flex flex-col gap-2">
                                    <h2 className="text-lg font-semibold text-foreground">AI project briefing</h2>
                                    <p className="text-sm text-muted-foreground">Generate a Gemini-powered health summary for any live job.</p>
                                </div>
                                {activeProjects.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">Add an active project to run an AI briefing.</p>
                                ) : (
                                    <div className="flex flex-wrap items-center gap-3">
                                        <select
                                            value={aiSelectedProjectId ?? ''}
                                            onChange={event => setAiSelectedProjectId(event.target.value || null)}
                                            className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                            disabled={isGeneratingAiSummary}
                                        >
                                            {activeProjects.map(project => (
                                                <option key={project.id} value={project.id}>
                                                    {project.name}
                                                </option>
                                            ))}
                                        </select>
                                        <Button onClick={handleGenerateProjectBrief} isLoading={isGeneratingAiSummary} disabled={isGeneratingAiSummary || !aiSelectedProjectId}>
                                            {aiSummary && aiSummaryProjectId === aiSelectedProjectId ? 'Refresh brief' : 'Generate brief'}
                                        </Button>
                                    </div>
                                )}
                                {aiError && <p className="text-sm text-destructive">{aiError}</p>}
                                {aiSummary && aiSummaryProjectId === aiSelectedProjectId ? (
                                    <div className="space-y-3">
                                        <div className="space-y-1">{renderMarkdownSummary(aiSummary.summary)}</div>
                                        <p className="text-xs text-muted-foreground">
                                            {aiSummary.isFallback ? 'Offline insight' : 'AI insight'}
                                            {aiSummary.model ? ` • ${aiSummary.model}` : ''}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Run the assistant to receive targeted recommendations.</p>
                                )}
                            </Card>
                            <Card className="space-y-4 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-semibold text-foreground">Team availability</h2>
                                        <p className="text-sm text-muted-foreground">Crew status across the organisation.</p>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setActiveView('users')}>Manage team</Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {complianceRate}% timesheets approved • {pendingApprovals} pending
                                </p>

                                <div className="space-y-3 text-sm">
                                    {Object.entries(availabilityBreakdown).map(([status, count]) => (
                                        <div key={status} className="flex items-center justify-between">
                                            <span className="text-muted-foreground">{status}</span>
                                            <span className="font-semibold text-foreground">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </section>

                        <section className="grid gap-6 lg:grid-cols-2">
                            <Card className="p-6">
                                <h2 className="text-lg font-semibold text-foreground">Tasks completed this week</h2>
                                <BarChart data={weeklyTaskData} barColor="bg-primary" />
                            </Card>
                            <Card className="space-y-4 p-6">
                                <h2 className="text-lg font-semibold text-foreground">People on deck</h2>
                                <div className="space-y-3 max-h-56 overflow-y-auto pr-2">
                                    {team.slice(0, 10).map(member => (
                                        <div key={member.id} className="flex items-center gap-3 rounded-md p-2 hover:bg-accent">
                                            <Avatar name={`${member.firstName} ${member.lastName}`} imageUrl={member.avatar} className="h-9 w-9" />
                                            <div className="flex-grow">
                                                <p className="text-sm font-semibold text-foreground">{`${member.firstName} ${member.lastName}`}</p>
                                                <p className="text-xs text-muted-foreground">{member.role}</p>
                                            </div>
                                            <Tag label={member.availability ?? 'Unknown'} color={availabilityTagColor[member.availability || AvailabilityStatus.AVAILABLE]} />
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </section>

                        <section className="grid gap-6 lg:grid-cols-2">
                            <Card className="space-y-4 p-6">
                                <h2 className="text-lg font-semibold text-foreground">Equipment summary</h2>
                                <div className="space-y-2 max-h-52 overflow-y-auto pr-2">
                                    {equipment.map(item => (
                                        <div key={item.id} className="flex items-center justify-between rounded-md p-2 hover:bg-accent">
                                            <span className="text-sm font-medium text-foreground">{item.name}</span>
                                            <EquipmentStatusBadge status={item.status} />
                                        </div>
                                    ))}
                                </div>
                            </Card>
                            <Card className="space-y-4 p-6">
                                <h2 className="text-lg font-semibold text-foreground">Task activity log</h2>
                                <div className="space-y-3 max-h-52 overflow-y-auto pr-2">
                                    {activityLog.slice(0, 12).map(log => {
                                        const actor = userMap.get(log.actorId);
                                        const actorName = actor ? `${actor.firstName} ${actor.lastName}` : '?';
                                        return (
                                            <div key={log.id} className="flex items-start gap-3">
                                                <Avatar name={actorName} className="h-8 w-8 text-xs" />
                                                <div>
                                                    <p className="text-sm text-foreground">
                                                        <span className="font-semibold">{actorName}</span> {log.action.replace(/_/g, ' ')}
                                                        {log.target?.name ? `: "${log.target.name}"` : ''}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>
                        </section>
                    </div>
                    );
};