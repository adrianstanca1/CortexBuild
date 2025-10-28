import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { User, Project, Permission, ProjectStatus } from '../types';
import { api } from '../services/mockApi';
import { hasPermission } from '../services/auth';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { ProjectModal } from './CreateProjectModal';
import { ViewHeader } from './layout/ViewHeader';
import { Tag } from './ui/Tag';

interface ProjectsViewProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
  onSelectProject: (project: Project) => void;
}

const statusAccent: Record<ProjectStatus, { bg: string; text: string }> = {
  PLANNING: { bg: 'bg-amber-500/10', text: 'text-amber-700 dark:text-amber-300' },
  ACTIVE: { bg: 'bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-300' },
  ON_HOLD: { bg: 'bg-amber-500/10', text: 'text-amber-700 dark:text-amber-300' },
  COMPLETED: { bg: 'bg-primary/10', text: 'text-primary dark:text-primary-200' },
  CANCELLED: { bg: 'bg-slate-500/10', text: 'text-slate-500 dark:text-slate-300' },
};

type SortKey = 'startDate' | 'endDate' | 'name' | 'budget' | 'progress';

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: 'startDate', label: 'Start date' },
  { value: 'endDate', label: 'End date' },
  { value: 'name', label: 'Name' },
  { value: 'budget', label: 'Budget' },
  { value: 'progress', label: 'Progress' },
];

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    notation: 'compact',
    compactDisplay: 'short',
  }).format(value || 0);

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
            {project.status.replace(/_/g, ' ')}
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
};

const PROJECT_FILTERS: Array<{ label: string; value: 'ALL' | ProjectStatus }> = [
  { label: 'All', value: 'ALL' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Planning', value: 'PLANNING' },
  { label: 'On Hold', value: 'ON_HOLD' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

export const ProjectsView: React.FC<ProjectsViewProps> = ({ user, addToast, onSelectProject }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | ProjectStatus>('ALL');

  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('startDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
 main
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const canCreate = hasPermission(user, Permission.CREATE_PROJECT);

  const fetchData = useCallback(async () => {
    const controller = new AbortController();
    abortControllerRef.current?.abort();
    abortControllerRef.current = controller;

    setLoading(true);
    try {
      if (!user.companyId) return;
      let projectsPromise: Promise<Project[]>;
      if (hasPermission(user, Permission.VIEW_ALL_PROJECTS)) {
        projectsPromise = api.getProjectsByCompany(user.companyId, { signal: controller.signal });
      } else {
        projectsPromise = api.getProjectsByUser(user.id, { signal: controller.signal });
      }
      const fetchedProjects = await projectsPromise;
      if (controller.signal.aborted) return;
      setProjects(fetchedProjects);
    } catch (error) {
      if (controller.signal.aborted) return;
      addToast('Failed to load projects.', 'error');
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

  const filteredProjects = useMemo(() => {
    if (filter === 'ALL') return projects;
    return projects.filter(p => p.status === filter);
  }, [projects, filter]);

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
  }, [fetchData]);

  const hasActiveFilters =
    filter !== 'ALL' || searchQuery.trim() !== '' || sortKey !== 'startDate' || sortDirection !== 'asc';

  const handleResetFilters = () => {
    setFilter('ALL');
    setSearchQuery('');
    setSortKey('startDate');
    setSortDirection('asc');
  };

  const handleSuccess = (newProject: Project) => {
    setProjects(prev => [...prev, newProject]);
    onSelectProject(newProject);
  };

  if (loading) return <Card><p>Loading projects...</p></Card>;

  const activeShare = portfolioSummary.total > 0 ? Math.round((portfolioSummary.active / portfolioSummary.total) * 100) : 0;

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
      <ViewHeader
        view="projects"
        actions={canCreate ? <Button onClick={() => setIsCreateModalOpen(true)}>Create Project</Button> : undefined}
        meta={[
          {
            label: 'Portfolio value',
            value: formatCurrency(portfolioSummary.pipelineValue),
            helper: 'Budgeted across all projects',
          },
          {
            label: 'Active projects',
            value: `${portfolioSummary.active}`,
            helper: portfolioSummary.total > 0 ? `${activeShare}% of portfolio` : 'No projects yet',
            indicator: portfolioSummary.active > 0 ? 'positive' : 'neutral',
          },
          {
            label: 'Over budget',
            value: `${portfolioSummary.atRisk}`,
            helper: portfolioSummary.atRisk > 0 ? 'Requires commercial review' : 'No overruns detected',
            indicator: portfolioSummary.atRisk > 0 ? 'negative' : 'positive',
          },
        ]}
      />


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
            onChange={event => setSearchQuery(event.target.value)}
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
            onChange={event => setSortKey(event.target.value as SortKey)}
            className="rounded-md border border-border bg-background py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {SORT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))}
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
        {PROJECT_FILTERS.map(filterOption => (
          <button
            key={filterOption.value}
            onClick={() => setFilter(filterOption.value)}
            className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
              filter === filterOption.value
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {filterOption.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProjects.map(project => (
          <ProjectCard key={project.id} project={project} onSelect={() => onSelectProject(project)} />
        ))}
      </div>

      {projects.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {filteredProjects.length === projects.length
            ? `Showing all ${projects.length} project${projects.length === 1 ? '' : 's'}.`
            : `Showing ${filteredProjects.length} of ${projects.length} projects.`}
        </p>
      )}

      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProjects.map(project => (
            <ProjectCard key={project.id} project={project} onSelect={() => onSelectProject(project)} />
          ))}
        </div>
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
 
    </div>
  );
};
