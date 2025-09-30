import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
// FIX: Corrected import paths to be relative.
import { User, Timesheet, Project, Role, Permission, TimesheetStatus } from '../types';
// FIX: Corrected API import
import { api } from '../services/mockApi';
import { Card } from './ui/Card';
import { TimesheetStatusBadge } from './ui/StatusBadge';
import { Button } from './ui/Button';
import { hasPermission } from '../services/auth';

interface TimesheetsViewProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
}

const LogTimeModal: React.FC<{
    user: User;
    projects: Project[];
    timesheetToEdit: Timesheet | null;
    onClose: () => void;
    onSuccess: () => void;
    addToast: (m: string, t: 'success' | 'error') => void;
}> = ({ user, projects, timesheetToEdit, onClose, onSuccess, addToast }) => {
    const [projectId, setProjectId] = useState(timesheetToEdit?.projectId.toString() || projects[0]?.id.toString() || '');
    const [date, setDate] = useState(timesheetToEdit ? new Date(timesheetToEdit.clockIn).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState(timesheetToEdit ? new Date(timesheetToEdit.clockIn).toTimeString().substring(0,5) : '09:00');
    const [endTime, setEndTime] = useState(timesheetToEdit?.clockOut ? new Date(timesheetToEdit.clockOut).toTimeString().substring(0,5) : '17:00');
    const [notes, setNotes] = useState(timesheetToEdit?.notes || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const clockIn = new Date(`${date}T${startTime}`);
        const clockOut = new Date(`${date}T${endTime}`);

        if (clockIn >= clockOut) {
            addToast("Clock-in time must be before clock-out time.", "error");
            return;
        }
        
        setIsSaving(true);
        try {
            if (timesheetToEdit) {
                 await api.updateTimesheetEntry(timesheetToEdit.id, {
                    // FIX: Removed parseInt as projectId is a string
                    projectId: projectId,
                    clockIn,
                    clockOut,
                    notes,
                }, user.id);
                addToast("Timesheet updated successfully.", "success");
            } else {
                 await api.submitTimesheet({
                    userId: user.id,
                    // FIX: Removed parseInt as projectId is a string
                    projectId: projectId,
                    clockIn,
                    clockOut,
                    notes,
                }, user.id);
                addToast("Time logged successfully.", "success");
            }
            onSuccess();
            onClose();
        } catch(err) {
            addToast(err instanceof Error ? err.message : "Failed to save timesheet.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <Card className="w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">{timesheetToEdit ? 'Edit' : 'Log'} Time</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Project</label>
                        <select value={projectId} onChange={e => setProjectId(e.target.value)} className="mt-1 w-full p-2 border rounded-md bg-white">
                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Date</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 w-full p-2 border rounded-md" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-sm font-medium text-gray-700">Start Time</label>
                            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="mt-1 w-full p-2 border rounded-md" />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700">End Time</label>
                            <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="mt-1 w-full p-2 border rounded-md" />
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="mt-1 w-full p-2 border rounded-md" />
                    </div>
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit" isLoading={isSaving}>Submit</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export const TimesheetsView: React.FC<TimesheetsViewProps> = ({ user, addToast }) => {
    const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'review' | 'my-timesheets'>('my-timesheets');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTimesheet, setEditingTimesheet] = useState<Timesheet | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const canManage = hasPermission(user, Permission.MANAGE_TIMESHEETS);

    useEffect(() => {
        // Set default tab based on role
        setActiveTab(canManage ? 'review' : 'my-timesheets');
    }, [canManage]);

    const fetchData = useCallback(async () => {
        const controller = new AbortController();
        abortControllerRef.current?.abort();
        abortControllerRef.current = controller;

        setLoading(true);
        try {
            if (!user.companyId) return;

            const [tsData, projData, usersData] = await Promise.all([
                api.getTimesheetsByCompany(user.companyId, user.id, { signal: controller.signal }),
                api.getProjectsByCompany(user.companyId, { signal: controller.signal }),
                api.getUsersByCompany(user.companyId, { signal: controller.signal }),
            ]);

            if (controller.signal.aborted) return;
            setTimesheets(tsData.sort((a,b) => new Date(b.clockIn).getTime() - new Date(a.clockIn).getTime()));
            if (controller.signal.aborted) return;
            setProjects(projData);
            if (controller.signal.aborted) return;
            setUsers(usersData);

        } catch (error) {
            if (controller.signal.aborted) return;
            addToast("Failed to load timesheet data.", "error");
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
    
    // FIX: Correctly map user ID to full name.
    const userMap = useMemo(() => new Map(users.map(u => [u.id, `${u.firstName} ${u.lastName}`])), [users]);
    const projectMap = useMemo(() => new Map(projects.map(p => [p.id, p.name])), [projects]);

    // FIX: Changed id type from number to string to match Timesheet type.
    const handleUpdateStatus = async (id: string, status: TimesheetStatus) => {
        try {
            let reason: string | undefined;
            if (status === TimesheetStatus.REJECTED) {
                reason = prompt("Please provide a reason for rejection:") || "No reason provided.";
                if (reason === null) return; // User cancelled prompt
            }
            await api.updateTimesheetStatus(id, status, user.id, reason);
            addToast(`Timesheet ${status.toLowerCase()}.`, 'success');
            fetchData();
        } catch (error) {
            addToast("Failed to update timesheet.", "error");
        }
    };
    
    const { reviewQueue, myTimesheets } = useMemo(() => {
        const review: Timesheet[] = [];
        const my: Timesheet[] = [];
        timesheets.forEach(ts => {
            if (ts.userId === user.id) my.push(ts);
            if (ts.status === TimesheetStatus.PENDING) review.push(ts);
        });
        return { reviewQueue: review, myTimesheets: my };
    }, [timesheets, user.id]);
    
    const openLogTimeModal = (ts: Timesheet | null = null) => {
        setEditingTimesheet(ts);
        setIsModalOpen(true);
    };

    const renderTable = (data: Timesheet[]) => (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-slate-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Employee</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Project</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Hours</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Notes</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map(ts => {
                        const hours = ts.clockOut ? ((new Date(ts.clockOut).getTime() - new Date(ts.clockIn).getTime()) / 3600000).toFixed(2) : 'N/A';
                        return (
                            <tr key={ts.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{userMap.get(ts.userId)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{projectMap.get(ts.projectId)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(ts.clockIn).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{hours}</td>
                                <td className="px-6 py-4 whitespace-nowrap"><TimesheetStatusBadge status={ts.status} /></td>
                                <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate" title={ts.notes}>{ts.notes || ts.rejectionReason}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                    {activeTab === 'review' && ts.status === TimesheetStatus.PENDING && (
                                        <>
                                            <Button size="sm" variant="success" onClick={() => handleUpdateStatus(ts.id, TimesheetStatus.APPROVED)}>Approve</Button>
                                            <Button size="sm" variant="danger" onClick={() => handleUpdateStatus(ts.id, TimesheetStatus.REJECTED)}>Reject</Button>
                                        </>
                                    )}
                                    {activeTab === 'my-timesheets' && (ts.status === TimesheetStatus.PENDING || ts.status === TimesheetStatus.REJECTED) && (
                                        <Button size="sm" variant="secondary" onClick={() => openLogTimeModal(ts)}>Edit</Button>
                                    )}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
            {data.length === 0 && <p className="text-center py-10 text-slate-500">No timesheets to display.</p>}
        </div>
    );

    if (loading) return <Card><p>Loading timesheets...</p></Card>

    return (
        <div className="space-y-6">
             {isModalOpen && (
                <LogTimeModal
                    user={user}
                    projects={projects}
                    timesheetToEdit={editingTimesheet}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={fetchData}
                    addToast={addToast}
                />
            )}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h2 className="text-3xl font-bold text-slate-800">Timesheets</h2>
                <Button onClick={() => openLogTimeModal()}>Log Time</Button>
            </div>
            
            <Card>
                 <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-6">
                       {canManage && (
                            <button onClick={() => setActiveTab('review')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'review' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                                Review Queue ({reviewQueue.length})
                            </button>
                       )}
                        <button onClick={() => setActiveTab('my-timesheets')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'my-timesheets' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                            My Timesheets
                        </button>
                    </nav>
                </div>
                <div className="mt-4">
                    {activeTab === 'review' ? renderTable(reviewQueue) : renderTable(myTimesheets)}
                </div>
            </Card>
        </div>
    );
};
