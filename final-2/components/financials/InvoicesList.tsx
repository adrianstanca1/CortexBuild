import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { api } from '../../services/mockApi';
import type { Client, Invoice, Project, User } from '../../types';
import { formatCurrency } from '../../utils/finance';
import InvoiceModal from './InvoiceModal';
import PaymentModal from './PaymentModal';

interface Props {
  user: User;
  addToast: (m: string, t: 'success' | 'error') => void;
}

export const InvoicesList: React.FC<Props> = ({ user, addToast }) => {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [modal, setModal] = useState<'invoice' | 'payment' | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    const controller = new AbortController();
    abortControllerRef.current?.abort();
    abortControllerRef.current = controller;
    setLoading(true);
    try {
      if (!user.companyId) return;
      const [inv, proj, cli] = await Promise.all([
        api.getInvoicesByCompany(user.companyId, { signal: controller.signal }),
        api.getProjectsByCompany(user.companyId, { signal: controller.signal }),
        api.getClientsByCompany(user.companyId, { signal: controller.signal }),
      ]);
      if (controller.signal.aborted) return;
      setInvoices(inv);
      setProjects(proj);
      setClients(cli);
    } catch {
      if (controller.signal.aborted) return;
      addToast('Failed to load invoices', 'error');
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [user.companyId, addToast]);

  useEffect(() => {
    fetchData();
    return () => abortControllerRef.current?.abort();
  }, [fetchData]);

  const clientMap = useMemo(() => new Map(clients.map(c => [c.id, c.name])), [clients]);
  const projectMap = useMemo(() => new Map(projects.map(p => [p.id, p.name])), [projects]);

  const openCreate = () => { setSelectedInvoice(null); setModal('invoice'); };
  const openEdit = (inv: Invoice) => { setSelectedInvoice(inv); setModal('invoice'); };
  const openPayment = (inv: Invoice) => { setSelectedInvoice(inv); setModal('payment'); };

  return (
    <Card className="p-4">
      {modal === 'invoice' && (
        <InvoiceModal
          invoiceToEdit={selectedInvoice}
          isReadOnly={false}
          onClose={() => setModal(null)}
          onSuccess={fetchData}
          user={user}
          clients={clients}
          projects={projects}
          addToast={addToast}
        />
      )}
      {modal === 'payment' && selectedInvoice && (
        <PaymentModal
          invoice={selectedInvoice}
          balance={selectedInvoice.total - (selectedInvoice.amountPaid ?? 0)}
          onClose={() => setModal(null)}
          onSuccess={fetchData}
          user={user}
          addToast={addToast}
        />
      )}

      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Invoices</h3>
        <Button type="button" onClick={openCreate}>Create Invoice</Button>
      </div>

      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b">
                <th className="py-2 pr-4">Invoice #</th>
                <th className="py-2 pr-4">Client</th>
                <th className="py-2 pr-4">Project</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4 text-right">Total</th>
                <th className="py-2 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} className="border-b">
                  <td className="py-2 pr-4">{inv.invoiceNumber}</td>
                  <td className="py-2 pr-4">{clientMap.get(inv.clientId) || '—'}</td>
                  <td className="py-2 pr-4">{projectMap.get(inv.projectId) || '—'}</td>
                  <td className="py-2 pr-4">{inv.status}</td>
                  <td className="py-2 pr-4 text-right">{formatCurrency(inv.total)}</td>
                  <td className="py-2 pr-0 text-right">
                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="secondary" onClick={() => openEdit(inv)}>Edit</Button>
                      <Button type="button" onClick={() => openPayment(inv)}>Record Payment</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

export default InvoicesList;

