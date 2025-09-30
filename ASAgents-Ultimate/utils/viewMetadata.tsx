import React from 'react';
import { View, Role, Project, ProjectStatus } from '../types';

type Tone = 'neutral' | 'info' | 'warning' | 'success';

export interface ViewMetadata {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  accentColorClass?: string;
  contextPill?: { label: string; tone?: Tone };
}

interface ViewMetadataOptions {
  selectedProject?: Project | null;
  userRole?: Role | null;
}

const iconClass = 'h-6 w-6';

const icons = {
  dashboard: (
    <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l.7 2.153a1 1 0 00.95.69h2.262c.969 0 1.371 1.24.588 1.81l-1.832 1.333a1 1 0 00-.364 1.118l.7 2.153c.3.921-.755 1.688-1.54 1.118l-1.832-1.333a1 1 0 00-1.176 0l-1.832 1.333c-.784.57-1.838-.197-1.539-1.118l.7-2.153a1 1 0 00-.364-1.118L6.45 7.58c-.783-.57-.38-1.81.588-1.81h2.262a1 1 0 00.95-.69l.8-2.153z" />
    </svg>
  ),
  tasks: (
    <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  projects: (
    <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7l9-4 9 4-9 4-9-4zm0 6l9 4 9-4" />
    </svg>
  ),
  map: (
    <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.79 3-4s-1.343-4-3-4-3 1.79-3 4 1.343 4 3 4z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c-4.418 0-8 3.134-8 7v1h16v-1c0-3.866-3.582-7-8-7z" />
    </svg>
  ),
  time: (
    <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  documents: (
    <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h10M7 11h10M7 15h6" />
    </svg>
  ),
  safety: (
    <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M4.293 6.293a1 1 0 011.414 0L12 12l6.293-5.707a1 1 0 011.414 1.414L12 15l-7.707-7.293a1 1 0 010-1.414z" />
    </svg>
  ),
  financials: (
    <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h11M9 21V3m7 18a4 4 0 100-8 4 4 0 000 8z" />
    </svg>
  ),
  team: (
    <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656-.126-1.283-.356-1.857M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  chat: (
    <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 10c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 18l1.395-3.72C3.512 13.042 3 11.574 3 10c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  equipment: (
    <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6h4m-2-2v4m0 4v6m8-4h-5l-2 4H9l-2-4H2" />
    </svg>
  ),
  templates: (
    <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m-8 4h6m-6 4h4M4 5h16v14H4z" />
    </svg>
  ),
  tools: (
    <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121a3 3 0 004.242 4.242l1.415-1.415a3 3 0 00-4.242-4.242l-1.415 1.415z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.879 9.879a3 3 0 01-4.242-4.242L8.05 4.224a3 3 0 014.242 4.242l-1.414 1.414z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11l-6 6" />
    </svg>
  ),
  audit: (
    <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  settings: (
    <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l.7 2.153a1 1 0 00.95.69h2.262c.969 0 1.371 1.24.588 1.81l-1.832 1.333a1 1 0 00-.364 1.118l.7 2.153c.3.921-.755 1.688-1.54 1.118l-1.832-1.333a1 1 0 00-1.176 0l-1.832 1.333c-.784.57-1.838-.197-1.539-1.118l.7-2.153a1 1 0 00-.364-1.118L6.45 7.58c-.783-.57-.38-1.81.588-1.81h2.262a1 1 0 00.95-.69l.8-2.153z" />
    </svg>
  ),
  clients: (
    <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656-.126-1.283-.356-1.857M9 7a3 3 0 116 0 3 3 0 01-6 0z" />
    </svg>
  ),
  invoices: (
    <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2m-4 4h4m-4 4h4m-4 4h4m-8-8h.01m-.01 4h.01m-.01 4h.01" />
    </svg>
  ),
};

const projectStatusTone: Record<ProjectStatus, Tone> = {
  PLANNING: 'neutral',
  ACTIVE: 'info',
  ON_HOLD: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'warning',
};

const formatStatus = (status: string) => status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, char => char.toUpperCase());

export const getViewMetadata = (view: View, options: ViewMetadataOptions = {}): ViewMetadata => {
  const { selectedProject, userRole } = options;

  switch (view) {
    case 'my-day':
      return {
        title: 'My Day Planner',
        description: 'Your assignments, site briefings, and time clock in one place.',
        icon: icons.dashboard,
        accentColorClass: 'bg-indigo-500/10 text-indigo-600 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-200 dark:border-indigo-500/30',
      };
    case 'foreman-dashboard':
      return {
        title: 'Field Operations Dashboard',
        description: 'Coordinate crews, track safety observations, and publish site updates.',
        icon: icons.projects,
        accentColorClass: 'bg-emerald-500/10 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:border-emerald-500/30',
      };
    case 'principal-dashboard':
      return {
        title: 'Platform Administration',
        description: 'Manage enterprise tenants, usage, and compliance posture.',
        icon: icons.settings,
        accentColorClass: 'bg-rose-500/10 text-rose-600 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-200 dark:border-rose-500/30',
      };
    case 'projects':
      return {
        title: 'Project Portfolio',
        description: 'Monitor every live, planned, and completed engagement across the business.',
        icon: icons.projects,
        accentColorClass: 'bg-sky-500/10 text-sky-600 border border-sky-200 dark:bg-sky-500/10 dark:text-sky-200 dark:border-sky-500/30',
      };
    case 'project-detail':
      if (selectedProject) {
        const status = selectedProject.status;
        return {
          title: selectedProject.name,
          description: selectedProject.location?.address
            ? `${selectedProject.location.address} · Budget £${(selectedProject.budget / 1_000_000).toFixed(2)}M`
            : 'Detailed timeline, financials, and risk profile.',
          icon: icons.projects,
          accentColorClass: 'bg-sky-500/10 text-sky-600 border border-sky-200 dark:bg-sky-500/10 dark:text-sky-200 dark:border-sky-500/30',
          contextPill: {
            label: formatStatus(status),
            tone: projectStatusTone[status] ?? 'neutral',
          },
        };
      }
      return {
        title: 'Project Overview',
        description: 'Select a project to view schedule, resources, and communications.',
        icon: icons.projects,
        accentColorClass: 'bg-sky-500/10 text-sky-600 border border-sky-200 dark:bg-sky-500/10 dark:text-sky-200 dark:border-sky-500/30',
      };
    case 'all-tasks':
      return {
        title: 'Task Command Center',
        description: 'Cross-project view of assignments, bottlenecks, and completions.',
        icon: icons.tasks,
        accentColorClass: 'bg-purple-500/10 text-purple-600 border border-purple-200 dark:bg-purple-500/10 dark:text-purple-200 dark:border-purple-500/30',
      };
    case 'map':
      return {
        title: 'Geospatial Map',
        description: 'Visualise live activity, incidents, and crew distribution.',
        icon: icons.map,
        accentColorClass: 'bg-teal-500/10 text-teal-600 border border-teal-200 dark:bg-teal-500/10 dark:text-teal-200 dark:border-teal-500/30',
      };
    case 'time':
      return {
        title: 'Time Clock',
        description: 'Clock in/out and review current shift activity.',
        icon: icons.time,
        accentColorClass: 'bg-amber-500/10 text-amber-600 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/30',
      };
    case 'timesheets':
      return {
        title: 'Timesheet Approvals',
        description: 'Review labour entries, overtime requests, and approval history.',
        icon: icons.time,
        accentColorClass: 'bg-emerald-500/10 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:border-emerald-500/30',
      };
    case 'documents':
      return {
        title: 'Document Vault',
        description: 'Latest drawings, RFIs, permits, and compliance files.',
        icon: icons.documents,
        accentColorClass: 'bg-slate-500/10 text-slate-600 border border-slate-200 dark:bg-slate-500/10 dark:text-slate-200 dark:border-slate-500/30',
      };
    case 'safety':
      return {
        title: 'Safety & Compliance',
        description: 'Track incidents, toolbox talks, inspections, and corrective actions.',
        icon: icons.safety,
        accentColorClass: 'bg-red-500/10 text-red-600 border border-red-200 dark:bg-red-500/10 dark:text-red-200 dark:border-red-500/30',
      };
    case 'financials':
      return {
        title: 'Financial Performance',
        description: 'Margin tracking, budget utilisation, and cash flow outlook.',
        icon: icons.financials,
        accentColorClass: 'bg-emerald-500/10 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:border-emerald-500/30',
      };
    case 'users':
      return {
        title: 'Workforce Directory',
        description: 'Assign crews, monitor availability, and manage certifications.',
        icon: icons.team,
        accentColorClass: 'bg-indigo-500/10 text-indigo-600 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-200 dark:border-indigo-500/30',
      };
    case 'equipment':
      return {
        title: 'Equipment Control',
        description: 'Asset utilisation, maintenance schedules, and allocation.',
        icon: icons.equipment,
        accentColorClass: 'bg-orange-500/10 text-orange-600 border border-orange-200 dark:bg-orange-500/10 dark:text-orange-200 dark:border-orange-500/30',
      };
    case 'templates':
      return {
        title: 'Project Templates',
        description: 'Standardise proposals, schedules, and quality workflows.',
        icon: icons.templates,
        accentColorClass: 'bg-violet-500/10 text-violet-600 border border-violet-200 dark:bg-violet-500/10 dark:text-violet-200 dark:border-violet-500/30',
      };
    case 'tools':
      return {
        title: 'Intelligence Tools',
        description: 'AI co-pilots for estimating, risk, and portfolio planning.',
        icon: icons.tools,
        accentColorClass: 'bg-cyan-500/10 text-cyan-600 border border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-200 dark:border-cyan-500/30',
      };
    case 'audit-log':
      return {
        title: 'Audit Log',
        description: 'Immutable event trail across projects, teams, and settings.',
        icon: icons.audit,
        accentColorClass: 'bg-slate-500/10 text-slate-600 border border-slate-200 dark:bg-slate-500/10 dark:text-slate-200 dark:border-slate-500/30',
      };
    case 'settings':
      return {
        title: 'Workspace Settings',
        description: 'Preferences, automation rules, security, and integrations.',
        icon: icons.settings,
        accentColorClass: 'bg-rose-500/10 text-rose-600 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-200 dark:border-rose-500/30',
      };
    case 'chat':
      return {
        title: 'Team Chat',
        description: 'Direct messages, project channels, and AI briefings.',
        icon: icons.chat,
        accentColorClass: 'bg-indigo-500/10 text-indigo-600 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-200 dark:border-indigo-500/30',
      };
    case 'clients':
      return {
        title: 'Client Directory',
        description: 'Account health, contacts, and associated projects.',
        icon: icons.clients,
        accentColorClass: 'bg-blue-500/10 text-blue-600 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-200 dark:border-blue-500/30',
      };
    case 'invoices':
      return {
        title: 'Invoice Centre',
        description: 'Billing pipeline, retention, and payment tracking.',
        icon: icons.invoices,
        accentColorClass: 'bg-emerald-500/10 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:border-emerald-500/30',
      };
    case 'dashboard':
    default:
      const roleTitle = (() => {
        switch (userRole) {
          case Role.ADMIN:
          case Role.OWNER:
            return 'Operations Dashboard';
          case Role.PROJECT_MANAGER:
            return 'Project Leadership Hub';
          case Role.FOREMAN:
            return 'Field Operations Dashboard';
          case Role.OPERATIVE:
            return 'My Day Planner';
          case Role.PRINCIPAL_ADMIN:
            return 'Platform Overview';
          default:
            return 'Operations Dashboard';
        }
      })();
      return {
        title: roleTitle,
        description: 'Live metrics across schedule performance, workforce, and cost.',
        icon: icons.dashboard,
        accentColorClass: 'bg-primary/10 text-primary border border-primary/10',
      };
  }
};
