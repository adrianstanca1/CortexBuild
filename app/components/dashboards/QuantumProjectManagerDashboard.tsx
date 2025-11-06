/**
 * Quantum Project Manager Dashboard
 * Advanced project management with neural predictions and real-time monitoring
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Users,
  Target,
  Activity,
  Brain,
  Zap,
  BarChart3,
  GanttChart,
  FileText,
  Camera,
  MapPin,
  Timer,
  Percent,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Filter,
  Search,
  Download,
  Upload,
  Eye,
  MessageSquare,
  Bell,
  Settings,
  Play,
  Pause,
  Square,
  Flag,
  Star,
  Award,
  Shield,
  Wifi,
  WifiOff
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  code: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  progress: number;
  startDate: Date;
  endDate: Date;
  budget: number;
  spent: number;
  team: TeamMember[];
  milestones: Milestone[];
  risks: Risk[];
  aiAgents: AIAgent[];
  neuralInsights: NeuralInsight[];
  location: {
    address: string;
    coordinates: [number, number];
  };
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  status: 'active' | 'busy' | 'away' | 'offline';
  tasks: number;
  productivity: number;
  lastActive: Date;
}

interface Milestone {
  id: string;
  name: string;
  dueDate: Date;
  status: 'completed' | 'in-progress' | 'overdue' | 'upcoming';
  progress: number;
  assignedTo: string[];
  dependencies: string[];
  neuralPrediction?: {
    confidence: number;
    predictedDate: Date;
    riskFactors: string[];
  };
}

interface Risk {
  id: string;
  title: string;
  description: string;
  probability: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  status: 'identified' | 'mitigated' | 'resolved' | 'accepted';
  category: 'schedule' | 'budget' | 'quality' | 'safety' | 'technical';
  neuralAnalysis: {
    confidence: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    recommendations: string[];
  };
}

interface AIAgent {
  id: string;
  name: string;
  type: 'safety' | 'cost' | 'schedule' | 'quality' | 'coordination';
  status: 'active' | 'inactive' | 'error';
  performance: number;
  insights: number;
  lastActivity: Date;
}

interface NeuralInsight {
  id: string;
  type: 'prediction' | 'optimization' | 'warning' | 'opportunity';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
  generatedAt: Date;
  category: 'schedule' | 'budget' | 'quality' | 'team' | 'risk';
}

interface ProjectMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  target: number;
  trend: 'up' | 'down' | 'stable';
  status: 'on-track' | 'at-risk' | 'behind' | 'ahead';
}

export default function QuantumProjectManagerDashboard() {
  const [selectedProject, setSelectedProject] = useState('project-1');
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState('detailed');
  const [showNeuralInsights, setShowNeuralInsights] = useState(true);

  // Mock project data
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 'project-1',
      name: 'Quantum Office Complex',
      code: 'QOC-001',
      status: 'active',
      progress: 67,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-12-15'),
      budget: 5000000,
      spent: 3350000,
      team: [
        {
          id: 'member-1',
          name: 'Sarah Johnson',
          role: 'Project Manager',
          status: 'active',
          tasks: 12,
          productivity: 0.87,
          lastActive: new Date()
        },
        {
          id: 'member-2',
          name: 'Mike Chen',
          role: 'Site Engineer',
          status: 'active',
          tasks: 8,
          productivity: 0.94,
          lastActive: new Date(Date.now() - 300000)
        }
      ],
      milestones: [
        {
          id: 'milestone-1',
          name: 'Foundation Complete',
          dueDate: new Date('2024-03-15'),
          status: 'completed',
          progress: 100,
          assignedTo: ['member-2'],
          dependencies: [],
          neuralPrediction: {
            confidence: 0.95,
            predictedDate: new Date('2024-03-14'),
            riskFactors: []
          }
        },
        {
          id: 'milestone-2',
          name: 'Structural Framework',
          dueDate: new Date('2024-06-15'),
          status: 'in-progress',
          progress: 45,
          assignedTo: ['member-2'],
          dependencies: ['milestone-1'],
          neuralPrediction: {
            confidence: 0.78,
            predictedDate: new Date('2024-06-18'),
            riskFactors: ['weather_delay', 'material_shortage']
          }
        }
      ],
      risks: [
        {
          id: 'risk-1',
          title: 'Weather Delays',
          description: 'Heavy rain forecast for next two weeks',
          probability: 0.6,
          impact: 'medium',
          status: 'identified',
          category: 'schedule',
          neuralAnalysis: {
            confidence: 0.82,
            trend: 'increasing',
            recommendations: ['Schedule indoor work', 'Prepare contingency plans']
          }
        }
      ],
      aiAgents: [
        {
          id: 'agent-1',
          name: 'Safety Sentinel',
          type: 'safety',
          status: 'active',
          performance: 0.94,
          insights: 23,
          lastActivity: new Date()
        },
        {
          id: 'agent-2',
          name: 'Cost Guardian',
          type: 'cost',
          status: 'active',
          performance: 0.89,
          insights: 15,
          lastActivity: new Date(Date.now() - 600000)
        }
      ],
      neuralInsights: [
        {
          id: 'insight-1',
          type: 'optimization',
          title: 'Resource Optimization',
          description: 'Neural analysis suggests redistributing team for 15% efficiency gain',
          confidence: 0.87,
          impact: 'high',
          actionable: true,
          generatedAt: new Date(Date.now() - 600000),
          category: 'team'
        }
      ],
      location: {
        address: '123 Tech Street, Silicon Valley, CA',
        coordinates: [37.7749, -122.4194]
      }
    }
  ]);

  const [currentProject] = projects.filter(p => p.id === selectedProject);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: <Eye className="w-4 h-4" /> },
    { id: 'timeline', name: 'Timeline', icon: <Calendar className="w-4 h-4" /> },
    { id: 'team', name: 'Team', icon: <Users className="w-4 h-4" /> },
    { id: 'budget', name: 'Budget', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'risks', name: 'Risks', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'ai-agents', name: 'AI Agents', icon: <Brain className="w-4 h-4" /> },
    { id: 'reports', name: 'Reports', icon: <FileText className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Project Manager</h1>
                  <p className="text-sm text-gray-400">{currentProject?.name}</p>
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
                    {project.code} - {project.name}
                  </option>
                ))}
              </select>

              {/* Neural Insights Toggle */}
              <button
                onClick={() => setShowNeuralInsights(!showNeuralInsights)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  showNeuralInsights
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Brain className="w-4 h-4 inline mr-1" />
                Neural Mode
              </button>
            </div>

            <div className="flex items-center space-x-4">
              {/* Quick Actions */}
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <Plus className="w-4 h-4 inline mr-2" />
                Add Milestone
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Team Chat
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
                      ? 'bg-indigo-600 text-white'
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
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Project Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      title: 'Progress',
                      value: `${currentProject?.progress}%`,
                      icon: <Percent className="w-5 h-5" />,
                      color: 'blue',
                      trend: currentProject?.progress > 50 ? 'up' : 'stable'
                    },
                    {
                      title: 'Budget Used',
                      value: `${((currentProject?.spent || 0) / (currentProject?.budget || 1) * 100).toFixed(1)}%`,
                      icon: <DollarSign className="w-5 h-5" />,
                      color: 'green',
                      trend: ((currentProject?.spent || 0) / (currentProject?.budget || 1)) > 0.8 ? 'down' : 'stable'
                    },
                    {
                      title: 'Team Members',
                      value: currentProject?.team.length || 0,
                      icon: <Users className="w-5 h-5" />,
                      color: 'purple',
                      trend: 'stable'
                    },
                    {
                      title: 'Active AI Agents',
                      value: currentProject?.aiAgents.filter(a => a.status === 'active').length || 0,
                      icon: <Brain className="w-5 h-5" />,
                      color: 'indigo',
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

                {/* Timeline and Milestones */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Project Timeline */}
                  <div className="lg:col-span-2 bg-black/20 backdrop-blur-sm rounded-xl border border-white/10">
                    <div className="p-6 border-b border-white/10">
                      <h2 className="text-lg font-semibold text-white flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-blue-400" />
                        Project Timeline
                      </h2>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {currentProject?.milestones.map((milestone) => (
                          <motion.div
                            key={milestone.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center space-x-4 p-4 rounded-lg bg-gray-800/50"
                          >
                            <div className={`w-3 h-3 rounded-full ${
                              milestone.status === 'completed' ? 'bg-green-400' :
                              milestone.status === 'in-progress' ? 'bg-blue-400' :
                              milestone.status === 'overdue' ? 'bg-red-400' :
                              'bg-gray-400'
                            }`} />

                            <div className="flex-1">
                              <h3 className="text-white font-medium">{milestone.name}</h3>
                              <p className="text-gray-400 text-sm">
                                Due: {milestone.dueDate.toLocaleDateString()}
                              </p>
                              {milestone.neuralPrediction && (
                                <div className="mt-1 text-xs text-purple-400">
                                  Neural prediction: {milestone.neuralPrediction.confidence * 100}% confidence
                                </div>
                              )}
                            </div>

                            <div className="text-right">
                              <div className="text-sm font-medium text-white">{milestone.progress}%</div>
                              <div className="w-20 bg-gray-700 rounded-full h-1 mt-1">
                                <div
                                  className={`h-1 rounded-full ${
                                    milestone.status === 'completed' ? 'bg-green-500' :
                                    milestone.status === 'in-progress' ? 'bg-blue-500' :
                                    'bg-gray-500'
                                  }`}
                                  style={{ width: `${milestone.progress}%` }}
                                />
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Team Status */}
                  <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10">
                    <div className="p-6 border-b border-white/10">
                      <h2 className="text-lg font-semibold text-white flex items-center">
                        <Users className="w-5 h-5 mr-2 text-green-400" />
                        Team Status
                      </h2>
                    </div>
                    <div className="p-6 space-y-4">
                      {currentProject?.team.map((member) => (
                        <motion.div
                          key={member.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800/50"
                        >
                          <div className="relative">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800 ${
                              member.status === 'active' ? 'bg-green-400' :
                              member.status === 'busy' ? 'bg-yellow-400' :
                              member.status === 'away' ? 'bg-orange-400' :
                              'bg-gray-400'
                            }`} />
                          </div>

                          <div className="flex-1">
                            <h3 className="text-white text-sm font-medium">{member.name}</h3>
                            <p className="text-gray-400 text-xs">{member.role}</p>
                          </div>

                          <div className="text-right">
                            <div className="text-sm font-medium text-white">
                              {(member.productivity * 100).toFixed(0)}%
                            </div>
                            <div className="text-xs text-gray-400">Productivity</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI Agents and Neural Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* AI Agents */}
                  <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10">
                    <div className="p-6 border-b border-white/10">
                      <h2 className="text-lg font-semibold text-white flex items-center">
                        <Brain className="w-5 h-5 mr-2 text-purple-400" />
                        AI Agents
                      </h2>
                    </div>
                    <div className="p-6 space-y-4">
                      {currentProject?.aiAgents.map((agent) => (
                        <motion.div
                          key={agent.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50"
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${
                              agent.status === 'active' ? 'bg-green-400' :
                              agent.status === 'error' ? 'bg-red-400' :
                              'bg-gray-400'
                            }`} />
                            <div>
                              <h3 className="text-white font-medium">{agent.name}</h3>
                              <p className="text-gray-400 text-sm capitalize">{agent.type}</p>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-sm font-medium text-white">
                              {(agent.performance * 100).toFixed(0)}%
                            </div>
                            <div className="text-xs text-gray-400">Performance</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Neural Insights */}
                  {showNeuralInsights && (
                    <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10">
                      <div className="p-6 border-b border-white/10">
                        <h2 className="text-lg font-semibold text-white flex items-center">
                          <Zap className="w-5 h-5 mr-2 text-blue-400" />
                          Neural Insights
                        </h2>
                      </div>
                      <div className="p-6 space-y-4">
                        {currentProject?.neuralInsights.map((insight) => (
                          <motion.div
                            key={insight.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h3 className="text-white font-medium">{insight.title}</h3>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    insight.impact === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                    insight.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-green-500/20 text-green-400'
                                  }`}>
                                    {insight.impact}
                                  </span>
                                </div>
                                <p className="text-gray-400 text-sm">{insight.description}</p>
                                <div className="flex items-center mt-2 text-xs text-gray-500">
                                  <span>Confidence: {(insight.confidence * 100).toFixed(0)}%</span>
                                  <span className="mx-2">•</span>
                                  <span className="capitalize">{insight.category}</span>
                                </div>
                              </div>
                              {insight.actionable && (
                                <button className="ml-4 px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors">
                                  Implement
                                </button>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Risks and Issues */}
                <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="p-6 border-b border-white/10">
                    <h2 className="text-lg font-semibold text-white flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
                      Active Risks
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {currentProject?.risks.map((risk) => (
                        <motion.div
                          key={risk.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 rounded-lg bg-gray-800/50 border border-gray-700"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-white font-medium">{risk.title}</h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  risk.impact === 'critical' ? 'bg-red-500/20 text-red-400' :
                                  risk.impact === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                  risk.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-green-500/20 text-green-400'
                                }`}>
                                  {risk.impact} impact
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  risk.status === 'identified' ? 'bg-blue-500/20 text-blue-400' :
                                  risk.status === 'mitigated' ? 'bg-green-500/20 text-green-400' :
                                  'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {risk.status}
                                </span>
                              </div>
                              <p className="text-gray-400 text-sm mb-2">{risk.description}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span>Probability: {(risk.probability * 100).toFixed(0)}%</span>
                                <span>Category: {risk.category}</span>
                              </div>
                              {risk.neuralAnalysis && (
                                <div className="mt-2 p-2 bg-purple-500/10 rounded border border-purple-500/20">
                                  <p className="text-purple-300 text-xs">
                                    Neural: {risk.neuralAnalysis.recommendations[0]}
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <button className="text-gray-400 hover:text-white">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="text-gray-400 hover:text-white">
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab !== 'overview' && (
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
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} management interface would be implemented here.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}