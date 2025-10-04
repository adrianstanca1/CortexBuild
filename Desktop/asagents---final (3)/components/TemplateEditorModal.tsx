import React, { useState, useEffect } from 'react';
import { ProjectTemplate, TodoPriority, Todo } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface TemplateEditorModalProps {
  template?: ProjectTemplate | null;
  onClose: () => void;
  onSave: (templateData: { name: string; description: string; templateTasks: Partial<Todo>[] }) => Promise<void>;
  isSaving: boolean;
}

export const TemplateEditorModal: React.FC<TemplateEditorModalProps> = ({ template, onClose, onSave, isSaving }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [tasks, setTasks] = useState<Partial<Todo>[]>([]);

    useEffect(() => {
        if (template) {
            setName(template.name);
            setDescription(template.description);
            setTasks(template.templateTasks || []);
        }
    }, [template]);
    
    const handleTaskChange = (index: number, field: 'text' | 'priority', value: string) => {
        const newTasks = [...tasks];
        const taskToUpdate = { ...newTasks[index] };
        
        if (field === 'text') {
            taskToUpdate.text = value;
        } else if (field === 'priority') {
            taskToUpdate.priority = value as TodoPriority;
        }

        newTasks[index] = taskToUpdate;
        setTasks(newTasks);
    };

    const handleAddTask = () => {
        setTasks([...tasks, { text: '', priority: TodoPriority.MEDIUM }]);
    };
    
    const handleRemoveTask = (index: number) => {
        setTasks(tasks.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        const templateData = {
            name,
            description,
            templateTasks: tasks,
        };
        await onSave(templateData);
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-slate-800 mb-4 flex-shrink-0">{template ? 'Edit' : 'Create'} Project Template</h2>
                <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Template Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 w-full" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Template Tasks</h3>
                        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                            {tasks.map((task, index) => (
                                <div key={index} className="flex items-center gap-2 p-2 border rounded-md bg-slate-50">
                                    <input type="text" value={task.text} onChange={e => handleTaskChange(index, 'text', e.target.value)} placeholder="Task description" className="flex-grow" />
                                    <select value={task.priority} onChange={e => handleTaskChange(index, 'priority', e.target.value)} className="bg-white">
                                        {Object.values(TodoPriority).map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                    <Button variant="danger" size="sm" onClick={() => handleRemoveTask(index)}>Remove</Button>
                                </div>
                            ))}
                        </div>
                        <Button variant="secondary" size="sm" onClick={handleAddTask} className="mt-3">Add Task</Button>
                    </div>
                </div>
                <div className="flex-shrink-0 flex justify-end gap-2 pt-4 border-t mt-4">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>Cancel</Button>
                    <Button onClick={handleSave} isLoading={isSaving}>Save Template</Button>
                </div>
            </Card>
        </div>
    );
};