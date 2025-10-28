import React, { useState, useEffect } from 'react';
import { User, ProjectTemplate, Project, Location } from '../types';
import { api } from '../services/apiService';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface CreateProjectModalProps {
  user: User;
  onClose: () => void;
  onProjectCreated: (newProject: Project) => void;
  addToast: (message: string, type: 'success' | 'error') => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ user, onClose, onProjectCreated, addToast }) => {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [budget, setBudget] = useState<number | ''>('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [projectType, setProjectType] = useState('Commercial Construction');
    const [workClassification, setWorkClassification] = useState('Contracting');
    const [templateId, setTemplateId] = useState<string>('none');
    
    const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user.companyId) {
            api.getProjectTemplates(user.companyId).then(setTemplates);
        }
    }, [user.companyId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !address || budget === '' || !startDate) {
            addToast("Please fill in all required fields.", "error");
            return;
        }
        
        setIsSaving(true);
        try {
            const projectData: Omit<Project, 'id' | 'companyId' | 'actualCost' | 'status'> = {
                name,
                location: { address, lat: 0, lng: 0 }, // Lat/Lng would be geocoded in a real app
                budget: Number(budget),
                startDate: new Date(startDate),
                imageUrl: `https://picsum.photos/seed/${name}/800/400`, // Placeholder image
                projectType,
                workClassification,
            };

            const selectedTemplateId = templateId === 'none' ? null : parseInt(templateId, 10);
            
            const newProject = await api.createProject(projectData, selectedTemplateId, user.id);
            
            addToast(`Project "${newProject.name}" created successfully!`, 'success');
            onProjectCreated(newProject);
            onClose();
        } catch (error) {
            addToast("Failed to create project.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <Card>
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">Create New Project</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="template-select" className="block text-sm font-medium text-gray-700 mb-1">Start with a template (optional)</label>
                            <select
                                id="template-select"
                                value={templateId}
                                onChange={e => setTemplateId(e.target.value)}
                                className="w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm"
                            >
                                <option value="none">Start with a blank project</option>
                                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>

                        <div className="pt-4 border-t">
                            <label htmlFor="project-name" className="block text-sm font-medium text-gray-700">Project Name</label>
                            <input
                                type="text"
                                id="project-name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="mt-1 w-full p-2 border rounded-md"
                                required
                            />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="project-address" className="block text-sm font-medium text-gray-700">Address</label>
                                <input
                                    type="text"
                                    id="project-address"
                                    value={address}
                                    onChange={e => setAddress(e.target.value)}
                                    className="mt-1 w-full p-2 border rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="project-budget" className="block text-sm font-medium text-gray-700">Budget</label>
                                <input
                                    type="number"
                                    id="project-budget"
                                    value={budget}
                                    onChange={e => setBudget(e.target.value === '' ? '' : Number(e.target.value))}
                                    className="mt-1 w-full p-2 border rounded-md"
                                    required
                                />
                            </div>
                             <div>
                                <label htmlFor="project-start-date" className="block text-sm font-medium text-gray-700">Start Date</label>
                                <input
                                    type="date"
                                    id="project-start-date"
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                    className="mt-1 w-full p-2 border rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                 <label htmlFor="project-type" className="block text-sm font-medium text-gray-700">Project Type</label>
                                 <input
                                    type="text"
                                    id="project-type"
                                    value={projectType}
                                    onChange={e => setProjectType(e.target.value)}
                                    className="mt-1 w-full p-2 border rounded-md"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                            <Button type="submit" isLoading={isSaving}>Create Project</Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};
