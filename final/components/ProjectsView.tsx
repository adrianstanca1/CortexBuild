import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

    <title>Team Members Icon</title>
    <title>Open Tasks Icon</title>
    <title>Overdue Tasks Icon</title>
// full contents of components/ProjectsView.tsx
import { User, Project, Permission, ProjectStatus } from '../types';

import {
  User,
  Project,
  Permission,
  ProjectStatus,
  ProjectPortfolioSummary,
} from '../types';
import { api } from '../services/mockApi';
import { hasPermission } from '../services/auth';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { ProjectModal } from './CreateProjectModal';
import { ViewHeader } from './layout/ViewHeader';
import { Tag } from './ui/Tag';
import { computeProjectPortfolioSummary, PROJECT_STATUS_ORDER } from '../utils/projectPortfolio';

interface ProjectsViewProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
  onSelectProject: (project: Project) => void;

}

const STATUS_BADGE_STYLES: Record<ProjectStatus, string> = {
    PLANNING: 'bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-200',
    ACTIVE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200',
    ON_HOLD: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200',
    COMPLETED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200',
    CANCELLED: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200',
};

const STATUS_FILTERS = [
    { label: 'All projects', value: 'ALL' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Planning', value: 'PLANNING' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'On hold', value: 'ON_HOLD' },
    { label: 'Cancelled', value: 'CANCELLED' },
] as const;

type StatusFilterValue = typeof STATUS_FILTERS[number]['value'];

const formatStatusLabel = (status: ProjectStatus) =>
    status
        .toLowerCase()
        .split('_')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');

const ProjectCard: React.FC<{ project: Project; onSelect: () => void; }> = ({ project, onSelect }) => {
    const actualCost = typeof project.actualCost === 'number' ? project.actualCost : project.spent ?? 0;
    const budget = typeof project.budget === 'number' ? project.budget : 0;
    const utilisationRaw = budget > 0 ? (actualCost / budget) * 100 : 0;
    const utilisation = Number.isFinite(utilisationRaw) ? Math.max(0, utilisationRaw) : 0;
    const utilisationClass = utilisation > 100 ? 'bg-red-500' : 'bg-emerald-600';
    const heroImage = project.imageUrl || project.image || `https://picsum.photos/seed/${project.id}/800/400`;
    const budgetDisplay = budget > 0 ? Math.round(budget / 1000).toLocaleString() : '0';

    return (
        <Card
            onClick={onSelect}
            className="cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all animate-card-enter"
        >
            <img src={heroImage} alt={project.name} className="w-full h-40 object-cover rounded-lg mb-4" />
            <h3 className="font-bold text-lg truncate text-foreground">{project.name}</h3>
            <p className="text-sm text-muted-foreground">{project.location?.address ?? 'Location pending'}</p>
            <div className="flex justify-between items-center mt-4 text-sm">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE_STYLES[project.status]}`}>
                    {formatStatusLabel(project.status)}
                </span>
                <span className="text-muted-foreground">Budget: £{budgetDisplay}k</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 mt-3">
                <div
                    className={`${utilisationClass}`}
                    style={{ width: `${Math.min(100, Math.round(utilisation))}%`, height: '100%', borderRadius: 'inherit' }}
                    aria-hidden
                ></div>

            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-xs text-white bg-slate-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                {health.summary}
            </div>
        </div>
    );
};

interface ProjectSummaryCardProps {
    project: Project;
    taskCount: number;
    memberCount: number;
    overdueTaskCount: number;
    upcomingMilestone: { name: string; date: Date } | null;
    health: ProjectHealth | null;
    onSelect: () => void;
}

const ProjectSummaryCard: React.FC<ProjectSummaryCardProps> = ({ project, taskCount, memberCount, overdueTaskCount, upcomingMilestone, health, onSelect }) => {
    const progress = project.budget > 0 ? (project.actualCost / project.budget) * 100 : 0;

    return (
        <Card onClick={onSelect} className="cursor-pointer hover:shadow-lg hover:border-sky-500/50 transition-all duration-300 flex flex-col p-0 overflow-hidden animate-card-enter">
            <img src={project.imageUrl} alt={project.name} className="w-full h-40 object-cover" />
            <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="font-bold text-lg text-slate-800 flex-grow pr-2">{project.name}</h3>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <ProjectStatusBadge status={project.status} />
                        {health && <ProjectHealthIndicator health={health} />}
                    </div>
                </div>
                <p className="text-sm text-slate-500 mb-4">{project.location.address}</p>

                {/* Key Metrics List */}
                <div className="space-y-3 my-2">
                    <div className="flex items-center text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        <span className="text-slate-600">Team Members</span>
                        <span className="ml-auto font-semibold text-slate-800 bg-slate-100 rounded-full px-2.5 py-0.5">{memberCount}</span>
                    </div>
                     <div className="flex items-center text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        <span className="text-slate-600">Open Tasks</span>
                        <span className="ml-auto font-semibold text-slate-800 bg-slate-100 rounded-full px-2.5 py-0.5">{taskCount}</span>
                    </div>
                    <div className="flex items-center text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="text-slate-600">Overdue Tasks</span>
                        <span className={`ml-auto font-bold text-lg ${overdueTaskCount > 0 ? 'text-red-600' : 'text-slate-800'}`}>
                            {overdueTaskCount}
                        </span>
                    </div>
                </div>

                {/* Upcoming Milestone */}
                <div className="mt-4 flex-grow">
                    {upcomingMilestone ? (
                        <div className="text-sm bg-slate-50 p-3 rounded-md border">
                            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Next Milestone</p>
                            <div className="flex justify-between items-center mt-1">
                                <p className="font-semibold text-slate-700 truncate pr-2">{upcomingMilestone.name}</p>
                                <p className="text-xs text-slate-600 font-medium flex-shrink-0">{new Date(upcomingMilestone.date).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-sm bg-slate-50 p-3 rounded-md border text-center text-slate-500">
                            <p>No upcoming tasks with due dates.</p>
                        </div>
                    )}
                </div>

                {/* Budget */}
                <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between mb-1 text-xs font-medium text-slate-600">
                        <span>Budget Used</span>
                        <span>{progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className={`project-budget-bar ${progress > 100 ? 'bg-red-500' : 'bg-sky-500'}`} style={{ '--bar-width': `${Math.min(progress, 100)}%` } as React.CSSProperties}></div>
import './ui/projectBudgetBar.css';
                    </div>
                </div>
            </div>
        </Card>
    );
};

const statusAccent: Record<ProjectStatus, { bg: string; text: string }> = {
  PLANNING: { bg: 'bg-amber-500/10', text: 'text-amber-700 dark:text-amber-300' },
  ACTIVE: { bg: 'bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-300' },
  ON_HOLD: { bg: 'bg-amber-500/10', text: 'text-amber-700 dark:text-amber-300' },
  COMPLETED: { bg: 'bg-primary/10', text: 'text-primary dark:text-primary-200' },
  CANCELLED: { bg: 'bg-slate-500/10', text: 'text-slate-500 dark:text-slate-300' },
const statusBarColor: Record<ProjectStatus, string> = {
  PLANNING: 'bg-sky-500',
  ACTIVE: 'bg-emerald-500',
  ON_HOLD: 'bg-amber-500',
  COMPLETED: 'bg-primary',
  CANCELLED: 'bg-rose-500',
const statusTagColor: Record<ProjectStatus, 'green' | 'blue' | 'red' | 'gray' | 'yellow'> = {
  PLANNING: 'blue',
  ACTIVE: 'green',
  ON_HOLD: 'yellow',
  COMPLETED: 'green',
  CANCELLED: 'red',
type SortKey = 'startDate' | 'endDate' | 'name' | 'budget' | 'progress';

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: 'startDate', label: 'Start date' },
  { value: 'endDate', label: 'End date' },
  { value: 'name', label: 'Name' },
  { value: 'budget', label: 'Budget' },
  { value: 'progress', label: 'Progress' },
];

const PROJECT_FILTERS: Array<{ label: string; value: 'ALL' | ProjectStatus }> = [
  { label: 'All', value: 'ALL' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Planning', value: 'PLANNING' },
  { label: 'On Hold', value: 'ON_HOLD' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    notation: 'compact',
    compactDisplay: 'short',
  }).format(value || 0);

const toTitleCase = (value: string): string => value.replace(/\b\w/g, (char) => char.toUpperCase());

const formatStatusLabel = (status: ProjectStatus): string =>
  toTitleCase(status.replace(/_/g, ' ').toLowerCase());

const formatDeadlineLabel = (daysRemaining: number, isOverdue: boolean): string => {
  if (daysRemaining === 0) {
    return 'Due today';
  }

  const absolute = Math.abs(daysRemaining);
  const suffix = absolute === 1 ? 'day' : 'days';

  return isOverdue ? `${absolute} ${suffix} overdue` : `In ${absolute} ${suffix}`;
const ProjectCard: React.FC<{ project: Project; onSelect: () => void }> = ({ project, onSelect }) => {
  const budgetUtilization = project.budget > 0 ? (project.actualCost / project.budget) * 100 : 0;
  const statusStyles = statusAccent[project.status] ?? statusAccent.PLANNING;
  const overBudget = budgetUtilization > 100;

  return (
    <Card onClick={onSelect} className="group cursor-pointer space-y-4 transition-all hover:-translate-y-1 hover:shadow-lg animate-card-enter">
      <div className="relative h-40 overflow-hidden rounded-lg bg-muted">
        {project.imageUrl ? (
          <img
            src={project.imageUrl}
            alt={project.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
            No cover image
          </div>
        )}
        <div className="absolute left-3 top-3 flex items-center gap-2 text-xs font-semibold">
          <Tag label={project.projectType} color="blue" />
          <Tag label={project.workClassification} color="gray" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-foreground line-clamp-2">{project.name}</h3>
            <p className="text-xs text-muted-foreground">{project.location.address}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles.bg} ${statusStyles.text}`}>
            {formatStatusLabel(project.status)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Budget {formatCurrency(project.budget)}</span>
          <span className={overBudget ? 'font-semibold text-rose-500 dark:text-rose-300' : 'text-emerald-600 dark:text-emerald-300'}>
            {overBudget ? `+${Math.round(budgetUtilization - 100)}%` : `${Math.round(budgetUtilization)}% used`}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`${overBudget ? 'bg-rose-500' : 'bg-emerald-500'} h-full rounded-full transition-all`}
            style={{ width: `${Math.min(100, Math.max(0, budgetUtilization))}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Start {new Date(project.startDate).toLocaleDateString()}</span>
          <span>Due {new Date(project.endDate).toLocaleDateString()}</span>
        </div>
      </div>
    </Card>
  );
export const ProjectsView: React.FC<ProjectsViewProps> = ({ user, addToast, onSelectProject }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<StatusFilterValue>('ALL');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const canCreate = hasPermission(user, Permission.CREATE_PROJECT);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            if (!user.companyId) return;
            let projectsPromise: Promise<Project[]>;
            if (hasPermission(user, Permission.VIEW_ALL_PROJECTS)) {
                projectsPromise = api.getProjectsByCompany(user.companyId);
            } else {
                projectsPromise = api.getProjectsByUser(user.id);
            }
            const fetchedProjects = await projectsPromise;
            setProjects(fetchedProjects);
        } catch (error) {
            addToast("Failed to load projects.", "error");
        } finally {
            setLoading(false);
        }
    }, [user, addToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const filteredProjects = useMemo(() => {
        if (filter === 'ALL') return projects;
        return projects.filter(p => p.status === filter);
    }, [projects, filter]);

    const handleSuccess = (newProject: Project) => {
        setProjects(prev => [...prev, newProject]);
        onSelectProject(newProject);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<ProjectPortfolioSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | ProjectStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('startDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const canCreate = hasPermission(user, Permission.CREATE_PROJECT);
  const hasCompanyWideAccess = useMemo(
    () => hasPermission(user, Permission.VIEW_ALL_PROJECTS),
    [user]
  );

  const fetchProjects = useCallback(async () => {
    if (!user.companyId) {
      setProjects([]);
      setSummary(null);
      setSummaryError(null);
      setLoading(false);
      setSummaryLoading(false);
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current?.abort();
    abortControllerRef.current = controller;

    setLoading(true);
    setSummaryLoading(true);
    setSummary(null);
    setSummaryError(null);

    try {
      const projectsData = hasCompanyWideAccess
        ? await api.getProjectsByCompany(user.companyId, { signal: controller.signal })
        : await api.getProjectsByUser(user.id, { signal: controller.signal });

      if (controller.signal.aborted) {
        return;
      }

      setProjects(projectsData);

      if (!projectsData.length) {
        return;
      }

      try {
        const summaryData = await api.getProjectPortfolioSummary(user.companyId, {
          signal: controller.signal,
          projectIds: hasCompanyWideAccess ? undefined : projectsData.map((project) => project.id),
        });

        if (!controller.signal.aborted) {
          setSummary(summaryData);
        }
      } catch (summaryErr) {
        if (!controller.signal.aborted) {
          console.error('Failed to load project portfolio summary', summaryErr);
          setSummary(null);
          setSummaryError('Portfolio insights are currently unavailable.');
        }
      }
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }

      console.error('Failed to load projects', error);
      addToast('Failed to load projects.', 'error');
      setProjects([]);
      setSummary(null);
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        setSummaryLoading(false);
      }
    }
  }, [user, addToast, hasCompanyWideAccess]);

  useEffect(() => {
    fetchProjects();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [fetchProjects]);

  const filteredProjects = useMemo(() => {
    const baseProjects = filter === 'ALL' ? projects : projects.filter((project) => project.status === filter);


    const query = searchQuery.trim().toLowerCase();

    const searchedProjects = query
      ? baseProjects.filter((project) => {
          const fields = [
            project.name,
            project.location?.address,
            project.projectType,
            project.workClassification,
          ].filter(Boolean) as string[];

          return fields.some((field) => field.toLowerCase().includes(query));
        })
      : baseProjects;

    const direction = sortDirection === 'asc' ? 1 : -1;

    const sortedProjects = [...searchedProjects].sort((a, b) => {
      let comparison = 0;

      switch (sortKey) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'startDate':
          comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
          break;
        case 'endDate':
          comparison = new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
          break;
        case 'budget':
          comparison = (a.budget ?? 0) - (b.budget ?? 0);
          break;
        case 'progress':
          comparison = (a.progress ?? 0) - (b.progress ?? 0);
          break;
        default:
          comparison = 0;
      }

      if (Number.isNaN(comparison)) {
        comparison = 0;
      }

      if (comparison === 0 && sortKey !== 'name') {
        comparison = a.name.localeCompare(b.name);
      }

      return comparison * direction;
    });

    return sortedProjects;
  }, [projects, filter, searchQuery, sortDirection, sortKey]);

  const hasActiveFilters =
    filter !== 'ALL' || searchQuery.trim() !== '' || sortKey !== 'startDate' || sortDirection !== 'asc';

  const handleResetFilters = useCallback(() => {
    setFilter('ALL');
    setSearchQuery('');
    setSortKey('startDate');
    setSortDirection('asc');
  }, []);

  const fallbackSummary = useMemo(() => computeProjectPortfolioSummary(projects), [projects]);
  const summaryForDisplay = summary ?? fallbackSummary;
  const activeShare = summaryForDisplay.totalProjects
    ? Math.round((summaryForDisplay.activeProjects / summaryForDisplay.totalProjects) * 100)
    : 0;

  const statusBreakdownEntries = useMemo(
    () =>
      PROJECT_STATUS_ORDER.map((status) => ({
        status,
        count: summaryForDisplay.statusBreakdown[status] ?? 0,
      })),
    [summaryForDisplay]
  );

  const portfolioSummary = useMemo(() => {
    if (projects.length === 0) {
      return {
        total: 0,
        active: 0,
        atRisk: 0,
        pipelineValue: 0,
      };
    }

    const active = projects.filter(p => p.status === 'ACTIVE').length;
    const atRisk = projects.filter(p => p.actualCost > p.budget).length;
    const pipelineValue = projects.reduce((acc, project) => acc + project.budget, 0);

    return {
      total: projects.length,
      active,
      atRisk,
      pipelineValue,
    };
  }, [projects]);

  const upcomingDeadlines = summaryForDisplay.upcomingDeadlines;

  const handleSuccess = useCallback(
    (newProject: Project) => {
      onSelectProject(newProject);
      fetchProjects();
    },
    [fetchProjects, onSelectProject]
  );

  return (
    <div className="space-y-6">
      {isCreateModalOpen && (
        <ProjectModal
          user={user}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleSuccess}
          addToast={addToast}
        />
      )}


    if (loading) return <Card><p>Loading projects...</p></Card>;

    return (
        <div className="space-y-6">
            {isCreateModalOpen && (
                <ProjectModal 
                    user={user} 
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={handleSuccess}
                    addToast={addToast}
                />
            )}
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-slate-800">Projects</h2>
                {canCreate && <Button onClick={() => setIsCreateModalOpen(true)}>Create Project</Button>}
            </div>
            
            <div className="flex flex-wrap gap-2">
                {STATUS_FILTERS.map(option => (
                    <button
                        key={option.value}
                        onClick={() => setFilter(option.value)}
                        className={`px-3 py-1 text-sm rounded-full border transition ${
                            filter === option.value
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-card hover:bg-muted border-border text-muted-foreground'
                        }`}
                    >
                        {option.label}
                    </button>
                ))}

            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h2 className="text-3xl font-bold text-slate-800">{isPM ? "Project Manager Dashboard" : "Projects"}</h2>
                {canCreate && (
                    <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <title>Create Project Icon</title>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Create Project
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProjects.length === 0 && (
                    <Card className="col-span-full text-center py-16">
                        <p className="text-muted-foreground">No projects match this filter yet.</p>
                    </Card>
                )}
                {filteredProjects.map(project => (
                    <ProjectCard key={project.id} project={project} onSelect={() => onSelectProject(project)} />
                ))}
            </div>

      <ViewHeader
        view="projects"
        actions={
          canCreate ? (
            <Button onClick={() => setIsCreateModalOpen(true)}>Create Project</Button>
          ) : undefined
        }
        meta={[
          {
            label: 'Portfolio value',
            value: formatCurrency(summaryForDisplay.pipelineValue),
            helper: 'Budgeted across tracked projects',
          },
          {
            label: 'Active projects',
            value: `${summaryForDisplay.activeProjects}`,
            helper: summaryForDisplay.totalProjects
              ? `${activeShare}% of portfolio`
              : 'No projects yet',
            indicator: summaryForDisplay.activeProjects > 0 ? 'positive' : 'neutral',
          },
          {
            label: 'At risk',
            value: `${summaryForDisplay.atRiskProjects}`,
            helper: summaryForDisplay.overdueProjects
              ? `${summaryForDisplay.overdueProjects} overdue deliverable${
                  summaryForDisplay.overdueProjects === 1 ? '' : 's'
                }`
              : 'Budget and schedule on track',
            indicator:
              summaryForDisplay.atRiskProjects > 0 || summaryForDisplay.overdueProjects > 0
                ? 'negative'
                : 'positive',
          },
        ]}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Portfolio health</h2>
          {summaryLoading && !projects.length ? (
            <p className="mt-4 text-sm text-muted-foreground">Loading insights...</p>
          ) : summaryForDisplay.totalProjects === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Create your first project to see portfolio insights.
            </p>
          ) : (
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Tracked budget</dt>
                <dd className="font-semibold text-foreground">{formatCurrency(summaryForDisplay.pipelineValue)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Actual cost to date</dt>
                <dd className="font-semibold text-foreground">{formatCurrency(summaryForDisplay.totalActualCost)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Budget variance</dt>
                <dd
                  className={`font-semibold ${
                    summaryForDisplay.budgetVariance < 0
                      ? 'text-rose-500 dark:text-rose-300'
                      : 'text-emerald-600 dark:text-emerald-300'
                  }`}
                >
                  {formatCurrency(summaryForDisplay.budgetVariance)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Average progress</dt>
                <dd className="font-semibold text-foreground">{Math.round(summaryForDisplay.averageProgress)}%</dd>
              </div>
            </dl>
          )}
          {summaryError ? (
            <p className="mt-4 text-xs text-destructive">{summaryError}</p>
          ) : null}
          {!hasCompanyWideAccess && summaryForDisplay.totalProjects > 0 ? (
            <p className="mt-4 text-xs text-muted-foreground">
              Insights reflect only the projects assigned to you.
            </p>
          ) : null}
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Status distribution</h2>
          {summaryForDisplay.totalProjects === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Once projects are underway, their status mix will appear here.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {statusBreakdownEntries.map(({ status, count }) => {
                const share = summaryForDisplay.totalProjects
                  ? Math.round((count / summaryForDisplay.totalProjects) * 100)
                  : 0;

                return (
                  <li key={status} className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide">
                      <span className={statusAccent[status].text}>{formatStatusLabel(status)}</span>
                      <span className="text-muted-foreground">{count}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`${statusBarColor[status]} h-full rounded-full transition-all`}
                        style={{ width: `${share}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Upcoming deadlines</h2>
          {summaryLoading && !upcomingDeadlines.length ? (
            <p className="mt-4 text-sm text-muted-foreground">Checking schedules...</p>
          ) : upcomingDeadlines.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No upcoming deadlines detected for your tracked projects.
            </p>
          ) : (
            <ul className="mt-4 space-y-4">
              {upcomingDeadlines.map((deadline) => {
                const dueDate = new Date(deadline.endDate);
                const formattedDate = dueDate.toLocaleDateString();

                return (
                  <li key={deadline.id} className="rounded-lg border border-border/60 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{deadline.name}</p>
                        <p
                          className={`text-xs ${
                            deadline.isOverdue ? 'text-rose-500 dark:text-rose-300' : 'text-muted-foreground'
                          }`}
                        >
                          {formatDeadlineLabel(deadline.daysRemaining, deadline.isOverdue)} • {formattedDate}
                        </p>
                      </div>
                      <Tag
                        label={formatStatusLabel(deadline.status)}
                        color={statusTagColor[deadline.status]}
                        statusIndicator={deadline.isOverdue ? 'red' : 'green'}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </section>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by name, location, or type..."
            className="w-full rounded-md border border-border bg-background py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="project-sort" className="text-sm font-medium text-muted-foreground">
            Sort by
          </label>
          <select
            id="project-sort"
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value as SortKey)}
            className="rounded-md border border-border bg-background py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label={`Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className={`h-4 w-4 transition-transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7l4-4 4 4M8 17l4 4 4-4" />
            </svg>
          </button>
          <Button type="button" variant="ghost" size="sm" onClick={handleResetFilters} disabled={!hasActiveFilters}>
            Reset
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {PROJECT_FILTERS.map((filterOption) => (
          <button
            key={filterOption.value}
            onClick={() => setFilter(filterOption.value)}
            className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
              filter === filterOption.value
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
            aria-pressed={filter === filterOption.value}
          >
            {filterOption.label}
          </button>
        ))}
      </div>

      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} onSelect={() => onSelectProject(project)} />
          ))}
        </div>
      ) : loading ? (
        <Card className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          Loading projects...
        </Card>
      ) : (
        <Card className="flex flex-col items-center justify-center gap-3 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            {projects.length === 0
              ? 'No projects have been created yet. Create your first project to get started.'
              : 'No projects match your current filters.'}
          </p>
          {projects.length > 0 && (
            <Button type="button" variant="secondary" size="sm" onClick={handleResetFilters}>
              Clear filters
            </Button>
          )}
        </Card>
      )}

      {projects.length > 0 && !loading ? (
        <p className="text-xs text-muted-foreground">
          {filteredProjects.length === projects.length
            ? `Showing all ${projects.length} project${projects.length === 1 ? '' : 's'}.`
            : `Showing ${filteredProjects.length} of ${projects.length} projects.`}
        </p>
      ) : null}
    </div>
  );
// export { ProjectsView };
