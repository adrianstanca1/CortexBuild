/**
 * Quantum Client Dashboard
 * Advanced client interface with project transparency and stakeholder communication
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  MessageSquare,
  FileText,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Building2,
  Camera,
  Download,
  Share,
  Bell,
  Settings,
  Filter,
  Search,
  Plus,
  Star,
  ThumbsUp,
  Heart,
  Smile,
  Frown,
  Meh,
  Phone,
  Mail,
  Video,
  MapPin,
  Target,
  Award,
  Shield,
  Lock,
  Globe,
  Wifi,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Zap,
  Brain,
  ChevronRight,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface ProjectOverview {
  id: string;
  name: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  progress: number;
  startDate: Date;
  endDate: Date;
  budget: number;
  spent: number;
  teamSize: number;
  milestones: number;
  completedMilestones: number;
  nextMilestone?: string;
  nextMilestoneDate?: Date;
  riskLevel: 'low' | 'medium' | 'high';
  satisfaction: number;
  lastUpdate: Date;
  aiInsights: number;
  documents: number;
}

interface Communication {
  id: string;
  type: 'update' | 'milestone' | 'issue' | 'meeting' | 'document';
  title: string;
  message: string;
  author: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  attachments?: string[];
  responses?: number;
}

interface Document {
  id: string;
  name: string;
  type: 'contract' | 'report' | 'drawing' | 'photo' | 'video' | 'specification';
  size: string;
  uploadedBy: string;
  uploadedAt: Date;
  category: string;
  tags: string[];
  downloads: number;
  version: string;
}

interface Meeting {
  id: string;
  title: string;
  type: 'kickoff' | 'progress' | 'review' | 'final' | 'emergency';
  scheduledFor: Date;
  duration: number; // minutes
  attendees: string[];
  agenda: string[];
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  recording?: string;
  notes?: string;
}

interface Feedback {
  id: string;
  type: 'satisfaction' | 'quality' | 'communication' | 'timeline' | 'budget';
  rating: number; // 1-5
  comment: string;
  projectId: string;
  submittedAt: Date;
  anonymous: boolean;
  improvements?: string;
}

interface ClientMetric {
  id: string;
  name: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  target?: number;
  category: 'satisfaction' | 'quality' | 'communication' | 'delivery';
}

export default function QuantumClientDashboard() {
  const [activeTab, setActiveTab] = useState('projects');
  const [selectedProject, setSelectedProject] = useState('project-1');
  const [viewMode, setViewMode] = useState('overview');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Mock data
  const [projects, setProjects] = useState<ProjectOverview[]>([
    {
      id: 'project-1',
      name: 'Quantum Office Complex',
      status: 'active',
      progress: 67,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-12-15'),
      budget: 5000000,
      spent: 3350000,
      teamSize: 12,
      milestones: 8,
      completedMilestones: 5,
      nextMilestone: 'Structural Framework Complete',
      nextMilestoneDate: new Date('2024-06-15'),
      riskLevel: 'medium',
      satisfaction: 4.2,
      lastUpdate: new Date(),
      aiInsights: 23,
      documents: 45
    },
    {
      id: 'project-2',
      name: 'Neural Infrastructure Project',
      status: 'planning',
      progress: 15,
      startDate: new Date('2024-03-01'),
      endDate: new Date('2025-03-01'),
      budget: 10000000,
      spent: 1500000,
      teamSize: 8,
      milestones: 12,
      completedMilestones: 2,
      nextMilestone: 'Site Preparation Complete',
      nextMilestoneDate: new Date('2024-04-01'),
      riskLevel: 'low',
      satisfaction: 4.8,
      lastUpdate: new Date(Date.now() - 3600000),
      aiInsights: 8,
      documents: 23
    }
  ]);

  const [communications, setCommunications] = useState<Communication[]>([
    {
      id: 'comm-1',
      type: 'milestone',
      title: 'Foundation Work Completed',
      message: 'The foundation work for the Quantum Office Complex has been successfully completed ahead of schedule.',
      author: 'Sarah Johnson',
      timestamp: new Date(),
      priority: 'high',
      read: false,
      responses: 3
    },
    {
      id: 'comm-2',
      type: 'update',
      title: 'Weekly Progress Update',
      message: 'This week we completed the excavation and poured the foundation. Next week we begin structural steel installation.',
      author: 'Mike Chen',
      timestamp: new Date(Date.now() - 86400000),
      priority: 'medium',
      read: true,
      responses: 1
    }
  ]);

  const [documents, setDocuments] = useState<Document[]>([
    {
      id: 'doc-1',
      name: 'Project Contract v2.1.pdf',
      type: 'contract',
      size: '2.4 MB',
      uploadedBy: 'Legal Team',
      uploadedAt: new Date(Date.now() - 172800000),
      category: 'Legal',
      tags: ['contract', 'final', 'signed'],
      downloads: 12,
      version: '2.1'
    },
    {
      id: 'doc-2',
      name: 'Site Survey Report.pdf',
      type: 'report',
      size: '8.7 MB',
      uploadedBy: 'Survey Team',
      uploadedAt: new Date(Date.now() - 86400000),
      category: 'Technical',
      tags: ['survey', 'site-analysis', 'geotechnical'],
      downloads: 8,
      version: '1.0'
    }
  ]);

  const [meetings, setMeetings] = useState<Meeting[]>([
    {
      id: 'meeting-1',
      title: 'Monthly Project Review',
      type: 'progress',
      scheduledFor: new Date(Date.now() + 86400000),
      duration: 60,
      attendees: ['Client Rep', 'Project Manager', 'Site Engineer'],
      agenda: [
        'Project progress update',
        'Upcoming milestones',
        'Risk discussion',
        'Next month planning'
      ],
      status: 'scheduled'
    }
  ]);

  const [feedback, setFeedback] = useState<Feedback[]>([
    {
      id: 'feedback-1',
      type: 'satisfaction',
      rating: 5,
      comment: 'Excellent communication and project management. Very satisfied with the progress.',
      projectId: 'project-1',
      submittedAt: new Date(Date.now() - 604800000),
      anonymous: false
    }
  ]);

  const [metrics, setMetrics] = useState<ClientMetric[]>([
    {
      id: 'overall-satisfaction',
      name: 'Overall Satisfaction',
      value: 4.6,
      change: 0.3,
      trend: 'up',
      target: 4.5,
      category: 'satisfaction'
    },
    {
      id: 'project-quality',
      name: 'Project Quality',
      value: 'A+',
      change: 0,
      trend: 'stable',
      category: 'quality'
    },
    {
      id: 'communication-score',
      name: 'Communication Score',
      value: 4.8,
      change: 0.2,
      trend: 'up',
      target: 4.5,
      category: 'communication'
    },
    {
      id: 'delivery-performance',
      name: 'On-time Delivery',
      value: '94%',
      change: 2,
      trend: 'up',
      target: 90,
      category: 'delivery'
    }
  ]);

  const tabs = [
    { id: 'projects', name: 'My Projects', icon: <Building2 className="w-4 h-4" /> },
    { id: 'communications', name: 'Communications', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'documents', name: 'Documents', icon: <FileText className="w-4 h-4" /> },
    { id: 'meetings', name: 'Meetings', icon: <Video className="w-4 h-4" /> },
    { id: 'feedback', name: 'Feedback', icon: <Star className="w-4 h-4" /> },
    { id: 'reports', name: 'Reports', icon: <BarChart3 className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Client Portal</h1>
                  <p className="text-sm text-gray-400">Project Transparency & Communication</p>
                </div>
              </div>

              {/* Project Selector */}
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-600"
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>

              {/* Notifications Toggle */}
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`p-2 rounded-lg transition-colors ${
                  notificationsEnabled ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {notificationsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center space-x-4">
              {/* Quick Actions */}
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Contact Team
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <Download className="w-4 h-4 inline mr-2" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-black/20 backdrop-blur-sm border-r border-white/10">
          <nav className="p-4">
            <div className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-green-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.name}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'projects' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Project Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      title: 'Project Progress',
                      value: `${projects.find(p => p.id === selectedProject)?.progress}%`,
                      icon: <Target className="w-5 h-5" />,
                      color: 'blue',
                      trend: 'up'
                    },
                    {
                      title: 'Budget Utilization',
                      value: `${((projects.find(p => p.id === selectedProject)?.spent || 0) / (projects.find(p => p.id === selectedProject)?.budget || 1) * 100).toFixed(1)}%`,
                      icon: <DollarSign className="w-5 h-5" />,
                      color: 'green',
                      trend: 'stable'
                    },
                    {
                      title: 'Team Size',
                      value: projects.find(p => p.id === selectedProject)?.teamSize || 0,
                      icon: <Users className="w-5 h-5" />,
                      color: 'purple',
                      trend: 'stable'
                    },
                    {
                      title: 'Satisfaction',
                      value: `${projects.find(p => p.id === selectedProject)?.satisfaction}/5`,
                      icon: <Star className="w-5 h-5" />,
                      color: 'yellow',
                      trend: 'up'
                    }
                  ].map((metric, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10"
                    >
                      <div className="flex items-center justify-between">
                        <div className={`p-3 rounded-lg bg-${metric.color}-500/20`}>
                          <div className={`text-${metric.color}-400`}>
                            {metric.icon}
                          </div>
                        </div>
                        <div className={`flex items-center space-x-1 ${
                          metric.trend === 'up' ? 'text-green-400' :
                          metric.trend === 'down' ? 'text-red-400' : 'text-gray-400'
                        }`}>
                          <TrendingUp className={`w-4 h-4 ${metric.trend === 'down' ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                      <div className="mt-4">
                        <h3 className="text-2xl font-bold text-white">{metric.value}</h3>
                        <p className="text-gray-400 text-sm">{metric.title}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Project Details */}
                {projects.filter(p => p.id === selectedProject).map((project) => (
                  <div key={project.id} className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10">
                    <div className="p-6 border-b border-white/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-bold text-white">{project.name}</h2>
                          <p className="text-gray-400">Project Overview & Progress</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            project.status === 'active' ? 'bg-green-500/20 text-green-400' :
                            project.status === 'planning' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {project.status}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            project.riskLevel === 'low' ? 'bg-green-500/20 text-green-400' :
                            project.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {project.riskLevel} risk
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Progress Overview */}
                        <div className="lg:col-span-2">
                          <h3 className="text-lg font-semibold text-white mb-4">Progress Overview</h3>

                          {/* Overall Progress */}
                          <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-gray-400">Overall Progress</span>
                              <span className="text-white font-medium">{project.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-3">
                              <div
                                className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full"
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                          </div>

                          {/* Milestones */}
                          <div className="space-y-3">
                            <h4 className="text-white font-medium">Recent Milestones</h4>
                            {project.milestones > 0 && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">
                                  {project.completedMilestones} of {project.milestones} completed
                                </span>
                                <span className="text-green-400">
                                  {((project.completedMilestones / project.milestones) * 100).toFixed(0)}%
                                </span>
                              </div>
                            )}

                            {project.nextMilestone && (
                              <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                <div className="flex items-center space-x-2">
                                  <Clock className="w-4 h-4 text-blue-400" />
                                  <span className="text-white font-medium">Next: {project.nextMilestone}</span>
                                </div>
                                <p className="text-gray-400 text-sm mt-1">
                                  Due: {project.nextMilestoneDate?.toLocaleDateString()}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Project Stats */}
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-4">Project Statistics</h3>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Budget</span>
                              <span className="text-white font-medium">
                                ${(project.budget / 1000000).toFixed(1)}M
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Spent</span>
                              <span className="text-white font-medium">
                                ${(project.spent / 1000000).toFixed(1)}M
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Remaining</span>
                              <span className="text-white font-medium">
                                ${((project.budget - project.spent) / 1000000).toFixed(1)}M
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Team Size</span>
                              <span className="text-white font-medium">{project.teamSize} members</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">AI Insights</span>
                              <span className="text-purple-400 font-medium">{project.aiInsights} insights</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Documents</span>
                              <span className="text-blue-400 font-medium">{project.documents} files</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Recent Communications */}
                <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="p-6 border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-white flex items-center">
                        <MessageSquare className="w-5 h-5 mr-2 text-green-400" />
                        Recent Communications
                      </h2>
                      <button className="text-gray-400 hover:text-white">
                        <Filter className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    {communications.map((comm) => (
                      <motion.div
                        key={comm.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-lg border ${
                          !comm.read ? 'bg-blue-500/10 border-blue-500/20' : 'bg-gray-800/50 border-gray-700'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-white font-medium">{comm.title}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                comm.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                comm.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-green-500/20 text-green-400'
                              }`}>
                                {comm.priority}
                              </span>
                              {!comm.read && (
                                <div className="w-2 h-2 bg-blue-400 rounded-full" />
                              )}
                            </div>
                            <p className="text-gray-400 text-sm mb-2">{comm.message}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>By {comm.author}</span>
                              <span>{comm.timestamp.toLocaleDateString()}</span>
                              {comm.responses && comm.responses > 0 && (
                                <span>{comm.responses} responses</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="text-gray-400 hover:text-white">
                              <ThumbsUp className="w-4 h-4" />
                            </button>
                            <button className="text-gray-400 hover:text-white">
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Quick Feedback */}
                <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="p-6 border-b border-white/10">
                    <h2 className="text-lg font-semibold text-white flex items-center">
                      <Star className="w-5 h-5 mr-2 text-yellow-400" />
                      Quick Feedback
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { icon: <Smile className="w-6 h-6" />, label: 'Very Satisfied', rating: 5 },
                        { icon: <Meh className="w-6 h-6" />, label: 'Satisfied', rating: 4 },
                        { icon: <Frown className="w-6 h-6" />, label: 'Needs Improvement', rating: 2 },
                        { icon: <AlertTriangle className="w-6 h-6" />, label: 'Major Issues', rating: 1 }
                      ].map((option, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-4 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-gray-600 transition-colors text-center"
                        >
                          <div className="flex flex-col items-center space-y-2">
                            <div className="text-gray-400">{option.icon}</div>
                            <span className="text-white text-sm font-medium">{option.label}</span>
                          </div>
                        </motion.button>
                      ))}
                    </div>

                    <div className="mt-6">
                      <h3 className="text-white font-medium mb-3">Leave Detailed Feedback</h3>
                      <textarea
                        placeholder="Share your thoughts about the project..."
                        className="w-full bg-gray-800/50 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-blue-500 focus:outline-none"
                        rows={4}
                      />
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="anonymous" className="rounded" />
                          <label htmlFor="anonymous" className="text-gray-400 text-sm">
                            Submit anonymously
                          </label>
                        </div>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
                          Submit Feedback
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab !== 'projects' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-white"
              >
                <h2 className="text-2xl font-bold mb-4">
                  {tabs.find(t => t.id === activeTab)?.name}
                </h2>
                <p className="text-gray-400">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} interface would be implemented here.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}