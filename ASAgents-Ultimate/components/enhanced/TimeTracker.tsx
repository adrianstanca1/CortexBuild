import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Todo, Project } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Tag } from '../ui/Tag';

export interface TimeEntry {
  id: string;
  taskId: string | number;
  userId: string;
  projectId?: string | number;
  startTime: string;
  endTime?: string;
  duration?: number; // in minutes
  description?: string;
  isRunning: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TimeTrackerProps {
  user: User;
  tasks: Todo[];
  projects: Project[];
  timeEntries: TimeEntry[];
  onStartTimer: (taskId: string | number, description?: string) => void;
  onStopTimer: (entryId: string) => void;
  onUpdateEntry: (entryId: string, updates: Partial<TimeEntry>) => void;
  onDeleteEntry: (entryId: string) => void;
  currentRunningEntry?: TimeEntry;
}

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const TimerDisplay: React.FC<{
  startTime: string;
  isRunning: boolean;
}> = ({ startTime, isRunning }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const start = new Date(startTime).getTime();
      const elapsedMinutes = Math.floor((now - start) / (1000 * 60));
      setElapsed(elapsedMinutes);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, isRunning]);

  useEffect(() => {
    if (!isRunning) {
      const now = new Date().getTime();
      const start = new Date(startTime).getTime();
      const elapsedMinutes = Math.floor((now - start) / (1000 * 60));
      setElapsed(elapsedMinutes);
    }
  }, [startTime, isRunning]);

  return (
    <div className={`text-lg font-mono ${isRunning ? 'text-green-600' : 'text-gray-600'}`}>
      {formatDuration(elapsed)}
    </div>
  );
};

