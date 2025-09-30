import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { User, View, Project, Todo, Equipment, AuditLog, ResourceAssignment, Role, Permission, TodoStatus, AvailabilityStatus, DashboardSummary, ProjectRiskLevel, TodoPriority } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
// FIX: Corrected API import from mockApi
import { api } from '../services/mockApi';
import { hasPermission } from '../services/auth';
import { Avatar } from './ui/Avatar';
import { EquipmentStatusBadge } from './ui/StatusBadge';
import { Tag } from './ui/Tag';
import { ViewHeader } from './layout/ViewHeader';
// FIX: Removed `startOfWeek` from import and added a local implementation to resolve the module export error.
import { format, eachDayOfInterval, isWithinInterval, formatDistanceToNow } from 'date-fns';

interface DashboardProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
  activeView: View;
  setActiveView: (view: View) => void;
  onSelectProject: (project: Project) => void;
}

const KpiCard: React.FC<{ title: string; value: string; subtext?: string; icon: React.ReactNode }> = ({ title, value, subtext, icon }) => (
    <Card className="flex items-center gap-4 animate-card-enter">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-muted text-muted-foreground">
            {icon}
        </div>
        <div>
            <h3 className="font-semibold text-muted-foreground">{title}</h3>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {subtext && <p className="text-sm text-muted-foreground">{subtext}</p>}
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

const availabilityTagColor: Record<AvailabilityStatus, 'green' | 'blue' | 'gray'> = {
    [AvailabilityStatus.AVAILABLE]: 'green',
    [AvailabilityStatus.ON_PROJECT]: 'blue',
    [AvailabilityStatus.ON_LEAVE]: 'gray',
};

const riskStyles: Record<ProjectRiskLevel, { label: string; className: string }> = {
    AT_RISK: { label: 'At risk', className: 'bg-destructive/10 text-destructive border border-destructive/30' },
    WATCH: { label: 'Watch', className: 'bg-amber-100 text-amber-700 border border-amber-200' },
    HEALTHY: { label: 'Healthy', className: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
};

const priorityStyles: Record<TodoPriority, string> = {
    [TodoPriority.URGENT]: 'bg-red-100 text-red-800 border border-red-300',
    [TodoPriority.HIGH]: 'bg-rose-100 text-rose-700 border border-rose-200',
    [TodoPriority.MEDIUM]: 'bg-amber-100 text-amber-700 border border-amber-200',
    [TodoPriority.LOW]: 'bg-slate-100 text-slate-600 border border-slate-200',
};

const RiskPill: React.FC<{ level: ProjectRiskLevel }> = ({ level }) => {
    const style = riskStyles[level];
    return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${style.className}`}>
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
        {style.label}
    </span>;
};

const ProgressDonut: React.FC<{ value: number; label?: string }> = ({ value, label }) => {
    const clamped = Math.max(0, Math.min(100, value));
    const circumference = 2 * Math.PI * 15.9155;
    const offset = circumference - (clamped / 100) * circumference;

    return (
        <div className="relative flex flex-col items-center justify-center gap-1">
            <svg viewBox="0 0 36 36" className="h-20 w-20">
                <circle
                    className="text-muted stroke-current"
                    strokeWidth="3.5"
                    fill="none"
                    strokeLinecap="round"
                    cx="18"
                    cy="18"
                    r="15.9155"
                    opacity={0.3}
                />
                <circle
                    className="text-primary stroke-current"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={offset}
                    fill="none"
                    cx="18"
                    cy="18"
                    r="15.9155"
                    transform="rotate(-90 18 18)"
                />
            </svg>
            <span className="absolute text-lg font-semibold text-foreground">{clamped}%</span>
            {label && <span className="text-xs font-medium text-muted-foreground">{label}</span>}
        </div>
    );
};

type QuickAction = {
    label: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
};

const QuickActionCard: React.FC<{ action: QuickAction }> = ({ action }) => (
    <button
        type="button"
        onClick={action.onClick}
        className="group flex items-center gap-3 rounded-lg border border-border bg-card/70 p-3 text-left transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
    >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
            {action.icon}
        </span>
        <span>
            <span className="block text-sm font-semibold text-foreground">{action.label}</span>
            <span className="block text-xs text-muted-foreground">{action.description}</span>
        </span>
    </button>
);

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
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchData = useCallback(async () => {
        const controller = new AbortController();
        abortControllerRef.current?.abort();
        abortControllerRef.current = controller;

        setLoading(true);
        try {
            if (!user.companyId) return;
            const [projData, usersData, equipData, assignmentsData, logsData, summaryData] = await Promise.all([
                api.getProjectsByManager(user.id, { signal: controller.signal }),
                api.getUsersByCompany(user.companyId, { signal: controller.signal }),
                api.getEquipmentByCompany(user.companyId, { signal: controller.signal }),
                api.getResourceAssignments(user.companyId, { signal: controller.signal }),
                api.getAuditLogsByCompany(user.companyId, { signal: controller.signal }),
                api.getCompanyDashboardSummary(user.companyId, { signal: controller.signal }),
            ]);

            if (controller.signal.aborted) return;
            setProjects(projData);
            if (controller.signal.aborted) return;
            setTeam(usersData.filter(u => u.role !== Role.PRINCIPAL_ADMIN));

            // FIX: Use uppercase 'ACTIVE' for ProjectStatus enum comparison.
            const activeProjectIds = new Set(projData.filter(p => p.status === 'ACTIVE').map(p => p.id));
            const tasksData = await api.getTodosByProjectIds(Array.from(activeProjectIds), { signal: controller.signal });
            if (controller.signal.aborted) return;
            setTasks(tasksData);

            const assignedEquipmentIds = new Set(assignmentsData
                .filter(a => a.resourceType === 'equipment' && activeProjectIds.has(a.projectId))
                .map(a => a.resourceId));
            if (controller.signal.aborted) return;
            setEquipment(equipData.filter(e => assignedEquipmentIds.has(e.id)));

            if (controller.signal.aborted) return;
            setActivityLog(logsData.filter(l => l.action.includes('task')).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));

            if (controller.signal.aborted) return;
            setSummary(summaryData);

        } catch (error) {
            if (controller.signal.aborted) return;
            addToast("Failed to load dashboard data.", 'error');
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

    const kpiData = useMemo(() => {
        // FIX: Use uppercase 'ACTIVE' for ProjectStatus enum comparison.
        const activeProjects = projects.filter(p => p.status === 'ACTIVE');
        const budgetData = activeProjects.reduce((acc, p) => {
            acc.total += p.budget;
            acc.spent += p.actualCost;
            return acc;
        }, { total: 0, spent: 0 });
        const budgetUtilization = budgetData.total > 0 ? (budgetData.spent / budgetData.total) * 100 : 0;
        return {
            activeProjectsCount: activeProjects.length,
            teamSize: team.length,
            budgetUtilization: budgetUtilization.toFixed(0),
        }
    }, [projects, team]);

    const weeklyTaskData = useMemo(() => {
        const now = new Date();
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
        const weekInterval = { start: weekStart, end: now };
        const daysOfWeek = eachDayOfInterval(weekInterval);

        return daysOfWeek.map(day => ({
            label: format(day, 'E'),
            value: tasks.filter(t => t.completedAt && isWithinInterval(new Date(t.completedAt), {start: day, end: new Date(day).setHours(23,59,59,999)})).length
        }));
    }, [tasks]);

    const quickActions = useMemo<QuickAction[]>(() => [
        {
            label: 'Triage overdue tasks',
            description: 'Jump to the task board and clear blockers before stand-up.',
            icon: <span className="text-lg">✅</span>,
            onClick: () => setActiveView('all-tasks'),
        },
        {
            label: 'Review safety log',
            description: 'Open the safety centre to close out open incidents.',
            icon: <span className="text-lg">🛡️</span>,
            onClick: () => setActiveView('safety'),
        },
        {
            label: 'Sync with finance',
            description: 'Track billing exposure from the invoices dashboard.',
            icon: <span className="text-lg">📊</span>,
            onClick: () => setActiveView('invoices'),
        },
        {
            label: 'Check project sequencing',
            description: 'Move to the projects grid to reshuffle milestone dates.',
            icon: <span className="text-lg">🗺️</span>,
            onClick: () => setActiveView('projects'),
        },
    ], [setActiveView]);

    const handleProjectNavigate = useCallback((projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;
        onSelectProject(project);
        setActiveView('project-detail');
    }, [projects, onSelectProject, setActiveView]);


    if (loading) return <Card>Loading Project Manager Dashboard...</Card>;

    return (
        <div className="space-y-6">
            <ViewHeader
                title={`Welcome back, ${user.firstName}!`}
                description="Here's how your teams and projects are performing right now."
                meta={[
                    {
                        label: 'Active projects',
                        value: kpiData.activeProjectsCount.toString(),
                        indicator: kpiData.activeProjectsCount > 0 ? 'positive' : 'neutral',
                    },
                    {
                        label: 'Team members',
                        value: kpiData.teamSize.toString(),
                        helper: 'Across your organisation',
                    },
                    {
                        label: 'Budget utilisation',
                        value: `${kpiData.budgetUtilization}%`,
                        helper: 'Across active projects',
                        indicator: Number(kpiData.budgetUtilization) > 90 ? 'warning' : 'positive',
                    },
                ]}
            />

            {summary && (
                <>
                    <div className="grid gap-6 xl:grid-cols-12">
                        <Card className="xl:col-span-5">
                            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Operational pulse</p>
                                        <h3 className="text-2xl font-bold text-foreground">This week at a glance</h3>
                                        <p className="text-sm text-muted-foreground">Stay ahead of risk by resolving blockers before they impact your programme.</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="rounded-lg border border-border/60 bg-background/60 p-4">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Overdue tasks</p>
                                            <p className="mt-1 text-2xl font-bold text-foreground">{summary.stats.overdueTasks}</p>
                                            <p className="text-xs text-muted-foreground">Require immediate action</p>
                                        </div>
                                        <div className="rounded-lg border border-border/60 bg-background/60 p-4">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Open incidents</p>
                                            <p className="mt-1 text-2xl font-bold text-foreground">{summary.stats.openIncidents}</p>
                                            <p className="text-xs text-muted-foreground">Waiting on mitigation</p>
                                        </div>
                                        <div className="rounded-lg border border-border/60 bg-background/60 p-4">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Outstanding invoices</p>
                                            <p className="mt-1 text-2xl font-bold text-foreground">{summary.stats.outstandingInvoices}</p>
                                            <p className="text-xs text-muted-foreground">Past due and unpaid</p>
                                        </div>
                                        <div className="rounded-lg border border-border/60 bg-background/60 p-4">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Teams deployed</p>
                                            <p className="mt-1 text-2xl font-bold text-foreground">{summary.workforce.onProject}</p>
                                            <p className="text-xs text-muted-foreground">Crews on active jobs</p>
                                        </div>
                                    </div>
                                </div>
                                <ProgressDonut value={summary.stats.averageTaskProgress} label="Avg. task progress" />
                            </div>
                        </Card>
                        <Card className="xl:col-span-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground">Upcoming deadlines</h3>
                                    <p className="text-sm text-muted-foreground">Next seven days across your portfolio.</p>
                                </div>
                                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{summary.upcomingDeadlines.length}</span>
                            </div>
                            <div className="mt-4 space-y-3">
                                {summary.upcomingDeadlines.length > 0 ? summary.upcomingDeadlines.map(deadline => {
                                    const due = new Date(deadline.dueDate);
                                    const priority = deadline.priority ?? TodoPriority.MEDIUM;
                                    return (
                                        <div key={deadline.id} className="flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-background/40 p-3">
                                            <div className="space-y-1">
                                                <p className="text-sm font-semibold text-foreground">{deadline.title}</p>
                                                <p className="text-xs text-muted-foreground">{deadline.projectName}</p>
                                                <p className="text-xs text-muted-foreground">Due {format(due, 'EEE d MMM')} ({formatDistanceToNow(due, { addSuffix: true })})</p>
                                                {deadline.assigneeName && <p className="text-xs text-muted-foreground">Owner: {deadline.assigneeName}</p>}
                                            </div>
                                            <span className={`rounded-full px-2 py-1 text-[0.65rem] font-semibold ${priorityStyles[priority]}`}>
                                                {priority}
                                            </span>
                                        </div>
                                    );
                                }) : <p className="text-sm text-muted-foreground">No deadlines in the next 7 days.</p>}
                            </div>
                        </Card>
                        <Card className="xl:col-span-3">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground">Workforce mix</h3>
                                    <p className="text-sm text-muted-foreground">Live resource posture by availability.</p>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                        <span>Utilisation</span>
                                        <span className="font-semibold text-foreground">{summary.workforce.utilisationRate}%</span>
                                    </div>
                                    <div className="mt-2 h-2 rounded-full bg-muted">
                                        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${summary.workforce.utilisationRate}%` }} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                                    <div className="rounded-lg border border-border/60 bg-background/50 p-3">
                                        <p className="text-2xl font-bold text-foreground">{summary.workforce.onProject}</p>
                                        <p className="text-muted-foreground">On project</p>
                                    </div>
                                    <div className="rounded-lg border border-border/60 bg-background/50 p-3">
                                        <p className="text-2xl font-bold text-foreground">{summary.workforce.available}</p>
                                        <p className="text-muted-foreground">Available</p>
                                    </div>
                                    <div className="rounded-lg border border-border/60 bg-background/50 p-3">
                                        <p className="text-2xl font-bold text-foreground">{summary.workforce.onLeave}</p>
                                        <p className="text-muted-foreground">On leave</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                    <div className="grid gap-6 xl:grid-cols-12">
                        <Card className="xl:col-span-7">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground">Risk watchlist</h3>
                                    <p className="text-sm text-muted-foreground">Spot issues before they derail key milestones.</p>
                                </div>
                                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">{summary.atRiskProjects.length} tracked</span>
                            </div>
                            <div className="mt-4 space-y-3">
                                {summary.atRiskProjects.length > 0 ? summary.atRiskProjects.map(project => (
                                    <div key={project.id} className="flex flex-col gap-4 rounded-lg border border-border/60 bg-background/50 p-4 md:flex-row md:items-center md:justify-between">
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="text-sm font-semibold text-foreground">{project.name}</p>
                                                <RiskPill level={project.riskLevel} />
                                            </div>
                                            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                                <span>Progress <span className="font-semibold text-foreground">{project.progress}%</span></span>
                                                <span>Budget <span className="font-semibold text-foreground">{project.budgetUtilisation}% used</span></span>
                                                <span>{project.overdueTasks} overdue task(s)</span>
                                                <span>{project.openIncidents} open incident(s)</span>
                                            </div>
                                        </div>
                                        <Button variant="ghost" onClick={() => handleProjectNavigate(project.id)} className="self-start md:self-center">
                                            Open project →
                                        </Button>
                                    </div>
                                )) : (
                                    <p className="text-sm text-muted-foreground">All monitored projects are currently tracking well.</p>
                                )}
                            </div>
                        </Card>
                        <Card className="xl:col-span-5">
                            <h3 className="text-lg font-semibold text-foreground">Command actions</h3>
                            <p className="text-sm text-muted-foreground">Navigate directly to the workstreams that need attention.</p>
                            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {quickActions.map(action => (
                                    <QuickActionCard key={action.label} action={action} />
                                ))}
                            </div>
                        </Card>
                    </div>
                </>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <KpiCard title="Active Projects" value={kpiData.activeProjectsCount.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>} />
                <KpiCard title="Team Size" value={kpiData.teamSize.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
                <KpiCard title="Budget Utilization" value={`${kpiData.budgetUtilization}%`} subtext="Across active projects" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <Card className="lg:col-span-3">
                     <h2 className="font-semibold text-lg mb-2 text-foreground">Tasks Completed This Week</h2>
                     <BarChart data={weeklyTaskData} barColor="bg-primary" />
                </Card>
                 <Card className="lg:col-span-2">
                    <h2 className="font-semibold text-lg mb-2 text-foreground">Team Assignments</h2>
                    <div className="space-y-3 max-h-56 overflow-y-auto pr-2">
                       {team.map(member => (
                           <div key={member.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-accent">
                               <Avatar name={`${member.firstName} ${member.lastName}`} imageUrl={member.avatar} className="w-9 h-9" />
                               <div className="flex-grow">
                                   <p className="font-semibold text-sm text-foreground">{`${member.firstName} ${member.lastName}`}</p>
                                   <p className="text-xs text-muted-foreground">{member.role}</p>
                               </div>
                               <Tag label={member.availability || 'Unknown'} color={availabilityTagColor[member.availability || AvailabilityStatus.AVAILABLE]}/>
                           </div>
                       ))}
                    </div>
                </Card>
            </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <h2 className="font-semibold text-lg mb-2 text-foreground">Equipment Summary</h2>
                     <div className="space-y-2 max-h-52 overflow-y-auto pr-2">
                        {equipment.map(item => (
                            <div key={item.id} className="flex justify-between items-center p-2 rounded-md hover:bg-accent">
                                <span className="font-medium text-sm">{item.name}</span>
                                <EquipmentStatusBadge status={item.status} />
                            </div>
                        ))}
                    </div>
                </Card>
                <Card>
                    <h2 className="font-semibold text-lg mb-2 text-foreground">Task Activity Log</h2>
                    <div className="space-y-3 max-h-52 overflow-y-auto pr-2">
                        {activityLog.slice(0, 10).map(log => {
                             const actor = userMap.get(log.actorId);
                             const actorName = actor ? `${actor.firstName} ${actor.lastName}` : '?';
                             return (
                             <div key={log.id} className="flex items-start gap-3">
                                <Avatar name={actorName} className="w-8 h-8 text-xs mt-1" />
                                <div>
                                    <p className="text-sm">
                                        <span className="font-semibold">{actorName}</span>
                                        {' '}{log.action.replace(/_/g, ' ')}: "{log.target?.name}"
                                    </p>
                                    <p className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</p>
                                </div>
                            </div>
                        )})}
                    </div>
                </Card>
            </div>
        </div>
    );
};