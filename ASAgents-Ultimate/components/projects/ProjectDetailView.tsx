// @ts-nocheck
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { User, Project, Todo, Document, Permission, TodoStatus, TodoPriority, SafetyIncident, Expense, ExpenseStatus, ProjectInsight } from '../../types';
import { api } from '../../services/mockApi';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { hasPermission } from '../../services/auth';
import { PriorityDisplay } from '../ui/priorityDisplay';
import { Avatar } from '../ui/Avatar';
import { IncidentSeverityBadge, IncidentStatusBadge } from '../ui/statusBadge';
import { ProjectModal } from './project/CreateProjectModal';
import { ReminderControl } from './reminder/ReminderControl';
import { TaskModal } from './task/TaskModal';
import { Tag } from '../ui/Tag';
import { ReminderModal } from './reminder/ReminderModal';
import { WhiteboardView } from './whiteboard/WhiteboardView';
import { generateProjectHealthSummary } from '../../services/ai';

interface ProjectDetailViewProps {
  project: Project;
  user: User;
  onBack: () => void;
  addToast: (message: string, type: 'success' | 'error') => void;
  isOnline: boolean;
  onStartChat: (recipient: User) => void;
}

type DetailTab = 'overview' | 'tasks' | 'whiteboard' | 'documents' | 'team' | 'safety' | 'financials';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

const ProjectHealthSummary: React.FC<{
  project: Project;
  insights: ProjectInsight[];
  onGenerate: () => void;
  isGenerating: boolean;
  error?: string | null;
  isOnline: boolean;
}> = ({ project, insights, onGenerate, isGenerating, error, isOnline }) => {
  const latestInsight = insights[0] ?? null;

  const renderSummary = (summary: string, keyPrefix: string) => (
    <ul className="list-disc pl-5 space-y-1">
      {summary.split('\n').map((line, idx) => (
        <li key={`${keyPrefix}-${idx}`}>{line}</li>
      ))}
    </ul>
  );

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Project Health</h3>
        <Button size="sm" onClick={onGenerate} disabled={isGenerating || !isOnline}>
          {isGenerating ? 'Generating…' : 'Generate summary'}
        </Button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {latestInsight ? (
        <div className="space-y-3">
          {latestInsight.summary && (
            <div>
              <h4 className="text-sm font-medium">Summary</h4>
              {renderSummary(latestInsight.summary, 'summary')}
            </div>
          )}
          {latestInsight.risks && latestInsight.risks.length > 0 && (
            <div>
              <h4 className="text-sm font-medium">Risks</h4>
              {renderSummary(latestInsight.risks.join('\n'), 'risks')}
            </div>
          )}
          {latestInsight.recommendations && latestInsight.recommendations.length > 0 && (
            <div>
              <h4 className="text-sm font-medium">Recommendations</h4>
              {renderSummary(latestInsight.recommendations.join('\n'), 'recs')}
            </div>
          )}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">No insights yet.</p>
      )}
    </Card>
  );
};

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ project, user, onBack, addToast, isOnline, onStartChat }) => {
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [progress, setProgress] = useState<number>(project.progress ?? 0);
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const canManage = hasPermission(user, Permission.MANAGE_PROJECTS);

  const handleProgressChangeCommit = (value: number) => {
    setProgress(value);
    // mock persist
  };

  const onOpenReminder = (task: Todo) => {
    // open reminder modal - placeholder
  };

  const onEdit = (task: Todo) => {
    // open task modal - placeholder
  };

  const assignee = project.owner as User | undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button type="button" onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-800" aria-label="Go back">
            ←
          </button>
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground">{project.description}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {canManage && (
          <ReminderControl todo={{} as Todo} onClick={() => onOpenReminder({} as Todo)} />
        )}
        {canManage && !isBlocked && (
          <button
            type="button"
            onClick={() => onEdit({} as Todo)}
            className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-black/10 text-muted-foreground hover:text-foreground transition-opacity disabled:opacity-50"
            aria-label="Edit task"
            title="Edit Task"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" />
            </svg>
          </button>
        )}
        <div className="flex justify-start md:justify-center">
          {assignee && (
            <Avatar name={`${assignee.firstName} ${assignee.lastName}`} imageUrl={assignee.avatar} className="w-8 h-8 text-xs" />
          )}
        </div>
        <div className="md:col-span-2 flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="100"
            aria-label="Project progress percentage"
            value={progress}
            onChange={e => setProgress(Number(e.target.value))}
            onMouseUp={e => handleProgressChangeCommit(Number(e.currentTarget.value))}
            onTouchEnd={e => handleProgressChangeCommit(Number(e.currentTarget.value))}
            disabled={!canManage || isBlocked}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
          />
          <span className="text-sm font-semibold w-12 text-right">{progress}%</span>
        </div>
      </div>

      <div className="p-6">
        <p className="text-muted-foreground">Project details will be loaded here...</p>
      </div>
    </div>
  );
};
