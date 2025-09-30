import React, { useEffect, useCallback } from 'react';
// FIX: Changed Todo to Task to match types.ts
import { User, Task } from '../types';
// FIX: Corrected API import
import { api } from '../services/mockApi';

const REMINDERS_FIRED_KEY = 'asagents_reminders_fired';

const getFiredReminders = (): (string|number)[] => {
    try {
        const raw = localStorage.getItem(REMINDERS_FIRED_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
};

const addFiredReminder = (todoId: string | number) => {
    const fired = getFiredReminders();
    if (!fired.includes(todoId)) {
        fired.push(todoId);
        localStorage.setItem(REMINDERS_FIRED_KEY, JSON.stringify(fired));
    }
};


export const useReminderService = (user: User | null) => {
    const checkReminders = useCallback(async () => {
        if (!user) return;
        
        // In a real app, this would be a more efficient query.
        try {
            const projects = await api.getProjectsByUser(user.id);
            if (projects.length === 0) return;

            const allTasks = await api.getTodosByProjectIds(projects.map(p => p.id));
            // FIX: Corrected property access to match Task type.
            const myTasksWithReminders = allTasks.filter(t => t.assigneeId === user.id && (t as any).reminderAt);

            const firedReminders = getFiredReminders();

            for (const task of myTasksWithReminders) {
                const reminderAt = (task as any).reminderAt;
                if (reminderAt && new Date(reminderAt) <= new Date() && !firedReminders.includes(task.id)) {
                    // Check for notification permission again in case it was changed
                    if (Notification.permission === 'granted') {
                        new Notification(`Reminder: ${(task as any).text || task.title}`, {
                            body: `This task is due soon on project: ${projects.find(p => p.id === task.projectId)?.name || 'Unknown'}.`,
                            icon: '/favicon.svg'
                        });
                        addFiredReminder(task.id);
                    }
                }
            }
        } catch (error) {
            console.error("Failed to check for reminders:", error);
        }
    }, [user]);


    useEffect(() => {
        if (!user) {
            return;
        }

        // Initial check and then set interval
        checkReminders();
        const intervalId = setInterval(checkReminders, 30 * 1000); // Check every 30 seconds

        return () => {
            clearInterval(intervalId);
        };
    }, [user, checkReminders]);
};
