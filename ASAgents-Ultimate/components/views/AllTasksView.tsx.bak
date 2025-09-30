import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { User, Project, Todo, Role, Permission, TodoStatus, TodoPriority } from '../../types';
import { api } from '../../services/apiService';
import { hasPermission } from '../../services/auth';
import { Card } from '../ui/Card';

import { PriorityDisplay } from '../ui/PriorityDisplay';
import '../ui/subtaskProgress.css';
import { PriorityDisplay } from '../ui/PriorityDisplay';
import '../ui/subtaskProgress.css';
import { Button } from '../ui/Button';
import { KanbanBoard } from './KanbanBoard';
import { TaskModal } from './TaskModal';
import { ViewHeader } from '../layout/ViewHeader';

interface AllTasksViewProps {
    user: User;
    addToast: (message: string, type: 'success' | 'error') => void;
    isOnline: boolean;
}


const TaskDetailModal: React.FC<{
    task: Todo;
    user: User;
    projects: Project[];
    personnel: User[];
    allTasksForProject: Todo[];
    onClose: () => void;
    onUpdateTask: (task: Todo, updates: Partial<Todo>) => void;
    addToast: (message: string, type: 'success' | 'error') => void;
}> = ({ task, user, projects, personnel, allTasksForProject, onClose, onUpdateTask, addToast }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editableTask, setEditableTask] = useState<Todo>(task);
    const [newComment, setNewComment] = useState('');

    useEffect(() => { setEditableTask(task); }, [task]);

    // TaskDetailModal implementation would go here
    return (
        <div>Task Detail Modal Content</div>
    );
};

