import React, { useState, useEffect, useCallback } from 'react';
import { User, ProjectTemplate } from '../types';
import { api } from '../services/mockApi';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface TemplatesViewProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({ user, addToast }) => {
    const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) return <Card><p>Loading templates...</p></Card>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-slate-800">Project Templates</h2>
                <Button>Create Template</Button>
            </div>
            <div className="space-y-4">
                {templates.map(template => (
                    <Card key={template.id}>
                        <h3 className="font-bold text-lg">{template.name}</h3>
                        <p className="text-sm text-slate-600">{template.description}</p>
                        <div className="mt-4 flex gap-4 text-sm">
                            <span>{template.templateTasks.length} tasks</span>
                            <span>{template.documentCategories.length} document categories</span>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};
