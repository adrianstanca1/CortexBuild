import React from 'react';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    status: 'in_progress' | 'planning' | 'completed' | 'on_hold' | 'cancelled' | 'approved';
    client?: string;
    budget?: number;
    progress?: number;
  };
  onClick?: () => void;
  showAction?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onClick,
  showAction = true,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card hover padding="md" onClick={onClick}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="text-lg font-semibold text-gray-900">{project.name}</h4>
            <StatusBadge status={project.status} size="sm" />
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {project.client && (
              <>
                <span>{project.client}</span>
                {project.budget && <span>•</span>}
              </>
            )}
            {project.budget && (
              <>
                <span>Budget: {formatCurrency(project.budget)}</span>
                {project.progress !== undefined && <span>•</span>}
              </>
            )}
            {project.progress !== undefined && (
              <span>{project.progress}% complete</span>
            )}
          </div>
        </div>

        {showAction && (
          <button
            type="button"
            className="ml-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </Card>
  );
};

