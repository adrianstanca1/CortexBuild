import React from 'react';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  showLabel?: boolean;
  label?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  color = '#3b82f6',
  showLabel = true,
  label
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-800">{Math.round(progress)}%</span>
          {label && <span className="text-xs text-slate-500 mt-1">{label}</span>}
        </div>
      )}
    </div>
  );
};

interface ProgressBarProps {
  progress: number;
  color?: string;
  height?: string;
  showLabel?: boolean;
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = 'bg-blue-500',
  height = 'h-2',
  showLabel = false,
  animated = true
}) => {
  return (
    <div className="w-full">
      <div className={`w-full ${height} bg-gray-200 rounded-full overflow-hidden`}>
        <div
          className={`${color} ${height} rounded-full ${animated ? 'transition-all duration-500' : ''}`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1 text-xs text-slate-600">
          <span>{Math.round(progress)}%</span>
          <span>Complete</span>
        </div>
      )}
    </div>
  );
};

interface MilestoneProgressProps {
  milestones: {
    name: string;
    completed: boolean;
    date?: Date;
  }[];
}

export const MilestoneProgress: React.FC<MilestoneProgressProps> = ({ milestones }) => {
  const completedCount = milestones.filter(m => m.completed).length;
  const progress = (completedCount / milestones.length) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-slate-700">Project Milestones</h4>
        <span className="text-sm text-slate-500">
          {completedCount}/{milestones.length} Complete
        </span>
      </div>
      <ProgressBar progress={progress} color="bg-green-500" showLabel />
      <div className="space-y-2">
        {milestones.map((milestone, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              milestone.completed ? 'bg-green-500' : 'bg-gray-300'
            }`}>
              {milestone.completed && (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${milestone.completed ? 'text-slate-700' : 'text-slate-500'}`}>
                {milestone.name}
              </p>
              {milestone.date && (
                <p className="text-xs text-slate-400">
                  {new Date(milestone.date).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
