import React, { useState, useEffect } from 'react';
import { Database, HardDrive, Users, Building2, AlertTriangle, TrendingUp, Download, RefreshCw } from 'lucide-react';

interface DatabaseStats {
  total_size_mb: number;
  table_count: number;
  total_records: number;
  largest_tables: Array<{
    name: string;
    size_mb: number;
    row_count: number;
  }>;
}

interface CompanyQuota {
  company_id: string;
  company_name: string;
  storage_used_mb: number;
  storage_limit_mb: number;
  record_count: number;
  record_limit: number;
  user_count: number;
  user_limit: number;
}

interface UserQuota {
  user_id: string;
  user_name: string;
  user_email: string;
  company_name: string;
  storage_used_mb: number;
  storage_limit_mb: number;
  api_requests_used: number;
  api_requests_limit: number;
}

export const DatabaseCapabilityManager: React.FC = () => {
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);
  const [companyQuotas, setCompanyQuotas] = useState<CompanyQuota[]>([]);
  const [userQuotas, setUserQuotas] = useState<UserQuota[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'companies' | 'users'>('overview');

  useEffect(() => {
    loadDatabaseData();
  }, []);

  const loadDatabaseData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Load database stats
      const statsResponse = await fetch('http://localhost:3001/api/admin/sdk/database-stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsResponse.json();
      if (statsData.success) {
        setDbStats(statsData.data);
      }

      // Load company quotas
      const companyResponse = await fetch('http://localhost:3001/api/admin/sdk/company-quotas', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const companyData = await companyResponse.json();
      if (companyData.success) {
        setCompanyQuotas(companyData.data);
      }

      // Load user quotas
      const userResponse = await fetch('http://localhost:3001/api/admin/sdk/user-quotas', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const userData = await userResponse.json();
      if (userData.success) {
        setUserQuotas(userData.data);
      }
    } catch (error) {
      console.error('Load database data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCompanyQuota = async (companyId: string, field: string, value: number) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3001/api/admin/sdk/company-quotas/${companyId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ [field]: value })
      });
      loadDatabaseData();
    } catch (error) {
      console.error('Update company quota error:', error);
    }
  };

  const updateUserQuota = async (userId: string, field: string, value: number) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3001/api/admin/sdk/user-quotas/${userId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ [field]: value })
      });
      loadDatabaseData();
    } catch (error) {
      console.error('Update user quota error:', error);
    }
  };

  const runDatabaseBackup = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/admin/sdk/database-backup', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cortexbuild-backup-${new Date().toISOString().split('T')[0]}.db`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Backup error:', error);
    }
  };

  const formatSize = (mb: number) => {
    if (mb < 1) return `${(mb * 1024).toFixed(2)} KB`;
    if (mb < 1024) return `${mb.toFixed(2)} MB`;
    return `${(mb / 1024).toFixed(2)} GB`;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-GB').format(num);
  };

  const getUsageColor = (used: number, limit: number) => {
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-orange-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressColor = (used: number, limit: number) => {
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return 'bg-red-600';
    if (percentage >= 75) return 'bg-orange-600';
    if (percentage >= 50) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  if (loading || !dbStats) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <Database className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading database information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <Database className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Database Capability Manager</h2>
          </div>
          <p className="text-gray-600">Manage storage quotas, limits, and database health</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadDatabaseData}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={runDatabaseBackup}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Backup Database</span>
          </button>
        </div>
      </div>

      {/* Database Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <HardDrive className="w-8 h-8 opacity-80" />
            <span className="text-sm opacity-80">Total Size</span>
          </div>
          <p className="text-3xl font-bold">{formatSize(dbStats.total_size_mb)}</p>
          <p className="text-sm opacity-80 mt-1">{dbStats.table_count} tables</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Database className="w-8 h-8 opacity-80" />
            <span className="text-sm opacity-80">Total Records</span>
          </div>
          <p className="text-3xl font-bold">{formatNumber(dbStats.total_records)}</p>
          <p className="text-sm opacity-80 mt-1">Across all tables</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Building2 className="w-8 h-8 opacity-80" />
            <span className="text-sm opacity-80">Companies</span>
          </div>
          <p className="text-3xl font-bold">{companyQuotas.length}</p>
          <p className="text-sm opacity-80 mt-1">Active companies</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 opacity-80" />
            <span className="text-sm opacity-80">Users</span>
          </div>
          <p className="text-3xl font-bold">{userQuotas.length}</p>
          <p className="text-sm opacity-80 mt-1">Total users</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Overview</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('companies')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'companies'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4" />
                <span>Company Quotas</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'users'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>User Quotas</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Largest Tables</h3>
              <div className="space-y-3">
                {dbStats.largest_tables.map((table) => (
                  <div key={table.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{table.name}</p>
                      <p className="text-sm text-gray-500">{formatNumber(table.row_count)} records</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatSize(table.size_mb)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'companies' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Storage</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Records</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Users</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {companyQuotas.map((company) => (
                    <tr key={company.company_id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <p className="font-medium text-gray-900">{company.company_name}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className={getUsageColor(company.storage_used_mb, company.storage_limit_mb)}>
                              {formatSize(company.storage_used_mb)} / {formatSize(company.storage_limit_mb)}
                            </span>
                          </div>
                          <div className="bg-gray-200 rounded-full h-2 w-32">
                            <div
                              className={`h-2 rounded-full ${getProgressColor(company.storage_used_mb, company.storage_limit_mb)}`}
                              style={{ width: `${Math.min((company.storage_used_mb / company.storage_limit_mb) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {formatNumber(company.record_count)} / {formatNumber(company.record_limit)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {company.user_count} / {company.user_limit}
                      </td>
                      <td className="px-4 py-4">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Edit Limits
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Storage</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">API Requests</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {userQuotas.map((user) => (
                    <tr key={user.user_id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{user.user_name}</p>
                          <p className="text-sm text-gray-500">{user.user_email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">{user.company_name}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {formatSize(user.storage_used_mb)} / {formatSize(user.storage_limit_mb)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="bg-gray-200 rounded-full h-2 w-24">
                            <div
                              className={`h-2 rounded-full ${getProgressColor(user.api_requests_used, user.api_requests_limit)}`}
                              style={{ width: `${Math.min((user.api_requests_used / user.api_requests_limit) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600">
                            {user.api_requests_used}/{user.api_requests_limit === -1 ? '∞' : user.api_requests_limit}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Edit Limits
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

