import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, SafetyIncident, Project, Permission, IncidentStatus, IncidentSeverity } from '../types';
import { api } from '../services/apiService';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { IncidentSeverityBadge, IncidentStatusBadge } from './ui/StatusBadge';
import { hasPermission } from '../services/auth';

interface SafetyViewProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
}

export const SafetyView: React.FC<SafetyViewProps> = ({ user, addToast }) => {
    const [incidents, setIncidents] = useState<SafetyIncident[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    const canSubmit = hasPermission(user, Permission.SUBMIT_SAFETY_REPORT);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            if (!user.companyId) return;
            const [incidentsData, projectsData] = await Promise.all([
                api.getSafetyIncidentsByCompany(user.companyId),
                api.getProjectsByCompany(user.companyId)
            ]);
            setIncidents(incidentsData);
            setProjects(projectsData);
        } catch (error) {
            addToast("Failed to load safety data.", "error");
        } finally {
            setLoading(false);
        }
    }, [user.companyId, addToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const projectMap = useMemo(() => new Map(projects.map(p => [p.id, p.name])), [projects]);

    if (loading) return <Card><p>Loading safety data...</p></Card>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-slate-800">Safety Incidents</h2>
                {canSubmit && <Button variant="danger">Report New Incident</Button>}
            </div>
            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Project</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Severity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {incidents.map(incident => (
                                <tr key={incident.id}>
                                    <td className="px-6 py-4 whitespace-normal break-words text-sm text-slate-700">{incident.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{projectMap.get(incident.projectId)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm"><IncidentSeverityBadge severity={incident.severity} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm"><IncidentStatusBadge status={incident.status} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(incident.timestamp).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
