import React, { useState, useRef, useEffect } from 'react';
import { Calendar, X } from 'lucide-react';

interface DateRange {
    start: Date;
    end: Date;
}

interface DateRangeFilterProps {
    value?: DateRange;
    onChange?: (range: DateRange) => void;
    placeholder?: string;
}

const PRESET_RANGES = [
    {
        label: 'Today',
        getValue: () => {
            const today = new Date();
            return { start: today, end: today };
        }
    },
    {
        label: 'Last 7 days',
        getValue: () => {
            const end = new Date();
            const start = new Date(end);
            start.setDate(start.getDate() - 7);
            return { start, end };
        }
    },
    {
        label: 'Last 30 days',
        getValue: () => {
            const end = new Date();
            const start = new Date(end);
            start.setDate(start.getDate() - 30);
            return { start, end };
        }
    },
    {
        label: 'This month',
        getValue: () => {
            const today = new Date();
            const start = new Date(today.getFullYear(), today.getMonth(), 1);
            return { start, end: today };
        }
    },
    {
        label: 'Last month',
        getValue: () => {
            const today = new Date();
            const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const end = new Date(today.getFullYear(), today.getMonth(), 0);
            return { start, end };
        }
    }
];

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
    value,
    onChange,
    placeholder = 'Select date range...'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [startDate, setStartDate] = useState<string>(
        value?.start ? value.start.toISOString().split('T')[0] : ''
    );
    const [endDate, setEndDate] = useState<string>(
        value?.end ? value.end.toISOString().split('T')[0] : ''
    );
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handlePresetClick = (preset: typeof PRESET_RANGES[0]) => {
        const range = preset.getValue();
        setStartDate(range.start.toISOString().split('T')[0]);
        setEndDate(range.end.toISOString().split('T')[0]);
        onChange?.(range);
        setIsOpen(false);
    };

    const handleApply = () => {
        if (startDate && endDate) {
            onChange?.({
                start: new Date(startDate),
                end: new Date(endDate)
            });
            setIsOpen(false);
        }
    };

    const handleClear = () => {
        setStartDate('');
        setEndDate('');
        onChange?.({ start: new Date(), end: new Date() });
    };

    const displayText = startDate && endDate
        ? `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
        : placeholder;

    return (
        <div ref={containerRef} className="relative w-full">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:border-gray-400 focus:ring-2 focus:ring-blue-500"
            >
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className={startDate && endDate ? 'text-gray-900' : 'text-gray-500'}>
                        {displayText}
                    </span>
                </div>
                {startDate && endDate && (
                    <X
                        className="w-4 h-4 text-gray-400 hover:text-gray-600"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClear();
                        }}
                    />
                )}
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4">
                    {/* Presets */}
                    <div className="mb-4">
                        <label className="block text-xs font-semibold text-gray-700 mb-2">Quick Select</label>
                        <div className="grid grid-cols-2 gap-2">
                            {PRESET_RANGES.map(preset => (
                                <button
                                    key={preset.label}
                                    type="button"
                                    onClick={() => handlePresetClick(preset)}
                                    className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-blue-50 hover:border-blue-300 transition-colors text-gray-700"
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                        <label className="block text-xs font-semibold text-gray-700 mb-2">Custom Range</label>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                    aria-label="Start date"
                                    title="Start date"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">End Date</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                    aria-label="End date"
                                    title="End date"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex gap-2">
                        <button
                            type="button"
                            onClick={handleClear}
                            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
                        >
                            Clear
                        </button>
                        <button
                            type="button"
                            onClick={handleApply}
                            disabled={!startDate || !endDate}
                            className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Apply
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DateRangeFilter;

