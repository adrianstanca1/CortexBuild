/**
 * App Registry - Central registry for all mini applications
 */

import { MiniApp } from './AppContainer';
import TodoListApp from './mini-apps/TodoListApp';
import ExpenseTrackerApp from './mini-apps/ExpenseTrackerApp';
import PomodoroTimerApp from './mini-apps/PomodoroTimerApp';
import NotesApp from './mini-apps/NotesApp';
import HabitTrackerApp from './mini-apps/HabitTrackerApp';
import MobileAppBuilder from './mobile-builder/MobileAppBuilder';

// Construction Industry Apps
import DailySiteInspector from './construction/DailySiteInspector';
import SmartProcurementAssistant from './construction/SmartProcurementAssistant';
import SafetyIncidentReporter from './construction/SafetyIncidentReporter';
import CrewTimeTracker from './construction/CrewTimeTracker';
import QualityControlChecklist from './construction/QualityControlChecklist';

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
    },
    {
        id: 'mobile-app-builder',
        name: 'Mobile App Builder',
        description: 'Create custom mobile applications with flexible database options - Free Built-in, Company DB, or Custom',
        icon: '📱',
        version: '1.0.0',
        author: 'CortexBuild',
        category: 'utilities',
        component: MobileAppBuilder,
        installed: true, // Pre-installed as core tool
        free: true
    },

    // Construction Industry Apps - FREE
    {
        id: 'daily-site-inspector',
        name: 'Daily Site Inspector',
        description: 'Photo documentation, site inspection checklists, weather tracking, and automated PDF reports for construction sites',
        icon: '📸',
        version: '1.0.0',
        author: 'CortexBuild',
        category: 'construction',
        component: DailySiteInspector,
        installed: true, // Pre-installed for demo
        free: true
    },
    {
        id: 'smart-procurement',
        name: 'Smart Procurement Assistant',
        description: 'Material ordering, vendor price comparison, inventory monitoring, and automated purchase order generation',
        icon: '📦',
        version: '1.0.0',
        author: 'CortexBuild',
        category: 'construction',
        component: SmartProcurementAssistant,
        installed: true, // Pre-installed for demo
        free: true
    },
    {
        id: 'safety-incident-reporter',
        name: 'Safety Incident Reporter',
        description: 'Quick incident logging, photo/video evidence, OSHA compliance tracking, and real-time safety notifications',
        icon: '⚠️',
        version: '1.0.0',
        author: 'CortexBuild',
        category: 'construction',
        component: SafetyIncidentReporter,
        installed: true, // Pre-installed for demo
        free: true
    },
    {
        id: 'crew-time-tracker',
        name: 'Crew Time Tracker',
        description: 'GPS-verified clock in/out, labor hours calculation, overtime alerts, and payroll integration for construction crews',
        icon: '👷',
        version: '1.0.0',
        author: 'CortexBuild',
        category: 'construction',
        component: CrewTimeTracker,
        installed: true, // Pre-installed for demo
        free: true
    },
    {
        id: 'quality-control-checklist',
        name: 'Quality Control Checklist',
        description: 'Customizable inspection forms, pass/fail criteria, defect tracking, and compliance reporting with digital signatures',
        icon: '✅',
        version: '1.0.0',
        author: 'CortexBuild',
        category: 'construction',
        component: QualityControlChecklist,
        installed: true, // Pre-installed for demo
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

