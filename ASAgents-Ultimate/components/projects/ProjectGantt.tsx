import React, { useMemo } from 'react';
import { Project } from '../../types';
import { Card } from '../ui/Card';
import { format, differenceInDays, startOfWeek, endOfWeek, eachWeekOfInterval, addDays } from 'date-fns';

interface ProjectGanttProps {
  projects: Project[];
}

interface GanttTask {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  dependencies: string[];
  color: string;
  projectId: string;
}

export const ProjectGantt: React.FC<ProjectGanttProps> = ({ projects }) => {
  const ganttData = useMemo(() => {
    const tasks: GanttTask[] = [];
    const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];

    projects.forEach((project, index) => {
      const color = colors[index % colors.length];

      // Add main project task
      tasks.push({
        id: project.id,
        name: project.name,
        startDate: project.startDate,
        endDate: project.endDate,
        progress: project.progress,
        dependencies: [],
        color,
        projectId: project.id,
      });

      // Add milestone tasks
      project.milestones?.forEach((milestone, milestoneIndex) => {
        tasks.push({
          id: `${project.id}-milestone-${milestone.id}`,
          name: `${milestone.name}`,
          startDate: milestone.date,
          endDate: milestone.date,
          progress: milestone.completed ? 100 : 0,
          dependencies: milestoneIndex > 0 ? [`${project.id}-milestone-${project.milestones![milestoneIndex - 1].id}`] : [],
          color,
          projectId: project.id,
        });
      });
    });

    return tasks;
  }, [projects]);

  const timeRange = useMemo(() => {
    if (ganttData.length === 0) return { start: new Date(), end: new Date() };

    const allDates = ganttData.flatMap(task => [task.startDate, task.endDate]);
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));

    return {
      start: startOfWeek(minDate),
      end: endOfWeek(maxDate),
    };
  }, [ganttData]);

  const weeks = useMemo(() => {
    return eachWeekOfInterval({
      start: timeRange.start,
      end: timeRange.end,
    });
  }, [timeRange]);

  const getTaskPosition = (task: GanttTask) => {
    const totalDays = differenceInDays(timeRange.end, timeRange.start);
    const startDays = differenceInDays(task.startDate, timeRange.start);
    const taskDuration = differenceInDays(task.endDate, task.startDate) || 1;

    return {
      left: (startDays / totalDays) * 100,
      width: (taskDuration / totalDays) * 100,
    };
  };

  const isMilestone = (task: GanttTask) => {
    return task.startDate.getTime() === task.endDate.getTime();
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Gantt Chart</h3>

        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header with weeks */}
            <div className="flex border-b border-border mb-4">
              {/* Task names column */}
              <div className="w-64 p-2 font-medium text-sm text-muted-foreground border-r border-border">
                Task Name
              </div>
              
              {/* Timeline header */}
              <div className="flex-1 flex">
                {weeks.map(week => (
                  <div
                    key={week.toISOString()}
                    className="flex-1 p-2 text-center text-xs text-muted-foreground border-r border-border"
                  >
                    <div className="font-medium">{format(week, 'MMM dd')}</div>
                    <div className="text-xs opacity-60">{format(week, 'yyyy')}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tasks */}
            <div className="space-y-1">
              {ganttData.map(task => {
                const position = getTaskPosition(task);
                const milestone = isMilestone(task);

                return (
                  <div key={task.id} className="flex items-center hover:bg-accent rounded">
                    {/* Task name */}
                    <div className="w-64 p-3 border-r border-border">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: task.color }}
                        />
                        <span className="text-sm font-medium text-foreground truncate">
                          {task.name}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {format(task.startDate, 'MMM dd')} - {format(task.endDate, 'MMM dd')}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="flex-1 relative h-12 flex items-center">
                      {milestone ? (
                        // Milestone diamond
                        <div
                          className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 rotate-45 border-2 border-white"
                          style={{
                            left: `${position.left}%`,
                            backgroundColor: task.color,
                          }}
                          title={`${task.name} - ${format(task.startDate, 'MMM dd, yyyy')}`}
                        />
                      ) : (
                        // Task bar
                        <div
                          className="absolute top-1/2 transform -translate-y-1/2 h-6 rounded"
                          style={{
                            left: `${position.left}%`,
                            width: `${position.width}%`,
                            backgroundColor: task.color,
                            opacity: 0.8,
                          }}
                        >
                          {/* Progress overlay */}
                          <div
                            className="h-full rounded"
                            style={{
                              width: `${task.progress}%`,
                              backgroundColor: task.color,
                            }}
                          />
                          
                          {/* Progress text */}
                          <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium">
                            {task.progress}%
                          </div>
                        </div>
                      )}

                      {/* Week grid lines */}
                      {weeks.map((week, index) => (
                        <div
                          key={week.toISOString()}
                          className="absolute top-0 bottom-0 border-r border-gray-200"
                          style={{ left: `${(index / weeks.length) * 100}%` }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Today indicator */}
            <div className="relative">
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                style={{
                  left: `${((differenceInDays(new Date(), timeRange.start) / differenceInDays(timeRange.end, timeRange.start)) * 100)}%`,
                }}
              >
                <div className="absolute -top-2 -left-6 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  Today
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Gantt Legend */}
      <Card className="p-4">
        <h4 className="font-medium mb-3">Legend</h4>
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-2 bg-blue-500 rounded" />
            <span>Task Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rotate-45" />
            <span>Milestone</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-0.5 h-4 bg-red-500" />
            <span>Today</span>
          </div>
        </div>
      </Card>

      {/* Gantt Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold text-foreground">
            {ganttData.filter(t => !isMilestone(t)).length}
          </div>
          <div className="text-sm text-muted-foreground">Total Tasks</div>
        </Card>
        
        <Card className="p-4">
          <div className="text-2xl font-bold text-foreground">
            {ganttData.filter(t => isMilestone(t) && t.progress === 100).length}
          </div>
          <div className="text-sm text-muted-foreground">Completed Milestones</div>
        </Card>
        
        <Card className="p-4">
          <div className="text-2xl font-bold text-foreground">
            {Math.round(
              ganttData
                .filter(t => !isMilestone(t))
                .reduce((sum, t) => sum + t.progress, 0) /
              ganttData.filter(t => !isMilestone(t)).length || 0
            )}%
          </div>
          <div className="text-sm text-muted-foreground">Average Progress</div>
        </Card>
        
        <Card className="p-4">
          <div className="text-2xl font-bold text-foreground">
            {ganttData.filter(t => t.endDate < new Date() && t.progress < 100).length}
          </div>
          <div className="text-sm text-muted-foreground">Overdue Tasks</div>
        </Card>
      </div>
    </div>
  );
};