const AllTasksView: React.FC<AllTasksViewProps> = ({ user, addToast, isOnline }) => {

    const canManage = hasPermission(user, Permission.MANAGE_TASKS);
    const isTaskDone = task.status === TodoStatus.DONE;

    const allOtherTasks = useMemo(() => {
        return allTasksForProject.filter(t => t.id !== task.id);
    }, [allTasksForProject, task.id]);

    const dependencies = useMemo(() => {
        return (task.dependsOn || []).map(depId => allTasksForProject.find(t => t.id === depId)).filter(Boolean) as Todo[];
    }, [task.dependsOn, allTasksForProject]);

    const dependents = useMemo(() => {
        return allTasksForProject.filter(t => t.dependsOn?.includes(task.id));
    }, [allTasksForProject, task.id]);

    const areDependenciesMet = useMemo(() => {
        return dependencies.every(dep => dep.status === TodoStatus.DONE);
    }, [dependencies]);

    const handleFieldChange = (field: keyof Todo, value: any) => setEditableTask(prev => ({ ...prev, [field]: value }));
    const handleSave = () => { onUpdateTask(task, editableTask); setIsEditing(false); };
    const handleCancel = () => { setEditableTask(task); setIsEditing(false); };

    const handleSubtaskChange = (id: number, field: 'text' | 'isCompleted', value: string | boolean) => {
        setEditableTask(prev => ({
            ...prev,
            subTasks: (prev.subTasks || []).map(st => {
                if (st.id === id) {
                    const updatedSubtask = { ...st };
                    if (field === 'text' && typeof value === 'string') {
                        updatedSubtask.text = value;
                    } else if (field === 'isCompleted' && typeof value === 'boolean') {
                        updatedSubtask.isCompleted = value;
                    }
                    return updatedSubtask;
                }
                return st;
            })
        }));
    };

    const handleAddSubtask = () => {
        const newSubtask: SubTask = { id: Date.now(), text: '', isCompleted: false };
        setEditableTask(prev => ({ ...prev, subTasks: [...(prev.subTasks || []), newSubtask] }));
    };

    const handleDeleteSubtask = (id: number) => {
        setEditableTask(prev => ({ ...prev, subTasks: (prev.subTasks || []).filter(st => st.id !== id) }));
    };

    const handlePostComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        const commentToAdd: Comment = {
            id: Date.now(),
            text: newComment.trim(),
            authorId: user.id,
            timestamp: new Date(),
        };

        const updatedComments = [...(editableTask.comments || []), commentToAdd];

        const updatedTaskWithComment = { ...editableTask, comments: updatedComments };
        setEditableTask(updatedTaskWithComment);

        onUpdateTask(task, { comments: updatedComments });

        setNewComment('');
    };

    const handleStatusChange = (newStatus: TodoStatus) => {
        if (!areDependenciesMet && (newStatus === TodoStatus.IN_PROGRESS || newStatus === TodoStatus.DONE)) {
            addToast("Cannot start task until its dependencies are complete.", "error");
            return;
        }
        handleFieldChange('status', newStatus);
    };

    const handleDependencyChange = (selectedIds: string[]) => {
        const numericIds = selectedIds.map(id => isNaN(parseInt(id, 10)) ? id : parseInt(id, 10));
        setEditableTask(prev => ({ ...prev, dependsOn: numericIds }));
    };

    const subtaskProgress = useMemo(() => {
        const subTasks = editableTask.subTasks || [];
        if (subTasks.length === 0) return 0;
        const completed = subTasks.filter(st => st.isCompleted).length;
        return (completed / subTasks.length) * 100;
    }, [editableTask.subTasks]);

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <Card className="w-full max-w-2xl h-auto max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-2">
                    {isEditing ? (
                        <input type="text" title="Task name" placeholder="Task name" value={editableTask.text} onChange={(e) => handleFieldChange('text', e.target.value)} className="text-xl font-bold w-full -ml-1 p-1 rounded-md border" />
                    ) : (
                        <h3 className="text-xl font-bold">{task.text}</h3>
                    )}

                    {!isEditing && canManage && !isTaskDone && (
                        <Button size="sm" variant="secondary" onClick={() => setIsEditing(true)}>Edit</Button>
                    )}
                </div>
                <p className="text-sm text-slate-500 mb-4">in project: {projects.find(p => p.id === task.projectId)?.name}</p>

                <div className="flex-grow overflow-y-auto pr-2 space-y-6">
                    {!areDependenciesMet && (
                        <div className="p-3 bg-yellow-50 text-yellow-800 rounded-md text-sm my-4 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                            <span>This task is blocked. Complete prerequisite tasks to proceed.</span>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><span className="font-semibold">Status:</span> {isEditing ? (
                            <select
                                title="Task status"
                                value={editableTask.status}
                                onChange={(e) => handleStatusChange(e.target.value as TodoStatus)}
                                className="p-1 border rounded-md bg-white ml-2"
                            >
                                <option value={TodoStatus.TODO}>To Do</option>
                                <option value={TodoStatus.IN_PROGRESS}>In Progress</option>
                                <option value={TodoStatus.DONE}>Done</option>
                            </select>
                        ) : task.status}</div>
                        <div><span className="font-semibold">Assignee:</span> {personnel.find(p => p.id === task.assigneeId)?.name || 'Unassigned'}</div>
                        <div><span className="font-semibold">Priority:</span> <PriorityDisplay priority={task.priority} /></div>
                        <div><span className="font-semibold">Due Date:</span> {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'None'}</div>
                        <div><span className="font-semibold">Reporter:</span> {personnel.find(p => p.id === task.creatorId)?.name}</div>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-2">Dependencies</h4>
                        <div className="space-y-2">
                            <div>
                                <p className="text-xs font-semibold text-slate-500">Depends On:</p>
                                {isEditing ? (
                                    <select
                                        title="Task dependencies"
                                        multiple
                                        value={(editableTask.dependsOn || []).map(String)}
                                        onChange={e => handleDependencyChange(Array.from(e.target.selectedOptions, (option) => (option as HTMLOptionElement).value))}
                                        className="w-full p-2 border rounded-md bg-white h-24"
                                        disabled={isTaskDone}
                                    >
                                        {allOtherTasks.map(t => <option key={t.id} value={t.id}>{t.text}</option>)}
                                    </select>
                                ) : (
                                    dependencies.length > 0 ? (
                                        <ul className="list-disc list-inside text-sm pl-1">{dependencies.map(dep => <li key={dep.id} className={dep.status === TodoStatus.DONE ? 'text-slate-400 line-through' : ''}>{dep.text} ({dep.status})</li>)}</ul>
                                    ) : <p className="text-sm text-slate-500 pl-1">None</p>
                                )}
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500">Blocks:</p>
                                {dependents.length > 0 ? (
                                    <ul className="list-disc list-inside text-sm pl-1">{dependents.map(dep => <li key={dep.id}>{dep.text}</li>)}</ul>
                                ) : <p className="text-sm text-slate-500 pl-1">None</p>}
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold">Sub-tasks ({editableTask.subTasks?.filter(s => s.isCompleted).length || 0} / {editableTask.subTasks?.length || 0})</h4>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                            <div
                                className="bg-green-500 h-2 rounded-full subtask-progress-bar transition-all duration-300"
                                style={{ width: `${subtaskProgress}%` }}
                            ></div>
                        </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {(isEditing ? editableTask.subTasks : task.subTasks)?.map((subtask) => (
                                <div key={subtask.id} className="flex items-center gap-3 p-1 rounded-md group hover:bg-slate-50">
                                    <input
                                        type="checkbox"
                                        title="Sub-task completed"
                                        checked={subtask.isCompleted}
                                        disabled={!isEditing || isTaskDone}
                                        onChange={(e) => handleSubtaskChange(subtask.id, 'isCompleted', e.target.checked)}
                                        className="h-4 w-4 rounded text-green-600 focus:ring-green-500"
                                    />
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            title="Sub-task name"
                                            placeholder="Sub-task name"
                                            value={subtask.text}
                                            onChange={(e) => handleSubtaskChange(subtask.id, 'text', e.target.value)}
                                            className="flex-grow p-1 border rounded text-sm bg-white"
                                        />
                                    ) : (
                                        <span className={`flex-grow text-sm ${subtask.isCompleted ? 'line-through text-slate-500' : ''}`}>
                                            {subtask.text}
                                        </span>
                                    )}
                                    {isEditing && (
                                        <button type="button" title="Delete sub-task" onClick={() => handleDeleteSubtask(subtask.id)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {isEditing && !isTaskDone && (
                            <Button size="sm" variant="secondary" onClick={handleAddSubtask} className="mt-2">Add Sub-task</Button>
                        )}
                    </div>

                    <div>
                        <h4 className="font-semibold mb-3">Activity & Comments</h4>
                        <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
                            {(editableTask.comments || []).map(comment => {
                                const author = personnel.find(p => p.id === comment.authorId);
                                return (
                                    <div key={comment.id} className="flex items-start gap-3">
                                        <Avatar name={author?.name || 'Unknown'} className="w-8 h-8 text-xs flex-shrink-0 mt-1" />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-sm">{author?.name || 'Unknown User'}</span>
                                                <span className="text-xs text-slate-400">{new Date(comment.timestamp).toLocaleString()}</span>
                                            </div>
                                            <p className="text-sm bg-slate-50 p-2 rounded-lg mt-1">{comment.text}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <form onSubmit={handlePostComment} className="mt-4 flex items-start gap-3">
                            <Avatar name={user.name} className="w-8 h-8 text-xs flex-shrink-0 mt-1" />
                            <div className="flex-grow">
                                <textarea
                                    value={newComment}
                                    onChange={e => setNewComment(e.target.value)}
                                    placeholder="Add a comment..."
                                    rows={2}
                                    className="w-full p-2 border rounded-md text-sm"
                                />
                                <div className="text-right mt-2">
                                    <Button type="submit" size="sm" disabled={!newComment.trim()}>Post Comment</Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                {isEditing ? (
                    <div className="mt-4 pt-4 border-t flex justify-end gap-2">
                        <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
                        <Button onClick={handleSave}>Save Changes</Button>
                    </div>
                ) : (
                    <div className="mt-4 pt-4 border-t flex justify-end">
                        <Button variant="secondary" onClick={onClose}>Close</Button>
                    </div>
                )}
            </Card>
        </div>
    );
}

export const AllTasksView: React.FC<AllTasksViewProps> = ({ user, addToast, isOnline }) => {
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState<Project[]>([]);
    const [todos, setTodos] = useState<Todo[]>([]);
    const [personnel, setPersonnel] = useState<User[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
    const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string | number>>(new Set());
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Todo | null>(null);
    const [bulkAction, setBulkAction] = useState({ type: '', value: '' });

    const canManage = hasPermission(user, Permission.MANAGE_ALL_TASKS);
    const abortControllerRef = useRef<AbortController | null>(null);

    const taskSummary = useMemo(() => {
        const total = todos.length;
        const inProgress = todos.filter(t => t.status === TodoStatus.IN_PROGRESS).length;
        const completed = todos.filter(t => t.status === TodoStatus.DONE).length;
        const overdue = todos.filter(t => {
            if (!t.dueDate || t.status === TodoStatus.DONE) return false;
            const due = new Date(t.dueDate);
            return !Number.isNaN(due.getTime()) && due < new Date();
        }).length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { total, inProgress, completed, overdue, completionRate };
    }, [todos]);

    const fetchData = useCallback(async () => {
        const controller = new AbortController();
        abortControllerRef.current?.abort();
        abortControllerRef.current = controller;

        setLoading(true);
        try {
            if (!user.companyId) return;
            const [projData, usersData] = await Promise.all([
                api.getProjectsByCompany(user.companyId, { signal: controller.signal }),
                api.getUsersByCompany(user.companyId, { signal: controller.signal })
            ]);
            if (controller.signal.aborted) return;
            setProjects(projData);
            if (controller.signal.aborted) return;
            setPersonnel(usersData);

            if (projData.length > 0) {
                const allTodos = await api.getTodosByProjectIds(projData.map(p => p.id), { signal: controller.signal });
                if (controller.signal.aborted) return;
                setTodos(allTodos);
            }
        } catch (error) {
            if ((error as Error).name !== 'AbortError') {
                addToast("Failed to load tasks.", "error");
            }
        } finally {
            if (controller.signal.aborted) return;
            setLoading(false);
        }
    }, [user, addToast]);

    useEffect(() => {
        fetchData();
        return () => {
            abortControllerRef.current?.abort();
        };
    }, [fetchData]);

    const filteredTodos = useMemo(() => {
        if (selectedProjectId === 'all') return todos;
        return todos.filter(t => t.projectId.toString() === selectedProjectId);
    }, [todos, selectedProjectId]);

    const handleOpenTaskModal = (task: Todo | null) => {
        setTaskToEdit(task);
        setIsTaskModalOpen(true);
    };

    const handleTaskStatusChange = (taskId: string | number, newStatus: TodoStatus) => {
        const originalTodos = [...todos];
        const updatedTodos = todos.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
        setTodos(updatedTodos);

        // FIX: Ensure taskId is a string for the API call.
        api.updateTodo(String(taskId), { status: newStatus }, user.id)
            .then(updatedTask => setTodos(prev => prev.map(t => t.id === taskId ? updatedTask : t)))
            .catch(() => {
                addToast("Failed to update task. Reverting.", "error");
                setTodos(originalTodos);
            });
    };

    const handleTaskSelectionChange = (taskId: string | number) => {
        setSelectedTaskIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(taskId)) newSet.delete(taskId);
            else newSet.add(taskId);
            return newSet;
        });
    };

    const handleTaskModalSuccess = () => {
        // Just refresh all data to ensure dependency graph is correct
        fetchData();
    };

    const handleBulkUpdate = async () => {
        if (selectedTasks.size === 0) {
            addToast("No tasks selected for bulk update.", "error");
            return;
        }

        const updates: Partial<Todo> = {};
        if (bulkStatus) updates.status = bulkStatus;
        if (bulkPriority) updates.priority = bulkPriority;
        if (bulkAssignee) updates.assigneeId = bulkAssignee === 'unassigned' ? null : parseInt(bulkAssignee);

        if (Object.keys(updates).length === 0) {
            addToast("Please select an action to apply.", "error");
            return;
        }

        setIsBulkUpdating(true);
        try {
            await Promise.all(Array.from(selectedTasks).map(taskId => api.updateTodo(taskId as string | number, updates, user.id)));
            addToast(`${selectedTasks.size} tasks updated successfully.`, "success");
            setSelectedTasks(new Set());
            setBulkStatus('');
            setBulkPriority('');
            setBulkAssignee('');
            fetchData(); // Refresh data
        } catch (error) {
            addToast("Failed to perform bulk update.", "error");
        } finally {
            setIsBulkUpdating(false);
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedTaskIds(new Set(filteredTodos.map(t => t.id)));
        } else {
            setSelectedTaskIds(new Set());
        }
    };

    const handleApplyBulkAction = async () => {
        if (selectedTaskIds.size === 0 || !bulkAction.type || !bulkAction.value) return;

        let updates: Partial<Todo> = {};
        if (bulkAction.type === 'status') updates.status = bulkAction.value as TodoStatus;
        // FIX: Correctly handle unassignment and ensure assigneeId is a string.
        if (bulkAction.type === 'assignee') updates.assigneeId = bulkAction.value === 'unassigned' ? undefined : bulkAction.value;
        if (bulkAction.type === 'priority') updates.priority = bulkAction.value as TodoPriority;

        const originalTodos = [...todos];
        const selectedIdsArray = Array.from(selectedTaskIds);
        setTodos(prev => prev.map(t => selectedIdsArray.includes(t.id) ? { ...t, ...updates } : t));

        try {
            await api.bulkUpdateTodos(selectedIdsArray, updates, user.id);
            addToast(`Bulk update applied successfully.`, 'success');
        } catch (error) {
            addToast("Bulk update failed.", "error");
            setTodos(originalTodos);
        } finally {
            setSelectedTaskIds(new Set());
        }
    };

    if (loading) return <Card>Loading tasks...</Card>;

    const isAllSelected = filteredTodos.length > 0 && selectedTaskIds.size === filteredTodos.length;

    return (
        <div className="space-y-6">
            {isTaskModalOpen && <TaskModal user={user} projects={projects} users={personnel} onClose={() => setIsTaskModalOpen(false)} onSuccess={handleTaskModalSuccess} addToast={addToast} taskToEdit={taskToEdit} allProjectTasks={todos} />}
            <ViewHeader
                view="all-tasks"
                actions={canManage ? <Button onClick={() => handleOpenTaskModal(null)}>Add Task</Button> : undefined}
                meta={[
                    {
                        label: 'Total tasks',
                        value: `${taskSummary.total}`,
                        helper: `${taskSummary.completionRate}% complete`,
                    },
                    {
                        label: 'In progress',
                        value: `${taskSummary.inProgress}`,
                        helper: 'Actively being worked',
                        indicator: taskSummary.inProgress > 0 ? 'positive' : 'neutral',
                    },
                    {
                        label: 'Overdue',
                        value: `${taskSummary.overdue}`,
                        helper: taskSummary.overdue > 0 ? 'Needs attention' : 'On track',
                        indicator: taskSummary.overdue > 0 ? 'negative' : 'positive',
                    },
                ]}
            />

            <Card className="p-0">
                <div className="flex flex-wrap items-center gap-4 px-4 py-4">
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                        <input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                        Select all
                    </label>
                    <select
                        title="Filter by project"
                        value={selectedProjectId}
                        onChange={e => setSelectedProjectId(e.target.value)}
                        className="rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none"
                    >
                        <option value="all">All projects</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                {selectedTaskIds.size > 0 && (
                    <div className="flex flex-wrap items-center gap-4 border-t border-border bg-primary/5 px-4 py-4 text-sm">
                        <span className="font-semibold text-foreground">{selectedTaskIds.size} task(s) selected</span>
                        <select
                            title="Change status for selected tasks"
                            onChange={e => setBulkAction({ type: 'status', value: e.target.value })}
                            className="rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none"
                        >
                            <option value="">Change status...</option>
                            {Object.values(TodoStatus).map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                        </select>
                        <select
                            title="Change assignee for selected tasks"
                            onChange={e => setBulkAction({ type: 'assignee', value: e.target.value })}
                            className="rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none"
                        >
                            <option value="">Change assignee...</option>
                            <option value="unassigned">Unassigned</option>
                            {personnel.map(p => <option key={p.id} value={p.id}>{`${p.firstName} ${p.lastName}`}</option>)}
                        </select>
                        <select
                            title="Change priority for selected tasks"
                            onChange={e => setBulkAction({ type: 'priority', value: e.target.value })}
                            className="rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none"
                        >
                            <option value="">Change priority...</option>
                            {Object.values(TodoPriority).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <Button onClick={handleApplyBulkAction}>Apply</Button>
                    </div>
                )}
            </Card>

            <Card>
                <div className="flex flex-col md:flex-row gap-4 mb-4 pb-4 border-b">
                    <select title="Project filter" value={projectFilter} onChange={e => setProjectFilter(e.target.value)} className="w-full md:w-auto p-2 border bg-white rounded-md">
                        <option value="all">All Projects</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <select title="Assignee filter" value={assigneeFilter} onChange={e => setAssigneeFilter(e.target.value)} className="w-full md:w-auto p-2 border bg-white rounded-md">
                        <option value="all">All Assignees</option>
                        <option value="unassigned">Unassigned</option>
                        {personnel.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>

                {canManage && selectedTasks.size > 0 && (
                    <div className="p-4 bg-slate-100 rounded-lg mb-4 flex flex-col md:flex-row gap-4 items-center animate-card-enter">
                        <span className="font-semibold">{selectedTasks.size} tasks selected</span>
                        <select title="Bulk status" value={bulkStatus} onChange={e => setBulkStatus(e.target.value as TodoStatus | '')} className="p-2 border bg-white rounded-md"><option value="">Change Status...</option>{Object.values(TodoStatus).map(s => <option key={s} value={s}>{s}</option>)}</select>
                        <select title="Bulk priority" value={bulkPriority} onChange={e => setBulkPriority(e.target.value as TodoPriority | '')} className="p-2 border bg-white rounded-md"><option value="">Change Priority...</option>{Object.values(TodoPriority).map(p => <option key={p} value={p}>{p}</option>)}</select>
                        <select title="Bulk assignee" value={bulkAssignee} onChange={e => setBulkAssignee(e.target.value)} className="p-2 border bg-white rounded-md"><option value="">Assign to...</option><option value="unassigned">Unassign</option>{personnel.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
                        <Button onClick={handleBulkUpdate} isLoading={isBulkUpdating}>Apply</Button>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-slate-50">
                            <tr>
                                {canManage && <th className="px-6 py-3"><input type="checkbox" title="Select all tasks" onChange={handleSelectAll} checked={selectedTasks.size > 0 && filteredTasks.length > 0 && selectedTasks.size === filteredTasks.length} /></th>}
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Task</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Project</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Assignee</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Due Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Priority</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredTasks.map(task => {
                                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== TodoStatus.DONE;
                                const taskDependencies = (task.dependsOn || []).map(depId => tasks.find(t => t.id === depId)).filter(Boolean) as Todo[];
                                const isTaskBlocked = taskDependencies.some(dep => dep.status !== TodoStatus.DONE);
                                return (
                                    <tr key={task.id} className={`hover:bg-slate-50 ${isTaskBlocked ? 'opacity-60' : 'cursor-pointer'}`} onClick={() => !isTaskBlocked && setSelectedTask(task)}>
                                        {canManage && <td className="px-6 py-4" onClick={e => e.stopPropagation()}><input type="checkbox" checked={selectedTasks.has(task.id)} onChange={() => handleSelectTask(task.id)} /></td>}
                                        <td className="px-6 py-4 font-medium">
                                            <div className="flex items-center gap-2">
                                                {isTaskBlocked && (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                                <span>{task.text}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{projectMap.get(task.projectId)}</td>
                                        <td className="px-6 py-4 text-sm">{task.assigneeId ? <div className="flex items-center gap-2"><Avatar name={personnelMap.get(task.assigneeId) || ''} className="w-6 h-6 text-xs" /><span>{personnelMap.get(task.assigneeId)}</span></div> : 'Unassigned'}</td>
                                        <td className={`px-6 py-4 text-sm ${isOverdue ? 'text-red-600 font-semibold' : ''}`}>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm"><PriorityDisplay priority={task.priority} /></td>
                                        <td className="px-6 py-4 text-sm"><span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-800">{task.status}</span></td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
                {filteredTasks.length === 0 && <p className="text-center py-8 text-slate-500">No open tasks match your filters.</p>}

                {/* Completed Tasks Section */}
                <div className="mt-8">
                    <details open={showCompleted} onToggle={(e) => setShowCompleted((e.target as HTMLDetailsElement).open)}>
                        <summary className="font-semibold text-lg cursor-pointer py-2">Completed Tasks ({completedTasks.length})</summary>
                        <div className="mt-4 space-y-3 pl-4 border-l-2">
                            {completedTasks.map(task => (
                                <div key={task.id} className="p-3 bg-slate-50 rounded-r-lg flex items-center justify-between animate-card-enter">
                                    <div className="flex items-center gap-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <p className="line-through text-slate-600">{task.text}</p>
                                            <p className="text-xs text-slate-500">in {projectMap.get(task.projectId)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right text-xs text-slate-500">
                                        <p>Completed by {personnelMap.get(task.completedBy!) || 'Unknown'}</p>
                                        {task.completedAt && <p>{new Date(task.completedAt).toLocaleDateString()}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </details>
                </div>
            </Card>
            <Card>
                <div className="flex flex-col md:flex-row gap-4 mb-4 pb-4 border-b">
                    <select title="Project filter" value={projectFilter} onChange={e => setProjectFilter(e.target.value)} className="w-full md:w-auto p-2 border bg-white rounded-md">
                        <option value="all">All Projects</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <select title="Assignee filter" value={assigneeFilter} onChange={e => setAssigneeFilter(e.target.value)} className="w-full md:w-auto p-2 border bg-white rounded-md">
                        <option value="all">All Assignees</option>
                        <option value="unassigned">Unassigned</option>
                        {personnel.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>

                {canManage && selectedTasks.size > 0 && (
                    <div className="p-4 bg-slate-100 rounded-lg mb-4 flex flex-col md:flex-row gap-4 items-center animate-card-enter">
                        <span className="font-semibold">{selectedTasks.size} tasks selected</span>
                        <select title="Bulk status" value={bulkStatus} onChange={e => setBulkStatus(e.target.value as TodoStatus | '')} className="p-2 border bg-white rounded-md"><option value="">Change Status...</option>{Object.values(TodoStatus).map(s => <option key={s} value={s}>{s}</option>)}</select>
                        <select title="Bulk priority" value={bulkPriority} onChange={e => setBulkPriority(e.target.value as TodoPriority | '')} className="p-2 border bg-white rounded-md"><option value="">Change Priority...</option>{Object.values(TodoPriority).map(p => <option key={p} value={p}>{p}</option>)}</select>
                        <select title="Bulk assignee" value={bulkAssignee} onChange={e => setBulkAssignee(e.target.value)} className="p-2 border bg-white rounded-md"><option value="">Assign to...</option><option value="unassigned">Unassign</option>{personnel.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
                        <Button onClick={handleBulkUpdate} isLoading={isBulkUpdating}>Apply</Button>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-slate-50">
                            <tr>
                                {canManage && <th className="px-6 py-3"><input type="checkbox" title="Select all tasks" onChange={handleSelectAll} checked={selectedTasks.size > 0 && filteredTasks.length > 0 && selectedTasks.size === filteredTasks.length} /></th>}
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Task</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Project</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Assignee</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Due Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Priority</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredTasks.map(task => {
                                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== TodoStatus.DONE;
                                const taskDependencies = (task.dependsOn || []).map(depId => tasks.find(t => t.id === depId)).filter(Boolean) as Todo[];
                                const isTaskBlocked = taskDependencies.some(dep => dep.status !== TodoStatus.DONE);
                                return (
                                    <tr key={task.id} className={`hover:bg-slate-50 ${isTaskBlocked ? 'opacity-60' : 'cursor-pointer'}`} onClick={() => !isTaskBlocked && setSelectedTask(task)}>
                                        {canManage && <td className="px-6 py-4" onClick={e => e.stopPropagation()}><input type="checkbox" checked={selectedTasks.has(task.id)} onChange={() => handleSelectTask(task.id)} /></td>}
                                        <td className="px-6 py-4 font-medium">
                                            <div className="flex items-center gap-2">
                                                {isTaskBlocked && (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                                <span>{task.text}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{projectMap.get(task.projectId)}</td>
                                        <td className="px-6 py-4 text-sm">{task.assigneeId ? <div className="flex items-center gap-2"><Avatar name={personnelMap.get(task.assigneeId) || ''} className="w-6 h-6 text-xs" /><span>{personnelMap.get(task.assigneeId)}</span></div> : 'Unassigned'}</td>
                                        <td className={`px-6 py-4 text-sm ${isOverdue ? 'text-red-600 font-semibold' : ''}`}>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm"><PriorityDisplay priority={task.priority} /></td>
                                        <td className="px-6 py-4 text-sm"><span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-800">{task.status}</span></td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
                {filteredTasks.length === 0 && <p className="text-center py-8 text-slate-500">No open tasks match your filters.</p>}

                {/* Completed Tasks Section */}
                <div className="mt-8">
                    <details open={showCompleted} onToggle={(e) => setShowCompleted((e.target as HTMLDetailsElement).open)}>
                        <summary className="font-semibold text-lg cursor-pointer py-2">Completed Tasks ({completedTasks.length})</summary>
                        <div className="mt-4 space-y-3 pl-4 border-l-2">
                            {completedTasks.map(task => (
                                <div key={task.id} className="p-3 bg-slate-50 rounded-r-lg flex items-center justify-between animate-card-enter">
                                    <div className="flex items-center gap-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <p className="line-through text-slate-600">{task.text}</p>
                                            <p className="text-xs text-slate-500">in {projectMap.get(task.projectId)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right text-xs text-slate-500">
                                        <p>Completed by {personnelMap.get(task.completedBy!) || 'Unknown'}</p>
                                        {task.completedAt && <p>{new Date(task.completedAt).toLocaleDateString()}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </details>
                </div>
            </Card>

            <KanbanBoard
                todos={filteredTodos}
                allTodos={todos}
                user={user}
                personnel={personnel}
                onTaskStatusChange={handleTaskStatusChange}
                onTaskSelectionChange={handleTaskSelectionChange}
                selectedTaskIds={selectedTaskIds}
            />
        </div>
    );
};