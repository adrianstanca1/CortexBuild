/**
 * Report Viewer Component
 * Displays list of reports with actions (view, edit, delete, generate)
 */

import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Download, Trash2, Edit, Play, RefreshCw } from 'lucide-react';
import { reportingService, Report, ReportHistory } from '../../lib/services/reportingService';

export interface ReportViewerProps {
  userId: string;
  isDarkMode?: boolean;
  onEdit?: (report: Report) => void;
  onGenerate?: (report: Report) => void;
}

export const ReportViewer: React.FC<ReportViewerProps> = ({
  userId,
  isDarkMode = false,
  onEdit,
  onGenerate
}) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [history, setHistory] = useState<ReportHistory[]>([]);

  useEffect(() => {
    loadReports();
  }, [userId]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await reportingService.getReports(userId);
      setReports(data);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async (reportId: string) => {
    try {
      const data = await reportingService.getReportHistory(reportId);
      setHistory(data);
      setSelectedReport(reportId);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;

    try {
      await reportingService.deleteReport(reportId);
      setReports(reports.filter(r => r.id !== reportId));
      if (selectedReport === reportId) {
        setSelectedReport(null);
        setHistory([]);
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Failed to delete report');
    }
  };

  const handleGenerate = async (report: Report) => {
    try {
      await reportingService.generateReport(report.id, userId, 'json');
      alert('Report generation started. You will be notified when it\'s ready.');
      loadHistory(report.id);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    }
  };

  const getScheduleBadgeColor = (schedule?: string) => {
    switch (schedule) {
      case 'daily':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'weekly':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'monthly':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'generating':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const bgClass = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const textClass = isDarkMode ? 'text-white' : 'text-gray-900';
  const cardBgClass = isDarkMode ? 'bg-gray-700' : 'bg-gray-50';

  if (loading) {
    return (
      <div className={`${bgClass} ${textClass} rounded-lg shadow-lg p-6`}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${bgClass} ${textClass} rounded-lg shadow-lg p-6`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">My Reports</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {reports.length} report{reports.length !== 1 ? 's' : ''} created
          </p>
        </div>
        <button
          type="button"
          onClick={loadReports}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Refresh reports"
          title="Refresh reports"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {reports.map(report => (
          <div
            key={report.id}
            className={`${cardBgClass} rounded-lg p-4 hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start justify-between">
              {/* Report Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">{report.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getScheduleBadgeColor(report.schedule)}`}>
                    {report.schedule || 'never'}
                  </span>
                  {!report.is_active && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                      Inactive
                    </span>
                  )}
                </div>

                {report.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {report.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>Type: {report.template_type}</span>
                  {report.last_generated_at && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Last generated: {new Date(report.last_generated_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleGenerate(report)}
                  className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                  aria-label="Generate Report"
                  title="Generate Report"
                >
                  <Play className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => loadHistory(report.id)}
                  className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  aria-label="View History"
                  title="View History"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onEdit && onEdit(report)}
                  className="p-2 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-lg transition-colors"
                  aria-label="Edit Report"
                  title="Edit Report"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(report.id)}
                  className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  aria-label="Delete Report"
                  title="Delete Report"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* History (if selected) */}
            {selectedReport === report.id && history.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
                <h4 className="text-sm font-semibold mb-2">Generation History</h4>
                <div className="space-y-2">
                  {history.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(item.status)}`}>
                          {item.status}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {new Date(item.created_at).toLocaleString()}
                        </span>
                        {item.format && (
                          <span className="text-gray-500">({item.format})</span>
                        )}
                      </div>
                      {item.file_path && item.status === 'completed' && (
                        <button type="button" className="text-blue-600 hover:underline text-xs">
                          Download
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {reports.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            No reports created yet
          </p>
          <p className="text-sm text-gray-400">
            Create your first report to get started
          </p>
        </div>
      )}
    </div>
  );
};

