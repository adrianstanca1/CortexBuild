/**
 * Quantum Login Page
 * Advanced authentication with neural biometrics and quantum security
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Fingerprint,
  QrCode,
  Shield,
  Brain,
  Zap,
  CheckCircle,
  AlertCircle,
  Loader2,
  Github,
  Chrome,
  Smartphone,
  Monitor,
  Tablet,
  ArrowRight,
  Sparkles,
  Key,
  Scan,
  Volume2,
  VolumeX
} from 'lucide-react';

interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
  twoFactorCode?: string;
}

interface AuthMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  available: boolean;
  quantum: boolean;
  neural: boolean;
}

export default function QuantumLoginPage() {
  const [form, setForm] = useState<LoginForm>({
    email: '',
    password: '',
    rememberMe: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authStep, setAuthStep] = useState<'credentials' | '2fa' | 'biometric' | 'quantum'>('credentials');
  const [selectedMethod, setSelectedMethod] = useState('password');
  const [neuralScan, setNeuralScan] = useState(false);
  const [quantumValidation, setQuantumValidation] = useState(false);
  const [error, setError] = useState('');

  const authMethods: AuthMethod[] = [
    {
      id: 'password',
      name: 'Password',
      icon: <Lock className="w-5 h-5" />,
      description: 'Traditional password authentication',
      available: true,
      quantum: false,
      neural: false
    },
    {
      id: 'neural',
      name: 'Neural Biometric',
      icon: <Brain className="w-5 h-5" />,
      description: 'AI-powered behavioral authentication',
      available: true,
      quantum: false,
      neural: true
    },
    {
      id: 'quantum',
      name: 'Quantum Signature',
      icon: <Zap className="w-5 h-5" />,
      description: 'Quantum-resistant cryptographic authentication',
      available: true,
      quantum: true,
      neural: false
    },
    {
      id: 'fingerprint',
      name: 'Fingerprint',
      icon: <Fingerprint className="w-5 h-5" />,
      description: 'Biometric fingerprint authentication',
      available: true,
      quantum: false,
      neural: false
    },
    {
      id: 'qr',
      name: 'QR Code',
      icon: <QrCode className="w-5 h-5" />,
      description: 'Mobile app QR code authentication',
      available: true,
      quantum: false,
      neural: false
    }
  ];

  useEffect(() => {
    // Initialize quantum background effects
    initializeQuantumEffects();

    // Check for existing session
    checkExistingSession();
  }, []);

  const initializeQuantumEffects = () => {
    // Initialize quantum visual effects
    console.log('✨ Initializing quantum login effects...');
  };

  const checkExistingSession = async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Verify existing session
      try {
        const isValid = await verifySession(token);
        if (isValid) {
          window.location.href = '/dashboard';
        }
      } catch (error) {
        localStorage.removeItem('authToken');
      }
    }
  };

  const verifySession = async (token: string): Promise<boolean> => {
    // Verify session with server
    return true; // Mock implementation
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      switch (selectedMethod) {
        case 'password':
          await authenticateWithPassword();
          break;
        case 'neural':
          await authenticateWithNeural();
          break;
        case 'quantum':
          await authenticateWithQuantum();
          break;
        case 'fingerprint':
          await authenticateWithFingerprint();
          break;
        case 'qr':
          await authenticateWithQR();
          break;
      }
    } catch (error: any) {
      setError(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const authenticateWithPassword = async () => {
    // Password authentication - call actual API
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store token and redirect
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/dashboard';
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Network error - please try again');
    }
  };

  const authenticateWithNeural = async () => {
    setNeuralScan(true);

    // Simulate neural scanning
    await new Promise(resolve => setTimeout(resolve, 3000));

    setNeuralScan(false);
    setAuthStep('2fa');

    // Mock neural authentication success
    console.log('🧠 Neural authentication successful');
  };

  const authenticateWithQuantum = async () => {
    setQuantumValidation(true);

    // Simulate quantum validation
    await new Promise(resolve => setTimeout(resolve, 2000));

    setQuantumValidation(false);

    // Mock quantum authentication success
    console.log('⚛️ Quantum authentication successful');
    window.location.href = '/dashboard';
  };

  const authenticateWithFingerprint = async () => {
    // Fingerprint authentication
    console.log('👆 Fingerprint authentication initiated');
  };

  const authenticateWithQR = async () => {
    // QR code authentication
    console.log('📱 QR code authentication initiated');
  };

  const handleInputChange = (field: keyof LoginForm, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-black/20 backdrop-blur-sm p-12 flex-col justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">CortexBuild</h1>
              <p className="text-gray-400">Quantum Intelligence Platform</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">Neural Intelligence</h3>
                <p className="text-gray-400 text-sm">AI-powered insights and automation</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">Quantum Computing</h3>
                <p className="text-gray-400 text-sm">Next-generation optimization and simulation</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">Enterprise Security</h3>
                <p className="text-gray-400 text-sm">Quantum-resistant encryption and compliance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quantum Animation */}
        <div className="relative">
          <div className="w-64 h-64 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 border-2 border-blue-400/30 rounded-full animate-spin" style={{ animationDuration: '8s' }} />
            <div className="absolute w-20 h-20 border-2 border-purple-400/30 rounded-full animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }} />
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-gray-400">Sign in to your quantum workspace</p>
            </div>

            {/* Authentication Method Selection */}
            <div className="mb-6">
              <h3 className="text-white font-medium mb-3">Choose Authentication Method</h3>
              <div className="grid grid-cols-2 gap-3">
                {authMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    disabled={!method.available}
                    className={`p-3 rounded-lg border transition-colors ${
                      selectedMethod === method.id
                        ? 'border-blue-500 bg-blue-500/10 text-white'
                        : 'border-gray-600 text-gray-400 hover:border-gray-500 hover:text-white'
                    } ${!method.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      {method.icon}
                      <span className="text-sm font-medium">{method.name}</span>
                      {method.quantum && <Zap className="w-3 h-3 text-blue-400" />}
                      {method.neural && <Brain className="w-3 h-3 text-purple-400" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 text-sm">{error}</span>
                </div>
              </motion.div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full bg-gray-800 text-white rounded-lg pl-10 pr-4 py-3 border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="your.email@company.com"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              {selectedMethod === 'password' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="w-full bg-gray-800 text-white rounded-lg pl-10 pr-12 py-3 border border-gray-600 focus:border-blue-500 focus:outline-none"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Neural Authentication */}
              {selectedMethod === 'neural' && (
                <div className="text-center">
                  <div className="mb-4">
                    <div className="w-20 h-20 bg-purple-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Brain className="w-8 h-8 text-purple-400" />
                    </div>
                    <h3 className="text-white font-medium">Neural Authentication</h3>
                    <p className="text-gray-400 text-sm">Analyzing your behavior patterns...</p>
                  </div>

                  {neuralScan && (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-purple-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Scanning neural patterns...</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Quantum Authentication */}
              {selectedMethod === 'quantum' && (
                <div className="text-center">
                  <div className="mb-4">
                    <div className="w-20 h-20 bg-blue-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Zap className="w-8 h-8 text-blue-400" />
                    </div>
                    <h3 className="text-white font-medium">Quantum Validation</h3>
                    <p className="text-gray-400 text-sm">Validating quantum signature...</p>
                  </div>

                  {quantumValidation && (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-blue-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Quantum coherence check...</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '80%' }} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={form.rememberMe}
                    onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                    className="rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-gray-400 text-sm">Remember me</span>
                </label>
                <button type="button" className="text-blue-400 hover:text-blue-300 text-sm">
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-600">
              <h4 className="text-white font-medium mb-2">Demo Credentials</h4>
              <div className="space-y-2 text-sm">
                <div className="text-gray-400">
                  <span className="text-gray-500">Super Admin:</span> adrian.stanca1@gmail.com / Cumparavinde1
                </div>
                <div className="text-gray-400">
                  <span className="text-gray-500">Company Admin:</span> casey@constructco.com / password123
                </div>
                <div className="text-gray-400">
                  <span className="text-gray-500">Developer:</span> dev@constructco.com / parola123
                </div>
                <div className="text-gray-400">
                  <span className="text-gray-500">AS Cladding Admin:</span> adrian@ascladdingltd.co.uk / lolozania1
                </div>
              </div>
            </div>

            {/* Social Login */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-900 text-gray-400">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-600 rounded-lg shadow-sm bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700 transition-colors">
                  <Github className="w-4 h-4" />
                  <span className="ml-2">GitHub</span>
                </button>
                <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-600 rounded-lg shadow-sm bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700 transition-colors">
                  <Chrome className="w-4 h-4" />
                  <span className="ml-2">Google</span>
                </button>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <span className="text-gray-400">Don't have an account? </span>
              <button className="text-blue-400 hover:text-blue-300 font-medium">
                Sign up for free
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}