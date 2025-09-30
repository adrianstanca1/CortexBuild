import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  User,
  FinancialKPIs,
  MonthlyFinancials,
  CostBreakdown,
  Invoice,
  Quote,
  Client,
  Project,
  Permission,
  Expense,
  InvoiceStatus,
  QuoteStatus,
  InvoiceLineItem,
  InvoiceLineItemDraft,

} from '../types';
import { getDerivedStatus, getInvoiceFinancials } from '../utils/finance';
import { api } from '../services/mockApi';
import { generateFinancialForecast } from '../services/ai';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { InvoiceStatusBadge, QuoteStatusBadge } from './ui/StatusBadge';
import { BarChart } from './ui/BarChart';
import './ui/barChartBar.css';
import { hasPermission } from '../services/auth';
import { Tag } from './ui/Tag';
import { ExpenseModal } from './ExpenseModal';
import ClientModal from './financials/ClientModal';
import InvoiceModal from './financials/InvoiceModal';
import PaymentModal from './financials/PaymentModal';
import { formatCurrency } from '../utils/finance';

type FinancialsTab = 'dashboard' | 'invoices' | 'expenses' | 'clients';




export const FinancialsView: React.FC<{ user: User; addToast: (message: string, type: 'success' | 'error') => void }> = ({
  user,
  addToast,
}) => {
  const [activeTab, setActiveTab] = useState<FinancialsTab>('dashboard');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    kpis: null as FinancialKPIs | null,
    monthly: [] as MonthlyFinancials[],
    costs: [] as CostBreakdown[],
    invoices: [] as Invoice[],
    quotes: [] as Quote[],
    expenses: [] as Expense[],
    clients: [] as Client[],
    projects: [] as Project[],
    users: [] as User[],
    forecasts: [] as FinancialForecast[],
  });
  const [modal, setModal] = useState<'client' | 'invoice' | 'payment' | 'expense' | null>(null);
  const [selectedItem, setSelectedItem] = useState<Client | Invoice | Expense | null>(null);
  const [isGeneratingForecast, setIsGeneratingForecast] = useState(false);
  const [forecastError, setForecastError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const canManageFinances = hasPermission(user, Permission.MANAGE_FINANCES);

  const fetchData = useCallback(async () => {
    const controller = new AbortController();
    abortControllerRef.current?.abort();
    abortControllerRef.current = controller;

    if (!user.companyId) return;
    setLoading(true);
    try {
      const [
        kpiData,
        monthlyData,
        costsData,
        invoiceData,
        quoteData,
        expenseData,
        clientData,
        projectData,
        usersData,
        forecastData,
        companyData,

        forecastsData,
      ] = await Promise.all([
        api.getFinancialKPIsForCompany(user.companyId, { signal: controller.signal }),
        api.getMonthlyFinancials(user.companyId, { signal: controller.signal }),
        api.getCostBreakdown(user.companyId, { signal: controller.signal }),
        api.getInvoicesByCompany(user.companyId, { signal: controller.signal }),
        api.getQuotesByCompany(user.companyId, { signal: controller.signal }),
        api.getExpensesByCompany(user.companyId, { signal: controller.signal }),
        api.getClientsByCompany(user.companyId, { signal: controller.signal }),
        api.getProjectsByCompany(user.companyId, { signal: controller.signal }),
        api.getUsersByCompany(user.companyId, { signal: controller.signal }),
        api.getFinancialForecasts(user.companyId, { signal: controller.signal }),
        api.getCompanies({ signal: controller.signal }),
      ]);
      if (controller.signal.aborted) return;
      const companyRecord = companyData.find((company: { id?: string }) => company.id === user.companyId) as
        | { name?: string }
        | undefined;

      if (controller.signal.aborted) return;

      setData({
        kpis: kpiData,
        monthly: monthlyData,
        costs: costsData,
        invoices: invoiceData,
        quotes: quoteData,
        expenses: expenseData,
        clients: clientData,
        projects: projectData,
        users: usersData,
        forecasts: forecastData,
      });
    } catch (error) {
      if (controller.signal.aborted) return;
      addToast('Failed to load financial data', 'error');
    } finally {
      if (controller.signal.aborted) return;
      setLoading(false);
    }
  }, [user.companyId, addToast]);

  useEffect(() => {
    fetchData();
    return () => {
      abortControllerRef.current?.abort();
    };
<<<<<<< Updated upstream
  }, [fetchData]);

  const { projectMap, clientMap, userMap } = useMemo(
    () => ({
      projectMap: new Map(data.projects.map(p => [p.id, p.name])),
      clientMap: new Map(data.clients.map(c => [c.id, c.name])),
      userMap: new Map(data.users.map(u => [u.id, `${u.firstName} ${u.lastName}`])),
    }),
    [data.projects, data.clients, data.users],
  );

  const handleLineItemChange = <Field extends EditableInvoiceLineItemField>(
    index: number,
    field: Field,
    value: InvoiceLineItemDraft[Field],
  ) => {
    setLineItems(prevItems => prevItems.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)));
  };

  const addLineItem = () => setLineItems(prevItems => [...prevItems, createLineItemDraft()]);
  const removeLineItem = (index: number) =>
    setLineItems(prevItems => prevItems.filter((_, itemIndex) => itemIndex !== index));

  const { subtotal, taxAmount, retentionAmount, total } = useMemo(() => {
    const subtotalCalc = lineItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
    const taxPercentage = typeof taxRate === 'number' ? taxRate : 0;
    const retentionPercentage = typeof retentionRate === 'number' ? retentionRate : 0;
    const taxAmountCalc = subtotalCalc * (taxPercentage / 100);
    const retentionAmountCalc = subtotalCalc * (retentionPercentage / 100);
    const totalCalc = subtotalCalc + taxAmountCalc - retentionAmountCalc;
    return { subtotal: subtotalCalc, taxAmount: taxAmountCalc, retentionAmount: retentionAmountCalc, total: totalCalc };
  }, [lineItems, taxRate, retentionRate]);

  const amountPaid = invoiceToEdit?.amountPaid || 0;
  const balance = total - amountPaid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const finalLineItems = lineItems.reduce<InvoiceLineItem[]>((acc, item) => {
        const description = item.description.trim();
        const quantity = Math.max(item.quantity, 0);
        const unitPrice = Math.max(item.unitPrice, 0);

        if (!description || quantity <= 0 || unitPrice <= 0) {
          return acc;
        }

        acc.push({
          id: item.id.startsWith('new-') ? String(Date.now() + Math.random()) : item.id,
          description,
          quantity,
          unitPrice,
          rate: unitPrice,
          amount: quantity * unitPrice,
        });

        return acc;
      }, []);

      const invoiceData = {
        clientId,
        projectId,
        issuedAt: new Date(issuedAt).toISOString(),
        dueAt: new Date(dueAt).toISOString(),
        lineItems: finalLineItems,
        taxRate: Number(taxRate) / 100,
        retentionRate: Number(retentionRate) / 100,
        notes,
        subtotal,
        taxAmount,
        retentionAmount,
        total,
        amountPaid,
        balance,
        payments: invoiceToEdit?.payments || [],
        status: invoiceToEdit?.status || InvoiceStatus.DRAFT,
      };

      if (invoiceToEdit) {
        const updated = await api.updateInvoice(
          invoiceToEdit.id,
          { ...invoiceData, invoiceNumber: invoiceToEdit.invoiceNumber },
          user.id,
        );
        addToast(`Invoice ${updated.invoiceNumber} updated.`, 'success');
      } else {
        const created = await api.createInvoice(invoiceData, user.id);
        if (!created.invoiceNumber) {
          throw new Error('Invoice number was not returned by the server.');
        }
        addToast(`Invoice ${created.invoiceNumber} created as draft.`, 'success');
      }
      onSuccess();
      onClose();
    } catch (error) {
      const message = error instanceof Error && error.message ? error.message : 'Failed to save invoice.';
      addToast(message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold mb-4">
          {invoiceToEdit ? `${isReadOnly ? 'View' : 'Edit'} Invoice ${invoiceToEdit.invoiceNumber}` : 'Create Invoice'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-2 flex-grow">
          <div className="grid grid-cols-2 gap-4">
            <select
              value={clientId}
              onChange={e => setClientId(e.target.value)}
              className="w-full p-2 border rounded bg-white dark:bg-slate-800"
              required
              disabled={isReadOnly}
            >
              <option value="">Select Client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            <select
              value={projectId}
              onChange={e => setProjectId(e.target.value)}
              className="w-full p-2 border rounded bg-white dark:bg-slate-800"
              required
              disabled={isReadOnly}
            >
              <option value="">Select Project</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <div>
              <label className="text-xs">Issued Date</label>
              <input
                type="date"
                value={issuedAt}
                onChange={e => setIssuedAt(e.target.value)}
                className="w-full p-2 border rounded"
                disabled={isReadOnly}
              />
            </div>
            <div>
              <label className="text-xs">Due Date</label>
              <input
                type="date"
                value={dueAt}
                onChange={e => setDueAt(e.target.value)}
                className="w-full p-2 border rounded"
                disabled={isReadOnly}
              />
            </div>
          </div>
          <div className="border-t pt-2">
            <h4 className="font-semibold">Line Items</h4>
            <div className="grid grid-cols-[1fr,90px,130px,130px,40px] gap-2 items-center mt-1 text-xs text-muted-foreground">
              <span>Description</span>
              <span className="text-right">Quantity</span>
              <span className="text-right">Unit Price</span>
              <span className="text-right">Amount</span>
            </div>
            {lineItems.map((item, index) => (
              <div key={item.id} className="grid grid-cols-[1fr,90px,130px,130px,40px] gap-2 items-center mt-2">
                <input
                  type="text"
                  value={item.description}
                  onChange={e => handleLineItemChange(index, 'description', e.target.value)}
                  placeholder="Item or service description"
                  className="p-1 border rounded"
                  disabled={isReadOnly}
                />
                <input
                  type="number"
                  value={item.quantity}
                  onChange={e => handleLineItemChange(index, 'quantity', parseNumberInputValue(e.target.value))}
                  placeholder="1"
                  className="p-1 border rounded text-right"
                  disabled={isReadOnly}
                />
                <input
                  type="number"
                  value={item.unitPrice}
                  onChange={e => handleLineItemChange(index, 'unitPrice', parseNumberInputValue(e.target.value))}
                  placeholder="0.00"
                  className="p-1 border rounded text-right"
                  disabled={isReadOnly}
                />
                <span className="p-1 text-right font-medium">{formatCurrency(item.quantity * item.unitPrice)}</span>
                {!isReadOnly && (
                  <Button type="button" variant="danger" size="sm" onClick={() => removeLineItem(index)}>
                    &times;
                  </Button>
                )}
              </div>
            ))}
            {!isReadOnly && (
              <Button type="button" variant="secondary" size="sm" className="mt-2" onClick={addLineItem}>
                + Add Item
              </Button>
            )}
          </div>
          <div className="border-t pt-4 grid grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold mb-2">Notes</h4>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Payment details, terms and conditions..."
                rows={6}
                className="p-2 border rounded w-full"
                disabled={isReadOnly}
              />
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold mb-2">Totals</h4>
              <div className="flex justify-between items-center">
                <span className="text-sm">Subtotal:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <label htmlFor="taxRate" className="text-sm">
                  Tax (%):
                </label>
                <input
                  id="taxRate"
                  type="number"
                  value={taxRate}
                  onChange={e => setTaxRate(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-24 p-1 border rounded text-right"
                  disabled={isReadOnly}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Tax Amount:</span>
                <span>{formatCurrency(taxAmount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <label htmlFor="retentionRate" className="text-sm">
                  Retention (%):
                </label>
                <input
                  id="retentionRate"
                  type="number"
                  value={retentionRate}
                  onChange={e => setRetentionRate(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-24 p-1 border rounded text-right"
                  disabled={isReadOnly}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-red-600">Retention Held:</span>
                <span className="text-red-600 font-medium">-{formatCurrency(retentionAmount)}</span>
              </div>
              <div className="flex justify-between items-center font-bold text-lg pt-2 border-t">
                <span>Total Due:</span>
                <span>{formatCurrency(total)}</span>
              </div>
              {invoiceToEdit && (
                <>
                  <div className="flex justify-between items-center text-sm">
                    <span>Amount Paid:</span>
                    <span>-{formatCurrency(amountPaid)}</span>
                  </div>
                  <div className="flex justify-between items-center font-bold text-lg text-green-600">
                    <span>Balance:</span>
                    <span>{formatCurrency(balance)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </form>
        <div className="flex justify-end gap-2 pt-4 border-t mt-4 flex-shrink-0">
          <Button variant="secondary" onClick={onClose}>
            {isReadOnly ? 'Close' : 'Cancel'}
          </Button>
          {!isReadOnly && (
            <Button type="submit" isLoading={isSaving} onClick={handleSubmit}>
              Save Invoice
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
  const renderInvoicesAndQuotes = () => (
    <div className="space-y-6">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Invoices</h3>
          {canManageFinances && <Button onClick={() => { setSelectedItem(null); setModal('invoice'); }}>Create Invoice</Button>}
        </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted"><tr><th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Number</th><th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Client</th><th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Project</th><th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground uppercase">Total</th><th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground uppercase">Balance Due</th><th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Status</th><th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground uppercase">Actions</th></tr></thead>
                  <tbody className="bg-card divide-y divide-border">
                    {data.invoices.map(invoice => {
                      const { total, balance } = getInvoiceFinancials(invoice);
                      const derivedStatus = getDerivedStatus(invoice, balance);

                      return (
                        <tr key={invoice.id} className="hover:bg-accent">
                          <td className="px-4 py-3 font-medium">{invoice.invoiceNumber}</td>
                          <td className="px-4 py-3">{clientMap.get(invoice.clientId) || 'Client unavailable'}</td>
                          <td className="px-4 py-3">{projectMap.get(invoice.projectId) || 'Project unavailable'}</td>
                          <td className="px-4 py-3 text-right">{formatCurrency(total)}</td>
                          <td className="px-4 py-3 text-right font-semibold">{formatCurrency(balance)}</td>
                          <td className="px-4 py-3"><InvoiceStatusBadge status={derivedStatus} /></td>
                          <td className="px-4 py-3 text-right space-x-2">
                            {canManageFinances && invoice.status === InvoiceStatus.DRAFT && (
                              <>
                                <Button size="sm" variant="success" onClick={() => handleUpdateInvoiceStatus(invoice.id, InvoiceStatus.SENT)}>Send</Button>
                                <Button size="sm" variant="secondary" onClick={() => { setSelectedItem(invoice); setModal('invoice'); }}>Edit</Button>
                              </>
                            )}
                            {canManageFinances && (invoice.status === InvoiceStatus.SENT || derivedStatus === InvoiceStatus.OVERDUE) && (
                              <>
                                <Button size="sm" onClick={() => { setSelectedItem(invoice); setModal('payment'); }}>Record Payment</Button>
                                <Button size="sm" variant="danger" onClick={() => handleUpdateInvoiceStatus(invoice.id, InvoiceStatus.CANCELLED)}>Cancel</Button>
                              </>
                            )}
                            {invoice.status === InvoiceStatus.PAID || invoice.status === InvoiceStatus.CANCELLED ? (
                              <Button size="sm" variant="secondary" onClick={() => { setSelectedItem(invoice); setModal('invoice'); }}>View</Button>
                            ) : null}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
            <Card>
              <h3 className="font-semibold text-lg mb-4">Quotes</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted"><tr><th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Client</th><th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Project</th><th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Status</th></tr></thead>
                  <tbody className="bg-card divide-y divide-border">
                    {data.quotes.map(quote => {
                      const clientName = clientMap.get(quote.clientId);
                      const projectName = projectMap.get(quote.projectId);

                      return (
                        <tr key={quote.id} className="hover:bg-accent">
                          <td className="px-4 py-3">{clientName || 'Client unavailable'}</td>
                          <td className="px-4 py-3">{projectName || 'Project unavailable'}</td>
                          <td className="px-4 py-3"><QuoteStatusBadge status={quote.status} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
          );

          const handleUpdateInvoiceStatus = useCallback(
    async (invoiceId: string, status: InvoiceStatus) => {
      if (status === InvoiceStatus.CANCELLED) {
        if (!window.confirm('Are you sure you want to cancel this invoice? This action cannot be undone.')) {
          return;
        }
      }
          try {
        const invoice = data.invoices.find(i => i.id === invoiceId);
          if (!invoice) throw new Error('Invoice not found');
          await api.updateInvoice(invoiceId, {...invoice, status}, user.id);
          addToast(`Invoice marked as ${status.toLowerCase()}.`, 'success');
          fetchData();
      } catch (error) {
            addToast('Failed to update invoice status.', 'error');
      }
    },
          [data.invoices, user.id, addToast, fetchData],
          );

          const handleGenerateForecast = useCallback(
    async (horizonMonths: number) => {
      if (!user.companyId) {
        return;
      }

<<<<<<< Updated upstream
const sanitizedHorizon = Number.isFinite(horizonMonths)
  ? Math.max(1, Math.round(horizonMonths))
  : 3;

setIsGeneratingForecast(true);
setForecastError(null);

try {
  const forecast = await generateFinancialForecast({
    companyName: user.companyName ?? 'Your company',
    currency: data.kpis?.currency,
    horizonMonths: sanitizedHorizon,
    kpis: data.kpis,
    monthly: data.monthly,
    costs: data.costs,
    invoices: data.invoices,
    expenses: data.expenses,
  });

  const metadataRecord: Record<string, unknown> = { ...forecast.metadata };
  const existingCurrency = metadataRecord['currency'];
  metadataRecord['currency'] =
    typeof existingCurrency === 'string'
      ? existingCurrency
      : data.kpis?.currency ?? 'GBP';
  metadataRecord['horizonMonths'] = sanitizedHorizon;
  metadataRecord['isFallback'] = forecast.isFallback;

  const storedForecast = await api.createFinancialForecast(
    {
      companyId: user.companyId,
      summary: forecast.summary,
      horizonMonths: sanitizedHorizon,
      metadata: metadataRecord,
      model: forecast.model,
    },
    user.id,
  );

  addToast('Financial forecast generated successfully', 'success');
  setForecastData(storedForecast);
                    <h3 className="font-semibold mb-4">Monthly Performance (Profit)</h3>
                    <BarChart data={monthly.map(m => ({ label: m.month, value: m.profit }))} barColor="bg-green-500" />
                </Card >
    <Card>
      <h3 className="font-semibold mb-4">Cost Breakdown</h3>
      <BarChart data={costs.map(c => ({ label: c.category, value: c.amount }))} barColor="bg-sky-500" />
    </Card>
            </div >
        </div >
    );

  const renderInvoicesAndQuotes = () => (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Invoices & Quotes</h3>
        {canManageFinances && <Button title="Create invoice" type="button">Create Invoice</Button>}
      </div>
      <h4 className="font-semibold mt-4">Invoices</h4>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Number</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Client</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Due Date</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Total</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Balance</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {invoices.map(invoice => (
            <tr key={invoice.id}>
              <td className="px-6 py-4 font-medium">{invoice.invoiceNumber}</td>
              <td className="px-6 py-4">{clientMap.get(invoice.clientId)}</td>
              <td className="px-6 py-4">{new Date(invoice.dueAt).toLocaleDateString()}</td>
              <td className="px-6 py-4 text-right">{formatCurrency(invoice.total)}</td>
              <td className="px-6 py-4 text-right font-semibold">{formatCurrency(invoice.total - invoice.amountPaid)}</td>
              <td className="px-6 py-4"><InvoiceStatusBadge status={invoice.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );

  const renderExpenses = () => {
    const myExpenses = expenses.filter(e => e.userId === user.id);
    const reviewQueue = expenses.filter(e => e.status === ExpenseStatus.PENDING);

    return (
      <div className="space-y-6">
        {hasPermission(user, Permission.MANAGE_EXPENSES) && (
          <Card>
            <h3 className="font-semibold text-lg mb-2">Expense Review Queue ({reviewQueue.length})</h3>
            {reviewQueue.map(exp => (
              <div key={exp.id} className="p-2 border-b flex justify-between items-center">
                <div>
                  <p>{userMap.get(exp.userId)} - {formatCurrency(exp.amount, exp.currency)}</p>
                  <p className="text-sm text-slate-500">{exp.description}</p>
                </div>
                <Button title="Review expense" type="button" size="sm" onClick={() => setSelectedExpense(exp)}>Review</Button>
              </div>
            ))}
            {reviewQueue.length === 0 && <p className="text-slate-500 py-4 text-center">No expenses to review.</p>}
          </Card>
        )}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">My Expenses</h3>
            {hasPermission(user, Permission.SUBMIT_EXPENSE) && <Button title="Submit expense" type="button">Submit Expense</Button>}
          </div>
          {myExpenses.map(exp => (
            <div key={exp.id} className="p-2 border-b flex justify-between items-center">
              <div>
                <p>{new Date(exp.submittedAt).toLocaleDateString()} - {formatCurrency(exp.amount, exp.currency)}</p>
                <p className="text-sm text-slate-500">{exp.description}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${exp.status === 'Approved' ? 'bg-green-100 text-green-800' : exp.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{exp.status}</span>
            </div>
          ))}
          {myExpenses.length === 0 && <p className="text-slate-500 py-4 text-center">You have not submitted any expenses.</p>}
        </Card>
      </div>
    );

    setData(prev => ({ ...prev, forecasts: [storedForecast, ...prev.forecasts] }));
    addToast('Financial forecast updated.', 'success');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate financial forecast.';
    setForecastError(message);
    addToast('Failed to generate financial forecast.', 'error');
  } finally {
    setIsGeneratingForecast(false);
  }
},
[
  user.companyId,
  user.id,
  data.companyName,
  data.kpis,
  data.monthly,
  data.costs,
  data.invoices,
  data.expenses,
  addToast,
],
  );

const handleCreateInvoice = useCallback(() => {
  setSelectedItem(null);
  setModal('invoice');
}, []);

const handleOpenInvoice = useCallback((invoice: Invoice) => {
  setSelectedItem(invoice);
  setModal('invoice');
}, []);

const handleRecordPayment = useCallback((invoice: Invoice) => {
  setSelectedItem(invoice);
  setModal('payment');
}, []);

const handleCreateExpense = useCallback(() => {
  setSelectedItem(null);
  setModal('expense');
}, []);

const handleEditExpense = useCallback((expense: Expense) => {
  setSelectedItem(expense);
  setModal('expense');
}, []);

const handleAddClient = useCallback(() => {
  setSelectedItem(null);
  setModal('client');
}, []);

const handleEditClient = useCallback((client: Client) => {
  setSelectedItem(client);
  setModal('client');
}, []);

if (loading) return <Card>Loading financials...</Card>;

const selectedInvoice = modal === 'invoice' || modal === 'payment' ? (selectedItem as Invoice) : null;
const isInvoiceReadOnly =
  !canManageFinances ||
  selectedInvoice?.status === InvoiceStatus.PAID ||
  selectedInvoice?.status === InvoiceStatus.CANCELLED;

return (
  <div className="space-y-6">
    <div className="text-center p-6">
      <h1 className="text-2xl font-bold">Financials</h1>
      <p className="text-muted-foreground">Financial data will be displayed here...</p>
    </div>
  </div>
);



interface DashboardTabProps {
  kpis: FinancialKPIs | null;
  monthly: MonthlyFinancials[];
  costs: CostBreakdown[];
  forecasts: FinancialForecast[];
  onGenerateForecast: (horizon: number) => void;
  isGeneratingForecast: boolean;
  forecastError: string | null;
}

const DashboardTab = React.memo(
  ({
    kpis,
    monthly,
    costs,
    forecasts,
    onGenerateForecast,
    isGeneratingForecast,
    forecastError,
  }: DashboardTabProps) => {
    const [selectedHorizon, setSelectedHorizon] = useState(3);

    const renderSummary = useCallback(
      (summary: string, keyPrefix: string) =>
        summary
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .map((line, index) => (
            <p
              key={`${keyPrefix}-${index}`}
              dangerouslySetInnerHTML={{
                __html: line
                  .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
                  .replace(/^[-•]\s+/, '• '),
              }}
            />
          )),
      [],
    );

    const latestForecast = forecasts[0] ?? null;
    const metadata = (latestForecast?.metadata ?? {}) as Record<string, unknown>;
    const currencyValue = metadata['currency'];
    const currency = typeof currencyValue === 'string' ? currencyValue : kpis?.currency ?? 'GBP';
    const toNumber = (value: unknown): number | undefined =>
      typeof value === 'number' && Number.isFinite(value) ? value : undefined;
    const averageProfit = toNumber(metadata['averageMonthlyProfit']);
    const projectedCash = toNumber(metadata['projectedCash']);
    const profitTrend = toNumber(metadata['profitTrendPct']);
    const openInvoiceBalance = toNumber(metadata['openInvoiceBalance']);
    const burnRate = toNumber(metadata['approvedExpenseRunRate']);
    const tags: { label: string; value: string }[] = [];

    const displayHorizon =
      typeof latestForecast?.horizonMonths === 'number'
        ? latestForecast.horizonMonths
        : toNumber(metadata['horizonMonths']) ?? selectedHorizon;

    if (typeof averageProfit === 'number') {
      tags.push({ label: 'Avg monthly profit', value: formatCurrency(averageProfit, currency) });
    }
    if (typeof projectedCash === 'number') {
      tags.push({ label: `${displayHorizon} mo cash`, value: formatCurrency(projectedCash, currency) });
    }
    if (typeof profitTrend === 'number') {
      tags.push({ label: 'Trend', value: formatSignedPercentage(profitTrend) });
    }
    if (typeof openInvoiceBalance === 'number') {
      tags.push({ label: 'Open invoices', value: formatCurrency(openInvoiceBalance, currency) });
    }
    if (typeof burnRate === 'number') {
      tags.push({ label: 'Spend/mo', value: formatCurrency(burnRate, currency) });
    }
    if (metadata['isFallback'] === true) {
      tags.push({ label: 'Mode', value: 'Offline summary' });
    }

    const previousForecasts = forecasts.slice(1, 5);

    return (
<<<<<<< Updated upstream
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <p className="text-sm text-slate-500">Profitability</p>
            <p className="text-3xl font-bold">{kpis?.profitability || 0}%</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-500">Avg. Project Margin</p>
            <p className="text-3xl font-bold">{kpis?.projectMargin || 0}%</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-500">Cash Flow</p>
            <p className="text-3xl font-bold">{formatCurrency(kpis?.cashFlow || 0, kpis?.currency ?? 'GBP')}</p>
          </Card>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h3 className="font-semibold mb-4">Monthly Performance (Profit)</h3>
              <BarChart data={monthly.map(m => ({ label: m.month, value: m.profit }))} barColor="bg-green-500" />
            </Card>
            <Card>
              <h3 className="font-semibold mb-4">Cost Breakdown</h3>
              <BarChart data={costs.map(c => ({ label: c.category, value: c.amount }))} barColor="bg-sky-500" />
            </Card>
          </div>
          <Card>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-lg">AI Cash Flow Outlook</h3>
                  <p className="text-sm text-muted-foreground">
                    Generate a Gemini-powered forecast from recent invoices, expenses, and KPIs.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedHorizon}
                    onChange={event => setSelectedHorizon(Number(event.target.value))}
                    className="border border-input rounded-md px-2 py-1 text-sm bg-background"
                    disabled={isGeneratingForecast}
                  >
                    <option value={3}>Next 3 months</option>
                    <option value={6}>Next 6 months</option>
                    <option value={12}>Next 12 months</option>
                  </select>
                  <Button
                    onClick={() => onGenerateForecast(selectedHorizon)}
                    isLoading={isGeneratingForecast}
                    disabled={isGeneratingForecast}
                  >
                    {latestForecast ? 'Refresh Outlook' : 'Generate Outlook'}
                  </Button>
                </div>
              </div>
              {forecastError && <p className="text-sm text-destructive">{forecastError}</p>}
              {latestForecast ? (
                <>
                  <div className="text-sm space-y-1 whitespace-pre-wrap">
                    {renderSummary(latestForecast.summary, 'latest-forecast')}
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map(tag => (
                        <span
                          key={`${tag.label}-${tag.value}`}
                          className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                        >
                          {tag.label}: {tag.value}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Generated {new Date(latestForecast.createdAt).toLocaleString()}
                    {latestForecast.model ? ` • ${latestForecast.model}` : ''}
                    {metadata['isFallback'] === true ? ' • offline summary' : ''}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Run the assistant to model upcoming cash flow and profitability using live platform data.
                </p>
              )}
              {previousForecasts.length > 0 && (
                <details className="text-sm">
                  <summary className="cursor-pointer text-muted-foreground">Previous forecasts</summary>
                  <div className="mt-2 space-y-3 max-h-56 overflow-y-auto pr-1">
                    {previousForecasts.map(forecast => {
                      const entryMetadata = (forecast.metadata ?? {}) as Record<string, unknown>;
                      return (
                        <div key={forecast.id} className="border border-border rounded-md p-3 bg-background/60">
                          <p className="text-xs text-muted-foreground">
                            {new Date(forecast.createdAt).toLocaleString()}
                            {forecast.model ? ` • ${forecast.model}` : ''}
                            {entryMetadata['isFallback'] === true ? ' • offline summary' : ''}
                          </p>
                          <div className="text-xs space-y-1 whitespace-pre-wrap mt-1">
                            {renderSummary(forecast.summary, forecast.id)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </details>
              )}
            </div>
          </Card>
        </div>
        );
  },
        );


        interface InvoicesTabProps {
          invoices: Invoice[];
        quotes: Quote[];
        canManageFinances: boolean;
        clientMap: Map<string, string>;
        projectMap: Map<string, string>;
  onCreateInvoice: () => void;
  onOpenInvoice: (invoice: Invoice) => void;
  onRecordPayment: (invoice: Invoice) => void;
  onUpdateInvoiceStatus: (invoiceId: string, status: InvoiceStatus) => void;
}

        const InvoicesTab = React.memo(
        ({invoices, quotes, canManageFinances, clientMap, projectMap, onCreateInvoice, onOpenInvoice, onRecordPayment, onUpdateInvoiceStatus}: InvoicesTabProps) => (
        <div className="space-y-6">
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Invoices</h3>
              {canManageFinances && <Button onClick={onCreateInvoice}>Create Invoice</Button>}
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Number</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Client</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Project</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground uppercase">Total</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground uppercase">Balance Due</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {invoices.map(invoice => {
                    const { total, balance } = getInvoiceFinancials(invoice);
                    const derivedStatus = getDerivedStatus(invoice);
                    return (
                      <tr key={invoice.id} className="hover:bg-accent">
                        <td className="px-4 py-3 font-medium">{invoice.invoiceNumber}</td>
                        <td className="px-4 py-3">{clientMap.get(invoice.clientId)}</td>
                        <td className="px-4 py-3">{projectMap.get(invoice.projectId)}</td>
                        <td className="px-4 py-3 text-right">{formatCurrency(total)}</td>
                        <td className="px-4 py-3 text-right font-semibold">{formatCurrency(balance)}</td>
                        <td className="px-4 py-3">
                          <InvoiceStatusBadge status={derivedStatus} />
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          {canManageFinances && invoice.status === InvoiceStatus.DRAFT && (
                            <>
                              <Button size="sm" variant="success" onClick={() => onUpdateInvoiceStatus(invoice.id, InvoiceStatus.SENT)}>
                                Send
                              </Button>
                              <Button size="sm" variant="secondary" onClick={() => onOpenInvoice(invoice)}>
                                Edit
                              </Button>
                            </>
                          )}
                          {canManageFinances &&
                            (invoice.status === InvoiceStatus.SENT || derivedStatus === InvoiceStatus.OVERDUE) && (
                              <>
                                <Button size="sm" onClick={() => onRecordPayment(invoice)}>
                                  Record Payment
                                </Button>
                                <Button size="sm" variant="danger" onClick={() => onUpdateInvoiceStatus(invoice.id, InvoiceStatus.CANCELLED)}>
                                  Cancel
                                </Button>
                              </>
                            )}
                          {(invoice.status === InvoiceStatus.PAID || invoice.status === InvoiceStatus.CANCELLED) && (
                            <Button size="sm" variant="secondary" onClick={() => onOpenInvoice(invoice)}>
                              View
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
          <Card>
            <h3 className="font-semibold text-lg mb-4">Quotes</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Client</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Project</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {quotes.map(quote => (
                    <tr key={quote.id}>
                      <td className="px-4 py-3">{clientMap.get(quote.id) ?? 'Client'}</td>
                      <td className="px-4 py-3">{projectMap.get(quote.id) ?? 'Project'}</td>
                      <td className="px-4 py-3">
                        <QuoteStatusBadge status={quote.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
        ),
        );

        InvoicesTab.displayName = 'InvoicesTab';

        interface ExpensesTabProps {
          expenses: Expense[];
        userMap: Map<string, string>;
        projectMap: Map<string, string>;
  onCreateExpense: () => void;
  onEditExpense: (expense: Expense) => void;
}

        const ExpensesTab = React.memo(({expenses, userMap, projectMap, onCreateExpense, onEditExpense}: ExpensesTabProps) => (
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Expenses</h3>
            <Button onClick={onCreateExpense}>Submit Expense</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Submitted By</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Project</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Description</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground uppercase">Amount</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {expenses.map(exp => (
                  <tr key={exp.id}>
                    <td className="px-4 py-3">{new Date(exp.submittedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{userMap.get(exp.userId)}</td>
                    <td className="px-4 py-3">{projectMap.get(exp.projectId)}</td>
                    <td className="px-4 py-3">{exp.description}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(exp.amount)}</td>
                    <td className="px-4 py-3">
                      <Tag
                        label={exp.status}
                        color={
                          exp.status === ExpenseStatus.APPROVED
                            ? 'green'
                            : exp.status === ExpenseStatus.REJECTED
                              ? 'red'
                              : 'yellow'
                        }
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {exp.status === ExpenseStatus.REJECTED && (
                        <Button size="sm" variant="secondary" onClick={() => onEditExpense(exp)}>
                          Edit &amp; Resubmit
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        ));

        ExpensesTab.displayName = 'ExpensesTab';

        interface ClientsTabProps {
          clients: Client[];
        canManageFinances: boolean;
  onAddClient: () => void;
  onEditClient: (client: Client) => void;
}

        const ClientsTab = React.memo(({clients, canManageFinances, onAddClient, onEditClient}: ClientsTabProps) => (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Clients</h2>
            {canManageFinances && <Button onClick={onAddClient}>Add Client</Button>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map(client => (
              <Card key={client.id} className="cursor-pointer hover:shadow-lg" onClick={() => onEditClient(client)}>
                <h3 className="text-lg font-semibold">{client.name}</h3>
                <p className="text-sm text-muted-foreground">{client.contactEmail}</p>
              </Card>
            ))}
          </div>
        </div>
        ));

        ClientsTab.displayName = 'ClientsTab';

        export default FinancialsView;
};
