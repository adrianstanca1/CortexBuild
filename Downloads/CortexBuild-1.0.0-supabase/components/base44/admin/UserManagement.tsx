import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, UserCheck, UserX, Key } from 'lucide-react';
import { UserFormModal } from './UserFormModal';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  company_id: string;
  company_name?: string;
  is_active: number;
  created_at: string;
}

interface Company {
  id: string;
  name: string;
}

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchCompanies();
  }, [searchTerm, filterRole, filterCompany]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterRole) params.append('role', filterRole);
      if (filterCompany) params.append('company_id', filterCompany);

      const response = await fetch(`http://localhost:3001/api/admin/users?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/admin/companies', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setCompanies(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    }
  };

  const handleCreateUser = async (userData: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/admin/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      const data = await response.json();
      if (data.success) {
        showNotification('success', 'User created successfully!');
        setShowCreateModal(false);
        fetchUsers();
      } else {
        showNotification('error', data.error || 'Failed to create user');
      }
    } catch (error) {
      showNotification('error', 'Failed to create user');
    }
  };

  const handleUpdateUser = async (userId: string, updates: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      const data = await response.json();
      if (data.success) {
        showNotification('success', 'User updated successfully!');
        setShowEditModal(false);
        fetchUsers();
      } else {
        showNotification('error', data.error || 'Failed to update user');
      }
    } catch (error) {
      showNotification('error', 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        showNotification('success', 'User deleted successfully!');
        fetchUsers();
      } else {
        showNotification('error', data.error || 'Failed to delete user');
      }
    } catch (error) {
      showNotification('error', 'Failed to delete user');
    }
  };

  const handleToggleActive = async (userId: string, currentStatus: number) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    await handleUpdateUser(userId, { is_active: newStatus });
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`p-4 rounded-lg ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          <span>Create User</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="user">User</option>
          </select>
          <select
            value={filterCompany}
            onChange={(e) => setFilterCompany(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Companies</option>
            {companies.map(company => (
              <option key={company.id} value={company.id}>{company.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                      user.role === 'manager' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.company_name || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.is_active === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {user.is_active === 1 ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => { setSelectedUser(user); setShowEditModal(true); }}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(user.id, user.is_active)}
                      className={user.is_active === 1 ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}
                      title={user.is_active === 1 ? 'Deactivate' : 'Activate'}
                    >
                      {user.is_active === 1 ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </button>
                    {user.role !== 'super_admin' && (
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <UserFormModal
          title="Create New User"
          companies={companies}
          onSubmit={handleCreateUser}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <UserFormModal
          title="Edit User"
          user={selectedUser}
          companies={companies}
          onSubmit={(data) => handleUpdateUser(selectedUser.id, data)}
          onClose={() => { setShowEditModal(false); setSelectedUser(null); }}
        />
      )}
    </div>
  );
};



