/**
 * Quantum Developer Dashboard
 * Advanced development environment with neural APIs and quantum tools
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code,
  Brain,
  Zap,
  Database,
  Terminal,
  GitBranch,
  TestTube,
  Rocket,
  Settings,
  Play,
  Square,
  RotateCcw,
  Save,
  Download,
  Upload,
  Share,
  Eye,
  EyeOff,
  Plus,
  Minus,
  Maximize2,
  Minimize2,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Layers,
  Cpu,
  HardDrive,
  Wifi,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  BarChart3,
  PieChart,
  LineChart,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Globe,
  Lock,
  Unlock,
  Key,
  Shield,
  Bug,
  Lightbulb,
  Target,
  Zap as ZapIcon,
  Atom,
  Network,
  Workflow,
  Bot,
  Function,
  Variable,
  Braces,
  Hash,
  Type,
  MousePointer,
  Keyboard,
  Monitor,
  Smartphone,
  Tablet,
  Watch,
  Gamepad2
} from 'lucide-react';

interface DevelopmentProject {
  id: string;
  name: string;
  type: 'ai-agent' | 'neural-model' | 'quantum-algorithm' | 'blockchain-dapp' | 'iot-integration' | 'visualization';
  status: 'planning' | 'development' | 'testing' | 'deployment' | 'production' | 'maintenance';
  progress: number;
  language: string;
  framework?: string;
  neuralComplexity: number;
  quantumFeatures: number;
  team: Developer[];
  repository: string;
  branch: string;
  commits: number;
  issues: number;
  lastDeployed?: Date;
  environment: 'development' | 'staging' | 'production';
}

interface Developer {
  id: string;
  name: string;
  role: 'lead' | 'senior' | 'mid' | 'junior' | 'intern';
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  expertise: string[];
  currentTask?: string;
  productivity: number;
  contributions: number;
  lastActive: Date;
}

interface NeuralModel {
  id: string;
  name: string;
  type: 'classification' | 'regression' | 'nlp' | 'vision' | 'reinforcement';
  status: 'training' | 'trained' | 'deployed' | 'error';
  accuracy: number;
  latency: number;
  size: number;
  dataset: string;
  trainingProgress: number;
  lastTrained: Date;
}

interface QuantumAlgorithm {
  id: string;
  name: string;
  type: 'optimization' | 'simulation' | 'cryptography' | 'search';
  status: 'running' | 'completed' | 'error' | 'queued';
  qubits: number;
  gates: number;
  executionTime: number;
  result?: any;
  startedAt: Date;
}

interface DevelopmentMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  category: 'performance' | 'quality' | 'productivity' | 'reliability';
}

interface CodeSnippet {
  id: string;
  title: string;
  language: string;
  code: string;
  description: string;
  tags: string[];
  likes: number;
  views: number;
  author: string;
  createdAt: Date;
}

interface APIEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  status: 'active' | 'deprecated' | 'experimental';
  usage: number;
  responseTime: number;
  errorRate: number;
}

export default function QuantumDeveloperDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProject, setSelectedProject] = useState('project-1');
  const [viewMode, setViewMode] = useState('grid');
  const [consoleOutput, setConsoleOutput] = useState<string[]>([
    '[INFO] Quantum SDK initialized',
    '[INFO] Neural core connected',
    '[INFO] Development environment ready',
    '[WARN] High memory usage detected',
    '[INFO] Auto-save enabled'
  ]);

  // Mock data
  const [projects, setProjects] = useState<DevelopmentProject[]>([
    {
      id: 'project-1',
      name: 'Neural Safety Monitor',
      type: 'ai-agent',
      status: 'development',
      progress: 78,
      language: 'TypeScript',
      framework: 'React',
      neuralComplexity: 0.85,
      quantumFeatures: 0.3,
      team: [
        {
          id: 'dev-1',
          name: 'Alex Chen',
          role: 'lead',
          status: 'online',
          expertise: ['neural-networks', 'typescript', 'react'],
          currentTask: 'Implementing neural core',
          productivity: 0.92,
          contributions: 45,
          lastActive: new Date()
        }
      ],
      repository: 'github.com/cortexbuild/neural-safety-monitor',
      branch: 'main',
      commits: 127,
      issues: 3,
      lastDeployed: new Date(Date.now() - 86400000),
      environment: 'staging'
    },
    {
      id: 'project-2',
      name: 'Quantum Optimizer',
      type: 'quantum-algorithm',
      status: 'testing',
      progress: 45,
      language: 'Python',
      framework: 'Qiskit',
      neuralComplexity: 0.4,
      quantumFeatures: 0.95,
      team: [
        {
          id: 'dev-2',
          name: 'Sarah Kim',
          role: 'senior',
          status: 'busy',
          expertise: ['quantum-computing', 'python', 'optimization'],
          currentTask: 'Testing quantum circuits',
          productivity: 0.88,
          contributions: 23,
          lastActive: new Date(Date.now() - 300000)
        }
      ],
      repository: 'github.com/cortexbuild/quantum-optimizer',
      branch: 'feature/quantum-optimization',
      commits: 89,
      issues: 7,
      environment: 'development'
    }
  ]);

  const [neuralModels, setNeuralModels] = useState<NeuralModel[]>([
    {
      id: 'model-1',
      name: 'Safety Pattern Detector',
      type: 'classification',
      status: 'training',
      accuracy: 0.94,
      latency: 45,
      size: 150,
      dataset: 'Construction Safety Dataset v2',
      trainingProgress: 67,
      lastTrained: new Date(Date.now() - 3600000)
    },
    {
      id: 'model-2',
      name: 'Risk Predictor',
      type: 'regression',
      status: 'deployed',
      accuracy: 0.89,
      latency: 23,
      size: 89,
      dataset: 'Historical Project Data',
      trainingProgress: 100,
      lastTrained: new Date(Date.now() - 86400000)
    }
  ]);

  const [quantumAlgorithms, setQuantumAlgorithms] = useState<QuantumAlgorithm[]>([
    {
      id: 'qalg-1',
      name: 'Project Scheduler',
      type: 'optimization',
      status: 'running',
      qubits: 50,
      gates: 1200,
      executionTime: 45000,
      startedAt: new Date(Date.now() - 45000)
    },
    {
      id: 'qalg-2',
      name: 'Material Optimizer',
      type: 'optimization',
      status: 'completed',
      qubits: 30,
      gates: 800,
      executionTime: 32000,
      result: { optimization: 0.23, savings: 45000 },
      startedAt: new Date(Date.now() - 7200000)
    }
  ]);

  const [metrics, setMetrics] = useState<DevelopmentMetric[]>([
    {
      id: 'code-quality',
      name: 'Code Quality',
      value: 94.5,
      unit: '%',
      trend: 'up',
      category: 'quality'
    },
    {
      id: 'test-coverage',
      name: 'Test Coverage',
      value: 87.3,
      unit: '%',
      trend: 'up',
      category: 'quality'
    },
    {
      id: 'deployment-frequency',
      name: 'Deployment Frequency',
      value: 12,
      unit: '/week',
      trend: 'up',
      category: 'productivity'
    },
    {
      id: 'neural-accuracy',
      name: 'Neural Model Accuracy',
      value: 91.2,
      unit: '%',
      trend: 'up',
      category: 'performance'
    }
  ]);

  const [codeSnippets, setCodeSnippets] = useState<CodeSnippet[]>([
    {
      id: 'snippet-1',
      title: 'Neural Network Hook',
      language: 'typescript',
      code: `const useNeuralNetwork = (config) => {
  const [model, setModel] = useState(null);

  useEffect(() => {
    initializeNeuralModel(config);
  }, [config]);

  return { model, predict };
};`,
      description: 'Custom hook for neural network integration',
      tags: ['react', 'neural', 'hooks'],
      likes: 23,
      views: 156,
      author: 'Alex Chen',
      createdAt: new Date(Date.now() - 86400000)
    }
  ]);

  const [apiEndpoints, setApiEndpoints] = useState<APIEndpoint[]>([
    {
      id: 'api-1',
      method: 'POST',
      path: '/api/neural/inference',
      description: 'Run neural network inference',
      status: 'active',
      usage: 15420,
      responseTime: 45,
      errorRate: 0.02
    },
    {
      id: 'api-2',
      method: 'POST',
      path: '/api/quantum/execute',
      description: 'Execute quantum algorithm',
      status: 'active',
      usage: 3420,
      responseTime: 1200,
      errorRate: 0.05
    }
  ]);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: <Eye className="w-4 h-4" /> },
    { id: 'neural', name: 'Neural Models', icon: <Brain className="w-4 h-4" /> },
    { id: 'quantum', name: 'Quantum Tools', icon: <Zap className="w-4 h-4" /> },
    { id: 'blockchain', name: 'Blockchain', icon: <Database className="w-4 h-4" /> },
    { id: 'testing', name: 'Testing Suite', icon: <TestTube className="w-4 h-4" /> },
    { id: 'deployment', name: 'Deployment', icon: <Rocket className="w-4 h-4" /> },
    { id: 'api', name: 'API Manager', icon: <Globe className="w-4 h-4" /> },
    { id: 'snippets', name: 'Code Snippets', icon: <Code className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Code className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Developer Hub</h1>
                  <p className="text-sm text-gray-400">Quantum Development Environment</p>
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

              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Development Controls */}
              <div className="flex items-center space-x-2">
                <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                  <Play className="w-4 h-4 inline mr-1" />
                  Run
                </button>
                <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                  <Square className="w-4 h-4 inline mr-1" />
                  Stop
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                  <RotateCcw className="w-4 h-4 inline mr-1" />
                  Reset
                </button>
              </div>
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
                      ? 'bg-purple-600 text-white'
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
                {/* Development Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {metrics.map((metric) => (
                    <motion.div
                      key={metric.id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-white">{metric.value}{metric.unit}</h3>
                          <p className="text-gray-400 text-sm">{metric.name}</p>
                        </div>
                        <div className={`flex items-center space-x-1 ${
                          metric.trend === 'up' ? 'text-green-400' :
                          metric.trend === 'down' ? 'text-red-400' : 'text-gray-400'
                        }`}>
                          <TrendingUp className={`w-4 h-4 ${metric.trend === 'down' ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Active Projects */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Project Cards */}
                  <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10">
                    <div className="p-6 border-b border-white/10">
                      <h2 className="text-lg font-semibold text-white flex items-center">
                        <Code className="w-5 h-5 mr-2 text-blue-400" />
                        Active Projects
                      </h2>
                    </div>
                    <div className="p-6 space-y-4">
                      {projects.map((project) => (
                        <motion.div
                          key={project.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="p-4 rounded-lg bg-gray-800/50 border border-gray-700"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="text-white font-medium">{project.name}</h3>
                              <div className="flex items-center space-x-2 text-sm text-gray-400">
                                <span className="capitalize">{project.type.replace('-', ' ')}</span>
                                <span>•</span>
                                <span>{project.language}</span>
                                <span>•</span>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  project.status === 'development' ? 'bg-blue-500/20 text-blue-400' :
                                  project.status === 'testing' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-green-500/20 text-green-400'
                                }`}>
                                  {project.status}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-white">{project.progress}%</div>
                              <div className="w-16 bg-gray-700 rounded-full h-1 mt-1">
                                <div
                                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-1 rounded-full"
                                  style={{ width: `${project.progress}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-1">
                                <Brain className="w-4 h-4 text-purple-400" />
                                <span className="text-sm text-gray-400">
                                  Neural: {(project.neuralComplexity * 100).toFixed(0)}%
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Zap className="w-4 h-4 text-blue-400" />
                                <span className="text-sm text-gray-400">
                                  Quantum: {(project.quantumFeatures * 100).toFixed(0)}%
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-400">{project.commits} commits</span>
                              <button className="text-gray-400 hover:text-white">
                                <GitBranch className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Neural Models */}
                  <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10">
                    <div className="p-6 border-b border-white/10">
                      <h2 className="text-lg font-semibold text-white flex items-center">
                        <Brain className="w-5 h-5 mr-2 text-purple-400" />
                        Neural Models
                      </h2>
                    </div>
                    <div className="p-6 space-y-4">
                      {neuralModels.map((model) => (
                        <motion.div
                          key={model.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 rounded-lg bg-gray-800/50 border border-gray-700"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="text-white font-medium">{model.name}</h3>
                              <div className="flex items-center space-x-2 text-sm text-gray-400">
                                <span className="capitalize">{model.type}</span>
                                <span>•</span>
                                <span>{model.accuracy * 100}% accuracy</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                model.status === 'training' ? 'bg-yellow-500/20 text-yellow-400' :
                                model.status === 'deployed' ? 'bg-green-500/20 text-green-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {model.status}
                              </div>
                              {model.status === 'training' && (
                                <div className="w-16 bg-gray-700 rounded-full h-1 mt-1">
                                  <div
                                    className="bg-purple-500 h-1 rounded-full"
                                    style={{ width: `${model.trainingProgress}%` }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Development Console */}
                <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="p-6 border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-white flex items-center">
                        <Terminal className="w-5 h-5 mr-2 text-green-400" />
                        Development Console
                      </h2>
                      <div className="flex items-center space-x-2">
                        <button className="text-gray-400 hover:text-white">
                          <Play className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-white">
                          <Square className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-white">
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
                      <div className="space-y-1 text-gray-300">
                        {consoleOutput.map((line, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`${line.includes('[ERROR]') ? 'text-red-400' :
                                       line.includes('[WARN]') ? 'text-yellow-400' :
                                       line.includes('[INFO]') ? 'text-blue-400' :
                                       'text-gray-400'}`}
                          >
                            {line}
                          </motion.div>
                        ))}
                      </div>
                      <div className="mt-4 flex items-center">
                        <span className="text-green-400 mr-2">$</span>
                        <input
                          type="text"
                          placeholder="Enter command..."
                          className="flex-1 bg-transparent text-white outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quantum Algorithms */}
                <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="p-6 border-b border-white/10">
                    <h2 className="text-lg font-semibold text-white flex items-center">
                      <Zap className="w-5 h-5 mr-2 text-blue-400" />
                      Quantum Algorithms
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {quantumAlgorithms.map((algorithm) => (
                        <motion.div
                          key={algorithm.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-4 rounded-lg bg-gray-800/50 border border-gray-700"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-white font-medium">{algorithm.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              algorithm.status === 'running' ? 'bg-green-500/20 text-green-400' :
                              algorithm.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {algorithm.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <div className="text-gray-400">Qubits</div>
                              <div className="text-white font-medium">{algorithm.qubits}</div>
                            </div>
                            <div>
                              <div className="text-gray-400">Gates</div>
                              <div className="text-white font-medium">{algorithm.gates}</div>
                            </div>
                            <div>
                              <div className="text-gray-400">Time</div>
                              <div className="text-white font-medium">{(algorithm.executionTime / 1000).toFixed(1)}s</div>
                            </div>
                          </div>

                          {algorithm.result && (
                            <div className="mt-3 p-2 bg-green-500/10 rounded border border-green-500/20">
                              <p className="text-green-400 text-xs">
                                Result: {JSON.stringify(algorithm.result)}
                              </p>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Code Snippets */}
                <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="p-6 border-b border-white/10">
                    <h2 className="text-lg font-semibold text-white flex items-center">
                      <Code className="w-5 h-5 mr-2 text-pink-400" />
                      Featured Code Snippets
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {codeSnippets.map((snippet) => (
                        <motion.div
                          key={snippet.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 rounded-lg bg-gray-800/50 border border-gray-700"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-white font-medium">{snippet.title}</h3>
                              <p className="text-gray-400 text-sm">{snippet.description}</p>
                              <div className="flex items-center space-x-2 mt-2">
                                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                                  {snippet.language}
                                </span>
                                {snippet.tags.map((tag) => (
                                  <span key={tag} className="px-2 py-1 bg-gray-600/50 text-gray-300 text-xs rounded-full">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button className="text-gray-400 hover:text-white">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="text-gray-400 hover:text-white">
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="bg-gray-900 rounded-lg p-3 font-mono text-sm text-gray-300">
                            <pre className="whitespace-pre-wrap">{snippet.code}</pre>
                          </div>

                          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                            <span>By {snippet.author}</span>
                            <div className="flex items-center space-x-4">
                              <span>{snippet.likes} likes</span>
                              <span>{snippet.views} views</span>
                              <span>{snippet.createdAt.toLocaleDateString()}</span>
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
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} development tools would be implemented here.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}