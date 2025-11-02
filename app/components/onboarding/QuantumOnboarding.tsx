/**
 * Quantum Onboarding System
 * Advanced user onboarding with neural personalization and quantum guidance
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Building2,
  Target,
  Brain,
  Zap,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  SkipForward,
  RotateCcw,
  Star,
  Award,
  Lightbulb,
  Users,
  Settings,
  Bell,
  Shield,
  Eye,
  EyeOff,
  Camera,
  Upload,
  Download,
  Save,
  RefreshCw,
  HelpCircle,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Layers,
  Grid,
  List,
  Filter,
  Search,
  Plus,
  Minus,
  Maximize2,
  Minimize2,
  X,
  ChevronRight,
  ChevronLeft,
  Home,
  Briefcase,
  GraduationCap,
  Heart,
  Coffee,
  Music,
  Gamepad2,
  Palette,
  Code,
  Database,
  Globe,
  Lock,
  Unlock,
  Key,
  Fingerprint,
  QrCode,
  Scan,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Battery,
  Signal,
  Bluetooth,
  Nfc
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
  estimatedTime: number; // minutes
  required: boolean;
  skippable: boolean;
  neuralGuidance?: string;
  quantumTips?: string[];
}

interface UserProfile {
  personal: PersonalInfo;
  professional: ProfessionalInfo;
  preferences: UserPreferences;
  neuralProfile: NeuralProfile;
  quantumIdentity: QuantumIdentity;
  completedSteps: string[];
  progress: number;
}

interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  location?: {
    country: string;
    city: string;
    timezone: string;
  };
  dateOfBirth?: Date;
  interests: string[];
}

interface ProfessionalInfo {
  jobTitle: string;
  company: string;
  industry: string;
  experience: 'entry' | 'mid' | 'senior' | 'executive' | 'consultant';
  skills: string[];
  certifications: string[];
  education: Education[];
}

interface Education {
  degree: string;
  institution: string;
  year: number;
  field: string;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  accessibility: AccessibilitySettings;
  dashboard: DashboardSettings;
}

interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  frequency: 'real_time' | 'hourly' | 'daily' | 'weekly';
  quietHours: { start: string; end: string };
  categories: Record<string, boolean>;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'company' | 'private';
  dataSharing: boolean;
  analytics: boolean;
  marketing: boolean;
}

interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
}

interface DashboardSettings {
  layout: 'grid' | 'list' | 'kanban';
  widgets: string[];
  defaultView: string;
  autoRefresh: boolean;
}

interface NeuralProfile {
  thinkingStyle: 'analytical' | 'creative' | 'strategic' | 'tactical';
  learningGoals: string[];
  expertise: string[];
  collaboration: number;
  innovation: number;
  detailOrientation: number;
}

interface QuantumIdentity {
  signature: string;
  entanglement: string[];
  coherence: number;
  quantumField: string;
  neuralFingerprint: string;
}

export default function QuantumOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [userProfile, setUserProfile] = useState<Partial<UserProfile>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [neuralGuidance, setNeuralGuidance] = useState('');
  const [quantumTips, setQuantumTips] = useState<string[]>([]);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to CortexBuild',
      description: 'The most advanced construction intelligence platform',
      component: <WelcomeStep onNext={handleNext} onDataChange={handleDataChange} />,
      estimatedTime: 2,
      required: true,
      skippable: false,
      neuralGuidance: 'I can see you\'re excited to get started! Let me guide you through the setup.',
      quantumTips: [
        'Quantum systems are initializing...',
        'Neural networks are calibrating to your preferences...',
        'Your unique quantum signature is being generated...'
      ]
    },
    {
      id: 'personal-info',
      title: 'Personal Information',
      description: 'Tell us about yourself to personalize your experience',
      component: <PersonalInfoStep onNext={handleNext} onPrev={handlePrev} onDataChange={handleDataChange} />,
      estimatedTime: 5,
      required: true,
      skippable: false,
      neuralGuidance: 'Based on your name and background, I recommend focusing on project management features.',
      quantumTips: [
        'Your neural profile is being analyzed...',
        'Quantum entanglement with your preferences...',
        'Personalization matrix optimizing...'
      ]
    },
    {
      id: 'professional-info',
      title: 'Professional Background',
      description: 'Help us understand your role and expertise',
      component: <ProfessionalInfoStep onNext={handleNext} onPrev={handlePrev} onDataChange={handleDataChange} />,
      estimatedTime: 8,
      required: true,
      skippable: false,
      neuralGuidance: 'Your experience level suggests you\'ll benefit from our advanced AI features.',
      quantumTips: [
        'Professional neural pathways activating...',
        'Industry expertise mapping...',
        'Skill-based recommendations loading...'
      ]
    },
    {
      id: 'preferences',
      title: 'Preferences & Settings',
      description: 'Customize your platform experience',
      component: <PreferencesStep onNext={handleNext} onPrev={handlePrev} onDataChange={handleDataChange} />,
      estimatedTime: 6,
      required: false,
      skippable: true,
      neuralGuidance: 'I\'ve optimized these settings based on similar users in your industry.',
      quantumTips: [
        'Preference quantum field stabilizing...',
        'Neural personalization complete...',
        'Interface adapting to your style...'
      ]
    },
    {
      id: 'neural-profile',
      title: 'Neural Profile Setup',
      description: 'Configure your AI assistant and learning preferences',
      component: <NeuralProfileStep onNext={handleNext} onPrev={handlePrev} onDataChange={handleDataChange} />,
      estimatedTime: 4,
      required: false,
      skippable: true,
      neuralGuidance: 'Your thinking style indicates you prefer detailed, analytical insights.',
      quantumTips: [
        'Neural consciousness initializing...',
        'Cognitive patterns synchronizing...',
        'AI assistant personality forming...'
      ]
    },
    {
      id: 'quantum-identity',
      title: 'Quantum Identity',
      description: 'Generate your unique quantum signature',
      component: <QuantumIdentityStep onNext={handleNext} onPrev={handlePrev} onDataChange={handleDataChange} />,
      estimatedTime: 3,
      required: false,
      skippable: true,
      neuralGuidance: 'Your quantum signature will provide enhanced security and personalization.',
      quantumTips: [
        'Quantum signature generating...',
        'Entanglement with platform systems...',
        'Quantum coherence optimizing...'
      ]
    },
    {
      id: 'dashboard-setup',
      title: 'Dashboard Configuration',
      description: 'Set up your personalized dashboard',
      component: <DashboardSetupStep onNext={handleNext} onPrev={handlePrev} onDataChange={handleDataChange} />,
      estimatedTime: 5,
      required: false,
      skippable: true,
      neuralGuidance: 'I\'ve curated the most relevant widgets for your role and preferences.',
      quantumTips: [
        'Dashboard quantum field aligning...',
        'Neural widgets optimizing...',
        'Real-time data streams connecting...'
      ]
    },
    {
      id: 'completion',
      title: 'Setup Complete!',
      description: 'Your quantum-powered workspace is ready',
      component: <CompletionStep onComplete={handleComplete} profile={userProfile} />,
      estimatedTime: 2,
      required: true,
      skippable: false,
      neuralGuidance: 'Congratulations! Your platform is now personalized and ready for quantum-enhanced productivity.',
      quantumTips: [
        'All systems synchronized...',
        'Neural pathways established...',
        'Quantum field stabilized...'
      ]
    }
  ];

  useEffect(() => {
    // Initialize onboarding with neural guidance
    initializeOnboarding();
  }, []);

  const initializeOnboarding = async () => {
    console.log('🚀 Initializing Quantum Onboarding...');

    // Load existing profile if available
    await loadExistingProfile();

    // Start neural guidance
    await startNeuralGuidance();

    // Initialize quantum tips
    setQuantumTips(steps[currentStep].quantumTips || []);
  };

  const loadExistingProfile = async () => {
    // In real implementation, load from localStorage or API
    const existingProfile = localStorage.getItem('userProfile');
    if (existingProfile) {
      setUserProfile(JSON.parse(existingProfile));
    }
  };

  const startNeuralGuidance = async () => {
    // Simulate neural guidance updates
    const guidanceInterval = setInterval(() => {
      if (steps[currentStep]?.neuralGuidance) {
        setNeuralGuidance(steps[currentStep].neuralGuidance!);
      }
    }, 3000);

    return () => clearInterval(guidanceInterval);
  };

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setIsLoading(true);

      // Save current step data
      await saveStepData();

      setCurrentStep(currentStep + 1);
      setNeuralGuidance('');
      setQuantumTips(steps[currentStep + 1].quantumTips || []);

      setIsLoading(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setNeuralGuidance('');
      setQuantumTips(steps[currentStep - 1].quantumTips || []);
    }
  };

  const handleSkip = () => {
    if (steps[currentStep].skippable) {
      handleNext();
    }
  };

  const handleDataChange = (data: any) => {
    setUserProfile(prev => ({ ...prev, ...data }));
  };

  const saveStepData = async () => {
    // Save to localStorage for demo
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
  };

  const handleComplete = async () => {
    console.log('✅ Onboarding completed with profile:', userProfile);

    // Save final profile
    await saveStepData();

    // Redirect to main dashboard
    window.location.href = '/dashboard';
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      {/* Progress Sidebar */}
      <div className="w-80 bg-black/20 backdrop-blur-sm border-r border-white/10 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Platform Setup</h1>
          <p className="text-gray-400">Personalize your quantum workspace</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">Progress</span>
            <span className="text-sm text-white">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                index === currentStep
                  ? 'bg-blue-600/20 border border-blue-500/30'
                  : index < currentStep
                  ? 'bg-green-600/20 border border-green-500/30'
                  : 'bg-gray-800/30 border border-gray-700/30'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                index < currentStep
                  ? 'bg-green-500 text-white'
                  : index === currentStep
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-600 text-gray-400'
              }`}>
                {index < currentStep ? <CheckCircle className="w-4 h-4" /> : index + 1}
              </div>
              <div className="flex-1">
                <h3 className={`text-sm font-medium ${
                  index <= currentStep ? 'text-white' : 'text-gray-400'
                }`}>
                  {step.title}
                </h3>
                <p className="text-xs text-gray-500">
                  {step.estimatedTime} min {step.required ? '• Required' : '• Optional'}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Neural Guidance Panel */}
        <div className="mt-8 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
          <div className="flex items-center space-x-2 mb-2">
            <Brain className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-300">Neural Guidance</span>
          </div>
          <p className="text-sm text-gray-300">{neuralGuidance || 'Analyzing your preferences...'}</p>
        </div>

        {/* Quantum Tips */}
        <div className="mt-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-300">Quantum Status</span>
          </div>
          <div className="space-y-1">
            {quantumTips.map((tip, index) => (
              <motion.p
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.5 }}
                className="text-xs text-gray-300"
              >
                {tip}
              </motion.p>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-8"
            >
              {steps[currentStep].component}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
                currentStep === 0
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center space-x-4">
              {steps[currentStep].skippable && (
                <button
                  onClick={handleSkip}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Skip
                </button>
              )}

              {isLoading ? (
                <div className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  <span>{currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Welcome Step Component
const WelcomeStep: React.FC<any> = ({ onNext, onDataChange }) => (
  <div className="text-center">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="mb-8"
    >
      <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center">
        <Zap className="w-12 h-12 text-white" />
      </div>
      <h1 className="text-4xl font-bold text-white mb-4">Welcome to CortexBuild</h1>
      <p className="text-xl text-gray-300 mb-8">
        The most advanced construction intelligence platform with quantum computing and neural networks
      </p>
    </motion.div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {[
        {
          icon: <Brain className="w-8 h-8 text-purple-400" />,
          title: 'Neural Intelligence',
          description: 'AI-powered insights and automation'
        },
        {
          icon: <Zap className="w-8 h-8 text-blue-400" />,
          title: 'Quantum Computing',
          description: 'Next-generation optimization and simulation'
        },
        {
          icon: <Shield className="w-8 h-8 text-green-400" />,
          title: 'Enterprise Security',
          description: 'Quantum-resistant encryption and compliance'
        }
      ].map((feature, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 + index * 0.1 }}
          className="p-6 bg-gray-800/50 rounded-xl border border-gray-700"
        >
          <div className="flex flex-col items-center text-center">
            {feature.icon}
            <h3 className="text-lg font-semibold text-white mt-4 mb-2">{feature.title}</h3>
            <p className="text-gray-400 text-sm">{feature.description}</p>
          </div>
        </motion.div>
      ))}
    </div>

    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      onClick={onNext}
      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-medium transition-colors"
    >
      Get Started
      <ArrowRight className="w-5 h-5 inline ml-2" />
    </motion.button>
  </div>
);

// Personal Information Step
const PersonalInfoStep: React.FC<any> = ({ onNext, onPrev, onDataChange }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    timezone: 'UTC'
  });

  const handleSubmit = () => {
    onDataChange({ personal: formData });
    onNext();
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">Personal Information</h2>
        <p className="text-gray-400">Help us personalize your experience</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-blue-500 focus:outline-none"
            placeholder="Enter your first name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-blue-500 focus:outline-none"
            placeholder="Enter your last name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-blue-500 focus:outline-none"
            placeholder="your.email@company.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Phone (Optional)</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-blue-500 focus:outline-none"
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Country</label>
          <select
            value={formData.country}
            onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
            className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="">Select country</option>
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="UK">United Kingdom</option>
            <option value="DE">Germany</option>
            <option value="FR">France</option>
            <option value="AU">Australia</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">City</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
            className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-blue-500 focus:outline-none"
            placeholder="Enter your city"
          />
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
        >
          Continue
          <ArrowRight className="w-4 h-4 inline ml-2" />
        </button>
      </div>
    </div>
  );
};

// Professional Information Step
const ProfessionalInfoStep: React.FC<any> = ({ onNext, onPrev, onDataChange }) => {
  const [formData, setFormData] = useState({
    jobTitle: '',
    company: '',
    industry: '',
    experience: 'mid' as const,
    skills: [] as string[],
    certifications: [] as string[]
  });

  const industries = [
    'Construction', 'Architecture', 'Engineering', 'Real Estate', 'Manufacturing',
    'Technology', 'Consulting', 'Government', 'Healthcare', 'Education'
  ];

  const commonSkills = [
    'Project Management', 'Team Leadership', 'Budget Management', 'Risk Assessment',
    'Quality Control', 'Safety Management', 'Cost Estimation', 'Contract Negotiation',
    'AutoCAD', 'BIM', 'Microsoft Project', 'Primavera', 'SAP', 'CRM Systems'
  ];

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">Professional Background</h2>
        <p className="text-gray-400">Tell us about your role and expertise</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Job Title</label>
            <input
              type="text"
              value={formData.jobTitle}
              onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder="e.g. Project Manager"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Company</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder="Your company name"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Industry</label>
            <select
              value={formData.industry}
              onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select industry</option>
              {industries.map((industry) => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Experience Level</label>
            <select
              value={formData.experience}
              onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value as any }))}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="entry">Entry Level (0-2 years)</option>
              <option value="mid">Mid Level (3-7 years)</option>
              <option value="senior">Senior Level (8-15 years)</option>
              <option value="executive">Executive Level (15+ years)</option>
              <option value="consultant">Consultant</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Skills & Expertise</label>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {commonSkills.map((skill) => (
                <button
                  key={skill}
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      skills: prev.skills.includes(skill)
                        ? prev.skills.filter(s => s !== skill)
                        : [...prev.skills, skill]
                    }));
                  }}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    formData.skills.includes(skill)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onPrev}
          className="flex items-center space-x-2 bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <button
          onClick={() => {
            onDataChange({ professional: formData });
            onNext();
          }}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Preferences Step
const PreferencesStep: React.FC<any> = ({ onNext, onPrev, onDataChange }) => {
  const [preferences, setPreferences] = useState({
    theme: 'dark' as const,
    language: 'en',
    notifications: {
      email: true,
      push: true,
      sms: false,
      frequency: 'real_time' as const
    },
    privacy: {
      profileVisibility: 'company' as const,
      dataSharing: false,
      analytics: true,
      marketing: false
    }
  });

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">Preferences & Settings</h2>
        <p className="text-gray-400">Customize your platform experience</p>
      </div>

      <div className="space-y-8">
        {/* Theme Selection */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Theme Preference</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { id: 'light', name: 'Light', preview: 'bg-white border-gray-200' },
              { id: 'dark', name: 'Dark', preview: 'bg-gray-900 border-gray-700' },
              { id: 'auto', name: 'Auto', preview: 'bg-gradient-to-r from-white to-gray-900 border-gray-400' }
            ].map((theme) => (
              <button
                key={theme.id}
                onClick={() => setPreferences(prev => ({ ...prev, theme: theme.id as any }))}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  preferences.theme === theme.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className={`w-full h-16 rounded ${theme.preview} mb-2`} />
                <span className="text-white font-medium">{theme.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Notification Settings */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Notification Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="text-white font-medium">Email Notifications</div>
                  <div className="text-gray-400 text-sm">Project updates and important alerts</div>
                </div>
              </div>
              <button
                onClick={() => setPreferences(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, email: !prev.notifications.email }
                }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.notifications.email ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.notifications.email ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-green-400" />
                <div>
                  <div className="text-white font-medium">Push Notifications</div>
                  <div className="text-gray-400 text-sm">Real-time alerts on your device</div>
                </div>
              </div>
              <button
                onClick={() => setPreferences(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, push: !prev.notifications.push }
                }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.notifications.push ? 'bg-green-600' : 'bg-gray-600'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.notifications.push ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Privacy Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Profile Visibility</label>
              <select
                value={preferences.privacy.profileVisibility}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  privacy: { ...prev.privacy, profileVisibility: e.target.value as any }
                }))}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-blue-500 focus:outline-none"
              >
                <option value="public">Public - Visible to all users</option>
                <option value="company">Company - Visible to company members only</option>
                <option value="private">Private - Visible only to you</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onPrev}
          className="flex items-center space-x-2 bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <button
          onClick={() => {
            onDataChange({ preferences });
            onNext();
          }}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Neural Profile Step
const NeuralProfileStep: React.FC<any> = ({ onNext, onPrev, onDataChange }) => {
  const [neuralProfile, setNeuralProfile] = useState({
    thinkingStyle: 'analytical' as const,
    learningGoals: [] as string[],
    expertise: [] as string[],
    collaboration: 0.7,
    innovation: 0.6,
    detailOrientation: 0.8
  });

  const thinkingStyles = [
    { id: 'analytical', name: 'Analytical', description: 'Data-driven, logical, detail-oriented' },
    { id: 'creative', name: 'Creative', description: 'Innovative, intuitive, big-picture thinking' },
    { id: 'strategic', name: 'Strategic', description: 'Long-term planning, vision-focused' },
    { id: 'tactical', name: 'Tactical', description: 'Practical, action-oriented, results-focused' }
  ];

  const learningGoals = [
    'Project Management', 'Technical Skills', 'Leadership', 'Industry Knowledge',
    'Software Tools', 'Safety Standards', 'Cost Management', 'Quality Control'
  ];

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">Neural Profile Setup</h2>
        <p className="text-gray-400">Configure your AI assistant and learning preferences</p>
      </div>

      <div className="space-y-8">
        {/* Thinking Style */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Thinking Style</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {thinkingStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => setNeuralProfile(prev => ({ ...prev, thinkingStyle: style.id as any }))}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  neuralProfile.thinkingStyle === style.id
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <h4 className="text-white font-medium">{style.name}</h4>
                <p className="text-gray-400 text-sm">{style.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Learning Goals */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Learning Goals</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {learningGoals.map((goal) => (
              <button
                key={goal}
                onClick={() => {
                  setNeuralProfile(prev => ({
                    ...prev,
                    learningGoals: prev.learningGoals.includes(goal)
                      ? prev.learningGoals.filter(g => g !== goal)
                      : [...prev.learningGoals, goal]
                  }));
                }}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  neuralProfile.learningGoals.includes(goal)
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {goal}
              </button>
            ))}
          </div>
        </div>

        {/* Neural Characteristics */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Neural Characteristics</h3>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-gray-300">Collaboration</label>
                <span className="text-white text-sm">{(neuralProfile.collaboration * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={neuralProfile.collaboration}
                onChange={(e) => setNeuralProfile(prev => ({
                  ...prev,
                  collaboration: parseFloat(e.target.value)
                }))}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-gray-300">Innovation</label>
                <span className="text-white text-sm">{(neuralProfile.innovation * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={neuralProfile.innovation}
                onChange={(e) => setNeuralProfile(prev => ({
                  ...prev,
                  innovation: parseFloat(e.target.value)
                }))}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-gray-300">Detail Orientation</label>
                <span className="text-white text-sm">{(neuralProfile.detailOrientation * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={neuralProfile.detailOrientation}
                onChange={(e) => setNeuralProfile(prev => ({
                  ...prev,
                  detailOrientation: parseFloat(e.target.value)
                }))}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onPrev}
          className="flex items-center space-x-2 bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <button
          onClick={() => {
            onDataChange({ neuralProfile });
            onNext();
          }}
          className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Quantum Identity Step
const QuantumIdentityStep: React.FC<any> = ({ onNext, onPrev, onDataChange }) => {
  const [quantumIdentity, setQuantumIdentity] = useState({
    signature: '',
    entanglement: [] as string[],
    coherence: 0.8,
    quantumField: 'personal',
    neuralFingerprint: ''
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const generateQuantumIdentity = async () => {
    setIsGenerating(true);

    // Simulate quantum identity generation
    await new Promise(resolve => setTimeout(resolve, 3000));

    setQuantumIdentity({
      signature: `quantum_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`,
      entanglement: ['neural-network', 'project-data', 'user-preferences'],
      coherence: 0.95,
      quantumField: 'personal',
      neuralFingerprint: `neural_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`
    });

    setIsGenerating(false);
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">Quantum Identity</h2>
        <p className="text-gray-400">Generate your unique quantum signature for enhanced security</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Zap className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Quantum Signature Generation</h3>
            <p className="text-gray-400">
              Your quantum identity provides unbreakable security and personalized experiences
            </p>
          </div>

          {!quantumIdentity.signature ? (
            <div className="text-center">
              <button
                onClick={generateQuantumIdentity}
                disabled={isGenerating}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-8 py-4 rounded-xl font-medium transition-colors"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 inline mr-2 animate-spin" />
                    Generating Quantum Signature...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 inline mr-2" />
                    Generate Quantum Identity
                  </>
                )}
              </button>

              {isGenerating && (
                <div className="mt-6 space-y-2">
                  <div className="flex items-center justify-center space-x-2 text-blue-400">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                    <span className="text-sm">Initializing quantum field...</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-purple-400">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                    <span className="text-sm">Establishing neural pathways...</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-green-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                    <span className="text-sm">Synchronizing quantum coherence...</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Quantum Signature</label>
                  <div className="bg-gray-900 rounded-lg p-3 font-mono text-sm text-green-400">
                    {quantumIdentity.signature}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Neural Fingerprint</label>
                  <div className="bg-gray-900 rounded-lg p-3 font-mono text-sm text-purple-400">
                    {quantumIdentity.neuralFingerprint}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Quantum Entanglement</label>
                <div className="flex flex-wrap gap-2">
                  {quantumIdentity.entanglement.map((item, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-300">Quantum Coherence</label>
                  <span className="text-white text-sm">{(quantumIdentity.coherence * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                    style={{ width: `${quantumIdentity.coherence * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onPrev}
          className="flex items-center space-x-2 bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <button
          onClick={() => {
            onDataChange({ quantumIdentity });
            onNext();
          }}
          disabled={!quantumIdentity.signature}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors disabled:cursor-not-allowed"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Dashboard Setup Step
