import React, { useState } from 'react';
import { Project, ProjectStatus } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ProjectCard } from './ProjectCard';
import { Plus, MoreHorizontal } from 'lucide-react';

interface ProjectKanbanProps {
  projects: Project[];
  onProjectUpdate: (projectData: Partial<Project>) => void;
}

interface KanbanColumn {
  id: ProjectStatus;
  title: string;
  color: string;
  projects: Project[];
}

export const ProjectKanban: React.FC<ProjectKanbanProps> = ({
  projects,
  onProjectUpdate,
}) => {
  const [draggedProject, setDraggedProject] = useState<Project | null>(null);

  const columns: KanbanColumn[] = [
    {
      id: 'planning',
      title: 'Planning',
      color: 'bg-purple-100 border-purple-200',
      projects: projects.filter(p => p.status === 'planning'),
    },
    {
      id: 'active',
      title: 'Active',
      color: 'bg-blue-100 border-blue-200',
      projects: projects.filter(p => p.status === 'active'),
    },
    {
      id: 'on-hold',
      title: 'On Hold',
      color: 'bg-yellow-100 border-yellow-200',
      projects: projects.filter(p => p.status === 'on-hold'),
    },
    {
      id: 'completed',
      title: 'Completed',
      color: 'bg-green-100 border-green-200',
      projects: projects.filter(p => p.status === 'completed'),
    },
  ];

  const handleDragStart = (e: React.DragEvent, project: Project) => {
    setDraggedProject(project);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetStatus: ProjectStatus) => {
    e.preventDefault();
    
    if (draggedProject && draggedProject.status !== targetStatus) {
      onProjectUpdate({
        ...draggedProject,
        status: targetStatus,
      });
    }
    
    setDraggedProject(null);
  };

  const handleDragEnd = () => {
    setDraggedProject(null);
  };

  return (
    <div className="h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full">
        {columns.map(column => (
          <div
            key={column.id}
            className={`rounded-lg border-2 border-dashed p-4 ${column.color} min-h-[600px]`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">{column.title}</h3>
                <span className="bg-white/80 text-xs px-2 py-1 rounded-full">
                  {column.projects.length}
                </span>
              </div>
              <Button variant="ghost" size="sm">
                <MoreHorizontal size={16} />
              </Button>
            </div>

            {/* Projects */}
            <div className="space-y-3">
              {column.projects.map(project => (
                <div
                  key={project.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, project)}
                  onDragEnd={handleDragEnd}
                  className={`cursor-move transition-transform hover:scale-105 ${
                    draggedProject?.id === project.id ? 'opacity-50' : ''
                  }`}
                >
                  <KanbanProjectCard project={project} />
                </div>
              ))}
              
              {/* Add Project Button */}
              <Button
                variant="outline"
                className="w-full border-dashed"
                size="sm"
              >
                <Plus size={16} className="mr-2" />
                Add Project
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Simplified project card for Kanban view
const KanbanProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  const budgetUsed = (project.spent / project.budget) * 100;
  const completedMilestones = project.milestones?.filter(m => m.completed).length || 0;
  const totalMilestones = project.milestones?.length || 0;

  return (
    <Card className="p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="space-y-3">
        {/* Title */}
        <h4 className="font-medium text-foreground text-sm leading-tight">
          {project.name}
        </h4>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{project.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        {/* Budget */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Budget</span>
            <span className="font-medium">
              ${(project.spent / 1000).toFixed(0)}K / ${(project.budget / 1000).toFixed(0)}K
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${
                budgetUsed > 90 ? 'bg-red-500' : budgetUsed > 75 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(budgetUsed, 100)}%` }}
            />
          </div>
        </div>

        {/* Milestones */}
        {totalMilestones > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Milestones</span>
            <div className="flex items-center gap-1">
              <span className="font-medium">{completedMilestones}/{totalMilestones}</span>
              <div className="flex gap-0.5">
                {project.milestones?.slice(0, 4).map((milestone, index) => (
                  <div
                    key={milestone.id}
                    className={`w-2 h-2 rounded-full ${
                      milestone.completed ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Priority */}
        {project.priority && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Priority</span>
            <span className={`text-xs font-medium ${
              project.priority === 'high' ? 'text-red-600' :
              project.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {project.priority}
            </span>
          </div>
        )}

        {/* Location */}
        {project.location && (
          <div className="text-xs text-muted-foreground truncate">
            📍 {project.location}
          </div>
        )}
      </div>
    </Card>
  );
};
