import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Building2, Users, FolderOpen } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  subscription_plan: string;
  max_users: number;
  max_projects: number;
  is_active: number;
  user_count: number;
  project_count: number;
  created_at: string;
}

// Use production API in production, localhost in development
const API_URL = import.meta.env.PROD
  ? '/api'
  : 'http://localhost:3001/api';

export const CompanyManagement: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem('constructai_token');
      const response = await fetch(`${API_URL}/admin/companies`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setCompanies(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async (companyData: any) => {
    try {
      const token = localStorage.getItem('constructai_token');
      const response = await fetch(`${API_URL}/admin/companies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(companyData)
      });
      const data = await response.json();
      if (data.success) {
        showNotification('success', 'Company created successfully!');
        setShowCreateModal(false);
        fetchCompanies();
      } else {
        showNotification('error', data.error || 'Failed to create company');
      }
    } catch (error) {
      showNotification('error', 'Failed to create company');
    }
  };

  const handleUpdateCompany = async (companyId: string, updates: any) => {
    try {
      const token = localStorage.getItem('constructai_token');
      const response = await fetch(`${API_URL}/admin/companies/${companyId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      const data = await response.json();
      if (data.success) {
        showNotification('success', 'Company updated successfully!');
        setShowEditModal(false);
        fetchCompanies();
      } else {
        showNotification('error', data.error || 'Failed to update company');
      }
    } catch (error) {
      showNotification('error', 'Failed to update company');
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h2 className="text-2xl font-bold text-gray-900">Company Management</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          <span>Create Company</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map(company => (
          <div key={company.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="p-6">
              {/* Company Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                      company.subscription_plan === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                      company.subscription_plan === 'pro' ? 'bg-blue-100 text-blue-800' :
                      company.subscription_plan === 'starter' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {company.subscription_plan || 'free'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>Users</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {company.user_count || 0} / {company.max_users || 5}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <FolderOpen className="w-4 h-4" />
                    <span>Projects</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {company.project_count || 0} / {company.max_projects || 10}
                  </span>
                </div>
              </div>

              {/* Status */}
              <div className="mb-4">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  company.is_active === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {company.is_active === 1 ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-4 border-t">
                <button
                  onClick={() => { setSelectedCompany(company); setShowEditModal(true); }}
                  className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Company Modal */}
      {showCreateModal && (
        <CompanyFormModal
          title="Create New Company"
          onSubmit={handleCreateCompany}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Edit Company Modal */}
      {showEditModal && selectedCompany && (
        <CompanyFormModal
          title="Edit Company"
          company={selectedCompany}
          onSubmit={(data) => handleUpdateCompany(selectedCompany.id, data)}
          onClose={() => { setShowEditModal(false); setSelectedCompany(null); }}
        />
      )}
    </div>
  );
};

// Company Form Modal Component
const CompanyFormModal: React.FC<any> = ({ title, company, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: company?.name || '',
    subscription_plan: company?.subscription_plan || 'free',
    max_users: company?.max_users || 5,
    max_projects: company?.max_projects || 10,
    is_active: company?.is_active !== undefined ? company.is_active : 1
  });

  const [errors, setErrors] = useState<any>({});

  const validate = () => {
    const newErrors: any = {};
    if (!formData.name) newErrors.name = 'Company name is required';
    if (formData.max_users < 1) newErrors.max_users = 'Must be at least 1';
    if (formData.max_projects < 1) newErrors.max_projects = 'Must be at least 1';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Plan</label>
            <select
              value={formData.subscription_plan}
              onChange={(e) => setFormData({ ...formData, subscription_plan: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="free">Free</option>
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Users</label>
              <input
                type="number"
                value={formData.max_users}
                onChange={(e) => setFormData({ ...formData, max_users: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Projects</label>
              <input
                type="number"
                value={formData.max_projects}
                onChange={(e) => setFormData({ ...formData, max_projects: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>
          </div>

          {company && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active === 1}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">Active Company</label>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {company ? 'Update Company' : 'Create Company'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const X: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

