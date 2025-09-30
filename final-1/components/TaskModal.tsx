import React, { useState, useEffect, useMemo } from 'react';
// FIX: Replaced Todo with Task and imported correct enums
import { User, Project, Task as Todo, TodoPriority, TodoStatus } from '../types';
import { api } from '../services/mockApi';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

export const TaskModal: React.FC<{
    user: User;
    projects: Project[];
    users: User[];
    onClose: () => void;
    onSuccess: () => void;
    addToast: (message: string, type: 'success' | 'error') => void;
    taskToEdit: Todo | null;
    allProjectTasks: Todo[];
}> = ({ user, projects, users, onClose, onSuccess, addToast, taskToEdit, allProjectTasks }) => {
    // FIX: Cast taskToEdit to any to access properties that may not be on the base Task type
    const editableTask = taskToEdit as any;

    const [text, setText] = useState(editableTask?.text || editableTask?.title || '');
    const [projectId, setProjectId] = useState<string>(editableTask?.projectId.toString() || projects[0]?.id.toString() || '');
    const [assigneeId, setAssigneeId] = useState<string>(editableTask?.assigneeId?.toString() || editableTask?.assignedTo?.toString() || '');
    const [dueDate, setDueDate] = useState(editableTask?.dueDate ? new Date(editableTask.dueDate).toISOString().split('T')[0] : '');
    const [priority, setPriority] = useState<TodoPriority>(editableTask?.priority || TodoPriority.MEDIUM);
    const [dependsOn, setDependsOn] = useState<(string|number)[]>(editableTask?.dependsOn || []);
    const [isSaving, setIsSaving] = useState(false);

    const availableTasksForDep = useMemo(() => {
        return allProjectTasks.filter(t => t.projectId.toString() === projectId && t.id !== taskToEdit?.id);
    }, [allProjectTasks, projectId, taskToEdit]);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim() || !projectId) {
            addToast("Task description and project are required.", "error");
            return;
        }
        setIsSaving(true);
        try {
            const taskData: Partial<Todo> = {
                title: text,
                text,
                projectId: projectId,
                // FIX: Handle unassigned and parse to int
                assignedTo: assigneeId ? assigneeId : undefined,
                assigneeId: assigneeId ? assigneeId : undefined,
                dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
                priority,
                dependsOn,
            };

            if (taskToEdit) {
                await api.updateTodo(taskToEdit.id, taskData, user.id);
                addToast("Task updated successfully!", "success");
            } else {
                await api.createTodo(taskData, user.id);
                addToast("Task created successfully!", "success");
            }
            onSuccess();
            onClose();
        } catch (error) {
            addToast(taskToEdit ? "Failed to update task." : "Failed to create task.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDependsOnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setDependsOn(selectedOptions);
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <Card className="w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4">{taskToEdit ? 'Edit Task' : 'Create Task'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Task description..." rows={3} className="w-full p-2 border rounded" required />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Project</label>
                            <select value={projectId} onChange={e => setProjectId(e.target.value)} className="w-full p-2 border rounded bg-white" required>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium">Assignee</label>
                            <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)} className="w-full p-2 border rounded bg-white">
                                <option value="">Unassigned</option>
                                {users.map(u => <option key={u.id} value={u.id}>{`${u.firstName} ${u.lastName}`}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium">Due Date</label>
                            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full p-2 border rounded" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium">Priority</label>
                            <select value={priority} onChange={e => setPriority(e.target.value as TodoPriority)} className="w-full p-2 border rounded bg-white">
                                {Object.values(TodoPriority).map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Depends On (blockers)</label>
                        <select
                            multiple
                            value={dependsOn.map(String)}
                            onChange={handleDependsOnChange}
                            className="w-full p-2 border rounded bg-white h-32"
                        >
                            {availableTasksForDep.map(task => (
                                <option key={task.id} value={task.id.toString()}>{(task as any).text || task.title}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit" isLoading={isSaving}>{taskToEdit ? 'Save Changes' : 'Create Task'}</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};
