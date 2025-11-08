/**
 * Platform Features Page
 * Comprehensive showcase of all quantum and neural features
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Zap,
  Shield,
  Network,
  Database,
  Cpu,
  Layers,
  Activity,
  Target,
  TrendingUp,
  BarChart3,
  PieChart,
  LineChart,
  Eye,
  Settings,
  Lock,
  Unlock,
  Key,
  CheckCircle,
  Star,
  Award,
  Rocket,
  Lightbulb,
  Sparkles,
  Atom,
  Infinity as InfinityIcon,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Watch,
  Camera,
  Video,
  Music,
  FileText,
  Image,
  Archive,
  Code,
  Terminal,
  GitBranch,
  Workflow,
  Bot,
  Function,
  Variable,
  Braces,
  Hash,
  Type,
  MousePointer,
  Keyboard,
  Hand,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Battery,
  Signal,
  Bluetooth,
  Nfc,
  Satellite,
  Radio,
  Zap as ZapIcon,
  Cloud,
  Sun,
  Moon,
  Star as StarIcon,
  Heart,
  ThumbsUp,
  MessageSquare,
  Share,
  Download,
  Upload,
  Play,
  Pause,
  Square,
  RotateCcw,
  Maximize2,
  Minimize2,
  Plus,
  Minus,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid,
  List,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ArrowLeft,
  X,
  HelpCircle,
  Info,
  AlertTriangle,
  CheckCircle as CheckCircleIcon,
  ExternalLink
} from 'lucide-react';

interface FeatureCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  features: PlatformFeature[];
  advanced: boolean;
}

interface PlatformFeature {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'available' | 'coming-soon' | 'beta' | 'enterprise';
  category: 'neural' | 'quantum' | 'security' | 'collaboration' | 'analytics' | 'integration';
  benefits: string[];
  technical: string[];
  useCase: string;
}

export default function PlatformFeaturesPage() {
  const [selectedCategory, setSelectedCategory] = useState('neural-intelligence');
  const [viewMode, setViewMode] = useState('overview');
  const [showTechnical, setShowTechnical] = useState(false);

  const featureCategories: FeatureCategory[] = [
    {
      id: 'neural-intelligence',
      name: 'Neural Intelligence',
      icon: <Brain className="w-6 h-6 text-purple-400" />,
      description: 'Advanced AI with consciousness evolution and breakthrough detection',
      advanced: true,
      features: [
        {
          id: 'consciousness-evolution',
          name: 'Consciousness Evolution',
          description: 'AI agents that learn, adapt, and evolve their capabilities over time',
          icon: <Brain className="w-5 h-5" />,
          status: 'available',
          category: 'neural',
          benefits: ['Self-improving AI', 'Adaptive learning', 'Continuous optimization'],
          technical: ['Neural architecture search', 'Meta-learning algorithms', 'Reinforcement learning'],
          useCase: 'AI agents that improve project management accuracy by 40%'
        },
        {
          id: 'breakthrough-detection',
          name: 'Breakthrough Detection',
          description: 'Identify innovative solutions and optimization opportunities',
          icon: <Lightbulb className="w-5 h-5" />,
          status: 'available',
          category: 'neural',
          benefits: ['Innovation discovery', 'Optimization opportunities', 'Creative problem solving'],
          technical: ['Generative adversarial networks', 'Novelty detection', 'Creative AI algorithms'],
          useCase: 'Discover new construction methods that reduce costs by 25%'
        },
        {
          id: 'neural-prediction',
          name: 'Neural Prediction Engine',
          description: 'Predict project outcomes, risks, and opportunities with neural foresight',
          icon: <Target className="w-5 h-5" />,
          status: 'available',
          category: 'neural',
          benefits: ['Risk prediction', 'Outcome forecasting', 'Proactive management'],
          technical: ['Time series analysis', 'Sequence modeling', 'Probabilistic forecasting'],
          useCase: 'Predict project delays 3 weeks in advance with 89% accuracy'
        }
      ]
    },
    {
      id: 'quantum-computing',
      name: 'Quantum Computing',
      icon: <Zap className="w-6 h-6 text-blue-400" />,
      description: 'Next-generation optimization and complex problem solving',
      advanced: true,
      features: [
        {
          id: 'quantum-optimization',
          name: 'Quantum Optimization',
          description: 'Solve complex optimization problems using quantum algorithms',
          icon: <ZapIcon className="w-5 h-5" />,
          status: 'available',
          category: 'quantum',
          benefits: ['Exponential speedup', 'Complex problem solving', 'Resource optimization'],
          technical: ['Variational quantum eigensolver', 'Quantum approximate optimization', 'QAOA algorithms'],
          useCase: 'Optimize construction schedules with 100x faster computation'
        },
        {
          id: 'quantum-simulation',
          name: 'Quantum Simulation',
          description: 'Simulate molecular and material properties for construction materials',
          icon: <Atom className="w-5 h-5" />,
          status: 'beta',
          category: 'quantum',
          benefits: ['Material discovery', 'Property prediction', 'Quality optimization'],
          technical: ['Quantum phase estimation', 'Hamiltonian simulation', 'Molecular modeling'],
          useCase: 'Discover new concrete mixtures with 30% better durability'
        },
        {
          id: 'quantum-cryptography',
          name: 'Quantum Cryptography',
          description: 'Unbreakable encryption using quantum key distribution',
          icon: <Shield className="w-5 h-5" />,
          status: 'available',
          category: 'security',
          benefits: ['Unbreakable security', 'Future-proof encryption', 'Regulatory compliance'],
          technical: ['BB84 protocol', 'Quantum key distribution', 'Post-quantum cryptography'],
          useCase: 'Secure sensitive construction data with quantum-resistant encryption'
        }
      ]
    },
    {
      id: 'advanced-security',
      name: 'Advanced Security',
      icon: <Shield className="w-6 h-6 text-green-400" />,
      description: 'Enterprise-grade security with quantum and neural protection',
      advanced: true,
      features: [
        {
          id: 'neural-authentication',
          name: 'Neural Authentication',
          description: 'AI-powered behavioral authentication and anomaly detection',
          icon: <Brain className="w-5 h-5" />,
          status: 'available',
          category: 'security',
          benefits: ['Behavioral biometrics', 'Anomaly detection', 'Continuous authentication'],
          technical: ['Neural network authentication', 'Behavioral pattern analysis', 'Risk scoring'],
          useCase: 'Detect unauthorized access attempts with 99.7% accuracy'
        },
        {
          id: 'quantum-blockchain',
          name: 'Quantum Blockchain',
          description: 'Immutable records with quantum-resistant security',
          icon: <Database className="w-5 h-5" />,
          status: 'available',
          category: 'security',
          benefits: ['Immutable records', 'Tamper-proof data', 'Audit compliance'],
          technical: ['Quantum hash functions', 'Neural consensus', 'Distributed ledger'],
          useCase: 'Maintain tamper-proof construction project records'
        },
        {
          id: 'predictive-threat-detection',
          name: 'Predictive Threat Detection',
          description: 'AI-powered security threat prediction and prevention',
          icon: <Eye className="w-5 h-5" />,
          status: 'available',
          category: 'security',
          benefits: ['Threat prediction', 'Proactive security', 'Risk mitigation'],
          technical: ['Anomaly detection', 'Pattern recognition', 'Threat modeling'],
          useCase: 'Prevent security incidents before they occur'
        }
      ]
    },
    {
      id: 'real-time-collaboration',
      name: 'Real-time Collaboration',
      icon: <Network className="w-6 h-6 text-yellow-400" />,
      description: 'Quantum-synchronized collaboration with neural assistance',
      advanced: true,
      features: [
        {
          id: 'quantum-synchronization',
          name: 'Quantum Synchronization',
          description: 'Instant synchronization across all connected devices and users',
          icon: <Infinity className="w-5 h-5" />,
          status: 'available',
          category: 'collaboration',
          benefits: ['Instant sync', 'Zero latency', 'Global collaboration'],
          technical: ['Quantum entanglement simulation', 'Distributed consensus', 'Real-time protocols'],
          useCase: 'Collaborate with team members across different time zones instantly'
        },
        {
          id: 'neural-assistance',
          name: 'Neural Assistance',
          description: 'AI-powered collaboration assistance and meeting facilitation',
          icon: <Bot className="w-5 h-5" />,
          status: 'available',
          category: 'collaboration',
          benefits: ['Meeting facilitation', 'Note taking', 'Action item tracking'],
          technical: ['Natural language processing', 'Speech recognition', 'Action extraction'],
          useCase: 'Automatically generate meeting notes and action items'
        },
        {
          id: 'collective-intelligence',
          name: 'Collective Intelligence',
          description: 'Amplify team intelligence through neural network analysis',
          icon: <Users className="w-5 h-5" />,
          status: 'available',
          category: 'collaboration',
          benefits: ['Team optimization', 'Skill mapping', 'Knowledge sharing'],
          technical: ['Social network analysis', 'Expertise mapping', 'Knowledge graphs'],
          useCase: 'Optimize team composition for maximum productivity'
        }
      ]
    },
    {
      id: 'advanced-analytics',
      name: 'Advanced Analytics',
      icon: <BarChart3 className="w-6 h-6 text-indigo-400" />,
      description: 'Neural network-powered insights and predictive modeling',
      advanced: true,
      features: [
        {
          id: 'predictive-modeling',
          name: 'Predictive Modeling',
          description: 'AI-powered forecasting and trend analysis',
          icon: <TrendingUp className="w-5 h-5" />,
          status: 'available',
          category: 'analytics',
          benefits: ['Future prediction', 'Trend analysis', 'Risk forecasting'],
          technical: ['Time series forecasting', 'Regression analysis', 'Neural forecasting'],
          useCase: 'Predict project costs and timelines with 94% accuracy'
        },
        {
          id: 'neural-insights',
          name: 'Neural Insights',
          description: 'Deep learning analysis of project data and patterns',
          icon: <Activity className="w-5 h-5" />,
          status: 'available',
          category: 'analytics',
          benefits: ['Pattern recognition', 'Anomaly detection', 'Optimization suggestions'],
          technical: ['Deep neural networks', 'Unsupervised learning', 'Feature extraction'],
          useCase: 'Identify optimization opportunities across all projects'
        },
        {
          id: 'real-time-dashboards',
          name: 'Real-time Dashboards',
          description: 'Live data visualization with neural personalization',
          icon: <PieChart className="w-5 h-5" />,
          status: 'available',
          category: 'analytics',
          benefits: ['Live updates', 'Personalized views', 'Interactive visualization'],
          technical: ['Real-time data processing', 'Adaptive interfaces', 'Neural personalization'],
          useCase: 'Monitor project progress with personalized dashboards'
        }
      ]
    },
    {
      id: 'integration-ecosystem',
      name: 'Integration Ecosystem',
      icon: <Globe className="w-6 h-6 text-pink-400" />,
      description: 'Comprehensive integration with external systems and IoT devices',
      advanced: true,
      features: [
        {
          id: 'iot-sensor-network',
          name: 'IoT Sensor Network',
          description: 'Quantum-entangled sensor networks for real-time monitoring',
          icon: <Radio className="w-5 h-5" />,
          status: 'available',
          category: 'integration',
          benefits: ['Real-time monitoring', 'Predictive maintenance', 'Quality control'],
          technical: ['Quantum sensors', 'Edge computing', 'Neural calibration'],
          useCase: 'Monitor construction site conditions in real-time'
        },
        {
          id: 'api-ecosystem',
          name: 'API Ecosystem',
          description: 'Comprehensive API suite for custom integrations',
          icon: <Code className="w-5 h-5" />,
          status: 'available',
          category: 'integration',
          benefits: ['Easy integration', 'Custom development', 'Third-party connections'],
          technical: ['REST APIs', 'GraphQL', 'WebSocket APIs', 'Neural APIs'],
          useCase: 'Integrate with existing construction management systems'
        },
        {
          id: 'blockchain-integration',
          name: 'Blockchain Integration',
          description: 'Immutable record keeping and smart contract automation',
          icon: <Database className="w-5 h-5" />,
          status: 'available',
          category: 'integration',
          benefits: ['Immutable records', 'Smart contracts', 'Audit trails'],
          technical: ['Distributed ledger', 'Smart contracts', 'Consensus algorithms'],
          useCase: 'Automate contract payments and milestone tracking'
        }
      ]
    }
  ];

  const selectedCategoryData = featureCategories.find(c => c.id === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Platform Features</h1>
                  <p className="text-sm text-gray-400">Next-Generation Capabilities</p>
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('overview')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${viewMode === 'overview' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                  <Eye className="w-4 h-4 inline mr-1" />
                  Overview
                </button>
                <button
                  onClick={() => setViewMode('technical')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${viewMode === 'technical' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                  <Settings className="w-4 h-4 inline mr-1" />
                  Technical
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                <Download className="w-4 h-4 inline mr-2" />
                Documentation
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar - Feature Categories */}
        <div className="w-80 bg-black/20 backdrop-blur-sm border-r border-white/10">
          <nav className="p-6">
            <div className="space-y-2">
              {featureCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    {category.icon}
                    <div>
                      <div className="font-medium">{category.name}</div>
                      {category.advanced && (
                        <div className="text-xs text-blue-400">Advanced</div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {selectedCategoryData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Category Header */}
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  {selectedCategoryData.icon}
                  <h1 className="text-4xl font-bold text-white">{selectedCategoryData.name}</h1>
                  {selectedCategoryData.advanced && (
                    <div className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                      Advanced
                    </div>
                  )}
                </div>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                  {selectedCategoryData.description}
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {selectedCategoryData.features.map((feature, index) => (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-200"
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${feature.status === 'available' ? 'bg-green-500/20' :
                        feature.status === 'beta' ? 'bg-yellow-500/20' :
                          feature.status === 'coming-soon' ? 'bg-gray-500/20' :
                            'bg-purple-500/20'
                        }`}>
                        <div className={
                          feature.status === 'available' ? 'text-green-400' :
                            feature.status === 'beta' ? 'text-yellow-400' :
                              feature.status === 'coming-soon' ? 'text-gray-400' :
                                'text-purple-400'
                        }>
                          {feature.icon}
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-xl font-semibold text-white">{feature.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${feature.status === 'available' ? 'bg-green-500/20 text-green-400' :
                            feature.status === 'beta' ? 'bg-yellow-500/20 text-yellow-400' :
                              feature.status === 'coming-soon' ? 'bg-gray-500/20 text-gray-400' :
                                'bg-purple-500/20 text-purple-400'
                            }`}>
                            {feature.status}
                          </span>
                        </div>

                        <p className="text-gray-400 mb-4">{feature.description}</p>

                        {/* Benefits */}
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-white mb-2">Benefits</h4>
                          <div className="flex flex-wrap gap-2">
                            {feature.benefits.map((benefit, idx) => (
                              <span key={idx} className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                                {benefit}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Use Case */}
                        <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                          <p className="text-blue-300 text-sm">{feature.useCase}</p>
                        </div>

                        {/* Technical Details (if enabled) */}
                        {showTechnical && (
                          <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-600">
                            <h4 className="text-sm font-medium text-white mb-2">Technical Implementation</h4>
                            <div className="flex flex-wrap gap-2">
                              {feature.technical.map((tech, idx) => (
                                <span key={idx} className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Technical Details Toggle */}
              <div className="text-center">
                <button
                  onClick={() => setShowTechnical(!showTechnical)}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  {showTechnical ? 'Hide' : 'Show'} Technical Details
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}