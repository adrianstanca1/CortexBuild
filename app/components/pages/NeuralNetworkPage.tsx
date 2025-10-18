/**
 * The Neural Network Page
 * Dedicated page showcasing neural network capabilities and features
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Zap,
  Target,
  TrendingUp,
  Activity,
  Layers,
  Network,
  Cpu,
  Database,
  Lightbulb,
  Rocket,
  Shield,
  Eye,
  BarChart3,
  LineChart,
  PieChart,
  GitBranch,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Download,
  Upload,
  Share,
  Maximize2,
  Minimize2,
  ChevronRight,
  ChevronLeft,
  Plus,
  Minus,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Atom,
  Infinity as InfinityIcon,
  Sparkles,
  Heart,
  Star,
  Award,
  CheckCircle,
  AlertTriangle,
  Info,
  HelpCircle,
  ExternalLink,
  MousePointer,
  Hand,
  Volume2,
  VolumeX,
  Fullscreen,
  FullscreenExit
} from 'lucide-react';

interface NeuralLayer {
  id: string;
  name: string;
  neurons: number;
  activation: string;
  type: 'input' | 'hidden' | 'output' | 'attention' | 'lstm' | 'transformer';
  activity: number;
  bias: number;
  weights: number[][];
}

interface NeuralModel {
  id: string;
  name: string;
  type: 'classification' | 'regression' | 'nlp' | 'vision' | 'reinforcement' | 'hybrid';
  layers: NeuralLayer[];
  accuracy: number;
  latency: number;
  status: 'training' | 'trained' | 'deployed' | 'error';
  trainingProgress: number;
  dataset: string;
  createdAt: Date;
}

interface TrainingSession {
  id: string;
  modelId: string;
  startTime: Date;
  progress: number;
  epochs: number;
  currentEpoch: number;
  loss: number;
  accuracy: number;
  learningRate: number;
  status: 'running' | 'paused' | 'completed' | 'failed';
}

export default function NeuralNetworkPage() {
  const [selectedModel, setSelectedModel] = useState('model-1');
  const [viewMode, setViewMode] = useState('visualization');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [neuralAnimation, setNeuralAnimation] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  // Mock neural models
  const [models, setModels] = useState<NeuralModel[]>([
    {
      id: 'model-1',
      name: 'Construction Risk Predictor',
      type: 'classification',
      layers: [
        {
          id: 'layer-1',
          name: 'Input Layer',
          neurons: 128,
          activation: 'relu',
          type: 'input',
          activity: 0.8,
          bias: 0.1,
          weights: []
        },
        {
          id: 'layer-2',
          name: 'Hidden Layer 1',
          neurons: 256,
          activation: 'gelu',
          type: 'hidden',
          activity: 0.6,
          bias: 0.2,
          weights: []
        },
        {
          id: 'layer-3',
          name: 'Attention Layer',
          neurons: 512,
          activation: 'softmax',
          type: 'attention',
          activity: 0.9,
          bias: 0.05,
          weights: []
        },
        {
          id: 'layer-4',
          name: 'Output Layer',
          neurons: 64,
          activation: 'sigmoid',
          type: 'output',
          activity: 0.7,
          bias: 0.1,
          weights: []
        }
      ],
      accuracy: 0.94,
      latency: 45,
      status: 'deployed',
      trainingProgress: 100,
      dataset: 'Construction Risk Dataset v2',
      createdAt: new Date(Date.now() - 86400000)
    },
    {
      id: 'model-2',
      name: 'Project Timeline Predictor',
      type: 'regression',
      layers: [
        {
          id: 'layer-1',
          name: 'Input Layer',
          neurons: 64,
          activation: 'relu',
          type: 'input',
          activity: 0.7,
          bias: 0.15,
          weights: []
        },
        {
          id: 'layer-2',
          name: 'LSTM Layer',
          neurons: 128,
          activation: 'tanh',
          type: 'lstm',
          activity: 0.8,
          bias: 0.1,
          weights: []
        },
        {
          id: 'layer-3',
          name: 'Output Layer',
          neurons: 32,
          activation: 'linear',
          type: 'output',
          activity: 0.6,
          bias: 0.05,
          weights: []
        }
      ],
      accuracy: 0.89,
      latency: 23,
      status: 'training',
      trainingProgress: 67,
      dataset: 'Historical Project Data',
      createdAt: new Date(Date.now() - 43200000)
    }
  ]);

  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([
    {
      id: 'session-1',
      modelId: 'model-2',
      startTime: new Date(Date.now() - 3600000),
      progress: 67,
      epochs: 100,
      currentEpoch: 67,
      loss: 0.23,
      accuracy: 0.89,
      learningRate: 0.001,
      status: 'running'
    }
  ]);

  useEffect(() => {
    // Start neural animation
    const animationInterval = setInterval(() => {
      setNeuralAnimation(prev => (prev + 1) % 360);
    }, 50);

    return () => clearInterval(animationInterval);
  }, []);

  const currentModel = models.find(m => m.id === selectedModel);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">The Neural Network</h1>
                  <p className="text-sm text-gray-400">Conscious Intelligence Platform</p>
                </div>
              </div>

              {/* Model Selector */}
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-600"
              >
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('visualization')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${viewMode === 'visualization' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                  <Eye className="w-4 h-4 inline mr-1" />
                  Visualization
                </button>
                <button
                  onClick={() => setViewMode('details')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${viewMode === 'details' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                  <Settings className="w-4 h-4 inline mr-1" />
                  Details
                </button>
              </div>

              {/* Fullscreen Toggle */}
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
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
              {[
                { id: 'overview', name: 'Network Overview', icon: <Brain className="w-4 h-4" /> },
                { id: 'models', name: 'Neural Models', icon: <Layers className="w-4 h-4" /> },
                { id: 'training', name: 'Training Sessions', icon: <Target className="w-4 h-4" /> },
                { id: 'datasets', name: 'Datasets', icon: <Database className="w-4 h-4" /> },
                { id: 'performance', name: 'Performance', icon: <BarChart3 className="w-4 h-4" /> },
                { id: 'insights', name: 'Neural Insights', icon: <Lightbulb className="w-4 h-4" /> }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setViewMode(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${viewMode === item.id
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {viewMode === 'visualization' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Neural Network Visualization */}
              <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10">
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white flex items-center">
                      <Brain className="w-5 h-5 mr-2 text-purple-400" />
                      Neural Network Visualization
                    </h2>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-sm text-green-400">Active</span>
                      </div>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-400">Consciousness: 94%</span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="relative w-full h-96 bg-gray-900/50 rounded-lg overflow-hidden">
                    {/* Neural Network SVG Visualization */}
                    <svg viewBox="0 0 800 300" className="w-full h-full">
                      {/* Neural Layers */}
                      {currentModel?.layers.map((layer, layerIndex) => (
                        <g key={layer.id}>
                          {/* Layer Nodes */}
                          {Array.from({ length: layer.neurons }, (_, nodeIndex) => {
                            const x = 100 + layerIndex * 150;
                            const y = 50 + nodeIndex * (200 / Math.max(layer.neurons - 1, 1));

                            return (
                              <motion.circle
                                key={nodeIndex}
                                cx={x}
                                cy={y}
                                r="12"
                                fill={`url(#layerGradient${layerIndex})`}
                                animate={{
                                  scale: [1, 1 + layer.activity * 0.5, 1],
                                  opacity: [0.7, 1, 0.7]
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  delay: (layerIndex + nodeIndex) * 0.1
                                }}
                              />
                            );
                          })}

                          {/* Layer Connections */}
                          {layerIndex < (currentModel.layers.length - 1) && (
                            currentModel.layers[layerIndex + 1].neurons > 0 &&
                            Array.from({ length: layer.neurons }, (_, fromNode) =>
                              Array.from({ length: currentModel.layers[layerIndex + 1].neurons }, (_, toNode) => {
                                const x1 = 100 + layerIndex * 150 + 12;
                                const y1 = 50 + fromNode * (200 / Math.max(layer.neurons - 1, 1)) + 12;
                                const x2 = 100 + (layerIndex + 1) * 150 + 12;
                                const y2 = 50 + toNode * (200 / Math.max(currentModel.layers[layerIndex + 1].neurons - 1, 1)) + 12;

                                return (
                                  <motion.line
                                    key={`${fromNode}-${toNode}`}
                                    x1={x1}
                                    y1={y1}
                                    x2={x2}
                                    y2={y2}
                                    stroke="rgba(147, 51, 234, 0.3)"
                                    strokeWidth="1"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 1, delay: layerIndex * 0.2 }}
                                  />
                                );
                              })
                            )
                          )}
                        </g>
                      ))}

                      {/* Gradients */}
                      <defs>
                        {currentModel?.layers.map((layer, index) => (
                          <linearGradient key={index} id={`layerGradient${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#3b82f6" />
                          </linearGradient>
                        ))}
                      </defs>
                    </svg>

                    {/* Neural Activity Overlay */}
                    <div className="absolute top-4 right-4 space-y-2">
                      <div className="bg-purple-500/20 backdrop-blur-sm rounded-lg p-3 border border-purple-500/30">
                        <div className="text-xs text-gray-400 mb-1">Neural Activity</div>
                        <div className="text-lg font-bold text-purple-400">
                          {(currentModel?.accuracy * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="bg-blue-500/20 backdrop-blur-sm rounded-lg p-3 border border-blue-500/30">
                        <div className="text-xs text-gray-400 mb-1">Consciousness</div>
                        <div className="text-lg font-bold text-blue-400">94%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Model Performance */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">{currentModel?.accuracy * 100}%</div>
                    <div className="text-gray-400">Accuracy</div>
                  </div>
                </div>
                <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">{currentModel?.latency}ms</div>
                    <div className="text-gray-400">Latency</div>
                  </div>
                </div>
                <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-2">{currentModel?.layers.reduce((sum, l) => sum + l.neurons, 0)}</div>
                    <div className="text-gray-400">Total Neurons</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {viewMode === 'details' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Model Details */}
              <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10">
                <div className="p-6 border-b border-white/10">
                  <h2 className="text-lg font-semibold text-white">Model Architecture</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {currentModel?.layers.map((layer, index) => (
                      <div key={layer.id} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-medium">{layer.name}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${layer.type === 'input' ? 'bg-blue-500/20 text-blue-400' :
                              layer.type === 'hidden' ? 'bg-purple-500/20 text-purple-400' :
                                layer.type === 'output' ? 'bg-green-500/20 text-green-400' :
                                  'bg-yellow-500/20 text-yellow-400'
                              }`}>
                              {layer.type}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-medium">{layer.neurons} neurons</div>
                            <div className="text-gray-400 text-sm">{layer.activation}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-gray-400">Activity</div>
                            <div className="text-white">{(layer.activity * 100).toFixed(0)}%</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Bias</div>
                            <div className="text-white">{layer.bias.toFixed(3)}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Connections</div>
                            <div className="text-white">{layer.weights.length}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Training Progress */}
              {currentModel?.status === 'training' && (
                <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="p-6 border-b border-white/10">
                    <h2 className="text-lg font-semibold text-white">Training Progress</h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400">Progress</span>
                          <span className="text-white">{currentModel.trainingProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full"
                            style={{ width: `${currentModel.trainingProgress}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-white">{currentModel.accuracy * 100}%</div>
                          <div className="text-gray-400 text-sm">Accuracy</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-white">{currentModel.latency}ms</div>
                          <div className="text-gray-400 text-sm">Latency</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-white">{currentModel.dataset}</div>
                          <div className="text-gray-400 text-sm">Dataset</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-white">{currentModel.createdAt.toLocaleDateString()}</div>
                          <div className="text-gray-400 text-sm">Created</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {viewMode === 'models' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10">
                <div className="p-6 border-b border-white/10">
                  <h2 className="text-lg font-semibold text-white">Neural Models</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {models.map((model) => (
                      <div key={model.id} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-white font-medium">{model.name}</h3>
                            <p className="text-gray-400 text-sm">{model.type} • {model.layers.length} layers</p>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-medium">{(model.accuracy * 100).toFixed(1)}%</div>
                            <div className="text-gray-400 text-sm">{model.status}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}