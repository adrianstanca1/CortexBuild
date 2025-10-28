import React, { useState } from 'react';
import { User, Project, Permission } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { hasPermission } from '../services/auth';
import { api } from '../services/apiService';

interface ReportBuilderProps {
  user: User;
  projects: Project[];
  addToast: (message: string, type: 'success' | 'error') => void;
}

type ReportType = 'project' | 'team' | 'financial' | 'safety' | 'custom';
type ExportFormat = 'pdf' | 'excel' | 'csv';
type DateRange = 'week' | 'month' | 'quarter' | 'year' | 'custom';

interface ReportConfig {
  type: ReportType;
  title: string;
  dateRange: DateRange;
  customStartDate?: Date;
  customEndDate?: Date;
  selectedProjects: number[];
  includeCharts: boolean;
  includeDetails: boolean;
  sections: {
    summary: boolean;
    tasks: boolean;
    budget: boolean;
    timeline: boolean;
    safety: boolean;
    team: boolean;
  };
}

export const ReportBuilder: React.FC<ReportBuilderProps> = ({ user, projects, addToast }) => {
  const [config, setConfig] = useState<ReportConfig>({
    type: 'project',
    title: 'Project Report',
    dateRange: 'month',
    selectedProjects: [],
    includeCharts: true,
    includeDetails: true,
    sections: {
      summary: true,
      tasks: true,
      budget: true,
      timeline: true,
      safety: true,
      team: true
    }
  });
  const [exportFormat, setExportFormat] = useState<ExportFormat>('pdf');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const reportTypes = [
    { value: 'project' as const, label: 'Project Report', icon: '📊' },
    { value: 'team' as const, label: 'Team Performance', icon: '👥' },
    { value: 'financial' as const, label: 'Financial Summary', icon: '💰' },
    { value: 'safety' as const, label: 'Safety Analysis', icon: '🛡️' },
    { value: 'custom' as const, label: 'Custom Report', icon: '⚙️' }
  ];

  const handleGenerateReport = async () => {
    if (config.selectedProjects.length === 0 && config.type === 'project') {
      addToast('Please select at least one project', 'error');
      return;
    }

    setIsGenerating(true);
    try {
      // Generate report
      const reportData = await api.generateReport({
        userId: user.id,
        config,
        format: exportFormat
      });

      // Trigger download
      const blob = new Blob([reportData], {
        type: exportFormat === 'pdf' ? 'application/pdf' :
              exportFormat === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
              'text/csv'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${config.title.replace(/\s+/g, '_')}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      addToast('Report generated successfully!', 'success');
    } catch (error) {
      addToast('Failed to generate report', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const canCreateReports = hasPermission(user, Permission.MANAGE_PROJECTS) || 
                          hasPermission(user, Permission.VIEW_ALL_PROJECTS);

  if (!canCreateReports) {
    return (
      <Card className="p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            Insufficient Permissions
          </h3>
          <p className="text-sm text-slate-500">
            You don't have permission to generate reports.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-bold text-slate-800 mb-6">📊 Report Builder</h3>

        {/* Report Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Report Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {reportTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setConfig({ ...config, type: type.value, title: type.label })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  config.type === type.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-3xl mb-2">{type.icon}</div>
                <div className="text-sm font-medium text-slate-700">{type.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Report Title */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Report Title
          </label>
          <input
            type="text"
            value={config.title}
            onChange={(e) => setConfig({ ...config, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter report title"
          />
        </div>

        {/* Date Range */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Date Range
          </label>
          <div className="flex gap-2">
            {(['week', 'month', 'quarter', 'year', 'custom'] as DateRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setConfig({ ...config, dateRange: range })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  config.dateRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Project Selection */}
        {(config.type === 'project' || config.type === 'custom') && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Select Projects
            </label>
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-2">
              {projects.map((project) => (
                <label key={project.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.selectedProjects.includes(project.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setConfig({
                          ...config,
                          selectedProjects: [...config.selectedProjects, project.id]
                        });
                      } else {
                        setConfig({
                          ...config,
                          selectedProjects: config.selectedProjects.filter(id => id !== project.id)
                        });
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">{project.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Report Sections */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Include Sections
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(config.sections).map(([key, value]) => (
              <label key={key} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setConfig({
                    ...config,
                    sections: { ...config.sections, [key]: e.target.checked }
                  })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700 capitalize">{key}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="mb-6 space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={config.includeCharts}
              onChange={(e) => setConfig({ ...config, includeCharts: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-700">Include charts and graphs</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={config.includeDetails}
              onChange={(e) => setConfig({ ...config, includeDetails: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-700">Include detailed breakdowns</span>
          </label>
        </div>

        {/* Export Format */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Export Format
          </label>
          <div className="flex gap-3">
            {(['pdf', 'excel', 'csv'] as ExportFormat[]).map((format) => (
              <button
                key={format}
                onClick={() => setExportFormat(format)}
                className={`px-6 py-3 rounded-lg border-2 transition-all ${
                  exportFormat === format
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">
                  {format === 'pdf' ? '📄' : format === 'excel' ? '📊' : '📋'}
                </div>
                <div className="text-sm font-medium text-slate-700 uppercase">{format}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleGenerateReport}
            isLoading={isGenerating}
            disabled={isGenerating}
            className="flex-1"
          >
            Generate Report
          </Button>
          <Button
            onClick={() => setShowScheduleModal(true)}
            variant="secondary"
          >
            Schedule Report
          </Button>
        </div>
      </Card>

      {/* Report Templates */}
      <Card className="p-6">
        <h4 className="font-semibold text-slate-700 mb-4">📑 Quick Templates</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              setConfig({
                ...config,
                type: 'project',
                title: 'Weekly Project Summary',
                dateRange: 'week',
                sections: { ...config.sections, summary: true, tasks: true, timeline: true }
              });
            }}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-all text-left"
          >
            <h5 className="font-semibold text-slate-700 mb-1">Weekly Summary</h5>
            <p className="text-xs text-slate-500">Quick overview of project progress</p>
          </button>
          <button
            onClick={() => {
              setConfig({
                ...config,
                type: 'financial',
                title: 'Monthly Financial Report',
                dateRange: 'month',
                sections: { ...config.sections, budget: true, summary: true }
              });
            }}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-all text-left"
          >
            <h5 className="font-semibold text-slate-700 mb-1">Monthly Finance</h5>
            <p className="text-xs text-slate-500">Budget and cost analysis</p>
          </button>
          <button
            onClick={() => {
              setConfig({
                ...config,
                type: 'team',
                title: 'Team Performance Report',
                dateRange: 'month',
                sections: { ...config.sections, team: true, tasks: true }
              });
            }}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-all text-left"
          >
            <h5 className="font-semibold text-slate-700 mb-1">Team Performance</h5>
            <p className="text-xs text-slate-500">Team productivity metrics</p>
          </button>
        </div>
      </Card>
    </div>
  );
};
