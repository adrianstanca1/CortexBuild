import React, { useState, useMemo, useRef } from 'react';
import { Todo, User, TodoStatus, TodoPriority, SubTask, Comment } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Avatar } from './ui/Avatar';
import { CollapsibleSection } from './ui/CollapsibleSection';
import { ReminderControl } from './ReminderControl';

interface TaskDetailModalProps {
    todo: Todo;
    allTodos: Todo[];
    personnel: User[];
    user: User;
    onClose: () => void;
    onUpdate: (taskId: string | number, updates: Partial<Todo>) => void;
    addToast: (message: string, type: 'success' | 'error') => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ todo, allTodos, personnel, user, onClose, onUpdate, addToast }) => {
    const [newSubtaskText, setNewSubtaskText] = useState('');
    const [newCommentText, setNewCommentText] = useState('');
    const [mentionSuggestions, setMentionSuggestions] = useState<User[]>([]);
    const [showMentions, setShowMentions] = useState(false);
    const commentInputRef = useRef<HTMLInputElement>(null);


    const dependencies = useMemo(() => {
        return (todo.dependsOn || []).map(depId => allTodos.find(t => t.id === depId)).filter(Boolean) as Todo[];
    }, [todo.dependsOn, allTodos]);

    const handleFieldUpdate = (field: keyof Todo, value: any) => {
        onUpdate(todo.id, { [field]: value });
    };

    const handleToggleSubtask = (subtaskId: number) => {
        const updatedSubtasks = (todo.subTasks || []).map(st =>
            st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
        );
        onUpdate(todo.id, { subTasks: updatedSubtasks });
    };

    const handleAddSubtask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSubtaskText.trim()) return;
        const newSubtask: SubTask = { id: Date.now(), text: newSubtaskText, isCompleted: false };
        const updatedSubtasks = [...(todo.subTasks || []), newSubtask];
        onUpdate(todo.id, { subTasks: updatedSubtasks });
        setNewSubtaskText('');
    };
    
    const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value;
        setNewCommentText(text);

        const cursorPosition = e.target.selectionStart;
        if (cursorPosition === null) {
            setShowMentions(false);
            return;
        }

        const textUpToCursor = text.slice(0, cursorPosition);
        const lastAt = textUpToCursor.lastIndexOf('@');

        const isMentionStart = lastAt === 0 || (lastAt > 0 && /\s/.test(textUpToCursor[lastAt - 1]));

        if (isMentionStart) {
            const query = textUpToCursor.substring(lastAt + 1);
            if (query.includes('@')) { // No mentions inside mentions
                setShowMentions(false);
                return;
            }
            const suggestions = personnel.filter(p => p.name.toLowerCase().startsWith(query.toLowerCase()));
            setMentionSuggestions(suggestions);
            setShowMentions(suggestions.length > 0);
        } else {
            setShowMentions(false);
        }
    };

    const handleMentionSelect = (selectedUser: User) => {
        const text = newCommentText;
        const cursorPosition = commentInputRef.current?.selectionStart ?? text.length;
        const textUpToCursor = text.slice(0, cursorPosition);
        const lastAt = textUpToCursor.lastIndexOf('@');

        const preMention = text.substring(0, lastAt);
        const postMention = text.substring(cursorPosition);
        
        const newText = `${preMention}@${selectedUser.name} ${postMention}`;
        
        setNewCommentText(newText);
        setShowMentions(false);

        setTimeout(() => {
            const newCursorPosition = lastAt + 1 + selectedUser.name.length + 1;
            commentInputRef.current?.focus();
            commentInputRef.current?.setSelectionRange(newCursorPosition, newCursorPosition);
        }, 0);
    };

    const handleAddComment = (e: React.FormEvent) => {
        e.preventDefault();
        if(!newCommentText.trim()) return;
        const newComment: Comment = { id: Date.now(), text: newCommentText, authorId: user.id, timestamp: new Date() };
        const updatedComments = [...(todo.comments || []), newComment];
        onUpdate(todo.id, { comments: updatedComments });
        setNewCommentText('');
    };

    const handleReminderUpdated = () => {
        if (todo.dueDate) {
            const reminderTime = new Date(new Date(todo.dueDate).getTime() - 10 * 60 * 1000);
            onUpdate(todo.id, { reminderAt: reminderTime });
        }
    };
    
    const renderCommentWithMentions = (text: string) => {
        const userNames = personnel.map(p => p.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
        if (userNames.length === 0) return <span>{text}</span>;
        
        const regex = new RegExp(`@(${userNames.join('|')})\\b`, 'g');
        const parts = text.split(regex);
        
        return (
            <span>
                {parts.map((part, index) => {
                    const isMention = index % 2 === 1 && userNames.some(name => name.replace(/\\/g, '') === part);
                    if (isMention) {
                        return <strong key={index} className="bg-sky-100 text-sky-800 px-1 rounded">@{part}</strong>;
                    }
                    return part;
                })}
            </span>
        );
    };

    const subtaskBadge = todo.subTasks && todo.subTasks.length > 0 ? (
        <span className="text-xs bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
            {todo.subTasks.filter(t => t.isCompleted).length}/{todo.subTasks.length}
        </span>
    ) : null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col animate-card-enter" onClick={e => e.stopPropagation()}>
                <div className="flex-shrink-0 flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold text-slate-800 flex-grow">{todo.text}</h2>
                    <Button variant="ghost" size="sm" onClick={onClose}>&times;</Button>
                </div>

                <div className="flex-grow overflow-y-auto pr-2 -mr-2">
                    <CollapsibleSection title="Details" defaultOpen>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Assignee</label>
                                <select value={todo.assigneeId || ''} onChange={e => handleFieldUpdate('assigneeId', e.target.value ? parseInt(e.target.value) : null)} className="w-full">
                                    <option value="">Unassigned</option>
                                    {personnel.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Priority</label>
                                <select value={todo.priority} onChange={e => handleFieldUpdate('priority', e.target.value)} className="w-full">
                                    {Object.values(TodoPriority).map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Status</label>
                                <select value={todo.status} onChange={e => handleFieldUpdate('status', e.target.value)} className="w-full">
                                    {Object.values(TodoStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Due Date</label>
                                <div className="flex items-center gap-2">
                                    <input type="date" value={todo.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : ''} onChange={e => handleFieldUpdate('dueDate', e.target.value ? new Date(e.target.value) : null)} className="w-full" />
                                    <ReminderControl todo={todo} user={user} addToast={addToast} onReminderUpdate={handleReminderUpdated} />
                                </div>
                            </div>
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection title="Subtasks" badge={subtaskBadge}>
                        <div className="space-y-2">
                            {(todo.subTasks || []).map(subtask => (
                                <div key={subtask.id} className="flex items-center gap-2 p-2 bg-background rounded-md">
                                    <input type="checkbox" checked={subtask.isCompleted} onChange={() => handleToggleSubtask(subtask.id)} />
                                    <span className={`flex-grow ${subtask.isCompleted ? 'line-through text-muted-foreground' : 'text-card-foreground'}`}>{subtask.text}</span>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={handleAddSubtask} className="flex gap-2 mt-3">
                            <input type="text" value={newSubtaskText} onChange={e => setNewSubtaskText(e.target.value)} placeholder="Add a new subtask..." className="w-full" />
                            <Button type="submit" variant="secondary">Add</Button>
                        </form>
                    </CollapsibleSection>

                    <CollapsibleSection title="Dependencies">
                        {dependencies.length > 0 ? (
                             <ul className="list-disc list-inside space-y-1">
                                {dependencies.map(dep => <li key={dep.id}>{dep.text} ({dep.status})</li>)}
                            </ul>
                        ) : <p>No dependencies.</p>}
                    </CollapsibleSection>

                    <CollapsibleSection title="Comments">
                        <div className="space-y-3">
                            {(todo.comments || []).map(comment => (
                                <div key={comment.id} className="flex items-start gap-2">
                                    <Avatar name={personnel.find(p => p.id === comment.authorId)?.name || 'Unknown'} className="w-8 h-8 text-xs" />
                                    <div className="bg-background p-2 rounded-lg flex-grow">
                                        <div className="flex justify-between items-center">
                                            <p className="font-semibold text-xs text-card-foreground">{personnel.find(p => p.id === comment.authorId)?.name}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(comment.timestamp).toLocaleString()}</p>
                                        </div>
                                        <p className="text-sm text-card-foreground mt-1">{renderCommentWithMentions(comment.text)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                         <form onSubmit={handleAddComment} className="relative flex gap-2 mt-4 pt-4 border-t">
                             {showMentions && (
                                <div className="absolute bottom-full mb-1 w-full bg-white border rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
                                    {mentionSuggestions.map(p => (
                                        <button
                                            key={p.id}
                                            type="button"
                                            className="w-full text-left flex items-center gap-2 p-2 hover:bg-slate-100"
                                            onClick={() => handleMentionSelect(p)}
                                        >
                                            <Avatar name={p.name} className="w-6 h-6 text-xs" />
                                            <span>{p.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                            <input
                                ref={commentInputRef}
                                type="text"
                                value={newCommentText}
                                onChange={handleCommentChange}
                                placeholder="Add a comment... type '@' to mention"
                                className="w-full"
                            />
                            <Button type="submit" variant="secondary">Post</Button>
                        </form>
                    </CollapsibleSection>
                </div>
            </Card>
        </div>
    );
};