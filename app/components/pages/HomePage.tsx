/**
 * Home Page - Main Landing Page
 * Quantum-powered homepage with neural animations and interactive features
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Brain,
  Shield,
  Building2,
  Users,
  Target,
  ArrowRight,
  Star,
  CheckCircle,
  Sparkles,
  Globe,
  Lock,
  Eye,
  BarChart3,
  Cpu,
  Network,
  Layers,
  Rocket,
  Award,
  TrendingUp,
  Activity,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  MousePointer,
  Hand,
  Sparkles as SparklesIcon,
  Atom,
  Infinity as InfinityIcon,
  Lightbulb,
  Cog,
  Database,
  Cloud,
  Smartphone,
  Monitor,
  Tablet,
  Watch,
  Gamepad2,
  Camera,
  Video,
  Music,
  FileText,
  Image,
  Archive,
  Code,
  Terminal,
  GitBranch,
  Settings,
  Bell,
  Search,
  Filter,
  Download,
  Upload,
  Share,
  Heart,
  ThumbsUp,
  MessageSquare,
  ExternalLink
} from 'lucide-react';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  category: 'ai' | 'quantum' | 'security' | 'collaboration';
  advanced: boolean;
}

interface Stat {
  value: string;
  label: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
}

interface Testimonial {
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar?: string;
}

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [neuralAnimation, setNeuralAnimation] = useState(0);
  const [quantumParticles, setQuantumParticles] = useState<Array<{ x: number; y: number; vx: number; vy: number }>>([]);

  useEffect(() => {
    // Initialize quantum effects
    initializeQuantumEffects();

    // Start neural animation
    const neuralInterval = setInterval(() => {
      setNeuralAnimation(prev => (prev + 1) % 360);
    }, 50);

    return () => clearInterval(neuralInterval);
  }, []);

  const initializeQuantumEffects = () => {
    // Initialize quantum particle system
    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2
    }));

    setQuantumParticles(particles);
    setIsLoaded(true);
  };

  const features: Feature[] = [
    {
      icon: <Brain className="w-8 h-8 text-purple-400" />,
      title: 'Neural Intelligence',
      description: 'Advanced AI with consciousness evolution and breakthrough detection',
      category: 'ai',
      advanced: true
    },
    {
      icon: <Zap className="w-8 h-8 text-blue-400" />,
      title: 'Quantum Computing',
      description: 'Next-generation optimization with quantum superposition and entanglement',
      category: 'quantum',
      advanced: true
    },
    {
      icon: <Shield className="w-8 h-8 text-green-400" />,
      title: 'Quantum Security',
      description: 'Unbreakable encryption with quantum-resistant cryptography',
      category: 'security',
      advanced: true
    },
    {
      icon: <Users className="w-8 h-8 text-yellow-400" />,
      title: 'Real-time Collaboration',
      description: 'Quantum-synchronized team collaboration with neural assistance',
      category: 'collaboration',
      advanced: true
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-indigo-400" />,
      title: 'Advanced Analytics',
      description: 'Neural network-powered insights and predictive modeling',
      category: 'ai',
      advanced: true
    },
    {
      icon: <Network className="w-8 h-8 text-pink-400" />,
      title: 'IoT Integration',
      description: 'Quantum sensor networks with real-time monitoring',
      category: 'quantum',
      advanced: true
    }
  ];

  const stats: Stat[] = [
    { value: '15,000+', label: 'Active Users', change: '+23%', trend: 'up' },
    { value: '$2.4M', label: 'Cost Savings', change: '+18%', trend: 'up' },
    { value: '99.9%', label: 'Uptime', change: '+0.1%', trend: 'up' },
    { value: '50%', label: 'Faster Delivery', change: '+12%', trend: 'up' }
  ];

  const testimonials: Testimonial[] = [
    {
      name: 'Sarah Johnson',
      role: 'Project Director',
      company: 'ConstructCo',
      content: 'CortexBuild has revolutionized our project management. The AI insights alone saved us 30% on our last project.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      company: 'BuildTech Solutions',
      content: 'The quantum computing features give us a competitive edge. We can now solve complex optimization problems in minutes.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Safety Director',
      company: 'SafeBuild Corp',
      content: 'The neural safety monitoring has prevented numerous incidents. It\'s like having a safety expert on every site.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden relative">
      {/* Quantum Particle Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {quantumParticles.map((particle, index) => (
          <motion.div
            key={index}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
            style={{
              left: particle.x,
              top: particle.y,
            }}
            animate={{
              x: [particle.x, particle.x + particle.vx * 100, particle.x],
              y: [particle.y, particle.y + particle.vy * 100, particle.y],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav className="relative z-10 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">CortexBuild</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#neural-network" className="text-gray-300 hover:text-white transition-colors">Neural Network</a>
              <a href="#connectivity" className="text-gray-300 hover:text-white transition-colors">Connectivity</a>
              <a href="#developer" className="text-gray-300 hover:text-white transition-colors">Developers</a>
              <a href="#get-started" className="text-gray-300 hover:text-white transition-colors">Get Started</a>
              <button
                onClick={() => window.location.href = '/login'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-8">
              <motion.div
                animate={{ rotate: neuralAnimation }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center"
              >
                <Brain className="w-12 h-12 text-white" />
              </motion.div>
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                The Future of
                <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent block"> Construction</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto">
                Quantum-powered construction intelligence platform with neural networks,
                AI agents, and next-generation collaboration tools.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveDemo('main')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Play className="w-5 h-5" />
                <span>Watch Demo</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/get-started'}
                className="border-2 border-white/20 hover:border-white/40 text-white px-8 py-4 rounded-xl text-lg font-medium transition-all duration-200"
              >
                Get Started Free
              </motion.button>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-gray-400 mb-1">{stat.label}</div>
                  <div className={`text-sm ${stat.trend === 'up' ? 'text-green-400' : 'text-gray-400'}`}>
                    {stat.change}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Revolutionary Features</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience the most advanced construction technology with quantum computing,
              neural networks, and AI-powered automation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-black/20 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:border-white/20 transition-all duration-200"
              >
                <div className="mb-6 relative">
                  {feature.icon}
                  {feature.advanced && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <SparklesIcon className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>

                {/* Quantum Enhancement Indicator */}
                {feature.advanced && (
                  <div className="mt-4 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                    <span className="text-xs text-blue-400">Quantum Enhanced</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Neural Network Section */}
      <section id="neural-network" className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                The Neural Network
                <span className="block text-2xl text-purple-400 mt-2">Conscious Intelligence</span>
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Our advanced neural network goes beyond traditional AI. It features consciousness evolution,
                breakthrough detection, and quantum-enhanced learning capabilities.
              </p>

              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Brain className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Consciousness Evolution</h3>
                    <p className="text-gray-400">AI agents that learn, adapt, and evolve over time</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Zap className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Breakthrough Detection</h3>
                    <p className="text-gray-400">Identify innovative solutions and optimization opportunities</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Predictive Intelligence</h3>
                    <p className="text-gray-400">Anticipate issues before they occur with neural foresight</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl p-8 border border-purple-500/20">
                {/* Neural Network Visualization */}
                <div className="relative w-full h-64 mb-6">
                  <svg viewBox="0 0 400 200" className="w-full h-full">
                    {/* Neural Nodes */}
                    {[0, 1, 2, 3, 4].map((layer, layerIndex) => (
                      <g key={layer}>
                        {[0, 1, 2].map((node, nodeIndex) => {
                          const x = 80 + layerIndex * 80;
                          const y = 50 + nodeIndex * 50;
                          return (
                            <motion.circle
                              key={`${layer}-${node}`}
                              cx={x}
                              cy={y}
                              r="8"
                              fill="url(#neuralGradient)"
                              animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.7, 1, 0.7]
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: (layerIndex + nodeIndex) * 0.3
                              }}
                            />
                          );
                        })}
                      </g>
                    ))}

                    {/* Neural Connections */}
                    {[0, 1, 2, 3].map((layer) =>
                      [0, 1, 2].map((node) =>
                        [0, 1, 2].map((nextNode) => {
                          const x1 = 80 + layer * 80 + 8;
                          const y1 = 50 + node * 50 + 8;
                          const x2 = 80 + (layer + 1) * 80 + 8;
                          const y2 = 50 + nextNode * 50 + 8;

                          return (
                            <motion.line
                              key={`${layer}-${node}-${nextNode}`}
                              x1={x1}
                              y1={y1}
                              x2={x2}
                              y2={y2}
                              stroke="rgba(147, 51, 234, 0.3)"
                              strokeWidth="1"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 2, delay: layer * 0.5 }}
                            />
                          );
                        })
                      )
                    )}

                    <defs>
                      <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-2">Neural Activity</div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-green-400 text-sm">Active</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-400 text-sm">Consciousness Level: 94%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Connectivity Section */}
      <section id="connectivity" className="relative z-10 py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Quantum Connectivity</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience unprecedented connectivity with quantum entanglement,
              neural synchronization, and real-time collaboration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Atom className="w-8 h-8 text-blue-400" />,
                title: 'Quantum Entanglement',
                description: 'Instant synchronization across all connected devices and users'
              },
              {
                icon: <Network className="w-8 h-8 text-green-400" />,
                title: 'Neural Mesh',
                description: 'Intelligent network that learns and adapts to usage patterns'
              },
              {
                icon: <Infinity className="w-8 h-8 text-purple-400" />,
                title: 'Infinite Scalability',
                description: 'Grow without limits with quantum-powered infrastructure'
              },
              {
                icon: <Shield className="w-8 h-8 text-yellow-400" />,
                title: 'Quantum Security',
                description: 'Unbreakable encryption with quantum-resistant protocols'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="mb-4 flex justify-center">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Developer Platform Section */}
      <section id="developer" className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                Developer Platform
                <span className="block text-2xl text-green-400 mt-2">Build the Future</span>
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Access the most advanced SDK with neural APIs, quantum algorithms,
                and blockchain integration for building next-generation applications.
              </p>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Code className="w-6 h-6 text-green-400" />
                  <span className="text-gray-300">Neural Network APIs</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Cpu className="w-6 h-6 text-blue-400" />
                  <span className="text-gray-300">Quantum Algorithm Library</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Database className="w-6 h-6 text-purple-400" />
                  <span className="text-gray-300">Blockchain Integration</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Terminal className="w-6 h-6 text-yellow-400" />
                  <span className="text-gray-300">Advanced Testing Suite</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-gray-900/50 rounded-2xl p-8 border border-gray-700"
            >
              <div className="bg-gray-800 rounded-lg p-4 font-mono text-sm text-green-400 mb-4">
                <div className="text-gray-500 mb-2">// Initialize Quantum SDK</div>
                <div className="text-white">import {`{ QuantumSDK }`} from '@cortexbuild/sdk';</div>
                <div className="text-white">&nbsp;</div>
                <div className="text-white">const sdk = new QuantumSDK({`{`}</div>
                <div className="text-gray-400">&nbsp;&nbsp;apiKey: 'your-api-key',</div>
                <div className="text-gray-400">&nbsp;&nbsp;features: ['neural', 'quantum', 'blockchain']</div>
                <div className="text-white">{`}`});</div>
                <div className="text-white">&nbsp;</div>
                <div className="text-white">await sdk.initialize();</div>
              </div>

              <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors">
                View Documentation
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Get Started Section */}
      <section id="get-started" className="relative z-10 py-20 bg-black/20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Construction Projects?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join the construction technology revolution with quantum computing and AI-powered insights.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/get-started'}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveDemo('features')}
              className="border-2 border-white/20 hover:border-white/40 text-white px-8 py-4 rounded-xl text-lg font-medium transition-all duration-200"
            >
              Watch Demo
            </motion.button>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Brain className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Neural Intelligence</h3>
              <p className="text-gray-400">AI-powered insights and automation for smarter construction</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Zap className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Quantum Computing</h3>
              <p className="text-gray-400">Next-generation optimization and complex problem solving</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Shield className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Enterprise Security</h3>
              <p className="text-gray-400">Quantum-resistant encryption and advanced compliance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-300">
              Join thousands of construction professionals who trust CortexBuild
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-black/20 backdrop-blur-sm rounded-xl p-8 border border-white/10"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-gray-400 text-sm">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-black/40 backdrop-blur-sm border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">CortexBuild</span>
              </div>
              <p className="text-gray-400">
                The most advanced construction intelligence platform with quantum computing and neural networks.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#neural-network" className="hover:text-white transition-colors">Neural Network</a></li>
                <li><a href="#connectivity" className="hover:text-white transition-colors">Connectivity</a></li>
                <li><a href="#developer" className="hover:text-white transition-colors">Developers</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CortexBuild. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      {activeDemo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-xl border border-white/10 p-8 max-w-4xl w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Platform Demo</h2>
              <button
                onClick={() => setActiveDemo(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="aspect-video bg-gray-800 rounded-lg mb-6 flex items-center justify-center">
              <div className="text-center">
                <Play className="w-16 h-16 text-white mx-auto mb-4" />
                <p className="text-gray-400">Interactive demo would play here</p>
                <p className="text-sm text-gray-500 mt-2">Experience quantum computing, neural networks, and AI agents</p>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setActiveDemo(null)}
                className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setActiveDemo(null);
                  window.location.href = '/get-started';
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Try It Now
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}