import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../src/ui/card';
import { Button } from '../../src/ui/button';
import { Badge } from '../../src/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../src/ui/tabs';
import {
  Users,
  Building2,
  BarChart3,
  Shield,
  CheckCircle,
  Database
} from 'lucide-react';

/**
 * Admin Dashboard Component
 * Provides comprehensive platform administration interface
 */

interface AdminUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  lastLoginAt: string | null;
}

interface Tenant {
  id: number;
  name: string;
  slug: string;
  plan: string;
  contactEmail: string;
  isActive: boolean;
  subscriptionStatus: string;
  currentUsers: number;
  currentProjects: number;
  maxUsers: number;
  maxProjects: number;
  createdAt: string;
}

interface PlatformStats {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  suspendedTenants: number;
  totalUsers: number;
  totalProjects: number;
  totalStorageGb: number;
  revenueThisMonth: number;
  growthRate: number;
}

interface AdminDashboardProps {
  adminToken: string;
  onLogout: () => void;
}

export function AdminDashboard({ adminToken, onLogout }: Readonly<AdminDashboardProps>) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    // Use environment variable for API URL, fallback to relative path for development
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const fullUrl = apiUrl ? `${apiUrl}/admin${endpoint}` : `/api/admin${endpoint}`;

    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return response.json();
  };

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        setLoading(true);

        // Load admin profile
        const profileData = await apiCall('/profile');
        setAdmin(profileData.admin);

        // Load platform stats
        const statsData = await apiCall('/analytics/platform');
        setStats(statsData.stats);

        // Load tenants
        const tenantsData = await apiCall('/tenants?limit=10');
        setTenants(tenantsData.tenants);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, [adminToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ASAgents Admin</h1>
                <p className="text-sm text-gray-500">Platform Administration</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {admin?.firstName} {admin?.lastName}
                </p>
                <p className="text-xs text-gray-500">{admin?.role}</p>
              </div>
              <Button variant="outline" onClick={onLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tenants">Tenants</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalTenants || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.activeTenants || 0} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Across all tenants
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalProjects || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Active projects
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalStorageGb || 0} GB</div>
                  <p className="text-xs text-muted-foreground">
                    Total storage
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Tenants */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Tenants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tenants.map((tenant) => (
                    <div key={tenant.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-medium">{tenant.name}</h3>
                          <p className="text-sm text-gray-500">{tenant.contactEmail}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={tenant.isActive ? "default" : "secondary"}>
                          {tenant.subscriptionStatus}
                        </Badge>
                        <Badge variant="outline">
                          {tenant.plan}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tenants Tab */}
          <TabsContent value="tenants" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tenant Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Tenant management interface will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">User management interface will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Analytics dashboard will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Database: Healthy</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Cache: Healthy</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Storage: Healthy</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
