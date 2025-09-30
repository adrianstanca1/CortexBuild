// @ts-nocheck
import React from 'react';
import { Project, ProjectStatus } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Tag } from '../ui/Tag';
import { 
  Calendar, 
  DollarSign, 
  Users, 
  MapPin, 
  TrendingUp, 
  Clock,
  Edit,
  Trash2,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { format, differenceInDays, isAfter } from 'date-fns';

interface ProjectCardProps {
  project: Project;
  layout?: 'grid' | 'list';
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const getStatusColor = (status: ProjectStatus) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'completed':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'on-hold':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'planning':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case 'high':
      return 'text-red-600';
    case 'medium':
      return 'text-yellow-600';
    case 'low':
      return 'text-green-600';
    default:
      return 'text-gray-600';
  }
};

const getProgressColor = (progress: number) => {
  if (progress >= 80) return 'bg-green-500';
  if (progress >= 50) return 'bg-blue-500';
  if (progress >= 25) return 'bg-yellow-500';
  return 'bg-red-500';
};

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  layout = 'grid',
  onClick,
  onEdit,
  onDelete,
}) => {
  const daysUntilDeadline = differenceInDays(project.endDate, new Date());
  const isOverdue = isAfter(new Date(), project.endDate) && project.status !== 'completed';
  const budgetUsed = (project.spent / project.budget) * 100;
  
  const completedMilestones = project.milestones?.filter(m => m.completed).length || 0;
  const totalMilestones = project.milestones?.length || 0;

  if (layout === 'list') {
    return (
      <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1" onClick={onClick}>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-foreground">{project.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
                {project.priority && (
                  <span className={`text-xs font-medium ${getPriorityColor(project.priority)}`}>
                    {project.priority} priority
                  </span>
                )}
                {isOverdue && (
                  <div className="flex items-center gap-1 text-red-600">
                    <AlertTriangle size={14} />
                    <span className="text-xs">Overdue</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>{format(project.startDate, 'MMM dd')} - {format(project.endDate, 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign size={14} />
                  <span>${(project.budget / 1000).toFixed(0)}K budget</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp size={14} />
                  <span>{project.progress}% complete</span>
                </div>
                {project.location && (
                  <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    <span>{project.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-sm font-medium text-foreground">{project.progress}%</div>
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getProgressColor(project.progress)}`}
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={onEdit}>
                <Edit size={14} />
              </Button>
              <Button variant="ghost" size="sm" onClick={onDelete}>
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
      <div onClick={onClick}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
              {project.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {project.description}
            </p>
          </div>
          
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEdit?.(); }}>
              <Edit size={14} />
            </Button>
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onDelete?.(); }}>
              <Trash2 size={14} />
            </Button>
          </div>
        </div>

        {/* Status and Priority */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
          {project.priority && (
            <span className={`text-xs font-medium ${getPriorityColor(project.priority)}`}>
              {project.priority} priority
            </span>
          )}
          {isOverdue && (
            <div className="flex items-center gap-1 text-red-600">
              <AlertTriangle size={12} />
              <span className="text-xs">Overdue</span>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Progress</span>
            <span className="text-sm text-muted-foreground">{project.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${getProgressColor(project.progress)}`}
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        {/* Milestones */}
        {totalMilestones > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Milestones</span>
              <span className="text-sm text-muted-foreground">
                {completedMilestones}/{totalMilestones}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {project.milestones?.slice(0, 4).map((milestone, index) => (
                <div
                  key={milestone.id}
                  className={`w-3 h-3 rounded-full ${
                    milestone.completed ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                  title={milestone.name}
                />
              ))}
              {totalMilestones > 4 && (
                <span className="text-xs text-muted-foreground ml-1">
                  +{totalMilestones - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Budget */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Budget</span>
            <span className="text-sm text-muted-foreground">
              ${(project.spent / 1000).toFixed(0)}K / ${(project.budget / 1000).toFixed(0)}K
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                budgetUsed > 90 ? 'bg-red-500' : budgetUsed > 75 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(budgetUsed, 100)}%` }}
            />
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar size={14} />
            <span>
              {daysUntilDeadline > 0 
                ? `${daysUntilDeadline} days remaining`
                : isOverdue 
                ? `${Math.abs(daysUntilDeadline)} days overdue`
                : 'Due today'
              }
            </span>
          </div>
          
          {project.location && (
            <div className="flex items-center gap-2">
              <MapPin size={14} />
              <span>{project.location}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Users size={14} />
            <span>{project.teamIds.length} team members</span>
          </div>
        </div>

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1">
            {project.tags.slice(0, 3).map(tag => (
              <Tag key={tag} label={tag} size="sm" />
            ))}
            {project.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{project.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
