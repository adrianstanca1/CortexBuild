import React, { useState, useEffect } from 'react';
import { Shield, Lock, Unlock, Users, Search, Filter, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  company_id: string;
  company_name?: string;
  sdk_access: boolean;
  sdk_tier?: string;
  api_requests_used?: number;
  api_requests_limit?: number;
  created_at: string;
  last_login?: string;
}

export const UserAccessControl: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterSDKAccess, setFilterSDKAccess] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Load users error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSDKAccess = async (userId: string, currentAccess: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/admin/sdk/users/${userId}/access`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sdk_access: !currentAccess })
      });

      const data = await response.json();
      if (data.success) {
        loadUsers();
      }
    } catch (error) {
      console.error('Toggle SDK access error:', error);
    }
  };

  const updateSDKTier = async (userId: string, tier: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/admin/sdk/users/${userId}/tier`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tier })
      });

      const data = await response.json();
      if (data.success) {
        loadUsers();
      }
    } catch (error) {
      console.error('Update SDK tier error:', error);
    }
  };

  const bulkUpdateAccess = async (access: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const promises = Array.from(selectedUsers).map(userId =>
        fetch(`http://localhost:3001/api/admin/sdk/users/${userId}/access`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ sdk_access: access })
        })
      );

      await Promise.all(promises);
      setSelectedUsers(new Set());
      loadUsers();
    } catch (error) {
      console.error('Bulk update error:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesSDK = filterSDKAccess === 'all' ||
                      (filterSDKAccess === 'enabled' && user.sdk_access) ||
                      (filterSDKAccess === 'disabled' && !user.sdk_access);
    return matchesSearch && matchesRole && matchesSDK;
  });

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const selectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <Shield className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">User Access Control</h2>
        </div>
        <p className="text-gray-600">Manage SDK Developer access and permissions for all users</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="company_admin">Company Admin</option>
              <option value="project_manager">Project Manager</option>
              <option value="user">User</option>
            </select>
          </div>

          {/* SDK Access Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={filterSDKAccess}
              onChange={(e) => setFilterSDKAccess(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All SDK Access</option>
              <option value="enabled">SDK Enabled</option>
              <option value="disabled">SDK Disabled</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.size > 0 && (
            <div className="flex space-x-2">
              <button
                onClick={() => bulkUpdateAccess(true)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Enable SDK ({selectedUsers.size})
              </button>
              <button
                onClick={() => bulkUpdateAccess(false)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Disable SDK ({selectedUsers.size})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">SDK Enabled</p>
              <p className="text-2xl font-bold text-green-600">{users.filter(u => u.sdk_access).length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">SDK Disabled</p>
              <p className="text-2xl font-bold text-red-600">{users.filter(u => !u.sdk_access).length}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Selected</p>
              <p className="text-2xl font-bold text-purple-600">{selectedUsers.size}</p>
            </div>
            <Shield className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                    onChange={selectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SDK Access</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SDK Tier</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">API Usage</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.role === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'company_admin' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{user.company_name || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleSDKAccess(user.id, user.sdk_access)}
                        className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          user.sdk_access
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {user.sdk_access ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        <span>{user.sdk_access ? 'Enabled' : 'Disabled'}</span>
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      {user.sdk_access ? (
                        <select
                          value={user.sdk_tier || 'free'}
                          onChange={(e) => updateSDKTier(user.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="free">Free</option>
                          <option value="starter">Starter</option>
                          <option value="pro">Pro</option>
                          <option value="enterprise">Enterprise</option>
                        </select>
                      ) : (
                        <span className="text-sm text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {user.sdk_access && user.api_requests_used !== undefined ? (
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 w-20">
                            <div
                              className={`h-2 rounded-full ${
                                (user.api_requests_used / (user.api_requests_limit || 1)) > 0.8
                                  ? 'bg-red-600'
                                  : (user.api_requests_used / (user.api_requests_limit || 1)) > 0.5
                                  ? 'bg-yellow-600'
                                  : 'bg-green-600'
                              }`}
                              style={{ width: `${Math.min((user.api_requests_used / (user.api_requests_limit || 1)) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600">
                            {user.api_requests_used}/{user.api_requests_limit === -1 ? '∞' : user.api_requests_limit}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleSDKAccess(user.id, user.sdk_access)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        {user.sdk_access ? 'Revoke' : 'Grant'} Access
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

