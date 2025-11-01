// 🔐 Robust Authentication Flow
// Complete authentication system with fallbacks and demo mode

import React, { useState, useEffect } from 'react';
import { 
  Building2, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, 
  User, ArrowRight, Loader2, Shield, Database, Wifi 
} from 'lucide-react';
import { supabase, auth as supabaseAuth, isSupabaseConfigured } from '../lib/supabase';
import { useDemoAuth } from '../hooks/useDemoAuth';
import toast from 'react-hot-toast';

interface LoginFormData {
  email: string;
  password: string;
}

interface SignUpFormData extends LoginFormData {
  firstName: string;
  lastName: string;
  companyName: string;
  role: string;
}

export default function RobustAuthFlow() {
  const { user, loading: authLoading } = useDemoAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'auth' | 'verify' | 'complete'>('auth');
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  
  const [loginData, setLoginData] = useState<LoginFormData>({
    email: '',
    password: ''
  });

  const [signUpData, setSignUpData] = useState<SignUpFormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    companyName: '',
    role: 'project_manager'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check connection status on mount
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const { data, error } = await supabase.from('companies').select('count').limit(1);
      if (error) {
        setConnectionStatus('error');
      } else {
        setConnectionStatus('connected');
      }
    } catch (error) {
      setConnectionStatus('error');
    }
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !authLoading) {
      console.log('User authenticated, user state updated');
      // Don't redirect here - let the parent component handle routing
      // The SupabaseApp component will detect the user state change and show the main app
    }
  }, [user, authLoading]);

  const validateForm = (data: any, isLoginForm: boolean) => {
    const newErrors: Record<string, string> = {};

    // Ensure data exists
    if (!data) {
      newErrors.general = 'Form data is missing';
      setErrors(newErrors);
      return false;
    }

    if (!data.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!data.password) {
      newErrors.password = 'Password is required';
    } else if (!isLoginForm && data.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLoginForm) {
      if (!data.firstName) newErrors.firstName = 'First name is required';
      if (!data.lastName) newErrors.lastName = 'Last name is required';
      if (!data.companyName) newErrors.companyName = 'Company name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(loginData, true)) return;
    
    setLoading(true);
    setErrors({});

    try {
      console.log('🔐 Attempting login with:', loginData.email);
      
      const { data, error } = await supabaseAuth.signIn(loginData.email, loginData.password);
      
      if (error) {
        console.error('❌ Login error:', error);
        setErrors({ general: error.message || 'Login failed. Please check your credentials.' });
        return;
      }

      if (data.user) {
        console.log('✅ Login successful:', data.user.email);
        toast.success(`Welcome back, ${data.user.email}!`);
        // Don't set step to complete - let the auth state change trigger the redirect
      }
    } catch (error: any) {
      console.error('❌ Login exception:', error);
      setErrors({ general: 'Login failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(signUpData, false)) return;
    
    setLoading(true);
    setErrors({});

    try {
      console.log('📝 Attempting signup with:', signUpData.email);
      
      const { data, error } = await supabaseAuth.signUp(
        signUpData.email, 
        signUpData.password,
        {
          first_name: signUpData.firstName,
          last_name: signUpData.lastName,
          full_name: `${signUpData.firstName} ${signUpData.lastName}`,
          company_name: signUpData.companyName,
          role: signUpData.role
        }
      );
      
      if (error) {
        console.error('❌ Signup error:', error);
        setErrors({ general: error.message || 'Account creation failed. Please try again.' });
        return;
      }

      if (data.user) {
        console.log('✅ Signup successful:', data.user.email);
        toast.success('Account created successfully!');
        
        if (data.user.email_confirmed_at) {
          // User is confirmed, auth state will update automatically
        } else {
          setStep('verify');
        }
      }
    } catch (error: any) {
      console.error('❌ Signup exception:', error);
      setErrors({ general: 'Account creation failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    
    try {
      console.log('🎮 Starting demo mode...');
      
      const demoUser = {
        id: '68348508-fdf2-4e1a-9122-220d489f79ca',
        email: 'admin@ascladding.com',
        name: 'Demo Admin User',
        role: 'admin',
        company_id: 'demo-company-1'
      };
      
      localStorage.setItem('demo_user', JSON.stringify(demoUser));
      localStorage.setItem('demo_session', 'true');
      
      console.log('✅ Demo mode activated');
      toast.success('Welcome to the ASAgents-Ultimate demo!');

      // Don't reload - let the auth state change trigger the app to show
      // The useUnifiedAuth hook will detect the demo session and update the user state
      
    } catch (error: any) {
      console.error('❌ Demo mode failed:', error);
      toast.error('Demo mode failed. Please try manual login.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    try {
      if (isLogin) {
        setLoginData(prev => prev ? { ...prev, [name]: value } : { email: '', password: '', [name]: value });
      } else {
        setSignUpData(prev => prev ? {
          ...prev,
          [name]: value
        } : {
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          companyName: '',
          role: 'project_manager',
          [name]: value
        });
      }

      if (errors && errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    } catch (error) {
      console.error('Error in handleInputChange:', error);
    }
  };

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading ASAgents-Ultimate...</p>
        </div>
      </div>
    );
  }

  // Show configuration error
  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Configuration Error</h2>
          <p className="text-gray-600 mb-4">
            Supabase is not properly configured. Please check your environment variables.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show verification step
  if (step === 'verify') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Check Your Email</h2>
          <p className="text-gray-600 mb-4">
            We've sent you a verification link. Please check your email and click the link to activate your account.
          </p>
          <button
            onClick={() => setStep('auth')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // Note: Removed completion step - auth state changes will trigger app to show automatically

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="h-12 w-12 text-blue-600" />
            <span className="ml-2 text-2xl font-bold text-gray-900">ASAgents-Ultimate</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isLogin ? 'Welcome Back' : 'Get Started'}
          </h1>
          <p className="text-gray-600">
            {isLogin 
              ? 'Sign in to your construction management platform' 
              : 'Create your account and transform your construction projects'
            }
          </p>
        </div>

        {/* Connection Status */}
        <div className={`border rounded-lg p-4 mb-6 ${
          connectionStatus === 'connected' ? 'bg-green-50 border-green-200' :
          connectionStatus === 'error' ? 'bg-red-50 border-red-200' :
          'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center">
            {connectionStatus === 'connected' ? (
              <>
                <Database className="h-5 w-5 text-green-600 mr-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">Database Connected</p>
                  <p className="text-xs text-green-700">Real-time Supabase integration active</p>
                </div>
              </>
            ) : connectionStatus === 'error' ? (
              <>
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">Connection Error</p>
                  <p className="text-xs text-red-700">Database connection failed</p>
                </div>
              </>
            ) : (
              <>
                <Loader2 className="h-5 w-5 text-yellow-600 mr-2 animate-spin" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-900">Checking Connection</p>
                  <p className="text-xs text-yellow-700">Verifying database status...</p>
                </div>
              </>
            )}
          </div>
          
          {connectionStatus === 'connected' && (
            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="mt-3 w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Loading...' : '🎮 Try Demo Mode (Instant Access)'}
            </button>
          )}
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Error Display */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                <span className="text-sm text-red-700">{errors.general}</span>
              </div>
            </div>
          )}

          <form onSubmit={isLogin ? handleLogin : handleSignUp} className="space-y-6">
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={signUpData.firstName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.firstName ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="John"
                    />
                    {errors.firstName && <p className="text-xs text-red-600 mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={signUpData.lastName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.lastName ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Doe"
                    />
                    {errors.lastName && <p className="text-xs text-red-600 mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={signUpData.companyName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.companyName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Your Construction Company"
                  />
                  {errors.companyName && <p className="text-xs text-red-600 mt-1">{errors.companyName}</p>}
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                    Role *
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={signUpData.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="admin">Administrator</option>
                    <option value="project_manager">Project Manager</option>
                    <option value="field_supervisor">Field Supervisor</option>
                    <option value="safety_manager">Safety Manager</option>
                    <option value="quality_inspector">Quality Inspector</option>
                    <option value="worker">Construction Worker</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={isLogin ? loginData.email : signUpData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="you@company.com"
                />
              </div>
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={isLogin ? loginData.password : signUpData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading || connectionStatus !== 'connected'}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <ArrowRight className="h-4 w-4 mr-2" />
              )}
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"
              }
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-4">Trusted by construction companies worldwide</p>
          <div className="flex justify-center space-x-6 text-xs text-gray-500">
            <span className="flex items-center"><Shield className="h-3 w-3 mr-1" />Enterprise Security</span>
            <span className="flex items-center"><Wifi className="h-3 w-3 mr-1" />Real-time Sync</span>
            <span className="flex items-center"><Database className="h-3 w-3 mr-1" />Live Database</span>
          </div>
        </div>
      </div>
    </div>
  );
}
