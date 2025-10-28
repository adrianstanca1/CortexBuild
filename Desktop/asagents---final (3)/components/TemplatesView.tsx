import React, { useState, useEffect, useCallback } from 'react';
import { User, ProjectTemplate, Permission, Todo } from '../types';
import { api } from '../services/apiService';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { TemplateEditorModal } from './TemplateEditorModal';
import { hasPermission } from '../services/auth';

interface TemplatesViewProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({ user, addToast }) => {
    const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingTemplate, setEditingTemplate] = useState<ProjectTemplate | null | undefined>(null); // undefined for new, null for closed
    const [isSaving, setIsSaving] = useState(false);

    const canManage = hasPermission(user, Permission.MANAGE_PROJECT_TEMPLATES);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            if (!user.companyId) return;
            const data = await api.getProjectTemplates(user.companyId);
            setTemplates(data);
        } catch (error) {
            addToast("Failed to load templates.", "error");
        } finally {
            setLoading(false);
        }
    }, [user.companyId, addToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSave = async (templateData: { name: string; description: string; templateTasks: Partial<Todo>[] }) => {
        setIsSaving(true);
        try {
            if (editingTemplate) { // Editing existing
                await api.updateProjectTemplate(editingTemplate.id, templateData, user.id);
                addToast("Template updated successfully!", "success");
            } else { // Creating new (editingTemplate is undefined)
                const dataToCreate = { ...templateData, companyId: user.companyId!, documentCategories: [] };
                await api.createProjectTemplate(dataToCreate, user.id);
                addToast("Template created successfully!", "success");
            }
            setEditingTemplate(null);
            fetchData();
        } catch (e) {
            addToast("Failed to save template.", "error");
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleDelete = async (templateId: number) => {
        if (window.confirm("Are you sure you want to delete this template? This cannot be undone.")) {
            try {
                await api.deleteProjectTemplate(templateId, user.id);
                addToast("Template deleted.", "success");
                fetchData();
            } catch (e) {
                addToast("Failed to delete template.", "error");
            }
        }
    };

    if (loading) return <Card><p>Loading templates...</p></Card>;

    return (
        <div className="space-y-6">
            {editingTemplate !== null && (
                <TemplateEditorModal 
                    template={editingTemplate} 
                    onClose={() => setEditingTemplate(null)} 
                    onSave={handleSave} 
                    isSaving={isSaving}
                />
            )}

            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-slate-800">Project Templates</h2>
                {canManage && <Button onClick={() => setEditingTemplate(undefined)}>Create Template</Button>}
            </div>
            <div className="space-y-4">
                {templates.map(template => (
                    <Card key={template.id}>
                        <div className="flex justify-between items-start">
                             <div>
                                <h3 className="font-bold text-lg">{template.name}</h3>
                                <p className="text-sm text-slate-600">{template.description}</p>
                                <div className="mt-4 flex gap-4 text-sm">
                                    <span className="font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">{template.templateTasks.length} tasks</span>
                                </div>
                             </div>
                             {canManage && (
                                <div className="flex gap-2 flex-shrink-0">
                                    <Button variant="secondary" size="sm" onClick={() => setEditingTemplate(template)}>Edit</Button>
                                    <Button variant="danger" size="sm" onClick={() => handleDelete(template.id)}>Delete</Button>
                                </div>
                             )}
                        </div>
                    </Card>
                ))}
                {templates.length === 0 && !loading && (
                    <Card className="text-center py-12">
                        <h3 className="text-lg font-medium">No Templates Found</h3>
                        <p className="text-slate-500 mt-1">Get started by creating your first project template.</p>
                    </Card>
                )}
            </div>
        </div>
    );
};
