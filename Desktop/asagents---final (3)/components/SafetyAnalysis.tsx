

import React, { useState, useEffect, useCallback } from 'react';
import { User, Project, SafetyIncident, Permission } from '../types';
import { api } from '../services/apiService';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { hasPermission } from '../services/auth';

interface SafetyAnalysisProps {
    user: User;
    addToast: (message: string, type: 'success' | 'error') => void;
}

export const SafetyAnalysis: React.FC<SafetyAnalysisProps> = ({ user, addToast }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [incidents, setIncidents] = useState<SafetyIncident[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [report, setReport] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!user.companyId) return;
        try {
            const [projData, incidentData] = await Promise.all([
                api.getProjectsByCompany(user.companyId),
                api.getSafetyIncidentsByCompany(user.companyId)
            ]);
            setProjects(projData);
            setIncidents(incidentData);
            if (projData.length > 0) {
                setSelectedProjectId(projData[0].id.toString());
            }
        } catch (error) {
            addToast("Failed to load data for analysis.", 'error');
        }
    }, [user.companyId, addToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleGenerate = async () => {
        if (!selectedProjectId) {
            addToast("Please select a project.", 'error');
            return;
        }
        const projectIncidents = incidents.filter(i => i.projectId.toString() === selectedProjectId);
        if (projectIncidents.length === 0) {
            addToast("No incidents recorded for this project to analyze.", 'error');
            return;
        }

        setIsLoading(true);
        setReport(null);
        try {
            const result = await api.generateSafetyAnalysis(projectIncidents, parseInt(selectedProjectId), user.id);
            setReport(result.report);
            addToast("Safety analysis generated!", "success");
        } catch (error) {
            addToast("Failed to generate analysis.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">AI Safety Analysis</h3>
            <p className="text-sm text-slate-500 mb-4">Let AI analyze incident reports to identify trends and recommend preventative actions.</p>
            
            <div className="flex gap-4 items-end p-4 border rounded-lg bg-slate-50">
                <div className="flex-grow">
                    <label htmlFor="project-select" className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                    <select
                        id="project-select"
                        value={selectedProjectId}
                        onChange={e => setSelectedProjectId(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                    >
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <Button onClick={handleGenerate} isLoading={isLoading}>Analyze Incidents</Button>
            </div>
            
            <div className="mt-6">
                {isLoading && (
                     <div className="text-center py-10">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
                        <p className="mt-2 text-slate-600">AI is analyzing safety data...</p>
                    </div>
                )}
                {report && (
                    <div>
                        <h4 className="font-semibold text-lg mb-2">Generated Analysis:</h4>
                        <div className="p-4 border rounded-md bg-white whitespace-pre-wrap font-mono text-sm">
                            {report}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};