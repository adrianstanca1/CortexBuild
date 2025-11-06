/**
 * Report Templates Component
 * Displays available report templates with categories
 */

import React, { useState, useEffect } from 'react';
import { FileText, Layers, TrendingUp, DollarSign, Clock } from 'lucide-react';
import { reportingService, ReportTemplate } from '../../lib/services/reportingService';

export interface ReportTemplatesProps {
  isDarkMode?: boolean;
  onSelectTemplate?: (template: ReportTemplate) => void;
}

export const ReportTemplates: React.FC<ReportTemplatesProps> = ({
  isDarkMode = false,
  onSelectTemplate
}) => {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await reportingService.getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTemplateIcon = (category: string) => {
    switch (category) {
      case 'project':
        return <Layers className="w-6 h-6 text-blue-600" />;
      case 'team':
        return <TrendingUp className="w-6 h-6 text-green-600" />;
      case 'budget':
        return <DollarSign className="w-6 h-6 text-yellow-600" />;
      case 'timeline':
        return <Clock className="w-6 h-6 text-purple-600" />;
      default:
        return <FileText className="w-6 h-6 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'project':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'team':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'budget':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'timeline':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const categories = ['all', ...new Set(templates.map(t => t.category))];
  const filteredTemplates = selectedCategory === 'all'
    ? templates
    : templates.filter(t => t.category === selectedCategory);

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
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Report Templates</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Choose from predefined templates to create your reports
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map(category => (
          <button
            key={category}
            type="button"
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === category
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map(template => (
          <div
            key={template.id}
            className={`${cardBgClass} rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer`}
            onClick={() => onSelectTemplate && onSelectTemplate(template)}
          >
            {/* Icon and Category */}
            <div className="flex items-start justify-between mb-3">
              {getTemplateIcon(template.category)}
              <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(template.category)}`}>
                {template.category}
              </span>
            </div>

            {/* Template Name */}
            <h3 className="text-lg font-semibold mb-2">{template.name}</h3>

            {/* Description */}
            {template.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {template.description}
              </p>
            )}

            {/* Sections */}
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Sections:
              </p>
              <div className="flex flex-wrap gap-1">
                {template.sections.map((section, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-white dark:bg-gray-800 rounded text-xs"
                  >
                    {section}
                  </span>
                ))}
              </div>
            </div>

            {/* Default Filters */}
            {template.default_filters && (
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Default Filters:
                </p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(template.default_filters).map(([key, value]) => (
                    <span
                      key={key}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded text-xs"
                    >
                      {key}: {String(value)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Use Template Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectTemplate && onSelectTemplate(template);
              }}
              className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Use Template
            </button>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            No templates found in this category
          </p>
        </div>
      )}
    </div>
  );
};

