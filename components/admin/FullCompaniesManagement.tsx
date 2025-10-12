import React, { useState, useEffect } from 'react';
import { Building2, Search, Edit2, Trash2, Plus, RefreshCw, Mail, Phone, MapPin, Globe } from 'lucide-react';
import { AddCompanyModal } from './AddCompanyModal';

const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

const getAuthToken = () => localStorage.getItem('constructai_token') || localStorage.getItem('token') || '';

interface Company {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  industry: string;
  created_at: string;
  user_count?: number;
  project_count?: number;
}

export const FullCompaniesManagement: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/admin/companies`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });
      const data = await response.json();
      if (data.success) {
        setCompanies(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteCompany = async (companyId: string) => {
    if (!confirm('Are you sure you want to delete this company? This will affect all associated users and projects.')) return;

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/admin/companies/${companyId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });
      const data = await response.json();
      if (data.success) {
        fetchCompanies();
      } else {
        alert(data.error || 'Failed to delete company');
      }
    } catch (error) {
      alert('Failed to delete company');
    }
  };

  const filteredCompanies = companies.filter(company => {
    const name = company.name?.toLowerCase() ?? '';
    const email = company.email?.toLowerCase() ?? '';
    const searchValue = searchTerm.toLowerCase();
    const matchesSearch = name.includes(searchValue) || email.includes(searchValue);
    const matchesIndustry = selectedIndustry === 'all' || company.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  const getIndustryBadgeColor = (industry?: string) => {
    if (!industry) return 'bg-gray-100 text-gray-800';
    switch (industry) {
      case 'construction': return 'bg-orange-100 text-orange-800';
      case 'real_estate': return 'bg-blue-100 text-blue-800';
      case 'architecture': return 'bg-purple-100 text-purple-800';
      case 'engineering': return 'bg-green-100 text-green-800';
      case 'property_management': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatIndustry = (industry?: string) => {
    if (!industry) return 'Unknown';
    return industry.replace('_', ' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Building2 className="w-7 h-7 mr-2 text-green-600" />
            Company Management
          </h2>
          <p className="text-gray-600 mt-1">Manage all platform companies</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Company</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search companies by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Industry Filter */}
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Industries</option>
            <option value="construction">Construction</option>
            <option value="real_estate">Real Estate</option>
            <option value="architecture">Architecture</option>
            <option value="engineering">Engineering</option>
            <option value="property_management">Property Management</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Total Companies</div>
          <div className="text-2xl font-bold text-gray-900">{companies.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Construction</div>
          <div className="text-2xl font-bold text-orange-600">
            {companies.filter(c => c.industry === 'construction').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Real Estate</div>
          <div className="text-2xl font-bold text-blue-600">
            {companies.filter(c => c.industry === 'real_estate').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Architecture</div>
          <div className="text-2xl font-bold text-purple-600">
            {companies.filter(c => c.industry === 'architecture').length}
          </div>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No companies found</p>
          </div>
        ) : (
          filteredCompanies.map((company) => (
            <div key={company.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              {/* Company Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{company.name}</h3>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getIndustryBadgeColor(company.industry)}`}>
                      {formatIndustry(company.industry)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => alert('Edit company coming soon!')}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                      title="Edit company"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteCompany(company.id)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                      title="Delete company"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Company Details */}
              <div className="p-6 space-y-3">
                {company.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="truncate">{company.email}</span>
                  </div>
                )}
                {company.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{company.phone}</span>
                  </div>
                )}
                {company.address && (
                  <div className="flex items-start text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                    <span className="flex-1">{company.address}</span>
                  </div>
                )}
                {company.website && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Globe className="w-4 h-4 mr-2 text-gray-400" />
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline truncate"
                    >
                      {company.website}
                    </a>
                  </div>
                )}
              </div>

              {/* Company Stats */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{company.user_count || 0}</div>
                    <div className="text-xs text-gray-600">Users</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{company.project_count || 0}</div>
                    <div className="text-xs text-gray-600">Projects</div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Company Modal */}
      <AddCompanyModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchCompanies}
      />
    </div>
  );
};
