import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { User, Timesheet, Project, Role, Permission, TimesheetStatus } from '../types';
import { api } from '../services/apiService';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { TimesheetStatusBadge } from './ui/StatusBadge';
import { hasPermission } from '../services/auth';

interface TimesheetsViewProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
}

export const TimesheetsView: React.FC<TimesheetsViewProps> = ({ user, addToast }) => {
    const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<TimesheetStatus | 'all'>('all');

    const canManage = hasPermission(user, Permission.MANAGE_TIMESHEETS);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            if (!user.companyId) return;

            let timesheetsPromise: Promise<Timesheet[]>;
            if (user.role === Role.ADMIN) {
                timesheetsPromise = api.getTimesheetsByCompany(user.companyId, user.id);
            } else { // PM
                timesheetsPromise = api.getTimesheetsForManager(user.id);
            }

            const [tsData, projData, usersData] = await Promise.all([
                timesheetsPromise,
                api.getProjectsByCompany(user.companyId),
                api.getUsersByCompany(user.companyId),
            ]);
            
            setTimesheets(tsData);
            setProjects(projData);
            setUsers(usersData);

        } catch (error) {
            addToast("Failed to load timesheet data.", "error");
        } finally {
            setLoading(false);
        }
    }, [user, addToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const userMap = useMemo(() => new Map(users.map(u => [u.id, u.name])), [users]);
    const projectMap = useMemo(() => new Map(projects.map(p => [p.id, p.name])), [projects]);

    const handleUpdateStatus = async (id: number, status: TimesheetStatus) => {
        try {
            let reason: string | undefined;
            if (status === TimesheetStatus.REJECTED) {
                reason = prompt("Please provide a reason for rejection:") || "No reason provided.";
            }
            await api.updateTimesheetStatus(id, status, user.id, reason);
            addToast(`Timesheet ${status.toLowerCase()}.`, 'success');
            fetchData();
        } catch (error) {
            addToast("Failed to update timesheet.", "error");
        }
    };
    
    const filteredTimesheets = useMemo(() => {
        if (filter === 'all') return timesheets;
        return timesheets.filter(ts => ts.status === filter);
    }, [timesheets, filter]);

    if (loading) return <Card><p>Loading timesheets...</p></Card>

    return (
        <Card>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Timesheets</h2>
            <div className="mb-4">
                <select value={filter} onChange={e => setFilter(e.target.value as (TimesheetStatus | 'all'))} className="p-2 border rounded-md">
                    <option value="all">All Statuses</option>
                    {Object.values(TimesheetStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Employee</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Project</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Hours</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                            {canManage && <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredTimesheets.map(ts => {
                            const hours = ts.clockOut ? ((new Date(ts.clockOut).getTime() - new Date(ts.clockIn).getTime()) / 3600000).toFixed(2) : 'Ongoing';
                            return (
                                <tr key={ts.id}>
                                    <td className="px-6 py-4">{userMap.get(ts.userId)}</td>
                                    <td className="px-6 py-4">{projectMap.get(ts.projectId)}</td>
                                    <td className="px-6 py-4">{new Date(ts.clockIn).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">{hours}</td>
                                    <td className="px-6 py-4"><TimesheetStatusBadge status={ts.status} /></td>
                                    {canManage && ts.status === TimesheetStatus.PENDING && (
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <Button size="sm" variant="success" onClick={() => handleUpdateStatus(ts.id, TimesheetStatus.APPROVED)}>Approve</Button>
                                            <Button size="sm" variant="danger" onClick={() => handleUpdateStatus(ts.id, TimesheetStatus.REJECTED)}>Reject</Button>
                                        </td>
                                    )}
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};
