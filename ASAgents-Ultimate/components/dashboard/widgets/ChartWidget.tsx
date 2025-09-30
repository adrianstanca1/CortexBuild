import React, { useMemo } from 'react';
import { DashboardWidget } from './DashboardWidget';

interface ChartWidgetProps {
  title: string;
  size: 'small' | 'medium' | 'large' | 'full';
  editMode: boolean;
  data: any;
  chartType: 'bar' | 'line' | 'pie' | 'area' | 'donut';
  config: any;
  onConfigChange: (config: any) => void;
  onToggleVisibility: () => void;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
  }[];
}

const SimpleBarChart: React.FC<{ data: ChartData; height?: number }> = ({ data, height = 200 }) => {
  const maxValue = Math.max(...data.datasets[0].data);
  
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between" style={{ height: `${height}px` }}>
        {data.labels.map((label, index) => {
          const value = data.datasets[0].data[index];
          const barHeight = (value / maxValue) * (height - 40);
          
          return (
            <div key={label} className="flex flex-col items-center gap-2 flex-1">
              <div className="text-xs font-medium text-gray-600">{value}</div>
              <div
                className="bg-primary rounded-t-sm w-8 transition-all duration-300 hover:bg-primary/80"
                style={{ height: `${barHeight}px`, minHeight: '4px' }}
              />
              <div className="text-xs text-gray-500 text-center">{label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const SimpleLineChart: React.FC<{ data: ChartData; height?: number }> = ({ data, height = 200 }) => {
  const maxValue = Math.max(...data.datasets[0].data);
  const points = data.datasets[0].data.map((value, index) => ({
    x: (index / (data.labels.length - 1)) * 100,
    y: 100 - (value / maxValue) * 80,
  }));

  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');

  return (
    <div className="space-y-4">
      <div className="relative" style={{ height: `${height}px` }}>
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path
            d={pathData}
            fill="none"
            stroke="rgb(59 130 246)"
            strokeWidth="0.5"
            className="drop-shadow-sm"
          />
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="1"
              fill="rgb(59 130 246)"
              className="drop-shadow-sm"
            />
          ))}
        </svg>
        
        {/* Data points overlay */}
        <div className="absolute inset-0 flex items-end justify-between px-2">
          {data.labels.map((label, index) => (
            <div key={label} className="flex flex-col items-center">
              <div className="text-xs font-medium text-gray-600 mb-1">
                {data.datasets[0].data[index]}
              </div>
              <div className="text-xs text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SimplePieChart: React.FC<{ data: ChartData; height?: number }> = ({ data, height = 200 }) => {
  const total = data.datasets[0].data.reduce((sum, value) => sum + value, 0);
  let currentAngle = 0;

  const segments = data.datasets[0].data.map((value, index) => {
    const percentage = (value / total) * 100;
    const angle = (value / total) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;

    const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
    const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
    const x2 = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
    const y2 = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);

    const largeArcFlag = angle > 180 ? 1 : 0;

    return {
      path: `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`,
      color: `hsl(${(index * 360) / data.labels.length}, 70%, 50%)`,
      label: data.labels[index],
      value,
      percentage: percentage.toFixed(1),
    };
  });

  return (
    <div className="flex items-center gap-6">
      <div style={{ width: `${height}px`, height: `${height}px` }}>
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {segments.map((segment, index) => (
            <path
              key={index}
              d={segment.path}
              fill={segment.color}
              className="hover:opacity-80 transition-opacity cursor-pointer"
            />
          ))}
        </svg>
      </div>
      
      <div className="space-y-2">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-sm text-gray-700">{segment.label}</span>
            <span className="text-sm font-medium text-gray-900">
              {segment.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ChartWidget: React.FC<ChartWidgetProps> = ({
  title,
  size,
  editMode,
  data,
  chartType,
  config,
  onConfigChange,
  onToggleVisibility,
}) => {
  const chartData = useMemo(() => {
    if (!data) return null;

    // Generate sample chart data based on dashboard metrics
    switch (chartType) {
      case 'bar':
        return {
          labels: ['Projects', 'Tasks', 'Team', 'Budget'],
          datasets: [{
            label: 'Progress',
            data: [
              data.projects?.active || 0,
              data.tasks?.completed || 0,
              data.team?.active || 0,
              (data.projects?.budget?.spent || 0) / 1000,
            ],
          }],
        };
      
      case 'line':
        return {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Revenue Trend',
            data: [45, 52, 48, 61, 58, 67],
          }],
        };
      
      case 'pie':
        return {
          labels: ['Completed', 'In Progress', 'Pending', 'Overdue'],
          datasets: [{
            label: 'Task Distribution',
            data: [
              data.tasks?.completed || 0,
              data.tasks?.inProgress || 0,
              (data.tasks?.total || 0) - (data.tasks?.completed || 0) - (data.tasks?.inProgress || 0) - (data.tasks?.overdue || 0),
              data.tasks?.overdue || 0,
            ],
          }],
        };
      
      default:
        return null;
    }
  }, [data, chartType]);

  const renderChart = () => {
    if (!chartData) return <div>No data available</div>;

    switch (chartType) {
      case 'bar':
        return <SimpleBarChart data={chartData} />;
      case 'line':
        return <SimpleLineChart data={chartData} />;
      case 'pie':
      case 'donut':
        return <SimplePieChart data={chartData} />;
      default:
        return <div>Chart type not supported</div>;
    }
  };

  return (
    <DashboardWidget
      title={title}
      size={size}
      editMode={editMode}
      onConfigChange={onConfigChange}
      onToggleVisibility={onToggleVisibility}
    >
      <div className="space-y-4">
        {/* Chart Type Selector (in edit mode) */}
        {editMode && (
          <div className="flex gap-2 p-2 bg-gray-50 rounded">
            {['bar', 'line', 'pie'].map((type) => (
              <button
                key={type}
                className={`px-3 py-1 text-xs rounded ${
                  chartType === type
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => onConfigChange({ chartType: type })}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        )}

        {/* Chart */}
        <div className="min-h-[200px]">
          {renderChart()}
        </div>

        {/* Chart Summary */}
        {chartData && (
          <div className="text-center text-sm text-gray-600">
            Showing {chartData.labels.length} data points
          </div>
        )}
      </div>
    </DashboardWidget>
  );
};
