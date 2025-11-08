import React, { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, FileText, Sheet } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import toast from 'react-hot-toast';

interface ExportButtonProps {
    data: any[];
    columns?: { key: string; label: string }[];
    filename?: string;
    title?: string;
    formats?: ('csv' | 'pdf')[];
    onExport?: (format: 'csv' | 'pdf') => void;
}

const ExportButton: React.FC<ExportButtonProps> = ({
    data,
    columns,
    filename = 'export',
    title = 'Report',
    formats = ['csv', 'pdf'],
    onExport
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
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

    const getColumns = () => {
        if (columns) return columns;
        if (data.length === 0) return [];
        return Object.keys(data[0]).map(key => ({ key, label: key }));
    };

    const exportToCSV = async () => {
        try {
            setIsExporting(true);
            const cols = getColumns();
            const csv = [
                cols.map(col => col.label).join(','),
                ...data.map(row =>
                    cols.map(col => {
                        const value = row[col.key];
                        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
                    }).join(',')
                )
            ].join('\n');

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success('Exported to CSV');
            onExport?.('csv');
            setIsOpen(false);
        } catch (error) {
            console.error('Error exporting to CSV:', error);
            toast.error('Failed to export CSV');
        } finally {
            setIsExporting(false);
        }
    };

    const exportToPDF = async () => {
        try {
            setIsExporting(true);
            const cols = getColumns();
            const doc = new jsPDF();

            // Title
            doc.setFontSize(16);
            doc.text(title, 14, 15);
            doc.setFontSize(10);
            doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 25);

            // Table
            const tableData = data.map(row =>
                cols.map(col => {
                    const value = row[col.key];
                    if (typeof value === 'number') return value.toLocaleString();
                    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
                    return value || '';
                })
            );

            (doc as any).autoTable({
                head: [cols.map(col => col.label)],
                body: tableData,
                startY: 35,
                theme: 'grid',
                headStyles: {
                    fillColor: [59, 130, 246],
                    textColor: 255,
                    fontStyle: 'bold'
                },
                alternateRowStyles: {
                    fillColor: [245, 245, 245]
                }
            });

            // Footer
            const pageCount = (doc as any).internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.text(
                    `Page ${i} of ${pageCount}`,
                    doc.internal.pageSize.getWidth() / 2,
                    doc.internal.pageSize.getHeight() - 10,
                    { align: 'center' }
                );
            }

            doc.save(`${filename}-${new Date().toISOString().split('T')[0]}.pdf`);
            toast.success('Exported to PDF');
            onExport?.('pdf');
            setIsOpen(false);
        } catch (error) {
            console.error('Error exporting to PDF:', error);
            toast.error('Failed to export PDF');
        } finally {
            setIsExporting(false);
        }
    };

    const handleExport = (format: 'csv' | 'pdf') => {
        if (data.length === 0) {
            toast.error('No data to export');
            return;
        }

        if (format === 'csv') {
            exportToCSV();
        } else {
            exportToPDF();
        }
    };

    if (formats.length === 1) {
        return (
            <button
                type="button"
                onClick={() => handleExport(formats[0])}
                disabled={isExporting || data.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Download className="w-4 h-4" />
                {isExporting ? 'Exporting...' : `Export (${formats[0].toUpperCase()})`}
            </button>
        );
    }

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                disabled={isExporting || data.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Download className="w-4 h-4" />
                {isExporting ? 'Exporting...' : 'Export'}
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-48">
                    {formats.includes('csv') && (
                        <button
                            type="button"
                            onClick={() => handleExport('csv')}
                            disabled={isExporting}
                            className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors disabled:opacity-50 border-b border-gray-200"
                        >
                            <Sheet className="w-4 h-4 text-green-600" />
                            <div>
                                <div className="font-medium text-gray-900">Export as CSV</div>
                                <div className="text-xs text-gray-600">Spreadsheet format</div>
                            </div>
                        </button>
                    )}

                    {formats.includes('pdf') && (
                        <button
                            type="button"
                            onClick={() => handleExport('pdf')}
                            disabled={isExporting}
                            className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            <FileText className="w-4 h-4 text-red-600" />
                            <div>
                                <div className="font-medium text-gray-900">Export as PDF</div>
                                <div className="text-xs text-gray-600">Document format</div>
                            </div>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ExportButton;

