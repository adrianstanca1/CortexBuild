import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { differenceInCalendarDays, format } from 'date-fns';
import { api } from '../services/mockApi';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { InvoiceStatusBadge } from './ui/StatusBadge';
import { Tag } from './ui/Tag';
import { ViewHeader } from './layout/ViewHeader';
import { Client, Invoice, InvoiceStatus, Project, User } from '../types';
import { getDerivedStatus, getInvoiceFinancials } from '../utils/finance';

type StatusFilter = 'ALL' | InvoiceStatus;

type SummaryTone = 'default' | 'warning' | 'success' | 'danger';

type PaymentMethod = 'BANK_TRANSFER' | 'CREDIT_CARD' | 'CASH' | 'CHECK';

const STATUS_FILTERS: Array<{ id: StatusFilter; label: string }> = [
  { id: 'ALL', label: 'All' },
  { id: InvoiceStatus.DRAFT, label: 'Draft' },
  { id: InvoiceStatus.SENT, label: 'Sent' },
  { id: InvoiceStatus.OVERDUE, label: 'Overdue' },
  { id: InvoiceStatus.PAID, label: 'Paid' },
  { id: InvoiceStatus.CANCELLED, label: 'Cancelled' },
];

const STATUS_ORDER: Record<InvoiceStatus, number> = {
  [InvoiceStatus.OVERDUE]: 0,
  [InvoiceStatus.SENT]: 1,
  [InvoiceStatus.DRAFT]: 2,
  [InvoiceStatus.PAID]: 3,
  [InvoiceStatus.CANCELLED]: 4,
};

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount || 0);

