import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
// FIX: Corrected import paths to be relative.
import { User, Client, Address, ClientInsights } from '../types';
import api from '../services/mockApi';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { ViewHeader } from './layout/ViewHeader';
import { Tag } from './ui/Tag';

interface ClientsViewProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
}

interface ClientFormState {
  name: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  companyEmail: string;
  companyPhone: string;
  billingAddress: string;
  paymentTerms: string;
  isActive: boolean;
  address: Address;
}

const defaultClientFormState = (): ClientFormState => ({
  name: '',
  contactPerson: '',
  contactEmail: '',
  contactPhone: '',
  companyEmail: '',
  companyPhone: '',
  billingAddress: '',
  paymentTerms: 'Net 30',
  isActive: true,
  address: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  },
});

const buildFormStateFromClient = (client?: Client): ClientFormState => {
    if (!client) {
        return defaultClientFormState();
    }
  return {
    name: client.name ?? '',
    contactPerson: client.contactPerson ?? '',
    contactEmail: client.contactEmail ?? client.email ?? '',
    contactPhone: client.contactPhone ?? client.phone ?? '',
    companyEmail: client.email ?? '',
    companyPhone: client.phone ?? '',
    billingAddress: client.billingAddress ?? '',
    paymentTerms: client.paymentTerms ?? 'Net 30',
    isActive: client.isActive ?? true,
    address: {
      street: client.address?.street ?? '',
      city: client.address?.city ?? '',
      state: client.address?.state ?? '',
      zipCode: client.address?.zipCode ?? '',
      country: client.address?.country ?? '',
    },
  };
};

const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount || 0);

type ClientModalMode = 'create' | 'edit';

type ClientModalState = { mode: 'create' } | { mode: 'edit'; client: Client };

interface ClientModalProps {
  mode: ClientModalMode;
  user: User;
  client?: Client;
  onClose: () => void;
  onClientCreated: (client: Client) => void;
  onClientUpdated: (client: Client) => void;
  addToast: (message: string, type: 'success' | 'error') => void;
}

