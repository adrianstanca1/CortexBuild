import React from 'react';
import { Project, User } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { ProjectStatusBadge } from './ui/StatusBadge';

interface ProjectDetailModalProps {
  project: Project;
  user: User;
  onClose: () => void;
  onGoToProject: (project: Project) => void;
  addToast: (message: string, type: 'success' | 'error') => void;
  openTaskCount: number;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  user,
  onClose,
  onGoToProject,
  addToast,
  openTaskCount,
}) => {

  const budgetProgress = project.budget > 0 ? (project.actualCost / project.budget) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col animate-card-enter" onClick={e => e.stopPropagation()}>
        <div className="flex-shrink-0 flex justify-between items-start mb-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">{project.name}</h2>
                <p className="text-sm text-slate-500">{project.location.address}</p>
            </div>
            <ProjectStatusBadge status={project.status} />
        </div>

        <div className="flex-grow overflow-y-auto pr-2 space-y-4">
            <img src={project.imageUrl} alt={project.name} className="w-full h-48 object-cover rounded-lg" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-sm text-slate-500">Start Date</p>
                    <p className="font-semibold text-slate-800">{new Date(project.startDate).toLocaleDateString()}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-sm text-slate-500">Open Tasks</p>
                    <p className="text-2xl font-bold text-slate-800">{openTaskCount}</p>
                </div>
                 <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-sm text-slate-500">Budget</p>
                    <p className="font-semibold text-slate-800">£{project.budget.toLocaleString()}</p>
                </div>
            </div>

            <div>
                <h3 className="font-semibold mb-2 text-slate-700">Budget Utilization</h3>
                <div className="flex justify-between mb-1 text-xs font-medium text-slate-600">
                    <span>£{project.actualCost.toLocaleString()} used</span>
                    <span>{budgetProgress.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div className={`h-2.5 rounded-full ${budgetProgress > 100 ? 'bg-red-500' : 'bg-sky-500'}`} style={{ width: `${Math.min(budgetProgress, 100)}%` }}></div>
                </div>
            </div>

        </div>
        
        <div className="flex-shrink-0 flex justify-end gap-2 pt-4 border-t mt-4">
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button onClick={() => onGoToProject(project)}>View Full Details</Button>
        </div>
      </Card>
    </div>
  );
};