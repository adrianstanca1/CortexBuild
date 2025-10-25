import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Search, Download } from 'lucide-react';

export interface Column<T> {
    key: keyof T;
    label: string;
    sortable?: boolean;
    filterable?: boolean;
    render?: (value: any, row: T) => React.ReactNode;
    width?: string;
}

interface DataTableProps<T extends { id: string }> {
    data: T[];
    columns: Column<T>[];
    isLoading?: boolean;
    onRowSelect?: (selectedIds: string[]) => void;
    onExport?: (data: T[]) => void;
    pageSize?: number;
    title?: string;
}

const DataTable = React.forwardRef<HTMLDivElement, DataTableProps<any>>(
    ({ data, columns, isLoading = false, onRowSelect, onExport, pageSize = 10, title }, ref) => {
        const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
        const [searchTerm, setSearchTerm] = useState('');
        const [currentPage, setCurrentPage] = useState(1);
        const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

        // Filter data
        const filteredData = useMemo(() => {
            return data.filter(row =>
                columns.some(col => {
                    const value = row[col.key];
                    return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
                })
            );
        }, [data, searchTerm, columns]);

        // Sort data
        const sortedData = useMemo(() => {
            if (!sortConfig) return filteredData;

            const sorted = [...filteredData].sort((a, b) => {
                const aValue = a[sortConfig.key as keyof typeof a];
                const bValue = b[sortConfig.key as keyof typeof b];

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });

            return sorted;
        }, [filteredData, sortConfig]);

        // Paginate data
        const paginatedData = useMemo(() => {
            const startIndex = (currentPage - 1) * pageSize;
            return sortedData.slice(startIndex, startIndex + pageSize);
        }, [sortedData, currentPage, pageSize]);

        const totalPages = Math.ceil(sortedData.length / pageSize);

        const handleSort = (key: string) => {
            setSortConfig(prev => {
                if (prev?.key === key) {
                    return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
                }
                return { key, direction: 'asc' };
            });
            setCurrentPage(1);
        };

        const handleSelectAll = () => {
            if (selectedRows.size === paginatedData.length) {
                setSelectedRows(new Set());
            } else {
                setSelectedRows(new Set(paginatedData.map(row => row.id)));
            }
        };

        const handleSelectRow = (id: string) => {
            const newSelected = new Set(selectedRows);
            if (newSelected.has(id)) {
                newSelected.delete(id);
            } else {
                newSelected.add(id);
            }
            setSelectedRows(newSelected);
            onRowSelect?.(Array.from(newSelected));
        };

        const handleExport = () => {
            const csv = [
                columns.map(col => col.label).join(','),
                ...sortedData.map(row =>
                    columns.map(col => {
                        const value = row[col.key];
                        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
                    }).join(',')
                )
            ].join('\n');

            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${title || 'data'}-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            onExport?.(sortedData);
        };

        if (isLoading) {
            return (
                <div className="bg-white rounded-lg shadow-md p-8">
                    <div className="animate-pulse space-y-4">
                        <div className="h-10 bg-gray-200 rounded"></div>
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-12 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            );
        }

        return (
            <div ref={ref} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="px-6 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                                        onChange={handleSelectAll}
                                        className="w-4 h-4 rounded"
                                        aria-label="Select all rows"
                                        title="Select all rows"
                                    />
                                </th>
                                {columns.map(col => (
                                    <th
                                        key={String(col.key)}
                                        className={`px-6 py-3 text-left font-semibold text-gray-900 ${col.sortable ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                                        onClick={() => col.sortable && handleSort(String(col.key))}
                                    >
                                        <div className="flex items-center gap-2">
                                            {col.label}
                                            {col.sortable && sortConfig?.key === String(col.key) && (
                                                sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.map(row => (
                                <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="px-6 py-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedRows.has(row.id)}
                                            onChange={() => handleSelectRow(row.id)}
                                            className="w-4 h-4 rounded"
                                            aria-label={`Select row ${row.id}`}
                                            title={`Select row ${row.id}`}
                                        />
                                    </td>
                                    {columns.map(col => (
                                        <td key={String(col.key)} className="px-6 py-3 text-gray-900">
                                            {col.render ? col.render(row[col.key], row) : row[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Empty State */}
                {paginatedData.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <p>No data found</p>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                            Page {currentPage} of {totalPages} ({sortedData.length} total)
                        </span>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                type="button"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }
);

DataTable.displayName = 'DataTable';

export default DataTable;

