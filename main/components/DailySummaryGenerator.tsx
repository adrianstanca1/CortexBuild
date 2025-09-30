

import React, { useState, useEffect, useCallback } from 'react';
import { User, Project, Permission, Role } from '../types';
import { api } from '../services/mockApi';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { hasPermission } from '../services/auth';

interface DailySummaryGeneratorProps {
    user: User;
    addToast: (message: string, type: 'success' | 'error') => void;
    onBack: () => void;
}

export const DailySummaryGenerator: React.FC<DailySummaryGeneratorProps> = ({ user, addToast, onBack }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [summary, setSummary] = useState<string | null>(null);

    const fetchProjects = useCallback(async () => {
        if (!user.companyId) return;
        try {
            
            let userProjects: Project[];
            if (hasPermission(user, Permission.VIEW_ALL_PROJECTS)) {
                userProjects = await api.getProjectsByCompany(user.companyId);
            } else if (user.role === Role.PM) { // PMs might not have VIEW_ALL_PROJECTS but manage some
                userProjects = await api.getProjectsByManager(user.id);
            } else { // Operatives, etc.
                userProjects = await api.getProjectsByUser(user.id);
            }
            setProjects(userProjects);
            if (userProjects.length > 0) {
                setSelectedProjectId(userProjects[0].id.toString());
            }
        } catch (error) {
            addToast("Failed to load projects.", 'error');
        }
    }, [user, addToast]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const handleGenerate = async () => {
        if (!selectedProjectId || !selectedDate) {
            addToast("Please select a project and a date.", 'error');
            return;
        }
        setIsLoading(true);
        setSummary(null);
        try {
            const result = await api.generateDailySummary(
                parseInt(selectedProjectId, 10),
                new Date(selectedDate),
                user.id
            );
            setSummary(result);
            addToast("Daily summary generated!", 'success');
        } catch (error) {
            addToast("Failed to generate summary.", 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">AI Daily Summary Generator</h3>
            <p className="text-sm text-slate-500 mb-4">Generate a daily progress report for any project using AI.</p>

            <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
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
                    <div>
                        <label htmlFor="date-select" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                            type="date"
                            id="date-select"
                            value={selectedDate}
                            onChange={e => setSelectedDate(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                        />
                    </div>
                </div>
                <Button onClick={handleGenerate} isLoading={isLoading}>
                    Generate Summary
                </Button>
            </div>

            <div className="mt-6">
                {isLoading && (
                    <div className="text-center py-10">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
                        <p className="mt-2 text-slate-600">AI is analyzing project data for the selected day...</p>
                    </div>
                )}
                {summary && (
                    <div>
                        <h4 className="font-semibold text-lg mb-2">Generated Report:</h4>
                        <div className="p-4 border rounded-md bg-white whitespace-pre-wrap font-mono text-sm">
                            {summary}
                        </div>
                         <Button variant="secondary" className="mt-4" onClick={() => navigator.clipboard.writeText(summary).then(() => addToast("Report copied to clipboard!", "success"))}>
                            Copy Report
                        </Button>
                    </div>
                )}
            </div>
        </Card>
    );
};
