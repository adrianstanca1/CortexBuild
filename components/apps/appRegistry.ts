/**
 * App Registry - Central registry for all mini applications
 */

import { MiniApp } from './AppContainer';
import TodoListApp from './mini-apps/TodoListApp';
import ExpenseTrackerApp from './mini-apps/ExpenseTrackerApp';
import PomodoroTimerApp from './mini-apps/PomodoroTimerApp';
import NotesApp from './mini-apps/NotesApp';
import HabitTrackerApp from './mini-apps/HabitTrackerApp';

export const APP_REGISTRY: MiniApp[] = [
    {
        id: 'todo-list',
        name: 'Todo List',
        description: 'Simple and elegant task management app to organize your daily tasks',
        icon: '📝',
        version: '1.0.0',
        author: 'CortexBuild',
        category: 'productivity',
        component: TodoListApp,
        installed: true, // Pre-installed
        free: true
    },
    {
        id: 'expense-tracker',
        name: 'Expense Tracker',
        description: 'Track your income and expenses with beautiful charts and insights',
        icon: '💰',
        version: '1.0.0',
        author: 'CortexBuild',
        category: 'finance',
        component: ExpenseTrackerApp,
        installed: true, // Pre-installed
        free: true
    },
    {
        id: 'pomodoro-timer',
        name: 'Pomodoro Timer',
        description: 'Boost your productivity with the Pomodoro Technique timer',
        icon: '⏱️',
        version: '1.0.0',
        author: 'CortexBuild',
        category: 'productivity',
        component: PomodoroTimerApp,
        installed: false,
        free: true
    },
    {
        id: 'notes-app',
        name: 'Notes',
        description: 'Quick and simple note-taking app for all your ideas',
        icon: '📓',
        version: '1.0.0',
        author: 'CortexBuild',
        category: 'productivity',
        component: NotesApp,
        installed: false,
        free: true
    },
    {
        id: 'habit-tracker',
        name: 'Habit Tracker',
        description: 'Build better habits and track your daily progress',
        icon: '🎯',
        version: '1.0.0',
        author: 'CortexBuild',
        category: 'health',
        component: HabitTrackerApp,
        installed: false,
        free: true
    }
];

// Helper functions
export const getInstalledApps = (): MiniApp[] => {
    return APP_REGISTRY.filter(app => app.installed);
};

export const getAppById = (id: string): MiniApp | undefined => {
    return APP_REGISTRY.find(app => app.id === id);
};

export const installApp = (id: string): boolean => {
    const app = APP_REGISTRY.find(a => a.id === id);
    if (app) {
        app.installed = true;
        return true;
    }
    return false;
};

export const uninstallApp = (id: string): boolean => {
    const app = APP_REGISTRY.find(a => a.id === id);
    if (app) {
        app.installed = false;
        return true;
    }
    return false;
};

