'use client';

import { useState, useEffect } from 'react';
import { Client } from '@/types';
import { formatCurrency } from '@/lib/utils';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

// Mock data pentru clienți - EXACT ca pe base44
const mockClients: Client[] = [
  {
    id: '1',
    name: 'ABC Construction Ltd',
    contactPerson: 'John Smith',
    contactEmail: 'john@abcconstruction.co.uk',
    contactPhone: '+44 20 7123 4567',
    companyEmail: 'info@abcconstruction.co.uk',
    companyPhone: '+44 20 7123 4500',
    address: {
      street: '123 Construction Way',
      city: 'London',
      state: 'England',
      zipCode: 'SW1A 1AA',
      country: 'United Kingdom',
    },
    billingAddress: '123 Construction Way, London, SW1A 1AA, UK',
    paymentTerms: 'Net 30',
    isActive: true,
    projects: [],
    totalValue: 125000,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Premier Developments',
    contactPerson: 'Sarah Johnson',
    contactEmail: 'sarah@premierdevelopments.co.uk',
    contactPhone: '+44 161 234 5678',
    companyEmail: 'contact@premierdevelopments.co.uk',
    companyPhone: '+44 161 234 5600',
    address: {
      street: '456 Development Street',
      city: 'Manchester',
      state: 'England',
      zipCode: 'M1 1AA',
      country: 'United Kingdom',
    },
    billingAddress: '456 Development Street, Manchester, M1 1AA, UK',
    paymentTerms: 'Net 15',
    isActive: true,
    projects: [],
    totalValue: 89500,
    createdAt: '2024-02-01T14:30:00Z',
    updatedAt: '2024-02-01T14:30:00Z',
  },
  {
    id: '3',
    name: 'Heritage Properties',
    contactPerson: 'Michael Brown',
    contactEmail: 'michael@heritageproperties.co.uk',
    contactPhone: '+44 113 345 6789',
    companyEmail: 'office@heritageproperties.co.uk',
    companyPhone: '+44 113 345 6700',
    address: {
      street: '789 Heritage Lane',
      city: 'Leeds',
      state: 'England',
      zipCode: 'LS1 1AA',
      country: 'United Kingdom',
    },
    billingAddress: '789 Heritage Lane, Leeds, LS1 1AA, UK',
    paymentTerms: 'Net 30',
    isActive: true,
    projects: [],
    totalValue: 234000,
    createdAt: '2024-01-20T09:15:00Z',
    updatedAt: '2024-01-20T09:15:00Z',
  },
];

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const loadClients = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      setClients(mockClients);
      setLoading(false);
    };

    loadClients();
  }, []);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValue = clients.reduce((sum, client) => sum + client.totalValue, 0);
  const activeClients = clients.filter(c => c.isActive).length;
  const averageValue = clients.length > 0 ? totalValue / clients.length : 0;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card h-24"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card h-64"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - EXACT ca pe base44 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600">Manage your client relationships and contacts</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <PlusIcon className="w-5 h-5" />
          <span>Add Client</span>
        </button>
      </div>

      {/* Search and Filters - EXACT ca pe base44 */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-10"
          />
        </div>
      </div>

      {/* Stats Cards - EXACT ca pe base44 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card-hover">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
            </div>
          </div>
        </div>

        <div className="card-hover">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <BuildingOfficeIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Clients</p>
              <p className="text-2xl font-bold text-gray-900">{activeClients}</p>
            </div>
          </div>
        </div>

        <div className="card-hover">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <BuildingOfficeIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalValue)}
              </p>
            </div>
          </div>
        </div>

        <div className="card-hover">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BuildingOfficeIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(averageValue)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Clients Grid - EXACT ca pe base44 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <div key={client.id} className="card-hover">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
                  <p className="text-sm text-gray-600">{client.contactPerson}</p>
                </div>
              </div>
              <div className="flex space-x-1">
                <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                  <EyeIcon className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-yellow-600 transition-colors">
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <EnvelopeIcon className="w-4 h-4" />
                <span className="truncate">{client.contactEmail}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <PhoneIcon className="w-4 h-4" />
                <span>{client.contactPhone}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPinIcon className="w-4 h-4" />
                <span className="truncate">
                  {client.address.city}, {client.address.country}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Value</span>
                <span className="text-lg font-semibold text-green-600">
                  {formatCurrency(client.totalValue)}
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-gray-600">Payment Terms</span>
                <span className="text-sm font-medium">{client.paymentTerms}</span>
              </div>
            </div>

            <div className="mt-4">
              <span
                className={`badge ${
                  client.isActive ? 'badge-success' : 'badge-error'
                }`}
              >
                {client.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No clients found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm
              ? 'Try adjusting your search terms.'
              : 'Get started by adding your first client.'}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <button className="btn-primary flex items-center space-x-2 mx-auto">
                <PlusIcon className="w-5 h-5" />
                <span>Add Client</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
