// FIXME: API signature mismatches - needs review
import React, { useState, useEffect } from 'react';
// FIX: Corrected import paths to be relative.
import { User, ProjectTemplate, Project, Location } from '../../types';
import { api } from '../../services/mockApi';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface ProjectModalProps {
  user: User;
  onClose: () => void;
  onSuccess: (project: Project) => void;
  addToast: (message: string, type: 'success' | 'error') => void;
  projectToEdit?: Project | null;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ user, onClose, onSuccess, addToast, projectToEdit }) => {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [budget, setBudget] = useState<number | ''>('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [projectType, setProjectType] = useState('Commercial Construction');
    const [workClassification, setWorkClassification] = useState('Contracting');
    const [templateId, setTemplateId] = useState<string>('none');
    const [geofenceRadius, setGeofenceRadius] = useState<number | ''>('');
    const [imageUrl, setImageUrl] = useState('');
    
    const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user.companyId) {
            api.getProjectTemplates(user.companyId).then(setTemplates);
        }
    }, [user.companyId]);
    
    useEffect(() => {
        if (projectToEdit) {
            setName(projectToEdit.name);
            setAddress(projectToEdit.location.address);
            setBudget(projectToEdit.budget);
            setStartDate(new Date(projectToEdit.startDate).toISOString().split('T')[0]);
            setProjectType(projectToEdit.projectType);
            setWorkClassification(projectToEdit.workClassification);
            setGeofenceRadius(projectToEdit.geofenceRadius || '');
            setImageUrl(projectToEdit.imageUrl || '');
        }
    }, [projectToEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !address || budget === '' || !startDate) {
            addToast("Please fill in all required fields.", "error");
            return;
        }
        
        setIsSaving(true);
        try {
            if (projectToEdit) {
                 const updatedProject = await api.updateProject(projectToEdit.id, {
                    name,
                    location: { ...projectToEdit.location, address },
                    budget: Number(budget),
                    startDate: new Date(startDate).toISOString(),
                    projectType,
                    workClassification,
                    geofenceRadius: geofenceRadius ? Number(geofenceRadius) : undefined,
                    imageUrl: imageUrl || projectToEdit.imageUrl,
                }, user.id);
                addToast(`Project "${updatedProject.name}" updated successfully!`, 'success');
                onSuccess(updatedProject);
            } else {
                const projectData = {
                    name,
                    location: { address, lat: 0, lng: 0 }, // Lat/Lng would be geocoded in a real app
                    budget: Number(budget),
                    startDate: new Date(startDate),
                    imageUrl: imageUrl || `https://picsum.photos/seed/${name}/800/400`, // Placeholder image
                    projectType,
                    workClassification,
                    geofenceRadius: geofenceRadius ? Number(geofenceRadius) : undefined,
                };

                const selectedTemplateId = templateId === 'none' ? null : parseInt(templateId, 10);
                
                const newProject = await api.createProject(projectData, selectedTemplateId, user.id);
                
                addToast(`Project "${newProject.name}" created successfully!`, 'success');
                onSuccess(newProject);
            }
            onClose();
        } catch (error) {
            addToast(projectToEdit ? "Failed to update project." : "Failed to create project.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <Card className="w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">{projectToEdit ? 'Edit Project' : 'Create New Project'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!projectToEdit && (
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
                    )}

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
                             <label htmlFor="geofence-radius" className="block text-sm font-medium text-gray-700">Geofence Radius (m)</label>
                             <input
                                type="number"
                                id="geofence-radius"
                                value={geofenceRadius}
                                onChange={e => setGeofenceRadius(e.target.value === '' ? '' : Number(e.target.value))}
                                placeholder="e.g., 150"
                                className="mt-1 w-full p-2 border rounded-md"
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
                        <div>
                             <label htmlFor="work-classification" className="block text-sm font-medium text-gray-700">Work Classification</label>
                             <input
                                type="text"
                                id="work-classification"
                                value={workClassification}
                                onChange={e => setWorkClassification(e.target.value)}
                                className="mt-1 w-full p-2 border rounded-md"
                            />
                        </div>
                        <div className="md:col-span-2">
                             <label htmlFor="image-url" className="block text-sm font-medium text-gray-700">Image URL (Optional)</label>
                            <div className="flex items-center gap-2 mt-1">
                                 <input
                                    type="url"
                                    id="image-url"
                                    value={imageUrl}
                                    onChange={e => setImageUrl(e.target.value)}
                                    placeholder="https://example.com/project-image.jpg"
                                    className="flex-grow p-2 border rounded-md"
                                />
                                {imageUrl && (
                                    <img 
                                        src={imageUrl} 
                                        alt="Project image preview" 
                                        className="w-20 h-12 object-cover rounded border bg-slate-100"
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                        // FIX: Added 'e' parameter to onLoad handler.
                                        onLoad={(e) => { (e.target as HTMLImageElement).style.display = 'block'; }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit" isLoading={isSaving}>{projectToEdit ? 'Save Changes' : 'Create Project'}</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};