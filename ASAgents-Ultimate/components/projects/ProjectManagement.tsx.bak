import React, { useState, useEffect, useCallback } from 'react';
import { Project, User, Todo, ProjectStatus } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ProjectCard } from './ProjectCard';
import { ProjectForm } from './ProjectForm';
import { ProjectDetails } from './ProjectDetails';
import { ProjectTimeline } from './ProjectTimeline';
import { ProjectKanban } from './ProjectKanban';
import { ProjectGantt } from './ProjectGantt';
import { useRealTimeEvent } from '../../hooks/useRealTime';
import { 
  Plus, 
  Grid, 
  List, 
  Calendar, 
  BarChart3, 
  Filter, 
  Search,
  Download,
  Upload,
  Settings
} from 'lucide-react';

interface ProjectManagementProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  onNavigate?: (view: string) => void;
}

type ProjectView = 'grid' | 'list' | 'kanban' | 'timeline' | 'gantt';
type ProjectFilter = 'all' | 'active' | 'completed' | 'overdue' | 'my-projects';

interface ProjectFilters {
  status: ProjectFilter;
  search: string;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  assignee: string | null;
  priority: string | null;
}

export const ProjectManagement: React.FC<ProjectManagementProps> = ({
  user,
  addToast,
  onNavigate,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [currentView, setCurrentView] = useState<ProjectView>('grid');
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ProjectFilters>({
    status: 'all',
    search: '',
    dateRange: { start: null, end: null },
    assignee: null,
    priority: null,
  });

  // Real-time project updates
  useRealTimeEvent('project_updated', (event) => {
    setProjects(prev => prev.map(project => 
      project.id === event.entityId 
        ? { ...project, ...event.data }
        : project
    ));
    addToast(`Project "${event.data?.name}" was updated`, 'info');
  });

  useRealTimeEvent('project_created', (event) => {
    if (event.data) {
      setProjects(prev => [event.data, ...prev]);
      addToast(`New project "${event.data.name}" was created`, 'success');
    }
  });

  // Load projects
  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      
      // Simulate API call - replace with actual API
      const mockProjects: Project[] = [
        {
          id: '1',
          name: 'Residential Complex A',
          description: 'Modern residential development with 50 units',
          status: 'active' as ProjectStatus,
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-12-15'),
          budget: 2500000,
          spent: 1200000,
          progress: 48,
          managerId: user.id,
          teamIds: [user.id],
          clientId: 'client-1',
          location: 'Downtown District',
          priority: 'high',
          tags: ['residential', 'construction', 'high-priority'],
          milestones: [
            { id: '1', name: 'Foundation Complete', date: new Date('2024-03-01'), completed: true },
            { id: '2', name: 'Structure Complete', date: new Date('2024-06-01'), completed: true },
            { id: '3', name: 'Interior Work', date: new Date('2024-09-01'), completed: false },
            { id: '4', name: 'Final Inspection', date: new Date('2024-11-15'), completed: false },
          ],
        },
        {
          id: '2',
          name: 'Office Building Renovation',
          description: 'Complete renovation of 10-story office building',
          status: 'active' as ProjectStatus,
          startDate: new Date('2024-02-01'),
          endDate: new Date('2024-10-30'),
          budget: 1800000,
          spent: 650000,
          progress: 36,
          managerId: user.id,
          teamIds: [user.id],
          clientId: 'client-2',
          location: 'Business District',
          priority: 'medium',
          tags: ['renovation', 'commercial', 'office'],
          milestones: [
            { id: '1', name: 'Demolition', date: new Date('2024-03-15'), completed: true },
            { id: '2', name: 'Structural Updates', date: new Date('2024-05-30'), completed: false },
            { id: '3', name: 'Systems Installation', date: new Date('2024-08-15'), completed: false },
            { id: '4', name: 'Finishing Work', date: new Date('2024-10-01'), completed: false },
          ],
        },
        {
          id: '3',
          name: 'Shopping Center Expansion',
          description: 'Adding new wing to existing shopping center',
          status: 'planning' as ProjectStatus,
          startDate: new Date('2024-06-01'),
          endDate: new Date('2025-03-31'),
          budget: 3200000,
          spent: 150000,
          progress: 5,
          managerId: user.id,
          teamIds: [user.id],
          clientId: 'client-3',
          location: 'Suburban Mall',
          priority: 'medium',
          tags: ['expansion', 'retail', 'commercial'],
          milestones: [
            { id: '1', name: 'Design Approval', date: new Date('2024-04-15'), completed: true },
            { id: '2', name: 'Permits Obtained', date: new Date('2024-05-30'), completed: false },
            { id: '3', name: 'Construction Start', date: new Date('2024-06-01'), completed: false },
            { id: '4', name: 'Phase 1 Complete', date: new Date('2024-12-01'), completed: false },
          ],
        },
      ];

      setProjects(mockProjects);
    } catch (error) {
      console.error('Failed to load projects:', error);
      addToast('Failed to load projects', 'error');
    } finally {
      setLoading(false);
    }
  }, [user.id, addToast]);

  // Initialize
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Filter projects
  const filteredProjects = projects.filter(project => {
    // Status filter
    if (filters.status !== 'all') {
      switch (filters.status) {
        case 'active':
          if (project.status !== 'active') return false;
          break;
        case 'completed':
          if (project.status !== 'completed') return false;
          break;
        case 'overdue':
          if (project.endDate > new Date() || project.status === 'completed') return false;
          break;
        case 'my-projects':
          if (project.managerId !== user.id && !project.teamIds.includes(user.id)) return false;
          break;
      }
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (!project.name.toLowerCase().includes(searchLower) &&
          !project.description?.toLowerCase().includes(searchLower) &&
          !project.location?.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    return true;
  });

  // Handle project creation/editing
  const handleProjectSave = async (projectData: Partial<Project>) => {
    try {
      if (editingProject) {
        // Update existing project
        const updatedProject = { ...editingProject, ...projectData };
        setProjects(prev => prev.map(p => p.id === editingProject.id ? updatedProject : p));
        addToast('Project updated successfully', 'success');
      } else {
        // Create new project
        const newProject: Project = {
          id: Date.now().toString(),
          ...projectData,
          status: 'planning' as ProjectStatus,
          progress: 0,
          spent: 0,
          managerId: user.id,
          teamIds: [user.id],
          milestones: [],
        } as Project;
        
        setProjects(prev => [newProject, ...prev]);
        addToast('Project created successfully', 'success');
      }
      
      setShowProjectForm(false);
      setEditingProject(null);
    } catch (error) {
      console.error('Failed to save project:', error);
      addToast('Failed to save project', 'error');
    }
  };

  // Handle project deletion
  const handleProjectDelete = async (projectId: string) => {
    try {
      setProjects(prev => prev.filter(p => p.id !== projectId));
      addToast('Project deleted successfully', 'success');
      setSelectedProject(null);
    } catch (error) {
      console.error('Failed to delete project:', error);
      addToast('Failed to delete project', 'error');
    }
  };

  // View components
  const viewComponents = {
    grid: () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            onClick={() => setSelectedProject(project)}
            onEdit={() => {
              setEditingProject(project);
              setShowProjectForm(true);
            }}
            onDelete={() => handleProjectDelete(project.id)}
          />
        ))}
      </div>
    ),
    list: () => (
      <div className="space-y-4">
        {filteredProjects.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            layout="list"
            onClick={() => setSelectedProject(project)}
            onEdit={() => {
              setEditingProject(project);
              setShowProjectForm(true);
            }}
            onDelete={() => handleProjectDelete(project.id)}
          />
        ))}
      </div>
    ),
    kanban: () => <ProjectKanban projects={filteredProjects} onProjectUpdate={handleProjectSave} />,
    timeline: () => <ProjectTimeline projects={filteredProjects} />,
    gantt: () => <ProjectGantt projects={filteredProjects} />,
  };

  if (selectedProject) {
    return (
      <ProjectDetails
        project={selectedProject}
        onBack={() => setSelectedProject(null)}
        onEdit={() => {
          setEditingProject(selectedProject);
          setShowProjectForm(true);
        }}
        onDelete={() => handleProjectDelete(selectedProject.id)}
        user={user}
        addToast={addToast}
      />
    );
  }

  if (showProjectForm) {
    return (
      <ProjectForm
        project={editingProject}
        onSave={handleProjectSave}
        onCancel={() => {
          setShowProjectForm(false);
          setEditingProject(null);
        }}
        user={user}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Project Management</h1>
          <p className="text-muted-foreground">
            Manage your construction projects, track progress, and coordinate teams
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadProjects()}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
          <Button onClick={() => setShowProjectForm(true)}>
            <Plus size={16} className="mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Filters and View Controls */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-muted-foreground" />
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as ProjectFilter }))}
                className="border border-border rounded px-3 py-1 text-sm"
              >
                <option value="all">All Projects</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
                <option value="my-projects">My Projects</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <Search size={16} className="text-muted-foreground" />
              <input
                type="text"
                placeholder="Search projects..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="border border-border rounded px-3 py-1 text-sm w-64"
              />
            </div>
          </div>

          {/* View Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-border rounded">
              {[
                { key: 'grid', icon: Grid, label: 'Grid' },
                { key: 'list', icon: List, label: 'List' },
                { key: 'kanban', icon: BarChart3, label: 'Kanban' },
                { key: 'timeline', icon: Calendar, label: 'Timeline' },
                { key: 'gantt', icon: BarChart3, label: 'Gantt' },
              ].map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  onClick={() => setCurrentView(key as ProjectView)}
                  className={`p-2 ${
                    currentView === key
                      ? 'bg-primary text-white'
                      : 'text-muted-foreground hover:bg-accent'
                  }`}
                  title={label}
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold text-foreground">{projects.length}</div>
          <div className="text-sm text-muted-foreground">Total Projects</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">
            {projects.filter(p => p.status === 'active').length}
          </div>
          <div className="text-sm text-muted-foreground">Active Projects</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600">
            {Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length || 0)}%
          </div>
          <div className="text-sm text-muted-foreground">Avg Progress</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-purple-600">
            ${Math.round(projects.reduce((sum, p) => sum + p.budget, 0) / 1000)}K
          </div>
          <div className="text-sm text-muted-foreground">Total Budget</div>
        </Card>
      </div>

      {/* Projects View */}
      <Card className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">No projects found</div>
            <Button onClick={() => setShowProjectForm(true)}>
              <Plus size={16} className="mr-2" />
              Create Your First Project
            </Button>
          </div>
        ) : (
          viewComponents[currentView]()
        )}
      </Card>
    </div>
  );
};
