import React, { useState } from 'react';

export interface ChartDataPoint {
    label: string;
    value: number;
    color?: string;
}

interface AnalyticsChartProps {
    data: ChartDataPoint[];
    type: 'bar' | 'line' | 'pie';
    title?: string;
    height?: number;
    showLegend?: boolean;
    showTooltip?: boolean;
    colors?: string[];
}

const DEFAULT_COLORS = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#06B6D4', '#84CC16'
];

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
    data,
    type,
    title,
    height = 300,
    showLegend = true,
    showTooltip = true,
    colors = DEFAULT_COLORS
}) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-8 flex items-center justify-center" style={{ height }}>
                <p className="text-gray-500">No data available</p>
            </div>
        );
    }

    const maxValue = Math.max(...data.map(d => d.value));
    const total = data.reduce((sum, d) => sum + d.value, 0);

    const renderBarChart = () => {
        return (
            <div className="flex items-end justify-around gap-4 h-full">
                {data.map((point, idx) => {
                    const percentage = (point.value / maxValue) * 100;
                    const color = point.color || colors[idx % colors.length];

                    return (
                        <div
                            key={idx}
                            className="flex flex-col items-center gap-2 flex-1"
                            onMouseEnter={() => setHoveredIndex(idx)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <div className="relative w-full flex items-end justify-center h-[200px]">
                                <div
                                    className="w-full rounded-t transition-all duration-200 hover:opacity-80 cursor-pointer"
                                    style={{
                                        backgroundColor: color,
                                        height: `${percentage}%`,
                                        opacity: hoveredIndex === null || hoveredIndex === idx ? 1 : 0.5
                                    }}
                                >
                                    {hoveredIndex === idx && showTooltip && (
                                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                                            {point.value}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <span className="text-xs text-gray-600 text-center truncate w-full">{point.label}</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderLineChart = () => {
        const points = data.map((point, idx) => ({
            x: (idx / (data.length - 1 || 1)) * 100,
            y: 100 - (point.value / maxValue) * 100,
            ...point
        }));

        const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

        return (
            <svg width="100%" height={height} className="mb-4">
                <polyline
                    points={points.map(p => `${(p.x / 100) * 100}%,${p.y}%`).join(' ')}
                    fill="none"
                    stroke={colors[0]}
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                />
                {points.map((point, idx) => (
                    <g key={idx}>
                        <circle
                            cx={`${point.x}%`}
                            cy={`${point.y}%`}
                            r="4"
                            fill={colors[0]}
                            className="cursor-pointer hover:r-6 transition-all"
                            onMouseEnter={() => setHoveredIndex(idx)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        />
                        {hoveredIndex === idx && showTooltip && (
                            <text
                                x={`${point.x}%`}
                                y={`${point.y - 2}%`}
                                textAnchor="middle"
                                className="text-xs fill-gray-900 font-semibold"
                            >
                                {point.value}
                            </text>
                        )}
                    </g>
                ))}
            </svg>
        );
    };

    const renderPieChart = () => {
        let currentAngle = -90;
        const slices = data.map((point, idx) => {
            const sliceAngle = (point.value / total) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + sliceAngle;
            currentAngle = endAngle;

            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;
            const radius = 80;
            const x1 = 100 + radius * Math.cos(startRad);
            const y1 = 100 + radius * Math.sin(startRad);
            const x2 = 100 + radius * Math.cos(endRad);
            const y2 = 100 + radius * Math.sin(endRad);

            const largeArc = sliceAngle > 180 ? 1 : 0;
            const pathD = `M 100 100 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

            return { pathD, color: point.color || colors[idx % colors.length], point, idx };
        });

        return (
            <div className="flex items-center justify-center gap-8">
                <svg width="200" height="200" viewBox="0 0 200 200">
                    {slices.map((slice, idx) => (
                        <path
                            key={idx}
                            d={slice.pathD}
                            fill={slice.color}
                            opacity={hoveredIndex === null || hoveredIndex === idx ? 1 : 0.5}
                            className="cursor-pointer transition-opacity"
                            onMouseEnter={() => setHoveredIndex(idx)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        />
                    ))}
                </svg>
                {showLegend && (
                    <div className="space-y-2">
                        {data.map((point, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: point.color || colors[idx % colors.length] }}
                                />
                                <span className="text-sm text-gray-700">{point.label}</span>
                                <span className="text-sm font-semibold text-gray-900">
                                    {((point.value / total) * 100).toFixed(1)}%
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}

            <div style={{ height: type === 'pie' ? 'auto' : height }}>
                {type === 'bar' && renderBarChart()}
                {type === 'line' && renderLineChart()}
                {type === 'pie' && renderPieChart()}
            </div>

            {showLegend && type !== 'pie' && (
                <div className="mt-4 flex flex-wrap gap-4 justify-center">
                    {data.map((point, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded"
                                style={{ backgroundColor: point.color || colors[idx % colors.length] }}
                            />
                            <span className="text-sm text-gray-700">{point.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AnalyticsChart;

