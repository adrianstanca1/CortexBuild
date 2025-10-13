/**
 * Quantum Company Admin Dashboard
 * Advanced company management with neural insights and team analytics
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Building2,
  TrendingUp,
  Target,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Brain,
  Zap,
  BarChart3,
  PieChart,
  Calendar,
  FileText,
  Settings,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  Trash2,
  MoreHorizontal,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Award,
  Activity,
  Shield,
  Bell,
  Eye,
  EyeOff
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'away';
  lastActive: Date;
  neuralProfile: {
    expertise: string[];
    productivity: number;
    collaboration: number;
    learning: number;
  };
  projects: string[];
  tasks: number;
  achievements: number;
}

interface ProjectSummary {
  id: string;
  name: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  progress: number;
  budget: number;
  spent: number;
  timeline: {
    start: Date;
    end: Date;
    progress: number;
  };
  team: string[];
  risk: 'low' | 'medium' | 'high' | 'critical';
  neuralInsights: number;
  aiAgents: number;
}

interface CompanyMetric {
  id: string;
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  target?: number;
  unit: string;
  category: 'financial' | 'operational' | 'team' | 'quality';
}

interface NeuralInsight {
  id: string;
  type: 'optimization' | 'risk' | 'opportunity' | 'improvement';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  confidence: number;
  actionable: boolean;
  area: 'team' | 'projects' | 'finance' | 'operations';
  generatedAt: Date;
}

export default function QuantumCompanyAdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedView, setSelectedView] = useState('grid');
  const [showNeuralInsights, setShowNeuralInsights] = useState(true);

  // Mock data
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: 'member-1',
      name: 'Sarah Johnson',
      email: 'sarah@constructco.com',
      role: 'Project Manager',
      status: 'active',
      lastActive: new Date(),
      neuralProfile: {
        expertise: ['project_management', 'team_leadership', 'risk_assessment'],
        productivity: 0.87,
        collaboration: 0.92,
        learning: 0.78
      },
      projects: ['QOC-001', 'NIP-002'],
      tasks: 12,
      achievements: 8
    },
    {
      id: 'member-2',
      name: 'Mike Chen',
      email: 'mike@constructco.com',
      role: 'Site Engineer',
      status: 'active',
      lastActive: new Date(Date.now() - 300000),
      neuralProfile: {
        expertise: ['construction_methods', 'quality_control', 'safety'],
        productivity: 0.94,
        collaboration: 0.76,
        learning: 0.85
      },
      projects: ['QOC-001'],
      tasks: 8,
      achievements: 15
    },
    {
      id: 'member-3',
      name: 'Emily Rodriguez',
      email: 'emily@constructco.com',
      role: 'Cost Controller',
      status: 'away',
      lastActive: new Date(Date.now() - 3600000),
      neuralProfile: {
        expertise: ['cost_estimation', 'budget_management', 'financial_analysis'],
        productivity: 0.91,
        collaboration: 0.83,
        learning: 0.89
      },
      projects: ['QOC-001', 'NIP-002'],
      tasks: 6,
      achievements: 12
    }
  ]);

  const [projects, setProjects] = useState<ProjectSummary[]>([
    {
      id: 'project-1',
      name: 'Quantum Office Complex',
      status: 'active',
      progress: 67,
      budget: 5000000,
      spent: 3350000,
      timeline: {
        start: new Date('2024-01-15'),
        end: new Date('2024-12-15'),
        progress: 67
      },
      team: ['member-1', 'member-2', 'member-3'],
      risk: 'medium',
      neuralInsights: 23,
      aiAgents: 5
    },
    {
      id: 'project-2',
      name: 'Neural Infrastructure Project',
      status: 'planning',
      progress: 15,
      budget: 10000000,
      spent: 1500000,
      timeline: {
        start: new Date('2024-03-01'),
        end: new Date('2025-03-01'),
        progress: 15
      },
      team: ['member-1', 'member-3'],
      risk: 'low',
      neuralInsights: 8,
      aiAgents: 2
    }
  ]);

  const [metrics, setMetrics] = useState<CompanyMetric[]>([
    {
      id: 'total-revenue',
      title: 'Total Revenue',
      value: '$2.4M',
      change: 18.5,
      trend: 'up',
      target: 3000000,
      unit: 'USD',
      category: 'financial'
    },
    {
      id: 'project-completion',
      title: 'Project Completion Rate',
      value: '94.2%',
      change: 2.1,
      trend: 'up',
      target: 95,
      unit: '%',
      category: 'operational'
    },
    {
      id: 'team-productivity',
      title: 'Team Productivity',
      value: 0.89,
      change: 5.3,
      trend: 'up',
      target: 0.9,
      unit: 'score',
      category: 'team'
    },
    {
      id: 'quality-score',
      title: 'Quality Score',
      value: 'A+',
      change: 0,
      trend: 'stable',
      target: 0,
      unit: 'grade',
      category: 'quality'
    }
  ]);

  const [neuralInsights, setNeuralInsights] = useState<NeuralInsight[]>([
    {
      id: 'insight-1',
      type: 'optimization',
      title: 'Resource Allocation Optimization',
      description: 'Neural analysis suggests redistributing team members for 15% productivity increase',
      impact: 'high',
      confidence: 0.87,
      actionable: true,
      area: 'team',
      generatedAt: new Date(Date.now() - 600000)
    },
    {
      id: 'insight-2',
      type: 'opportunity',
      title: 'Cost Reduction Opportunity',
      description: 'AI identifies potential 8% cost reduction in material procurement',
      impact: 'medium',
      confidence: 0.82,
      actionable: true,
      area: 'finance',
      generatedAt: new Date(Date.now() - 1200000)
    },
    {
      id: 'insight-3',
      type: 'risk',
      title: 'Schedule Risk Mitigation',
      description: 'Current project timeline shows 23% risk of delay - recommend immediate action',
      impact: 'high',
      confidence: 0.91,
      actionable: true,
      area: 'projects',
      generatedAt: new Date(Date.now() - 1800000)
    }
  ]);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: <Eye className="w-4 h-4" /> },
    { id: 'projects', name: 'Projects', icon: <Building2 className="w-4 h-4" /> },
    { id: 'team', name: 'Team Management', icon: <Users className="w-4 h-4" /> },
    { id: 'analytics', name: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'ai-insights', name: 'AI Insights', icon: <Brain className="w-4 h-4" /> },
    { id: 'settings', name: 'Company Settings', icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Company Admin</h1>
                  <p className="text-sm text-gray-400">ConstructCo Management</p>
                </div>
              </div>

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
                Neural Insights
              </button>
            </div>

            <div className="flex items-center space-x-4">
              {/* Quick Actions */}
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <Plus className="w-4 h-4 inline mr-2" />
                New Project
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <UserPlus className="w-4 h-4 inline mr-2" />
                Invite Team
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
                      ? 'bg-blue-600 text-white'
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
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {metrics.map((metric) => (
                    <motion.div
                      key={metric.id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-white">{metric.value}</h3>
                          <p className="text-gray-400 text-sm">{metric.title}</p>
                          {metric.target && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>Target: {metric.target}{metric.unit}</span>
                                <span>{((Number(metric.value.replace(/[^0-9.-]/g, ''))) / metric.target * 100).toFixed(1)}%</span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                                <div
                                  className={`h-1 rounded-full ${
                                    metric.category === 'financial' ? 'bg-green-500' :
                                    metric.category === 'operational' ? 'bg-blue-500' :
                                    metric.category === 'team' ? 'bg-purple-500' :
                                    'bg-yellow-500'
                                  }`}
                                  style={{
                                    width: `${Math.min((Number(metric.value.replace(/[^0-9.-]/g, '')) / metric.target) * 100, 100)}%`
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className={`flex items-center space-x-1 ${
                          metric.trend === 'up' ? 'text-green-400' :
                          metric.trend === 'down' ? 'text-red-400' : 'text-gray-400'
                        }`}>
                          <TrendingUp className={`w-4 h-4 ${metric.trend === 'down' ? 'rotate-180' : ''}`} />
                          <span className="text-sm font-medium">
                            {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Projects Overview */}
                <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="p-6 border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-white flex items-center">
                        <Building2 className="w-5 h-5 mr-2 text-blue-400" />
                        Active Projects
                      </h2>
                      <div className="flex items-center space-x-2">
                        <button className="text-gray-400 hover:text-white">
                          <Filter className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-white">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {projects.map((project) => (
                        <motion.div
                          key={project.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="text-white font-medium">{project.name}</h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-400">
                                <span>Budget: ${(project.budget / 1000000).toFixed(1)}M</span>
                                <span>Spent: ${(project.spent / 1000000).toFixed(1)}M</span>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  project.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                  project.status === 'planning' ? 'bg-blue-500/20 text-blue-400' :
                                  'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {project.status}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-white">{project.progress}%</div>
                              <div className="w-20 bg-gray-700 rounded-full h-2 mt-1">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                                  style={{ width: `${project.progress}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-1">
                                <Brain className="w-4 h-4 text-purple-400" />
                                <span className="text-sm text-gray-400">{project.neuralInsights} insights</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Zap className="w-4 h-4 text-blue-400" />
                                <span className="text-sm text-gray-400">{project.aiAgents} AI agents</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                project.risk === 'low' ? 'bg-green-500/20 text-green-400' :
                                project.risk === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                project.risk === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {project.risk} risk
                              </span>
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

                {/* Team Performance */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Team Members */}
                  <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10">
                    <div className="p-6 border-b border-white/10">
                      <h2 className="text-lg font-semibold text-white flex items-center">
                        <Users className="w-5 h-5 mr-2 text-green-400" />
                        Team Performance
                      </h2>
                    </div>
                    <div className="p-6 space-y-4">
                      {teamMembers.map((member) => (
                        <motion.div
                          key={member.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center space-x-4 p-3 rounded-lg bg-gray-800/50"
                        >
                          <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium">
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${
                              member.status === 'active' ? 'bg-green-400' :
                              member.status === 'away' ? 'bg-yellow-400' :
                              'bg-gray-400'
                            }`} />
                          </div>

                          <div className="flex-1">
                            <h3 className="text-white font-medium">{member.name}</h3>
                            <p className="text-gray-400 text-sm">{member.role}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="flex items-center space-x-1">
                                <Activity className="w-3 h-3 text-green-400" />
                                <span className="text-xs text-gray-400">{member.tasks} tasks</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Award className="w-3 h-3 text-yellow-400" />
                                <span className="text-xs text-gray-400">{member.achievements} achievements</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-sm font-medium text-white">
                              {(member.neuralProfile.productivity * 100).toFixed(0)}%
                            </div>
                            <div className="text-xs text-gray-400">Productivity</div>
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
                          <Brain className="w-5 h-5 mr-2 text-purple-400" />
                          Neural Insights
                        </h2>
                      </div>
                      <div className="p-6 space-y-4">
                        {neuralInsights.map((insight) => (
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
                                    {insight.impact} impact
                                  </span>
                                </div>
                                <p className="text-gray-400 text-sm">{insight.description}</p>
                                <div className="flex items-center mt-2 text-xs text-gray-500">
                                  <span>Confidence: {(insight.confidence * 100).toFixed(0)}%</span>
                                  <span className="mx-2">•</span>
                                  <span className="capitalize">{insight.area}</span>
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

                {/* Quick Actions */}
                <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="p-6 border-b border-white/10">
                    <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { icon: <Plus className="w-5 h-5" />, label: 'New Project', color: 'bg-blue-600' },
                        { icon: <UserPlus className="w-5 h-5" />, label: 'Invite Team', color: 'bg-green-600' },
                        { icon: <Brain className="w-5 h-5" />, label: 'AI Analysis', color: 'bg-purple-600' },
                        { icon: <BarChart3 className="w-5 h-5" />, label: 'View Reports', color: 'bg-orange-600' }
                      ].map((action, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`${action.color} hover:opacity-90 text-white p-4 rounded-lg transition-opacity`}
                        >
                          <div className="flex flex-col items-center space-y-2">
                            {action.icon}
                            <span className="text-sm font-medium">{action.label}</span>
                          </div>
                        </motion.button>
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