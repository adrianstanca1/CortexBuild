import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ProjectManagement from './components/ProjectManagement';
import ClientManagement from './components/ClientManagement';
import DeveloperDashboard from './components/DeveloperDashboard';
import AdminDashboard from './components/AdminDashboard';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import Settings from './components/Settings';

// Contexts
import { TenantProvider } from './contexts/TenantContext';

// Services
import { authService } from './auth/authService';

// Types
import { User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          // Verify token and get user data
          const userData = await authService.verifyToken(token);
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('authToken');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full"
        />
      </div>
    );
  }

  return (
    <TenantProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />

          <AnimatePresence mode="wait">
            <Routes>
              <Route
                path="/login"
                element={
                  user ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <Login onLogin={handleLogin} />
                  )
                }
              />

              <Route
                path="/dashboard"
                element={
                  user ? (
                    <Dashboard user={user} onLogout={handleLogout} />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />

              <Route
                path="/projects"
                element={
                  user ? (
                    <ProjectManagement user={user} onLogout={handleLogout} />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />

              <Route
                path="/clients"
                element={
                  user ? (
                    <ClientManagement user={user} onLogout={handleLogout} />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />

              <Route
                path="/developer"
                element={
                  user && (user.role === 'developer' || user.role === 'super_admin') ? (
                    <DeveloperDashboard user={user} onLogout={handleLogout} />
                  ) : (
                    <Navigate to="/dashboard" replace />
                  )
                }
              />

              <Route
                path="/admin"
                element={
                  user && (user.role === 'admin' || user.role === 'super_admin') ? (
                    <AdminDashboard user={user} onLogout={handleLogout} />
                  ) : (
                    <Navigate to="/dashboard" replace />
                  )
                }
              />

              <Route
                path="/super-admin"
                element={
                  user && user.role === 'super_admin' ? (
                    <SuperAdminDashboard user={user} onLogout={handleLogout} />
                  ) : (
                    <Navigate to="/dashboard" replace />
                  )
                }
              />

              <Route
                path="/settings"
                element={
                  user ? (
                    <Settings user={user} onLogout={handleLogout} />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />

              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AnimatePresence>
        </div>
      </Router>
    </TenantProvider>
  );
};

export default App;