const DashboardSetupStep: React.FC<any> = ({ onNext, onPrev, onDataChange }) => {
  const [dashboardSettings, setDashboardSettings] = useState({
    layout: 'grid' as const,
    widgets: ['project-overview', 'team-performance', 'neural-insights', 'quantum-metrics'],
    defaultView: 'overview',
    autoRefresh: true
  });

  const availableWidgets = [
    { id: 'project-overview', name: 'Project Overview', icon: <Target className="w-4 h-4" /> },
    { id: 'team-performance', name: 'Team Performance', icon: <Users className="w-4 h-4" /> },
    { id: 'neural-insights', name: 'Neural Insights', icon: <Brain className="w-4 h-4" /> },
    { id: 'quantum-metrics', name: 'Quantum Metrics', icon: <Zap className="w-4 h-4" /> },
    { id: 'risk-dashboard', name: 'Risk Dashboard', icon: <Shield className="w-4 h-4" /> },
    { id: 'budget-tracker', name: 'Budget Tracker', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'timeline-view', name: 'Timeline View', icon: <Calendar className="w-4 h-4" /> },
    { id: 'document-hub', name: 'Document Hub', icon: <FileText className="w-4 h-4" /> }
  ];

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">Dashboard Configuration</h2>
        <p className="text-gray-400">Set up your personalized dashboard layout</p>
      </div>

      <div className="space-y-8">
        {/* Layout Selection */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Dashboard Layout</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { id: 'grid', name: 'Grid Layout', description: 'Organized grid of widgets' },
              { id: 'list', name: 'List Layout', description: 'Vertical list of information' },
              { id: 'kanban', name: 'Kanban Board', description: 'Card-based project management' }
            ].map((layout) => (
              <button
                key={layout.id}
                onClick={() => setDashboardSettings(prev => ({ ...prev, layout: layout.id as any }))}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  dashboardSettings.layout === layout.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <h4 className="text-white font-medium">{layout.name}</h4>
                <p className="text-gray-400 text-sm">{layout.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Widget Selection */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Dashboard Widgets</h3>
          <p className="text-gray-400 text-sm mb-4">Select the widgets you want on your dashboard</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {availableWidgets.map((widget) => (
              <button
                key={widget.id}
                onClick={() => {
                  setDashboardSettings(prev => ({
                    ...prev,
                    widgets: prev.widgets.includes(widget.id)
                      ? prev.widgets.filter(w => w !== widget.id)
                      : [...prev.widgets, widget.id]
                  }));
                }}
                className={`p-3 rounded-lg border transition-colors ${
                  dashboardSettings.widgets.includes(widget.id)
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div className="text-gray-400">{widget.icon}</div>
                  <span className="text-white text-sm font-medium">{widget.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Dashboard Preview</h3>
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <div className={`grid gap-4 ${
              dashboardSettings.layout === 'grid' ? 'grid-cols-2 md:grid-cols-3' :
              dashboardSettings.layout === 'list' ? 'grid-cols-1' :
              'grid-cols-1 md:grid-cols-2'
            }`}>
              {dashboardSettings.widgets.slice(0, 6).map((widgetId) => {
                const widget = availableWidgets.find(w => w.id === widgetId);
                return (
                  <div key={widgetId} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                    <div className="flex items-center space-x-2 mb-2">
                      {widget?.icon}
                      <span className="text-white text-sm font-medium">{widget?.name}</span>
                    </div>
                    <div className="text-xs text-gray-400">Widget preview</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onPrev}
          className="flex items-center space-x-2 bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <button
          onClick={() => {
            onDataChange({ dashboard: dashboardSettings });
            onNext();
          }}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Completion Step
const CompletionStep: React.FC<any> = ({ onComplete, profile }) => {
  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Setup Complete!</h1>
        <p className="text-xl text-gray-300 mb-8">
          Your quantum-powered workspace is ready
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
          <Brain className="w-8 h-8 text-purple-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Neural Assistant</h3>
          <p className="text-gray-400 text-sm">
            Your AI assistant is configured with your thinking style: {profile.neuralProfile?.thinkingStyle}
          </p>
        </div>

        <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
          <Zap className="w-8 h-8 text-blue-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Quantum Security</h3>
          <p className="text-gray-400 text-sm">
            Your quantum signature provides unbreakable security for your account
          </p>
        </div>

        <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
          <Target className="w-8 h-8 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Personalized Dashboard</h3>
          <p className="text-gray-400 text-sm">
            {profile.dashboard?.widgets?.length || 0} widgets configured for your role and preferences
          </p>
        </div>
      </div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        onClick={onComplete}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-medium transition-colors"
      >
        Enter Your Workspace
        <ArrowRight className="w-5 h-5 inline ml-2" />
      </motion.button>
    </div>
  );
};