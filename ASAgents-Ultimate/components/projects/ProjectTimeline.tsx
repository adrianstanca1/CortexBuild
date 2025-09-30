import React, { useMemo } from 'react';
import { Project } from '../../types';
import { Card } from '../ui/Card';
import { format, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval } from 'date-fns';

interface ProjectTimelineProps {
  projects: Project[];
}

interface TimelineEvent {
  id: string;
  title: string;
  date: Date;
  type: 'start' | 'end' | 'milestone';
  projectId: string;
  projectName: string;
  color: string;
}

export const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ projects }) => {
  const timelineData = useMemo(() => {
    const events: TimelineEvent[] = [];
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500'];

    projects.forEach((project, index) => {
      const color = colors[index % colors.length];

      // Add project start event
      events.push({
        id: `${project.id}-start`,
        title: `${project.name} - Start`,
        date: project.startDate,
        type: 'start',
        projectId: project.id,
        projectName: project.name,
        color,
      });

      // Add project end event
      events.push({
        id: `${project.id}-end`,
        title: `${project.name} - End`,
        date: project.endDate,
        type: 'end',
        projectId: project.id,
        projectName: project.name,
        color,
      });

      // Add milestone events
      project.milestones?.forEach(milestone => {
        events.push({
          id: `${project.id}-milestone-${milestone.id}`,
          title: milestone.name,
          date: milestone.date,
          type: 'milestone',
          projectId: project.id,
          projectName: project.name,
          color,
        });
      });
    });

    // Sort events by date
    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [projects]);

  const timelineRange = useMemo(() => {
    if (projects.length === 0) return { start: new Date(), end: new Date() };

    const allDates = projects.flatMap(p => [
      p.startDate,
      p.endDate,
      ...(p.milestones?.map(m => m.date) || [])
    ]);

    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));

    return {
      start: startOfMonth(minDate),
      end: endOfMonth(maxDate),
    };
  }, [projects]);

  const months = useMemo(() => {
    const monthsArray = [];
    let currentDate = timelineRange.start;

    while (currentDate <= timelineRange.end) {
      monthsArray.push(new Date(currentDate));
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    }

    return monthsArray;
  }, [timelineRange]);

  const getEventPosition = (date: Date) => {
    const totalDays = differenceInDays(timelineRange.end, timelineRange.start);
    const daysSinceStart = differenceInDays(date, timelineRange.start);
    return (daysSinceStart / totalDays) * 100;
  };

  const getProjectBar = (project: Project) => {
    const startPos = getEventPosition(project.startDate);
    const endPos = getEventPosition(project.endDate);
    const width = endPos - startPos;

    return {
      left: `${startPos}%`,
      width: `${width}%`,
    };
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'start':
        return '🚀';
      case 'end':
        return '🏁';
      case 'milestone':
        return '📍';
      default:
        return '•';
    }
  };

  return (
    <div className="space-y-6">
      {/* Timeline Header */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Project Timeline</h3>
        
        {/* Month Headers */}
        <div className="relative mb-6">
          <div className="flex border-b border-border pb-2">
            {months.map(month => (
              <div
                key={month.toISOString()}
                className="flex-1 text-center text-sm font-medium text-muted-foreground"
              >
                {format(month, 'MMM yyyy')}
              </div>
            ))}
          </div>
        </div>

        {/* Project Bars */}
        <div className="space-y-4">
          {projects.map((project, index) => {
            const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500'];
            const color = colors[index % colors.length];
            const barStyle = getProjectBar(project);

            return (
              <div key={project.id} className="relative">
                {/* Project Name */}
                <div className="flex items-center mb-2">
                  <div className={`w-3 h-3 rounded-full ${color} mr-3`} />
                  <span className="text-sm font-medium text-foreground">
                    {project.name}
                  </span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({project.progress}% complete)
                  </span>
                </div>

                {/* Timeline Bar */}
                <div className="relative h-8 bg-gray-100 rounded">
                  {/* Project Duration Bar */}
                  <div
                    className={`absolute top-1 h-6 ${color} rounded opacity-80`}
                    style={barStyle}
                  />
                  
                  {/* Progress Overlay */}
                  <div
                    className={`absolute top-1 h-6 ${color} rounded`}
                    style={{
                      left: barStyle.left,
                      width: `${(parseFloat(barStyle.width.replace('%', '')) * project.progress) / 100}%`,
                    }}
                  />

                  {/* Milestones */}
                  {project.milestones?.map(milestone => (
                    <div
                      key={milestone.id}
                      className="absolute top-0 w-2 h-8 flex items-center justify-center"
                      style={{ left: `${getEventPosition(milestone.date)}%` }}
                      title={`${milestone.name} - ${format(milestone.date, 'MMM dd, yyyy')}`}
                    >
                      <div className={`w-2 h-2 rounded-full border-2 border-white ${
                        milestone.completed ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                    </div>
                  ))}
                </div>

                {/* Date Labels */}
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{format(project.startDate, 'MMM dd')}</span>
                  <span>{format(project.endDate, 'MMM dd')}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Events List */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Upcoming Events</h3>
        
        <div className="space-y-3">
          {timelineData
            .filter(event => event.date >= new Date())
            .slice(0, 10)
            .map(event => (
              <div key={event.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent">
                <div className="text-lg">{getEventIcon(event.type)}</div>
                
                <div className="flex-1">
                  <div className="font-medium text-foreground">{event.title}</div>
                  <div className="text-sm text-muted-foreground">{event.projectName}</div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium text-foreground">
                    {format(event.date, 'MMM dd')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(event.date, 'yyyy')}
                  </div>
                </div>
              </div>
            ))}
        </div>

        {timelineData.filter(event => event.date >= new Date()).length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No upcoming events
          </div>
        )}
      </Card>

      {/* Timeline Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold text-foreground">
            {projects.filter(p => p.status === 'active').length}
          </div>
          <div className="text-sm text-muted-foreground">Active Projects</div>
        </Card>
        
        <Card className="p-4">
          <div className="text-2xl font-bold text-foreground">
            {timelineData.filter(e => e.type === 'milestone' && e.date >= new Date()).length}
          </div>
          <div className="text-sm text-muted-foreground">Upcoming Milestones</div>
        </Card>
        
        <Card className="p-4">
          <div className="text-2xl font-bold text-foreground">
            {projects.filter(p => p.endDate < new Date() && p.status !== 'completed').length}
          </div>
          <div className="text-sm text-muted-foreground">Overdue Projects</div>
        </Card>
      </div>
    </div>
  );
};
