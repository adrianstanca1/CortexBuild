/**
 * Quality Control & Inspections Module
 * Comprehensive quality management, inspections, and compliance tracking
 */

import React, { useState } from 'react';
import { User } from '../../../types';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Camera,
  FileText,
  Calendar,
  TrendingUp,
  Award,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  BarChart3,
  Target
} from 'lucide-react';

interface Inspection {
  id: string;
  type: string;
  area: string;
  inspector: string;
  date: string;
  status: 'passed' | 'failed' | 'pending' | 'conditional';
  score: number;
  itemsChecked: number;
  itemsPassed: number;
  itemsFailed: number;
  criticalIssues: number;
  notes?: string;
}

interface QualityIssue {
  id: string;
  title: string;
  severity: 'critical' | 'major' | 'minor';
  category: string;
  location: string;
  reportedBy: string;
  reportedDate: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  assignedTo?: string;
  dueDate?: string;
  photos: number;
}

interface Props {
  currentUser: User;
  navigateTo: (screen: string, params?: any) => void;
}

const QualityControlScreen: React.FC<Props> = ({ currentUser, navigateTo }) => {
  const [activeTab, setActiveTab] = useState<'inspections' | 'issues' | 'analytics' | 'standards'>('inspections');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Mock data
  const [inspections, setInspections] = useState<Inspection[]>([
    {
      id: 'INS001',
      type: 'Structural Inspection',
      area: 'Building A - Foundation',
      inspector: 'John Smith, P.E.',
      date: '2025-10-15',
      status: 'passed',
      score: 95,
      itemsChecked: 45,
      itemsPassed: 43,
      itemsFailed: 2,
      criticalIssues: 0,
      notes: 'Minor cracks noted in non-structural elements. Overall excellent quality.'
    },
    {
      id: 'INS002',
      type: 'Concrete Pour Inspection',
      area: 'Building B - 3rd Floor Slab',
      inspector: 'Sarah Johnson',
      date: '2025-10-14',
      status: 'conditional',
      score: 78,
      itemsChecked: 30,
      itemsPassed: 25,
      itemsFailed: 5,
      criticalIssues: 1,
      notes: 'Slump test marginally acceptable. Temperature monitoring required.'
    },
    {
      id: 'INS003',
      type: 'MEP Rough-in Inspection',
      area: 'Building C - HVAC System',
      inspector: 'Mike Chen',
      date: '2025-10-13',
      status: 'failed',
      score: 62,
      itemsChecked: 50,
      itemsPassed: 31,
      itemsFailed: 19,
      criticalIssues: 3,
      notes: 'Multiple code violations found. Re-inspection required after corrections.'
    },
    {
      id: 'INS004',
      type: 'Fire Safety Inspection',
      area: 'All Buildings - Fire Suppression',
      inspector: 'Tom Wilson, CFI',
      date: '2025-10-16',
      status: 'pending',
      score: 0,
      itemsChecked: 0,
      itemsPassed: 0,
      itemsFailed: 0,
      criticalIssues: 0
    }
  ]);

  const [qualityIssues, setQualityIssues] = useState<QualityIssue[]>([
    {
      id: 'QI001',
      title: 'Incorrect rebar spacing in foundation wall',
      severity: 'critical',
      category: 'Structural',
      location: 'Building A - Foundation Wall Section 3',
      reportedBy: 'John Smith',
      reportedDate: '2025-10-14',
      status: 'in-progress',
      assignedTo: 'Structural Team Lead',
      dueDate: '2025-10-18',
      photos: 5
    },
    {
      id: 'QI002',
      title: 'Paint finish quality below specification',
      severity: 'minor',
      category: 'Finishes',
      location: 'Building B - Interior Walls',
      reportedBy: 'Sarah Johnson',
      reportedDate: '2025-10-13',
      status: 'open',
      dueDate: '2025-10-20',
      photos: 3
    },
    {
      id: 'QI003',
      title: 'Plumbing fixtures not level',
      severity: 'major',
      category: 'MEP',
      location: 'Building C - 2nd Floor Bathrooms',
      reportedBy: 'Mike Chen',
      reportedDate: '2025-10-12',
      status: 'in-progress',
      assignedTo: 'Plumbing Contractor',
      dueDate: '2025-10-19',
      photos: 4
    },
    {
      id: 'QI004',
      title: 'Door hardware installation incomplete',
      severity: 'minor',
      category: 'Hardware',
      location: 'Building A - Main Entrance',
      reportedBy: 'Tom Wilson',
      reportedDate: '2025-10-15',
      status: 'resolved',
      assignedTo: 'Hardware Installer',
      photos: 2
    }
  ]);

  // Calculate statistics
  const totalInspections = inspections.length;
  const passedInspections = inspections.filter(i => i.status === 'passed').length;
  const failedInspections = inspections.filter(i => i.status === 'failed').length;
  const avgScore = inspections.reduce((sum, i) => sum + i.score, 0) / totalInspections;
  const openIssues = qualityIssues.filter(i => i.status === 'open' || i.status === 'in-progress').length;
  const criticalIssues = qualityIssues.filter(i => i.severity === 'critical' && i.status !== 'resolved' && i.status !== 'closed').length;

  const getStatusColor = (status: Inspection['status']) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'conditional': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: QualityIssue['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'major': return 'bg-orange-100 text-orange-800';
      case 'minor': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getIssueStatusColor = (status: QualityIssue['status']) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ClipboardCheck className="w-8 h-8 text-blue-600" />
              Quality Control & Inspections
            </h1>
            <p className="text-gray-600 mt-1">
              Ensure excellence through systematic inspections and quality management
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-5 h-5" />
            New Inspection
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Quality Score</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{avgScore.toFixed(0)}%</p>
              <p className="text-sm text-green-600 mt-1">↑ 3% from last month</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pass Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {((passedInspections / totalInspections) * 100).toFixed(0)}%
              </p>
              <p className="text-sm text-gray-600 mt-1">{passedInspections}/{totalInspections} passed</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Open Issues</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{openIssues}</p>
              <p className="text-sm text-yellow-600 mt-1">{criticalIssues} critical</p>
            </div>
            <div className="bg-yellow-100 rounded-full p-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalInspections}</p>
              <p className="text-sm text-gray-600 mt-1">Inspections completed</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {[
              { id: 'inspections', label: 'Inspections', icon: ClipboardCheck },
              { id: 'issues', label: 'Quality Issues', icon: AlertTriangle },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'standards', label: 'Standards & Checklists', icon: FileText }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-1 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'inspections' && (
            <div className="space-y-4">
              {/* Search and Filter */}
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search inspections..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="passed">Passed</option>
                  <option value="failed">Failed</option>
                  <option value="conditional">Conditional</option>
                  <option value="pending">Pending</option>
                </select>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Download className="w-5 h-5" />
                  Export
                </button>
              </div>

              {/* Inspections List */}
              <div className="space-y-3">
                {inspections.map(inspection => (
                  <div key={inspection.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${
                            inspection.status === 'passed' ? 'bg-green-100' :
                            inspection.status === 'failed' ? 'bg-red-100' :
                            inspection.status === 'conditional' ? 'bg-yellow-100' :
                            'bg-gray-100'
                          }`}>
                            <p className="text-2xl font-bold text-gray-900">{inspection.score}%</p>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{inspection.type}</h3>
                            <p className="text-sm text-gray-600">{inspection.area}</p>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                              <span>Inspector: {inspection.inspector}</span>
                              <span>•</span>
                              <span>{new Date(inspection.date).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        {inspection.notes && (
                          <p className="mt-3 text-sm text-gray-600 bg-gray-50 rounded p-2">
                            {inspection.notes}
                          </p>
                        )}

                        <div className="mt-3 flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <span className="text-gray-600">{inspection.itemsPassed} passed</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-red-600" />
                            <span className="text-gray-600">{inspection.itemsFailed} failed</span>
                          </div>
                          {inspection.criticalIssues > 0 && (
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                              <span className="text-red-600 font-medium">{inspection.criticalIssues} critical</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(inspection.status)}`}>
                          {inspection.status.toUpperCase()}
                        </span>
                        <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'issues' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Quality Issues Tracking</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Plus className="w-5 h-5" />
                  Report Issue
                </button>
              </div>

              <div className="space-y-3">
                {qualityIssues.map(issue => (
                  <div key={issue.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(issue.severity)}`}>
                            {issue.severity.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500">{issue.category}</span>
                        </div>
                        <h4 className="font-semibold text-gray-900">{issue.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{issue.location}</p>
                        <div className="mt-3 flex items-center gap-6 text-sm text-gray-600">
                          <span>Reported by: {issue.reportedBy}</span>
                          <span>•</span>
                          <span>{new Date(issue.reportedDate).toLocaleDateString()}</span>
                          {issue.dueDate && (
                            <>
                              <span>•</span>
                              <span>Due: {new Date(issue.dueDate).toLocaleDateString()}</span>
                            </>
                          )}
                          {issue.photos > 0 && (
                            <>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Camera className="w-4 h-4" />
                                {issue.photos} photos
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getIssueStatusColor(issue.status)}`}>
                        {issue.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Quality Analytics & Trends</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                  <h4 className="font-semibold text-blue-900 mb-4">Inspection Pass Rate Trend</h4>
                  <div className="h-48 flex items-end justify-between gap-2">
                    {[78, 82, 85, 88, 90, 92, 95].map((val, idx) => (
                      <div key={idx} className="flex-1 bg-blue-600 rounded-t" style={{ height: `${val}%` }}>
                        <div className="text-xs text-white text-center pt-1">{val}%</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-blue-900">
                    <span>Week 1</span>
                    <span>Week 7</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
                  <h4 className="font-semibold text-green-900 mb-4">Issues by Category</h4>
                  <div className="space-y-3">
                    {[
                      { name: 'Structural', count: 5, color: 'bg-red-500' },
                      { name: 'MEP', count: 12, color: 'bg-orange-500' },
                      { name: 'Finishes', count: 8, color: 'bg-yellow-500' },
                      { name: 'Hardware', count: 3, color: 'bg-green-500' }
                    ].map(cat => (
                      <div key={cat.name}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-green-900">{cat.name}</span>
                          <span className="font-medium text-green-900">{cat.count}</span>
                        </div>
                        <div className="w-full bg-green-200 rounded-full h-2">
                          <div className={`${cat.color} h-2 rounded-full`} style={{ width: `${(cat.count / 28) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-purple-900">Quality Score Breakdown</h4>
                    <p className="text-purple-700 text-sm mt-1">Detailed analysis by discipline and phase</p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold text-purple-900">{avgScore.toFixed(1)}%</p>
                    <p className="text-sm text-purple-700">Overall Score</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'standards' && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Standards & Checklists</h3>
                <p className="text-gray-600 mb-6">
                  Access quality standards, inspection checklists, and compliance requirements
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                  {['Building Code Checklists', 'Safety Standards', 'Quality Specifications'].map(item => (
                    <div key={item} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-900">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QualityControlScreen;
