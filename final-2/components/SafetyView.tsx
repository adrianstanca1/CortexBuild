import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { User, SafetyIncident, Project, Permission, IncidentStatus, IncidentSeverity, View } from '../types';
import { api } from '../services/mockApi';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { IncidentSeverityBadge, IncidentStatusBadge } from './ui/StatusBadge';
import { hasPermission } from '../services/auth';
import { SafetyAnalysis } from './SafetyAnalysis';

// --- Reusable Components for this View ---

const KpiCard: React.FC<{ title: string; value: string; subtext?: string; icon: React.ReactNode }> = ({ title, value, subtext, icon }) => (
    <Card className="flex items-center gap-4 animate-card-enter">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200">
            {icon}
        </div>
        <div>
            <h3 className="font-semibold text-slate-600 dark:text-slate-300">{title}</h3>
            <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
            {subtext && <p className="text-sm text-slate-500">{subtext}</p>}
        </div>
    </Card>
);

// --- Modals for the Safety Hub ---

const ReportIncidentModal: React.FC<{ projects: Project[], user: User, onClose: () => void, addToast: (m:string,t:'success'|'error')=>void, onSuccess: () => void }> = ({ projects, user, onClose, addToast, onSuccess }) => {
    const [description, setDescription] = useState('');
    const [severity, setSeverity] = useState<IncidentSeverity>(IncidentSeverity.LOW);
    const [projectId, setProjectId] = useState<string>(projects[0]?.id.toString() || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await api.createSafetyIncident({ projectId: parseInt(projectId, 10), description, severity }, user.id);
            addToast("Safety incident reported.", "success");
            onSuccess();
            onClose();
        } catch (error) {
            addToast("Failed to report incident.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    return (
         <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <Card className="w-full max-w-lg" onClick={e=>e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4">Report New Safety Incident</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <select value={projectId} onChange={e=>setProjectId(e.target.value)} className="w-full p-2 border rounded bg-white dark:bg-slate-800" required>
                        <option value="">-- Select Project --</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <textarea value={description} onChange={e=>setDescription(e.target.value)} rows={4} className="w-full p-2 border rounded" placeholder="Describe the incident..." required />
                    <select value={severity} onChange={e=>setSeverity(e.target.value as IncidentSeverity)} className="w-full p-2 border rounded bg-white dark:bg-slate-800">
                        {Object.values(IncidentSeverity).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit" variant="danger" isLoading={isSaving}>Submit Report</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
const IncidentDetailModal: React.FC<{ incident: SafetyIncident; project?: Project; user?: User; manager: User; onClose: () => void; onSuccess: () => void; addToast: (m:string,t:'success'|'error')=>void; }> = ({ incident, project, user, manager, onClose, onSuccess, addToast }) => {
    const canManage = hasPermission(manager, Permission.MANAGE_SAFETY_REPORTS);
    const [newStatus, setNewStatus] = useState(incident.status);
    
    const handleStatusUpdate = async () => {
        try {
            await api.updateSafetyIncidentStatus(incident.id, newStatus, manager.id);
            addToast("Incident status updated.", "success");
            onSuccess();
            onClose();
        } catch (error) {
             addToast("Failed to update status.", "error");
        }
    }

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <Card className="w-full max-w-xl" onClick={e=>e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-2">Incident Details</h3>
                <div className="space-y-3 text-sm">
                    <p><strong>Project:</strong> {project?.name || 'N/A'}</p>
                    <p><strong>Reported By:</strong> {user ? `${user.firstName} ${user.lastName}` : 'N/A'}</p>
                    <p><strong>Date:</strong> {new Date(incident.timestamp).toLocaleString()}</p>
                    <div className="flex gap-4">
                        <p><strong>Severity:</strong> <IncidentSeverityBadge severity={incident.severity} /></p>
                        <p><strong>Status:</strong> <IncidentStatusBadge status={incident.status} /></p>
                    </div>
                    <p className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md"><strong>Description:</strong><br/>{incident.description}</p>
                </div>
                {canManage && (
                    <div className="mt-4 pt-4 border-t dark:border-slate-700">
                        <h4 className="font-semibold mb-2">Manager Actions</h4>
                        <div className="flex items-center gap-4">
                            <select value={newStatus} onChange={e => setNewStatus(e.target.value as IncidentStatus)} className="p-2 border rounded bg-white dark:bg-slate-800">
                                {Object.values(IncidentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <Button onClick={handleStatusUpdate} disabled={newStatus === incident.status}>Update Status</Button>
                        </div>
                    </div>
                )}
                 <Button onClick={onClose} variant="secondary" className="mt-4 w-full">Close</Button>
            </Card>
        </div>
    );
const SafetyAnalysisModal: React.FC<{ user: User, addToast: (m:string,t:'success'|'error')=>void, onClose: () => void }> = ({ user, addToast, onClose }) => {
    return (
         <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="w-full max-w-3xl" onClick={e=>e.stopPropagation()}>
                <SafetyAnalysis user={user} addToast={addToast} />
                 <Button onClick={onClose} variant="secondary" className="mt-2 w-full">Close Analysis</Button>
            </div>
        </div>
    );
};

type SortKey = 'timestamp' | 'severity' | 'status';

const SortableHeader: React.FC<{ 
    sortKey: SortKey, 
    children: React.ReactNode,
    sortConfig: { key: SortKey; direction: 'asc' | 'desc' },
    requestSort: (key: SortKey) => void 
}> = ({ sortKey, children, sortConfig, requestSort }) => {
    const isSorted = sortConfig.key === sortKey;
    return (
        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase cursor-pointer" onClick={() => requestSort(sortKey)}>
            <div className="flex items-center">
                {children}
                {isSorted && <span className="ml-2">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>}
            </div>
        </th>
    );
};

// --- Main Safety Hub Component ---

export const SafetyView: React.FC<{ 
  user: User; 
  addToast: (message: string, type: 'success' | 'error') => void;
  setActiveView: (view: View) => void;
}> = ({ user, addToast, setActiveView }) => {
    const [incidents, setIncidents] = useState<SafetyIncident[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Modal states
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
    const [selectedIncident, setSelectedIncident] = useState<SafetyIncident | null>(null);

    // Sorting state
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ key: 'timestamp', direction: 'desc' });

    const canSubmit = hasPermission(user, Permission.SUBMIT_SAFETY_REPORT);
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchData = useCallback(async () => {
        const controller = new AbortController();
        abortControllerRef.current?.abort();
        abortControllerRef.current = controller;

        setLoading(true);
        try {
            if (!user.companyId) return;
            const [incidentsData, projectsData, usersData] = await Promise.all([
                api.getSafetyIncidentsByCompany(user.companyId, { signal: controller.signal }),
                api.getProjectsByCompany(user.companyId, { signal: controller.signal }),
                api.getUsersByCompany(user.companyId, { signal: controller.signal })
            ]);
            if (controller.signal.aborted) return;
            setIncidents(incidentsData);
            if (controller.signal.aborted) return;
            setProjects(projectsData);
            if (controller.signal.aborted) return;
            setUsers(usersData);
        } catch (error) {
            if (controller.signal.aborted) return;
            addToast("Failed to load safety data.", "error");
        } finally {
            if (controller.signal.aborted) return;
            setLoading(false);
        }
    }, [user.companyId, addToast]);

    useEffect(() => {
        fetchData();
        return () => {
            abortControllerRef.current?.abort();
        };
    }, [fetchData]);
    
    const { projectMap, userMap } = useMemo(() => ({
        projectMap: new Map(projects.map(p => [p.id, p])),
        userMap: new Map(users.map(u => [u.id, u]))
    }), [projects, users]);

    const { openIncidents, incidentsThisMonth, daysSinceLastIncident } = useMemo(() => {
        const sorted = [...incidents].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        const open = sorted.filter(i => i.status !== IncidentStatus.RESOLVED).length;
        const thisMonth = sorted.filter(i => {
            const incidentDate = new Date(i.timestamp);
            const today = new Date();
            return incidentDate.getMonth() === today.getMonth() && incidentDate.getFullYear() === today.getFullYear();
        }).length;
        let days = 'N/A';
        if (sorted.length > 0) {
            const lastIncidentDate = new Date(sorted[0].timestamp).getTime();
            days = Math.floor((Date.now() - lastIncidentDate) / (1000 * 3600 * 24)).toString();
        }
        return { openIncidents: open, incidentsThisMonth: thisMonth, daysSinceLastIncident: days };
    }, [incidents]);

    const severityOrder: Record<IncidentSeverity, number> = {
        [IncidentSeverity.CRITICAL]: 4,
        [IncidentSeverity.HIGH]: 3,
        [IncidentSeverity.MEDIUM]: 2,
        [IncidentSeverity.LOW]: 1,
    };

    const sortedIncidents = useMemo(() => {
        let sortableItems = [...incidents];
        sortableItems.sort((a, b) => {
            let aValue: string | number, bValue: string | number;

            if (sortConfig.key === 'severity') {
                aValue = severityOrder[a.severity];
                bValue = severityOrder[b.severity];
            } else if (sortConfig.key === 'timestamp') {
                aValue = new Date(a.timestamp).getTime();
                bValue = new Date(b.timestamp).getTime();
            } else { // status
                aValue = a.status;
                bValue = b.status;
            }

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return sortableItems;
    }, [incidents, sortConfig]);

    const requestSort = (key: SortKey) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    if (loading) return <Card><p>Loading safety data...</p></Card>;

    return (
        <div className="space-y-6">
            {isReportModalOpen && <ReportIncidentModal projects={projects} user={user} onClose={() => setIsReportModalOpen(false)} onSuccess={fetchData} addToast={addToast} />}
            {isAnalysisModalOpen && <SafetyAnalysisModal user={user} addToast={addToast} onClose={() => setIsAnalysisModalOpen(false)} />}
            {selectedIncident && <IncidentDetailModal incident={selectedIncident} project={projectMap.get(selectedIncident.projectId)} user={userMap.get(selectedIncident.reportedById)} manager={user} onClose={() => setSelectedIncident(null)} onSuccess={fetchData} addToast={addToast} />}

            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Safety Hub</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KpiCard title="Open Incidents" value={openIncidents.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                <KpiCard title="Incidents This Month" value={incidentsThisMonth.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
                <KpiCard title="Days Since Last Incident" value={daysSinceLastIncident} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>} />
            </div>

            <Card>
                <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
                <div className="flex flex-wrap gap-4">
                    {canSubmit && <Button variant="danger" onClick={() => setIsReportModalOpen(true)}>Report New Incident</Button>}
                    {hasPermission(user, Permission.MANAGE_SAFETY_REPORTS) && <Button variant="secondary" onClick={() => setIsAnalysisModalOpen(true)}>Run AI Safety Analysis</Button>}
                    <Button variant="secondary" onClick={() => setActiveView('documents')}>View Safety Documents</Button>
                </div>
            </Card>

            <Card>
                <h3 className="font-semibold text-lg mb-4">Incident Log</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Project</th>
                                <SortableHeader sortKey="severity" sortConfig={sortConfig} requestSort={requestSort}>Severity</SortableHeader>
                                <SortableHeader sortKey="status" sortConfig={sortConfig} requestSort={requestSort}>Status</SortableHeader>
                                <SortableHeader sortKey="timestamp" sortConfig={sortConfig} requestSort={requestSort}>Date</SortableHeader>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-700">
                            {sortedIncidents.map(incident => (
                                <tr key={incident.id} onClick={() => setSelectedIncident(incident)} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                                    <td className="px-6 py-4 whitespace-normal break-words text-sm text-slate-700 dark:text-slate-300 max-w-sm">{incident.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{projectMap.get(incident.projectId)?.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm"><IncidentSeverityBadge severity={incident.severity} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm"><IncidentStatusBadge status={incident.status} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(incident.timestamp).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {incidents.length === 0 && <p className="text-center py-10 text-slate-500">No incidents have been reported.</p>}
                </div>
            </Card>
        </div>
    );
};