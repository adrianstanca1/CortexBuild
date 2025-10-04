import React, { useState, useEffect } from 'react';
import { Project, Todo, TodoStatus, Timesheet, Document, SafetyIncident } from '../types';
import { ProgressRing, ProgressBar, MilestoneProgress } from './ui/ProgressIndicators';
import { Card } from './ui/Card';
import { Timeline } from './ui/Timeline';

interface ComprehensiveProgressProps {
  project: Project;
  todos: Todo[];
  timesheets: Timesheet[];
  documents: Document[];
  incidents: SafetyIncident[];
}

export const ComprehensiveProgress: React.FC<ComprehensiveProgressProps> = ({
  project,
  todos,
  timesheets,
  documents,
  incidents
}) => {
  const [progressMetrics, setProgressMetrics] = useState({
    overall: 0,
    tasks: 0,
    budget: 0,
    timeline: 0,
    safety: 100,
    documentation: 0
  });

  useEffect(() => {
    // Calculate task completion
    const completedTasks = todos.filter(t => t.status === TodoStatus.DONE).length;
    const taskProgress = todos.length > 0 ? (completedTasks / todos.length) * 100 : 0;

    // Calculate budget progress
    const budgetProgress = project.budget > 0 
      ? Math.min((project.actualCost / project.budget) * 100, 100) 
      : 0;

    // Calculate timeline progress
    const startDate = new Date(project.startDate).getTime();
    const now = new Date().getTime();
    const estimatedDuration = 90 * 24 * 60 * 60 * 1000; // 90 days estimate
    const timelineProgress = Math.min(((now - startDate) / estimatedDuration) * 100, 100);

    // Safety score (100 - incident impact)
    const safetyScore = Math.max(100 - (incidents.length * 5), 0);

    // Documentation progress
    const requiredDocs = 10; // Baseline requirement
    const docProgress = Math.min((documents.length / requiredDocs) * 100, 100);

    // Overall progress (weighted average)
    const overall = (
      taskProgress * 0.4 +
      (100 - Math.abs(budgetProgress - 100) / 2) * 0.25 +
      timelineProgress * 0.15 +
      safetyScore * 0.1 +
      docProgress * 0.1
    );

    setProgressMetrics({
      overall: Math.round(overall),
      tasks: Math.round(taskProgress),
      budget: Math.round(budgetProgress),
      timeline: Math.round(timelineProgress),
      safety: Math.round(safetyScore),
      documentation: Math.round(docProgress)
    });
  }, [project, todos, timesheets, documents, incidents]);

  const milestones = [
    { name: 'Project Kickoff', completed: true, date: project.startDate },
    { name: 'Foundation Complete', completed: progressMetrics.overall > 20, date: undefined },
    { name: 'Framing Complete', completed: progressMetrics.overall > 40, date: undefined },
    { name: 'Mechanical Systems', completed: progressMetrics.overall > 60, date: undefined },
    { name: 'Final Inspection', completed: progressMetrics.overall > 90, date: undefined },
  ];

  const getStatusColor = (value: number) => {
    if (value >= 80) return 'text-green-600';
    if (value >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBudgetStatus = () => {
    const percentUsed = (project.actualCost / project.budget) * 100;
    if (percentUsed < 80) return { color: 'text-green-600', label: 'On Budget' };
    if (percentUsed < 100) return { color: 'text-yellow-600', label: 'Near Budget' };
    return { color: 'text-red-600', label: 'Over Budget' };
  };

  const budgetStatus = getBudgetStatus();

  const recentActivity = [
    {
      id: 1,
      title: `${todos.filter(t => t.status === TodoStatus.DONE).length} tasks completed`,
      type: 'success' as const,
      timestamp: new Date(),
      icon: '✓'
    },
    {
      id: 2,
      title: `${documents.length} documents uploaded`,
      type: 'info' as const,
      timestamp: new Date(Date.now() - 86400000),
      icon: '📄'
    },
    {
      id: 3,
      title: incidents.length > 0 ? `${incidents.length} safety incidents reported` : 'No safety incidents',
      type: incidents.length > 0 ? 'warning' as const : 'success' as const,
      timestamp: new Date(Date.now() - 172800000),
      icon: '⚠️'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-slate-800 mb-6">Project Health Dashboard</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Main Progress Ring */}
          <div className="flex flex-col items-center justify-center">
            <ProgressRing
              progress={progressMetrics.overall}
              size={150}
              strokeWidth={12}
              color={progressMetrics.overall >= 75 ? '#10b981' : progressMetrics.overall >= 50 ? '#f59e0b' : '#ef4444'}
              label="Overall"
            />
            <p className="mt-4 text-sm text-slate-600 text-center">
              Weighted project completion score
            </p>
          </div>

          {/* Progress Metrics */}
          <div className="col-span-2 space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Tasks Completion</span>
                <span className={`text-sm font-semibold ${getStatusColor(progressMetrics.tasks)}`}>
                  {progressMetrics.tasks}%
                </span>
              </div>
              <ProgressBar progress={progressMetrics.tasks} color="bg-blue-500" />
              <p className="text-xs text-slate-500 mt-1">
                {todos.filter(t => t.status === TodoStatus.DONE).length} of {todos.length} tasks completed
              </p>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Budget Utilization</span>
                <span className={`text-sm font-semibold ${budgetStatus.color}`}>
                  {progressMetrics.budget}% ({budgetStatus.label})
                </span>
              </div>
              <ProgressBar 
                progress={progressMetrics.budget} 
                color={progressMetrics.budget > 100 ? 'bg-red-500' : 'bg-green-500'} 
              />
              <p className="text-xs text-slate-500 mt-1">
                £{project.actualCost.toLocaleString()} of £{project.budget.toLocaleString()}
              </p>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Timeline Progress</span>
                <span className={`text-sm font-semibold ${getStatusColor(progressMetrics.timeline)}`}>
                  {progressMetrics.timeline}%
                </span>
              </div>
              <ProgressBar progress={progressMetrics.timeline} color="bg-purple-500" />
              <p className="text-xs text-slate-500 mt-1">
                Started {new Date(project.startDate).toLocaleDateString()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">Safety Score</span>
                  <span className={`text-sm font-semibold ${getStatusColor(progressMetrics.safety)}`}>
                    {progressMetrics.safety}%
                  </span>
                </div>
                <ProgressBar progress={progressMetrics.safety} color="bg-green-500" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">Documentation</span>
                  <span className={`text-sm font-semibold ${getStatusColor(progressMetrics.documentation)}`}>
                    {progressMetrics.documentation}%
                  </span>
                </div>
                <ProgressBar progress={progressMetrics.documentation} color="bg-indigo-500" />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Milestones and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <MilestoneProgress milestones={milestones} />
        </Card>

        <Card className="p-6">
          <h4 className="font-semibold text-slate-700 mb-4">Recent Activity</h4>
          <Timeline items={recentActivity} compact />
        </Card>
      </div>

      {/* KPI Summary */}
      <Card className="p-6">
        <h4 className="font-semibold text-slate-700 mb-4">Key Performance Indicators</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">{todos.length}</p>
            <p className="text-sm text-slate-600 mt-1">Total Tasks</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">{timesheets.length}</p>
            <p className="text-sm text-slate-600 mt-1">Time Entries</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-3xl font-bold text-purple-600">{documents.length}</p>
            <p className="text-sm text-slate-600 mt-1">Documents</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-3xl font-bold text-red-600">{incidents.length}</p>
            <p className="text-sm text-slate-600 mt-1">Incidents</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
