/**
 * Performance Charts Component
 * Displays visual charts for project performance metrics
 */

import React from 'react';

interface ChartData {
  label: string;
  value: number;
  color: string;
  strokeColor: string;
}

export const PerformanceCharts: React.FC = () => {
  // Project completion data
  const projectData: ChartData[] = [
    { label: 'Completed', value: 65, color: 'bg-green-500', strokeColor: '#22c55e' },
    { label: 'In Progress', value: 25, color: 'bg-blue-500', strokeColor: '#3b82f6' },
    { label: 'Pending', value: 10, color: 'bg-yellow-500', strokeColor: '#eab308' }
  ];

  // Task status data
  const taskData: ChartData[] = [
    { label: 'Done', value: 142, color: 'bg-green-500', strokeColor: '#22c55e' },
    { label: 'Active', value: 47, color: 'bg-blue-500', strokeColor: '#3b82f6' },
    { label: 'Blocked', value: 8, color: 'bg-red-500', strokeColor: '#ef4444' }
  ];

  // Weekly progress data
  const weeklyData = [
    { day: 'Mon', tasks: 12, hours: 8 },
    { day: 'Tue', tasks: 15, hours: 9 },
    { day: 'Wed', tasks: 18, hours: 10 },
    { day: 'Thu', tasks: 14, hours: 8 },
    { day: 'Fri', tasks: 20, hours: 11 },
    { day: 'Sat', tasks: 5, hours: 3 },
    { day: 'Sun', tasks: 3, hours: 2 }
  ];

  const maxTasks = Math.max(...weeklyData.map(d => d.tasks));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Performance Overview</h3>
        <select className="text-sm border border-gray-300 rounded-md px-3 py-1">
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Last 90 days</option>
        </select>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status Pie Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">Project Status</h4>

          {/* Donut Chart */}
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-48 h-48">
              {/* Outer ring */}
              <svg className="w-full h-full transform -rotate-90">
                {projectData.map((item, index) => {
                  const total = projectData.reduce((sum, d) => sum + d.value, 0);
                  const percentage = (item.value / total) * 100;
                  const circumference = 2 * Math.PI * 70;
                  const offset = projectData.slice(0, index).reduce((sum, d) => {
                    return sum + ((d.value / total) * circumference);
                  }, 0);

                  return (
                    <circle
                      key={item.label}
                      cx="96"
                      cy="96"
                      r="70"
                      fill="none"
                      stroke={item.strokeColor}
                      strokeWidth="24"
                      strokeDasharray={`${(percentage / 100) * circumference} ${circumference}`}
                      strokeDashoffset={-offset}
                    />
                  );
                })}
              </svg>

              {/* Center text */}
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-3xl font-bold text-gray-900">
                  {projectData.reduce((sum, d) => sum + d.value, 0)}
                </span>
                <span className="text-sm text-gray-500">Projects</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-2">
            {projectData.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className="text-sm text-gray-600">{item.label}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Task Distribution Bar Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">Task Distribution</h4>

          <div className="space-y-4">
            {taskData.map((item) => {
              const total = taskData.reduce((sum, d) => sum + d.value, 0);
              const percentage = (item.value / total) * 100;

              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`${item.color} h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}%</div>
                </div>
              );
            })}
          </div>

          {/* Total */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Total Tasks</span>
              <span className="text-lg font-bold text-gray-900">
                {taskData.reduce((sum, d) => sum + d.value, 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Weekly Activity Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">Weekly Activity</h4>

          <div className="flex items-end justify-between gap-2 h-48">
            {weeklyData.map((day) => {
              const heightPercentage = (day.tasks / maxTasks) * 100;

              return (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                  {/* Bar */}
                  <div className="w-full flex flex-col items-center justify-end h-40">
                    <div className="relative w-full group">
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                          {day.tasks} tasks • {day.hours}h
                        </div>
                      </div>

                      {/* Bar */}
                      <div
                        className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-300 hover:from-blue-600 hover:to-blue-500 cursor-pointer"
                        style={{ height: `${heightPercentage}%`, minHeight: '8px' }}
                      ></div>
                    </div>
                  </div>

                  {/* Label */}
                  <span className="text-xs font-medium text-gray-600">{day.day}</span>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="mt-6 pt-4 border-t border-gray-200 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {weeklyData.reduce((sum, d) => sum + d.tasks, 0)}
              </div>
              <div className="text-xs text-gray-500">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {weeklyData.reduce((sum, d) => sum + d.hours, 0)}h
              </div>
              <div className="text-xs text-gray-500">Total Hours</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {(weeklyData.reduce((sum, d) => sum + d.tasks, 0) / 7).toFixed(1)}
              </div>
              <div className="text-xs text-gray-500">Avg Tasks/Day</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