const formatDate = (value?: string): string => {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return format(parsed, 'd MMM yyyy');
const getDueDate = (invoice: Invoice): string | undefined => invoice.dueAt || invoice.dueDate;

const getIssuedDate = (invoice: Invoice): string | undefined => invoice.issuedAt || invoice.issueDate;

const getDateValue = (value?: string): number | null => {
  if (!value) return null;
  const parsed = new Date(value);
  const timestamp = parsed.getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
const getDueDateValue = (invoice: Invoice): number | null => getDateValue(getDueDate(invoice));

const getIssuedDateValue = (invoice: Invoice): number | null => getDateValue(getIssuedDate(invoice));

const getAgingInfo = (invoice: Invoice) => {
  const dueValue = getDueDateValue(invoice);
  if (dueValue === null) {
    return { label: 'No due date', color: 'gray' as const };
  }

  const diff = differenceInCalendarDays(new Date(dueValue), new Date());

  if (diff > 0) {
    if (diff <= 3) {
      return { label: `${diff} day${diff === 1 ? '' : 's'} remaining`, color: 'yellow' as const };
    }
    return { label: `${diff} day${diff === 1 ? '' : 's'} remaining`, color: 'green' as const };
  }

  if (diff === 0) {
    return { label: 'Due today', color: 'yellow' as const };
  }

  return { label: `${Math.abs(diff)} day${Math.abs(diff) === 1 ? '' : 's'} overdue`, color: 'red' as const };
const SummaryCard: React.FC<{ title: string; value: string; helper?: string; tone?: SummaryTone }> = ({
  title,
  value,
  helper,
  tone = 'default',
}) => {
  const toneBar: Record<SummaryTone, string> = {
    default: 'bg-primary/30',
    warning: 'bg-yellow-400/80',
    success: 'bg-green-500/80',
    danger: 'bg-red-500/80',
  };

  return (
    <Card className="relative overflow-hidden">
      <span className={`absolute inset-x-0 top-0 h-1 ${toneBar[tone]}`} aria-hidden="true" />
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="mt-3 text-3xl font-bold tracking-tight">{value}</p>
      {helper && <p className="mt-2 text-xs text-muted-foreground">{helper}</p>}
    </Card>
  );
interface InvoicesViewProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({ user, addToast }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(
    async (showLoader = false) => {
      const controller = new AbortController();
      abortControllerRef.current?.abort();
      abortControllerRef.current = controller;

      if (showLoader) setLoading(true);

      if (!user.companyId) {
        if (controller.signal.aborted) return null;
        setInvoices([]);
        if (controller.signal.aborted) return null;
        setProjects([]);
        if (controller.signal.aborted) return null;
        setClients([]);
        if (showLoader && !controller.signal.aborted) setLoading(false);
        return null;
      }

      try {
        const [invoiceData, projectData, clientData] = await Promise.all([
          api.getInvoicesByCompany(user.companyId, { signal: controller.signal }),
          api.getProjectsByCompany(user.companyId, { signal: controller.signal }),
          api.getClientsByCompany(user.companyId, { signal: controller.signal }),
        ]);

        if (controller.signal.aborted) return null;
        setInvoices(invoiceData);
        if (controller.signal.aborted) return null;
        setProjects(projectData);
        if (controller.signal.aborted) return null;
        setClients(clientData);
        return { invoiceData, projectData, clientData };
      } catch (error) {
        console.error('Failed to load invoices', error);
        if (!controller.signal.aborted) {
          addToast('Failed to load invoices.', 'error');
        }
        return null;
      } finally {
        if (showLoader && !controller.signal.aborted) setLoading(false);
      }
    },
    [user.companyId, addToast],
  );

  useEffect(() => {
    fetchData(true);
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [fetchData]);

  useEffect(() => {
    if (selectedInvoiceId && !invoices.some((invoice) => invoice.id === selectedInvoiceId)) {
      setSelectedInvoiceId(null);
    }
  }, [selectedInvoiceId, invoices]);

  const projectMap = useMemo(
    () => new Map(projects.map((project) => [project.id, project.name])),
    [projects],
  );

  const clientMap = useMemo(
    () => new Map(clients.map((client) => [client.id, client.name])),
    [clients],
  );

  const selectedInvoice = useMemo(
    () => (selectedInvoiceId ? invoices.find((invoice) => invoice.id === selectedInvoiceId) ?? null : null),
    [invoices, selectedInvoiceId],
  );

  useEffect(() => {
    if (!selectedInvoice) {
      setPaymentAmount('');
      return;
    }
    const { balance } = getInvoiceFinancials(selectedInvoice);
    setPaymentAmount(balance > 0 ? balance.toFixed(2) : '');
    setPaymentMethod('BANK_TRANSFER');
  }, [selectedInvoice]);

  const summary = useMemo(() => {
    let outstanding = 0;
    let overdue = 0;
    let draft = 0;
    let paidLast30 = 0;
    let totalBilled = 0;
    let totalCollected = 0;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    invoices.forEach((invoice) => {
      const { total, amountPaid, balance, payments } = getInvoiceFinancials(invoice);
      totalBilled += total;
      totalCollected += amountPaid;

      if (invoice.status === InvoiceStatus.DRAFT) {
        draft += 1;
      }

      if (invoice.status !== InvoiceStatus.CANCELLED && balance > 0) {
        outstanding += balance;
      }

      if (getDerivedStatus(invoice) === InvoiceStatus.OVERDUE) {
        overdue += balance;
      }

      (payments || []).forEach((payment) => {
        const paymentDate = new Date(payment.date);
        if (!Number.isNaN(paymentDate.getTime()) && paymentDate >= thirtyDaysAgo) {
          paidLast30 += payment.amount;
        }
      });
    });

    const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

    return { outstanding, overdue, draft, paidLast30, collectionRate };
  }, [invoices]);

  const statusCounts = useMemo(() => {
    const counts: Record<StatusFilter, number> = {
      ALL: invoices.length,
      [InvoiceStatus.DRAFT]: 0,
      [InvoiceStatus.SENT]: 0,
      [InvoiceStatus.OVERDUE]: 0,
      [InvoiceStatus.PAID]: 0,
      [InvoiceStatus.CANCELLED]: 0,
    };

    invoices.forEach((invoice) => {
      const derived = getDerivedStatus(invoice);
      counts[derived] = (counts[derived] ?? 0) + 1;
    });

    counts.ALL = invoices.length;

    return counts;
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return invoices
      .filter((invoice) => (statusFilter === 'ALL' ? true : getDerivedStatus(invoice) === statusFilter))
      .filter((invoice) => {
        if (!term) return true;
        const projectName = projectMap.get(invoice.projectId) ?? '';
        const clientName = clientMap.get(invoice.clientId) ?? '';

        return (
          invoice.invoiceNumber.toLowerCase().includes(term) ||
          projectName.toLowerCase().includes(term) ||
          clientName.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => {
        const statusDiff = STATUS_ORDER[getDerivedStatus(a)] - STATUS_ORDER[getDerivedStatus(b)];
        if (statusDiff !== 0) return statusDiff;

        const dueA = getDueDateValue(a) ?? Number.MAX_SAFE_INTEGER;
        const dueB = getDueDateValue(b) ?? Number.MAX_SAFE_INTEGER;
        if (dueA !== dueB) return dueA - dueB;

        const issuedA = getIssuedDateValue(a) ?? 0;
        const issuedB = getIssuedDateValue(b) ?? 0;
        return issuedB - issuedA;
      });
  }, [invoices, statusFilter, searchTerm, projectMap, clientMap]);

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
  };

  const handleUpdateStatus = async (status: InvoiceStatus) => {
    if (!selectedInvoice) return;

    if (status === InvoiceStatus.CANCELLED) {
      const confirmCancel = window.confirm(
        'Are you sure you want to cancel this invoice? This action cannot be undone.',
      );
      if (!confirmCancel) {
        return;
      }
    }

    setIsUpdatingStatus(true);
    try {
      await api.updateInvoice(selectedInvoice.id, { ...selectedInvoice, status }, user.id);
      addToast(`Invoice marked as ${status.toLowerCase()}.`, 'success');
      await fetchData();
    } catch (error) {
      console.error('Failed to update invoice status', error);
      addToast('Failed to update invoice status.', 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleRecordPayment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedInvoice) return;

    const amount = Number(paymentAmount);
    if (!amount || amount <= 0) {
      addToast('Enter a valid payment amount.', 'error');
      return;
    }

    const { balance } = getInvoiceFinancials(selectedInvoice);
    if (amount > balance) {
      addToast('Amount exceeds outstanding balance.', 'error');
      return;
    }

    setIsRecordingPayment(true);
    try {
      await api.recordPaymentForInvoice(selectedInvoice.id, { amount, method: paymentMethod }, user.id);
      addToast('Payment recorded.', 'success');
      await fetchData();
    } catch (error) {
      console.error('Failed to record payment', error);
      addToast('Failed to record payment.', 'error');
    } finally {
      setIsRecordingPayment(false);
    }
  };

  const selectedInvoiceStatus = selectedInvoice ? getDerivedStatus(selectedInvoice) : null;
  const selectedInvoiceFinancials = selectedInvoice ? getInvoiceFinancials(selectedInvoice) : null;
  const selectedAging = selectedInvoice ? getAgingInfo(selectedInvoice) : null;
  const collectionIndicator = summary.collectionRate >= 90 ? 'positive' : summary.collectionRate >= 75 ? 'warning' : 'negative';

  return (
    <div className="relative space-y-6">
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50" onClick={() => setSelectedInvoiceId(null)} aria-hidden="true" />
          <div className="relative h-full w-full max-w-xl overflow-y-auto border-l border-border bg-background p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Invoice {selectedInvoice.invoiceNumber}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {clientMap.get(selectedInvoice.clientId) || 'Client unavailable'} ·{' '}
                  {projectMap.get(selectedInvoice.projectId) || 'Project unavailable'}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>Issued {formatDate(getIssuedDate(selectedInvoice))}</span>
                  <span className="h-1 w-1 rounded-full bg-border" />
                  <span>Due {formatDate(getDueDate(selectedInvoice))}</span>
                  {selectedAging && <Tag label={selectedAging.label} color={selectedAging.color} />}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedInvoiceStatus && <InvoiceStatusBadge status={selectedInvoiceStatus} />}
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceId(null)}
                  className="rounded-full p-2 text-muted-foreground hover:bg-muted"
                  aria-label="Close details"
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
            </div>

            {selectedInvoiceFinancials && (
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-border bg-muted/40 p-4">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="mt-1 text-lg font-semibold">{formatCurrency(selectedInvoiceFinancials.total)}</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/40 p-4">
                  <p className="text-xs text-muted-foreground">Paid</p>
                  <p className="mt-1 text-lg font-semibold text-green-600">
                    {formatCurrency(selectedInvoiceFinancials.amountPaid)}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/40 p-4">
                  <p className="text-xs text-muted-foreground">Balance due</p>
                  <p className="mt-1 text-lg font-semibold text-red-600">
                    {formatCurrency(selectedInvoiceFinancials.balance)}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-8 space-y-6">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Line items</h3>
                <div className="mt-3 overflow-hidden rounded-lg border border-border">
                  {(selectedInvoice.lineItems || []).length > 0 ? (
                    <table className="min-w-full text-sm">
                      <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium">Description</th>
                          <th className="px-4 py-2 text-right font-medium">Quantity</th>
                          <th className="px-4 py-2 text-right font-medium">Unit price</th>
                          <th className="px-4 py-2 text-right font-medium">Line total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border bg-card">
                        {selectedInvoice.lineItems.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-2">{item.description}</td>
                            <td className="px-4 py-2 text-right">{item.quantity}</td>
                            <td className="px-4 py-2 text-right">{formatCurrency(item.unitPrice ?? item.rate)}</td>
                            <td className="px-4 py-2 text-right">
                              {formatCurrency((Number(item.quantity) || 0) * (Number(item.unitPrice ?? item.rate) || 0))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="px-4 py-6 text-sm text-muted-foreground">No line items recorded for this invoice.</p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Payment history</h3>
                  {selectedInvoiceFinancials &&
                    selectedInvoiceFinancials.balance > 0 &&
                    selectedInvoiceStatus !== InvoiceStatus.CANCELLED && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          setPaymentAmount(selectedInvoiceFinancials.balance.toFixed(2))
                        }
                      >
                        Fill balance
                      </Button>
                    )}
                </div>
                <div className="mt-3 space-y-3">
                  {selectedInvoiceFinancials && selectedInvoiceFinancials.payments.length > 0 ? (
                    selectedInvoiceFinancials.payments
                      .slice()
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((payment) => (
                        <div
                          key={payment.id}
                          className="rounded-lg border border-border bg-card px-4 py-3 text-sm shadow-sm"
                        >
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{formatCurrency(payment.amount)}</p>
                            <span className="text-xs text-muted-foreground">{formatDate(payment.date)}</span>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground capitalize">
                            {payment.method.replace('_', ' ').toLowerCase()}
                            {payment.reference ? ` · Ref ${payment.reference}` : ''}
                          </p>
                        </div>
                      ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
                  )}
                </div>

                {selectedInvoiceFinancials &&
                  selectedInvoiceFinancials.balance > 0 &&
                  selectedInvoiceStatus !== InvoiceStatus.CANCELLED && (
                    <form onSubmit={handleRecordPayment} className="mt-4 space-y-3 rounded-lg border border-dashed border-border p-4">
                      <p className="text-sm font-medium">Record a payment</p>
                      <div className="grid gap-3 sm:grid-cols-[1fr,180px]">
                        <label className="text-sm">
                          <span className="text-xs text-muted-foreground">Amount</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={paymentAmount}
                            onChange={(event) => setPaymentAmount(event.target.value)}
                            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                            placeholder="0.00"
                          />
                        </label>
                        <label className="text-sm">
                          <span className="text-xs text-muted-foreground">Method</span>
                          <select
                            value={paymentMethod}
                            onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
                            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                          >
                            <option value="BANK_TRANSFER">Bank transfer</option>
                            <option value="CREDIT_CARD">Card</option>
                            <option value="CASH">Cash</option>
                            <option value="CHECK">Cheque</option>
                          </select>
                        </label>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setPaymentAmount(selectedInvoiceFinancials.balance.toFixed(2))}
                        >
                          Use balance
                        </Button>
                        <Button type="submit" size="sm" isLoading={isRecordingPayment}>
                          Record payment
                        </Button>
                      </div>
                    </form>
                  )}
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedInvoiceStatus === InvoiceStatus.DRAFT && (
                  <Button
                    variant="success"
                    size="sm"
                    isLoading={isUpdatingStatus}
                    onClick={() => handleUpdateStatus(InvoiceStatus.SENT)}
                  >
                    Mark as sent
                  </Button>
                )}
                {selectedInvoiceStatus &&
                  [InvoiceStatus.SENT, InvoiceStatus.OVERDUE].includes(selectedInvoiceStatus) && (
                    <Button
                      variant="danger"
                      size="sm"
                      isLoading={isUpdatingStatus}
                      onClick={() => handleUpdateStatus(InvoiceStatus.CANCELLED)}
                    >
                      Cancel invoice
                    </Button>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}

      <ViewHeader
        view="invoices"
        actions={
          <Button
            variant="secondary"
            onClick={() =>
              addToast('Invoice creation is available from the Financials workspace.', 'success')
            }
          >
            New invoice
          </Button>
        }
        meta={[
          {
            label: 'Outstanding balance',
            value: formatCurrency(summary.outstanding),
            helper: summary.outstanding > 0 ? 'Across open invoices' : 'All invoices settled',
            indicator: summary.outstanding > 0 ? 'warning' : 'positive',
          },
          {
            label: 'Overdue exposure',
            value: formatCurrency(summary.overdue),
            helper: summary.overdue > 0 ? 'Requires follow up' : 'No overdue balances',
            indicator: summary.overdue > 0 ? 'negative' : 'positive',
          },
          {
            label: 'Collection rate',
            value: `${summary.collectionRate}%`,
            helper: 'Paid in the last 30 days',
            indicator: collectionIndicator,
          },
        ]}
      />

      {loading ? (
        <Card>Loading invoices...</Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Outstanding balance"
              value={formatCurrency(summary.outstanding)}
              helper={
                summary.outstanding > 0
                  ? 'Outstanding balance across sent invoices.'
                  : 'All invoices have been settled.'
              }
              tone={summary.outstanding > 0 ? 'warning' : 'success'}
            />
            <SummaryCard
              title="Overdue invoices"
              value={formatCurrency(summary.overdue)}
              helper={
                statusCounts[InvoiceStatus.OVERDUE] > 0
                  ? `${statusCounts[InvoiceStatus.OVERDUE]} invoice${
                      statusCounts[InvoiceStatus.OVERDUE] === 1 ? '' : 's'
                    } require attention.`
                  : 'No invoices are overdue right now.'
              }
              tone={summary.overdue > 0 ? 'danger' : 'success'}
            />
            <SummaryCard
              title="Draft invoices"
              value={`${summary.draft}`}
              helper="Prepare and send these invoices to start the billing cycle."
              tone={summary.draft > 0 ? 'warning' : 'default'}
            />
            <SummaryCard
              title="Collection rate"
              value={`${summary.collectionRate}%`}
              helper={
                summary.collectionRate >= 90
                  ? 'Collections are on track.'
                  : 'Aim for at least 90% to maintain healthy cash flow.'
              }
              tone={
                summary.collectionRate >= 90
                  ? 'success'
                  : summary.collectionRate >= 60
                  ? 'warning'
                  : 'danger'
              }
            />
          </div>

          <Card>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                {STATUS_FILTERS.map((filter) => {
                  const isActive = statusFilter === filter.id;
                  return (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setStatusFilter(filter.id)}
                      className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition-colors ${
                        isActive
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <span>{filter.label}</span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                        {statusCounts[filter.id] ?? 0}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search by invoice, client, or project"
                    className="w-full rounded-full border border-border bg-background py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  disabled={statusFilter === 'ALL' && searchTerm.trim().length === 0}
                >
                  Reset filters
                </Button>
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-lg border border-border">
              {filteredInvoices.length > 0 ? (
                <table className="min-w-full divide-y divide-border text-sm">
                  <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Invoice</th>
                      <th className="px-4 py-3 text-left font-medium">Client & project</th>
                      <th className="px-4 py-3 text-left font-medium">Due</th>
                      <th className="px-4 py-3 text-right font-medium">Total</th>
                      <th className="px-4 py-3 text-right font-medium">Balance</th>
                      <th className="px-4 py-3 text-right font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card">
                    {filteredInvoices.map((invoice) => {
                      const derivedStatus = getDerivedStatus(invoice);
                      const financials = getInvoiceFinancials(invoice);
                      const aging = getAgingInfo(invoice);

                      return (
                        <tr
                          key={invoice.id}
                          onClick={() => setSelectedInvoiceId(invoice.id)}
                          className="cursor-pointer transition-colors hover:bg-muted/60"
                        >
                          <td className="px-4 py-4 align-top">
                            <div className="flex items-center gap-2 font-semibold">
                              {invoice.invoiceNumber}
                              {derivedStatus === InvoiceStatus.OVERDUE && (
                                <span className="h-2 w-2 rounded-full bg-red-500"></span>
                              )}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Issued {formatDate(getIssuedDate(invoice))}
                            </p>
                          </td>
                          <td className="px-4 py-4 align-top">
                            <p className="font-medium">
                              {clientMap.get(invoice.clientId) || 'Client unavailable'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {projectMap.get(invoice.projectId) || 'Project unavailable'}
                            </p>
                          </td>
                          <td className="px-4 py-4 align-top">
                            <div className="font-medium">{formatDate(getDueDate(invoice))}</div>
                            {aging && <Tag label={aging.label} color={aging.color} className="mt-1" />}
                          </td>
                          <td className="px-4 py-4 text-right align-top">
                            <div className="font-semibold">{formatCurrency(financials.total)}</div>
                            <p className="text-xs text-muted-foreground">
                              Paid {formatCurrency(financials.amountPaid)}
                            </p>
                          </td>
                          <td className="px-4 py-4 text-right align-top font-semibold">
                            {formatCurrency(financials.balance)}
                          </td>
                          <td className="px-4 py-4 text-right align-top">
                            <InvoiceStatusBadge status={derivedStatus} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-sm text-muted-foreground">
                  <p>No invoices match your current filters.</p>
                  <Button variant="secondary" size="sm" onClick={resetFilters}>
                    Clear filters
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {!loading && invoices.length === 0 && (
            <Card className="text-center">
              <h3 className="text-lg font-semibold">No invoices yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Start tracking project billing by creating your first invoice in the Financials workspace.
              </p>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