const QuickStartTimer: React.FC<{
  tasks: Todo[];
  projects: Project[];
  onStart: (taskId: string | number, description?: string) => void;
  currentRunningEntry?: TimeEntry;
}> = ({ tasks, projects, onStart, currentRunningEntry }) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [showForm, setShowForm] = useState(false);

  const availableTasks = useMemo(() => {
    return tasks.filter(task => task.status !== 'DONE');
  }, [tasks]);

  const handleStart = () => {
    if (selectedTaskId) {
      onStart(selectedTaskId, description.trim() || undefined);
      setDescription('');
      setShowForm(false);
    }
  };

  if (currentRunningEntry) {
    const task = tasks.find(t => t.id === currentRunningEntry.taskId);
    const project = projects.find(p => p.id === task?.projectId);

    return (
      <Card className="p-4 bg-green-50 border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <h4 className="font-medium text-green-900">
                {task?.title || 'Unknown Task'}
              </h4>
              {project && (
                <p className="text-sm text-green-700">{project.name}</p>
              )}
              {currentRunningEntry.description && (
                <p className="text-sm text-green-600">{currentRunningEntry.description}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <TimerDisplay
              startTime={currentRunningEntry.startTime}
              isRunning={true}
            />
            <p className="text-xs text-green-600">
              Started at {formatTime(currentRunningEntry.startTime)}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (!showForm) {
    return (
      <Card className="p-4">
        <Button onClick={() => setShowForm(true)} className="w-full">
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-10V7a3 3 0 11-6 0V4a3 3 0 11-6 0v3a3 3 0 11-6 0v3" />
          </svg>
          Start Timer
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">Start Time Tracking</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Task
          </label>
          <select
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a task...</option>
            {availableTasks.map(task => {
              const project = projects.find(p => p.id === task.projectId);
              return (
                <option key={task.id} value={task.id}>
                  {task.title} {project && `(${project.name})`}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (optional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What are you working on?"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={handleStart}
            disabled={!selectedTaskId}
            className="flex-1"
          >
            Start Timer
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowForm(false)}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  );
};

const TimeEntryList: React.FC<{
  entries: TimeEntry[];
  tasks: Todo[];
  projects: Project[];
  onUpdate: (entryId: string, updates: Partial<TimeEntry>) => void;
  onDelete: (entryId: string) => void;
  onStop: (entryId: string) => void;
}> = ({ entries, tasks, projects, onUpdate, onDelete, onStop }) => {
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState('');

  const groupedEntries = useMemo(() => {
    const groups: { [date: string]: TimeEntry[] } = {};
    
    entries.forEach(entry => {
      const date = new Date(entry.startTime).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(entry);
    });

    return Object.entries(groups).sort(([a], [b]) => 
      new Date(b).getTime() - new Date(a).getTime()
    );
  }, [entries]);

  const handleEdit = (entry: TimeEntry) => {
    setEditingEntry(entry.id);
    setEditDescription(entry.description || '');
  };

  const handleSaveEdit = (entryId: string) => {
    onUpdate(entryId, { description: editDescription });
    setEditingEntry(null);
    setEditDescription('');
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setEditDescription('');
  };

  return (
    <div className="space-y-6">
      {groupedEntries.map(([date, dayEntries]) => (
        <div key={date}>
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            {new Date(date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h3>
          
          <div className="space-y-2">
            {dayEntries.map(entry => {
              const task = tasks.find(t => t.id === entry.taskId);
              const project = projects.find(p => p.id === task?.projectId);
              const duration = entry.duration || 
                (entry.endTime ? 
                  Math.floor((new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime()) / (1000 * 60)) :
                  Math.floor((new Date().getTime() - new Date(entry.startTime).getTime()) / (1000 * 60))
                );

              return (
                <Card key={entry.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className={`w-3 h-3 rounded-full ${
                        entry.isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                      }`} />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900 truncate">
                            {task?.title || 'Unknown Task'}
                          </h4>
                          {project && (
                            <Tag variant="secondary" size="sm">
                              {project.name}
                            </Tag>
                          )}
                        </div>
                        
                        {editingEntry === entry.id ? (
                          <div className="mt-2 flex items-center space-x-2">
                            <input
                              type="text"
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              placeholder="Description..."
                              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <Button size="sm" onClick={() => handleSaveEdit(entry.id)}>
                              Save
                            </Button>
                            <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-4 mt-1">
                            <p className="text-sm text-gray-600">
                              {formatTime(entry.startTime)} - {entry.endTime ? formatTime(entry.endTime) : 'Running'}
                            </p>
                            {entry.description && (
                              <p className="text-sm text-gray-500 italic">
                                {entry.description}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        {entry.isRunning ? (
                          <TimerDisplay
                            startTime={entry.startTime}
                            isRunning={true}
                          />
                        ) : (
                          <div className="text-lg font-mono text-gray-900">
                            {formatDuration(duration)}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-1">
                        {entry.isRunning ? (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => onStop(entry.id)}
                          >
                            Stop
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(entry)}
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDelete(entry.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export const TimeTracker: React.FC<TimeTrackerProps> = ({
  user,
  tasks,
  projects,
  timeEntries,
  onStartTimer,
  onStopTimer,
  onUpdateEntry,
  onDeleteEntry,
  currentRunningEntry
}) => {
  const [activeTab, setActiveTab] = useState<'timer' | 'entries'>('timer');

  const todayEntries = useMemo(() => {
    const today = new Date().toDateString();
    return timeEntries.filter(entry => 
      new Date(entry.startTime).toDateString() === today
    );
  }, [timeEntries]);

  const todayTotal = useMemo(() => {
    return todayEntries.reduce((total, entry) => {
      const duration = entry.duration || 
        (entry.endTime ? 
          Math.floor((new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime()) / (1000 * 60)) :
          Math.floor((new Date().getTime() - new Date(entry.startTime).getTime()) / (1000 * 60))
        );
      return total + duration;
    }, 0);
  }, [todayEntries]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Time Tracking</h2>
          <p className="text-sm text-gray-600">
            Today: {formatDuration(todayTotal)} • {todayEntries.length} entries
          </p>
        </div>
        
        <div className="flex rounded-md shadow-sm">
          {[
            { key: 'timer', label: 'Timer' },
            { key: 'entries', label: 'Time Entries' }
          ].map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 text-sm font-medium border ${
                activeTab === tab.key
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              } ${tab.key === 'timer' ? 'rounded-l-md' : 'rounded-r-md'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'timer' ? (
        <QuickStartTimer
          tasks={tasks}
          projects={projects}
          onStart={onStartTimer}
          currentRunningEntry={currentRunningEntry}
        />
      ) : (
        <TimeEntryList
          entries={timeEntries}
          tasks={tasks}
          projects={projects}
          onUpdate={onUpdateEntry}
          onDelete={onDeleteEntry}
          onStop={onStopTimer}
        />
      )}
    </div>
  );
};
