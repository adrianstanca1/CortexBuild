import React from 'react';

export type BarChartDatum = { label: string; value: number };

export const BarChart: React.FC<{ data: BarChartDatum[]; barColor?: string; className?: string; formatLabel?: (n: number) => string }>
  = ({ data, barColor = 'bg-sky-600', className = '', formatLabel }) => {
  const maxValue = Math.max(0, ...data.map(d => d.value));
  return (
    <div className={`w-full h-64 flex items-end justify-around p-4 border rounded-lg bg-slate-50 dark:bg-slate-800 ${className}`}>
      {data.map((item, i) => (
        <div key={i} className="flex flex-col items-center justify-end h-full w-full">
          <div
            className={`w-3/4 rounded-t-md ${barColor}`}
            style={{ height: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%` }}
            title={formatLabel ? formatLabel(item.value) : String(item.value)}
          />
          <span className="text-xs mt-2 text-slate-600">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default BarChart;

