/**
 * Gantt Chart Component
 * Professional project scheduling with dependencies and critical path
 */

import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, Filter, Download, Settings, PlayCircle, PauseCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { ganttAPI } from '../../lib/api-client';

interface GanttTask {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  duration: number;
  progress: number;
  type: 'task' | 'milestone' | 'project' | 'summary';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
  dependencies: string[];
  critical_path: boolean;
}

interface GanttChartProps {
  projectId: string | number;
  onTaskClick?: (task: GanttTask) => void;
}

const GanttChart: React.FC<GanttChartProps> = ({ projectId, onTaskClick }) => {
  const [tasks, setTasks] = useState<GanttTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    loadGanttData();
  }, [projectId]);

  const loadGanttData = async () => {
    try {
      setLoading(true);
      const response = await ganttAPI.getGantt(projectId);
      setTasks(response.data.data.tasks || []);
    } catch (error: any) {
      console.error('Failed to load Gantt data:', error);
      toast.error('Failed to load project schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskClick = (task: GanttTask) => {
    setSelectedTask(task.id === selectedTask ? null : task.id);
    if (onTaskClick) {
      onTaskClick(task);
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress > 0) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-red-500';
      case 'high': return 'border-orange-500';
      case 'medium': return 'border-yellow-500';
      case 'low': return 'border-green-500';
      default: return 'border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-gray-900">Project Schedule</h2>
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'day' ? 'bg-white shadow text-blue-600' : 'text-gray-600'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'week' ? 'bg-white shadow text-blue-600' : 'text-gray-600'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'month' ? 'bg-white shadow text-blue-600' : 'text-gray-600'
              }`}
            >
              Month
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
            <Filter className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Task List */}
          <div className="divide-y divide-gray-200">
            {tasks.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 font-medium">No tasks scheduled</p>
                <p className="text-gray-500 text-sm mt-1">Add tasks to create a schedule</p>
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleTaskClick(task)}
                  className={`
                    p-4 hover:bg-gray-50 cursor-pointer transition-colors
                    ${selectedTask === task.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''}
                    ${task.critical_path ? 'border-l-4 border-red-500' : ''}
                    ${getPriorityColor(task.priority)}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-gray-900">{task.name}</h3>
                        {task.type === 'milestone' && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                            Milestone
                          </span>
                        )}
                        {task.critical_path && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                            Critical
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span>{new Date(task.start_date).toLocaleDateString()}</span>
                        <span>-</span>
                        <span>{new Date(task.end_date).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{task.duration} days</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Progress Bar */}
                      <div className="w-32">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getProgressColor(task.progress)} transition-all duration-300`}
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-600 mt-1 text-center">{task.progress}%</div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 capitalize">
                          {task.priority}
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedTask === task.id && task.description && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600">{task.description}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;

