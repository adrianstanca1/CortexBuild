
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Todo, Project, Permission, TodoStatus, TodoPriority, SubTask, Comment } from '../types';
import { api } from '../services/mockApi';
import { Card } from './ui/Card';
import { hasPermission } from '../services/auth';
import { PriorityDisplay } from './ui/PriorityDisplay';
import { Button } from './ui/Button';
import { Avatar } from './ui/Avatar';

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
    onClose: () => void;
    onUpdateTask: (task: Todo, updates: Partial<Todo>) => void;
    addToast: (message: string, type: 'success' | 'error') => void;
}> = ({ task, user, projects, personnel, onClose, onUpdateTask, addToast }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editableTask, setEditableTask] = useState<Todo>(task);
    const [newComment, setNewComment] = useState('');

    useEffect(() => { setEditableTask(task); }, [task]);

    const canManage = hasPermission(user, Permission.MANAGE_TASKS);
    const isTaskDone = task.status === TodoStatus.DONE;
    
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
        
        // Optimistically update UI
        const updatedTaskWithComment = { ...editableTask, comments: updatedComments };
        setEditableTask(updatedTaskWithComment);
        
        // Persist change
        onUpdateTask(task, { comments: updatedComments });
        
        setNewComment('');
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
                {/* Header */}
                 <div className="flex justify-between items-start mb-2">
                    {isEditing ? (
                        <input type="text" value={editableTask.text} onChange={(e) => handleFieldChange('text', e.target.value)} className="text-xl font-bold w-full -ml-1 p-1 rounded-md border" />
                    ) : (
                        <h3 className="text-xl font-bold">{task.text}</h3>
                    )}
                    
                    {!isEditing && canManage && !isTaskDone && (
                        <Button size="sm" variant="secondary" onClick={() => setIsEditing(true)}>Edit</Button>
                    )}
                </div>
                <p className="text-sm text-slate-500 mb-4">in project: {projects.find(p => p.id === task.projectId)?.name}</p>

                {/* Body */}
                <div className="flex-grow overflow-y-auto pr-2 space-y-6">
                    {/* Details Section */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        {/* Fields would be editable inputs in 'isEditing' mode */}
                        <div><span className="font-semibold">Assignee:</span> {personnel.find(p => p.id === task.assigneeId)?.name || 'Unassigned'}</div>
                        <div><span className="font-semibold">Priority:</span> <PriorityDisplay priority={task.priority} /></div>
                        <div><span className="font-semibold">Due Date:</span> {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'None'}</div>
                        <div><span className="font-semibold">Reporter:</span> {personnel.find(p => p.id === task.creatorId)?.name}</div>
                    </div>

                    {/* Subtasks Section */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                             <h4 className="font-semibold">Sub-tasks ({editableTask.subTasks?.filter(s => s.isCompleted).length || 0} / {editableTask.subTasks?.length || 0})</h4>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${subtaskProgress}%` }}></div>
                        </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {(isEditing ? editableTask.subTasks : task.subTasks)?.map((subtask) => (
                                <div key={subtask.id} className="flex items-center gap-3 p-1 rounded-md group hover:bg-slate-50">
                                    <input 
                                        type="checkbox" 
                                        checked={subtask.isCompleted}
                                        disabled={!isEditing || isTaskDone}
                                        onChange={(e) => handleSubtaskChange(subtask.id, 'isCompleted', e.target.checked)}
                                        className="h-4 w-4 rounded text-green-600 focus:ring-green-500"
                                    />
                                    {isEditing ? (
                                        <input 
                                            type="text"
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
                                        <button onClick={() => handleDeleteSubtask(subtask.id)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
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

                    {/* Comments Section */}
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
                {/* Footer */}
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
    const [tasks, setTasks] = useState<Todo[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [personnel, setPersonnel] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState<Todo | null>(null);
    const [projectFilter, setProjectFilter] = useState('all');
    const [assigneeFilter, setAssigneeFilter] = useState('all');
    const [selectedTasks, setSelectedTasks] = useState<Set<number | string>>(new Set());
    const [showCompleted, setShowCompleted] = useState(false);
    const [bulkStatus, setBulkStatus] = useState<TodoStatus | ''>('');
    const [bulkPriority, setBulkPriority] = useState<TodoPriority | ''>('');
    const [bulkAssignee, setBulkAssignee] = useState<string>('');
    const [isBulkUpdating, setIsBulkUpdating] = useState(false);

    const canManage = hasPermission(user, Permission.MANAGE_TASKS);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            if (!user.companyId) return;
            const userProjects = hasPermission(user, Permission.VIEW_ALL_PROJECTS)
                ? await api.getProjectsByCompany(user.companyId)
                : await api.getProjectsByUser(user.id);
            const projectIds = userProjects.map(p => p.id);
            if (projectIds.length > 0) {
                const [tasksData, personnelData] = await Promise.all([
                    api.getTodosByProjectIds(projectIds),
                    api.getUsersByCompany(user.companyId)
                ]);
                setTasks(tasksData);
                setPersonnel(personnelData);
            }
            setProjects(userProjects);
        } catch (error) {
            addToast("Failed to load tasks.", "error");
        } finally {
            setLoading(false);
        }
    }, [user, addToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleUpdateTask = async (taskToUpdate: Todo, updates: Partial<Todo>) => {
        try {
            const updatedTask = await api.updateTodo(taskToUpdate.id, updates, user.id);
            setTasks(currentTasks => currentTasks.map(t => t.id === taskToUpdate.id ? updatedTask : t));
            if (selectedTask?.id === taskToUpdate.id) {
                setSelectedTask(updatedTask);
            }
            addToast("Task updated successfully", "success");
        } catch (error) {
            addToast("Failed to update task", "error");
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedTasks(new Set(filteredTasks.map(t => t.id)));
        } else {
            setSelectedTasks(new Set());
        }
    };
    
    const handleSelectTask = (taskId: number | string) => {
        setSelectedTasks(prev => {
            const newSet = new Set(prev);
            if (newSet.has(taskId)) {
                newSet.delete(taskId);
            } else {
                newSet.add(taskId);
            }
            return newSet;
        });
    };
    
    const handleBulkUpdate = async () => {
        if (selectedTasks.size === 0) {
            addToast("No tasks selected for bulk update.", "error");
            return;
        }
        setIsBulkUpdating(true);
        const updates: Partial<Todo> = {};
        if (bulkStatus) updates.status = bulkStatus;
        if (bulkPriority) updates.priority = bulkPriority;
        if (bulkAssignee) updates.assigneeId = bulkAssignee === 'unassigned' ? null : parseInt(bulkAssignee);

        try {
            await Promise.all(Array.from(selectedTasks).map(taskId => api.updateTodo(taskId, updates, user.id)));
            addToast(`${selectedTasks.size} tasks updated.`, "success");
            setSelectedTasks(new Set());
            fetchData(); // Refresh data
        } catch(error) {
            addToast("Failed to perform bulk update.", "error");
        } finally {
            setIsBulkUpdating(false);
        }
    };

    const projectMap = useMemo(() => new Map(projects.map(p => [p.id, p.name])), [projects]);
    const personnelMap = useMemo(() => new Map(personnel.map(p => [p.id, p.name])), [personnel]);
    
    const { openTasks, completedTasks } = useMemo(() => {
        const open: Todo[] = [];
        const completed: Todo[] = [];
        tasks.forEach(task => {
            if (task.status === TodoStatus.DONE) {
                completed.push(task);
            } else {
                open.push(task);
            }
        });
        // Sort completed tasks by completion date, newest first
        completed.sort((a, b) => (b.completedAt ? new Date(b.completedAt).getTime() : 0) - (a.completedAt ? new Date(a.completedAt).getTime() : 0));
        return { openTasks, completedTasks };
    }, [tasks]);

    const filteredTasks = useMemo(() => {
        return openTasks.filter(task => {
            const matchesProject = projectFilter === 'all' || task.projectId.toString() === projectFilter;
            const matchesAssignee = assigneeFilter === 'all' || (task.assigneeId?.toString() || 'unassigned') === assigneeFilter;
            return matchesProject && matchesAssignee;
        });
    }, [openTasks, projectFilter, assigneeFilter]);

    if (loading) return <Card><p>Loading tasks...</p></Card>;

    return (
        <div className="space-y-6">
            {selectedTask && (
                <TaskDetailModal
                    task={selectedTask}
                    user={user}
                    projects={projects}
                    personnel={personnel}
                    onClose={() => setSelectedTask(null)}
                    onUpdateTask={handleUpdateTask}
                    addToast={addToast}
                />
            )}
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-slate-800">All Tasks</h2>
                {canManage && <Button>Create Task</Button>}
            </div>

            <Card>
                 <div className="flex flex-col md:flex-row gap-4 mb-4 pb-4 border-b">
                     <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)} className="w-full md:w-auto p-2 border bg-white rounded-md">
                        <option value="all">All Projects</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                     <select value={assigneeFilter} onChange={e => setAssigneeFilter(e.target.value)} className="w-full md:w-auto p-2 border bg-white rounded-md">
                        <option value="all">All Assignees</option>
                        <option value="unassigned">Unassigned</option>
                        {personnel.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                
                {canManage && selectedTasks.size > 0 && (
                     <div className="p-4 bg-slate-100 rounded-lg mb-4 flex flex-col md:flex-row gap-4 items-center">
                        <span className="font-semibold">{selectedTasks.size} tasks selected</span>
                        <select value={bulkStatus} onChange={e => setBulkStatus(e.target.value as TodoStatus | '')} className="p-2 border bg-white rounded-md"><option value="">Change Status...</option>{Object.values(TodoStatus).map(s => <option key={s} value={s}>{s}</option>)}</select>
                        <select value={bulkPriority} onChange={e => setBulkPriority(e.target.value as TodoPriority | '')} className="p-2 border bg-white rounded-md"><option value="">Change Priority...</option>{Object.values(TodoPriority).map(p => <option key={p} value={p}>{p}</option>)}</select>
                        <select value={bulkAssignee} onChange={e => setBulkAssignee(e.target.value)} className="p-2 border bg-white rounded-md"><option value="">Assign to...</option><option value="unassigned">Unassign</option>{personnel.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
                        <Button onClick={handleBulkUpdate} isLoading={isBulkUpdating}>Apply</Button>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-slate-50">
                            <tr>
                                {canManage && <th className="px-6 py-3"><input type="checkbox" onChange={handleSelectAll} checked={selectedTasks.size > 0 && filteredTasks.length > 0 && selectedTasks.size === filteredTasks.length} /></th>}
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
                                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
                                return (
                                <tr key={task.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedTask(task)}>
                                    {canManage && <td className="px-6 py-4" onClick={e => e.stopPropagation()}><input type="checkbox" checked={selectedTasks.has(task.id)} onChange={() => handleSelectTask(task.id)} /></td>}
                                    <td className="px-6 py-4 font-medium">{task.text}</td>
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
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M12 1.586l-4 4-1.414-1.414L8 2.586 12 6.586l6-6L19.414 2 12 9.414 4.586 2 6 0.586l6 6z" clipRule="evenodd" transform="translate(-2 -0.586)" />
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
        </div>
    );
};
