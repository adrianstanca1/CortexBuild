/**
 * Reporting Dashboard Component
 * Main dashboard for custom reporting tools
 * Combines ReportBuilder, ReportTemplates, and ReportViewer
 */

import React, { useState } from 'react';
import { FileText, Plus, Layout } from 'lucide-react';
import { ReportBuilder } from './ReportBuilder';
import { ReportTemplates } from './ReportTemplates';
import { ReportViewer } from './ReportViewer';
import { Report, ReportTemplate } from '../../lib/services/reportingService';

export interface ReportingDashboardProps {
  userId: string;
  projectId?: string;
  companyId?: string;
  isDarkMode?: boolean;
}

export const ReportingDashboard: React.FC<ReportingDashboardProps> = ({
  userId,
  projectId,
  companyId,
  isDarkMode = false
}) => {
  const [activeTab, setActiveTab] = useState<'reports' | 'templates' | 'create'>('reports');
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);

  const handleTemplateSelect = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setActiveTab('create');
  };

  const handleReportSaved = (report: Report) => {
    console.log('Report saved:', report);
    setActiveTab('reports');
    setSelectedTemplate(null);
  };

  const handleCancelCreate = () => {
    setActiveTab('reports');
    setSelectedTemplate(null);
  };

  const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-gray-100';
  const textClass = isDarkMode ? 'text-white' : 'text-gray-900';

  return (
    <div className={`${bgClass} ${textClass} min-h-screen p-6`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Custom Reporting</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Create, schedule, and manage custom reports for your projects
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6 border-b border-gray-300 dark:border-gray-700">
        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${activeTab === 'reports'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
        >
          <FileText className="w-5 h-5" />
          My Reports
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('templates')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${activeTab === 'templates'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
        >
          <Layout className="w-5 h-5" />
          Templates
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('create')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${activeTab === 'create'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
        >
          <Plus className="w-5 h-5" />
          Create Report
        </button>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto">
        {activeTab === 'reports' && (
          <ReportViewer
            userId={userId}
            isDarkMode={isDarkMode}
            onEdit={(report) => {
              // TODO: Implement edit functionality
              console.log('Edit report:', report);
            }}
            onGenerate={(report) => {
              console.log('Generate report:', report);
            }}
          />
        )}

        {activeTab === 'templates' && (
          <ReportTemplates
            isDarkMode={isDarkMode}
            onSelectTemplate={handleTemplateSelect}
          />
        )}

        {activeTab === 'create' && (
          <ReportBuilder
            userId={userId}
            projectId={projectId}
            companyId={companyId}
            isDarkMode={isDarkMode}
            onSave={handleReportSaved}
            onCancel={handleCancelCreate}
          />
        )}
      </div>

      {/* Quick Stats */}
      {activeTab === 'reports' && (
        <div className="mt-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Reports</p>
                  <p className="text-2xl font-bold mt-1">0</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Scheduled Reports</p>
                  <p className="text-2xl font-bold mt-1">0</p>
                </div>
                <Layout className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Generated This Month</p>
                  <p className="text-2xl font-bold mt-1">0</p>
                </div>
                <Plus className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

