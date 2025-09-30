import React from 'react';
import { formatCurrency } from '../../utils/finance';

interface BarChartProps {
    data: { label: string; value: number }[];
    barColor: string;
}

const BarChart: React.FC<BarChartProps> = ({ data, barColor }) => {
    const maxValue = Math.max(...data.map(d => d.value), 0);
    return (
        <div className="w-full h-64 flex items-end justify-around p-4 border rounded-lg bg-slate-50 dark:bg-slate-800">
            {data.map((item, index) => (
                <div key={`${item.label}-${index}`} className="flex flex-col items-center justify-end h-full w-full">
                    <div
                        className={`w-3/4 rounded-t-md transition-all duration-300 ${barColor}`}
                        style={{ height: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%` }}
                        title={formatCurrency(item.value)}
                    ></div>
                    <span className="text-xs mt-2 text-slate-600">{item.label}</span>
                </div>
            ))}
        </div>
    );
};

export default BarChart;
