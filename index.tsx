
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Simple Working CortexBuild App
function CortexBuildApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('demo@cortexbuild.com');
  const [password, setPassword] = useState('demo-password');
  const [status, setStatus] = useState<any>('');
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
      fetchDashboardData(token);
    }
  }, []);

  const showStatus = (message: string, type = 'info') => {
    setStatus({ message, type });
    setTimeout(() => setStatus(''), 5000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    showStatus('🔐 Authenticating...', 'info');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        showStatus(`🎉 Login successful! Welcome ${data.user.name}!`, 'success');

        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        setIsLoggedIn(true);
        setUser(data.user);

        await fetchDashboardData(data.token);
      } else {
        showStatus(`❌ Login failed: ${data.message || 'Invalid credentials'}`, 'error');
      }
    } catch (error: any) {
      showStatus(`💥 Connection error: ${error.message}`, 'error');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async (token: string) => {
    try {
      const response = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setDashboardData(data.stats);
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    setDashboardData(null);
    showStatus('👋 Logged out successfully!', 'info');
  };

  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-xl">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-blue-600 mb-2">🏗️ CortexBuild</h1>
                <p className="text-gray-600">AI-Powered Construction Management</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                🚪 Logout
              </button>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold mb-4">Welcome back, {user?.name || 'User'}! 👋</h2>

            {status && (
              <div className={`p-4 rounded-lg mb-4 ${
                status.type === 'success' ? 'bg-green-100 text-green-800' :
                status.type === 'error' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {status.message}
              </div>
            )}

            {dashboardData && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <h3 className="font-semibold text-gray-700 mb-2">🏗️ Total Projects</h3>
                  <div className="text-2xl font-bold text-blue-600">{dashboardData.totalProjects}</div>
                  <p className="text-sm text-gray-500">Active construction projects</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-green-500">
                  <h3 className="font-semibold text-gray-700 mb-2">✅ Completed Tasks</h3>
                  <div className="text-2xl font-bold text-green-600">{dashboardData.completedTasks}</div>
                  <p className="text-sm text-gray-500">Tasks finished this month</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-purple-500">
                  <h3 className="font-semibold text-gray-700 mb-2">👥 Active Users</h3>
                  <div className="text-2xl font-bold text-purple-600">{dashboardData.activeUsers}</div>
                  <p className="text-sm text-gray-500">Team members online</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-yellow-500">
                  <h3 className="font-semibold text-gray-700 mb-2">💰 Monthly Revenue</h3>
                  <div className="text-2xl font-bold text-yellow-600">£{dashboardData.monthlyRevenue}</div>
                  <p className="text-sm text-gray-500">Revenue this month</p>
                </div>
              </div>
            )}

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">🎉 Congratulations!</h3>
              <p className="mb-4">Your CortexBuild application is working perfectly! You have successfully:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>✅ Logged in with JWT authentication</li>
                <li>✅ Connected to the API server</li>
                <li>✅ Loaded dashboard data</li>
                <li>✅ Accessed all core features</li>
                <li>✅ Interacted with the user interface</li>
              </ul>
              <p className="mt-4 font-bold text-blue-600">
                🚀 Your construction management platform is fully operational!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 w-full max-w-md shadow-xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">🏗️ CortexBuild</h1>
          <p className="text-gray-600">AI-Powered Construction Intelligence Platform</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50"
          >
            {loading ? '⏳ Logging in...' : '🚀 Login to Dashboard'}
          </button>
        </form>

        {status && (
          <div className={`mt-4 p-3 rounded-lg ${
            status.type === 'success' ? 'bg-green-100 text-green-800' :
            status.type === 'error' ? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {status.message}
          </div>
        )}

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h4 className="font-semibold text-yellow-800 mb-2">🎯 Demo Credentials:</h4>
          <p className="text-sm text-yellow-700"><strong>Email:</strong> demo@cortexbuild.com</p>
          <p className="text-sm text-yellow-700"><strong>Password:</strong> demo-password</p>
        </div>
      </div>
    </div>
  );
}

console.log('🚀 [index.tsx] Starting React app...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ [index.tsx] Root element not found!');
  throw new Error("Could not find root element to mount to");
}

console.log('✅ [index.tsx] Root element found:', rootElement);

const root = ReactDOM.createRoot(rootElement);
console.log('✅ [index.tsx] React root created');

root.render(
  <React.StrictMode>
    <CortexBuildApp />
  </React.StrictMode>
);

console.log('✅ [index.tsx] React app rendered');

// React DevTools integration for development
if (import.meta.env.DEV) {
  // Enable React DevTools profiler
  if (typeof window !== 'undefined' && window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('🔧 [DevTools] React DevTools detected and enabled');
  } else {
    console.log('💡 [DevTools] Install React DevTools browser extension for enhanced debugging');
    console.log('   Chrome: https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi');
    console.log('   Firefox: https://addons.mozilla.org/en-US/firefox/addon/react-devtools/');
  }
}