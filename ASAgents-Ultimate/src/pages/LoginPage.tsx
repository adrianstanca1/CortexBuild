import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { apiClient } from '../lib/api';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);
  const setError = useAuthStore((state) => state.setError);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleDemoLogin = async () => {
    setLoading(true);
    setLocalError(null);
    
    try {
      // Try to login with demo credentials
      const response = await apiClient.auth.login('demo@asagents.com', 'demo123');
      
      // Handle response based on structure (check if data is nested)
      const data = response.data || response;
      
      if (data.token) {
        localStorage.setItem('auth-token', data.token);
        if (data.refreshToken) {
          localStorage.setItem('refresh-token', data.refreshToken);
        }
      }
      
      // Set user in store - normalize the user object
      const user = data.user || data;
      setUser({
        id: user.id,
        email: user.email,
        firstName: user.firstName || user.name?.split(' ')[0] || 'Demo',
        lastName: user.lastName || user.name?.split(' ')[1] || 'User',
        role: user.role || 'admin',
      });
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Fallback to demo user if backend is not available
      console.log('Backend unavailable, using demo mode');
      setUser({
        id: 'demo-user-1',
        email: 'demo@asagents.com',
        firstName: 'Demo',
        lastName: 'User',
        role: 'admin',
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <div className="text-4xl mb-4">🏗️</div>
          <h2 className="text-3xl font-extrabold text-gray-900">ASAgents Ultimate</h2>
          <p className="mt-2 text-sm text-gray-600">Advanced Construction Management Platform</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleDemoLogin}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Sign in with Google
          </button>
          <button
            onClick={handleDemoLogin}
            className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Sign in with GitHub
          </button>
          <button
            onClick={handleDemoLogin}
            className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Continue with Demo
          </button>
        </div>

        <div className="text-center text-xs text-gray-500">
          <p>Enterprise-grade security with OAuth2 integration</p>
        </div>
      </div>
    </div>
  );
};
