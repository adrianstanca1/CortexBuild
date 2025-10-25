/**
 * Report Builder Component
 * Allows users to create and configure custom reports
 */

import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Filter, Users, Save, X } from 'lucide-react';
import { reportingService, Report, ReportTemplate } from '../../lib/services/reportingService';

export interface ReportBuilderProps {
  userId: string;
  projectId?: string;
  companyId?: string;
  isDarkMode?: boolean;
  onSave?: (report: Report) => void;
  onCancel?: () => void;
}

export const ReportBuilder: React.FC<ReportBuilderProps> = ({
  userId,
  projectId,
  companyId,
  isDarkMode = false,
  onSave,
  onCancel
}) => {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [reportName, setReportName] = useState('');
  const [description, setDescription] = useState('');
  const [schedule, setSchedule] = useState<Report['schedule']>('never');
  const [recipients, setRecipients] = useState<string>('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await reportingService.getTemplates();
      setTemplates(data);
    } catch (err) {
      console.error('Error loading templates:', err);
      setError('Failed to load templates');
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template && template.default_filters) {
      setFilters(template.default_filters);
    }
  };

  const handleSave = async () => {
    if (!reportName.trim()) {
      setError('Report name is required');
      return;
    }

    if (!selectedTemplate) {
      setError('Please select a template');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const template = templates.find(t => t.id === selectedTemplate);
      if (!template) throw new Error('Template not found');

      const recipientList = recipients
        .split(',')
        .map(r => r.trim())
        .filter(r => r.length > 0);

      const report = await reportingService.createReport(
        reportName,
        template.category as Report['template_type'],
        userId,
        {
          description,
          projectId,
          companyId,
          filters,
          schedule,
          recipients: recipientList
        }
      );

      if (report && onSave) {
        onSave(report);
      }
    } catch (err) {
      console.error('Error creating report:', err);
      setError('Failed to create report');
    } finally {
      setLoading(false);
    }
  };

  const bgClass = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const textClass = isDarkMode ? 'text-white' : 'text-gray-900';
  const borderClass = isDarkMode ? 'border-gray-700' : 'border-gray-300';
  const inputBgClass = isDarkMode ? 'bg-gray-700' : 'bg-white';

  return (
    <div className={`${bgClass} ${textClass} rounded-lg shadow-lg p-6 max-w-4xl mx-auto`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Create New Report</h2>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {/* Form */}
      <div className="space-y-6">
        {/* Report Name */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Report Name *
          </label>
          <input
            type="text"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            className={`w-full px-4 py-2 border ${borderClass} ${inputBgClass} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            placeholder="Enter report name"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`w-full px-4 py-2 border ${borderClass} ${inputBgClass} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            rows={3}
            placeholder="Enter report description"
          />
        </div>

        {/* Template Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">
            <Filter className="w-4 h-4 inline mr-2" />
            Report Template *
          </label>
          <select
            value={selectedTemplate}
            onChange={(e) => handleTemplateChange(e.target.value)}
            className={`w-full px-4 py-2 border ${borderClass} ${inputBgClass} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            aria-label="Report Template"
            title="Select a report template"
          >
            <option value="">-- Select a template --</option>
            {templates.map(template => (
              <option key={template.id} value={template.id}>
                {template.name} ({template.category})
              </option>
            ))}
          </select>
        </div>

        {/* Schedule */}
        <div>
          <label className="block text-sm font-medium mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            Schedule
          </label>
          <select
            value={schedule}
            onChange={(e) => setSchedule(e.target.value as Report['schedule'])}
            className={`w-full px-4 py-2 border ${borderClass} ${inputBgClass} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            aria-label="Schedule"
            title="Select report schedule"
          >
            <option value="never">Never (Manual only)</option>
            <option value="once">Once</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        {/* Recipients */}
        <div>
          <label className="block text-sm font-medium mb-2">
            <Users className="w-4 h-4 inline mr-2" />
            Email Recipients
          </label>
          <input
            type="text"
            value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
            className={`w-full px-4 py-2 border ${borderClass} ${inputBgClass} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            placeholder="email1@example.com, email2@example.com"
          />
          <p className="text-xs text-gray-500 mt-1">
            Separate multiple emails with commas
          </p>
        </div>

        {/* Date Range Filter */}
        {selectedTemplate && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Date Range
            </label>
            <select
              value={filters.date_range || 'month'}
              onChange={(e) => setFilters({ ...filters, date_range: e.target.value })}
              className={`w-full px-4 py-2 border ${borderClass} ${inputBgClass} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              aria-label="Date Range"
              title="Select date range for report"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
              <option value="project">Entire Project</option>
            </select>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-8">
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="w-5 h-5" />
          {loading ? 'Creating...' : 'Create Report'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

