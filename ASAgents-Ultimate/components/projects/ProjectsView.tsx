// FIXME: API signature mismatches - needs review
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  User,
  Project,
  Permission,
  ProjectStatus,
  ProjectPortfolioSummary,
} from '../../types';
import { api } from '../../services/mockApi';
import { hasPermission } from '../../services/auth';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import ProjectModal from '../project/CreateProjectModal';
import { ViewHeader } from '../layout/ViewHeader';
import { Tag } from '../ui/Tag';
import { computeProjectPortfolioSummary, PROJECT_STATUS_ORDER } from '../../utils/projectPortfolio';

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

const formatStatusLabel = (status: ProjectStatus): string => {
  switch (status) {
    case 'PLANNING': return 'Planning';
    case 'ACTIVE': return 'Active';
    case 'ON_HOLD': return 'On Hold';
    case 'COMPLETED': return 'Completed';
    case 'CANCELLED': return 'Cancelled';
    default: return status;
  }
};

interface ProjectCardProps {
  project: Project;
  onSelect: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect }) => {
  const actualCost = typeof project.actualCost === 'number' ? project.actualCost : 0;
  const budget = typeof project.budget === 'number' ? project.budget : 0;
  const utilisationRaw = budget > 0 ? (actualCost / budget) * 100 : 0;
  const utilisation = Number.isFinite(utilisationRaw) ? Math.max(0, utilisationRaw) : 0;
  const utilisationClass = utilisation > 100 ? 'bg-red-500' : 'bg-emerald-600';
  const heroImage = project.imageUrl || `https://picsum.photos/seed/${project.id}/800/400`;
  const budgetDisplay = budget > 0 ? Math.round(budget / 1000).toLocaleString() : '0';

  return (
    <Card
      onClick={onSelect}
      className="cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all animate-card-enter"
    >
      <img src={heroImage} alt={project.name} className="w-full h-40 object-cover rounded-lg mb-4" />
      <h3 className="font-bold text-lg truncate text-foreground">{project.name}</h3>
      <p className="text-sm text-muted-foreground">{project.locationAddress ?? 'Location pending'}</p>
      <div className="flex justify-between items-center mt-4 text-sm">
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE_STYLES[project.status]}`}>
          {formatStatusLabel(project.status)}
        </span>
        <span className="text-muted-foreground">Budget: £{budgetDisplay}k</span>
      </div>
      <div className="w-full bg-muted rounded-full h-1.5 mt-3">
        <div
          className={`${utilisationClass} h-full rounded-full`}
          style={{ width: `${Math.min(100, Math.round(utilisation))}%` }}
          aria-hidden
        />
      </div>
    </Card>
  );
};

export const ProjectsView: React.FC<ProjectsViewProps> = ({ user, addToast, onSelectProject }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [portfolioSummary, setPortfolioSummary] = useState<ProjectPortfolioSummary | null>(null);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getProjects();
      setProjects(data);
      setPortfolioSummary(computeProjectPortfolioSummary(data));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load projects';
      setError(message);
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesStatus = statusFilter === 'ALL' || project.status === statusFilter;
      const matchesSearch = !searchQuery || 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.locationAddress?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [projects, statusFilter, searchQuery]);

  const handleCreateProject = async (projectData: Partial<Project>) => {
    try {
      await api.createProject(projectData, null, user.id);
      addToast('Project created successfully', 'success');
      setShowCreateModal(false);
      loadProjects();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create project';
      addToast(message, 'error');
    }
  };

  const canCreateProject = hasPermission(user, Permission.CREATE_PROJECT);

  if (loading) {
    return (
      <div className="space-y-6">
        <ViewHeader title="Projects" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="w-full h-40 bg-muted rounded-lg mb-4" />
              <div className="h-6 bg-muted rounded mb-2" />
              <div className="h-4 bg-muted rounded mb-4" />
              <div className="flex justify-between">
                <div className="h-6 w-16 bg-muted rounded" />
                <div className="h-4 w-20 bg-muted rounded" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <ViewHeader title="Projects" />
        <Card className="p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadProjects}>Try Again</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ViewHeader title="Projects">
        {canCreateProject && (
          <Button onClick={() => setShowCreateModal(true)}>
            Create Project
          </Button>
        )}
      </ViewHeader>

      {portfolioSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Total Projects</h3>
            <p className="text-2xl font-bold text-foreground">{portfolioSummary.totalProjects}</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Active Projects</h3>
            <p className="text-2xl font-bold text-emerald-600">{portfolioSummary.activeProjects}</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Total Budget</h3>
            <p className="text-2xl font-bold text-foreground">£{Math.round(portfolioSummary.totalBudget / 1000)}k</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Total Spent</h3>
            <p className="text-2xl font-bold text-foreground">£{Math.round(portfolioSummary.totalSpent / 1000)}k</p>
          </Card>
        </div>
      )}

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilterValue)}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
          >
            {STATUS_FILTERS.map(filter => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {filteredProjects.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">
            {projects.length === 0 ? 'No projects found.' : 'No projects match your filters.'}
          </p>
          {canCreateProject && projects.length === 0 && (
            <Button onClick={() => setShowCreateModal(true)} className="mt-4">
              Create Your First Project
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onSelect={() => onSelectProject(project)}
            />
          ))}
        </div>
      )}

      {projects.length > 0 && !loading && (
        <p className="text-xs text-muted-foreground text-center">
          {filteredProjects.length === projects.length
            ? `Showing all ${projects.length} project${projects.length === 1 ? '' : 's'}.`
            : `Showing ${filteredProjects.length} of ${projects.length} projects.`}
        </p>
      )}

      {showCreateModal && (
        <ProjectModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateProject}
        />
      )}
    </div>
  );
};
