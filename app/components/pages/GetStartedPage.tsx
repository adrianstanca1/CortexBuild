/**
 * Get Started Page
 * Interactive onboarding and quick start guide for the quantum platform
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
  CheckCircle,
  Play,
  Download,
  Code,
  Database,
  Settings,
  Rocket,
  Star,
  Award,
  Lightbulb,
  Sparkles,
  Globe,
  Lock,
  Eye,
  BarChart3,
  Cpu,
  Network,
  Layers,
  Activity,
  ChevronRight,
  ChevronLeft,
  X,
  HelpCircle,
  Info,
  AlertTriangle,
  CheckCircle as CheckCircleIcon,
  ExternalLink,
  MousePointer,
  Hand,
  Volume2,
  VolumeX,
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
  Home,
  Briefcase,
  GraduationCap,
  Heart,
  Coffee,
  Music,
  Gamepad2,
  Palette,
  Terminal,
  GitBranch,
  Bell,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  PieChart,
  LineChart,
  FileText,
  Image,
  Video,
  Archive,
  Braces,
  Hash,
  Type,
  Keyboard,
  Monitor,
  Smartphone,
  Tablet,
  Watch,
  Camera,
  Radio,
  Satellite,
  Bluetooth,
  Wifi,
  Battery,
  Signal,
  Atom,
  Infinity as InfinityIcon,
  Cloud,
  Sun,
  Moon,
  Star as StarIcon,
  Heart as HeartIcon,
  ThumbsUp,
  MessageSquare,
  Share,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  duration: string;
  features: string[];
  action: string;
}

interface QuickStart {
  id: string;
  title: string;
  description: string;
  steps: string[];
  estimatedTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'setup' | 'development' | 'deployment' | 'integration';
}

export default function GetStartedPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [showDemo, setShowDemo] = useState(false);

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'account-setup',
      title: 'Create Your Account',
      description: 'Set up your quantum-powered workspace with advanced security',
      icon: <Shield className="w-6 h-6" />,
      duration: '2 minutes',
      features: ['Neural authentication', 'Quantum security', 'Multi-factor protection'],
      action: 'Create Account'
    },
    {
      id: 'neural-profile',
      title: 'Neural Profile Setup',
      description: 'Configure your AI assistant and personalize your experience',
      icon: <Brain className="w-6 h-6" />,
      duration: '5 minutes',
      features: ['Thinking style analysis', 'Expertise mapping', 'Learning preferences'],
      action: 'Setup Profile'
    },
    {
      id: 'project-creation',
      title: 'Create Your First Project',
      description: 'Launch your construction project with AI-powered insights',
      icon: <Building2 className="w-6 h-6" />,
      duration: '3 minutes',
      features: ['AI project setup', 'Neural risk assessment', 'Team collaboration'],
      action: 'Create Project'
    },
    {
      id: 'ai-agent-deployment',
      title: 'Deploy AI Agents',
      description: 'Add intelligent agents to automate your project management',
      icon: <Zap className="w-6 h-6" />,
      duration: '4 minutes',
      features: ['Safety monitoring', 'Cost optimization', 'Schedule prediction'],
      action: 'Deploy Agents'
    }
  ];

  const quickStarts: QuickStart[] = [
    {
      id: 'basic-setup',
      title: 'Basic Platform Setup',
      description: 'Get started with essential features and basic configuration',
      steps: [
        'Create your account with neural authentication',
        'Set up your company profile',
        'Configure basic project settings',
        'Invite team members',
        'Start your first project'
      ],
      estimatedTime: '15 minutes',
      difficulty: 'beginner',
      category: 'setup'
    },
    {
      id: 'advanced-development',
      title: 'Advanced Development',
      description: 'Build custom AI agents and neural networks',
      steps: [
        'Install Quantum SDK',
        'Set up development environment',
        'Create custom neural models',
        'Deploy quantum algorithms',
        'Integrate with existing systems'
      ],
      estimatedTime: '2 hours',
      difficulty: 'advanced',
      category: 'development'
    },
    {
      id: 'enterprise-deployment',
      title: 'Enterprise Deployment',
      description: 'Deploy platform for large-scale enterprise use',
      steps: [
        'Configure multi-tenant architecture',
        'Set up enterprise security',
        'Integrate with existing systems',
        'Train custom AI models',
        'Deploy to production'
      ],
      estimatedTime: '1 day',
      difficulty: 'advanced',
      category: 'deployment'
    }
  ];

  const handleStepComplete = (stepId: string) => {
    setCompletedSteps(prev => [...prev, stepId]);
  };

  const learningPaths = [
    {
      id: 'project-manager',
      title: 'Project Manager',
      description: 'Master project management with AI assistance',
      icon: <Target className="w-5 h-5" />,
      courses: 8,
      duration: '4 weeks',
      level: 'intermediate'
    },
    {
      id: 'safety-officer',
      title: 'Safety Officer',
      description: 'Advanced safety monitoring and compliance',
      icon: <Shield className="w-5 h-5" />,
      courses: 6,
      duration: '3 weeks',
      level: 'intermediate'
    },
    {
      id: 'cost-controller',
      title: 'Cost Controller',
      description: 'Financial management and cost optimization',
      icon: <DollarSign className="w-5 h-5" />,
      courses: 5,
      duration: '2 weeks',
      level: 'beginner'
    },
    {
      id: 'developer',
      title: 'AI Developer',
      description: 'Build custom neural networks and quantum algorithms',
      icon: <Code className="w-5 h-5" />,
      courses: 12,
      duration: '8 weeks',
      level: 'advanced'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Get Started</span>
            </div>

            <div className="flex items-center space-x-4">
              <button 
                className="text-gray-400 hover:text-white transition-colors"
                title="Learn more or get help"
                aria-label="Help"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
              <button
                onClick={() => window.location.href = '/login'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Start Your
              <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent"> Quantum Journey</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Experience the most advanced construction intelligence platform with neural networks,
              quantum computing, and AI-powered automation.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedPath('guided')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>Guided Setup</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedPath('quick')}
                className="border-2 border-white/20 hover:border-white/40 text-white px-8 py-4 rounded-xl text-lg font-medium transition-all duration-200"
              >
                Quick Start
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Onboarding Steps */}
      {selectedPath === 'guided' && (
        <section className="py-20 bg-black/20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Guided Setup</h2>
              <p className="text-xl text-gray-300">
                Follow our step-by-step guide to get the most out of the platform
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {onboardingSteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative p-6 rounded-xl border transition-all duration-200 ${completedSteps.includes(step.id)
                    ? 'bg-green-500/10 border-green-500/20'
                    : 'bg-black/20 border-white/10 hover:border-white/20'
                    }`}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`p-3 rounded-lg ${completedSteps.includes(step.id)
                      ? 'bg-green-500/20'
                      : 'bg-blue-500/20'
                      }`}>
                      <div className={
                        completedSteps.includes(step.id)
                          ? 'text-green-400'
                          : 'text-blue-400'
                      }>
                        {step.icon}
                      </div>
                    </div>
                    {completedSteps.includes(step.id) && (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    )}
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-gray-400 mb-4">{step.description}</p>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-400">Duration</span>
                      <span className="text-white">{step.duration}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Features</span>
                      <span className="text-blue-400">{step.features.length} included</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStepComplete(step.id)}
                    disabled={completedSteps.includes(step.id)}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${completedSteps.includes(step.id)
                      ? 'bg-green-600 text-white cursor-default'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                  >
                    {completedSteps.includes(step.id) ? 'Completed' : step.action}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Quick Start Paths */}
      {selectedPath === 'quick' && (
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Quick Start Paths</h2>
              <p className="text-xl text-gray-300">
                Choose the path that best fits your needs and experience level
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {quickStarts.map((quickStart, index) => (
                <motion.div
                  key={quickStart.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-black/20 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:border-white/20 transition-all duration-200"
                >
                  <div className="mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                      {quickStart.category === 'setup' && <Settings className="w-6 h-6 text-white" />}
                      {quickStart.category === 'development' && <Code className="w-6 h-6 text-white" />}
                      {quickStart.category === 'deployment' && <Rocket className="w-6 h-6 text-white" />}
                      {quickStart.category === 'integration' && <Network className="w-6 h-6 text-white" />}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{quickStart.title}</h3>
                    <p className="text-gray-400 mb-4">{quickStart.description}</p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-400">Duration</span>
                      <span className="text-white">{quickStart.estimatedTime}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-400">Difficulty</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${quickStart.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                        quickStart.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                        {quickStart.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Steps</span>
                      <span className="text-white">{quickStart.steps.length} steps</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-white font-medium mb-2">What you'll learn:</h4>
                    <ul className="space-y-1">
                      {quickStart.steps.slice(0, 3).map((step, idx) => (
                        <li key={idx} className="text-gray-400 text-sm flex items-center space-x-2">
                          <CheckCircle className="w-3 h-3 text-green-400" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors">
                    Start This Path
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Learning Paths */}
      <section className="py-20 bg-black/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Learning Paths</h2>
            <p className="text-xl text-gray-300">
              Structured learning programs to master the platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {learningPaths.map((path, index) => (
              <motion.div
                key={path.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-200"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <div className="text-blue-400">
                      {path.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{path.title}</h3>
                    <p className="text-gray-400 text-sm">{path.duration}</p>
                  </div>
                </div>

                <p className="text-gray-400 text-sm mb-4">{path.description}</p>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Courses</span>
                    <span className="text-white">{path.courses}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Level</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${path.level === 'beginner' ? 'bg-green-500/20 text-green-400' :
                      path.level === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                      {path.level}
                    </span>
                  </div>
                </div>

                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                  Start Learning
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">See It In Action</h2>
          <p className="text-xl text-gray-300 mb-8">
            Experience the power of quantum computing and neural networks in construction management
          </p>

          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <div className="aspect-video bg-gray-800 rounded-lg mb-6 flex items-center justify-center">
              <div className="text-center">
                <Play className="w-16 h-16 text-white mx-auto mb-4" />
                <p className="text-gray-400">Interactive platform demo</p>
                <p className="text-sm text-gray-500 mt-2">Experience all quantum and neural features</p>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowDemo(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Watch Demo
              </button>
              <button className="border border-white/20 hover:border-white/40 text-white px-8 py-3 rounded-lg font-medium transition-colors">
                Schedule Live Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Modal */}
      {showDemo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-xl border border-white/10 p-8 max-w-4xl w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Platform Demo</h2>
              <button
                onClick={() => setShowDemo(false)}
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
                onClick={() => setShowDemo(false)}
                className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowDemo(false);
                  window.location.href = '/login';
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