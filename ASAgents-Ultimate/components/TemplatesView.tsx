import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, ProjectTemplate } from '../types';
import api from '../services/mockApi';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface TemplatesViewProps {
    user: User;
    addToast: (message: string, type: 'success' | 'error') => void;
}

const CreateTemplateModal: React.FC<{
    user: User;
    onClose: () => void;
    onSuccess: () => void;
    addToast: (m: string, t: 'success' | 'error') => void;
}> = ({ user, onClose, onSuccess, addToast }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [tasks, setTasks] = useState<string[]>(['']);
    const [categories, setCategories] = useState<string[]>(['']);
    const [isSaving, setIsSaving] = useState(false);

    const handleListChange = (index: number, value: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
        const newList = [...list];
        newList[index] = value;
        // Add a new empty item if the user starts typing in the last one
        if (index === newList.length - 1 && value) {
            newList.push('');
        }
        setList(newList.filter(item => item !== undefined));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const templateData = {
                name,
                description,
                templateTasks: tasks.filter(t => t.trim()).map(text => ({ text })),
                documentCategories: categories.filter(c => c.trim()),
            };
            await api.createProjectTemplate(templateData, user.id);
            addToast("Template created successfully.", "success");
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to create template:', error);
            const message = error instanceof Error ? error.message : 'Unknown error occurred';
            addToast(`Failed to create template: ${message}`, "error");
            // Re-throw to maintain error handling contract
            throw error;
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <button
                className="absolute inset-0 bg-transparent border-none cursor-pointer"
                onClick={onClose}
                aria-label="Close modal"
                type="button"
            />
            <Card className="w-full max-w-2xl relative" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4">Create New Template</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Template Name" className="w-full p-2 border rounded" required />
                    <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" className="w-full p-2 border rounded" rows={3} />

                    <div>
                        <h4 className="font-semibold">Template Tasks</h4>
                        {tasks.map((task, index) => (
                            <input key={`task-${index}-${task.slice(0, 10)}`} type="text" value={task} onChange={e => handleListChange(index, e.target.value, tasks, setTasks)} placeholder="+ Add task" className="w-full p-1 border-b mt-1" />
                        ))}
                    </div>
                    <div>
                        <h4 className="font-semibold">Document Categories</h4>
                        {categories.map((cat, index) => (
                            <input key={`category-${index}-${cat.slice(0, 10)}`} type="text" value={cat} onChange={e => handleListChange(index, e.target.value, categories, setCategories)} placeholder="+ Add category" className="w-full p-1 border-b mt-1" />
                        ))}
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit" isLoading={isSaving}>Save Template</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export const TemplatesView: React.FC<TemplatesViewProps> = ({ user, addToast }) => {
    const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchData = useCallback(async () => {
        const controller = new AbortController();
        abortControllerRef.current?.abort();
        abortControllerRef.current = controller;

        setLoading(true);
        try {
            if (!user.companyId) {
                throw new Error('User company ID is required to fetch templates');
            }
            const data = await api.getProjectTemplates(user.companyId, { signal: controller.signal });
            if (controller.signal.aborted) return;
            setTemplates(data);
        } catch (error) {
            if (!controller.signal.aborted) {
                console.error('Failed to load templates:', error);
                const message = error instanceof Error ? error.message : 'Unknown error occurred';
                addToast(`Failed to load templates: ${message}`, "error");
            }
        } finally {
            if (!controller.signal.aborted) {
                setLoading(false);
            }
        }
    }, [user.companyId, addToast]);

    useEffect(() => {
        fetchData();
        return () => {
            abortControllerRef.current?.abort();
        };
    }, [fetchData]);

    if (loading) return <Card><p>Loading templates...</p></Card>;

    return (
        <div className="space-y-6">
            {isModalOpen && (
                <CreateTemplateModal
                    user={user}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={fetchData}
                    addToast={addToast}
                />
            )}
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Project Templates</h2>
                <Button onClick={() => setIsModalOpen(true)}>Create Template</Button>
            </div>
            <div className="space-y-4">
                {templates.map(template => (
                    <Card key={template.id}>
                        <h3 className="font-bold text-lg">{template.name}</h3>
                        <p className="text-sm text-slate-600">{template.description}</p>
                        <div className="mt-4 flex gap-4 text-sm text-slate-500">
                            <span><strong>{template.templateTasks.length}</strong> tasks</span>
                            <span><strong>{template.documentCategories.length}</strong> document categories</span>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};