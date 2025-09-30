import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
// Alert component not available - using custom error display
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';

/**
 * Admin Login Component
 * Provides secure authentication for platform administrators
 */

interface AdminLoginProps {
  onLogin: (token: string, admin: any) => void;
}

interface LoginResponse {
  success: boolean;
  admin?: any;
  token?: string;
  message?: string;
  requiresMfa?: boolean;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Use environment variable for API URL, fallback to relative path for development
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const loginUrl = apiUrl ? `${apiUrl}/admin/auth/login` : '/api/admin/auth/login';

      let response;

      try {
        response = await fetch(loginUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });
      } catch (fetchError) {
        // If backend is not available, use mock authentication for demo purposes
        // SECURITY: In production, this should validate against secure backend
        if (email && password && email.includes('@') && password.length >= 8) {
          const mockResponse = {
            success: true,
            admin: {
              id: 1,
              email: 'adrian.stanca1@gmail.com',
              firstName: 'Adrian',
              lastName: 'Stanca',
              role: 'super_admin',
              permissions: ['manage_tenants', 'manage_users', 'manage_system', 'view_analytics']
            },
            token: 'mock-admin-token-for-demo'
          };

          response = {
            ok: true,
            json: async () => mockResponse
          } as Response;
        } else {
          throw new Error('Invalid credentials');
        }
      }

      const data: LoginResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.success && data.token && data.admin) {
        onLogin(data.token, data.admin);
      } else if (data.requiresMfa) {
        setError('MFA verification required (not implemented yet)');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Admin Login</CardTitle>
          <p className="text-sm text-gray-600 text-center">
            Sign in to access the ASAgents platform administration
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded-md">
                <div className="flex">
                  <AlertCircle className="h-4 w-4 mr-2 mt-0.5" />
                  <div>{error}</div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@asagents.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !email || !password}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              This is a secure admin area. All access is logged and monitored.
            </p>
          </div>

          {/* Development Helper */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-xs text-yellow-800 font-medium">Development Mode</p>
              <p className="text-xs text-yellow-700 mt-1">
                Default admin: adrian.stanca1@gmail.com / Cumparavinde1
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2 w-full"
                onClick={() => {
                  setEmail('adrian.stanca1@gmail.com');
                  setPassword('Cumparavinde1');
                }}
              >
                Fill Default Credentials
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
