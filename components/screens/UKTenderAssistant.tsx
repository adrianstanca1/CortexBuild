// UK Tender Assistant - Main Dashboard Component
import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Building2,
  Calendar,
  DollarSign,
  MapPin,
  TrendingUp,
  FileText,
  PlusCircle,
  Eye,
  Zap,
} from 'lucide-react';
import * as api from '../../api';

interface Tender {
  id: string;
  reference_number: string;
  title: string;
  description: string;
  organisation_name: string;
  tender_type: string;
  contract_value_min: number;
  contract_value_max: number;
  currency: string;
  location: string;
  region: string;
  deadline_date: string;
  published_date: string;
  status: string;
  sector: string;
  work_category: string;
  ai_match_score?: number;
  complexity_score?: number;
}

interface TenderStats {
  total: { count: number };
  by_status: Array<{ status: string; count: number }>;
  by_sector: Array<{ sector: string; count: number }>;
  by_region: Array<{ region: string; count: number }>;
  total_value: { total_value: number };
  upcoming_deadlines: Tender[];
}

const UKTenderAssistant: React.FC = () => {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [stats, setStats] = useState<TenderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'open',
    region: '',
    sector: '',
    min_value: '',
    max_value: '',
  });
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadTenders();
    loadStats();
  }, [filters, searchTerm, page]);

  const loadTenders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...filters,
        search: searchTerm,
        page: page.toString(),
        limit: '10',
        sort_by: 'deadline_date',
        sort_order: 'ASC',
      });

      const response = await fetch(`http://localhost:3001/api/tenders?${params}`);
      const data = await response.json();

      if (data.success) {
        setTenders(data.data);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error loading tenders:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/tenders/stats/overview');
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getDaysUntilDeadline = (deadlineDate: string) => {
    const days = Math.ceil(
      (new Date(deadlineDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return days;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
      awarded: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const generateAIBid = async (tenderId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/tenders/${tenderId}/generate-bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.success) {
        alert('AI bid generated successfully! View it in the Bids section.');
      }
    } catch (error) {
      console.error('Error generating bid:', error);
      alert('Failed to generate bid. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Building2 className="w-8 h-8" />
                UK Tender Assistant
              </h1>
              <p className="mt-2 text-blue-100">Find and win construction tenders across the UK</p>
            </div>
            <button
              onClick={() => (window.location.href = '#create-alert')}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition flex items-center gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              Create Alert
            </button>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Active Tenders</p>
                    <p className="text-3xl font-bold mt-1">{stats.total.count}</p>
                  </div>
                  <FileText className="w-10 h-10 text-blue-200" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Value</p>
                    <p className="text-2xl font-bold mt-1">
                      {formatCurrency(stats.total_value.total_value || 0)}
                    </p>
                  </div>
                  <DollarSign className="w-10 h-10 text-blue-200" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Closing Soon</p>
                    <p className="text-3xl font-bold mt-1">
                      {
                        stats.upcoming_deadlines.filter(
                          (t) => getDaysUntilDeadline(t.deadline_date) <= 7
                        ).length
                      }
                    </p>
                  </div>
                  <Calendar className="w-10 h-10 text-blue-200" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Top Region</p>
                    <p className="text-xl font-bold mt-1">{stats.by_region[0]?.region || 'N/A'}</p>
                  </div>
                  <MapPin className="w-10 h-10 text-blue-200" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search tenders by title, organisation, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Filters
              {showFilters && (
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="awarded">Awarded</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                <select
                  value={filters.region}
                  onChange={(e) => setFilters({ ...filters, region: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Regions</option>
                  <option value="London">London</option>
                  <option value="South East">South East</option>
                  <option value="South West">South West</option>
                  <option value="West Midlands">West Midlands</option>
                  <option value="North West">North West</option>
                  <option value="Scotland">Scotland</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sector</label>
                <select
                  value={filters.sector}
                  onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Sectors</option>
                  <option value="construction">Construction</option>
                  <option value="civil_engineering">Civil Engineering</option>
                  <option value="building_services">Building Services</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Value (£)
                </label>
                <input
                  type="number"
                  value={filters.min_value}
                  onChange={(e) => setFilters({ ...filters, min_value: e.target.value })}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Tenders List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading tenders...</p>
            </div>
          ) : tenders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700">No tenders found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
            </div>
          ) : (
            tenders.map((tender) => {
              const daysLeft = getDaysUntilDeadline(tender.deadline_date);
              const isUrgent = daysLeft <= 7 && daysLeft > 0;

              return (
                <div
                  key={tender.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{tender.title}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(tender.status)}`}
                        >
                          {tender.status}
                        </span>
                        {tender.ai_match_score && tender.ai_match_score >= 85 && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {tender.ai_match_score}% Match
                          </span>
                        )}
                      </div>

                      <p className="text-gray-600 mb-3">{tender.organisation_name}</p>

                      <p className="text-gray-700 mb-4 line-clamp-2">{tender.description}</p>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {formatCurrency(tender.contract_value_min)} -{' '}
                          {formatCurrency(tender.contract_value_max)}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {tender.location}, {tender.region}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Deadline: {formatDate(tender.deadline_date)}
                          {isUrgent && (
                            <span className="ml-1 text-red-600 font-semibold">
                              ({daysLeft} days left!)
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                          {tender.sector}
                        </span>
                        <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                          {tender.work_category?.replace('_', ' ')}
                        </span>
                        <span className="px-3 py-1 bg-gray-50 text-gray-700 rounded-full text-xs font-medium">
                          {tender.tender_type}
                        </span>
                      </div>
                    </div>

                    <div className="ml-6 flex flex-col gap-2">
                      <button
                        onClick={() => setSelectedTender(tender)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 whitespace-nowrap"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      <button
                        onClick={() => generateAIBid(tender.id)}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition flex items-center gap-2 whitespace-nowrap"
                      >
                        <Zap className="w-4 h-4" />
                        AI Bid
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2 border border-gray-300 rounded-lg bg-blue-50 text-blue-600 font-semibold">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Tender Detail Modal */}
      {selectedTender && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">{selectedTender.title}</h2>
              <button
                onClick={() => setSelectedTender(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Organisation</h3>
                <p>{selectedTender.organisation_name}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
                <p className="text-gray-700">{selectedTender.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Contract Value</h3>
                  <p>
                    {formatCurrency(selectedTender.contract_value_min)} -{' '}
                    {formatCurrency(selectedTender.contract_value_max)}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Deadline</h3>
                  <p>{formatDate(selectedTender.deadline_date)}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Location</h3>
                  <p>
                    {selectedTender.location}, {selectedTender.region}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Reference</h3>
                  <p>{selectedTender.reference_number}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    generateAIBid(selectedTender.id);
                    setSelectedTender(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition flex items-center justify-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  Generate AI Bid
                </button>
                <button
                  onClick={() => setSelectedTender(null)}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UKTenderAssistant;
