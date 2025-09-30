import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Users, UserPlus, Search, Filter, Shield, Mail,
  Phone, Calendar, Edit, Key, CheckCircle, XCircle
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  permissions: string[];
  phone?: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
}

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = () => {
    setLoading(true);
    if (activeTab === 'users') {
      setUsers([
        {
          id: 'user-001',
          email: 'john.smith@company.com',
          firstName: 'John',
          lastName: 'Smith',
          role: 'Project Manager',
          department: 'Operations',
          status: 'active',
          lastLogin: '2025-09-28T14:30:00Z',
          permissions: ['read_projects', 'write_projects', 'manage_tasks'],
          phone: '+1 (555) 123-4567'
        },
        {
          id: 'user-002',
          email: 'sarah.johnson@company.com',
          firstName: 'Sarah',
          lastName: 'Johnson',
          role: 'Safety Manager',
          department: 'Safety',
          status: 'active',
          lastLogin: '2025-09-28T09:15:00Z',
          permissions: ['read_safety', 'write_safety', 'manage_incidents'],
          phone: '+1 (555) 234-5678'
        }
      ]);
    } else {
      setRoles([
        {
          id: 'role-001',
          name: 'Administrator',
          description: 'Full system access',
          permissions: ['admin_all', 'manage_users'],
          userCount: 2
        },
        {
          id: 'role-002',
          name: 'Project Manager',
          description: 'Manage projects and teams',
          permissions: ['read_projects', 'write_projects'],
          userCount: 8
        }
      ]);
    }
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage users, roles, and permissions</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Shield className="h-4 w-4 mr-2" />
            Manage Roles
          </Button>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-3xl font-bold text-gray-900">
                  {users.filter(u => u.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Roles</p>
                <p className="text-3xl font-bold text-gray-900">{roles.length}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Actions</p>
                <p className="text-3xl font-bold text-gray-900">3</p>
              </div>
              <Key className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            onClick={() => setActiveTab('users')}
          >
            Users ({users.length})
          </button>
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'roles'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            onClick={() => setActiveTab('roles')}
          >
            Roles ({roles.length})
          </button>
        </nav>
      </div>

      <div className="flex items-center">
        <div className="relative">
          <Search className="h-4 w-4 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm w-80"
          />
        </div>
      </div>

      {activeTab === 'users' ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">User</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Role</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center space-x-1">
                              <Mail className="h-3 w-3" />
                              <span>{user.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{user.role}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(user.status)}
                          <Badge variant="success">{user.status}</Badge>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Key className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <Card key={role.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-6 w-6 text-blue-500" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{role.name}</h3>
                      <p className="text-sm text-gray-600">{role.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{role.userCount} users</Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Permissions</h4>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.map(permission => (
                        <Badge key={permission} variant="outline" className="text-xs">
                          {permission.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 mt-6 pt-4 border-t border-gray-200">
                  <Button variant="outline" size="sm" className="flex-1">
                    Edit Role
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