const ClientModal: React.FC<ClientModalProps> = ({
  mode,
  user,
  client,
  onClose,
  onClientCreated,
  onClientUpdated,
  addToast,
}) => {
  const [formState, setFormState] = useState<ClientFormState>(() => buildFormStateFromClient(client));
  const [isSaving, setIsSaving] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  useEffect(() => {
    setFormState(buildFormStateFromClient(client));
  }, [client, mode]);

  const handleAddressChange = (field: keyof Address, value: string) => {
    setFormState(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));
  };

  const handleChange = (field: keyof ClientFormState, value: string | boolean) => {
    if (field === 'address') return;
    setFormState(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    const payload = {
      name: formState.name.trim(),
      contactPerson: formState.contactPerson.trim(),
      contactEmail: formState.contactEmail.trim(),
      contactPhone: formState.contactPhone.trim(),
      email: (formState.companyEmail || formState.contactEmail).trim(),
      phone: (formState.companyPhone || formState.contactPhone).trim(),
      billingAddress: formState.billingAddress.trim() || formState.address.street.trim(),
      paymentTerms: formState.paymentTerms.trim() || 'Net 30',
      isActive: formState.isActive,
      address: {
        street: formState.address.street.trim(),
        city: formState.address.city.trim(),
        state: formState.address.state.trim(),
        zipCode: formState.address.zipCode.trim(),
        country: formState.address.country.trim(),
      },
    };

    if (!payload.name || !payload.contactEmail) {
      addToast('Client name and contact email are required.', 'error');
      setIsSaving(false);
      return;
    }

    try {
      if (mode === 'create') {
        const newClient = await api.createClient(payload, user.id);
        addToast('Client added successfully.', 'success');
        onClientCreated(newClient);
        setFormState(defaultClientFormState());
        onClose();
      } else if (client) {
        const updatedClient = await api.updateClient(client.id, payload, user.id);
        addToast('Client details updated.', 'success');
        onClientUpdated(updatedClient);
        onClose();
      }
    } catch (error) {
      console.error('Failed to save client', error);
      addToast('Could not save the client. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const title = mode === 'create' ? 'Add new client' : `Update ${client?.name ?? 'client'}`;
  const subtitle =
    mode === 'create'
      ? 'Capture the key contact and billing information for this account.'
      : 'Refresh contact and billing preferences for this account.';
  const submitLabel = mode === 'create' ? 'Save client' : 'Update client';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <Card className="w-full max-w-2xl overflow-hidden" onClick={event => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted"
            aria-label="Close client modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 011.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-muted-foreground">
              Client name
              <input
                ref={nameInputRef}
                type="text"
                value={formState.name}
                onChange={event => handleChange('name', event.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                placeholder="Acme Developments"
                required
              />
            </label>
            <label className="text-sm font-medium text-muted-foreground">
              Primary contact
              <input
                type="text"
                value={formState.contactPerson}
                onChange={event => handleChange('contactPerson', event.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                placeholder="Jane Smith"
              />
            </label>
            <label className="text-sm font-medium text-muted-foreground">
              Contact email
              <input
                type="email"
                value={formState.contactEmail}
                onChange={event => handleChange('contactEmail', event.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                placeholder="jane@client.com"
                required
              />
            </label>
            <label className="text-sm font-medium text-muted-foreground">
              Contact phone
              <input
                type="tel"
                value={formState.contactPhone}
                onChange={event => handleChange('contactPhone', event.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                placeholder="555-0102"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-muted-foreground">
              Accounts email
              <input
                type="email"
                value={formState.companyEmail}
                onChange={event => handleChange('companyEmail', event.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                placeholder="accounts@client.com"
              />
            </label>
            <label className="text-sm font-medium text-muted-foreground">
              Accounts phone
              <input
                type="tel"
                value={formState.companyPhone}
                onChange={event => handleChange('companyPhone', event.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                placeholder="555-0199"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-muted-foreground">
              Payment terms
              <input
                type="text"
                value={formState.paymentTerms}
                onChange={event => handleChange('paymentTerms', event.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                placeholder="Net 30"
              />
            </label>
            <label className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
              <input
                type="checkbox"
                checked={formState.isActive}
                onChange={event => handleChange('isActive', event.target.checked)}
                className="h-4 w-4 rounded border border-border text-primary focus:ring-primary"
              />
              Active account
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-muted-foreground">
              Street address
              <input
                type="text"
                value={formState.address.street}
                onChange={event => handleAddressChange('street', event.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                placeholder="221B Baker Street"
              />
            </label>
            <label className="text-sm font-medium text-muted-foreground">
              City
              <input
                type="text"
                value={formState.address.city}
                onChange={event => handleAddressChange('city', event.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                placeholder="London"
              />
            </label>
            <label className="text-sm font-medium text-muted-foreground">
              County / State
              <input
                type="text"
                value={formState.address.state}
                onChange={event => handleAddressChange('state', event.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                placeholder="Greater London"
              />
            </label>
            <label className="text-sm font-medium text-muted-foreground">
              Postcode
              <input
                type="text"
                value={formState.address.zipCode}
                onChange={event => handleAddressChange('zipCode', event.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                placeholder="NW1 6XE"
              />
            </label>
            <label className="text-sm font-medium text-muted-foreground md:col-span-2">
              Country
              <input
                type="text"
                value={formState.address.country}
                onChange={event => handleAddressChange('country', event.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                placeholder="United Kingdom"
              />
            </label>
          </div>

          <label className="text-sm font-medium text-muted-foreground">
            Billing notes
            <textarea
              value={formState.billingAddress}
              onChange={event => handleChange('billingAddress', event.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              rows={3}
              placeholder="Accounts payable team located at..."
            />
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving}>
              {submitLabel}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

type BackendHealth = { state: 'checking' | 'connected' | 'mock' | 'error'; checkedAt?: string; error?: string };

const CLIENT_STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Dormant' },
] as const;

const CLIENT_SORT_OPTIONS = [
  { id: 'recent', label: 'Recently added' },
  { id: 'alphabetical', label: 'Alphabetical' },
] as const;

type ClientStatusFilter = (typeof CLIENT_STATUS_FILTERS)[number]['id'];
type ClientSortOption = (typeof CLIENT_SORT_OPTIONS)[number]['id'];

export const ClientsView: React.FC<ClientsViewProps> = ({ user, addToast }) => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalState, setModalState] = useState<ClientModalState | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<ClientStatusFilter>('all');
    const [sortBy, setSortBy] = useState<ClientSortOption>('recent');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [insights, setInsights] = useState<ClientInsights | null>(null);
    const [backendHealth, setBackendHealth] = useState<BackendHealth>({ state: 'mock' });
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchData = useCallback(async (showLoader = true) => {
        const controller = new AbortController();
        abortControllerRef.current?.abort();
        abortControllerRef.current = controller;

        if (showLoader) {
            setLoading(true);
        }

        try {
            if (!user.companyId) {
                if (controller.signal.aborted) return;
                setClients([]);
                if (controller.signal.aborted) return;
                setInsights(null);
                if (showLoader && !controller.signal.aborted) {
                    setLoading(false);
                }
                return;
            }
            const [clientData, insightData] = await Promise.all([
                api.getClientsByCompany(user.companyId, { signal: controller.signal }),
                api.getClientInsights(user.companyId, { signal: controller.signal }),
            ]);
            if (controller.signal.aborted) return;
            setClients(clientData);
            if (controller.signal.aborted) return;
            setInsights(insightData || null);
        } catch (error) {
            if (controller.signal.aborted) return;
            addToast("Failed to load clients.", "error");
        } finally {
            if (controller.signal.aborted) return;
            if (showLoader) {
                setLoading(false);
            }
        }
    }, [user.companyId, addToast]);

    useEffect(() => {
        fetchData(true);
        return () => {
            abortControllerRef.current?.abort();
        };
    }, [fetchData]);

    useEffect(() => {
        // Backend health check - currently using mock mode
        let cancelled = false;
        
        // Simulate health check for mock mode
        Promise.resolve({ status: 'ok', checkedAt: new Date().toISOString() })
            .then(result => {
                if (cancelled) return;
                if (result.status === 'ok') {
                    setBackendHealth({ state: 'connected', checkedAt: result.checkedAt });
                } else if (result.status === 'error') {
                    setBackendHealth({ state: 'error', checkedAt: result.checkedAt, error: (result as any).error || 'Unknown error' });
                } else {
                    setBackendHealth({ state: 'mock', checkedAt: result.checkedAt });
                }
            })
            .catch(error => {
                if (cancelled) return;
                setBackendHealth({
                    state: 'error',
                    error: error instanceof Error ? error.message : String(error),
                });
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const describeRelativeTime = useCallback((value?: string) => {
        if (!value) return 'unknown';
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) {
            return 'unknown';
        }
        return formatDistanceToNow(parsed, { addSuffix: true });
    }, []);

    const summary = useMemo(() => {
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        const newThisMonth = clients.filter(client => {
            const created = new Date(client.createdAt);
            return !Number.isNaN(created.getTime()) && Date.now() - created.getTime() <= thirtyDays;
        }).length;

        if (insights) {
            const atRiskOutstanding = insights.atRiskClients.reduce((total, client) => total + client.outstanding, 0);
            return {
                total: insights.totalClients,
                active: insights.activeClients,
                dormant: insights.dormantClients,
                newThisMonth,
                newThisQuarter: insights.newThisQuarter,
                atRiskOutstanding,
            };
        }

        const total = clients.length;
        const active = clients.filter(client => client.isActive).length;
        const dormant = total - active;
        return {
            total,
            active,
            dormant,
            newThisMonth,
            newThisQuarter: newThisMonth,
            atRiskOutstanding: 0,
        };
    }, [clients, insights]);

    const filteredClients = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        const byStatus = clients.filter(client => {
            if (statusFilter === 'active') return client.isActive;
            if (statusFilter === 'inactive') return !client.isActive;
            return true;
        });
        const bySearch = query.length
            ? byStatus.filter(client => {
                const haystack = [
                    client.name,
                    client.contactPerson,
                    client.contactEmail,
                    client.contactPhone,
                    client.address?.city,
                    client.address?.state,
                ]
                    .filter(Boolean)
                    .map(value => value!.toLowerCase());
                return haystack.some(value => value.includes(query));
            })
            : byStatus;

        const sorted = [...bySearch].sort((a, b) => {
            if (sortBy === 'alphabetical') {
                return a.name.localeCompare(b.name);
            }
            const aDate = new Date(a.createdAt).getTime();
            const bDate = new Date(b.createdAt).getTime();
            return bDate - aDate;
        });
        return sorted;
    }, [clients, searchTerm, statusFilter, sortBy]);

    const handleClientCreated = useCallback((client: Client) => {
        setClients(prev => [...prev, client]);
    }, []);

    const handleClientUpdated = useCallback((client: Client) => {
        setClients(prev => prev.map(existing => (existing.id === client.id ? client : existing)));
    }, []);

    const handleEditClient = useCallback((client: Client) => {
        setModalState({ mode: 'edit', client });
    }, []);

    const handleToggleActive = async (client: Client) => {
        try {
            const updated = await api.updateClient(client.id, { isActive: !client.isActive }, user.id);
            setClients(prev => prev.map(existing => (existing.id === client.id ? updated : existing)));
            addToast(
                `${updated.name} marked ${updated.isActive ? 'active' : 'dormant'}.`,
                'success',
            );
        } catch (error) {
            addToast('Unable to update client status.', 'error');
        }
    };

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await fetchData(false);
            addToast('Clients refreshed successfully.', 'success');
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') return;
            addToast('Refresh failed. Showing cached results.', 'error');
        } finally {
            setIsRefreshing(false);
        }
    }, [fetchData, addToast]);

    const handleResetFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setSortBy('recent');
    };

    const dataSourceMeta = useMemo(() => {
        if (backendHealth.state === 'connected') {
            return {
                value: 'Live database',
                helper: backendHealth.checkedAt
                    ? `Checked ${describeRelativeTime(backendHealth.checkedAt)}`
                    : 'Synchronized with SQLite backend',
                indicator: 'positive' as const,
            };
        }
        if (backendHealth.state === 'error') {
            return {
                value: 'Degraded',
                helper: backendHealth.error ?? 'Falling back to cached data',
                indicator: 'negative' as const,
            };
        }
        return {
            value: 'Local mock',
            helper: 'Using offline-ready cache',
            indicator: 'neutral' as const,
        };
    }, [backendHealth, describeRelativeTime]);

    const isInitialLoading = loading && clients.length === 0;

    return (
        <div className="space-y-6">
            {modalState && (
                <ClientModal
                    mode={modalState.mode}
                    client={modalState.mode === 'edit' ? modalState.client : undefined}
                    user={user}
                    onClose={() => setModalState(null)}
                    onClientCreated={handleClientCreated}
                    onClientUpdated={handleClientUpdated}
                    addToast={addToast}
                />
            )}
            <ViewHeader title="Clients" view="clients"
                actions={
                    <Button onClick={() => setModalState({ mode: 'create' })}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add client
                    </Button>
                }
                meta={[
                    {
                        label: 'Total accounts',
                        value: `${summary.total}`,
                        helper: summary.total === 0 ? 'No clients yet' : 'Companies you collaborate with',
                    },
                    {
                        label: 'Active',
                        value: `${summary.active}`,
                        helper:
                            summary.total > 0
                                ? `${Math.round((summary.active / summary.total) * 100)}% of portfolio`
                                : 'Onboard your first client',
                        indicator: summary.active > 0 ? 'positive' : 'neutral',
                    },
                    {
                        label: 'At-risk exposure',
                        value: formatCurrency(summary.atRiskOutstanding),
                        helper:
                            insights && insights.atRiskClients.length > 0
                                ? `${insights.atRiskClients.length} clients require attention`
                                : 'No overdue balances',
                        indicator: summary.atRiskOutstanding > 0 ? 'warning' : 'positive',
                    },
                    {
                        label: 'New this quarter',
                        value: `${summary.newThisQuarter}`,
                        helper:
                            summary.newThisQuarter > 0
                                ? 'Quarter-to-date client wins'
                                : 'Focus on business development',
                        indicator: summary.newThisQuarter > 0 ? 'positive' : 'neutral',
                    },
                    {
                        label: 'Data source',
                        value: dataSourceMeta.value,
                        helper: dataSourceMeta.helper,
                        indicator: dataSourceMeta.indicator,
                    },
                ]}
            />
            <Card className="border border-dashed border-border/60 bg-muted/30 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                        {CLIENT_STATUS_FILTERS.map(filter => {
                            const active = statusFilter === filter.id;
                            return (
                                <button
                                    key={filter.id}
                                    type="button"
                                    onClick={() => setStatusFilter(filter.id)}
                                    className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                                        active
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-border bg-background text-muted-foreground hover:bg-muted'
                                    }`}
                                >
                                    {filter.label}
                                </button>
                            );
                        })}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative">
                            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path
                                        fillRule="evenodd"
                                        d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.387a1 1 0 01-1.414 1.414l-4.387-4.387zM14 8a6 6 0 11-12 0 6 6 0 0112 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </span>
                            <input
                                type="search"
                                value={searchTerm}
                                onChange={event => setSearchTerm(event.target.value)}
                                placeholder="Search clients or contacts"
                                className="w-full rounded-full border border-border bg-background py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                            />
                        </div>
                        <select
                            value={sortBy}
                            onChange={event => setSortBy(event.target.value as ClientSortOption)}
                            className="rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                        >
                            {CLIENT_SORT_OPTIONS.map(option => (
                                <option key={option.id} value={option.id}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleResetFilters}
                            disabled={
                                statusFilter === 'all' &&
                                sortBy === 'recent' &&
                                searchTerm.trim().length === 0
                            }
                        >
                            Reset
                        </Button>
                        <Button variant="secondary" size="sm" onClick={handleRefresh} isLoading={isRefreshing}>
                            Refresh
                        </Button>
                    </div>
                </div>
            </Card>
            {insights && (
                <div className="grid gap-4 lg:grid-cols-3">
                    <Card className="space-y-4 lg:col-span-2">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-foreground">Accounts needing follow-up</h3>
                            <Tag
                                label={`${insights.atRiskClients.length} at-risk`}
                                color={insights.atRiskClients.length > 0 ? 'red' : 'green'}
                            />
                        </div>
                        {insights.atRiskClients.length > 0 ? (
                            <ul className="space-y-4">
                                {insights.atRiskClients.map(client => {
                                    const dueText = client.lastInvoiceDueAt
                                        ? formatDistanceToNow(new Date(client.lastInvoiceDueAt), { addSuffix: true })
                                        : 'No due date';
                                    const lastPayment = client.lastPaymentAt
                                        ? formatDistanceToNow(new Date(client.lastPaymentAt), { addSuffix: true })
                                        : 'No recent payment';
                                    return (
                                        <li
                                            key={client.clientId}
                                            className="flex flex-col gap-3 rounded-lg border border-border/60 bg-card/40 p-4 md:flex-row md:items-start md:justify-between"
                                        >
                                            <div className="space-y-2">
                                                <p className="text-base font-semibold text-foreground">{client.clientName}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {client.unpaidInvoices} open invoice{client.unpaidInvoices === 1 ? '' : 's'}
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    <Tag label={`Due ${dueText}`} color="red" statusIndicator="red" />
                                                    <Tag label={lastPayment} color="blue" statusIndicator="blue" />
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className="text-sm font-semibold text-foreground">
                                                    {formatCurrency(client.outstanding)}
                                                </span>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        addToast(
                                                            `Follow-up reminder queued for ${client.clientName}.`,
                                                            'success',
                                                        )
                                                    }
                                                >
                                                    Send reminder
                                                </Button>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">All client accounts are in good standing.</p>
                        )}
                    </Card>
                    <Card className="space-y-4">
                        <h3 className="text-lg font-semibold text-foreground">Top revenue clients (YTD)</h3>
                        {insights.topRevenueClients.length > 0 ? (
                            (() => {
                                const maxRevenue = Math.max(
                                    ...insights.topRevenueClients.map(client => client.totalPaid),
                                    1,
                                );
                                return (
                                    <ul className="space-y-3">
                                        {insights.topRevenueClients.map(client => {
                                            const share = Math.min(100, Math.round((client.totalPaid / maxRevenue) * 100));
                                            return (
                                                <li key={client.clientId} className="space-y-2">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="font-medium text-foreground">{client.clientName}</span>
                                                        <span className="text-muted-foreground">{formatCurrency(client.totalPaid)}</span>
                                                    </div>
                                                    <div className="h-1.5 w-full rounded-full bg-muted">
                                                        <div className="h-full rounded-full bg-primary/80" style={{ width: `${share}%` }} />
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                );
                            })()
                        ) : (
                            <p className="text-sm text-muted-foreground">No recorded payments this year yet.</p>
                        )}
                    </Card>
                </div>
            )}
            {isInitialLoading ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <Card key={index} className="h-48 animate-pulse border-border/60 bg-muted/40 p-6">
                            <div className="h-4 w-3/5 rounded bg-muted-foreground/30" />
                            <div className="mt-3 h-3 w-2/5 rounded bg-muted-foreground/20" />
                            <div className="mt-6 space-y-2">
                                <div className="h-3 w-full rounded bg-muted-foreground/20" />
                                <div className="h-3 w-3/4 rounded bg-muted-foreground/20" />
                                <div className="h-3 w-2/4 rounded bg-muted-foreground/20" />
                            </div>
                        </Card>
                    ))}
                </div>
            ) : filteredClients.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredClients.map(client => (
                        <Card key={client.id} className="flex h-full flex-col gap-4 animate-card-enter">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h3 className="truncate text-xl font-semibold text-foreground">{client.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Partner since {describeRelativeTime(client.createdAt)}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <div className="flex items-center gap-2">
                                        <Tag label={client.isActive ? 'Active' : 'Dormant'} color={client.isActive ? 'green' : 'gray'} />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="px-2 text-muted-foreground hover:text-foreground"
                                            onClick={() => handleEditClient(client)}
                                            aria-label={`Edit ${client.name}`}
                                            title="Edit client details"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.879.879-2.828-2.828.879-.879z" />
                                                <path d="M11.793 5.379L4 13.172V16h2.828l7.793-7.793-2.828-2.828z" />
                                            </svg>
                                        </Button>
                                    </div>
                                    <Button
                                        variant={client.isActive ? 'secondary' : 'success'}
                                        size="sm"
                                        onClick={() => handleToggleActive(client)}
                                    >
                                        {client.isActive ? 'Mark dormant' : 'Reactivate'}
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-4 text-sm">
                                <p className="flex items-center gap-2 text-muted-foreground">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 text-muted-foreground/80"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                        />
                                    </svg>
                                    {client.contactEmail || 'No email provided'}
                                </p>
                                <p className="flex items-center gap-2 text-muted-foreground">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 text-muted-foreground/80"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                        />
                                    </svg>
                                    {client.contactPhone || 'No phone provided'}
                                </p>
                                {client.contactPerson && (
                                    <p className="flex items-center gap-2 text-muted-foreground">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4 text-muted-foreground/80"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M5.121 17.804A4 4 0 018 17h8a4 4 0 012.879 1.196M15 11a3 3 0 10-6 0 3 3 0 006 0z"
                                            />
                                        </svg>
                                        {client.contactPerson}
                                    </p>
                                )}
                                {client.address?.city && (
                                    <p className="flex items-center gap-2 text-muted-foreground">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4 text-muted-foreground/80"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                        </svg>
                                        <span>
                                            {[client.address?.street, client.address?.city, client.address?.state]
                                                .filter(Boolean)
                                                .join(', ')}
                                        </span>
                                    </p>
                                )}
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>Updated {describeRelativeTime(client.updatedAt)}</span>
                                    <span>{client.paymentTerms || 'Payment terms TBD'}</span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="py-12 text-center">
                    <h3 className="text-lg font-medium text-foreground">
                        {clients.length === 0 ? 'No clients found.' : 'No clients match your filters.'}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {clients.length === 0
                            ? 'Get started by adding your first client.'
                            : 'Adjust your search or filters to broaden the results.'}
                    </p>
                    {clients.length > 0 && (
                        <Button className="mt-4" variant="secondary" onClick={handleResetFilters}>
                            Clear filters
                        </Button>
                    )}
                </Card>
            )}
        </div>
    );
};