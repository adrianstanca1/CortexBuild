import React from 'react';
// FIX: Changed type to Task to match definitions
import { Task as Todo } from '../types';

interface ReminderControlProps {
    todo: Todo;
    onClick: () => void;
}

export const ReminderControl: React.FC<ReminderControlProps> = ({ todo, onClick }) => {
    const hasReminder = !!(todo as any).reminderAt;

    return (
        <button
            onClick={onClick}
            className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-black/10 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition-all"
            title={hasReminder ? `Reminder is set for ${new Date((todo as any).reminderAt!).toLocaleString()}` : 'Set Reminder'}
        >
            {hasReminder ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-sky-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
            )}
        </button>
    );
};