import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Project, Todo, Permission, View, Timesheet, TimesheetStatus, SafetyIncident, IncidentStatus, AuditLog } from '../types';
import { api } from '../services/apiService';
import { hasPermission } from '../services/auth';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

const KpiCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string; }> = ({ title, value, icon, color }) => (
    <Card className="flex items-start justify-between p-4">
        <div>
            <h3 className="font-semibold text-muted-foreground">{title}</h3>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
        <div className="text-muted-foreground">
            {icon}
        </div>
    </Card>
);
const ActivityIcon: React.FC<{ action: string }> = ({ action }) => {
    const iconMap: { [key: string]: React.ReactNode } = {
        completed_task: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>,
        approved_timesheet: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-500" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm10 4a1 1 0 10-2 0v.01a1 1 0 102 0V9zm-4 0a1 1 0 10-2 0v.01a1 1 0 102 0V9zm2 2a1 1 0 100 2h.01a1 1 0 100-2H12zm-4 0a1 1 0 100 2h.01a1 1 0 100-2H8z" clipRule="evenodd" /></svg>,
        reported_safety_incident: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>,
        uploaded_document: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor"><path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.414l-1.293 1.293a1 1 0 01-1.414-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L13 9.414V13h-1.5z" /><path d="M9 13h2v5a1 1 0 11-2 0v-5z" /></svg>,
        added_comment_to_task: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.083-3.25A8.84 8.84 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM4.832 14.168L5.92 11.25A6.983 6.983 0 004 10c0-2.651 2.46-5 6-5s6 2.349 6 5-2.46 5-6 5a7.03 7.03 0 00-2.25-.332z" clipRule="evenodd" /></svg>,
        created_project: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" /></svg>,
    };
    const defaultIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>;
    return iconMap[action] || defaultIcon;
};

const formatDistanceToNow = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return `${Math.floor(interval)}y ago`;
    interval = seconds / 2592000;
    if (interval > 1) return `${Math.floor(interval)}mo ago`;
    interval = seconds / 86400;
    if (interval > 1) return `${Math.floor(interval)}d ago`;
    interval = seconds / 3600;
    if (interval > 1) return `${Math.floor(interval)}h ago`;
    interval = seconds / 60;
    if (interval > 1) return `${Math.floor(interval)}m ago`;
    return `${Math.floor(seconds)}s ago`;
};

const ActivityFeedItem: React.FC<{ log: AuditLog; users: Map<number, User> }> = ({ log, users }) => {
    const actorName = users.get(log.actorId)?.name || 'Unknown User';
    const formattedAction = log.action.replace(/_/g, ' ');
    const targetType = log.target?.type.toLowerCase() || '';

    return (
        <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                <ActivityIcon action={log.action} />
            </div>
            <div className="text-sm">
                <p className="text-card-foreground">
                    <span className="font-semibold">{actorName}</span> {formattedAction}
                    {log.target && ` ${targetType} `}
                    {log.target && <span className="font-semibold text-primary/80">"{log.target.name}"</span>}
                </p>
                <p className="text-xs text-muted-foreground">{formatDistanceToNow(log.timestamp)}</p>
            </div>
        </div>
    );
};


export const Dashboard: React.FC<{
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
  activeView: View;
  setActiveView: (view: View) => void;
  onSelectProject: (project: Project) => void;
}> = ({ user, addToast, setActiveView, onSelectProject }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [todos, setTodos] = useState<Todo[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            if (!user.companyId) return;

            const projectsPromise = hasPermission(user, Permission.VIEW_ALL_PROJECTS)
                ? api.getProjectsByCompany(user.companyId)
                : api.getProjectsByUser(user.id);
            
            const fetchedProjects = await projectsPromise;
            setProjects(fetchedProjects);

            if (fetchedProjects.length > 0) {
                const projectIds = fetchedProjects.map(p => p.id);
                const fetchedTodos = await api.getTodosByProjectIds(projectIds);
                setTodos(fetchedTodos);
            }

        } catch (error) {
            addToast("Failed to load dashboard data.", "error");
        } finally {
            setLoading(false);
        }
    }, [user, addToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const activeProjects = useMemo(() => projects.filter(p => p.status === 'Active'), [projects]);
    const overdueTasks = useMemo(() => todos.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done'), [todos]);
    
    if (loading) {
        return <Card><p>Loading dashboard...</p></Card>;
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Welcome back, {user.name.split(' ')[0]}!</h1>
            
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard title="Active Projects" value={activeProjects.length} color="text-primary" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>} />
                <KpiCard title="Overdue Tasks" value={overdueTasks.length} color="text-red-600" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                {/* Other KPI cards would be here */}
            </div>

            {/* The rest of the dashboard UI remains largely the same */}
        </div>
    );
};
