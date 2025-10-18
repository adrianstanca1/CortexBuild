/**
 * Main Application Layout
 * Quantum-powered layout with neural personalization and real-time features
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Building2,
  Users,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  LogOut,
  User as UserIcon,
  Shield,
  Activity,
  Brain,
  Zap,
  BarChart3,
  FileText,
  Calendar,
  MessageSquare,
  HelpCircle,
  ExternalLink,
  Minimize2,
  Maximize2,
  Sun,
  Moon,
  Monitor,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Battery,
  Signal
} from 'lucide-react';

import { Providers } from './providers';
import QuantumSuperAdminDashboard from './components/dashboards/QuantumSuperAdminDashboard';
import QuantumCompanyAdminDashboard from './components/dashboards/QuantumCompanyAdminDashboard';
import QuantumProjectManagerDashboard from './components/dashboards/QuantumProjectManagerDashboard';
import QuantumDeveloperDashboard from './components/dashboards/QuantumDeveloperDashboard';
import QuantumClientDashboard from './components/dashboards/QuantumClientDashboard';
import QuantumOnboarding from './components/onboarding/QuantumOnboarding';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  company?: string;
  neuralProfile: any;
  quantumSignature: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: Date;
  read: boolean;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [theme, setTheme] = useState('dark');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [neuralMode, setNeuralMode] = useState(true);
  const [quantumView, setQuantumView] = useState(true);

  useEffect(() => {
    // Initialize user session
    initializeUser();

    // Load theme preference
    loadThemePreference();

    // Initialize real-time features
    initializeRealTimeFeatures();
  }, []);

  const initializeUser = async () => {
    try {
      // Check for existing session
      const token = localStorage.getItem('authToken');
      if (token) {
        // Verify token and get user data
        const userData = await verifyUserSession(token);
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to initialize user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyUserSession = async (token: string): Promise<User | null> => {
    // In real implementation, verify token with server
    // For demo, return mock user based on token
    if (token === 'dev-token-123') {
      return {
        id: 'user_admin_1',
        name: 'System Administrator',
        email: 'admin@cortexbuild.com',
        role: 'super_admin',
        avatar: 'https://i.pravatar.cc/150?img=1',
        company: 'CortexBuild',
        neuralProfile: {
          thinkingStyle: 'strategic',
          expertise: ['platform_management', 'system_architecture'],
          learningRate: 0.9,
          creativity: 0.8,
          collaboration: 0.9
        },
        quantumSignature: 'quantum_admin_signature'
      };
    }

    if (token === 'company-admin-token') {
      return {
        id: 'user_manager_1',
        name: 'Project Manager',
        email: 'manager@constructco.com',
        role: 'company_admin',
        avatar: 'https://i.pravatar.cc/150?img=2',
        company: 'ConstructCo',
        neuralProfile: {
          thinkingStyle: 'strategic',
          expertise: ['project_management', 'team_leadership'],
          learningRate: 0.8,
          creativity: 0.6,
          collaboration: 0.9
        },
        quantumSignature: 'quantum_manager_signature'
      };
    }

    return null;
  };

  const loadThemePreference = () => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.className = savedTheme;
  };

  const initializeRealTimeFeatures = () => {
    // Initialize WebSocket connection for real-time updates
    initializeWebSocket();

    // Load notifications
    loadNotifications();

    // Start neural guidance
    startNeuralGuidance();
  };

  const initializeWebSocket = () => {
    // WebSocket initialization for real-time features
    console.log('🔗 Initializing WebSocket connection...');
  };

  const loadNotifications = async () => {
    // Load user notifications
    const mockNotifications: Notification[] = [
      {
        id: 'notif-1',
        title: 'Neural Model Training Complete',
        message: 'Your custom neural model has finished training with 94% accuracy',
        type: 'success',
        timestamp: new Date(),
        read: false
      },
      {
        id: 'notif-2',
        title: 'Quantum Algorithm Ready',
        message: 'Project optimization algorithm is ready for deployment',
        type: 'info',
        timestamp: new Date(Date.now() - 300000),
        read: true
      }
    ];

    setNotifications(mockNotifications);
  };

  const startNeuralGuidance = () => {
    // Neural guidance system
    console.log('🧠 Starting neural guidance...');
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('authToken', 'dev-token-123');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.className = newTheme;
  };

  const getNavigationItems = () => {
    if (!user) return [];

    const baseItems = [
      { id: 'dashboard', name: 'Dashboard', icon: <Home className="w-5 h-5" />, href: '/dashboard' },
      { id: 'projects', name: 'Projects', icon: <Building2 className="w-5 h-5" />, href: '/projects' },
      { id: 'team', name: 'Team', icon: <Users className="w-5 h-5" />, href: '/team' },
      { id: 'analytics', name: 'Analytics', icon: <BarChart3 className="w-5 h-5" />, href: '/analytics' }
    ];

    // Add role-specific navigation items
    switch (user.role) {
      case 'super_admin':
        return [
          ...baseItems,
          { id: 'admin', name: 'Platform Admin', icon: <Shield className="w-5 h-5" />, href: '/admin' },
          { id: 'system', name: 'System Status', icon: <Activity className="w-5 h-5" />, href: '/system' }
        ];
      case 'company_admin':
        return [
          ...baseItems,
          { id: 'company', name: 'Company Settings', icon: <Settings className="w-5 h-5" />, href: '/company' },
          { id: 'reports', name: 'Reports', icon: <FileText className="w-5 h-5" />, href: '/reports' }
        ];
      case 'developer':
        return [
          ...baseItems,
          { id: 'neural', name: 'Neural Models', icon: <Brain className="w-5 h-5" />, href: '/neural' },
          { id: 'quantum', name: 'Quantum Tools', icon: <Zap className="w-5 h-5" />, href: '/quantum' },
          { id: 'marketplace', name: 'Marketplace', icon: <ExternalLink className="w-5 h-5" />, href: '/marketplace' }
        ];
      default:
        return baseItems;
    }
  };

  const renderDashboard = () => {
    if (!user) return null;

    switch (user.role) {
      case 'super_admin':
        return <QuantumSuperAdminDashboard />;
      case 'company_admin':
        return <QuantumCompanyAdminDashboard />;
      case 'project_manager':
        return <QuantumProjectManagerDashboard />;
      case 'developer':
        return <QuantumDeveloperDashboard />;
      case 'client':
        return <QuantumClientDashboard />;
      default:
        return <div className="text-white">Dashboard loading...</div>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <Providers>
        <QuantumOnboarding />
      </Providers>
    );
  }

  return (
    <Providers>
      <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 ${theme}`}>
        {/* Header */}
        <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              {/* Logo and Brand */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>

                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">CortexBuild</h1>
                    <p className="text-sm text-gray-400">Quantum Intelligence Platform</p>
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="flex-1 max-w-lg mx-8">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search projects, documents, insights..."
                    className="w-full bg-gray-800 text-white rounded-lg pl-10 pr-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* User Controls */}
              <div className="flex items-center space-x-4">
                {/* Neural/Quantum Mode Toggles */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setNeuralMode(!neuralMode)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${neuralMode
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                  >
                    <Brain className="w-4 h-4 inline mr-1" />
                    Neural
                  </button>
                  <button
                    onClick={() => setQuantumView(!quantumView)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${quantumView
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                  >
                    <Zap className="w-4 h-4 inline mr-1" />
                    Quantum
                  </button>
                </div>

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                {/* Notifications */}
                <div className="relative">
                  <button className="p-2 text-gray-400 hover:text-white transition-colors">
                    <Bell className="w-5 h-5" />
                    {notifications.filter(n => !n.read).length > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {notifications.filter(n => !n.read).length}
                      </span>
                    )}
                  </button>
                </div>

                {/* User Menu */}
                <div className="relative">
                  <button className="flex items-center space-x-2 p-2 text-gray-400 hover:text-white transition-colors">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {/* User Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg border border-gray-700 shadow-lg z-50">
                    <div className="p-3 border-b border-gray-700">
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                      <p className="text-gray-400 text-xs capitalize">{user.role.replace('_', ' ')}</p>
                    </div>
                    <div className="py-2">
                      <button className="w-full text-left px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 flex items-center space-x-2">
                        <UserIcon className="w-4 h-4" />
                        <span>Profile</span>
                      </button>
                      <button className="w-full text-left px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 flex items-center space-x-2">
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </button>
                      <button className="w-full text-left px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 flex items-center space-x-2">
                        <HelpCircle className="w-4 h-4" />
                        <span>Help & Support</span>
                      </button>
                    </div>
                    <div className="border-t border-gray-700 py-2">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-400 hover:text-red-300 hover:bg-gray-700 flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar Navigation */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.aside
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                className="w-64 bg-black/20 backdrop-blur-sm border-r border-white/10"
              >
                <nav className="p-4">
                  <div className="space-y-2">
                    {getNavigationItems().map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setCurrentView(item.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${currentView === item.id
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:text-white hover:bg-gray-800'
                          }`}
                      >
                        {item.icon}
                        <span>{item.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Neural Status */}
                  <div className="mt-8 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <div className="flex items-center space-x-2 mb-2">
                      <Brain className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-medium text-purple-300">Neural Status</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Thinking Style</span>
                        <span className="text-white capitalize">{user.neuralProfile.thinkingStyle}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Learning Rate</span>
                        <span className="text-green-400">{(user.neuralProfile.learningRate * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Collaboration</span>
                        <span className="text-blue-400">{(user.neuralProfile.collaboration * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Quantum Status */}
                  <div className="mt-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="flex items-center space-x-2 mb-2">
                      <Zap className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-medium text-blue-300">Quantum Status</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Coherence</span>
                        <span className="text-green-400">94%</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Entanglement</span>
                        <span className="text-blue-400">87%</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Field Strength</span>
                        <span className="text-purple-400">92%</span>
                      </div>
                    </div>
                  </div>
                </nav>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <main className="flex-1">
            {renderDashboard()}
          </main>
        </div>
      </div>
    </Providers>
  );
}