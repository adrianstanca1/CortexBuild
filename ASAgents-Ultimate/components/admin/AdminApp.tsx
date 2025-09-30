import React, { useState, useEffect } from 'react';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';

/**
 * Admin App Component
 * Main entry point for the admin interface
 */

interface AdminUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
}

export function AdminApp() {
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing admin session on mount
  useEffect(() => {
    const checkAdminSession = async () => {
      try {
        const storedToken = localStorage.getItem('admin_token');
        const storedAdmin = localStorage.getItem('admin_user');

        if (storedToken && storedAdmin) {
          // Verify token is still valid
          const response = await fetch('/api/admin/profile', {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setAdminToken(storedToken);
            setAdmin(data.admin);
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
          }
        }
      } catch (error) {
        console.error('Failed to verify admin session:', error);
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
      } finally {
        setLoading(false);
      }
    };

    checkAdminSession();
  }, []);

  const handleLogin = (token: string, adminUser: AdminUser) => {
    setAdminToken(token);
    setAdmin(adminUser);
    
    // Store in localStorage for persistence
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', JSON.stringify(adminUser));
  };

  const handleLogout = () => {
    setAdminToken(null);
    setAdmin(null);
    
    // Clear localStorage
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!adminToken || !admin) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return <AdminDashboard adminToken={adminToken} onLogout={handleLogout} />;
}
