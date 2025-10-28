import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { User, View, Project, Todo, Equipment, AuditLog, ResourceAssignment, Role, Permission, TodoStatus, AvailabilityStatus } from '../types';
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
import { format, eachDayOfInterval, isWithinInterval } from 'date-fns';

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
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchData = useCallback(async () => {
        const controller = new AbortController();
        abortControllerRef.current?.abort();
        abortControllerRef.current = controller;

        setLoading(true);
        try {
            if (!user.companyId) return;
            const [projData, usersData, equipData, assignmentsData, logsData] = await Promise.all([
                api.getProjectsByManager(user.id, { signal: controller.signal }),
                api.getUsersByCompany(user.companyId, { signal: controller.signal }),
                api.getEquipmentByCompany(user.companyId, { signal: controller.signal }),
                api.getResourceAssignments(user.companyId, { signal: controller.signal }),
                api.getAuditLogsByCompany(user.companyId, { signal: controller.signal })
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