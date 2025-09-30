

import React, { useState, useEffect } from 'react';
// FIX: Changed type to Task to match definitions.
import { Task as Todo, User } from '../../types';
import { api } from '../../services/mockApi';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface ReminderModalProps {
    todo: Todo;
    user: User;
    onClose: () => void;
    onSuccess: () => void;
    addToast: (message: string, type: 'success' | 'error') => void;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({ todo, user, onClose, onSuccess, addToast }) => {
    const [mode, setMode] = useState<'duration' | 'custom'>('duration');
    const [duration, setDuration] = useState('10m'); // 10m, 1h, 1d
    const [customDateTime, setCustomDateTime] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // FIX: Cast todo to any to access reminderAt, as it's a dynamic property in the mock data
    const todoWithReminder = todo as any;

    useEffect(() => {
        if (todoWithReminder.reminderAt) {
            const reminderDate = new Date(todoWithReminder.reminderAt);
            // Heuristic to check if it was likely a duration or custom
            if (todo.dueDate && (new Date(todo.dueDate).getTime() - reminderDate.getTime()) === 10 * 60 * 1000) {
                setMode('duration');
                setDuration('10m');
            } else {
                setMode('custom');
                // Format for datetime-local input
                const pad = (num: number) => num.toString().padStart(2, '0');
                const formatted = `${reminderDate.getFullYear()}-${pad(reminderDate.getMonth() + 1)}-${pad(reminderDate.getDate())}T${pad(reminderDate.getHours())}:${pad(reminderDate.getMinutes())}`;
                setCustomDateTime(formatted);
            }
        } else if (todo.dueDate) {
            const defaultReminderTime = new Date(new Date(todo.dueDate).getTime() - 10 * 60 * 1000);
            const pad = (num: number) => num.toString().padStart(2, '0');
            const formatted = `${defaultReminderTime.getFullYear()}-${pad(defaultReminderTime.getMonth() + 1)}-${pad(defaultReminderTime.getDate())}T${pad(defaultReminderTime.getHours())}:${pad(defaultReminderTime.getMinutes())}`;
            setCustomDateTime(formatted);
        }
    }, [todo]);

    const handleSave = async () => {
        // Request permission if not already granted or denied
        if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                addToast("Notification permission denied.", "error");
                return;
            }
        } else if (Notification.permission === 'denied') {
            addToast("Notifications are blocked by your browser.", "error");
            return;
        }

        let reminderTime: Date | null = null;

        if (mode === 'duration') {
            if (!todo.dueDate) {
                addToast("Cannot set a duration-based reminder without a due date.", "error");
                return;
            }
            const dueDate = new Date(todo.dueDate);
            let offset = 0;
            if (duration === '10m') offset = 10 * 60 * 1000;
            if (duration === '1h') offset = 60 * 60 * 1000;
            if (duration === '1d') offset = 24 * 60 * 60 * 1000;
            reminderTime = new Date(dueDate.getTime() - offset);
        } else { // custom
            if (!customDateTime) {
                addToast("Please select a valid date and time.", "error");
                return;
            }
            reminderTime = new Date(customDateTime);
        }

        if (reminderTime < new Date()) {
            addToast("Reminder time cannot be in the past.", "error");
            return;
        }

        setIsSaving(true);
        try {
            await api.updateTodo(todo.id, { reminderAt: reminderTime });
            addToast(`Reminder set for ${reminderTime.toLocaleString()}`, 'success');
            onSuccess();
            onClose();
        } catch (error) {
            addToast("Failed to set reminder.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemove = async () => {
        setIsSaving(true);
        try {
            await api.updateTodo(todo.id, { reminderAt: undefined });
            addToast(`Reminder removed.`, 'success');
            onSuccess();
            onClose();
        } catch (error) {
            addToast("Failed to remove reminder.", "error");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <Card className="w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4">Set Reminder for "{(todo as any).text || todo.title}"</h3>
                <div className="space-y-4">
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                        <button type="button" onClick={() => setMode('duration')} className={`flex-1 p-2 rounded-md text-sm transition-all ${mode === 'duration' ? 'bg-white dark:bg-slate-700 shadow' : ''}`} disabled={!todo.dueDate}>Before Due Date</button>
                        <button type="button" onClick={() => setMode('custom')} className={`flex-1 p-2 rounded-md text-sm transition-all ${mode === 'custom' ? 'bg-white dark:bg-slate-700 shadow' : ''}`}>Custom Time</button>
                    </div>
                    {!todo.dueDate && mode === 'duration' && <p className="text-xs text-red-500 text-center">A due date must be set for this option.</p>}

                    {mode === 'duration' && todo.dueDate && (
                        <select value={duration} onChange={e => setDuration(e.target.value)} className="w-full p-2 border rounded bg-white dark:bg-slate-700" aria-label="Reminder duration before due date">
                            <option value="10m">10 minutes before</option>
                            <option value="1h">1 hour before</option>
                            <option value="1d">1 day before</option>
                        </select>
                    )}
                    {mode === 'custom' && (
                        <input type="datetime-local" value={customDateTime} onChange={e => setCustomDateTime(e.target.value)} className="w-full p-2 border rounded" aria-label="Custom reminder date and time" />
                    )}
                </div>
                <div className="flex justify-between items-center mt-6 pt-4 border-t dark:border-slate-700">
                    <div>{todoWithReminder.reminderAt && <Button variant="danger" onClick={handleRemove} isLoading={isSaving}>Remove</Button>}</div>
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button onClick={handleSave} isLoading={isSaving}>Save Reminder</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};
