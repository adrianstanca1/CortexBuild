import React, { useEffect, useState } from 'react';
import type { User, FinancialKPIs, Invoice, Expense, Client } from '../types';
import { api } from '../services/mockApi';
import { Card } from './ui/Card';

interface Props {
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
}

export const FinancialsViewLite: React.FC<Props> = ({ user, addToast }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kpis, setKpis] = useState<FinancialKPIs | null>(null);
  const [counts, setCounts] = useState<{ invoices: number; expenses: number; clients: number }>({ invoices: 0, expenses: 0, clients: 0 });

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!user.companyId) { setLoading(false); return; }
      setLoading(true); setError(null);
      try {
        const [k, inv, exp, cli] = await Promise.all([
          api.getFinancialKPIsForCompany(user.companyId),
          api.getInvoicesByCompany(user.companyId),
          api.getExpensesByCompany(user.companyId),
          api.getClientsByCompany(user.companyId),
        ]);
        if (cancelled) return;
        setKpis(k);
        setCounts({ invoices: (inv as Invoice[]).length, expenses: (exp as Expense[]).length, clients: (cli as Client[]).length });
      } catch (e) {
        if (cancelled) return;
        setError('Failed to load financials');
        addToast('Failed to load financials', 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [user.companyId, addToast]);

  if (loading) return <Card className="p-6"><p>Loading financials…</p></Card>;
  if (error) return <Card className="p-6"><p className="text-red-600">{error}</p></Card>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Financials</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Profitability</p>
          <p className="text-2xl font-semibold">
            {kpis?.profitability != null ? `${Math.round((kpis.profitability <= 1.5 ? kpis.profitability * 100 : kpis.profitability))}%` : '—'}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Project Margin</p>
          <p className="text-2xl font-semibold">
            {kpis?.projectMargin != null ? `${Math.round((kpis.projectMargin <= 1.5 ? kpis.projectMargin * 100 : kpis.projectMargin))}%` : '—'}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Cash Flow ({kpis?.currency ?? 'GBP'})</p>
          <p className="text-2xl font-semibold">{kpis ? new Intl.NumberFormat('en-GB', { style: 'currency', currency: kpis.currency || 'GBP' }).format(kpis.cashFlow) : '—'}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Outstanding Invoices</p>
          <p className="text-2xl font-semibold">{counts.invoices}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Recorded Expenses</p>
          <p className="text-2xl font-semibold">{counts.expenses}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Active Clients</p>
          <p className="text-2xl font-semibold">{counts.clients}</p>
        </Card>
      </div>
      <Card className="p-4">
        <p className="text-sm text-muted-foreground">Note</p>
        <p className="text-sm">This is a lightweight Financials dashboard restored for Phase 2; the full view will be re-enabled after code cleanup.</p>
      </Card>
    </div>
  );
};

