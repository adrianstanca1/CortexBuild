"use client";

/**
 * Login Page - Modern Authentication UI
 * Full-featured login with validation, error handling, and functional buttons
 */

import { AlertCircle, ArrowRight, Building2, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Login failed');
      }

      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Set cookies for middleware
      document.cookie = `token=${data.token}; path=/; max-age=86400`;
      document.cookie = `role=${data.user.role}; path=/; max-age=86400`;
      document.cookie = `email=${encodeURIComponent(data.user.email)}; path=/; max-age=86400`;
      document.cookie = `uid=${data.user.id}; path=/; max-age=86400`;

      console.log('✅ Login successful:', data.user);

      // Redirect
      const next = params.get('next') || '/dashboard';
      router.push(next);
      router.refresh();
    } catch (err: any) {
      console.error('❌ Login error:', err);
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  // Quick login (for demo)
  const quickLogin = async (role: 'super_admin' | 'company_admin' | 'developer') => {
    const credentials: any = {
      super_admin: { email: 'adrian.stanca1@gmail.com', password: 'parola123' },
      company_admin: { email: 'adrian@ascladdingltd.co.uk', password: 'lolozania1' },
      developer: { email: 'adrian.stanca1@icloud.com', password: 'password123' }
    };

    setEmail(credentials[role].email);
    setPassword(credentials[role].password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-600 p-12 flex-col justify-between text-white">
        <div>
          <Link href="/" className="flex items-center gap-3 text-white hover:opacity-90">
            <Building2 className="w-10 h-10" />
            <span className="text-2xl font-bold">CortexBuild</span>
          </Link>
        </div>

        <div className="space-y-6">
          <h1 className="text-5xl font-bold leading-tight">
            Welcome back to
            <br />
            the future of
            <br />
            construction
          </h1>
          <p className="text-xl text-blue-100">
            Enterprise-grade platform powered by AI with real-time collaboration
          </p>
        </div>

        <div className="flex gap-8">
          <div>
            <div className="text-3xl font-bold">10,000+</div>
            <div className="text-blue-200">Active Projects</div>
          </div>
          <div>
            <div className="text-3xl font-bold">50,000+</div>
            <div className="text-blue-200">Team Members</div>
          </div>
          <div>
            <div className="text-3xl font-bold">99.9%</div>
            <div className="text-blue-200">Uptime</div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="lg:hidden mb-8">
              <Link href="/" className="inline-flex items-center gap-2 text-blue-600">
                <Building2 className="w-8 h-8" />
                <span className="text-2xl font-bold">CortexBuild</span>
              </Link>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Sign in to your account</h2>
            <p className="mt-2 text-gray-600">
              Don't have an account?{' '}
              <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign up for free
              </Link>
            </p>
          </div>

          {/* Quick Login Demo Buttons */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900 mb-3">Quick Demo Login:</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { role: 'super_admin', label: 'Super Admin' },
                { role: 'company_admin', label: 'Company' },
                { role: 'developer', label: 'Developer' }
              ].map(({ role, label }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => quickLogin(role as any)}
                  className="px-3 py-2 bg-white hover:bg-gray-50 text-blue-700 text-xs font-medium rounded-lg border border-blue-200 transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Login failed</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="you@company.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Remember me</span>
              </label>
              <Link
                href="/reset"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500">
            Protected by enterprise-grade security with 256-bit encryption
          </p>
        </div>
      </div>
    </div>
  );
}
